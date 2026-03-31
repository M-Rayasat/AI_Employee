#!/bin/bash
# Ralph Wiggum Stop Hook - Enables autonomous multi-step task execution
# This hook checks if tasks are complete and re-injects prompts for continuation

VAULT_DIR="vault"
IN_PROGRESS_DIR="$VAULT_DIR/In_Progress"
DONE_DIR="$VAULT_DIR/Done"
MAX_ITERATIONS=10
ITERATION_FILE=".claude/ralph_iteration_count.txt"

# Check if Ralph Wiggum mode is enabled
RALPH_MODE="${RALPH_WIGGUM_MODE:-false}"
if [ "$RALPH_MODE" != "true" ]; then
    exit 0
fi

# Initialize iteration counter
if [ ! -f "$ITERATION_FILE" ]; then
    echo "0" > "$ITERATION_FILE"
fi

CURRENT_ITERATION=$(cat "$ITERATION_FILE")

# Check if max iterations reached
if [ "$CURRENT_ITERATION" -ge "$MAX_ITERATIONS" ]; then
    echo "⚠️ Max iterations ($MAX_ITERATIONS) reached. Stopping autonomous execution."
    echo "0" > "$ITERATION_FILE"
    exit 0
fi

# Check for tasks in In_Progress folder
TASK_COUNT=$(find "$IN_PROGRESS_DIR" -type f -name "*.md" 2>/dev/null | wc -l)

if [ "$TASK_COUNT" -gt 0 ]; then
    # Tasks still in progress - continue working
    TASK_FILE=$(find "$IN_PROGRESS_DIR" -type f -name "*.md" | head -n 1)
    TASK_NAME=$(basename "$TASK_FILE")

    # Increment iteration counter
    NEW_ITERATION=$((CURRENT_ITERATION + 1))
    echo "$NEW_ITERATION" > "$ITERATION_FILE"

    echo "🔄 Ralph Wiggum Loop: Iteration $NEW_ITERATION/$MAX_ITERATIONS"
    echo "📋 Continuing task: $TASK_NAME"

    # Re-inject prompt to continue working
    echo "Continue working on the task in $TASK_FILE. Check if it's complete, and if so, move it to Done/. If not complete, continue working on it."

    exit 1  # Non-zero exit prevents session from closing
else
    # No tasks in progress - reset counter and allow exit
    echo "✅ All tasks complete. Ralph Wiggum loop finished."
    echo "0" > "$ITERATION_FILE"
    exit 0
fi
