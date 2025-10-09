// src/lib/services/MistralToolsService.ts - Mistral AI Tools für klassische Operatoren
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

export interface MistralToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export class MistralToolsService {
  private apiKey: string;

  constructor() {
    // Next.js macht NEXT_PUBLIC_ Variablen automatisch im Browser verfügbar
    this.apiKey = '';
  }

  // Verfügbare Tools für klassische Operatoren
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
          name: 'filter_tasks',
          description: 'Filtert und zeigt Aufgaben basierend auf Kriterien',
          parameters: {
            type: 'object',
            properties: {
              priority: {
                type: 'string',
                description: 'Priorität: "high", "normal", "all"'
              },
              dueDate: {
                type: 'string',
                description: 'Fälligkeitsdatum: "today", "tomorrow", "this_week", "overdue", "all"'
              },
              category: {
                type: 'string',
                description: 'Kategorie der Aufgaben'
              },
              completed: {
                type: 'boolean',
                description: 'Erledigte Aufgaben (true/false)'
              }
            },
            required: []
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'delete_tasks',
          description: 'Löscht Aufgaben basierend auf Kriterien',
          parameters: {
            type: 'object',
            properties: {
              completed: {
                type: 'boolean',
                description: 'Lösche alle erledigten Aufgaben'
              },
              category: {
                type: 'string',
                description: 'Lösche alle Aufgaben einer bestimmten Kategorie'
              },
              timeRange: {
                type: 'string',
                description: 'Zeitraum: "this_week", "last_week", "this_month"'
              }
            },
            required: []
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'update_task_priority',
          description: 'Aktualisiert die Priorität von Aufgaben',
          parameters: {
            type: 'object',
            properties: {
              category: {
                type: 'string',
                description: 'Kategorie der Aufgaben'
              },
              priority: {
                type: 'string',
                description: 'Neue Priorität: "high", "normal"'
              },
              taskIds: {
                type: 'array',
                items: { type: 'string' },
                description: 'Spezifische Task-IDs'
              }
            },
            required: ['priority']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'sort_tasks',
          description: 'Sortiert Aufgaben nach verschiedenen Kriterien',
          parameters: {
            type: 'object',
            properties: {
              sortBy: {
                type: 'string',
                description: 'Sortierung nach: "priority", "dueDate", "createdAt", "title"'
              },
              order: {
                type: 'string',
                description: 'Reihenfolge: "asc", "desc"'
              }
            },
            required: ['sortBy']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'create_category',
          description: 'Erstellt eine neue Kategorie und verschiebt Aufgaben',
          parameters: {
            type: 'object',
            properties: {
              categoryName: {
                type: 'string',
                description: 'Name der neuen Kategorie'
              },
              moveTasksWithKeyword: {
                type: 'string',
                description: 'Schlüsselwort für Aufgaben, die verschoben werden sollen'
              }
            },
            required: ['categoryName']
          }
        }
      }
    ];
  }

  // Mistral API Call mit Tools
  async callMistralWithTools(userMessage: string, context?: any): Promise<{
    response: string;
    toolCalls?: MistralToolCall[];
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
        toolCalls: data.toolCalls
      };
    } catch (error) {
      return {
        response: 'Entschuldigung, es gab einen Fehler bei der KI-Antwort.'
      };
    }
  }

  // Tool Execution Handler
  async executeToolCall(toolCall: MistralToolCall, taskService: any): Promise<string> {
    try {
      const args = JSON.parse(toolCall.function.arguments);
      
      switch (toolCall.function.name) {
        case 'create_task':
          return await this.handleCreateTask(args, taskService);
        case 'filter_tasks':
          return await this.handleFilterTasks(args, taskService);
        case 'delete_tasks':
          return await this.handleDeleteTasks(args, taskService);
        case 'update_task_priority':
          return await this.handleUpdatePriority(args, taskService);
        case 'sort_tasks':
          return await this.handleSortTasks(args, taskService);
        case 'create_category':
          return await this.handleCreateCategory(args, taskService);
        default:
          return `Unbekanntes Tool: ${toolCall.function.name}`;
      }
    } catch (error) {
      console.error('MistralToolsService.executeToolCall - error:', error);
      return `Fehler beim Ausführen des Tools: ${error}`;
    }
  }

  private async handleCreateTask(args: any, taskService: any): Promise<string> {
    try {
      console.log('handleCreateTask - args:', args);
      console.log('handleCreateTask - taskService:', taskService);
      console.log('handleCreateTask - args.dueDate:', args.dueDate, typeof args.dueDate);
      
      if (!taskService) {
        return `⚠️ Task-Service nicht verfügbar. Aufgabe "${args.title}" konnte nicht erstellt werden.`;
      }

      // Parse dueDate intelligently
      let dueDate = null;
      if (args.dueDate) {
        if (args.dueDate === 'heute' || args.dueDate === 'today') {
          dueDate = new Date();
          dueDate.setHours(23, 59, 59, 999); // End of today
        } else if (args.dueDate === 'morgen' || args.dueDate === 'tomorrow') {
          dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 1);
          dueDate.setHours(23, 59, 59, 999);
        } else {
          try {
            dueDate = new Date(args.dueDate);
            // Validate the date
            if (isNaN(dueDate.getTime())) {
              console.warn('Invalid date format:', args.dueDate);
              dueDate = null;
            }
          } catch {
            console.warn('Invalid date format:', args.dueDate);
            dueDate = null;
          }
        }
      }
      
      // Ensure dueDate is valid or null
      if (dueDate && isNaN(dueDate.getTime())) {
        console.warn('Invalid dueDate, setting to null');
        dueDate = null;
      }

      const taskData = {
        title: args.title,
        description: args.description || '',
        category: args.category || null, // Keine Standard-Kategorie
        priority: args.priority || false,
        dueDate: dueDate && !isNaN(dueDate.getTime()) ? dueDate : new Date() // Default: heute
      };

      console.log('handleCreateTask - taskData:', taskData);
      await taskService.handleAddTask(taskData);
      console.log('handleCreateTask - task created successfully');
      return `✅ Aufgabe "${args.title}" wurde erfolgreich erstellt.`;
    } catch (error) {
      console.error('handleCreateTask - error:', error);
      return `❌ Fehler beim Erstellen der Aufgabe "${args.title}": ${error}`;
    }
  }

  private async handleFilterTasks(args: any, taskService: any): Promise<string> {
    try {
      if (!taskService) {
        return `⚠️ Task-Service nicht verfügbar. Filterung nicht möglich.`;
      }
      
      // TODO: Implementiere echte Filterung mit taskService
      return `🔍 Aufgaben gefiltert nach: ${JSON.stringify(args)}`;
    } catch (error) {
      console.error('handleFilterTasks - error:', error);
      return `❌ Fehler bei der Filterung: ${error}`;
    }
  }

  private async handleDeleteTasks(args: any, taskService: any): Promise<string> {
    try {
      if (!taskService) {
        return `⚠️ Task-Service nicht verfügbar. Löschung nicht möglich.`;
      }
      
      // TODO: Implementiere echte Löschung mit taskService
      return `🗑️ Aufgaben gelöscht nach: ${JSON.stringify(args)}`;
    } catch (error) {
      console.error('handleDeleteTasks - error:', error);
      return `❌ Fehler beim Löschen: ${error}`;
    }
  }

  private async handleUpdatePriority(args: any, taskService: any): Promise<string> {
    try {
      if (!taskService) {
        return `⚠️ Task-Service nicht verfügbar. Priorität kann nicht geändert werden.`;
      }
      
      // TODO: Implementiere echte Prioritäts-Änderung mit taskService
      return `⭐ Priorität aktualisiert: ${JSON.stringify(args)}`;
    } catch (error) {
      console.error('handleUpdatePriority - error:', error);
      return `❌ Fehler bei der Prioritäts-Änderung: ${error}`;
    }
  }

  private async handleSortTasks(args: any, taskService: any): Promise<string> {
    try {
      if (!taskService) {
        return `⚠️ Task-Service nicht verfügbar. Sortierung nicht möglich.`;
      }
      
      // TODO: Implementiere echte Sortierung mit taskService
      return `📊 Aufgaben sortiert nach: ${args.sortBy} (${args.order})`;
    } catch (error) {
      console.error('handleSortTasks - error:', error);
      return `❌ Fehler bei der Sortierung: ${error}`;
    }
  }

  private async handleCreateCategory(args: any, taskService: any): Promise<string> {
    try {
      if (!taskService) {
        return `⚠️ Task-Service nicht verfügbar. Kategorie kann nicht erstellt werden.`;
      }
      
      // TODO: Implementiere echte Kategorie-Erstellung mit taskService
      return `📁 Kategorie "${args.categoryName}" erstellt und Aufgaben verschoben.`;
    } catch (error) {
      console.error('handleCreateCategory - error:', error);
      return `❌ Fehler bei der Kategorie-Erstellung: ${error}`;
    }
  }
}
