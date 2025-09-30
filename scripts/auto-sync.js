#!/usr/bin/env node

/**
 * Automatisches Sync-System
 * Überwacht Markdown-Dateien und synchronisiert automatisch mit der JSON-Datenbank
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

class AutoSyncService {
  constructor() {
    this.watchPaths = [
      './core/Dashboard - Strukturierte To-do-Übersicht.md',
      './core/right-sidebar.md'
    ];
    this.isWatching = false;
    this.lastSync = new Date();
    this.syncLog = [];
  }

  /**
   * Startet den File-Watcher
   */
  startWatching() {
    if (this.isWatching) {
      console.log('⚠️  File-Watcher läuft bereits');
      return;
    }

    console.log('🔄 Starte automatisches Sync-System...');
    
    this.watchPaths.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        this.watchFile(filePath);
      } else {
        console.log(`⚠️  Datei nicht gefunden: ${filePath}`);
      }
    });

    this.isWatching = true;
    console.log('✅ File-Watcher aktiv - überwache Markdown-Änderungen');
    console.log('📁 Überwachte Dateien:');
    this.watchPaths.forEach(path => console.log(`   • ${path}`));
  }

  /**
   * Überwacht eine einzelne Datei
   */
  watchFile(filePath) {
    fs.watchFile(filePath, { interval: 1000 }, (curr, prev) => {
      if (curr.mtime > prev.mtime) {
        console.log(`📝 Änderung erkannt: ${filePath}`);
        this.syncFile(filePath);
      }
    });
  }

  /**
   * Synchronisiert eine Datei mit der Datenbank
   */
  async syncFile(filePath) {
    try {
      console.log(`🔄 Synchronisiere: ${filePath}`);
      
      // Markdown zu JSON parsen
      const { exec } = require('child_process');
      const parseCommand = `node scripts/markdown-parser.js "${filePath}"`;
      
      exec(parseCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`❌ Parse-Fehler: ${error.message}`);
          return;
        }
        
        if (stderr) {
          console.error(`⚠️  Parse-Warnung: ${stderr}`);
        }
        
        console.log(`✅ Synchronisiert: ${filePath}`);
        this.logSync(filePath, 'success');
        
        // Website aktualisieren
        this.updateWebsite();
      });
      
    } catch (error) {
      console.error(`❌ Sync-Fehler: ${error.message}`);
      this.logSync(filePath, 'error', error.message);
    }
  }

  /**
   * Aktualisiert die Website mit neuen Daten
   */
  updateWebsite() {
    console.log('🌐 Aktualisiere Website...');
    
    // Einfache Website-Aktualisierung ohne komplexe Variablen-Substitution
    const websitePath = './web/index.html';
    
    if (fs.existsSync(websitePath)) {
      // Lese aktuelle Website
      let websiteContent = fs.readFileSync(websitePath, 'utf8');
      
      // Aktualisiere Zeitstempel
      const timestamp = new Date().toLocaleString('de-DE');
      websiteContent = websiteContent.replace(
        /_Letzte Aktualisierung: .*_/,
        `_Letzte Aktualisierung: ${timestamp}_`
      );
      
      // Schreibe aktualisierte Website
      fs.writeFileSync(websitePath, websiteContent);
      console.log('✅ Website aktualisiert');
    }
  }

  /**
   * Protokolliert Sync-Aktivitäten
   */
  logSync(filePath, status, error = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      file: filePath,
      status: status,
      error: error
    };
    
    this.syncLog.push(logEntry);
    
    // Nur die letzten 50 Einträge behalten
    if (this.syncLog.length > 50) {
      this.syncLog = this.syncLog.slice(-50);
    }
    
    // Log in Datei speichern
    this.saveSyncLog();
  }

  /**
   * Speichert das Sync-Log
   */
  saveSyncLog() {
    const logPath = './data/sync-log.json';
    const logData = {
      last_sync: this.lastSync.toISOString(),
      total_syncs: this.syncLog.length,
      recent_syncs: this.syncLog.slice(-10)
    };
    
    fs.writeFileSync(logPath, JSON.stringify(logData, null, 2));
  }

  /**
   * Stoppt den File-Watcher
   */
  stopWatching() {
    if (!this.isWatching) {
      console.log('⚠️  File-Watcher läuft nicht');
      return;
    }

    this.watchPaths.forEach(filePath => {
      fs.unwatchFile(filePath);
    });

    this.isWatching = false;
    console.log('⏹️  File-Watcher gestoppt');
  }

  /**
   * Zeigt Sync-Statistiken
   */
  showStats() {
    console.log('\n📊 Sync-Statistiken:');
    console.log(`   • Letzte Synchronisation: ${this.lastSync.toLocaleString('de-DE')}`);
    console.log(`   • Gesamt Syncs: ${this.syncLog.length}`);
    console.log(`   • Status: ${this.isWatching ? '🟢 Aktiv' : '🔴 Inaktiv'}`);
    
    if (this.syncLog.length > 0) {
      const recentSyncs = this.syncLog.slice(-5);
      console.log('\n📝 Letzte Syncs:');
      recentSyncs.forEach(sync => {
        const status = sync.status === 'success' ? '✅' : '❌';
        const time = new Date(sync.timestamp).toLocaleTimeString('de-DE');
        console.log(`   ${status} ${time} - ${path.basename(sync.file)}`);
      });
    }
  }

  /**
   * Führt eine manuelle Synchronisation durch
   */
  async manualSync() {
    console.log('🔄 Führe manuelle Synchronisation durch...');
    
    for (const filePath of this.watchPaths) {
      if (fs.existsSync(filePath)) {
        await this.syncFile(filePath);
      }
    }
    
    console.log('✅ Manuelle Synchronisation abgeschlossen');
  }
}

/**
 * CLI-Interface
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const syncService = new AutoSyncService();
  
  switch (command) {
    case 'start':
      syncService.startWatching();
      
      // Graceful shutdown
      process.on('SIGINT', () => {
        console.log('\n🛑 Beende File-Watcher...');
        syncService.stopWatching();
        process.exit(0);
      });
      
      // Keep process alive
      setInterval(() => {
        // Heartbeat
      }, 1000);
      break;
    
    case 'stop':
      syncService.stopWatching();
      break;
    
    case 'sync':
      syncService.manualSync();
      break;
    
    case 'stats':
      syncService.showStats();
      break;
    
    default:
      console.log('Verwendung:');
      console.log('  node auto-sync.js start    - Startet File-Watcher');
      console.log('  node auto-sync.js stop     - Stoppt File-Watcher');
      console.log('  node auto-sync.js sync     - Manuelle Synchronisation');
      console.log('  node auto-sync.js stats    - Zeigt Statistiken');
      break;
  }
}

// Script ausführen
if (require.main === module) {
  main();
}

module.exports = AutoSyncService;




