// src/lib/services/MistralToolsService.ts - Simplified Mistral Tools API Client
export interface MistralTool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, any>;
      required: string[];
    };
  };
}

export class MistralToolsService {
  // Available tools for Mistral AI
  getAvailableTools(): MistralTool[] {
    return [
      {
        type: 'function',
        function: {
          name: 'create_task',
          description: 'Erstellt eine neue Aufgabe mit Titel, Fälligkeit und Kategorie',
          parameters: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: 'Titel der Aufgabe'
              },
              description: {
                type: 'string',
                description: 'Beschreibung der Aufgabe (optional)'
              },
              notes: {
                type: 'string',
                description: 'Notizen für die Aufgabe (optional)'
              },
              dueDate: {
                type: 'string',
                description: 'Fälligkeitsdatum im Format YYYY-MM-DD oder relative Angaben wie "heute", "morgen", "nächsten Freitag"'
              },
              category: {
                type: 'string',
                description: 'Kategorie der Aufgabe (z.B. "Privat", "Arbeit", "Einkauf")'
              },
              priority: {
                type: 'boolean',
                description: 'Hohe Priorität (true/false)'
              }
            },
            required: ['title']
          }
        }
      }
    ];
  }

  // Call Mistral API with tools (server-side execution)
  async callMistralWithTools(userMessage: string, context?: any): Promise<{
    response: string;
    needsRefresh?: boolean;
  }> {
    try {
      const tools = this.getAvailableTools();
      
      const response = await fetch('/api/mistral', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          context: context,
          tools: tools,
          toolChoice: 'auto'
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return {
            response: 'Rate Limit erreicht. Bitte warte einen Moment, bevor du eine weitere Anfrage stellst.'
          };
        }
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        response: data.response || 'Entschuldigung, ich konnte keine Antwort generieren.',
        needsRefresh: data.needsRefresh
      };
    } catch (error) {
      console.error('MistralToolsService error:', error);
      return {
        response: 'Entschuldigung, es gab einen Fehler bei der KI-Antwort.'
      };
    }
  }
}

