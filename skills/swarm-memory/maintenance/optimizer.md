# Memory Meta-Optimizer

## Objective
Continuously improve memory system parameters based on usage metrics. Self-tune decay rates, thresholds, and promotion criteria.

## Metrics Tracked

### Core Metrics (stored in `memory/metrics/YYYY-MM-DD.jsonl`)
```json
{
  "date": "2026-01-29",
  "recall_hit_rate": 0.78,
  "ignore_rate": 0.15,
  "escalation_frequency": 0.08,
  "token_per_accuracy": 1234,
  "entity_growth_rate": 0.18,
  "relation_growth_rate": 0.22,
  "avg_relevance": 0.71,
  "avg_weight": 0.66,
  "decay_effectiveness": 0.14,
  "promotion_rate": 0.06,
  "storage_mb": 189
}
```

### Derived Metrics
- **Recall Hit Rate:** % of memory searches returning relevant results (user engagement)
- **Ignore Rate:** % of recalled items user doesn't engage with (over-retrieval)
- **Escalation Frequency:** % of tasks requiring deep-dive / human intervention
- **Token/Accuracy Ratio:** Average tokens spent per successfully completed task
- **Decay Effectiveness:** (entities_removed / entities_created) in period

## Optimization Targets

### 1. Decay Rate Tuning

**Objective:** Balance memory freshness with context retention

**Current Parameters:**
- Short-term: `decay_rate = 0.1` per 7 days inactive
- Medium-term: `decay_rate = 0.05` per 30 days inactive
- Long-term: `decay_rate = 0` (manual only)

**Optimization Rules:**

#### Increase Decay Rate When:
- `ignore_rate > 0.3` (too much noise)
- `entity_growth_rate > 0.25` (unsustainable growth)
- `storage_mb > 500` (approaching limits)

**Action:** `decay_rate += 0.01`

#### Decrease Decay Rate When:
- `recall_hit_rate < 0.6` (losing valuable context)
- `escalation_frequency > 0.2` (insufficient context)
- `avg_relevance < 0.5` (keeping wrong things)

**Action:** `decay_rate -= 0.01`

**Bounds:** `0.03 <= decay_rate <= 0.2`

### 2. Relevance Threshold Tuning

**Objective:** Optimize entity deletion threshold

**Current Parameter:** `deletion_threshold = 0.1`

**Optimization Rules:**

#### Increase Threshold When:
- `storage_mb > 400` AND `decay_effectiveness < 0.1`
- `avg_relevance < 0.6` (keeping too much low-quality)

**Action:** `deletion_threshold += 0.05`

#### Decrease Threshold When:
- `recall_hit_rate < 0.65` (deleting too aggressively)
- `escalation_frequency > 0.15` (context gaps)

**Action:** `deletion_threshold -= 0.02`

**Bounds:** `0.05 <= deletion_threshold <= 0.3`

### 3. Promotion Criteria Tuning

**Objective:** Optimize short→medium→long promotion triggers

**Current Parameters:**
- `promotion_access_count = 3` (accessed 3+ times in period)
- `promotion_period_days = 7`

**Optimization Rules:**

#### Increase Access Count Threshold When:
- `promotion_rate > 0.15` (promoting too much)
- `avg_relevance in medium_tier < 0.7` (promoting wrong things)

**Action:** `promotion_access_count += 1`

#### Decrease Access Count Threshold When:
- `promotion_rate < 0.03` (not promoting enough)
- `ignore_rate > 0.25` AND `avg_relevance in short_tier > 0.8` (missing promotions)

**Action:** `promotion_access_count -= 1`

**Bounds:** `2 <= promotion_access_count <= 5`

### 4. Link Weight Thresholds

**Objective:** Optimize minimum weight for relation retention

**Current Parameter:** `min_link_weight = 0.3`

**Optimization Rules:**

#### Increase Threshold When:
- `relation_growth_rate > 0.30` (too many weak links)
- `token_per_accuracy > 2000` (noise reducing efficiency)

**Action:** `min_link_weight += 0.05`

#### Decrease Threshold When:
- `escalation_frequency > 0.15` (missing connections)
- `recall_hit_rate < 0.65` (losing valuable associations)

**Action:** `min_link_weight -= 0.05`

**Bounds:** `0.2 <= min_link_weight <= 0.6`

## Implementation

### Weekly Optimization Pass
Run after weekly consolidation:
```bash
node ~/clawd/skills/swarm-memory/maintenance/meta-optimizer.js --mode=weekly
```

**Logic:**
1. Load metrics from last 7 days
2. Calculate averages and trends
3. Apply optimization rules
4. Update config file
5. Log changes to `memory/optimizer-changes.jsonl`

### Monthly Optimization Pass
Run after monthly rebuild:
```bash
node ~/clawd/skills/swarm-memory/maintenance/meta-optimizer.js --mode=monthly
```

**Logic:**
1. Load metrics from last 30 days
2. Calculate monthly averages
3. Apply optimization rules (with 2x strength)
4. Detect long-term trends (3-month moving average)
5. Update config file
6. Generate optimization report

## Configuration Update Format

**File:** `~/clawd/skills/swarm-memory/memory-tiers/neo4j-config.json`

**Update Section:**
```json
{
  "memory": {
    "tiers": {
      "short": {
        "decay_days": 7,
        "decay_rate": 0.11
      },
      "medium": {
        "decay_days": 30,
        "decay_rate": 0.05
      }
    },
    "thresholds": {
      "min_relevance": 0.12,
      "min_link_weight": 0.35,
      "promotion_access_count": 3,
      "promotion_days": 7
    }
  }
}
```

## Change Logging

**File:** `memory/optimizer-changes.jsonl`

**Format:**
```json
{
  "timestamp": "2026-01-29T05:30:00Z",
  "mode": "weekly",
  "parameter": "decay_rate_short",
  "old_value": 0.10,
  "new_value": 0.11,
  "reason": "ignore_rate too high (0.32)",
  "metrics": {
    "recall_hit_rate": 0.78,
    "ignore_rate": 0.32,
    "escalation_frequency": 0.08
  }
}
```

## Success Metrics

### Optimization Effectiveness
Track these metrics before/after optimization:
- Recall hit rate improvement: target +5% per month
- Ignore rate reduction: target -3% per month
- Token efficiency: target -10% per month
- Storage growth: target stable (<20% per month)

### Alert Conditions
- Parameter changed >5 times in 30 days (oscillation - reduce sensitivity)
- No parameter changes in 90 days (stagnation - check metrics collection)
- Recall hit rate declining for 3+ weeks (investigate root cause)

## Rollback Mechanism

If optimization causes degradation:
1. Detect via metrics drop >15% in 7 days
2. Restore previous config from `memory/optimizer-changes.jsonl`
3. Log rollback event
4. Disable auto-optimization for 30 days
5. Escalate to human for manual tuning

## Performance Targets
- Optimization pass: <30 seconds
- Config update: <1 second
- No service interruption
- Memory footprint: <50MB
