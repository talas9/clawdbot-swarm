# Importance Scoring System

## Purpose

Not all memories are equal. Humans prioritize emotionally significant, consequential, or surprising information. This system mimics that behavior.

## Base Importance by Tier

| Tier | Base Score |
|------|-----------|
| ultra-short | 0.5 |
| short | 0.5 |
| medium | 0.6 |
| long | 0.8 |

## Boost Signals (Detected Automatically)

### User Emphasis (+0.3)
Phrases indicating user wants this remembered:
- "important", "remember this", "don't forget"
- "critical", "crucial", "key point"
- "make sure to", "always", "never"

### Decision Points (+0.2)
Explicit choices being made:
- "decided to", "going with", "chose"
- "will use", "switching to", "settled on"
- "the plan is", "we'll do"

### Emotional Markers (+0.2)
Indicates significance:
- "finally!", "frustrated", "excited"
- Exclamation marks (multiple)
- "hate", "love", "annoying", "amazing"

### Failure Context (+0.2)
Mistakes are memorable:
- Task outcome: failure
- "broke", "failed", "error", "bug"
- "doesn't work", "wrong", "mistake"

### User Correction (+0.3)
Corrections stick strongly:
- "actually", "no I meant", "that's wrong"
- "not X, but Y", "correction:", "update:"
- Contradicts previous memory

### Repeated Mention (+0.1 per occurrence, max +0.3)
Concepts mentioned multiple times across sessions:
- Track entity frequency
- 3+ mentions → boost
- Indicates ongoing relevance

### Explicit Request (+0.4)
User directly asks to remember:
- "save this", "store this", "add to memory"
- "remember that I", "note that"

## Decay Signals (Reduce Importance)

### Staleness (-0.1 per period)
- Short-term: -0.1/day after 7 days inactive
- Medium-term: -0.05/day after 30 days inactive
- Long-term: No automatic decay

### Dismissal (-0.15 per dismissal)
- User dismisses resurfaced memory
- User says "not relevant", "ignore that"
- 2 dismissals → disable resurfacing
- 3 dismissals → reduce importance to 0.3

### Superseded (-0.5 or archive)
- New contradicting info confirmed by user
- Mark old as superseded, link to new

## Importance Thresholds

| Score | Behavior |
|-------|----------|
| > 0.8 | Eligible for resurfacing, promote to long-term |
| 0.6 - 0.8 | Standard retention, medium-term |
| 0.4 - 0.6 | Short-term only, faster decay |
| 0.2 - 0.4 | Decay candidate, low priority retrieval |
| < 0.2 | Archive or delete |

## Calculation Formula

```
final_importance = min(1.0, base_importance + sum(boosts) - sum(decays))
```

**Example:**
- Base (short-term): 0.5
- User said "important": +0.3
- Decision point: +0.2
- Total: 0.5 + 0.3 + 0.2 = 1.0 (capped)

## Implementation in Memory Specialist

When `memory_store` is called:
1. Parse content for boost signals (regex patterns)
2. Check `episode.outcome` for context boosts
3. Query existing memories for repetition boost (with budget constraint)
4. Calculate final importance
5. Store with importance score
6. If importance > 0.8, mark for potential resurfacing (Phase 4+)

## Retrieval Budget (Performance Constraint)

**Problem:** Without constraints, memory operations scale O(n) with growth, causing latency creep.

**Solution:** Hard performance limits on all memory queries:

```
BUDGET {
  max_time_ms: 50,
  max_results: 5,
  pre_filter: true  // Filter by recency/importance before semantic search
}
```

**Enforcement:**
- Memory queries timeout after 50ms
- Return top-5 results max (ranked by relevance × importance)
- Pre-filter: Only search entries with:
  - `current_relevance > 0.3` OR
  - `last_accessed < 30 days ago` OR
  - `importance > 0.7`

**CSP/1 Extension:**

```
BUDGET {max_time_ms: 50, max_results: 5}
IMPORTANCE_SIGNALS [user_emphasis, decision_point, repeated:3]
IMPORTANCE_SCORE 0.85
RESURFACE_ENABLED false  // Phase 4+ feature
```
