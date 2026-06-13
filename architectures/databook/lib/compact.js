/**
 * lib/compact.js — DataBook event-chain compaction engine.
 *
 * Collapses Turtle 1.2 reification chains (multiple reifiers on the same
 * subject-predicate pair) to their terminal state, producing a compacted
 * DataBook with a CompactionActivity provenance block.
 *
 * Operates entirely on local DataBook files — no triplestore required.
 * Designed for use with databook-cli v1.4.4+.
 *
 * Pipeline
 * ────────
 * 1. parseDataBook()       ← lib/parser.js (existing)
 * 2. extractEventChains()  find reified triples in turtle12 blocks
 * 3. groupBySubjectPred()  group reifiers by (subject, predicate)
 * 4. resolveTerminal()     select terminal reifier per group
 * 5. rebuildBlockContent() reconstruct compacted Turtle text
 * 6. buildProvenance()     generate CompactionActivity turtle
 * 7. assembleOutput()      compose complete output DataBook
 */

import { readFileSync } from 'fs';
import { parseDataBook, blockPayload } from './parser.js';
import yaml from 'js-yaml';

// ── Recognised temporal property local names ─────────────────────────────────
const TEMPORAL_PROPS = new Set([
  'at', 'assertedat', 'receivedat', 'created', 'modified', 'date',
  'startedat', 'endedat', 'timestamp',
]);

// Full qualified forms checked case-insensitively
const TEMPORAL_QUALIFIED = [
  /^event:at$/i,
  /^hev:at$/i,
  /^event:assertedat$/i,
  /^hev:assertedat$/i,
  /^dcterms:created$/i,
  /^dct:created$/i,
  /^prov:generatedattime$/i,
];

const VALUE_QUALIFIED = [
  /^event:hasvalue$/i,
  /^hev:hasvalue$/i,
  /^rdf:value$/i,
];

// ── Turtle 1.2 reification pattern ───────────────────────────────────────────
// Matches: ~ REIFIER_IRI {| ... |}
// The {| |} may span multiple lines — handled by the statement splitter.
const REIFIER_RE = /~\s*([\w:.<>@"^+\-[\](){}]+)\s*\{\|([\s\S]*?)\|\}/g;

// Matches the head of a triple: SUBJECT PREDICATE OBJECT
const TRIPLE_HEAD_RE = /^([\w:.<>@"^+\-[\](){}]+)\s+([\w:.<>@"^+\-[\](){}]+)\s+([\w:.<>@"^+\-[\](){}^"']+(?:\^\^[\w:]+)?(?:@\w+)?)/;

// Prefix declarations
const PREFIX_RE = /^@prefix\s+([\w-]*:)\s+<([^>]+)>\s*\./gm;

// ── Statement splitter ────────────────────────────────────────────────────────

/**
 * Split Turtle 1.2 content into logical statement strings.
 * Handles multiline statements, quoted strings, and {| |} annotation blocks.
 */
function splitStatements(text) {
  const statements = [];
  let buf = '';
  let inStr = false;
  let annotDepth = 0;
  let i = 0;

  while (i < text.length) {
    const c  = text[i];
    const c2 = text.slice(i, i + 2);

    if (!inStr) {
      if (c2 === '{|') { annotDepth++; buf += c2; i += 2; continue; }
      if (c2 === '|}') { annotDepth--; buf += c2; i += 2; continue; }
      if (c === '"' || c === "'") { inStr = true; buf += c; i++; continue; }
      if (c === '#') {
        // Line comment — skip to end of line
        while (i < text.length && text[i] !== '\n') i++;
        continue;
      }
      if (c === '.' && annotDepth === 0) {
        buf += c;
        const t = buf.trim();
        if (t && t !== '.') statements.push(buf);
        buf = '';
        i++;
        continue;
      }
    } else {
      if (c === '\\') { buf += c + (text[i + 1] || ''); i += 2; continue; }
      if (c === '"' || c === "'") inStr = false;
    }

    buf += c;
    i++;
  }

  const trailing = buf.trim();
  if (trailing) statements.push(buf); // @prefix lines etc.

  return statements;
}

// ── Annotation block parser ───────────────────────────────────────────────────

function parseAnnotations(text) {
  const map = new Map();
  const pairs = splitOnSemicolon(text);
  for (const pair of pairs) {
    const t = pair.trim();
    if (!t) continue;
    const sp = t.search(/\s/);
    if (sp < 0) continue;
    const prop = t.slice(0, sp).trim();
    const val  = t.slice(sp + 1).trim();
    if (prop) map.set(prop, val);
  }
  return map;
}

function splitOnSemicolon(text) {
  const parts = [];
  let cur = '';
  let depth = 0;
  let inStr = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (!inStr) {
      if ('([{'.includes(c)) depth++;
      else if (')]}' .includes(c)) depth--;
      else if (c === '"' || c === "'") inStr = true;
      else if (c === ';' && depth === 0) { parts.push(cur); cur = ''; continue; }
    } else {
      if (c === '\\') { cur += c + (text[i + 1] || ''); i++; continue; }
      if (c === '"' || c === "'") inStr = false;
    }
    cur += c;
  }
  if (cur.trim()) parts.push(cur);
  return parts;
}

function extractLiteralValue(raw) {
  const t = raw.trim();
  const dtm = /^["'](.*?)["']\^\^([\w:]+)$/.exec(t);
  if (dtm) return { value: dtm[1], datatype: dtm[2] };
  const sm = /^["'](.*?)["']$/.exec(t);
  if (sm) return { value: sm[1], datatype: null };
  return { value: t, datatype: null };
}

// ── Temporal comparison ───────────────────────────────────────────────────────

function toComparable(val, type) {
  if (!val) return null;
  if (!type || /datetime|date/i.test(type)) {
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d.getTime();
  }
  if (type && /^xsd:time$/i.test(type)) {
    const parts = val.split(':').map(Number);
    if (parts.length >= 2 && !parts.some(isNaN)) {
      return parts[0] * 3600 + parts[1] * 60 + (parts[2] || 0);
    }
  }
  return null;
}

function cmpTemporal(a, ta, b, tb) {
  const ca = toComparable(a, ta);
  const cb = toComparable(b, tb);
  if (ca !== null && cb !== null) return ca < cb ? -1 : ca > cb ? 1 : 0;
  return a < b ? -1 : a > b ? 1 : 0;
}

function seqFromIRI(iri) {
  const local = iri.split(':').pop() || iri;
  const m = /(\d+)$/.exec(local);
  return m ? parseInt(m[1], 10) : -1;
}

// ── Core extraction ───────────────────────────────────────────────────────────

/**
 * Extract all reification chains from turtle12 block content.
 *
 * @param {string} content - raw turtle12 payload (from blockPayload())
 * @returns {{ chains: Chain[], ambientStatements: string[] }}
 *
 * Chain: { key, subjectRaw, predicateRaw, objectRaw, reifiers[] }
 * Reifier: { iri, annotations, temporalValue, temporalType, valueIRI, docOrder }
 */
export function extractEventChains(content) {
  const chains = [];
  const ambientStatements = [];
  let docOrder = 0;

  const stmts = splitStatements(content);

  for (const stmt of stmts) {
    // Keep @prefix and @base statements as ambient
    if (/^\s*@(prefix|base)\s/i.test(stmt.trim())) {
      ambientStatements.push(stmt.trimEnd());
      continue;
    }

    REIFIER_RE.lastIndex = 0;
    const reifiers = [];
    let m;

    while ((m = REIFIER_RE.exec(stmt)) !== null) {
      const iri = m[1].trim();
      const annotText = m[2];
      const annotations = parseAnnotations(annotText);

      let temporalValue = null;
      let temporalType  = null;
      let valueIRI      = null;

      for (const [prop, val] of annotations) {
        const pLow = prop.toLowerCase();

        // Check qualified temporal patterns
        if (TEMPORAL_QUALIFIED.some(re => re.test(prop))) {
          const { value, datatype } = extractLiteralValue(val);
          temporalValue = value;
          temporalType  = datatype;
        }
        // Check by local name
        else if (TEMPORAL_PROPS.has(pLow.split(':').pop())) {
          const { value, datatype } = extractLiteralValue(val);
          temporalValue = value;
          temporalType  = datatype;
        }

        // Check value property
        if (VALUE_QUALIFIED.some(re => re.test(prop))) {
          valueIRI = val.trim();
        }
      }

      reifiers.push({
        iri,
        annotations,
        temporalValue,
        temporalType,
        valueIRI,
        docOrder: docOrder++,
        rawAnnotText: annotText,
      });
    }

    if (reifiers.length === 0) {
      ambientStatements.push(stmt.trimEnd());
      continue;
    }

    // Extract triple head (subject predicate object)
    const headText = stmt
      .replace(REIFIER_RE, '')
      .replace(/[~,\s]+$/, '')
      .replace(/\n/g, ' ')
      .trim();

    REIFIER_RE.lastIndex = 0;
    const headMatch = TRIPLE_HEAD_RE.exec(headText);

    if (!headMatch) {
      process.stderr.write(
        `[compact] warning: could not parse triple head — treating as ambient:\n  ${headText.slice(0, 80)}\n`
      );
      ambientStatements.push(stmt.trimEnd());
      continue;
    }

    const [, subjectRaw, predicateRaw, objectRaw] = headMatch;
    const key = `${subjectRaw.trim()}\x00${predicateRaw.trim()}`;

    // Multi-triple pattern: same s-p key already seen — merge reifiers
    const existing = chains.find(c => c.key === key);
    if (existing) {
      existing.reifiers.push(...reifiers);
    } else {
      chains.push({
        key,
        subjectRaw: subjectRaw.trim(),
        predicateRaw: predicateRaw.trim(),
        objectRaw: objectRaw.trim(),
        reifiers,
      });
    }
  }

  return { chains, ambientStatements };
}

// ── Terminal resolution ───────────────────────────────────────────────────────

/**
 * Resolve the terminal reifier for a chain.
 *
 * @param {Chain} chain
 * @param {Date|null} asOf
 * @param {{ verbose?: boolean, warnConflicts?: boolean }} opts
 * @returns {{ terminal: Reifier|null, discarded: Reifier[], conflictCount: number }}
 */
export function resolveTerminal(chain, asOf, { verbose = false, warnConflicts = true } = {}) {
  let candidates = chain.reifiers;

  // Apply --as-of filter
  if (asOf) {
    candidates = candidates.filter(r => {
      if (!r.temporalValue) return true;
      const t = toComparable(r.temporalValue, r.temporalType);
      return t === null || t <= asOf.getTime();
    });
  }

  if (candidates.length === 0) return { terminal: null, discarded: [], conflictCount: 0 };
  if (candidates.length === 1) return { terminal: candidates[0], discarded: [], conflictCount: 0 };

  // Warn on missing temporal properties
  const noTime = candidates.filter(r => !r.temporalValue);
  if (noTime.length > 0 && warnConflicts) {
    process.stderr.write(
      `[compact] warning: ${noTime.length} reifier(s) in chain ` +
      `(${chain.subjectRaw} / ${chain.predicateRaw}) lack a temporal property.\n`
    );
  }

  // Sort ascending by temporal value, then doc order
  const sorted = [...candidates].sort((a, b) => {
    if (a.temporalValue && b.temporalValue) {
      const c = cmpTemporal(a.temporalValue, a.temporalType, b.temporalValue, b.temporalType);
      if (c !== 0) return c;
    }
    if (a.temporalValue && !b.temporalValue) return -1;
    if (!a.temporalValue && b.temporalValue) return 1;
    return a.docOrder - b.docOrder;
  });

  const last = sorted[sorted.length - 1];

  // Check for ties
  const tied = sorted.filter(r => {
    if (!r.temporalValue || !last.temporalValue) return r === last;
    return cmpTemporal(r.temporalValue, r.temporalType, last.temporalValue, last.temporalType) === 0;
  });

  let terminal = last;
  let conflictCount = 0;

  if (tied.length > 1) {
    conflictCount = 1;
    // Step 1: sequence integer in reifier IRI
    const bySeq = [...tied].sort((a, b) => seqFromIRI(b.iri) - seqFromIRI(a.iri));
    if (seqFromIRI(bySeq[0].iri) !== seqFromIRI(bySeq[1].iri)) {
      terminal = bySeq[0];
      if (warnConflicts) {
        process.stderr.write(
          `[compact] warning: timestamp tie resolved by IRI sequence: ` +
          `selected ${terminal.iri} for (${chain.subjectRaw} / ${chain.predicateRaw})\n`
        );
      }
    } else {
      // Step 2: document order
      terminal = [...tied].sort((a, b) => b.docOrder - a.docOrder)[0];
      if (warnConflicts) {
        process.stderr.write(
          `[compact] warning: timestamp tie resolved by document order: ` +
          `selected ${terminal.iri} for (${chain.subjectRaw} / ${chain.predicateRaw})\n`
        );
      }
    }
  }

  if (verbose) {
    process.stderr.write(
      `[compact] (${chain.subjectRaw} / ${chain.predicateRaw}): ` +
      `${sorted.length} reifier(s) → terminal=${terminal.iri}` +
      (terminal.temporalValue ? ` @ ${terminal.temporalValue}` : '') + '\n'
    );
  }

  return { terminal, discarded: sorted.filter(r => r !== terminal), conflictCount };
}

// ── Output reconstruction ─────────────────────────────────────────────────────

/**
 * Reconstruct compacted Turtle content for one block.
 *
 * @param {string[]} prefixLines   raw @prefix lines from original content
 * @param {{ chain, terminal }[]} resolutions
 * @param {string[]} ambientStatements  non-reified statements (pass-through)
 * @returns {string}
 */
export function buildCompactedContent(prefixLines, resolutions, ambientStatements) {
  const out = [];

  for (const pl of prefixLines) {
    out.push(pl.trim());
  }
  if (prefixLines.length > 0) out.push('');

  for (const { chain, terminal } of resolutions) {
    if (!terminal) continue;

    const obj = terminal.valueIRI || chain.objectRaw;
    const annotParts = [];
    for (const [prop, val] of terminal.annotations) {
      annotParts.push(`    ${prop} ${val}`);
    }

    out.push(`${chain.subjectRaw} ${chain.predicateRaw} ${obj}`);
    out.push(`    ~ ${terminal.iri} {|`);
    out.push(annotParts.join(' ;\n'));
    out.push(`    |} .`);
    out.push('');
  }

  for (const a of ambientStatements) {
    const t = a.trim();
    if (t && !t.startsWith('@prefix') && !t.startsWith('@base')) out.push(t);
  }

  return out.join('\n');
}

/**
 * Derive the output DataBook IRI from the source IRI.
 */
export function deriveOutputId(sourceId, compactedAt, asOf) {
  const ts = (asOf || compactedAt).toISOString().replace(/[:.]/g, '-').slice(0, 19);
  if (!sourceId) return `urn:databook:compacted-${ts}`;
  return sourceId.replace(/(-v[\d.]+)?$/, '') + `-compacted-${ts}`;
}

/**
 * Patch frontmatter object for the compacted output.
 */
export function patchFrontmatter(fm, outputId, compactedAt, sourceId) {
  const d = compactedAt.toISOString().slice(0, 10);
  const patched = {
    ...fm,
    id:      outputId,
    title:   ((fm.title || '') + ' (Compacted)').replace(/\s*\(Compacted\)\s*\(Compacted\)/, ' (Compacted)'),
    version: '1.0.0',
    created: d,
  };
  if (fm.updated !== undefined) patched.updated = d;

  // Update process stamp
  patched.process = {
    ...(fm.process || {}),
    transformer:      'databook compact',
    transformer_type: 'cli',
    timestamp:        compactedAt.toISOString(),
  };
  if (sourceId) {
    patched.process.inputs = [{ iri: sourceId, role: 'primary' }];
  }

  return patched;
}

/**
 * Serialise patched frontmatter to YAML string wrapped in --- delimiters.
 */
export function serialiseFrontmatter(fm) {
  return '---\n' + yaml.dump(fm, { lineWidth: 120, noRefs: true }) + '---\n';
}

/**
 * Build a CompactionActivity Turtle provenance block.
 */
export function buildProvenanceBlock(opts) {
  const {
    sourceId, outputId, compactedAt, asOf,
    scope = 'databook:ScopeAll',
    chainsCompacted = 0, reifiersDiscarded = 0, conflictsResolved = 0,
    agentIRI = 'urn:databook:cli',
  } = opts;

  const cat  = compactedAt.toISOString();
  const aofs = (asOf || compactedAt).toISOString();

  return `@prefix databook: <https://w3id.org/databook/ns#> .
@prefix prov:     <http://www.w3.org/ns/prov#> .
@prefix xsd:      <http://www.w3.org/2001/XMLSchema#> .
@prefix rdfs:     <http://www.w3.org/2000/01/rdf-schema#> .

<${outputId}>
    a databook:CompactionActivity ;
    rdfs:label "Compaction of <${sourceId}> at ${cat}"@en ;
    databook:sourceDataBook     <${sourceId}> ;
    databook:compactedAt        "${cat}"^^xsd:dateTime ;
    databook:asOf               "${aofs}"^^xsd:dateTime ;
    databook:compactionScope    ${scope} ;
    databook:chainsCompacted    ${chainsCompacted}^^xsd:integer ;
    databook:reifiersDiscarded  ${reifiersDiscarded}^^xsd:integer ;
    databook:conflictsResolved  ${conflictsResolved}^^xsd:integer ;
    databook:compactionAgent    <${agentIRI}> ;
    prov:wasAssociatedWith      <${agentIRI}> .`;
}

// ── Main entry point ──────────────────────────────────────────────────────────

/**
 * Run the full compaction pipeline.
 *
 * @param {string} sourceText   full DataBook file content
 * @param {string} filePath     source file path (for parser)
 * @param {object} opts
 * @returns {CompactionResult}
 */
export function compact(sourceText, filePath, opts = {}) {
  const {
    subject      = null,
    property     = null,
    asOf: asOfStr = null,
    agentIRI     = 'urn:databook:cli',
    noProvenance = false,
    verbose      = false,
    warnConflicts = true,
  } = opts;

  const compactedAt = new Date();
  const asOf = asOfStr ? new Date(asOfStr) : null;

  // ── Parse source ──────────────────────────────────────────────────────────
  const db = parseDataBook(sourceText, filePath);
  if (!db) throw new Error(`no DataBook frontmatter found in: ${filePath}`);

  const sourceId = String(db.frontmatter?.id || '');
  const outputId = deriveOutputId(sourceId, compactedAt, asOf);

  // ── Determine scope ───────────────────────────────────────────────────────
  const scope = property
    ? 'databook:ScopeSubjectProperty'
    : subject
      ? 'databook:ScopeSubject'
      : 'databook:ScopeAll';

  // ── Process turtle12 blocks ───────────────────────────────────────────────
  let totalChains = 0;
  let totalDiscarded = 0;
  let totalConflicts = 0;

  // Map: blockId (or index) → compacted content string
  const compactedBlocks = new Map();

  for (let bi = 0; bi < db.blocks.length; bi++) {
    const block = db.blocks[bi];
    if (block.label !== 'turtle12') continue;

    const payload = blockPayload(block);
    const { chains, ambientStatements } = extractEventChains(payload);

    // Apply scope filter
    let scopedChains = chains;
    if (subject) {
      const subjectLocal = subject.split('/').pop().split('#').pop();
      scopedChains = chains.filter(c =>
        c.subjectRaw === subject ||
        c.subjectRaw === `<${subject}>` ||
        c.subjectRaw.endsWith(`:${subjectLocal}`)
      );
      if (property) {
        const propLocal = property.split('/').pop().split('#').pop();
        scopedChains = scopedChains.filter(c =>
          c.predicateRaw === property ||
          c.predicateRaw === `<${property}>` ||
          c.predicateRaw.endsWith(`:${propLocal}`)
        );
      }
    }

    if (scopedChains.length === 0) continue;

    // Extract prefix lines from the payload
    const prefixLines = [];
    let pm;
    PREFIX_RE.lastIndex = 0;
    while ((pm = PREFIX_RE.exec(payload)) !== null) {
      prefixLines.push(pm[0]);
    }

    // Out-of-scope chains → pass through as ambient
    const outOfScope = chains
      .filter(c => !scopedChains.includes(c))
      .map(c => reconstructChainAsAmbient(c));

    // Resolve terminal per scoped chain
    const resolutions = [];
    for (const chain of scopedChains) {
      const { terminal, discarded, conflictCount } =
        resolveTerminal(chain, asOf, { verbose, warnConflicts });

      resolutions.push({ chain, terminal });
      totalChains++;
      totalDiscarded += discarded.length;
      totalConflicts += conflictCount;
    }

    const compacted = buildCompactedContent(
      prefixLines,
      resolutions,
      [...ambientStatements, ...outOfScope],
    );

    compactedBlocks.set(bi, { block, compacted });
  }

  // ── Nothing to compact ────────────────────────────────────────────────────
  if (totalChains === 0) {
    return { compactedText: sourceText, chainsCompacted: 0, reifiersDiscarded: 0, conflictsResolved: 0, wasPassthrough: true };
  }

  // ── Rebuild document ──────────────────────────────────────────────────────
  // Replace each compacted block's content in rawBody.
  // We search for the fence markers surrounding the known block content.
  let newBody = db.rawBody;

  for (const [, { block, compacted }] of compactedBlocks) {
    const originalContent = block.content;
    const fenceOpen = `\`\`\`${block.label}`;
    const fenceClose = '```';

    // Build the replacement: fence + compacted content + fence
    const replacement = `${fenceOpen}\n${compacted}\n${fenceClose}`;

    // Find the block in the body: look for the fence open followed by the content
    const searchStr = `${fenceOpen}\n${originalContent}\n${fenceClose}`;
    const idx = newBody.indexOf(searchStr);
    if (idx >= 0) {
      newBody = newBody.slice(0, idx) + replacement + newBody.slice(idx + searchStr.length);
    } else {
      // Fallback: try without normalizing line endings
      process.stderr.write(
        `[compact] warning: could not locate block '${block.id || block.label}' ` +
        `for replacement; content may have changed.\n`
      );
    }
  }

  // ── Patch frontmatter ─────────────────────────────────────────────────────
  const patchedFm = patchFrontmatter(db.frontmatter, outputId, compactedAt, sourceId);
  const newFmText = serialiseFrontmatter(patchedFm);

  // ── Provenance block ──────────────────────────────────────────────────────
  let provSection = '';
  if (!noProvenance) {
    const provTurtle = buildProvenanceBlock({
      sourceId, outputId, compactedAt, asOf, scope,
      chainsCompacted: totalChains,
      reifiersDiscarded: totalDiscarded,
      conflictsResolved: totalConflicts,
      agentIRI,
    });
    provSection =
      '\n## Compaction Provenance\n\n' +
      '<!-- databook:id: compaction-activity -->\n' +
      '```turtle\n' + provTurtle + '\n```\n';
  }

  const compactedText = newFmText + newBody + provSection;

  return {
    compactedText,
    chainsCompacted: totalChains,
    reifiersDiscarded: totalDiscarded,
    conflictsResolved: totalConflicts,
    wasPassthrough: false,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function reconstructChainAsAmbient(chain) {
  const reifierParts = chain.reifiers.map(r => {
    const props = [];
    for (const [p, v] of r.annotations) props.push(`        ${p} ${v}`);
    return `    ~ ${r.iri} {|\n${props.join(' ;\n')}\n    |}`;
  });
  return `${chain.subjectRaw} ${chain.predicateRaw} ${chain.objectRaw}\n` +
         reifierParts.join(',\n') + ' .';
}

/**
 * @typedef {{ chains: Chain[], ambientStatements: string[] }} ChainResult
 * @typedef {{ compactedText: string, chainsCompacted: number, reifiersDiscarded: number, conflictsResolved: number, wasPassthrough: boolean }} CompactionResult
 */
