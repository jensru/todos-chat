// src/lib/services/MemoryService.ts - Daily Memory generation and storage
import { createClient } from '@/lib/supabase/server';
import { formatDateToYYYYMMDD } from '@/lib/utils/dateUtils';

export class MemoryService {
  static async generateDailyMemory(userId: string, dateISO: string): Promise<string> {
    const supabase = await createClient();

    // Calculate start/end of the day in local time
    const date = new Date(dateISO);
    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    const startISO = start.toISOString();
    const endISO = end.toISOString();

    // Count new tasks created on that day
    const { data: createdTasks, error: createdErr } = await supabase
      .from('tasks')
      .select('id')
      .eq('userId', userId)
      .gte('createdAt', startISO)
      .lt('createdAt', endISO);
    if (createdErr) throw new Error(`Supabase error (created count): ${createdErr.message}`);
    const createdCount = (createdTasks || []).length;

    // Count tasks completed on that day (heuristic via updatedAt + completed=true)
    const { data: completedTasks, error: completedErr } = await supabase
      .from('tasks')
      .select('id')
      .eq('userId', userId)
      .eq('completed', true)
      .gte('updatedAt', startISO)
      .lt('updatedAt', endISO);
    if (completedErr) throw new Error(`Supabase error (completed count): ${completedErr.message}`);
    const completedCount = (completedTasks || []).length;

    // Simple focus detection: most frequent category among tasks touched that day
    const { data: touchedTasks, error: touchedErr } = await supabase
      .from('tasks')
      .select('category, createdAt, updatedAt')
      .eq('userId', userId)
      .or(`createdAt.gte.${startISO},updatedAt.gte.${startISO}`)
      .lt('updatedAt', endISO);
    if (touchedErr) throw new Error(`Supabase error (touched categories): ${touchedErr.message}`);

    const categoryCount = new Map<string, number>();
    (touchedTasks || []).forEach((t: { category?: string | null }) => {
      const key = (t.category || '').trim() || 'Allgemein';
      categoryCount.set(key, (categoryCount.get(key) || 0) + 1);
    });
    const focusCategory = Array.from(categoryCount.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

    const yesterdayISO = formatDateToYYYYMMDD(date);

    const content = [
      `## Memory für ${formatDateToYYYYMMDD(new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1))}`,
      '',
      `### Gestern (${yesterdayISO})`,
      `- ${createdCount} neue Tasks, ${completedCount} erledigt`,
      `- Fokus: ${focusCategory}`,
    ].join('\n');

    return content;
  }

  static async getLatestDailyMemory(userId: string): Promise<string | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('daily_memories')
      .select('contentMd, date')
      .eq('userId', userId)
      .order('date', { ascending: false })
      .limit(1);
    if (error) throw new Error(`Supabase error (getLatestDailyMemory): ${error.message}`);
    if (!data || data.length === 0) return null;
    return data[0].contentMd as string;
  }

  static async saveDailyMemory(userId: string, dateISO: string, contentMd: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('daily_memories')
      .upsert({ userId, date: dateISO, contentMd })
      .select()
      .single();
    if (error) throw new Error(`Supabase error (saveDailyMemory): ${error.message}`);
  }
}


