# ClawdBot Swarm

A hierarchical agent swarm memory architecture for ClawdBot/Moltbot self-modification.

## Overview

This project transforms ClawdBot into a hierarchical agent swarm with:
- **Strict role separation** (Orchestrator → Sub-agents → Specialists)
- **CSP/1 inter-agent protocol** (token-efficient, prose-free communication)
- **Tiered memory** (ultra-short → short → medium → long)
- **Self-improving memory maintenance**

## Project Structure

```
clawdbot-swarm/
├── README.md                           # This file
├── LICENSE                             # MIT License
└── swarm-memory-implementation-plan.md # Detailed implementation guide
```

### Target Directory Structure (After Implementation)

```
~/clawd/
├── AGENTS.md                           # Orchestrator behavior
├── MEMORY.md                           # Long-term memory
├── memory/                             # Short/medium-term storage
│   ├── YYYY-MM-DD.md                   # Daily logs
│   ├── graph.jsonl                     # Relation graph
│   └── metrics/                        # Performance metrics
└── skills/swarm-memory/                # Skill root
    ├── SKILL.md                        # Entry point
    ├── CSP1.md                         # Protocol specification
    ├── specialists/                    # Specialist agents
    │   ├── memory.md                   # Memory operations
    │   ├── file.md                     # Filesystem operations
    │   ├── web.md                      # Web/network operations
    │   └── tool.md                     # Tool/MCP operations
    ├── memory-tiers/                   # Memory tier configs
    │   ├── config.md                   # Tier definitions
    │   └── graph-schema.md             # Graph schema
    ├── subagents/                      # Sub-agent templates
    │   ├── analyzer.md                 # Task decomposition
    │   └── planner.md                  # Execution planning
    ├── parser/                         # CSP/1 utilities
    │   ├── csp1-parser.ts              # Protocol parser
    │   └── response-formatter.ts       # Response formatting
    └── maintenance/                    # Cron tasks
        ├── daily.md                    # Daily maintenance
        └── optimizer.md                # Meta-optimizer
```

## Implementation Phases

| Phase | Description | Duration |
|-------|-------------|----------|
| **0** | Foundation - Create swarm skill directory and CSP/1 protocol | 15 min |
| **1** | Specialist Agents - Memory, File, Web, Tool specialists | 45 min |
| **2** | Memory Tiers - Ultra-short, short, medium, long-term memory | 60 min |
| **3** | Orchestrator Modifications - Role hierarchy and delegation | 45 min |
| **4** | CSP/1 Parser - Protocol parsing utilities | 30 min |
| **5** | Memory Maintenance - Cron jobs for decay and optimization | 30 min |
| **6** | Integration & Testing - End-to-end validation | 45 min |
| **7** | Bootstrapping - Self-application of capabilities | Ongoing |

**Total Estimated Time:** 4-6 hours (autonomous execution)

## Quick Start

1. **Read the implementation plan** in [`swarm-memory-implementation-plan.md`](swarm-memory-implementation-plan.md)
2. **Execute phases sequentially** - Each phase builds on the previous
3. **Use capabilities as built** - Apply completed phases to accelerate subsequent work

### Key Commands

```bash
# Phase 0: Create skill directory
mkdir -p ~/clawd/skills/swarm-memory

# Initialize graph storage
touch ~/clawd/memory/graph.jsonl
```

## CSP/1 Protocol Quick Reference

```
# Task Request Format
TASK REQ:<action> IN:<scope> OUT:<expected_type>

# Response Format
STATUS OK|PARTIAL|FAIL
SCOPE [topic1,topic2]
DATA file:line|mem:id|none
READ_RECS file:start-end|none
RELEVANCE 0.00-1.00
LINKS e1↔e2:weight
SNIPPET "brief text"
```

## Memory Tiers

| Tier | Location | Size | Persistence | Access |
|------|----------|------|-------------|--------|
| Ultra-Short | In-context | 4-8k tokens | Current conversation | Direct |
| Short-Term | memory/YYYY-MM-DD.md | ~50-100/day | 7 days active | Memory Specialist |
| Medium-Term | memory/graph.jsonl | Unlimited | Until decay | Memory Specialist |
| Long-Term | MEMORY.md | <5000 tokens | Permanent | Memory Specialist |
| Archive | sessions/*.jsonl | Unlimited | Permanent | Deep-dive only |

## Role Hierarchy

```
Human ←→ Orchestrator (Natural Language)
              ↓
        CSP/1 Protocol
              ↓
    ┌─────────┼─────────┐
    ↓         ↓         ↓
 Memory    File      Web      Tool
Specialist Specialist Specialist Specialist
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the implementation plan structure
4. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Mohammed Talas** ([@talas9](https://github.com/talas9))

---

> 🦞 Remember: You are modifying yourself. Use the capabilities from completed phases to accelerate subsequent phases.