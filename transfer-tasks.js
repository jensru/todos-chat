#!/usr/bin/env node

/**
 * Task Transfer Script: Admin User zu Google User
 * Überträgt alle Tasks von admin@example.com zu deinem Google-Account
 */

const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env.local' });

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function transferTasks() {
  try {
    console.log('🔄 Starte Task-Transfer...');

    // 1. Finde den Admin-User
    const { data: adminUser, error: adminError } = await supabase.auth.admin.listUsers();
    const adminUserData = adminUser.users.find(u => u.email === 'admin@example.com');
    if (!adminUserData) {
      console.error('❌ Admin-User nicht gefunden!');
      return;
    }
    const adminUserId = adminUserData.id;
    console.log('✅ Admin-User gefunden:', adminUserId);

    // 2. Finde deinen Google-User
    const googleUserData = adminUser.users.find(u => u.email === 'jensrusi@gmail.com');
    if (!googleUserData) {
      console.error('❌ Google-User nicht gefunden! Melde dich erst mit Google an.');
      return;
    }
    const googleUserId = googleUserData.id;
    console.log('✅ Google-User gefunden:', googleUserId);

    // 3. Hole alle Admin-Tasks
    const adminTasks = await prisma.task.findMany({
      where: { userId: adminUserId }
    });
    console.log(`📋 ${adminTasks.length} Tasks gefunden`);

    if (adminTasks.length === 0) {
      console.log('⚠️ Keine Tasks zum Übertragen gefunden');
      return;
    }

    // 4. Übertrage Tasks zu Google-User
    let transferredCount = 0;
    for (const task of adminTasks) {
      try {
        await prisma.task.update({
          where: { id: task.id },
          data: { userId: googleUserId }
        });
        transferredCount++;
        console.log(`✅ Task übertragen: ${task.title}`);
      } catch (error) {
        console.error(`❌ Fehler bei Task ${task.id}:`, error.message);
      }
    }

    console.log(`\n🎉 Transfer abgeschlossen!`);
    console.log(`✅ Erfolgreich übertragen: ${transferredCount}/${adminTasks.length}`);
    console.log(`📱 Melde dich jetzt mit Google an und du siehst deine Tasks!`);

  } catch (error) {
    console.error('💥 Transfer fehlgeschlagen:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  transferTasks();
}
