#!/bin/bash

# Git commit mit automatischem Website-Update
# Usage: ./commit-and-update.sh "Commit message"

if [ $# -eq 0 ]; then
    echo "Usage: $0 \"Commit message\""
    exit 1
fi

COMMIT_MSG="$1"

# Git commit
git add .
git commit -m "$COMMIT_MSG"

# Website automatisch aktualisieren
echo "🔄 Aktualisiere Website..."

# Dashboard MD-Datei lesen und in Website einfügen
DASHBOARD_CONTENT=$(cat "Dashboard - Strukturierte To-do-Übersicht.md")

# JavaScript-Teil der Website aktualisieren
sed -i '' "s|const markdownContent = \`.*\`;|const markdownContent = \`$DASHBOARD_CONTENT\`;|" index.html

echo "✅ Website aktualisiert!"
echo "🌐 Öffne index.html im Browser um die Änderungen zu sehen"
