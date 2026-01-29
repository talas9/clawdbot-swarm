# Clawdbot Swarm Implementation - Execution Plan
**Version:** 1.0
**Date:** 2026-01-31
**Branch:** execution-plan-codex
**Status:** Draft (for implementation kick-off)

## Context
All architecture and specialist design work for the Swarm Memory system has been merged to `main` (`design/`, `skills/swarm-memory/`, `swarm-memory-implementation-plan.md`, `advocate.md`, `critic.md`, `debate-protocol.md`, etc.). This document translates that design into a sequenced, gated implementation plan that the Codex branch can execute.

---

## 1. Maturity Assessment
### Methodology
Reviewed the merged design assets:
- `design/` package (overview, architecture, specs, guides)
- `skills/swarm-memory/` (skill manifest, CSP/1 spec, router, specialists, maintenance, testing)
- `swarm-memory-implementation-plan.md` (implementation intent and timelines)
- Dialectic files (`advocate.md`, `critic.md`, `debate-protocol.md`, `failures.jsonl` template)

### Component Ratings
| Component | Rating | Notes |
|-----------|--------|-------|
| Core architecture / CSP/1 protocol | READY | CSP/1 defined, router decision tree documented, system boundaries articulated in `design/` and `router.md`. |
| Memory tier & Graphiti design | READY | Tier configs, schema, Graphiti integration rationale, temporal queries captured in `skills/swarm-memory/memory-tiers/` and `design/specs/graphiti/`. |
| Specialist agents | READY | Memory/File/Web/Tool specialists fully scoped with CSP/1 contracts (`specialists/*.md`). |
| Sub-agents & debate layer | READY | Analyzer, Planner, Advocate, Critic, and debate flow documented (`subagents/*.md`, `debate-protocol.md`). |
| Maintenance & CLI utilities | READY | Cron procedures and optimizer described; `swarm-cli` scaffolds the automation commands. |
| Testing & validation | NEEDS_WORK | Test scenarios exist (`skills/swarm-memory/TESTING.md`) but no automated harness, nor integration with CI gates. |
| Memory access enforcement | NEEDS_WORK | Audit (`MEMORY-ACCESS-AUDIT.md`) highlighted documentation, parser, and test updates that still must be implemented. |

Gaps were noted where immediate-action items remain (testing automation and parser/router enforcement) even though specifications are in place.

---

## 2. Gap Analysis
- **Well-defined / ready for implementation:**
  - Architecture, CSP/1, router, and memory boundary philosophy are fully specified.
  - Graphiti+Neo4j episode storage model is described with templates and examples.
  - Specialists, sub-agents, debate flows, and maintenance procedures all have working specifications and CLI scaffolds.
  - `swarm-memory-implementation-plan.md` already sequences phases and highlights automation tools.

- **Needs more detail / work:**
  - Automated tests capturing CSP/1 validation, router classification, Graphiti connectivity, and debate triggers are missing.
  - Parser enforcement on memory scopes (`MEM` only for Memory Specialist), router hard enforcement, and the audit’s recommended documentation updates are still outstanding.
  - Production configuration (secrets management, rate limiting, monitoring thresholds, and fallback modes) needs to be codified before rollout.
  - Migration scripts or rollback guidance for existing JSONL-based memory data (if not adopting “fresh start”) require fleshing out.

- **Dependencies that must be satisfied before implementation:**
  - Neo4j 5.26+ instance for Graphiti backend plus Python 3.10+ environment for MCP server.
  - OpenAI API keys (LLM & embeddings) accessible to Graphiti/Memory Specialist.
  - Clawdbot gateway with MCP support and ability to run new `skills/swarm-memory` skill.
  - `swarm-cli` working tree for CLI validations.
  - Access to host for cron jobs and monitoring agents.

- **Risks observed:**
  - Graphiti/OpenAI availability and cost sensitivity (LLM extraction + debate tokens).
  - Memory growth/Neo4j saturation if decay/maintenance not automated.
  - CSP/1 parser or router misclassification could bypass specialists, violating boundaries.
  - Failure loops or debate storms delaying critical tasks.

---

## 3. Phased Execution Plan
Each phase produces human-reviewable deliverables, includes time estimates, prerequisites, success criteria, and rollback strategies.

### Phase 0: Prerequisites & Environment Setup (6–8h)
- **Deliverables:**
  - Verified base repo/branch is clean and `execution-plan-codex` checked out.
  - Neo4j + Graphiti MCP server environments provisioned; Python 3.10+ runtime ready.
  - OpenAI API credentials stored securely, `NEO4J_URI`/`USER`/`PASSWORD` wired into config.
  - `swarm-cli` verified (`npm test`, `npm run swarm validate`) on host; `skills/swarm-memory` directory recognized by Clawdbot.
  - `memory/` directory scaffolded (daily logs, `failures.jsonl`, metrics folders) and linked in config.
  - Audit action items documented for Phase 1 (parser enforcement, memory access docs) and immediate tasks queued.
- **Prerequisites:** access to host, permission to install dependencies, API keys, base architecture docs.
- **Success Criteria:** Dependencies installed, config files exist and pass validation, CLI tools run without errors, memory directories present, audit checklist documented.
- **Rollback Strategy:** If prerequisites fail, revert config changes, stop/deprovision Graphiti/Neo4j services, remove API keys from env, return to clean branch.

### Phase 1: Core Infrastructure, Protocols & Enforcement (1.0–1.5 days)
- **Deliverables:**
  - CSP/1 parser and formatter implemented (`skills/swarm-memory/parser/`) with `validateMemoryAccess` to enforce `MEM` scope only via Memory Specialist.
  - Router enforcement (soft prompt + optional hard TypeScript hook) integrated into Clawdbot gateway; `router.md` and `AGENTS.md` updated to cite memory access rules and debate triggers.
  - `SKILL.md` entry wired into Clawdbot skill registry; orchestrator prompt references CSP/1 rules.
  - Audit recommendations executed: add explicit memory prohibition sections to non-memory specialist docs, parser validation, and unnamed tests in `skills/swarm-memory/TESTING.md`.
  - Basic CSP/1 unit tests (parser, formatter, router classification) created (Jest/TypeScript) and invoked via `swarm-cli validate`.
- **Prerequisites:** Phase 0 complete, `swarm-cli` functional, documentation references available.
- **Success Criteria:** CSP/1 parser passes validation, router classifies sample tasks (ACTION vs ANSWER), parser throws on unauthorized `MEM` scopes, documentation and tests updated, skill registered.
- **Rollback Strategy:** Revert parser/router commits, disable new skill and tests, optionally toggle feature flag to fallback to soft routing.

### Phase 2: Graphiti Integration & Memory Specialist (1.5–2 days)
- **Deliverables:**
  - Graphiti MCP server configured (using templates) and connected to Neo4j; health checks/logging added.
  - Memory Specialist Python code implements operations (recall/store/link/decay) via MCP tools, returning CSP/1 formatted responses.
  - Episode ingestion plus hybrid search flows exercised (store sample episode, run search to confirm relevance/links).
  - Memory tier mapping wired (`short` → daily logs, `medium` → Graphiti, `long` → `MEMORY.md`), including Graphiti data model (entities/relations) definitions.
  - Failure tracking infrastructure (`memory/failures.jsonl`, task hashing via SHA-256) ready for Phase 3 debates.
- **Prerequisites:** Phases 0 and 1 complete, Graphiti credentials, `memory` directories in place.
- **Success Criteria:** Graphiti can add/search episodes (<300ms); Memory Specialist only uses MCP; graph relationships appear; episodes tagged with reference time; initial decay/test entry handled; `memory/failures.jsonl` accumulates hashed tasks.
- **Rollback Strategy:** Temporarily disable Graphiti calls (fallback to JSONL storage), revert config to pre-Graphiti state, stop MCP server if unstable.

### Phase 3: Sub-Agents & Debate Layer (1.5 days)
- **Deliverables:**
  - Analyzer & Planner implemented to decompose tasks, order execution, and emit CSP/1 task lists.
  - Advocate & Critic agents coded per `advocate.md`/`critic.md` (planning + failure modes) and wired into debate protocol; Orchestrator synthesizer able to emit `RESOLUTION` outcomes.
  - Debate triggers wired into router (destructive, deployment, bulk, failure counts) and logs appended to `memory/YYYY-MM-DD.md`.
  - Failure loop protections: concurrency-limited attempts, `failures.jsonl` queries before execution, auto-escalation after 3+ failures.
  - Memory Specialist invoked to store debate resolutions and modifications where applicable.
- **Prerequisites:** Phases 0–2 complete, `failures.jsonl` seeded, `router` can detect debate triggers, `swarm-cli` tests pass.
- **Success Criteria:** High-stakes requests generate debates, Advocate and Critic respond in CSP/1 format, Orchestrator synthesizes (PROCEED/MODIFY/etc.), failure sequences trigger failure debates, and logs recorded.
- **Rollback Strategy:** Disable debate triggers (revert to PASS scenario), revert sub-agent code paths, escalate to human manually while rewriting logic.

### Phase 4: Testing & Validation (1 day)
- **Deliverables:**
  - Automated test suite covering CSP/1 parser/formatter, router classification, memory boundary enforcement, Graphiti add/search/decay, debate flow simulations, and CLI validation commands.
  - Integration scenarios executed (memory recall, file + memory coordination, debate sequence, failure loop, decay sequence) documented in `skills/swarm-memory/TESTING.md` and automated where possible.
  - `swarm-cli validate --phase <n>` run for all completed phases; results attached to release notes.
  - Performance/latency checks logged (Graphiti <300ms, debate <3s) and monitoring hooks primed (metrics file writes).
- **Prerequisites:** Phases 0–3 complete, test harness framework chosen (Jest/PyTest), Graphiti accessible in test environment.
- **Success Criteria:** All automated tests pass, integration checklists marked done, scenario logs exist, coverage for memory access boundaries and debate triggers verified.
- **Rollback Strategy:** If tests fail, halt deployment, debug failing tests, revert insecure changes, re-run `swarm-cli validate` once fixed.

### Phase 5: Deployment & Monitoring (0.5–1 day)
- **Deliverables:**
  - Deploy skill to live Clawdbot instance: add `skills/swarm-memory`, update `AGENTS.md`, enable `swarm-cli` across agent sessions.
  - Schedule maintenance cron jobs (daily decay, weekly consolidation, monthly rebuild) per `maintenance/*.md`; ensure logs/metrics stored in `memory/metrics/`.
  - Configure monitoring/alerts for Neo4j health, Graphiti MCP status, debate frequency, token usage, disk growth, and failure loop rate.
  - Document rollback procedures (disable skill, stop cron, revert `AGENTS.md`, revert Graphiti config).  Create runbook for debugging debate overrides.
- **Prerequisites:** Phase 4 tests green, monitoring tooling available, production credentials for Neo4j/OpenAI.
- **Success Criteria:** Cron jobs triggered (check last run), monitoring dashboards reporting metrics within thresholds, storage budgets tracked, maintenance tasks completing without errors, `swarm-cli validate` run in production shows success.
- **Rollback Strategy:** Disable cron jobs, move `skills/swarm-memory` directory to `.disabled`, revert `AGENTS.md`, stop Graphiti MCP, and restart Clawdbot gateway.

---

## 4. Risk Assessment
### Technical Risks
1. **Graphiti / OpenAI dependency (LLM extraction + embeddings)** — if OpenAI throttles or costs spike, memory ingestion/searchs stall.
   - *Mitigation:* implement health checks, circuit breakers, fallback JSONL storage, token budget alerts, local model (Anthropic) as backup.
2. **Memory growth / Neo4j performance** — without decay, relation count spirals.
   - *Mitigation:* enforce cron-driven decay/weekly consolidation, monitor disk usage, prune low-relevance links, scale Neo4j with indexes.
3. **CSP/1 parser or router misclassification** — specialists might be bypassed or receive malformed requests.
   - *Mitigation:* unit tests for parser, router, and boundary checks; parser throws on `MEM` access from non-memory specialist; `swarm-cli validate` ensures format compliance.
4. **Failure/debate storms** — repeated debates could increase cost/latency.
   - *Mitigation:* limit debates (skip for trivial commands, bypass on override, auto-escalate after 3 failures), add timers per debate, log metrics to tune thresholds.

### Operational Risks
1. **Configuration drift / deployment mistakes** — missing cron or incorrect secrets could cripple memory operations.
   - *Mitigation:* Use `swarm-cli validate`, document runbooks, keep backup configs (`AGENTS.md` snapshots), stage deployments.
2. **Monitoring gaps** — outages in Neo4j/Graphiti may go unnoticed.
   - *Mitigation:* set alerts for MCP health, Graphiti latency, disk usage, debate frequency, and token burn; integrate with telemetry (console/Slack/email).
3. **Cost overrun** — high-volume debates or Graphiti queries inflate OpenAI spend.
   - *Mitigation:* track token usage per specialist, cap high-volume tasks, reuse cached results, throttle Graphiti queries, escalate when approaching budget.

### Cost Estimates (Recurring)
- **Hosting (Neo4j + Graphiti MCP):** $40–80/mo (small VM with Bolt port, Python process, backups).
- **OpenAI usage (entity extraction + search + debates):** $150–400/mo depending on task volume (dialogue+memory writes + debates). CSP/1 reduces natural language usage but debates still increase spend; monitor via token logging.
- **Storage & Maintenance:** negligible (<$20/mo) assuming logs remain small; object store for backups if needed adds ~$10/mo.

---

## 5. Go / No-Go Recommendation
**Recommendation:** ✅ **GO** with gated execution. Preconditions are solid (design docs exist), but we must execute Phase 0 (environment + dependencies) and Phase 4 (testing) before turning Swarm Memory on for production traffic.  The plan addresses the remaining open gaps (parser enforcement, testing automation, Graphiti implementation, boundary violations) and includes rollback strategies per phase.

**Trigger for implementation:** once Phase 0 checklist is green, Phase 1 parser/router enforcement is in place, and Phase 4 automated tests pass, we can execute Phases 2–5 sequentially, monitoring the rollout at each milestone.
