// src/app/api/tasks/route.ts - Tasks API Route
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/tasks - Load all tasks
export async function GET(): Promise<NextResponse> {
  try {
    console.log('Tasks API - loading tasks from database...');
    
    const dbTasks = await prisma.task.findMany({
      orderBy: { globalPosition: 'asc' }
    });
    
    const tasks = dbTasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
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
    
    console.log('Tasks API - loaded', tasks.length, 'tasks');
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Tasks API - error:', error);
    return NextResponse.json({ error: 'Failed to load tasks' }, { status: 500 });
  }
}

// POST /api/tasks - Create new task
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const taskData = await request.json();
    console.log('Tasks API - creating new task:', taskData.title);
    
    const newTask = await prisma.task.create({
      data: {
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: taskData.title,
        description: taskData.description || '',
        completed: taskData.completed || false,
        priority: taskData.priority || false,
        dueDate: taskData.dueDate || null,
        category: taskData.category || 'todo',
        tags: JSON.stringify(taskData.tags || []),
        subtasks: JSON.stringify(taskData.subtasks || []),
        globalPosition: taskData.globalPosition || Date.now(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    console.log('Tasks API - task created with ID:', newTask.id);
    return NextResponse.json({ success: true, task: newTask });
  } catch (error) {
    console.error('Tasks API - error:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
