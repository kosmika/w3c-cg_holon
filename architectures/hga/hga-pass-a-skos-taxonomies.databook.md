---
id: http://w3id.org/holon/skos/core-taxonomies
title: "HGA Core SKOS Taxonomies"
type: vocab-databook
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
  - SKOS
  - controlled vocabulary
  - holon lifecycle
  - validation severity
  - concern level
  - match type
description: >
  Four SKOS controlled vocabulary schemes for the core holon: namespace.
  Each scheme is a skos:ConceptScheme with fully labelled concepts carrying
  skos:definition, skos:scopeNote, and skos:notation. The schemes cover:
  (1) holon lifecycle status; (2) SHACL validation severity; (3) abstract
  concern levels for domain risk assessment; (4) entity grounding match
  quality. Each scheme is assigned to its own named graph. Event type
  classification is defined separately in the hev: namespace (Pass C).
spec:
  document-iri: http://w3id.org/holon/spec/
  section-number: "Pass A — §2"
  status: "Editor's Draft"
  normative: true
  conformance-class:
    - core
  rfc2119: true
  part-of: http://w3id.org/holon/spec/
graph:
  namespace: http://w3id.org/holon/
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

This DataBook defines four SKOS concept schemes used throughout the HGA
specification. SKOS is used for controlled vocabularies — enumerated sets of
values where membership is closed, each member requires a stable IRI, and
human-readable definitions are normative.

Each scheme occupies its own named graph, enabling selective loading. All
concept IRIs are in the `http://w3id.org/holon/` namespace (prefix `holon:`).

The four schemes and their primary use contexts are:

| Scheme | IRI | Used by |
|---|---|---|
| Holon Lifecycle Status | `holon:LifecycleStatusScheme` | Holon registration, registry management |
| Validation Severity | `holon:ValidationSeverityScheme` | SHACL shapes, ViolationEvent |
| Concern Level | `holon:ConcernLevelScheme` | Domain risk assessment (payload-level) |
| Grounding Match Type | `holon:MatchTypeScheme` | Pass 1 entity recognition, GroundingRecord |

> **Note:** These schemes define the concept IRIs. SHACL shapes constraining
> the use of these concepts (e.g. `sh:in` constraints on status properties)
> are defined in Pass B (Core Structure).

---

## 2. Holon Lifecycle Status Scheme

Defines the administrative lifecycle states of a registered holon. Used
as the range of `holon:registrationStatus`.

<!-- databook:id: lifecycle-status-scheme -->
<!-- databook:graph: http://w3id.org/holon/skos/lifecycle-status -->
<!-- mode=normative norm=true conformance=core rfc2119=MUST -->
```trig
@prefix holon:   <http://w3id.org/holon/> .
@prefix skos:    <http://www.w3.org/2004/02/skos/core#> .
@prefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix sh:      <http://www.w3.org/ns/shacl#> .
@prefix owl:     <http://www.w3.org/2002/07/owl#> .
@prefix xsd:     <http://www.w3.org/2001/XMLSchema#> .

GRAPH <http://w3id.org/holon/skos/lifecycle-status> {

  holon:LifecycleStatusScheme a skos:ConceptScheme ;
      rdfs:label        "Holon Lifecycle Status"@en ;
      skos:prefLabel    "Holon Lifecycle Status"@en ;
      dcterms:title     "HGA Holon Lifecycle Status Vocabulary"@en ;
      dcterms:description
          "Controlled vocabulary for the administrative lifecycle states of a registered holon. A holon progresses from Candidate through Registered and may subsequently be Deprecated, Archived, or Suspended."@en ;
      dcterms:created   "2026-06-04"^^xsd:date ;
      sh:agentInstruction
          "Use lifecycle status to determine whether a holon is available for active use. Only Registered holons should be referenced as targets in event envelopes or portal links. Candidate holons are awaiting review. Deprecated holons have successors. Archived holons are read-only historical records."@en ;
      skos:hasTopConcept
          holon:CandidateStatus ,
          holon:RegisteredStatus ,
          holon:DeprecatedStatus ,
          holon:ArchivedStatus ,
          holon:SuspendedStatus .

  # ── Candidate ──────────────────────────────────────────────────────────────

  holon:CandidateStatus a skos:Concept ;
      skos:inScheme      holon:LifecycleStatusScheme ;
      skos:topConceptOf  holon:LifecycleStatusScheme ;
      rdfs:label         "Candidate"@en ;
      skos:prefLabel     "Candidate"@en ;
      skos:altLabel      "CandidateStatus"@en ;
      skos:notation      "CANDIDATE" ;
      skos:definition
          "A holon that has been submitted to the registry but has not yet been reviewed and approved. Candidate holons MUST NOT be used as targets in production event envelopes. They MAY be used in development and testing contexts."@en ;
      skos:scopeNote
          "The confidence gate in the ingestion pipeline routes holons with any medium-confidence or NoMatch entities to Candidate status pending human review. High-stakes domain implementations (e.g. medical) MUST require explicit human review for all registrations."@en ;
      skos:broader       holon:LifecycleStatusScheme .

  # ── Registered ─────────────────────────────────────────────────────────────

  holon:RegisteredStatus a skos:Concept ;
      skos:inScheme      holon:LifecycleStatusScheme ;
      skos:topConceptOf  holon:LifecycleStatusScheme ;
      rdfs:label         "Registered"@en ;
      skos:prefLabel     "Registered"@en ;
      skos:altLabel      "RegisteredStatus"@en ;
      skos:notation      "REGISTERED" ;
      skos:definition
          "A holon that has been reviewed, approved, and made canonical in the registry. Registered holons are the authoritative representation of their subject within the scope of the holon server."@en ;
      skos:scopeNote
          "Registration is the prerequisite for a holon to receive production event envelopes and to be returned in index holon discovery responses."@en ;
      skos:broader       holon:LifecycleStatusScheme .

  # ── Deprecated ─────────────────────────────────────────────────────────────

  holon:DeprecatedStatus a skos:Concept ;
      skos:inScheme      holon:LifecycleStatusScheme ;
      skos:topConceptOf  holon:LifecycleStatusScheme ;
      rdfs:label         "Deprecated"@en ;
      skos:prefLabel     "Deprecated"@en ;
      skos:altLabel      "DeprecatedStatus"@en ;
      skos:notation      "DEPRECATED" ;
      skos:definition
          "A holon that has been superseded by a successor holon. Deprecated holons remain readable but SHOULD NOT receive new event envelopes. The deprecation record MUST carry a holon:successor link to the replacement holon."@en ;
      skos:scopeNote
          "Implementations SHOULD warn clients that attempt to route events to deprecated holons. Automated migration is permitted where the successor holon's schema is backwards-compatible."@en ;
      skos:broader       holon:LifecycleStatusScheme .

  # ── Archived ───────────────────────────────────────────────────────────────

  holon:ArchivedStatus a skos:Concept ;
      skos:inScheme      holon:LifecycleStatusScheme ;
      skos:topConceptOf  holon:LifecycleStatusScheme ;
      rdfs:label         "Archived"@en ;
      skos:prefLabel     "Archived"@en ;
      skos:altLabel      "ArchivedStatus"@en ;
      skos:notation      "ARCHIVED" ;
      skos:definition
          "A holon that has been closed and made read-only. Archived holons preserve historical state and MUST NOT receive new event envelopes. The archive record MUST carry dcterms:date of archiving and MAY carry a reason."@en ;
      skos:scopeNote
          "Archiving is typically applied to holons representing completed events, concluded projects, or decommissioned entities. The distinction from Deprecated is that Archived holons have no successor — they represent a closed historical record, not a superseded entity."@en ;
      skos:broader       holon:LifecycleStatusScheme .

  # ── Suspended ──────────────────────────────────────────────────────────────

  holon:SuspendedStatus a skos:Concept ;
      skos:inScheme      holon:LifecycleStatusScheme ;
      skos:topConceptOf  holon:LifecycleStatusScheme ;
      rdfs:label         "Suspended"@en ;
      skos:prefLabel     "Suspended"@en ;
      skos:altLabel      "SuspendedStatus"@en ;
      skos:notation      "SUSPENDED" ;
      skos:definition
          "A holon that has been temporarily deactivated. Suspended holons MUST NOT receive new event envelopes. Unlike Archived, a Suspended holon MAY be reactivated to Registered status. Suspension MUST carry an administrative reason and MAY carry a review date."@en ;
      skos:scopeNote
          "Suspension is used for policy holds, security reviews, or temporary deactivation pending investigation. It is not a terminal state. Reactivation requires explicit administrative action."@en ;
      skos:broader       holon:LifecycleStatusScheme .

}
```

---

## 3. Validation Severity Scheme

Defines severity levels for SHACL validation results and system violation
events. Aligned with SHACL built-in severity IRIs via `skos:exactMatch`.

<!-- databook:id: validation-severity-scheme -->
<!-- databook:graph: http://w3id.org/holon/skos/validation-severity -->
<!-- mode=normative norm=true conformance=core rfc2119=MUST -->
```trig
@prefix holon:   <http://w3id.org/holon/> .
@prefix skos:    <http://www.w3.org/2004/02/skos/core#> .
@prefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix sh:      <http://www.w3.org/ns/shacl#> .
@prefix owl:     <http://www.w3.org/2002/07/owl#> .
@prefix xsd:     <http://www.w3.org/2001/XMLSchema#> .

GRAPH <http://w3id.org/holon/skos/validation-severity> {

  holon:ValidationSeverityScheme a skos:ConceptScheme ;
      rdfs:label        "HGA Validation Severity"@en ;
      skos:prefLabel    "HGA Validation Severity"@en ;
      dcterms:title     "HGA Validation Severity Vocabulary"@en ;
      dcterms:description
          "Controlled vocabulary for SHACL validation result severity levels. Aligned with SHACL built-in severity IRIs (sh:Violation, sh:Warning, sh:Info) via skos:exactMatch. Used as the range of sh:resultSeverity in validation reports and as the severity of holon:ViolationEvent instances."@en ;
      dcterms:created   "2026-06-04"^^xsd:date ;
      sh:agentInstruction
          "Severity governs how a SHACL validation failure is handled in the pipeline. Violations block scene graph mutation. Warnings are logged but do not block. Info results are informational only. Use these concepts to interpret validation reports and route events appropriately."@en ;
      skos:hasTopConcept
          holon:ViolationSeverity ,
          holon:WarningSeverity ,
          holon:InfoSeverity .

  # ── Violation ──────────────────────────────────────────────────────────────

  holon:ViolationSeverity a skos:Concept ;
      skos:inScheme      holon:ValidationSeverityScheme ;
      skos:topConceptOf  holon:ValidationSeverityScheme ;
      rdfs:label         "Violation"@en ;
      skos:prefLabel     "Violation"@en ;
      skos:notation      "VIOLATION" ;
      skos:exactMatch    sh:Violation ;
      skos:definition
          "A constraint failure that is severe enough to invalidate the data graph for the purposes of the current operation. In the HGA pipeline, a Violation MUST prevent scene graph mutation and MUST generate a holon:ViolationEvent. The event envelope is preserved in the event graph for audit purposes."@en ;
      skos:scopeNote
          "Violations are the default severity for SHACL shapes unless overridden with sh:severity sh:Warning or sh:severity sh:Info. Domain deployments SHOULD reserve Violation for structural failures — missing required properties, type mismatches, cardinality breaches."@en ;
      skos:broader       holon:ValidationSeverityScheme .

  # ── Warning ────────────────────────────────────────────────────────────────

  holon:WarningSeverity a skos:Concept ;
      skos:inScheme      holon:ValidationSeverityScheme ;
      skos:topConceptOf  holon:ValidationSeverityScheme ;
      rdfs:label         "Warning"@en ;
      skos:prefLabel     "Warning"@en ;
      skos:notation      "WARNING" ;
      skos:exactMatch    sh:Warning ;
      skos:definition
          "A constraint failure that is notable but does not invalidate the data graph. In the HGA pipeline, a Warning MUST be logged in the event graph but MUST NOT prevent scene graph mutation. A Warning SHOULD be surfaced to the AI cartographer as contextual metadata."@en ;
      skos:scopeNote
          "Use Warning severity for advisory constraints: recommended but not required properties, best-practice patterns, or data quality suggestions. Warnings accumulate over time and can be used to drive data quality improvement workflows."@en ;
      skos:broader       holon:ValidationSeverityScheme .

  # ── Info ───────────────────────────────────────────────────────────────────

  holon:InfoSeverity a skos:Concept ;
      skos:inScheme      holon:ValidationSeverityScheme ;
      skos:topConceptOf  holon:ValidationSeverityScheme ;
      rdfs:label         "Info"@en ;
      skos:prefLabel     "Info"@en ;
      skos:notation      "INFO" ;
      skos:exactMatch    sh:Info ;
      skos:definition
          "An informational constraint result. Does not indicate a failure. In the HGA pipeline, Info results MAY be logged and MAY be surfaced to the AI cartographer but MUST NOT affect pipeline routing."@en ;
      skos:scopeNote
          "Use Info severity for observational constraints that generate useful metadata without constituting failures — for example, detecting that a holon has been in Candidate status for more than a configurable threshold, or that a property value is near a defined boundary."@en ;
      skos:broader       holon:ValidationSeverityScheme .

}
```

---

## 4. Concern Level Scheme

Defines abstract concern levels for domain risk and impact assessment.
These are payload-level concepts — they are used within domain data graphs
to annotate assertions with a risk or impact level via RDF 1.2 reification.
The HGA specification defines the concept scheme; domain deployments mint
the specific concern-level annotations.

<!-- databook:id: concern-level-scheme -->
<!-- databook:graph: http://w3id.org/holon/skos/concern-level -->
<!-- mode=normative norm=true conformance=core rfc2119=SHOULD -->
```trig
@prefix holon:   <http://w3id.org/holon/> .
@prefix skos:    <http://www.w3.org/2004/02/skos/core#> .
@prefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix sh:      <http://www.w3.org/ns/shacl#> .
@prefix xsd:     <http://www.w3.org/2001/XMLSchema#> .

GRAPH <http://w3id.org/holon/skos/concern-level> {

  holon:ConcernLevelScheme a skos:ConceptScheme ;
      rdfs:label        "HGA Concern Level"@en ;
      skos:prefLabel    "HGA Concern Level"@en ;
      dcterms:title     "HGA Abstract Concern Level Vocabulary"@en ;
      dcterms:description
          "Abstract concern levels for annotating domain assertions with a risk or impact grade via RDF 1.2 reification. Domain deployments attach a concern level to a triple by using the triple as a reified triple with a named reifier IRI carrying holon:concernLevel. This scheme defines four abstract levels: High, Medium, Low, and Positive. Domain deployments MAY extend this scheme with their own narrower concepts."@en ;
      dcterms:created   "2026-06-04"^^xsd:date ;
      sh:agentInstruction
          "Concern levels annotate specific assertions in a domain data graph. A HighConcern annotation on a triple means that the fact it describes carries significant risk or impact in the deployment context. Use concern levels to guide attention in the AI cartographer depiction layer — high-concern assertions SHOULD be prominently surfaced."@en ;
      skos:hasTopConcept
          holon:HighConcern ,
          holon:MediumConcern ,
          holon:LowConcern ,
          holon:PositiveConcern .

  # ── High ───────────────────────────────────────────────────────────────────

  holon:HighConcern a skos:Concept ;
      skos:inScheme      holon:ConcernLevelScheme ;
      skos:topConceptOf  holon:ConcernLevelScheme ;
      rdfs:label         "High Concern"@en ;
      skos:prefLabel     "High Concern"@en ;
      skos:altLabel      "HighConcern"@en ;
      skos:notation      "HIGH" ;
      skos:definition
          "The annotated assertion describes a condition of high risk, high impact, or high urgency in the domain context. Implementations SHOULD route HighConcern annotations to priority handling paths and SHOULD surface them prominently in depictions."@en ;
      skos:scopeNote
          "In the GGSC deployment, HighConcern is used for geodetic products at risk from geopolitical disruption. In a medical holon, HighConcern might annotate a critical lab value. The semantics are domain-defined; the concern level is a routing and depiction hint."@en ;
      skos:broader       holon:ConcernLevelScheme .

  # ── Medium ─────────────────────────────────────────────────────────────────

  holon:MediumConcern a skos:Concept ;
      skos:inScheme      holon:ConcernLevelScheme ;
      skos:topConceptOf  holon:ConcernLevelScheme ;
      rdfs:label         "Medium Concern"@en ;
      skos:prefLabel     "Medium Concern"@en ;
      skos:altLabel      "MediumConcern"@en ;
      skos:notation      "MEDIUM" ;
      skos:definition
          "The annotated assertion describes a condition of moderate risk or impact in the domain context. Implementations SHOULD log MediumConcern annotations and SHOULD include them in routine monitoring reports."@en ;
      skos:scopeNote
          "Medium concern is typically used for conditions that are significant but not immediately critical — elevated risk trends, approaching thresholds, or advisory findings."@en ;
      skos:broader       holon:ConcernLevelScheme .

  # ── Low ────────────────────────────────────────────────────────────────────

  holon:LowConcern a skos:Concept ;
      skos:inScheme      holon:ConcernLevelScheme ;
      skos:topConceptOf  holon:ConcernLevelScheme ;
      rdfs:label         "Low Concern"@en ;
      skos:prefLabel     "Low Concern"@en ;
      skos:altLabel      "LowConcern"@en ;
      skos:notation      "LOW" ;
      skos:definition
          "The annotated assertion describes a condition of low risk or impact. Low concern annotations are informational and MAY be omitted from routine depictions."@en ;
      skos:broader       holon:ConcernLevelScheme .

  # ── Positive ───────────────────────────────────────────────────────────────

  holon:PositiveConcern a skos:Concept ;
      skos:inScheme      holon:ConcernLevelScheme ;
      skos:topConceptOf  holon:ConcernLevelScheme ;
      rdfs:label         "Positive Concern"@en ;
      skos:prefLabel     "Positive Concern"@en ;
      skos:altLabel      "PositiveConcern"@en ;
      skos:notation      "POSITIVE" ;
      skos:definition
          "The annotated assertion describes a beneficial development, improvement, or risk-reducing condition in the domain context. Positive concern is not an absence of concern but a qualitatively different kind — it indicates favourable change."@en ;
      skos:scopeNote
          "In the GGSC deployment, PositiveConcern is used for events that strengthen the geodetic reference frame. In general, Positive annotations provide contrast to risk-focused concern levels and enable balanced domain depictions."@en ;
      skos:broader       holon:ConcernLevelScheme .

}
```

> **Note on reification usage:** A concern level annotation on a triple MUST
> use a named IRI reifier (not a blank node) and MUST carry an `rdfs:label`
> on the reifier IRI. Example in Turtle 1.2:
>
> ```turtle
> << ggsc:USA ggsc:puttingAtRisk ggsc:ProductITRF >> ~<urn:ann:usa-itrf-risk-01>
>     holon:concernLevel  holon:HighConcern ;
>     rdfs:label          "Concern annotation: USA putting ITRF at risk"@en ;
>     hev:assertedAt      "2025-02-01T00:00:00Z"^^xsd:dateTime .
> ```

---

## 5. Grounding Match Type Scheme

Defines the quality classification for entity grounding results produced by
the Pass 1 entity recognition stage of the HGA ingestion pipeline. Used as
the range of `holon:matchType` on `holon:GroundingRecord` instances.

<!-- databook:id: match-type-scheme -->
<!-- databook:graph: http://w3id.org/holon/skos/match-type -->
<!-- mode=normative norm=true conformance=core rfc2119=MUST -->
```trig
@prefix holon:   <http://w3id.org/holon/> .
@prefix skos:    <http://www.w3.org/2004/02/skos/core#> .
@prefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix sh:      <http://www.w3.org/ns/shacl#> .
@prefix xsd:     <http://www.w3.org/2001/XMLSchema#> .

GRAPH <http://w3id.org/holon/skos/match-type> {

  holon:MatchTypeScheme a skos:ConceptScheme ;
      rdfs:label        "HGA Grounding Match Type"@en ;
      skos:prefLabel    "HGA Grounding Match Type"@en ;
      dcterms:title     "HGA Entity Grounding Match Quality Vocabulary"@en ;
      dcterms:description
          "Controlled vocabulary classifying the quality of entity grounding results in the Pass 1 stage of the HGA ingestion pipeline. Each GroundingRecord carries exactly one matchType value. The match type drives confidence gate routing: ExactMatch and SemanticMatch proceed to auto-registration; FuzzyMatch enters the review queue; NoMatch triggers new entity minting."@en ;
      dcterms:created   "2026-06-04"^^xsd:date ;
      sh:agentInstruction
          "Match type tells you how confident the grounding pipeline is that a source string refers to a known canonical entity. ExactMatch is certain. SemanticMatch is high-confidence via embedding similarity. FuzzyMatch is moderate — a human should review. NoMatch means the entity is genuinely new and needs an IRI minted."@en ;
      skos:hasTopConcept
          holon:ExactMatch ,
          holon:SemanticMatch ,
          holon:FuzzyMatch ,
          holon:NoMatch .

  # ── ExactMatch ─────────────────────────────────────────────────────────────

  holon:ExactMatch a skos:Concept ;
      skos:inScheme      holon:MatchTypeScheme ;
      skos:topConceptOf  holon:MatchTypeScheme ;
      rdfs:label         "Exact Match"@en ;
      skos:prefLabel     "Exact Match"@en ;
      skos:altLabel      "ExactMatch"@en ;
      skos:notation      "EXACT" ;
      skos:definition
          "The source string matches a canonical label (rdfs:label, skos:prefLabel, or skos:altLabel) exactly, including case and whitespace normalisation. The matched canonical IRI is authoritative; the grounding confidence MUST be 1.0."@en ;
      skos:scopeNote
          "ExactMatch holons proceed directly to auto-registration (confidence gate ≥ threshold). No human review required unless the deployment mandates review for all registrations."@en ;
      skos:broader       holon:MatchTypeScheme .

  # ── SemanticMatch ──────────────────────────────────────────────────────────

  holon:SemanticMatch a skos:Concept ;
      skos:inScheme      holon:MatchTypeScheme ;
      skos:topConceptOf  holon:MatchTypeScheme ;
      rdfs:label         "Semantic Match"@en ;
      skos:prefLabel     "Semantic Match"@en ;
      skos:altLabel      "SemanticMatch"@en ;
      skos:notation      "SEMANTIC" ;
      skos:definition
          "The source string matches a canonical entity via embedding similarity or semantic equivalence detection, with a confidence score above the deployment-defined high-confidence threshold (default ≥ 0.90). The canonical IRI is used with confidence annotation."@en ;
      skos:scopeNote
          "SemanticMatch is used when source text uses paraphrase, abbreviation, or alternative naming for known entities. The grounding confidence MUST be recorded and MUST be ≥ 0.90 for this classification. Values below 0.90 MUST be classified as FuzzyMatch."@en ;
      skos:broader       holon:MatchTypeScheme .

  # ── FuzzyMatch ─────────────────────────────────────────────────────────────

  holon:FuzzyMatch a skos:Concept ;
      skos:inScheme      holon:MatchTypeScheme ;
      skos:topConceptOf  holon:MatchTypeScheme ;
      rdfs:label         "Fuzzy Match"@en ;
      skos:prefLabel     "Fuzzy Match"@en ;
      skos:altLabel      "FuzzyMatch"@en ;
      skos:notation      "FUZZY" ;
      skos:definition
          "The source string approximately matches a canonical entity label with a confidence score in the range [deployment-defined low threshold, high threshold). The grounding is plausible but uncertain. The holon MUST enter the confidence gate review queue."@en ;
      skos:scopeNote
          "Default confidence range for FuzzyMatch: [0.50, 0.90). The canonical IRI is used provisionally; the holon is assigned CandidateStatus until human review confirms or corrects the match. FuzzyMatch entities SHOULD be highlighted in depictions."@en ;
      skos:broader       holon:MatchTypeScheme .

  # ── NoMatch ────────────────────────────────────────────────────────────────

  holon:NoMatch a skos:Concept ;
      skos:inScheme      holon:MatchTypeScheme ;
      skos:topConceptOf  holon:MatchTypeScheme ;
      rdfs:label         "No Match"@en ;
      skos:prefLabel     "No Match"@en ;
      skos:altLabel      "NoMatch"@en ;
      skos:notation      "NOMATCH" ;
      skos:definition
          "No canonical entity in the registry matches the source string above the deployment-defined low-confidence threshold. The entity is a candidate for new IRI minting. The grounding confidence MUST be recorded as 0.0."@en ;
      skos:scopeNote
          "NoMatch triggers the new entity registration path in the confidence gate. A new canonical IRI is minted using domain-appropriate patterns. The new entity enters the registry at CandidateStatus pending review. NoMatch entities MUST NOT be silently discarded — they represent potentially new domain knowledge."@en ;
      skos:broader       holon:MatchTypeScheme .

}
```

---

## 6. Concept Scheme Index

For reference, all SKOS concept IRIs defined in this DataBook and their
named graph locations are summarised below.

<!-- databook:id: scheme-index -->
<!-- mode=reference norm=false -->
```sparql
PREFIX holon: <http://w3id.org/holon/>
PREFIX skos:  <http://www.w3.org/2004/02/skos/core#>
PREFIX rdfs:  <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?scheme ?concept ?label ?notation WHERE {
  GRAPH ?g {
    ?concept skos:inScheme ?scheme ;
             rdfs:label    ?label ;
             skos:notation ?notation .
  }
  VALUES ?scheme {
    holon:LifecycleStatusScheme
    holon:ValidationSeverityScheme
    holon:ConcernLevelScheme
    holon:MatchTypeScheme
  }
}
ORDER BY ?scheme ?notation
```

| Scheme | Concept IRI | Label | Notation |
|---|---|---|---|
| LifecycleStatus | `holon:CandidateStatus` | Candidate | CANDIDATE |
| LifecycleStatus | `holon:RegisteredStatus` | Registered | REGISTERED |
| LifecycleStatus | `holon:DeprecatedStatus` | Deprecated | DEPRECATED |
| LifecycleStatus | `holon:ArchivedStatus` | Archived | ARCHIVED |
| LifecycleStatus | `holon:SuspendedStatus` | Suspended | SUSPENDED |
| ValidationSeverity | `holon:ViolationSeverity` | Violation | VIOLATION |
| ValidationSeverity | `holon:WarningSeverity` | Warning | WARNING |
| ValidationSeverity | `holon:InfoSeverity` | Info | INFO |
| ConcernLevel | `holon:HighConcern` | High Concern | HIGH |
| ConcernLevel | `holon:MediumConcern` | Medium Concern | MEDIUM |
| ConcernLevel | `holon:LowConcern` | Low Concern | LOW |
| ConcernLevel | `holon:PositiveConcern` | Positive Concern | POSITIVE |
| MatchType | `holon:ExactMatch` | Exact Match | EXACT |
| MatchType | `holon:SemanticMatch` | Semantic Match | SEMANTIC |
| MatchType | `holon:FuzzyMatch` | Fuzzy Match | FUZZY |
| MatchType | `holon:NoMatch` | No Match | NOMATCH |

---

*Copyright 2026 Kurt Cagle / Semantical LLC. Specification prose: W3C Document
License. Ontology content: CC0-1.0.*
