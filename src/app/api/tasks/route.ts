// src/app/api/tasks/route.ts - Tasks API Route
import { createClient } from '@/lib/supabase/server';
import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

// Singleton pattern for Prisma Client to avoid too many connections
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['error', 'warn'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// GET /api/tasks - Load all tasks
export async function GET(): Promise<NextResponse> {
  try {
    console.log('API Debug - Starting GET /api/tasks');
    console.log('API Debug - NODE_ENV:', process.env.NODE_ENV);
    console.log('API Debug - DATABASE_URL present:', !!process.env.DATABASE_URL);
    console.log('API Debug - DATABASE_URL starts with:', process.env.DATABASE_URL?.substring(0, 20));

    // Test database connection
    await prisma.$connect();
    console.log('API Debug - Database connected successfully');

    // Temporär: Gib alle Tasks zurück (ohne Authentication)
    const dbTasks = await prisma.task.findMany({
      orderBy: { globalPosition: 'asc' }
    });
    console.log('API Debug - Found', dbTasks.length, 'tasks (no auth)');

    const tasks = dbTasks.map(task => ({
      id: task.id,
      userId: task.userId,
      title: task.title,
      description: task.description,
      notes: task.notes,
      completed: task.completed,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.toISOString() : null,
      category: task.category,
      tags: JSON.parse(task.tags),
      subtasks: JSON.parse(task.subtasks),
      globalPosition: task.globalPosition,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString()
    }));

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('API Debug - Error in GET /api/tasks:', error);
    console.error('API Debug - Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('API Debug - Error message:', error instanceof Error ? error.message : 'Unknown');
    console.error('API Debug - Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json({
      error: 'Failed to load tasks',
      details: error instanceof Error ? error.message : 'Unknown error',
      errorName: error instanceof Error ? error.name : 'Unknown',
      stack: process.env.NODE_ENV !== 'production' ? (error instanceof Error ? error.stack : undefined) : undefined
    }, { status: 500 });
  }
}

// POST /api/tasks - Create new task
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const taskData = await request.json();
    
    const newTask = await prisma.task.create({
      data: {
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: user.id,
        title: taskData.title,
        description: taskData.description || '',
        notes: taskData.notes || '',
        completed: taskData.completed || false,
        priority: taskData.priority || false,
        dueDate: taskData.dueDate || null,
        category: taskData.category || null,
        tags: JSON.stringify(taskData.tags || []),
        subtasks: JSON.stringify(taskData.subtasks || []),
        globalPosition: taskData.globalPosition || Date.now(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    return NextResponse.json({ success: true, task: newTask });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
