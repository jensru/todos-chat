#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class CompletedTaskRemover {
  constructor() {
    this.dashboardFile = './core/Dashboard - Strukturierte To-do-Übersicht.md';
    this.datesDir = './core/dates';
  }

  // Entferne erledigte Tasks aus der Dashboard-Datei
  removeCompletedFromDashboard() {
    console.log('🧹 Entferne erledigte Tasks aus Dashboard...');
    
    if (!fs.existsSync(this.dashboardFile)) {
      console.log('ℹ️ Dashboard-Datei nicht gefunden, überspringe...');
      return;
    }

    let content = fs.readFileSync(this.dashboardFile, 'utf8');
    const lines = content.split('\n');
    let newLines = [];
    let changesMade = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Erkenne erledigte Tasks (mit [x])
      const completedTaskMatch = line.match(/^- \[x\] (.+?)(?:\s+📅\s+\d{4}-\d{2}-\d{2})?$/);
      
      if (completedTaskMatch) {
        console.log(`✅ Entferne erledigten Task: ${completedTaskMatch[1].substring(0, 50)}...`);
        changesMade = true;
        continue; // Überspringe diese Zeile
      }
      
      // Erkenne erledigte Subtasks (mit [x] und Einrückung)
      const completedSubtaskMatch = line.match(/^  - \[x\] (.+?)(?:\s+📅\s+\d{4}-\d{2}-\d{2})?$/);
      
      if (completedSubtaskMatch) {
        console.log(`✅ Entferne erledigten Subtask: ${completedSubtaskMatch[1].substring(0, 50)}...`);
        changesMade = true;
        continue; // Überspringe diese Zeile
      }
      
      newLines.push(line);
    }

    if (changesMade) {
      // Erstelle Backup
      const backupPath = `${this.dashboardFile}.backup.${Date.now()}`;
      fs.writeFileSync(backupPath, content);
      console.log(`📁 Backup erstellt: ${backupPath}`);
      
      // Schreibe aktualisierte Datei
      fs.writeFileSync(this.dashboardFile, newLines.join('\n'));
      console.log('✅ Erledigte Tasks aus Dashboard entfernt');
    } else {
      console.log('ℹ️ Keine erledigten Tasks im Dashboard gefunden');
    }
  }

  // Entferne erledigte Tasks aus allen Datumsdateien (optional)
  removeCompletedFromDateFiles() {
    console.log('🧹 Entferne erledigte Tasks aus Datumsdateien...');
    
    if (!fs.existsSync(this.datesDir)) {
      console.log('ℹ️ Dates-Verzeichnis nicht gefunden, überspringe...');
      return;
    }

    const files = fs.readdirSync(this.datesDir)
      .filter(file => file.endsWith('.md') && file !== 'index.md');

    for (const file of files) {
      const filePath = path.join(this.datesDir, file);
      this.removeCompletedFromFile(filePath);
    }
  }

  // Entferne erledigte Tasks aus einer einzelnen Datei
  removeCompletedFromFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let newLines = [];
    let changesMade = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Erkenne erledigte Tasks
      const completedTaskMatch = line.match(/^- \[x\] (.+?)(?:\s+📅\s+\d{4}-\d{2}-\d{2})?$/);
      const completedSubtaskMatch = line.match(/^  - \[x\] (.+?)(?:\s+📅\s+\d{4}-\d{2}-\d{2})?$/);
      
      if (completedTaskMatch || completedSubtaskMatch) {
        const match = completedTaskMatch || completedSubtaskMatch;
        console.log(`✅ Entferne erledigten Task aus ${path.basename(filePath)}: ${match[1].substring(0, 50)}...`);
        changesMade = true;
        continue;
      }
      
      newLines.push(line);
    }

    if (changesMade) {
      // Erstelle Backup
      const backupPath = `${filePath}.backup.${Date.now()}`;
      fs.writeFileSync(backupPath, content);
      
      // Schreibe aktualisierte Datei
      fs.writeFileSync(filePath, newLines.join('\n'));
      console.log(`✅ Erledigte Tasks aus ${path.basename(filePath)} entfernt`);
    }
  }

  // Führe die Bereinigung durch
  cleanup(includeDateFiles = false) {
    try {
      console.log('🚀 Starte automatische Bereinigung erledigter Tasks...');
      
      this.removeCompletedFromDashboard();
      
      if (includeDateFiles) {
        this.removeCompletedFromDateFiles();
      }
      
      console.log('✅ Automatische Bereinigung abgeschlossen!');
      
    } catch (error) {
      console.error('❌ Fehler bei der Bereinigung:', error);
    }
  }
}

// Führe Bereinigung aus, wenn direkt aufgerufen
if (require.main === module) {
  const remover = new CompletedTaskRemover();
  
  // Prüfe Kommandozeilenargumente
  const args = process.argv.slice(2);
  const includeDateFiles = args.includes('--include-dates');
  
  remover.cleanup(includeDateFiles);
}

module.exports = CompletedTaskRemover;
