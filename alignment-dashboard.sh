#!/bin/bash

# Alignment-Dashboard - Schnelle Übersicht über Fokus-Alignment
# Usage: ./alignment-dashboard.sh

echo "🎯 **Alignment-Dashboard**"
echo "=========================="
echo ""

# Sidebar-Ziele lesen
if [ -f "right-sidebar.md" ]; then
    SIDEBAR_CONTENT=$(cat "right-sidebar.md")
    
    # Hauptziele extrahieren
    MAIN_GOALS=$(echo "$SIDEBAR_CONTENT" | grep -i "geld\|money\|revenue" | wc -l)
    TOOL_FOCUS=$(echo "$SIDEBAR_CONTENT" | grep -i "tool.*first\|chat.*first" | wc -l)
    SUCCESS_CRITERIA=$(echo "$SIDEBAR_CONTENT" | grep -i "erfolg\|kriterien\|q4" | wc -l)
    
    echo "📋 **Gesetzte Ziele (Sidebar):**"
    echo "- Geld-Fokus: $MAIN_GOALS Erwähnungen"
    echo "- Tool-First: $TOOL_FOCUS Erwähnungen"
    echo "- Erfolgs-Kriterien: $SUCCESS_CRITERIA Erwähnungen"
    echo ""
fi

# Dashboard-Todos analysieren
if [ -f "Dashboard - Strukturierte To-do-Übersicht.md" ]; then
    DASHBOARD_CONTENT=$(cat "Dashboard - Strukturierte To-do-Übersicht.md")
    
    # Geld-bezogene Todos zählen
    MONEY_TODOS=$(echo "$DASHBOARD_CONTENT" | grep -i "geld\|money\|pricing\|revenue\|verkauf\|kunde" | wc -l)
    TOOL_TODOS=$(echo "$DASHBOARD_CONTENT" | grep -i "tool\|chat.*first\|interface\|prototyp" | wc -l)
    MARKETING_TODOS=$(echo "$DASHBOARD_CONTENT" | grep -i "marketing\|post\|linkedin\|workshop\|webinar" | wc -l)
    PERSONAL_TODOS=$(echo "$DASHBOARD_CONTENT" | grep -i "schimmel\|büro\|keller\|steuer\|eltern" | wc -l)
    
    echo "📊 **Tatsächliche Todos (Dashboard):**"
    echo "- Geld-bezogen: $MONEY_TODOS"
    echo "- Tool-bezogen: $TOOL_TODOS"
    echo "- Marketing: $MARKETING_TODOS"
    echo "- Persönlich: $PERSONAL_TODOS"
    echo ""
    
    # Alignment-Ratio berechnen
    TOTAL_TODOS=$((MONEY_TODOS + TOOL_TODOS + MARKETING_TODOS + PERSONAL_TODOS))
    if [ $TOTAL_TODOS -gt 0 ]; then
        MONEY_RATIO=$((MONEY_TODOS * 100 / TOTAL_TODOS))
        TOOL_RATIO=$((TOOL_TODOS * 100 / TOTAL_TODOS))
        MARKETING_RATIO=$((MARKETING_TODOS * 100 / TOTAL_TODOS))
        PERSONAL_RATIO=$((PERSONAL_TODOS * 100 / TOTAL_TODOS))
        
        echo "🎯 **Fokus-Verteilung:**"
        echo "- Geld: $MONEY_RATIO%"
        echo "- Tool: $TOOL_RATIO%"
        echo "- Marketing: $MARKETING_RATIO%"
        echo "- Persönlich: $PERSONAL_RATIO%"
        echo ""
        
        # Reine Daten ohne Interpretation
        echo "📈 **Raw Data:**"
        echo "- Geld-Ratio: $MONEY_RATIO%"
        echo "- Tool-Ratio: $TOOL_RATIO%"
        echo "- Marketing-Ratio: $MARKETING_RATIO%"
        echo "- Persönlich-Ratio: $PERSONAL_RATIO%"
        echo ""
    fi
fi

echo ""
echo "🕐 **Zeit-Kontext:**"
CURRENT_DAY=$(date '+%A')
CURRENT_HOUR=$(date '+%H:%M')
echo "- Heute: $CURRENT_DAY, $CURRENT_HOUR"

CURRENT_HOUR_NUM=$(date '+%H')
if [ $CURRENT_HOUR_NUM -ge 9 ] && [ $CURRENT_HOUR_NUM -le 17 ]; then
    echo "- ⏰ Arbeitszeit - fokussiere auf produktive Todos"
else
    echo "- 🌙 Freizeit - persönliche Todos sind OK"
fi

echo ""
echo "📈 **Nächste Schritte:**"
echo "- ./commit-and-update.sh \"Nachricht\" - für detaillierte Daten-Sammlung"
echo "- Research-Log prüfen für Pattern-Recognition"
echo "- Chat mit LLM für Interpretationen und Empfehlungen"
