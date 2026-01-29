# Swarm Memory Architecture Skill

## Purpose
Transforms Clawdbot into a hierarchical agent swarm with token-efficient communication, tiered memory, and dialectic reasoning.

## Components
- `CSP1.md` — Inter-agent protocol specification (Compact Symbol Protocol v1)
- `router.md` — Task routing logic (ANSWER vs ACTION mode)
- `specialists/` — Specialist agent definitions (Memory, File, Web, Tool)
- `memory-tiers/` — Memory layer configurations (Ultra-short → Long-term)
- `subagents/` — Sub-agent templates (Analyzer, Planner, Advocate, Critic)
- `parser/` — CSP/1 parsing utilities (TypeScript)
- `maintenance/` — Memory maintenance tasks (Daily, Weekly, Monthly)

## Activation
This skill auto-activates when:
- Complex multi-step tasks detected (ACTION mode)
- Memory operations required
- File/web access needed
- High-stakes operations (debate trigger)
- Consecutive failures (dialectic layer)

## Protocol
All inter-agent communication uses CSP/1. See CSP1.md for complete specification.

## Memory Backend
**Neo4j Graph Database** - All entity/relation storage uses Neo4j instead of JSONL for scalability and performant graph queries.

## Key Features
1. **Strict role separation** - Orchestrator never directly accesses tools/files/memory
2. **Token efficiency** - CSP/1 protocol reduces inter-agent communication by 60-80%
3. **Tiered memory** - Ultra-short → Short → Medium → Long with automatic decay
4. **Dialectic reasoning** - Advocate/Critic debate prevents confirmation bias
5. **Self-improving** - Memory meta-optimizer adjusts parameters based on usage metrics
6. **Failure loop prevention** - Automatic escalation after consecutive failures
