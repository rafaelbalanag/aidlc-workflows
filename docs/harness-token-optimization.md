# Harness Token Optimization & Tooling Recommendations

This note documents the context/token optimization applied to the AI-DLC
Claude harness (`core-workflow.md` → `CLAUDE.md`) and recommends tools and MCP
servers that speed up AI-DLC development.

## 1. What was changed

The harness already lazy-loads **extensions** and **per-phase detail files**.
The remaining waste was the **eager bulk-load of 5 common files at workflow
start** plus boilerplate in the always-resident `CLAUDE.md`.

### Before — upfront context before any real work (~9,000 tokens)

| Loaded at start | ~Tokens | Truly needed at start? |
|---|---|---|
| `CLAUDE.md` (core-workflow) — always resident | ~4,400 | Yes |
| `question-format-guide.md` | ~1,800 | No — only when asking questions |
| `process-overview.md` | ~950 | No — redundant technical reference |
| `welcome-message.md` | ~780 | Once, then discardable |
| `content-validation.md` | ~500 | No — only before writing diagrams |
| `session-continuity.md` | ~510 | No — only when resuming |

### After — just-in-time loading (~4,600 tokens upfront)

Common files now load **only at their first point of need** via a load-trigger
table in `core-workflow.md`, then stay in context for the rest of the session.
The always-resident `CLAUDE.md` grew ~165 tokens (the table) but this **defers
~4,550 tokens** to the moment they are actually required — and several never
load at all in a simple change.

**Net effect:** ~48% less context consumed before the first phase begins,
leaving that budget for real phase work and delaying context-limit exhaustion.

### Design principles applied

- **Load once, reuse for the session** — never re-read a file already in context.
- **Point-of-need loading** — defer each file to its trigger (asking a question,
  writing a diagram, resuming a session).
- **A new `Context Budget` key principle** codifies this so every stage inherits
  the behavior.

## 1b. Audit-logging consolidation (applied — structural, token-neutral)

The 23 per-stage "log user input / log user's response" MANDATORY lines were
consolidated into a single **Standing Audit Rule** near the top of `CLAUDE.md`,
with each stage keeping only a terse `Audit-log ... (see Standing Audit Rule)`
pointer. The overlapping guidance in *Key Principles* and *Prompts Logging
Requirements* was de-duplicated against it.

**Honest outcome:** this is roughly **token-neutral** on the always-resident
file (the standing rule costs back most of what the terser pointers save). Its
real value is **single-source-of-truth maintainability** and reduced drift —
not a token win. Chasing further reduction here would require deleting the
per-stage pointers entirely and renumbering every stage's step list, which
risks compliance for ~145 tokens/turn; not worth it.

**What actually moves the needle is section 1 (JIT loading).** The always-
resident `CLAUDE.md` is ~76 words larger than baseline (the JIT table), but that
one table defers ~4,550 tokens of eager loads — an excellent trade.

## 2. Further token-saving opportunities (not applied — low real payoff)

Evaluated and deliberately skipped:

1. **Extracting the audit-format + directory-structure blocks** into a detail
   file loaded on first `audit.md` write. Skipped: `audit.md` is written on turn
   1, so the content loads immediately and then persists in conversation history
   regardless — relocating it saves ~0 real tokens while adding a load step and
   a reliability risk. Keep inline.
2. **Sub-agent offloading for reverse engineering.** Brownfield reverse
   engineering reads the whole codebase — run it in a sub-agent (Claude Code
   Task tool) so the large file reads never enter the main context; only the
   summary returns.
3. **Prompt caching.** The always-resident `CLAUDE.md` is a stable prefix — it is
   automatically eligible for Anthropic prompt caching, so trimming it lowers
   both cost and latency on every turn.

## 3. Recommended tools & MCP servers for faster development

### Claude Code built-ins already available in this workflow

- **Sub-agents (Task tool)** — offload reverse engineering, broad code search,
  and multi-file audits so their token cost never lands in the main context.
- **Skills** — `/code-review`, `/security-review`, `/verify`, `/simplify` map
  cleanly onto the Construction phase's Build-and-Test and review gates.
- **Plan mode** — pairs naturally with the Inception phase's approval gates.

### Configured MCP servers (`.mcp.json` at repo root)

A project-scoped **`.mcp.json`** now ships at the repo root. Claude Code picks
it up automatically (it prompts once to approve project-scoped servers). It is
deliberately **lean** — every configured server injects its tool schemas into
every request, which works against the same context budget this optimization
protects.

| Server (in `.mcp.json`) | Transport | Why it earns its schema tokens |
|---|---|---|
| **github** | Remote HTTP (`api.githubcopilot.com/mcp/`) | PR/issue/CI loop for Build-and-Test → review. The `X-MCP-Toolsets` header restricts it to `context,repos,issues,pull_requests,actions` so unused toolsets never cost schema tokens. Set `X-MCP-Readonly: true` for review-only sessions. |
| **context7** | Remote HTTP (`mcp.context7.com/mcp`) | Pulls current, version-specific library docs on demand during Code Generation — a net token *saver* vs. pasting docs into context or fixing hallucinated APIs. |
| **sequential-thinking** | stdio (`npx`) | One tool, tiny schema. Structured decomposition for Application Design / Units Generation. |

Remote HTTP transports are preferred where available: no local npm install,
no cold start, and auth via OAuth on first use.

### Deliberately excluded (gap review)

| Candidate | Why excluded |
|---|---|
| **Filesystem MCP** | Redundant — Claude Code's built-in Read/Write/Edit/Glob/Grep already cover it; adding it would only duplicate schema tokens. |
| **Memory / knowledge-graph MCP** | Redundant — AI-DLC already persists cross-session state in `aidlc-docs/aidlc-state.md` + `audit.md` (session-continuity rules). |
| **Playwright MCP** | Heavy (~20 tool schemas). Valuable in *application* projects for Build-and-Test e2e verification — add per-project: `claude mcp add playwright -- npx -y @playwright/mcp@latest`. Not needed in this rules repo. |
| **AWS / Terraform MCP** | Project-specific. Add in projects with Infrastructure Design stages (e.g. `uvx awslabs.aws-documentation-mcp-server@latest`). |

### Using this in YOUR project

The `.mcp.json` here doubles as a template: copy it to your application
project's root alongside the AI-DLC rules, then add the project-specific
servers (Playwright, AWS) only if your workflow reaches those stages.

```bash
claude mcp list   # verify what loaded and its connection status
```

Rule of thumb: **each server must earn its schema tokens every turn.** When a
server is only needed occasionally, prefer adding it for that session
(`claude mcp add ...`) over leaving it in `.mcp.json`.

## 4. Measuring it

To re-check upfront cost after edits:

```bash
wc -w aidlc-rules/aws-aidlc-rules/core-workflow.md   # always-resident
wc -w aidlc-rules/aws-aidlc-rule-details/common/*.md # deferred pool
# approx tokens = words * 1.33
```
