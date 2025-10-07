#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Markdown Formatter
 * Formatiert alle Markdown-Dateien mit korrekten Prioritäts- und Kategorie-Symbolen
 */
class MarkdownFormatter {
  constructor() {
    this.datesDir = './core/dates';
    this.dashboardFile = './core/Dashboard - Strukturierte To-do-Übersicht.md';
  }

  /**
   * Formatiert alle Markdown-Dateien
   */
  async formatAllMarkdowns() {
    console.log('🎨 Formatiere alle Markdown-Dateien...');
    
    // Formatiere Dashboard
    await this.formatFile(this.dashboardFile);
    
    // Formatiere alle Datumsdateien
    const files = fs.readdirSync(this.datesDir);
    const markdownFiles = files.filter(file => file.endsWith('.md'));
    
    for (const file of markdownFiles) {
      const filePath = path.join(this.datesDir, file);
      await this.formatFile(filePath);
    }
    
    console.log('✅ Alle Markdown-Dateien formatiert!');
  }

  /**
   * Formatiert eine einzelne Markdown-Datei
   */
  async formatFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Datei nicht gefunden: ${filePath}`);
        return;
      }

      console.log(`📝 Formatiere: ${filePath}`);
      
      let content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      let hasChanges = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Nur Task-Zeilen verarbeiten
        if (line.match(/^- \[[ x]\]/)) {
          const formattedLine = this.formatTaskLine(line);
          if (formattedLine !== line) {
            lines[i] = formattedLine;
            hasChanges = true;
            console.log(`   Zeile ${i + 1}: ${line.trim()} → ${formattedLine.trim()}`);
          }
        }
      }

      if (hasChanges) {
        const newContent = lines.join('\n');
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ ${filePath} formatiert`);
      } else {
        console.log(`ℹ️  ${filePath} bereits korrekt formatiert`);
      }

    } catch (error) {
      console.error(`❌ Fehler beim Formatieren von ${filePath}:`, error.message);
    }
  }

  /**
   * Formatiert eine einzelne Task-Zeile
   */
  formatTaskLine(line) {
    // Extrahiere Checkbox-Status
    const checkboxMatch = line.match(/^- \[([ x])\]/);
    if (!checkboxMatch) return line;
    
    const status = checkboxMatch[1];
    
    // Extrahiere den reinen Task-Titel (ohne alle Symbole)
    let cleanTitle = line.replace(/^- \[[ x]\]\s*/, ''); // Entferne Checkbox
    cleanTitle = cleanTitle.replace(/\s*[🔥📅💰🌅]\s*/g, ''); // Entferne alle Prioritäts-Symbole
    cleanTitle = cleanTitle.replace(/\s*📁\s*[^-\s]+/g, ''); // Entferne Kategorie-Symbole
    cleanTitle = cleanTitle.trim();
    
    // Bestimme Priorität basierend auf Inhalt
    let priority = 'medium'; // Standard
    if (this.isHighPriority(cleanTitle)) {
      priority = 'high';
    } else if (this.isLowPriority(cleanTitle)) {
      priority = 'low';
    }
    
    // Bestimme Kategorie basierend auf Inhalt
    let category = 'General'; // Standard
    const detectedCategory = this.detectCategory(cleanTitle);
    if (detectedCategory) {
      category = detectedCategory;
    }
    
    // Erstelle neue Zeile mit korrekter Formatierung
    let newLine = `- [${status}] ${cleanTitle}`;
    
    // Füge Priorität hinzu (nur wenn nicht medium)
    if (priority === 'high') {
      newLine += ' 🔥';
    } else if (priority === 'low') {
      newLine += ' 🌅';
    }
    // medium = kein Symbol (Standard)
    
    // Füge Kategorie hinzu (nur wenn nicht General)
    if (category && category !== 'General') {
      newLine += ` 📁 ${category}`;
    }
    
    return newLine;
  }

  /**
   * Bestimmt ob ein Task hohe Priorität hat
   */
  isHighPriority(title) {
    const highPriorityKeywords = [
      'urgent', 'dringend', 'wichtig', 'important', 'asap', 'sofort',
      'push', 'präse', 'presentation', 'deadline', 'fällig',
      'coaching', 'meeting', 'termin', 'appointment'
    ];
    
    const lowerTitle = title.toLowerCase();
    return highPriorityKeywords.some(keyword => lowerTitle.includes(keyword));
  }

  /**
   * Bestimmt ob ein Task niedrige Priorität hat
   */
  isLowPriority(title) {
    const lowPriorityKeywords = [
      'sortieren', 'aufräumen', 'cleanup', 'organize',
      'tabs', 'bookmarks', 'links', 'verzeichnis',
      'routine', 'daily', 'wiederholend'
    ];
    
    const lowerTitle = title.toLowerCase();
    return lowPriorityKeywords.some(keyword => lowerTitle.includes(keyword));
  }

  /**
   * Erkennt Kategorie basierend auf Inhalt
   */
  detectCategory(title) {
    const categoryPatterns = {
      'Business': ['coaching', 'meeting', 'termin', 'business', 'geschäft', 'kunde', 'client'],
      'Development': ['code', 'programming', 'dev', 'entwicklung', 'software', 'app', 'website'],
      'Marketing': ['marketing', 'social', 'linkedin', 'post', 'content', 'werbung'],
      'Personal': ['personal', 'privat', 'haushalt', 'sortieren', 'aufräumen', 'tabs'],
      'Urgent': ['urgent', 'dringend', 'asap', 'sofort', 'deadline', 'fällig'],
      'PUSH': ['push', 'präse', 'presentation', 'vortrag', 'konferenz']
    };
    
    const lowerTitle = title.toLowerCase();
    
    for (const [category, keywords] of Object.entries(categoryPatterns)) {
      if (keywords.some(keyword => lowerTitle.includes(keyword))) {
        return category;
      }
    }
    
    return null;
  }
}

// Führe Formatierung aus, wenn direkt aufgerufen
if (require.main === module) {
  const formatter = new MarkdownFormatter();
  formatter.formatAllMarkdowns()
    .then(() => {
      console.log('🎉 Markdown-Formatierung abgeschlossen!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Fehler:', error);
      process.exit(1);
    });
}

module.exports = MarkdownFormatter;
