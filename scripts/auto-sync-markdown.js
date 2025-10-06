#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { MarkdownTaskParser } = require('./markdown-parser');
const SmartTaskEnhancer = require('./smart-task-enhancer');

class AutoSyncMarkdown {
  constructor() {
    this.markdownFile = './core/Dashboard - Strukturierte To-do-Übersicht.md';
    this.jsonFile = './data/tasks.json';
    this.smartTasksFile = './data/smart-tasks.json';
    this.parser = new MarkdownTaskParser();
    this.enhancer = new SmartTaskEnhancer();
  }

  async sync() {
    try {
      console.log('🔄 Starte automatische Markdown-Synchronisation...');
      
      // 1. Parse Markdown zu JSON
      console.log('📝 Parse Markdown zu JSON...');
      const { exec } = require('child_process');
      const util = require('util');
      const execAsync = util.promisify(exec);
      
      await execAsync('node scripts/markdown-parser.js');
      
      // 2. Smart Task Enhancement
      console.log('🧠 Führe Smart Task Enhancement durch...');
      await execAsync('node scripts/smart-task-enhancer.js');
      
      console.log('✅ Automatische Synchronisation abgeschlossen!');
      
    } catch (error) {
      console.error('❌ Fehler bei der automatischen Synchronisation:', error);
    }
  }
}

// Führe Synchronisation aus, wenn direkt aufgerufen
if (require.main === module) {
  const autoSync = new AutoSyncMarkdown();
  autoSync.sync();
}

module.exports = AutoSyncMarkdown;
