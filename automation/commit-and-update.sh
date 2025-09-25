#!/bin/bash

# Git commit mit automatischem Website-Update
# Usage: ./commit-and-update.sh "Commit message"

if [ $# -eq 0 ]; then
    echo "Usage: $0 \"Commit message\""
    exit 1
fi

COMMIT_MSG="$1"

# Datum automatisch aktualisieren
echo "🕐 Aktualisiere Datum..."
./automation/update-dates.sh

# Task-Historie synchronisieren und Dashboard bereinigen
echo "🔄 Synchronisiere Task-Historie..."
if [ -f "automation/task-history-manager.sh" ]; then
    ./automation/task-history-manager.sh sync
    echo "🧹 Bereinige Dashboard..."
    ./automation/task-history-manager.sh clean
fi

# Tagesziele-Fortschritt aktualisieren
echo "📊 Aktualisiere Tagesziele-Fortschritt..."
if [ -f "automation/daily-goals-manager.sh" ]; then
    ./automation/daily-goals-manager.sh update-progress
fi

# Änderungen dokumentieren für Chat-First Research
echo "📊 Dokumentiere Änderungen für Feature-Research..."
./automation/document-changes.sh "$COMMIT_MSG"

# Tracking-System aktualisieren (Rohdaten sammeln)
echo "📈 Aktualisiere Tracking-System..."
./automation/update-tracking.sh "$COMMIT_MSG"

# Mistral-basierte Automatisierung (standardmäßig aktiviert)
echo "🤖 Mistral-basierte Analyse..."
./automation/mistral-research-update.sh "$COMMIT_MSG"
echo "📊 Mistral Todo-Kategorisierung..."
./automation/mistral-todo-categorizer.sh

# Log-Rotation (behält nur die letzten 20 Mistral-Einträge)
echo "🔄 Führe Log-Rotation durch..."
./automation/log-rotation.sh

# Git commit
git add .
git commit -m "$COMMIT_MSG"

# Website automatisch aktualisieren
echo "🔄 Aktualisiere Website..."

# Website automatisch aktualisieren - FUNKTIONIERENDE Methode
echo "🔄 Aktualisiere Website automatisch..."

# Dashboard-Inhalt lesen (NACH dem Commit, damit aktuelle Änderungen erfasst werden)
DASHBOARD_CONTENT=$(cat "core/Dashboard - Strukturierte To-do-Übersicht.md")

# Sidebar-Inhalt lesen (NACH dem Commit, damit aktuelle Änderungen erfasst werden)
SIDEBAR_CONTENT=$(cat "core/right-sidebar.md")

# Heutige Task-Historie generieren
TODAY_HISTORY_HTML=""
if [ -f "automation/task-history-manager.sh" ]; then
    TODAY_HISTORY_HTML=$(./automation/task-history-manager.sh generate-html 2>/dev/null || echo "")
fi

# Tagesziele-Fortschritt generieren
DAILY_PROGRESS_HTML=""
if [ -f "automation/daily-goals-manager.sh" ]; then
    DAILY_PROGRESS_HTML=$(./automation/daily-goals-manager.sh generate-html 2>/dev/null || echo "")
fi

# Keine Agenten mehr - einfache Version

# Erstelle komplett neue index.html
cat > web/index.html << EOF
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - To-do Übersicht</title>
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <style>
        /* Import Google Sans */
        @import url('https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500&display=swap');
        
        body {
            font-family: 'Google Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 1400px;
            margin: 0 auto;
            padding: 24px;
            line-height: 1.6;
            color: #1F1F1F;
            background-color: #FFFFFF;
        }
        
        .main-container {
            display: flex;
            gap: 32px;
            align-items: flex-start;
        }
        
        .main-content {
            flex: 2;
            min-width: 0;
        }
        
        .sidebar {
            flex: 1;
            min-width: 300px;
            max-height: calc(100vh - 48px);
            background: #f8f9fa;
            border-radius: 12px;
            padding: 24px;
            border: 1px solid rgba(0,0,0,0.12);
            position: sticky;
            top: 24px;
            overflow-y: auto;
        }
        
        .sidebar h1 {
            font-size: 24px;
            margin-bottom: 16px;
            border-bottom: 2px solid #0B57D0;
            padding-bottom: 12px;
        }
        
        .sidebar h2 {
            font-size: 20px;
            margin-top: 24px;
            margin-bottom: 12px;
        }
        
        .sidebar h3 {
            font-size: 16px;
            margin-top: 16px;
            margin-bottom: 8px;
        }
        
        .sidebar p, .sidebar li {
            font-size: 13px;
            line-height: 18px;
        }
        
        .agent-section {
            margin-top: 32px;
            background: #e8f0fe;
            border-radius: 12px;
            padding: 20px;
            border: 1px solid #0B57D0;
        }
        
        .agent-section h3 {
            color: #0B57D0;
            font-size: 16px;
            margin-bottom: 12px;
        }
        
        .agent-section p, .agent-section li {
            font-size: 12px;
            line-height: 16px;
            color: #444746;
        }
        
        h1 { 
            color: #1F1F1F; 
            border-bottom: 2px solid #0B57D0; 
            padding-bottom: 16px; 
            font-size: 32px;
            font-weight: 500;
            margin-bottom: 24px;
        }
        
        h2 { 
            color: #1F1F1F; 
            margin-top: 32px; 
            font-size: 24px;
            font-weight: 500;
            line-height: 32px;
        }
        
        h3 { 
            color: #444746; 
            font-size: 16px;
            font-weight: 500;
            line-height: 24px;
        }
        
        p, li {
            color: #1F1F1F;
            font-size: 14px;
            line-height: 20px;
            font-weight: 400;
        }
        
        .checkbox { 
            margin: 12px 0; 
            display: flex;
            align-items: center;
        }
        
        .checkbox input[type="checkbox"] { 
            margin-right: 8px; 
            width: 16px;
            height: 16px;
            accent-color: #0B57D0;
        }
        
        .checkbox label { 
            cursor: pointer; 
            font-size: 14px;
            line-height: 20px;
            color: #3C4043;
        }
        
        .checkbox input[type="checkbox"]:checked + label { 
            text-decoration: line-through; 
            opacity: 0.6; 
        }
        
        blockquote { 
            border-left: 4px solid #0B57D0; 
            padding-left: 20px; 
            margin: 24px 0; 
            font-style: italic; 
            color: #747775;
            font-size: 14px;
            line-height: 20px;
        }
        
        code { 
            background: #f8f9fa; 
            padding: 2px 6px; 
            border-radius: 3px; 
            font-family: 'Monaco', 'Consolas', monospace; 
            color: #1F1F1F;
        }
        
        pre { 
            background: #f8f9fa; 
            padding: 16px; 
            border-radius: 12px; 
            overflow-x: auto; 
            border: 1px solid rgba(0,0,0,0.12);
        }
        
        table { 
            border-collapse: collapse; 
            width: 100%; 
            margin: 24px 0; 
            border-radius: 12px;
            overflow: hidden;
        }
        
        th, td { 
            border: 1px solid rgba(0,0,0,0.12); 
            padding: 16px; 
            text-align: left; 
            font-size: 14px;
            line-height: 20px;
        }
        
        th { 
            background-color: #f8f9fa; 
            font-weight: 500; 
            color: #1F1F1F;
        }
        
        td {
            color: #747775;
        }
        
        hr { 
            border: none; 
            border-top: 1px solid rgba(0,0,0,0.12); 
            margin: 32px 0; 
        }
        
        .emoji { font-size: 1.2em; }
        
        /* CTA Button Style */
        .cta-button {
            background-color: #0B57D0;
            color: #FFFFFF;
            font-family: 'Google Sans', sans-serif;
            font-size: 14px;
            font-weight: 500;
            line-height: 18px;
            padding: 12px 24px;
            border-radius: 12px;
            border: none;
            cursor: pointer;
            margin: 16px 0;
        }
        
        .cta-button:hover {
            background-color: #0a4bb8;
        }
        
        /* Emphasis text */
        strong {
            color: #444746;
            font-weight: 500;
        }
        
        /* Links */
        a {
            color: #0B57D0;
            text-decoration: none;
        }
        
        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="main-container">
        <div class="main-content">
            <div id="content"></div>
        </div>
        <div class="sidebar">
            <div id="sidebar-content"></div>
        </div>
    </div>

    <script>
        // Sidebar Markdown Content
        const sidebarContent = \`$SIDEBAR_CONTENT\`;

               // Keine Agenten mehr
               let agentContent = '';

        // Dashboard Markdown Content
        const markdownContent = \`$DASHBOARD_CONTENT\`;

        // Configure marked options
        marked.setOptions({
            breaks: true,
            gfm: true
        });

        // Convert markdown to HTML
        const htmlContent = marked.parse(markdownContent);
        const sidebarHtmlContent = marked.parse(sidebarContent);
        
        // Insert into page
        document.getElementById('content').innerHTML = htmlContent;
        document.getElementById('sidebar-content').innerHTML = sidebarHtmlContent + agentContent;
        
        // Füge heutige Task-Historie hinzu
        const todayHistoryHtml = \`$TODAY_HISTORY_HTML\`;
        if (todayHistoryHtml) {
            const contentDiv = document.getElementById('content');
            contentDiv.innerHTML += todayHistoryHtml;
        }
        
        // Füge Tagesziele-Fortschritt hinzu
        const dailyProgressHtml = \`$DAILY_PROGRESS_HTML\`;
        if (dailyProgressHtml) {
            const contentDiv = document.getElementById('content');
            contentDiv.innerHTML += dailyProgressHtml;
        }

        // Add interactive checkboxes
        document.addEventListener('DOMContentLoaded', function() {
            const checkboxes = document.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                // Load saved state
                const savedState = localStorage.getItem('checkbox_' + checkbox.parentNode.textContent.trim());
                if (savedState === 'true') {
                    checkbox.checked = true;
                }
                
                // Save state on change
                checkbox.addEventListener('change', function() {
                    localStorage.setItem('checkbox_' + this.parentNode.textContent.trim(), this.checked);
                });
            });
        });
    </script>
</body>
</html>
EOF

echo "✅ Website aktualisiert!"
echo "🌐 Öffne web/index.html im Browser um die Änderungen zu sehen"
