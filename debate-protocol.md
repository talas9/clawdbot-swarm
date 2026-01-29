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
    ┌───────────┼───────────┐
    ▼           ▼           ▼
 PROCEED     MODIFY    ESCALATE
(as planned) (changes)  (to human)
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
RESOLUTION <PROCEED|MODIFY|ESCALATE>
RATIONALE <one_sentence_explanation>
MODIFICATIONS [list_of_changes_if_MODIFY]
NEXT_ATTEMPT_LIMIT <1-2_if_MODIFY>
```

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
