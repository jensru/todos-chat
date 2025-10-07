#!/usr/bin/env node

/**
 * Category Sync Manager
 * Synchronisiert Kategorien zwischen Markdown und JSON
 */

const fs = require('fs');
const path = require('path');

class CategorySyncManager {
  constructor() {
    this.datesDir = './core/dates';
    this.tasksFile = './data/smart-tasks.json';
    this.categoryMapping = {
      'Business': '💼',
      'Development': '💻', 
      'Marketing': '📢',
      'PUSH': '🚀',
      'Personal': '👤',
      'General': '📋',
      'Check24': '🏢',
      'Sustain': '🌱',
      'Meetings': '🤝'
    };
  }

  /**
   * Synchronisiert Kategorien von JSON zu Markdown
   */
  syncCategoriesToMarkdown() {
    if (!fs.existsSync(this.tasksFile)) {
      console.log('❌ Smart Tasks Datei nicht gefunden');
      return [];
    }

    const smartTasks = JSON.parse(fs.readFileSync(this.tasksFile, 'utf8'));
    const tasks = smartTasks.tasks || [];
    
    // Gruppiere Tasks nach Datei
    const tasksByFile = {};
    tasks.forEach(task => {
      const fileName = this.extractDateFromDueDate(task.due_date);
      if (fileName) {
        if (!tasksByFile[fileName]) {
          tasksByFile[fileName] = [];
        }
        tasksByFile[fileName].push(task);
      }
    });

    const updatedFiles = [];
    
    Object.entries(tasksByFile).forEach(([fileName, fileTasks]) => {
      const filePath = path.join(this.datesDir, `${fileName}.md`);
      if (fs.existsSync(filePath)) {
        const updated = this.updateFileWithCategories(filePath, fileTasks);
        if (updated) {
          updatedFiles.push(filePath);
        }
      }
    });

    console.log(`✅ ${updatedFiles.length} Markdown-Dateien mit Kategorien aktualisiert`);
    return updatedFiles;
  }

  /**
   * Aktualisiert eine Markdown-Datei mit Kategorie-Gruppierung
   */
  updateFileWithCategories(filePath, tasks) {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Gruppiere Tasks nach Kategorien
    const tasksByCategory = {};
    tasks.forEach(task => {
      const category = task.category || 'General';
      if (!tasksByCategory[category]) {
        tasksByCategory[category] = [];
      }
      tasksByCategory[category].push(task);
    });

    // Erstelle neue Struktur mit Kategorien
    const lines = content.split('\n');
    const newLines = [];
    let inTaskSection = false;
    let taskLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Erkenne Task-Zeilen
      if (line.match(/^\s*-\s*\[[ x]\]/)) {
        if (!inTaskSection) {
          inTaskSection = true;
          taskLines = [];
        }
        taskLines.push(line);
      } else {
        // Wenn wir aus dem Task-Bereich raus sind, verarbeite die Tasks
        if (inTaskSection && taskLines.length > 0) {
          newLines.push(...this.organizeTasksByCategory(taskLines, tasksByCategory));
          taskLines = [];
          inTaskSection = false;
        }
        newLines.push(line);
      }
    }
    
    // Verarbeite verbleibende Tasks
    if (taskLines.length > 0) {
      newLines.push(...this.organizeTasksByCategory(taskLines, tasksByCategory));
    }

    const newContent = newLines.join('\n');
    
    if (newContent !== originalContent) {
      fs.writeFileSync(filePath, newContent);
      console.log(`📝 Kategorien organisiert: ${path.basename(filePath)}`);
      return true;
    }
    
    return false;
  }

  /**
   * Organisiert Tasks nach Kategorien
   */
  organizeTasksByCategory(taskLines, tasksByCategory) {
    const result = [];
    
    // Sortiere Kategorien nach Anzahl der Tasks
    const sortedCategories = Object.entries(tasksByCategory)
      .sort(([,a], [,b]) => b.length - a.length);
    
    sortedCategories.forEach(([category, tasks]) => {
      const icon = this.categoryMapping[category] || '📁';
      
      // Füge Kategorie-Header hinzu (nur wenn mehr als 1 Task)
      if (tasks.length > 1) {
        result.push('');
        result.push(`## ${icon} ${category}`);
      }
      
      // Füge Tasks hinzu
      tasks.forEach(task => {
        const taskLine = taskLines.find(line => {
          const cleanTitle = line.replace(/^\s*-\s*\[[ x]\]\s*/, '').trim();
          return cleanTitle.includes(task.title) || task.title.includes(cleanTitle);
        });
        
        if (taskLine) {
          result.push(taskLine);
        }
      });
    });
    
    return result;
  }

  /**
   * Extrahiert Datum aus Due Date
   */
  extractDateFromDueDate(dueDate) {
    if (!dueDate) return null;
    return dueDate; // Format: YYYY-MM-DD
  }

  /**
   * Erstellt eine Kategorie-Übersicht
   */
  createCategoryOverview() {
    if (!fs.existsSync(this.tasksFile)) {
      console.log('❌ Smart Tasks Datei nicht gefunden');
      return;
    }

    const smartTasks = JSON.parse(fs.readFileSync(this.tasksFile, 'utf8'));
    const tasks = smartTasks.tasks || [];
    
    const categoryStats = {};
    tasks.forEach(task => {
      const category = task.category || 'General';
      if (!categoryStats[category]) {
        categoryStats[category] = { total: 0, pending: 0, completed: 0 };
      }
      categoryStats[category].total++;
      if (task.status === 'completed') {
        categoryStats[category].completed++;
      } else {
        categoryStats[category].pending++;
      }
    });

    console.log('\n📊 Kategorie-Übersicht:');
    Object.entries(categoryStats)
      .sort(([,a], [,b]) => b.total - a.total)
      .forEach(([category, stats]) => {
        const icon = this.categoryMapping[category] || '📁';
        console.log(`   ${icon} ${category}: ${stats.total} Tasks (${stats.pending} offen, ${stats.completed} erledigt)`);
      });
  }

  /**
   * Erstellt eine neue Kategorie-Struktur in einer Datei
   */
  createCategoryStructure(filePath) {
    if (!fs.existsSync(filePath)) {
      console.log(`❌ Datei nicht gefunden: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    // Finde alle Task-Zeilen
    const lines = content.split('\n');
    const taskLines = lines.filter(line => line.match(/^\s*-\s*\[[ x]\]/));
    
    if (taskLines.length === 0) {
      console.log('ℹ️ Keine Tasks in der Datei gefunden');
      return false;
    }

    // Erstelle neue Struktur
    const newContent = this.createStructuredContent(lines, taskLines);
    
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent);
      console.log(`📝 Kategorie-Struktur erstellt: ${path.basename(filePath)}`);
      return true;
    }
    
    return false;
  }

  /**
   * Erstellt strukturierten Inhalt mit Kategorien
   */
  createStructuredContent(lines, taskLines) {
    const result = [];
    let inTaskSection = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.match(/^\s*-\s*\[[ x]\]/)) {
        if (!inTaskSection) {
          inTaskSection = true;
          result.push('');
          result.push('## 📋 Tasks');
          result.push('');
        }
        result.push(line);
      } else {
        if (inTaskSection && !line.match(/^\s*-\s*\[[ x]\]/)) {
          inTaskSection = false;
        }
        result.push(line);
      }
    }
    
    return result.join('\n');
  }
}

/**
 * CLI-Interface
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const manager = new CategorySyncManager();

  switch (command) {
    case 'sync':
      manager.syncCategoriesToMarkdown();
      break;

    case 'overview':
      manager.createCategoryOverview();
      break;

    case 'structure':
      if (args.length < 2) {
        console.log('Verwendung: node category-sync-manager.js structure <datei.md>');
        return;
      }
      manager.createCategoryStructure(args[1]);
      break;

    case 'all':
      manager.syncCategoriesToMarkdown();
      manager.createCategoryOverview();
      break;

    default:
      console.log('📊 Category Sync Manager');
      console.log('');
      console.log('Verwendung:');
      console.log('  node category-sync-manager.js sync     - Synchronisiert Kategorien zu Markdown');
      console.log('  node category-sync-manager.js overview - Zeigt Kategorie-Übersicht');
      console.log('  node category-sync-manager.js structure <datei> - Erstellt Kategorie-Struktur');
      console.log('  node category-sync-manager.js all      - Führt alle Operationen aus');
      console.log('');
      console.log('Kategorien:');
      Object.entries(manager.categoryMapping).forEach(([category, icon]) => {
        console.log(`  ${icon} ${category}`);
      });
      break;
  }
}

// Script ausführen
if (require.main === module) {
  main();
}

module.exports = CategorySyncManager;
