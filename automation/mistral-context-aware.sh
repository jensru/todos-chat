#!/bin/bash

# Kontext-bewusste Mistral-Analyse
# Verwendet nur relevante Abschnitte des Research Logs

RESEARCH_LOG="research/chatfirst-research-log.md"
MAX_CONTEXT_LINES=500  # Maximal 500 Zeilen Kontext

echo "🧠 Kontext-bewusste Mistral-Analyse..."

# Relevante Abschnitte extrahieren (letzte Mistral-Einträge + aktuelle Änderungen)
if [ -f "$RESEARCH_LOG" ]; then
    # Letzte 3 Mistral-Einträge als Kontext
    CONTEXT=$(grep -A 50 "## 🤖 \*\*Mistral-Automatisierte Analyse" "$RESEARCH_LOG" | tail -n "$MAX_CONTEXT_LINES")
else
    CONTEXT="Kein Research Log vorhanden"
fi

# Git-Änderungen analysieren
COMMIT_MSG="$1"
CHANGED_FILES=$(git diff --cached --name-only | tr '\n' ', ')
CHANGED_CONTENT=$(git diff --cached --stat)

# Kontext-bewusster Mistral Prompt
MISTRAL_PROMPT="Analysiere diese Git-Änderungen basierend auf dem aktuellen Kontext:

**Aktueller Kontext (letzte Mistral-Analysen):**
$CONTEXT

**Neue Änderungen:**
Commit: $COMMIT_MSG
Dateien: $CHANGED_FILES
Statistik: $CHANGED_CONTENT

**Fokus auf:**
1. Neue Chat-First-Patterns (nicht wiederholen was schon bekannt ist)
2. Evolution der bisherigen Erkenntnisse
3. Konkrete Tool-Requirements
4. User-Feedback-Loops

Antworte präzise und fokussiert auf NEUE Erkenntnisse."

# Mistral API aufrufen
echo "📊 Mistral analysiert mit Kontext-Bewusstsein..."
MISTRAL_RESPONSE=$(./automation/mistral-api.sh "$MISTRAL_PROMPT")

echo "✅ Kontext-bewusste Analyse abgeschlossen!"
echo "🎯 Fokus auf neue Erkenntnisse statt Wiederholungen"
