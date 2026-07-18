# Model and Effort Selection

**Purpose**: Match each stage to the least expensive model tier and reasoning effort that can do the work well, so premium model capacity is spent only where it changes outcomes.

## Core Principle

**Spend deep reasoning on decisions, not mechanics.**

Stages that shape the system (architecture, complex design) deserve the most capable model and high reasoning effort. Stages that scan, collect, or transcribe do not. Model recommendations are ADVISORY — they inform the user but NEVER block or pause the workflow.

## Model Tiers

AI-DLC defines three tiers plus an optional frontier tier. The tiers are platform-agnostic — map them to whatever model lineup your platform offers:

- **Efficient**: Fastest, lowest-cost model with minimal reasoning effort. For mechanical, well-specified work where the steps are prescribed and judgment is limited.
- **Standard**: Balanced workhorse model with default reasoning effort. For most analysis, design, and code generation work.
- **Deep**: Most capable generally used reasoning model with extended thinking / high reasoning effort. For architecture-critical, high-risk, or high-ambiguity work where a wrong decision is expensive to unwind.
- **Frontier** (optional): Highest-capability tier where available. Reserve for the hardest problems — large multi-unit system architecture, high-risk comprehensive designs, deeply unfamiliar brownfield systems. If usage limits are a concern, skip this tier entirely; Deep is sufficient for most projects.

### Example Mapping: Claude Model Family

| Tier      | Claude Model | Characteristics                                                          |
| --------- | ------------ | ------------------------------------------------------------------------ |
| Efficient | Haiku 4.5    | Fast and inexpensive; ideal for scanning and mechanical steps            |
| Standard  | Sonnet 5     | Balanced capability and cost; the default workhorse                      |
| Deep      | Opus 4.8     | Strongest general reasoning; use extended thinking for design decisions  |
| Frontier  | Fable 5      | Mythos-class tier above Opus; reserve for the most critical architecture |

Platforms with a different lineup should substitute their small / medium / large reasoning models for Efficient / Standard / Deep, and omit Frontier if no equivalent exists.

## Per-Stage Recommendations

| Stage                            | Default Tier | Escalate To | Escalate When                                                        |
| -------------------------------- | ------------ | ----------- | -------------------------------------------------------------------- |
| Workspace Detection              | Efficient    | —           | Never — mechanical workspace scanning                                |
| Reverse Engineering              | Standard     | Deep        | Large, unfamiliar, or multi-service codebase                         |
| Requirements Analysis            | Standard     | Deep        | Comprehensive depth, ambiguous or high-risk requirements             |
| User Stories                     | Standard     | —           | Rarely needed — drop to Efficient at minimal depth                   |
| Workflow Planning                | Standard     | Deep        | Many conditional stages or complex multi-package sequencing          |
| Application Design               | Deep         | Frontier    | Large multi-unit or distributed system, high-risk architecture       |
| Units Generation                 | Standard     | Deep        | Complex dependency graph between units                               |
| Functional Design (per-unit)     | Standard     | Deep        | Complex business logic, intricate data models                        |
| NFR Requirements (per-unit)      | Standard     | —           | Rarely needed — structured assessment                                |
| NFR Design (per-unit)            | Standard     | Deep        | Performance-, security-, or resiliency-critical unit                 |
| Infrastructure Design (per-unit) | Standard     | Deep        | Multi-region, high-availability, or novel infrastructure             |
| Code Generation Part 1: Planning | Standard     | Deep        | Unit flagged complex or critical in the units plan                   |
| Code Generation Part 2: Code     | Standard     | Deep        | Only for units where the plan calls out intricate logic              |
| Build and Test                   | Efficient    | Standard    | Diagnosing non-trivial build or test failures                        |
| Operations                       | —            | —           | Placeholder stage                                                    |

## Reasoning Effort by Tier

Where the platform exposes a reasoning/thinking control, pair it with the tier rather than leaving it at one setting for the whole workflow:

- **Efficient tier**: Reasoning off or minimal. The rules prescribe the steps.
- **Standard tier**: Default reasoning effort.
- **Deep / Frontier tier**: Extended thinking or high reasoning effort — these stages are exactly where deliberate reasoning pays for itself.

## Interaction with Adaptive Depth

Tier and depth (see `depth-levels.md`) move together:

- **Minimal depth**: A Standard-tier stage may drop to Efficient.
- **Standard depth**: Use the stage's default tier.
- **Comprehensive depth**: Escalate the stage one tier (Standard → Deep; Deep → Frontier where available).

## Behavior Rules

1. **At each stage transition**, determine the recommended tier from the table above, adjusted for depth and the escalation criteria.
2. **If the recommendation differs** from the tier the session is currently running on (when known), append ONE line to the stage-start message, for example:
   `💡 Model tier for this stage: Deep (e.g., Opus). Switch with your platform's model command (Claude Code: /model), or continue as-is.`
3. **NEVER block**: Do not pause, wait, or re-prompt for a model switch. If the user does not switch, proceed on the current model.
4. **Do not repeat**: If the user ignores or declines a recommendation for a stage, do not raise it again within that stage.
5. **Respect a fixed preference**: If the user says to stay on one model, record it in `aidlc-docs/aidlc-state.md` under `## Model Preference` and suppress all further recommendations for the workflow.
6. **Programmatic switching**: An agent that can switch models itself MUST ask before moving to a higher-cost tier, but MAY move to a lower-cost tier silently and note it in the stage-start message.
7. **Audit**: Log each recommendation and the user's action (switched / declined / ignored) once in `audit.md`.
8. **Per-unit loop**: Do not oscillate tiers within a unit. Choose the tier when the unit's stage begins and keep it until the stage's approval message; approval/answer turns stay on the current model.

## What This Is Not

- NOT a hard requirement — every stage runs correctly on any tier; recommendations only optimize cost and limit consumption.
- NOT a license to degrade quality — if the current model is struggling with a Deep-tier stage (repeated corrections, shallow designs), recommend escalation even if the table default was lower.
- NOT platform-specific — the Claude mapping is an example; keep recommendations phrased by tier first, with the platform's concrete model named as an aid.
