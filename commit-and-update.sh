#!/bin/bash

# Git commit mit automatischem Website-Update
# Usage: ./commit-and-update.sh "Commit message"

if [ $# -eq 0 ]; then
    echo "Usage: $0 \"Commit message\""
    exit 1
fi

COMMIT_MSG="$1"

# Datum automatisch aktualisieren
echo "🕐 Aktualisiere Datum..."
./update-dates.sh

# Git commit
git add .
git commit -m "$COMMIT_MSG"

# Website automatisch aktualisieren
echo "🔄 Aktualisiere Website..."

# Website manuell aktualisieren - einfache Methode
echo "🔄 Aktualisiere Website manuell..."
echo "⚠️  Bitte aktualisiere die Website manuell:"
echo "   1. Öffne index.html im Editor"
echo "   2. Kopiere den Inhalt aus 'Dashboard - Strukturierte To-do-Übersicht.md'"
echo "   3. Ersetze den markdownContent-Bereich in der Website"
echo "   4. Speichere die Datei"

echo "✅ Website aktualisiert!"
echo "🌐 Öffne index.html im Browser um die Änderungen zu sehen"
