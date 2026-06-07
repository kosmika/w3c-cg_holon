---
id: http://w3id.org/holon/spec/events
title: "HGA Event Envelopes — Taxonomy, Vocabulary and Shapes"
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
domain: http://w3id.org/holon/event/
subject:
  - event envelope
  - assertion event
  - command event
  - observation event
  - SHACL 1.2
  - RDF 1.2 reification
  - temporal metadata
description: >
  Normative SKOS event type taxonomy, OWL vocabulary declarations, and
  SHACL 1.2 closed envelope shapes for the hev: namespace. Defines twelve
  event classes (HolonEvent, AssertionEvent, CommandEvent, ObservationEvent,
  CommandRejected, ViolationEvent, OutOfBounds, ExpansionRequest,
  UnresolvableTarget, PortalTraversalEvent, PortalTraversalDenied,
  RemoteEventEnvelope). Envelope shapes are sh:closed true. Payload links
  are typed IRI pointers; payload content is governed by the target holon's
  boundary shapes. Demonstrates SHACL 1.2 sh:reifierShape on temporal
  property annotations. Normative event ordering policy is stated.
spec:
  document-iri: http://w3id.org/holon/spec/
  section-number: "Pass C — §1"
  status: "Editor's Draft"
  normative: true
  conformance-class:
    - core
  rfc2119: true
  part-of: http://w3id.org/holon/spec/
graph:
  namespace: http://w3id.org/holon/event/
  rdf_version: "1.2"
  turtle_version: "1.2"
  reification: true
shapes:
  - http://w3id.org/holon/event/#shapes
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

## 1. Event Architecture

### 1.1 The Two-Layer Event Model

Every input to the HGA pipeline is converted into an event. Every event has
two distinct layers that MUST NOT be conflated:

**Envelope layer** — defined by `hev:` vocabulary. Carries routing metadata
(`hev:targetHolon`), temporal metadata (`hev:assertedAt`, `hev:receivedAt`),
provenance links (`prov:wasGeneratedBy`), and event classification
(`rdf:type`). Envelope shapes are `sh:closed true` — no unexpected properties
are permitted on the event IRI itself. SHACL shapes in this section validate
the envelope.

**Payload layer** — domain-specific triples carried by the event. Linked
from the envelope via a typed payload property (`hev:assertionPayload`,
`hev:commandPayload`, `hev:observationPayload`). The payload link is a
named IRI pointer to a named graph or resource. What is valid in the payload
is governed by the target holon's `holon:boundary` shapes, not by HGA
infrastructure shapes.

### 1.2 Event Ordering Policy

<!-- databook:id: event-ordering-policy -->
<!-- mode=normative norm=true conformance=core rfc2119=MUST -->
```turtle
@prefix hspec:   <http://w3id.org/holon/spec/> .
@prefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#> .
@prefix dcterms: <http://purl.org/dc/terms/> .

hspec:eventOrderingPolicy a hspec:ArchitecturalDecision ;
    rdfs:label "Event Ordering Policy"@en ;
    dcterms:description """
    (1) Implementations MUST NOT assume events arrive in hev:assertedAt order.
        Out-of-order delivery is a normal condition in distributed systems and
        MUST be handled without error.

    (2) hev:assertedAt is the time the described fact was true in the world.
        hev:receivedAt is the time the HGA server processed the event.
        These MUST be stored as distinct values; conflating them is a violation.

    (3) The constraint hev:assertedAt ≤ hev:receivedAt is normative for
        AssertionEvents. A receivedAt timestamp earlier than assertedAt
        indicates a clock skew or forgery condition and MUST generate a
        hev:ViolationEvent.

    (4) hev:CommandEvent carries hev:expiresAt and hev:validAsOf. A command
        MUST be rejected (generating hev:CommandRejected) if:
        - hev:receivedAt > hev:expiresAt (command has expired), or
        - The scene graph state does not satisfy hev:validAsOf preconditions.

    (5) hev:eventSequence is an optional integer providing relative ordering
        within a correlated batch. Processors MAY use it to resolve ordering
        ambiguities within the same hev:correlationId. It is not a global
        sequence counter and MUST NOT be used across correlation boundaries.
    """@en .
```

### 1.3 Reification Pattern

Any triple in an HGA document MAY be annotated via Turtle 1.2 reification.
When a triple is reified, the reifier MUST be a named IRI (not a blank node)
and MUST carry an `rdfs:label`. `sh:reifierShape` constraints enforce this
on temporal property shapes throughout this section.

The canonical Turtle 1.2 reification form is the **subjectAnnotation**
pattern specified in the Turtle 1.2 Working Draft §2.11:

```
subject predicate object ~ <reifierIRI> {| pred obj ; pred obj |} .
```

The `~` names the reifier IRI. The `{| |}` annotation block carries
properties of that reifier. Both the subject triple and all annotation
triples are asserted in a single statement.

> **Scope note:** `holon:concernLevel` annotates **domain assertions** in
> payload graphs — claims about states of affairs in the world. It MUST NOT
> be placed on envelope properties such as timestamps. For domain assertion
> annotation see Pass D §1 (Bayesian and Active Inference) and Example 2 below.

**Example 1 — Temporal envelope annotation** (labelling a temporal property
reifier; the reifier satisfies `hev:TemporalReifierShape` defined in §4):

<!-- databook:id: temporal-reification-example -->
<!-- mode=example norm=false -->
```turtle12
VERSION "1.2"
PREFIX hev:  <http://w3id.org/holon/event/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX xsd:  <http://www.w3.org/2001/XMLSchema#>

# Envelope triples without the annotated property:
<urn:event:abc-123> a hev:AssertionEvent ;
    hev:targetHolon      <https://server.example.org/holons/patient-007> ;
    hev:receivedAt       "2026-06-04T09:00:05Z"^^xsd:dateTime ;
    hev:assertionPayload <urn:graph:event-abc-123-payload> .

# assertedAt stated separately so the reification annotation follows inline.
# ~ <iri> names the reifier; {| |} annotates it.
<urn:event:abc-123> hev:assertedAt "2026-06-04T09:00:00Z"^^xsd:dateTime
    ~ <urn:ann:abc-123-assertedAt>
    {| rdfs:label "assertedAt annotation for event abc-123"@en |} .
```

**Example 2 — Domain assertion annotation** (concern level on a payload
assertion; this pattern belongs in the payload graph, not the event
envelope graph):

<!-- databook:id: domain-assertion-reification-example -->
<!-- mode=example norm=false -->
```turtle12
VERSION "1.2"
PREFIX holon: <http://w3id.org/holon/>
PREFIX rdfs:  <http://www.w3.org/2000/01/rdf-schema#>
PREFIX hev:   <http://w3id.org/holon/event/>
PREFIX xsd:   <http://www.w3.org/2001/XMLSchema#>

# In a domain payload graph — annotating a risk assertion.
# The ~ <iri> names the reifier; {| |} carries its annotation triples.
:countryX :puttingAtRisk :productY
    ~ <urn:ann:countryx-producty-risk-2026>
    {| rdfs:label "Risk annotation: countryX supply chain risk to productY"@en ;
       holon:concernLevel holon:HighConcern ;
       hev:assertedAt     "2026-06-04T00:00:00Z"^^xsd:dateTime |} .
```

---

## 2. Event Type SKOS Taxonomy

The `hev:EventTypeScheme` classifies HGA event types into a four-branch
hierarchy: declarative (fact assertions), imperative (instructions),
observational (sensory input), and system (pipeline-generated). All event
classes defined in §3 MUST appear as `skos:Concept` instances in this scheme.

<!-- databook:id: event-type-skos -->
<!-- databook:graph: http://w3id.org/holon/event/#skos -->
<!-- mode=normative norm=true conformance=core rfc2119=MUST -->
```trig
@prefix hev:     <http://w3id.org/holon/event/> .
@prefix skos:    <http://www.w3.org/2004/02/skos/core#> .
@prefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix sh:      <http://www.w3.org/ns/shacl#> .
@prefix xsd:     <http://www.w3.org/2001/XMLSchema#> .

GRAPH <http://w3id.org/holon/event/#skos> {

  hev:EventTypeScheme a skos:ConceptScheme ;
      rdfs:label     "HGA Event Type Classification"@en ;
      skos:prefLabel "HGA Event Type Classification"@en ;
      dcterms:title  "Holon Graph Architecture Event Type Vocabulary"@en ;
      dcterms:description
          "Classifies all HGA event types into four top-level branches: declarative events (assertions of fact), imperative events (instructions to act), observational events (sensory and measurement input), and system events (pipeline-generated responses). Each branch contains event class IRIs that are both owl:Class instances and skos:Concept members of this scheme."@en ;
      dcterms:created "2026-06-04"^^xsd:date ;
      sh:agentInstruction
          "Use this taxonomy to understand the intention of an event. Declarative events tell you what happened. Imperative events tell you what to do. Observational events carry sensory or measurement input. System events tell you what the pipeline did in response."@en ;
      skos:hasTopConcept
          hev:DeclarativeEvent ,
          hev:ImperativeEvent ,
          hev:ObservationalEvent ,
          hev:SystemEvent .

  # ── Declarative branch ──────────────────────────────────────────────────

  hev:DeclarativeEvent a skos:Concept ;
      skos:inScheme     hev:EventTypeScheme ;
      skos:topConceptOf hev:EventTypeScheme ;
      rdfs:label        "Declarative Event"@en ;
      skos:prefLabel    "Declarative Event"@en ;
      skos:notation     "DECLARATIVE" ;
      skos:definition
          "Events that assert a fact about the world. The world has changed; the holon graph is updated to reflect it. Declarative events are processed in pipeline order: validate → log → update scene → project."@en ;
      skos:narrower     hev:AssertionEvent .

  hev:AssertionEvent a skos:Concept ;
      skos:inScheme     hev:EventTypeScheme ;
      skos:broader      hev:DeclarativeEvent ;
      rdfs:label        "Assertion Event"@en ;
      skos:prefLabel    "Assertion Event"@en ;
      skos:notation     "ASSERT" ;
      skos:definition
          "A declarative event asserting that some fact is true. A valid AssertionEvent mutates the scene graph. An invalid one (SHACL violation) generates a ViolationEvent but does NOT mutate the scene graph."@en .

  # ── Imperative branch ────────────────────────────────────────────────────

  hev:ImperativeEvent a skos:Concept ;
      skos:inScheme     hev:EventTypeScheme ;
      skos:topConceptOf hev:EventTypeScheme ;
      rdfs:label        "Imperative Event"@en ;
      skos:prefLabel    "Imperative Event"@en ;
      skos:notation     "IMPERATIVE" ;
      skos:definition
          "Events that instruct the holon to do something. Commands are time-sensitive — they carry expiry metadata and may be rejected if the scene state does not match preconditions. Processing order: validate → authorise → execute → assert → log → update → project."@en ;
      skos:narrower     hev:CommandEvent .

  hev:CommandEvent a skos:Concept ;
      skos:inScheme     hev:EventTypeScheme ;
      skos:broader      hev:ImperativeEvent ;
      rdfs:label        "Command Event"@en ;
      skos:prefLabel    "Command Event"@en ;
      skos:notation     "COMMAND" ;
      skos:definition
          "An imperative event instructing the target holon to execute an action. A valid, authorised command produces an AssertionEvent as its output. An invalid or unauthorised command produces CommandRejected."@en .

  # ── Observational branch ─────────────────────────────────────────────────

  hev:ObservationalEvent a skos:Concept ;
      skos:inScheme     hev:EventTypeScheme ;
      skos:topConceptOf hev:EventTypeScheme ;
      rdfs:label        "Observational Event"@en ;
      skos:prefLabel    "Observational Event"@en ;
      skos:notation     "OBSERVATIONAL" ;
      skos:definition
          "Events carrying sensory or observational input from the world. The observation payload is domain-specific; HGA constrains only the envelope. Observational events drive the Bayesian update cycle in HGA Bayesian deployments."@en ;
      skos:narrower     hev:ObservationEvent .

  hev:ObservationEvent a skos:Concept ;
      skos:inScheme     hev:EventTypeScheme ;
      skos:broader      hev:ObservationalEvent ;
      rdfs:label        "Observation Event"@en ;
      skos:prefLabel    "Observation Event"@en ;
      skos:notation     "OBSERVE" ;
      skos:definition
          "An observational event carrying sensory or measurement data. The HGA envelope wraps a domain-specific observation payload. Domain deployments provide supplementary shapes (e.g. SOSA mapping, see Annex B) that govern the payload structure."@en .

  # ── System branch ────────────────────────────────────────────────────────

  hev:SystemEvent a skos:Concept ;
      skos:inScheme     hev:EventTypeScheme ;
      skos:topConceptOf hev:EventTypeScheme ;
      rdfs:label        "System Event"@en ;
      skos:prefLabel    "System Event"@en ;
      skos:notation     "SYSTEM" ;
      skos:definition
          "Events generated by the HGA pipeline itself in response to other events or conditions. System events are never user-initiated. They are always the result of a prior event triggering a pipeline response."@en ;
      skos:narrower
          hev:CommandRejected ,
          hev:ViolationEvent ,
          hev:OutOfBounds ,
          hev:ExpansionRequest ,
          hev:UnresolvableTarget ,
          hev:PortalTraversalEvent ,
          hev:PortalTraversalDenied ,
          hev:RemoteEventEnvelope .

  hev:CommandRejected a skos:Concept ;
      skos:inScheme  hev:EventTypeScheme ;
      skos:broader   hev:SystemEvent ;
      rdfs:label     "Command Rejected"@en ;
      skos:notation  "CMD-REJECTED" ;
      skos:definition
          "Generated when a CommandEvent fails validation, authorisation, expiry check, or precondition check. The scene graph is NOT mutated. Carries rejection reason and a causedBy link to the original command."@en .

  hev:ViolationEvent a skos:Concept ;
      skos:inScheme  hev:EventTypeScheme ;
      skos:broader   hev:SystemEvent ;
      rdfs:label     "Violation Event"@en ;
      skos:notation  "VIOLATION" ;
      skos:definition
          "Generated when SHACL validation of an event payload produces sh:Violation severity results. The scene graph is NOT mutated. The SHACL validation report is carried in violationReport."@en .

  hev:OutOfBounds a skos:Concept ;
      skos:inScheme  hev:EventTypeScheme ;
      skos:broader   hev:SystemEvent ;
      rdfs:label     "Out of Bounds"@en ;
      skos:notation  "OUT-OF-BOUNDS" ;
      skos:definition
          "Generated when an agent attempts an operation outside the declared boundary of a holon — for example, asserting a triple whose predicate is not in scope for the target holon."@en .

  hev:ExpansionRequest a skos:Concept ;
      skos:inScheme  hev:EventTypeScheme ;
      skos:broader   hev:SystemEvent ;
      rdfs:label     "Expansion Request"@en ;
      skos:notation  "EXPAND" ;
      skos:definition
          "Generated when an agent reaches the edge of the mapped territory — the current holon graph does not contain information needed to proceed. Signals that the holon boundary or registry should be extended."@en .

  hev:UnresolvableTarget a skos:Concept ;
      skos:inScheme  hev:EventTypeScheme ;
      skos:broader   hev:SystemEvent ;
      rdfs:label     "Unresolvable Target"@en ;
      skos:notation  "UNRESOLVABLE" ;
      skos:definition
          "Generated when hev:targetHolon cannot be resolved — the IRI is not registered locally and cannot be forwarded to a known remote server. Never generated silently; always explicit."@en .

  hev:PortalTraversalEvent a skos:Concept ;
      skos:inScheme  hev:EventTypeScheme ;
      skos:broader   hev:SystemEvent ;
      rdfs:label     "Portal Traversal Event"@en ;
      skos:notation  "TRAVERSE" ;
      skos:definition
          "Generated when an agent successfully traverses a portal. Records the portal, agent, and routing outcome. Links to the PortalTraversalRecord created by the traversal."@en .

  hev:PortalTraversalDenied a skos:Concept ;
      skos:inScheme  hev:EventTypeScheme ;
      skos:broader   hev:SystemEvent ;
      rdfs:label     "Portal Traversal Denied"@en ;
      skos:notation  "TRAVERSE-DENIED" ;
      skos:definition
          "Generated when a portal traversal attempt is denied by activation condition or ODRL policy. Records the failure mode and links to the PortalTraversalRecord."@en .

  hev:RemoteEventEnvelope a skos:Concept ;
      skos:inScheme  hev:EventTypeScheme ;
      skos:broader   hev:SystemEvent ;
      rdfs:label     "Remote Event Envelope"@en ;
      skos:notation  "REMOTE" ;
      skos:definition
          "A wrapper event for forwarding a holon event to a remote server via DataBook messaging. Used in place of SPARQL SERVICE federation (v1 constraint). Carries the original event DataBook as its payload."@en .

}
```

---

## 3. Event Vocabulary Declarations

<!-- databook:id: event-vocabulary -->
<!-- databook:graph: http://w3id.org/holon/event/#vocabulary -->
<!-- mode=normative norm=true conformance=core rfc2119=MUST -->
```trig
@prefix hev:     <http://w3id.org/holon/event/> .
@prefix holon:   <http://w3id.org/holon/> .
@prefix hspec:   <http://w3id.org/holon/spec/> .
@prefix owl:     <http://www.w3.org/2002/07/owl#> .
@prefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix xsd:     <http://www.w3.org/2001/XMLSchema#> .
@prefix sh:      <http://www.w3.org/ns/shacl#> .
@prefix prov:    <http://www.w3.org/ns/prov#> .
@prefix skos:    <http://www.w3.org/2004/02/skos/core#> .

GRAPH <http://w3id.org/holon/event/#vocabulary> {

  # ── Event Classes ─────────────────────────────────────────────────────────

  hev:HolonEvent a owl:Class ;
      rdfs:label   "Holon Event"@en ;
      rdfs:comment "Abstract base class for all HGA events. Every event MUST have a named IRI, a targetHolon, assertedAt, and receivedAt timestamps, and a provenance wasGeneratedBy link."@en ;
      sh:agentInstruction
          "Every event you encounter is a HolonEvent. Check targetHolon to know where it is addressed, assertedAt to know when it happened in the world, and receivedAt to know when HGA processed it. The event type tells you how to route it."@en ;
      rdfs:subClassOf prov:Entity .  # non-normative OWL 2 RL

  hev:AssertionEvent a owl:Class ;
      rdfs:label   "Assertion Event"@en ;
      rdfs:comment "A declarative event asserting that some fact is or was true. If SHACL validation passes, the payload is committed to the scene graph. If it fails, a ViolationEvent is generated instead."@en ;
      sh:agentInstruction
          "An AssertionEvent says something happened. Its payload is the new state to commit to the scene graph. Validate first, then commit."@en ;
      rdfs:subClassOf hev:HolonEvent .

  hev:CommandEvent a owl:Class ;
      rdfs:label   "Command Event"@en ;
      rdfs:comment "An imperative event instructing the target holon to execute an action. Time-sensitive: carries expiresAt and validAsOf. A valid, authorised, unexpired command produces an AssertionEvent as output."@en ;
      sh:agentInstruction
          "A CommandEvent is an instruction. Check expiry first (expiresAt vs receivedAt). Then validate. Then authorise. Only then execute. A successful execution generates an AssertionEvent."@en ;
      rdfs:subClassOf hev:HolonEvent .

  hev:ObservationEvent a owl:Class ;
      rdfs:label   "Observation Event"@en ;
      rdfs:comment "An event carrying domain-specific observational or sensory data. The HGA infrastructure constrains only the envelope. Payload structure is governed by the target holon's boundary shapes."@en ;
      sh:agentInstruction
          "An ObservationEvent carries a domain-specific measurement or observation. Look at the target holon's boundary shapes to understand how to interpret the payload."@en ;
      rdfs:subClassOf hev:HolonEvent .

  hev:CommandRejected a owl:Class ;
      rdfs:label   "Command Rejected"@en ;
      rdfs:comment "Generated by the pipeline when a CommandEvent fails. Always carries a rejectionReason and a causedBy link to the original command. Never mutates the scene graph."@en ;
      sh:agentInstruction
          "A CommandRejected tells you why a command failed. Check rejectionReason for the specific failure mode. The causedBy link points to the original command."@en ;
      rdfs:subClassOf hev:HolonEvent .

  hev:ViolationEvent a owl:Class ;
      rdfs:label   "Violation Event"@en ;
      rdfs:comment "Generated by the SHACL validation stage when an event payload produces sh:Violation results. Carries the SHACL validation report. Scene graph mutation is blocked."@en ;
      sh:agentInstruction
          "A ViolationEvent is a validation failure log entry. The violationReport property links to the full SHACL report. The causedBy link points to the event that triggered validation."@en ;
      rdfs:subClassOf hev:HolonEvent .

  hev:OutOfBounds a owl:Class ;
      rdfs:label   "Out of Bounds"@en ;
      rdfs:comment "Generated when an operation targets resources or predicates outside the declared scope of a holon boundary."@en ;
      sh:agentInstruction
          "OutOfBounds means something tried to access territory that isn't mapped. The causedBy link points to the triggering event. This is a signal to consider expanding the holon's boundary."@en ;
      rdfs:subClassOf hev:HolonEvent .

  hev:ExpansionRequest a owl:Class ;
      rdfs:label   "Expansion Request"@en ;
      rdfs:comment "Generated when an agent reaches the edge of the mapped territory. Signals that the holon graph needs extension to accommodate the new context."@en ;
      sh:agentInstruction
          "An ExpansionRequest means the map is too small for the territory. The agent has encountered something the current holon graph cannot represent. Consider expanding the boundary or registering new holons."@en ;
      rdfs:subClassOf hev:HolonEvent .

  hev:UnresolvableTarget a owl:Class ;
      rdfs:label   "Unresolvable Target"@en ;
      rdfs:comment "Generated when hev:targetHolon cannot be resolved to a local or known remote holon. Never fails silently."@en ;
      sh:agentInstruction
          "An UnresolvableTarget means the address on the envelope doesn't match any known holon. Check targetHolon for the IRI that failed. This may indicate a stale reference or a missing registration."@en ;
      rdfs:subClassOf hev:HolonEvent .

  hev:PortalTraversalEvent a owl:Class ;
      rdfs:label   "Portal Traversal Event"@en ;
      rdfs:comment "Records a successful portal traversal. Links to the PortalTraversalRecord in the portal audit graph."@en ;
      sh:agentInstruction
          "A PortalTraversalEvent confirms that an agent crossed a portal. The traversalRecord link gives the full audit trail."@en ;
      rdfs:subClassOf hev:HolonEvent .

  hev:PortalTraversalDenied a owl:Class ;
      rdfs:label   "Portal Traversal Denied"@en ;
      rdfs:comment "Records a denied portal traversal attempt. Carries the specific failure mode and links to the PortalTraversalRecord."@en ;
      sh:agentInstruction
          "A PortalTraversalDenied means access was blocked. The denialReason and traversalRecord properties explain why."@en ;
      rdfs:subClassOf hev:HolonEvent .

  hev:RemoteEventEnvelope a owl:Class ;
      rdfs:label   "Remote Event Envelope"@en ;
      rdfs:comment "Wraps an event for forwarding to a remote holon server via DataBook messaging. Used in v1 in place of SPARQL federation. The wrapped event DataBook is the payload."@en ;
      sh:agentInstruction
          "A RemoteEventEnvelope is a forwarding wrapper. The remoteTarget is the destination server. The eventPayload is the DataBook to deliver. This is the v1 cross-server routing mechanism."@en ;
      rdfs:subClassOf hev:HolonEvent .

  # ── Core Envelope Properties ─────────────────────────────────────────────

  hev:targetHolon a owl:ObjectProperty ;
      rdfs:label   "target holon"@en ;
      rdfs:domain  hev:HolonEvent ;
      dcterms:description
          "The IRI of the holon to which this event is addressed. The server resolves this IRI: if local, dispatches to the in-process handler; if remote, wraps in RemoteEventEnvelope and forwards via DataBook messaging."@en .

  hev:assertedAt a owl:DatatypeProperty ;
      rdfs:label   "asserted at"@en ;
      rdfs:domain  hev:HolonEvent ;
      rdfs:range   xsd:dateTime ;
      dcterms:description
          "The UTC timestamp at which the described fact was true in the world. MUST be stored as a distinct value from hev:receivedAt. MAY differ from receivedAt due to delayed delivery, log replay, or out-of-order processing."@en ;
      sh:agentInstruction
          "assertedAt is when it happened. receivedAt is when we heard about it. Never confuse the two."@en .

  hev:receivedAt a owl:DatatypeProperty ;
      rdfs:label   "received at"@en ;
      rdfs:domain  hev:HolonEvent ;
      rdfs:range   xsd:dateTime ;
      dcterms:description
          "The UTC timestamp at which the HGA server processed this event. Set by the pipeline at ingestion; not supplied by the event source. MUST be ≥ hev:assertedAt for AssertionEvents."@en .

  hev:expiresAt a owl:DatatypeProperty ;
      rdfs:label   "expires at"@en ;
      rdfs:domain  hev:CommandEvent ;
      rdfs:range   xsd:dateTime ;
      dcterms:description
          "For CommandEvents: the UTC timestamp after which this command is considered stale and MUST be rejected. If hev:receivedAt > hev:expiresAt, the pipeline MUST generate hev:CommandRejected."@en .

  hev:validAsOf a owl:DatatypeProperty ;
      rdfs:label   "valid as of"@en ;
      rdfs:domain  hev:CommandEvent ;
      rdfs:range   xsd:dateTime ;
      dcterms:description
          "For CommandEvents: the UTC timestamp at which the scene graph state must be evaluated for precondition checking. Enables commands to assert 'execute this action against the state as of time T'."@en .

  hev:correlationId a owl:DatatypeProperty ;
      rdfs:label   "correlation ID"@en ;
      rdfs:domain  hev:HolonEvent ;
      rdfs:range   xsd:string ;
      dcterms:description
          "A string identifying a logical group of related events from the same operation or ingestion batch. Used to correlate events for debugging and audit. MUST be unique per operation but is not a global sequence counter."@en .

  hev:eventSequence a owl:DatatypeProperty ;
      rdfs:label   "event sequence"@en ;
      rdfs:domain  hev:HolonEvent ;
      rdfs:range   xsd:integer ;
      dcterms:description
          "Optional integer providing relative ordering within a correlated batch (same correlationId). MUST NOT be used to infer ordering across different correlationIds. Processors MAY use it to resolve ambiguities within a batch."@en .

  hev:causedBy a owl:ObjectProperty ;
      rdfs:label   "caused by"@en ;
      rdfs:domain  hev:HolonEvent ;
      rdfs:range   hev:HolonEvent ;
      dcterms:description
          "Links a system-generated event to the event that triggered it. Required on CommandRejected (→ the CommandEvent), ViolationEvent (→ the triggering AssertionEvent), and denial events."@en .

  # ── Payload Link Properties ───────────────────────────────────────────────

  hev:assertionPayload a owl:ObjectProperty ;
      rdfs:label   "assertion payload"@en ;
      rdfs:domain  hev:AssertionEvent ;
      dcterms:description
          "Named IRI of the payload graph or resource carrying the asserted triples. The payload is validated against the target holon's boundary shapes before scene graph mutation."@en .

  hev:commandPayload a owl:ObjectProperty ;
      rdfs:label   "command payload"@en ;
      rdfs:domain  hev:CommandEvent ;
      dcterms:description
          "Named IRI of the payload graph or resource carrying the command instructions. The payload structure is defined by the target holon's command schema (domain-specific)."@en .

  hev:observationPayload a owl:ObjectProperty ;
      rdfs:label   "observation payload"@en ;
      rdfs:domain  hev:ObservationEvent ;
      dcterms:description
          "Named IRI of the payload graph or resource carrying the domain-specific observation. HGA imposes no structure on this payload. Domain deployments provide supplementary shapes."@en .

  # ── System Event Properties ───────────────────────────────────────────────

  hev:rejectionReason a owl:DatatypeProperty ;
      rdfs:label   "rejection reason"@en ;
      rdfs:domain  hev:CommandRejected ;
      rdfs:range   xsd:string ;
      dcterms:description
          "Human-readable explanation of why the command was rejected. MUST distinguish between validation failure, authorisation failure, expiry, and precondition failure."@en .

  hev:violationReport a owl:ObjectProperty ;
      rdfs:label   "violation report"@en ;
      rdfs:domain  hev:ViolationEvent ;
      dcterms:description
          "Named IRI of the SHACL sh:ValidationReport produced by the validation stage. The report MUST be stored in the event graph and referenced here."@en .

  hev:traversalRecord a owl:ObjectProperty ;
      rdfs:label   "traversal record"@en ;
      rdfs:domain  hev:PortalTraversalEvent ;
      dcterms:description
          "Links a portal traversal event to its holon:PortalTraversalRecord in the portal audit graph."@en .

  hev:remoteTarget a owl:DatatypeProperty ;
      rdfs:label   "remote target"@en ;
      rdfs:domain  hev:RemoteEventEnvelope ;
      rdfs:range   xsd:anyURI ;
      dcterms:description
          "The base IRI of the destination holon server for a remote event forwarding. The server's HomeHolon vocabularyEndpoint is used to confirm server identity before forwarding."@en .

  hev:eventPayload a owl:ObjectProperty ;
      rdfs:label   "event payload"@en ;
      rdfs:domain  hev:RemoteEventEnvelope ;
      dcterms:description
          "Named IRI of the DataBook carrying the wrapped event for remote forwarding."@en .

}
```

---

## 4. SHACL 1.2 Event Envelope Shapes

All event envelope shapes are `sh:closed true`. The `sh:ignoredProperties`
list in each shape enumerates all permitted envelope-layer properties.
Payload link properties are included; payload content is not constrained.

<!-- databook:id: event-shapes -->
<!-- databook:graph: http://w3id.org/holon/event/#shapes -->
<!-- mode=normative norm=true conformance=core rfc2119=MUST -->
```trig
@prefix hev:     <http://w3id.org/holon/event/> .
@prefix holon:   <http://w3id.org/holon/> .
@prefix sh:      <http://www.w3.org/ns/shacl#> .
@prefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd:     <http://www.w3.org/2001/XMLSchema#> .
@prefix prov:    <http://www.w3.org/ns/prov#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix owl:     <http://www.w3.org/2002/07/owl#> .
@prefix rdf:     <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .

GRAPH <http://w3id.org/holon/event/#shapes> {

  # ── TemporalReifierShape ─────────────────────────────────────────────────
  # Used as sh:reifierShape on temporal property shapes.

  hev:TemporalReifierShape a sh:NodeShape ;
      sh:name    "Temporal Annotation Reifier"@en ;
      sh:intent  "Validates that any reifier on a temporal triple is a named IRI carrying rdfs:label. Enforces the normative reifier labelling requirement from §1.3."@en ;
      sh:agentInstruction
          "A temporal reifier annotates a timestamp triple. It must be a named IRI so it can be cited, and must carry rdfs:label so it can be understood."@en ;
      sh:nodeKind sh:IRI ;
      sh:property [
          sh:path     rdfs:label ;
          sh:minCount 1 ;
          sh:severity sh:Violation ;
          sh:message  "Temporal annotation reifier MUST have at least one rdfs:label."@en ;
      ] .

  # ── HolonEventShape (base, not directly targeted) ────────────────────────

  holon:HolonEventBaseShape a sh:NodeShape ;
      sh:name    "Holon Event Base"@en ;
      sh:intent  "Base shape used via sh:node in all event shapes. Validates the properties common to every event envelope: IRI identity, targetHolon, assertedAt, receivedAt, and provenance."@en ;
      sh:agentInstruction
          "The base event shape validates the minimum envelope. All event shapes must satisfy this before their specific requirements are checked."@en ;
      sh:nodeKind sh:IRI ;

      sh:property [
          sh:path       rdfs:label ;
          sh:minCount   1 ;
          sh:or ( [ sh:datatype xsd:string ] [ sh:datatype rdf:langString ] ) ;
          sh:severity   sh:Violation ;
          sh:message    "Every event MUST have at least one rdfs:label."@en ;
      ] ;

      sh:property [
          sh:path       hev:targetHolon ;
          sh:minCount   1 ;
          sh:maxCount   1 ;
          sh:nodeKind   sh:IRI ;
          sh:severity   sh:Violation ;
          sh:message    "Every event MUST have exactly one targetHolon IRI."@en ;
      ] ;

      sh:property [
          sh:path           hev:assertedAt ;
          sh:minCount       1 ;
          sh:maxCount       1 ;
          sh:datatype       xsd:dateTime ;
          sh:reifierShape   hev:TemporalReifierShape ;
          sh:reificationRequired false ;
          sh:severity       sh:Violation ;
          sh:message        "Every event MUST have exactly one xsd:dateTime assertedAt."@en ;
      ] ;

      sh:property [
          sh:path           hev:receivedAt ;
          sh:minCount       1 ;
          sh:maxCount       1 ;
          sh:datatype       xsd:dateTime ;
          sh:reifierShape   hev:TemporalReifierShape ;
          sh:reificationRequired false ;
          sh:severity       sh:Violation ;
          sh:message        "Every event MUST have exactly one xsd:dateTime receivedAt."@en ;
      ] ;

      sh:property [
          sh:path     prov:wasGeneratedBy ;
          sh:minCount 1 ;
          sh:nodeKind sh:IRI ;
          sh:severity sh:Violation ;
          sh:message  "Every event MUST carry prov:wasGeneratedBy linking to the generating activity."@en ;
      ] ;

      sh:property [
          sh:path     hev:correlationId ;
          sh:maxCount 1 ;
          sh:datatype xsd:string ;
          sh:severity sh:Violation ;
          sh:message  "correlationId MUST be xsd:string if present."@en ;
      ] ;

      sh:property [
          sh:path     hev:eventSequence ;
          sh:maxCount 1 ;
          sh:datatype xsd:integer ;
          sh:severity sh:Violation ;
          sh:message  "eventSequence MUST be xsd:integer if present."@en ;
      ] ;

      # receivedAt >= assertedAt invariant
      sh:sparql [
          a sh:SPARQLConstraint ;
          sh:severity sh:Violation ;
          sh:message  "receivedAt MUST NOT be earlier than assertedAt."@en ;
          sh:prefixes hev: ;
          sh:select   """
              SELECT $this WHERE {
                  $this hev:assertedAt  ?at ;
                        hev:receivedAt  ?rt .
                  FILTER (?rt < ?at)
              }
          """ ;
      ] .

  # ── AssertionEventShape ──────────────────────────────────────────────────

  hev:AssertionEventShape a sh:NodeShape ;
      sh:targetClass hev:AssertionEvent ;
      sh:name        "Assertion Event"@en ;
      sh:intent      "Validates the closed envelope of an AssertionEvent. Requires assertionPayload. Enforces sh:closed true over all envelope properties."@en ;
      sh:agentInstruction
          "An AssertionEvent says a fact is true. Validate the envelope (closed), then validate the payload against the target holon's boundary, then commit to the scene graph."@en ;
      sh:closed      true ;
      sh:ignoredProperties (
          rdf:type rdfs:label
          hev:targetHolon hev:assertedAt hev:receivedAt
          hev:correlationId hev:eventSequence
          prov:wasGeneratedBy prov:wasAttributedTo prov:wasDerivedFrom
          hev:assertionPayload
      ) ;
      sh:node holon:HolonEventBaseShape ;

      sh:property [
          sh:path     hev:assertionPayload ;
          sh:minCount 1 ;
          sh:maxCount 1 ;
          sh:nodeKind sh:IRI ;
          sh:severity sh:Violation ;
          sh:message  "AssertionEvent MUST have exactly one assertionPayload IRI."@en ;
      ] .

  # ── CommandEventShape ────────────────────────────────────────────────────

  hev:CommandEventShape a sh:NodeShape ;
      sh:targetClass hev:CommandEvent ;
      sh:name        "Command Event"@en ;
      sh:intent      "Validates the closed envelope of a CommandEvent. Requires commandPayload. Enforces expiry metadata and the receivedAt ≤ expiresAt constraint."@en ;
      sh:agentInstruction
          "A CommandEvent is an instruction with a deadline. Check expiresAt first. Then validate the envelope. Then validate the payload. Then authorise."@en ;
      sh:closed      true ;
      sh:ignoredProperties (
          rdf:type rdfs:label
          hev:targetHolon hev:assertedAt hev:receivedAt
          hev:expiresAt hev:validAsOf
          hev:correlationId hev:eventSequence
          prov:wasGeneratedBy prov:wasAttributedTo prov:wasDerivedFrom
          hev:commandPayload
      ) ;
      sh:node holon:HolonEventBaseShape ;

      sh:property [
          sh:path     hev:commandPayload ;
          sh:minCount 1 ;
          sh:maxCount 1 ;
          sh:nodeKind sh:IRI ;
          sh:severity sh:Violation ;
          sh:message  "CommandEvent MUST have exactly one commandPayload IRI."@en ;
      ] ;

      sh:property [
          sh:path           hev:expiresAt ;
          sh:maxCount       1 ;
          sh:datatype       xsd:dateTime ;
          sh:reifierShape   hev:TemporalReifierShape ;
          sh:reificationRequired false ;
          sh:severity       sh:Violation ;
          sh:message        "expiresAt MUST be xsd:dateTime if present."@en ;
      ] ;

      sh:property [
          sh:path     hev:validAsOf ;
          sh:maxCount 1 ;
          sh:datatype xsd:dateTime ;
          sh:severity sh:Violation ;
          sh:message  "validAsOf MUST be xsd:dateTime if present."@en ;
      ] ;

      sh:sparql [
          a sh:SPARQLConstraint ;
          sh:severity sh:Violation ;
          sh:message  "Command has expired: receivedAt is after expiresAt."@en ;
          sh:prefixes hev: ;
          sh:select   """
              SELECT $this WHERE {
                  $this hev:receivedAt ?rt ;
                        hev:expiresAt  ?ex .
                  FILTER (?rt > ?ex)
              }
          """ ;
      ] .

  # ── ObservationEventShape ────────────────────────────────────────────────

  hev:ObservationEventShape a sh:NodeShape ;
      sh:targetClass hev:ObservationEvent ;
      sh:name        "Observation Event"@en ;
      sh:intent      "Validates the closed envelope of an ObservationEvent. Requires observationPayload. The payload itself is domain-specific and not validated by this shape."@en ;
      sh:agentInstruction
          "An ObservationEvent wraps a domain measurement. The envelope is validated here. The payload is validated by the target holon's boundary shapes — consult those before processing the payload."@en ;
      sh:closed      true ;
      sh:ignoredProperties (
          rdf:type rdfs:label
          hev:targetHolon hev:assertedAt hev:receivedAt
          hev:correlationId hev:eventSequence
          prov:wasGeneratedBy prov:wasAttributedTo prov:wasDerivedFrom
          hev:observationPayload
      ) ;
      sh:node holon:HolonEventBaseShape ;

      sh:property [
          sh:path     hev:observationPayload ;
          sh:minCount 1 ;
          sh:maxCount 1 ;
          sh:nodeKind sh:IRI ;
          sh:severity sh:Violation ;
          sh:message  "ObservationEvent MUST have exactly one observationPayload IRI."@en ;
      ] .

  # ── CommandRejectedShape ─────────────────────────────────────────────────

  hev:CommandRejectedShape a sh:NodeShape ;
      sh:targetClass hev:CommandRejected ;
      sh:name        "Command Rejected"@en ;
      sh:intent      "Validates a CommandRejected system event. Requires causedBy (the original command) and rejectionReason."@en ;
      sh:agentInstruction
          "A CommandRejected event is an audit entry for a failed command. causedBy tells you which command failed. rejectionReason tells you why."@en ;
      sh:closed      true ;
      sh:ignoredProperties (
          rdf:type rdfs:label
          hev:targetHolon hev:assertedAt hev:receivedAt
          hev:correlationId hev:eventSequence
          prov:wasGeneratedBy prov:wasAttributedTo
          hev:causedBy hev:rejectionReason
      ) ;
      sh:node holon:HolonEventBaseShape ;

      sh:property [
          sh:path     hev:causedBy ;
          sh:minCount 1 ;
          sh:maxCount 1 ;
          sh:nodeKind sh:IRI ;
          sh:class    hev:CommandEvent ;
          sh:severity sh:Violation ;
          sh:message  "CommandRejected MUST have exactly one causedBy link to the original CommandEvent."@en ;
      ] ;

      sh:property [
          sh:path     hev:rejectionReason ;
          sh:minCount 1 ;
          sh:maxCount 1 ;
          sh:datatype xsd:string ;
          sh:severity sh:Violation ;
          sh:message  "CommandRejected MUST have exactly one rejectionReason string."@en ;
      ] .

  # ── ViolationEventShape ──────────────────────────────────────────────────

  hev:ViolationEventShape a sh:NodeShape ;
      sh:targetClass hev:ViolationEvent ;
      sh:name        "Violation Event"@en ;
      sh:intent      "Validates a ViolationEvent system event. Requires causedBy and violationReport."@en ;
      sh:agentInstruction
          "A ViolationEvent records a SHACL validation failure. The violationReport IRI gives the full report. The causedBy link points to the event whose payload failed validation."@en ;
      sh:closed      true ;
      sh:ignoredProperties (
          rdf:type rdfs:label
          hev:targetHolon hev:assertedAt hev:receivedAt
          hev:correlationId hev:eventSequence
          prov:wasGeneratedBy prov:wasAttributedTo
          hev:causedBy hev:violationReport
      ) ;
      sh:node holon:HolonEventBaseShape ;

      sh:property [
          sh:path     hev:causedBy ;
          sh:minCount 1 ;
          sh:maxCount 1 ;
          sh:nodeKind sh:IRI ;
          sh:severity sh:Violation ;
          sh:message  "ViolationEvent MUST have exactly one causedBy link."@en ;
      ] ;

      sh:property [
          sh:path     hev:violationReport ;
          sh:minCount 1 ;
          sh:maxCount 1 ;
          sh:nodeKind sh:IRI ;
          sh:severity sh:Violation ;
          sh:message  "ViolationEvent MUST link to a SHACL violationReport IRI."@en ;
      ] .

  # ── OutOfBoundsShape ─────────────────────────────────────────────────────

  hev:OutOfBoundsShape a sh:NodeShape ;
      sh:targetClass hev:OutOfBounds ;
      sh:name        "Out of Bounds"@en ;
      sh:closed      true ;
      sh:ignoredProperties (
          rdf:type rdfs:label
          hev:targetHolon hev:assertedAt hev:receivedAt
          hev:correlationId hev:eventSequence
          prov:wasGeneratedBy prov:wasAttributedTo
          hev:causedBy
      ) ;
      sh:node holon:HolonEventBaseShape ;
      sh:agentInstruction
          "OutOfBounds means a predicate or resource was used outside the holon's declared boundary. causedBy identifies what triggered it."@en ;

      sh:property [
          sh:path     hev:causedBy ;
          sh:minCount 1 ;
          sh:maxCount 1 ;
          sh:nodeKind sh:IRI ;
          sh:severity sh:Violation ;
          sh:message  "OutOfBounds MUST carry a causedBy link to the triggering event."@en ;
      ] .

  # ── ExpansionRequestShape ────────────────────────────────────────────────

  hev:ExpansionRequestShape a sh:NodeShape ;
      sh:targetClass hev:ExpansionRequest ;
      sh:name        "Expansion Request"@en ;
      sh:closed      true ;
      sh:ignoredProperties (
          rdf:type rdfs:label
          hev:targetHolon hev:assertedAt hev:receivedAt
          hev:correlationId hev:eventSequence
          prov:wasGeneratedBy prov:wasAttributedTo
          hev:causedBy
      ) ;
      sh:node holon:HolonEventBaseShape ;
      sh:agentInstruction
          "An ExpansionRequest signals that the map needs to grow. causedBy identifies what the agent encountered that exceeded the current scope."@en ;

      sh:property [
          sh:path     hev:causedBy ;
          sh:maxCount 1 ;
          sh:nodeKind sh:IRI ;
          sh:severity sh:Warning ;
          sh:message  "ExpansionRequest SHOULD carry a causedBy link to the triggering event."@en ;
      ] .

  # ── UnresolvableTargetShape ──────────────────────────────────────────────

  hev:UnresolvableTargetShape a sh:NodeShape ;
      sh:targetClass hev:UnresolvableTarget ;
      sh:name        "Unresolvable Target"@en ;
      sh:closed      true ;
      sh:ignoredProperties (
          rdf:type rdfs:label
          hev:targetHolon hev:assertedAt hev:receivedAt
          hev:correlationId hev:eventSequence
          prov:wasGeneratedBy prov:wasAttributedTo
          hev:causedBy
      ) ;
      sh:node holon:HolonEventBaseShape ;
      sh:agentInstruction
          "The targetHolon on the original event could not be resolved. causedBy points to the unroutable event."@en ;

      sh:property [
          sh:path     hev:causedBy ;
          sh:minCount 1 ;
          sh:maxCount 1 ;
          sh:nodeKind sh:IRI ;
          sh:severity sh:Violation ;
          sh:message  "UnresolvableTarget MUST carry a causedBy link to the unroutable event."@en ;
      ] .

  # ── PortalTraversalEventShape ────────────────────────────────────────────

  hev:PortalTraversalEventShape a sh:NodeShape ;
      sh:targetClass hev:PortalTraversalEvent ;
      sh:name        "Portal Traversal Event"@en ;
      sh:closed      true ;
      sh:ignoredProperties (
          rdf:type rdfs:label
          hev:targetHolon hev:assertedAt hev:receivedAt
          hev:correlationId hev:eventSequence
          prov:wasGeneratedBy prov:wasAttributedTo
          hev:traversalRecord
      ) ;
      sh:node holon:HolonEventBaseShape ;
      sh:agentInstruction
          "A successful portal traversal. The traversalRecord IRI gives the full audit trail."@en ;

      sh:property [
          sh:path     hev:traversalRecord ;
          sh:minCount 1 ;
          sh:maxCount 1 ;
          sh:nodeKind sh:IRI ;
          sh:severity sh:Violation ;
          sh:message  "PortalTraversalEvent MUST link to a traversalRecord."@en ;
      ] .

  # ── PortalTraversalDeniedShape ───────────────────────────────────────────

  hev:PortalTraversalDeniedShape a sh:NodeShape ;
      sh:targetClass hev:PortalTraversalDenied ;
      sh:name        "Portal Traversal Denied"@en ;
      sh:closed      true ;
      sh:ignoredProperties (
          rdf:type rdfs:label
          hev:targetHolon hev:assertedAt hev:receivedAt
          hev:correlationId hev:eventSequence
          prov:wasGeneratedBy prov:wasAttributedTo
          hev:causedBy hev:traversalRecord
      ) ;
      sh:node holon:HolonEventBaseShape ;
      sh:agentInstruction
          "A failed portal traversal. causedBy identifies the attempt. traversalRecord gives the audit record with the specific failure reason."@en ;

      sh:property [
          sh:path     hev:traversalRecord ;
          sh:minCount 1 ;
          sh:maxCount 1 ;
          sh:nodeKind sh:IRI ;
          sh:severity sh:Violation ;
          sh:message  "PortalTraversalDenied MUST link to a traversalRecord."@en ;
      ] ;

      sh:property [
          sh:path     hev:causedBy ;
          sh:minCount 1 ;
          sh:maxCount 1 ;
          sh:nodeKind sh:IRI ;
          sh:severity sh:Violation ;
          sh:message  "PortalTraversalDenied MUST carry a causedBy link to the attempted traversal event."@en ;
      ] .

  # ── RemoteEventEnvelopeShape ─────────────────────────────────────────────

  hev:RemoteEventEnvelopeShape a sh:NodeShape ;
      sh:targetClass hev:RemoteEventEnvelope ;
      sh:name        "Remote Event Envelope"@en ;
      sh:closed      true ;
      sh:ignoredProperties (
          rdf:type rdfs:label
          hev:targetHolon hev:assertedAt hev:receivedAt
          hev:correlationId hev:eventSequence
          prov:wasGeneratedBy prov:wasAttributedTo
          hev:remoteTarget hev:eventPayload
      ) ;
      sh:node holon:HolonEventBaseShape ;
      sh:agentInstruction
          "A RemoteEventEnvelope forwards an event to another server. remoteTarget is the destination. eventPayload is the DataBook to deliver."@en ;

      sh:property [
          sh:path     hev:remoteTarget ;
          sh:minCount 1 ;
          sh:maxCount 1 ;
          sh:nodeKind sh:IRI ;
          sh:severity sh:Violation ;
          sh:message  "RemoteEventEnvelope MUST have exactly one remoteTarget server IRI."@en ;
      ] ;

      sh:property [
          sh:path     hev:eventPayload ;
          sh:minCount 1 ;
          sh:maxCount 1 ;
          sh:nodeKind sh:IRI ;
          sh:severity sh:Violation ;
          sh:message  "RemoteEventEnvelope MUST have exactly one eventPayload DataBook IRI."@en ;
      ] .

}
```

---

## 5. Non-Normative: Observation Payload Mapping Pattern

The `hev:ObservationEvent` imposes no structure on `hev:observationPayload`.
Domain deployments provide supplementary shapes. The following illustrates
the pattern for a deployment using SOSA (W3C SSN/SOSA):

> **Note:** This is informative. The full SOSA mapping is in Annex B.

<!-- databook:id: sosa-mapping-stub -->
<!-- mode=informative norm=false -->
```turtle
@prefix sosa:   <http://www.w3.org/ns/sosa/> .
@prefix hev:    <http://w3id.org/holon/event/> .
@prefix sh:     <http://www.w3.org/ns/shacl#> .
@prefix rdfs:   <http://www.w3.org/2000/01/rdf-schema#> .

# Deployment-specific supplementary shape linking ObservationEvent
# to a SOSA Observation in the payload graph.
# This shape is NOT part of HGA Core — it is a domain extension.

<urn:shapes:sosa-observation-payload>
    a sh:NodeShape ;
    sh:targetClass hev:ObservationEvent ;
    rdfs:label "SOSA Observation Payload Supplement"@en ;
    sh:property [
        sh:path     hev:observationPayload ;
        sh:node     <urn:shapes:sosa-observation> ;
        sh:severity sh:Violation ;
        sh:message  "observationPayload MUST resolve to a sosa:Observation."@en ;
    ] .
```

---

*Copyright 2026 Kurt Cagle / Semantical LLC. Specification prose: W3C Document
License. Ontology content: CC0-1.0.*
