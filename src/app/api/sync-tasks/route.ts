// src/app/api/sync-tasks/route.ts - Sync LocalStorage Tasks to JSON Database
import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { tasks, lastUpdated } = await request.json();
    
    if (!tasks || !Array.isArray(tasks)) {
      return NextResponse.json({ error: 'Invalid tasks data' }, { status: 400 });
    }

    console.log('Sync API - received tasks:', tasks.length);
    console.log('Sync API - first few tasks:', tasks.slice(0, 3).map(t => ({ id: t.id, title: t.title, completed: t.completed, position: t.globalPosition })));

    // Path to the JSON database file
    const dbPath = join(process.cwd(), 'public', 'data', 'smart-tasks-standardized.json');
    
    // Read current database
    let currentData;
    try {
      const dbContent = readFileSync(dbPath, 'utf8');
      currentData = JSON.parse(dbContent);
    } catch (error) {
      console.log('Sync API - creating new database file');
      currentData = { tasks: [], lastUpdated: new Date().toISOString(), version: '1.0' };
    }

    // Update database with synced tasks (preserve existing structure)
    currentData.tasks = tasks;
    currentData.lastUpdated = lastUpdated || new Date().toISOString();
    currentData.synced = true;
    currentData.syncCount = (currentData.syncCount || 0) + 1;
    
    // Preserve metadata if it exists
    if (!currentData.metadata) {
      currentData.metadata = {
        version: '2.0',
        totalTasks: tasks.length,
        activeTasks: tasks.filter(t => !t.completed).length,
        completedTasks: tasks.filter(t => t.completed).length
      };
    } else {
      currentData.metadata.totalTasks = tasks.length;
      currentData.metadata.activeTasks = tasks.filter(t => !t.completed).length;
      currentData.metadata.completedTasks = tasks.filter(t => t.completed).length;
    }

    // Write back to database
    writeFileSync(dbPath, JSON.stringify(currentData, null, 2), 'utf8');
    
    console.log('Sync API - successfully synced', tasks.length, 'tasks to database');
    console.log('Sync API - database updated at:', currentData.lastUpdated);

    return NextResponse.json({ 
      success: true, 
      message: `Successfully synced ${tasks.length} tasks to database`,
      syncedAt: currentData.lastUpdated,
      syncCount: currentData.syncCount
    });

  } catch (error) {
    console.error('Sync API - error:', error);
    return NextResponse.json({ 
      error: 'Failed to sync tasks', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(): Promise<NextResponse> {
  try {
    // Return current database status
    const dbPath = join(process.cwd(), 'public', 'data', 'smart-tasks-standardized.json');
    
    let currentData;
    try {
      const dbContent = readFileSync(dbPath, 'utf8');
      currentData = JSON.parse(dbContent);
    } catch (error) {
      return NextResponse.json({ 
        error: 'Database file not found',
        path: dbPath 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      taskCount: currentData.tasks?.length || 0,
      lastUpdated: currentData.lastUpdated,
      synced: currentData.synced || false,
      syncCount: currentData.syncCount || 0,
      version: currentData.version || '1.0'
    });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to read database status', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
