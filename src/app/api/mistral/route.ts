// src/app/api/mistral/route.ts - Mistral API Route
import { createClient } from '@/lib/supabase/server';
import { formatDateToYYYYMMDD, getTodayAsYYYYMMDD, getTomorrowAsYYYYMMDD } from '@/lib/utils/dateUtils';
import { NextRequest, NextResponse } from 'next/server';

// Increase timeout for API route (up to 60 seconds)
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// Centralized configuration
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';
const MODEL_ID = process.env.MISTRAL_MODEL || 'mistral-large-latest';
const REQUEST_TIMEOUT_MS = 30000;
const SECOND_REQUEST_TIMEOUT_MS = 30000;

// (Keine serverseitige Filterung – Nutzerpräferenz)

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { message: userMessage, messageHistory, context, tools, toolChoice } = await request.json();
    
    const apiKey = process.env.MISTRAL_API_KEY || process.env.NEXT_PUBLIC_MISTRAL_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API Key not configured' }, { status: 500 });
    }

    // Optionaler Single-Call-Modus: Tasks werden serverseitig geladen und als Kontext
    // in EINEN Mistral-Call gegeben. Reduziert Rate-Limit-Treffer (kein zweiter Call).
    if (process.env.MISTRAL_SINGLE_CALL === '1') {
      try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Reuse der bestehenden Gruppierungslogik
        const groupedTasksText = await handleListTasksServerSide(supabase, user.id);

        // Nachrichtenaufbau: System + (gekürzte) History + User-Frage
        const messagesArraySingle: Array<{
          role: 'system' | 'user' | 'assistant' | 'tool';
          content: string | null;
        }> = [
          {
            role: 'system',
            content: `You are a helpful AI assistant for task management.
TODAY'S DATE: ${new Date().toISOString().split('T')[0]} (YYYY-MM-DD format)

CRITICAL FILTERING RULES:
- If user asks for "heute"/"today" → ONLY show the "📅 HEUTE" section
- If user asks for "morgen"/"tomorrow" → ONLY show the "📅 MORGEN" section
- If user asks for "überfällig"/"overdue" → ONLY show the "⚠️ ÜBERFÄLLIG" section
- If user doesn't specify a date → show only HEUTE and ÜBERFÄLLIG by default
NEVER show the full list when a specific date is requested.

CONTEXT - GROUPED TASKS (filter strictly based on the user's question):
${groupedTasksText}`
          }
        ];

        // History (letzte 10) beibehalten, aber ohne Tool-Struktur
        if (messageHistory && Array.isArray(messageHistory)) {
          const limitedHistory = messageHistory.slice(-10);
          limitedHistory.forEach((msg: { type: 'user' | 'bot'; text: string }) => {
            const role = msg.type === 'bot' ? 'assistant' : 'user';
            messagesArraySingle.push({ role, content: msg.text });
          });
        }

        messagesArraySingle.push({ role: 'user', content: userMessage });

        const requestBodySingle: Record<string, unknown> = {
          model: 'mistral-large-latest',
          messages: messagesArraySingle,
          temperature: 0.8,
          max_tokens: 500,
          // Tools bewusst nicht gesetzt; ein einzelner Call mit Kontext
          tool_choice: 'none'
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        let singleResponse: Response;
        try {
          singleResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBodySingle),
            signal: controller.signal
          });
        } catch (error) {
          clearTimeout(timeoutId);
          if (error instanceof Error && error.name === 'AbortError') {
            return NextResponse.json({ 
              error: 'Request timeout', 
              errorMessage: 'Die Anfrage dauerte zu lange. Bitte versuche es erneut.' 
            }, { status: 504 });
          }
          throw error;
        } finally {
          clearTimeout(timeoutId);
        }

        if (!singleResponse.ok) {
          const errorText = await singleResponse.text();
          // Bei 429: Wartezeit respektieren; aber hier kein Auto-Retry (Client hat bereits 1 Retry)
          if (singleResponse.status === 429) {
            const retryAfter = singleResponse.headers.get('Retry-After');
            const waitTime = retryAfter ? parseInt(retryAfter, 10) : 60;
            return NextResponse.json({
              error: 'Rate limit exceeded',
              errorMessage: `Rate Limit erreicht. Bitte warte ${waitTime} Sekunden, bevor du eine weitere Anfrage stellst.`,
              retryAfter: waitTime
            }, { status: 429 });
          }
          return NextResponse.json({ 
            error: 'Failed to generate response',
            details: `Status: ${singleResponse.status}, Error: ${errorText.substring(0, 500)}`
          }, { status: 500 });
        }

        const singleData = await singleResponse.json();
        const finalContent = singleData.choices?.[0]?.message?.content || 'Entschuldigung, ich konnte keine Antwort generieren.';
        return NextResponse.json({ response: finalContent, needsRefresh: false });
      } catch (error) {
        return NextResponse.json({ error: 'Failed to generate response', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
      }
    }

    // Build messages array with history
    // Type allows tool_calls for assistant messages and tool_call_id for tool messages
    const messagesArray: Array<{
      role: 'system' | 'user' | 'assistant' | 'tool';
      content: string | null;
      tool_calls?: Array<{
        id: string;
        type: string;
        function: {
          name: string;
          arguments: string;
        };
      }>;
      tool_call_id?: string;
    }> = [
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
          - If user asks specifically about "today", "tomorrow", or a specific date → Use list_tasks tool BUT only mention the relevant date category in your response
          - If user wants to chat normally → Just respond without tools
          
          CRITICAL: When list_tasks returns grouped tasks (HEUTE, MORGEN, SPÄTER, etc.), you MUST filter your response based on what the user asked:
          - User asks "heute" or "today" → ONLY show and mention the "📅 HEUTE" category, ignore all others
          - User asks "morgen" or "tomorrow" → ONLY show and mention the "📅 MORGEN" category, ignore all others
          - User asks "überfällig" or "overdue" → ONLY show and mention the "⚠️ ÜBERFÄLLIG" category, ignore all others
          - User asks "all tasks" or "alle tasks" → Show all categories
          - User doesn't specify a date → Show only HEUTE (today) and ÜBERFÄLLIG (overdue) categories by default
          NEVER show the full list if the user asks for a specific date - always filter and show only the relevant section!

          STRICT OUTPUT RULES:
          - Your final answer MUST contain ONLY the requested category section: its header line and its list items.
          - Do NOT include other category headers or items. Do NOT mention them.
          - If the tool output contains multiple sections, copy ONLY the requested one verbatim until the next header.
          - If there are no items in the requested section, say that there are none for that section.

          FEW-SHOT EXAMPLES:
          User: Was steht heute an?
          Tool (grouped):
          📝 Deine Aufgaben:\n\n⚠️ ÜBERFÄLLIG (vor 2025-10-31):\n1. …\n\n📅 HEUTE (2025-10-31):\n1. Alpha\n2. Beta\n\n📅 MORGEN (2025-11-01):\n1. Gamma
          Assistant (final):
          📅 HEUTE (2025-10-31):\n1. Alpha\n2. Beta

          User: Zeig die überfälligen.
          Assistant (final):
          ⚠️ ÜBERFÄLLIG (vor 2025-10-31):\n1. …
          
          TOOL RESULT FORMAT FOR list_tasks:
          - The tool returns a JSON object: { grouped: { overdue: { label, items }, today: { label, items }, tomorrow: { label, items }, later: { label, items }, noDate: { label, items } } }
          - Each items array contains objects with: title (string), completed (boolean), priority (boolean), and optionally date (YYYY-MM-DD)
          - When user asks for a specific date/category, ONLY use the corresponding grouped section in your final answer; do NOT include other sections.

          OUTPUT STYLE (VERY IMPORTANT):
          - NEVER include JSON, code blocks, or any technical details in your final answer.
          - Reply ONLY with user-friendly text showing the requested section (header + items).
          - Do not mention that you used tools or JSON.

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
      }
    ];

    // Add message history if provided (convert from frontend format to Mistral format)
    // Limit to last 10 messages to prevent token bloat and slow responses
    if (messageHistory && Array.isArray(messageHistory)) {
      const limitedHistory = messageHistory.slice(-10); // Only last 10 messages
      limitedHistory.forEach((msg: { type: 'user' | 'bot'; text: string }) => {
        // Convert 'bot' to 'assistant' for Mistral API
        const role = msg.type === 'bot' ? 'assistant' : 'user';
        messagesArray.push({
          role: role,
          content: msg.text
        });
      });
    }

    // Add the current user message
    messagesArray.push({
      role: 'user',
      content: userMessage
    });

    // Prepare request body
    const requestBody: any = {
      model: MODEL_ID,
      messages: messagesArray,
      temperature: 0.2,
      max_tokens: 300
    };

    // Add tools if provided
    if (tools && tools.length > 0) {
      requestBody.tools = tools;
      requestBody.tool_choice = toolChoice || 'auto';
    }

    // Use direct HTTP request to Mistral API - single attempt (no retries for rate limits)
    // Add timeout to prevent hanging requests (30 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    
    let response: Response;
    try {
      response = await fetch(MISTRAL_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        return NextResponse.json({ 
          error: 'Request timeout', 
          errorMessage: 'Die Anfrage dauerte zu lange. Bitte versuche es erneut.' 
        }, { status: 504 });
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Mistral API error (first call):`, {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText.substring(0, 200)
      });

      // Handle rate limit - NO RETRIES to avoid more requests
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const waitTime = retryAfter ? parseInt(retryAfter, 10) : 60;
        if (process.env.NODE_ENV === 'development') {
        console.log(`Rate limit hit (first call) - returning error immediately (no retries)`);
      }
        return NextResponse.json({ 
          error: 'Rate limit exceeded', 
          errorMessage: `Rate Limit erreicht. Bitte warte ${waitTime} Sekunden, bevor du eine weitere Anfrage stellst.`,
          retryAfter: waitTime
        }, { status: 429 });
      }

      // Handle other errors
      if (response.status === 401) {
        return NextResponse.json({ 
          error: 'Authentication failed', 
          errorMessage: 'API-Key ungültig. Bitte überprüfe die Konfiguration.' 
        }, { status: 401 });
      }

      // For all other errors, fail immediately (no retries)
      throw new Error(`Mistral API error: ${response.status} - ${errorText.substring(0, 200)}`);
    }

    const data = await response.json();
    const aiMessage = data.choices[0]?.message;
    const aiResponse = aiMessage?.content || '';
    const toolCalls = aiMessage?.tool_calls || null;
    
    // Execute tool calls server-side if present
    let toolResults: Array<{ tool_call_id: string; content: string }> = [];
    if (toolCalls && toolCalls.length > 0) {
      for (const toolCall of toolCalls) {
        try {
          const toolResult = await executeToolCallServerSide(toolCall, request);
          toolResults.push({
            tool_call_id: toolCall.id,
            content: toolResult
          });
        } catch (error) {
          console.error('Tool execution error:', error);
          const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
          toolResults.push({
            tool_call_id: toolCall.id,
            content: `❌ Fehler beim Ausführen des Tools: ${errorMessage}`
          });
        }
      }
    }
    
    // If we have tool calls, send tool results back to Mistral in a second API call
    // This is the correct Tool-Calling flow: Mistral processes tool results and generates filtered response
    if (toolCalls && toolCalls.length > 0 && toolResults.length > 0) {
      // Add assistant message with tool calls to conversation
      messagesArray.push({
        role: 'assistant',
        content: null,
        tool_calls: toolCalls.map((tc: any) => ({
          id: tc.id,
          type: tc.type,
          function: {
            name: tc.function.name,
            arguments: tc.function.arguments
          }
        }))
      });
      
      // Add tool response messages (role: 'tool')
      toolResults.forEach(result => {
        messagesArray.push({
          role: 'tool',
          content: result.content,
          tool_call_id: result.tool_call_id
        });
      });
      
      // Add explicit user reminder for filtering if list_tasks was called
      const listTasksResult = toolResults.find(r => {
        try {
          const parsed = JSON.parse(r.content);
          return parsed && typeof parsed === 'object' && parsed.grouped;
        } catch (_e) {
          return false;
        }
      });
      if (listTasksResult) {
        // Extract the original user question to reinforce filtering - check for various patterns
        const userMessageLower = userMessage.toLowerCase();
        const userWords = userMessageLower.split(/\s+/);
        const hasHeute = userMessageLower.includes('heute') || userMessageLower.includes('today') || 
                         userWords.some((w: string) => w === 'heute' || w === 'today' || w === 'steht');
        const hasMorgen = userMessageLower.includes('morgen') || userMessageLower.includes('tomorrow');
        const hasUeberfaellig = userMessageLower.includes('überfällig') || userMessageLower.includes('overdue');
        
        if (hasHeute) {
          messagesArray.push({
            role: 'system',
            content: 'STRICT FILTERING: User asked for HEUTE. In your final answer, ONLY include the "📅 HEUTE" section from the tool results. Do not include any other categories. Do NOT include JSON, code, or technical details.'
          });
        } else if (hasMorgen) {
          messagesArray.push({
            role: 'system',
            content: 'STRICT FILTERING: User asked for MORGEN. In your final answer, ONLY include the "📅 MORGEN" section from the tool results. Do not include any other categories. Do NOT include JSON, code, or technical details.'
          });
        } else if (hasUeberfaellig) {
          messagesArray.push({
            role: 'system',
            content: 'STRICT FILTERING: User asked for ÜBERFÄLLIG. In your final answer, ONLY include the "⚠️ ÜBERFÄLLIG" section from the tool results. Do not include any other categories. Do NOT include JSON, code, or technical details.'
          });
        }
      }
      
      // Second API call: Let Mistral process tool results and generate filtered response
      const secondRequestBody: any = {
        model: MODEL_ID,
        messages: messagesArray,
        temperature: 0.2,
        max_tokens: 300,
        // Tools im zweiten Call deaktivieren, damit keine weiteren Tool-Calls ausgelöst werden
        tool_choice: 'none'
      };
      
      // Hinweis: Tools werden im zweiten Call bewusst NICHT gesetzt
      
      // Make second API call - NO RETRIES for rate limits
      // Add timeout to prevent hanging requests (30 seconds)
      const secondController = new AbortController();
      const secondTimeoutId = setTimeout(() => secondController.abort(), SECOND_REQUEST_TIMEOUT_MS);
      
      let secondResponse: Response;
      try {
        secondResponse = await fetch(MISTRAL_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(secondRequestBody),
          signal: secondController.signal,
        });
      } catch (error) {
        clearTimeout(secondTimeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
          // Timeout fallback: Return tool results directly
          if (process.env.NODE_ENV === 'development') {
            console.log(`Second API call timeout - returning tool results directly as fallback`);
          }
          let fallbackResponse = aiResponse || 'Ich verstehe! Ich führe deine Anfrage aus...';
          if (toolResults.length > 0) {
            fallbackResponse += '\n\n' + toolResults.map(r => r.content).join('\n');
          }
          return NextResponse.json({ 
            response: fallbackResponse,
            needsRefresh: true
          });
        }
        throw error;
      } finally {
        clearTimeout(secondTimeoutId);
      }
      
      if (!secondResponse.ok) {
        const errorText = await secondResponse.text();
        console.error(`Mistral API error (second call):`, {
          status: secondResponse.status,
          statusText: secondResponse.statusText,
          errorText: errorText.substring(0, 500)
        });
        
        // Handle rate limit - NO RETRIES to avoid more requests
        if (secondResponse.status === 429) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`Rate limit hit (second call) - returning tool results directly as fallback`);
          }
          // Fallback: Return tool results directly instead of failing
          let fallbackResponse = aiResponse || 'Ich verstehe! Ich führe deine Anfrage aus...';
          if (toolResults.length > 0) {
            fallbackResponse += '\n\n' + toolResults.map(r => r.content).join('\n');
          }
          return NextResponse.json({ 
            response: fallbackResponse,
            needsRefresh: true
          });
        }

        // Für alle anderen Fehler: ebenfalls Fallback mit Tool-Results zurückgeben
        if (process.env.NODE_ENV === 'development') {
          console.log(`Second call non-ok (${secondResponse.status}) - returning tool results as fallback`);
        }
        let genericFallback = aiResponse || 'Ich verstehe! Ich führe deine Anfrage aus...';
        if (toolResults.length > 0) {
          genericFallback += '\n\n' + toolResults.map(r => r.content).join('\n');
        }
        return NextResponse.json({
          response: genericFallback,
          needsRefresh: true
        });
      }
      
      const secondData = await secondResponse.json();
      const finalAiResponse = secondData.choices[0]?.message?.content || 'Entschuldigung, ich konnte keine Antwort generieren.';
      
      return NextResponse.json({ 
        response: finalAiResponse,
        needsRefresh: true
      });
    }
    
    // If we have tool calls but no content, provide a helpful message
    let finalResponse = aiResponse;
    if (toolCalls && toolCalls.length > 0 && !aiResponse) {
      finalResponse = 'Ich verstehe! Ich führe deine Anfrage aus...';
    } else if (!aiResponse && !toolCalls) {
      finalResponse = 'Entschuldigung, ich konnte keine Antwort generieren.';
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
    if (process.env.NODE_ENV === 'development') {
      console.log('handleCreateTaskServerSide - args:', args);
    }
    
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

    if (process.env.NODE_ENV === 'development') {
      console.log('handleCreateTaskServerSide - inserting task:', taskData);
    }

    const { data: newTask, error } = await supabase
      .from('tasks')
      .insert(taskData)
      .select()
      .single();

    if (error) {
      console.error('handleCreateTaskServerSide - Supabase error:', error);
      throw new Error(`Supabase error: ${error.message}`);
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('handleCreateTaskServerSide - task created successfully:', newTask);
    }
    return `✅ Aufgabe "${args.title}" wurde erfolgreich erstellt.`;
  } catch (error) {
    console.error('handleCreateTaskServerSide - error:', error);
    throw error;
  }
}

async function handleUpdateTaskServerSide(args: any, supabase: any, userId: string): Promise<string> {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 handleUpdateTaskServerSide - args:', JSON.stringify(args, null, 2));
    }
    
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
      if (process.env.NODE_ENV === 'development') {
        console.log('handleUpdateTaskServerSide - found task:', taskId, tasks[0].title);
      }
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
          if (process.env.NODE_ENV === 'development') {
            console.warn('Invalid date format:', args.dueDate);
          }
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

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ handleUpdateTaskServerSide - task updated successfully:', {
        id: updatedTask.id,
        title: updatedTask.title,
        dueDate: updatedTask.dueDate,
        updatedAt: updatedTask.updatedAt
      });
    }
    return `✅ Aufgabe wurde erfolgreich aktualisiert.`;
  } catch (error) {
    console.error('handleUpdateTaskServerSide - error:', error);
    throw error;
  }
}

async function handleDeleteTaskServerSide(args: any, supabase: any, userId: string): Promise<string> {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('handleDeleteTaskServerSide - args:', args);
    }
    
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
      if (process.env.NODE_ENV === 'development') {
        console.log('handleDeleteTaskServerSide - found task by title:', taskId);
      }
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

    if (process.env.NODE_ENV === 'development') {
      console.log('handleDeleteTaskServerSide - task deleted successfully');
    }
    return `✅ Aufgabe wurde erfolgreich gelöscht.`;
  } catch (error) {
    console.error('handleDeleteTaskServerSide - error:', error);
    throw error;
  }
}

async function handleListTasksServerSide(supabase: any, userId: string): Promise<string> {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('handleListTasksServerSide - listing tasks for user:', userId);
    }
    
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('id, title, completed, dueDate, priority')
      .eq('userId', userId)
      .eq('completed', false) // Nur aktive Tasks anzeigen
      .order('globalPosition', { ascending: true });

    if (error) {
      console.error('handleListTasksServerSide - Supabase error:', error);
      throw new Error(`Supabase error: ${error.message}`);
    }

    if (!tasks || tasks.length === 0) {
      return `📝 Du hast noch keine Aufgaben.`;
    }

    // Import date utilities
    const { formatDateToYYYYMMDD, getTodayAsYYYYMMDD, getTomorrowAsYYYYMMDD } = await import('@/lib/utils/dateUtils');
    
    const today = getTodayAsYYYYMMDD();
    const tomorrow = getTomorrowAsYYYYMMDD();
    
    // Group tasks by date
    const todayTasks: any[] = [];
    const tomorrowTasks: any[] = [];
    const overdueTasks: any[] = [];
    const futureTasks: any[] = [];
    const noDateTasks: any[] = [];

    tasks.forEach((task: any) => {
      if (!task.dueDate) {
        noDateTasks.push(task);
        return;
      }

      const taskDateStr = formatDateToYYYYMMDD(new Date(task.dueDate));
      
      if (taskDateStr < today) {
        overdueTasks.push({ ...task, dateStr: taskDateStr });
      } else if (taskDateStr === today) {
        todayTasks.push({ ...task, dateStr: taskDateStr });
      } else if (taskDateStr === tomorrow) {
        tomorrowTasks.push({ ...task, dateStr: taskDateStr });
      } else {
        futureTasks.push({ ...task, dateStr: taskDateStr });
      }
    });

    // Return JSON structure for easier client-side filtering by the model
    const jsonResult = {
      grouped: {
        overdue: {
          label: `⚠️ ÜBERFÄLLIG (vor ${today})`,
          items: overdueTasks.map((task: any) => ({
            title: task.title,
            completed: Boolean(task.completed),
            priority: Boolean(task.priority),
            date: task.dateStr
          }))
        },
        today: {
          label: `📅 HEUTE (${today})`,
          items: todayTasks.map((task: any) => ({
            title: task.title,
            completed: Boolean(task.completed),
            priority: Boolean(task.priority)
          }))
        },
        tomorrow: {
          label: `📅 MORGEN (${tomorrow})`,
          items: tomorrowTasks.map((task: any) => ({
            title: task.title,
            completed: Boolean(task.completed),
            priority: Boolean(task.priority)
          }))
        },
        later: {
          label: `📅 SPÄTER`,
          items: futureTasks.map((task: any) => ({
            title: task.title,
            completed: Boolean(task.completed),
            priority: Boolean(task.priority),
            date: task.dateStr
          }))
        },
        noDate: {
          label: `📝 OHNE DATUM`,
          items: noDateTasks.map((task: any) => ({
            title: task.title,
            completed: Boolean(task.completed),
            priority: Boolean(task.priority)
          }))
        }
      }
    };

    if (process.env.NODE_ENV === 'development') {
      console.log('handleListTasksServerSide - found', tasks.length, 'tasks');
    }
    return JSON.stringify(jsonResult);
  } catch (error) {
    console.error('handleListTasksServerSide - error:', error);
    throw error;
  }
}