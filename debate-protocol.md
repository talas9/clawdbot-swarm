# Dialectic Layer — Debate Protocol

## Purpose

Two-agent debate system that challenges assumptions before high-stakes actions and after repeated failures. Prevents confirmation bias and surfaces blind spots.

## Architecture

```
┌─────────────────────────────────┐
│     DEBATE TRIGGERS             │
│   (Router checks conditions)    │
└───────────────┬─────────────────┘
                │
                ▼
        ┌───────────────┐
        │   ADVOCATE    │
        │   (defends)   │
        └───────┬───────┘
                │
                ▼
        ┌───────────────┐
        │    CRITIC     │
        │  (challenges) │
        └───────┬───────┘
                │
                ▼
        ┌───────────────┐
        │  SYNTHESIS    │
        │ (Orchestrator)│
        └───────┬───────┘
                │
    ┌───────────┼───────────┼───────────┼───────────┐
    ▼           ▼           ▼           ▼           ▼
 PROCEED     MODIFY      RETRY       PIVOT    ESCALATE
(as planned) (changes)  (try again) (new way) (to human)
```

## Debate Types

### 1. Planning Debate
**When:** Before executing high-stakes operations  
**Goal:** Validate approach before commitment

### 2. Failure Debate
**When:** After 2 consecutive failures on same task  
**Goal:** Break the failure loop with fresh perspective

## CSP/1 Protocol Extensions

### Planning Debate Request
```
DEBATE REQ:<proposal> ROUNDS:<1-3> STAKES:<low|medium|high>
```

### Failure Debate Request
```
DEBATE_FAILURE REQ:<task> ATTEMPTS:[attempt1, attempt2] ERRORS:[error1, error2]
```

### Synthesis Response (Orchestrator)
```
RESOLUTION <PROCEED|MODIFY|RETRY|PIVOT|ESCALATE>
RATIONALE <one_sentence_explanation>
MODIFICATIONS [list_of_changes] | NEXT_APPROACH <description> | ESCALATE_TO <human>
NEXT_ATTEMPT_LIMIT <1-2_if_MODIFY_or_RETRY>
```

**Resolution Types:**
- `PROCEED`: Accept plan as-is (Critic found no blocking issues)
- `MODIFY`: Accept plan with specified changes
- `RETRY`: Same approach with tactical adjustments (failure debates)
- `PIVOT`: Fundamentally different approach required (failure debates)
- `ESCALATE`: Human intervention needed

## Debate Flow

### Planning Debate Flow

1. Router detects planning debate trigger
2. Orchestrator sends `DEBATE REQ` to Advocate
3. Advocate responds with `CLAIM` + `SUPPORTS` + `CONFIDENCE`
4. Orchestrator forwards to Critic with Advocate's position
5. Critic responds with `OBJECTION` + `RISKS` + `COUNTER`
6. Orchestrator synthesizes: `PROCEED` | `MODIFY` | `ESCALATE`

### Failure Debate Flow

1. Router detects 2nd failure on same task
2. Orchestrator sends `DEBATE_FAILURE` to Advocate
3. Advocate responds with `DIAGNOSIS` + `FIX` + `DIFF_FROM_PREVIOUS`
4. Orchestrator forwards to Critic with Advocate's position
5. Critic responds with `PATTERN` + `BLIND_SPOT` + `SHOULD_ESCALATE`
6. Orchestrator synthesizes: `RETRY` | `PIVOT` | `ESCALATE`

## Synthesis Rules (Orchestrator)

### Planning Debate

- If Critic `SEVERITY:high` + `COUNTER` is actionable → `MODIFY` with Critic's suggestion
- If Advocate `CONFIDENCE >= 0.8` + Critic `SEVERITY:low` → `PROCEED`
- If `stakes:high` + any disagreement → err toward `MODIFY` or `ESCALATE`

### Failure Debate

- If Critic `SHOULD_ESCALATE:true` → `ESCALATE` (no override)
- If Advocate `DIFF_FROM_PREVIOUS` is substantial + Critic provides no `BLIND_SPOT` → `RETRY`
- If same `PATTERN` identified by Critic matches previous errors → `ESCALATE`
- Max 1 additional attempt after failure debate (then auto-escalate)

## Logging Format

Append to `memory/YYYY-MM-DD.md`:

### Planning Debate Log
```
HH:MM DEBATE_PLANNING task:"<task_summary>"
  Stakes: high|medium|low
  Advocate: CLAIM:"<claim>" CONFIDENCE:<n>
  Critic: OBJECTION:"<objection>" SEVERITY:<level>
  Resolution: PROCEED|MODIFY|ESCALATE
  Modifications: [list] or none
```

### Failure Debate Log
```
HH:MM DEBATE_FAILURE task:"<task_summary>" attempt:<n>
  Errors: [error1, error2]
  Advocate: FIX:"<fix>" DIFF:"<diff>"
  Critic: PATTERN:"<pattern>" SHOULD_ESCALATE:<bool>
  Resolution: RETRY|PIVOT|ESCALATE
  Next approach: "<description>" or "human takeover"
```

## Implementation Specifications

### Task ID Hashing Strategy

**Hash function:** SHA-256 (first 16 chars for brevity)

**Canonicalization before hashing:**
1. Lowercase all text
2. Remove punctuation except hyphens/underscores
3. Normalize whitespace to single spaces
4. Stem common verbs (fix → fix, fixing → fix, fixed → fix)

**Example:**
```
"Fix the authentication test" → "fix authentication test" → SHA-256 → "a3f2c1..."
```

**Semantic collision handling:**
- Tasks that differ only in punctuation/casing are treated as same task (intended)
- Tasks with fundamentally different goals but similar phrasing get different hashes
- If uncertain, the Orchestrator can query user: "Is this the same task as before?"

### Sub-Agent Invocation Mechanics

**Model:** Same model as Orchestrator (inheritance)

**Invocation:** Sequential (Advocate first, then Critic with Advocate's response in context)

**Context window:**
- Advocate receives: Debate request + last 2 task attempts (if failure debate)
- Critic receives: Debate request + Advocate response + router context
- Orchestrator receives: All of the above for synthesis

**Response limits:**
- Advocate: 500 tokens max
- Critic: 500 tokens max
- Synthesis: 200 tokens max

### Synthesis Judgment Criteria

**"Substantial" DIFF_FROM_PREVIOUS:**
- Changes core approach (e.g., "use caching" vs "optimize query")
- Adds new tool/library/method
- NOT substantial: typo fixes, minor parameter tweaks

**"Actionable" COUNTER:**
- Identifies specific risk with mitigation suggestion
- Cites precedent or known failure mode
- NOT actionable: vague concerns like "might not work"

**If ambiguous:** Orchestrator applies LLM judgment with bias toward accepting substantial diffs and actionable counters (false positives are safer than false negatives in debates).

### Error Fingerprinting

**Error identity for failure tracking:**
- Error code (if present) + first 50 chars of error message
- Normalized: lowercased, remove file paths/line numbers

**Examples (same error):**
```
"ENOENT: no such file or directory, open '/path/to/file.txt'"
"ENOENT: no such file or directory, open '/other/path/file.txt'"
→ Fingerprint: "enoent no such file or directory open"
```

**Examples (different errors):**
```
"ENOENT: file not found" → "enoent file not found"
"EACCES: permission denied" → "eacces permission denied"
→ Different fingerprints, no pattern detected
```

### Staleness Reset Logic

**Reset failure count when:**
1. Task succeeds (obvious)
2. User says "try different approach" / "start fresh" / "ignore previous attempts"
3. **Significant context change:**
   - New information provided (user adds details not present before)
   - Environment changed (user says "I fixed X", "updated Y")
   - Task goal evolves (user refines request substantially)

**NOT reset by:**
- Pure time passage alone (24h is guideline, not automatic)
- Rephrasing same request
- User frustration without new information

### Cost Considerations

**Token multiplier per debate:**
- Planning debate: ~1,500-2,000 tokens (Advocate 500 + Critic 500 + Orchestrator context 500-1,000)
- Failure debate: ~2,000-2,500 tokens (includes previous attempts in context)

**Frequency estimates (typical session):**
- High-stakes triggers: 10-20% of tasks
- Failure triggers: 5-10% of tasks
- Combined: ~15-30% overhead on API costs

**Mitigation:**
- Bypass rules eliminate ~70% of potential debates
- User can disable debates per session: `DISABLE_DEBATE` flag
- Adaptive depth: Reduce rounds for medium-stakes (future enhancement)

### Performance Monitoring

**Track in `memory/debate-metrics.jsonl`:**
```json
{"debate_id": "abc123", "type": "planning", "task": "delete-cache", "resolution": "PROCEED", "outcome": "success", "helped": false}
{"debate_id": "def456", "type": "failure", "task": "fix-auth", "resolution": "PIVOT", "outcome": "success", "helped": true}
```

**Metrics to analyze:**
- Debate frequency by category
- MODIFY/RETRY/PIVOT effectiveness (did it work?)
- False positive rate (debate triggered but wasn't needed)
- Auto-escalation frequency

**Review cadence:** Weekly (Phase 5 maintenance routine)

## Failure Tracking State

### Required

Track consecutive failures per task: `memory/failures.jsonl` (append-only):

```json
{"task_id":"fix-auth-test","attempt":1,"ts":"2026-01-29T14:30:00Z","error":"Cannot find module","approach":"updated import path"}
{"task_id":"fix-auth-test","attempt":2,"ts":"2026-01-29T14:32:00Z","error":"Cannot find module","approach":"reinstalled deps"}
```

### Query Before Each Attempt

Before executing any ACTION task:
1. Hash task description → `task_id`
2. Query `failures.jsonl` for `task_id`
3. If count >= 2 → trigger `DEBATE_FAILURE`
4. If count >= 3 → auto-escalate (debate already happened)

### Reset Conditions

Clear failure count when:
- Task succeeds
- User explicitly says "start fresh" / "try different approach"
- 24 hours pass (stale failure)
