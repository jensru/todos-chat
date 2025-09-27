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

# Erstelle komplett neue index.html mit modernem Design-System
cat > web/index.html << 'EOF'
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
            margin-bottom: var(--space-4);
            border-bottom: 2px solid var(--primary-500);
            padding-bottom: var(--space-3);
            color: var(--text-primary);
            font-weight: 600;
        }
        
        .sidebar h2 {
            font-size: 20px;
            margin-top: var(--space-6);
            margin-bottom: var(--space-3);
            color: var(--text-primary);
            font-weight: 500;
        }
        
        .sidebar h3 {
            font-size: 16px;
            margin-top: var(--space-4);
            margin-bottom: var(--space-2);
            color: var(--text-secondary);
            font-weight: 500;
        }
        
        .sidebar p, .sidebar li {
            font-size: 13px;
            line-height: 18px;
            color: var(--text-tertiary);
        }
        
        .agent-section {
            margin-top: var(--space-8);
            background: var(--bg-tertiary);
            border-radius: var(--radius-lg);
            padding: var(--space-5);
            border: 1px solid var(--primary-500);
            box-shadow: var(--shadow-sm);
            transition: all 0.3s ease;
        }
        
        .agent-section:hover {
            box-shadow: var(--shadow-md);
            transform: translateY(-1px);
        }
        
        .agent-section h3 {
            color: var(--primary-500);
            font-size: 16px;
            margin-bottom: var(--space-3);
            font-weight: 600;
        }
        
        .agent-section p, .agent-section li {
            font-size: 12px;
            line-height: 16px;
            color: var(--text-secondary);
        }
        
        h1 { 
            color: var(--text-primary); 
            border-bottom: 2px solid var(--primary-500); 
            padding-bottom: var(--space-4); 
            font-size: 32px;
            font-weight: 600;
            margin-bottom: var(--space-6);
            background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        h2 { 
            color: var(--text-primary); 
            margin-top: var(--space-8); 
            font-size: 24px;
            font-weight: 500;
            line-height: 32px;
        }
        
        h3 { 
            color: var(--text-secondary); 
            font-size: 16px;
            font-weight: 500;
            line-height: 24px;
        }
        
        p, li {
            color: #4a4a4a;
            font-size: 16px;
            line-height: 1.8;
            font-weight: normal;
        }
        
        .checkbox { 
            margin: var(--space-4) 0; 
            display: flex;
            align-items: flex-start;
            padding: var(--space-2);
            border-radius: var(--radius-md);
            transition: all 0.2s ease;
            list-style: none;
        }
        
        .checkbox:hover {
            background: var(--neutral-50);
        }
        
        .checkbox input[type="checkbox"] { 
            margin-right: var(--space-3); 
            margin-top: 2px;
            width: 20px;
            height: 20px;
            accent-color: var(--primary-500);
            border-radius: var(--radius-sm);
            flex-shrink: 0;
        }
        
        .checkbox label { 
            cursor: pointer; 
            font-size: 16px;
            line-height: 1.8;
            color: #4a4a4a;
            transition: all 0.2s ease;
            list-style: none;
            font-weight: normal;
        }
        
        .checkbox input[type="checkbox"]:checked + label { 
            text-decoration: line-through; 
            opacity: 0.6; 
            color: var(--text-disabled);
        }
        
        blockquote { 
            border-left: 4px solid var(--primary-500); 
            padding-left: var(--space-5); 
            margin: var(--space-6) 0; 
            font-style: italic; 
            color: var(--text-tertiary);
            font-size: 14px;
            line-height: 20px;
            background: var(--bg-tertiary);
            border-radius: var(--radius-md);
            padding: var(--space-4) var(--space-5);
        }
        
        code { 
            background: var(--bg-secondary); 
            padding: var(--space-1) var(--space-2); 
            border-radius: var(--radius-sm); 
            font-family: 'Monaco', 'Consolas', monospace; 
            color: var(--text-primary);
            border: 1px solid var(--neutral-200);
        }
        
        pre { 
            background: var(--bg-secondary); 
            padding: var(--space-4); 
            border-radius: var(--radius-lg); 
            overflow-x: auto; 
            border: 1px solid var(--neutral-200);
            box-shadow: var(--shadow-sm);
        }
        
        table { 
            border-collapse: collapse; 
            width: 100%; 
            margin: var(--space-6) 0; 
            border-radius: var(--radius-lg);
            overflow: hidden;
            box-shadow: var(--shadow-sm);
        }
        
        th, td { 
            border: 1px solid var(--neutral-200); 
            padding: var(--space-4); 
            text-align: left; 
            font-size: 14px;
            line-height: 20px;
        }
        
        th { 
            background-color: var(--bg-secondary); 
            font-weight: 500; 
            color: var(--text-primary);
        }
        
        td {
            color: var(--text-tertiary);
        }
        
        hr { 
            border: none; 
            border-top: 1px solid var(--neutral-200); 
            margin: var(--space-8) 0; 
        }
        
        .emoji { font-size: 1.2em; }
        
        /* Remove bulletpoints from checkbox lists */
        .checkbox {
            list-style: none !important;
        }
        
        .checkbox::before {
            display: none !important;
        }
        
        /* Ensure no bulletpoints appear */
        ul li.checkbox {
            list-style: none !important;
        }
        
        ul li.checkbox::marker {
            display: none !important;
        }
        
        /* Remove all list markers from checkbox items */
        li.checkbox {
            list-style-type: none !important;
        }
        
        li.checkbox::before {
            content: none !important;
        }
        
        /* Global removal of bulletpoints for checkbox lists */
        ul li.checkbox,
        ol li.checkbox {
            list-style: none !important;
            list-style-type: none !important;
        }
        
        /* Remove bulletpoints from ALL list items with checkboxes */
        ul li:has(input[type="checkbox"]),
        ol li:has(input[type="checkbox"]) {
            list-style: none !important;
            list-style-type: none !important;
        }
        
        /* Fallback for browsers that don't support :has() */
        ul li,
        ol li {
            list-style: none;
        }
        
        /* Only show bulletpoints for list items WITHOUT checkboxes */
        ul li:not(:has(input[type="checkbox"])),
        ol li:not(:has(input[type="checkbox"])) {
            list-style: disc;
        }
        
        /* CTA Button Style */
        .cta-button {
            background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%);
            color: #FFFFFF;
            font-family: 'Google Sans', sans-serif;
            font-size: 14px;
            font-weight: 500;
            line-height: 18px;
            padding: var(--space-3) var(--space-6);
            border-radius: var(--radius-lg);
            border: none;
            cursor: pointer;
            margin: var(--space-4) 0;
            box-shadow: var(--shadow-sm);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .cta-button:hover {
            background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%);
            box-shadow: var(--shadow-md);
            transform: translateY(-2px);
        }
        
        /* Emphasis text */
        strong {
            color: var(--text-secondary);
            font-weight: 500;
        }
        
        /* Links */
        a {
            color: var(--primary-500);
            text-decoration: none;
            transition: all 0.2s ease;
        }
        
        a:hover {
            text-decoration: underline;
            color: var(--primary-600);
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
            .main-container {
                flex-direction: column;
                gap: var(--space-4);
            }
            
            .main-content {
                width: 100%;
                order: 2;
                padding: var(--space-4);
            }
            
            .sidebar {
                width: 100%;
                order: 1;
                max-height: 200px;
                overflow-y: auto;
                padding: var(--space-4);
            }
            
            body {
                padding: var(--space-4);
            }
        }
        
        @media (min-width: 769px) and (max-width: 1024px) {
            .main-content {
                flex: 0 0 65%;
            }
            
            .sidebar {
                flex: 0 0 35%;
            }
        }
        
        @media (min-width: 1025px) {
            .main-content {
                flex: 0 0 70%;
            }
            
            .sidebar {
                flex: 0 0 30%;
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
        const sidebarContent = `$SIDEBAR_CONTENT`;

               // Keine Agenten mehr
               let agentContent = '';

        // Dashboard Markdown Content
        const markdownContent = `$DASHBOARD_CONTENT`;

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
        const todayHistoryHtml = `$TODAY_HISTORY_HTML`;
        if (todayHistoryHtml) {
            const contentDiv = document.getElementById('content');
            contentDiv.innerHTML += todayHistoryHtml;
        }
        
        // Füge Tagesziele-Fortschritt hinzu
        const dailyProgressHtml = `$DAILY_PROGRESS_HTML`;
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

echo "✅ Website mit modernem Design aktualisiert!"
echo "🌐 Öffne web/index.html im Browser um die Änderungen zu sehen"
