---
id: http://w3id.org/holon/spec/ontology-header
title: "HGA Ontology Header — Namespace Declarations and Inferencing Policy"
type: spec-section
version: 0.1.0
created: 2026-06-04
author:
  - name: Kurt Cagle
    iri: https://holongraph.com/people/kurt-cagle
    role: editor
    org: Semantical LLC
  - name: Chloe Shannon
    iri: https://holongraph.com/people/chloe-shannon
    role: transformer
license:
  prose: "W3C Document License"
  ontology: "CC0-1.0"
domain: http://w3id.org/holon/
subject:
  - OWL 2 RL
  - SHACL 1.2
  - ontology header
  - holon graph architecture
description: >
  Normative ontology header for the Holon Graph Architecture specification.
  Declares all HGA sub-namespace ontologies with versioning, imports, and
  inter-namespace dependency relationships. Establishes the normative
  inferencing policy: SHACL shapes are primary; OWL 2 RL axioms are
  non-normative annotations. All shapes graphs are self-sufficient without
  OWL reasoning. SHACL 1.2 Rules are used where stable; SPARQL UPDATE
  fallbacks are maintained for every rule.
spec:
  document-iri: http://w3id.org/holon/spec/
  section-number: "Pass A — §1"
  status: "Editor's Draft"
  normative: true
  conformance-class:
    - core
  rfc2119: true
  part-of: http://w3id.org/holon/spec/
graph:
  namespace: http://w3id.org/holon/
  named_graph: http://w3id.org/holon/spec/ontology-header#graph
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

## 1. Introduction

This section declares the `owl:Ontology` metadata for all HGA sub-namespaces
and establishes the normative inferencing policy that governs how SHACL shapes
and OWL axioms interact throughout the specification.

The HGA vocabulary is organised into nine sub-namespaces. Each sub-namespace
is a distinct `owl:Ontology`. Namespaces may import one another; the import
graph is acyclic. Implementations load only the namespaces required by their
declared conformance class.

---

## 2. Inferencing Policy

<!-- databook:id: inferencing-policy -->
<!-- mode=normative norm=true conformance=core rfc2119=MUST -->
```turtle
@prefix holon:  <http://w3id.org/holon/> .
@prefix hspec:  <http://w3id.org/holon/spec/> .
@prefix rdfs:   <http://www.w3.org/2000/01/rdf-schema#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix owl:    <http://www.w3.org/2002/07/owl#> .
@prefix sh:     <http://www.w3.org/ns/shacl#> .

hspec:inferencingPolicy a hspec:ArchitecturalDecision ;
    rdfs:label "HGA Inferencing Policy"@en ;
    sh:agentInstruction "This policy governs how reasoners interact with HGA shapes. SHACL is the normative validation mechanism. OWL axioms inform but do not obligate."@en ;
    dcterms:description """
    The following normative policy governs inferencing throughout the HGA specification:

    (1) SHACL shapes are NORMATIVE. Conformance is assessed by SHACL 1.2 validation
        against data graphs. A processor that correctly executes SHACL validation
        is conformant regardless of whether it performs OWL reasoning.

    (2) OWL 2 RL axioms (rdfs:subClassOf, owl:equivalentClass, owl:equivalentProperty,
        owl:ObjectProperty domain/range declarations) are NON-NORMATIVE annotations.
        They are provided to inform OWL-aware reasoners and ontology editors but MUST
        NOT be relied upon for conformance.

    (3) SHACL shapes MUST be self-sufficient. No SHACL shape in this specification
        may rely on inferred triples (from rdfs:subClassOf or OWL reasoning) to
        produce a correct validation result. sh:class targets MUST be written to
        match the asserted type, not a superclass. sh:or constructs MUST enumerate
        all valid subtypes explicitly.

    (4) Inferencing is PAYLOAD-LEVEL. OWL reasoning, where applied, operates on
        domain content (the payload graph). Inferencing over the HGA infrastructure
        vocabulary itself is NOT required and NOT recommended.

    (5) OWL profile: OWL 2 RL. This profile is chosen for tractability and SPARQL
        compatibility. Implementations MAY load OWL 2 RL axioms into an RL reasoner
        and use the resulting materialised triples as a data graph for SHACL
        validation. Implementations that do so remain conformant provided the SHACL
        shapes produce correct results over the materialised graph.

    (6) SHACL 1.2 Rules: used where the SHACL 1.2 Rules Working Draft is stable.
        Every SHACL rule in this specification MUST have a companion SPARQL UPDATE
        fallback expression in Annex E. Processors detecting SHACL Rules
        unavailability MUST activate the SPARQL UPDATE fallback automatically.
    """@en .

hspec:ArchitecturalDecision a owl:Class ;
    rdfs:label "Architectural Decision Record"@en .
```

---

## 3. Ontology Declarations

All HGA sub-namespace ontologies are declared in the TriG block below, each
in its own named graph. The named graph IRI for each ontology declaration
is the namespace IRI with `#ontology` appended.

<!-- databook:id: ontology-declarations -->
<!-- mode=normative norm=true conformance=core rfc2119=MUST -->
```trig
@prefix holon:   <http://w3id.org/holon/> .
@prefix hev:     <http://w3id.org/holon/event/> .
@prefix hprov:   <http://w3id.org/holon/provenance/> .
@prefix hdb:     <http://w3id.org/holon/databook/> .
@prefix hspec:   <http://w3id.org/holon/spec/> .
@prefix hpol:    <http://w3id.org/holon/policy/> .
@prefix hvc:     <http://w3id.org/holon/vc/> .
@prefix hbayes:  <http://w3id.org/holon/bayesian/> .
@prefix hfed:    <http://w3id.org/holon/federation/> .
@prefix owl:     <http://www.w3.org/2002/07/owl#> .
@prefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix xsd:     <http://www.w3.org/2001/XMLSchema#> .
@prefix sh:      <http://www.w3.org/ns/shacl#> .
@prefix prov:    <http://www.w3.org/ns/prov#> .
@prefix skos:    <http://www.w3.org/2004/02/skos/core#> .
@prefix odrl:    <http://www.w3.org/ns/odrl/2/> .

# ── Core ─────────────────────────────────────────────────────────────────────

GRAPH <http://w3id.org/holon/#ontology> {

  <http://w3id.org/holon/> a owl:Ontology ;
      owl:versionIRI      <http://w3id.org/holon/spec/0.1/holon> ;
      owl:versionInfo     "0.1.0"^^xsd:string ;
      rdfs:label          "HGA Core Vocabulary"@en ;
      dcterms:title       "Holon Graph Architecture — Core Vocabulary"@en ;
      dcterms:description
          "Core holonic structure: Holon, HomeHolon, IndexHolon, AgentHolon, PlaceHolon, OrganisationHolon, DataHolon, ProcessHolon, Portal, PortalLock, Boundary, and GroundingRecord. Also carries the four SKOS concept schemes: lifecycle status, validation severity, concern level, and match type."@en ;
      dcterms:created     "2026-06-04"^^xsd:date ;
      dcterms:license     <https://creativecommons.org/publicdomain/zero/1.0/> ;
      dcterms:creator     <https://holongraph.com/people/kurt-cagle> ;
      hspec:conformanceClass hspec:HGACore ;
      sh:agentInstruction
          "The core HGA vocabulary defines holonic infrastructure — the containers, navigational links, agents, and places that form the skeleton of a holonic graph. These terms describe the envelope and structure of a system, not its domain content. When working with this vocabulary, focus on containment relationships, portal traversal conditions, and grounding records."@en ;
      owl:imports
          <http://www.w3.org/2000/01/rdf-schema#> ,
          <http://www.w3.org/2002/07/owl#> ,
          <http://www.w3.org/ns/shacl#> ,
          <http://www.w3.org/ns/prov#> ,
          <http://www.w3.org/2004/02/skos/core#> ,
          <http://purl.org/dc/terms/> .
}

# ── Events ───────────────────────────────────────────────────────────────────

GRAPH <http://w3id.org/holon/event/#ontology> {

  <http://w3id.org/holon/event/> a owl:Ontology ;
      owl:versionIRI      <http://w3id.org/holon/spec/0.1/event> ;
      owl:versionInfo     "0.1.0"^^xsd:string ;
      rdfs:label          "HGA Event Vocabulary"@en ;
      dcterms:title       "Holon Graph Architecture — Event Envelope Vocabulary"@en ;
      dcterms:description
          "Event envelope vocabulary for the HGA pipeline. Covers AssertionEvent, CommandEvent, ObservationEvent, and system-generated events (CommandRejected, ViolationEvent, OutOfBounds, ExpansionRequest, UnresolvableTarget, RemoteEventEnvelope). Also carries temporal properties (assertedAt, receivedAt, expiresAt, validAsOf) and the targetHolon routing property."@en ;
      dcterms:created     "2026-06-04"^^xsd:date ;
      dcterms:license     <https://creativecommons.org/publicdomain/zero/1.0/> ;
      dcterms:creator     <https://holongraph.com/people/kurt-cagle> ;
      hspec:conformanceClass hspec:HGACore ;
      sh:agentInstruction
          "The event vocabulary governs the outer envelope of every input to the HGA pipeline. An event envelope carries routing metadata (targetHolon), temporal metadata (assertedAt, receivedAt), and a payload type declaration. SHACL shapes for event envelopes are closed — no additional properties are permitted in the envelope layer. Domain content belongs in the payload, which is separate from the envelope."@en ;
      owl:imports
          <http://w3id.org/holon/> ,
          <http://www.w3.org/ns/prov#> ,
          <http://www.w3.org/2001/XMLSchema#> .
}

# ── Provenance ────────────────────────────────────────────────────────────────

GRAPH <http://w3id.org/holon/provenance/#ontology> {

  <http://w3id.org/holon/provenance/> a owl:Ontology ;
      owl:versionIRI      <http://w3id.org/holon/spec/0.1/provenance> ;
      owl:versionInfo     "0.1.0"^^xsd:string ;
      rdfs:label          "HGA Provenance Vocabulary"@en ;
      dcterms:title       "Holon Graph Architecture — Provenance Shape Extensions"@en ;
      dcterms:description
          "PROV-O shape extensions for HGA envelope-level provenance. Provides SHACL shapes for prov:Entity, prov:Activity, and prov:Agent as they appear in HGA event envelopes and DataBook process stamps. Payload provenance uses prov: directly without HGA-specific shapes."@en ;
      dcterms:created     "2026-06-04"^^xsd:date ;
      dcterms:license     <https://creativecommons.org/publicdomain/zero/1.0/> ;
      dcterms:creator     <https://holongraph.com/people/kurt-cagle> ;
      hspec:conformanceClass hspec:HGACore ;
      sh:agentInstruction
          "Provenance shapes constrain the prov:wasGeneratedBy, prov:wasAttributedTo, and prov:used assertions that appear on HGA event envelopes. These shapes ensure every event can be traced to its source agent and generation activity. Payload provenance is domain-specific and not constrained here."@en ;
      owl:imports
          <http://w3id.org/holon/> ,
          <http://w3id.org/holon/event/> ,
          <http://www.w3.org/ns/prov#> .
}

# ── DataBook ──────────────────────────────────────────────────────────────────

GRAPH <http://w3id.org/holon/databook/#ontology> {

  <http://w3id.org/holon/databook/> a owl:Ontology ;
      owl:versionIRI      <http://w3id.org/holon/spec/0.1/databook> ;
      owl:versionInfo     "0.1.0"^^xsd:string ;
      rdfs:label          "HGA DataBook Vocabulary"@en ;
      dcterms:title       "Holon Graph Architecture — DataBook Vocabulary"@en ;
      dcterms:description
          "Vocabulary for the DataBook portable artefact format. Covers document types (DataBook, SpecManifest, SpecSection, SpecAnnex, VocabDataBook), block processing modes, directive properties, manifest structure, and the W3C specification extension terms defined in the DataBook Spec Extension document."@en ;
      dcterms:created     "2026-06-04"^^xsd:date ;
      dcterms:license     <https://creativecommons.org/publicdomain/zero/1.0/> ;
      dcterms:creator     <https://holongraph.com/people/kurt-cagle> ;
      hspec:conformanceClass hspec:HGACore ;
      sh:agentInstruction
          "DataBook is the portable artefact format for the HGA pipeline. A DataBook is simultaneously a human-readable document, a typed data container, and a self-describing semantic artefact. When working with DataBook vocabulary, focus on the frontmatter identity fields, block directives, and the distinction between normative and informative blocks."@en ;
      owl:imports
          <http://w3id.org/holon/> ,
          <http://purl.org/dc/terms/> ,
          <http://www.w3.org/ns/prov#> .
}

# ── Specification Infrastructure ──────────────────────────────────────────────

GRAPH <http://w3id.org/holon/spec/#ontology> {

  <http://w3id.org/holon/spec/> a owl:Ontology ;
      owl:versionIRI      <http://w3id.org/holon/spec/0.1/spec> ;
      owl:versionInfo     "0.1.0"^^xsd:string ;
      rdfs:label          "HGA Specification Infrastructure"@en ;
      dcterms:title       "Holon Graph Architecture — Specification Metadata Vocabulary"@en ;
      dcterms:description
          "Specification metadata infrastructure: conformance classes, publication status values, dependency records, governance metadata, section registry, and scope statements. Used internally by the spec authoring process; not required by HGA implementations."@en ;
      dcterms:created     "2026-06-04"^^xsd:date ;
      dcterms:license     <https://creativecommons.org/publicdomain/zero/1.0/> ;
      dcterms:creator     <https://holongraph.com/people/kurt-cagle> ;
      hspec:conformanceClass hspec:HGACore ;
      owl:imports
          <http://w3id.org/holon/databook/> ,
          <http://purl.org/dc/terms/> ,
          <http://www.w3.org/ns/shacl#> .
}

# ── Policy ────────────────────────────────────────────────────────────────────

GRAPH <http://w3id.org/holon/policy/#ontology> {

  <http://w3id.org/holon/policy/> a owl:Ontology ;
      owl:versionIRI      <http://w3id.org/holon/spec/0.1/policy> ;
      owl:versionInfo     "0.1.0"^^xsd:string ;
      rdfs:label          "HGA Policy Vocabulary"@en ;
      dcterms:title       "Holon Graph Architecture — ODRL Policy Bindings"@en ;
      dcterms:description
          "ODRL 2.2 policy bindings for holon boundaries and portals. Covers PortalPolicy, BoundaryPolicy, AccessPermission, TraversalConstraint, and the SHACL shapes that validate policy attachment on holon and portal instances."@en ;
      dcterms:created     "2026-06-04"^^xsd:date ;
      dcterms:license     <https://creativecommons.org/publicdomain/zero/1.0/> ;
      dcterms:creator     <https://holongraph.com/people/kurt-cagle> ;
      hspec:conformanceClass hspec:HGAExtended ;
      sh:agentInstruction
          "Policy bindings control who may read, write, or traverse holon structures. An ODRL Permission on a Portal declares the conditions under which an agent may traverse it. An ODRL Policy on a Boundary declares read/write access conditions for the holon graph. These are infrastructure-layer policies; domain-level permissions are payload content."@en ;
      owl:imports
          <http://w3id.org/holon/> ,
          <http://www.w3.org/ns/odrl/2/> ,
          <http://www.w3.org/ns/shacl#> .
}

# ── Verifiable Credentials ────────────────────────────────────────────────────

GRAPH <http://w3id.org/holon/vc/#ontology> {

  <http://w3id.org/holon/vc/> a owl:Ontology ;
      owl:versionIRI      <http://w3id.org/holon/spec/0.1/vc> ;
      owl:versionInfo     "0.1.0"^^xsd:string ;
      rdfs:label          "HGA Verifiable Credential Stubs"@en ;
      dcterms:title       "Holon Graph Architecture — Verifiable Credential Wrapper Shapes"@en ;
      dcterms:description
          "SHACL 1.2 shapes for VC Data Model 2.0 credential wrappers (vc:VerifiableCredential, vc:VerifiablePresentation, vc:issuer, vc:validFrom, vc:validUntil, vc:proof). The credentialSubject shape is intentionally open (sh:closed false) — domain deployments extend it with domain-specific subject shapes. The wrapper shapes validate the credential container only."@en ;
      dcterms:created     "2026-06-04"^^xsd:date ;
      dcterms:license     <https://creativecommons.org/publicdomain/zero/1.0/> ;
      dcterms:creator     <https://holongraph.com/people/kurt-cagle> ;
      hspec:conformanceClass hspec:HGAExtended ;
      sh:agentInstruction
          "Verifiable Credential shapes validate the outer wrapper of a VC: that it has an issuer, valid date range, and proof structure. They do not validate the credential subject content, which is domain-specific. Think of these as the envelope shapes for credentials, analogous to the event envelope shapes for events."@en ;
      owl:imports
          <http://w3id.org/holon/> ,
          <https://www.w3.org/ns/credentials/> ,
          <http://www.w3.org/ns/shacl#> .
}

# ── Bayesian / Active Inference ───────────────────────────────────────────────

GRAPH <http://w3id.org/holon/bayesian/#ontology> {

  <http://w3id.org/holon/bayesian/> a owl:Ontology ;
      owl:versionIRI      <http://w3id.org/holon/spec/0.1/bayesian> ;
      owl:versionInfo     "0.1.0"^^xsd:string ;
      rdfs:label          "HGA Bayesian Vocabulary"@en ;
      dcterms:title       "Holon Graph Architecture — Bayesian and Active Inference Vocabulary"@en ;
      dcterms:description
          "Structural vocabulary for Bayesian belief states and Active Inference constructs following Karl Friston's Free Energy Principle. Covers BeliefState (prior, posterior, precision), FreeEnergy (complexity, accuracy), and PolicySelection (expectedFreeEnergy). SHACL shapes validate structural integrity; probabilistic consistency is enforced via SPARQL-based constraints. This namespace is at-risk pending stabilisation of the HGA Bayesian conformance class."@en ;
      dcterms:created     "2026-06-04"^^xsd:date ;
      dcterms:license     <https://creativecommons.org/publicdomain/zero/1.0/> ;
      dcterms:creator     <https://holongraph.com/people/kurt-cagle> ;
      hspec:conformanceClass hspec:HGABayesian ;
      hspec:specStatus    hspec:AtRisk ;
      sh:agentInstruction
          "Bayesian shapes validate the structure of belief update records attached to holon events via RDF 1.2 reification. A BeliefState reifier on an assertion triple records the prior probability, posterior probability after evidence, and precision (inverse variance) of that assertion. FreeEnergy records the information-theoretic cost of the belief update. These are structural validations only — the mathematics of Bayesian updating are domain responsibilities."@en ;
      owl:imports
          <http://w3id.org/holon/> ,
          <http://w3id.org/holon/event/> ,
          <http://www.w3.org/ns/shacl#> ,
          <http://www.w3.org/2001/XMLSchema#> .
}

# ── Federation (Reserved) ────────────────────────────────────────────────────

GRAPH <http://w3id.org/holon/federation/#ontology> {

  <http://w3id.org/holon/federation/> a owl:Ontology ;
      owl:versionIRI      <http://w3id.org/holon/spec/2.0/federation> ;
      owl:versionInfo     "0.0.0-reserved"^^xsd:string ;
      rdfs:label          "HGA Federation (Reserved)"@en ;
      dcterms:title       "Holon Graph Architecture — Federation Namespace (Reserved)"@en ;
      dcterms:description
          "RESERVED. This namespace is deferred to HGA Federation v1.0. No terms are currently defined here. Implementations MUST NOT define terms in this namespace. Federation will be specified as an extension to the Holon model tracking the final SPARQL 1.2 federation Recommendations."@en ;
      dcterms:created     "2026-06-04"^^xsd:date ;
      hspec:specVersion   "v2" .
}
```

---

## 4. Namespace Import Graph

The following diagram summarises the `owl:imports` dependency relationships
between HGA sub-namespaces and external vocabularies.

<!-- databook:id: import-graph -->
<!-- mode=informative norm=false -->
```turtle
@prefix holon:  <http://w3id.org/holon/> .
@prefix hev:    <http://w3id.org/holon/event/> .
@prefix hprov:  <http://w3id.org/holon/provenance/> .
@prefix hdb:    <http://w3id.org/holon/databook/> .
@prefix hspec:  <http://w3id.org/holon/spec/> .
@prefix hpol:   <http://w3id.org/holon/policy/> .
@prefix hvc:    <http://w3id.org/holon/vc/> .
@prefix hbayes: <http://w3id.org/holon/bayesian/> .
@prefix owl:    <http://www.w3.org/2002/07/owl#> .
@prefix rdfs:   <http://www.w3.org/2000/01/rdf-schema#> .

# External roots (no HGA imports)
<http://www.w3.org/ns/prov#>            rdfs:label "PROV-O"@en .
<http://www.w3.org/ns/shacl#>           rdfs:label "SHACL 1.2"@en .
<http://www.w3.org/2004/02/skos/core#>  rdfs:label "SKOS"@en .
<http://www.w3.org/ns/odrl/2/>          rdfs:label "ODRL 2.2"@en .
<http://purl.org/dc/terms/>             rdfs:label "Dublin Core Terms"@en .
<https://www.w3.org/ns/credentials/>    rdfs:label "VC Data Model 2.0"@en .

# HGA level 0 — imports externals only
<http://w3id.org/holon/>
    owl:imports
        <http://www.w3.org/ns/prov#> ,
        <http://www.w3.org/ns/shacl#> ,
        <http://www.w3.org/2004/02/skos/core#> ,
        <http://purl.org/dc/terms/> .

# HGA level 1 — imports holon: only
<http://w3id.org/holon/event/>       owl:imports <http://w3id.org/holon/> .
<http://w3id.org/holon/databook/>    owl:imports <http://w3id.org/holon/> .
<http://w3id.org/holon/provenance/>  owl:imports <http://w3id.org/holon/> .

# HGA level 2 — imports level 0 + 1
<http://w3id.org/holon/spec/>    owl:imports
    <http://w3id.org/holon/databook/> .

<http://w3id.org/holon/policy/>  owl:imports
    <http://w3id.org/holon/> ,
    <http://www.w3.org/ns/odrl/2/> .

<http://w3id.org/holon/vc/>      owl:imports
    <http://w3id.org/holon/> ,
    <https://www.w3.org/ns/credentials/> .

<http://w3id.org/holon/bayesian/> owl:imports
    <http://w3id.org/holon/> ,
    <http://w3id.org/holon/event/> .
```

The import graph is a directed acyclic graph (DAG). `holon:` is the root HGA
namespace and imports only external W3C vocabularies. Higher-level namespaces
import `holon:` and their direct dependencies. No cycles exist.

---

## 5. Non-Normative Annex: GGSC Namespace Reconciliation

> **Note:** This section is informative. It applies specifically to the GGSC
> (Global Geodetic Supply Chain) deployment and does not affect HGA conformance.

The GGSC deployment uses two distinct base URIs for what should be a single
namespace:

| URI | Where used | Class count |
|---|---|---|
| `http://un-ggce.org/ggsc/` | SHACL graph (`urn:ggsc:shacl`) | 20 classes |
| `https://w3id.org/ggsc/` | knowledge-graph, products graph | 1 class (`CountryAgent`) |

These are treated by RDF processors as entirely distinct namespaces. A
reasoner will not infer that `http://un-ggce.org/ggsc/Observatory` and
`https://w3id.org/ggsc/Observatory` are related.

The canonical GGSC namespace SHOULD be `https://w3id.org/ggsc/`. All 20
classes in `http://un-ggce.org/ggsc/` should migrate to `https://w3id.org/ggsc/`
via the SPARQL UPDATE pattern below. The migration bridge DataBook carries
`owl:equivalentClass` declarations for the transition period.

This reconciliation is a prerequisite for GGSC becoming a conformant HGA
deployment (see Annex D).

<!-- databook:id: ggsc-namespace-migration -->
<!-- mode=printed norm=false spec-status=stable -->
```sparql
# GGSC namespace reconciliation — migrate un-ggce.org → w3id.org
# Execute against the urn:ggsc:shacl named graph in Jena.
# Test on a copy before production use.

PREFIX old:  <http://un-ggce.org/ggsc/> .
PREFIX ggsc: <https://w3id.org/ggsc/> .

# Migrate rdf:type assertions (subject position)
DELETE { GRAPH ?g { ?s a old:Observatory } }
INSERT { GRAPH ?g { ?s a ggsc:Observatory } }
WHERE  { GRAPH ?g { ?s a old:Observatory } } ;

DELETE { GRAPH ?g { ?s a old:ProcessingCentre } }
INSERT { GRAPH ?g { ?s a ggsc:ProcessingCentre } }
WHERE  { GRAPH ?g { ?s a old:ProcessingCentre } } ;

DELETE { GRAPH ?g { ?s a old:ObservatoryStub } }
INSERT { GRAPH ?g { ?s a ggsc:ObservatoryStub } }
WHERE  { GRAPH ?g { ?s a old:ObservatoryStub } } ;

DELETE { GRAPH ?g { ?s a old:Centre } }
INSERT { GRAPH ?g { ?s a ggsc:Centre } }
WHERE  { GRAPH ?g { ?s a old:Centre } } ;

DELETE { GRAPH ?g { ?s a old:Capability } }
INSERT { GRAPH ?g { ?s a ggsc:Capability } }
WHERE  { GRAPH ?g { ?s a old:Capability } } ;

DELETE { GRAPH ?g { ?s a old:Level1Capability } }
INSERT { GRAPH ?g { ?s a ggsc:Level1Capability } }
WHERE  { GRAPH ?g { ?s a old:Level1Capability } } ;

DELETE { GRAPH ?g { ?s a old:Level2Capability } }
INSERT { GRAPH ?g { ?s a ggsc:Level2Capability } }
WHERE  { GRAPH ?g { ?s a old:Level2Capability } } ;

DELETE { GRAPH ?g { ?s a old:Level3Capability } }
INSERT { GRAPH ?g { ?s a ggsc:Level3Capability } }
WHERE  { GRAPH ?g { ?s a old:Level3Capability } } ;

DELETE { GRAPH ?g { ?s a old:MaturityAssessment } }
INSERT { GRAPH ?g { ?s a ggsc:MaturityAssessment } }
WHERE  { GRAPH ?g { ?s a old:MaturityAssessment } } ;

DELETE { GRAPH ?g { ?s a old:MaturityDimension } }
INSERT { GRAPH ?g { ?s a ggsc:MaturityDimension } }
WHERE  { GRAPH ?g { ?s a old:MaturityDimension } } ;

DELETE { GRAPH ?g { ?s a old:GeodeticProduct } }
INSERT { GRAPH ?g { ?s a ggsc:GeodeticProduct } }
WHERE  { GRAPH ?g { ?s a old:GeodeticProduct } } ;

DELETE { GRAPH ?g { ?s a old:DataLevel } }
INSERT { GRAPH ?g { ?s a ggsc:DataLevel } }
WHERE  { GRAPH ?g { ?s a old:DataLevel } } ;

# Migrate object-position type references
DELETE { GRAPH ?g { ?s ?p old:Observatory } }
INSERT { GRAPH ?g { ?s ?p ggsc:Observatory } }
WHERE  { GRAPH ?g { ?s ?p old:Observatory } FILTER(?p != rdf:type) } ;
```

---

*Copyright 2026 Kurt Cagle / Semantical LLC. Specification prose: W3C Document
License. Ontology content: CC0-1.0.*
