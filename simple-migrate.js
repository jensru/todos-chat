#!/usr/bin/env node

/**
 * Einfaches Migration Script für SQLite zu Supabase
 */

const sqlite3 = require('sqlite3').verbose();
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');

// Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// PostgreSQL Prisma Client
const postgresPrisma = new PrismaClient();

async function migrateTasks() {
  console.log('🚀 Starte Migration...');
  
  try {
    // 1. Lade Tasks aus SQLite
    console.log('📖 Lade Tasks aus SQLite...');
    const tasks = await new Promise((resolve, reject) => {
      const db = new sqlite3.Database('./prisma/dev.db');
      db.all('SELECT * FROM tasks ORDER BY globalPosition ASC', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
        db.close();
      });
    });
    
    console.log(`✅ ${tasks.length} Tasks aus SQLite geladen`);
    
    // 2. Erstelle User in Supabase
    console.log('👤 Erstelle User...');
    const USER_EMAIL = 'admin@example.com';
    const USER_PASSWORD = 'admin123';
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: USER_EMAIL,
      password: USER_PASSWORD,
      email_confirm: true
    });

    let userId;
    if (authError && authError.message.includes('already registered')) {
      console.log('👤 User existiert bereits...');
      const { data: existingUser } = await supabase.auth.admin.listUsers();
      const user = existingUser.users.find(u => u.email === USER_EMAIL);
      userId = user.id;
    } else if (authError) {
      throw authError;
    } else {
      userId = authData.user.id;
      console.log(`✅ User erstellt: ${authData.user.email}`);
    }

    // 3. Migriere Tasks
    console.log('📦 Migriere Tasks...');
    let migratedCount = 0;
    
    for (const task of tasks) {
      try {
        await postgresPrisma.task.create({
          data: {
            id: task.id,
            userId: userId,
            title: task.title,
            description: task.description || '',
            notes: task.notes || '',
            completed: task.completed === 1,
            priority: task.priority === 1,
            dueDate: task.dueDate ? new Date(task.dueDate) : null,
            category: task.category,
            tags: task.tags,
            subtasks: task.subtasks,
            globalPosition: task.globalPosition,
            createdAt: new Date(task.createdAt),
            updatedAt: new Date(task.updatedAt)
          }
        });
        migratedCount++;
        if (migratedCount % 10 === 0) {
          console.log(`📦 ${migratedCount}/${tasks.length} Tasks migriert...`);
        }
      } catch (error) {
        console.error(`❌ Fehler bei Task ${task.id}:`, error.message);
      }
    }

    // 4. Verifikation
    const migratedTasks = await postgresPrisma.task.findMany({
      where: { userId: userId }
    });

    console.log('\n📊 Migration Zusammenfassung:');
    console.log(`✅ Erfolgreich migriert: ${migratedCount}`);
    console.log(`📋 Gesamt in Supabase: ${migratedTasks.length}`);
    console.log(`📋 Original SQLite: ${tasks.length}`);

    if (migratedTasks.length === tasks.length) {
      console.log('🎉 Migration erfolgreich abgeschlossen!');
    }

    await postgresPrisma.$disconnect();

  } catch (error) {
    console.error('💥 Migration fehlgeschlagen:', error);
    process.exit(1);
  }
}

migrateTasks();
