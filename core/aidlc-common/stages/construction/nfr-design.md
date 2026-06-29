---
slug: nfr-design
phase: construction
execution: CONDITIONAL
condition: Quality attributes (performance, security, scalability, reliability), tech-stack selection, or NFR patterns need to be made concrete for this unit. Skip if no NFR work is needed and the stack is already determined.
lead_agent: aidlc-architect-agent
support_agents:
  - aidlc-aws-platform-agent
  - aidlc-devsecops-agent
  - aidlc-compliance-agent
  - aidlc-quality-agent
mode: inline
reviewer: aidlc-architecture-reviewer-agent
reviewer_max_iterations: 2
for_each: unit-of-work
produces:
  - nfr-specification
consumes:
  - artifact: requirements
    required: true
  - artifact: functional-spec
    required: true
  - artifact: components
    required: false
  - artifact: technology-stack
    required: false
    conditional_on: brownfield
requires_stage:
  - units-generation
  - functional-design
sensors:
  - required-sections
  - upstream-coverage
  - blueprint-shape
  - linter
  - type-check
scopes:
  - enterprise
  - feature
  - mvp
  - infra
  - security-patch
  - workshop
inputs: requirements.md (NFR section), functional-design artifacts, components blueprint, RE technology-stack (if brownfield)
outputs: aidlc-docs/construction/{unit-name}/nfr-design/nfr-specification.md
---

# NFR Design

MANDATORY: Follow stage-protocol.md for approval gates, question format, and completion messages.

Make the unit's non-functional requirements concrete in a single pass: measurable quality targets, the technology-stack selection, the architectural patterns that satisfy each quality attribute, and the explicit trade-offs. This stage is **self-sufficient** — it captures whatever NFR targets are needed here, reading whatever the upstream `requirements` already carries and eliciting any missing targets in its own question step. There is no separate NFR-requirements stage.

## Steps

### Execution Modes

This stage supports two execution modes, controlled by the orchestrator:

**QUESTION-ONLY mode** (invoked by orchestrator during a Bolt's question phase):
Execute Steps 1–4 only (load personas, read artifacts, generate questions, collect answers).
Do NOT proceed to design or artifact generation. Return control to the orchestrator.

**ARTIFACT-ONLY mode** (invoked by orchestrator during a Bolt's design phase):
Skip Steps 1–4 (questions already collected and approved).
Read the answered questions file from the per-unit directory.
Execute Steps 5–8 only (design solutions, generate artifact, update state, completion).

**Full mode** (default — single-unit projects or direct stage invocation):
Execute all steps sequentially as written.

### Step 1: Load Personas

Load aidlc-architect-agent (lead) persona from `agents/aidlc-architect-agent.md` and knowledge from `{{HARNESS_DIR}}/knowledge/aidlc-architect-agent/`. Load aidlc-aws-platform-agent (platform/infra patterns), aidlc-devsecops-agent (security requirements + posture), aidlc-compliance-agent (regulatory constraint mapping), and aidlc-quality-agent (testable quality-attribute scenarios) personas and knowledge. Apply aidlc-architect-agent as the primary perspective with the others providing specialist input.

### Step 2: Read Prior Artifacts

Read `aidlc-docs/inception/requirements-analysis/requirements.md` (especially its NFR section). Read functional design artifacts from `aidlc-docs/construction/{unit-name}/functional-design/`. Read the `components` blueprint from `aidlc-docs/inception/domain-design/components.md` for the `cmp-NNN` ids the NFR posture will annotate. If brownfield, read any technology-stack artifacts from reverse-engineering for existing-stack constraints.

### Step 3: Assess NFR Categories and Generate Questions

Assess the unit across the NFR categories (performance, security, scalability, reliability, observability) and select the tech stack. Create a questions file at `aidlc-docs/construction/{unit-name}/nfr-design/nfr-design-questions.md` using [Answer]: tags. Because this stage is self-sufficient, the questions cover BOTH the quantitative targets (what "good" means) AND the design choices (how to achieve it):

- Quantifiable targets: response-time/latency budgets, throughput, availability SLO, durability, capacity/growth
- Security posture: authn/authz model, data classification, encryption at rest/in transit, compliance controls
- Resilience + scalability patterns: circuit breakers, retries/backoff, failover, horizontal/vertical scaling, partitioning, caching tiers
- Tech-stack selection: languages, frameworks, datastores, infra tools — with rationale
- Trade-offs: what is sacrificed for what, and why

### Step 4: Collect and Analyze Answers

Collect answers following stage-protocol.md §3 question flow (offer interaction mode choice, collect answers, write back to file). MANDATORY ambiguity analysis:
- Identify vague answers ("fast enough", "highly available", "secure", "mix of", "depends")
- Check for contradictions between targets
- Flag missing quantitative targets

If ANY ambiguity found: create follow-up questions and resolve before proceeding.

### Step 5: Design the NFR Solution

Design concrete, measurable solutions per category, each tied to the targets from Step 4:

- **Performance**: caching architecture, query/connection optimization, async patterns, CDN, performance budgets
- **Security**: authn/authz architecture, encryption design, input validation, secrets management, audit logging, compliance controls
- **Scalability**: scaling approach, load distribution, data partitioning/sharding, queue-based decoupling, capacity thresholds, auto-scaling rules
- **Reliability**: circuit breakers, retry policies with backoff, health checks, graceful degradation, failover, backup/replication
- **Tech stack + patterns**: the selected technologies and the architectural patterns that realize the above, with explicit trade-offs

### Step 6: Generate Artifact

Generate `aidlc-docs/construction/{unit-name}/nfr-design/nfr-specification.md` — the single NFR specification covering, in one document:
- Measurable quality targets (the "requirements" half: SLOs, budgets, capacity)
- Technology-stack decisions and rationale
- Architectural patterns per quality attribute (the "design" half)
- Trade-offs and constraints
- NFR posture annotations keyed to the `cmp-NNN` components they constrain (so the `blueprint-shape` sensor can verify every referenced component resolves upstream)

### Step 7: Update State

Update `aidlc-docs/aidlc-state.md`: mark NFR Design for {unit-name} as `[x]` completed and update "Current Status".

### Step 8: Completion

Present completion message and approval gate:

```
# :shield: NFR Design Complete — {unit-name}
```

Summary of targets, tech-stack choices, and patterns, then:

```
**Review:** `aidlc-docs/construction/{unit-name}/nfr-design/`
```

Approval gate: strictly 2-option (Approve / Request Changes).

## Sensors

This stage's output is the `nfr-specification` under `aidlc-docs/construction/nfr-design/`. Some sections include code samples that the code-shape sensors can also flag.

The imported sensors check that output:

- **`required-sections`** verifies the output contains the registry default (≥2 H2 headings).
- **`upstream-coverage`** verifies the output prose references each artefact declared in this stage's `consumes:` frontmatter (this stage consumes `requirements`, `functional-spec`, `components`, `technology-stack`).
- **`blueprint-shape`** verifies that every `cmp-NNN` the spec references resolves to a component declared in the upstream `components` blueprint. An orphan reference emits `SENSOR_FAILED`.
- **`linter`** runs against any TypeScript/JavaScript snippets the design includes (matches `**/*.{ts,js}`).
- **`type-check`** runs against any TypeScript/TSX snippets the design includes (matches `**/*.{ts,tsx}`).

Failure modes land in `aidlc-docs/.aidlc-sensors/<stage-slug>/` as `SENSOR_FAILED` audit rows with per-sensor detail files.

## Learn

While running this stage, maintain a running log in
`aidlc-docs/<phase>/<stage>/memory.md` (create on stage start if absent).
Append entries under four standard headings:

- **Interpretations** — choices made where the stage prose was ambiguous
- **Deviations** — places you intentionally departed from the stage prose, and why
- **Tradeoffs** — alternatives considered and why you picked what you did
- **Open questions** — anything to confirm before next run, or uncertain context

Format each entry with an ISO 8601 timestamp:
`- 2026-05-20T10:14:32Z — <summary>; <context>`

Before the approval gate, read memory.md and surface candidates as a
structured question. For each entry the user keeps, write to the appropriate
harness destination per `stage-protocol.md` §13 — never to this stage file:

- Prescriptive rule → `{{HARNESS_DIR}}/rules/aidlc-phase-<phase>.md` (phase-scoped)
  or `{{HARNESS_DIR}}/rules/aidlc-<org|team|project>.md` (cross-cutting)
- Verification check → new manifest at `{{HARNESS_DIR}}/sensors/aidlc-<id>.md`
  (capability descriptor only — no `applies_to`); add the new id to
  the relevant stage's `sensors: [...]` frontmatter list to wire it

If nothing surfaces or the user skips all, proceed to the gate. The memory.md
file stays in the artefact directory as part of the stage's permanent record.

Stage files are immutable framework artefacts — the ritual writes into the
harness, not into this file. Next time this stage runs, the new rules and
sensors load automatically.
