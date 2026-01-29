# GitHub Copilot Instructions

## Project Overview

This repository implements **Clawdbot Swarm**, a hierarchical agent swarm architecture with memory management capabilities. The project transforms Clawdbot into a multi-agent system with strict role separation, efficient inter-agent communication, and tiered memory.

## Architecture & Key Concepts

### Agent Hierarchy
- **Orchestrator**: Top-level agent coordinating sub-agents and specialists
- **Sub-agents**: Domain-specific agents handling particular tasks
- **Specialists**: Focused agents for specific operations

### CSP/1 Protocol (Compact Symbol Protocol v1)
- Token-efficient, prose-free inter-agent communication protocol
- Strict format requirements with file:line references only
- Hard limit of 2500 tokens per response
- Data-only responses without prose explanations
- See `swarm-memory-implementation-plan.md` for full specification

### Memory Tiers
The system implements a four-tier memory architecture:
1. **Ultra-short**: Immediate context
2. **Short**: Recent operations
3. **Medium**: Session-level knowledge
4. **Long**: Persistent knowledge base

## Tech Stack

- Primary focus: Agent architecture and memory management
- Documentation: Markdown
- Protocol: CSP/1 (Compact Symbol Protocol)
- Version Control: Git/GitHub

## File Structure

```
/
├── .github/                    # GitHub configuration files
│   └── copilot-instructions.md # This file
├── README.md                   # Project readme
├── LICENSE                     # License file
└── swarm-memory-implementation-plan.md  # Detailed implementation plan
```

## Coding Conventions

### Documentation Standards
- Use clear, concise language
- Include examples for complex concepts
- Keep README files up-to-date
- Document all architectural decisions

### CSP/1 Protocol Rules (when implementing agents)
- **L1**: Use file:line references only
- **L2**: Never return full file content
- **L3**: Hard limit of 2500 tokens per response
- **L4**: Use `files_with_matches` first for searches

### Response Format
When implementing agent responses, follow this structure:
```
STATUS OK|PARTIAL|FAIL
SCOPE [<relevant_domains>]
DATA <file:line-symbol> | mem:<uuid> | none
READ_RECS <file:start-end> | none
RELEVANCE <0.00-1.00> (memory only)
LINKS <entity1>↔<entity2>:<weight> (memory only)
```

### Anti-Patterns to Avoid
- ❌ Don't use `grep -C 15` (too broad)
- ❌ Don't read 500+ lines at once (use chunking)
- ❌ Don't include prose explanations in CSP/1 responses
- ❌ Don't use hedging language ("I think", "maybe")

## Development Guidelines

### When Adding Features
1. Follow the implementation plan in `swarm-memory-implementation-plan.md`
2. Maintain strict role separation between agent types
3. Use CSP/1 protocol for inter-agent communication
4. Implement self-improving capabilities where possible
5. Document new memory tiers or agent types

### When Modifying Code
1. Preserve existing architecture patterns
2. Maintain CSP/1 protocol compliance
3. Update relevant documentation
4. Consider impact on memory tiers
5. Test agent communication flows

### Documentation Requirements
- Keep `swarm-memory-implementation-plan.md` synchronized with actual implementation
- Document all protocol changes
- Include examples for new agent types
- Explain memory tier additions or modifications

## Project Philosophy

- **Token Efficiency First**: Minimize token usage in all agent communications
- **Strict Role Separation**: Each agent has a clear, focused responsibility
- **Self-Improvement**: The system should be capable of modifying and improving itself
- **Clarity Over Cleverness**: Code and protocols should be clear and maintainable
- **Data-Driven**: Use structured data formats over prose where possible

## Prohibited Actions

- ❌ Never break CSP/1 protocol compliance in agent communications
- ❌ Never commit secrets, API keys, or credentials
- ❌ Don't modify the core protocol specification without updating documentation
- ❌ Don't blur role boundaries between agent types
- ❌ Don't introduce verbose or token-inefficient communication patterns

## Build, Test & Validation

Currently, this is a planning and architecture repository. As implementation progresses:
- Test agent communication using CSP/1 protocol compliance
- Validate memory tier operations
- Verify orchestrator → sub-agent → specialist hierarchies
- Ensure token limits are respected (2500 token hard limit)

## Additional Context

- **Owner**: Mohammed Talas (@talas9)
- **Estimated Implementation Time**: 4-6 hours (autonomous execution)
- **Phase-Based Approach**: The implementation follows a structured phase approach where each phase builds upon previous capabilities
- **Self-Modification**: The system is designed to use newly built capabilities to assist with subsequent development phases

## References

- Full implementation plan: See `swarm-memory-implementation-plan.md`
- CSP/1 Protocol: Detailed in implementation plan Phase 0.2
- Memory Architecture: Described in implementation plan Phases 1-3
