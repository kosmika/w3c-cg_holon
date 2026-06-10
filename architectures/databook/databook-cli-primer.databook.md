---
id: https://w3id.org/databook/cli/primer
title: "The DataBook CLI — A Primer for Practitioners"
type: primer
version: 0.1.0
created: 2026-06-09
updated: 2026-06-09
author:
  - name: Kurt Cagle
    iri: https://holongraph.com/people/kurt-cagle
    role: author
    org: Semantical LLC
  - name: Chloe Shannon
    iri: https://holongraph.com/people/chloe-shannon
    role: co-author
license:
  prose: "W3C Document License"
  ontology: "CC0-1.0"
domain: https://w3id.org/databook/ns#
subject:
  - databook CLI
  - databook
  - RDF
  - SPARQL
  - SHACL
  - semantic documents
  - command-line tools
description: >
  Non-normative practitioner's guide to the DataBook CLI v1.4.4. Covers all
  20 commands through a worked example: a government service domain taxonomy
  built from a raw Turtle file and carried through create, inspect, push, query,
  pull, validate, LLM-augment, and pipeline execution. A companion to The
  DataBook Handbook (format reference) and the CLI Commands Reference (full
  option tables). First draft complete — §§0–13.
spec:
  document-iri: https://w3id.org/databook/cli/primer
  status: "First Draft — Complete"
  normative: false
process:
  transformer: "claude-sonnet-4-6"
  transformer_type: llm
  transformer_iri: https://api.anthropic.com/v1/models/claude-sonnet-4-6
  inputs:
    - iri: https://w3id.org/databook/cli/commands
      role: primary
      description: "CLI Commands Reference DataBook — source of all command and option definitions"
    - iri: https://w3id.org/databook/primer
      role: context
      description: "DataBook Handbook Primer — establishes the running government service domain example"
    - iri: https://github.com/kurtcagle/databook
      role: reference
      description: "DataBook format specification v0.9 / SKILL.md v1.2"
  timestamp: 2026-06-09T00:00:00Z
  agent:
    name: Chloe Shannon
    iri: https://holongraph.com/people/chloe-shannon
    role: orchestrator
---

# The DataBook CLI — A Primer for Practitioners

---

## § 0  How to Read This Primer

> *Twenty commands. One workflow. By the end of this primer, you will have
> run the whole pipeline.*

This primer is a hands-on guide to the DataBook CLI (v1.4.4) — the
command-line tool for creating, inspecting, loading, querying, validating,
and LLM-augmenting DataBook semantic documents. It is written as a
narrative walkthrough rather than a reference manual. Every section
introduces one or two commands, shows them in action on a realistic
example, and explains what to watch for.

**What this primer does not cover.** The DataBook format — frontmatter
fields, block label vocabulary, block directives, the process stamp,
manifests — is covered in *The DataBook Handbook: A Primer for
Practitioners*. The complete option tables for every command are in the
*CLI Commands Reference* DataBook (`https://w3id.org/databook/cli/commands`).
This primer covers the *when* and *why*; the reference covers the *what*.

**The running example.** A government service domain taxonomy: a SKOS
concept scheme classifying the principal service areas of a national
government. The taxonomy begins as a raw Turtle file, `services.ttl`,
and travels through every major CLI workflow — wrapping, loading,
querying, validating, LLM-augmenting, and pipeline execution — ending as
a complete, provenance-tracked DataBook collection.

---

## § 1  Installation and Setup

> *Three commands to install; two environment variables for full
> functionality.*

The DataBook CLI runs on Node.js v18 or later. The canonical source is
the `databook-cli` subfolder of the DataBooks GDrive folder; zipped
releases are named `databook-cli-YYYY-MM-DD.zip`.

```bash
# Unzip the release and install
unzip databook-cli-2026-05-17.zip
cd databook-cli
npm install

# Make the databook command available on PATH
npm link

# Verify installation
databook --version
# databook-cli v1.4.4
```

### Environment Variables

Two environment variables extend the CLI's capabilities:

**`ANTHROPIC_API_KEY`** — required for `databook prompt`. Without it, any
command that calls the Anthropic API will fail with an exit code 5 auth
error. Set it in your shell profile:

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
```

**`DATABOOK_DEBUG=1`** — enables full stack traces on error. Normally
errors print a one-line message and exit. With `DATABOOK_DEBUG=1`, the
full Node.js stack is written to stderr. Useful when debugging unexpected
failures.

**`DATABOOK_FUSEKI_AUTH`** — sets a default Basic or Bearer credential
for all triplestore operations, avoiding the need to pass `--auth` on
every command:

```bash
export DATABOOK_FUSEKI_AUTH="Basic dXNlcjpwYXNz"
```

### The `processors.toml` Registry

The CLI reads a `processors.toml` file in the working directory (or the
path set by `--config`) to resolve named servers. A named server entry
eliminates the need to type `--endpoint http://localhost:3030/gov/sparql`
on every command:

```toml
[servers.gov]
endpoint = "http://localhost:3030/gov/sparql"
gsp      = "http://localhost:3030/gov/data"

[servers.staging]
endpoint = "https://sparql.govmeta.example.org/staging/sparql"
auth     = "Bearer <token>"
```

With this in place, `-s gov` targets the local Fuseki instance on every
triplestore command. Use `databook push <file> -s list` to see all
configured servers.

---

## § 2  Creating Your First DataBook

> *`create` wraps a data file into a DataBook in one command — auto-deriving
> the frontmatter, counting triples, and generating a process stamp.*

The government service taxonomy exists as a raw Turtle file:

```turtle
# services.ttl
@prefix skos:    <http://www.w3.org/2004/02/skos/core#> .
@prefix govmeta: <https://govmeta.example.org/taxonomy/services/> .

govmeta:ServiceDomainScheme a skos:ConceptScheme ;
    skos:prefLabel "Government Service Domains"@en .

govmeta:PublicServices a skos:Concept ;
    skos:inScheme      govmeta:ServiceDomainScheme ;
    skos:prefLabel     "Public Services Delivery"@en ;
    skos:topConceptOf  govmeta:ServiceDomainScheme .

govmeta:AdministrativeFunctions a skos:Concept ;
    skos:inScheme      govmeta:ServiceDomainScheme ;
    skos:prefLabel     "Administrative Functions"@en ;
    skos:topConceptOf  govmeta:ServiceDomainScheme .

govmeta:PolicyRegulation a skos:Concept ;
    skos:inScheme      govmeta:ServiceDomainScheme ;
    skos:prefLabel     "Policy & Regulation"@en ;
    skos:topConceptOf  govmeta:ServiceDomainScheme .
```

`databook create` wraps it in a conformant DataBook:

```bash
databook create services.ttl \
  --set id=https://govmeta.example.org/databooks/gov-service-domains-v1 \
  --set title="Government Service Domain Taxonomy" \
  -o gov-service-domains.databook.md
```

The output file has a full frontmatter block — `id`, `title`, `type`,
`version`, `created`, `graph` metadata with auto-counted triple and
subject stats, and a process stamp attributing the creation to
`databook-cli`. The Turtle content becomes a named fenced block with
a generated `databook:id`.

**What `create` infers automatically:**

- Fence label from file extension (`.ttl` → `turtle`, `.shacl.ttl` →
  `shacl`, `.rq` → `sparql`, etc.)
- Input role from fence label (`turtle` → `primary`, `shacl` →
  `constraint`, `sparql` → `context`)
- `graph.triple_count` and `graph.subjects` by parsing the Turtle
- `graph.rdf_version` — `"1.2"` if any reification syntax is present
- `id` generated as `https://w3id.org/databook/{slug}-v{version}` if
  not supplied

**Wrapping multiple files at once** — pass them all as positional
arguments; each becomes a separate named block:

```bash
databook create services.ttl shapes.shacl.ttl queries.sparql \
  -o gov-service-domains.databook.md
```

`create` with no input files and `-o` specified produces a skeleton
DataBook from the bundled template — useful for starting a DataBook
from scratch before adding blocks with `insert`.

---

## § 3  Inspecting DataBooks

> *`head` reads the metadata; `extract --list` shows the blocks.*

Once you have a DataBook, you need two commands to understand what is in
it: `head` and `extract --list`.

### Reading Frontmatter with `head`

`head` with no mutation flags is the DataBook equivalent of a metadata
viewer. Its default output is JSON; `--format yaml` or `--format turtle`
produce alternative serialisations:

```bash
# Print frontmatter as JSON
databook head gov-service-domains.databook.md

# Print as Turtle (useful when the DataBook has graph metadata)
databook head gov-service-domains.databook.md --format turtle

# Read metadata for a specific block only
databook head gov-service-domains.databook.md \
  --block-id taxonomy-block --format yaml
```

The `--format turtle` output materialises the frontmatter as PROV-O
triples — the document IRI as a `prov:Entity`, the process stamp as a
`prov:Activity`, inputs as `prov:used`. This is useful for loading the
metadata into a SPARQL store without pushing the full DataBook.

### Listing Blocks with `extract --list`

`extract --list` scans the document body and prints every named block
with its ID, fence label, fragment IRI, and line number:

```bash
databook extract gov-service-domains.databook.md --list

# ID                    Label    Fragment IRI                                      Line
# services-block        turtle   ...gov-service-domains-v1#services-block          19
# select-top-concepts   sparql   ...gov-service-domains-v1#select-top-concepts     45
```

This is the **local-file** block inspector. Do not confuse it with
`databook list`, which queries the triplestore for DataBooks that have
been pushed — an entirely different operation covered in §8.

### Extracting a Block's Content

`extract` emits a single block's raw payload to stdout or a file. The
fragment syntax is the most concise form:

```bash
# Send the taxonomy block to Jena's riot parser for validation
databook extract gov-service-domains.databook.md#services-block \
  | riot --syntax=turtle -

# Save the block to a standalone Turtle file
databook extract gov-service-domains.databook.md --block-id services-block \
  -o services-export.ttl

# Include the databook: comment metadata in the output
databook extract gov-service-domains.databook.md#services-block \
  --with-metadata
```

---

## § 4  Editing DataBooks in Place

> *`head --set` patches frontmatter fields; `insert` adds blocks;
> `drop` removes them.*

Once a DataBook is in use, it needs updating. Three commands handle
in-place edits without re-running `create`.

### Patching Frontmatter with `head --set`

`head` in update mode patches the frontmatter by deep merge. Dot-path
syntax navigates nested structures:

```bash
# Bump the version
databook head gov-service-domains.databook.md --set version=1.1.0

# Update a nested graph field
databook head gov-service-domains.databook.md --set graph.triple_count=14

# Add a modification timestamp using the @now token
databook head gov-service-domains.databook.md --set modified=@now

# Multiple updates in one pass
databook head gov-service-domains.databook.md \
  --set version=1.1.0 \
  --set modified=@now \
  --set graph.triple_count=14

# Preview without writing
databook head gov-service-domains.databook.md \
  --set version=1.1.0 --dry-run
```

`--replace` replaces the entire frontmatter rather than merging — use
it only when you have a complete replacement object ready and you want to
remove fields that are not in the patch.

### Adding Blocks with `insert`

`insert` adds a new fenced block to an existing DataBook. The block ID
is required; the fence label is inferred from the file extension:

```bash
# Append a SHACL shapes block
databook insert gov-service-domains.databook.md shapes.shacl.ttl \
  --id skos-shapes

# Insert after a specific existing block
databook insert gov-service-domains.databook.md shapes.shacl.ttl \
  --id skos-shapes --after services-block

# Insert with a prose section heading above the block
databook insert gov-service-domains.databook.md shapes.shacl.ttl \
  --id skos-shapes \
  --markdown "## SHACL Validation Shapes"

# Overwrite an existing block with --force
databook insert gov-service-domains.databook.md shapes-v2.shacl.ttl \
  --id skos-shapes --force
```

`insert` in **prose mode** (no `--id`, `--markdown` required) edits
body prose without touching any blocks:

```bash
databook insert gov-service-domains.databook.md \
  --markdown "Updated for the June 2026 engagement framework." \
  --markdown-mode prepend
```

### Removing Blocks with `drop`

`drop` removes named blocks cleanly, collapsing any blank lines left by
the removal. Multiple `--id` flags remove several blocks in one pass;
`--remove-prose` also strips the prose section above each block:

```bash
databook drop gov-service-domains.databook.md --id old-queries
databook drop gov-service-domains.databook.md \
  --id old-queries --id legacy-shapes --remove-prose
databook drop gov-service-domains.databook.md --id old-queries --dry-run
```

---

## § 5  Loading to the Triplestore

> *`push` is the gateway: it loads DataBook blocks to Jena Fuseki via GSP
> and registers the DataBook's identity in a `#meta` graph.*

### Targeting an Endpoint

Three ways to specify the triplestore, in order of convenience:

```bash
# Named server from processors.toml (most convenient)
databook push gov-service-domains.databook.md -s gov

# Shorthand for localhost Fuseki (dataset name only)
databook push gov-service-domains.databook.md -d gov

# Explicit endpoint URL
databook push gov-service-domains.databook.md \
  -e http://localhost:3030/gov/sparql
```

All three are equivalent when `processors.toml` maps `gov` to
`http://localhost:3030/gov/sparql`.

### What `push` Loads

By default, `push` loads every RDF block in the DataBook. Each block goes
into its declared named graph (from `graph.named_graph` in frontmatter or
a `<!-- databook:graph: ... -->` comment). It also pushes a `#meta` graph
containing the frontmatter represented as PROV-O triples — this is what
makes the DataBook discoverable via `databook list`.

`sparql-update` label blocks are submitted as SPARQL Update operations
rather than loaded via GSP.

```bash
# Full push — all blocks + meta graph
databook push gov-service-domains.databook.md -s gov

# Push only one specific block
databook push gov-service-domains.databook.md -s gov \
  --block-id services-block

# Push with an explicit named graph override
databook push gov-service-domains.databook.md -s gov \
  --block-id services-block \
  --graph https://govmeta.example.org/graphs/services-v1

# Suppress the #meta graph
databook push gov-service-domains.databook.md -s gov --no-meta

# Merge into existing graph content instead of replacing
databook push gov-service-domains.databook.md -s gov --merge

# Preview without sending
databook push gov-service-domains.databook.md -s gov --dry-run
```

### Starting Jena Fuseki

If Jena Fuseki is not running, the push fails with exit code 2. The
`--verbose` flag shows the mapped endpoint and the error detail:

```bash
databook push gov-service-domains.databook.md -s gov --verbose
# [verbose] Mapped endpoint: http://localhost:3030/gov/sparql
# [verbose] Attempting GSP PUT...
# error: Triplestore connection failed. ECONNREFUSED 127.0.0.1:3030

# Start Fuseki (update-enabled, in-memory dataset)
fuseki-server --update --mem /gov &

# Retry
databook push gov-service-domains.databook.md -s gov
# Loaded: 10 triples → <...#graph>
# Meta graph: 6 triples → <...#meta>
```

---

## § 6  Querying the Triplestore

> *`sparql` executes queries embedded in your DataBook or supplied from
> an external file; `describe` retrieves resource descriptions.*

### Running an Embedded SPARQL Block

The cleanest pattern is an embedded SPARQL block addressed by fragment
IRI — the query travels with the DataBook, is versioned alongside it, and
is executable without any additional files:

```bash
# Execute the block named 'select-top-concepts' in the DataBook
databook sparql gov-service-domains.databook.md#select-top-concepts \
  -s gov

# Equivalent using the --id flag
databook sparql gov-service-domains.databook.md -i select-top-concepts \
  -s gov
```

By default, the result is wrapped in a new provenance-stamped output
DataBook. `--no-wrap` emits raw output:

```bash
# Wrap result in a DataBook (default)
databook sparql gov-service-domains.databook.md#select-top-concepts \
  -s gov -o concepts-result.databook.md

# Emit raw CSV instead
databook sparql gov-service-domains.databook.md#select-top-concepts \
  -s gov --no-wrap --format csv
```

### Running an External Query

When you need a quick ad-hoc query without embedding it in a DataBook:

```bash
databook sparql -Q queries/all-schemes.sparql -s gov --format json
```

### Restricting to a Named Graph

The `--graph` flag restricts the query to a specific named graph —
equivalent to a `FROM` clause:

```bash
databook sparql gov-service-domains.databook.md#select-top-concepts \
  -s gov --graph https://govmeta.example.org/databooks/gov-service-domains-v1#graph
```

### Describing a Resource

`describe` issues a SPARQL DESCRIBE and returns the Concise Bounded
Description of one or more resources — their direct properties and any
blank nodes attached to them:

```bash
# Describe a single resource
databook describe -s gov \
  --iri https://govmeta.example.org/taxonomy/services/PublicServices

# Describe multiple resources in one call
databook describe -s gov \
  --iri https://govmeta.example.org/taxonomy/services/PublicServices \
  --iri https://govmeta.example.org/taxonomy/services/PolicyRegulation \
  -o public-services-desc.databook.md
```

---

## § 7  Pulling Results Back

> *`pull` retrieves from the triplestore and wraps the result in a
> provenance-stamped DataBook — four modes for four use cases.*

`pull` is `push` in reverse, but with more flexibility. Four modes address
distinct retrieval patterns:

**Mode 1 — Named graph fetch (GSP GET).** Retrieves a named graph by IRI
and wraps it in a new DataBook:

```bash
databook pull gov-service-domains.databook.md -s gov \
  --graph https://govmeta.example.org/databooks/gov-service-domains-v1#graph \
  -o snapshot.databook.md
```

**Mode 2 — Embedded SPARQL block execution.** Executes a SPARQL block
embedded in the DataBook and writes the result into a named block:

```bash
databook pull gov-service-domains.databook.md -s gov \
  -i select-top-concepts \
  --replace-block query-results \
  --stats \
  -o gov-service-domains.databook.md
```

The `--stats` flag recomputes `graph.triple_count` and `graph.subjects`
after the pull — keep the frontmatter accurate without running `head
--set` manually.

**Mode 3 — External query file.** Run a query from a `.sparql` file:

```bash
databook pull gov-service-domains.databook.md -s gov \
  -Q queries/domain-counts.sparql \
  --no-wrap -o counts.csv --format csv
```

**Mode 4 — Full DataBook recovery by IRI.** Recover a DataBook that was
previously pushed to the store, without having the original file:

```bash
databook pull -s gov \
  --databook-id https://govmeta.example.org/databooks/gov-service-domains-v1 \
  -o gov-service-domains-recovered.databook.md
```

This works because `databook push --meta` stores the frontmatter and
block metadata in the `#meta` graph. Recovery queries that graph to
reconstruct the full document structure.

---

## § 8  SPARQL Updates, Clearing, and Listing

> *Three administrative commands for managing graph content.*

### Executing Updates with `sparql-update`

`sparql-update` submits a SPARQL INSERT DATA, DELETE WHERE, LOAD, or DROP
operation. Like `sparql`, it accepts an embedded block, an external file,
or a fragment IRI:

```bash
# Add alternative labels to all concepts
databook sparql-update gov-service-domains.databook.md#add-alt-labels -s gov

# Run an external update file
databook sparql-update -Q updates/add-altlabels.ru -s gov

# Preview without sending
databook sparql-update gov-service-domains.databook.md#add-alt-labels \
  -s gov --dry-run
```

### Removing Graphs with `clear`

`clear` issues GSP DELETE requests for the named graphs of a DataBook's
blocks. It is the inverse of `push`:

```bash
# Clear all graphs declared in the DataBook (including #meta)
databook clear gov-service-domains.databook.md -s gov

# Clear only one block's graph
databook clear gov-service-domains.databook.md -s gov \
  --block-id services-block

# Clear an explicit named graph without a DataBook file
databook clear -s gov \
  --graph https://govmeta.example.org/databooks/gov-service-domains-v1#graph

# DROP ALL — destructive; prompts for confirmation
databook clear -s gov --all

# Skip confirmation
databook clear -s gov --all --force
```

### Listing Pushed DataBooks with `list`

`list` queries the triplestore's `#meta` graphs to show which DataBooks
have been pushed — their IRIs, titles, versions, push timestamps, and
triple counts:

```bash
databook list -s gov

# ID                                          Title                         Version  Triples
# ...gov-service-domains-v1                   Government Service Domain...  1.0.0    10
# ...gov-service-shapes-v1                    SKOS Shapes for Service...    1.0.0    23

# Machine-readable for scripting
databook list -s gov --format json | jq '.[0].id'

# Print the catalogue SPARQL query itself
databook list --format sparql
```

The IRI in the ID column can be passed directly to `databook pull
--databook-id` for recovery.

---

## § 9  Validation

> *`validate` runs the DataBook's RDF blocks through a SHACL engine and
> reports violations — with optional pipeline integration via exit codes.*

`validate` requires a `--shapes` reference: either a DataBook block
(`shapes.databook.md#person-shapes`) or a plain `.ttl` file. It runs
the shapes against the DataBook's RDF blocks using the first available
SHACL engine — Jena's `shacl` command (preferred), or `pyshacl` as
fallback.

```bash
# Validate all RDF blocks against a shapes DataBook block
databook validate gov-service-domains.databook.md \
  --shapes gov-service-shapes.databook.md#skos-concept-shapes

# Validate only one block
databook validate gov-service-domains.databook.md \
  --block-id services-block \
  --shapes gov-service-shapes.databook.md#skos-concept-shapes

# Validate against a plain Turtle shapes file
databook validate gov-service-domains.databook.md \
  --shapes skos-shapes.ttl

# Write the SHACL report to a DataBook
databook validate gov-service-domains.databook.md \
  --shapes skos-shapes.ttl \
  -o validation-report.databook.md

# Pipeline integration: exit code 1 on sh:Violation
databook validate gov-service-domains.databook.md \
  --shapes skos-shapes.ttl --fail-on-violation
echo "Exit: $?"
```

**Reading the report.** The validation report is a SHACL `sh:ValidationReport`
graph. When wrapped in a DataBook (the default), it carries a full process
stamp recording the shapes used and the data validated — a permanent
record of when the DataBook was last validated and against what.

**Engine resolution.** The CLI tries `JENA_HOME/bin/shacl` and `shacl` on
PATH before falling back to `pyshacl`. If neither is available, validation
fails with a clear error. Jena is preferred: it handles RDF 1.2 reification
in the data blocks, which pyshacl does not.

---

## § 10  LLM Integration

> *`prompt` sends the DataBook to the Anthropic API and wraps the response
> in a provenance-stamped output DataBook.*

`databook prompt` is the CLI's bridge to large language models. Four
invocation modes cover the main production patterns:

### Full DataBook as Context

The standard mode. The CLI sends the complete document — frontmatter,
all blocks, all prose — and submits the prompt:

```bash
databook prompt gov-service-domains.databook.md \
  --prompt "Identify which service domains appear underspecified.
            Suggest two narrower concepts for each." \
  -o expansion-suggestions.databook.md
```

The output DataBook's process stamp records the source DataBook IRI,
the model used, and the timestamp. The chain from source to LLM output
is fully traceable.

### Using an Embedded `prompt` Block

When a DataBook already contains a fenced `prompt` block — a standing,
reusable LLM query — address it by block ID:

```bash
# Use the embedded prompt block
databook prompt gov-service-domains.databook.md \
  --prompt-block gap-analysis-prompt \
  -o gap-analysis.databook.md

# With {{variable}} interpolation
databook prompt gov-service-domains.databook.md \
  --prompt-block gap-analysis-prompt \
  --interpolate \
  --param domain="Public Services Delivery" \
  -o public-services-gap.databook.md
```

### Patching In Place

The `--patch` and `--patch-block` flags write the LLM response directly
into the source DataBook rather than creating a separate output:

```bash
# Write the response into the frontmatter description field
databook prompt gov-service-domains.databook.md \
  --prompt "Write a one-paragraph abstract for this taxonomy." \
  --patch frontmatter.description

# Replace a named block with the response
databook prompt gov-service-domains.databook.md \
  --prompt "Generate SHACL sh:minCount and sh:maxCount constraints
            for each concept type defined in this taxonomy." \
  --patch-block suggested-shapes

# Append to a list field rather than replacing
databook prompt gov-service-domains.databook.md \
  --prompt "Suggest 3 additional subject tags for this DataBook." \
  --patch frontmatter.subject --patch-mode merge
```

### Bare Prompt

When no source DataBook is needed — generating a new DataBook from a
prompt alone:

```bash
databook prompt \
  --prompt "Generate a SKOS concept scheme for government administrative
            tiers: national, regional, municipal. Include at least two
            narrower concepts under each tier." \
  -o admin-tiers.databook.md
```

### Previewing Without Calling the API

`--dry-run` prints the resolved context and prompt to stderr without
making an API call — useful for checking that the right blocks are being
sent before consuming tokens:

```bash
databook prompt gov-service-domains.databook.md \
  --prompt-block gap-analysis-prompt \
  --interpolate --param domain="Policy" \
  --dry-run
```

---

## § 11  Pipelines and Shape Compilation

> *`process` executes a declared pipeline as a DAG; `shacl2sparql`
> compiles SHACL shapes to SPARQL queries and feeds them back into the
> DataBook.*

### Compiling Shapes to SPARQL with `shacl2sparql`

`shacl2sparql` reads a SHACL shapes block and produces SPARQL SELECT or
CONSTRUCT queries for each NodeShape. The queries retrieve all focus nodes
(SELECT) or all matching triples (CONSTRUCT) satisfying each shape.

The `--insert` flag writes the generated query blocks directly back into
the source DataBook — turning a shapes DataBook into both a constraint
definition and a query library in one step:

```bash
# Print SELECT queries for all shapes (to stdout)
databook shacl2sparql gov-service-shapes.databook.md

# Generate CONSTRUCT queries for a specific block
databook shacl2sparql gov-service-shapes.databook.md \
  --block-id skos-concept-shapes --type construct

# Insert generated queries back into the DataBook
databook shacl2sparql gov-service-shapes.databook.md --insert

# Insert with FROM clause pointing at the taxonomy's named graph
databook shacl2sparql gov-service-shapes.databook.md \
  --data-block services-block --insert

# Compile a specific shape only
databook shacl2sparql gov-service-shapes.databook.md \
  --shape https://govmeta.example.org/shapes/SkosConceptSchemeShape \
  --insert

# Preview without writing
databook shacl2sparql gov-service-shapes.databook.md --insert --dry-run
```

After `--insert`, the shapes DataBook contains both `shacl` blocks
(the constraints) and `sparql` blocks (the queries derived from those
constraints) — addressable independently by fragment IRI.

### Executing a Pipeline with `process`

`process` reads a pipeline manifest DataBook (`build:` vocabulary) and
executes its declared stages in topological order. Each stage is a
DataBook transformation — SPARQL CONSTRUCT, SHACL validation, LLM
prompt, or XSLT — feeding its output into the next stage.

```bash
# Execute the full pipeline
databook process gov-service-domains.databook.md \
  -P gov-taxonomy-pipeline.databook.md \
  -o pipeline-output.databook.md

# Preview the execution plan
databook process gov-service-domains.databook.md \
  -P gov-taxonomy-pipeline.databook.md --dry-run

# Execute with parameter substitution
databook process gov-service-domains.databook.md \
  -P gov-taxonomy-pipeline.databook.md \
  --params '{"targetScheme":"govmeta:ServiceDomainScheme"}' \
  -o pipeline-output.databook.md

# Emit per-stage details
databook process gov-service-domains.databook.md \
  -P gov-taxonomy-pipeline.databook.md -v
```

For single-step operations (`databook sparql` or `databook validate`),
use the dedicated commands — they are faster and produce cleaner output.
`process` earns its place when the pipeline has three or more dependent
stages.

---

## § 12  The Remaining Commands

> *Four specialised commands for format conversion, Markdown ingestion,
> HTTP retrieval, and XSLT transformation.*

### `convert` — Serialisation Format Conversion

`convert` translates a DataBook block from one RDF serialisation to
another. RDF input formats: `turtle`, `turtle12`, `trig`, `shacl`,
`json-ld`. RDF output formats include JSON-LD, N-Triples, YAML-LD,
CSV, TSV, and Markdown:

```bash
# Convert the taxonomy block to JSON-LD
databook convert gov-service-domains.databook.md#services-block \
  --to json-ld -o services.jsonld

# Convert a standalone Turtle file piped from stdin
cat services.ttl | databook convert - --from turtle --to json-ld

# List all blocks and their convertible targets
databook convert gov-service-domains.databook.md --list
```

### `ingest` — Promote Plain Markdown to DataBook

`ingest` performs Phase 1 algorithmic conversion: it scans a plain
`.md` file for fenced blocks with recognised semantic labels and
promotes them to a conformant DataBook, generating required frontmatter
automatically. Display-only labels (`python`, `bash`, etc.) are kept
as-is.

```bash
databook ingest article.md -o article.databook.md

# With namespace and domain metadata injected into frontmatter
databook ingest gov-policy.md \
  --namespace https://vocab.govmeta.example.org/policy# \
  --base-iri https://vocab.govmeta.example.org/ \
  -o gov-policy.databook.md

# Dry-run: see the block classification plan without writing
databook ingest article.md --dry-run
```

**Phase 2 enrichment** (generate a description with LLM after ingestion):

```bash
databook prompt article.databook.md \
  --prompt "Write a concise one-paragraph abstract." \
  --patch frontmatter.description
```

### `fetch` — Retrieve DataBooks from HTTP or Registry

`fetch` downloads a DataBook (or a single block) from an HTTP IRI or a
named registry alias (prefix `@`). Registry aliases are defined in
`processors.toml`:

```bash
# Fetch a DataBook from HTTP
databook fetch https://w3id.org/databook/specs/cli-conventions \
  -o conventions.databook.md

# Fetch only a single block
databook fetch \
  https://govmeta.example.org/databooks/gov-service-domains-v1#services-block \
  --format turtle

# Use a registry alias
databook fetch @gov-service-domains -o gov-service-domains.databook.md

# Force fresh retrieval (bypass local cache)
databook fetch @gov-service-domains --no-cache -o fresh.databook.md
```

### `transform` — Apply XSLT to XML Content

`transform` applies an XSLT 3.0 stylesheet to XML content extracted from
a DataBook block. Processor resolution: `SAXON_JAR` env var → `saxon`
on PATH → `xsltproc` on PATH:

```bash
databook transform gov-data.databook.md \
  --xslt gov-html-report.xslt -o report.html

databook transform gov-data.databook.md \
  --block-id xml-block \
  --xslt transforms.databook.md --xslt-block-id html-transform \
  --param env=production \
  -o result.html
```

---

## § 13  Quick Reference

### The Core Workflow

```bash
# 1. Wrap data into a DataBook
databook create services.ttl -o gov-service-domains.databook.md

# 2. Inspect
databook head gov-service-domains.databook.md
databook extract gov-service-domains.databook.md --list

# 3. Load to triplestore
databook push gov-service-domains.databook.md -s gov

# 4. Query
databook sparql gov-service-domains.databook.md#select-top-concepts -s gov

# 5. Pull results back
databook pull gov-service-domains.databook.md -s gov \
  -i select-top-concepts --wrap -o results.databook.md

# 6. Validate
databook validate gov-service-domains.databook.md \
  --shapes gov-service-shapes.databook.md#skos-shapes

# 7. LLM-augment
databook prompt gov-service-domains.databook.md \
  --prompt "Suggest narrower concepts for each top-level domain." \
  -o expansion.databook.md

# 8. See what's in the store
databook list -s gov
```

### Common Flag Patterns

| Task | Flags |
|---|---|
| Preview without executing | `--dry-run` |
| Verbose diagnostic output | `-v` / `--verbose` |
| Write to file | `-o <file>` |
| Target local Fuseki dataset | `-d <dataset>` |
| Target named server | `-s <server>` |
| Suppress info output | `-q` / `--quiet` |
| Force overwrite | `--force` |
| Windows CRLF safety | handled automatically by `push` |

### Exit Codes

| Code | Meaning |
|---|---|
| 0 | Success |
| 1 | Validation error (malformed DataBook or `--fail-on-violation`) |
| 2 | Triplestore connection failure |
| 3 | Parse error (malformed YAML or Turtle) |
| 4 | Missing required argument |
| 5 | Authentication error (`ANTHROPIC_API_KEY` not set) |

### Environment Variables

| Variable | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Required for `databook prompt` |
| `DATABOOK_FUSEKI_AUTH` | Default auth credential for triplestore commands |
| `DATABOOK_DEBUG=1` | Full stack traces on error |
| `SAXON_JAR` | Path to Saxon JAR for `transform` |
| `JENA_HOME` | Jena installation for `validate` SHACL engine |

### Where to Go Next

**Full option tables** — every flag on every command: the *CLI Commands
Reference* DataBook (`https://w3id.org/databook/cli/commands`).

**Format reference** — frontmatter fields, block labels, directives,
process stamp, manifests: *The DataBook Handbook: A Primer for
Practitioners*.

**Normative spec** — `https://github.com/kurtcagle/databook` (README v0.9;
SKILL.md v1.2).

**Canonical CLI source** — `databook-cli` subfolder, DataBooks GDrive
folder.

---

*Copyright 2026 Kurt Cagle / Semantical LLC. Specification prose: W3C
Document License. Ontology content: CC0-1.0.*
