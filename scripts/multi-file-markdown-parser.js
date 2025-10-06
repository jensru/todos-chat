#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { MarkdownTaskParser } = require('./markdown-parser');
const CompletedTaskRemover = require('./remove-completed-tasks');

class MultiFileMarkdownParser {
  constructor() {
    this.datesDir = './core/dates';
    this.outputFile = './data/tasks.json';
    this.parser = new MarkdownTaskParser();
  }

  // Parse alle Dateien im dates Verzeichnis
  parseAllDateFiles() {
    console.log('🔄 Parse alle Datumsdateien...');
    
    if (!fs.existsSync(this.datesDir)) {
      console.error('❌ Dates-Verzeichnis nicht gefunden:', this.datesDir);
      return;
    }

    const files = fs.readdirSync(this.datesDir)
      .filter(file => file.endsWith('.md') && file !== 'index.md')
      .sort(); // Chronologische Sortierung

    console.log(`📁 ${files.length} Datumsdateien gefunden`);

    // Sammle alle Tasks aus allen Dateien
    const allTasks = [];
    const allProjects = [];

    for (const file of files) {
      const filePath = path.join(this.datesDir, file);
      console.log(`📝 Parse ${file}...`);
      
      // Parse einzelne Datei
      this.parser.parseMarkdownFile(filePath);
      
      // Sammle Tasks und Projekte
      allTasks.push(...this.parser.tasks);
      allProjects.push(...this.parser.projects);
      
      console.log(`✅ ${file}: ${this.parser.tasks.length} Tasks`);
    }

    // Erstelle kombiniertes Ergebnis
    const result = {
      tasks: allTasks,
      projects: allProjects,
      metadata: {
        totalTasks: allTasks.length,
        totalProjects: allProjects.length,
        sourceFiles: files,
        parsedAt: new Date().toISOString(),
        parser: 'MultiFileMarkdownParser'
      }
    };

    // Speichere in JSON
    fs.writeFileSync(this.outputFile, JSON.stringify(result, null, 2));
    
    // Automatische Bereinigung erledigter Tasks
    console.log('\n🧹 Führe automatische Bereinigung durch...');
    const remover = new CompletedTaskRemover();
    remover.removeCompletedFromDashboard();
    
    // Smart Task Enhancement für bessere Web-Darstellung
    console.log('\n🧠 Führe Smart Task Enhancement durch...');
    const SmartTaskEnhancer = require('./smart-task-enhancer');
    const enhancer = new SmartTaskEnhancer();
    enhancer.enhanceAllTasks();
    
    console.log('✅ Multi-File-Parsing abgeschlossen!');
    console.log(`📊 ${allTasks.length} Tasks aus ${files.length} Dateien`);
    
    // Web-Interface automatisch aktualisieren (Server lädt neue Daten automatisch)
    console.log('🌐 Web-Interface: http://localhost:3001/index.html');
    console.log('💡 Tipp: Aktualisieren Sie die Seite (Cmd+R) um die neuesten Änderungen zu sehen');
    
    return result;
  }

  // Synchronisiere Änderungen von einzelnen Dateien zurück zur Datenbank
  syncSingleFile(fileName) {
    console.log(`🔄 Synchronisiere ${fileName}...`);
    
    const filePath = path.join(this.datesDir, fileName);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Datei nicht gefunden: ${filePath}`);
      return;
    }

    // Parse nur diese eine Datei
    this.parser.parseMarkdownFile(filePath);
    
    // Lade bestehende Tasks
    let existingData = { tasks: [], projects: [] };
    if (fs.existsSync(this.outputFile)) {
      existingData = JSON.parse(fs.readFileSync(this.outputFile, 'utf8'));
    }

    // Entferne alte Tasks für dieses Datum
    const dateKey = fileName.replace('.md', '');
    existingData.tasks = existingData.tasks.filter(task => 
      !task.source_file || !task.source_file.includes(fileName)
    );

    // Füge neue Tasks hinzu
    existingData.tasks.push(...this.parser.tasks);
    existingData.projects.push(...this.parser.projects);

    // Aktualisiere Metadaten
    existingData.metadata = {
      ...existingData.metadata,
      totalTasks: existingData.tasks.length,
      totalProjects: existingData.projects.length,
      lastSync: new Date().toISOString(),
      lastSyncedFile: fileName
    };

    // Speichere aktualisierte Daten
    fs.writeFileSync(this.outputFile, JSON.stringify(existingData, null, 2));
    
    console.log(`✅ ${fileName} synchronisiert: ${this.parser.tasks.length} Tasks`);
  }
}

// Führe Parsing aus, wenn direkt aufgerufen
if (require.main === module) {
  const parser = new MultiFileMarkdownParser();
  
  // Prüfe Kommandozeilenargumente
  const args = process.argv.slice(2);
  if (args.length > 0) {
    // Synchronisiere einzelne Datei
    parser.syncSingleFile(args[0]);
  } else {
    // Parse alle Dateien
    parser.parseAllDateFiles();
  }
}

module.exports = MultiFileMarkdownParser;
