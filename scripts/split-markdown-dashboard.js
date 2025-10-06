#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class MarkdownSplitter {
  constructor() {
    this.sourceFile = './core/Dashboard - Strukturierte To-do-Übersicht.md';
    this.outputDir = './core/dates';
    this.tasksByDate = {};
  }

  // Erstelle Output-Verzeichnis
  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
      console.log(`📁 Verzeichnis erstellt: ${this.outputDir}`);
    }
  }

  // Parse die Hauptdatei und gruppiere Tasks nach Datum
  parseAndGroupTasks() {
    console.log('🔄 Parse Markdown und gruppiere Tasks nach Datum...');
    
    const content = fs.readFileSync(this.sourceFile, 'utf8');
    const lines = content.split('\n');
    
    let currentDate = null;
    let currentDateKey = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Erkenne Datum-Header (sowohl spezifische Tage als auch Monate)
      const specificDateMatch = line.match(/#### \*\*(.+?)\*\*/);
      const monthMatch = line.match(/## 📅 \*\*(.+?)\*\*/);
      
      if (specificDateMatch) {
        const dateText = specificDateMatch[1];
        const dateKey = this.extractDateKey(dateText);
        if (dateKey) {
          currentDate = dateText;
          currentDateKey = dateKey;
          if (!this.tasksByDate[currentDateKey]) {
            this.tasksByDate[currentDateKey] = {
              dateText: currentDate,
              dateKey: currentDateKey,
              tasks: []
            };
          }
        }
        continue;
      }
      
      if (monthMatch) {
        const monthText = monthMatch[1];
        const dateKey = this.extractDateKey(monthText);
        if (dateKey) {
          currentDate = monthText;
          currentDateKey = dateKey;
          if (!this.tasksByDate[currentDateKey]) {
            this.tasksByDate[currentDateKey] = {
              dateText: currentDate,
              dateKey: currentDateKey,
              tasks: []
            };
          }
        }
        continue;
      }
      
      // Erkenne Tasks (Haupttasks und Subtasks)
      const taskMatch = line.match(/^(- \[([ x])\] (.+?)(?:\s+📅\s+(\d{4}-\d{2}-\d{2}))?)$/);
      const subtaskMatch = line.match(/^(\s+- \[([ x])\] (.+?)(?:\s+📅\s+(\d{4}-\d{2}-\d{2}))?)$/);
      
      if ((taskMatch || subtaskMatch) && currentDateKey) {
        const match = taskMatch || subtaskMatch;
        const fullLine = match[0];
        const status = match[2];
        const title = match[3];
        const dueDate = match[4];
        
        this.tasksByDate[currentDateKey].tasks.push({
          line: fullLine,
          status: status,
          title: title,
          dueDate: dueDate,
          isSubtask: !!subtaskMatch
        });
      }
    }
    
    console.log(`✅ ${Object.keys(this.tasksByDate).length} Datumsgruppen gefunden`);
  }

  // Extrahiere Datum-Key aus Datum-Text
  extractDateKey(dateText) {
    // Beispiele: "Montag Nachmittag, 6. Oktober" -> "2025-10-06"
    // Auch: "November 2025" -> "2025-11-01", "Dezember 2025" -> "2025-12-01"
    const patterns = [
      { regex: /(\d{1,2})\.\s*(Oktober|November|Dezember)/i, year: 2025 },
      { regex: /(\d{1,2})\.\s*(Januar|Februar|März|April|Mai|Juni|Juli|August|September)/i, year: 2025 },
      { regex: /(November|Dezember)\s*(\d{4})/i, year: 2025, monthOnly: true }
    ];
    
    for (const pattern of patterns) {
      const match = dateText.match(pattern.regex);
      if (match) {
        if (pattern.monthOnly) {
          // Für "November 2025" oder "Dezember 2025"
          const month = match[1].toLowerCase();
          const monthMap = {
            'januar': '01', 'februar': '02', 'märz': '03', 'april': '04',
            'mai': '05', 'juni': '06', 'juli': '07', 'august': '08',
            'september': '09', 'oktober': '10', 'november': '11', 'dezember': '12'
          };
          const monthNum = monthMap[month];
          if (monthNum) {
            return `${pattern.year}-${monthNum}-01`; // Erster des Monats
          }
        } else {
          // Für spezifische Tage
          const day = parseInt(match[1]);
          const month = match[2].toLowerCase();
          
          const monthMap = {
            'januar': '01', 'februar': '02', 'märz': '03', 'april': '04',
            'mai': '05', 'juni': '06', 'juli': '07', 'august': '08',
            'september': '09', 'oktober': '10', 'november': '11', 'dezember': '12'
          };
          
          const monthNum = monthMap[month];
          if (monthNum) {
            return `${pattern.year}-${monthNum}-${day.toString().padStart(2, '0')}`;
          }
        }
      }
    }
    
    return null;
  }

  // Erstelle separate Markdown-Dateien für jedes Datum
  createDateFiles() {
    console.log('📝 Erstelle separate Markdown-Dateien...');
    
    for (const [dateKey, data] of Object.entries(this.tasksByDate)) {
      const fileName = `${dateKey}.md`;
      const filePath = path.join(this.outputDir, fileName);
      
      let content = `# 📅 ${data.dateText}\n\n`;
      
      // Schreibe alle Tasks in der Reihenfolge, wie sie im Original stehen
      for (const task of data.tasks) {
        content += `${task.line}\n`;
      }
      
      fs.writeFileSync(filePath, content);
      console.log(`✅ ${fileName} erstellt (${data.tasks.length} Tasks)`);
    }
  }

  // Erstelle Index-Datei mit allen Daten
  createIndexFile() {
    console.log('📋 Erstelle Index-Datei...');
    
    const indexPath = path.join(this.outputDir, 'index.md');
    let content = '# 📅 Task-Dashboard Index\n\n';
    content += '> **Hinweis:** Diese Dateien sind Sync-Tools für die Datenbank.\n';
    content += '> Die Datenbank ist die Single Source of Truth.\n\n';
    
    // Sortiere Daten chronologisch
    const sortedDates = Object.keys(this.tasksByDate).sort();
    
    for (const dateKey of sortedDates) {
      const data = this.tasksByDate[dateKey];
      const fileName = `${dateKey}.md`;
      content += `- [${data.dateText}](./${fileName}) (${data.tasks.length} Tasks)\n`;
    }
    
    fs.writeFileSync(indexPath, content);
    console.log(`✅ Index-Datei erstellt: ${indexPath}`);
  }

  // Führe die Zerlegung durch
  split() {
    try {
      console.log('🚀 Starte Markdown-Zerlegung...');
      
      this.ensureOutputDir();
      this.parseAndGroupTasks();
      this.createDateFiles();
      this.createIndexFile();
      
      console.log('✅ Markdown-Zerlegung abgeschlossen!');
      console.log(`📊 ${Object.keys(this.tasksByDate).length} Datumsdateien erstellt`);
      
    } catch (error) {
      console.error('❌ Fehler bei der Markdown-Zerlegung:', error);
    }
  }
}

// Führe Zerlegung aus, wenn direkt aufgerufen
if (require.main === module) {
  const splitter = new MarkdownSplitter();
  splitter.split();
}

module.exports = MarkdownSplitter;
