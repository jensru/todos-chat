#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class DueDateRemover {
  constructor() {
    this.datesDir = './core/dates';
  }

  // Entferne Due Dates aus allen Tages-Markdown-Dateien
  removeDueDatesFromDailyFiles() {
    console.log('🧹 Entferne Due Dates aus Tages-Markdown-Dateien...');
    
    if (!fs.existsSync(this.datesDir)) {
      console.log('ℹ️ Dates-Verzeichnis nicht gefunden');
      return;
    }

    const files = fs.readdirSync(this.datesDir)
      .filter(file => file.endsWith('.md') && file !== 'index.md')
      .sort();

    console.log(`📁 ${files.length} Tages-Dateien gefunden`);

    for (const file of files) {
      const filePath = path.join(this.datesDir, file);
      this.removeDueDatesFromFile(filePath);
    }

    console.log('✅ Due Dates aus allen Tages-Dateien entfernt');
  }

  // Entferne Due Dates aus einer einzelnen Datei
  removeDueDatesFromFile(filePath) {
    const fileName = path.basename(filePath);
    console.log(`📝 Bearbeite ${fileName}...`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let newLines = [];
    let changesMade = false;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      
      // Entferne Due Dates von Haupttasks: - [ ] Task-Titel 📅 YYYY-MM-DD
      const mainTaskMatch = line.match(/^(- \[([ x])\] (.+?))(?:\s+📅\s+\d{4}-\d{2}-\d{2})?$/);
      if (mainTaskMatch) {
        const cleanLine = mainTaskMatch[1]; // Nur der Teil ohne Due Date
        if (line !== cleanLine) {
          line = cleanLine;
          changesMade = true;
        }
      }
      
      // Entferne Due Dates von Subtasks:   - [ ] Subtask-Titel 📅 YYYY-MM-DD
      const subtaskMatch = line.match(/^(\s+- \[([ x])\] (.+?))(?:\s+📅\s+\d{4}-\d{2}-\d{2})?$/);
      if (subtaskMatch) {
        const cleanLine = subtaskMatch[1]; // Nur der Teil ohne Due Date
        if (line !== cleanLine) {
          line = cleanLine;
          changesMade = true;
        }
      }
      
      newLines.push(line);
    }

    if (changesMade) {
      // Erstelle Backup
      const backupPath = `${filePath}.backup.${Date.now()}`;
      fs.writeFileSync(backupPath, content);
      console.log(`📁 Backup erstellt: ${backupPath}`);
      
      // Schreibe bereinigte Datei
      fs.writeFileSync(filePath, newLines.join('\n'));
      console.log(`✅ Due Dates aus ${fileName} entfernt`);
    } else {
      console.log(`ℹ️ Keine Due Dates in ${fileName} gefunden`);
    }
  }
}

// Führe Bereinigung aus, wenn direkt aufgerufen
if (require.main === module) {
  const remover = new DueDateRemover();
  remover.removeDueDatesFromDailyFiles();
}

module.exports = DueDateRemover;
