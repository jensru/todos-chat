#!/bin/bash

# Mistral-basiertes Triage-Empfehlungssystem
# Usage: ./mistral-triage-recommender.sh [--file dashboard_file]

DASHBOARD_FILE="Dashboard - Strukturierte To-do-Übersicht.md"
TRIAGE_LOG="triage-decisions.json"

echo "🤖 Mistral analysiert Triage-Patterns..."

# Todos aus Dashboard extrahieren
TODOS=$(grep -E "^- \[ \]" "$DASHBOARD_FILE" | head -15 | sed 's/"/\\"/g' | tr '\n' ' ')

# Triage-History lesen (falls vorhanden) - vereinfacht
TRIAGE_HISTORY="Wiesn-Info: Pricing zu Freitag verschoben"

# Mistral Prompt erstellen
MISTRAL_PROMPT="Analysiere diese Todos und Triage-History für Empfehlungen:

**Aktuelle Todos:**
$TODOS

**Triage-History:**
$TRIAGE_HISTORY

**Empfehle basierend auf:**
1. Welche Todos sollten heute erledigt werden?
2. Welche können auf morgen/Freitag verschoben werden?
3. Welche Patterns erkennst du in der Triage-History?
4. Was sind die Prioritäten?

Antworte mit konkreten Empfehlungen:"

# Mistral API aufrufen
echo "📊 Mistral analysiert Triage-Patterns..."
MISTRAL_RESPONSE=$(./mistral-api.sh "$MISTRAL_PROMPT")

# Empfehlungen speichern
echo "$MISTRAL_RESPONSE" > "triage-recommendations.txt"

echo "✅ Triage-Empfehlungen generiert!"
echo "📊 Ergebnisse in triage-recommendations.txt gespeichert"
echo ""
echo "🎯 Mistral-Triage-Empfehlungen:"
echo "$MISTRAL_RESPONSE"
