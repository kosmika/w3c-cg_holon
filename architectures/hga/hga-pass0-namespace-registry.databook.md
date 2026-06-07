---
id: http://w3id.org/holon/spec/namespace-registry
title: "HGA Namespace and Prefix Registry"
type: spec-section
version: 0.1.0
created: 2026-06-04
author:
  - name: Kurt Cagle
    iri: https://holongraph.com/people/kurt-cagle
    role: editor
  - name: Chloe Shannon
    iri: https://holongraph.com/people/chloe-shannon
    role: transformer
license:
  prose: "W3C Document License"
  ontology: "CC0-1.0"
domain: http://w3id.org/holon/
description: >
  Canonical namespace and prefix registry for the Holon Graph Architecture.
  Defines all HGA sub-namespaces, their prefix assignments, term naming
  conventions, and content negotiation behaviour. Includes w3id.org
  registration artefacts (.htaccess and README.md), the migration bridge
  from the legacy ontologist.io namespace, and a JSON-LD 1.1 context stub.
spec:
  document-iri: http://w3id.org/holon/spec/
  section-number: "Pass 0 — §1"
  status: "Editor's Draft"
  normative: true
  conformance-class:
    - core
  rfc2119: true
  part-of: http://w3id.org/holon/spec/
graph:
  namespace: http://w3id.org/holon/
  named_graph: http://w3id.org/holon/spec/namespace-registry#graph
  rdf_version: "1.2"
  turtle_version: "1.2"
  reification: false
process:
  transformer: "claude-sonnet-4-6"
  transformer_type: llm
  transformer_iri: https://api.anthropic.com/v1/models/claude-sonnet-4-6
  timestamp: 2026-06-04T00:00:00Z
  agent:
    name: Chloe Shannon
    iri: https://holongraph.com/people/chloe-shannon
    role: orchestrator
---

## 1. Namespace Design Principles

The HGA namespace scheme follows these normative conventions:

1. **Base authority**: `http://w3id.org/holon/` — W3C Permanent Identifier
   service, registered at `https://github.com/perma-id/w3id.org`.
2. **Sub-namespace paths**: kebab-case (e.g. `active-inference/`, `belief-state/`).
3. **Class term names**: PascalCase (e.g. `AssertionEvent`, `HomeHolon`).
4. **Property term names**: camelCase (e.g. `targetHolon`, `assertedAt`).
5. **Individual / instance names**: kebab-case IRIs (e.g. `hspec:hga-core`).
6. **All term IRIs**: named IRIs — NEVER blank node subjects in vocabulary definitions.
7. **Reifier IRIs**: MUST be named IRIs; blank node reifiers are non-conformant.

> **Important:** Term-level IRIs are stable and unversioned. The spec document
> IRI `http://w3id.org/holon/spec/` carries version metadata; term IRIs do not.
> Versioning is carried in `owl:Ontology` instances, not in term paths.

---

## 2. HGA Sub-Namespace and Prefix Registry

<!-- databook:id: prefix-registry -->
<!-- mode=normative norm=true conformance=core rfc2119=MUST -->
```turtle
@prefix hspec:   <http://w3id.org/holon/spec/> .
@prefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix owl:     <http://www.w3.org/2002/07/owl#> .
@prefix xsd:     <http://www.w3.org/2001/XMLSchema#> .

hspec:PrefixRegistryEntry a owl:Class ;
    rdfs:label "Prefix Registry Entry"@en .

hspec:ns-holon a hspec:PrefixRegistryEntry ;
    hspec:prefix "holon" ;
    hspec:namespaceIRI "http://w3id.org/holon/" ;
    hspec:conformanceClass "core" ;
    rdfs:label "HGA Core"@en ;
    dcterms:description "Core holonic structure: Holon, HomeHolon, IndexHolon, AgentHolon, PlaceHolon, OrganisationHolon, Portal, Boundary, GroundingRecord, status values, match types."@en .

hspec:ns-hev a hspec:PrefixRegistryEntry ;
    hspec:prefix "hev" ;
    hspec:namespaceIRI "http://w3id.org/holon/event/" ;
    hspec:conformanceClass "core" ;
    rdfs:label "HGA Events"@en ;
    dcterms:description "Event envelope vocabulary: AssertionEvent, CommandEvent, ObservationEvent, CommandRejected, ViolationEvent, OutOfBounds, ExpansionRequest, UnresolvableTarget, RemoteEventEnvelope; temporal properties assertedAt, receivedAt, expiresAt, validAsOf, targetHolon."@en .

hspec:ns-hprov a hspec:PrefixRegistryEntry ;
    hspec:prefix "hprov" ;
    hspec:namespaceIRI "http://w3id.org/holon/provenance/" ;
    hspec:conformanceClass "core" ;
    rdfs:label "HGA Provenance"@en ;
    dcterms:description "PROV-O shape extensions and HGA-specific provenance terms. Envelope-level provenance only; payload provenance uses prov: directly."@en .

hspec:ns-hdb a hspec:PrefixRegistryEntry ;
    hspec:prefix "hdb" ;
    hspec:namespaceIRI "http://w3id.org/holon/databook/" ;
    hspec:conformanceClass "core" ;
    rdfs:label "HGA DataBook"@en ;
    dcterms:description "DataBook vocabulary: document types, block modes, directive properties, manifest structure. Extended from DataBook v1.2."@en .

hspec:ns-hspec a hspec:PrefixRegistryEntry ;
    hspec:prefix "hspec" ;
    hspec:namespaceIRI "http://w3id.org/holon/spec/" ;
    hspec:conformanceClass "all" ;
    rdfs:label "HGA Specification Infrastructure"@en ;
    dcterms:description "Specification metadata, conformance classes, publication status, section registry, dependency records, governance."@en .

hspec:ns-hpol a hspec:PrefixRegistryEntry ;
    hspec:prefix "hpol" ;
    hspec:namespaceIRI "http://w3id.org/holon/policy/" ;
    hspec:conformanceClass "extended" ;
    rdfs:label "HGA Policy"@en ;
    dcterms:description "ODRL policy bindings for holons and portals: PortalPolicy, BoundaryPolicy, AccessPermission, TraversalConstraint."@en .

hspec:ns-hvc a hspec:PrefixRegistryEntry ;
    hspec:prefix "hvc" ;
    hspec:namespaceIRI "http://w3id.org/holon/vc/" ;
    hspec:conformanceClass "extended" ;
    rdfs:label "HGA Verifiable Credentials"@en ;
    dcterms:description "VerifiableCredential wrapper shapes. credentialSubject is open (sh:closed false). Wrapper validates issuer, validFrom, validUntil, proof structure."@en .

hspec:ns-hbayes a hspec:PrefixRegistryEntry ;
    hspec:prefix "hbayes" ;
    hspec:namespaceIRI "http://w3id.org/holon/bayesian/" ;
    hspec:conformanceClass "bayesian" ;
    hspec:specStatus "at-risk" ;
    rdfs:label "HGA Bayesian"@en ;
    dcterms:description "Active inference and Bayesian update vocabulary: BeliefState, FreeEnergy, PolicySelection, prior, posterior, precision, complexity, accuracy, expectedFreeEnergy."@en .

hspec:ns-hfed a hspec:PrefixRegistryEntry ;
    hspec:prefix "hfed" ;
    hspec:namespaceIRI "http://w3id.org/holon/federation/" ;
    hspec:conformanceClass "reserved" ;
    hspec:specVersion "v2" ;
    rdfs:label "HGA Federation (Reserved)"@en ;
    dcterms:description "RESERVED. Cross-server federation vocabulary. Deferred to HGA Federation v1.0. Implementations MUST NOT define terms in this namespace."@en .
```

### 2.1 Summary Table

| Prefix | Namespace IRI | Conformance | Content |
|---|---|---|---|
| `holon:` | `http://w3id.org/holon/` | Core | Holons, portals, boundaries, grounding |
| `hev:` | `http://w3id.org/holon/event/` | Core | Event envelopes, temporal properties |
| `hprov:` | `http://w3id.org/holon/provenance/` | Core | PROV-O extensions |
| `hdb:` | `http://w3id.org/holon/databook/` | Core | DataBook vocabulary |
| `hspec:` | `http://w3id.org/holon/spec/` | All | Spec infrastructure |
| `hpol:` | `http://w3id.org/holon/policy/` | Extended | ODRL policy bindings |
| `hvc:` | `http://w3id.org/holon/vc/` | Extended | VC wrapper shapes |
| `hbayes:` | `http://w3id.org/holon/bayesian/` | Bayesian | Active inference |
| `hfed:` | `http://w3id.org/holon/federation/` | **Reserved** | Cross-server federation (v2) |

### 2.2 External Vocabulary Prefix Assignments

The following external vocabularies are used normatively or informatively.
These prefix assignments are RECOMMENDED for all HGA DataBooks.

<!-- databook:id: external-prefix-registry -->
<!-- mode=normative norm=true conformance=core rfc2119=SHOULD -->
```turtle
@prefix owl:  <http://www.w3.org/2002/07/owl#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

<http://w3id.org/holon/spec/external-prefix-registry>
    owl:imports
        <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ,
        <http://www.w3.org/2000/01/rdf-schema#> ,
        <http://www.w3.org/2002/07/owl#> ,
        <http://www.w3.org/2001/XMLSchema#> ,
        <http://www.w3.org/ns/shacl#> ,
        <http://www.w3.org/ns/prov#> ,
        <http://www.w3.org/2004/02/skos/core#> ,
        <http://www.w3.org/ns/odrl/2/> ,
        <http://purl.org/dc/terms/> ,
        <https://www.w3.org/ns/credentials/> .
```

| Prefix | Namespace IRI | Source | Normative? |
|---|---|---|---|
| `rdf:` | `http://www.w3.org/1999/02/22-rdf-syntax-ns#` | W3C Rec | Yes |
| `rdfs:` | `http://www.w3.org/2000/01/rdf-schema#` | W3C Rec | Yes |
| `owl:` | `http://www.w3.org/2002/07/owl#` | W3C Rec | Yes (OWL 2 RL axioms only) |
| `xsd:` | `http://www.w3.org/2001/XMLSchema#` | W3C Rec | Yes |
| `sh:` | `http://www.w3.org/ns/shacl#` | W3C Rec (1.1) + WD (1.2) | Yes |
| `prov:` | `http://www.w3.org/ns/prov#` | W3C Rec | Yes |
| `skos:` | `http://www.w3.org/2004/02/skos/core#` | W3C Rec | Yes |
| `odrl:` | `http://www.w3.org/ns/odrl/2/` | W3C Rec | Yes (Extended+) |
| `dcterms:` | `http://purl.org/dc/terms/` | DCMI (stable, used normatively in PROV-O and DCAT) | Yes |
| `vc:` | `https://www.w3.org/ns/credentials/` | W3C Rec (VC DM 2.0) | Yes (Extended+) |

> **Note on `dcterms:`**: Dublin Core Terms is maintained by DCMI, not W3C.
> Its inclusion is justified by its normative use in W3C Recommendations
> including PROV-O, DCAT, and VoID. It is the only non-W3C vocabulary used
> normatively in this specification.

---

## 3. w3id.org Registration Artefacts

### 3.1 `.htaccess` File

The following file MUST be submitted as a pull request to
`https://github.com/perma-id/w3id.org` at path `w3id.org/holon/.htaccess`.
Content negotiation supports Turtle, JSON-LD, RDF/XML, and HTML. The redirect
target is `https://holongraph.com/spec/holon/` pending CG establishment; it
MUST be updated to `https://www.w3.org/ns/holon/` on Recommendation publication.

<!-- databook:id: htaccess -->
<!-- mode=printed norm=false -->
```apache
# HGA Vocabulary Namespace Registration
# Namespace:   http://w3id.org/holon/
# Maintainer:  Kurt Cagle <kurt.cagle@gmail.com>
# Org:         Semantical LLC
# Repository:  https://github.com/kurtcagle/holon-spec
# CG:          W3C Holon Graph Architecture Community Group (proposed)
# Updated:     2026-06-04
#
# On W3C Recommendation: update redirect target to https://www.w3.org/ns/holon/
# All term IRIs remain stable through this change.

Options +FollowSymLinks
RewriteEngine on

# --- Turtle ---
RewriteCond %{HTTP_ACCEPT} text/turtle [OR]
RewriteCond %{HTTP_ACCEPT} application/x-turtle
RewriteRule ^(.*)$  https://holongraph.com/spec/holon/$1.ttl  [R=303,L]

# --- JSON-LD ---
RewriteCond %{HTTP_ACCEPT} application/ld\+json
RewriteRule ^(.*)$  https://holongraph.com/spec/holon/$1.jsonld  [R=303,L]

# --- RDF/XML ---
RewriteCond %{HTTP_ACCEPT} application/rdf\+xml
RewriteRule ^(.*)$  https://holongraph.com/spec/holon/$1.rdf  [R=303,L]

# --- N-Triples ---
RewriteCond %{HTTP_ACCEPT} application/n-triples
RewriteRule ^(.*)$  https://holongraph.com/spec/holon/$1.nt  [R=303,L]

# --- Default: HTML spec page ---
RewriteRule ^(.*)$  https://holongraph.com/spec/holon/$1  [R=303,L]
```

### 3.2 `README.md` for w3id.org PR

<!-- databook:id: w3id-readme -->
<!-- mode=printed norm=false -->
```markdown
# http://w3id.org/holon/

**Namespace for the Holon Graph Architecture (HGA) Vocabulary**

This namespace is maintained by Kurt Cagle / Semantical LLC pending
establishment of the W3C Holon Graph Architecture Community Group, at which
point governance transfers to the CG.

- **Specification**: https://holongraph.com/spec/holon/
- **Repository**: https://github.com/kurtcagle/holon-spec
- **Maintainer**: kurt.cagle@gmail.com
- **Licence (ontology)**: CC0-1.0
- **Licence (spec prose)**: W3C Document License

## Sub-namespaces

| Path | Content |
|---|---|
| `/holon/` | Core: Holon, Portal, Boundary, Agent, Place |
| `/holon/event/` | Event envelopes and temporal properties |
| `/holon/provenance/` | PROV-O shape extensions |
| `/holon/databook/` | DataBook vocabulary |
| `/holon/spec/` | Specification infrastructure |
| `/holon/policy/` | ODRL policy bindings |
| `/holon/vc/` | Verifiable Credential stubs |
| `/holon/bayesian/` | Active inference vocabulary |
| `/holon/federation/` | RESERVED — federation v2 |

## Migration path

On W3C Recommendation publication, redirect target will be updated from
`https://holongraph.com/spec/holon/` to `https://www.w3.org/ns/holon/`.
All term IRIs remain stable.
```

---

## 4. Migration Bridge — `ontologist.io` to `w3id.org/holon/`

All existing deployments using `https://ontologist.io/ns/holon#` MUST load
this bridge graph to maintain conformance. The bridge declares
`owl:equivalentClass` and `owl:equivalentProperty` between legacy and
canonical IRIs.

<!-- databook:id: migration-bridge -->
<!-- databook:graph: http://w3id.org/holon/spec/migration-bridge#graph -->
<!-- mode=normative norm=true conformance=core rfc2119=MUST -->
```turtle
@prefix old:   <https://ontologist.io/ns/holon#> .
@prefix holon: <http://w3id.org/holon/> .
@prefix hev:   <http://w3id.org/holon/event/> .
@prefix owl:   <http://www.w3.org/2002/07/owl#> .
@prefix rdfs:  <http://www.w3.org/2000/01/rdf-schema#> .
@prefix dcterms: <http://purl.org/dc/terms/> .

<http://w3id.org/holon/spec/migration-bridge#graph>
    a owl:Ontology ;
    rdfs:label "HGA Namespace Migration Bridge"@en ;
    dcterms:description "owl:equivalentClass and owl:equivalentProperty declarations bridging the legacy https://ontologist.io/ns/holon# namespace to the canonical http://w3id.org/holon/ namespace. Load this graph in any triplestore holding legacy GGSC or HGA data."@en ;
    owl:imports <http://w3id.org/holon/> , <http://w3id.org/holon/event/> .

# --- Class bridges ---

old:AssertionEvent      owl:equivalentClass hev:AssertionEvent .
old:CommandEvent        owl:equivalentClass hev:CommandEvent .
old:CommandRejected     owl:equivalentClass hev:CommandRejected .
old:ViolationEvent      owl:equivalentClass hev:ViolationEvent .
old:OutOfBounds         owl:equivalentClass hev:OutOfBounds .
old:ExpansionRequest    owl:equivalentClass hev:ExpansionRequest .
old:UnresolvableTarget  owl:equivalentClass hev:UnresolvableTarget .

old:CandidateStatus     owl:equivalentClass holon:CandidateStatus .
old:RegisteredStatus    owl:equivalentClass holon:RegisteredStatus .

old:ExactMatch          owl:equivalentClass holon:ExactMatch .
old:FuzzyMatch          owl:equivalentClass holon:FuzzyMatch .
old:NoMatch             owl:equivalentClass holon:NoMatch .

old:GroundingRecord     owl:equivalentClass holon:GroundingRecord .

old:Agent               owl:equivalentClass holon:AgentHolon .
old:Location            owl:equivalentClass holon:PlaceHolon .
old:Organisation        owl:equivalentClass holon:OrganisationHolon .

# --- Property bridges ---

old:targetHolon         owl:equivalentProperty hev:targetHolon .
old:assertedAt          owl:equivalentProperty hev:assertedAt .
old:receivedAt          owl:equivalentProperty hev:receivedAt .
old:expiresAt           owl:equivalentProperty hev:expiresAt .
old:validAsOf           owl:equivalentProperty hev:validAsOf .

old:groundingConfidence owl:equivalentProperty holon:groundingConfidence .
old:matchedIRI          owl:equivalentProperty holon:matchedIRI .
old:sourceString        owl:equivalentProperty holon:sourceString .
old:matchType           owl:equivalentProperty holon:matchType .

# --- Deprecation notices ---

old:Agent rdfs:comment
    "DEPRECATED. Use holon:AgentHolon. This IRI bridges to the canonical term via owl:equivalentClass."@en .
old:Location rdfs:comment
    "DEPRECATED. Use holon:PlaceHolon."@en .
old:Organisation rdfs:comment
    "DEPRECATED. Use holon:OrganisationHolon."@en .
```

### SPARQL UPDATE Migration for Jena

For deployments wishing to migrate data in-place rather than load the bridge
graph, the following SPARQL UPDATE removes all legacy IRI occurrences and
replaces them with canonical IRIs.

> **Note:** Test on a copy of the dataset before executing against production.
> The migration is destructive — legacy IRIs are removed.

<!-- databook:id: jena-migration-sparql -->
<!-- mode=printed norm=false -->
```sparql
PREFIX old:   <https://ontologist.io/ns/holon#>
PREFIX holon: <http://w3id.org/holon/>
PREFIX hev:   <http://w3id.org/holon/event/>

# Migrate class assertions
DELETE { GRAPH ?g { ?s a old:AssertionEvent } }
INSERT { GRAPH ?g { ?s a hev:AssertionEvent } }
WHERE  { GRAPH ?g { ?s a old:AssertionEvent } } ;

DELETE { GRAPH ?g { ?s a old:CommandEvent } }
INSERT { GRAPH ?g { ?s a hev:CommandEvent } }
WHERE  { GRAPH ?g { ?s a old:CommandEvent } } ;

DELETE { GRAPH ?g { ?s a old:CommandRejected } }
INSERT { GRAPH ?g { ?s a hev:CommandRejected } }
WHERE  { GRAPH ?g { ?s a old:CommandRejected } } ;

DELETE { GRAPH ?g { ?s a old:ViolationEvent } }
INSERT { GRAPH ?g { ?s a hev:ViolationEvent } }
WHERE  { GRAPH ?g { ?s a old:ViolationEvent } } ;

DELETE { GRAPH ?g { ?s a old:GroundingRecord } }
INSERT { GRAPH ?g { ?s a holon:GroundingRecord } }
WHERE  { GRAPH ?g { ?s a old:GroundingRecord } } ;

DELETE { GRAPH ?g { ?s a old:Agent } }
INSERT { GRAPH ?g { ?s a holon:AgentHolon } }
WHERE  { GRAPH ?g { ?s a old:Agent } } ;

DELETE { GRAPH ?g { ?s a old:Location } }
INSERT { GRAPH ?g { ?s a holon:PlaceHolon } }
WHERE  { GRAPH ?g { ?s a old:Location } } ;

DELETE { GRAPH ?g { ?s a old:Organisation } }
INSERT { GRAPH ?g { ?s a holon:OrganisationHolon } }
WHERE  { GRAPH ?g { ?s a old:Organisation } } ;

# Migrate event properties
DELETE { GRAPH ?g { ?s old:targetHolon ?o } }
INSERT { GRAPH ?g { ?s hev:targetHolon ?o } }
WHERE  { GRAPH ?g { ?s old:targetHolon ?o } } ;

DELETE { GRAPH ?g { ?s old:assertedAt ?o } }
INSERT { GRAPH ?g { ?s hev:assertedAt ?o } }
WHERE  { GRAPH ?g { ?s old:assertedAt ?o } } ;

DELETE { GRAPH ?g { ?s old:receivedAt ?o } }
INSERT { GRAPH ?g { ?s hev:receivedAt ?o } }
WHERE  { GRAPH ?g { ?s old:receivedAt ?o } } ;

# Migrate grounding properties
DELETE { GRAPH ?g { ?s old:groundingConfidence ?o } }
INSERT { GRAPH ?g { ?s holon:groundingConfidence ?o } }
WHERE  { GRAPH ?g { ?s old:groundingConfidence ?o } } ;

DELETE { GRAPH ?g { ?s old:matchedIRI ?o } }
INSERT { GRAPH ?g { ?s holon:matchedIRI ?o } }
WHERE  { GRAPH ?g { ?s old:matchedIRI ?o } } ;

DELETE { GRAPH ?g { ?s old:sourceString ?o } }
INSERT { GRAPH ?g { ?s holon:sourceString ?o } }
WHERE  { GRAPH ?g { ?s old:sourceString ?o } } ;

DELETE { GRAPH ?g { ?s old:matchType ?o } }
INSERT { GRAPH ?g { ?s holon:matchType ?o } }
WHERE  { GRAPH ?g { ?s old:matchType ?o } }
```

---

## 5. JSON-LD 1.1 Context Stub

A JSON-LD 1.1 context document SHOULD be served at
`http://w3id.org/holon/context.jsonld`. The following stub covers Core and
Events conformance classes. Extended namespaces are added in subsequent passes.

<!-- databook:id: jsonld-context -->
<!-- mode=reference norm=false conformance=core -->
```json-ld
{
  "@context": {
    "@version": 1.1,
    "holon":  "http://w3id.org/holon/",
    "hev":    "http://w3id.org/holon/event/",
    "hprov":  "http://w3id.org/holon/provenance/",
    "hdb":    "http://w3id.org/holon/databook/",
    "hspec":  "http://w3id.org/holon/spec/",
    "hpol":   "http://w3id.org/holon/policy/",
    "hvc":    "http://w3id.org/holon/vc/",
    "hbayes": "http://w3id.org/holon/bayesian/",
    "rdf":    "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "rdfs":   "http://www.w3.org/2000/01/rdf-schema#",
    "owl":    "http://www.w3.org/2002/07/owl#",
    "xsd":    "http://www.w3.org/2001/XMLSchema#",
    "sh":     "http://www.w3.org/ns/shacl#",
    "prov":   "http://www.w3.org/ns/prov#",
    "skos":   "http://www.w3.org/2004/02/skos/core#",
    "odrl":   "http://www.w3.org/ns/odrl/2/",
    "dcterms":"http://purl.org/dc/terms/",
    "vc":     "https://www.w3.org/ns/credentials/",

    "Holon":              {"@id": "holon:Holon"},
    "HomeHolon":          {"@id": "holon:HomeHolon"},
    "IndexHolon":         {"@id": "holon:IndexHolon"},
    "AgentHolon":         {"@id": "holon:AgentHolon"},
    "PlaceHolon":         {"@id": "holon:PlaceHolon"},
    "OrganisationHolon":  {"@id": "holon:OrganisationHolon"},
    "Portal":             {"@id": "holon:Portal"},
    "PortalLock":         {"@id": "holon:PortalLock"},
    "GroundingRecord":    {"@id": "holon:GroundingRecord"},

    "AssertionEvent":     {"@id": "hev:AssertionEvent"},
    "CommandEvent":       {"@id": "hev:CommandEvent"},
    "ObservationEvent":   {"@id": "hev:ObservationEvent"},
    "CommandRejected":    {"@id": "hev:CommandRejected"},
    "ViolationEvent":     {"@id": "hev:ViolationEvent"},

    "targetHolon":        {"@id": "hev:targetHolon",  "@type": "@id"},
    "assertedAt":         {"@id": "hev:assertedAt",   "@type": "xsd:dateTime"},
    "receivedAt":         {"@id": "hev:receivedAt",   "@type": "xsd:dateTime"},
    "expiresAt":          {"@id": "hev:expiresAt",    "@type": "xsd:dateTime"},
    "validAsOf":          {"@id": "hev:validAsOf",    "@type": "xsd:dateTime"},

    "groundingConfidence":{"@id": "holon:groundingConfidence", "@type": "xsd:decimal"},
    "matchedIRI":         {"@id": "holon:matchedIRI",  "@type": "@id"},
    "sourceString":       {"@id": "holon:sourceString"},
    "matchType":          {"@id": "holon:matchType",   "@type": "@id"}
  }
}
```

> **Note:** JSON-LD Compact format is a SHOULD for Core conformance and a MUST
> for Extended conformance. The context document at
> `http://w3id.org/holon/context.jsonld` is served via the vocabulary server
> defined in the vocabulary server specification (spec section Pass B, §2.1).

---

*Copyright 2026 Kurt Cagle / Semantical LLC. Specification prose: W3C Document
License. Ontology content: CC0-1.0.*
