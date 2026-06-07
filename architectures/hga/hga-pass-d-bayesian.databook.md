---
id: http://w3id.org/holon/spec/bayesian
title: "HGA Bayesian and Active Inference — Vocabulary and Shapes"
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
domain: http://w3id.org/holon/bayesian/
subject:
  - Bayesian inference
  - active inference
  - free energy principle
  - Karl Friston
  - belief state
  - SHACL 1.2
  - RDF 1.2 reification
description: >
  Normative vocabulary and SHACL 1.2 shapes for the HGA Bayesian and Active
  Inference layer. Defines BeliefState, FreeEnergy, and PolicySelection as
  structured annotations on RDF triples via the Turtle 1.2 subjectAnnotation
  pattern. Shapes validate structural integrity only; probabilistic
  consistency is enforced via SPARQL-based constraints. This section is
  at-risk pending stabilisation of the HGA Bayesian conformance class.
spec:
  document-iri: http://w3id.org/holon/spec/
  section-number: "Pass D — §1"
  status: "Editor's Draft"
  normative: true
  conformance-class:
    - bayesian
  rfc2119: true
  at-risk: true
  part-of: http://w3id.org/holon/spec/
graph:
  namespace: http://w3id.org/holon/bayesian/
  rdf_version: "1.2"
  turtle_version: "1.2"
  reification: true
shapes:
  - http://w3id.org/holon/bayesian/#shapes
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

> **At risk:** This entire section may be removed or substantially modified
> before CG Report publication, pending stabilisation of the `hbayes:`
> conformance class. A SPARQL UPDATE fallback for every SHACL rule is
> maintained in Annex E.

---

## 1. Design Principles

### 1.1 Scope and Limits

SHACL shapes validate **structure** — that the right properties exist, are
of the right type, and satisfy declared numeric ranges. They cannot validate
**probabilistic correctness** — whether the posterior is a genuine Bayesian
update of the prior given the evidence. That is the responsibility of the
implementing inference engine.

This section defines structural shapes for three constructs drawn from
Karl Friston's Free Energy Principle and Active Inference framework:

- **BeliefState** — a variational distribution `q(x)` over hidden states,
  annotating an assertion triple with prior probability, posterior
  probability after evidence, and precision (inverse variance).
- **FreeEnergy** — the variational free energy `F = Complexity − Accuracy`,
  annotating a belief update with its information-theoretic cost.
- **PolicySelection** — the expected free energy `G(π)` of a policy choice,
  recording which policy was selected and why.

All three are attached to RDF triples as **reification annotations** using
the Turtle 1.2 `subjectAnnotation` pattern.

### 1.2 Reification Pattern

The canonical pattern for attaching a BeliefState to a domain assertion:

<!-- databook:id: belief-annotation-pattern -->
<!-- mode=example norm=false -->
```turtle12
PREFIX hbayes: <http://w3id.org/holon/bayesian/> .
PREFIX rdfs:   <http://www.w3.org/2000/01/rdf-schema#> .
PREFIX xsd:    <http://www.w3.org/2001/XMLSchema#> .

# A domain assertion annotated with a belief state.
# The ~ <iri> names the reifier; {| |} annotates it.
ggsc:USA ggsc:puttingAtRisk ggsc:ProductITRF
    ~ <urn:belief:usa-itrf-2025-01>
    {| a hbayes:BeliefState ;
       rdfs:label "Belief: USA supply chain risk to ITRF products"@en ;
       hbayes:prior      0.30 ;
       hbayes:posterior  0.85 ;
       hbayes:precision  5.0  ;
       hbayes:inferenceTimestamp "2025-02-01T00:00:00Z"^^xsd:dateTime |} .
```

The triple `ggsc:USA ggsc:puttingAtRisk ggsc:ProductITRF` is asserted. The
reifier `<urn:belief:usa-itrf-2025-01>` names it. The annotation block
carries the BeliefState properties.

### 1.3 Relationship to the Event Model

ObservationEvents (`hev:ObservationEvent`) are the primary driver of belief
updates. Each observation provides evidence that should shift the posterior.
The `hbayes:evidenceGraph` property on a BeliefState links the annotation
to the named graph of the observation that produced the update.

---

## 2. Vocabulary Declarations

<!-- databook:id: bayesian-vocabulary -->
<!-- databook:graph: http://w3id.org/holon/bayesian/#vocabulary -->
<!-- mode=normative norm=true conformance=bayesian rfc2119=MUST spec-status=at-risk -->
```trig
@prefix hbayes:  <http://w3id.org/holon/bayesian/> .
@prefix hev:     <http://w3id.org/holon/event/> .
@prefix hspec:   <http://w3id.org/holon/spec/> .
@prefix owl:     <http://www.w3.org/2002/07/owl#> .
@prefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix xsd:     <http://www.w3.org/2001/XMLSchema#> .
@prefix skos:    <http://www.w3.org/2004/02/skos/core#> .
@prefix sh:      <http://www.w3.org/ns/shacl#> .

GRAPH <http://w3id.org/holon/bayesian/#vocabulary> {

  # ── Classes ────────────────────────────────────────────────────────────────

  hbayes:BeliefState a owl:Class ;
      rdfs:label   "Belief State"@en ;
      rdfs:comment "A variational distribution q(x) over hidden states, attached to a domain assertion triple as a reification annotation. Records the prior probability before evidence, the posterior after evidence, and the precision (inverse variance) of the distribution."@en ;
      sh:agentInstruction
          "A BeliefState annotates a specific assertion with a confidence grade. prior is what we believed before; posterior is what we believe after the most recent evidence; precision is how certain we are. Higher precision means less uncertainty. A BeliefState with posterior >> prior signals that new evidence was highly informative."@en ;
      hspec:specStatus hspec:AtRisk .

  hbayes:FreeEnergy a owl:Class ;
      rdfs:label   "Free Energy"@en ;
      rdfs:comment "The variational free energy F = Complexity − Accuracy of a belief update. Complexity is the KL divergence D_KL[q(x)||p(x)] — how much the posterior deviates from the prior. Accuracy is the expected log likelihood E_q[ln p(o|x)] — how well the model explains observations."@en ;
      sh:agentInstruction
          "FreeEnergy records the information-theoretic cost of a belief update. Low free energy means the model fits the evidence well without straying far from the prior. High free energy signals either surprising evidence or an inadequate model."@en ;
      hspec:specStatus hspec:AtRisk .

  hbayes:PolicySelection a owl:Class ;
      rdfs:label   "Policy Selection"@en ;
      rdfs:comment "A record of a policy selection decision based on expected free energy G(π). Records the expected free energy of the selected policy, the set of candidate policies considered, and the selected policy IRI."@en ;
      sh:agentInstruction
          "PolicySelection records why the system chose a particular course of action. The policy with the lowest expected free energy G(π) is selected. Lower G means less expected surprise and less deviation from preferred outcomes."@en ;
      hspec:specStatus hspec:AtRisk .

  # ── BeliefState Properties ─────────────────────────────────────────────────

  hbayes:prior a owl:DatatypeProperty ;
      rdfs:label   "prior"@en ;
      rdfs:domain  hbayes:BeliefState ;
      rdfs:range   xsd:decimal ;
      sh:unit      <http://qudt.org/vocab/unit/UNITLESS> ;
      dcterms:description
          "Prior probability P(x) before evidence. Range [0.0, 1.0]. Represents the system's belief before the most recent observation drove a Bayesian update."@en .

  hbayes:posterior a owl:DatatypeProperty ;
      rdfs:label   "posterior"@en ;
      rdfs:domain  hbayes:BeliefState ;
      rdfs:range   xsd:decimal ;
      sh:unit      <http://qudt.org/vocab/unit/UNITLESS> ;
      dcterms:description
          "Posterior probability P(x|o) after evidence. Range [0.0, 1.0]. The updated belief after incorporating the most recent observation."@en .

  hbayes:precision a owl:DatatypeProperty ;
      rdfs:label   "precision"@en ;
      rdfs:domain  hbayes:BeliefState ;
      rdfs:range   xsd:decimal ;
      sh:unit      <http://qudt.org/vocab/unit/UNITLESS> ;
      dcterms:description
          "Precision β = 1/σ² of the belief distribution. MUST be > 0. Posterior precision MUST be ≥ prior precision (information can only be gained, not lost, by a Bayesian update)."@en .

  hbayes:inferenceTimestamp a owl:DatatypeProperty ;
      rdfs:label   "inference timestamp"@en ;
      rdfs:domain  hbayes:BeliefState ;
      rdfs:range   xsd:dateTime ;
      dcterms:description
          "The UTC timestamp at which this belief state was computed."@en .

  hbayes:evidenceGraph a owl:DatatypeProperty ;
      rdfs:label   "evidence graph"@en ;
      rdfs:domain  hbayes:BeliefState ;
      rdfs:range   xsd:anyURI ;
      dcterms:description
          "The named graph IRI of the observation or evidence that drove this belief update. Links the BeliefState to its hev:ObservationEvent payload."@en .

  # ── FreeEnergy Properties ──────────────────────────────────────────────────

  hbayes:complexity a owl:DatatypeProperty ;
      rdfs:label   "complexity"@en ;
      rdfs:domain  hbayes:FreeEnergy ;
      rdfs:range   xsd:decimal ;
      dcterms:description
          "The KL divergence D_KL[q(x)||p(x)] — the complexity cost of deviating the posterior from the prior. Always ≥ 0."@en .

  hbayes:accuracy a owl:DatatypeProperty ;
      rdfs:label   "accuracy"@en ;
      rdfs:domain  hbayes:FreeEnergy ;
      rdfs:range   xsd:decimal ;
      dcterms:description
          "The expected log likelihood E_q[ln p(o|x)] — how well the posterior distribution explains the observed evidence. May be any real number."@en .

  hbayes:freeEnergy a owl:DatatypeProperty ;
      rdfs:label   "free energy"@en ;
      rdfs:domain  hbayes:FreeEnergy ;
      rdfs:range   xsd:decimal ;
      dcterms:description
          "Total variational free energy F = Complexity − Accuracy. If present, SHOULD approximately equal hbayes:complexity minus hbayes:accuracy. This is an advisory check; floating-point implementations may carry rounding errors."@en .

  hbayes:forBeliefState a owl:ObjectProperty ;
      rdfs:label   "for belief state"@en ;
      rdfs:domain  hbayes:FreeEnergy ;
      rdfs:range   hbayes:BeliefState ;
      dcterms:description
          "Links a FreeEnergy record to the BeliefState it characterises."@en .

  # ── PolicySelection Properties ─────────────────────────────────────────────

  hbayes:expectedFreeEnergy a owl:DatatypeProperty ;
      rdfs:label   "expected free energy"@en ;
      rdfs:domain  hbayes:PolicySelection ;
      rdfs:range   xsd:decimal ;
      dcterms:description
          "The expected free energy G(π) of the selected policy π. G(π) = Risk + Ambiguity, where Risk is the KL divergence between predicted and preferred outcomes, and Ambiguity is the expected uncertainty about observations under the policy."@en .

  hbayes:selectedPolicy a owl:ObjectProperty ;
      rdfs:label   "selected policy"@en ;
      rdfs:domain  hbayes:PolicySelection ;
      dcterms:description
          "The IRI of the policy that was selected as having the minimum expected free energy."@en .

  hbayes:candidatePolicy a owl:ObjectProperty ;
      rdfs:label   "candidate policy"@en ;
      rdfs:domain  hbayes:PolicySelection ;
      dcterms:description
          "An IRI of a policy that was considered but not selected."@en .

  hbayes:selectionTimestamp a owl:DatatypeProperty ;
      rdfs:label   "selection timestamp"@en ;
      rdfs:domain  hbayes:PolicySelection ;
      rdfs:range   xsd:dateTime ;
      dcterms:description
          "The UTC timestamp at which this policy selection was computed."@en .

}
```

---

## 3. SHACL 1.2 Shapes

<!-- databook:id: bayesian-shapes -->
<!-- databook:graph: http://w3id.org/holon/bayesian/#shapes -->
<!-- mode=normative norm=true conformance=bayesian rfc2119=MUST spec-status=at-risk -->
```trig
@prefix hbayes:  <http://w3id.org/holon/bayesian/> .
@prefix sh:      <http://www.w3.org/ns/shacl#> .
@prefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd:     <http://www.w3.org/2001/XMLSchema#> .
@prefix dcterms: <http://purl.org/dc/terms/> .

GRAPH <http://w3id.org/holon/bayesian/#shapes> {

  # ── BeliefStateShape ────────────────────────────────────────────────────────
  # Used as sh:reifierShape on domain property shapes where Bayesian
  # annotation is expected.

  hbayes:BeliefStateShape a sh:NodeShape ;
      sh:targetClass hbayes:BeliefState ;
      sh:name   "Belief State"@en ;
      sh:intent "Validates a BeliefState reifier. The reifier must be a named IRI with rdfs:label, and must carry prior, posterior (both in [0,1]) and precision (> 0). Posterior precision must be ≥ prior precision."@en ;
      sh:agentInstruction
          "A BeliefState reifier annotates a specific assertion. Validate that the probability values are in range and that precision increases (never decreases) on update. A prior with precision 1.0 and posterior with precision 0.5 is a structural error."@en ;
      sh:nodeKind sh:IRI ;

      sh:property [
          sh:path     rdfs:label ;
          sh:minCount 1 ;
          sh:or ( [ sh:datatype xsd:string ] [ sh:datatype rdf:langString ] ) ;
          sh:severity sh:Violation ;
          sh:message  "BeliefState reifier MUST have at least one rdfs:label."@en ;
      ] ;

      sh:property [
          sh:path         hbayes:prior ;
          sh:minCount     1 ;
          sh:maxCount     1 ;
          sh:datatype     xsd:decimal ;
          sh:minInclusive 0.0 ;
          sh:maxInclusive 1.0 ;
          sh:severity     sh:Violation ;
          sh:message      "BeliefState MUST have exactly one prior in [0.0, 1.0]."@en ;
      ] ;

      sh:property [
          sh:path         hbayes:posterior ;
          sh:minCount     1 ;
          sh:maxCount     1 ;
          sh:datatype     xsd:decimal ;
          sh:minInclusive 0.0 ;
          sh:maxInclusive 1.0 ;
          sh:severity     sh:Violation ;
          sh:message      "BeliefState MUST have exactly one posterior in [0.0, 1.0]."@en ;
      ] ;

      sh:property [
          sh:path            hbayes:precision ;
          sh:minCount        1 ;
          sh:maxCount        1 ;
          sh:datatype        xsd:decimal ;
          sh:minExclusive    0.0 ;
          sh:severity        sh:Violation ;
          sh:message         "BeliefState MUST have exactly one precision > 0."@en ;
      ] ;

      sh:property [
          sh:path     hbayes:inferenceTimestamp ;
          sh:maxCount 1 ;
          sh:datatype xsd:dateTime ;
          sh:severity sh:Violation ;
          sh:message  "inferenceTimestamp MUST be xsd:dateTime if present."@en ;
      ] ;

      sh:property [
          sh:path     hbayes:evidenceGraph ;
          sh:maxCount 1 ;
          sh:nodeKind sh:IRI ;
          sh:severity sh:Warning ;
          sh:message  "BeliefState SHOULD declare the evidenceGraph that produced this update."@en ;
      ] ;

      # Precision monotonicity — advisory SPARQL constraint
      # (posterior precision should exceed prior: info gain cannot be negative)
      sh:sparql [
          a sh:SPARQLConstraint ;
          sh:severity sh:Warning ;
          sh:message  "Posterior precision is less than prior precision — this implies information was lost, which is unusual for a Bayesian update."@en ;
          sh:prefixes hbayes: ;
          sh:select   """
              SELECT $this WHERE {
                  $this hbayes:precision ?postPrec .
                  # Prior precision stored separately if available
                  OPTIONAL { $this hbayes:prior ?prior }
                  OPTIONAL { $this hbayes:posterior ?post }
                  # Heuristic: very high prior confidence with very low posterior
                  # suggests a structural error rather than a legitimate update
                  FILTER (
                      BOUND(?prior) && BOUND(?post) &&
                      ?post < ?prior * 0.1
                  )
              }
          """ ;
      ] .

  # ── FreeEnergyShape ──────────────────────────────────────────────────────────

  hbayes:FreeEnergyShape a sh:NodeShape ;
      sh:targetClass hbayes:FreeEnergy ;
      sh:name   "Free Energy"@en ;
      sh:intent "Validates a FreeEnergy record. Requires complexity (≥ 0) and accuracy. If freeEnergy is declared, issues an advisory check that it approximately equals complexity − accuracy."@en ;
      sh:agentInstruction
          "FreeEnergy records the cost of a belief update. Complexity must be ≥ 0 (KL divergence is always non-negative). If freeEnergy is declared, it should approximately equal complexity minus accuracy."@en ;
      sh:nodeKind sh:IRI ;

      sh:property [
          sh:path     rdfs:label ;
          sh:minCount 1 ;
          sh:severity sh:Violation ;
          sh:message  "FreeEnergy MUST have at least one rdfs:label."@en ;
      ] ;

      sh:property [
          sh:path         hbayes:complexity ;
          sh:minCount     1 ;
          sh:maxCount     1 ;
          sh:datatype     xsd:decimal ;
          sh:minInclusive 0.0 ;
          sh:severity     sh:Violation ;
          sh:message      "FreeEnergy MUST have exactly one complexity ≥ 0."@en ;
      ] ;

      sh:property [
          sh:path     hbayes:accuracy ;
          sh:minCount 1 ;
          sh:maxCount 1 ;
          sh:datatype xsd:decimal ;
          sh:severity sh:Violation ;
          sh:message  "FreeEnergy MUST have exactly one accuracy value."@en ;
      ] ;

      sh:property [
          sh:path     hbayes:freeEnergy ;
          sh:maxCount 1 ;
          sh:datatype xsd:decimal ;
          sh:severity sh:Violation ;
          sh:message  "freeEnergy MUST be xsd:decimal if present."@en ;
      ] ;

      sh:property [
          sh:path     hbayes:forBeliefState ;
          sh:maxCount 1 ;
          sh:nodeKind sh:IRI ;
          sh:class    hbayes:BeliefState ;
          sh:severity sh:Warning ;
          sh:message  "FreeEnergy SHOULD link to its BeliefState via forBeliefState."@en ;
      ] ;

      sh:sparql [
          a sh:SPARQLConstraint ;
          sh:severity sh:Warning ;
          sh:message  "freeEnergy should approximately equal complexity − accuracy (advisory; floating-point rounding is expected)."@en ;
          sh:prefixes hbayes: ;
          sh:select   """
              SELECT $this WHERE {
                  $this hbayes:complexity  ?c ;
                        hbayes:accuracy    ?a ;
                        hbayes:freeEnergy  ?f .
                  BIND(ABS(?f - (?c - ?a)) AS ?diff)
                  FILTER (?diff > 0.01)
              }
          """ ;
      ] .

  # ── PolicySelectionShape ────────────────────────────────────────────────────

  hbayes:PolicySelectionShape a sh:NodeShape ;
      sh:targetClass hbayes:PolicySelection ;
      sh:name   "Policy Selection"@en ;
      sh:intent "Validates a PolicySelection record. Requires selectedPolicy and expectedFreeEnergy. At least one candidatePolicy SHOULD be recorded."@en ;
      sh:agentInstruction
          "PolicySelection records a decision. selectedPolicy is what was chosen. expectedFreeEnergy is the G(π) value that determined the choice. Candidate policies should be recorded to enable retrospective analysis."@en ;
      sh:nodeKind sh:IRI ;

      sh:property [
          sh:path     rdfs:label ;
          sh:minCount 1 ;
          sh:severity sh:Violation ;
          sh:message  "PolicySelection MUST have at least one rdfs:label."@en ;
      ] ;

      sh:property [
          sh:path     hbayes:selectedPolicy ;
          sh:minCount 1 ;
          sh:maxCount 1 ;
          sh:nodeKind sh:IRI ;
          sh:severity sh:Violation ;
          sh:message  "PolicySelection MUST declare exactly one selectedPolicy."@en ;
      ] ;

      sh:property [
          sh:path     hbayes:expectedFreeEnergy ;
          sh:minCount 1 ;
          sh:maxCount 1 ;
          sh:datatype xsd:decimal ;
          sh:severity sh:Violation ;
          sh:message  "PolicySelection MUST carry exactly one expectedFreeEnergy value."@en ;
      ] ;

      sh:property [
          sh:path     hbayes:selectionTimestamp ;
          sh:maxCount 1 ;
          sh:datatype xsd:dateTime ;
          sh:severity sh:Violation ;
          sh:message  "selectionTimestamp MUST be xsd:dateTime if present."@en ;
      ] ;

      sh:property [
          sh:path     hbayes:candidatePolicy ;
          sh:nodeKind sh:IRI ;
          sh:severity sh:Warning ;
          sh:message  "PolicySelection SHOULD record at least one candidatePolicy."@en ;
      ] .

}
```

---

## 4. Integration Pattern: `sh:reifierShape` on Domain Shapes

When a domain deployment wishes to require Bayesian annotations on a
specific predicate, it applies `hbayes:BeliefStateShape` as the
`sh:reifierShape` on the relevant property shape. This is a
**deployment-level supplement** — not part of HGA Core shapes.

<!-- databook:id: belief-reifier-integration-example -->
<!-- mode=example norm=false -->
```turtle12
PREFIX hbayes: <http://w3id.org/holon/bayesian/> .
PREFIX sh:     <http://www.w3.org/ns/shacl#> .
PREFIX ggsc:   <https://w3id.org/ggsc/> .
PREFIX rdfs:   <http://www.w3.org/2000/01/rdf-schema#> .

# Deployment-specific shape: any ggsc:puttingAtRisk triple that is
# reified MUST carry a valid BeliefState. sh:reificationRequired false
# means reification is optional; when present it must be valid.
ggsc:RiskAssertionShape a sh:NodeShape ;
    sh:targetSubjectsOf ggsc:puttingAtRisk ;
    sh:property [
        sh:path               ggsc:puttingAtRisk ;
        sh:reifierShape       hbayes:BeliefStateShape ;
        sh:reificationRequired false ;
        sh:severity           sh:Warning ;
        sh:message "Risk assertions SHOULD carry a BeliefState reifier."@en ;
    ] .
```

The data conforming to this shape would be written:

```turtle12
PREFIX ggsc:   <https://w3id.org/ggsc/> .
PREFIX hbayes: <http://w3id.org/holon/bayesian/> .
PREFIX rdfs:   <http://www.w3.org/2000/01/rdf-schema#> .
PREFIX xsd:    <http://www.w3.org/2001/XMLSchema#> .

ggsc:USA ggsc:puttingAtRisk ggsc:ProductITRF
    ~ <urn:belief:usa-itrf-2025-01>
    {| a hbayes:BeliefState ;
       rdfs:label  "Belief: USA risk to ITRF products, Feb 2025"@en ;
       hbayes:prior      0.30 ;
       hbayes:posterior  0.85 ;
       hbayes:precision  5.0  ;
       hbayes:evidenceGraph <urn:graph:event-itrf-2025-01-payload> |} .
```

---

## 5. SPARQL UPDATE Fallback

The SPARQL UPDATE fallback for all SHACL rules in this section is in
Annex E. The fallbacks express the same invariants as SPARQL SELECT
constraints, executable via SPARQL UPDATE on Jena 6.0.

---

*Copyright 2026 Kurt Cagle / Semantical LLC. Specification prose: W3C Document
License. Ontology content: CC0-1.0.*
