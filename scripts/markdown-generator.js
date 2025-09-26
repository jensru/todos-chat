#!/usr/bin/env node

/**
 * Markdown Generator
 * Generiert Markdown aus strukturierten JSON-Daten
 */

const fs = require('fs');
const path = require('path');

class MarkdownGenerator {
  constructor() {
    this.template = this.loadTemplate();
  }

  /**
   * Lädt das Markdown-Template
   */
  loadTemplate() {
    return `# 🎯 Dashboard - Strukturierte To-do-Übersicht

## 📅 **Diese Woche (22. September - 28. September 2025)**

{{WEEKLY_TASKS}}

---

## 📅 **TIMELINE: Oktober - Dezember 2025**

{{TIMELINE_TASKS}}

---

## 🎯 **Leadmagnets & Funnels Pipeline**

### **Entwickelt/In Arbeit:**
{{PIPELINE_TASKS}}

---

## 📊 **Marketing & Business Development**

### **Aktueller Status:**
{{MARKETING_TASKS}}

---

## 🚀 **Zukünftige Projekte**

### **N-t-h (Next to happen):**
{{FUTURE_TASKS}}

---

_Letzte Aktualisierung: {{TIMESTAMP}}_`;
  }

  /**
   * Generiert Markdown aus JSON-Daten
   */
  generateMarkdown(tasks, outputPath) {
    const groupedTasks = this.groupTasksByCategory(tasks);
    const timestamp = new Date().toLocaleString('de-DE');
    
    let markdown = this.template
      .replace('{{WEEKLY_TASKS}}', this.generateWeeklySection(groupedTasks.weekly))
      .replace('{{TIMELINE_TASKS}}', this.generateTimelineSection(groupedTasks.timeline))
      .replace('{{PIPELINE_TASKS}}', this.generatePipelineSection(groupedTasks.pipeline))
      .replace('{{MARKETING_TASKS}}', this.generateMarketingSection(groupedTasks.marketing))
      .replace('{{FUTURE_TASKS}}', this.generateFutureSection(groupedTasks.future))
      .replace('{{TIMESTAMP}}', timestamp);

    // Markdown speichern
    fs.writeFileSync(outputPath, markdown);
    console.log(`✅ Markdown generiert: ${outputPath}`);
    
    return markdown;
  }

  /**
   * Gruppiert Tasks nach Kategorien
   */
  groupTasksByCategory(tasks) {
    const grouped = {
      weekly: [],
      timeline: [],
      pipeline: [],
      marketing: [],
      future: []
    };

    tasks.forEach(task => {
      if (task.project && task.project.includes('Diese Woche')) {
        grouped.weekly.push(task);
      } else if (task.project && task.project.includes('TIMELINE')) {
        grouped.timeline.push(task);
      } else if (task.project && task.project.includes('Leadmagnets')) {
        grouped.pipeline.push(task);
      } else if (task.project && task.project.includes('Marketing')) {
        grouped.marketing.push(task);
      } else if (task.project && task.project.includes('Zukünftige')) {
        grouped.future.push(task);
      }
    });

    return grouped;
  }

  /**
   * Generiert Wochen-Sektion
   */
  generateWeeklySection(tasks) {
    if (tasks.length === 0) return '';

    const tasksByDate = this.groupTasksByDate(tasks);
    let markdown = '';

    Object.keys(tasksByDate).sort().forEach(date => {
      const dateTasks = tasksByDate[date];
      const dateStr = this.formatDate(date);
      
      markdown += `\n### **${dateStr}**\n`;
      
      dateTasks.forEach(task => {
        markdown += this.formatTask(task);
      });
    });

    return markdown;
  }

  /**
   * Generiert Timeline-Sektion
   */
  generateTimelineSection(tasks) {
    if (tasks.length === 0) return '';

    const tasksByWeek = this.groupTasksByWeek(tasks);
    let markdown = '';

    Object.keys(tasksByWeek).sort().forEach(week => {
      const weekTasks = tasksByWeek[week];
      
      markdown += `\n### **📅 ${week}**\n`;
      
      weekTasks.forEach(task => {
        markdown += this.formatTask(task);
      });
    });

    return markdown;
  }

  /**
   * Generiert Pipeline-Sektion
   */
  generatePipelineSection(tasks) {
    if (tasks.length === 0) return '';

    let markdown = '';
    
    tasks.forEach(task => {
      markdown += this.formatTask(task);
    });

    return markdown;
  }

  /**
   * Generiert Marketing-Sektion
   */
  generateMarketingSection(tasks) {
    if (tasks.length === 0) return '';

    let markdown = '';
    
    tasks.forEach(task => {
      markdown += this.formatTask(task);
    });

    return markdown;
  }

  /**
   * Generiert Future-Sektion
   */
  generateFutureSection(tasks) {
    if (tasks.length === 0) return '';

    let markdown = '';
    
    tasks.forEach(task => {
      markdown += this.formatTask(task);
    });

    return markdown;
  }

  /**
   * Formatiert einen einzelnen Task
   */
  formatTask(task) {
    const checkbox = task.status === 'completed' ? '[x]' : '[ ]';
    const title = this.cleanTitle(task.title);
    const description = task.description ? ` - ${task.description}` : '';
    
    let markdown = `- ${checkbox} ${title}${description}\n`;
    
    // Subtasks hinzufügen
    if (task.subtasks && task.subtasks.length > 0) {
      task.subtasks.forEach(subtask => {
        const subCheckbox = subtask.status === 'completed' ? '[x]' : '[ ]';
        markdown += `  - ${subCheckbox} ${subtask.title}\n`;
      });
    }
    
    return markdown;
  }

  /**
   * Bereinigt Task-Titel
   */
  cleanTitle(title) {
    return title
      .replace(/\*\*/g, '') // ** entfernen
      .trim();
  }

  /**
   * Gruppiert Tasks nach Datum
   */
  groupTasksByDate(tasks) {
    const grouped = {};
    
    tasks.forEach(task => {
      if (!grouped[task.date]) {
        grouped[task.date] = [];
      }
      grouped[task.date].push(task);
    });
    
    return grouped;
  }

  /**
   * Gruppiert Tasks nach Woche
   */
  groupTasksByWeek(tasks) {
    const grouped = {};
    
    tasks.forEach(task => {
      const week = task.week || 'Unbekannte Woche';
      if (!grouped[week]) {
        grouped[week] = [];
      }
      grouped[week].push(task);
    });
    
    return grouped;
  }

  /**
   * Formatiert Datum für deutsche Ausgabe
   */
  formatDate(dateStr) {
    if (!dateStr) return 'Unbekanntes Datum';
    
    const date = new Date(dateStr);
    const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 
                   'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
    
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    
    return `${dayName}, ${day}. ${month}`;
  }
}

/**
 * Sync Service
 * Synchronisiert zwischen Markdown und JSON
 */
class SyncService {
  constructor() {
    this.parser = require('./markdown-parser');
    this.generator = new MarkdownGenerator();
  }

  /**
   * Synchronisiert Markdown zu JSON
   */
  async syncMarkdownToJSON(markdownPath, jsonPath) {
    console.log(`🔄 Sync Markdown → JSON: ${markdownPath}`);
    
    const { MarkdownTaskParser, LocalTaskDatabase } = this.parser;
    const parser = new MarkdownTaskParser();
    const database = new LocalTaskDatabase();
    
    const result = parser.parseMarkdownFile(markdownPath);
    database.saveTasks(result.tasks);
    
    console.log(`✅ ${result.tasks.length} Tasks synchronisiert`);
    return result.tasks;
  }

  /**
   * Synchronisiert JSON zu Markdown
   */
  async syncJSONToMarkdown(jsonPath, markdownPath) {
    console.log(`🔄 Sync JSON → Markdown: ${jsonPath}`);
    
    const { LocalTaskDatabase } = this.parser;
    const database = new LocalTaskDatabase();
    
    const tasks = database.loadTasks();
    const markdown = this.generator.generateMarkdown(tasks, markdownPath);
    
    console.log(`✅ Markdown mit ${tasks.length} Tasks generiert`);
    return markdown;
  }

  /**
   * Bidirektionale Synchronisation
   */
  async bidirectionalSync(markdownPath, jsonPath) {
    console.log(`🔄 Bidirektionale Sync zwischen ${markdownPath} und ${jsonPath}`);
    
    // Prüfe welche Datei neuer ist
    const markdownStats = fs.statSync(markdownPath);
    const jsonStats = fs.existsSync(jsonPath) ? fs.statSync(jsonPath) : { mtime: new Date(0) };
    
    if (markdownStats.mtime > jsonStats.mtime) {
      // Markdown ist neuer → Sync zu JSON
      await this.syncMarkdownToJSON(markdownPath, jsonPath);
    } else {
      // JSON ist neuer → Sync zu Markdown
      await this.syncJSONToMarkdown(jsonPath, markdownPath);
    }
  }
}

/**
 * Hauptfunktion
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const markdownPath = args[1] || './core/Dashboard - Strukturierte To-do-Übersicht.md';
  const jsonPath = args[2] || './data/tasks.json';

  const syncService = new SyncService();

  switch (command) {
    case 'markdown-to-json':
      syncService.syncMarkdownToJSON(markdownPath, jsonPath);
      break;
    
    case 'json-to-markdown':
      syncService.syncJSONToMarkdown(jsonPath, markdownPath);
      break;
    
    case 'bidirectional':
      syncService.bidirectionalSync(markdownPath, jsonPath);
      break;
    
    default:
      console.log('Verwendung:');
      console.log('  node markdown-generator.js markdown-to-json [markdown-file] [json-file]');
      console.log('  node markdown-generator.js json-to-markdown [json-file] [markdown-file]');
      console.log('  node markdown-generator.js bidirectional [markdown-file] [json-file]');
  }
}

// Script ausführen
if (require.main === module) {
  main();
}

module.exports = { MarkdownGenerator, SyncService };
