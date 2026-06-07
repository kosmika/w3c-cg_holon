---
id: http://w3id.org/holon/spec/policy
title: "HGA ODRL Policy Bindings — Vocabulary and Shapes"
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
domain: http://w3id.org/holon/policy/
subject:
  - ODRL
  - access control
  - portal policy
  - boundary policy
  - SHACL 1.2
description: >
  Normative vocabulary and SHACL 1.2 shapes for the HGA ODRL policy binding
  layer. Defines hpol:BoundaryPolicy and hpol:PortalPolicy as specialised
  odrl:Policy subtypes governing read/write access to holon payload graphs
  and traversal of portals respectively. Defines hpol:traverse as an HGA
  action IRI. Shapes validate ODRL policy structure — presence of uid,
  permission assignee, and action. The hpol: namespace bridges HGA
  infrastructure vocabulary to the W3C ODRL 2.2 Recommendation.
spec:
  document-iri: http://w3id.org/holon/spec/
  section-number: "Pass D — §2"
  status: "Editor's Draft"
  normative: true
  conformance-class:
    - extended
  rfc2119: true
  part-of: http://w3id.org/holon/spec/
graph:
  namespace: http://w3id.org/holon/policy/
  rdf_version: "1.2"
  turtle_version: "1.2"
  reification: false
shapes:
  - http://w3id.org/holon/policy/#shapes
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

## 1. Policy Architecture

### 1.1 Two Policy Scopes

HGA applies ODRL policies at two distinct points in the holonic architecture:

**Boundary policies** (`hpol:BoundaryPolicy`) govern who may **read** a holon's payload graph and who may **write** to it (i.e., send events that mutate scene state). A boundary policy is attached to a holon instance via `hpol:holonPolicy`.

**Portal policies** (`hpol:PortalPolicy`) govern who may **traverse** a portal. A portal policy is attached to a `holon:PortalLock` instance via `holon:traversalPolicy`. The distinction from the activation condition (a SHACL data-state check) is normative — see Pass B §1.

### 1.2 Relationship to the ODRL Recommendation

`hpol:` shapes validate the **structural completeness** of ODRL policy declarations within HGA. They do not replace or extend the ODRL 2.2 semantics defined in the W3C Recommendation. An ODRL policy evaluation engine conformant to ODRL 2.2 MUST be used to evaluate permissions and prohibitions; HGA shapes only verify that the required policy structure is present.

### 1.3 Actions Defined in this Namespace

ODRL 2.2 defines `odrl:read`, `odrl:write`, and `odrl:use` as standard actions. HGA introduces one additional action:

- **`hpol:traverse`** — traverse a holon portal. This is semantically distinct from `odrl:use` (which is a generic use action) and from `odrl:move` (which applies to assets, not agents navigating holonic structures).

---

## 2. Vocabulary Declarations

<!-- databook:id: policy-vocabulary -->
<!-- databook:graph: http://w3id.org/holon/policy/#vocabulary -->
<!-- mode=normative norm=true conformance=extended rfc2119=MUST -->
```trig
@prefix hpol:    <http://w3id.org/holon/policy/> .
@prefix holon:   <http://w3id.org/holon/> .
@prefix hspec:   <http://w3id.org/holon/spec/> .
@prefix owl:     <http://www.w3.org/2002/07/owl#> .
@prefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix xsd:     <http://www.w3.org/2001/XMLSchema#> .
@prefix sh:      <http://www.w3.org/ns/shacl#> .
@prefix odrl:    <http://www.w3.org/ns/odrl/2/> .
@prefix skos:    <http://www.w3.org/2004/02/skos/core#> .

GRAPH <http://w3id.org/holon/policy/#vocabulary> {

  # ── Policy Classes ─────────────────────────────────────────────────────────

  hpol:BoundaryPolicy a owl:Class ;
      rdfs:label   "Boundary Policy"@en ;
      rdfs:comment "An ODRL Policy governing read and write access to a holon's payload graph. Attached to a holon via hpol:holonPolicy. Read permissions govern who may dereference the payload graph. Write permissions govern who may send events that mutate scene state."@en ;
      sh:agentInstruction
          "A BoundaryPolicy is the access control declaration on a holon's interior. Validate that it has a uid, at least one permission, and that each permission has an assignee and an action."@en ;
      rdfs:subClassOf odrl:Policy .       # non-normative OWL 2 RL

  hpol:PortalPolicy a owl:Class ;
      rdfs:label   "Portal Policy"@en ;
      rdfs:comment "An ODRL Policy governing traversal of a holon portal. Attached to a holon:PortalLock via holon:traversalPolicy. The policy defines which agents may traverse the portal via hpol:traverse action permissions."@en ;
      sh:agentInstruction
          "A PortalPolicy controls who may cross a portal. It must declare the traversal action (hpol:traverse) and the assignees who hold traversal rights."@en ;
      rdfs:subClassOf odrl:Policy .

  # ── Action IRI ────────────────────────────────────────────────────────────

  hpol:traverse a odrl:Action ;
      rdfs:label   "traverse"@en ;
      skos:definition
          "Traverse a holon portal. This action is used in odrl:Permission and odrl:Prohibition on hpol:PortalPolicy instances. It is distinct from odrl:use (generic use) and odrl:move (asset movement)."@en ;
      sh:agentInstruction
          "hpol:traverse is the action that represents crossing a portal. Use it as odrl:action in portal traversal permissions."@en .

  # ── Properties ────────────────────────────────────────────────────────────

  hpol:holonPolicy a owl:ObjectProperty ;
      rdfs:label   "holon policy"@en ;
      rdfs:domain  holon:Holon ;
      rdfs:range   hpol:BoundaryPolicy ;
      dcterms:description
          "Links a holon to its BoundaryPolicy. A holon with no holonPolicy is accessible to all agents (open access). Deployments requiring access control MUST declare a holonPolicy."@en ;
      sh:agentInstruction
          "holonPolicy is the access control declaration on a holon. If absent, the holon is open. If present, validate it before sending events or reading the payload."@en .

  hpol:defaultAccess a owl:ObjectProperty ;
      rdfs:label   "default access"@en ;
      rdfs:domain  hpol:BoundaryPolicy ;
      rdfs:range   hpol:DefaultAccessType ;
      dcterms:description
          "Declares the default access level when no explicit permission or prohibition applies to a requesting agent. If absent, defaults to hpol:DenyAll."@en .

  hpol:DefaultAccessType a owl:Class ;
      rdfs:label "Default Access Type"@en .

  hpol:AllowAll a hpol:DefaultAccessType ;
      rdfs:label "Allow All"@en ;
      skos:definition
          "Any agent not explicitly covered by a permission or prohibition is granted access. Suitable for public or development deployments."@en .

  hpol:DenyAll a hpol:DefaultAccessType ;
      rdfs:label "Deny All"@en ;
      skos:definition
          "Any agent not explicitly covered by a permission is denied access. Default when hpol:defaultAccess is absent."@en .

  hpol:ReadOnly a hpol:DefaultAccessType ;
      rdfs:label "Read Only"@en ;
      skos:definition
          "Any agent not explicitly covered is granted read access only. Write events and portal traversal require explicit permissions."@en .

}
```

---

## 3. SHACL 1.2 Policy Shapes

<!-- databook:id: policy-shapes -->
<!-- databook:graph: http://w3id.org/holon/policy/#shapes -->
<!-- mode=normative norm=true conformance=extended rfc2119=MUST -->
```trig
@prefix hpol:    <http://w3id.org/holon/policy/> .
@prefix holon:   <http://w3id.org/holon/> .
@prefix sh:      <http://www.w3.org/ns/shacl#> .
@prefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd:     <http://www.w3.org/2001/XMLSchema#> .
@prefix odrl:    <http://www.w3.org/ns/odrl/2/> .
@prefix dcterms: <http://purl.org/dc/terms/> .

GRAPH <http://w3id.org/holon/policy/#shapes> {

  # ── BasePolicyShape ─────────────────────────────────────────────────────────
  # Used via sh:node in BoundaryPolicyShape and PortalPolicyShape.

  hpol:BasePolicyShape a sh:NodeShape ;
      sh:name   "ODRL Policy (base)"@en ;
      sh:intent "Validates structural completeness of any HGA-context ODRL policy: uid, at least one permission or prohibition, and an rdfs:label."@en ;
      sh:agentInstruction
          "Every ODRL policy in HGA must be identifiable (uid), human-readable (label), and non-empty (at least one permission or prohibition). An empty policy is invalid."@en ;
      sh:nodeKind sh:IRI ;

      sh:property [
          sh:path     odrl:uid ;
          sh:minCount 1 ;
          sh:maxCount 1 ;
          sh:nodeKind sh:IRI ;
          sh:severity sh:Violation ;
          sh:message  "ODRL Policy MUST have exactly one odrl:uid IRI."@en ;
      ] ;

      sh:property [
          sh:path     rdfs:label ;
          sh:minCount 1 ;
          sh:or ( [ sh:datatype xsd:string ] [ sh:datatype rdf:langString ] ) ;
          sh:severity sh:Violation ;
          sh:message  "ODRL Policy MUST have at least one rdfs:label."@en ;
      ] ;

      # Must have at least one permission OR prohibition
      sh:sparql [
          a sh:SPARQLConstraint ;
          sh:severity sh:Violation ;
          sh:message  "ODRL Policy MUST have at least one odrl:permission or odrl:prohibition."@en ;
          sh:prefixes odrl: ;
          sh:select   """
              SELECT $this WHERE {
                  $this a ?policyType .
                  FILTER NOT EXISTS { $this odrl:permission ?p }
                  FILTER NOT EXISTS { $this odrl:prohibition ?pr }
              }
          """ ;
      ] .

  # ── BoundaryPolicyShape ─────────────────────────────────────────────────────

  hpol:BoundaryPolicyShape a sh:NodeShape ;
      sh:targetClass hpol:BoundaryPolicy ;
      sh:name   "Boundary Policy"@en ;
      sh:intent "Validates a holon boundary access control policy. Inherits base policy requirements. Checks that read/write actions reference only odrl:read, odrl:write. Validates the defaultAccess if declared."@en ;
      sh:agentInstruction
          "A BoundaryPolicy governs who gets in and what they can do. Validate that read permissions use odrl:read and write permissions use odrl:write."@en ;
      sh:node hpol:BasePolicyShape ;

      sh:property [
          sh:path     hpol:defaultAccess ;
          sh:maxCount 1 ;
          sh:in       ( hpol:AllowAll hpol:DenyAll hpol:ReadOnly ) ;
          sh:severity sh:Violation ;
          sh:message  "defaultAccess MUST be one of: hpol:AllowAll, hpol:DenyAll, hpol:ReadOnly."@en ;
      ] ;

      # Validate permission actions on boundary policies
      sh:sparql [
          a sh:SPARQLConstraint ;
          sh:severity sh:Violation ;
          sh:message  "BoundaryPolicy permissions MUST use odrl:read or odrl:write as action."@en ;
          sh:prefixes ( odrl: hpol: ) ;
          sh:select   """
              SELECT $this ?action WHERE {
                  $this odrl:permission ?perm .
                  ?perm odrl:action ?action .
                  FILTER (?action NOT IN (odrl:read, odrl:write))
              }
          """ ;
      ] .

  # ── PortalPolicyShape ──────────────────────────────────────────────────────

  hpol:PortalPolicyShape a sh:NodeShape ;
      sh:targetClass hpol:PortalPolicy ;
      sh:name   "Portal Policy"@en ;
      sh:intent "Validates a portal traversal access control policy. Checks that permissions use hpol:traverse as action."@en ;
      sh:agentInstruction
          "A PortalPolicy governs who may cross a portal. Validate that permissions use hpol:traverse as their action."@en ;
      sh:node hpol:BasePolicyShape ;

      sh:sparql [
          a sh:SPARQLConstraint ;
          sh:severity sh:Violation ;
          sh:message  "PortalPolicy permissions MUST use hpol:traverse as action."@en ;
          sh:prefixes ( odrl: hpol: ) ;
          sh:select   """
              SELECT $this ?action WHERE {
                  $this odrl:permission ?perm .
                  ?perm odrl:action ?action .
                  FILTER (?action != hpol:traverse)
              }
          """ ;
      ] .

  # ── ODRLPermissionShape ────────────────────────────────────────────────────

  hpol:ODRLPermissionShape a sh:NodeShape ;
      sh:targetClass odrl:Permission ;
      sh:name   "ODRL Permission"@en ;
      sh:intent "Validates that an ODRL Permission in the HGA context carries an action and at least one assignee."@en ;
      sh:agentInstruction
          "An ODRL Permission must say what action is permitted and who holds the permission. Without an assignee it applies to no one."@en ;

      sh:property [
          sh:path     odrl:action ;
          sh:minCount 1 ;
          sh:maxCount 1 ;
          sh:nodeKind sh:IRI ;
          sh:severity sh:Violation ;
          sh:message  "odrl:Permission MUST have exactly one odrl:action."@en ;
      ] ;

      sh:property [
          sh:path     odrl:assignee ;
          sh:minCount 1 ;
          sh:nodeKind sh:IRI ;
          sh:severity sh:Violation ;
          sh:message  "odrl:Permission MUST have at least one odrl:assignee."@en ;
      ] .

  # ── ODRLConstraintShape ────────────────────────────────────────────────────

  hpol:ODRLConstraintShape a sh:NodeShape ;
      sh:targetClass odrl:Constraint ;
      sh:name   "ODRL Constraint"@en ;
      sh:intent "Validates that an ODRL Constraint carries a leftOperand, operator, and rightOperand or rightOperandReference."@en ;
      sh:agentInstruction
          "An ODRL Constraint is a condition on a permission. It needs a left operand (what is being constrained), an operator (how), and a right operand (the value)."@en ;

      sh:property [
          sh:path     odrl:leftOperand ;
          sh:minCount 1 ;
          sh:maxCount 1 ;
          sh:nodeKind sh:IRI ;
          sh:severity sh:Violation ;
          sh:message  "odrl:Constraint MUST have exactly one odrl:leftOperand."@en ;
      ] ;

      sh:property [
          sh:path     odrl:operator ;
          sh:minCount 1 ;
          sh:maxCount 1 ;
          sh:nodeKind sh:IRI ;
          sh:severity sh:Violation ;
          sh:message  "odrl:Constraint MUST have exactly one odrl:operator."@en ;
      ] ;

      sh:sparql [
          a sh:SPARQLConstraint ;
          sh:severity sh:Violation ;
          sh:message  "odrl:Constraint MUST have either odrl:rightOperand or odrl:rightOperandReference."@en ;
          sh:prefixes odrl: ;
          sh:select   """
              SELECT $this WHERE {
                  $this a odrl:Constraint .
                  FILTER NOT EXISTS { $this odrl:rightOperand ?r }
                  FILTER NOT EXISTS { $this odrl:rightOperandReference ?r }
              }
          """ ;
      ] .

  # ── HolonPolicyAttachmentShape ──────────────────────────────────────────────

  hpol:HolonPolicyAttachmentShape a sh:NodeShape ;
      sh:targetSubjectsOf hpol:holonPolicy ;
      sh:name   "Holon Policy Attachment"@en ;
      sh:intent "Validates that when hpol:holonPolicy is declared on a holon, it points to a named IRI of type hpol:BoundaryPolicy."@en ;
      sh:agentInstruction
          "A holon that declares a policy must point to a valid BoundaryPolicy IRI."@en ;

      sh:property [
          sh:path     hpol:holonPolicy ;
          sh:maxCount 1 ;
          sh:nodeKind sh:IRI ;
          sh:class    hpol:BoundaryPolicy ;
          sh:severity sh:Violation ;
          sh:message  "hpol:holonPolicy MUST reference a named hpol:BoundaryPolicy IRI."@en ;
      ] .

}
```

---

## 4. Canonical Policy Patterns

### 4.1 Boundary Policy — Read/Write split

<!-- databook:id: boundary-policy-example -->
<!-- mode=example norm=false -->
```turtle
@prefix hpol:  <http://w3id.org/holon/policy/> .
@prefix holon: <http://w3id.org/holon/> .
@prefix odrl:  <http://www.w3.org/ns/odrl/2/> .
@prefix rdfs:  <http://www.w3.org/2000/01/rdf-schema#> .

# BoundaryPolicy: analysts may read; curators may write.
<urn:policy:patient-007-boundary>
    a hpol:BoundaryPolicy ;
    odrl:uid  <urn:policy:patient-007-boundary> ;
    rdfs:label "Patient-007 Holon Boundary Policy"@en ;
    hpol:defaultAccess hpol:DenyAll ;

    odrl:permission [
        a odrl:Permission ;
        odrl:action    odrl:read ;
        odrl:assignee  <urn:role:analyst-group> ;
    ] ;

    odrl:permission [
        a odrl:Permission ;
        odrl:action    odrl:write ;
        odrl:assignee  <urn:role:curator-group> ;
    ] .

# Attach to the holon:
<https://server.example.org/holons/patient-007>
    hpol:holonPolicy <urn:policy:patient-007-boundary> .
```

### 4.2 Portal Policy — Traversal permission with constraint

<!-- databook:id: portal-policy-example -->
<!-- mode=example norm=false -->
```turtle
@prefix hpol:  <http://w3id.org/holon/policy/> .
@prefix holon: <http://w3id.org/holon/> .
@prefix odrl:  <http://www.w3.org/ns/odrl/2/> .
@prefix rdfs:  <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd:   <http://www.w3.org/2001/XMLSchema#> .

# PortalPolicy: registered curators may traverse during business hours.
<urn:policy:ward-portal-traversal>
    a hpol:PortalPolicy ;
    odrl:uid  <urn:policy:ward-portal-traversal> ;
    rdfs:label "Ward Portal Traversal Policy"@en ;

    odrl:permission [
        a odrl:Permission ;
        odrl:action    hpol:traverse ;
        odrl:assignee  <urn:role:registered-curator> ;
        odrl:constraint [
            a odrl:Constraint ;
            odrl:leftOperand  odrl:dateTime ;
            odrl:operator     odrl:isA ;
            odrl:rightOperand <urn:timebounds:business-hours> ;
        ] ;
    ] .

# Attach to a PortalLock (see Pass B portals section):
<urn:lock:ward-entry-lock>
    a holon:PortalLock ;
    rdfs:label "Ward Entry Lock"@en ;
    holon:traversalPolicy <urn:policy:ward-portal-traversal> .
```

---

*Copyright 2026 Kurt Cagle / Semantical LLC. Specification prose: W3C Document
License. Ontology content: CC0-1.0.*
