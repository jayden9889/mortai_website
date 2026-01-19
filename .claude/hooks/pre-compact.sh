#!/bin/bash
# Pre-Compact Hook
# Runs before context compaction to save a chat summary

# Read hook input from stdin
INPUT=$(cat)

# Extract values from JSON input
TRANSCRIPT_PATH=$(echo "$INPUT" | python3 -c "import sys, json; print(json.load(sys.stdin).get('transcript_path', ''))" 2>/dev/null)
SESSION_ID=$(echo "$INPUT" | python3 -c "import sys, json; print(json.load(sys.stdin).get('session_id', ''))" 2>/dev/null)

# Skip if no transcript
if [ -z "$TRANSCRIPT_PATH" ] || [ ! -f "$TRANSCRIPT_PATH" ]; then
    echo '{"status": "skipped", "reason": "no transcript found"}'
    exit 0
fi

# Get project directory
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"

# Run the memory save script
echo '{"transcript_path": "'"$TRANSCRIPT_PATH"'", "session_id": "'"$SESSION_ID"'"}' | \
    python3 "$PROJECT_DIR/execution/memory_save.py"

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo "Memory summary saved before compaction" >&2
else
    echo "Warning: Failed to save memory summary (exit code: $EXIT_CODE)" >&2
fi

# Always exit 0 to not block compaction
exit 0
