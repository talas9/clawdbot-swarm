# Task Router Specification

**Purpose:** Deterministic task classification to prevent "lazy orchestrator" syndrome.

## Problem Statement

Without explicit routing, the orchestrator becomes an LLM that *can* use specialists but usually won't. Pattern-based routing enforces swarm discipline by making specialist delegation **mandatory, not optional**.

## Architecture

```
Incoming Task
    ↓
┌─────────────────────────┐
│  TRIGGER DETECTION      │ ← Deterministic (regex/pattern)
│  (Pre-Orchestrator)     │    NOT LLM-decided
└───────────┬─────────────┘
            │
    ┌───────┴────────┐
    │                │
    ▼                ▼
 ANSWER           ACTION
 (Direct)         (Swarm)
    │                │
    ▼                ▼
Orchestrator   Orchestrator
responds       decomposes &
immediately    delegates
```

## Implementation Strategy

### Phase 0.1a: Soft Router (Prompt-based)
- **Duration:** 15 minutes
- **Enforcement:** Prompt-based (trusts LLM to follow rules)
- **Location:** `skills/swarm-memory/router.md`
- **Validation:** Test patterns against sample tasks
- **Iteration:** Refine triggers based on false positives/negatives

### Phase 0.1b: Hard Router (Code-based) — OPTIONAL
- **Duration:** 30 minutes
- **Enforcement:** TypeScript pre-LLM call (zero trust)
- **Location:** Clawdbot gateway/runtime (local patch)
- **Benefit:** LLM never gets choice to ignore routing

## Routing Priority (Checked in Order)

### 1. ANSWER Precedence (Highest Priority)
**Conditions:** ALL must be true
- Starts with question pattern: `What is`, `Explain`, `How does`, `Why`, `Should I`, `Do you want`
- AND contains NO external references (file paths, URLs, code blocks)

**Examples:**
- ✅ "What is HPOS?" → ANSWER
- ✅ "Explain how grep works" → ANSWER
- ✅ "Why did the test fail?" → ANSWER (no file reference)
- ❌ "Why did tests/e2e/test.ts fail?" → ACTION (has file path)

### 2. ACTION Triggers (Any Match)
**File Patterns:**
- File extensions: `.ts`, `.md`, `.js`, `.py`, `.json`, `.yml`, `.yaml`, `.tsx`, `.jsx`
- Path indicators: `src/`, `/`, `~/`, `./`, `../`
- Example: "fix the src/index.ts file" → ACTION

**Keywords:**
- Operations: `fix`, `debug`, `implement`, `create`, `update`, `delete`, `refactor`, `test`
- Search: `search`, `find`, `look for`, `grep`, `locate`
- Execution: `run`, `execute`, `deploy`, `start`, `stop`, `restart`
- Memory: `remember`, `save`, `store`, `recall`, `note`

**Web References:**
- URLs: `http://`, `https://`, `.com`, `.io`, `.dev`, `.org`
- Web actions: `fetch`, `download`, `scrape`, `browse`

**Code Indicators:**
- Code blocks: ` ``` ` (triple backticks)
- References: `codebase`, `repo`, `repository`, `project`, `our code`

**Examples:**
- ✅ "fix the E2E tests" → ACTION (keyword: fix, tests)
- ✅ "search for similar implementations" → ACTION (keyword: search)
- ✅ "create a new file" → ACTION (keyword: create)

### 3. Default: ANSWER
If no ANSWER precedence and no ACTION triggers → ANSWER mode

**Rationale:** For clarifying questions, summaries, or conceptual discussions.

## Confidence Levels

### STRONG ACTION (3+ triggers)
- **Behavior:** Force swarm, no override allowed
- **Example:** "fix the bug in src/api/auth.ts and update tests"
  - Triggers: fix, file path, update, tests (4 triggers)

### WEAK ACTION (1-2 triggers)
- **Behavior:** Swarm recommended, orchestrator can request clarification
- **Example:** "search for examples"
  - Triggers: search (1 trigger)
  - Orchestrator might ask: "Search where? Web, codebase, or memory?"

### ANSWER (0 triggers + question pattern)
- **Behavior:** Direct response permitted
- **Example:** "What is the difference between HPOS and classic?"

## Debate Triggers

Debate is a conditional layer — not every task needs it. These triggers determine when to invoke the Advocate/Critic dialectic.

### Planning Debate Triggers (before execution)

| Trigger | Condition | Stakes Level |
|---------|-----------|--------------|
| Destructive operations | delete, drop, remove, truncate, overwrite | high |
| Deployment | deploy, publish, release, push to prod/main | high |
| Security-sensitive | auth, token, password, secret, key, credential | high |
| Bulk operations | "all", "every", "entire", wildcard patterns (*) | medium |
| Ambiguous scope | WEAK ACTION confidence + vague terms | medium |

### Failure Debate Triggers (after execution)

| Trigger | Condition | Action |
|---------|-----------|--------|
| 2 consecutive failures | Same task failed twice | DEBATE_FAILURE |
| Same error pattern | Different tasks, identical error | DEBATE_FAILURE |
| User rejection 2x | Output rejected/revised twice | DEBATE_FAILURE |
| 3+ consecutive failures | Debate already happened | AUTO_ESCALATE |
| Security + any failure | High-stakes task failed once | AUTO_ESCALATE |

### Debate Bypass (never debate)

- Read-only operations (search, list, cat, grep without -i)
- Trivial commands (pwd, date, whoami, echo)
- User said "just do it", "skip confirmation", "I'm sure"
- Task already debated this session (don't re-debate same decision)

### Routing Logic (Updated)

```
INCOMING TASK
    │
    ▼
┌─────────────────┐
│ TRIGGER DETECT  │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
 ANSWER     ACTION
    │         │
    │    ┌────┴────┐
    │    ▼         ▼
    │  PLANNING  NO DEBATE
    │  TRIGGER?  (proceed)
    │    │         │
    │    ▼ yes     │
    │  DEBATE_     │
    │  PLANNING    │
    │    │         │
    │    ▼         │
    │  EXECUTE     │
    │    │         │
    │    ▼         │
    │  FAILURE?──no──→ DONE
    │    │
    │    yes
    │    ▼
    │  FAIL_COUNT >= 2?
    │    │
    │    yes
    │    ▼
    │  DEBATE_
    │  FAILURE
    │    │
    │    ▼
    │  RETRY|PIVOT|ESCALATE
    │    │
    ▼    ▼
RESPOND
```

## Trivial Bypass

**Commands that match ACTION keywords but don't need full swarm:**
```
TRIVIAL_COMMANDS = [
  "pwd",      // Print working directory
  "date",     // Current date/time
  "whoami",   // Current user
  "echo",     // Print text
  "ping"      // Network ping
]
```

**Behavior:** Route to Tool Specialist with fast-path flag (no orchestrator decomposition)

**Example:**
- "pwd" → Tool Specialist (direct exec, no swarm overhead)

## Logging Format

All routing decisions are logged to `memory/YYYY-MM-DD.md`:

```markdown
13:26 ROUTE "fix the E2E tests in zbooks repo" → ACTION
  Triggers: [fix, tests, repo]
  Confidence: STRONG (3 triggers)
  Routed to: Swarm Orchestrator

13:27 ROUTE "what is HPOS?" → ANSWER
  Triggers: []
  Pattern: Question + no external refs
  Routed to: Direct Response

13:28 ROUTE "search the codebase for auth" → ACTION
  Triggers: [search, codebase]
  Confidence: WEAK (2 triggers)
  Routed to: Swarm Orchestrator
```

## Edge Cases

### How do I find files with grep?
- Contains: "find" (ACTION keyword)
- But starts with: "How do I" (question pattern)
- And no file paths/URLs
- **Result:** ANSWER (precedence rule applies)

### Find all .ts files in src/
- Contains: "find" (ACTION keyword)
- Contains: `.ts` (file extension), `src/` (path)
- **Result:** ACTION (external references override question pattern)

### What is in the src/config.json file?
- Starts with: "What is" (question pattern)
- Contains: `src/config.json` (file path)
- **Result:** ACTION (file path overrides ANSWER precedence)

## Phase 0.1b: Hard Enforcement (Optional)

### Implementation Location
**File:** Clawdbot `gateway/runtime.ts` or session handler (local patch)

### Hook Point
**Before LLM call**, after message received from user.

### TypeScript Implementation

```typescript
/**
 * Task classification for routing between ANSWER and ACTION modes.
 * Called before LLM prompt generation.
 */
function classifyTask(message: string): 'ANSWER' | 'ACTION' {
  const msg = message.toLowerCase();
  
  // Priority 1: ANSWER precedence
  const questionPattern = /^(what is|explain|how does|why|should i|do you want)/i;
  const externalRefs = [
    /https?:\/\//,                          // URLs
    /\.(ts|md|js|py|json|yml|yaml|tsx|jsx)/, // File extensions
    /src\/|\/|~\/|\.\.\//,                  // Paths
    /```/                                   // Code blocks
  ];
  
  const isQuestion = questionPattern.test(message);
  const hasExternalRefs = externalRefs.some(pattern => pattern.test(message));
  
  if (isQuestion && !hasExternalRefs) {
    return 'ANSWER';
  }
  
  // Priority 2: ACTION triggers
  const actionTriggers = [
    // File patterns (already checked above)
    ...externalRefs,
    
    // Keywords
    /(fix|debug|implement|create|update|delete|refactor|test)/i,
    /(search|find|look for|grep|locate)/i,
    /(run|execute|deploy|start|stop|restart)/i,
    /(remember|save|store|recall|note)/i,
    
    // References
    /(codebase|repo|repository|project|our code)/i,
  ];
  
  if (actionTriggers.some(pattern => pattern.test(message))) {
    return 'ACTION';
  }
  
  // Default: ANSWER
  return 'ANSWER';
}

/**
 * Check if task needs full swarm or can fast-path to specialist.
 */
function needsSwarm(task: string): boolean {
  const TRIVIAL_COMMANDS = ['pwd', 'date', 'whoami', 'echo', 'ping'];
  const cmd = task.trim().split(' ')[0].toLowerCase();
  
  if (TRIVIAL_COMMANDS.includes(cmd)) {
    return false; // Fast-path to Tool Specialist
  }
  
  return classifyTask(task) === 'ACTION';
}

/**
 * Calculate confidence level for ACTION routing.
 */
function getConfidence(message: string): 'STRONG' | 'WEAK' | 'NONE' {
  const allTriggers = [
    /\.(ts|md|js|py|json|yml|yaml|tsx|jsx)/,
    /src\/|\/|~\/|\.\.\//,
    /https?:\/\//,
    /(fix|debug|implement|create|update|delete|refactor|test)/i,
    /(search|find|look for|grep|locate)/i,
    /(run|execute|deploy|start|stop|restart)/i,
    /(remember|save|store|recall|note)/i,
    /(codebase|repo|repository|project)/i,
    /```/
  ];
  
  const triggerCount = allTriggers.filter(p => p.test(message)).length;
  
  if (triggerCount >= 3) return 'STRONG';
  if (triggerCount >= 1) return 'WEAK';
  return 'NONE';
}

// Usage in gateway/runtime:
const mode = classifyTask(userMessage);
const confidence = getConfidence(userMessage);

// Log decision
await appendToMemory(`${timestamp} ROUTE "${userMessage.slice(0, 50)}..." → ${mode}`);
await appendToMemory(`  Confidence: ${confidence}`);

// Route to appropriate agent prompt
const agentPrompt = mode === 'ACTION' 
  ? loadSwarmOrchestrator()  // From AGENTS.md + swarm context
  : loadDirectAnswerAgent();  // Standard Clawdbot prompt
```

### Integration Points

1. **Message Handler:** Hook into incoming message pipeline
2. **Prompt Builder:** Select different system prompts based on routing
3. **Logging:** Write routing decision to daily memory file
4. **Metrics:** Track ANSWER vs ACTION ratio over time

### Rollback Plan

If hard routing causes issues:
1. Feature flag: `ENABLE_HARD_ROUTING=false` in config
2. Falls back to soft routing (prompt-based)
3. No data loss, routing logs remain for analysis

## Validation & Iteration

### Testing Phase 0.1a
1. Run against 50 sample tasks
2. Calculate accuracy: correct routing / total tasks
3. Identify false positives/negatives
4. Refine trigger patterns
5. Document edge cases

### Metrics to Track
- **ANSWER rate:** % of tasks routed to direct response
- **ACTION rate:** % of tasks routed to swarm
- **Confidence distribution:** STRONG vs WEAK ACTION tasks
- **Override rate:** How often orchestrator requests clarification

### Success Criteria
- **>90% correct routing** on sample tasks
- **<5% false positives** (ANSWER → ACTION when shouldn't)
- **Zero false negatives** (ACTION → ANSWER when file/web ops needed)

## Why This Matters

**Without routing:**
- Orchestrator is a "lazy GPT wrapper"
- Uses specialists only when convenient
- Inconsistent behavior, token-inefficient

**With routing:**
- Swarm becomes **mandatory for complex tasks**
- Orchestrator is **traffic cop, not decision-maker**
- Consistent, predictable behavior
- Token efficiency enforced by architecture

## Default Philosophy

**When in doubt → ACTION mode**

**Rationale:**
- Overhead of unnecessary specialist call is minimal (~1-2 seconds)
- Cost of skipping specialist when needed is catastrophic (wrong answer, wasted tokens, broken code)
- Most developer tasks ARE complex (fix, implement, debug, research)
- Direct answers are rare (except clarifications mid-task)

## References

- CSP/1 Protocol: `CSP1.md` (Phase 0.2)
- Memory Tiers: Implementation plan Phases 1-3
- Orchestrator Behavior: `AGENTS.md` (Phase 3)
