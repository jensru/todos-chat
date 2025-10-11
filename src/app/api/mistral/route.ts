// src/app/api/mistral/route.ts - Mistral API Route
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { message: userMessage, context, tools, toolChoice } = await request.json();
    
    const apiKey = process.env.NEXT_PUBLIC_MISTRAL_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API Key not configured' }, { status: 500 });
    }

    // Prepare request body
    const requestBody: any = {
      model: 'mistral-large-latest',
      messages: [
        {
          role: 'system',
          content: `Du bist ein hilfreicher KI-Assistent für Aufgabenmanagement. 
          Antworte auf Deutsch, sei produktiv und hilfreich.
          Du kannst verschiedene Tools verwenden, um Aufgaben zu erstellen, zu filtern, zu löschen und zu verwalten.
          
          WICHTIG: Du kannst Markdown-Formatierung in deinen Antworten verwenden:
          - **Fett** für wichtige Informationen
          - *Kursiv* für Hervorhebungen
          - - Bullet Points für Listen
          - Absätze mit doppelten Zeilenumbrüchen
          
          Verwende KEINE Headlines (# ## ###) - das ist zu aufdringlich für Chat.
          
          Kontext: ${JSON.stringify(context)}`
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
    
    // If we have tool calls but no content, provide a helpful message
    let finalResponse = aiResponse;
    if (toolCalls && toolCalls.length > 0 && !aiResponse) {
      finalResponse = 'Ich verstehe! Ich führe deine Anfrage aus...';
    } else if (!aiResponse && !toolCalls) {
      finalResponse = 'Entschuldigung, ich konnte keine Antwort generieren.';
    }
    
    return NextResponse.json({ 
      response: finalResponse,
      toolCalls: toolCalls
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate response', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}