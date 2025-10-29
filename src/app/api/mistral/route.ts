// src/app/api/mistral/route.ts - Mistral API Route
import { createClient } from '@/lib/supabase/server';
import { formatDateToYYYYMMDD, getTodayAsYYYYMMDD, getTomorrowAsYYYYMMDD } from '@/lib/utils/dateUtils';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { message: userMessage, context, tools, toolChoice } = await request.json();
    
    const apiKey = process.env.MISTRAL_API_KEY || process.env.NEXT_PUBLIC_MISTRAL_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API Key not configured' }, { status: 500 });
    }

    // Prepare request body
    const requestBody: any = {
      model: 'mistral-large-latest',
      messages: [
        {
          role: 'system',
          content: `You are a helpful AI assistant for task management.
          IMPORTANT: Detect the user's language from their message and respond in THAT SAME LANGUAGE.
          Support ALL languages automatically - German, English, French, Spanish, Italian, Portuguese, Dutch, 
          Russian, Chinese, Japanese, Korean, Arabic, Hindi, and any other language the user writes in.
          Always match the user's language automatically, regardless of which language they choose.
          
          TODAY'S DATE: ${new Date().toISOString().split('T')[0]} (YYYY-MM-DD format)
          Use this as reference for "today", "tomorrow", "yesterday" calculations.
          
          SMART TASK DETECTION:
          - If user says something like "Brief schreiben an Peter" or "Call mom tomorrow" or "Buy groceries" → AUTOMATICALLY create a task
          - If user says "Erstell mit drei todos..." or "Create 3 tasks..." → Create multiple tasks
          - If user says "Verschiebe Task X nach morgen" or "Move task Y to tomorrow" → Use update_task directly
          - If user says "Lösche Task Z" or "Delete task W" → Use delete_task directly
          - If user says "Markiere Task als erledigt" or "Mark task as completed" → Use update_task directly
          - If user asks "What are my tasks?" or "Show me my tasks" → Use list_tasks tool
          - If user wants to chat normally → Just respond without tools
          
          IMPORTANT: For task operations, use these parameters:
          - taskDate: "today", "tomorrow", "yesterday" 
          - taskPosition: "first", "last", "only task from today"
          - taskTitle: partial match like "Brief" for "Brief schreiben an Peter"
          - dueDate: Use ISO format YYYY-MM-DD (e.g., "2024-10-12" for today)
          - If the user does not specify any date, DEFAULT the dueDate to TODAY'S DATE (YYYY-MM-DD)
          
          ALWAYS use the appropriate tool directly - no need to list tasks first.
          
          NATURAL TASK PATTERNS (automatically create tasks for):
          - Action verbs: "schreiben", "anrufen", "kaufen", "erledigen", "machen", "besuchen"
          - English: "write", "call", "buy", "do", "visit", "meet", "finish", "complete"
          - French: "écrire", "appeler", "acheter", "faire", "visiter", "rencontrer"
          - Any language: Look for action verbs + object patterns
          
          You can use various tools to create, filter, delete and manage tasks.
          
          IMPORTANT: You can use markdown formatting in your responses:
          - **Bold** for important information
          - *Italic* for emphasis
          - - Bullet points for lists
          - Paragraphs with double line breaks
          
          Do NOT use headlines (# ## ###) - that's too intrusive for chat.
          
          Be productive and helpful. Use markdown formatting for better readability.
          
          Context: ${JSON.stringify(context)}`
        },
        {
          role: 'user',
          content: userMessage
        }
      ],
      temperature: 0.8,
      max_tokens: 500
    };

    // Add tools if provided
    if (tools && tools.length > 0) {
      requestBody.tools = tools;
      requestBody.tool_choice = toolChoice || 'auto';
    }

    // Use direct HTTP request to Mistral API
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Mistral API error:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText
      });
      
      if (response.status === 429) {
        return NextResponse.json({ 
          error: 'Rate limit exceeded', 
          errorMessage: 'Bitte warte einen Moment, bevor du eine weitere Anfrage stellst.' 
        }, { status: 429 });
      }
      
      if (response.status === 401) {
        return NextResponse.json({ 
          error: 'Authentication failed', 
          errorMessage: 'API-Key ungültig. Bitte überprüfe die Konfiguration.' 
        }, { status: 401 });
      }
      
      throw new Error(`Mistral API error: ${response.status} - ${errorText.substring(0, 200)}`);
    }

    const data = await response.json();
    const aiMessage = data.choices[0]?.message;
    const aiResponse = aiMessage?.content || '';
    const toolCalls = aiMessage?.tool_calls || null;
    
    // Execute tool calls server-side if present
    let toolResults = [];
    if (toolCalls && toolCalls.length > 0) {
      for (const toolCall of toolCalls) {
        try {
          const toolResult = await executeToolCallServerSide(toolCall, request);
          toolResults.push(toolResult);
        } catch (error) {
          console.error('Tool execution error:', error);
          const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
          toolResults.push(`❌ Fehler beim Ausführen des Tools: ${errorMessage}`);
        }
      }
    }
    
    // If we have tool calls but no content, provide a helpful message
    let finalResponse = aiResponse;
    if (toolCalls && toolCalls.length > 0 && !aiResponse) {
      finalResponse = 'Ich verstehe! Ich führe deine Anfrage aus...';
    } else if (!aiResponse && !toolCalls) {
      finalResponse = 'Entschuldigung, ich konnte keine Antwort generieren.';
    }
    
    // Add tool results to response
    if (toolResults.length > 0) {
      finalResponse += '\n\n' + toolResults.join('\n');
    }
    
    return NextResponse.json({ 
      response: finalResponse,
      needsRefresh: toolCalls && toolCalls.length > 0
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate response', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

// Server-side tool execution with authentication
async function executeToolCallServerSide(toolCall: any, _request: NextRequest): Promise<string> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  const args = JSON.parse(toolCall.function.arguments);
  
  switch (toolCall.function.name) {
    case 'create_task':
      return await handleCreateTaskServerSide(args, supabase, user.id);
    case 'update_task':
      return await handleUpdateTaskServerSide(args, supabase, user.id);
    case 'delete_task':
      return await handleDeleteTaskServerSide(args, supabase, user.id);
    case 'list_tasks':
      return await handleListTasksServerSide(supabase, user.id);
    default:
      return `Unbekanntes Tool: ${toolCall.function.name}`;
  }
}

async function handleCreateTaskServerSide(args: any, supabase: any, userId: string): Promise<string> {
  try {
    console.log('handleCreateTaskServerSide - args:', args);
    console.log('handleCreateTaskServerSide - userId:', userId);
    
    // Parse dueDate intelligently - DEFAULT to today if no valid date specified
    let dueDate = null as string | null;
    const rawDueInput = typeof args.dueDate === 'string' ? args.dueDate.trim() : args.dueDate;

    if (rawDueInput !== undefined && rawDueInput !== null && rawDueInput !== '') {
      const normalized = typeof rawDueInput === 'string' ? rawDueInput.toLowerCase() : rawDueInput;

      // Treat common "no date" synonyms as missing → default to today below
      const noDateSynonyms = ['none', 'no date', 'kein datum', 'ohne datum', 'ohne-datum', 'keine', 'null', 'ohne'];
      if (typeof normalized === 'string' && noDateSynonyms.includes(normalized)) {
        dueDate = null;
      } else if (normalized === 'heute' || normalized === 'today') {
        dueDate = getTodayAsYYYYMMDD();
      } else if (normalized === 'morgen' || normalized === 'tomorrow') {
        dueDate = getTomorrowAsYYYYMMDD();
      } else if (typeof normalized === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
        // Already in YYYY-MM-DD
        dueDate = normalized;
      } else if (typeof normalized === 'string') {
        // Try to parse arbitrary date strings and normalize
        const parsed = new Date(normalized);
        if (!isNaN(parsed.getTime())) {
          dueDate = formatDateToYYYYMMDD(parsed);
        } else {
          // Fallback to today if unparseable
          dueDate = null;
        }
      }
    }

    // DEFAULT: If no (valid) dueDate specified, set to today
    if (!dueDate) {
      dueDate = getTodayAsYYYYMMDD();
    }

    const now = new Date().toISOString();
    const taskData = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: userId,
      title: args.title,
      description: args.description || '',
      notes: args.notes || '',
      completed: false,
      priority: args.priority || false,
      dueDate: dueDate,
      category: args.category || null,
      tags: JSON.stringify([]),
      subtasks: JSON.stringify([]),
      globalPosition: Date.now(),
      createdAt: now,
      updatedAt: now,
      // Note: isNew will be handled client-side for animation
    };

    console.log('handleCreateTaskServerSide - inserting task:', taskData);

    const { data: newTask, error } = await supabase
      .from('tasks')
      .insert(taskData)
      .select()
      .single();

    if (error) {
      console.error('handleCreateTaskServerSide - Supabase error:', error);
      throw new Error(`Supabase error: ${error.message}`);
    }

    console.log('handleCreateTaskServerSide - task created successfully:', newTask);
    return `✅ Aufgabe "${args.title}" wurde erfolgreich erstellt.`;
  } catch (error) {
    console.error('handleCreateTaskServerSide - error:', error);
    throw error;
  }
}

async function handleUpdateTaskServerSide(args: any, supabase: any, userId: string): Promise<string> {
  try {
    console.log('🔄 handleUpdateTaskServerSide - args:', JSON.stringify(args, null, 2));
    
    // Find task by ID, title, position, or date
    let taskId = args.taskId;
    if (!taskId) {
      let query = supabase
        .from('tasks')
        .select('id, title, dueDate')
        .eq('userId', userId);
      
      // Filter by date if specified
      if (args.taskDate) {
        if (args.taskDate === 'today') {
          const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
          query = query.gte('dueDate', today).lt('dueDate', today + 'T23:59:59.999Z');
        } else if (args.taskDate === 'tomorrow') {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const tomorrowStr = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD
          query = query.gte('dueDate', tomorrowStr).lt('dueDate', tomorrowStr + 'T23:59:59.999Z');
        }
      }
      
      // Filter by title if specified
      if (args.taskTitle) {
        query = query.ilike('title', `%${args.taskTitle}%`);
      }
      
      query = query.order('globalPosition', { ascending: true });
      
      // Handle position if specified
      if (args.taskPosition) {
        if (args.taskPosition === 'first') {
          query = query.limit(1);
        } else if (args.taskPosition === 'last') {
          query = query.order('globalPosition', { ascending: false }).limit(1);
        } else if (args.taskPosition.includes('only')) {
          // For "only task from today" - just get the first one
          query = query.limit(1);
        }
      } else {
        query = query.limit(1);
      }
      
      const { data: tasks, error: findError } = await query;
      
      if (findError) {
        throw new Error(`Error finding task: ${findError.message}`);
      }
      
      if (!tasks || tasks.length === 0) {
        return `❌ Aufgabe nicht gefunden.`;
      }
      
      taskId = tasks[0].id;
      console.log('handleUpdateTaskServerSide - found task:', taskId, tasks[0].title);
    }
    
    if (!taskId) {
      return `❌ Keine Task-ID oder Titel angegeben.`;
    }
    
    // Parse dueDate if provided (normalize synonyms and free-form input)
    let dueDate = args.dueDate as string | undefined;
    if (args.dueDate !== undefined && args.dueDate !== null && args.dueDate !== '') {
      const raw = String(args.dueDate).trim().toLowerCase();
      const noDateSynonyms = ['none', 'no date', 'kein datum', 'ohne datum', 'ohne-datum', 'keine', 'null', 'ohne'];
      if (noDateSynonyms.includes(raw)) {
        dueDate = undefined;
      } else if (raw === 'heute' || raw === 'today') {
        dueDate = getTodayAsYYYYMMDD();
      } else if (raw === 'morgen' || raw === 'tomorrow') {
        dueDate = getTomorrowAsYYYYMMDD();
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        // Already YYYY-MM-DD
        dueDate = raw;
      } else {
        // Try to parse other strings
        const parsed = new Date(raw);
        if (!isNaN(parsed.getTime())) {
          dueDate = formatDateToYYYYMMDD(parsed);
        } else {
          console.warn('Invalid date format:', args.dueDate);
          dueDate = undefined;
        }
      }
    }

    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    // Only include fields that are provided
    if (args.title !== undefined) updateData.title = args.title;
    if (args.description !== undefined) updateData.description = args.description;
    if (args.notes !== undefined) updateData.notes = args.notes;
    if (dueDate !== undefined) updateData.dueDate = dueDate;
    if (args.category !== undefined) updateData.category = args.category;
    if (args.priority !== undefined) updateData.priority = args.priority;
    if (args.completed !== undefined) updateData.completed = args.completed;

    const { data: updatedTask, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', taskId)
      .eq('userId', userId)
      .select()
      .single();

    if (error) {
      console.error('handleUpdateTaskServerSide - Supabase error:', error);
      throw new Error(`Supabase error: ${error.message}`);
    }

    console.log('✅ handleUpdateTaskServerSide - task updated successfully:', {
      id: updatedTask.id,
      title: updatedTask.title,
      dueDate: updatedTask.dueDate,
      updatedAt: updatedTask.updatedAt
    });
    return `✅ Aufgabe wurde erfolgreich aktualisiert.`;
  } catch (error) {
    console.error('handleUpdateTaskServerSide - error:', error);
    throw error;
  }
}

async function handleDeleteTaskServerSide(args: any, supabase: any, userId: string): Promise<string> {
  try {
    console.log('handleDeleteTaskServerSide - args:', args);
    
    // Find task by ID or title
    let taskId = args.taskId;
    if (!taskId && args.taskTitle) {
      const { data: tasks, error: findError } = await supabase
        .from('tasks')
        .select('id, title')
        .eq('userId', userId)
        .ilike('title', `%${args.taskTitle}%`)
        .limit(1);
      
      if (findError) {
        throw new Error(`Error finding task: ${findError.message}`);
      }
      
      if (!tasks || tasks.length === 0) {
        return `❌ Aufgabe "${args.taskTitle}" nicht gefunden.`;
      }
      
      taskId = tasks[0].id;
      console.log('handleDeleteTaskServerSide - found task by title:', taskId);
    }
    
    if (!taskId) {
      return `❌ Keine Task-ID oder Titel angegeben.`;
    }
    
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('userId', userId);

    if (error) {
      console.error('handleDeleteTaskServerSide - Supabase error:', error);
      throw new Error(`Supabase error: ${error.message}`);
    }

    console.log('handleDeleteTaskServerSide - task deleted successfully');
    return `✅ Aufgabe wurde erfolgreich gelöscht.`;
  } catch (error) {
    console.error('handleDeleteTaskServerSide - error:', error);
    throw error;
  }
}

async function handleListTasksServerSide(supabase: any, userId: string): Promise<string> {
  try {
    console.log('handleListTasksServerSide - listing tasks for user:', userId);
    
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('id, title, completed, dueDate, priority')
      .eq('userId', userId)
      .order('globalPosition', { ascending: true });

    if (error) {
      console.error('handleListTasksServerSide - Supabase error:', error);
      throw new Error(`Supabase error: ${error.message}`);
    }

    if (!tasks || tasks.length === 0) {
      return `📝 Du hast noch keine Aufgaben.`;
    }

    const taskList = tasks.map((task: any, index: number) => {
      const status = task.completed ? '✅' : '⏳';
      const priority = task.priority ? '🔥' : '';
      const dueDate = task.dueDate ? ` (${new Date(task.dueDate).toLocaleDateString()})` : '';
      return `${index + 1}. ${status} ${task.title}${dueDate} ${priority}`;
    }).join('\n');

    console.log('handleListTasksServerSide - found', tasks.length, 'tasks');
    return `📝 Deine Aufgaben:\n\n${taskList}`;
  } catch (error) {
    console.error('handleListTasksServerSide - error:', error);
    throw error;
  }
}