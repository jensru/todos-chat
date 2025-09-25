#!/bin/bash

# Todo-Migration automatisiert tracken
# Usage: ./migration-tracker.sh "source_day" "target_day" "todo_id" "reason"

if [ $# -lt 4 ]; then
    echo "Usage: $0 \"source_day\" \"target_day\" \"todo_id\" \"reason\""
    echo "Example: $0 \"Donnerstag\" \"Freitag\" \"pricing-strategy\" \"Wiesn-Info\""
    exit 1
fi

SOURCE_DAY="$1"
TARGET_DAY="$2"
TODO_ID="$3"
REASON="$4"
TIMESTAMP=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
MIGRATION_LOG="todo-migration-log.json"

echo "📊 Speichere Todo-Migration..."

# Migration-Entry erstellen
cat >> "$MIGRATION_LOG" << EOF
{
  "timestamp": "$TIMESTAMP",
  "migration_id": "migration-$(date +%s)",
  "source_day": "$SOURCE_DAY",
  "target_day": "$TARGET_DAY",
  "todo_id": "$TODO_ID",
  "reason": "$REASON",
  "user_decision": "manual",
  "confidence": 0.9,
  "context": {
    "external_event": "$REASON",
    "time_impact": "unknown",
    "user_feedback": "moved_manually"
  }
},
EOF

echo "✅ Todo-Migration gespeichert!"
echo "📊 Von: $SOURCE_DAY → Zu: $TARGET_DAY"
echo "🎯 Todo: $TODO_ID"
echo "💭 Grund: $REASON"
