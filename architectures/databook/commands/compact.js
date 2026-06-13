/**
 * commands/compact.js — databook compact command.
 *
 * Collapses Turtle 1.2 event chains to terminal state, producing a new
 * compacted DataBook. Non-destructive by default.
 *
 * See spec: hga-pass-g-viewer.databook.md §compact
 *     lib:  ../lib/compact.js
 */

import { readFileSync, existsSync, copyFileSync } from 'fs';
import { compact, extractEventChains, resolveTerminal } from '../lib/compact.js';
import { parseDataBook, blockPayload }               from '../lib/parser.js';
import { writeOutput, resolveEncoding }              from '../lib/encoding.js';

// ── Main entry point ──────────────────────────────────────────────────────────

export async function runCompact(source, opts) {
  const {
    subject           = null,
    property          = null,
    graph             = null,
    asOf              = null,
    output            = null,
    inPlace           = false,
    confirmOverwrite  = false,
    overwrite         = false,
    dryRun            = false,
    passthrough       = false,
    verbose           = false,
    warnConflicts     = true,
    agent             = 'urn:databook:cli',
    noProvenance      = false,
    quiet             = false,
    encoding: encOpt  = 'utf8',
  } = opts;

  // ── Guards ────────────────────────────────────────────────────────────────
  if (inPlace && !confirmOverwrite) {
    process.stderr.write(
      'error: --in-place requires --confirm-overwrite to prevent accidental overwriting.\n' +
      'Pass --confirm-overwrite to proceed. A backup is created at <source>.bak.\n'
    );
    process.exit(4);
  }

  if (graph) {
    process.stderr.write(
      '[compact] warning: --graph is reserved for v0.2.0 (L-01). Treating as --all.\n'
    );
  }

  // ── Read source ───────────────────────────────────────────────────────────
  if (!existsSync(source)) {
    process.stderr.write(`error: source file not found: ${source}\n`);
    process.exit(1);
  }

  let sourceText;
  try {
    sourceText = readFileSync(source, 'utf8');
  } catch (e) {
    process.stderr.write(`error: cannot read ${source}: ${e.message}\n`);
    process.exit(1);
  }

  // ── Dry-run ───────────────────────────────────────────────────────────────
  if (dryRun) {
    runDryRun(sourceText, source, { subject, property, asOf, verbose });
    process.exit(0);
  }

  // ── Resolve output path ───────────────────────────────────────────────────
  let outputPath;
  if (inPlace) {
    outputPath = source;
  } else if (output) {
    outputPath = output;
  } else {
    outputPath = source.replace(/(\.databook\.md)?$/, '-compacted.databook.md');
    if (outputPath === source) outputPath = source + '.compacted';
  }

  if (!inPlace && outputPath !== source && existsSync(outputPath) && !overwrite) {
    process.stderr.write(
      `error: output already exists: ${outputPath}\n` +
      `Use --overwrite to allow replacement.\n`
    );
    process.exit(5);
  }

  // ── Compaction engine ─────────────────────────────────────────────────────
  let result;
  try {
    result = compact(sourceText, source, {
      subject, property, asOf, agentIRI: agent,
      noProvenance, verbose, warnConflicts,
    });
  } catch (e) {
    process.stderr.write(`error: compaction failed: ${e.message}\n`);
    if (process.env.DATABOOK_DEBUG) process.stderr.write(e.stack + '\n');
    process.exit(1);
  }

  // ── No chains found ───────────────────────────────────────────────────────
  if (result.wasPassthrough) {
    if (passthrough) {
      if (!quiet) {
        process.stderr.write(
          `[compact] warning: no event chains found. Writing source unchanged (--passthrough).\n`
        );
      }
      writeOutput(outputPath, result.compactedText, resolveEncoding(encOpt));
      process.exit(0);
    }
    process.stderr.write(
      `error: no event chains found in: ${source}\n` +
      `Hint: use --passthrough to write source unchanged when no chains exist.\n`
    );
    process.exit(2);
  }

  // ── Write output ──────────────────────────────────────────────────────────
  if (inPlace) {
    copyFileSync(source, source + '.bak');
    if (!quiet) process.stderr.write(`[compact] backup: ${source}.bak\n`);
  }

  const enc = resolveEncoding(encOpt);
  writeOutput(outputPath, result.compactedText, enc);

  if (!quiet) {
    process.stderr.write(
      `[compact] done: ${result.chainsCompacted} chain(s) compacted, ` +
      `${result.reifiersDiscarded} reifier(s) discarded, ` +
      `${result.conflictsResolved} conflict(s) resolved.\n` +
      `[compact] output: ${outputPath}\n`
    );
  }
}

// ── Dry-run reporter ──────────────────────────────────────────────────────────

function runDryRun(sourceText, filePath, { subject, property, asOf, verbose }) {
  const db = parseDataBook(sourceText, filePath);
  if (!db) {
    process.stderr.write('error: no DataBook frontmatter found.\n');
    process.exit(1);
  }

  const asOfDate = asOf ? new Date(asOf) : null;
  let totalChains = 0;
  let totalDiscarded = 0;

  process.stdout.write(
    `\nCompaction dry-run — ${filePath}\n` +
    '━'.repeat(50) + '\n'
  );

  for (const block of db.blocks) {
    if (block.label !== 'turtle12') continue;

    const payload = blockPayload(block);
    const { chains } = extractEventChains(payload);

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

    for (const chain of scopedChains) {
      const { terminal, discarded, conflictCount } =
        resolveTerminal(chain, asOfDate, { verbose, warnConflicts: true });

      const termTime  = terminal?.temporalValue || '(no timestamp)';
      const termValue = terminal?.valueIRI || chain.objectRaw;

      process.stdout.write(
        `\nSubject / predicate: ${chain.subjectRaw} / ${chain.predicateRaw}\n` +
        `  Chain length:     ${chain.reifiers.length} reifier(s)\n` +
        `  Terminal reifier: ${terminal?.iri ?? '(none)'}\n` +
        `  Terminal value:   ${termValue}\n` +
        `  Terminal time:    ${termTime}\n` +
        `  Discarding:       ${discarded.map(r => r.iri).join(', ') || '(none)'}\n` +
        `  Conflicts:        ${conflictCount > 0 ? conflictCount : 'none'}\n`
      );

      totalChains++;
      totalDiscarded += discarded.length;
    }
  }

  process.stdout.write(
    '\n' + '━'.repeat(50) + '\n' +
    `Summary: ${totalChains} chain(s), ${totalDiscarded} reifier(s) would be discarded\n`
  );
}
