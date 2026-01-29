# Human-Like Memory Behaviors - Implementation Summary

## Overview
This document summarizes the human-like memory behaviors, split into **Core (Phase 2)** and **Optional (Phase 4+)** based on agent consensus.

---

## ⚙️ PHASE 2 CORE BEHAVIORS (Required)

These are essential for basic memory functionality and have acceptable performance overhead.

### 1. Importance Scoring
**What:** Weight memories by significance  
**Trigger:** On memory_store  
**Signals:** User emphasis (+0.3), decisions (+0.2), failures (+0.2), corrections (+0.3)  
**Output:** importance score 0.0-1.0, determines tier and retention

### 2. Episodic Context
**What:** Remember when/where, not just what  
**Storage:** Full episode metadata in every entry (task, project, timestamp, outcome)  
**Enhancement:** Include context in responses  
**Queries:** Support temporal/project/outcome filters

### 3. Contradiction Detection
**What:** Flag conflicts before storing  
**Trigger:** Before memory_store completes  
**Behavior:** Semantic search similarity > 0.80, compare conclusions  
**Response:** `⚠️ Contradiction detected` with resolution options

### 4. Retrieval Budget (Performance Constraint)
**What:** Prevent memory operations from degrading performance  
**Constraints:**
- Max query time: 50ms per memory operation
- Top-K limit: 5 results per query
- Proactive recall: Only on explicit triggers (not every ACTION task)
- Semantic search: Pre-filter by recency/importance before full search

**Implementation:**
```
TASK REQ:recall
BUDGET {max_time_ms: 50, max_results: 5}
```

**Rationale:** Without budget constraints, memory scales O(n) with growth. This prevents latency creep and forces efficient indexing.

---

## 🔮 PHASE 4+ OPTIONAL BEHAVIORS (Deferred)

These add value but have higher implementation cost or performance overhead. Defer until core memory proves stable.

### 5. Priming (Associative Activation)
**What:** Related memories activate together  
**Trigger:** On memory_recall  
**Behavior:** Follow links (weight > 0.5), depth 2, return top 2-3 primed items  
**CSP/1:** `PRIMED mem:uuid3, mem:uuid4` with reasons  
**Why defer:** Adds 2-3 additional queries per recall, complex to optimize

### 6. Proactive Recall (Unsolicited Relevance)
**What:** Relevant memories surface unbidden  
**Trigger:** Explicit task keywords (not every ACTION)  
**Behavior:** Query with keywords, filter relevance > 0.7, inject as suggestion  
**Format:** `📌 Note: This relates to...`  
**Why defer:** Expensive if run on every task, needs tuning to avoid noise

### 7. Consolidation (Memory Processing)
**What:** Strengthen, cluster, promote during idle  
**Trigger:** Daily 3 AM or 4hr inactivity  
**Steps:** Cluster similar → summarize → promote → prune links → archive decayed  
**Output:** Consolidation log with health score  
**Why defer:** Complex logic, needs stable memory tier foundation first

### 8. Spaced Resurfacing
**What:** Important items resurface periodically  
**Trigger:** Schedule: 1d, 3d, 7d, 14d, 30d  
**Eligibility:** importance > 0.8, not dismissed 2+  
**Method:** Daily briefing or contextual reminder  
**Why defer:** Requires consolidation to work effectively

---

## Implementation Strategy

### Phase 2 (Core) - 60 min
1. Memory schema with episodic context (15 min)
2. Importance scoring system (15 min)
3. Contradiction detection (15 min)
4. Retrieval budget constraints (10 min)
5. Memory specialist basic ops (5 min)

### Phase 4+ (Optional) - 45 min
1. Priming implementation (15 min)
2. Proactive recall tuning (15 min)
3. Consolidation + resurfacing (15 min)

**Total:** Phase 2 stays 60 min, advanced behaviors deferred to Phase 4+

---

## Full Specification
Complete implementation details in:
- memory-schema.md (episodic context, links, storage)
- importance-scoring.md (boost/decay signals)
- Retrieval budget (added above)
- graphiti integration (optional)

See user's complete specification message for full CSP/1 protocols and examples.
