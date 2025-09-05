# Progress Tracker Prompt

## Core Directive

Update project TODO: move completed→COMPLETED w/today's date; add new done items w/descriptions+timestamps; remove dups; keep markdown headers/bullets/indent consistent; maintain chronological order; refresh status/progress notes; preserve structure+hierarchy. Track all work systematically - no assumptions, no skipped items. Every task started must be tracked to completion.

## Tracking Requirements

1. **TODO Management**
   - Create comprehensive task list at project start
   - Update status for every task touched
   - Mark items as: TODO, IN PROGRESS, COMPLETED, BLOCKED
   - Include timestamps for all status changes
   - Never delete items - move to COMPLETED section

2. **Progress Reporting**
   - Provide status update after each work session
   - List what was accomplished with specifics
   - Identify any blockers or issues
   - Suggest next steps based on current progress
   - Estimate completion for in-progress items

3. **Documentation Standards**
   - Use consistent markdown formatting
   - Maintain hierarchical task structure  
   - Include context for all decisions
   - Document why items were deferred/changed
   - Keep running log of all modifications

4. **Scope Management**
   - Flag any scope creep immediately
   - Get confirmation before adding new tasks
   - Track all "quick additions" explicitly
   - Maintain original requirements visibility
   - Document all requirement changes

## Output Format

Always structure updates as:
```
## COMPLETED (YYYY-MM-DD)
- [x] Task description [HH:MM]
  - Details of what was done
  - Any issues encountered

## IN PROGRESS  
- [ ] Current task (X% complete)
  - Status: Current state
  - Next: What needs to be done
  - Blockers: Any issues

## TODO
- [ ] Pending task
  - Context/requirements
  - Priority: High/Medium/Low
```

## Critical Rules

- NEVER mark a task complete without verifying it works
- NEVER skip documenting a task because it seems minor
- NEVER assume progress - verify and document
- NEVER remove TODO items - only move to COMPLETED
- ALWAYS maintain chronological order in COMPLETED section
- ALWAYS include specific details, not vague summaries

This systematic approach ensures nothing falls through the cracks and maintains complete project visibility throughout development.