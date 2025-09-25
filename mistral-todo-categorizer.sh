#!/bin/bash

# Mistral-basierte Todo-Kategorisierung
# Usage: ./mistral-todo-categorizer.sh [--file dashboard_file]

DASHBOARD_FILE="Dashboard - Strukturierte To-do-Übersicht.md"

if [ "$1" = "--file" ] && [ -n "$2" ]; then
    DASHBOARD_FILE="$2"
fi

echo "🤖 Mistral kategorisiert Todos..."

# Todos aus Dashboard extrahieren (Sonderzeichen entfernen)
TODOS=$(grep -E "^- \[ \]" "$DASHBOARD_FILE" | head -20 | sed 's/"/\\"/g' | tr '\n' ' ')

# Mistral Prompt erstellen
MISTRAL_PROMPT="Kategorisiere diese Todos nach folgenden Kategorien:

**Geld-Fokus:** Pricing, Revenue, Verkauf, Kunden, Business-Entwicklung
**Tool-Fokus:** Tool-Entwicklung, Chat-First, Interface, Prototyping
**Marketing-Fokus:** Posts, LinkedIn, Workshops, Webinare, Content
**Personal:** Persönliche Aufgaben, Gesundheit, Familie, Bürokratie

Todos:
$TODOS

Antworte in einfachem Text-Format mit Kategorien:"

# Mistral API aufrufen
echo "📊 Mistral kategorisiert..."
MISTRAL_RESPONSE=$(./mistral-api.sh "$MISTRAL_PROMPT")

# JSON-Response speichern
echo "$MISTRAL_RESPONSE" > "todo-categorization.json"

echo "✅ Todo-Kategorisierung abgeschlossen!"
echo "📊 Ergebnisse in todo-categorization.json gespeichert"
echo ""
echo "🎯 Mistral-Kategorisierung:"
echo "$MISTRAL_RESPONSE"
