#!/usr/bin/env node

// Script zum Aktualisieren der Task-Positionen in der Datenbank
// Erstellt eindeutige globale Positionen basierend auf Datum und Priorität

const fs = require('fs');
const path = require('path');

// Pfade zu den Datenbankdateien
const TASKS_FILE = path.join(__dirname, '../data/tasks.json');
const SMART_TASKS_FILE = path.join(__dirname, '../data/smart-tasks.json');

function updateTaskPositions(filePath) {
    console.log(`\n📁 Verarbeite Datei: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
        console.log(`❌ Datei nicht gefunden: ${filePath}`);
        return;
    }
    
    try {
        // Lade die Datenbank
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const tasks = data.tasks || [];
        
        console.log(`📊 Gefunden: ${tasks.length} Tasks`);
        
        // Sortiere Tasks nach Datum und Priorität
        const sortedTasks = tasks.sort((a, b) => {
            // 1. Sortierung nach due_date
            const dateA = a.due_date ? new Date(a.due_date) : new Date('2099-12-31');
            const dateB = b.due_date ? new Date(b.due_date) : new Date('2099-12-31');
            
            if (dateA.getTime() !== dateB.getTime()) {
                return dateA.getTime() - dateB.getTime();
            }
            
            // 2. Sortierung nach Priorität (high > medium > low)
            const priorityOrder = { 'high': 1, 'medium': 2, 'low': 3 };
            const priorityA = priorityOrder[a.priority] || 4;
            const priorityB = priorityOrder[b.priority] || 4;
            
            if (priorityA !== priorityB) {
                return priorityA - priorityB;
            }
            
            // 3. Sortierung nach ursprünglicher line_number (für Konsistenz)
            return (a.line_number || 0) - (b.line_number || 0);
        });
        
        // Weise neue globale Positionen zu
        const updatedTasks = sortedTasks.map((task, index) => {
            const globalPosition = index + 1;
            
            // Behalte die ursprüngliche line_number als backup
            const originalLineNumber = task.line_number;
            
            return {
                ...task,
                global_position: globalPosition,
                original_line_number: originalLineNumber, // Backup der ursprünglichen Position
                position_updated_at: new Date().toISOString()
            };
        });
        
        // Erstelle Backup der ursprünglichen Datei
        const backupPath = filePath + '.backup.' + Date.now();
        fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
        console.log(`💾 Backup erstellt: ${backupPath}`);
        
        // Speichere die aktualisierten Daten
        const updatedData = {
            ...data,
            tasks: updatedTasks,
            metadata: {
                ...data.metadata,
                last_position_update: new Date().toISOString(),
                total_tasks: updatedTasks.length
            }
        };
        
        fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2));
        
        // Statistiken
        const stats = {
            total: updatedTasks.length,
            byPriority: {
                high: updatedTasks.filter(t => t.priority === 'high').length,
                medium: updatedTasks.filter(t => t.priority === 'medium').length,
                low: updatedTasks.filter(t => t.priority === 'low').length,
                other: updatedTasks.filter(t => !['high', 'medium', 'low'].includes(t.priority)).length
            },
            byDate: {
                withDate: updatedTasks.filter(t => t.due_date).length,
                withoutDate: updatedTasks.filter(t => !t.due_date).length
            }
        };
        
        console.log(`✅ Aktualisiert: ${stats.total} Tasks`);
        console.log(`📈 Prioritäten: High=${stats.byPriority.high}, Medium=${stats.byPriority.medium}, Low=${stats.byPriority.low}`);
        console.log(`📅 Mit Datum: ${stats.byDate.withDate}, Ohne Datum: ${stats.byDate.withoutDate}`);
        
        return stats;
        
    } catch (error) {
        console.error(`❌ Fehler beim Verarbeiten von ${filePath}:`, error.message);
        return null;
    }
}

function main() {
    console.log('🚀 Starte Task-Position-Update...');
    console.log('=' .repeat(50));
    
    const results = [];
    
    // Verarbeite beide Datenbankdateien
    results.push(updateTaskPositions(TASKS_FILE));
    results.push(updateTaskPositions(SMART_TASKS_FILE));
    
    console.log('\n' + '=' .repeat(50));
    console.log('📊 ZUSAMMENFASSUNG:');
    
    const totalStats = results.reduce((acc, stats) => {
        if (!stats) return acc;
        return {
            total: acc.total + stats.total,
            high: acc.high + stats.byPriority.high,
            medium: acc.medium + stats.byPriority.medium,
            low: acc.low + stats.byPriority.low,
            withDate: acc.withDate + stats.byDate.withDate,
            withoutDate: acc.withoutDate + stats.byDate.withoutDate
        };
    }, { total: 0, high: 0, medium: 0, low: 0, withDate: 0, withoutDate: 0 });
    
    console.log(`📋 Gesamt Tasks: ${totalStats.total}`);
    console.log(`🔥 High Priority: ${totalStats.high}`);
    console.log(`⚡ Medium Priority: ${totalStats.medium}`);
    console.log(`🟢 Low Priority: ${totalStats.low}`);
    console.log(`📅 Mit Datum: ${totalStats.withDate}`);
    console.log(`📭 Ohne Datum: ${totalStats.withoutDate}`);
    
    console.log('\n✅ Task-Position-Update abgeschlossen!');
    console.log('🔄 Starten Sie die App neu, um die Änderungen zu sehen.');
}

// Führe das Script aus
if (require.main === module) {
    main();
}

module.exports = { updateTaskPositions };
