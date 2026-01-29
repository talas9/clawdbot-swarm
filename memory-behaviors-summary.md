# Human-Like Memory Behaviors - Implementation Summary

## Overview
This document summarizes the 6 human-like memory behaviors to be implemented in Phase 2.

## 1. Priming (Associative Activation)
**What:** Related memories activate together  
**Trigger:** On memory_recall  
**Behavior:** Follow links (weight > 0.5), depth 2, return top 2-3 primed items  
**CSP/1:** `PRIMED mem:uuid3, mem:uuid4` with reasons

## 2. Proactive Recall (Unsolicited Relevance)
**What:** Relevant memories surface unbidden  
**Trigger:** Every ACTION task  
**Behavior:** Query with keywords, filter relevance > 0.7, inject as suggestion  
**Format:** `📌 Note: This relates to...`

## 3. Contradiction Detection
**What:** Flag conflicts before storing  
**Trigger:** Before memory_store completes  
**Behavior:** Semantic search similarity > 0.80, compare conclusions  
**Response:** `⚠️ Contradiction detected` with resolution options

## 4. Consolidation (Memory Processing)
**What:** Strengthen, cluster, promote during idle  
**Trigger:** Daily 3 AM or 4hr inactivity  
**Steps:** Cluster similar → summarize → promote → prune links → archive decayed  
**Output:** Consolidation log with health score

## 5. Spaced Resurfacing
**What:** Important items resurface periodically  
**Trigger:** Schedule: 1d, 3d, 7d, 14d, 30d  
**Eligibility:** importance > 0.8, not dismissed 2+  
**Method:** Daily briefing or contextual reminder

## 6. Episodic Context Retrieval
**What:** Remember when/where, not just what  
**Storage:** Full episode metadata in every entry  
**Enhancement:** Include context in responses  
**Queries:** Support temporal/project/outcome filters

## Full Specification
Complete implementation details in:
- memory-schema.md
- importance-scoring.md
- Full behaviors spec (to be added)
- graphiti integration (optional)

See user's complete specification message for full CSP/1 protocols and examples.
