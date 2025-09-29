#!/usr/bin/env node

/**
 * HTML Generator
 * Generiert die index.html mit Markdown-Inhalten
 */

const fs = require('fs');
const path = require('path');

class HTMLGenerator {
  constructor() {
    this.templatePath = './web/index.html';
    this.dashboardPath = './core/Dashboard - Strukturierte To-do-Übersicht.md';
    this.sidebarPath = './core/right-sidebar.md';
  }

  /**
   * Generiert die HTML-Datei mit Markdown-Inhalten
   */
  generateHTML() {
    console.log('🔄 Generiere HTML mit Markdown-Inhalten...');
    
    // Lese Template
    let htmlContent = fs.readFileSync(this.templatePath, 'utf8');
    
    // Lese Markdown-Inhalte
    const dashboardContent = this.readMarkdownFile(this.dashboardPath);
    const sidebarContent = this.readMarkdownFile(this.sidebarPath);
    
    // Escape für JavaScript
    const escapedDashboard = this.escapeForJavaScript(dashboardContent);
    const escapedSidebar = this.escapeForJavaScript(sidebarContent);
    
    // Ersetze leere Variablen
    htmlContent = htmlContent.replace(
      'const markdownContent = ;',
      `const markdownContent = \`${escapedDashboard}\`;`
    );
    
    htmlContent = htmlContent.replace(
      'const sidebarContent = ;',
      `const sidebarContent = \`${escapedSidebar}\`;`
    );
    
    // Schreibe aktualisierte HTML-Datei
    fs.writeFileSync(this.templatePath, htmlContent);
    console.log('✅ HTML-Datei mit Markdown-Inhalten generiert');
    
    return htmlContent;
  }

  /**
   * Liest eine Markdown-Datei
   */
  readMarkdownFile(filePath) {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Datei nicht gefunden: ${filePath}`);
      return '';
    }
    
    return fs.readFileSync(filePath, 'utf8');
  }

  /**
   * Escaped Text für JavaScript-Strings
   */
  escapeForJavaScript(text) {
    return text
      .replace(/\\/g, '\\\\')  // Backslashes
      .replace(/`/g, '\\`')    // Backticks
      .replace(/\$/g, '\\$')   // Dollar signs
      .replace(/\n/g, '\\n')   // Newlines
      .replace(/\r/g, '\\r')   // Carriage returns
      .replace(/\t/g, '\\t');  // Tabs
  }

  /**
   * Generiert zusätzliche Inhalte für die Website
   */
  generateAdditionalContent() {
    // Lade Tasks
    const tasksPath = './data/tasks.json';
    let tasks = [];
    
    if (fs.existsSync(tasksPath)) {
      const tasksData = JSON.parse(fs.readFileSync(tasksPath, 'utf8'));
      tasks = tasksData.tasks || [];
    }
    
    // Generiere Task-Historie für heute
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter(task => 
      task.date === today && task.status === 'completed'
    );
    
    let todayHistoryHtml = '';
    if (todayTasks.length > 0) {
      todayHistoryHtml = `
        <h2>✅ Heute erledigt (${today})</h2>
        <ul>
          ${todayTasks.map(task => `<li>${task.title}</li>`).join('')}
        </ul>
      `;
    }
    
    // Generiere Tagesziele-Fortschritt
    const pendingTasks = tasks.filter(task => task.status === 'pending');
    const completedTasks = tasks.filter(task => task.status === 'completed');
    const totalTasks = tasks.length;
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;
    
    const dailyProgressHtml = `
      <h2>📊 Fortschritt heute</h2>
      <div style="background: #f0f0f0; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <div style="background: #4CAF50; height: 20px; border-radius: 4px; width: ${progressPercentage}%; transition: width 0.3s;"></div>
        <p style="margin: 8px 0 0 0; font-size: 14px; color: #666;">
          ${completedTasks.length} von ${totalTasks} Tasks erledigt (${progressPercentage}%)
        </p>
      </div>
    `;
    
    return {
      todayHistory: this.escapeForJavaScript(todayHistoryHtml),
      dailyProgress: this.escapeForJavaScript(dailyProgressHtml)
    };
  }
}

/**
 * Hauptfunktion
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const generator = new HTMLGenerator();
  
  switch (command) {
    case 'generate':
      generator.generateHTML();
      break;
    
    case 'watch':
      // Watch-Modus für automatische Updates
      console.log('👀 Überwache Markdown-Dateien...');
      
      const watchPaths = [
        './core/Dashboard - Strukturierte To-do-Übersicht.md',
        './core/right-sidebar.md'
      ];
      
      watchPaths.forEach(filePath => {
        if (fs.existsSync(filePath)) {
          fs.watchFile(filePath, { interval: 1000 }, (curr, prev) => {
            if (curr.mtime > prev.mtime) {
              console.log(`📝 Änderung erkannt: ${filePath}`);
              generator.generateHTML();
            }
          });
        }
      });
      
      // Graceful shutdown
      process.on('SIGINT', () => {
        console.log('\n🛑 Beende HTML-Generator...');
        process.exit(0);
      });
      
      // Keep process alive
      setInterval(() => {
        // Heartbeat
      }, 1000);
      break;
    
    default:
      console.log('Verwendung:');
      console.log('  node generate-html.js generate  - Generiert HTML einmalig');
      console.log('  node generate-html.js watch     - Überwacht Dateien und generiert automatisch');
      break;
  }
}

// Script ausführen
if (require.main === module) {
  main();
}

module.exports = HTMLGenerator;
