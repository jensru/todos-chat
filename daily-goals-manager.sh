#!/bin/bash

# Daily Goals Manager für Tagesziele & Fokus-Tracking
# Usage: ./daily-goals-manager.sh [command] [options]

TASK_HISTORY_FILE="task-history.json"
DASHBOARD_FILE="Dashboard - Strukturierte To-do-Übersicht.md"
SIDEBAR_FILE="right-sidebar.md"

# Funktionen
log_goal_change() {
    local change_type="$1"
    local old_value="$2"
    local reason="$3"
    local current_date=$(date +"%Y-%m-%d")
    local current_time=$(date +"%Y-%m-%dT%H:%M:%S")
    
    if command -v jq &> /dev/null && [ -f "$TASK_HISTORY_FILE" ]; then
        # Erstelle Änderungs-Eintrag
        local change_entry=$(cat << EOF
{
  "timestamp": "$current_time",
  "change_type": "$change_type",
  "old_value": $old_value,
  "new_value": null,
  "reason": "$reason",
  "impact": "medium"
}
EOF
)
        
        # Füge Änderung zur Historie hinzu
        jq --argjson change "$change_entry" \
           --arg date "$current_date" \
           '.goal_change_history[$date] += [$change]' \
           "$TASK_HISTORY_FILE" > "${TASK_HISTORY_FILE}.tmp" && \
        mv "${TASK_HISTORY_FILE}.tmp" "$TASK_HISTORY_FILE"
        
        echo "📝 Änderung dokumentiert: $change_type"
    fi
}

set_daily_goals() {
    local current_date=$(date +"%Y-%m-%d")
    local current_time=$(date +"%Y-%m-%dT%H:%M:%S")
    
    echo "🎯 Setze Tagesziele für $current_date"
    echo "=================================="
    
    # Prüfe ob bereits Ziele existieren
    local existing_goals=""
    if command -v jq &> /dev/null && [ -f "$TASK_HISTORY_FILE" ]; then
        existing_goals=$(jq -r ".daily_goals.\"$current_date\"" "$TASK_HISTORY_FILE")
    fi
    
    if [ "$existing_goals" != "null" ] && [ -n "$existing_goals" ]; then
        echo "⚠️ Tagesziele existieren bereits:"
        echo "$existing_goals" | jq -r '.main_goal, .focus, .success_criteria' | sed 's/^/  /'
        echo ""
        read -p "Möchtest du sie überschreiben? (y/N): " overwrite
        if [ "$overwrite" != "y" ] && [ "$overwrite" != "Y" ]; then
            echo "❌ Abgebrochen"
            return
        fi
        
        # Änderung dokumentieren
        log_goal_change "goal_update" "$existing_goals" "Tagesziele überschrieben"
    fi
    
    # Hauptziel eingeben
    read -p "Hauptziel heute: " main_goal
    read -p "Fokus heute: " focus
    read -p "Erfolgskriterien: " success_criteria
    
    # Fokus-Bereiche definieren
    echo ""
    echo "📊 Fokus-Bereiche definieren:"
    read -p "Geld-Tasks Ziel (Anzahl): " geld_target
    read -p "Tool-Tasks Ziel (Anzahl): " tool_target
    read -p "Marketing-Tasks Ziel (Anzahl): " marketing_target
    
    # JSON-Update mit jq
    if command -v jq &> /dev/null; then
        # Erstelle neue Tagesziele-Struktur
        local goals_json=$(cat << EOF
{
  "main_goal": "$main_goal",
  "focus": "$focus", 
  "success_criteria": "$success_criteria",
  "goals_set_at": "$current_time",
  "goals_updated_at": "$current_time",
  "focus_areas": {
    "geld": {
      "priority": "high",
      "target_tasks": $geld_target,
      "completed_tasks": 0
    },
    "tool_first": {
      "priority": "high",
      "target_tasks": $tool_target, 
      "completed_tasks": 0
    },
    "marketing": {
      "priority": "medium",
      "target_tasks": $marketing_target,
      "completed_tasks": 0
    }
  },
  "tasks_completed": []
}
EOF
)
        
        # Füge Tagesziele zur Historie hinzu
        jq --argjson goals "$goals_json" \
           --arg date "$current_date" \
           '.daily_goals[$date] = $goals' \
           "$TASK_HISTORY_FILE" > "${TASK_HISTORY_FILE}.tmp" && \
        mv "${TASK_HISTORY_FILE}.tmp" "$TASK_HISTORY_FILE"
        
        echo "✅ Tagesziele gesetzt!"
    else
        echo "❌ jq nicht verfügbar - verwende einfache Methode"
        echo "[$current_time] Tagesziele: $main_goal | Fokus: $focus" >> "daily-goals-simple.txt"
    fi
}

update_task_progress() {
    local current_date=$(date +"%Y-%m-%d")
    
    echo "📊 Aktualisiere Task-Fortschritt für $current_date..."
    
    if command -v jq &> /dev/null && [ -f "$TASK_HISTORY_FILE" ]; then
        # Zähle erledigte Tasks nach Kategorie
        local geld_completed=$(jq -r ".daily_goals.\"$current_date\".tasks_completed[] | select(.category == \"money\") | .id" "$TASK_HISTORY_FILE" | wc -l)
        local tool_completed=$(jq -r ".daily_goals.\"$current_date\".tasks_completed[] | select(.category == \"tool\") | .id" "$TASK_HISTORY_FILE" | wc -l)
        local marketing_completed=$(jq -r ".daily_goals.\"$current_date\".tasks_completed[] | select(.category == \"marketing\") | .id" "$TASK_HISTORY_FILE" | wc -l)
        
        # Aktualisiere Fortschritt
        jq --arg date "$current_date" \
           --argjson geld "$geld_completed" \
           --argjson tool "$tool_completed" \
           --argjson marketing "$marketing_completed" \
           '.daily_goals[$date].focus_areas.geld.completed_tasks = $geld |
            .daily_goals[$date].focus_areas.tool_first.completed_tasks = $tool |
            .daily_goals[$date].focus_areas.marketing.completed_tasks = $marketing' \
           "$TASK_HISTORY_FILE" > "${TASK_HISTORY_FILE}.tmp" && \
        mv "${TASK_HISTORY_FILE}.tmp" "$TASK_HISTORY_FILE"
        
        echo "✅ Fortschritt aktualisiert: Geld=$geld_completed, Tool=$tool_completed, Marketing=$marketing_completed"
    else
        echo "❌ jq nicht verfügbar oder Datei nicht gefunden"
    fi
}

show_daily_progress() {
    local current_date=$(date +"%Y-%m-%d")
    
    echo "📈 **Tagesfortschritt für $current_date:**"
    echo "=================================="
    
    if command -v jq &> /dev/null && [ -f "$TASK_HISTORY_FILE" ]; then
        local daily_goals=$(jq -r ".daily_goals.\"$current_date\"" "$TASK_HISTORY_FILE")
        
        if [ "$daily_goals" != "null" ]; then
            echo "🎯 **Tagesziele:**"
            echo "$daily_goals" | jq -r '.main_goal, .focus, .success_criteria' | sed 's/^/  /'
            echo ""
            
            echo "📊 **Fokus-Bereiche:**"
            echo "$daily_goals" | jq -r '.focus_areas | to_entries[] | "  \(.key): \(.value.completed_tasks)/\(.value.target_tasks) (\(.value.priority))"'
            echo ""
            
            # Fortschritts-Balken
            echo "📈 **Fortschritts-Visualisierung:**"
            echo "$daily_goals" | jq -r '.focus_areas | to_entries[] | 
                "  \(.key): " + 
                (if .value.completed_tasks >= .value.target_tasks then "✅ ERREICHT" 
                 else "\(.value.completed_tasks)/\(.value.target_tasks)" end)'
        else
            echo "ℹ️ Keine Tagesziele für heute gesetzt"
            echo "Verwende: $0 set-goals"
        fi
    else
        echo "❌ jq nicht verfügbar oder Datei nicht gefunden"
    fi
}

generate_progress_html() {
    local current_date=$(date +"%Y-%m-%d")
    local progress_html=""
    
    if command -v jq &> /dev/null && [ -f "$TASK_HISTORY_FILE" ]; then
        local daily_goals=$(jq -r ".daily_goals.\"$current_date\"" "$TASK_HISTORY_FILE")
        
        if [ "$daily_goals" != "null" ]; then
            local main_goal=$(echo "$daily_goals" | jq -r '.main_goal')
            local focus=$(echo "$daily_goals" | jq -r '.focus')
            
            progress_html="<div class='daily-progress'><h3>🎯 Heutige Ziele:</h3>"
            progress_html+="<p><strong>Hauptziel:</strong> $main_goal</p>"
            progress_html+="<p><strong>Fokus:</strong> $focus</p>"
            
            # Fokus-Bereiche
            progress_html+="<h4>📊 Fortschritt:</h4><ul>"
            local focus_areas=$(echo "$daily_goals" | jq -r '.focus_areas | to_entries[] | "\(.key): \(.value.completed_tasks)/\(.value.target_tasks)"')
            while IFS= read -r line; do
                progress_html+="<li>$line</li>"
            done <<< "$focus_areas"
            progress_html+="</ul></div>"
        fi
    fi
    
    echo "$progress_html"
}

show_change_history() {
    local current_date=$(date +"%Y-%m-%d")
    
    echo "📋 **Ziel-/Fokus-Änderungs-Historie für $current_date:**"
    echo "=============================================="
    
    if command -v jq &> /dev/null && [ -f "$TASK_HISTORY_FILE" ]; then
        local change_history=$(jq -r ".goal_change_history.\"$current_date\"" "$TASK_HISTORY_FILE")
        
        if [ "$change_history" != "null" ] && [ "$change_history" != "[]" ]; then
            echo "$change_history" | jq -r '.[] | 
                "🕐 \(.timestamp) - \(.change_type | ascii_upcase)" +
                "\n   Grund: \(.reason)" +
                "\n   Impact: \(.impact)" +
                "\n   ---"'
        else
            echo "ℹ️ Keine Änderungen für heute dokumentiert"
        fi
    else
        echo "❌ jq nicht verfügbar oder Datei nicht gefunden"
    fi
}

show_full_history() {
    echo "📚 **Vollständige Ziel-/Fokus-Historie:**"
    echo "====================================="
    
    if command -v jq &> /dev/null && [ -f "$TASK_HISTORY_FILE" ]; then
        jq -r '.goal_change_history | to_entries[] | 
            "📅 \(.key):" +
            (.value | map("  🕐 \(.timestamp) - \(.change_type): \(.reason)") | join("\n")) +
            "\n---"' "$TASK_HISTORY_FILE"
    else
        echo "❌ jq nicht verfügbar oder Datei nicht gefunden"
    fi
}

# Hauptlogik
case "$1" in
    "set-goals")
        set_daily_goals
        ;;
    "update-progress")
        update_task_progress
        ;;
    "show-progress")
        show_daily_progress
        ;;
    "generate-html")
        generate_progress_html
        ;;
    "show-changes")
        show_change_history
        ;;
    "show-full-history")
        show_full_history
        ;;
    "help")
        echo "Daily Goals Manager"
        echo "=================="
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  set-goals         - Setze Tagesziele für heute"
        echo "  update-progress   - Aktualisiere Task-Fortschritt"
        echo "  show-progress     - Zeige heutigen Fortschritt"
        echo "  show-changes      - Zeige heutige Änderungen"
        echo "  show-full-history - Zeige vollständige Historie"
        echo "  generate-html     - Generiere HTML für Website"
        echo "  help             - Zeige diese Hilfe"
        ;;
    *)
        echo "❌ Unbekannter Befehl: $1"
        echo "Verwende '$0 help' für Hilfe"
        exit 1
        ;;
esac
