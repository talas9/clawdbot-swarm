# ClawdBot Swarm

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.1-blue.svg)](https://github.com/talas9/clawdbot-swarm)
[![Status](https://img.shields.io/badge/status-implementation--ready-green.svg)](https://github.com/talas9/clawdbot-swarm/blob/main/swarm-memory-implementation-plan.md)

A hierarchical agent swarm memory architecture for ClawdBot/Moltbot self-modification.

## Project Metadata

| Property | Value |
|----------|-------|
| **Name** | ClawdBot Swarm |
| **Version** | 1.1 |
| **Repository** | [github.com/talas9/clawdbot-swarm](https://github.com/talas9/clawdbot-swarm) |
| **Owner** | Mohammed Talas ([@talas9](https://github.com/talas9)) |
| **License** | [MIT License](LICENSE) |
| **Target** | ClawdBot/Moltbot self-modification |
| **Estimated Implementation** | 5-7 hours (autonomous execution) |
| **Language** | TypeScript, Markdown |
| **Category** | AI Agent Architecture, Memory Systems |

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
├── swarm-memory-implementation-plan.md # Detailed implementation guide
└── swarm-cli/                          # CLI utilities for implementation
    ├── README.md                       # CLI documentation
    ├── package.json
    └── src/
        ├── index.ts                    # CLI entry point
        └── commands/                   # Command implementations
            ├── task-id.ts              # Task ID generation (SHA-256)
            ├── uuid.ts                 # UUID generation
            ├── scaffold.ts             # File scaffolding
            ├── memory.ts               # Memory initialization
            └── validate.ts             # Implementation validation
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
    ├── router.md                       # Task classification rules
    ├── CSP1.md                         # Protocol specification
    ├── debate-protocol.md              # Debate system specification
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
    │   ├── planner.md                  # Execution planning
    │   ├── advocate.md                 # Debate advocate (defends)
    │   └── critic.md                   # Debate critic (challenges)
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
| **0.1a** | Task Router (Soft) - Pattern-based task classification | 15 min |
| **0.1b** | Task Router (Hard) - Code-based enforcement (optional) | 30 min |
| **0.2-0.4** | Foundation - Swarm skill directory and CSP/1 protocol | 15 min |
| **0.5** | **Implementation Utilities - CLI tool for automation** | **30 min** |
| **1** | Specialist Agents - Memory, File, Web, Tool specialists | 45 min |
| **2** | Memory Tiers - Ultra-short, short, medium, long-term memory | 60 min |
| **2.5** | **Dialectic Layer - Advocate/Critic debate system** | **50 min** |
| **3** | Orchestrator Modifications - Role hierarchy and delegation | 45 min |
| **4** | CSP/1 Parser - Protocol parsing utilities | 30 min |
| **5** | Memory Maintenance - Cron jobs for decay and optimization | 30 min |
| **6** | Integration & Testing - End-to-end validation | 45 min |
| **7** | Bootstrapping - Self-application of capabilities | Ongoing |

**Total Estimated Time:** 5.83-7.83 hours (autonomous execution)

**New in this version:** 
- Phase 0.5 adds CLI utilities that AI creates and uses for mechanical tasks (UUID generation, task ID hashing, scaffolding), reducing token costs ~10-15%
- Phase 2.5 adds a two-agent debate system that prevents confirmation bias before high-stakes operations and breaks failure loops after repeated errors.

## Quick Start

1. **Read the implementation plan** in [`swarm-memory-implementation-plan.md`](swarm-memory-implementation-plan.md)
2. **Set up the CLI tool** (see below) for automating mechanical tasks
3. **Execute phases sequentially** - Each phase builds on the previous
4. **Use capabilities as built** - Apply completed phases to accelerate subsequent work

### Swarm CLI Tool

A CLI utility to automate mechanical tasks and reduce AI token usage during implementation:

```bash
# Install
cd swarm-cli && npm install && npm run build

# Generate task IDs (using SHA-256 strategy from debate-protocol.md)
npm run swarm task-id "Fix authentication test"

# Generate UUIDs
npm run swarm uuid --count 5

# Scaffold files from templates
npm run swarm scaffold agent "Validator"
npm run swarm scaffold skill "Git History"

# Initialize memory structure
npm run swarm init-memory

# Validate implementation completeness
npm run swarm validate --phase 2.5
```

See [`swarm-cli/README.md`](swarm-cli/README.md) for full documentation.

**Why use the CLI?** Automates static generation (UUIDs, hashes, boilerplate), saving tokens and time. AI focuses on complex decisions, not mechanical tasks.

### Key Commands

These are initialization commands for getting started. For full implementation details, follow the phases in the implementation plan.

```bash
# Phase 0: Create skill directory structure
mkdir -p ~/clawd/skills/swarm-memory
mkdir -p ~/clawd/memory/metrics

# Initialize graph storage
touch ~/clawd/memory/graph.jsonl

# Or use CLI tool:
cd swarm-cli && npm run swarm init-memory --path ~/clawd

# Continue with remaining phases in swarm-memory-implementation-plan.md
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
| Archive | ~/.clawdbot/agents/*/sessions/*.jsonl | Unlimited | Permanent | Deep-dive only |

## Dialectic Layer (Debate System)

Two-agent debate prevents confirmation bias and breaks failure loops:

| Agent | Role | Bias |
|-------|------|------|
| **Advocate** | Defend plans, propose fixes | Optimistic, action-oriented |
| **Critic** | Challenge with risks, find root causes | Skeptical, cautious |

### When Debates Trigger

| Trigger | Type | Action |
|---------|------|--------|
| Destructive ops (delete, drop) | Planning | Debate before execution |
| Deployment (deploy, release) | Planning | Debate before execution |
| 2 consecutive failures | Failure | Debate before retry |
| 3+ consecutive failures | — | Auto-escalate to human |

### Debate Flow

```
Advocate: "Here's why this will work..."
    ↓
Critic: "Here's what could go wrong..."
    ↓
Orchestrator: PROCEED | MODIFY | ESCALATE
```

**Key Features:**
- Advocate must specify `DIFF_FROM_PREVIOUS` (no blind retries)
- Critic must always find at least 1 risk ("agreement is failure")
- `SHOULD_ESCALATE` flag for critic-triggered escalation
- Auto-escalate after 3 failures (debate already tried)

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

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2026 Mohammed Talas

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

See the full [LICENSE](LICENSE) file for complete details.

### What this means:
- ✅ Commercial use permitted
- ✅ Modification permitted
- ✅ Distribution permitted
- ✅ Private use permitted
- ⚠️ License and copyright notice required
- ❌ No liability or warranty

## Author & Maintainer

**Mohammed Talas** ([@talas9](https://github.com/talas9))

- 📧 Contact: Via GitHub
- 🔗 Repository: [github.com/talas9/clawdbot-swarm](https://github.com/talas9/clawdbot-swarm)

## Acknowledgments

This project implements concepts from:
- Hierarchical agent architectures
- Memory-augmented language models
- Token-efficient inter-agent communication protocols

---

> 🦞 Remember: You are modifying yourself. Use the capabilities from completed phases to accelerate subsequent phases.