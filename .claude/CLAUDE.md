# MortAi Website Workspace

## Memory System

This project has an automatic memory system:

1. **Auto-save**: Before context compaction, chat summaries are saved to `.claude/memory/history/`
2. **Auto-load**: New sessions automatically load `.claude/memory/latest.md`
3. **On-demand**: Read older summaries only when explicitly requested

### Commands

**To read older chat history:**
> "Read the last 3 chat summaries from memory history"

**To manually save a summary:**
> "Save a memory summary of this chat now"

### Memory Location
- Latest: `.claude/memory/latest.md`
- History: `.claude/memory/history/`

## 3-Layer Architecture

This workspace uses the 3-layer architecture from `Claude.md`:

1. **Directives** (`directives/`) - SOPs in Markdown
2. **Orchestration** - Claude (decision making)
3. **Execution** (`execution/`) - Python scripts

### Key Principles
- Check `execution/` for existing tools before creating new ones
- Self-anneal: fix errors, update scripts, update directives
- Deliverables go to cloud (Google Sheets, etc.), intermediates go to `.tmp/`

## Project Status

_Updated automatically by memory system_
