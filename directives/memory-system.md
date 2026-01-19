# Memory System Directive

## Goal
Maintain continuity between Claude Code sessions by automatically saving chat summaries before context compaction and loading the most recent summary on new sessions.

## How It Works

### Automatic (via hooks)
1. **PreCompact Hook**: When context reaches ~80% and auto-compacts, the system automatically extracts and saves a summary
2. **SessionStart Hook**: New sessions automatically load only the latest summary from `.claude/memory/latest.md`

### Manual (user commands)
- **Save summary now**: Ask Claude to "save a memory summary of this chat"
- **Read older chats**: Ask Claude to "read the last 3 chat summaries" or "read memory history"

## File Structure
```
.claude/memory/
├── latest.md           # Most recent summary (auto-loaded on session start)
└── history/            # All past summaries
    ├── 2024-01-19_143052_session.md
    └── ...
```

## What Gets Saved
Each summary includes:
- **Session date/time**
- **Key decisions made**
- **Files created/modified**
- **Technical choices and rationale**
- **Open questions/next steps**
- **Important context** (API keys set up, services configured, etc.)

## Scripts Used
- `execution/memory_save.py` - Parses transcript and saves summary
- `.claude/hooks/pre-compact.sh` - Hook that triggers save
- `.claude/hooks/session-start.sh` - Hook that loads latest summary

## Edge Cases
- If no transcript exists, skip silently
- If summary fails, log error but don't block compaction
- History files are never auto-deleted (manual cleanup if needed)

## User Override
To read more than just the latest summary:
> "Read the memory history from the last 4 sessions"

Claude will then read files from `.claude/memory/history/`
