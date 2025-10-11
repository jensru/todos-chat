const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function removeTodoCategories() {
  try {
    console.log('🗑️  Entferne alle "todo"-Kategorien aus der Datenbank...');
    
    // Update all tasks with category "todo" to null
    const result = await prisma.task.updateMany({
      where: {
        category: "todo"
      },
      data: {
        category: null
      }
    });
    
    console.log(`✅ ${result.count} Tasks aktualisiert - "todo"-Kategorie entfernt`);
    
    // Show remaining categories
    const categories = await prisma.task.findMany({
      select: {
        category: true
      },
      distinct: ['category']
    });
    
    console.log('📋 Verbleibende Kategorien:');
    categories.forEach(cat => {
      console.log(`  - ${cat.category || '(keine Kategorie)'}`);
    });
    
  } catch (error) {
    console.error('❌ Fehler beim Entfernen der "todo"-Kategorien:', error);
  } finally {
    await prisma.$disconnect();
  }
}

removeTodoCategories();