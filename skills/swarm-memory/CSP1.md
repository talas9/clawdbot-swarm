# CSP/1 — Compact Symbol Protocol v1

## Mode Declaration
CSP/1 MODE;!prose;DATA ONLY

## Laws
- L1: file:line refs only
- L2: !full content (never return full files)
- L3: !>2500tok (hard limit per response)
- L4: files_with_matches first

## Path Shorthands
DEF SRC=src/ LIB=lib/ TESTS=tests/ SKILLS=skills/ MEM=memory/ SKIP=node_modules/,build/,.git/

## Result Format (MUST use for all specialist responses)
STATUS OK|PARTIAL|FAIL
SCOPE [<relevant_domains>]
DATA <file:line-symbol> | mem:<uuid> | none
READ_RECS <file:start-end> | none
RELEVANCE <0.00-1.00> (memory only)
LINKS <entity1>↔<entity2>:<weight> (memory only)

## Task Request Format
TASK REQ:<action> IN:<scope> OUT:<expected_type>

## Debate Extensions

### Debate Request Formats
DEBATE PLANNING TASK:<description> STAKES:<low|medium|high|critical>
DEBATE FAILURE TASK_ID:<id> ATTEMPT:<n> ERROR:<description>

### Advocate Response Format
POSITION ADVOCATE
PLAN <step_by_step_approach>
CONFIDENCE <0.0-1.0>
ASSUMPTIONS [<key_assumptions>]
DIFF_FROM_PREVIOUS <what_changed> (failure mode only)

### Critic Response Format
POSITION CRITIC
RISKS [<potential_risks>]
BLIND_SPOTS [<overlooked_factors>]
COUNTER <alternative_approach> | ALTERNATIVES [<options>]
ROOT_CAUSE <analysis> (failure mode only)
SHOULD_ESCALATE <true|false>

### Synthesis Response Format
RESOLUTION <PROCEED|MODIFY|RETRY|PIVOT|ESCALATE>
RATIONALE <brief_explanation>
ACTIONS [<concrete_steps>]
COMMIT_MSG <if_proceeding>

## Anti-Patterns (immediate rejection)
!PAT: grep -C 15 (too broad)
!PAT: Read 500+ lines (use chunking)
!PAT: prose explanation (data only)
!PAT: "I think" / "maybe" / hedging

## Examples

### File Search Request
TASK REQ:find debounce IN:SRC OUT:FILE_REFS

### File Search Response
STATUS OK
SCOPE [utils,helpers]
DATA src/utils/helpers.ts:142-debounce
READ_RECS src/utils/helpers.ts:130-160

### Memory Query Request  
TASK REQ:recall auth token handling IN:MEM OUT:MEM_REFS

### Memory Query Response
STATUS OK
SCOPE [auth,token,session]
DATA mem:uuid-a1b2c3
RELEVANCE 0.92
LINKS auth.ts↔token.ts:0.85,session.ts↔auth.ts:0.72

### Planning Debate Request
DEBATE PLANNING TASK:delete all .bak files in project STAKES:high

### Advocate Response
POSITION ADVOCATE
PLAN find all *.bak → preview list → confirm count → execute rm
CONFIDENCE 0.85
ASSUMPTIONS [backups_not_needed,no_locked_files,user_has_write_perms]

### Critic Response
POSITION CRITIC
RISKS [accidental_deletion,no_undo,might_delete_active_files]
BLIND_SPOTS [backup files might be in use,no verification of file age]
COUNTER use trash instead of rm, add --dry-run first, check file timestamps
SHOULD_ESCALATE false

### Synthesis Response
RESOLUTION MODIFY
RATIONALE combine approaches: trash + dry-run + age check
ACTIONS [find *.bak,filter by age >7d,trash with preview,log deletions]
COMMIT_MSG Clean up old backup files (>7 days, 23 files)

### Failure Response
STATUS FAIL
SCOPE []
DATA none
READ_RECS none
