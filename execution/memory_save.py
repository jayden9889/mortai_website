#!/usr/bin/env python3
"""
Memory Save Script
Extracts key information from Claude Code transcripts and saves summaries.

Usage:
    python memory_save.py <transcript_path> [--output-dir <dir>]

Or via stdin (for hooks):
    echo '{"transcript_path": "/path/to/file.jsonl"}' | python memory_save.py
"""

import json
import sys
import os
import re
from datetime import datetime
from pathlib import Path


def parse_transcript(transcript_path: str) -> dict:
    """Parse a JSONL transcript file and extract key information."""

    messages = []
    tool_calls = []
    files_modified = set()
    files_read = set()

    try:
        with open(transcript_path, 'r') as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    entry = json.loads(line)

                    # Extract messages
                    if 'role' in entry:
                        role = entry.get('role', '')
                        content = entry.get('content', '')
                        if isinstance(content, list):
                            # Handle structured content
                            text_parts = []
                            for part in content:
                                if isinstance(part, dict):
                                    if part.get('type') == 'text':
                                        text_parts.append(part.get('text', ''))
                                    elif part.get('type') == 'tool_use':
                                        tool_calls.append({
                                            'name': part.get('name', ''),
                                            'input': part.get('input', {})
                                        })
                                        # Track file operations
                                        tool_input = part.get('input', {})
                                        if part.get('name') in ['Write', 'Edit']:
                                            fp = tool_input.get('file_path', '')
                                            if fp:
                                                files_modified.add(fp)
                                        elif part.get('name') == 'Read':
                                            fp = tool_input.get('file_path', '')
                                            if fp:
                                                files_read.add(fp)
                            content = '\n'.join(text_parts)

                        if content and role in ['user', 'assistant']:
                            messages.append({'role': role, 'content': content[:2000]})  # Truncate long messages

                except json.JSONDecodeError:
                    continue

    except FileNotFoundError:
        return {'error': f'Transcript not found: {transcript_path}'}
    except Exception as e:
        return {'error': str(e)}

    return {
        'messages': messages,
        'tool_calls': tool_calls,
        'files_modified': list(files_modified),
        'files_read': list(files_read)
    }


def extract_key_topics(messages: list) -> list:
    """Extract key topics discussed from user messages."""
    topics = []
    keywords = ['create', 'build', 'fix', 'add', 'implement', 'set up', 'configure',
                'design', 'refactor', 'update', 'change', 'remove', 'debug']

    for msg in messages:
        if msg['role'] == 'user':
            content = msg['content'].lower()
            for keyword in keywords:
                if keyword in content:
                    # Extract the sentence containing the keyword
                    sentences = msg['content'].split('.')
                    for sentence in sentences:
                        if keyword in sentence.lower() and len(sentence) > 10:
                            topics.append(sentence.strip()[:200])
                            break

    return list(set(topics))[:10]  # Dedupe and limit


def generate_summary(transcript_data: dict, session_id: str = None) -> str:
    """Generate a markdown summary from parsed transcript data."""

    if 'error' in transcript_data:
        return f"# Session Summary\n\nError: {transcript_data['error']}"

    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    messages = transcript_data.get('messages', [])
    files_modified = transcript_data.get('files_modified', [])
    files_read = transcript_data.get('files_read', [])
    tool_calls = transcript_data.get('tool_calls', [])

    # Count message types
    user_msgs = [m for m in messages if m['role'] == 'user']
    assistant_msgs = [m for m in messages if m['role'] == 'assistant']

    # Extract topics
    topics = extract_key_topics(messages)

    # Get unique tools used
    tools_used = list(set(tc['name'] for tc in tool_calls))

    # Build summary
    summary = f"""# Chat Summary
**Date**: {timestamp}
**Session ID**: {session_id or 'unknown'}

## Overview
- **User messages**: {len(user_msgs)}
- **Assistant responses**: {len(assistant_msgs)}
- **Tools used**: {', '.join(tools_used) if tools_used else 'None'}

## Key Topics Discussed
"""

    if topics:
        for topic in topics:
            summary += f"- {topic}\n"
    else:
        summary += "- General conversation\n"

    summary += "\n## Files Modified\n"
    if files_modified:
        for f in sorted(files_modified):
            summary += f"- `{f}`\n"
    else:
        summary += "- None\n"

    summary += "\n## Files Read\n"
    if files_read:
        for f in sorted(files_read)[:20]:  # Limit to 20
            summary += f"- `{f}`\n"
        if len(files_read) > 20:
            summary += f"- ... and {len(files_read) - 20} more\n"
    else:
        summary += "- None\n"

    # Add last few user messages as context
    summary += "\n## Recent User Requests\n"
    recent_user_msgs = [m['content'] for m in user_msgs[-5:]]
    for msg in recent_user_msgs:
        truncated = msg[:300] + '...' if len(msg) > 300 else msg
        # Clean up the message
        truncated = truncated.replace('\n', ' ').strip()
        summary += f"> {truncated}\n\n"

    summary += "\n## Next Steps / Open Items\n"
    summary += "_Update this section with any pending tasks or decisions._\n"

    return summary


def save_summary(summary: str, output_dir: str, session_id: str = None) -> str:
    """Save summary to file and update latest.md."""

    output_path = Path(output_dir)
    history_dir = output_path / 'history'
    history_dir.mkdir(parents=True, exist_ok=True)

    # Generate filename with timestamp
    timestamp = datetime.now().strftime('%Y-%m-%d_%H%M%S')
    session_suffix = f"_{session_id[:8]}" if session_id else ""
    filename = f"{timestamp}{session_suffix}.md"

    # Save to history
    history_file = history_dir / filename
    history_file.write_text(summary)

    # Update latest.md
    latest_file = output_path / 'latest.md'
    latest_file.write_text(summary)

    return str(history_file)


def main():
    """Main entry point."""

    # Check for stdin input (hook mode)
    if not sys.stdin.isatty():
        try:
            stdin_data = sys.stdin.read()
            hook_input = json.loads(stdin_data)
            transcript_path = hook_input.get('transcript_path')
            session_id = hook_input.get('session_id')
        except (json.JSONDecodeError, KeyError):
            print("Error: Invalid hook input", file=sys.stderr)
            sys.exit(1)
    else:
        # Command line mode
        if len(sys.argv) < 2:
            print(__doc__)
            sys.exit(1)
        transcript_path = sys.argv[1]
        session_id = None

    # Determine output directory
    output_dir = os.environ.get('CLAUDE_PROJECT_DIR', os.getcwd())
    output_dir = os.path.join(output_dir, '.claude', 'memory')

    # Check for --output-dir flag
    if '--output-dir' in sys.argv:
        idx = sys.argv.index('--output-dir')
        if idx + 1 < len(sys.argv):
            output_dir = sys.argv[idx + 1]

    # Parse and generate summary
    print(f"Parsing transcript: {transcript_path}", file=sys.stderr)
    transcript_data = parse_transcript(transcript_path)

    if 'error' in transcript_data:
        print(f"Error: {transcript_data['error']}", file=sys.stderr)
        sys.exit(1)

    summary = generate_summary(transcript_data, session_id)
    saved_path = save_summary(summary, output_dir, session_id)

    print(f"Summary saved to: {saved_path}", file=sys.stderr)
    print(f"Latest updated: {os.path.join(output_dir, 'latest.md')}", file=sys.stderr)

    # Output for hook system
    print(json.dumps({
        "status": "success",
        "summary_path": saved_path,
        "latest_path": os.path.join(output_dir, 'latest.md')
    }))


if __name__ == '__main__':
    main()
