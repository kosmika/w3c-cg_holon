---
id: http://w3id.org/holon/spec/portals
title: "HGA Portals and Portal Locks — Vocabulary and Shapes"
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
  - portal
  - portal lock
  - navigation
  - SHACL 1.2
  - ODRL
description: >
  Normative vocabulary and SHACL 1.2 shapes for HGA portal navigation.
  Defines Portal (navigational link between holons), PortalLock (activation
  conditions and access policy), and PortalTraversalRecord (audit trail).
  Portal vocabulary is in the core holon: namespace. ODRL access policy
  bindings are declared by reference and defined in the hpol: namespace
  (Pass D). Activation conditions use sh:node expressions (SHACL 1.2
  Node Expressions). This section requires HGA Extended conformance.
spec:
  document-iri: http://w3id.org/holon/spec/
  section-number: "Pass B — §2"
  status: "Editor's Draft"
  normative: true
  conformance-class:
    - extended
  rfc2119: true
  part-of: http://w3id.org/holon/spec/
graph:
  namespace: http://w3id.org/holon/
  rdf_version: "1.2"
  turtle_version: "1.2"
  reification: false
shapes:
  - http://w3id.org/holon/portal/#shapes
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

## 1. Boundary vs Portal — the Fundamental Distinction

This section normatively distinguishes two concepts that are closely related
but must not be conflated.

<!-- databook:id: boundary-portal-distinction -->
<!-- mode=normative norm=true conformance=extended rfc2119=MUST -->
```turtle
@prefix holon:   <http://w3id.org/holon/> .
@prefix hspec:   <http://w3id.org/holon/spec/> .
@prefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#> .
@prefix dcterms: <http://purl.org/dc/terms/> .

hspec:BoundaryPortalDistinction a hspec:ArchitecturalDecision ;
    rdfs:label "Boundary vs Portal Distinction"@en ;
    dcterms:description """
    BOUNDARY (SHACL shapes graph):
      Governs what is VALID WITHIN a holon's payload graph.
      Mechanism: SHACL constraint evaluation on the payload graph.
      Scope: intra-holon — what can exist inside this holon.
      Knowledge: a boundary has no knowledge of portals.

    PORTAL (holon:Portal):
      Governs MOVEMENT BETWEEN holons.
      Mechanism: activation condition check + ODRL policy evaluation.
      Scope: inter-holon — how you navigate from here to there.
      Knowledge: a portal MAY consult the boundary as part of its
        activation condition (e.g. "you may only traverse this portal
        if the payload satisfies these constraints"), but the boundary
        does not know about portals.

    DIRECTIONALITY:
      Portals reference boundaries; boundaries are silent about portals.
      A portal is a DOOR. A boundary is the WALL. The wall determines
      what can exist in the room. The door determines how you enter.

    CONSEQUENCE:
      Implementations MUST NOT conflate boundary validation with portal
      traversal authorisation. These are separate evaluation steps with
      separate failure modes and separate audit trails.
    """@en .
```

A portal traversal proceeds in three independent steps, in order:

1. **Activation condition check** — does the current payload state satisfy
   the `holon:activationCondition`? This is a SHACL node expression
   evaluated against the requesting agent's payload context.
2. **ODRL policy evaluation** — does the requesting agent have `odrl:Permission`
   to traverse this portal? Evaluated against the portal's `holon:traversalPolicy`.
3. **Traversal execution** — if both pass, a `hev:PortalTraversalEvent` is
   generated and the agent is routed to the target holon.

If either step 1 or step 2 fails, a `hev:PortalTraversalDenied` event is
generated. The reason (activation condition failed vs policy denied) MUST
be recorded in the denial record.

---

## 2. Portal Vocabulary

<!-- databook:id: portal-vocabulary -->
<!-- databook:graph: http://w3id.org/holon/portal/#vocabulary -->
<!-- mode=normative norm=true conformance=extended rfc2119=MUST -->
```trig
@prefix holon:   <http://w3id.org/holon/> .
@prefix hev:     <http://w3id.org/holon/event/> .
@prefix hpol:    <http://w3id.org/holon/policy/> .
@prefix hspec:   <http://w3id.org/holon/spec/> .
@prefix owl:     <http://www.w3.org/2002/07/owl#> .
@prefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix xsd:     <http://www.w3.org/2001/XMLSchema#> .
@prefix skos:    <http://www.w3.org/2004/02/skos/core#> .
@prefix sh:      <http://www.w3.org/ns/shacl#> .
@prefix odrl:    <http://www.w3.org/ns/odrl/2/> .
@prefix prov:    <http://www.w3.org/ns/prov#> .

GRAPH <http://w3id.org/holon/portal/#vocabulary> {

  # ── Classes ──────────────────────────────────────────────────────────────

  holon:Portal a owl:Class ;
      rdfs:label    "Portal"@en ;
      rdfs:comment  "A navigational link between two holons. A portal declares a source holon and a target, zero or more portal locks governing traversal, and an optional directionality flag. Portals are first-class entities with their own IRI, lifecycle status, and audit trail."@en ;
      dcterms:description
          "A portal is a door in the holonic architecture. It connects a source holon to a target (which may be another holon on the same server or a remote IRI). Portal traversal is gated by activation conditions (data state) and ODRL policies (access rights). The separation of these two gates is normative."@en ;
      sh:agentInstruction
          "A Portal is how you move between holons. Before traversing, check: (1) Is the portal Registered and active? (2) Do you satisfy the activation condition? (3) Do you have ODRL permission? All three must be true for traversal to proceed."@en ;
      rdfs:subClassOf prov:Entity .          # non-normative OWL 2 RL

  holon:PortalLock a owl:Class ;
      rdfs:label    "Portal Lock"@en ;
      rdfs:comment  "The gating mechanism on a portal. A PortalLock carries an activation condition (a SHACL node expression or shape IRI evaluated against the requesting agent's context) and a traversal policy (an ODRL policy IRI). Both must be satisfied for traversal."@en ;
      dcterms:description
          "The lock separates state-based gating (does the data context permit traversal?) from identity-based gating (does this agent have rights?). Multiple PortalLocks may be attached to a single Portal; all locks MUST pass."@en ;
      sh:agentInstruction
          "A PortalLock has two halves: the activationCondition (data check) and the traversalPolicy (access check). Both must pass independently. Think of the activation condition as 'is the door unlocked?' and the traversal policy as 'do you have a key?'"@en .

  holon:PortalTraversalRecord a owl:Class ;
      rdfs:label    "Portal Traversal Record"@en ;
      rdfs:comment  "An immutable audit record of a portal traversal attempt. Carries the portal IRI, the traversing agent, timestamp, outcome (permitted or denied), and if denied, the reason."@en ;
      sh:agentInstruction
          "A PortalTraversalRecord is an audit log entry. It is generated for every traversal attempt, whether successful or not. Denied records carry the reason."@en ;
      rdfs:subClassOf prov:Activity .        # non-normative OWL 2 RL

  holon:PortalTraversalOutcome a owl:Class ;
      rdfs:label    "Portal Traversal Outcome"@en ;
      rdfs:comment  "Controlled vocabulary for portal traversal results."@en .

  holon:TraversalPermitted a holon:PortalTraversalOutcome ;
      rdfs:label    "Traversal Permitted"@en ;
      skos:definition
          "The traversal request satisfied both the activation condition and the ODRL policy. The agent was routed to the target holon."@en .

  holon:TraversalDeniedCondition a holon:PortalTraversalOutcome ;
      rdfs:label    "Traversal Denied — Activation Condition Failed"@en ;
      skos:definition
          "The activation condition was not satisfied. The data state of the requesting agent's context did not meet the requirements of the portal lock."@en .

  holon:TraversalDeniedPolicy a holon:PortalTraversalOutcome ;
      rdfs:label    "Traversal Denied — Policy Denied"@en ;
      skos:definition
          "The ODRL policy denied the traversal request. The requesting agent lacks the required permission."@en .

  holon:TraversalDeniedBoth a holon:PortalTraversalOutcome ;
      rdfs:label    "Traversal Denied — Both Condition and Policy Failed"@en ;
      skos:definition
          "Both the activation condition and the ODRL policy denied the traversal. Recorded separately from single-failure denials to support access pattern analysis."@en .

  # ── Properties ──────────────────────────────────────────────────────────

  holon:sourceHolon a owl:ObjectProperty ;
      rdfs:label    "source holon"@en ;
      rdfs:domain   holon:Portal ;
      rdfs:range    holon:Holon ;
      dcterms:description
          "The holon from which this portal originates. Navigating through the portal takes an agent from the sourceHolon to the portalTarget."@en .

  holon:portalTarget a owl:DatatypeProperty ;
      rdfs:label    "portal target"@en ;
      rdfs:domain   holon:Portal ;
      rdfs:range    xsd:anyURI ;
      dcterms:description
          "The target of this portal. May be a local holon IRI (resolved by the hosting server) or a remote IRI (forwarded via DataBook messaging). MUST be dereferenceable to a holon or holon endpoint."@en .

  holon:portalLock a owl:ObjectProperty ;
      rdfs:label    "portal lock"@en ;
      rdfs:domain   holon:Portal ;
      rdfs:range    holon:PortalLock ;
      dcterms:description
          "A lock on this portal. Zero or more PortalLocks may be attached. If no lock is present, the portal is ungated — traversal is permitted without condition. Ungated portals SHOULD be used only in trusted internal deployments."@en .

  holon:activationCondition a owl:ObjectProperty ;
      rdfs:label    "activation condition"@en ;
      rdfs:domain   holon:PortalLock ;
      rdfs:range    sh:NodeShape ;
      dcterms:description
          "A SHACL NodeShape or node expression IRI evaluated against the requesting agent's context graph. Traversal is permitted only if the agent's context satisfies this shape. The shape SHOULD be defined in the holon:boundary of the source holon or in a supplementary shapes graph."@en ;
      sh:agentInstruction
          "The activation condition is a SHACL shape. Evaluate it against the traversing agent's payload. If the payload satisfies the shape, the condition passes."@en .

  holon:traversalPolicy a owl:ObjectProperty ;
      rdfs:label    "traversal policy"@en ;
      rdfs:domain   holon:PortalLock ;
      rdfs:range    odrl:Policy ;
      dcterms:description
          "An ODRL Policy IRI governing access rights for this portal lock. The policy MUST be evaluated by the ODRL policy engine. Defined and shaped in the hpol: namespace (Pass D)."@en .

  holon:requiredCapability a owl:ObjectProperty ;
      rdfs:label    "required capability"@en ;
      rdfs:domain   holon:PortalLock ;
      dcterms:description
          "A capability IRI that the traversing agent MUST possess. Used as a lightweight alternative to full ODRL policy evaluation where capability-based access control is sufficient. If both requiredCapability and traversalPolicy are present, both MUST be satisfied."@en .

  holon:isDirectional a owl:DatatypeProperty ;
      rdfs:label    "is directional"@en ;
      rdfs:domain   holon:Portal ;
      rdfs:range    xsd:boolean ;
      dcterms:description
          "If true, the portal is one-way: traversal is possible only from sourceHolon to portalTarget, not in reverse. If false, traversal is bidirectional subject to the same locks in both directions. Defaults to true (one-way) if absent."@en .

  holon:portalStatus a owl:ObjectProperty ;
      rdfs:label    "portal status"@en ;
      rdfs:domain   holon:Portal ;
      rdfs:range    skos:Concept ;
      dcterms:description
          "The lifecycle status of this portal. MUST be a concept from holon:LifecycleStatusScheme. A portal with DeprecatedStatus or ArchivedStatus MUST NOT be traversed."@en .

  # ── TraversalRecord Properties ───────────────────────────────────────────

  holon:traversalPortal a owl:ObjectProperty ;
      rdfs:label    "traversal portal"@en ;
      rdfs:domain   holon:PortalTraversalRecord ;
      rdfs:range    holon:Portal ;
      dcterms:description "The portal that was attempted."@en .

  holon:traversalAgent a owl:ObjectProperty ;
      rdfs:label    "traversal agent"@en ;
      rdfs:domain   holon:PortalTraversalRecord ;
      rdfs:range    holon:AgentHolon ;
      dcterms:description "The agent that attempted traversal."@en .

  holon:traversalTime a owl:DatatypeProperty ;
      rdfs:label    "traversal time"@en ;
      rdfs:domain   holon:PortalTraversalRecord ;
      rdfs:range    xsd:dateTime ;
      dcterms:description "The UTC timestamp of the traversal attempt."@en .

  holon:traversalOutcome a owl:ObjectProperty ;
      rdfs:label    "traversal outcome"@en ;
      rdfs:domain   holon:PortalTraversalRecord ;
      rdfs:range    holon:PortalTraversalOutcome ;
      dcterms:description "The outcome of the traversal attempt."@en .

  holon:denialReason a owl:DatatypeProperty ;
      rdfs:label    "denial reason"@en ;
      rdfs:domain   holon:PortalTraversalRecord ;
      rdfs:range    xsd:string ;
      dcterms:description
          "Human-readable explanation of why the traversal was denied. Present only when traversalOutcome is a denial type. SHOULD reference the specific constraint or policy that failed."@en .

}
```

---

## 3. SHACL 1.2 Shapes for Portals

<!-- databook:id: portal-shapes -->
<!-- databook:graph: http://w3id.org/holon/portal/#shapes -->
<!-- mode=normative norm=true conformance=extended rfc2119=MUST -->
```trig
@prefix holon:   <http://w3id.org/holon/> .
@prefix sh:      <http://www.w3.org/ns/shacl#> .
@prefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd:     <http://www.w3.org/2001/XMLSchema#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix skos:    <http://www.w3.org/2004/02/skos/core#> .
@prefix odrl:    <http://www.w3.org/ns/odrl/2/> .

GRAPH <http://w3id.org/holon/portal/#shapes> {

  # ── PortalShape ──────────────────────────────────────────────────────────

  holon:PortalShape a sh:NodeShape ;
      sh:targetClass    holon:Portal ;
      sh:name           "Portal"@en ;
      sh:intent         "Validates that a Portal has an IRI identity, a source holon, a target IRI, a lifecycle status, and an rdfs:label. Ungated portals (no portalLock) are valid but generate a sh:Warning."@en ;
      sh:agentInstruction
          "A Portal must declare where it starts (sourceHolon), where it leads (portalTarget), and its lifecycle status. An ungated portal carries a warning — it should only exist intentionally."@en ;
      sh:nodeKind       sh:IRI ;

      sh:property [
          sh:path         rdfs:label ;
          sh:minCount     1 ;
          sh:languageIn   ( "en" ) ;
          sh:severity     sh:Violation ;
          sh:message      "Portal MUST have at least one English rdfs:label."@en ;
      ] ;

      sh:property [
          sh:path         holon:sourceHolon ;
          sh:minCount     1 ;
          sh:maxCount     1 ;
          sh:nodeKind     sh:IRI ;
          sh:class        holon:Holon ;
          sh:severity     sh:Violation ;
          sh:message      "Portal MUST have exactly one sourceHolon."@en ;
      ] ;

      sh:property [
          sh:path         holon:portalTarget ;
          sh:minCount     1 ;
          sh:maxCount     1 ;
          sh:nodeKind     sh:IRI ;
          sh:severity     sh:Violation ;
          sh:message      "Portal MUST have exactly one portalTarget IRI."@en ;
      ] ;

      sh:property [
          sh:path         holon:portalStatus ;
          sh:minCount     1 ;
          sh:maxCount     1 ;
          sh:in           ( holon:CandidateStatus
                            holon:RegisteredStatus
                            holon:DeprecatedStatus
                            holon:ArchivedStatus
                            holon:SuspendedStatus ) ;
          sh:severity     sh:Violation ;
          sh:message      "Portal MUST have exactly one portalStatus from holon:LifecycleStatusScheme."@en ;
      ] ;

      sh:property [
          sh:path         holon:isDirectional ;
          sh:maxCount     1 ;
          sh:datatype     xsd:boolean ;
          sh:severity     sh:Violation ;
          sh:message      "holon:isDirectional MUST be xsd:boolean if present."@en ;
      ] ;

      sh:property [
          sh:path         holon:portalLock ;
          sh:nodeKind     sh:IRI ;
          sh:class        holon:PortalLock ;
          sh:severity     sh:Violation ;
          sh:message      "portalLock MUST reference a named holon:PortalLock IRI."@en ;
      ] ;

      # Ungated portal warning
      sh:sparql [
          a sh:SPARQLConstraint ;
          sh:severity sh:Warning ;
          sh:message  "Portal has no portalLock — it is ungated. Confirm this is intentional."@en ;
          sh:prefixes holon: ;
          sh:select   """
              SELECT $this WHERE {
                  $this a holon:Portal .
                  FILTER NOT EXISTS { $this holon:portalLock ?lock }
              }
          """ ;
      ] ;

      # Deprecated / Archived portal traversal prohibition
      sh:sparql [
          a sh:SPARQLConstraint ;
          sh:severity sh:Violation ;
          sh:message  "Portal with Deprecated or Archived status MUST NOT be traversable."@en ;
          sh:prefixes holon: ;
          sh:select   """
              SELECT $this WHERE {
                  $this holon:portalStatus ?s .
                  VALUES ?s { holon:DeprecatedStatus holon:ArchivedStatus }
                  FILTER NOT EXISTS {
                      $this rdfs:comment ?note .
                      FILTER(CONTAINS(STR(?note), "traversal-prohibited"))
                  }
              }
          """ ;
      ] .

  # ── PortalLockShape ──────────────────────────────────────────────────────

  holon:PortalLockShape a sh:NodeShape ;
      sh:targetClass    holon:PortalLock ;
      sh:name           "Portal Lock"@en ;
      sh:intent         "Validates that a PortalLock has an IRI identity and at least one gating mechanism: either an activationCondition or a traversalPolicy (or both). A PortalLock with neither gate is meaningless and is a Violation."@en ;
      sh:agentInstruction
          "A PortalLock must have at least one gate. If it has only an activationCondition, traversal is data-gated only. If it has only a traversalPolicy, traversal is policy-gated only. Both may coexist."@en ;
      sh:nodeKind       sh:IRI ;

      sh:property [
          sh:path         rdfs:label ;
          sh:minCount     1 ;
          sh:languageIn   ( "en" ) ;
          sh:severity     sh:Violation ;
          sh:message      "PortalLock MUST have at least one English rdfs:label."@en ;
      ] ;

      sh:property [
          sh:path         holon:activationCondition ;
          sh:maxCount     1 ;
          sh:nodeKind     sh:IRI ;
          sh:severity     sh:Violation ;
          sh:message      "activationCondition MUST reference a named IRI (a sh:NodeShape or node expression)."@en ;
      ] ;

      sh:property [
          sh:path         holon:traversalPolicy ;
          sh:maxCount     1 ;
          sh:nodeKind     sh:IRI ;
          sh:severity     sh:Violation ;
          sh:message      "traversalPolicy MUST reference a named ODRL Policy IRI."@en ;
      ] ;

      sh:property [
          sh:path         holon:requiredCapability ;
          sh:nodeKind     sh:IRI ;
          sh:severity     sh:Violation ;
          sh:message      "requiredCapability MUST reference a named IRI."@en ;
      ] ;

      # Empty lock violation
      sh:sparql [
          a sh:SPARQLConstraint ;
          sh:severity sh:Violation ;
          sh:message  "PortalLock MUST have at least one of: activationCondition, traversalPolicy, or requiredCapability."@en ;
          sh:prefixes holon: ;
          sh:select   """
              SELECT $this WHERE {
                  $this a holon:PortalLock .
                  FILTER NOT EXISTS { $this holon:activationCondition ?ac }
                  FILTER NOT EXISTS { $this holon:traversalPolicy ?tp }
                  FILTER NOT EXISTS { $this holon:requiredCapability ?rc }
              }
          """ ;
      ] .

  # ── PortalTraversalRecordShape ───────────────────────────────────────────

  holon:PortalTraversalRecordShape a sh:NodeShape ;
      sh:targetClass    holon:PortalTraversalRecord ;
      sh:name           "Portal Traversal Record"@en ;
      sh:intent         "Validates that a traversal record carries the portal, agent, timestamp, and outcome. Denied records MUST carry a denialReason."@en ;
      sh:agentInstruction
          "A traversal record is an audit entry. It must be complete: portal, agent, time, and outcome. For denials, the reason is mandatory."@en ;
      sh:nodeKind       sh:IRI ;

      sh:property [
          sh:path         holon:traversalPortal ;
          sh:minCount     1 ;
          sh:maxCount     1 ;
          sh:nodeKind     sh:IRI ;
          sh:class        holon:Portal ;
          sh:severity     sh:Violation ;
          sh:message      "PortalTraversalRecord MUST reference exactly one portal."@en ;
      ] ;

      sh:property [
          sh:path         holon:traversalAgent ;
          sh:minCount     1 ;
          sh:maxCount     1 ;
          sh:nodeKind     sh:IRI ;
          sh:severity     sh:Violation ;
          sh:message      "PortalTraversalRecord MUST reference exactly one traversal agent."@en ;
      ] ;

      sh:property [
          sh:path         holon:traversalTime ;
          sh:minCount     1 ;
          sh:maxCount     1 ;
          sh:datatype     xsd:dateTime ;
          sh:severity     sh:Violation ;
          sh:message      "PortalTraversalRecord MUST have exactly one xsd:dateTime traversalTime."@en ;
      ] ;

      sh:property [
          sh:path         holon:traversalOutcome ;
          sh:minCount     1 ;
          sh:maxCount     1 ;
          sh:in           ( holon:TraversalPermitted
                            holon:TraversalDeniedCondition
                            holon:TraversalDeniedPolicy
                            holon:TraversalDeniedBoth ) ;
          sh:severity     sh:Violation ;
          sh:message      "PortalTraversalRecord MUST have exactly one traversalOutcome from the controlled vocabulary."@en ;
      ] ;

      sh:sparql [
          a sh:SPARQLConstraint ;
          sh:severity sh:Violation ;
          sh:message  "Denied traversal records MUST carry a denialReason."@en ;
          sh:prefixes holon: ;
          sh:select   """
              SELECT $this WHERE {
                  $this holon:traversalOutcome ?o .
                  VALUES ?o {
                      holon:TraversalDeniedCondition
                      holon:TraversalDeniedPolicy
                      holon:TraversalDeniedBoth
                  }
                  FILTER NOT EXISTS { $this holon:denialReason ?r }
              }
          """ ;
      ] .

}
```

---

## 4. Activation Conditions — Design Guidance

An `holon:activationCondition` is a SHACL NodeShape IRI. The portal
evaluation engine resolves this IRI to a shapes graph and evaluates it
against the traversing agent's context graph.

**What "agent's context" means:**

The context graph is the set of triples available to the evaluating
engine about the requesting agent at the moment of traversal. It
typically includes:
- The agent's AgentHolon infrastructure triples (identity, status)
- The agent's current payload graph (if known to the server)
- Any credentials the agent has presented (VC stubs, Pass D)

The `holon:activationCondition` shape receives these triples as its
data graph and the portal lock's source holon as `$this`.

**Example activation condition shape:**

<!-- databook:id: activation-condition-example -->
<!-- mode=example norm=false -->
```turtle
@prefix holon:   <http://w3id.org/holon/> .
@prefix sh:      <http://www.w3.org/ns/shacl#> .
@prefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#> .

# This shape, when used as an activation condition, permits traversal
# only if the requesting agent holon is in RegisteredStatus.
# Attach to a PortalLock via holon:activationCondition.

<urn:hga:condition:registered-agent-only>
    a sh:NodeShape ;
    rdfs:label "Registered Agent Only"@en ;
    sh:property [
        sh:path    holon:registrationStatus ;
        sh:hasValue holon:RegisteredStatus ;
        sh:message "Traversal requires the agent to be in RegisteredStatus."@en ;
    ] .
```

**SHACL 1.2 node expressions as activation conditions:**

SHACL 1.2 Node Expressions (`sh:nodeExpression`) provide a declarative
alternative for activation conditions that do not require a full NodeShape.
A `sh:FilterShape` can express simple path conditions. For complex
activation conditions, a full `sh:SPARQLConstraint` within the shape is
RECOMMENDED.

> **At-risk note:** The use of SHACL 1.2 Node Expressions as activation
> conditions depends on the SHACL 1.2 Node Expressions Working Draft
> (`https://www.w3.org/TR/shacl12-node-expr/`). If this draft does not
> reach Recommendation, activation conditions MUST fall back to full
> NodeShape + SPARQL constraint form.

---

## 5. ODRL Policy Binding — Forward Reference

Portal access control via ODRL Policy is fully specified in the `hpol:`
namespace (Pass D of this specification). The following is a summary of
the intended integration pattern for implementors.

A `holon:traversalPolicy` on a PortalLock references an `odrl:Policy` IRI.
The ODRL policy MUST declare at minimum:
- `odrl:permission` with `odrl:action odrl:use` (portal traversal)
- `odrl:assignee` identifying which agents or agent classes hold the permission
- Optional `odrl:constraint` expressing additional conditions

<!-- databook:id: odrl-integration-stub -->
<!-- mode=example norm=false -->
```turtle
@prefix holon:  <http://w3id.org/holon/> .
@prefix odrl:   <http://www.w3.org/ns/odrl/2/> .
@prefix rdfs:   <http://www.w3.org/2000/01/rdf-schema#> .
@prefix hpol:   <http://w3id.org/holon/policy/> .

# Example ODRL policy for a portal lock.
# Full shapes for this pattern are defined in Pass D (hpol: namespace).

<urn:policy:portal-admin-only>
    a odrl:Policy ;
    rdfs:label "Admin Agents Only — Portal Policy"@en ;
    odrl:permission [
        a odrl:Permission ;
        odrl:action    odrl:use ;
        odrl:assignee  <urn:holon:admin-agent-group> ;
    ] .

# Attach to a PortalLock:
<urn:lock:admin-portal-lock>
    a holon:PortalLock ;
    rdfs:label "Admin Portal Lock"@en ;
    holon:traversalPolicy <urn:policy:portal-admin-only> .
```

Full `hpol:` shapes for `odrl:Policy`, `odrl:Permission`, `odrl:Constraint`,
`hpol:PortalPolicy`, and `hpol:BoundaryPolicy` are defined in Pass D.

---

## 6. Holon Containment and Portal Scope

Portals and containment are orthogonal. `holon:contains` declares a
holarchic containment relationship — it expresses that a child holon
is *part of* a parent holon and inherits its scope.

`holon:Portal` declares a navigational relationship — it expresses that
an agent can *move from* one holon *to* another. The target may be:
- A child holon (navigating inward, increasing detail)
- A sibling holon (lateral navigation)
- A parent holon (navigating outward, increasing scope)
- A remote holon on another server (cross-server, DataBook messaging, v2)

Containment does not imply portal existence. A child holon may be
contained in a parent without there being an explicit portal between them
— access to the child may be governed entirely by the server's routing
logic. Explicit portals are required only when traversal conditions,
access policies, or audit trails are needed.

---

*Copyright 2026 Kurt Cagle / Semantical LLC. Specification prose: W3C Document
License. Ontology content: CC0-1.0.*
