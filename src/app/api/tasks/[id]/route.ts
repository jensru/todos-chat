// src/app/api/tasks/[id]/route.ts - Individual Task API Route
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@/lib/supabase/server';

const prisma = new PrismaClient();

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
    console.log('Tasks API - updating task:', taskId, updates);
    
    // Verify task belongs to user
    const existingTask = await prisma.task.findFirst({
      where: { id: taskId, userId: user.id }
    });
    
    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found or unauthorized' }, { status: 404 });
    }
    
    const updateData: any = {
      ...updates,
      updatedAt: new Date()
    };
    
    // Handle JSON fields
    if (updates.tags) {
      updateData.tags = JSON.stringify(updates.tags);
    }
    if (updates.subtasks) {
      updateData.subtasks = JSON.stringify(updates.subtasks);
    }
    
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData
    });
    
    console.log('Tasks API - task updated successfully');
    return NextResponse.json({ success: true, task: updatedTask });
  } catch (error) {
    console.error('Tasks API - error:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

// DELETE /api/tasks/[id] - Delete task
export async function DELETE(
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
    console.log('Tasks API - deleting task:', taskId);
    
    // Verify task belongs to user
    const existingTask = await prisma.task.findFirst({
      where: { id: taskId, userId: user.id }
    });
    
    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found or unauthorized' }, { status: 404 });
    }
    
    await prisma.task.delete({
      where: { id: taskId }
    });
    
    console.log('Tasks API - task deleted successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Tasks API - error:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
