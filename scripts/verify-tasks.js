#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class TaskVerification {
  constructor() {
    this.originalFile = './core/Dashboard - Strukturierte To-do-Übersicht.md';
    this.datesDir = './core/dates';
  }

  // Extrahiere alle Tasks aus einer Datei
  extractTasksFromFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const tasks = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Haupttasks
      const mainTaskMatch = line.match(/^- \[([ x])\] (.+?)(?:\s+📅\s+(\d{4}-\d{2}-\d{2}))?$/);
      if (mainTaskMatch) {
        tasks.push({
          type: 'main',
          status: mainTaskMatch[1],
          title: mainTaskMatch[2].trim(),
          dueDate: mainTaskMatch[3] || null,
          line: line.trim(),
          file: filePath
        });
        continue;
      }

      // Subtasks
      const subtaskMatch = line.match(/^  - \[([ x])\] (.+?)(?:\s+📅\s+(\d{4}-\d{2}-\d{2}))?$/);
      if (subtaskMatch) {
        tasks.push({
          type: 'subtask',
          status: subtaskMatch[1],
          title: subtaskMatch[2].trim(),
          dueDate: subtaskMatch[3] || null,
          line: line.trim(),
          file: filePath
        });
      }
    }

    return tasks;
  }

  // Sammle alle Tasks aus zerlegten Dateien
  collectTasksFromSplitFiles() {
    const allTasks = [];
    
    if (!fs.existsSync(this.datesDir)) {
      console.error('❌ Dates-Verzeichnis nicht gefunden');
      return allTasks;
    }

    const files = fs.readdirSync(this.datesDir)
      .filter(file => file.endsWith('.md') && file !== 'index.md')
      .sort();

    for (const file of files) {
      const filePath = path.join(this.datesDir, file);
      const tasks = this.extractTasksFromFile(filePath);
      allTasks.push(...tasks);
    }

    return allTasks;
  }

  // Vergleiche Tasks zwischen Original und zerlegten Dateien
  compareTasks() {
    console.log('🔍 Ultra-exakte Task-Verifikation...\n');

    // Extrahiere Tasks aus Original
    const originalTasks = this.extractTasksFromFile(this.originalFile);
    console.log(`📄 Original-Datei: ${originalTasks.length} Tasks`);

    // Extrahiere Tasks aus zerlegten Dateien
    const splitTasks = this.collectTasksFromSplitFiles();
    console.log(`📁 Zerlegte Dateien: ${splitTasks.length} Tasks`);

    // Gruppiere nach Typ
    const originalMain = originalTasks.filter(t => t.type === 'main');
    const originalSub = originalTasks.filter(t => t.type === 'subtask');
    const splitMain = splitTasks.filter(t => t.type === 'main');
    const splitSub = splitTasks.filter(t => t.type === 'subtask');

    console.log(`\n📊 Detailvergleich:`);
    console.log(`   Original Haupttasks: ${originalMain.length}`);
    console.log(`   Zerlegt Haupttasks:  ${splitMain.length}`);
    console.log(`   Original Subtasks:   ${originalSub.length}`);
    console.log(`   Zerlegt Subtasks:    ${splitSub.length}`);

    // Prüfe auf fehlende Tasks
    const missingTasks = [];
    const extraTasks = [];

    // Vergleiche Haupttasks
    for (const originalTask of originalMain) {
      const found = splitMain.find(splitTask => 
        splitTask.title === originalTask.title && 
        splitTask.status === originalTask.status
      );
      if (!found) {
        missingTasks.push(originalTask);
      }
    }

    // Prüfe auf zusätzliche Tasks
    for (const splitTask of splitMain) {
      const found = originalMain.find(originalTask => 
        originalTask.title === splitTask.title && 
        originalTask.status === splitTask.status
      );
      if (!found) {
        extraTasks.push(splitTask);
      }
    }

    // Gleiche Prüfung für Subtasks
    for (const originalTask of originalSub) {
      const found = splitSub.find(splitTask => 
        splitTask.title === originalTask.title && 
        splitTask.status === originalTask.status
      );
      if (!found) {
        missingTasks.push(originalTask);
      }
    }

    for (const splitTask of splitSub) {
      const found = originalSub.find(originalTask => 
        originalTask.title === splitTask.title && 
        originalTask.status === splitTask.status
      );
      if (!found) {
        extraTasks.push(splitTask);
      }
    }

    // Ergebnis
    console.log(`\n✅ Ergebnis:`);
    if (missingTasks.length === 0 && extraTasks.length === 0) {
      console.log(`🎉 PERFEKT! Keine Tasks verloren oder hinzugefügt!`);
      console.log(`📊 Alle ${originalTasks.length} Tasks wurden korrekt übertragen.`);
    } else {
      if (missingTasks.length > 0) {
        console.log(`❌ ${missingTasks.length} Tasks verloren:`);
        missingTasks.forEach(task => {
          console.log(`   - ${task.title} (${task.type})`);
        });
      }
      if (extraTasks.length > 0) {
        console.log(`⚠️  ${extraTasks.length} zusätzliche Tasks:`);
        extraTasks.forEach(task => {
          console.log(`   + ${task.title} (${task.type})`);
        });
      }
    }

    return {
      originalCount: originalTasks.length,
      splitCount: splitTasks.length,
      missingTasks,
      extraTasks,
      perfect: missingTasks.length === 0 && extraTasks.length === 0
    };
  }
}

// Führe Verifikation aus
if (require.main === module) {
  const verifier = new TaskVerification();
  verifier.compareTasks();
}

module.exports = TaskVerification;
