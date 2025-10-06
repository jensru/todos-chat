#!/usr/bin/env node

/**
 * Markdown Due Date Injector
 * Fügt Due Dates zu bestehenden Markdown Tasks hinzu
 */

const fs = require('fs');
const path = require('path');

class MarkdownDueDateInjector {
  constructor() {
    this.markdownFile = './core/Dashboard - Strukturierte To-do-Übersicht.md';
    this.smartTasksFile = './data/smart-tasks.json';
  }

  /**
   * Lädt Smart Tasks mit Due Dates
   */
  loadSmartTasks() {
    if (!fs.existsSync(this.smartTasksFile)) {
      console.log('❌ Smart Tasks Datei nicht gefunden');
      return {};
    }
    
    const data = JSON.parse(fs.readFileSync(this.smartTasksFile, 'utf8'));
    const tasksMap = {};
    
    data.tasks.forEach(task => {
      // Erstelle einen Schlüssel basierend auf dem Task-Titel
      const key = this.normalizeTitle(task.title);
      tasksMap[key] = task.due_date;
    });
    
    return tasksMap;
  }

  /**
   * Normalisiert Task-Titel für Matching
   */
  normalizeTitle(title) {
    return title
      .replace(/\*\*/g, '') // Markdown Bold entfernen
      .replace(/[🔥📅💰🌅]/g, '') // Emojis entfernen
      .trim()
      .toLowerCase();
  }

  /**
   * Fügt Due Dates zu Markdown Tasks hinzu
   */
  injectDueDates() {
    const smartTasks = this.loadSmartTasks();
    const content = fs.readFileSync(this.markdownFile, 'utf8');
    const lines = content.split('\n');
    
    let modified = false;
    const updatedLines = lines.map(line => {
      // Task-Zeile erkennen: - [ ] **Task Title** - Description
      const taskMatch = line.match(/^- \[([ x])\] (.+?)(?: - (.+))?$/);
      
      if (taskMatch) {
        const [, status, title, description] = taskMatch;
        const normalizedTitle = this.normalizeTitle(title);
        
        // Prüfe ob bereits ein Due Date vorhanden ist
        if (line.includes('📅')) {
          return line; // Bereits Due Date vorhanden
        }
        
        // Suche nach passendem Smart Task
        const dueDate = smartTasks[normalizedTitle];
        
        if (dueDate) {
          modified = true;
          const descriptionPart = description ? ` - ${description}` : '';
          return `${line} 📅 ${dueDate}`;
        }
      }
      
      return line;
    });
    
    if (modified) {
      // Backup erstellen
      const backupFile = `${this.markdownFile}.backup.${Date.now()}`;
      fs.writeFileSync(backupFile, content);
      console.log(`📁 Backup erstellt: ${backupFile}`);
      
      // Aktualisierte Datei speichern
      fs.writeFileSync(this.markdownFile, updatedLines.join('\n'));
      console.log('✅ Due Dates zu Markdown hinzugefügt');
      
      return true;
    } else {
      console.log('ℹ️ Keine neuen Due Dates hinzugefügt');
      return false;
    }
  }

  /**
   * Zeigt Due Date Mapping
   */
  showMapping() {
    const smartTasks = this.loadSmartTasks();
    
    console.log('\n📅 Due Date Mapping:');
    console.log('==================');
    
    Object.entries(smartTasks).forEach(([title, dueDate]) => {
      console.log(`${title} → ${dueDate}`);
    });
    
    console.log(`\n📊 Total: ${Object.keys(smartTasks).length} Tasks mit Due Dates`);
  }
}

/**
 * Hauptfunktion
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'inject';
  
  const injector = new MarkdownDueDateInjector();
  
  switch (command) {
    case 'inject':
      console.log('🔄 Füge Due Dates zu Markdown hinzu...');
      injector.injectDueDates();
      break;
      
    case 'show':
      injector.showMapping();
      break;
      
    case 'help':
      console.log(`
📅 Markdown Due Date Injector

Verwendung:
  node scripts/markdown-due-date-injector.js [command]

Commands:
  inject  - Fügt Due Dates zu Markdown Tasks hinzu (Standard)
  show    - Zeigt Due Date Mapping
  help    - Zeigt diese Hilfe

Beispiel Markdown Format:
  - [ ] **Task Title** - Description 📅 2025-10-06
      `);
      break;
      
    default:
      console.log(`❌ Unbekannter Befehl: ${command}`);
      console.log('Verwende "help" für Hilfe');
  }
}

// Script ausführen
if (require.main === module) {
  main();
}

module.exports = { MarkdownDueDateInjector };
