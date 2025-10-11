// src/components/MistralToolsDemo.tsx - Demo für Mistral Tools
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MistralToolsService } from '@/lib/services/MistralToolsService';

export function MistralToolsDemo(): React.JSX.Element {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [toolsService] = useState(() => new MistralToolsService());

  const handleTest = async (): Promise<void> => {
    if (!input.trim()) return;
    
    setLoading(true);
    setResponse('');
    
    try {
      const result = await toolsService.callMistralWithTools(input, { tasks: 5, goals: 2 });
      setResponse(result.response);
      
      if (result.toolCalls) {
        setResponse(prev => prev + '\n\n🔧 Tool Calls:\n' + JSON.stringify(result.toolCalls, null, 2));
      }
    } catch (error) {
      setResponse(`Fehler: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const examplePrompts = [
    "Erstelle eine To-Do: 'Steuererklärung machen' mit Fälligkeit nächsten Freitag und Kategorie 'Privat'",
    "Zeig mir alle offenen To-Dos mit hoher Priorität und Fälligkeit heute",
    "Lösche alle erledigten To-Dos dieser Woche",
    "Weise allen To-Dos in der Kategorie 'Arbeit' die Priorität mittel zu",
    "Sortiere die To-Dos nach Priorität und Fälligkeit",
    "Erstelle eine neue Kategorie 'Einkäufe' und verschiebe alle To-Dos mit dem Wort 'kaufen' dorthin"
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🤖 Mistral Tools Demo</CardTitle>
          <CardDescription>
            Teste die neuen Mistral Tools für klassische Operatoren via KI (Sprachsteuerung)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Gib einen Befehl ein..."
              className="flex-1"
            />
            <Button onClick={handleTest} disabled={loading}>
              {loading ? 'Teste...' : 'Testen'}
            </Button>
          </div>
          
          {response && (
            <div className="p-4 bg-gray-100 rounded-lg">
              <h4 className="font-semibold mb-2">Antwort:</h4>
              <pre className="whitespace-pre-wrap text-sm">{response}</pre>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📝 Beispiel-Befehle</CardTitle>
          <CardDescription>
            Klicke auf einen Befehl, um ihn zu testen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {examplePrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                className="justify-start text-left h-auto p-3"
                onClick={() => setInput(prompt)}
              >
                <span className="text-sm">{prompt}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
