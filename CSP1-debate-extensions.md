# CSP/1 Debate Protocol Extensions

**Note:** This section should be added to `skills/swarm-memory/CSP1.md` after "## Task Request Format"

---

## Debate Protocol Extensions

### Planning Debate Request
```
DEBATE REQ:<proposal> ROUNDS:<1-3> STAKES:<low|medium|high>
```

### Planning Debate Responses

**Advocate:**
```
POSITION ADVOCATE
CLAIM <argument>
SUPPORTS [evidence1, evidence2]
CONFIDENCE <0.0-1.0>
```

**Critic:**
```
POSITION CRITIC
OBJECTION <main_flaw>
RISKS [risk1, risk2]
SEVERITY <low|medium|high>
COUNTER <mitigation_or_alternative>
```

### Failure Debate Request
```
DEBATE_FAILURE REQ:<task> ATTEMPTS:[attempt1, attempt2] ERRORS:[error1, error2]
```

### Failure Debate Responses

**Advocate:**
```
POSITION ADVOCATE
DIAGNOSIS <what_went_wrong>
FIX <proposed_change>
CONFIDENCE <0.0-1.0>
DIFF_FROM_PREVIOUS <what_is_different>
```

**Critic:**
```
POSITION CRITIC
PATTERN <root_cause>
BLIND_SPOT <what_advocate_missed>
ALTERNATIVES [approach1, approach2]
SHOULD_ESCALATE <true|false>
ESCALATE_REASON <if_true_why>
```

### Synthesis Response (Orchestrator)
```
RESOLUTION <PROCEED|MODIFY|RETRY|PIVOT|ESCALATE>
RATIONALE <one_sentence>
MODIFICATIONS [changes] | NEXT_APPROACH <description> | ESCALATE_TO <human>
```
