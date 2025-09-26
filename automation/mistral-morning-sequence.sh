#!/bin/bash

# Mistral-basierte Morgensequenz-Generierung
# Usage: ./mistral-morning-sequence.sh [date]

DATE="${1:-$(date +%Y-%m-%d)}"
DASHBOARD_FILE="core/Dashboard - Strukturierte To-do-Übersicht.md"

echo "🌅 Mistral generiert Morgensequenz für $DATE..."

# Aktuelle Todos aus Dashboard extrahieren
TODOS=$(grep -E "^- \[ \]" "$DASHBOARD_FILE" | head -15 | sed 's/"/\\"/g' | tr '\n' ' ')

# Mistral Prompt für Morgensequenz
MISTRAL_PROMPT="Basierend auf den gelernten Startup-Sequenz-Patterns, generiere eine strukturierte Morgensequenz für $DATE:

**Gelernte Patterns:**
- Phase-basierte Struktur: Morgensetup → MUST HAVE → Weitere Todos
- Prioritäts-Reihenfolge: Persönliche Todos zuerst, dann Business
- Detail-Erhaltung: Alle Unterpunkte präzise übertragen
- Duplikat-Vermeidung: Saubere Struktur ohne Wiederholungen

**Verfügbare Todos:**
$TODOS

**Generiere eine Morgensequenz mit:**
1. **Phase 1: Morgensetup** (persönliche Todos zuerst)
2. **Phase 2: MUST HAVE** (wichtigste Business-Todos)
3. **Phase 3: Weitere Todos** (restliche Aufgaben)

**Berücksichtige:**
- Wochentag-Kontext ($DATE)
- Prioritäten basierend auf gelernten Patterns
- Strukturierte Phasen
- Praktische Reihenfolge

Antworte in strukturiertem Markdown-Format:"

# Mistral API aufrufen
echo "🤖 Mistral generiert Morgensequenz..."
MISTRAL_RESPONSE=$(./automation/mistral-api.sh "$MISTRAL_PROMPT")

# Morgensequenz speichern
echo "$MISTRAL_RESPONSE" > "morning-sequence-$DATE.md"

echo "✅ Morgensequenz generiert!"
echo "📄 Gespeichert in: morning-sequence-$DATE.md"
echo ""
echo "🌅 Mistral-Morgensequenz für $DATE:"
echo "$MISTRAL_RESPONSE"
