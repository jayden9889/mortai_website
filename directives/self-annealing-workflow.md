# Self-Annealing Workflow Directive

**PRIORITY: CRITICAL - ALWAYS FOLLOW**

## The Rule
Every time you make a change, follow this workflow. No exceptions.

## The 5-Step Process

### 1. Understand the Actual Problem
- Don't guess what's wrong
- Analyze the visual output, error message, or user feedback
- Ask: "What is the user actually seeing vs what should they see?"

### 2. Identify Root Cause
- Don't tweak values blindly
- Understand WHY something isn't working
- Example: Calendar overlapping text isn't fixed by moving the calendar - it's fixed by understanding that both elements are vertically centered

### 3. Fix It Properly
- Address the real issue, not symptoms
- Make one logical change that solves the root cause
- Don't make multiple incremental guesses

### 4. Test/Verify
- Confirm the fix actually works
- If you can't visually verify, explain to user what should have changed and why

### 5. Update Directives
- Document what you learned
- Add edge cases discovered
- Update any relevant SOPs

## Anti-Patterns to Avoid

**DON'T:**
- Make blind incremental changes (moving values by small amounts hoping it works)
- Push changes without understanding if they'll fix the issue
- Ignore the underlying structure/layout when fixing visual issues
- Skip the "understand" step and jump straight to "fix"

**DO:**
- Read and analyze before changing
- Understand the component hierarchy/layout
- Think about WHY something is positioned where it is
- Make changes that address root causes

## Example: Calendar Overlap Issue

**Wrong approach (what I did):**
1. Calendar overlaps heading
2. Move calendar to height * 0.58
3. Still overlaps
4. Move to height * 0.65
5. Still overlaps
6. Keep tweaking...

**Right approach (self-annealing):**
1. Calendar overlaps heading
2. ASK: Why does it overlap? → Both text and calendar are vertically centered
3. ROOT CAUSE: The layout structure, not the position value
4. FIX: Change Stage 3 text to `justify-start` (top) instead of `justify-center`
5. DOCUMENT: Added this directive

## When to Apply

- Every bug fix
- Every visual adjustment
- Every feature implementation
- Every time something doesn't work as expected

This is not optional. This is how we build reliably.
