#!/usr/bin/env node

// Script zum Konvertieren der Priority von high/medium/low zu boolean
// Konvertiert: high=true, medium/low=false

const fs = require('fs');
const path = require('path');

// Pfade zu den Datenbankdateien
const TASKS_FILE = path.join(__dirname, '../data/tasks.json');
const SMART_TASKS_FILE = path.join(__dirname, '../data/smart-tasks.json');

function convertPriorityToBoolean(filePath) {
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
        
        // Konvertiere Priority von high/medium/low zu boolean
        const convertedTasks = tasks.map(task => {
            const oldPriority = task.priority;
            let newPriority = false; // Default: nicht high priority
            
            if (oldPriority === 'high') {
                newPriority = true;
            }
            // medium und low werden beide zu false
            
            return {
                ...task,
                priority: newPriority,
                original_priority: oldPriority, // Backup der ursprünglichen Priority
                priority_converted_at: new Date().toISOString()
            };
        });
        
        // Erstelle Backup der ursprünglichen Datei
        const backupPath = filePath + '.backup.priority.' + Date.now();
        fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
        console.log(`💾 Backup erstellt: ${backupPath}`);
        
        // Speichere die konvertierten Daten
        const updatedData = {
            ...data,
            tasks: convertedTasks,
            metadata: {
                ...data.metadata,
                priority_conversion: {
                    converted_at: new Date().toISOString(),
                    from: 'high/medium/low',
                    to: 'boolean',
                    total_tasks: convertedTasks.length
                }
            }
        };
        
        fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2));
        
        // Statistiken
        const stats = {
            total: convertedTasks.length,
            highPriority: convertedTasks.filter(t => t.priority === true).length,
            normalPriority: convertedTasks.filter(t => t.priority === false).length,
            converted: {
                high: convertedTasks.filter(t => t.original_priority === 'high').length,
                medium: convertedTasks.filter(t => t.original_priority === 'medium').length,
                low: convertedTasks.filter(t => t.original_priority === 'low').length
            }
        };
        
        console.log(`✅ Konvertiert: ${stats.total} Tasks`);
        console.log(`🔴 High Priority (true): ${stats.highPriority}`);
        console.log(`⚪ Normal Priority (false): ${stats.normalPriority}`);
        console.log(`📊 Ursprünglich: High=${stats.converted.high}, Medium=${stats.converted.medium}, Low=${stats.converted.low}`);
        
        return stats;
        
    } catch (error) {
        console.error(`❌ Fehler beim Verarbeiten von ${filePath}:`, error.message);
        return null;
    }
}

function main() {
    console.log('🚀 Starte Priority-Konvertierung (high/medium/low → boolean)...');
    console.log('=' .repeat(60));
    
    const results = [];
    
    // Verarbeite beide Datenbankdateien
    results.push(convertPriorityToBoolean(TASKS_FILE));
    results.push(convertPriorityToBoolean(SMART_TASKS_FILE));
    
    console.log('\n' + '=' .repeat(60));
    console.log('📊 ZUSAMMENFASSUNG:');
    
    const totalStats = results.reduce((acc, stats) => {
        if (!stats) return acc;
        return {
            total: acc.total + stats.total,
            highPriority: acc.highPriority + stats.highPriority,
            normalPriority: acc.normalPriority + stats.normalPriority,
            converted: {
                high: acc.converted.high + stats.converted.high,
                medium: acc.converted.medium + stats.converted.medium,
                low: acc.converted.low + stats.converted.low
            }
        };
    }, { total: 0, highPriority: 0, normalPriority: 0, converted: { high: 0, medium: 0, low: 0 } });
    
    console.log(`📋 Gesamt Tasks: ${totalStats.total}`);
    console.log(`🔴 High Priority (true): ${totalStats.highPriority}`);
    console.log(`⚪ Normal Priority (false): ${totalStats.normalPriority}`);
    console.log(`📊 Ursprünglich konvertiert:`);
    console.log(`   - High → true: ${totalStats.converted.high}`);
    console.log(`   - Medium → false: ${totalStats.converted.medium}`);
    console.log(`   - Low → false: ${totalStats.converted.low}`);
    
    console.log('\n✅ Priority-Konvertierung abgeschlossen!');
    console.log('🔄 Starten Sie die App neu, um die Änderungen zu sehen.');
    console.log('\n💡 Neue Priority-Logik:');
    console.log('   - true = High Priority (rot, oben sortiert)');
    console.log('   - false = Normal Priority (grau, nach Position sortiert)');
}

// Führe das Script aus
if (require.main === module) {
    main();
}

module.exports = { convertPriorityToBoolean };
