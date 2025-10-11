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
          name: 'add_notes_to_task',
          description: 'Fügt Notizen zu einer bestehenden Aufgabe hinzu',
          parameters: {
            type: 'object',
            properties: {
              taskId: {
                type: 'string',
                description: 'ID der Aufgabe'
              },
              notes: {
                type: 'string',
                description: 'Notizen, die hinzugefügt werden sollen'
              },
              append: {
                type: 'boolean',
                description: 'Ob die Notizen angehängt (true) oder ersetzt (false) werden sollen'
              }
            },
            required: ['taskId', 'notes']
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
        case 'add_notes_to_task':
          return await this.handleAddNotesToTask(args, taskService);
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
        notes: args.notes || '',
        category: args.category || null,
        priority: args.priority || false,
        dueDate: dueDate && !isNaN(dueDate.getTime()) ? dueDate : null
      };

      console.log('handleCreateTask - taskData:', taskData);

      // Use direct API call to Supabase if taskService is not available
      if (!taskService) {
        console.log('handleCreateTask - using direct API call to Supabase');
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(taskData),
        });

        if (!response.ok) {
          throw new Error(`Failed to create task: ${response.status}`);
        }

        const result = await response.json();
        console.log('handleCreateTask - task created successfully via API');
        return `✅ Aufgabe "${args.title}" wurde erfolgreich erstellt.`;
      } else {
        // Use taskService if available
        await taskService.handleAddTask(taskData);
        console.log('handleCreateTask - task created successfully via taskService');
        return `✅ Aufgabe "${args.title}" wurde erfolgreich erstellt.`;
      }
    } catch (error) {
      console.error('handleCreateTask - error:', error);
      return `❌ Fehler beim Erstellen der Aufgabe "${args.title}": ${error}`;
    }
  }

  private async handleFilterTasks(args: any, taskService: any): Promise<string> {
    try {
      // Load all tasks and filter them
      const response = await fetch('/api/tasks');
      if (!response.ok) {
        throw new Error(`Failed to load tasks: ${response.status}`);
      }
      
      const data = await response.json();
      let tasks = data.tasks || [];
      
      // Apply filters
      if (args.priority === 'high') {
        tasks = tasks.filter((task: any) => task.priority === true);
      } else if (args.priority === 'normal') {
        tasks = tasks.filter((task: any) => task.priority === false);
      }
      
      if (args.completed !== undefined) {
        tasks = tasks.filter((task: any) => task.completed === args.completed);
      }
      
      if (args.category) {
        tasks = tasks.filter((task: any) => task.category === args.category);
      }
      
      if (args.dueDate) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        tasks = tasks.filter((task: any) => {
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          
          switch (args.dueDate) {
            case 'today':
              return dueDate.toDateString() === today.toDateString();
            case 'tomorrow':
              return dueDate.toDateString() === tomorrow.toDateString();
            case 'overdue':
              return dueDate < today;
            default:
              return true;
          }
        });
      }
      
      const taskList = tasks.map((task: any) => `- ${task.title}${task.priority ? ' ⭐' : ''}${task.dueDate ? ` (${new Date(task.dueDate).toLocaleDateString('de-DE')})` : ''}`).join('\n');
      
      return `🔍 Gefunden: ${tasks.length} Aufgaben\n\n${taskList}`;
    } catch (error) {
      console.error('handleFilterTasks - error:', error);
      return `❌ Fehler bei der Filterung: ${error}`;
    }
  }

  private async handleDeleteTasks(args: any, taskService: any): Promise<string> {
    try {
      // Load all tasks first
      const response = await fetch('/api/tasks');
      if (!response.ok) {
        throw new Error(`Failed to load tasks: ${response.status}`);
      }
      
      const data = await response.json();
      let tasks = data.tasks || [];
      
      // Filter tasks to delete
      let tasksToDelete = tasks;
      
      if (args.completed !== undefined) {
        tasksToDelete = tasksToDelete.filter((task: any) => task.completed === args.completed);
      }
      
      if (args.category) {
        tasksToDelete = tasksToDelete.filter((task: any) => task.category === args.category);
      }
      
      if (args.timeRange) {
        const now = new Date();
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        tasksToDelete = tasksToDelete.filter((task: any) => {
          if (!task.createdAt) return false;
          const createdDate = new Date(task.createdAt);
          
          switch (args.timeRange) {
            case 'this_week':
              return createdDate >= weekAgo;
            case 'last_week':
              const twoWeeksAgo = new Date(weekAgo);
              twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 7);
              return createdDate >= twoWeeksAgo && createdDate < weekAgo;
            default:
              return true;
          }
        });
      }
      
      // Delete tasks
      let deletedCount = 0;
      for (const task of tasksToDelete) {
        const deleteResponse = await fetch(`/api/tasks/${task.id}`, {
          method: 'DELETE',
        });
        
        if (deleteResponse.ok) {
          deletedCount++;
        }
      }
      
      return `🗑️ ${deletedCount} Aufgaben erfolgreich gelöscht.`;
    } catch (error) {
      console.error('handleDeleteTasks - error:', error);
      return `❌ Fehler beim Löschen: ${error}`;
    }
  }

  private async handleUpdatePriority(args: any, taskService: any): Promise<string> {
    try {
      // Load all tasks first
      const response = await fetch('/api/tasks');
      if (!response.ok) {
        throw new Error(`Failed to load tasks: ${response.status}`);
      }
      
      const data = await response.json();
      let tasks = data.tasks || [];
      
      // Filter tasks to update
      let tasksToUpdate = tasks;
      
      if (args.category) {
        tasksToUpdate = tasksToUpdate.filter((task: any) => task.category === args.category);
      }
      
      if (args.taskIds && args.taskIds.length > 0) {
        tasksToUpdate = tasksToUpdate.filter((task: any) => args.taskIds.includes(task.id));
      }
      
      // Update priority
      const newPriority = args.priority === 'high';
      let updatedCount = 0;
      
      for (const task of tasksToUpdate) {
        const updateResponse = await fetch(`/api/tasks/${task.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ priority: newPriority }),
        });
        
        if (updateResponse.ok) {
          updatedCount++;
        }
      }
      
      return `⭐ Priorität von ${updatedCount} Aufgaben auf "${args.priority}" geändert.`;
    } catch (error) {
      console.error('handleUpdatePriority - error:', error);
      return `❌ Fehler bei der Prioritäts-Änderung: ${error}`;
    }
  }

  private async handleSortTasks(args: any, taskService: any): Promise<string> {
    try {
      // Load all tasks
      const response = await fetch('/api/tasks');
      if (!response.ok) {
        throw new Error(`Failed to load tasks: ${response.status}`);
      }
      
      const data = await response.json();
      let tasks = data.tasks || [];
      
      // Sort tasks
      tasks.sort((a: any, b: any) => {
        let aValue, bValue;
        
        switch (args.sortBy) {
          case 'priority':
            aValue = a.priority ? 1 : 0;
            bValue = b.priority ? 1 : 0;
            break;
          case 'dueDate':
            aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0;
            bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0;
            break;
          case 'createdAt':
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
            break;
          case 'title':
            aValue = a.title.toLowerCase();
            bValue = b.title.toLowerCase();
            break;
          default:
            return 0;
        }
        
        if (args.order === 'desc') {
          return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        } else {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        }
      });
      
      const taskList = tasks.map((task: any) => `- ${task.title}${task.priority ? ' ⭐' : ''}${task.dueDate ? ` (${new Date(task.dueDate).toLocaleDateString('de-DE')})` : ''}`).join('\n');
      
      return `📊 ${tasks.length} Aufgaben sortiert nach ${args.sortBy} (${args.order}):\n\n${taskList}`;
    } catch (error) {
      console.error('handleSortTasks - error:', error);
      return `❌ Fehler bei der Sortierung: ${error}`;
    }
  }

  private async handleCreateCategory(args: any, taskService: any): Promise<string> {
    try {
      // Load all tasks
      const response = await fetch('/api/tasks');
      if (!response.ok) {
        throw new Error(`Failed to load tasks: ${response.status}`);
      }
      
      const data = await response.json();
      let tasks = data.tasks || [];
      
      // Find tasks to move if keyword is provided
      let movedCount = 0;
      if (args.moveTasksWithKeyword) {
        const tasksToMove = tasks.filter((task: any) => 
          task.title.toLowerCase().includes(args.moveTasksWithKeyword.toLowerCase()) ||
          (task.description && task.description.toLowerCase().includes(args.moveTasksWithKeyword.toLowerCase()))
        );
        
        // Update category for matching tasks
        for (const task of tasksToMove) {
          const updateResponse = await fetch(`/api/tasks/${task.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ category: args.categoryName }),
          });
          
          if (updateResponse.ok) {
            movedCount++;
          }
        }
      }
      
      return `📁 Kategorie "${args.categoryName}" erstellt${movedCount > 0 ? ` und ${movedCount} Aufgaben verschoben` : ''}.`;
    } catch (error) {
      console.error('handleCreateCategory - error:', error);
      return `❌ Fehler bei der Kategorie-Erstellung: ${error}`;
    }
  }

  private async handleAddNotesToTask(args: any, taskService: any): Promise<string> {
    try {
      // Load the specific task first
      const response = await fetch(`/api/tasks/${args.taskId}`);
      if (!response.ok) {
        throw new Error(`Task not found: ${args.taskId}`);
      }
      
      const data = await response.json();
      const task = data.task;
      
      if (!task) {
        return `❌ Aufgabe mit ID ${args.taskId} nicht gefunden.`;
      }
      
      // Update notes
      const currentNotes = task.notes || '';
      const newNotes = args.append ? `${currentNotes}\n${args.notes}` : args.notes;
      
      const updateResponse = await fetch(`/api/tasks/${args.taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes: newNotes }),
      });
      
      if (!updateResponse.ok) {
        throw new Error(`Failed to update task: ${updateResponse.status}`);
      }
      
      return `📝 Notizen zu Aufgabe "${task.title}" ${args.append ? 'hinzugefügt' : 'aktualisiert'}: ${args.notes}`;
    } catch (error) {
      console.error('handleAddNotesToTask - error:', error);
      return `❌ Fehler beim Hinzufügen der Notizen: ${error}`;
    }
  }
}
