#!/bin/bash

# Automatische Dashboard-Generierung mit korrektem Escaping
# Lädt das aktuelle Dashboard und generiert eine funktionierende index.html

DASHBOARD_FILE="core/Dashboard - Strukturierte To-do-Übersicht.md"
SIDEBAR_FILE="core/right-sidebar.md"
OUTPUT_FILE="web/index.html"

echo "🔄 Generiere Dashboard aus aktuellem Markdown..."

# Prüfe ob Dateien existieren
if [ ! -f "$DASHBOARD_FILE" ]; then
    echo "❌ Dashboard-Datei nicht gefunden: $DASHBOARD_FILE"
    exit 1
fi

if [ ! -f "$SIDEBAR_FILE" ]; then
    echo "❌ Sidebar-Datei nicht gefunden: $SIDEBAR_FILE"
    exit 1
fi

# Erstelle temporäre Dateien für Escaping
echo "📖 Lade und escape Dashboard-Inhalt..."
cat "$DASHBOARD_FILE" > temp_dashboard.md

echo "📖 Lade und escape Sidebar-Inhalt..."
cat "$SIDEBAR_FILE" > temp_sidebar.md

# Erstelle HTML-Template
echo "🔧 Erstelle HTML-Template..."

cat > "$OUTPUT_FILE" << 'EOF'
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
        
        .container {
            display: flex;
            gap: 32px;
            min-height: 100vh;
        }
        
        .main-content {
            flex: 1;
            background: #FFFFFF;
            border-radius: 12px;
            padding: 32px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .sidebar {
            width: 300px;
            background: #F8F9FA;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        h1 {
            color: #1F1F1F;
            font-size: 32px;
            font-weight: 500;
            margin-bottom: 24px;
            border-bottom: 3px solid #4285F4;
            padding-bottom: 12px;
        }
        
        h2 {
            color: #1F1F1F;
            font-size: 24px;
            font-weight: 500;
            margin-top: 32px;
            margin-bottom: 16px;
        }
        
        h3 {
            color: #1F1F1F;
            font-size: 20px;
            font-weight: 500;
            margin-top: 24px;
            margin-bottom: 12px;
        }
        
        h4 {
            color: #1F1F1F;
            font-size: 18px;
            font-weight: 500;
            margin-top: 20px;
            margin-bottom: 10px;
        }
        
        ul {
            margin: 16px 0;
            padding-left: 24px;
        }
        
        li {
            margin: 8px 0;
            line-height: 1.5;
        }
        
        input[type="checkbox"] {
            margin-right: 8px;
            transform: scale(1.2);
            accent-color: #4285F4;
        }
        
        .completed {
            text-decoration: line-through;
            opacity: 0.6;
        }
        
        .priority-high {
            color: #EA4335;
            font-weight: 500;
        }
        
        .priority-medium {
            color: #FBBC04;
            font-weight: 500;
        }
        
        .priority-low {
            color: #34A853;
            font-weight: 500;
        }
        
        .timeline-section {
            background: #F8F9FA;
            border-left: 4px solid #4285F4;
            padding: 16px;
            margin: 16px 0;
            border-radius: 0 8px 8px 0;
        }
        
        .week-header {
            background: #4285F4;
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-weight: 500;
            margin: 16px 0 8px 0;
        }
        
        .day-header {
            background: #E8F0FE;
            color: #1F1F1F;
            padding: 8px 12px;
            border-radius: 6px;
            font-weight: 500;
            margin: 12px 0 6px 0;
        }
        
        code {
            background: #F1F3F4;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 14px;
        }
        
        pre {
            background: #F1F3F4;
            padding: 16px;
            border-radius: 8px;
            overflow-x: auto;
            margin: 16px 0;
        }
        
        blockquote {
            border-left: 4px solid #4285F4;
            padding-left: 16px;
            margin: 16px 0;
            color: #5F6368;
            font-style: italic;
        }
        
        a {
            color: #4285F4;
            text-decoration: none;
        }
        
        a:hover {
            text-decoration: underline;
        }
        
        .sidebar h3 {
            color: #1F1F1F;
            font-size: 18px;
            margin-bottom: 16px;
            border-bottom: 2px solid #E8F0FE;
            padding-bottom: 8px;
        }
        
        .sidebar ul {
            list-style: none;
            padding-left: 0;
        }
        
        .sidebar li {
            padding: 8px 0;
            border-bottom: 1px solid #E8F0FE;
        }
        
        .sidebar li:last-child {
            border-bottom: none;
        }
        
        @media (max-width: 768px) {
            .container {
                flex-direction: column;
            }
            
            .sidebar {
                width: 100%;
            }
            
            body {
                padding: 16px;
            }
            
            .main-content {
                padding: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="main-content">
            <div id="dashboard-content"></div>
        </div>
        
        <div class="sidebar">
            <div id="sidebar-content"></div>
        </div>
    </div>

    <script>
        // Lade Dashboard-Inhalt über fetch
        async function loadDashboard() {
            try {
                const dashboardResponse = await fetch('../core/Dashboard - Strukturierte To-do-Übersicht.md');
                const sidebarResponse = await fetch('../core/right-sidebar.md');
                
                if (!dashboardResponse.ok || !sidebarResponse.ok) {
                    throw new Error('Fehler beim Laden der Markdown-Dateien');
                }
                
                const dashboardContent = await dashboardResponse.text();
                const sidebarContent = await sidebarResponse.text();
                
                // Konvertiere Markdown zu HTML
                function convertMarkdownToHtml(markdown) {
                    // Erweitere marked.js für bessere Darstellung
                    marked.setOptions({
                        breaks: true,
                        gfm: true,
                        sanitize: false
                    });
                    
                    let html = marked.parse(markdown);
                    
                    // Füge spezielle Klassen für bessere Darstellung hinzu
                    html = html.replace(/<h1>/g, '<h1 class="main-title">');
                    html = html.replace(/<h2>/g, '<h2 class="section-title">');
                    html = html.replace(/<h3>/g, '<h3 class="subsection-title">');
                    html = html.replace(/<h4>/g, '<h4 class="subsubsection-title">');
                    
                    // Füge Timeline-Klassen hinzu
                    html = html.replace(/### \*\*📅 WOCHE \d+:/g, '<div class="week-header">$&</div>');
                    html = html.replace(/#### \*\*\w+, \d+\. \w+\*\*/g, '<div class="day-header">$&</div>');
                    
                    return html;
                }

                // Lade Dashboard
                document.getElementById('dashboard-content').innerHTML = convertMarkdownToHtml(dashboardContent);
                
                // Lade Sidebar
                document.getElementById('sidebar-content').innerHTML = convertMarkdownToHtml(sidebarContent);

                // Checkbox-Funktionalität
                setupCheckboxes();
                
            } catch (error) {
                console.error('Fehler beim Laden des Dashboards:', error);
                document.getElementById('dashboard-content').innerHTML = '<p>Fehler beim Laden des Dashboards. Bitte überprüfen Sie die Dateipfade.</p>';
            }
        }

        function setupCheckboxes() {
            const checkboxes = document.querySelectorAll('input[type="checkbox"]');
            
            checkboxes.forEach(checkbox => {
                // Lade gespeicherten Zustand
                const savedState = localStorage.getItem('checkbox_' + checkbox.parentNode.textContent.trim());
                if (savedState === 'true') {
                    checkbox.checked = true;
                    checkbox.parentNode.classList.add('completed');
                }
                
                // Event Listener für Änderungen
                checkbox.addEventListener('change', function() {
                    if (this.checked) {
                        this.parentNode.classList.add('completed');
                    } else {
                        this.parentNode.classList.remove('completed');
                    }
                    
                    // Speichere Zustand
                    localStorage.setItem('checkbox_' + this.parentNode.textContent.trim(), this.checked);
                });
            });
        }

        // Lade Dashboard beim Start
        document.addEventListener('DOMContentLoaded', loadDashboard);
    </script>
</body>
</html>
EOF

# Lösche temporäre Dateien
rm -f temp_dashboard.md temp_sidebar.md

echo "✅ Dashboard erfolgreich generiert: $OUTPUT_FILE"
echo "🌐 Öffne Dashboard im Browser..."

# Öffne Dashboard im Browser
open "$OUTPUT_FILE"