---
id: http://w3id.org/holon/spec/vc-stubs
title: "HGA Verifiable Credential Stubs — Vocabulary and Shapes"
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
domain: http://w3id.org/holon/vc/
subject:
  - verifiable credentials
  - VC Data Model 2.0
  - credential subject
  - SHACL 1.2
description: >
  Normative SHACL 1.2 shapes for VC Data Model 2.0 credential wrappers
  within the HGA infrastructure. Validates the credential envelope: issuer,
  validFrom, validUntil, proof, and credentialSubject presence. The
  credentialSubject content is intentionally open (sh:closed false) —
  domain deployments extend with domain-specific subject shapes.
  Defines hvc:HolonCredential and hvc:HolonPresentation as HGA-specific
  subtypes linking credentials to holons.
spec:
  document-iri: http://w3id.org/holon/spec/
  section-number: "Pass D — §3"
  status: "Editor's Draft"
  normative: true
  conformance-class:
    - extended
  rfc2119: true
  part-of: http://w3id.org/holon/spec/
graph:
  namespace: http://w3id.org/holon/vc/
  rdf_version: "1.2"
  turtle_version: "1.2"
  reification: false
shapes:
  - http://w3id.org/holon/vc/#shapes
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

## 1. Design Principles

### 1.1 Wrapper, Not Subject

The `hvc:` shapes validate the **credential envelope** — the outer
container of a Verifiable Credential. They do not constrain the
`credentialSubject` content. This is a deliberate architectural decision:

- The credential envelope is HGA infrastructure (who issued the credential,
  when it is valid, whether it has a proof).
- The credential subject is domain payload (what the credential asserts
  about which entity).

The division mirrors the event envelope / payload separation established
in Pass B and Pass C.

> **Analogy to events:** `hvc:VerifiableCredentialShape` is to credentials
> as `hev:AssertionEventShape` is to events — it validates the envelope;
> domain shapes validate the content.

### 1.2 VC Data Model Namespace

The VC Data Model 2.0 terms used in `hvc:` shapes are from the
`https://www.w3.org/ns/credentials/` namespace (prefix `vc:`). This
corresponds to the VC DM 2.0 vocabulary. The context IRI
`https://www.w3.org/ns/credentials/v2` is used for JSON-LD contexts.

> **Forward dependency note:** VC Data Model 2.0 is a W3C Recommendation
> (`https://www.w3.org/TR/vc-data-model-2.0/`). This specification targets
> that Recommendation. If the VC DM namespace changes in a future revision,
> this section must be updated.

### 1.3 Proof Handling

HGA shapes validate that a `vc:proof` link is present (`sh:Warning` if
absent). HGA does NOT validate the proof itself. Proof verification is
performed by a VC-conformant verifier; HGA shapes only confirm the
structural presence of the proof node.

---

## 2. Vocabulary Declarations

<!-- databook:id: vc-vocabulary -->
<!-- databook:graph: http://w3id.org/holon/vc/#vocabulary -->
<!-- mode=normative norm=true conformance=extended rfc2119=MUST -->
```trig
@prefix hvc:     <http://w3id.org/holon/vc/> .
@prefix holon:   <http://w3id.org/holon/> .
@prefix vc:      <https://www.w3.org/ns/credentials/> .
@prefix hspec:   <http://w3id.org/holon/spec/> .
@prefix owl:     <http://www.w3.org/2002/07/owl#> .
@prefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix xsd:     <http://www.w3.org/2001/XMLSchema#> .
@prefix sh:      <http://www.w3.org/ns/shacl#> .
@prefix prov:    <http://www.w3.org/ns/prov#> .

GRAPH <http://w3id.org/holon/vc/#vocabulary> {

  # ── Classes ──────────────────────────────────────────────────────────────

  hvc:HolonCredential a owl:Class ;
      rdfs:label   "Holon Credential"@en ;
      rdfs:comment "A Verifiable Credential whose credentialSubject is a holon or a property of a holon. HolonCredentials are used to assert authoritative claims about holons — registration, capability, identity — from trusted issuers."@en ;
      sh:agentInstruction
          "A HolonCredential is an externally issued certificate about a holon. Its issuer is a trusted authority. Its credentialSubject points to the holon being described. Read the credentialSubject to understand what is being asserted; check issuer and validFrom to assess trustworthiness."@en ;
      rdfs:subClassOf vc:VerifiableCredential .  # non-normative OWL 2 RL

  hvc:HolonPresentation a owl:Class ;
      rdfs:label   "Holon Presentation"@en ;
      rdfs:comment "A Verifiable Presentation submitted by an AgentHolon to prove claims about itself. A presentation bundles one or more HolonCredentials and presents them to a relying party (typically a portal lock or boundary policy evaluator)."@en ;
      sh:agentInstruction
          "A HolonPresentation is a bundle of credentials presented by an agent. Validate the holder matches the presenting agent, then validate each included credential individually."@en ;
      rdfs:subClassOf vc:VerifiablePresentation .

  # ── Linking Properties ───────────────────────────────────────────────────

  hvc:holonCredential a owl:ObjectProperty ;
      rdfs:label   "holon credential"@en ;
      rdfs:domain  holon:Holon ;
      rdfs:range   hvc:HolonCredential ;
      dcterms:description
          "Links a holon to a credential that asserts something about it. A holon MAY carry multiple credentials from different issuers."@en .

  hvc:presentedBy a owl:ObjectProperty ;
      rdfs:label   "presented by"@en ;
      rdfs:domain  hvc:HolonPresentation ;
      rdfs:range   holon:AgentHolon ;
      dcterms:description
          "Links a HolonPresentation to the AgentHolon that submitted it. The presenting agent SHOULD match the vc:holder of the presentation."@en .

  hvc:presentedTo a owl:ObjectProperty ;
      rdfs:label   "presented to"@en ;
      rdfs:domain  hvc:HolonPresentation ;
      dcterms:description
          "Links a HolonPresentation to the portal lock or boundary policy evaluator it was submitted to."@en .

  hvc:presentationTimestamp a owl:DatatypeProperty ;
      rdfs:label   "presentation timestamp"@en ;
      rdfs:domain  hvc:HolonPresentation ;
      rdfs:range   xsd:dateTime ;
      dcterms:description
          "The UTC timestamp at which the presentation was submitted."@en .

}
```

---

## 3. SHACL 1.2 Shapes

<!-- databook:id: vc-shapes -->
<!-- databook:graph: http://w3id.org/holon/vc/#shapes -->
<!-- mode=normative norm=true conformance=extended rfc2119=MUST -->
```trig
@prefix hvc:     <http://w3id.org/holon/vc/> .
@prefix holon:   <http://w3id.org/holon/> .
@prefix vc:      <https://www.w3.org/ns/credentials/> .
@prefix sh:      <http://www.w3.org/ns/shacl#> .
@prefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd:     <http://www.w3.org/2001/XMLSchema#> .
@prefix dcterms: <http://purl.org/dc/terms/> .

GRAPH <http://w3id.org/holon/vc/#shapes> {

  # ── VerifiableCredentialShape ─────────────────────────────────────────────
  # Validates the credential envelope. credentialSubject is open.

  hvc:VerifiableCredentialShape a sh:NodeShape ;
      sh:targetClass vc:VerifiableCredential ;
      sh:name   "Verifiable Credential"@en ;
      sh:intent "Validates the envelope of a VC Data Model 2.0 credential: issuer (named IRI), validFrom (dateTime), optional validUntil, at least one credentialSubject, and optional proof. credentialSubject content is not constrained — it is open for domain extension."@en ;
      sh:agentInstruction
          "A VerifiableCredential envelope is like an event envelope — validate the wrapper, not the content. Issuer must be a named IRI. validFrom must be a timestamp. credentialSubject must be present but its content is domain-specific."@en ;
      sh:nodeKind sh:IRI ;

      sh:property [
          sh:path     rdfs:label ;
          sh:minCount 1 ;
          sh:or ( [ sh:datatype xsd:string ] [ sh:datatype rdf:langString ] ) ;
          sh:severity sh:Warning ;
          sh:message  "VerifiableCredential SHOULD have an rdfs:label for human-readable identification."@en ;
      ] ;

      sh:property [
          sh:path     vc:issuer ;
          sh:minCount 1 ;
          sh:maxCount 1 ;
          sh:nodeKind sh:IRI ;
          sh:severity sh:Violation ;
          sh:message  "VerifiableCredential MUST have exactly one vc:issuer IRI."@en ;
      ] ;

      sh:property [
          sh:path     vc:validFrom ;
          sh:minCount 1 ;
          sh:maxCount 1 ;
          sh:datatype xsd:dateTime ;
          sh:severity sh:Violation ;
          sh:message  "VerifiableCredential MUST have exactly one vc:validFrom xsd:dateTime."@en ;
      ] ;

      sh:property [
          sh:path     vc:validUntil ;
          sh:maxCount 1 ;
          sh:datatype xsd:dateTime ;
          sh:severity sh:Violation ;
          sh:message  "vc:validUntil MUST be xsd:dateTime if present."@en ;
      ] ;

      sh:property [
          sh:path     vc:credentialSubject ;
          sh:minCount 1 ;
          sh:nodeKind sh:IRI ;
          sh:severity sh:Violation ;
          sh:message  "VerifiableCredential MUST have at least one vc:credentialSubject IRI."@en ;
          # credentialSubject content is intentionally NOT validated here.
          # Domain deployments provide sh:node constraints.
      ] ;

      sh:property [
          sh:path     vc:proof ;
          sh:maxCount 1 ;
          sh:nodeKind sh:BlankNodeOrIRI ;
          sh:severity sh:Warning ;
          sh:message  "VerifiableCredential SHOULD carry a vc:proof for production deployments."@en ;
      ] ;

      # Validity window check
      sh:sparql [
          a sh:SPARQLConstraint ;
          sh:severity sh:Violation ;
          sh:message  "vc:validUntil must be later than vc:validFrom."@en ;
          sh:prefixes vc: ;
          sh:select   """
              SELECT $this WHERE {
                  $this vc:validFrom  ?from ;
                        vc:validUntil ?until .
                  FILTER (?until <= ?from)
              }
          """ ;
      ] .

  # ── HolonCredentialShape ──────────────────────────────────────────────────

  hvc:HolonCredentialShape a sh:NodeShape ;
      sh:targetClass hvc:HolonCredential ;
      sh:name   "Holon Credential"@en ;
      sh:intent "Extends VerifiableCredentialShape for HolonCredentials. The credentialSubject MUST be a Holon IRI."@en ;
      sh:agentInstruction
          "A HolonCredential asserts something about a holon. The credentialSubject must be a holon IRI. The content of that assertion is domain-specific."@en ;
      sh:node hvc:VerifiableCredentialShape ;

      sh:property [
          sh:path     vc:credentialSubject ;
          sh:class    holon:Holon ;
          sh:severity sh:Violation ;
          sh:message  "HolonCredential credentialSubject MUST be a holon:Holon."@en ;
      ] .

  # ── VerifiablePresentationShape ───────────────────────────────────────────

  hvc:VerifiablePresentationShape a sh:NodeShape ;
      sh:targetClass vc:VerifiablePresentation ;
      sh:name   "Verifiable Presentation"@en ;
      sh:intent "Validates the envelope of a VC Data Model 2.0 presentation: at least one included credential, optional holder, optional proof."@en ;
      sh:agentInstruction
          "A VerifiablePresentation bundles credentials for submission. Validate that it contains at least one verifiableCredential and that each is itself a valid VerifiableCredential."@en ;
      sh:nodeKind sh:IRI ;

      sh:property [
          sh:path     vc:verifiableCredential ;
          sh:minCount 1 ;
          sh:nodeKind sh:IRI ;
          sh:node     hvc:VerifiableCredentialShape ;
          sh:severity sh:Violation ;
          sh:message  "VerifiablePresentation MUST include at least one vc:verifiableCredential, each of which must satisfy VerifiableCredentialShape."@en ;
      ] ;

      sh:property [
          sh:path     vc:holder ;
          sh:maxCount 1 ;
          sh:nodeKind sh:IRI ;
          sh:severity sh:Warning ;
          sh:message  "VerifiablePresentation SHOULD declare a vc:holder."@en ;
      ] ;

      sh:property [
          sh:path     vc:proof ;
          sh:maxCount 1 ;
          sh:severity sh:Warning ;
          sh:message  "VerifiablePresentation SHOULD carry a vc:proof for production deployments."@en ;
      ] .

  # ── HolonPresentationShape ────────────────────────────────────────────────

  hvc:HolonPresentationShape a sh:NodeShape ;
      sh:targetClass hvc:HolonPresentation ;
      sh:name   "Holon Presentation"@en ;
      sh:intent "Extends VerifiablePresentationShape for HolonPresentations. Validates that presentedBy links to an AgentHolon and that the holder matches the presenting agent."@en ;
      sh:agentInstruction
          "A HolonPresentation is an agent proving its credentials. presentedBy must be an AgentHolon. The holder in the presentation should match the presenting agent."@en ;
      sh:node hvc:VerifiablePresentationShape ;

      sh:property [
          sh:path     hvc:presentedBy ;
          sh:minCount 1 ;
          sh:maxCount 1 ;
          sh:nodeKind sh:IRI ;
          sh:class    holon:AgentHolon ;
          sh:severity sh:Violation ;
          sh:message  "HolonPresentation MUST declare exactly one hvc:presentedBy AgentHolon."@en ;
      ] ;

      sh:property [
          sh:path     hvc:presentationTimestamp ;
          sh:maxCount 1 ;
          sh:datatype xsd:dateTime ;
          sh:severity sh:Violation ;
          sh:message  "presentationTimestamp MUST be xsd:dateTime if present."@en ;
      ] ;

      # Holder / presentedBy consistency check
      sh:sparql [
          a sh:SPARQLConstraint ;
          sh:severity sh:Warning ;
          sh:message  "HolonPresentation vc:holder should match hvc:presentedBy agent."@en ;
          sh:prefixes ( hvc: vc: ) ;
          sh:select   """
              SELECT $this WHERE {
                  $this hvc:presentedBy ?agent ;
                        vc:holder       ?holder .
                  FILTER (?agent != ?holder)
              }
          """ ;
      ] .

  # ── ProofShape (structural stub) ─────────────────────────────────────────

  hvc:ProofShape a sh:NodeShape ;
      sh:targetObjectsOf vc:proof ;
      sh:name   "Credential Proof (structural stub)"@en ;
      sh:intent "Validates minimal structural presence of a proof node: a type declaration and a created timestamp. Cryptographic verification of the proof is out of scope for HGA shapes."@en ;
      sh:agentInstruction
          "A proof node must at minimum declare its type and when it was created. HGA does not verify the cryptographic proof — that is the job of a VC verifier."@en ;

      sh:property [
          sh:path     dcterms:created ;
          sh:maxCount 1 ;
          sh:or (
              [ sh:datatype xsd:date ]
              [ sh:datatype xsd:dateTime ]
          ) ;
          sh:severity sh:Warning ;
          sh:message  "Proof SHOULD carry a dcterms:created timestamp."@en ;
      ] .

}
```

---

## 4. Domain Extension Pattern

Domain deployments extend `hvc:VerifiableCredentialShape` by adding
a `sh:node` constraint on `vc:credentialSubject`. The following illustrates
a credential asserting registration status for an observatory holon:

<!-- databook:id: vc-domain-extension-example -->
<!-- mode=example norm=false -->
```turtle
@prefix hvc:   <http://w3id.org/holon/vc/> .
@prefix vc:    <https://www.w3.org/ns/credentials/> .
@prefix ggsc:  <https://w3id.org/ggsc/> .
@prefix sh:    <http://www.w3.org/ns/shacl#> .
@prefix rdfs:  <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd:   <http://www.w3.org/2001/XMLSchema#> .

# Domain-specific credential subject shape — not part of HGA Core.
ggsc:ObservatoryRegistrationCredentialShape a sh:NodeShape ;
    sh:name "Observatory Registration Credential Subject"@en ;
    sh:property [
        sh:path     ggsc:registrationAuthority ;
        sh:minCount 1 ;
        sh:nodeKind sh:IRI ;
    ] ;
    sh:property [
        sh:path     ggsc:registrationCode ;
        sh:minCount 1 ;
        sh:datatype xsd:string ;
    ] .

# Credential data:
<urn:vc:yarragadee-registration-2026>
    a hvc:HolonCredential ;
    rdfs:label "Yarragadee Observatory Registration Credential"@en ;
    vc:issuer       <https://ggsc.un.org/registry> ;
    vc:validFrom    "2026-01-01T00:00:00Z"^^xsd:dateTime ;
    vc:credentialSubject <https://w3id.org/ggsc/obs/Yarragadee> ;
    vc:proof [
        dcterms:created "2026-01-01"^^xsd:date ;
    ] .
```

---

## 5. Integration with Portal Locks

A `holon:PortalLock` MAY require a `hvc:HolonPresentation` as its
activation condition. The following shows the pattern connecting VC
stubs to portal access:

<!-- databook:id: vc-portal-integration -->
<!-- mode=example norm=false -->
```turtle
@prefix holon: <http://w3id.org/holon/> .
@prefix hvc:   <http://w3id.org/holon/vc/> .
@prefix sh:    <http://www.w3.org/ns/shacl#> .
@prefix rdfs:  <http://www.w3.org/2000/01/rdf-schema#> .

# Activation condition shape: traversing agent must hold a valid credential.
<urn:condition:requires-registration-credential>
    a sh:NodeShape ;
    rdfs:label "Requires Registration Credential"@en ;
    sh:property [
        sh:path     hvc:holonCredential ;
        sh:minCount 1 ;
        sh:node     hvc:HolonCredentialShape ;
        sh:message  "Traversing agent must hold a valid HolonCredential."@en ;
    ] .

# PortalLock using the activation condition:
<urn:lock:ggsc-data-access>
    a holon:PortalLock ;
    rdfs:label "GGSC Data Access Lock"@en ;
    holon:activationCondition <urn:condition:requires-registration-credential> .
```

---

*Copyright 2026 Kurt Cagle / Semantical LLC. Specification prose: W3C Document
License. Ontology content: CC0-1.0.*
