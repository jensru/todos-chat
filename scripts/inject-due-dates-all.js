#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class DueDateInjector {
  constructor(markdownFile = './core/Dashboard - Strukturierte To-do-Übersicht.md') {
    this.markdownFile = markdownFile;
  }

  // Extrahiere Due Date aus einem Task basierend auf dem Kontext
  extractDueDateFromContext(line, lines, lineIndex) {
    // Schaue nach oben nach einem Datum-Header
    for (let i = lineIndex - 1; i >= 0; i--) {
      const prevLine = lines[i].trim();
      
      // Suche nach Datum-Headers wie "Montag, 6. Oktober" oder "Donnerstag, 23. Oktober"
      const dateMatch = prevLine.match(/(\d{1,2})\.\s*(Oktober|November|Dezember)\s*(\d{4})?/i);
      if (dateMatch) {
        const day = parseInt(dateMatch[1]);
        const month = dateMatch[2].toLowerCase();
        const year = dateMatch[3] || '2025';
        
        // Konvertiere Monat zu Nummer
        const monthMap = {
          'oktober': '10',
          'november': '11', 
          'dezember': '12'
        };
        
        const monthNum = monthMap[month];
        if (monthNum) {
          return `${year}-${monthNum}-${day.toString().padStart(2, '0')}`;
        }
      }
      
      // Suche nach spezifischen Datumsangaben
      if (prevLine.includes('Montag') && prevLine.includes('6')) {
        return '2025-10-06';
      }
      if (prevLine.includes('Dienstag') && prevLine.includes('7')) {
        return '2025-10-07';
      }
      if (prevLine.includes('Mittwoch') && prevLine.includes('8')) {
        return '2025-10-08';
      }
      if (prevLine.includes('Donnerstag') && prevLine.includes('23')) {
        return '2025-10-23';
      }
      if (prevLine.includes('Freitag') && prevLine.includes('24')) {
        return '2025-10-24';
      }
      if (prevLine.includes('Sonntag') && prevLine.includes('26')) {
        return '2025-10-26';
      }
      if (prevLine.includes('Dezember') && prevLine.includes('1')) {
        return '2025-12-01';
      }
    }
    
    return null;
  }

  // Füge Due Dates zu allen Tasks hinzu
  injectDueDatesToAllTasks() {
    console.log('🔄 Füge Due Dates zu ALLEN Tasks hinzu...');
    
    let markdownContent = fs.readFileSync(this.markdownFile, 'utf8');
    const lines = markdownContent.split('\n');
    let newLines = [];
    let changesMade = false;

    // Erstelle ein Backup
    const backupPath = `${this.markdownFile}.backup.${Date.now()}`;
    fs.writeFileSync(backupPath, markdownContent);
    console.log(`📁 Backup erstellt: ${backupPath}`);

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      
      // Erkenne Haupttasks (- [ ]) und Subtasks (  - [ ])
      const mainTaskMatch = line.match(/^(- \[([ x])\]\s*)(.+?)(?:\s+📅\s+\d{4}-\d{2}-\d{2})?$/);
      const subtaskMatch = line.match(/^(\s+- \[([ x])\]\s*)(.+?)(?:\s+📅\s+\d{4}-\d{2}-\d{2})?$/);
      
      if (mainTaskMatch || subtaskMatch) {
        const match = mainTaskMatch || subtaskMatch;
        const prefix = match[1]; // z.B. "- [ ] " oder "  - [ ] "
        const titleAndDescription = match[3]; // Der Rest der Zeile
        
        // Prüfe, ob bereits ein Due Date vorhanden ist
        const existingDueDateMatch = titleAndDescription.match(/📅\s+(\d{4}-\d{2}-\d{2})$/);
        
        if (!existingDueDateMatch) {
          // Extrahiere Due Date aus dem Kontext
          const dueDate = this.extractDueDateFromContext(line, lines, i);
          
          if (dueDate) {
            // Entferne mögliche alte Due Dates und füge neues hinzu
            const cleanedLine = titleAndDescription.replace(/\s+📅\s+\d{4}-\d{2}-\d{2}$/, '').trim();
            line = `${prefix}${cleanedLine} 📅 ${dueDate}`;
            changesMade = true;
            console.log(`✅ Due Date hinzugefügt: ${cleanedLine.substring(0, 50)}... → ${dueDate}`);
          }
        }
      }
      
      newLines.push(line);
    }

    if (changesMade) {
      fs.writeFileSync(this.markdownFile, newLines.join('\n'));
      console.log('✅ Due Dates zu ALLEN Tasks hinzugefügt');
    } else {
      console.log('ℹ️ Alle Tasks haben bereits Due Dates.');
    }
  }
}

function main() {
  const injector = new DueDateInjector();
  injector.injectDueDatesToAllTasks();
}

if (require.main === module) {
  main();
}

module.exports = DueDateInjector;
