#!/bin/bash

# Vereinfachte Slash Commands für Todo-Management (ohne Mistral)
# Usage: ./simple-slash-commands.sh /heute|/woche|/nächste-woche

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
    TODAY_TASKS=$(grep -E "^- \[ \]" "$DASHBOARD_FILE" | head -10)
    
    cat > "heute.md" << EOF
# 🎯 Heute ($TODAY) - $WEEKDAY

## 🔥 HOCHPRIORITÄT (Heute Vormittag)
- [ ] Noch proaktiver nach Leuten lokal suchen
- [ ] Steffen app schicken  
- [ ] Ki hatte das falsche Versprechen und überbewerten

## ⚡ MITTELPRIORITÄT (Heute Nachmittag)
- [ ] **2.10. Bene (Sustain) Meeting** - Meeting-Vorbereitung
- [ ] **PUSH Präse**
- [ ] **PUSH Build Test** - Optimierungen

## 📝 NIEDRIGPRIORITÄT (Heute Abend)
- [ ] Tim wg. Coaching
- [ ] LinkedIn Posts vorbereiten

---

**Verfügbare Tasks aus Dashboard:**
$TODAY_TASKS

**Generiert am:** $(date)
**Wochentag:** $WEEKDAY
**Datum:** $TODAY
EOF
    
    echo "✅ heute.md generiert!"
}

generate_this_week() {
    echo "📅 Generiere diese-woche.md für $WEEK_START bis $WEEK_END..."
    
    # Alle Tasks der aktuellen Woche extrahieren
    WEEK_TASKS=$(grep -E "^- \[ \]" "$DASHBOARD_FILE" | head -20)
    
    cat > "diese-woche.md" << EOF
# 📅 Diese Woche ($WEEK_START bis $WEEK_END)

## Montag (6. Oktober) - Business Development
- [ ] Noch proaktiver nach Leuten lokal suchen
- [ ] Steffen app schicken
- [ ] Ki hatte das falsche Versprechen und überbewerten

## Dienstag (7. Oktober) - Content & Development  
- [ ] Check24 Workshop!!!
- [ ] Erste Daten für Konzepter generieren
- [ ] **Alloy testen** - Tool evaluieren
- [ ] **Alloy Guides lesen und testen**

## Mittwoch (8. Oktober) - Administrative Aufgaben
- [ ] Stromanbieter
- [ ] Huk
- [ ] Zahnversicherung
- [ ] Mieterverein doppelt
- [ ] Kretschmer wegen Zahnzusatz

## Donnerstag (9. Oktober) - Termine & Meetings
- [ ] **10.10. um 10:30 Uhr Lungenarzttermin**
- [ ] Nebenkostenabrechnungen Lich versenden

## Freitag (10. Oktober) - Abschluss & Planung
- [ ] Woche reflektieren
- [ ] Nächste Woche planen

---

**Alle verfügbaren Tasks:**
$WEEK_TASKS

**Generiert am:** $(date)
**Woche:** $WEEK_START bis $WEEK_END
EOF
    
    echo "✅ diese-woche.md generiert!"
}

generate_next_week() {
    echo "📅 Generiere nächste-woche.md für $NEXT_WEEK_START bis $NEXT_WEEK_END..."
    
    # Alle Tasks extrahieren (für Planung der nächsten Woche)
    ALL_TASKS=$(grep -E "^- \[ \]" "$DASHBOARD_FILE" | head -15)
    
    cat > "nächste-woche.md" << EOF
# 📅 Nächste Woche ($NEXT_WEEK_START bis $NEXT_WEEK_END)

## 🎯 Fokus-Bereiche

### Business Development
- [ ] Noch mehr rauskommen aus dem Haus planen!!!
- [ ] Alle Leute hallo mit lead funnels strategie
- [ ] Mitgründer suchen Post

### Tool-Entwicklung  
- [ ] **Tool Seiten -> Aktuelle Tools & Lead**
- [ ] **Wireframes Tool**
- [ ] **Design Core Prompts für PUSH und Check24**

### Marketing & Content
- [ ] **Linkend In Post** - PUSH Breakout Session
- [ ] Post zu 5 stuefen workflow
- [ ] CV dieses Jahr Update

## 📋 Tägliche Prioritäten

### Montag - Business Focus
- Lead-Generierung
- Networking

### Dienstag - Development  
- Tool-Testing
- Prompt-Optimierung

### Mittwoch - Content
- Blog Posts
- LinkedIn Content

### Donnerstag - Marketing
- Workshop-Vorbereitung
- Materialien

### Freitag - Planung
- Woche reflektieren
- Nächste Woche strukturieren

---

**Verfügbare Tasks für Planung:**
$ALL_TASKS

**Generiert am:** $(date)
**Planung für:** $NEXT_WEEK_START bis $NEXT_WEEK_END
EOF
    
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
