// src/lib/services/TaskEventService.ts - Minimal event logging for tasks
import type { SupabaseClient } from '@supabase/supabase-js'

export type TaskEventType = 'create' | 'update' | 'delete'

export async function logTaskEvent(
  supabase: SupabaseClient,
  userId: string,
  taskId: string,
  type: TaskEventType,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    const payload = {
      userId,
      taskId,
      type,
      metadata: metadata ? JSON.stringify(metadata) : undefined
    }
    const { error } = await supabase.from('task_events').insert(payload as any)
    if (error) throw error
  } catch (error) {
    // Logging-Fehler dürfen nie die Hauptoperation verhindern
    console.error('logTaskEvent error:', error)
  }
}


