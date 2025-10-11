// src/app/api/mistral-tools/route.ts - Server-side Mistral Tools API
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { toolCall, taskData } = await request.json();
    
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    switch (toolCall.function.name) {
      case 'create_task':
        return await handleCreateTask(taskData, supabase, user.id);
      default:
        return NextResponse.json({ error: 'Unknown tool' }, { status: 400 });
    }
  } catch (error) {
    console.error('Mistral Tools API error:', error);
    return NextResponse.json({
      error: 'Failed to execute tool',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function handleCreateTask(taskData: any, supabase: any, userId: string): Promise<NextResponse> {
  try {
    // Parse dueDate intelligently
    let dueDate = null;
    if (taskData.dueDate) {
      if (taskData.dueDate === 'heute' || taskData.dueDate === 'today') {
        dueDate = new Date();
        dueDate.setHours(23, 59, 59, 999);
      } else if (taskData.dueDate === 'morgen' || taskData.dueDate === 'tomorrow') {
        dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 1);
        dueDate.setHours(23, 59, 59, 999);
      } else {
        try {
          dueDate = new Date(taskData.dueDate);
          if (isNaN(dueDate.getTime())) {
            dueDate = null;
          }
        } catch {
          dueDate = null;
        }
      }
    }

    const { data: newTask, error } = await supabase
      .from('tasks')
      .insert({
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: userId,
        title: taskData.title,
        description: taskData.description || '',
        notes: taskData.notes || '',
        completed: false,
        priority: taskData.priority || false,
        dueDate: dueDate,
        category: taskData.category || null,
        tags: JSON.stringify([]),
        subtasks: JSON.stringify([]),
        globalPosition: Date.now(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      message: `✅ Aufgabe "${taskData.title}" wurde erfolgreich erstellt.`,
      task: newTask 
    });
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json({
      error: 'Failed to create task',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
