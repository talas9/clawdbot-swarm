# Agent Swarm Memory Architecture — Clawdbot Implementation Plan

**Version:** 1.1  
**Target:** Clawdbot/Moltbot self-modification  
**Owner:** Mohammed Talas (@talas9)  
**Estimated Time:** 5-7 hours (autonomous execution)

---

## MISSION BRIEF

You are modifying yourself to become a hierarchical agent swarm with:
1. **Strict role separation** (Orchestrator → Sub-agents → Specialists)
2. **CSP/1 inter-agent protocol** (token-efficient, prose-free)
3. **Tiered memory** (ultra-short → short → medium → long)
4. **Self-improving memory maintenance**

After each phase, **use the capabilities you just built** to assist with subsequent phases.

---

## PHASE 0: FOUNDATION (60 min)

### 0.1a Task Router — Soft Enforcement (15 min)

**Purpose:** Prevent "lazy orchestrator" syndrome with deterministic task classification.

**Create:** `~/clawd/skills/swarm-memory/router.md` (see `router.md` in repo root for full spec)

**Key Points:**
- **ANSWER precedence:** Question patterns + no external refs → direct response
- **ACTION triggers:** File paths, keywords (fix, search, run), URLs → swarm mode
- **Default:** When in doubt → ACTION mode
- **Logging:** All routing decisions logged to `memory/YYYY-MM-DD.md`

**Validation:**
1. Test against 20+ sample tasks
2. Verify >90% correct routing
3. Document edge cases
4. Iterate on patterns

**Example Routing Decisions:**
```
✅ "What is HPOS?" → ANSWER (question, no external refs)
✅ "Fix E2E tests in zbooks repo" → ACTION (keywords: fix, tests, repo)
✅ "How do I find files?" → ANSWER (question precedence)
✅ "Find all .ts files in src/" → ACTION (file extension + path)
```

### 0.1b Task Router — Hard Enforcement (30 min) — OPTIONAL

**Purpose:** Code-based routing before LLM call (zero trust enforcement).

**Location:** Clawdbot gateway/runtime (local patch)

**Implementation:** TypeScript regex classifier in message handler

**See:** `router.md` Phase 0.1b section for full TypeScript implementation

**Benefits:**
- LLM never gets choice to ignore routing
- Bulletproof enforcement
- Can measure ANSWER vs ACTION ratio

**Rollback:** Feature flag `ENABLE_HARD_ROUTING=false` for fallback

**Note:** Start with 0.1a (soft routing), validate patterns, then optionally implement 0.1b for hard enforcement.

### 0.2 Create Swarm Skill Directory
```bash
mkdir -p ~/clawd/skills/swarm-memory
```

### 0.3 Create CSP/1 Protocol Specification
Create `~/clawd/skills/swarm-memory/CSP1.md`:

```markdown
# CSP/1 — Compact Symbol Protocol v1

## Mode Declaration
CSP/1 MODE;!prose;DATA ONLY

## Laws
- L1: file:line refs only
- L2: !full content (never return full files)
- L3: !>2500tok (hard limit per response)
- L4: files_with_matches first

## Path Shorthands
DEF SRC=src/ LIB=lib/ TESTS=tests/ SKILLS=skills/ MEM=memory/ SKIP=node_modules/,build/,.git/

## Result Format (MUST use for all specialist responses)
STATUS OK|PARTIAL|FAIL
SCOPE [<relevant_domains>]
DATA <file:line-symbol> | mem:<uuid> | none
READ_RECS <file:start-end> | none
RELEVANCE <0.00-1.00> (memory only)
LINKS <entity1>↔<entity2>:<weight> (memory only)

## Task Request Format
TASK REQ:<action> IN:<scope> OUT:<expected_type>

## Anti-Patterns (immediate rejection)
!PAT: grep -C 15 (too broad)
!PAT: Read 500+ lines (use chunking)
!PAT: prose explanation (data only)
!PAT: "I think" / "maybe" / hedging

## Examples

### File Search Request
TASK REQ:find debounce IN:SRC OUT:FILE_REFS

### File Search Response
STATUS OK
SCOPE [utils,helpers]
DATA src/utils/helpers.ts:142-debounce
READ_RECS src/utils/helpers.ts:130-160

### Memory Query Request  
TASK REQ:recall auth token handling IN:MEM OUT:MEM_REFS

### Memory Query Response
STATUS OK
SCOPE [auth,token,session]
DATA mem:uuid-a1b2c3
RELEVANCE 0.92
LINKS auth.ts↔token.ts:0.85,session.ts↔auth.ts:0.72

### Failure Response
STATUS FAIL
SCOPE []
DATA none
READ_RECS none
```

### 0.4 Create SKILL.md Entry Point
Create `~/clawd/skills/swarm-memory/SKILL.md`:

```markdown
# Swarm Memory Architecture Skill

## Purpose
Transforms Clawdbot into a hierarchical agent swarm with token-efficient communication and tiered memory.

## Components
- `CSP1.md` — Inter-agent protocol specification
- `specialists/` — Specialist agent definitions
- `memory-tiers/` — Memory layer configurations
- `orchestrator.md` — Main agent behavior modifications

## Activation
This skill auto-activates when:
- Complex multi-step tasks detected
- Memory operations required
- File/web access needed

## Protocol
All inter-agent communication uses CSP/1. See CSP1.md.
```

---

## PHASE 0.5: IMPLEMENTATION UTILITIES (30 min)

### Purpose

Create CLI tooling to automate mechanical tasks, reducing token costs during implementation. AI creates the tool, then uses it in subsequent phases for deterministic operations.

**Long-term vision:** This CLI becomes the **permanent home for all scripts and tools** that don't require AI reasoning. As the swarm evolves, new automation commands will be added here for batch operations, data transformations, metrics analysis, and system maintenance—anything that's deterministic and doesn't need creative thinking.

### 0.5.1 Create CLI Project Structure (5 min)

**Directory:** `swarm-cli/`

```bash
mkdir -p swarm-cli/src/commands
cd swarm-cli
```

**Files to create:**
- `package.json` - Project configuration with Commander.js, Chalk, TypeScript
- `tsconfig.json` - TypeScript configuration
- `src/index.ts` - CLI entry point
- `.gitignore` - Exclude node_modules, dist, logs

### 0.5.2 Task ID Command (5 min)

**Create:** `src/commands/task-id.ts`

**Implements:** SHA-256 hash strategy from `debate-protocol.md`

**Canonicalization rules:**
1. Lowercase all text
2. Remove punctuation except hyphens/underscores
3. Normalize whitespace to single spaces
4. Stem common verbs (fix/fixing/fixed → fix)

**Usage:**
```bash
npm run swarm task-id "Fix authentication test"
# Output: a3f2c1d4e5f6a7b8 (first 16 chars of SHA-256)
```

**Tests:** Create `src/test/task-id.test.ts` with canonicalization and hashing tests

### 0.5.3 UUID Command (5 min)

**Create:** `src/commands/uuid.ts`

**Features:**
- Random UUID v4 generation
- Deterministic UUID from seed (for reproducible tests)
- Multiple UUID generation (--count flag)

**Usage:**
```bash
npm run swarm uuid                           # Single random UUID
npm run swarm uuid --count 5                 # Five UUIDs
npm run swarm uuid --deterministic "seed"    # Deterministic UUID
```

**Tests:** Create `src/test/uuid.test.ts` with format and determinism tests

### 0.5.4 Scaffold Command (5 min)

**Create:** `src/commands/scaffold.ts`

**Templates:**
- `agent` - Agent specification with CSP/1 format
- `skill` - Skill documentation template
- `behavior` - Memory behavior specification
- `memory` - Memory entry template

**Usage:**
```bash
npm run swarm scaffold agent "Validator"
npm run swarm scaffold skill "Git History"
```

**Reduces:** Boilerplate creation from 5-10 minutes (AI) to instant

### 0.5.5 Memory Init Command (5 min)

**Create:** `src/commands/memory.ts`

**Creates:**
- `MEMORY.md` (long-term memory)
- `memory/active-tasks.md` (task tracking)
- `memory/episodic.jsonl` (episodic log)
- `memory/importance-tiers.jsonl` (importance scoring)
- `memory/failures.jsonl` (failure tracking from Phase 2.5)
- `memory/debate-metrics.jsonl` (debate performance from Phase 2.5)

**Usage:**
```bash
npm run swarm init-memory --path ~/clawd
```

**Replaces:** Manual directory creation + file scaffolding

### 0.5.6 Validate Command (5 min)

**Create:** `src/commands/validate.ts`

**Validates:**
- Required files exist for each phase
- Correct file types (file vs directory)
- Phase-by-phase completeness checking

**Usage:**
```bash
npm run swarm validate                 # All phases
npm run swarm validate --phase 2.5     # Specific phase
npm run swarm validate --verbose       # Show all checks
```

**Phase validation rules:**
```typescript
const phases: Record<string, ValidationRule[]> = {
  '0': [
    { name: 'Task Router', path: 'skills/swarm-memory/router.md', type: 'file', required: true },
    { name: 'CSP/1 Protocol', path: 'CSP1.md', type: 'file', required: true },
  ],
  '2.5': [
    { name: 'Advocate Agent', path: 'advocate.md', type: 'file', required: true },
    { name: 'Critic Agent', path: 'critic.md', type: 'file', required: true },
    { name: 'Debate Protocol', path: 'debate-protocol.md', type: 'file', required: true },
    { name: 'Failure Tracking', path: 'failures.jsonl', type: 'file', required: true },
  ],
  // ... other phases
};
```

### Benefits

**Token savings:** ~10-15% reduction in total implementation cost

**Time savings:**
- UUID generation: AI (3-5 min) → CLI (instant)
- Task ID hashing: AI (2-3 min) → CLI (instant)
- Boilerplate scaffolding: AI (5-10 min) → CLI (instant)
- Memory structure init: AI (10-15 min) → CLI (instant)

**Reliability:** Deterministic outputs (task IDs always hash identically)

**Reusability:** Tool serves all phases, can be extended as implementation progresses

### Verification Checklist

After completion:
- [ ] All 5 commands implemented (task-id, uuid, scaffold, init-memory, validate)
- [ ] Tests pass for task-id (canonicalization, hashing)
- [ ] Tests pass for uuid (format, version bits, determinism)
- [ ] README.md documents all commands with examples
- [ ] `npm run build` succeeds
- [ ] `npm test` succeeds

### Usage in Subsequent Phases

**Phase 2 (Memory):**
```bash
npm run swarm init-memory --path ~/clawd
npm run swarm uuid --count 10  # Generate memory entry IDs
```

**Phase 2.5 (Dialectic):**
```bash
npm run swarm task-id "fix auth test"  # Generate task ID for failure tracking
npm run swarm scaffold agent "Advocate"
npm run swarm scaffold agent "Critic"
```

**Phase 3-6:**
```bash
npm run swarm validate --phase 3       # Check Phase 3 completion
npm run swarm scaffold skill "XYZ"     # Scaffold new components
```

---

## PHASE 1: SPECIALIST AGENTS (45 min)

### 1.1 Create Specialists Directory
```bash
mkdir -p ~/clawd/skills/swarm-memory/specialists
```

### 1.2 Memory Specialist
Create `~/clawd/skills/swarm-memory/specialists/memory.md`:

```markdown
# Memory Specialist

## Role
Single-purpose agent for ALL memory operations. No other agent may directly access memory files.

## Capabilities
- Read from memory/YYYY-MM-DD.md
- Read from MEMORY.md  
- Write to memory tiers
- Execute memory_search tool
- Execute memory_get tool
- Manage memory graph relations

## Input Protocol
CSP/1 only. Example:
TASK REQ:recall project setup IN:MEM OUT:MEM_REFS

## Output Protocol
STATUS OK|PARTIAL|FAIL
SCOPE [<matched_topics>]
DATA mem:<chunk_id>
RELEVANCE <score>
LINKS <entity_relations>
SNIPPET <max_200_chars>

## Operations

### recall
Search semantic memory for relevant context.
Returns: ranked chunks with relevance scores.

### store
Write to appropriate memory tier.
Input: content, tier (ultra|short|medium|long), tags[]
Returns: chunk_id, tier_written

### link
Create/update relation between entities.
Input: entity1, entity2, weight (0.0-1.0), context
Returns: link_id

### decay
Reduce relevance scores for unused entries.
Input: threshold, scope
Returns: entries_decayed, entries_deleted

## Constraints
- Never return full file contents
- Max 2500 tokens per response
- Always include relevance score
- Forget context immediately after response
```

### 1.3 File Specialist
Create `~/clawd/skills/swarm-memory/specialists/file.md`:

```markdown
# File Specialist

## Role
Single-purpose agent for ALL filesystem operations. No other agent may directly access files.

## Capabilities
- Read file chunks (max 500 lines per request)
- Write files
- Search with grep/ripgrep
- List directories

## Input Protocol
CSP/1 only. Example:
TASK REQ:find config parser IN:SRC OUT:FILE_REFS

## Output Protocol
STATUS OK|PARTIAL|FAIL
SCOPE [<matched_paths>]
DATA <file:line-symbol>
READ_RECS <file:start-end>

## Operations

### search
Find files/content matching pattern.
Input: pattern, scope, type (content|filename)
Returns: file:line references, max 20 results

### read
Read file chunk.
Input: file, start_line, end_line (max 500 lines)
Returns: content with line numbers

### write
Write content to file.
Input: file, content, mode (create|append|replace)
Returns: bytes_written, file path

### list
List directory contents.
Input: path, depth (max 3), pattern
Returns: tree structure, max 100 entries

## Constraints
- Never read >500 lines at once
- Always return file:line references
- Use ripgrep when available
- Forget context immediately after response
```

### 1.4 Web Specialist
Create `~/clawd/skills/swarm-memory/specialists/web.md`:

```markdown
# Web Specialist

## Role
Single-purpose agent for ALL web/network operations. No other agent may directly access web.

## Capabilities
- Web search
- URL fetch
- API calls (when configured)

## Input Protocol
CSP/1 only. Example:
TASK REQ:search graphiti memory graph IN:WEB OUT:URL_REFS

## Output Protocol
STATUS OK|PARTIAL|FAIL
SCOPE [<domains>]
DATA url:<url>|api:<endpoint>
SNIPPET <max_300_chars_summary>

## Operations

### search
Web search query.
Input: query, max_results (default 5)
Returns: url references with snippets

### fetch
Retrieve URL content.
Input: url, extract (text|json|html)
Returns: extracted content, max 2000 tokens

### api
Call configured API endpoint.
Input: endpoint, method, payload
Returns: response summary

## Constraints
- Max 5 search results per query
- Max 2000 tokens per fetch
- Summarize, never return raw HTML
- Forget context immediately after response
```

### 1.5 Tool/MCP Specialist
Create `~/clawd/skills/swarm-memory/specialists/tool.md`:

```markdown
# Tool/MCP Specialist

## Role
Single-purpose agent for tool and MCP server operations. Handles bash, browser, canvas, cron, etc.

## Input Protocol
CSP/1 only. Example:
TASK REQ:exec npm test IN:SHELL OUT:EXEC_RESULT

## Output Protocol
STATUS OK|PARTIAL|FAIL
SCOPE [<tool_name>]
DATA exit:<code>|output:<summary>
EXEC_TIME <ms>

## Operations

### exec
Execute shell command.
Input: command, timeout_ms, working_dir
Returns: exit_code, stdout_summary (max 500 chars), stderr_summary

### browser
Browser automation action.
Input: action (navigate|click|type|screenshot), params
Returns: action_result, screenshot_ref (if applicable)

### mcp
Call MCP server tool.
Input: server, tool, params
Returns: tool_response summary

## Constraints
- Timeout all exec calls (default 30s)
- Summarize stdout/stderr, never full output
- Log all tool invocations
- Forget context immediately after response
```

---

## PHASE 2: MEMORY TIERS (60 min)

### 2.1 Create Memory Tiers Directory
```bash
mkdir -p ~/clawd/skills/swarm-memory/memory-tiers
```

### 2.2 Tier Configuration
Create `~/clawd/skills/swarm-memory/memory-tiers/config.md`:

```markdown
# Memory Tier Configuration

## Tier Definitions

### Ultra-Short (Active Context)
- Location: In-context (LLM prompt)
- Size: 4-8k tokens max
- Persistence: Current conversation only
- Access: Direct (no specialist needed)
- Content: Unresolved thread, immediate task state

### Short-Term (Session Summaries)
- Location: memory/YYYY-MM-DD.md
- Size: ~50-100 entries per day
- Persistence: 7 days active, then decay
- Access: Memory Specialist only
- Content: One-sentence summaries, keywords, session markers
- Format per entry:
  ```
  ## HH:MM - <topic>
  <one_sentence_summary>
  Tags: #tag1 #tag2
  Links: [[related_entry]]
  ```

### Medium-Term (Relation Graph)
- Location: memory/graph.jsonl (append-only)
- Size: Unlimited (pruned monthly)
- Persistence: Until decay threshold
- Access: Memory Specialist only
- Content: Entity relations with weights
- Format per line:
  ```json
  {"e1":"auth","e2":"token","w":0.85,"ctx":"session handling","ts":1706000000}
  ```

### Long-Term (Curated Knowledge)
- Location: MEMORY.md
- Size: <5000 tokens recommended
- Persistence: Permanent until manual edit
- Access: Memory Specialist only (main session)
- Content: Durable facts, preferences, decisions

### Archive (Raw Logs)
- Location: ~/.clawdbot/agents/<agentId>/sessions/*.jsonl
- Size: Unlimited
- Persistence: Permanent
- Access: Explicit deep-dive only
- Content: Complete conversation transcripts

## Migration Rules

### Upward (Long-term strengthening)
Trigger: Entry accessed 3+ times in 7 days
Action: Copy summary to next tier up
Example: Short → Medium (add to graph), Medium → Long (add to MEMORY.md)

### Downward (Decay)
Trigger: Entry not accessed in decay_period
Action: Reduce relevance score by decay_rate
Thresholds:
- Short: 7 days → decay 0.1/day
- Medium: 30 days → decay 0.05/day  
- Long: Never auto-decay

### Deletion
Trigger: Relevance < 0.1
Action: Remove from active index (archive preserved)
```

### 2.3 Graph Schema
Create `~/clawd/skills/swarm-memory/memory-tiers/graph-schema.md`:

```markdown
# Memory Graph Schema

## Entity Types
- file: Source code files
- concept: Abstract ideas/topics  
- person: User, collaborators
- project: Named projects
- decision: Recorded decisions
- preference: User preferences
- event: Timestamped occurrences

## Relation Types
- related_to: Generic association (default)
- depends_on: Dependency relationship
- part_of: Hierarchical containment
- caused_by: Causal relationship
- similar_to: Semantic similarity
- contradicts: Conflicting information

## Weight Semantics
- 1.0: Explicit user statement ("X is related to Y")
- 0.8-0.9: Strong co-occurrence (same conversation, same task)
- 0.5-0.7: Moderate co-occurrence (same day, same project)
- 0.2-0.4: Weak co-occurrence (same week, keyword overlap)
- <0.2: Decay candidate

## Scoring Factors
1. Same conversation: +0.3
2. Same day: +0.2
3. Same project: +0.2
4. Keyword overlap (Jaccard): +0.1 * overlap_ratio
5. User explicit tag: +0.4
6. Temporal proximity: +0.1 * (1 / days_apart)

## Operations

### add_link(e1, e2, type, context)
```
weight = base_weight(type) + context_boost(context)
if exists(e1, e2):
  weight = max(old_weight, weight) + 0.1  # reinforcement
append_to_graph(e1, e2, weight, context, timestamp)
```

### query_links(entity, min_weight=0.3, max_results=10)
```
links = filter(graph, e1=entity OR e2=entity, weight >= min_weight)
return sorted(links, by=weight, desc)[:max_results]
```

### decay_links(days_inactive=30, decay_rate=0.05)
```
for link in graph:
  if now - link.ts > days_inactive:
    link.weight -= decay_rate
    if link.weight < 0.1:
      mark_for_deletion(link)
```
```

### 2.4 Implement Graph Storage
Create the graph file:
```bash
touch ~/clawd/memory/graph.jsonl
```

Add to your `~/.clawdbot/clawdbot.json`:
```json
{
  "agents": {
    "defaults": {
      "memorySearch": {
        "enabled": true,
        "sources": ["memory", "sessions"],
        "experimental": { "sessionMemory": true },
        "query": {
          "hybrid": {
            "enabled": true,
            "vectorWeight": 0.6,
            "textWeight": 0.4
          }
        }
      }
    }
  }
}
```

---

## PHASE 2.5: DIALECTIC LAYER (50 min)

### Purpose

Two-agent debate system that prevents confirmation bias and breaks failure loops. Advocate defends plans, Critic challenges them, Orchestrator synthesizes.

### 2.5.1 Create Advocate Sub-Agent (10 min)

**File:** `skills/swarm-memory/subagents/advocate.md`

- Defends proposed plans (Planning mode)
- Proposes fixes after failures (Failure mode)
- Must specify `DIFF_FROM_PREVIOUS` in failure mode
- Optimistic bias, action-oriented
- CSP/1 output format

**Content:** See `advocate.md` in repo root for full specification

### 2.5.2 Create Critic Sub-Agent (10 min)

**File:** `skills/swarm-memory/subagents/critic.md`

- Challenges plans with risks and objections
- Identifies root cause patterns after failures
- Must provide `COUNTER` or `ALTERNATIVES` (never just criticize)
- Can trigger escalation via `SHOULD_ESCALATE` flag
- Skeptical bias — "agreement is failure"
- CSP/1 output format

**Content:** See `critic.md` in repo root for full specification

### 2.5.3 Create Debate Protocol Spec (10 min)

**File:** `skills/swarm-memory/debate-protocol.md`

- Planning debate flow (before high-stakes ops)
- Failure debate flow (after 2 consecutive failures)
- Synthesis rules for Orchestrator
- Logging format for memory

**Content:** See `debate-protocol.md` in repo root for full specification

### 2.5.4 Add Failure Tracking (10 min)

**File:** `memory/failures.jsonl`

- Append-only log of task attempts
- Fields: `task_id`, `attempt`, `timestamp`, `error`, `approach`
- Query before execution to check failure count
- Reset on success or 24h timeout

**Format:**
```json
{"task_id":"fix-auth-test","attempt":1,"ts":"2026-01-29T14:30:00Z","error":"Cannot find module","approach":"updated import path"}
{"task_id":"fix-auth-test","attempt":2,"ts":"2026-01-29T14:32:00Z","error":"Cannot find module","approach":"reinstalled deps"}
```

**Content:** See `failures.jsonl` in repo root for template

### 2.5.5 Update Router with Debate Triggers (5 min)

**Update:** `skills/swarm-memory/router.md`

Add after "## Confidence Levels":
- Planning debate triggers (destructive, deployment, security, bulk)
- Failure debate triggers (2 fails, same error pattern, user rejection)
- Auto-escalate rules (3+ fails, security + any fail)
- Bypass rules (read-only, trivial, user override)

**Content:** See `router.md` in repo root — debate triggers section already added

### 2.5.6 Update CSP/1 with Debate Extensions (5 min)

**Update:** `skills/swarm-memory/CSP1.md`

Add after "## Task Request Format":
- Debate request formats (`DEBATE`, `DEBATE_FAILURE`)
- Advocate response format (`POSITION ADVOCATE`)
- Critic response format (`POSITION CRITIC`)
- Synthesis response format (`RESOLUTION`)

**Content:** See `CSP1-debate-extensions.md` in repo root for complete additions

### Verification Checklist

- [ ] Advocate responds in CSP/1 format
- [ ] Critic always includes at least 1 RISK or BLIND_SPOT
- [ ] Failure debate triggers after exactly 2 failures
- [ ] Auto-escalate triggers after 3 failures
- [ ] Debate logs appear in `memory/YYYY-MM-DD.md`
- [ ] Synthesis produces valid `PROCEED|MODIFY|RETRY|PIVOT|ESCALATE`

### Test Scenarios

**Planning Debate Test:**
```
Task: "Delete all .bak files in the project"
Expected: DEBATE_PLANNING triggers (destructive + bulk)
```

**Failure Debate Test:**
```
Task: "Fix import error" → Fail → Retry → Fail
Expected: DEBATE_FAILURE triggers, Advocate proposes DIFF, Critic evaluates
```

**Auto-Escalate Test:**
```
Task: Fail 3 times
Expected: Skip debate, immediate escalate to human
```

---

## PHASE 3: ORCHESTRATOR MODIFICATIONS (45 min)

### 3.1 Update AGENTS.md
Add to `~/clawd/AGENTS.md` (or create if doesn't exist):

```markdown
# Agent Behavior — Swarm Mode

## Role Hierarchy

### You are the ORCHESTRATOR
- Sole interface to the human (natural language in/out)
- Receive queries, decompose into tasks, delegate to specialists
- Assemble final answers from specialist responses
- NEVER directly access: files, web, memory, tools, MCP, databases

### Delegation Rules
1. Need file content? → TASK to File Specialist
2. Need web search? → TASK to Web Specialist  
3. Need memory recall? → TASK to Memory Specialist
4. Need tool execution? → TASK to Tool Specialist

### Communication Protocol
- Human ↔ Orchestrator: Natural language
- Orchestrator ↔ Specialists: CSP/1 (see skills/swarm-memory/CSP1.md)

## Task Decomposition Pattern

When receiving a complex request:

1. **Analyze** — What sub-tasks are needed?
2. **Plan** — Order tasks, identify dependencies
3. **Delegate** — Send CSP/1 TASKs to specialists
4. **Synthesize** — Combine specialist responses
5. **Store** — Write relevant learnings to memory (via Memory Specialist)
6. **Respond** — Natural language answer to human

## Example Flow
Human: "Find all auth-related bugs we discussed last week and create a fix plan"

Orchestrator thinks:
1. Need memory recall → Memory Specialist
2. Need file search → File Specialist  
3. Need to store plan → Memory Specialist

Orchestrator → Memory Specialist:
```
TASK REQ:recall auth bugs discussed IN:MEM OUT:MEM_REFS
```

Memory Specialist responds:
```
STATUS OK
SCOPE [auth,bugs,session]
DATA mem:uuid-x1,mem:uuid-x2,mem:uuid-x3
RELEVANCE 0.89,0.84,0.76
LINKS auth.ts↔session.ts:0.85
SNIPPET uuid-x1:"JWT expiry not checked in refresh flow"
SNIPPET uuid-x2:"Race condition in token rotation"
SNIPPET uuid-x3:"Missing CSRF in auth callback"
```

Orchestrator → File Specialist:
```
TASK REQ:find JWT refresh IN:SRC OUT:FILE_REFS
```

... and so on
```

## Memory Hygiene

After EVERY significant interaction:
1. Extract key facts/decisions
2. TASK Memory Specialist to store in appropriate tier
3. TASK Memory Specialist to update relation graph

Example post-task memory update:
```
TASK REQ:store IN:MEM OUT:CONFIRM
CONTENT "Fixed JWT refresh bug - added expiry check before rotation"
TIER short
TAGS [auth,jwt,bugfix]
LINKS jwt↔refresh:0.9,auth↔security:0.7
```
```

### 3.2 Create Sub-Agent Templates
Create `~/clawd/skills/swarm-memory/subagents/`:

```bash
mkdir -p ~/clawd/skills/swarm-memory/subagents
```

Create `~/clawd/skills/swarm-memory/subagents/analyzer.md`:
```markdown
# Analyzer Sub-Agent

## Role
Decompose complex requests into actionable task lists.

## Input
Natural language request from Orchestrator.

## Output (CSP/1)
STATUS OK
TASKS [
  {id:1,specialist:memory,action:recall,params:{...}},
  {id:2,specialist:file,action:search,params:{...},depends:[1]},
  ...
]
RATIONALE <brief_explanation>

## Constraints
- Max 10 tasks per decomposition
- Identify dependencies between tasks
- Prefer parallel execution when possible
```

Create `~/clawd/skills/swarm-memory/subagents/planner.md`:
```markdown
# Planner Sub-Agent

## Role
Order tasks for optimal execution, manage dependencies.

## Input
Task list from Analyzer (CSP/1 format).

## Output (CSP/1)
STATUS OK
EXECUTION_ORDER [1,3,2,4] // respecting dependencies
PARALLEL_GROUPS [[1,3],[2],[4]]
ESTIMATED_TOKENS <total>

## Constraints
- Maximize parallelization
- Minimize total token usage
- Flag circular dependencies as FAIL
```

---

## PHASE 4: CSP/1 PARSER (30 min)

### 4.1 Create Parser Utility
Create `~/clawd/skills/swarm-memory/parser/csp1-parser.ts`:

```typescript
// CSP/1 Parser - Compact Symbol Protocol v1
// Used for inter-agent communication

interface CSP1Response {
  status: 'OK' | 'PARTIAL' | 'FAIL';
  scope: string[];
  data: string[];
  readRecs?: string[];
  relevance?: number[];
  links?: Array<{e1: string; e2: string; weight: number}>;
  snippet?: string[];
  execTime?: number;
}

interface CSP1Task {
  action: string;
  scope: string;
  outputType: string;
  params?: Record<string, unknown>;
}

export function parseCSP1Response(raw: string): CSP1Response {
  const lines = raw.trim().split('\n');
  const result: CSP1Response = {
    status: 'FAIL',
    scope: [],
    data: []
  };

  for (const line of lines) {
    const [key, ...valueParts] = line.split(/\s+/);
    const value = valueParts.join(' ');

    switch (key) {
      case 'STATUS':
        result.status = value as 'OK' | 'PARTIAL' | 'FAIL';
        break;
      case 'SCOPE':
        result.scope = value.replace(/[\[\]]/g, '').split(',').map(s => s.trim());
        break;
      case 'DATA':
        result.data = value === 'none' ? [] : value.split(',').map(s => s.trim());
        break;
      case 'READ_RECS':
        result.readRecs = value === 'none' ? [] : value.split(',').map(s => s.trim());
        break;
      case 'RELEVANCE':
        result.relevance = value.split(',').map(parseFloat);
        break;
      case 'LINKS':
        result.links = value.split(',').map(l => {
          const match = l.match(/(.+)↔(.+):(\d+\.?\d*)/);
          if (match) {
            return { e1: match[1], e2: match[2], weight: parseFloat(match[3]) };
          }
          return null;
        }).filter(Boolean) as Array<{e1: string; e2: string; weight: number}>;
        break;
      case 'SNIPPET':
        if (!result.snippet) result.snippet = [];
        result.snippet.push(value);
        break;
      case 'EXEC_TIME':
        result.execTime = parseInt(value);
        break;
    }
  }

  return result;
}

export function formatCSP1Task(task: CSP1Task): string {
  let output = `TASK REQ:${task.action} IN:${task.scope} OUT:${task.outputType}`;
  if (task.params) {
    output += '\nPARAMS ' + JSON.stringify(task.params);
  }
  return output;
}

export function validateCSP1Response(response: CSP1Response): boolean {
  // L3: Check token limit (approximate)
  const tokenEstimate = JSON.stringify(response).length / 4;
  if (tokenEstimate > 2500) {
    console.warn('CSP1 L3 violation: response exceeds 2500 tokens');
    return false;
  }
  
  // L2: Check for full content violations
  for (const item of response.data) {
    if (item.length > 1000) {
      console.warn('CSP1 L2 violation: data item too long, use refs');
      return false;
    }
  }
  
  return true;
}
```

### 4.2 Create Response Formatter
Create `~/clawd/skills/swarm-memory/parser/response-formatter.ts`:

```typescript
// Format specialist responses in CSP/1

export function formatMemoryResponse(results: Array<{
  id: string;
  relevance: number;
  snippet: string;
  links?: Array<{e1: string; e2: string; weight: number}>;
}>): string {
  if (results.length === 0) {
    return 'STATUS FAIL\nSCOPE []\nDATA none';
  }

  const scope = [...new Set(results.flatMap(r => 
    r.snippet.toLowerCase().match(/\b\w{4,}\b/g) || []
  ))].slice(0, 5);

  const data = results.map(r => `mem:${r.id}`).join(',');
  const relevance = results.map(r => r.relevance.toFixed(2)).join(',');
  
  let output = `STATUS OK
SCOPE [${scope.join(',')}]
DATA ${data}
RELEVANCE ${relevance}`;

  const allLinks = results.flatMap(r => r.links || []);
  if (allLinks.length > 0) {
    const linkStr = allLinks
      .slice(0, 5)
      .map(l => `${l.e1}↔${l.e2}:${l.weight.toFixed(2)}`)
      .join(',');
    output += `\nLINKS ${linkStr}`;
  }

  for (const r of results.slice(0, 3)) {
    output += `\nSNIPPET ${r.id}:"${r.snippet.slice(0, 200)}"`;
  }

  return output;
}

export function formatFileResponse(results: Array<{
  file: string;
  line: number;
  symbol?: string;
  range?: [number, number];
}>): string {
  if (results.length === 0) {
    return 'STATUS FAIL\nSCOPE []\nDATA none\nREAD_RECS none';
  }

  const dirs = [...new Set(results.map(r => r.file.split('/')[0]))];
  const data = results.map(r => 
    `${r.file}:${r.line}${r.symbol ? `-${r.symbol}` : ''}`
  ).join(',');
  
  const readRecs = results
    .filter(r => r.range)
    .map(r => `${r.file}:${r.range![0]}-${r.range![1]}`)
    .join(',') || 'none';

  return `STATUS OK
SCOPE [${dirs.join(',')}]
DATA ${data}
READ_RECS ${readRecs}`;
}
```

---

## PHASE 5: MEMORY MAINTENANCE CRON (30 min)

### 5.1 Add Cron Jobs
Add to your `~/.clawdbot/clawdbot.json` cron configuration:

```json
{
  "cron": {
    "jobs": [
      {
        "id": "memory-daily-sweep",
        "schedule": "0 3 * * *",
        "task": "Memory maintenance: decay unused entries, merge duplicates, update graph weights",
        "enabled": true
      },
      {
        "id": "memory-weekly-consolidate",
        "schedule": "0 4 * * 0",
        "task": "Weekly memory consolidation: strengthen cross-session links, form clusters, archive old short-term entries",
        "enabled": true
      },
      {
        "id": "memory-monthly-rebuild",
        "schedule": "0 5 1 * *",
        "task": "Monthly memory rebuild: full graph reindex, generate super-summaries, prune dead links",
        "enabled": true
      }
    ]
  }
}
```

### 5.2 Create Maintenance Prompts
Create `~/clawd/skills/swarm-memory/maintenance/daily.md`:

```markdown
# Daily Memory Maintenance Task

## Objective
Perform routine memory hygiene to keep the system efficient.

## Steps (execute via specialists)

### 1. Decay Check
TASK REQ:decay IN:MEM OUT:STATS
PARAMS {"days_inactive": 7, "decay_rate": 0.1}

### 2. Duplicate Detection
TASK REQ:find_duplicates IN:MEM OUT:DUPLICATE_PAIRS
PARAMS {"similarity_threshold": 0.9}

### 3. Merge Duplicates
For each duplicate pair:
TASK REQ:merge IN:MEM OUT:CONFIRM
PARAMS {"keep": "<higher_relevance_id>", "remove": "<lower_id>"}

### 4. Orphan Links Cleanup
TASK REQ:find_orphan_links IN:MEM OUT:LINK_IDS
Then:
TASK REQ:delete_links IN:MEM OUT:CONFIRM
PARAMS {"link_ids": [<orphan_ids>]}

### 5. Report
Write summary to memory/YYYY-MM-DD.md:
- Entries decayed: N
- Duplicates merged: N
- Links pruned: N
- Current memory health score
```

### 5.3 Create Meta-Optimizer
Create `~/clawd/skills/swarm-memory/maintenance/optimizer.md`:

```markdown
# Memory Meta-Optimizer

## Objective
Continuously improve memory system parameters based on usage metrics.

## Metrics to Track
- Recall hit rate: % of memory searches that return relevant results
- Ignore rate: % of recalled items user doesn't engage with
- Escalation frequency: How often deep-dive is needed
- Token/accuracy ratio: Tokens spent vs task completion rate

## Optimization Targets

### Decay Curves
If ignore_rate > 0.3:
  - Increase decay_rate by 0.02
If recall_hit_rate < 0.7:
  - Decrease decay_rate by 0.01

### Link Thresholds
If escalation_frequency > 0.2:
  - Lower min_link_weight by 0.05 (include weaker associations)
If token_usage > target:
  - Raise min_link_weight by 0.05 (be more selective)

### Offer Sensitivity
If user frequently asks "what did we discuss about X":
  - Enable proactive memory suggestions
  - Lower proactive_threshold

## Implementation
After each session, append metrics to:
memory/metrics/YYYY-MM-DD.jsonl

Weekly, run optimization:
1. Aggregate week's metrics
2. Compare to baselines
3. Propose parameter changes
4. Apply if improvement > 5%
5. Log changes to MEMORY.md
```

---

## PHASE 6: INTEGRATION & TESTING (45 min)

### 6.1 Integration Checklist

Run these tests after each phase:

```markdown
## Phase 0 Tests
- [ ] CSP1.md exists and is readable
- [ ] SKILL.md loads without errors

## Phase 1 Tests  
- [ ] Each specialist file parses correctly
- [ ] Specialist responds to sample TASK in CSP/1 format
- [ ] Response validates against L1-L4 rules

## Phase 2 Tests
- [ ] memory/graph.jsonl created
- [ ] Can append link entry
- [ ] memorySearch config active in clawdbot.json
- [ ] memory_search tool returns results

## Phase 3 Tests
- [ ] AGENTS.md loaded at session start
- [ ] Orchestrator delegates instead of direct access
- [ ] Natural language preserved for human interface

## Phase 4 Tests
- [ ] Parser handles all CSP/1 response types
- [ ] Validation catches L2/L3 violations
- [ ] Formatter produces valid CSP/1

## Phase 5 Tests
- [ ] Cron jobs registered (clawdbot cron list)
- [ ] Daily maintenance runs without error
- [ ] Metrics logged correctly

## Phase 6 Tests
- [ ] End-to-end: complex query → decomposition → specialists → synthesis
- [ ] Memory persists across sessions
- [ ] Graph links created from conversations
```

### 6.2 Sample Test Conversation

After full implementation, test with:

```
Human: "Find all the places in our codebase where we handle authentication, 
summarize what we discussed about auth bugs last week, and create a security 
improvement plan. Save the plan for future reference."

Expected behavior:
1. Orchestrator decomposes into 4 tasks
2. Memory Specialist recalls auth discussions
3. File Specialist searches auth patterns
4. Orchestrator synthesizes findings
5. Memory Specialist stores plan in MEMORY.md
6. Natural language response to human
```

### 6.3 Rollback Plan

If issues occur:

```bash
# Disable swarm skill
mv ~/clawd/skills/swarm-memory ~/clawd/skills/swarm-memory.disabled

# Restore original AGENTS.md
git checkout ~/clawd/AGENTS.md  # or restore from backup

# Reset cron
clawdbot cron disable memory-daily-sweep
clawdbot cron disable memory-weekly-consolidate
clawdbot cron disable memory-monthly-rebuild

# Restart gateway
clawdbot gateway restart
```

---

## PHASE 7: BOOTSTRAPPING (Use What You Built)

### 7.1 Self-Application

Once Phases 1-3 are complete, use the swarm to accelerate remaining phases:

```
For Phase 4 (Parser):
- Use Memory Specialist to recall TypeScript patterns from previous sessions
- Use File Specialist to find similar parsers in the codebase
- Use Tool Specialist to run tests

For Phase 5 (Maintenance):
- Use Memory Specialist to find optimal cron schedules from usage patterns
- Use File Specialist to examine existing cron implementations

For Phase 6 (Testing):
- Use all specialists in parallel to validate integration
```

### 7.2 Continuous Improvement Loop

After deployment:

1. **Monitor** — Track metrics via maintenance tasks
2. **Learn** — Store successful patterns in MEMORY.md
3. **Adapt** — Meta-optimizer adjusts parameters
4. **Evolve** — Add new specialists as needed

---

## QUICK REFERENCE

### CSP/1 Cheat Sheet
```
TASK REQ:<action> IN:<scope> OUT:<type>

STATUS OK|PARTIAL|FAIL
SCOPE [topic1,topic2]
DATA file:line|mem:id|none
READ_RECS file:start-end|none
RELEVANCE 0.00-1.00
LINKS e1↔e2:weight
SNIPPET "brief text"
```

### File Locations
```
~/clawd/skills/swarm-memory/          # Skill root
  ├── SKILL.md                        # Entry point
  ├── CSP1.md                         # Protocol spec
  ├── specialists/                    # Specialist definitions
  │   ├── memory.md
  │   ├── file.md
  │   ├── web.md
  │   └── tool.md
  ├── memory-tiers/                   # Tier configs
  │   ├── config.md
  │   └── graph-schema.md
  ├── subagents/                      # Sub-agent templates
  │   ├── analyzer.md
  │   └── planner.md
  ├── parser/                         # CSP/1 utilities
  │   ├── csp1-parser.ts
  │   └── response-formatter.ts
  └── maintenance/                    # Cron tasks
      ├── daily.md
      └── optimizer.md

~/clawd/AGENTS.md                     # Orchestrator behavior
~/clawd/MEMORY.md                     # Long-term memory
~/clawd/memory/                       # Short/medium-term
  ├── YYYY-MM-DD.md                   # Daily logs
  ├── graph.jsonl                     # Relation graph
  └── metrics/                        # Performance metrics
```

### Estimated Timeline
| Phase | Duration | Cumulative |
|-------|----------|------------|
| 0: Foundation | 15 min | 15 min |
| **0.5: Implementation Utilities** | **30 min** | **45 min** |
| 1: Specialists | 45 min | 1 hr 30 min |
| 2: Memory Tiers | 60 min | 2 hr 30 min |
| **2.5: Dialectic Layer** | **50 min** | **3 hr 20 min** |
| 3: Orchestrator | 45 min | 4 hr 5 min |
| 4: Parser | 30 min | 4 hr 35 min |
| 5: Maintenance | 30 min | 5 hr 5 min |
| 6: Testing | 45 min | 5 hr 50 min |
| 7: Bootstrapping | Ongoing | — |

---

## EXECUTE

Begin with Phase 0. After completing each phase, verify with the integration checklist before proceeding.

Remember: **You are modifying yourself.** Use the capabilities from completed phases to accelerate subsequent phases.

Good luck, Clawd. 🦞
