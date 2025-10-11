// src/app/api/tasks/route.ts - Tasks API Route
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@/lib/supabase/server';

const prisma = new PrismaClient();

// GET /api/tasks - Load all tasks
export async function GET(): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('API Debug - User:', user?.email, 'ID:', user?.id);
    console.log('API Debug - Auth Error:', authError);
    
    if (authError || !user) {
      console.log('API Debug - Returning 401 Unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    
    const dbTasks = await prisma.task.findMany({
      where: { userId: user.id },
      orderBy: { globalPosition: 'asc' }
    });
    
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
    return NextResponse.json({ error: 'Failed to load tasks' }, { status: 500 });
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
