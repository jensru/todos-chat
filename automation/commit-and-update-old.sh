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

# Dashboard-Inhalt lesen und für JavaScript escapen (NACH dem Commit, damit aktuelle Änderungen erfasst werden)
echo "🔧 Escape Dashboard-Inhalt für JavaScript..."
DASHBOARD_CONTENT=$(cat "core/Dashboard - Strukturierte To-do-Übersicht.md" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g' | sed "s/'/\\'/g" | sed 's/`/\\`/g' | sed 's/\$/\\$/g' | tr '\n' '|' | sed 's/|/\\n/g')

# Sidebar-Inhalt lesen und für JavaScript escapen (NACH dem Commit, damit aktuelle Änderungen erfasst werden)
echo "🔧 Escape Sidebar-Inhalt für JavaScript..."
SIDEBAR_CONTENT=$(cat "core/right-sidebar.md" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g' | sed "s/'/\\'/g" | sed 's/`/\\`/g' | sed 's/\$/\\$/g' | tr '\n' '|' | sed 's/|/\\n/g')

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

# Erstelle komplett neue index.html mit modernem Design-System
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
        @import url('https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;600&display=swap');
        
        /* CSS Custom Properties - Google Material 3 Design System */
        :root {
            /* Primary Colors */
            --primary-50: #e8f0fe;
            --primary-500: #0B57D0;
            --primary-600: #0a4bb8;
            --primary-700: #0847a6;
            
            /* Neutral Colors */
            --neutral-50: #f8f9fa;
            --neutral-100: #f1f3f4;
            --neutral-200: #e8eaed;
            --neutral-300: #dadce0;
            --neutral-400: #bdc1c6;
            --neutral-500: #9aa0a6;
            --neutral-600: #80868b;
            --neutral-700: #5f6368;
            --neutral-800: #3c4043;
            --neutral-900: #1f1f1f;
            
            /* Semantic Colors */
            --success-500: #137333;
            --warning-500: #ea8600;
            --error-500: #d93025;
            --info-500: #1a73e8;
            
            /* Background Colors */
            --bg-primary: #ffffff;
            --bg-secondary: #f8f9fa;
            --bg-tertiary: #e8f0fe;
            
            /* Text Colors */
            --text-primary: #1f1f1f;
            --text-secondary: #444746;
            --text-tertiary: #747775;
            --text-disabled: #9aa0a6;
            
            /* Spacing System (8px Grid) */
            --space-1: 4px;
            --space-2: 8px;
            --space-3: 12px;
            --space-4: 16px;
            --space-5: 20px;
            --space-6: 24px;
            --space-8: 32px;
            --space-10: 40px;
            --space-12: 48px;
            --space-16: 64px;
            
            /* Border Radius */
            --radius-sm: 4px;
            --radius-md: 8px;
            --radius-lg: 12px;
            --radius-xl: 16px;
            --radius-2xl: 24px;
            
            /* Shadows */
            --shadow-sm: 0 1px 3px rgba(0,0,0,0.1);
            --shadow-md: 0 4px 12px rgba(0,0,0,0.15);
            --shadow-lg: 0 8px 24px rgba(0,0,0,0.2);
        }
        
        body {
            font-family: Helvetica, Arial, sans-serif;
            max-width: 1400px;
            margin: 0 auto;
            padding: var(--space-6);
            line-height: 1.8;
            color: #4a4a4a;
            background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
            min-height: 100vh;
        }
        
        .main-container {
            display: flex;
            gap: var(--space-8);
            align-items: flex-start;
        }
        
        .main-content {
            flex: 2;
            min-width: 0;
            background: var(--bg-primary);
            border-radius: var(--radius-xl);
            padding: var(--space-8);
            box-shadow: var(--shadow-md);
            border: 1px solid var(--neutral-200);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .main-content:hover {
            box-shadow: var(--shadow-lg);
            transform: translateY(-2px);
        }
        
        .sidebar {
            flex: 1;
            min-width: 300px;
            max-height: calc(100vh - 48px);
            background: var(--bg-secondary);
            border-radius: var(--radius-xl);
            padding: var(--space-6);
            border: 1px solid var(--neutral-200);
            position: sticky;
            top: var(--space-6);
            overflow-y: auto;
            box-shadow: var(--shadow-sm);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .sidebar:hover {
            box-shadow: var(--shadow-md);
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
        
        /* Verbesserte Todo-Styles */
        ul {
            list-style: none;
            padding-left: 0;
        }
        
        li {
            margin: 8px 0;
            padding: 8px 0;
            border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        
        li:last-child {
            border-bottom: none;
        }
        
        /* Prioritäts-Indikatoren */
        .priority-high {
            background: linear-gradient(90deg, #ffebee 0%, transparent 100%);
            border-left: 4px solid #f44336;
            padding-left: 12px;
        }
        
        .priority-medium {
            background: linear-gradient(90deg, #fff3e0 0%, transparent 100%);
            border-left: 4px solid #ff9800;
            padding-left: 12px;
        }
        
        .priority-low {
            background: linear-gradient(90deg, #e8f5e8 0%, transparent 100%);
            border-left: 4px solid #4caf50;
            padding-left: 12px;
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
            .main-container {
                flex-direction: column;
                gap: 16px;
            }
            
            .sidebar {
                position: static;
                max-height: none;
            }
            
            body {
                padding: 16px;
            }
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
