#!/bin/bash

# Tracking-System - Rohdaten sammeln für spätere Analysen
# Usage: ./update-tracking.sh "Commit message"

if [ $# -eq 0 ]; then
    echo "Usage: $0 \"Commit message\""
    exit 1
fi

COMMIT_MSG="$1"
TIMESTAMP=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
TRACKING_FILE="tracking-data.json"

# Git-Diff analysieren
echo "🔍 Analysiere Git-Diff für Tracking..."

# Änderungen seit letztem Commit
CHANGES=$(git diff --cached --name-status)
STAGED_FILES=$(git diff --cached --name-only)

# Tracking-Daten erstellen
cat >> "$TRACKING_FILE" << EOF
{
  "timestamp": "$TIMESTAMP",
  "commit_message": "$COMMIT_MSG",
  "files_changed": [
EOF

# Dateien auflisten
for file in $STAGED_FILES; do
    echo "    \"$file\"," >> "$TRACKING_FILE"
done

# Letzte Zeile korrigieren (Komma entfernen)
sed -i '$ s/,$//' "$TRACKING_FILE"

cat >> "$TRACKING_FILE" << EOF
  ],
  "change_types": [
EOF

# Änderungstypen analysieren
for file in $STAGED_FILES; do
    if [[ "$file" == *"Dashboard"* ]]; then
        echo "    \"todo_modification\"," >> "$TRACKING_FILE"
    elif [[ "$file" == *"research-log"* ]]; then
        echo "    \"research_update\"," >> "$TRACKING_FILE"
    elif [[ "$file" == *"migration-log"* ]]; then
        echo "    \"migration_tracking\"," >> "$TRACKING_FILE"
    elif [[ "$file" == *"tracking"* ]]; then
        echo "    \"tracking_update\"," >> "$TRACKING_FILE"
    else
        echo "    \"general_update\"," >> "$TRACKING_FILE"
    fi
done

# Letzte Zeile korrigieren
sed -i '$ s/,$//' "$TRACKING_FILE"

cat >> "$TRACKING_FILE" << EOF
  ],
  "patterns_identified": [
    "commit_pattern",
    "file_change_pattern"
  ],
  "context": {
    "user_action": "$COMMIT_MSG",
    "automation_level": "semi_automatic"
  }
},
EOF

echo "✅ Tracking-Daten aktualisiert!"
echo "📊 Rohdaten gesammelt für spätere LLM-Analysen"
