// scripts/normalize-positions.js - Normalize all task positions
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function normalizePositions() {
  try {
    console.log('🔄 Normalizing all task positions...');

    // Get all tasks ordered by current position and date
    const tasks = await prisma.task.findMany({
      orderBy: [
        { dueDate: 'asc' },
        { globalPosition: 'asc' }
      ]
    });

    console.log(`📦 Found ${tasks.length} tasks`);

    // Group tasks by date
    const grouped = {};
    tasks.forEach(task => {
      const dateKey = task.dueDate
        ? task.dueDate.toISOString().split('T')[0]
        : 'ohne-datum';

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(task);
    });

    // Sort date keys chronologically
    const sortedDateKeys = Object.keys(grouped).sort((a, b) => {
      if (a === 'ohne-datum') return 1;
      if (b === 'ohne-datum') return -1;
      return new Date(a).getTime() - new Date(b).getTime();
    });

    // Assign new positions with spacing of 100
    let globalIndex = 1;
    for (const dateKey of sortedDateKeys) {
      const dateTasks = grouped[dateKey];

      console.log(`📅 ${dateKey}: ${dateTasks.length} tasks`);

      for (const task of dateTasks) {
        const newPosition = globalIndex * 100;

        await prisma.task.update({
          where: { id: task.id },
          data: { globalPosition: newPosition }
        });

        console.log(`  ✓ ${task.title.substring(0, 40)}... → ${newPosition}`);
        globalIndex++;
      }
    }

    console.log('✅ All positions normalized!');

  } catch (error) {
    console.error('❌ Normalization failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

normalizePositions()
  .then(() => {
    console.log('🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error:', error);
    process.exit(1);
  });
