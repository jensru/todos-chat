// src/app/api/tasks/route.ts - Tasks API Route
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/tasks - Load all tasks
export async function GET(): Promise<NextResponse> {
  try {
    console.log('API Debug - Starting GET /api/tasks');

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('API Debug - User authenticated:', user.id);

    // Load only tasks for the authenticated user
    const { data: dbTasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('userId', user.id)
      .order('globalPosition', { ascending: true });

    if (error) {
      console.error('API Debug - Supabase error:', error);
      throw error;
    }

    console.log('API Debug - Found', dbTasks?.length || 0, 'tasks');

    const tasks = (dbTasks || []).map(task => ({
      id: task.id,
      userId: task.userId,
      title: task.title,
      description: task.description,
      notes: task.notes,
      completed: task.completed,
      priority: task.priority,
      dueDate: task.dueDate,
      category: task.category,
      tags: typeof task.tags === 'string' ? JSON.parse(task.tags) : task.tags,
      subtasks: typeof task.subtasks === 'string' ? JSON.parse(task.subtasks) : task.subtasks,
      globalPosition: task.globalPosition,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    }));

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('API Debug - Error in GET /api/tasks:', error);
    console.error('API Debug - Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('API Debug - Error message:', error instanceof Error ? error.message : 'Unknown');
    return NextResponse.json({
      error: 'Failed to load tasks',
      details: error instanceof Error ? error.message : 'Unknown error',
      errorName: error instanceof Error ? error.name : 'Unknown',
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

    const { data: newTask, error } = await supabase
      .from('tasks')
      .insert({
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
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, task: newTask });
  } catch (error) {
    console.error('API Debug - Error in POST /api/tasks:', error);
    return NextResponse.json({
      error: 'Failed to create task',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
