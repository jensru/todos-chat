// src/app/api/mistral/route.ts - Mistral API Route
import { createClient } from '@/lib/supabase/server';
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
      if (response.status === 429) {
        return NextResponse.json({ 
          error: 'Rate limit exceeded', 
          errorMessage: 'Bitte warte einen Moment, bevor du eine weitere Anfrage stellst.' 
        }, { status: 429 });
      }
      throw new Error(`Mistral API error: ${response.status}`);
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
async function executeToolCallServerSide(toolCall: any, request: NextRequest): Promise<string> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  const args = JSON.parse(toolCall.function.arguments);
  
  switch (toolCall.function.name) {
    case 'create_task':
      return await handleCreateTaskServerSide(args, supabase, user.id);
    default:
      return `Unbekanntes Tool: ${toolCall.function.name}`;
  }
}

async function handleCreateTaskServerSide(args: any, supabase: any, userId: string): Promise<string> {
  try {
    console.log('handleCreateTaskServerSide - args:', args);
    console.log('handleCreateTaskServerSide - userId:', userId);
    
    // Parse dueDate intelligently
    let dueDate = null;
    if (args.dueDate) {
      if (args.dueDate === 'heute' || args.dueDate === 'today') {
        dueDate = new Date();
        dueDate.setHours(23, 59, 59, 999);
      } else if (args.dueDate === 'morgen' || args.dueDate === 'tomorrow') {
        dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 1);
        dueDate.setHours(23, 59, 59, 999);
      } else {
        try {
          dueDate = new Date(args.dueDate);
          if (isNaN(dueDate.getTime())) {
            dueDate = null;
          }
        } catch {
          dueDate = null;
        }
      }
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