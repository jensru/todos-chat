#!/usr/bin/env node

/**
 * Markdown Task Parser
 * Extrahiert strukturierte Task-Daten aus Markdown-Dateien
 */

const fs = require('fs');
const path = require('path');

class MarkdownTaskParser {
  constructor() {
    this.tasks = [];
    this.projects = [];
    this.currentDate = null;
    this.currentWeek = null;
    this.currentProject = null;
  }

  /**
   * Parst eine Markdown-Datei und extrahiert alle Tasks
   */
  parseMarkdownFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    this.tasks = [];
    this.projects = [];
    this.currentDate = null;
    this.currentWeek = null;
    this.currentProject = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      this.parseLine(line, i, filePath);
    }

    return {
      tasks: this.tasks,
      projects: this.projects,
      metadata: {
        source_file: filePath,
        parsed_at: new Date().toISOString(),
        total_tasks: this.tasks.length,
        total_projects: this.projects.length
      }
    };
  }

  /**
   * Parst eine einzelne Zeile
   */
  parseLine(line, lineNumber, filePath) {
    // Datum-Erkennung: ### **Freitag, 26. September**
    const dateMatch = line.match(/^### \*\*(.+?)\*\*$/);
    if (dateMatch) {
      this.currentDate = this.parseDate(dateMatch[1]);
      return;
    }

    // Woche-Erkennung: ### **📅 WOCHE 1: 30. September - 6. Oktober 2025**
    const weekMatch = line.match(/^### \*\*📅 WOCHE (\d+): (.+?)\*\*$/);
    if (weekMatch) {
      this.currentWeek = `KW ${weekMatch[1]}`;
      return;
    }

    // Projekt-Erkennung: ## 📅 **TIMELINE: Oktober - Dezember 2025**
    const projectMatch = line.match(/^## 📅 \*\*(.+?)\*\*$/);
    if (projectMatch) {
      this.currentProject = projectMatch[1];
      return;
    }

    // Task-Erkennung mit Due Date: - [ ] **🔥 PUSH fertig** - Alle PUSH Content-Todos abschließen: 📅 2025-10-06
    const taskMatch = line.match(/^- \[([ x])\] (.+?)$/);
    if (taskMatch) {
      const task = this.createTask(taskMatch, lineNumber, filePath);
      this.tasks.push(task);
      return;
    }

    // Subtask-Erkennung:   - [ ] letzten Präse Steps inhaltlich
    const subtaskMatch = line.match(/^  - \[([ x])\] (.+?)$/);
    if (subtaskMatch && this.tasks.length > 0) {
      const subtask = this.createSubtask(subtaskMatch, lineNumber);
      const parentTask = this.tasks[this.tasks.length - 1];
      if (!parentTask.subtasks) {
        parentTask.subtasks = [];
      }
      parentTask.subtasks.push(subtask);
      
      // Erstelle auch einen separaten Task für die Subtask
      const subtaskAsTask = this.createTask(subtaskMatch, lineNumber, filePath);
      subtaskAsTask.hierarchy_level = 2;
      subtaskAsTask.parent_task = parentTask.id;
      this.tasks.push(subtaskAsTask);
      return;
    }
  }

  /**
   * Erstellt ein Task-Objekt
   */
  createTask(match, lineNumber, filePath) {
    const [, status, title] = match; // Kein dueDate mehr im Match
    
    // Leite Due Date aus dem Dateinamen ab
    const dueDate = this.extractDueDateFromFilename(filePath);
    
    return {
      id: this.generateTaskId(title, lineNumber),
      title: title.trim(),
      description: '',
      status: status === 'x' ? 'completed' : 'pending',
      priority: this.extractPriority(title),
      tags: this.extractTags(title),
      date: this.currentDate,
      week: this.currentWeek,
      project: this.currentProject,
      due_date: dueDate, // Due Date aus Dateinamen
      line_number: lineNumber,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      source_file: filePath,
      subtasks: []
    };
  }

  /**
   * Leite Due Date aus dem Dateinamen ab
   */
  extractDueDateFromFilename(filePath) {
    const fileName = path.basename(filePath, '.md');
    
    // Prüfe, ob der Dateiname ein Datum im Format YYYY-MM-DD ist
    const dateMatch = fileName.match(/^(\d{4}-\d{2}-\d{2})$/);
    if (dateMatch) {
      return dateMatch[1];
    }
    
    return null;
  }

  /**
   * Erstellt ein Subtask-Objekt
   */
  createSubtask(match, lineNumber) {
    const [, status, title] = match;
    
    return {
      id: this.generateSubtaskId(title, lineNumber),
      title: title.trim(),
      status: status === 'x' ? 'completed' : 'pending',
      line_number: lineNumber,
      created_at: new Date().toISOString()
    };
  }

  /**
   * Generiert eine eindeutige Task-ID
   */
  generateTaskId(title, lineNumber) {
    const cleanTitle = title
      .replace(/[🔥📅💰🌅]/g, '') // Emojis entfernen
      .replace(/[^a-zA-Z0-9]/g, '_') // Sonderzeichen durch _ ersetzen
      .toLowerCase()
      .substring(0, 30);
    
    return `task_${this.currentDate || 'unknown'}_${cleanTitle}_${lineNumber}`;
  }

  /**
   * Generiert eine Subtask-ID
   */
  generateSubtaskId(title, lineNumber) {
    const cleanTitle = title
      .replace(/[^a-zA-Z0-9]/g, '_')
      .toLowerCase()
      .substring(0, 20);
    
    return `subtask_${cleanTitle}_${lineNumber}`;
  }

  /**
   * Extrahiert Priorität aus dem Task-Titel
   */
  extractPriority(title) {
    if (title.includes('🔥')) return 'high';
    if (title.includes('📅')) return 'medium';
    if (title.includes('💰')) return 'medium';
    if (title.includes('🌅')) return 'low';
    return 'medium';
  }

  /**
   * Extrahiert Tags aus dem Task-Titel
   */
  extractTags(title) {
    const tags = [];
    
    // Emoji-basierte Tags
    if (title.includes('🔥')) tags.push('urgent');
    if (title.includes('📅')) tags.push('planning');
    if (title.includes('💰')) tags.push('business');
    if (title.includes('🌅')) tags.push('morning');
    
    // Text-basierte Tags
    if (title.toLowerCase().includes('push')) tags.push('PUSH');
    if (title.toLowerCase().includes('meeting')) tags.push('meeting');
    if (title.toLowerCase().includes('post')) tags.push('social-media');
    
    return tags;
  }

  /**
   * Parst ein Datum aus verschiedenen Formaten
   */
  parseDate(dateString) {
    // Freitag, 26. September -> 2025-09-26
    const germanDateMatch = dateString.match(/(\d+)\.\s+(\w+)/);
    if (germanDateMatch) {
      const day = germanDateMatch[1].padStart(2, '0');
      const month = this.getMonthNumber(germanDateMatch[2]);
      return `2025-${month}-${day}`;
    }
    
    return null;
  }

  /**
   * Konvertiert deutschen Monatsnamen zu Nummer
   */
  getMonthNumber(monthName) {
    const months = {
      'Januar': '01', 'Februar': '02', 'März': '03', 'April': '04',
      'Mai': '05', 'Juni': '06', 'Juli': '07', 'August': '08',
      'September': '09', 'Oktober': '10', 'November': '11', 'Dezember': '12'
    };
    
    return months[monthName] || '01';
  }
}

/**
 * JSON Database Manager
 */
class LocalTaskDatabase {
  constructor(dataDir = './data') {
    this.dataDir = dataDir;
    this.ensureDataDir();
  }

  ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  /**
   * Speichert Tasks in JSON-Datei
   */
  saveTasks(tasks) {
    const filePath = path.join(this.dataDir, 'tasks.json');
    const data = {
      tasks: tasks,
      metadata: {
        last_updated: new Date().toISOString(),
        total_tasks: tasks.length,
        version: '1.0'
      }
    };
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`✅ ${tasks.length} Tasks gespeichert in ${filePath}`);
  }

  /**
   * Lädt Tasks aus JSON-Datei
   */
  loadTasks() {
    const filePath = path.join(this.dataDir, 'tasks.json');
    
    if (!fs.existsSync(filePath)) {
      return [];
    }
    
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return data.tasks || [];
  }

  /**
   * Speichert Sync-Log
   */
  logSync(sourceFile, tasksCount, timestamp) {
    const logPath = path.join(this.dataDir, 'sync-log.json');
    let logData = { recent_syncs: [] };
    
    if (fs.existsSync(logPath)) {
      logData = JSON.parse(fs.readFileSync(logPath, 'utf8'));
    }
    
    // Stelle sicher, dass recent_syncs ein Array ist
    if (!Array.isArray(logData.recent_syncs)) {
      logData.recent_syncs = [];
    }
    
    logData.recent_syncs.push({
      timestamp: timestamp,
      source_file: sourceFile,
      tasks_parsed: tasksCount,
      status: 'success'
    });
    
    // Nur die letzten 100 Einträge behalten
    if (logData.recent_syncs.length > 100) {
      logData.recent_syncs = logData.recent_syncs.slice(-100);
    }
    
    fs.writeFileSync(logPath, JSON.stringify(logData, null, 2));
  }
}

/**
 * Hauptfunktion
 */
function main() {
  const args = process.argv.slice(2);
  const markdownFile = args[0] || './core/Dashboard - Strukturierte To-do-Übersicht.md';
  
  if (!fs.existsSync(markdownFile)) {
    console.error(`❌ Markdown-Datei nicht gefunden: ${markdownFile}`);
    process.exit(1);
  }

  console.log(`🔄 Parse Markdown: ${markdownFile}`);
  
  // Parser initialisieren
  const parser = new MarkdownTaskParser();
  const database = new LocalTaskDatabase();
  
  // Markdown parsen
  const result = parser.parseMarkdownFile(markdownFile);
  
  // Tasks in Datenbank speichern
  database.saveTasks(result.tasks);
  
  // Sync-Log erstellen
  database.logSync(markdownFile, result.tasks.length, new Date().toISOString());
  
  // Statistiken ausgeben
  console.log(`\n📊 Parse-Ergebnis:`);
  console.log(`   • Tasks gefunden: ${result.tasks.length}`);
  console.log(`   • Projekte gefunden: ${result.projects.length}`);
  console.log(`   • Quelle: ${result.metadata.source_file}`);
  console.log(`   • Zeitstempel: ${result.metadata.parsed_at}`);
  
  // Beispiel-Task ausgeben
  if (result.tasks.length > 0) {
    console.log(`\n📝 Beispiel-Task:`);
    console.log(JSON.stringify(result.tasks[0], null, 2));
  }
}

// Script ausführen
if (require.main === module) {
  main();
}

module.exports = { MarkdownTaskParser, LocalTaskDatabase };
