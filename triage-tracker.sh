#!/bin/bash

# Triage-Entscheidungen automatisiert speichern
# Usage: ./triage-tracker.sh "trigger" "decision" "reason"

if [ $# -lt 3 ]; then
    echo "Usage: $0 \"trigger\" \"decision\" \"reason\""
    echo "Example: $0 \"Wiesn-Info\" \"move_pricing_to_friday\" \"Weniger Zeit verfügbar\""
    exit 1
fi

TRIGGER="$1"
DECISION="$2"
REASON="$3"
TIMESTAMP=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
TRIAGE_LOG="triage-decisions.json"

echo "📊 Speichere Triage-Entscheidung..."

# Triage-Entscheidung speichern
cat >> "$TRIAGE_LOG" << EOF
{
  "timestamp": "$TIMESTAMP",
  "trigger": "$TRIGGER",
  "decision": "$DECISION",
  "reason": "$REASON",
  "confidence": 0.9,
  "user_decision": "manual",
  "affected_todos": [],
  "context": {
    "external_event": "$TRIGGER",
    "time_impact": "unknown",
    "user_feedback": "$REASON"
  }
},
EOF

echo "✅ Triage-Entscheidung gespeichert!"
echo "📊 Trigger: $TRIGGER"
echo "🎯 Entscheidung: $DECISION"
echo "💭 Grund: $REASON"
