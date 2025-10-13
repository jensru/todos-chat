// src/app/api/tasks/[id]/route.ts - Individual Task API Route
import { createClient } from '@/lib/supabase/server';
import { formatDateToYYYYMMDD } from '@/lib/utils/dateUtils';
import { NextRequest, NextResponse } from 'next/server';

// PUT /api/tasks/[id] - Update task
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: taskId } = await params;
    const updates = await request.json();

    // Verify task belongs to user
    const { data: existingTask, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .eq('userId', user.id)
      .single();

    if (fetchError || !existingTask) {
      return NextResponse.json({ error: 'Task not found or unauthorized' }, { status: 404 });
    }

    const updateData: Record<string, any> = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Handle dueDate - now expecting YYYY-MM-DD format from frontend
    if (updates.dueDate) {
      if (updates.dueDate instanceof Date) {
        // Convert Date object to YYYY-MM-DD format
        updateData.dueDate = formatDateToYYYYMMDD(updates.dueDate);
      } else {
        // Assume it's already in YYYY-MM-DD format
        updateData.dueDate = updates.dueDate;
      }
    }

    // Handle JSON fields
    if (updates.tags) {
      updateData.tags = JSON.stringify(updates.tags);
    }
    if (updates.subtasks) {
      updateData.subtasks = JSON.stringify(updates.subtasks);
    }

    const { data: updatedTask, error: updateError } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', taskId)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, task: updatedTask });
  } catch (error) {
    console.error('API Debug - Error in PUT /api/tasks/[id]:', error);
    return NextResponse.json({
      error: 'Failed to update task',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE /api/tasks/[id] - Delete task
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: taskId } = await params;

    // Verify task belongs to user
    const { data: existingTask, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .eq('userId', user.id)
      .single();

    if (fetchError || !existingTask) {
      return NextResponse.json({ error: 'Task not found or unauthorized' }, { status: 404 });
    }

    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Debug - Error in DELETE /api/tasks/[id]:', error);
    return NextResponse.json({
      error: 'Failed to delete task',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
