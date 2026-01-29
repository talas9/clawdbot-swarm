# Memory Entry Schema

## Purpose

Standardized format for all memory entries across tiers. Includes episodic context and metadata for human-like memory behaviors.

## Entry Format

```json
{
  "id": "mem_<uuid>",
  "content": "The actual memory content - concise, factual",
  "summary": "One-sentence summary for quick scanning",
  "tier": "ultra-short | short | medium | long",
  "importance": 0.0-1.0,
  
  "episode": {
    "task_id": "task-hash",
    "task_name": "Human-readable task description",
    "project": "project-name or null",
    "session_id": "session-uuid",
    "timestamp": "2026-01-29T14:30:00Z",
    "trigger": "What prompted this memory (user statement, task outcome, decision)",
    "outcome": "success | failure | decision | observation | correction"
  },
  
  "entities": ["jwt", "auth", "zbooks"],
  "tags": ["#security", "#architecture"],
  
  "links": [
    {"to": "mem_uuid2", "type": "related_to", "weight": 0.8},
    {"to": "mem_uuid3", "type": "contradicts", "weight": 0.9}
  ],
  
  "retrieval": {
    "access_count": 0,
    "last_accessed": null,
    "created_at": "2026-01-29T14:30:00Z",
    "decay_rate": 0.05,
    "current_relevance": 1.0
  },
  
  "resurfacing": {
    "enabled": false,
    "schedule": [],
    "completed": [],
    "dismiss_count": 0
  },
  
  "status": "active | archived | superseded",
  "superseded_by": null
}
```

## Tier-Specific Defaults

| Tier | Default Importance | Decay Rate | Resurface Eligible |
|------|-------------------|------------|-------------------|
| ultra-short | 0.5 | N/A (in-context) | No |
| short | 0.5 | 0.1/day after 7 days | No |
| medium | 0.6 | 0.05/day after 30 days | Yes if importance > 0.7 |
| long | 0.8 | None | Yes if importance > 0.8 |

## Episode Outcome Types

| Outcome | Description | Importance Boost |
|---------|-------------|-----------------|
| success | Task completed successfully | +0.1 |
| failure | Task failed (learn from mistakes) | +0.2 |
| decision | Explicit choice was made | +0.2 |
| observation | Noted fact, no action | +0.0 |
| correction | User corrected previous info | +0.3 |

## Entity Extraction Rules

Entities are extracted automatically:
- Capitalized proper nouns (ProjectName, FileName)
- Technical terms (JWT, API, PostgreSQL)
- File paths (src/auth/token.ts → auth, token)
- Explicit mentions ("the zbooks project" → zbooks)

## Link Types

| Type | Meaning | Typical Weight |
|------|---------|---------------|
| related_to | Generic association | 0.3-0.7 |
| depends_on | A requires B | 0.7-0.9 |
| part_of | A is contained in B | 0.8-1.0 |
| caused_by | A resulted from B | 0.6-0.8 |
| similar_to | Semantic similarity | 0.5-0.8 |
| contradicts | Conflicting information | 0.8-1.0 |
| supersedes | A replaces B | 1.0 |
| alternative_to | A instead of B | 0.6-0.8 |

## File Storage Format

### Short-term: memory/YYYY-MM-DD.md

Human-readable markdown with YAML frontmatter:

```markdown
## 14:30 - Auth Design Decision

Decided to use JWT with 15-minute expiry instead of session tokens. Refresh tokens will last 7 days.

<!--
id: mem_a1b2c3
importance: 0.75
entities: [jwt, session-tokens, refresh-tokens]
links: [{to: mem_xyz, type: alternative_to, weight: 0.8}]
episode: {task: auth-design, outcome: decision}
-->

Tags: #auth #security #architecture
```

### Medium-term: memory/graph.jsonl

Append-only relation log (see graph-schema.md)

### Long-term: MEMORY.md

Curated, manually organized knowledge
