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

## 2. Further token-saving opportunities (not yet applied)

These are higher-effort or more opinionated; pick per appetite:

1. **De-duplicate per-stage audit boilerplate.** Every stage repeats two
   near-identical "log user input in audit.md" MANDATORY lines (~26 lines total).
   The standing rule already lives in *Prompts Logging Requirements*. Replacing
   the inline repeats with a single reference saves ~300 always-resident tokens.
2. **Move the audit-log format block + directory-structure diagram** out of the
   always-resident `CLAUDE.md` into a `common/audit-and-layout.md` loaded on
   first write to `audit.md`. Saves ~600 always-resident tokens.
3. **Sub-agent offloading for reverse engineering.** Brownfield reverse
   engineering reads the whole codebase — run it in a sub-agent (Claude Code
   Task tool) so the large file reads never enter the main context; only the
   summary returns.
4. **Prompt caching.** The always-resident `CLAUDE.md` is a stable prefix — it is
   automatically eligible for Anthropic prompt caching, so trimming it lowers
   both cost and latency on every turn.

## 3. Recommended tools & MCP servers for faster development

### Claude Code built-ins already available in this workflow

- **Sub-agents (Task tool)** — offload reverse engineering, broad code search,
  and multi-file audits so their token cost never lands in the main context.
- **Skills** — `/code-review`, `/security-review`, `/verify`, `/simplify` map
  cleanly onto the Construction phase's Build-and-Test and review gates.
- **Plan mode** — pairs naturally with the Inception phase's approval gates.

### MCP servers worth adding

| MCP server | Why it helps AI-DLC |
|---|---|
| **GitHub MCP** | PR/issue/CI automation for the Build-and-Test → review loop without leaving the workflow. |
| **Filesystem MCP** | Scoped, auditable file access for the `aidlc-docs/` tree. |
| **Context7 / docs-fetch MCP** | Pulls current library/API docs on demand during Code Generation instead of guessing from training data. |
| **Sequential-thinking MCP** | Structured multi-step reasoning for Application Design and Units Generation decomposition. |
| **Playwright MCP** | Drives the app for e2e verification in Build-and-Test (Chromium is preinstalled in this environment). |
| **AWS / Terraform MCP** | Grounds Infrastructure Design in real resource schemas and validated IaC. |

### How to add an MCP server to Claude Code

```bash
# example: GitHub MCP
claude mcp add github -- npx -y @modelcontextprotocol/server-github
# then confirm it loaded
claude mcp list
```

Keep each server **scoped** — the more tools in context, the more schema tokens
per turn, which works against the same budget this optimization protects. Add
servers per project need rather than globally.

## 4. Measuring it

To re-check upfront cost after edits:

```bash
wc -w aidlc-rules/aws-aidlc-rules/core-workflow.md   # always-resident
wc -w aidlc-rules/aws-aidlc-rule-details/common/*.md # deferred pool
# approx tokens = words * 1.33
```
