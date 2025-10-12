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
          description: 'Creates a new task. Use this for ANY action the user wants to do: "Brief schreiben", "Call mom", "Buy groceries", "Visit dentist", etc. Automatically detect task titles from natural language.',
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
      },
      {
        type: 'function',
        function: {
          name: 'update_task',
          description: 'Updates an existing task. Use this for: "Verschiebe Task nach morgen", "Markiere als erledigt", "Ändere Priorität". Identify by taskDate, taskPosition, or taskTitle.',
          parameters: {
            type: 'object',
            properties: {
              taskTitle: {
                type: 'string',
                description: 'Title of the task to update (use partial match, e.g., "Brief" for "Brief schreiben an Peter")'
              },
              taskPosition: {
                type: 'string',
                description: 'Position of the task (e.g., "first", "last", "only task from today")'
              },
              taskDate: {
                type: 'string',
                description: 'Date of the task (e.g., "today", "tomorrow", "2024-01-01")'
              },
              taskId: {
                type: 'string',
                description: 'ID der zu aktualisierenden Aufgabe (if known)'
              },
              title: {
                type: 'string',
                description: 'Neuer Titel (optional)'
              },
              description: {
                type: 'string',
                description: 'Neue Beschreibung (optional)'
              },
              notes: {
                type: 'string',
                description: 'Neue Notizen (optional)'
              },
              dueDate: {
                type: 'string',
                description: 'Neues Fälligkeitsdatum (optional)'
              },
              category: {
                type: 'string',
                description: 'Neue Kategorie (optional)'
              },
              priority: {
                type: 'boolean',
                description: 'Neue Priorität (optional)'
              },
              completed: {
                type: 'boolean',
                description: 'Erledigt-Status (optional)'
              }
            },
            required: ['taskId']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'delete_task',
          description: 'Deletes a task. Use this when user wants to remove a task: "Lösche Task X", "Entferne Aufgabe Y".',
          parameters: {
            type: 'object',
            properties: {
              taskTitle: {
                type: 'string',
                description: 'Title of the task to delete (use this to identify the task)'
              },
              taskId: {
                type: 'string',
                description: 'ID der zu löschenden Aufgabe (if known)'
              }
            },
            required: ['taskTitle']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'list_tasks',
          description: 'Lists all current tasks. Use this when user asks "What are my tasks?" or "Show me my tasks" or when you need to see available tasks for operations.',
          parameters: {
            type: 'object',
            properties: {},
            required: []
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

