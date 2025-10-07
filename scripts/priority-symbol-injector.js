#!/usr/bin/env node

/**
 * Priority Symbol Injector
 * Fügt automatisch Prioritäts-Symbole in Markdown-Dateien ein
 */

const fs = require('fs');
const path = require('path');

class PrioritySymbolInjector {
  constructor() {
    this.datesDir = './core/dates';
    this.symbols = {
      'high': '🔥',
      'medium': '', // Kein Symbol für medium (Standard)
      'low': '🌅'
    };
  }

  /**
   * Injiziert Symbole in alle Datumsdateien
   */
  injectSymbolsInAllFiles() {
    if (!fs.existsSync(this.datesDir)) {
      console.log(`📁 Verzeichnis nicht gefunden: ${this.datesDir}`);
      return [];
    }

    const files = fs.readdirSync(this.datesDir)
      .filter(file => file.endsWith('.md') && file.match(/^\d{4}-\d{2}-\d{2}/));

    const updatedFiles = [];
    
    files.forEach(file => {
      const filePath = path.join(this.datesDir, file);
      const updated = this.injectSymbolsInFile(filePath);
      if (updated) {
        updatedFiles.push(filePath);
      }
    });

    console.log(`✅ ${updatedFiles.length} Dateien aktualisiert`);
    return updatedFiles;
  }

  /**
   * Injiziert Symbole in eine einzelne Datei
   */
  injectSymbolsInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    const lines = content.split('\n');
    const updatedLines = lines.map(line => {
      const updatedLine = this.injectSymbolInLine(line);
      if (updatedLine !== line) {
        updated = true;
      }
      return updatedLine;
    });
    
    if (updated) {
      const newContent = updatedLines.join('\n');
      fs.writeFileSync(filePath, newContent);
      console.log(`📝 Symbole injiziert: ${path.basename(filePath)}`);
    }
    
    return updated;
  }

  /**
   * Injiziert Symbol in eine einzelne Zeile
   */
  injectSymbolInLine(line) {
    // Nur Task-Zeilen verarbeiten (beginnen mit - [ ] oder - [x])
    const taskMatch = line.match(/^(\s*-\s*\[[ x]\]\s*)(.*)$/);
    if (!taskMatch) {
      return line;
    }

    const [, checkbox, title] = taskMatch;
    const cleanTitle = title.trim();
    
    // Prüfe ob bereits ein Symbol vorhanden ist
    if (this.hasPrioritySymbol(cleanTitle)) {
      return line; // Bereits Symbol vorhanden
    }
    
    // Bestimme Priorität basierend auf Inhalt
    const priority = this.determinePriorityFromContent(cleanTitle);
    const symbol = this.symbols[priority];
    
    // Füge Symbol hinzu (nur wenn es eins gibt)
    if (symbol) {
      const newTitle = `${symbol} ${cleanTitle}`;
      return `${checkbox}${newTitle}`;
    }
    
    return line;
  }

  /**
   * Prüft ob bereits ein Prioritäts-Symbol vorhanden ist
   */
  hasPrioritySymbol(title) {
    return title.includes('🔥') || title.includes('📅') || title.includes('💰') || title.includes('🌅');
  }

  /**
   * Bestimmt Priorität basierend auf Inhalt
   */
  determinePriorityFromContent(title) {
    const lowerTitle = title.toLowerCase();
    
    // High Priority Keywords
    if (lowerTitle.includes('!!!') || 
        lowerTitle.includes('urgent') || 
        lowerTitle.includes('wichtig') ||
        lowerTitle.includes('dringend') ||
        lowerTitle.includes('asap') ||
        lowerTitle.includes('sofort')) {
      return 'high';
    }
    
    // Low Priority Keywords
    if (lowerTitle.includes('optional') || 
        lowerTitle.includes('später') ||
        lowerTitle.includes('wenn zeit') ||
        lowerTitle.includes('nice to have') ||
        lowerTitle.includes('morgen') ||
        lowerTitle.includes('morning')) {
      return 'low';
    }
    
    // Business/Important Keywords = High
    if (lowerTitle.includes('workshop') ||
        lowerTitle.includes('meeting') ||
        lowerTitle.includes('deadline') ||
        lowerTitle.includes('präsentation') ||
        lowerTitle.includes('check24') ||
        lowerTitle.includes('push')) {
      return 'high';
    }
    
    // Standard = Medium (kein Symbol)
    return 'medium';
  }

  /**
   * Zeigt Statistiken über injizierte Symbole
   */
  showStats() {
    if (!fs.existsSync(this.datesDir)) {
      console.log('📁 Kein dates-Verzeichnis gefunden');
      return;
    }

    const files = fs.readdirSync(this.datesDir)
      .filter(file => file.endsWith('.md') && file.match(/^\d{4}-\d{2}-\d{2}/));

    let totalTasks = 0;
    let highPriorityTasks = 0;
    let mediumPriorityTasks = 0;
    let lowPriorityTasks = 0;

    files.forEach(file => {
      const content = fs.readFileSync(path.join(this.datesDir, file), 'utf8');
      const lines = content.split('\n');
      
      lines.forEach(line => {
        const taskMatch = line.match(/^(\s*-\s*\[[ x]\]\s*)(.*)$/);
        if (taskMatch) {
          totalTasks++;
          const title = taskMatch[2].trim();
          
          if (title.includes('🔥')) {
            highPriorityTasks++;
          } else if (title.includes('🌅')) {
            lowPriorityTasks++;
          } else {
            mediumPriorityTasks++;
          }
        }
      });
    });

    console.log('\n📊 Priority Symbol Statistiken:');
    console.log(`   • Tasks gesamt: ${totalTasks}`);
    console.log(`   • 🔥 Hochpriorität: ${highPriorityTasks}`);
    console.log(`   • ⚡ Mittelpriorität (ohne Symbol): ${mediumPriorityTasks}`);
    console.log(`   • 🌅 Niedrigpriorität: ${lowPriorityTasks}`);
    console.log(`   • Dateien verarbeitet: ${files.length}`);
  }

  /**
   * Entfernt alle Prioritäts-Symbole (Cleanup)
   */
  removeAllSymbols() {
    if (!fs.existsSync(this.datesDir)) {
      console.log(`📁 Verzeichnis nicht gefunden: ${this.datesDir}`);
      return [];
    }

    const files = fs.readdirSync(this.datesDir)
      .filter(file => file.endsWith('.md') && file.match(/^\d{4}-\d{2}-\d{2}/));

    const updatedFiles = [];
    
    files.forEach(file => {
      const filePath = path.join(this.datesDir, file);
      let content = fs.readFileSync(filePath, 'utf8');
      let updated = false;
      
      // Entferne alle Prioritäts-Symbole
      const symbols = ['🔥', '📅', '💰', '🌅'];
      symbols.forEach(symbol => {
        if (content.includes(symbol)) {
          content = content.replace(new RegExp(`\\s*${symbol}\\s*`, 'g'), ' ');
          updated = true;
        }
      });
      
      if (updated) {
        fs.writeFileSync(filePath, content);
        updatedFiles.push(filePath);
        console.log(`🧹 Symbole entfernt: ${path.basename(filePath)}`);
      }
    });

    console.log(`✅ ${updatedFiles.length} Dateien bereinigt`);
    return updatedFiles;
  }
}

/**
 * CLI-Interface
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const injector = new PrioritySymbolInjector();

  switch (command) {
    case 'inject':
      injector.injectSymbolsInAllFiles();
      break;

    case 'stats':
      injector.showStats();
      break;

    case 'clean':
      injector.removeAllSymbols();
      break;

    case 'file':
      if (args.length < 2) {
        console.log('Verwendung: node priority-symbol-injector.js file <datei.md>');
        return;
      }
      injector.injectSymbolsInFile(args[1]);
      break;

    default:
      console.log('🎯 Priority Symbol Injector');
      console.log('');
      console.log('Verwendung:');
      console.log('  node priority-symbol-injector.js inject  - Injiziert Symbole in alle Dateien');
      console.log('  node priority-symbol-injector.js stats   - Zeigt Statistiken');
      console.log('  node priority-symbol-injector.js clean   - Entfernt alle Symbole');
      console.log('  node priority-symbol-injector.js file <datei> - Injiziert in eine Datei');
      console.log('');
      console.log('Symbole:');
      console.log('  🔥 = Hochpriorität (high)');
      console.log('  (kein Symbol) = Mittelpriorität (medium) - Standard');
      console.log('  🌅 = Niedrigpriorität (low)');
      break;
  }
}

// Script ausführen
if (require.main === module) {
  main();
}

module.exports = PrioritySymbolInjector;
