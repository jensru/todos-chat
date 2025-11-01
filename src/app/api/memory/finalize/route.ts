// src/app/api/memory/finalize/route.ts - Manual trigger to generate & save daily memory
import { createClient } from '@/lib/supabase/server';
import { formatDateToYYYYMMDD } from '@/lib/utils/dateUtils';
import { MemoryService } from '@/lib/services/MemoryService';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const requestedDateISO = typeof body?.dateISO === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.dateISO)
      ? body.dateISO
      : undefined;

    // Default to yesterday if no valid date provided
    const today = new Date();
    const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    const dateISO = requestedDateISO || formatDateToYYYYMMDD(yesterday);

    const contentMd = await MemoryService.generateDailyMemory(user.id, dateISO);
    await MemoryService.saveDailyMemory(user.id, dateISO, contentMd);

    return NextResponse.json({ ok: true, date: dateISO });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to finalize memory', details: message }, { status: 500 });
  }
}


