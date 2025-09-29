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
./automation/update-dates.sh

# Task-Historie synchronisieren und Dashboard bereinigen
echo "🔄 Synchronisiere Task-Historie..."
if [ -f "automation/task-history-manager.sh" ]; then
    ./automation/task-history-manager.sh sync
    echo "🧹 Bereinige Dashboard..."
    ./automation/task-history-manager.sh clean
fi

# Tagesziele-Fortschritt aktualisieren
echo "📊 Aktualisiere Tagesziele-Fortschritt..."
if [ -f "automation/daily-goals-manager.sh" ]; then
    ./automation/daily-goals-manager.sh update-progress
fi

# Änderungen dokumentieren für Chat-First Research
echo "📊 Dokumentiere Änderungen für Feature-Research..."
./automation/document-changes.sh "$COMMIT_MSG"

# Tracking-System aktualisieren (Rohdaten sammeln)
echo "📈 Aktualisiere Tracking-System..."
./automation/update-tracking.sh "$COMMIT_MSG"

# Mistral-basierte Automatisierung (standardmäßig aktiviert)
echo "🤖 Mistral-basierte Analyse..."
./automation/mistral-research-update.sh "$COMMIT_MSG"
echo "📊 Mistral Todo-Kategorisierung..."
./automation/mistral-todo-categorizer.sh

# Log-Rotation (behält nur die letzten 20 Mistral-Einträge)
echo "🔄 Führe Log-Rotation durch..."
./automation/log-rotation.sh

# Git commit
git add .
git commit -m "$COMMIT_MSG"

# Website automatisch aktualisieren
echo "🔄 Aktualisiere Website..."
node scripts/generate-html.js generate

echo "✅ Website mit modernem Design aktualisiert!"
echo "🌐 Öffne web/index.html im Browser um die Änderungen zu sehen"
