#!/usr/bin/env node

/**
 * Supabase Backup System
 * Erstellt tägliche Backups aller Tasks und User aus Supabase
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
const DATE_FORMAT = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

// Erstelle Backup-Verzeichnis falls nicht vorhanden
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

/**
 * Lädt alle Tasks aus Supabase
 */
async function backupTasks() {
  try {
    console.log('📋 Lade alle Tasks...');
    
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .order('createdAt', { ascending: false });
    
    if (error) {
      throw new Error(`Fehler beim Laden der Tasks: ${error.message}`);
    }
    
    console.log(`✅ ${tasks.length} Tasks geladen`);
    return tasks;
  } catch (error) {
    console.error('❌ Fehler beim Backup der Tasks:', error);
    throw error;
  }
}

/**
 * Lädt alle User aus Supabase Auth
 */
async function backupUsers() {
  try {
    console.log('👥 Lade alle User...');
    
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      throw new Error(`Fehler beim Laden der User: ${error.message}`);
    }
    
    // Entferne sensible Daten für Backup
    const safeUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      updated_at: user.updated_at,
      last_sign_in_at: user.last_sign_in_at,
      email_confirmed_at: user.email_confirmed_at,
      phone: user.phone,
      phone_confirmed_at: user.phone_confirmed_at,
      // Keine Passwörter oder Tokens!
    }));
    
    console.log(`✅ ${safeUsers.length} User geladen`);
    return safeUsers;
  } catch (error) {
    console.error('❌ Fehler beim Backup der User:', error);
    throw error;
  }
}

/**
 * Erstellt JSON-Backup
 */
async function createJSONBackup(tasks, users) {
  const backupData = {
    metadata: {
      backup_date: new Date().toISOString(),
      backup_version: '1.0',
      total_tasks: tasks.length,
      total_users: users.length,
      supabase_project: process.env.NEXT_PUBLIC_SUPABASE_URL
    },
    tasks: tasks,
    users: users
  };
  
  const filename = `supabase-backup-${DATE_FORMAT}.json`;
  const filepath = path.join(BACKUP_DIR, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));
  console.log(`📄 JSON-Backup erstellt: ${filename}`);
  
  return filepath;
}

/**
 * Erstellt SQL-Backup
 */
async function createSQLBackup(tasks, users) {
  const filename = `supabase-backup-${DATE_FORMAT}.sql`;
  const filepath = path.join(BACKUP_DIR, filename);
  
  let sql = `-- Supabase Backup ${DATE_FORMAT}\n`;
  sql += `-- Generated: ${new Date().toISOString()}\n`;
  sql += `-- Total Tasks: ${tasks.length}\n`;
  sql += `-- Total Users: ${users.length}\n\n`;
  
  // Tasks Tabelle
  sql += `-- Tasks\n`;
  sql += `CREATE TABLE IF NOT EXISTS tasks_backup (\n`;
  sql += `  id text PRIMARY KEY,\n`;
  sql += `  "userId" uuid NOT NULL,\n`;
  sql += `  title text NOT NULL,\n`;
  sql += `  description text DEFAULT '' NOT NULL,\n`;
  sql += `  notes text DEFAULT '' NOT NULL,\n`;
  sql += `  completed boolean DEFAULT false NOT NULL,\n`;
  sql += `  priority boolean DEFAULT false NOT NULL,\n`;
  sql += `  "dueDate" date,\n`;
  sql += `  category text,\n`;
  sql += `  tags jsonb DEFAULT '[]'::jsonb NOT NULL,\n`;
  sql += `  subtasks jsonb DEFAULT '[]'::jsonb NOT NULL,\n`;
  sql += `  "globalPosition" bigint NOT NULL,\n`;
  sql += `  "createdAt" timestamptz DEFAULT now() NOT NULL,\n`;
  sql += `  "updatedAt" timestamptz DEFAULT now() NOT NULL\n`;
  sql += `);\n\n`;
  
  // Tasks Daten
  tasks.forEach(task => {
    sql += `INSERT INTO tasks_backup VALUES (\n`;
    sql += `  '${task.id}',\n`;
    sql += `  '${task.userId}',\n`;
    sql += `  '${task.title.replace(/'/g, "''")}',\n`;
    sql += `  '${task.description.replace(/'/g, "''")}',\n`;
    sql += `  '${task.notes.replace(/'/g, "''")}',\n`;
    sql += `  ${task.completed},\n`;
    sql += `  ${task.priority},\n`;
    sql += `  ${task.dueDate ? `'${task.dueDate}'` : 'NULL'},\n`;
    sql += `  ${task.category ? `'${task.category.replace(/'/g, "''")}'` : 'NULL'},\n`;
    sql += `  '${task.tags}',\n`;
    sql += `  '${task.subtasks}',\n`;
    sql += `  ${task.globalPosition},\n`;
    sql += `  '${task.createdAt}',\n`;
    sql += `  '${task.updatedAt}'\n`;
    sql += `);\n`;
  });
  
  sql += `\n-- Users (Auth)\n`;
  sql += `-- Note: User data is stored in Supabase Auth, not in custom tables\n`;
  sql += `-- User IDs are referenced in tasks.userId\n\n`;
  
  users.forEach(user => {
    sql += `-- User: ${user.email} (${user.id})\n`;
    sql += `-- Created: ${user.created_at}\n`;
    sql += `-- Last Sign In: ${user.last_sign_in_at || 'Never'}\n\n`;
  });
  
  fs.writeFileSync(filepath, sql);
  console.log(`🗄️ SQL-Backup erstellt: ${filename}`);
  
  return filepath;
}

/**
 * Erstellt CSV-Backup für einfache Analyse
 */
async function createCSVBackup(tasks, users) {
  // Tasks CSV
  const tasksFilename = `tasks-backup-${DATE_FORMAT}.csv`;
  const tasksFilepath = path.join(BACKUP_DIR, tasksFilename);
  
  let csv = 'id,userId,title,description,notes,completed,priority,dueDate,category,tags,subtasks,globalPosition,createdAt,updatedAt\n';
  
  tasks.forEach(task => {
    const row = [
      task.id,
      task.userId,
      `"${task.title.replace(/"/g, '""')}"`,
      `"${task.description.replace(/"/g, '""')}"`,
      `"${task.notes.replace(/"/g, '""')}"`,
      task.completed,
      task.priority,
      task.dueDate || '',
      task.category || '',
      `"${task.tags}"`,
      `"${task.subtasks}"`,
      task.globalPosition,
      task.createdAt,
      task.updatedAt
    ].join(',');
    csv += row + '\n';
  });
  
  fs.writeFileSync(tasksFilepath, csv);
  console.log(`📊 Tasks CSV-Backup erstellt: ${tasksFilename}`);
  
  // Users CSV
  const usersFilename = `users-backup-${DATE_FORMAT}.csv`;
  const usersFilepath = path.join(BACKUP_DIR, usersFilename);
  
  let usersCsv = 'id,email,created_at,updated_at,last_sign_in_at,email_confirmed_at,phone,phone_confirmed_at\n';
  
  users.forEach(user => {
    const row = [
      user.id,
      `"${user.email}"`,
      user.created_at,
      user.updated_at,
      user.last_sign_in_at || '',
      user.email_confirmed_at || '',
      user.phone || '',
      user.phone_confirmed_at || ''
    ].join(',');
    usersCsv += row + '\n';
  });
  
  fs.writeFileSync(usersFilepath, usersCsv);
  console.log(`👥 Users CSV-Backup erstellt: ${usersFilename}`);
  
  return [tasksFilepath, usersFilepath];
}

/**
 * Bereinigt alte Backups (behält nur die letzten 30 Tage)
 */
function cleanupOldBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR);
    const backupFiles = files.filter(file => file.startsWith('supabase-backup-') || file.startsWith('tasks-backup-') || file.startsWith('users-backup-'));
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    let deletedCount = 0;
    backupFiles.forEach(file => {
      const filepath = path.join(BACKUP_DIR, file);
      const stats = fs.statSync(filepath);
      
      if (stats.mtime < thirtyDaysAgo) {
        fs.unlinkSync(filepath);
        deletedCount++;
        console.log(`🗑️ Altes Backup gelöscht: ${file}`);
      }
    });
    
    if (deletedCount > 0) {
      console.log(`✅ ${deletedCount} alte Backups bereinigt`);
    } else {
      console.log('✅ Keine alten Backups zu bereinigen');
    }
  } catch (error) {
    console.error('⚠️ Fehler beim Bereinigen alter Backups:', error);
  }
}

/**
 * Hauptfunktion für das Backup
 */
async function createBackup() {
  try {
    console.log('🚀 Starte Supabase-Backup...');
    console.log(`📅 Datum: ${DATE_FORMAT}`);
    console.log(`📁 Backup-Verzeichnis: ${BACKUP_DIR}`);
    
    // Daten laden
    const tasks = await backupTasks();
    const users = await backupUsers();
    
    // Backups erstellen
    const jsonFile = await createJSONBackup(tasks, users);
    const sqlFile = await createSQLBackup(tasks, users);
    const csvFiles = await createCSVBackup(tasks, users);
    
    // Alte Backups bereinigen
    cleanupOldBackups();
    
    console.log('\n🎉 Backup erfolgreich abgeschlossen!');
    console.log(`📄 JSON: ${path.basename(jsonFile)}`);
    console.log(`🗄️ SQL: ${path.basename(sqlFile)}`);
    console.log(`📊 CSV: ${csvFiles.map(f => path.basename(f)).join(', ')}`);
    console.log(`📊 Statistiken: ${tasks.length} Tasks, ${users.length} User`);
    
    return {
      success: true,
      files: [jsonFile, sqlFile, ...csvFiles],
      stats: { tasks: tasks.length, users: users.length }
    };
    
  } catch (error) {
    console.error('💥 Backup fehlgeschlagen:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Script ausführen wenn direkt aufgerufen
if (require.main === module) {
  createBackup()
    .then(result => {
      if (result.success) {
        console.log('\n✅ Backup-System erfolgreich!');
        process.exit(0);
      } else {
        console.error('\n❌ Backup fehlgeschlagen!');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 Unerwarteter Fehler:', error);
      process.exit(1);
    });
}

module.exports = { createBackup };
