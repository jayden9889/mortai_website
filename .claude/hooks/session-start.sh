#!/bin/bash
# Session Start Hook
# Loads the latest chat summary as context for new sessions

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
LATEST_FILE="$PROJECT_DIR/.claude/memory/latest.md"

# Check if latest summary exists
if [ -f "$LATEST_FILE" ]; then
    CONTENT=$(cat "$LATEST_FILE")

    # Output as user context that Claude will see
    cat <<EOF
{
  "result": "Memory loaded from previous session",
  "contextAddition": "## Previous Session Context\n\nThe following is a summary of our last conversation:\n\n$CONTENT"
}
EOF
else
    echo '{"result": "No previous session memory found", "contextAddition": ""}'
fi

exit 0
