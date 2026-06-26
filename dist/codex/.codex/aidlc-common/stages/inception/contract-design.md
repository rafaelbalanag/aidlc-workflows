---
slug: contract-design
phase: inception
execution: CONDITIONAL
condition: Execute when units-generation produced more than one unit (inter-unit boundaries exist that need contracts). Skip when there is a single unit (no inter-unit boundary to contract).
lead_agent: aidlc-architect-agent
support_agents:
  - aidlc-product-agent
mode: inline
reviewer: aidlc-architecture-reviewer-agent
reviewer_max_iterations: 2
produces:
  - contracts
  - contract-summary
consumes:
  - artifact: unit-of-work
    required: true
  - artifact: unit-of-work-dependency
    required: true
  - artifact: components
    required: false
  - artifact: requirements
    required: false
requires_stage:
  - units-generation
sensors:
  - required-sections
  - upstream-coverage
scopes:
  - enterprise
  - feature
  - mvp
  - workshop
inputs: aidlc-docs/inception/units-generation/unit-of-work.md, aidlc-docs/inception/units-generation/unit-of-work-dependency.md, aidlc-docs/inception/domain-design/components.md
outputs: aidlc-docs/inception/contract-design/contracts/ (one spec per inter-unit boundary), aidlc-docs/inception/contract-design/contract-summary.md
---

# Contract Design

MANDATORY: Follow stage-protocol.md for approval gates, question format, and completion messages.

Define the contracts between units so teams can build in parallel with confidence. A **contract** is the formal agreement between a provider unit and a consumer unit — what data crosses the boundary, in what shape, via what protocol, and what happens when things go wrong. This must be ~90% right from the start: think of two teams in two companies, where the contract is the B2B agreement. Get it wrong and integration becomes a rework disaster. Contracts cover the boundaries BETWEEN units; the internals of each unit are detailed later, per-unit, in functional-design.

## Steps

### Step 1: Load Agent Personas

Load aidlc-architect-agent persona from `agents/aidlc-architect-agent.md` and knowledge from `.codex/knowledge/aidlc-architect-agent/`.
Load aidlc-product-agent persona from `agents/aidlc-product-agent.md` and knowledge from `.codex/knowledge/aidlc-product-agent/` for business-meaning validation of the data crossing each boundary.

### Step 2: Load Prior Context

- Read `aidlc-docs/inception/units-generation/unit-of-work.md` and `aidlc-docs/inception/units-generation/unit-of-work-dependency.md` (who talks to whom — the inter-unit edges)
- Read `aidlc-docs/inception/domain-design/components.md` (the `cmp-NNN` component model — entity shapes inform payload design)
- Read `aidlc-docs/inception/requirements-analysis/requirements.md` (NFRs shape SLAs and error budgets)

### Step 3: Identify the Boundaries Needing Contracts

From `unit-of-work-dependency.md`, enumerate every inter-unit edge (every place one unit depends on another). Each such edge is a boundary that needs a contract. Single-unit projects have no inter-unit edges — this stage is skipped by the orchestrator in that case (see frontmatter `condition`).

### Step 4: Create Plan with Questions

Create `aidlc-docs/inception/contract-design/contract-design-questions.md` using [Answer]: tag format. Focus on:
- Integration mechanism per boundary (synchronous REST/HTTP, event-driven/async messaging, shared schema/data)
- Payload shapes and which `cmp-NNN` components own the data on each side
- Error/failure behaviour, retries, idempotency, and timeout expectations
- Versioning and backward-compatibility strategy per contract
- SLAs / error budgets where NFRs apply

Collect answers following stage-protocol.md §3 question flow. MANDATORY ambiguity analysis: resolve vague or contradictory answers with follow-up questions before proceeding.

### Step 5: Generate Contract Artifacts

Create the following in `aidlc-docs/inception/contract-design/`:

**`contracts/` directory** — one spec file per inter-unit boundary, in the format appropriate to its integration mechanism:
- OpenAPI spec — for synchronous REST/HTTP contracts
- AsyncAPI spec — for event-driven / message-based contracts
- Shared schema definition — for shared-database or shared-model contracts
- Any other format appropriate to the integration mechanism

Each contract names the provider unit, the consumer unit(s), the `cmp-NNN` components on each side of the boundary, the payload shapes, the protocol, error behaviour, and the versioning stance.

**`contract-summary.md`** — human-readable overview: a table of every inter-unit boundary, its contract mechanism, the provider/consumer units, the referenced `cmp-NNN` components, and who owns the contract. Include a diagram of the unit boundaries and their contracts.

### Step 6: Update State

Update `aidlc-docs/aidlc-state.md`:
- Mark Contract Design as `[x]` completed
- Update current stage and next stage

### Step 7: Present Completion & Request Approval

Use stage-protocol.md completion template with completion emoji: :handshake:
- Summary of the contracts defined (count + boundaries covered)
- Key integration-mechanism decisions highlighted
- Review path: `aidlc-docs/inception/contract-design/`
- Structured approval question (Approve / Request Changes).

## Sensors

This stage's outputs are the contract specs and summary under `aidlc-docs/inception/contract-design/`.

The imported sensors check those outputs:

- **`required-sections`** verifies the output contains the registry default (≥2 H2 headings). Failure mode: missing headings emit `SENSOR_FAILED` with detail at `aidlc-docs/.aidlc-sensors/<stage-slug>/required-sections-<iso>.md`.
- **`upstream-coverage`** verifies the output prose references each artefact declared in this stage's `consumes:` frontmatter (this stage consumes `unit-of-work`, `unit-of-work-dependency`, `components`, `requirements`).

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

- Prescriptive rule → `.codex/aidlc-rules/aidlc-phase-<phase>.md` (phase-scoped)
  or `.codex/aidlc-rules/aidlc-<org|team|project>.md` (cross-cutting)
- Verification check → new manifest at `.codex/sensors/aidlc-<id>.md`
  (capability descriptor only — no `applies_to`); add the new id to
  the relevant stage's `sensors: [...]` frontmatter list to wire it

If nothing surfaces or the user skips all, proceed to the gate. The memory.md
file stays in the artefact directory as part of the stage's permanent record.

Stage files are immutable framework artefacts — the ritual writes into the
harness, not into this file. Next time this stage runs, the new rules and
sensors load automatically.
