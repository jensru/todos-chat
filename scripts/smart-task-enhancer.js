#!/usr/bin/env node

/**
 * Smart Task Enhancement System
 * Erweitert Tasks mit intelligenten Metadaten und Due Dates
 */

const fs = require('fs');
const path = require('path');

class SmartTaskEnhancer {
  constructor() {
    this.tasksFile = './data/tasks.json';
    this.enhancedTasksFile = './data/smart-tasks.json';
  }

  // Lade aktuelle Tasks
  loadTasks() {
    try {
      const data = fs.readFileSync(this.tasksFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Fehler beim Laden der Tasks:', error);
      return { tasks: [] };
    }
  }

  // Speichere erweiterte Tasks
  saveEnhancedTasks(enhancedTasks) {
    try {
      fs.writeFileSync(this.enhancedTasksFile, JSON.stringify(enhancedTasks, null, 2));
      console.log('✅ Enhanced Tasks gespeichert');
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
    }
  }

  // Erkenne Due Dates aus Task-Titel
  extractDueDate(task) {
    const title = task.title.toLowerCase();
    
    // Datum-Patterns
    const patterns = [
      { pattern: /(\d{1,2})\.(\d{1,2})\.(\d{4})/, format: 'DD.MM.YYYY' },
      { pattern: /(\d{1,2})\.(\d{1,2})/, format: 'DD.MM' },
      { pattern: /heute|today/, format: 'today' },
      { pattern: /morgen|tomorrow/, format: 'tomorrow' },
      { pattern: /nächste woche|next week/, format: 'next_week' },
      { pattern: /diese woche|this week/, format: 'this_week' },
      { pattern: /ende der woche|end of week/, format: 'end_of_week' }
    ];

    for (const { pattern, format } of patterns) {
      const match = title.match(pattern);
      if (match) {
        return this.parseDate(match, format);
      }
    }

    return null;
  }

  // Parse Datum basierend auf Format
  parseDate(match, format) {
    const today = new Date();
    
    switch (format) {
      case 'today':
        return today.toISOString().split('T')[0];
      
      case 'tomorrow':
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
      
      case 'this_week':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1);
        return startOfWeek.toISOString().split('T')[0];
      
      case 'next_week':
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() - today.getDay() + 8);
        return nextWeek.toISOString().split('T')[0];
      
      case 'end_of_week':
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() - today.getDay() + 5);
        return endOfWeek.toISOString().split('T')[0];
      
      case 'DD.MM.YYYY':
        const [, day, month, year] = match;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      
      case 'DD.MM':
        const [, day2, month2] = match;
        const currentYear = today.getFullYear();
        return `${currentYear}-${month2.padStart(2, '0')}-${day2.padStart(2, '0')}`;
      
      default:
        return null;
    }
  }

  // Erkenne Priorität aus Task-Titel
  extractPriority(task) {
    const title = task.title.toLowerCase();
    
    // Hohe Priorität
    if (title.includes('🔥') || title.includes('urgent') || title.includes('dringend') || 
        title.includes('!!!') || title.includes('wichtig') || title.includes('sofort')) {
      return 'high';
    }
    
    // Niedrige Priorität
    if (title.includes('📝') || title.includes('low') || title.includes('niedrig') || 
        title.includes('später') || title.includes('optional')) {
      return 'low';
    }
    
    // Mittlere Priorität (Standard)
    return 'medium';
  }

  // Erkenne Tags aus Task-Titel
  extractTags(task) {
    const title = task.title.toLowerCase();
    const tags = [];
    
    // Business Tags
    if (title.includes('business') || title.includes('verkauf') || title.includes('kunde') || 
        title.includes('sales') || title.includes('lead')) {
      tags.push('business');
    }
    
    // Development Tags
    if (title.includes('tool') || title.includes('entwicklung') || title.includes('code') || 
        title.includes('programmierung') || title.includes('alloy')) {
      tags.push('development');
    }
    
    // Marketing Tags
    if (title.includes('marketing') || title.includes('post') || title.includes('linkedin') || 
        title.includes('content') || title.includes('workshop')) {
      tags.push('marketing');
    }
    
    // PUSH Tags
    if (title.includes('push') || title.includes('präse') || title.includes('präsentation')) {
      tags.push('PUSH');
    }
    
    // Meeting Tags
    if (title.includes('meeting') || title.includes('termin') || title.includes('besprechung')) {
      tags.push('meeting');
    }
    
    // Personal Tags
    if (title.includes('persönlich') || title.includes('gesundheit') || title.includes('arzt') || 
        title.includes('versicherung') || title.includes('steuer')) {
      tags.push('personal');
    }
    
    // Urgent Tags
    if (title.includes('🔥') || title.includes('urgent') || title.includes('dringend')) {
      tags.push('urgent');
    }
    
    return tags;
  }

  // Berechne Task-Komplexität
  calculateComplexity(task) {
    let complexity = 1; // Basis-Komplexität
    
    // Subtasks erhöhen Komplexität
    if (task.subtasks && task.subtasks.length > 0) {
      complexity += task.subtasks.length * 0.5;
    }
    
    // Lange Titel = komplexer
    if (task.title.length > 100) {
      complexity += 1;
    }
    
    // Spezielle Keywords
    const title = task.title.toLowerCase();
    if (title.includes('workshop') || title.includes('präsentation') || title.includes('meeting')) {
      complexity += 1;
    }
    
    if (title.includes('entwicklung') || title.includes('programmierung') || title.includes('tool')) {
      complexity += 1.5;
    }
    
    return Math.min(complexity, 5); // Max 5
  }

  // Berechne geschätzte Dauer
  estimateDuration(task) {
    const complexity = this.calculateComplexity(task);
    const title = task.title.toLowerCase();
    
    let baseMinutes = 30; // Basis 30 Minuten
    
    // Anpassung basierend auf Komplexität
    baseMinutes *= complexity;
    
    // Spezielle Anpassungen
    if (title.includes('meeting') || title.includes('besprechung')) {
      baseMinutes = 60; // Meetings = 1 Stunde
    }
    
    if (title.includes('workshop') || title.includes('präsentation')) {
      baseMinutes = 120; // Workshops = 2 Stunden
    }
    
    if (title.includes('entwicklung') || title.includes('programmierung')) {
      baseMinutes = 180; // Development = 3 Stunden
    }
    
    return Math.round(baseMinutes);
  }

  // Berechne Deadline-Status
  calculateDeadlineStatus(task) {
    if (!task.due_date) return 'no_deadline';
    
    const today = new Date();
    const dueDate = new Date(task.due_date);
    const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'overdue';
    if (diffDays === 0) return 'due_today';
    if (diffDays === 1) return 'due_tomorrow';
    if (diffDays <= 3) return 'due_soon';
    if (diffDays <= 7) return 'due_this_week';
    
    return 'due_later';
  }

  // Erweitere einzelne Task
  enhanceTask(task) {
    const enhanced = { ...task };
    
    // Due Date extrahieren
    enhanced.due_date = this.extractDueDate(task) || task.due_date;
    
    // Priorität extrahieren
    enhanced.priority = this.extractPriority(task);
    
    // Tags extrahieren und zusammenführen
    const extractedTags = this.extractTags(task);
    enhanced.tags = [...new Set([...(task.tags || []), ...extractedTags])];
    
    // Komplexität berechnen
    enhanced.complexity = this.calculateComplexity(task);
    
    // Geschätzte Dauer
    enhanced.estimated_duration_minutes = this.estimateDuration(task);
    
    // Deadline-Status
    enhanced.deadline_status = this.calculateDeadlineStatus(enhanced);
    
    // Smart Score (0-100)
    enhanced.smart_score = this.calculateSmartScore(enhanced);
    
    // Kategorie (mit Hierarchie-Unterstützung)
    enhanced.category = this.determineCategory(enhanced);
    
    // Parent-Context aus Markdown-Hierarchie
    enhanced.parent_context = this.extractParentContext(enhanced);
    
    // Hierarchie-Level (basierend auf Einrückung im Markdown)
    enhanced.hierarchy_level = this.determineHierarchyLevel(enhanced);
    
    // Erweitere auch Subtasks
    if (enhanced.subtasks && enhanced.subtasks.length > 0) {
      enhanced.subtasks = enhanced.subtasks.map(subtask => ({
        ...subtask,
        hierarchy_level: 2, // Subtasks sind immer Level 2
        parent_task: enhanced.title,
        category: enhanced.category,
        priority: enhanced.priority,
        tags: [...(enhanced.tags || []), 'subtask']
      }));
    }
    
    // Zeitstempel
    enhanced.enhanced_at = new Date().toISOString();
    
    return enhanced;
  }

  // Berechne Smart Score
  calculateSmartScore(task) {
    let score = 50; // Basis-Score
    
    // Priorität
    if (task.priority === 'high') score += 30;
    else if (task.priority === 'medium') score += 15;
    else score += 5;
    
    // Deadline-Status
    switch (task.deadline_status) {
      case 'overdue': score += 40; break;
      case 'due_today': score += 35; break;
      case 'due_tomorrow': score += 25; break;
      case 'due_soon': score += 15; break;
      case 'due_this_week': score += 10; break;
      default: score += 5;
    }
    
    // Tags
    if (task.tags.includes('urgent')) score += 20;
    if (task.tags.includes('business')) score += 15;
    if (task.tags.includes('PUSH')) score += 10;
    
    return Math.min(score, 100);
  }

  // Bestimme Kategorie basierend auf Markdown-Hierarchie
  determineCategory(task) {
    // Zuerst Tags-basierte Kategorien
    if (task.tags.includes('business')) return 'Business';
    if (task.tags.includes('development')) return 'Development';
    if (task.tags.includes('marketing')) return 'Marketing';
    if (task.tags.includes('personal')) return 'Personal';
    if (task.tags.includes('PUSH')) return 'PUSH';
    if (task.tags.includes('meeting')) return 'Meetings';
    
    // Dann Markdown-Hierarchie-basierte Kategorien
    const hierarchyCategory = this.extractHierarchyCategory(task);
    if (hierarchyCategory) return hierarchyCategory;
    
    return 'General';
  }

  // Extrahiere Kategorie aus Markdown-Hierarchie
  extractHierarchyCategory(task) {
    const title = task.title.toLowerCase();
    
    // Zeitbasierte Kategorien
    if (title.includes('montag') || title.includes('monday')) return 'Montag';
    if (title.includes('dienstag') || title.includes('tuesday')) return 'Dienstag';
    if (title.includes('mittwoch') || title.includes('wednesday')) return 'Mittwoch';
    if (title.includes('donnerstag') || title.includes('thursday')) return 'Donnerstag';
    if (title.includes('freitag') || title.includes('friday')) return 'Freitag';
    if (title.includes('wochenende') || title.includes('weekend')) return 'Wochenende';
    
    // Projekt-basierte Kategorien
    if (title.includes('push') || title.includes('präse') || title.includes('präsentation')) return 'PUSH';
    if (title.includes('check24') || title.includes('workshop')) return 'Check24';
    if (title.includes('bene') || title.includes('sustain')) return 'Sustain';
    if (title.includes('alloy') || title.includes('tool')) return 'Tool-Entwicklung';
    
    // Funktions-basierte Kategorien
    if (title.includes('meeting') || title.includes('besprechung') || title.includes('termin')) return 'Meetings';
    if (title.includes('versicherung') || title.includes('steuer') || title.includes('arzt')) return 'Administrativ';
    if (title.includes('post') || title.includes('linkedin') || title.includes('content')) return 'Marketing';
    if (title.includes('verkauf') || title.includes('kunde') || title.includes('lead')) return 'Business';
    
    return null;
  }

  // Extrahiere Parent-Context aus Markdown-Struktur
  extractParentContext(task) {
    const title = task.title.toLowerCase();
    
    // Erkenne Parent-Tasks
    if (title.includes('bene') && title.includes('meeting')) {
      return {
        parent: 'Bene (Sustain) Meeting',
        context: 'Meeting-Vorbereitung',
        section: 'Montag Nachmittag'
      };
    }
    
    if (title.includes('push') && title.includes('build')) {
      return {
        parent: 'PUSH Build Test',
        context: 'Tool-Optimierung',
        section: 'Montag Nachmittag'
      };
    }
    
    if (title.includes('check24')) {
      return {
        parent: 'Check24 Workshop',
        context: 'Workshop-Vorbereitung',
        section: 'Dienstag'
      };
    }
    
    return null;
  }

  // Bestimme Hierarchie-Level basierend auf Markdown-Struktur
  determineHierarchyLevel(task) {
    const title = task.title.toLowerCase();
    
    // Haupt-Tasks (Level 1)
    if (title.includes('**') && !title.includes('  -')) {
      return 1;
    }
    
    // Unter-Tasks (Level 2) - erkennt durch Einrückung oder spezifische Keywords
    if (title.includes('zuhören') || title.includes('hilfe wieder') || 
        title.includes('sofort markieren') || title.includes('fragen nach') ||
        title.includes('agentisches') || title.includes('workshop-teaser') ||
        title.includes('post zusammen') || title.includes('3 stufiges') ||
        title.includes('colors vorher') || title.includes('daily repeat') ||
        title.includes('guided interactions') || title.includes('microcopy') ||
        title.includes('handout')) {
      return 2;
    }
    
    // Standard Level
    return 1;
  }

  // Erweitere alle Tasks
  enhanceAllTasks() {
    console.log('🧠 Erweitere Tasks mit Smart Features...');
    
    const data = this.loadTasks();
    const enhancedTasks = data.tasks.map(task => this.enhanceTask(task));
    
    const result = {
      ...data,
      tasks: enhancedTasks,
      enhanced_at: new Date().toISOString(),
      total_tasks: enhancedTasks.length,
      smart_features: {
        due_dates: enhancedTasks.filter(t => t.due_date).length,
        priorities: {
          high: enhancedTasks.filter(t => t.priority === 'high').length,
          medium: enhancedTasks.filter(t => t.priority === 'medium').length,
          low: enhancedTasks.filter(t => t.priority === 'low').length
        },
        categories: this.getCategoryStats(enhancedTasks),
        deadline_status: this.getDeadlineStats(enhancedTasks)
      }
    };
    
    this.saveEnhancedTasks(result);
    
    console.log('✅ Smart Task Enhancement abgeschlossen!');
    console.log(`📊 ${enhancedTasks.length} Tasks erweitert`);
    console.log(`📅 ${result.smart_features.due_dates} Tasks mit Due Dates`);
    console.log(`🏷️  ${Object.keys(result.smart_features.categories).length} Kategorien`);
    
    return result;
  }

  // Kategorie-Statistiken
  getCategoryStats(tasks) {
    const stats = {};
    tasks.forEach(task => {
      stats[task.category] = (stats[task.category] || 0) + 1;
    });
    return stats;
  }

  // Deadline-Statistiken
  getDeadlineStats(tasks) {
    const stats = {};
    tasks.forEach(task => {
      stats[task.deadline_status] = (stats[task.deadline_status] || 0) + 1;
    });
    return stats;
  }
}

// Hauptfunktion
function main() {
  const enhancer = new SmartTaskEnhancer();
  const result = enhancer.enhanceAllTasks();
  
  console.log('\n📊 Smart Task Statistiken:');
  console.log(JSON.stringify(result.smart_features, null, 2));
}

// Script ausführen
if (require.main === module) {
  main();
}

module.exports = SmartTaskEnhancer;
