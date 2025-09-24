#!/bin/bash

# Dokumentiert Änderungen für Chat-First Research
# Usage: ./document-changes.sh "Commit message"

if [ $# -eq 0 ]; then
    echo "Usage: $0 \"Commit message\""
    exit 1
fi

COMMIT_MSG="$1"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
RESEARCH_LOG="chatfirst-research-log.md"

# Git Diff analysieren
echo "🔍 Analysiere Git-Diff..."

# Änderungen seit letztem Commit
CHANGES=$(git diff --cached --name-status)
STAGED_FILES=$(git diff --cached --name-only)

# Änderungen seit letztem Commit (falls vorhanden)
if git rev-parse --verify HEAD >/dev/null 2>&1; then
    LAST_COMMIT_CHANGES=$(git diff HEAD~1 --name-status)
else
    LAST_COMMIT_CHANGES="Erster Commit"
fi

# Dokumentation erstellen
cat >> "$RESEARCH_LOG" << EOF

---

## 🔄 **Direkte Datei-Änderung - $TIMESTAMP**

### **Commit:** "$COMMIT_MSG"

### **Geänderte Dateien:**
EOF

# Datei-Änderungen dokumentieren
for file in $STAGED_FILES; do
    if [ -f "$file" ]; then
        echo "- **$file**" >> "$RESEARCH_LOG"
        
        # Art der Änderung erkennen
        if echo "$CHANGES" | grep -q "^A.*$file"; then
            echo "  - ➕ **Neu erstellt**" >> "$RESEARCH_LOG"
        elif echo "$CHANGES" | grep -q "^M.*$file"; then
            echo "  - ✏️ **Modifiziert**" >> "$RESEARCH_LOG"
        elif echo "$CHANGES" | grep -q "^D.*$file"; then
            echo "  - 🗑️ **Gelöscht**" >> "$RESEARCH_LOG"
        fi
        
        # Spezifische Änderungen für wichtige Dateien
        case "$file" in
            "Dashboard - Strukturierte To-do-Übersicht.md")
                echo "  - 📋 **Todo-Änderungen**" >> "$RESEARCH_LOG"
                # Todo-Änderungen extrahieren
                if git diff --cached "$file" | grep -q "^- \[ \]"; then
                    echo "    - Neue Todos hinzugefügt" >> "$RESEARCH_LOG"
                fi
                if git diff --cached "$file" | grep -q "^- \[x\]"; then
                    echo "    - Todos als erledigt markiert" >> "$RESEARCH_LOG"
                fi
                ;;
            "right-sidebar.md")
                echo "  - 🎯 **Ziele/Fokus-Änderungen**" >> "$RESEARCH_LOG"
                ;;
            "index.html")
                echo "  - 🌐 **Website-Update**" >> "$RESEARCH_LOG"
                ;;
            "commit-and-update.sh"|"document-changes.sh"|"update-dates.sh")
                echo "  - ⚙️ **Workflow-Automatisierung**" >> "$RESEARCH_LOG"
                ;;
        esac
    fi
done

# Erweiterte Pattern-Recognition
echo "" >> "$RESEARCH_LOG"
echo "### **Erweiterte Pattern-Recognition:**" >> "$RESEARCH_LOG"

# Häufige Änderungsmuster erkennen
if echo "$STAGED_FILES" | grep -q "Dashboard"; then
    echo "- 📋 **Todo-Management Pattern**" >> "$RESEARCH_LOG"
    
    # Detaillierte Todo-Analyse
    DASHBOARD_DIFF=$(git diff --cached "Dashboard - Strukturierte To-do-Übersicht.md" 2>/dev/null)
    if [ ! -z "$DASHBOARD_DIFF" ]; then
        NEW_TODOS=$(echo "$DASHBOARD_DIFF" | grep -c "^- \[ \]")
        COMPLETED_TODOS=$(echo "$DASHBOARD_DIFF" | grep -c "^- \[x\]")
        MOVED_TODOS=$(echo "$DASHBOARD_DIFF" | grep -c "^+.*- \[")
        
        echo "  - Neue Todos: $NEW_TODOS" >> "$RESEARCH_LOG"
        echo "  - Erledigte Todos: $COMPLETED_TODOS" >> "$RESEARCH_LOG"
        echo "  - Verschobene Todos: $MOVED_TODOS" >> "$RESEARCH_LOG"
        
        # Todo-Kategorien erkennen
        if echo "$DASHBOARD_DIFF" | grep -qi "woche\|week"; then
            echo "  - 📅 **Wochenplanung Pattern**" >> "$RESEARCH_LOG"
        fi
        if echo "$DASHBOARD_DIFF" | grep -qi "sprint\|oktober"; then
            echo "  - 🚀 **Sprint-Planung Pattern**" >> "$RESEARCH_LOG"
        fi
        if echo "$DASHBOARD_DIFF" | grep -qi "marketing\|business"; then
            echo "  - 💼 **Business-Development Pattern**" >> "$RESEARCH_LOG"
        fi
    fi
fi

if echo "$STAGED_FILES" | grep -q "right-sidebar"; then
    echo "- 🎯 **Prioritäten-Anpassung Pattern**" >> "$RESEARCH_LOG"
    
    # Sidebar-Änderungen analysieren
    SIDEBAR_DIFF=$(git diff --cached "right-sidebar.md" 2>/dev/null)
    if [ ! -z "$SIDEBAR_DIFF" ]; then
        if echo "$SIDEBAR_DIFF" | grep -qi "geld\|money"; then
            echo "  - 💰 **Geld-Fokus Pattern**" >> "$RESEARCH_LOG"
        fi
        if echo "$SIDEBAR_DIFF" | grep -qi "tool\|first"; then
            echo "  - 🛠️ **Tool-First Pattern**" >> "$RESEARCH_LOG"
        fi
        if echo "$SIDEBAR_DIFF" | grep -qi "erfolg\|kriterien"; then
            echo "  - 🎯 **Erfolgs-Messung Pattern**" >> "$RESEARCH_LOG"
        fi
    fi
fi

if echo "$STAGED_FILES" | grep -q "\.sh$"; then
    echo "- ⚙️ **Automatisierung-Pattern**" >> "$RESEARCH_LOG"
    
    # Script-Änderungen analysieren
    for script in $STAGED_FILES; do
        if [[ "$script" == *.sh ]]; then
            SCRIPT_DIFF=$(git diff --cached "$script" 2>/dev/null)
            if [ ! -z "$SCRIPT_DIFF" ]; then
                if echo "$SCRIPT_DIFF" | grep -qi "git\|commit"; then
                    echo "  - 🔄 **Git-Automatisierung**" >> "$RESEARCH_LOG"
                fi
                if echo "$SCRIPT_DIFF" | grep -qi "website\|html"; then
                    echo "  - 🌐 **Website-Automatisierung**" >> "$RESEARCH_LOG"
                fi
                if echo "$SCRIPT_DIFF" | grep -qi "document\|research"; then
                    echo "  - 📊 **Research-Automatisierung**" >> "$RESEARCH_LOG"
                fi
            fi
        fi
    done
fi

# Cross-File Pattern Recognition
echo "" >> "$RESEARCH_LOG"
echo "### **Cross-File Pattern Analysis:**" >> "$RESEARCH_LOG"

# Multi-File Workflows erkennen
if echo "$STAGED_FILES" | grep -q "Dashboard" && echo "$STAGED_FILES" | grep -q "index.html"; then
    echo "- 🔄 **Todo-zu-Website Workflow**" >> "$RESEARCH_LOG"
fi

if echo "$STAGED_FILES" | grep -q "right-sidebar" && echo "$STAGED_FILES" | grep -q "index.html"; then
    echo "- 🎯 **Prioritäten-zu-Website Workflow**" >> "$RESEARCH_LOG"
fi

if echo "$STAGED_FILES" | grep -q "\.sh" && echo "$STAGED_FILES" | grep -q "\.md"; then
    echo "- ⚙️ **Script-zu-Content Workflow**" >> "$RESEARCH_LOG"
fi

# Intelligente Feature-Bedürfnisse-Ableitung
echo "" >> "$RESEARCH_LOG"
echo "### **Intelligente Feature-Bedürfnisse-Ableitung:**" >> "$RESEARCH_LOG"

# Commit-Message Pattern Analysis
if echo "$COMMIT_MSG" | grep -qi "todo\|task\|aufgabe"; then
    echo "- 🔄 **Automatische Todo-Synchronisation**" >> "$RESEARCH_LOG"
fi

if echo "$COMMIT_MSG" | grep -qi "filter\|suche\|search"; then
    echo "- 🔍 **Erweiterte Suchfunktionen**" >> "$RESEARCH_LOG"
fi

if echo "$COMMIT_MSG" | grep -qi "design\|ui\|interface"; then
    echo "- 🎨 **UI/UX-Verbesserungen**" >> "$RESEARCH_LOG"
fi

if echo "$COMMIT_MSG" | grep -qi "automat\|script\|workflow"; then
    echo "- 🤖 **Workflow-Automatisierung**" >> "$RESEARCH_LOG"
fi

# Content-basierte Feature-Extraktion
if echo "$STAGED_FILES" | grep -q "Dashboard"; then
    DASHBOARD_CONTENT=$(cat "Dashboard - Strukturierte To-do-Übersicht.md" 2>/dev/null)
    
    # Wiederkehrende Probleme erkennen
    if echo "$DASHBOARD_CONTENT" | grep -qi "verschieben\|verschiebt"; then
        echo "- 📅 **Automatische Termin-Verschiebung**" >> "$RESEARCH_LOG"
    fi
    
    if echo "$DASHBOARD_CONTENT" | grep -qi "priorität\|wichtig"; then
        echo "- ⭐ **Prioritäts-Management**" >> "$RESEARCH_LOG"
    fi
    
    if echo "$DASHBOARD_CONTENT" | grep -qi "deadline\|termin"; then
        echo "- ⏰ **Deadline-Management**" >> "$RESEARCH_LOG"
    fi
    
    # Workflow-Patterns erkennen
    if echo "$DASHBOARD_CONTENT" | grep -qi "woche.*woche"; then
        echo "- 🔄 **Wochenplanung-Automatisierung**" >> "$RESEARCH_LOG"
    fi
    
    if echo "$DASHBOARD_CONTENT" | grep -qi "sprint.*sprint"; then
        echo "- 🚀 **Sprint-Management**" >> "$RESEARCH_LOG"
    fi
fi

# Sidebar-basierte Feature-Extraktion
if echo "$STAGED_FILES" | grep -q "right-sidebar"; then
    SIDEBAR_CONTENT=$(cat "right-sidebar.md" 2>/dev/null)
    
    if echo "$SIDEBAR_CONTENT" | grep -qi "geld.*geld"; then
        echo "- 💰 **Revenue-Tracking**" >> "$RESEARCH_LOG"
    fi
    
    if echo "$SIDEBAR_CONTENT" | grep -qi "tool.*first"; then
        echo "- 🛠️ **Tool-First Workflow**" >> "$RESEARCH_LOG"
    fi
    
    if echo "$SIDEBAR_CONTENT" | grep -qi "erfolg.*kriterien"; then
        echo "- 📊 **Erfolgs-Messung Dashboard**" >> "$RESEARCH_LOG"
    fi
fi

# Script-basierte Feature-Extraktion
if echo "$STAGED_FILES" | grep -q "\.sh"; then
    echo "- 🔧 **Script-Management Interface**" >> "$RESEARCH_LOG"
    echo "- 📝 **Workflow-Dokumentation**" >> "$RESEARCH_LOG"
    echo "- 🔄 **Automatisierungs-Übersicht**" >> "$RESEARCH_LOG"
fi

# Erweiterte Metriken
echo "" >> "$RESEARCH_LOG"
echo "### **Erweiterte Metriken:**" >> "$RESEARCH_LOG"
echo "- **Anzahl geänderter Dateien:** $(echo "$STAGED_FILES" | wc -w)" >> "$RESEARCH_LOG"
echo "- **Commit-Typ:** $(echo "$COMMIT_MSG" | cut -d' ' -f1)" >> "$RESEARCH_LOG"

# Zeilen-Änderungen zählen
TOTAL_ADDITIONS=0
TOTAL_DELETIONS=0
for file in $STAGED_FILES; do
    if [ -f "$file" ]; then
        FILE_DIFF=$(git diff --cached --numstat "$file" 2>/dev/null)
        if [ ! -z "$FILE_DIFF" ]; then
            ADDITIONS=$(echo "$FILE_DIFF" | cut -f1)
            DELETIONS=$(echo "$FILE_DIFF" | cut -f2)
            TOTAL_ADDITIONS=$((TOTAL_ADDITIONS + ADDITIONS))
            TOTAL_DELETIONS=$((TOTAL_DELETIONS + DELETIONS))
        fi
    fi
done

echo "- **Hinzugefügte Zeilen:** $TOTAL_ADDITIONS" >> "$RESEARCH_LOG"
echo "- **Gelöschte Zeilen:** $TOTAL_DELETIONS" >> "$RESEARCH_LOG"
echo "- **Netto-Änderung:** $((TOTAL_ADDITIONS - TOTAL_DELETIONS))" >> "$RESEARCH_LOG"

# Workflow-Komplexität messen
if [ $((TOTAL_ADDITIONS + TOTAL_DELETIONS)) -gt 50 ]; then
    echo "- **Workflow-Komplexität:** Hoch (>50 Zeilen)" >> "$RESEARCH_LOG"
elif [ $((TOTAL_ADDITIONS + TOTAL_DELETIONS)) -gt 20 ]; then
    echo "- **Workflow-Komplexität:** Mittel (20-50 Zeilen)" >> "$RESEARCH_LOG"
else
    echo "- **Workflow-Komplexität:** Niedrig (<20 Zeilen)" >> "$RESEARCH_LOG"
fi

# Zeit-basierte Metriken
echo "- **Commit-Zeit:** $TIMESTAMP" >> "$RESEARCH_LOG"
echo "- **Wochentag:** $(date '+%A')" >> "$RESEARCH_LOG"
echo "- **Tageszeit:** $(date '+%H:%M')" >> "$RESEARCH_LOG"

# Alignment-Tracking: Ziele vs. tatsächliche Todos
echo "" >> "$RESEARCH_LOG"
echo "### **🎯 Alignment-Tracking (Ziele vs. Todos):**" >> "$RESEARCH_LOG"

# Sidebar-Ziele lesen
if [ -f "right-sidebar.md" ]; then
    SIDEBAR_CONTENT=$(cat "right-sidebar.md")
    
    # Hauptziele extrahieren
    MAIN_GOALS=$(echo "$SIDEBAR_CONTENT" | grep -i "geld\|money\|revenue" | wc -l)
    TOOL_FOCUS=$(echo "$SIDEBAR_CONTENT" | grep -i "tool.*first\|chat.*first" | wc -l)
    SUCCESS_CRITERIA=$(echo "$SIDEBAR_CONTENT" | grep -i "erfolg\|kriterien\|q4" | wc -l)
    
    echo "- **Geld-Fokus in Sidebar:** $MAIN_GOALS Erwähnungen" >> "$RESEARCH_LOG"
    echo "- **Tool-First in Sidebar:** $TOOL_FOCUS Erwähnungen" >> "$RESEARCH_LOG"
    echo "- **Erfolgs-Kriterien in Sidebar:** $SUCCESS_CRITERIA Erwähnungen" >> "$RESEARCH_LOG"
fi

# Dashboard-Todos analysieren
if [ -f "Dashboard - Strukturierte To-do-Übersicht.md" ]; then
    DASHBOARD_CONTENT=$(cat "Dashboard - Strukturierte To-do-Übersicht.md")
    
    # Geld-bezogene Todos zählen
    MONEY_TODOS=$(echo "$DASHBOARD_CONTENT" | grep -i "geld\|money\|pricing\|revenue\|verkauf\|kunde" | wc -l)
    TOOL_TODOS=$(echo "$DASHBOARD_CONTENT" | grep -i "tool\|chat.*first\|interface\|prototyp" | wc -l)
    MARKETING_TODOS=$(echo "$DASHBOARD_CONTENT" | grep -i "marketing\|post\|linkedin\|workshop\|webinar" | wc -l)
    PERSONAL_TODOS=$(echo "$DASHBOARD_CONTENT" | grep -i "schimmel\|büro\|keller\|steuer\|eltern" | wc -l)
    
    echo "- **Geld-bezogene Todos:** $MONEY_TODOS" >> "$RESEARCH_LOG"
    echo "- **Tool-bezogene Todos:** $TOOL_TODOS" >> "$RESEARCH_LOG"
    echo "- **Marketing-Todos:** $MARKETING_TODOS" >> "$RESEARCH_LOG"
    echo "- **Persönliche Todos:** $PERSONAL_TODOS" >> "$RESEARCH_LOG"
    
    # Alignment-Ratio berechnen
    TOTAL_TODOS=$((MONEY_TODOS + TOOL_TODOS + MARKETING_TODOS + PERSONAL_TODOS))
    if [ $TOTAL_TODOS -gt 0 ]; then
        MONEY_RATIO=$((MONEY_TODOS * 100 / TOTAL_TODOS))
        TOOL_RATIO=$((TOOL_TODOS * 100 / TOTAL_TODOS))
        MARKETING_RATIO=$((MARKETING_TODOS * 100 / TOTAL_TODOS))
        PERSONAL_RATIO=$((PERSONAL_TODOS * 100 / TOTAL_TODOS))
        
        echo "" >> "$RESEARCH_LOG"
        echo "### **📊 Fokus-Alignment-Analyse:**" >> "$RESEARCH_LOG"
        echo "- **Geld-Fokus:** $MONEY_RATIO% der Todos" >> "$RESEARCH_LOG"
        echo "- **Tool-Fokus:** $TOOL_RATIO% der Todos" >> "$RESEARCH_LOG"
        echo "- **Marketing-Fokus:** $MARKETING_RATIO% der Todos" >> "$RESEARCH_LOG"
        echo "- **Persönlicher Fokus:** $PERSONAL_RATIO% der Todos" >> "$RESEARCH_LOG"
        
        # Reine Daten ohne Interpretation
        echo "" >> "$RESEARCH_LOG"
        echo "### **📊 Raw Alignment Data:**" >> "$RESEARCH_LOG"
        echo "- Geld-Ratio: $MONEY_RATIO%" >> "$RESEARCH_LOG"
        echo "- Tool-Ratio: $TOOL_RATIO%" >> "$RESEARCH_LOG"
        echo "- Marketing-Ratio: $MARKETING_RATIO%" >> "$RESEARCH_LOG"
        echo "- Persönlich-Ratio: $PERSONAL_RATIO%" >> "$RESEARCH_LOG"
    fi
fi

# Commit-Message Alignment
echo "" >> "$RESEARCH_LOG"
echo "### **💬 Commit-Message Alignment:**" >> "$RESEARCH_LOG"
if echo "$COMMIT_MSG" | grep -qi "geld\|money\|pricing"; then
    echo "- ✅ Commit fokussiert auf Geld-Themen" >> "$RESEARCH_LOG"
fi
if echo "$COMMIT_MSG" | grep -qi "tool\|chat\|interface"; then
    echo "- ✅ Commit fokussiert auf Tool-Entwicklung" >> "$RESEARCH_LOG"
fi
if echo "$COMMIT_MSG" | grep -qi "marketing\|post\|workshop"; then
    echo "- ✅ Commit fokussiert auf Marketing" >> "$RESEARCH_LOG"
fi
if echo "$COMMIT_MSG" | grep -qi "schimmel\|büro\|keller"; then
    echo "- ⚠️ Commit fokussiert auf persönliche Themen" >> "$RESEARCH_LOG"
fi

# Reine Daten-Sammlung ohne Interpretation
echo "" >> "$RESEARCH_LOG"
echo "### **📊 Additional Tracking Data:**" >> "$RESEARCH_LOG"

# Zeit-basierte Metriken
CURRENT_HOUR=$(date '+%H')
CURRENT_DAY=$(date '+%A')
echo "- Arbeitszeit: $CURRENT_HOUR Uhr" >> "$RESEARCH_LOG"
echo "- Wochentag: $CURRENT_DAY" >> "$RESEARCH_LOG"

# Mismatch-Indikatoren (nur Daten, keine Interpretation)
if [ $MONEY_RATIO -lt 15 ] && [ $MAIN_GOALS -gt 0 ]; then
    echo "- Geld-Mismatch-Indikator: Sidebar=$MAIN_GOALS, Todos=$MONEY_RATIO%" >> "$RESEARCH_LOG"
fi

if [ $TOOL_RATIO -lt 10 ] && [ $TOOL_FOCUS -gt 0 ]; then
    echo "- Tool-Mismatch-Indikator: Sidebar=$TOOL_FOCUS, Todos=$TOOL_RATIO%" >> "$RESEARCH_LOG"
fi

if [ $PERSONAL_RATIO -gt 50 ]; then
    echo "- Persönlich-High-Indikator: $PERSONAL_RATIO%" >> "$RESEARCH_LOG"
fi

if [ $MARKETING_RATIO -gt $TOOL_RATIO ] && [ $TOOL_RATIO -lt 20 ]; then
    echo "- Marketing-Dominanz-Indikator: Marketing=$MARKETING_RATIO%, Tool=$TOOL_RATIO%" >> "$RESEARCH_LOG"
fi

EOF

echo "✅ Änderungen dokumentiert in $RESEARCH_LOG"
echo "📊 Pattern-Recognition aktiviert"
echo "🤖 Feature-Bedürfnisse extrahiert"

# Mistral API Integration (optional)
if [ "$2" = "--mistral" ]; then
    echo ""
    echo "🤖 **Mistral API Analyse:**"
    
    # Letzte Änderungen für Mistral analysieren
    MISTRAL_PROMPT="Analysiere diese Commit-Änderungen:
    - Commit: '$COMMIT_MSG'
    - Geänderte Dateien: $(echo "$STAGED_FILES" | wc -w)
    - Hinzugefügte Zeilen: $TOTAL_ADDITIONS
    - Gelöschte Zeilen: $TOTAL_DELETIONS
    
    Gib eine kurze Analyse der Änderungen und Empfehlungen für den nächsten Schritt."
    
    # Mistral API aufrufen
    if [ -f "mistral-api.sh" ]; then
        ./mistral-api.sh "$MISTRAL_PROMPT"
    else
        echo "❌ mistral-api.sh nicht gefunden. Führe ./setup-mistral-api.sh aus"
    fi
fi
