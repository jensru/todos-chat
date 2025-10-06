#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const MultiFileMarkdownParser = require('./multi-file-markdown-parser');
const SmartTaskEnhancer = require('./smart-task-enhancer');

class MarkdownFileWatcher {
  constructor() {
    this.datesDir = './core/dates';
    this.watchers = new Map();
    this.parser = new MultiFileMarkdownParser();
    this.enhancer = new SmartTaskEnhancer();
  }

  // Starte File-Watching für alle Dateien im dates Verzeichnis
  startWatching() {
    console.log('👀 Starte File-Watching für Markdown-Dateien...');
    
    if (!fs.existsSync(this.datesDir)) {
      console.error('❌ Dates-Verzeichnis nicht gefunden:', this.datesDir);
      return;
    }

    // Watch das gesamte Verzeichnis
    fs.watch(this.datesDir, { recursive: false }, (eventType, filename) => {
      if (filename && filename.endsWith('.md') && filename !== 'index.md') {
        console.log(`📝 Datei geändert: ${filename} (${eventType})`);
        this.handleFileChange(filename);
      }
    });

    console.log('✅ File-Watching aktiv für:', this.datesDir);
  }

  // Behandle Dateiänderungen
  async handleFileChange(filename) {
    try {
      console.log(`🔄 Synchronisiere Änderungen in ${filename}...`);
      
      // Kleine Verzögerung, um sicherzustellen, dass die Datei vollständig geschrieben ist
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Synchronisiere einzelne Datei
      this.parser.syncSingleFile(filename);
      
      // Führe Smart Task Enhancement aus
      this.enhancer.enhanceTasks();
      
      console.log(`✅ ${filename} erfolgreich synchronisiert`);
      
    } catch (error) {
      console.error(`❌ Fehler bei Synchronisation von ${filename}:`, error);
    }
  }

  // Stoppe alle Watcher
  stopWatching() {
    console.log('🛑 Stoppe File-Watching...');
    // Node.js fs.watch hat keine explizite stop-Methode
    // Der Watcher wird automatisch gestoppt, wenn der Prozess beendet wird
  }
}

// Starte File-Watching, wenn direkt aufgerufen
if (require.main === module) {
  const watcher = new MarkdownFileWatcher();
  
  // Graceful Shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Beende File-Watcher...');
    watcher.stopWatching();
    process.exit(0);
  });

  watcher.startWatching();
  
  console.log('📡 File-Watcher läuft. Drücke Ctrl+C zum Beenden.');
}

module.exports = MarkdownFileWatcher;
