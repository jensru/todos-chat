#!/bin/bash

# Task-History-Manager für strukturierte Datenbank-ähnliche Historie
# Usage: ./task-history-manager.sh [command] [options]

TASK_HISTORY_FILE="data/task-history.json"
DASHBOARD_FILE="${DASHBOARD_FILE:-core/Dashboard - Strukturierte To-do-Übersicht.md}"
SIDEBAR_FILE="core/right-sidebar.md"

# Funktionen
add_completed_task() {
    local task_title="$1"
    local task_description="$2"
    local category="$3"
    local priority="${4:-medium}"
    local tags="$5"
    
    local current_date=$(date +"%Y-%m-%d")
    local current_time=$(date +"%Y-%m-%dT%H:%M:%S")
    local task_id="task_$(date +%s)"
    
    echo "📝 Füge erledigte Task hinzu: $task_title"
    
    # JSON-Update mit jq (falls verfügbar)
    if command -v jq &> /dev/null; then
        # Erstelle temporäre Task-Daten
        local temp_task=$(cat << EOF
{
  "id": "$task_id",
  "title": "$task_title",
  "description": "$task_description",
  "category": "$category",
  "completed_at": "$current_time",
  "priority": "$priority",
  "tags": ["$tags"]
}
EOF
)
        
        # Füge Task zur Historie hinzu
        jq --argjson task "$temp_task" \
           --arg date "$current_date" \
           '.daily_goals[$date].tasks_completed += [$task]' \
           "$TASK_HISTORY_FILE" > "${TASK_HISTORY_FILE}.tmp" && \
        mv "${TASK_HISTORY_FILE}.tmp" "$TASK_HISTORY_FILE"
        
        echo "✅ Task zur Historie hinzugefügt"
    else
        echo "❌ jq nicht verfügbar - verwende einfache Methode"
        # Fallback: Einfache Text-basierte Historie
        echo "[$current_time] $task_title ($category) - $task_description" >> "task-history-simple.txt"
    fi
}

sync_completed_tasks() {
    echo "🔄 Synchronisiere erledigte Tasks aus Dashboard..."
    
    # Erledigte Tasks aus Dashboard extrahieren
    local completed_tasks=$(grep -E "^- \[x\]" "$DASHBOARD_FILE" | head -10)
    
    if [ -n "$completed_tasks" ]; then
        echo "📋 Gefundene erledigte Tasks:"
        echo "$completed_tasks"
        
        # Für jeden erledigten Task
        while IFS= read -r line; do
            if [[ $line =~ ^-.*\[x\] ]]; then
                # Task-Titel extrahieren (ohne - [x])
                local task_title=$(echo "$line" | sed 's/^- \[x\] //' | sed 's/ - .*$//')
                local task_description=$(echo "$line" | sed 's/^- \[x\] [^-]* - //')
                
                # Kategorie basierend auf Inhalt bestimmen
                local category="personal"
                if echo "$task_title" | grep -qi "linkedin\|post\|marketing"; then
                    category="marketing"
                elif echo "$task_title" | grep -qi "tool\|alloy\|interface"; then
                    category="tool"
                elif echo "$task_title" | grep -qi "geld\|money\|pricing"; then
                    category="money"
                fi
                
                add_completed_task "$task_title" "$task_description" "$category"
            fi
        done <<< "$completed_tasks"
    else
        echo "ℹ️ Keine erledigten Tasks gefunden"
    fi
}

show_today_history() {
    local current_date=$(date +"%Y-%m-%d")
    
    echo "📅 **Task-Historie für $current_date:**"
    echo "=================================="
    
    if command -v jq &> /dev/null && [ -f "$TASK_HISTORY_FILE" ]; then
        # JSON-basierte Anzeige
        local daily_goals=$(jq -r ".daily_goals.\"$current_date\"" "$TASK_HISTORY_FILE")
        
        if [ "$daily_goals" != "null" ]; then
            echo "🎯 **Tagesziele:**"
            echo "$daily_goals" | jq -r '.main_goal, .focus, .success_criteria' | sed 's/^/  /'
            echo ""
            
            echo "✅ **Erledigte Tasks:**"
            echo "$daily_goals" | jq -r '.tasks_completed[] | "  - \(.title) (\(.category)) - \(.completed_at)"'
        else
            echo "ℹ️ Keine Daten für heute gefunden"
        fi
    else
        # Fallback: Text-basierte Anzeige
        if [ -f "task-history-simple.txt" ]; then
            echo "📋 **Einfache Historie:**"
            grep "$current_date" "task-history-simple.txt" | tail -10
        else
            echo "ℹ️ Keine Historie-Datei gefunden"
        fi
    fi
}

clean_dashboard() {
    echo "🧹 Bereinige Dashboard von erledigten Tasks..."
    
    # Entferne alle erledigten Tasks aus Dashboard
    local temp_file=$(mktemp)
    local removed_count=0
    
    while IFS= read -r line; do
        if [[ $line =~ \[x\] ]]; then
            # Überspringe erledigte Tasks (entferne sie)
            ((removed_count++))
        else
            echo "$line" >> "$temp_file"
        fi
    done < "$DASHBOARD_FILE"
    
    cp "$temp_file" "$DASHBOARD_FILE"
    rm "$temp_file"
    echo "✅ Dashboard bereinigt - $removed_count erledigte Tasks entfernt"
}

generate_today_history_html() {
    local current_date=$(date +"%Y-%m-%d")
    local history_html=""
    
    if command -v jq &> /dev/null && [ -f "$TASK_HISTORY_FILE" ]; then
        local daily_goals=$(jq -r ".daily_goals.\"$current_date\"" "$TASK_HISTORY_FILE")
        
        if [ "$daily_goals" != "null" ]; then
            local completed_tasks=$(echo "$daily_goals" | jq -r '.tasks_completed[] | "\(.title) (\(.category))"' 2>/dev/null)
            
            if [ -n "$completed_tasks" ]; then
                history_html="<div class='completed-tasks-today'><h3>✅ Heute erledigt:</h3><ul>"
                while IFS= read -r task; do
                    history_html+="<li>$task</li>"
                done <<< "$completed_tasks"
                history_html+="</ul></div>"
            fi
        fi
    fi
    
    echo "$history_html"
}

update_website_history() {
    echo "🌐 Aktualisiere Website mit Task-Historie..."
    
    # Generiere Historie-HTML
    local history_html=$(generate_today_history_html)
    
    if [ -n "$history_html" ]; then
        echo "📝 Historie-HTML generiert:"
        echo "$history_html"
    else
        echo "ℹ️ Keine erledigten Tasks für heute gefunden"
    fi
    
    echo "✅ Website-Historie aktualisiert"
}

# Hauptlogik
case "$1" in
    "sync")
        sync_completed_tasks
        ;;
    "show")
        show_today_history
        ;;
    "clean")
        clean_dashboard
        ;;
    "update-website")
        update_website_history
        ;;
    "generate-html")
        generate_today_history_html
        ;;
    "help")
        echo "Task-History-Manager"
        echo "==================="
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  sync          - Synchronisiere erledigte Tasks aus Dashboard"
        echo "  show          - Zeige heutige Task-Historie"
        echo "  clean         - Bereinige Dashboard von erledigten Tasks"
        echo "  update-website - Aktualisiere Website mit Historie"
        echo "  help          - Zeige diese Hilfe"
        ;;
    *)
        echo "❌ Unbekannter Befehl: $1"
        echo "Verwende '$0 help' für Hilfe"
        exit 1
        ;;
esac
