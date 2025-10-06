#!/bin/bash

# Mistral-basierte Slash Commands für Todo-Management
# Usage: ./mistral-slash-commands.sh /heute|/woche|/nächste-woche

COMMAND="$1"
DATE=$(date +%Y-%m-%d)
DASHBOARD_FILE="core/Dashboard - Strukturierte To-do-Übersicht.md"

# Python-Script für Datumsberechnungen
PYTHON_DATE_SCRIPT='
import datetime
import sys

def get_date_info():
    today = datetime.date.today()
    
    # Berechne Wochenanfang (Montag)
    days_since_monday = today.weekday()
    week_start = today - datetime.timedelta(days=days_since_monday)
    week_end = week_start + datetime.timedelta(days=6)
    
    # Nächste Woche
    next_week_start = week_start + datetime.timedelta(days=7)
    next_week_end = next_week_start + datetime.timedelta(days=6)
    
    return {
        "today": today.strftime("%Y-%m-%d"),
        "tomorrow": (today + datetime.timedelta(days=1)).strftime("%Y-%m-%d"),
        "week_start": week_start.strftime("%Y-%m-%d"),
        "week_end": week_end.strftime("%Y-%m-%d"),
        "next_week_start": next_week_start.strftime("%Y-%m-%d"),
        "next_week_end": next_week_end.strftime("%Y-%m-%d"),
        "weekday": today.strftime("%A"),
        "weekday_de": ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"][today.weekday()]
    }

if __name__ == "__main__":
    import json
    print(json.dumps(get_date_info()))
'

# Datumsinformationen abrufen
DATE_INFO=$(python3 -c "$PYTHON_DATE_SCRIPT")
TODAY=$(echo "$DATE_INFO" | python3 -c "import json, sys; print(json.load(sys.stdin)['today'])")
WEEKDAY=$(echo "$DATE_INFO" | python3 -c "import json, sys; print(json.load(sys.stdin)['weekday_de'])")
WEEK_START=$(echo "$DATE_INFO" | python3 -c "import json, sys; print(json.load(sys.stdin)['week_start'])")
WEEK_END=$(echo "$DATE_INFO" | python3 -c "import json, sys; print(json.load(sys.stdin)['week_end'])")
NEXT_WEEK_START=$(echo "$DATE_INFO" | python3 -c "import json, sys; print(json.load(sys.stdin)['next_week_start'])")
NEXT_WEEK_END=$(echo "$DATE_INFO" | python3 -c "import json, sys; print(json.load(sys.stdin)['next_week_end'])")

# Funktionen für verschiedene Commands
generate_today() {
    echo "📅 Generiere heute.md für $TODAY ($WEEKDAY)..."
    
    # Alle heutigen Tasks extrahieren
    TODAY_TASKS=$(grep -E "^- \[ \]" "$DASHBOARD_FILE" | grep -i "heute\|$TODAY\|$WEEKDAY" | head -20)
    
    MISTRAL_PROMPT="Generiere eine strukturierte 'heute.md' Datei für $TODAY ($WEEKDAY) basierend auf den folgenden Tasks:

**Verfügbare Tasks:**
$TODAY_TASKS

**Struktur:**
1. **🎯 Heute ($TODAY) - $WEEKDAY**
2. **🔥 HOCHPRIORITÄT** (wichtigste Aufgaben)
3. **⚡ MITTELPRIORITÄT** (weitere wichtige Aufgaben)
4. **📝 NIEDRIGPRIORITÄT** (können verschoben werden)

**Berücksichtige:**
- Prioritäten basierend auf Business-Impact
- Zeitliche Verfügbarkeit ($WEEKDAY)
- Praktische Reihenfolge
- Deutsche Sprache

Antworte in strukturiertem Markdown-Format:"

    MISTRAL_RESPONSE=$(./automation/mistral-api.sh "$MISTRAL_PROMPT")
    echo "$MISTRAL_RESPONSE" > "heute.md"
    echo "✅ heute.md generiert!"
}

generate_this_week() {
    echo "📅 Generiere diese-woche.md für $WEEK_START bis $WEEK_END..."
    
    # Alle Tasks der aktuellen Woche extrahieren
    WEEK_TASKS=$(grep -E "^- \[ \]" "$DASHBOARD_FILE" | head -30)
    
    MISTRAL_PROMPT="Generiere eine strukturierte 'diese-woche.md' Datei für die Woche $WEEK_START bis $WEEK_END basierend auf den folgenden Tasks:

**Verfügbare Tasks:**
$WEEK_TASKS

**Struktur:**
1. **📅 Diese Woche ($WEEK_START bis $WEEK_END)**
2. **Montag** - Fokus auf Business Development
3. **Dienstag** - Content & Development
4. **Mittwoch** - Administrative Aufgaben
5. **Donnerstag** - Meetings & Termine
6. **Freitag** - Abschluss & Planung

**Berücksichtige:**
- Wochentag-spezifische Prioritäten
- Business-Impact-Verteilung
- Praktische Zeitplanung
- Deutsche Sprache

Antworte in strukturiertem Markdown-Format:"

    MISTRAL_RESPONSE=$(./automation/mistral-api.sh "$MISTRAL_PROMPT")
    echo "$MISTRAL_RESPONSE" > "diese-woche.md"
    echo "✅ diese-woche.md generiert!"
}

generate_next_week() {
    echo "📅 Generiere nächste-woche.md für $NEXT_WEEK_START bis $NEXT_WEEK_END..."
    
    # Alle Tasks extrahieren (für Planung der nächsten Woche)
    ALL_TASKS=$(grep -E "^- \[ \]" "$DASHBOARD_FILE" | head -25)
    
    MISTRAL_PROMPT="Generiere eine strukturierte 'nächste-woche.md' Datei für die Woche $NEXT_WEEK_START bis $NEXT_WEEK_END basierend auf den folgenden Tasks:

**Verfügbare Tasks:**
$ALL_TASKS

**Struktur:**
1. **📅 Nächste Woche ($NEXT_WEEK_START bis $NEXT_WEEK_END)**
2. **🎯 Fokus-Bereiche** (Business, Development, Marketing)
3. **📋 Tägliche Prioritäten** (Montag bis Freitag)
4. **🚀 Wochentags-Ziele** (konkrete Meilensteine)

**Berücksichtige:**
- Strategische Planung für nächste Woche
- Prioritäten-Vorbereitung
- Business-Impact-Optimierung
- Deutsche Sprache

Antworte in strukturiertem Markdown-Format:"

    MISTRAL_RESPONSE=$(./automation/mistral-api.sh "$MISTRAL_PROMPT")
    echo "$MISTRAL_RESPONSE" > "nächste-woche.md"
    echo "✅ nächste-woche.md generiert!"
}

# Command ausführen
case "$COMMAND" in
    "/heute")
        generate_today
        ;;
    "/woche")
        generate_this_week
        ;;
    "/nächste-woche")
        generate_next_week
        ;;
    *)
        echo "❌ Unbekannter Command: $COMMAND"
        echo "Verfügbare Commands:"
        echo "  /heute          - Generiert heute.md"
        echo "  /woche          - Generiert diese-woche.md"
        echo "  /nächste-woche  - Generiert nächste-woche.md"
        exit 1
        ;;
esac

echo ""
echo "📄 Generierte Datei:"
echo "===================="
cat "${COMMAND#/}.md"
