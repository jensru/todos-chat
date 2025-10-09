// src/app/api/mistral/route.ts - Mistral API Route
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();
    
    const apiKey = process.env.NEXT_PUBLIC_MISTRAL_API_KEY || 'nsAs8hgBt7OIuUPhioIvUyVMUzH0MtLz';
    if (!apiKey) {
      return NextResponse.json({ error: 'API Key not configured' }, { status: 500 });
    }

    // Use direct HTTP request to Mistral API
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages: [
          {
            role: 'system',
            content: `Du bist ein hilfreicher KI-Assistent für Aufgabenmanagement. 
            Antworte auf Deutsch, sei produktiv und hilfreich.
            Kontext: ${JSON.stringify(context)}`
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.8,
        max_tokens: 300
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return NextResponse.json({ 
          error: 'Rate limit exceeded', 
          message: 'Bitte warte einen Moment, bevor du eine weitere Anfrage stellst.' 
        }, { status: 429 });
      }
      throw new Error(`Mistral API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || 'Entschuldigung, ich konnte keine Antwort generieren.';
    
    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error('Mistral API Error:', error);
    return NextResponse.json({ error: 'Failed to generate response', details: error.message }, { status: 500 });
  }
}
