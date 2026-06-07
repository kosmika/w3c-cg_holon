---
id: http://w3id.org/holon/spec/core-structure
title: "HGA Core Holonic Structure — Classes, Properties and Shapes"
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
  - holon
  - SHACL 1.2
  - RDF 1.2
  - holon graph architecture
  - core structure
description: >
  Normative vocabulary and SHACL 1.2 shapes for the core holonic structure
  of the Holon Graph Architecture. Defines eight holon classes (Holon,
  HomeHolon, IndexHolon, AgentHolon, PlaceHolon, OrganisationHolon,
  DataHolon, ProcessHolon), GroundingRecord, all core holon properties,
  BoundaryMode individuals, and SHACL 1.2 NodeShapes and PropertyShapes
  for each class. Shapes are closed over the infrastructure layer and open
  over the payload layer. Includes the global reifier integrity constraint
  requiring named IRI reifiers with rdfs:label.
spec:
  document-iri: http://w3id.org/holon/spec/
  section-number: "Pass B — §1"
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
shapes:
  - http://w3id.org/holon/#shapes
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

## 1. The Envelope / Payload Separation

The single most important architectural invariant of the HGA specification
is the clean division between the holonic infrastructure layer and the
domain payload it carries.

A holon has two distinct graph layers:

- **Infrastructure layer** — the holon's identity, lifecycle status,
  containment relationships, server binding, boundary declaration, and
  portal links. This layer uses vocabulary defined in the `holon:` and
  `hev:` namespaces. Infrastructure shapes are `sh:closed true`.

- **Payload layer** — the domain content carried by the holon. The payload
  graph IRI is declared via `holon:payloadGraph`. What is valid in the
  payload is determined by the holon's boundary shapes (`holon:boundary`).
  Payload shapes are `sh:closed false` by default; deployments MAY close
  them by setting `holon:boundaryMode holon:ClosedBoundary`.

SHACL shapes in this section validate the infrastructure layer. They MUST
NOT be applied to payload graph content. Domain deployments define their
own payload shapes and attach them to the holon via `holon:boundary`.

> **Important:** The infrastructure / payload separation is enforced by
> named graph scope. Infrastructure triples live in the holon's registration
> graph. Payload triples live in `holon:payloadGraph`. SHACL shapes reference
> the correct graph via `sh:targetWhere` or `sh:shapesGraph` declarations.

---

## 2. Vocabulary Declarations

Classes, properties, and individuals for the `holon:` core namespace.

<!-- databook:id: core-vocabulary -->
<!-- databook:graph: http://w3id.org/holon/#vocabulary -->
<!-- mode=normative norm=true conformance=core rfc2119=MUST -->
```trig
@prefix holon:   <http://w3id.org/holon/> .
@prefix hspec:   <http://w3id.org/holon/spec/> .
@prefix owl:     <http://www.w3.org/2002/07/owl#> .
@prefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix xsd:     <http://www.w3.org/2001/XMLSchema#> .
@prefix skos:    <http://www.w3.org/2004/02/skos/core#> .
@prefix prov:    <http://www.w3.org/ns/prov#> .
@prefix sh:      <http://www.w3.org/ns/shacl#> .

GRAPH <http://w3id.org/holon/#vocabulary> {

  # ── Classes ──────────────────────────────────────────────────────────────

  holon:Holon a owl:Class ;
      rdfs:label    "Holon"@en ;
      rdfs:comment  "Abstract base class for all holonic entities. A holon is simultaneously a whole (self-contained entity with its own identity, boundary, and state) and a part (contained within a larger holonic structure). All holons MUST have a dereferenceable IRI, an rdfs:label, and a registrationStatus."@en ;
      dcterms:description
          "A holon at rest is a DataBook. Its infrastructure layer carries its identity and boundary declaration; its payload layer carries domain content. The same DataBook may be loaded locally as a file or fetched from a vocabulary server — the format is invariant."@en ;
      sh:agentInstruction
          "A Holon is a map of some territory. When you encounter a Holon, look first at its registrationStatus (is it active?), its payloadGraph (where is the domain content?), and its boundary (what is valid there?). The holon infrastructure tells you the envelope; the payload graph tells you the content."@en ;
      rdfs:subClassOf prov:Entity .          # non-normative OWL 2 RL axiom

  holon:HomeHolon a owl:Class ;
      rdfs:label    "Home Holon"@en ;
      rdfs:comment  "The root container holon for a holon server. A HomeHolon is bound to a specific server endpoint and acts as the container for all other holons hosted on that server. Every holon server MUST have exactly one HomeHolon."@en ;
      dcterms:description
          "The HomeHolon is the server's root resource. It carries the server's vocabulary endpoint, registry graph, and ACL policy reference. All other holons declare holon:hostedBy pointing to the HomeHolon of their server."@en ;
      sh:agentInstruction
          "The HomeHolon is the entry point to a holon server. It contains the registry of all hosted holons and the vocabulary server endpoint. When navigating a new server, start here."@en ;
      rdfs:subClassOf holon:Holon .          # non-normative OWL 2 RL

  holon:IndexHolon a owl:Class ;
      rdfs:label    "Index Holon"@en ;
      rdfs:comment  "A discovery and registry holon. The IndexHolon handles registration lookup and capability advertisement. It returns a registry DataBook on request, filtered by the requesting agent's access rights. A HomeHolon is a specialised IndexHolon bound to a server."@en ;
      sh:agentInstruction
          "The IndexHolon is a directory. Query it to find what holons exist, what their status is, and what capabilities are available. It responds differently to different agents based on their access rights."@en ;
      rdfs:subClassOf holon:Holon .

  holon:AgentHolon a owl:Class ;
      rdfs:label    "Agent Holon"@en ;
      rdfs:comment  "A holon representing an agent — a person, software agent, or autonomous system capable of generating or receiving events. AgentHolons carry agent identity and capability declarations."@en ;
      sh:agentInstruction
          "An AgentHolon represents a participant in the system — someone or something that sends or receives events. Its payload typically carries role declarations, capability metadata, and contact or identity information."@en ;
      rdfs:subClassOf holon:Holon ;
      skos:closeMatch prov:Agent .           # informative alignment

  holon:PlaceHolon a owl:Class ;
      rdfs:label    "Place Holon"@en ;
      rdfs:comment  "A holon representing a spatial location or physical place. PlaceHolons carry place identity and MAY carry a payload link to a spatial geometry (domain-specific). The HGA infrastructure layer carries the place identity; the geometry is payload content."@en ;
      sh:agentInstruction
          "A PlaceHolon is a location in the world. Its infrastructure layer carries its name and status. Spatial geometry (coordinates, bounding box) is payload content governed by the holon's boundary shapes."@en ;
      rdfs:subClassOf holon:Holon .

  holon:OrganisationHolon a owl:Class ;
      rdfs:label    "Organisation Holon"@en ;
      rdfs:comment  "A holon representing an organisation. An OrganisationHolon is a subtype of AgentHolon — organisations are collective agents capable of generating and receiving events in their own right."@en ;
      sh:agentInstruction
          "An OrganisationHolon represents a collective actor. It may contain AgentHolons (members, employees) and may issue or receive events on behalf of the organisation."@en ;
      rdfs:subClassOf holon:AgentHolon .     # non-normative OWL 2 RL

  holon:DataHolon a owl:Class ;
      rdfs:label    "Data Holon"@en ;
      rdfs:comment  "A holon whose primary payload is a structured data resource — a document, dataset, report, or knowledge artefact. DataHolons are navigated and consumed rather than acted upon."@en ;
      sh:agentInstruction
          "A DataHolon is a knowledge resource. Navigate to it to retrieve structured data. Its boundary shapes declare what data types and properties are valid within it."@en ;
      rdfs:subClassOf holon:Holon .

  holon:ProcessHolon a owl:Class ;
      rdfs:label    "Process Holon"@en ;
      rdfs:comment  "A holon representing an ongoing process, workflow, or pipeline. ProcessHolons carry process state and progress metadata. Events targeting a ProcessHolon advance its state."@en ;
      sh:agentInstruction
          "A ProcessHolon is an active workflow. Its state transitions are driven by events. Its current stage, inputs, and outputs are payload content. Use it to track long-running operations."@en ;
      rdfs:subClassOf holon:Holon .

  holon:GroundingRecord a owl:Class ;
      rdfs:label    "Grounding Record"@en ;
      rdfs:comment  "A record of a single entity grounding result from the Pass 1 entity recognition stage. Carries the source string, the matched canonical IRI (if any), the grounding confidence score, and the match type."@en ;
      sh:agentInstruction
          "A GroundingRecord is the output of entity recognition. It tells you how confident the pipeline is that a source string refers to a known entity. Check matchType and groundingConfidence before using the matchedIRI."@en .

  # ── BoundaryMode ────────────────────────────────────────────────────────

  holon:BoundaryModeType a owl:Class ;
      rdfs:label "Boundary Mode"@en ;
      rdfs:comment "Controls whether a holon's payload shapes are open or closed."@en .

  holon:OpenBoundary a holon:BoundaryModeType ;
      rdfs:label "Open Boundary"@en ;
      skos:definition
          "The holon's payload shapes are open. Properties beyond those declared in the boundary shapes are permitted in the payload graph. This is the default boundary mode."@en .

  holon:ClosedBoundary a holon:BoundaryModeType ;
      rdfs:label "Closed Boundary"@en ;
      skos:definition
          "The holon's payload shapes are closed. Only properties declared in the boundary shapes are permitted in the payload graph. Deployments requiring strict data governance SHOULD use ClosedBoundary."@en .

  # ── Core Properties ─────────────────────────────────────────────────────

  holon:registrationStatus a owl:ObjectProperty ;
      rdfs:label    "registration status"@en ;
      rdfs:domain   holon:Holon ;
      rdfs:range    skos:Concept ;
      dcterms:description
          "The administrative lifecycle status of a holon. MUST be a concept from holon:LifecycleStatusScheme. Every holon MUST assert exactly one registrationStatus."@en ;
      sh:agentInstruction
          "Check registrationStatus before routing events to a holon. Only Registered holons should receive production events."@en .

  holon:registeredIn a owl:DatatypeProperty ;
      rdfs:label    "registered in"@en ;
      rdfs:domain   holon:Holon ;
      rdfs:range    xsd:anyURI ;
      dcterms:description
          "The IRI of the named graph in which this holon's registration record is stored."@en .

  holon:hostedBy a owl:ObjectProperty ;
      rdfs:label    "hosted by"@en ;
      rdfs:domain   holon:Holon ;
      rdfs:range    holon:HomeHolon ;
      dcterms:description
          "Links a holon to the HomeHolon of the server that hosts it."@en .

  holon:contains a owl:ObjectProperty ;
      rdfs:label    "contains"@en ;
      rdfs:domain   holon:Holon ;
      rdfs:range    holon:Holon ;
      dcterms:description
          "Holonic containment relationship. The subject holon contains the object holon. Containment is hierarchical but not exclusive — a holon may be contained in more than one parent in cross-domain federation contexts (though this is a v2 concern)."@en ;
      owl:inverseOf holon:partOf .           # non-normative OWL 2 RL

  holon:partOf a owl:ObjectProperty ;
      rdfs:label    "part of"@en ;
      rdfs:domain   holon:Holon ;
      rdfs:range    holon:Holon ;
      dcterms:description
          "Inverse of holon:contains. The subject holon is a part of the object holon."@en ;
      owl:inverseOf holon:contains .

  holon:successor a owl:ObjectProperty ;
      rdfs:label    "successor"@en ;
      rdfs:domain   holon:Holon ;
      rdfs:range    holon:Holon ;
      dcterms:description
          "Links a deprecated holon to its replacement holon. MUST be present when registrationStatus is holon:DeprecatedStatus."@en .

  holon:payloadGraph a owl:DatatypeProperty ;
      rdfs:label    "payload graph"@en ;
      rdfs:domain   holon:Holon ;
      rdfs:range    xsd:anyURI ;
      dcterms:description
          "The IRI of the named graph containing this holon's domain content. The payload graph is where domain-specific triples live; boundary shapes apply to this graph."@en .

  holon:boundary a owl:ObjectProperty ;
      rdfs:label    "boundary"@en ;
      rdfs:domain   holon:Holon ;
      rdfs:range    sh:NodeShape ;
      dcterms:description
          "Links a holon to the SHACL shapes graph that defines its boundary — what is valid within the holon's payload. The referenced shapes graph SHOULD be dereferenceable as a vocabulary DataBook."@en ;
      sh:agentInstruction
          "The boundary is the formal contract of what can exist inside a holon. Consult it before generating or validating payload content."@en .

  holon:boundaryMode a owl:ObjectProperty ;
      rdfs:label    "boundary mode"@en ;
      rdfs:domain   holon:Holon ;
      rdfs:range    holon:BoundaryModeType ;
      dcterms:description
          "Declares whether the holon's payload shapes are open or closed. Defaults to holon:OpenBoundary if absent."@en .

  holon:serverEndpoint a owl:DatatypeProperty ;
      rdfs:label    "server endpoint"@en ;
      rdfs:domain   holon:HomeHolon ;
      rdfs:range    xsd:anyURI ;
      dcterms:description
          "The base IRI of the holon server that hosts this HomeHolon. All holons on this server are addressable as sub-paths of this IRI."@en .

  holon:registryGraph a owl:DatatypeProperty ;
      rdfs:label    "registry graph"@en ;
      rdfs:domain   holon:Holon ;
      rdfs:range    xsd:anyURI ;
      dcterms:description
          "The IRI of the named graph containing the registration records for holons known to this holon. Used on HomeHolon and IndexHolon instances."@en .

  holon:vocabularyEndpoint a owl:DatatypeProperty ;
      rdfs:label    "vocabulary endpoint"@en ;
      rdfs:domain   holon:HomeHolon ;
      rdfs:range    xsd:anyURI ;
      dcterms:description
          "The IRI of the vocabulary server endpoint. A GET request to this IRI with an appropriate Accept header MUST return the HGA vocabulary DataBook for the requested namespace or term. Supported Accept types: text/turtle (MUST), text/html (MUST), application/ld+json (SHOULD)."@en .

  # ── GroundingRecord Properties ───────────────────────────────────────────

  holon:sourceString a owl:DatatypeProperty ;
      rdfs:label    "source string"@en ;
      rdfs:domain   holon:GroundingRecord ;
      rdfs:range    xsd:string ;
      dcterms:description
          "The raw text string from the source document that was submitted for entity grounding."@en .

  holon:matchedIRI a owl:ObjectProperty ;
      rdfs:label    "matched IRI"@en ;
      rdfs:domain   holon:GroundingRecord ;
      dcterms:description
          "The canonical IRI of the matched entity from the registry. MUST be present for ExactMatch, SemanticMatch, and FuzzyMatch results. For NoMatch results this property SHOULD be absent."@en .

  holon:groundingConfidence a owl:DatatypeProperty ;
      rdfs:label    "grounding confidence"@en ;
      rdfs:domain   holon:GroundingRecord ;
      rdfs:range    xsd:decimal ;
      sh:unit       <http://qudt.org/vocab/unit/UNITLESS> ;
      dcterms:description
          "Confidence score for the entity grounding result. Range [0.0, 1.0]. ExactMatch MUST be 1.0; SemanticMatch MUST be ≥ 0.90; FuzzyMatch MUST be in [0.50, 0.90); NoMatch MUST be 0.0."@en .

  holon:matchType a owl:ObjectProperty ;
      rdfs:label    "match type"@en ;
      rdfs:domain   holon:GroundingRecord ;
      rdfs:range    skos:Concept ;
      dcterms:description
          "The quality classification of this grounding result. MUST be a concept from holon:MatchTypeScheme."@en .

  # ── Concern Annotation ──────────────────────────────────────────────────

  holon:concernLevel a owl:ObjectProperty ;
      rdfs:label    "concern level"@en ;
      rdfs:range    skos:Concept ;
      dcterms:description
          "The concern level of a reified triple. This property is carried on a named reifier IRI in a Turtle 1.2 reification annotation. The reifier MUST be a named IRI (not a blank node) and MUST carry an rdfs:label. The concernLevel value MUST be a concept from holon:ConcernLevelScheme."@en ;
      sh:agentInstruction
          "concernLevel annotates a specific triple with a risk or impact grade. Read the reifier's rdfs:label to understand what the annotation is about, then use the concernLevel value to route or prioritise."@en .

}
```

---

## 3. SHACL 1.2 Shapes

Infrastructure-layer shapes for all holon types. Shapes validate the
`holon:` namespace vocabulary only. Payload validation is governed by
the shapes declared at `holon:boundary` on each holon instance.

<!-- databook:id: core-shapes -->
<!-- databook:graph: http://w3id.org/holon/#shapes -->
<!-- mode=normative norm=true conformance=core rfc2119=MUST -->
```trig
@prefix holon:   <http://w3id.org/holon/> .
@prefix sh:      <http://www.w3.org/ns/shacl#> .
@prefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd:     <http://www.w3.org/2001/XMLSchema#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix skos:    <http://www.w3.org/2004/02/skos/core#> .
@prefix owl:     <http://www.w3.org/2002/07/owl#> .

GRAPH <http://w3id.org/holon/#shapes> {

  # ── HolonShape (base) ────────────────────────────────────────────────────

  holon:HolonShape a sh:NodeShape ;
      sh:targetClass    holon:Holon ;
      sh:name           "Holon"@en ;
      sh:intent         "Validates that every holon has a stable IRI identity, a human-readable label, exactly one lifecycle status from the controlled vocabulary, and an optional but recommended description."@en ;
      sh:agentInstruction
          "This shape validates holonic infrastructure identity. Check that registrationStatus is present and from the LifecycleStatusScheme. A missing rdfs:label is a violation that prevents the holon from being properly addressed."@en ;
      sh:nodeKind sh:IRI ;

      sh:property [
          sh:path         rdfs:label ;
          sh:minCount     1 ;
          sh:or (
              [ sh:datatype xsd:string ]
              [ sh:datatype rdf:langString ]
          ) ;
          sh:languageIn   ( "en" ) ;
          sh:uniqueLang   true ;
          sh:severity     sh:Violation ;
          sh:message      "Every holon MUST have at least one English rdfs:label."@en ;
      ] ;

      sh:property [
          sh:path         holon:registrationStatus ;
          sh:minCount     1 ;
          sh:maxCount     1 ;
          sh:nodeKind     sh:IRI ;
          sh:in           ( holon:CandidateStatus
                            holon:RegisteredStatus
                            holon:DeprecatedStatus
                            holon:ArchivedStatus
                            holon:SuspendedStatus ) ;
          sh:severity     sh:Violation ;
          sh:message      "Every holon MUST have exactly one registrationStatus from holon:LifecycleStatusScheme."@en ;
      ] ;

      sh:property [
          sh:path         dcterms:description ;
          sh:maxCount     1 ;
          sh:severity     sh:Warning ;
          sh:message      "A holon SHOULD have a dcterms:description."@en ;
      ] ;

      sh:property [
          sh:path         holon:payloadGraph ;
          sh:maxCount     1 ;
          sh:nodeKind     sh:IRI ;
          sh:severity     sh:Warning ;
          sh:message      "A holon SHOULD declare a payloadGraph IRI."@en ;
      ] ;

      sh:property [
          sh:path         holon:boundaryMode ;
          sh:maxCount     1 ;
          sh:in           ( holon:OpenBoundary holon:ClosedBoundary ) ;
          sh:severity     sh:Violation ;
          sh:message      "If boundaryMode is present, it MUST be holon:OpenBoundary or holon:ClosedBoundary."@en ;
      ] ;

      sh:property [
          sh:path         holon:successor ;
          sh:nodeKind     sh:IRI ;
          sh:severity     sh:Violation ;
          sh:message      "holon:successor MUST reference a named IRI."@en ;
      ] ;

      sh:sparql [
          a sh:SPARQLConstraint ;
          sh:severity sh:Violation ;
          sh:message  "A holon with DeprecatedStatus MUST declare a successor."@en ;
          sh:prefixes holon: ;
          sh:select   """
              SELECT $this WHERE {
                  $this holon:registrationStatus holon:DeprecatedStatus .
                  FILTER NOT EXISTS { $this holon:successor ?s }
              }
          """ ;
      ] .

  # ── HomeHolonShape ───────────────────────────────────────────────────────

  holon:HomeHolonShape a sh:NodeShape ;
      sh:targetClass    holon:HomeHolon ;
      sh:name           "Home Holon"@en ;
      sh:intent         "Validates that a HomeHolon has all server binding requirements: serverEndpoint, registryGraph, and vocabularyEndpoint. The HomeHolon is the root container for a server and must be fully declared."@en ;
      sh:agentInstruction
          "The HomeHolon is the anchor of a holon server. Validate it first when onboarding a new server. Missing serverEndpoint or vocabularyEndpoint means the server cannot be properly addressed."@en ;
      sh:node           holon:HolonShape ;

      sh:property [
          sh:path         holon:serverEndpoint ;
          sh:minCount     1 ;
          sh:maxCount     1 ;
          sh:nodeKind     sh:IRI ;
          sh:severity     sh:Violation ;
          sh:message      "HomeHolon MUST have exactly one serverEndpoint IRI."@en ;
      ] ;

      sh:property [
          sh:path         holon:registryGraph ;
          sh:minCount     1 ;
          sh:maxCount     1 ;
          sh:nodeKind     sh:IRI ;
          sh:severity     sh:Violation ;
          sh:message      "HomeHolon MUST declare a registryGraph IRI."@en ;
      ] ;

      sh:property [
          sh:path         holon:vocabularyEndpoint ;
          sh:minCount     1 ;
          sh:maxCount     1 ;
          sh:nodeKind     sh:IRI ;
          sh:severity     sh:Violation ;
          sh:message      "HomeHolon MUST declare a vocabularyEndpoint IRI for the vocabulary server."@en ;
      ] .

  # ── IndexHolonShape ──────────────────────────────────────────────────────

  holon:IndexHolonShape a sh:NodeShape ;
      sh:targetClass    holon:IndexHolon ;
      sh:name           "Index Holon"@en ;
      sh:intent         "Validates that an IndexHolon declares a registryGraph. An IndexHolon is a discovery point; it MUST know where its registry lives."@en ;
      sh:agentInstruction
          "An IndexHolon is a directory. It must point to its registry graph."@en ;
      sh:node           holon:HolonShape ;

      sh:property [
          sh:path         holon:registryGraph ;
          sh:minCount     1 ;
          sh:nodeKind     sh:IRI ;
          sh:severity     sh:Violation ;
          sh:message      "IndexHolon MUST declare at least one registryGraph IRI."@en ;
      ] .

  # ── AgentHolonShape ──────────────────────────────────────────────────────

  holon:AgentHolonShape a sh:NodeShape ;
      sh:targetClass    holon:AgentHolon ;
      sh:name           "Agent Holon"@en ;
      sh:intent         "Validates infrastructure-layer requirements for agent holons. Agents must be identifiable. Agent capabilities and role metadata are payload content and are not validated here."@en ;
      sh:agentInstruction
          "An AgentHolon represents a participant. Validate its label and status. Its capabilities, roles, and contact details are in its payload graph."@en ;
      sh:node           holon:HolonShape .

  # ── OrganisationHolonShape ───────────────────────────────────────────────

  holon:OrganisationHolonShape a sh:NodeShape ;
      sh:targetClass    holon:OrganisationHolon ;
      sh:name           "Organisation Holon"@en ;
      sh:intent         "Validates infrastructure requirements for organisation holons. Inherits AgentHolonShape requirements. Organisations are collective agents."@en ;
      sh:agentInstruction
          "An OrganisationHolon is a collective actor. It inherits all agent requirements."@en ;
      sh:node           holon:AgentHolonShape .

  # ── PlaceHolonShape ──────────────────────────────────────────────────────

  holon:PlaceHolonShape a sh:NodeShape ;
      sh:targetClass    holon:PlaceHolon ;
      sh:name           "Place Holon"@en ;
      sh:intent         "Validates infrastructure requirements for place holons. Spatial geometry is payload content, not validated here. Place identity (label, status) MUST be present."@en ;
      sh:agentInstruction
          "A PlaceHolon is a location. Its label and status must be valid. Spatial coordinates are payload — look in the payloadGraph for geometry."@en ;
      sh:node           holon:HolonShape .

  # ── DataHolonShape ───────────────────────────────────────────────────────

  holon:DataHolonShape a sh:NodeShape ;
      sh:targetClass    holon:DataHolon ;
      sh:name           "Data Holon"@en ;
      sh:intent         "Validates infrastructure requirements for data holons. A DataHolon SHOULD declare a payloadGraph. Its boundary shapes govern the structure of the data resource."@en ;
      sh:agentInstruction
          "A DataHolon wraps a structured data resource. Check its payloadGraph to find the data, and its boundary to know what schema applies."@en ;
      sh:node           holon:HolonShape ;

      sh:property [
          sh:path         holon:payloadGraph ;
          sh:minCount     1 ;
          sh:nodeKind     sh:IRI ;
          sh:severity     sh:Warning ;
          sh:message      "DataHolon SHOULD declare a payloadGraph IRI."@en ;
      ] .

  # ── ProcessHolonShape ────────────────────────────────────────────────────

  holon:ProcessHolonShape a sh:NodeShape ;
      sh:targetClass    holon:ProcessHolon ;
      sh:name           "Process Holon"@en ;
      sh:intent         "Validates infrastructure requirements for process holons. Process state and progress metadata are payload content."@en ;
      sh:agentInstruction
          "A ProcessHolon tracks a running workflow. Its current state is in its payloadGraph. Events targeting it advance its state."@en ;
      sh:node           holon:HolonShape .

  # ── GroundingRecordShape ─────────────────────────────────────────────────

  holon:GroundingRecordShape a sh:NodeShape ;
      sh:targetClass    holon:GroundingRecord ;
      sh:name           "Grounding Record"@en ;
      sh:intent         "Validates that a grounding record carries all required grounding metadata: sourceString, matchType, and groundingConfidence. matchedIRI is required for all match types except NoMatch."@en ;
      sh:agentInstruction
          "A GroundingRecord is an entity recognition result. Always check matchType first. If ExactMatch, matchedIRI is authoritative. If FuzzyMatch, treat matchedIRI as provisional. If NoMatch, a new IRI needs minting."@en ;

      sh:property [
          sh:path         holon:sourceString ;
          sh:minCount     1 ;
          sh:maxCount     1 ;
          sh:datatype     xsd:string ;
          sh:severity     sh:Violation ;
          sh:message      "GroundingRecord MUST have exactly one sourceString."@en ;
      ] ;

      sh:property [
          sh:path         holon:matchType ;
          sh:minCount     1 ;
          sh:maxCount     1 ;
          sh:in           ( holon:ExactMatch
                            holon:SemanticMatch
                            holon:FuzzyMatch
                            holon:NoMatch ) ;
          sh:severity     sh:Violation ;
          sh:message      "GroundingRecord MUST have exactly one matchType from holon:MatchTypeScheme."@en ;
      ] ;

      sh:property [
          sh:path         holon:groundingConfidence ;
          sh:minCount     1 ;
          sh:maxCount     1 ;
          sh:datatype     xsd:decimal ;
          sh:minInclusive 0.0 ;
          sh:maxInclusive 1.0 ;
          sh:severity     sh:Violation ;
          sh:message      "GroundingRecord MUST have exactly one groundingConfidence in [0.0, 1.0]."@en ;
      ] ;

      sh:sparql [
          a sh:SPARQLConstraint ;
          sh:severity sh:Violation ;
          sh:message  "GroundingRecord with ExactMatch, SemanticMatch, or FuzzyMatch MUST have a matchedIRI."@en ;
          sh:prefixes holon: ;
          sh:select   """
              SELECT $this WHERE {
                  $this holon:matchType ?mt .
                  VALUES ?mt { holon:ExactMatch holon:SemanticMatch holon:FuzzyMatch }
                  FILTER NOT EXISTS { $this holon:matchedIRI ?iri }
              }
          """ ;
      ] ;

      sh:sparql [
          a sh:SPARQLConstraint ;
          sh:severity sh:Violation ;
          sh:message  "ExactMatch confidence MUST be 1.0."@en ;
          sh:prefixes holon: ;
          sh:select   """
              SELECT $this WHERE {
                  $this holon:matchType holon:ExactMatch ;
                       holon:groundingConfidence ?c .
                  FILTER (?c != 1.0)
              }
          """ ;
      ] ;

      sh:sparql [
          a sh:SPARQLConstraint ;
          sh:severity sh:Violation ;
          sh:message  "SemanticMatch confidence MUST be ≥ 0.90."@en ;
          sh:prefixes holon: ;
          sh:select   """
              SELECT $this WHERE {
                  $this holon:matchType holon:SemanticMatch ;
                       holon:groundingConfidence ?c .
                  FILTER (?c < 0.90)
              }
          """ ;
      ] ;

      sh:sparql [
          a sh:SPARQLConstraint ;
          sh:severity sh:Violation ;
          sh:message  "NoMatch confidence MUST be 0.0."@en ;
          sh:prefixes holon: ;
          sh:select   """
              SELECT $this WHERE {
                  $this holon:matchType holon:NoMatch ;
                       holon:groundingConfidence ?c .
                  FILTER (?c != 0.0)
              }
          """ ;
      ] .

  # ── ConcernAnnotationShape (reifier shape) ───────────────────────────────

  holon:ConcernAnnotationShape a sh:NodeShape ;
      sh:name    "Concern Annotation"@en ;
      sh:intent  "Validates the reifier node of a Turtle 1.2 concern-level annotation. The reifier MUST be a named IRI (not a blank node), MUST carry an rdfs:label describing the annotation, and MUST carry exactly one holon:concernLevel from the ConcernLevelScheme."@en ;
      sh:agentInstruction
          "A concern annotation reifier is the node that carries a concernLevel. It must be a named IRI so it can be referenced and cited. Its rdfs:label must explain what assertion is being annotated."@en ;
      sh:nodeKind sh:IRI ;

      sh:property [
          sh:path         rdfs:label ;
          sh:minCount     1 ;
          sh:languageIn   ( "en" ) ;
          sh:severity     sh:Violation ;
          sh:message      "Concern annotation reifier MUST have at least one English rdfs:label."@en ;
      ] ;

      sh:property [
          sh:path         holon:concernLevel ;
          sh:minCount     1 ;
          sh:maxCount     1 ;
          sh:in           ( holon:HighConcern
                            holon:MediumConcern
                            holon:LowConcern
                            holon:PositiveConcern ) ;
          sh:severity     sh:Violation ;
          sh:message      "Concern annotation MUST carry exactly one concernLevel from holon:ConcernLevelScheme."@en ;
      ] .

}
```

---

## 4. Global Reifier Integrity Constraint

The following SPARQL SELECT query is provided as an advisory conformance
check. It detects reifier nodes in the dataset that lack `rdfs:label`. This
check is non-normative (it is not expressible as a `sh:targetClass` shape
because reifiers are not necessarily typed); the normative requirement is
stated in the vocabulary declaration for `holon:concernLevel` (§2) and in
the `holon:ConcernAnnotationShape` (§3).

Implementations MAY run this query periodically as a data quality audit.

<!-- databook:id: reifier-integrity-check -->
<!-- mode=printed norm=false spec-status=stable -->
```sparql
PREFIX rdfs:  <http://www.w3.org/2000/01/rdf-schema#>
PREFIX holon: <http://w3id.org/holon/>

# Advisory check: find reifier IRIs that lack rdfs:label.
# Reifiers are identified by carrying holon:concernLevel or
# other known reifier-only properties.
# Run against the full dataset.

SELECT DISTINCT ?reifier ?graph WHERE {
    GRAPH ?graph {
        ?reifier holon:concernLevel ?level .
    }
    FILTER NOT EXISTS {
        ?reifier rdfs:label ?label .
    }
    FILTER(isIRI(?reifier))
}
ORDER BY ?graph ?reifier
```

---

## 5. Vocabulary Server Conformance Note

Every HomeHolon MUST declare a `holon:vocabularyEndpoint`. A GET request
to any IRI in the `http://w3id.org/holon/` namespace hierarchy via that
endpoint MUST return:

- `text/turtle` when `Accept: text/turtle` — the vocabulary DataBook for
  that namespace serialised as Turtle 1.2
- `text/html` when `Accept: text/html` — the HTML spec page for that term
- `application/ld+json` when `Accept: application/ld+json` — SHOULD return
  the JSON-LD compact serialisation using the context at
  `http://w3id.org/holon/context.jsonld`

A static DataBook file MUST be provided as a fallback when the vocabulary
server is unavailable. Implementations MUST NOT require a live network
connection to load the HGA vocabulary.

---

*Copyright 2026 Kurt Cagle / Semantical LLC. Specification prose: W3C Document
License. Ontology content: CC0-1.0.*
