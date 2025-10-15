#!/usr/bin/env node

/**
 * Supabase Recovery System
 * Stellt Tasks und User aus Backup-Dateien wieder her
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Supabase Client mit Service Role für Admin-Zugriff
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Backup-Verzeichnis
const BACKUP_DIR = path.join(__dirname, 'backups');

/**
 * Listet alle verfügbaren Backups auf
 */
function listBackups() {
  if (!fs.existsSync(BACKUP_DIR)) {
    console.log('❌ Kein Backup-Verzeichnis gefunden');
    return [];
  }
  
  const files = fs.readdirSync(BACKUP_DIR);
  const jsonBackups = files
    .filter(file => file.startsWith('supabase-backup-') && file.endsWith('.json'))
    .sort()
    .reverse(); // Neueste zuerst
  
  return jsonBackups;
}

/**
 * Lädt ein JSON-Backup
 */
function loadBackup(filename) {
  const filepath = path.join(BACKUP_DIR, filename);
  
  if (!fs.existsSync(filepath)) {
    throw new Error(`Backup-Datei nicht gefunden: ${filename}`);
  }
  
  const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  console.log(`📄 Backup geladen: ${filename}`);
  console.log(`📊 ${data.tasks.length} Tasks, ${data.users.length} User`);
  console.log(`📅 Backup-Datum: ${data.metadata.backup_date}`);
  
  return data;
}

/**
 * Stellt User wieder her
 */
async function restoreUsers(users) {
  try {
    console.log('👥 Stelle User wieder her...');
    
    let restoredCount = 0;
    let skippedCount = 0;
    
    for (const user of users) {
      try {
        // Prüfe ob User bereits existiert
        const { data: existingUser } = await supabase.auth.admin.getUserById(user.id);
        
        if (existingUser.user) {
          console.log(`⏭️ User bereits vorhanden: ${user.email}`);
          skippedCount++;
          continue;
        }
        
        // Erstelle User (ohne Passwort - muss sich neu registrieren)
        const { data, error } = await supabase.auth.admin.createUser({
          email: user.email,
          email_confirm: true,
          user_metadata: {
            restored_from_backup: true,
            original_created_at: user.created_at
          }
        });
        
        if (error) {
          console.error(`❌ Fehler beim Erstellen von User ${user.email}:`, error.message);
          continue;
        }
        
        console.log(`✅ User wiederhergestellt: ${user.email}`);
        restoredCount++;
        
      } catch (error) {
        console.error(`❌ Fehler bei User ${user.email}:`, error.message);
      }
    }
    
    console.log(`👥 User-Wiederherstellung abgeschlossen: ${restoredCount} erstellt, ${skippedCount} übersprungen`);
    return { restored: restoredCount, skipped: skippedCount };
    
  } catch (error) {
    console.error('❌ Fehler beim Wiederherstellen der User:', error);
    throw error;
  }
}

/**
 * Stellt Tasks wieder her
 */
async function restoreTasks(tasks) {
  try {
    console.log('📋 Stelle Tasks wieder her...');
    
    // Lösche alle vorhandenen Tasks
    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .neq('id', 'dummy'); // Delete all
    
    if (deleteError) {
      console.warn('⚠️ Fehler beim Löschen vorhandener Tasks:', deleteError.message);
    } else {
      console.log('🧹 Vorhandene Tasks gelöscht');
    }
    
    // Füge Tasks hinzu
    const { data: insertedTasks, error: insertError } = await supabase
      .from('tasks')
      .insert(tasks)
      .select();
    
    if (insertError) {
      throw new Error(`Fehler beim Einfügen der Tasks: ${insertError.message}`);
    }
    
    console.log(`✅ ${insertedTasks.length} Tasks wiederhergestellt`);
    return insertedTasks.length;
    
  } catch (error) {
    console.error('❌ Fehler beim Wiederherstellen der Tasks:', error);
    throw error;
  }
}

/**
 * Hauptfunktion für die Wiederherstellung
 */
async function restoreFromBackup(backupFilename) {
  try {
    console.log('🚀 Starte Supabase-Wiederherstellung...');
    
    // Backup laden
    const backupData = loadBackup(backupFilename);
    
    // User wiederherstellen
    const userResult = await restoreUsers(backupData.users);
    
    // Tasks wiederherstellen
    const taskCount = await restoreTasks(backupData.tasks);
    
    console.log('\n🎉 Wiederherstellung erfolgreich abgeschlossen!');
    console.log(`👥 User: ${userResult.restored} erstellt, ${userResult.skipped} übersprungen`);
    console.log(`📋 Tasks: ${taskCount} wiederhergestellt`);
    console.log(`📅 Aus Backup: ${backupData.metadata.backup_date}`);
    
    return {
      success: true,
      stats: {
        users: userResult,
        tasks: taskCount,
        backupDate: backupData.metadata.backup_date
      }
    };
    
  } catch (error) {
    console.error('💥 Wiederherstellung fehlgeschlagen:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Zeigt verfügbare Backups an
 */
function showAvailableBackups() {
  const backups = listBackups();
  
  if (backups.length === 0) {
    console.log('❌ Keine Backups gefunden');
    return;
  }
  
  console.log('📁 Verfügbare Backups:');
  backups.forEach((backup, index) => {
    const filepath = path.join(BACKUP_DIR, backup);
    const stats = fs.statSync(filepath);
    const sizeKB = Math.round(stats.size / 1024);
    
    console.log(`  ${index + 1}. ${backup} (${sizeKB} KB, ${stats.mtime.toLocaleDateString('de-DE')})`);
  });
}

// Command Line Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('🔧 Supabase Recovery System');
    console.log('');
    console.log('Verwendung:');
    console.log('  node scripts/restore-supabase.js list                    # Zeige verfügbare Backups');
    console.log('  node scripts/restore-supabase.js restore <backup-file>    # Stelle aus Backup wieder her');
    console.log('');
    showAvailableBackups();
    process.exit(0);
  }
  
  const command = args[0];
  
  if (command === 'list') {
    showAvailableBackups();
  } else if (command === 'restore') {
    const backupFile = args[1];
    
    if (!backupFile) {
      console.error('❌ Bitte geben Sie eine Backup-Datei an');
      console.log('Verwendung: node scripts/restore-supabase.js restore <backup-file>');
      process.exit(1);
    }
    
    restoreFromBackup(backupFile)
      .then(result => {
        if (result.success) {
          console.log('\n✅ Wiederherstellung erfolgreich!');
          process.exit(0);
        } else {
          console.error('\n❌ Wiederherstellung fehlgeschlagen!');
          process.exit(1);
        }
      })
      .catch(error => {
        console.error('\n💥 Unerwarteter Fehler:', error);
        process.exit(1);
      });
  } else {
    console.error('❌ Unbekannter Befehl:', command);
    console.log('Verfügbare Befehle: list, restore');
    process.exit(1);
  }
}

module.exports = { restoreFromBackup, listBackups, showAvailableBackups };
