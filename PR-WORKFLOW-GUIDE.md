# PR Workflow Guide - Complete Review Loop

**Branch:** `design/swarm-memory-graphiti-architecture`  
**Status:** ✅ Ready for PR creation  
**Next:** Create PR → Request Copilot review → Iterate until approved

---

## Step 1: Create Pull Request

### GitHub Web Interface

1. **Go to:** https://github.com/talas9/clawdbot-swarm/pull/new/design/swarm-memory-graphiti-architecture

2. **Title:**
   ```
   design: Swarm Memory Architecture with Graphiti Integration
   ```

3. **Description:**
   Copy the entire content from `PR-DESCRIPTION.md` into the PR description field.

4. **Labels:**
   - `design`
   - `architecture`
   - `graphiti`
   - `needs-review`

5. **Reviewers:**
   - Request review from GitHub Copilot (if available in UI)
   - Or mention @github-copilot in a comment

6. **Create PR**

---

## Step 2: Request Copilot Review

### Option A: Via GitHub UI

If Copilot review is available in PR interface:
1. Click "Reviewers" dropdown
2. Select "GitHub Copilot"
3. Choose "Opus 4.5" model (if model selection available)

### Option B: Via Comment

Comment on the PR:
```
@github-copilot please review this design using the Opus 4.5 model.

Focus areas:
1. Architecture soundness
2. Graphiti integration correctness
3. Memory access boundary enforcement
4. CSP/1 protocol adherence
5. Performance target realism
6. Testing coverage adequacy
7. Documentation clarity
8. Security considerations

Please provide detailed feedback on:
- What works well
- What needs improvement
- Specific recommendations
- Any concerns or risks

Review files in this order:
1. design/DESIGN-OVERVIEW.md
2. design/specs/*.md
3. design/templates/*
4. All status reports
```

---

## Step 3: Iteration Loop (CRITICAL)

### 🔄 DO NOT STOP AT FIRST REVIEW

**You MUST:**
1. ✅ Wait for Copilot's review comments
2. ✅ Read ALL comments carefully
3. ✅ Respond to EVERY note/feedback
4. ✅ Make requested changes
5. ✅ Re-request review
6. ✅ Repeat until FULLY APPROVED

**DO NOT:**
- ❌ Merge after first review without addressing all feedback
- ❌ Ignore comments
- ❌ Skip re-review requests
- ❌ Consider "one review" as complete

### Iteration Process

#### A. Read All Comments (Thoroughly)

For each Copilot comment:
- [ ] Understand the concern
- [ ] Determine if it's a blocker or suggestion
- [ ] Plan how to address it
- [ ] Make a note if unclear (will ask for clarification)

#### B. Respond to Comments

**Format for responses:**

**If implementing feedback:**
```
✅ Implemented in [commit hash]

Changes made:
- [Specific change 1]
- [Specific change 2]

Rationale:
[Why this addresses the concern]
```

**If disagreeing (with rationale):**
```
🤔 Considered but keeping current approach

Reasoning:
- [Point 1]
- [Point 2]

Alternative considered:
[What Copilot suggested]

Why current approach preferred:
[Specific justification]

Open to discussion if this is a blocker.
```

**If need clarification:**
```
❓ Need clarification

Question:
[Specific question about the comment]

Current understanding:
[What you think Copilot means]

Proposed resolution pending clarification:
[What you'd do if understanding is correct]
```

#### C. Make Changes

For each feedback item requiring changes:

1. **Create commit per logical change:**
   ```bash
   cd /Users/talas9/clawd/Projects/clawdbot-swarm
   git checkout design/swarm-memory-graphiti-architecture
   
   # Make changes
   # ...
   
   git add .
   git commit -m "fix: [Specific fix addressing Copilot feedback]
   
   Addresses: [Link to comment]
   
   Changes:
   - [Change 1]
   - [Change 2]
   
   Rationale: [Why this fixes the issue]"
   
   git push
   ```

2. **Link commits to comments:**
   In the comment thread, reply with:
   ```
   ✅ Fixed in commit abc123
   ```

#### D. Re-Request Review

After addressing ALL comments in a batch:

1. **Comment on PR:**
   ```
   @github-copilot All feedback from [previous review date] has been addressed.
   
   Summary of changes:
   - [Change category 1]: X commits
   - [Change category 2]: Y commits
   - [Change category 3]: Z commits
   
   Please re-review focusing on:
   1. [Previously raised concern 1]
   2. [Previously raised concern 2]
   3. [Any new areas from changes]
   
   All comment threads have been resolved or responded to.
   ```

2. **Click "Re-request review" button** (if available)

#### E. Repeat Until Approved

Keep iterating:
- Review → Respond → Change → Re-review
- Review → Respond → Change → Re-review
- ...
- **Until:** All comments resolved AND Copilot explicitly approves

---

## Step 4: Approval Criteria

### PR is ready to merge when:

- [ ] ✅ Copilot has approved (green checkmark)
- [ ] ✅ ALL comment threads resolved
- [ ] ✅ No outstanding "Changes requested"
- [ ] ✅ All tests passing (if applicable)
- [ ] ✅ Documentation updated per feedback
- [ ] ✅ Final review requested and approved
- [ ] ✅ Explicit "LGTM" or "Approved" from Copilot

### DO NOT merge if:

- ❌ Any comment thread still open
- ❌ "Changes requested" status
- ❌ Copilot hasn't explicitly approved
- ❌ You haven't responded to a comment
- ❌ Feedback addressed but not re-reviewed

---

## Step 5: Common Feedback Categories

### Architecture Feedback

**Typical comments:**
- Component interaction concerns
- Data flow issues
- Separation of concerns
- Scalability questions

**How to address:**
- Update architecture diagrams
- Add clarifying documentation
- Provide examples of flows
- Add design decision rationale

### Graphiti Integration Feedback

**Typical comments:**
- API usage concerns
- Data model issues
- Query pattern inefficiencies
- Migration strategy gaps

**How to address:**
- Reference Graphiti docs
- Add code examples
- Clarify data model mapping
- Expand migration guide

### Code Template Feedback

**Typical comments:**
- Error handling missing
- Edge cases not covered
- Performance concerns
- Documentation gaps

**How to address:**
- Add error handling examples
- Document edge cases
- Add performance notes
- Expand code comments

### Documentation Feedback

**Typical comments:**
- Unclear explanations
- Missing examples
- Incomplete guides
- Inconsistent terminology

**How to address:**
- Rewrite unclear sections
- Add concrete examples
- Expand guides
- Create glossary if needed

---

## Step 6: Example Iteration

### Round 1: Initial Review

**Copilot comment:**
```
The Memory Specialist should handle Graphiti connection pooling.
Current template doesn't show this.
```

**Your response:**
```
✅ Will add connection pooling example

I'll update graphiti-client.py to include:
1. Connection pool initialization
2. Pool size configuration
3. Connection reuse pattern
4. Cleanup on shutdown

Implementing now.
```

**Commit:**
```bash
git add design/templates/graphiti-client.py
git commit -m "feat: Add connection pooling to Graphiti client template

Addresses Copilot feedback on connection management.

Changes:
- Added connection pool initialization
- Configurable pool size (default 50)
- Connection reuse pattern
- Proper cleanup on shutdown

Example usage in code comments."
git push
```

**Follow-up comment:**
```
✅ Implemented in commit abc123

Added connection pooling with:
- Pool size: 50 (configurable)
- Automatic reuse
- Graceful shutdown

@github-copilot please verify this addresses your concern.
```

### Round 2: Re-Review

**Copilot comment:**
```
Connection pooling looks good. ✅

Small suggestion: Add retry logic for connection failures.
```

**Your response:**
```
✅ Adding retry logic

Will add:
- Exponential backoff
- Max 3 retries
- Configurable retry delay
- Logging of retry attempts

Implementing now.
```

### Round 3: Final Approval

**Copilot comment:**
```
All concerns addressed. LGTM! ✅

Architecture is sound, Graphiti integration is well-designed.
Ready to merge.
```

**Your action:**
Merge the PR!

---

## Step 7: Merge Checklist

Before merging:

- [ ] Copilot explicitly approved ("LGTM", "Approved", green checkmark)
- [ ] All comment threads marked as "Resolved"
- [ ] No "Changes requested" status
- [ ] All commits pushed
- [ ] PR description up to date
- [ ] Branch up to date with main
- [ ] Final review passed

**Then:**
```bash
# Merge via GitHub UI (preferred)
# OR via command line:
git checkout main
git merge design/swarm-memory-graphiti-architecture
git push
git tag v1.0.0-design
git push --tags
```

---

## Step 8: Post-Merge

After merging:

1. **Close related issues** (if any)
2. **Update project board** (move to "Approved")
3. **Notify team** of design approval
4. **Begin implementation phase** (follow guides)
5. **Archive design branch** (optional)

---

## Troubleshooting

### Copilot not responding

**Try:**
1. Wait 5-10 minutes (API delay)
2. Tag again: `@github-copilot ping`
3. Check Copilot status page
4. Try in a new comment thread
5. Contact GitHub support if persistent

### Unclear feedback

**Response:**
```
@github-copilot I need clarification on your comment about [topic].

Current implementation:
[Describe current approach]

My understanding of your concern:
[What you think the issue is]

Possible solutions:
1. [Option A]
2. [Option B]

Which approach do you recommend?
```

### Disagreement with feedback

**Response:**
```
@github-copilot I've considered your suggestion about [topic].

Your recommendation:
[Summarize Copilot's suggestion]

Current approach rationale:
[Explain why current approach was chosen]

Trade-offs:
- Current: [Pros/Cons]
- Suggested: [Pros/Cons]

I'm open to changing if this is a blocker. Is there a specific
concern I'm not addressing with the current approach?
```

### Too much feedback

**Strategy:**
1. Group related feedback into categories
2. Address one category per commit/iteration
3. Prioritize blockers over nice-to-haves
4. Create issues for non-blocking improvements
5. Focus on critical path first

**Response:**
```
@github-copilot Thank you for the comprehensive review!

I've categorized the feedback:

**Blockers (addressing first):**
- [Item 1]
- [Item 2]

**Important (addressing second):**
- [Item 3]
- [Item 4]

**Nice-to-haves (will create issues):**
- [Item 5]
- [Item 6]

I'll address blockers in this PR and create follow-up issues
for the nice-to-haves. Sound good?
```

---

## Metrics to Track

### Review Iterations
- Round 1: Initial review
- Round 2: First iteration
- Round 3: Second iteration
- ...
- Round N: Final approval

**Goal:** Minimize iterations (but don't rush)

### Response Time
- Your response to Copilot: <24 hours
- Copilot re-review: Variable (API dependent)

**Goal:** Keep momentum going

### Comment Resolution Rate
- Per iteration: >80% comments resolved
- Final: 100% comments resolved

**Goal:** Complete closure

---

## Success Criteria

### Review Loop Complete When:

✅ All of the following are true:
1. Copilot explicitly approved the PR
2. All comment threads are resolved
3. All feedback has been addressed or justified
4. No "Changes requested" status
5. You've confirmed readiness to merge
6. Design documentation is finalized

**Then and ONLY then:** Merge!

---

## Important Reminders

🔄 **Iterate until FULLY approved**  
💬 **Respond to EVERY comment**  
✅ **Address ALL feedback (or justify why not)**  
📝 **Document all changes**  
🔍 **Re-request review after changes**  
✔️ **Don't merge until explicit approval**

---

## Timeline Estimate

### Optimistic (2-3 days)
- Day 1: Create PR, initial review
- Day 2: Address feedback, re-review
- Day 3: Final approval, merge

### Realistic (4-5 days)
- Days 1-2: Initial review and first iteration
- Days 3-4: Second iteration and re-review
- Day 5: Final tweaks and approval

### Pessimistic (1-2 weeks)
- Multiple iteration rounds
- Significant changes required
- Complex feedback discussions
- Re-architecting some components

**Most likely:** Realistic scenario (4-5 days)

---

## Final Checklist

Before starting:
- [ ] Branch pushed ✅
- [ ] PR description ready ✅
- [ ] This guide read and understood
- [ ] Ready to iterate (time allocated)
- [ ] Notifications enabled (GitHub)

During review:
- [ ] Respond to all comments
- [ ] Make requested changes
- [ ] Re-request review after changes
- [ ] Keep iterating

Before merge:
- [ ] Copilot approval received
- [ ] All threads resolved
- [ ] Changes pushed
- [ ] Ready for implementation phase

---

**YOU ARE HERE:** Ready to create PR

**NEXT STEP:** Go to GitHub, create PR, request Copilot review

**REMEMBER:** Full review loop - iterate until approved!

Good luck! 🚀
