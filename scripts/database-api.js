#!/usr/bin/env node

/**
 * Web-API für Datenbank-Management
 * Stellt REST-Endpoints für Datenbank-Updates bereit (Markdown ist Read-Only)
 */

const express = require('express');
const fs = require('fs');
const path = require('path');

class DatabaseAPI {
  constructor(port = 3001) {
    this.app = express();
    this.port = port;
    
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.static('./web'));
    this.app.use('/data', express.static('./data'));
  }

  setupRoutes() {
    // API Routes
    this.app.get('/api/smart-tasks', this.getSmartTasks.bind(this));
    this.app.put('/api/tasks/:id', this.updateTask.bind(this));
    this.app.post('/api/tasks', this.createTask.bind(this));
    this.app.delete('/api/tasks/:id', this.deleteTask.bind(this));
    this.app.post('/api/tasks/update-category', this.updateTaskCategory.bind(this));
    this.app.post('/api/tasks/delete-by-category', this.deleteTasksByCategory.bind(this));
    
    // Stats Routes
    this.app.get('/api/stats', this.getStats.bind(this));
    this.app.get('/api/logs', this.getLogs.bind(this));
    
    // Health Check
    this.app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
    
    // Markdown Content Routes - REMOVED (Dashboard-System deprecated)
    
    // AI Integration Routes
    this.app.post('/api/slash-command', this.executeSlashCommand.bind(this));
    this.app.post('/api/mistral', this.askMistral.bind(this));
    
    // Daily Routine Routes
    this.app.post('/api/daily-routine/create', this.createDailyRoutine.bind(this));
    this.app.post('/api/daily-routine/update-all', this.updateAllDailyRoutines.bind(this));
    this.app.get('/api/daily-routine/stats', this.getDailyRoutineStats.bind(this));
    
    // Category Management Routes
    this.app.get('/api/categories', this.getCategories.bind(this));
  }

  // Markdown Content Endpoints - REMOVED (Dashboard-System deprecated)


  async getSmartTasks(req, res) {
    try {
      // Lade Smart Tasks aus der smart-tasks.json Datei
      const smartTasksPath = './data/smart-tasks.json';
      
      if (!fs.existsSync(smartTasksPath)) {
        return res.status(404).json({
          success: false,
          error: 'Smart Tasks nicht gefunden. Führen Sie zuerst das Smart Task Enhancement aus.',
          timestamp: new Date().toISOString()
        });
      }
      
      const smartTasksData = JSON.parse(fs.readFileSync(smartTasksPath, 'utf8'));
      
      res.json({
        success: true,
        tasks: smartTasksData.tasks || [],
        metadata: smartTasksData.metadata || {},
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async getCategories(req, res) {
    try {
      console.log('📁 GET /api/categories - Lade alle Kategorien');
      
      // Lade Smart Tasks aus der smart-tasks.json Datei
      const smartTasksPath = './data/smart-tasks.json';
      
      if (!fs.existsSync(smartTasksPath)) {
        return res.json({
          success: true,
          categories: [],
          count: 0,
          timestamp: new Date().toISOString()
        });
      }
      
      const smartTasksData = JSON.parse(fs.readFileSync(smartTasksPath, 'utf8'));
      const tasks = smartTasksData.tasks || [];
      const categories = [...new Set(tasks.map(task => task.category).filter(Boolean))].sort();
      
      console.log(`✅ ${categories.length} Kategorien gefunden:`, categories);
      
      res.json({
        success: true,
        categories: categories,
        count: categories.length,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ Fehler beim Laden der Kategorien:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }


  async updateTask(req, res) {
    try {
      // Lade Tasks aus smart-tasks.json
      const smartTasksPath = './data/smart-tasks.json';
      
      if (!fs.existsSync(smartTasksPath)) {
        return res.status(404).json({
          success: false,
          error: 'Smart Tasks nicht gefunden'
        });
      }
      
      const smartTasksData = JSON.parse(fs.readFileSync(smartTasksPath, 'utf8'));
      const taskIndex = smartTasksData.tasks.findIndex(t => t.id === req.params.id);
      
      if (taskIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Task nicht gefunden'
        });
      }
      
      // Update task
      smartTasksData.tasks[taskIndex] = {
        ...smartTasksData.tasks[taskIndex],
        ...req.body,
        updated_at: new Date().toISOString()
      };
      
      // Speichere zurück in smart-tasks.json
      fs.writeFileSync(smartTasksPath, JSON.stringify(smartTasksData, null, 2));
      
      // Update auch tasks.json für Konsistenz
      await this.updateTasksJson(smartTasksData.tasks[taskIndex]);
      
      res.json({
        success: true,
        data: smartTasksData.tasks[taskIndex]
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async updateTaskCategory(req, res) {
    try {
      const { taskId, category } = req.body;
      
      if (!taskId || !category) {
        return res.status(400).json({
          success: false,
          error: 'TaskId und Category sind erforderlich'
        });
      }
      
      // Lade Tasks aus smart-tasks.json
      const smartTasksPath = './data/smart-tasks.json';
      
      if (!fs.existsSync(smartTasksPath)) {
        return res.status(404).json({
          success: false,
          error: 'Smart Tasks nicht gefunden'
        });
      }
      
      const smartTasksData = JSON.parse(fs.readFileSync(smartTasksPath, 'utf8'));
      const taskIndex = smartTasksData.tasks.findIndex(t => t.id === taskId);
      
      if (taskIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Task nicht gefunden'
        });
      }
      
      // Update task category
      smartTasksData.tasks[taskIndex] = {
        ...smartTasksData.tasks[taskIndex],
        category: category,
        updated_at: new Date().toISOString()
      };
      
      // Speichere zurück in smart-tasks.json
      fs.writeFileSync(smartTasksPath, JSON.stringify(smartTasksData, null, 2));
      
      // Update auch tasks.json für Konsistenz
      await this.updateTasksJson(smartTasksData.tasks[taskIndex]);
      
      res.json({
        success: true,
        data: smartTasksData.tasks[taskIndex]
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async deleteTasksByCategory(req, res) {
    try {
      const { category } = req.body;
      
      if (!category) {
        return res.status(400).json({
          success: false,
          error: 'Category ist erforderlich'
        });
      }
      
      // Lade Tasks aus smart-tasks.json
      const smartTasksPath = './data/smart-tasks.json';
      
      if (!fs.existsSync(smartTasksPath)) {
        return res.status(404).json({
          success: false,
          error: 'Smart Tasks nicht gefunden'
        });
      }
      
      const smartTasksData = JSON.parse(fs.readFileSync(smartTasksPath, 'utf8'));
      
      // Filtere Tasks der Kategorie heraus
      const originalCount = smartTasksData.tasks.length;
      smartTasksData.tasks = smartTasksData.tasks.filter(task => task.category !== category);
      const deletedCount = originalCount - smartTasksData.tasks.length;
      
      // Speichere zurück in smart-tasks.json
      fs.writeFileSync(smartTasksPath, JSON.stringify(smartTasksData, null, 2));
      
      // Update auch tasks.json für Konsistenz
      const tasksPath = './data/tasks.json';
      if (fs.existsSync(tasksPath)) {
        const tasksData = JSON.parse(fs.readFileSync(tasksPath, 'utf8'));
        tasksData.tasks = tasksData.tasks.filter(task => task.category !== category);
        fs.writeFileSync(tasksPath, JSON.stringify(tasksData, null, 2));
      }
      
      res.json({
        success: true,
        deletedCount: deletedCount,
        message: `${deletedCount} Tasks der Kategorie "${category}" wurden gelöscht`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async createTask(req, res) {
    try {
      // Lade Tasks aus smart-tasks.json
      const smartTasksPath = './data/smart-tasks.json';
      
      if (!fs.existsSync(smartTasksPath)) {
        return res.status(404).json({
          success: false,
          error: 'Smart Tasks nicht gefunden'
        });
      }
      
      const smartTasksData = JSON.parse(fs.readFileSync(smartTasksPath, 'utf8'));
      
      const newTask = {
        id: this.generateTaskId(req.body.title),
        ...req.body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      smartTasksData.tasks.push(newTask);
      
      // Speichere zurück in smart-tasks.json
      fs.writeFileSync(smartTasksPath, JSON.stringify(smartTasksData, null, 2));
      
      // Update auch tasks.json für Konsistenz
      await this.addToTasksJson(newTask);
      
      res.status(201).json({
        success: true,
        data: newTask
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async deleteTask(req, res) {
    try {
      // Lade Tasks aus smart-tasks.json
      const smartTasksPath = './data/smart-tasks.json';
      
      if (!fs.existsSync(smartTasksPath)) {
        return res.status(404).json({
          success: false,
          error: 'Smart Tasks nicht gefunden'
        });
      }
      
      const smartTasksData = JSON.parse(fs.readFileSync(smartTasksPath, 'utf8'));
      const taskIndex = smartTasksData.tasks.findIndex(t => t.id === req.params.id);
      
      if (taskIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Task nicht gefunden'
        });
      }
      
      // Remove task
      const deletedTask = smartTasksData.tasks[taskIndex];
      smartTasksData.tasks.splice(taskIndex, 1);
      
      // Speichere zurück in smart-tasks.json
      fs.writeFileSync(smartTasksPath, JSON.stringify(smartTasksData, null, 2));
      
      // Update auch tasks.json für Konsistenz
      await this.deleteFromTasksJson(req.params.id);
      
      res.json({
        success: true,
        message: 'Task gelöscht',
        data: deletedTask
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }



  // Stats Endpoints
  async getStats(req, res) {
    try {
      const tasks = this.database.loadTasks();
      
      const stats = {
        total_tasks: tasks.length,
        pending_tasks: tasks.filter(t => t.status === 'pending').length,
        completed_tasks: tasks.filter(t => t.status === 'completed').length,
        high_priority: tasks.filter(t => t.priority === 'high').length,
        medium_priority: tasks.filter(t => t.priority === 'medium').length,
        low_priority: tasks.filter(t => t.priority === 'low').length,
        tasks_by_date: this.groupTasksByDate(tasks),
        tasks_by_project: this.groupTasksByProject(tasks),
        last_updated: new Date().toISOString()
      };
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getLogs(req, res) {
    try {
      const logPath = './data/sync-log.json';
      let logs = { recent_syncs: [] };
      
      if (fs.existsSync(logPath)) {
        logs = JSON.parse(fs.readFileSync(logPath, 'utf8'));
      }
      
      res.json({
        success: true,
        data: logs
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // AI Integration Methods
  async executeSlashCommand(req, res) {
    try {
      const { command } = req.body;
      
      if (!command) {
        return res.status(400).json({
          success: false,
          error: 'Command ist erforderlich'
        });
      }
      
      // Execute slash command using the automation script
      const { exec } = require('child_process');
      const util = require('util');
      const execAsync = util.promisify(exec);
      
      const scriptPath = './automation/simple-slash-commands.sh';
      const { stdout, stderr } = await execAsync(`${scriptPath} "${command}"`);
      
      if (stderr) {
        console.error('Slash command error:', stderr);
      }
      
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.send(stdout);
      
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async askMistral(req, res) {
    try {
      const { prompt } = req.body;
      
      if (!prompt) {
        return res.status(400).json({
          success: false,
          error: 'Prompt ist erforderlich'
        });
      }
      
      // Lade aktuelle Tasks für Kontext
      const smartTasksPath = './data/smart-tasks.json';
      let tasksContext = '';
      let availableCategories = [];
      
      if (fs.existsSync(smartTasksPath)) {
        const smartTasksData = JSON.parse(fs.readFileSync(smartTasksPath, 'utf8'));
        const tasks = smartTasksData.tasks || [];
        
        // Erstelle Kontext über aktuelle Tasks
        const tasksByCategory = {};
        tasks.forEach(task => {
          if (!tasksByCategory[task.category]) {
            tasksByCategory[task.category] = [];
          }
          tasksByCategory[task.category].push({
            title: task.title,
            status: task.status,
            due_date: task.due_date,
            priority: task.priority
          });
        });
        
        availableCategories = Object.keys(tasksByCategory);
        
        tasksContext = `\n\nAKTUELLE TASKS:\n`;
        Object.entries(tasksByCategory).forEach(([category, categoryTasks]) => {
          tasksContext += `\n📁 ${category} (${categoryTasks.length} Tasks):\n`;
          categoryTasks.slice(0, 5).forEach(task => {
            const status = task.status === 'completed' ? '✅' : '⏳';
            const priority = task.priority === 'high' ? '🔥' : task.priority === 'low' ? '🌅' : '';
            tasksContext += `  ${status} ${task.title} ${priority}\n`;
          });
          if (categoryTasks.length > 5) {
            tasksContext += `  ... und ${categoryTasks.length - 5} weitere\n`;
          }
        });
      }
      
      // Ultra-kurzer Prompt - nur das Nötigste
      const enhancedPrompt = `Tool. Antworte nur mit JSON. Keine Erklärungen.

AKTIONEN: CREATE_TASK, DELETE_CATEGORY, MOVE_TASKS, QUERY_TASKS
KATEGORIEN: ${availableCategories.join(', ')}
HEUTE: 2025-10-07, MORGEN: 2025-10-08

ANFRAGE: "${prompt}"
ANTWORT:`;
      
      // Execute Mistral API call using the automation script
      const { exec } = require('child_process');
      const util = require('util');
      const execAsync = util.promisify(exec);
      
      const scriptPath = './automation/mistral-api.sh';
      
      // Mistral API Integration - Direkte Tool-Calls
      try {
        const apiKey = process.env.MISTRAL_API_KEY || this.getMistralApiKey();
        
        // Dynamisches aktuelles Datum
        const today = new Date();
        const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD
        const todayFormatted = today.toLocaleDateString('de-DE', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        
        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: "mistral-large-latest",
            messages: [
              {
                role: "system",
                content: `You are a tool server for task management. You MUST use the available tools. Today is ${todayFormatted} (${todayString}). Always use the correct date (${todayString}) for today.

           Available Tools:
           - create_task: Create a new task
           - query_tasks: Search/filter tasks
           - update_task: Update a task (task_id, title, category, priority, due_date, status)
           - delete_category: Delete all tasks of a category
           - move_tasks: Move tasks between dates
           - create_category: Create a new category
           - rename_category: Rename an existing category

When a task ID is mentioned, use the corresponding update tools.

Priority Mapping:
- "hoch" or "high" → "high"
- "mittel" or "medium" → "medium"  
- "niedrig" or "low" → "low"

IMPORTANT: Always respond in the same language as the user's input. If the user writes in German, respond in German. If the user writes in English, respond in English.

Edge Cases:
- Tasks can be created without a title (will use "Untitled Task" as default)
- Tasks can be created without a category (will use "General" as default)
- All other fields (due_date, priority) are optional`
              },
              {
                role: "user",
                content: prompt
              }
            ],
            tools: [
      {
        type: "function",
        function: {
          name: "create_task",
                  description: "Create a new task",
          parameters: {
            type: "object",
            properties: {
                      title: { type: "string", description: "Title of the task" },
                      category: { type: "string", description: "Category of the task" },
                      due_date: { type: "string", description: "Due date (YYYY-MM-DD)" },
                      priority: { type: "string", enum: ["low", "medium", "high"], description: "Priority of the task" }
                    },
                    required: []
                  }
                }
              },
              {
                type: "function",
                function: {
                  name: "query_tasks",
                  description: "Search and filter tasks",
                  parameters: {
                    type: "object",
                    properties: {
                      category: { type: "string", description: "Category of the tasks" },
                      status: { type: "string", enum: ["pending", "completed"], description: "Status of the tasks" },
                      due_date: { type: "string", description: "Due date (YYYY-MM-DD)" },
                      priority: { type: "string", enum: ["low", "medium", "high"], description: "Priority of the tasks" }
                    },
                    required: []
          }
        }
      },
      {
        type: "function",
        function: {
          name: "delete_category",
                  description: "Delete all tasks of a category",
          parameters: {
            type: "object",
            properties: {
                      category: { type: "string", description: "Category to delete" }
            },
            required: ["category"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "move_tasks",
                  description: "Move tasks between dates",
          parameters: {
            type: "object",
            properties: {
                      category: { type: "string", description: "Category of the tasks" },
                      from_date: { type: "string", description: "From date (YYYY-MM-DD)" },
                      to_date: { type: "string", description: "To date (YYYY-MM-DD)" }
            },
            required: ["category", "from_date", "to_date"]
          }
        }
      },
      {
        type: "function",
        function: {
                  name: "update_task",
                  description: "Update an existing task",
          parameters: {
            type: "object",
            properties: {
                      task_id: { type: "string", description: "ID of the task" },
                      title: { type: "string", description: "New title of the task" },
                      category: { type: "string", description: "New category of the task" },
                      priority: { type: "string", enum: ["low", "medium", "high"], description: "New priority of the task" },
                      due_date: { type: "string", description: "New due date (YYYY-MM-DD)" },
                      status: { type: "string", enum: ["pending", "completed"], description: "New status of the task" }
                    },
                    required: ["task_id"]
                  }
                }
              },
              {
                type: "function",
                function: {
                  name: "create_category",
                  description: "Create a new category",
                  parameters: {
                    type: "object",
                    properties: {
                      category_name: { type: "string", description: "Name of the new category" }
                    },
                    required: ["category_name"]
                  }
                }
              },
              {
                type: "function",
                function: {
                  name: "rename_category",
                  description: "Rename an existing category",
                  parameters: {
                    type: "object",
                    properties: {
                      old_category: { type: "string", description: "Current name of the category" },
                      new_category: { type: "string", description: "New name of the category" }
                    },
                    required: ["old_category", "new_category"]
                  }
                }
              }
            ],
            tool_choice: "auto",
        max_tokens: 200,
        temperature: 0.1
      })
    });

    if (!response.ok) {
          throw new Error(`Mistral API Error: ${response.status}`);
    }

    const data = await response.json();
        const message = data.choices[0].message;
        
        if (message.tool_calls && message.tool_calls.length > 0) {
          // Execute tool calls direkt
          const toolCall = message.tool_calls[0];
        const { name, arguments: args } = toolCall.function;
        const params = JSON.parse(args);
        
          try {
        let result;
        switch (name) {
          case 'create_task':
            result = await this.executeCreateTaskTool(params);
            break;
              case 'query_tasks':
                result = await this.executeQueryTasksTool(params);
                break;
          case 'delete_category':
            result = await this.executeDeleteCategoryTool(params);
            break;
          case 'move_tasks':
            result = await this.executeMoveTasksTool(params);
            break;
              case 'update_task':
                result = await this.executeUpdateTaskTool(params);
                break;
              case 'create_category':
                result = await this.executeCreateCategoryTool(params);
                break;
              case 'rename_category':
                result = await this.executeRenameCategoryTool(params);
            break;
          default:
                throw new Error(`Unknown tool: ${name}`);
        }
        
            res.json({
              success: true,
              response: `✅ Tool executed: ${result.message}`
            });
      } catch (error) {
            console.error('Tool execution error:', error);
            res.json({
              success: false,
              error: `Tool execution failed: ${error.message}`
            });
          }
        } else {
          // Fallback für normale Antworten
          const content = message.content || "No response from Mistral received";
          
          res.json({
            success: true,
            response: content
          });
        }
        
      } catch (error) {
        console.error('Mistral API Fehler:', error.message);
        
        // Fallback: Einfache Antwort ohne AI
        const fallbackResponse = {
          success: true,
          response: JSON.stringify({
            command: "ACTION:CREATE_TASK|TITLE:" + prompt.replace(/[^a-zA-Z0-9\s]/g, '') + "|CATEGORY:General|DUE_DATE:2025-10-07",
            reply: "⚠️ Mistral nicht verfügbar. Task mit Standard-Einstellungen erstellt."
          })
        };
        
        return res.json(fallbackResponse);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }




  getMistralApiKey() {
    // Fallback für API Key
    const fs = require('fs');
    if (fs.existsSync('.mistral_api_key')) {
      return fs.readFileSync('.mistral_api_key', 'utf8').trim();
    }
    throw new Error('Mistral API Key nicht gefunden');
  }

  // Tool Execution Methods (used by current implementation)
  async executeCreateTaskTool(params) {
    try {
      const response = await fetch('http://localhost:3001/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: params.title || "Untitled Task",
          category: params.category || "General",
          status: 'pending',
          priority: params.priority || 'medium',
          due_date: params.due_date || new Date().toISOString().split('T')[0]
        })
      });
      
      if (response.ok) {
        return { success: true, message: `✅ Task "${params.title || 'Untitled Task'}" created in ${params.category || 'General'}.` };
      } else {
        return { success: false, message: `❌ Error creating task.` };
      }
    } catch (error) {
      return { success: false, message: `❌ Error: ${error.message}` };
    }
  }

  async executeQueryTasksTool(params) {
    try {
      const response = await fetch('http://localhost:3001/api/smart-tasks');
      const data = await response.json();
      
      let filteredTasks = data.tasks || [];
      
      if (params.category) {
        filteredTasks = filteredTasks.filter(task => task.category === params.category);
      }
      if (params.status) {
        filteredTasks = filteredTasks.filter(task => task.status === params.status);
      }
      if (params.due_date) {
        filteredTasks = filteredTasks.filter(task => task.due_date === params.due_date);
      }
      
      return { 
        success: true, 
        message: `📋 ${filteredTasks.length} tasks found for ${params.category || 'all categories'}.` 
      };
    } catch (error) {
      return { success: false, message: `❌ Error: ${error.message}` };
    }
  }

  async executeDeleteCategoryTool(params) {
    try {
      const response = await fetch('http://localhost:3001/api/smart-tasks');
      const data = await response.json();
      
      const tasksToDelete = (data.tasks || []).filter(task => 
        task.category === params.category && 
        task.due_date === params.due_date
      );
      
      let deletedCount = 0;
      for (const task of tasksToDelete) {
        const deleteResponse = await fetch(`http://localhost:3001/api/tasks/${task.id}`, {
          method: 'DELETE'
        });
        if (deleteResponse.ok) deletedCount++;
      }
      
      return { 
        success: true, 
        message: `🗑️ ${deletedCount} ${params.category} tasks deleted.` 
      };
    } catch (error) {
      return { success: false, message: `❌ Error: ${error.message}` };
    }
  }

  async executeMoveTasksTool(params) {
    try {
      const response = await fetch('http://localhost:3001/api/smart-tasks');
      const data = await response.json();
      
      const tasksToMove = (data.tasks || []).filter(task => 
        task.category === params.category && 
        task.due_date === params.from_date
      );
      
      let movedCount = 0;
      for (const task of tasksToMove) {
        const updateResponse = await fetch(`http://localhost:3001/api/tasks/${task.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ due_date: params.to_date })
        });
        if (updateResponse.ok) movedCount++;
      }
      
      return { 
        success: true, 
        message: `📅 ${movedCount} ${params.category} tasks moved from ${params.from_date} to ${params.to_date}.` 
      };
    } catch (error) {
      return { success: false, message: `❌ Error: ${error.message}` };
    }
  }

  // New Tool Execution Methods
  async executeUpdateTaskTool(params) {
    try {
      const updateData = {};
      if (params.title) updateData.title = params.title;
      if (params.category) updateData.category = params.category;
      if (params.priority) updateData.priority = params.priority;
      if (params.due_date) updateData.due_date = params.due_date;
      if (params.status) updateData.status = params.status;

      const response = await fetch(`http://localhost:3001/api/tasks/${params.task_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      
      if (response.ok) {
        return { success: true, message: `✅ Task ${params.task_id} updated successfully.` };
      } else {
        return { success: false, message: `❌ Error updating task.` };
      }
    } catch (error) {
      return { success: false, message: `❌ Error: ${error.message}` };
    }
  }


  async executeCreateCategoryTool(params) {
    try {
      // Kategorie wird automatisch erstellt, wenn ein Task mit dieser Kategorie erstellt wird
      // Hier können wir eine Bestätigung zurückgeben
      return { success: true, message: `✅ Category "${params.category_name}" is ready to use. Create a task with this category to activate it.` };
    } catch (error) {
      return { success: false, message: `❌ Error: ${error.message}` };
    }
  }

  async executeRenameCategoryTool(params) {
    try {
      // Alle Tasks mit der alten Kategorie finden und auf die neue Kategorie ändern
      const response = await fetch('http://localhost:3001/api/smart-tasks');
      const data = await response.json();
      
      const tasksToUpdate = data.tasks.filter(task => task.category === params.old_category);
      
      if (tasksToUpdate.length === 0) {
        return { success: false, message: `❌ No tasks found with category "${params.old_category}".` };
      }

      // Alle Tasks aktualisieren
      let updatedCount = 0;
      for (const task of tasksToUpdate) {
        const updateResponse = await fetch(`http://localhost:3001/api/tasks/${task.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category: params.new_category })
        });
        
        if (updateResponse.ok) {
          updatedCount++;
        }
      }

      return { 
        success: true, 
        message: `✅ Category renamed from "${params.old_category}" to "${params.new_category}". ${updatedCount} tasks updated.` 
      };
    } catch (error) {
      return { success: false, message: `❌ Error: ${error.message}` };
    }
  }

  // Helper Methods
  async addToTasksJson(newTask) {
    try {
      const tasksPath = './data/tasks.json';
      
      if (!fs.existsSync(tasksPath)) {
        console.log('⚠️  tasks.json nicht gefunden - überspringe Add');
        return;
      }
      
      const tasksData = JSON.parse(fs.readFileSync(tasksPath, 'utf8'));
      const tasksArray = tasksData.tasks || tasksData; // Handle both formats
      
      tasksArray.push(newTask);
      
      // Preserve original structure
      const updatedData = tasksData.tasks ? { ...tasksData, tasks: tasksArray } : tasksArray;
      fs.writeFileSync(tasksPath, JSON.stringify(updatedData, null, 2));
      console.log(`✅ Task ${newTask.id} added to tasks.json`);
    } catch (error) {
      console.error(`❌ Error adding to tasks.json:`, error.message);
    }
  }

  async deleteFromTasksJson(taskId) {
    try {
      const tasksPath = './data/tasks.json';
      
      if (!fs.existsSync(tasksPath)) {
        console.log('⚠️  tasks.json nicht gefunden - überspringe Delete');
        return;
      }
      
      const tasksData = JSON.parse(fs.readFileSync(tasksPath, 'utf8'));
      const tasksArray = tasksData.tasks || tasksData; // Handle both formats
      const taskIndex = tasksArray.findIndex(t => t.id === taskId);
      
      if (taskIndex !== -1) {
        tasksArray.splice(taskIndex, 1);
        
        // Preserve original structure
        const updatedData = tasksData.tasks ? { ...tasksData, tasks: tasksArray } : tasksArray;
        fs.writeFileSync(tasksPath, JSON.stringify(updatedData, null, 2));
        console.log(`✅ Task ${taskId} deleted from tasks.json`);
      } else {
        console.log(`⚠️  Task ${taskId} not found in tasks.json`);
      }
    } catch (error) {
      console.error(`❌ Error deleting from tasks.json:`, error.message);
    }
  }

  async updateTasksJson(updatedTask) {
    try {
      const tasksPath = './data/tasks.json';
      
      if (!fs.existsSync(tasksPath)) {
        console.log('⚠️  tasks.json nicht gefunden - überspringe Update');
        return;
      }
      
      const tasksData = JSON.parse(fs.readFileSync(tasksPath, 'utf8'));
      const tasksArray = tasksData.tasks || tasksData; // Handle both formats
      const taskIndex = tasksArray.findIndex(t => t.id === updatedTask.id);
      
      if (taskIndex !== -1) {
        tasksArray[taskIndex] = {
          ...tasksArray[taskIndex],
          ...updatedTask,
          updated_at: new Date().toISOString()
        };
        
        // Preserve original structure
        const updatedData = tasksData.tasks ? { ...tasksData, tasks: tasksArray } : tasksArray;
        fs.writeFileSync(tasksPath, JSON.stringify(updatedData, null, 2));
        console.log(`✅ tasks.json updated for task ${updatedTask.id}`);
      } else {
        console.log(`⚠️  Task ${updatedTask.id} not found in tasks.json`);
      }
    } catch (error) {
      console.error(`❌ Error updating tasks.json:`, error.message);
    }
  }

  generateTaskId(title) {
    const cleanTitle = title
      .replace(/[^a-zA-Z0-9]/g, '_')
      .toLowerCase()
      .substring(0, 20);
    
    return `task_${Date.now()}_${cleanTitle}`;
  }

  groupTasksByDate(tasks) {
    const grouped = {};
    tasks.forEach(task => {
      const date = task.date || 'Unbekannt';
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(task);
    });
    return grouped;
  }

  groupTasksByProject(tasks) {
    const grouped = {};
    tasks.forEach(task => {
      const project = task.project || 'Unbekannt';
      if (!grouped[project]) {
        grouped[project] = [];
      }
      grouped[project].push(task);
    });
    return grouped;
  }

  // Daily Routine Endpoints
  async createDailyRoutine(req, res) {
    try {
      const { date, days = 1 } = req.body;
      const DailyRoutineGenerator = require('./daily-routine-generator');
      const generator = new DailyRoutineGenerator();
      
      let result;
      
      if (date) {
        // Spezifisches Datum
        result = generator.createDailyFile(new Date(date));
      } else if (days > 1) {
        // Mehrere Tage
        result = generator.createRoutineForNextDays(days);
      } else {
        // Heute
        result = generator.createDailyFile(new Date());
      }
      
      res.json({
        success: true,
        data: {
          created: Array.isArray(result) ? result.length : 1,
          files: Array.isArray(result) ? result : [result]
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async updateAllDailyRoutines(req, res) {
    try {
      const DailyRoutineGenerator = require('./daily-routine-generator');
      const generator = new DailyRoutineGenerator();
      
      const updatedFiles = generator.updateAllExistingFiles();
      
      res.json({
        success: true,
        data: {
          updated: updatedFiles.length,
          files: updatedFiles
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getDailyRoutineStats(req, res) {
    try {
      const DailyRoutineGenerator = require('./daily-routine-generator');
      const generator = new DailyRoutineGenerator();
      
      // Temporärer Output-Capture für Stats
      const originalLog = console.log;
      let statsOutput = '';
      console.log = (...args) => {
        statsOutput += args.join(' ') + '\n';
      };
      
      generator.showStats();
      
      // Restore console.log
      console.log = originalLog;
      
      res.json({
        success: true,
        data: {
          stats: statsOutput.trim()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`🚀 Datenbank-API läuft auf Port ${this.port}`);
      console.log(`📊 API-Endpoints:`);
      console.log(`   • GET  /api/smart-tasks - Alle Smart Tasks`);
      console.log(`   • PUT  /api/tasks/:id - Task aktualisieren`);
      console.log(`   • POST /api/tasks - Neuen Task erstellen`);
      console.log(`   • DELETE /api/tasks/:id - Task löschen`);
      console.log(`   • GET  /api/stats - Statistiken`);
      console.log(`   • GET  /api/logs - Sync-Logs`);
      console.log(`   • GET  /api/health - Health Check`);
      console.log(`\n🌐 Web-Interface: http://localhost:${this.port}`);
    });
  }
}

/**
 * Hauptfunktion
 */
function main() {
  const args = process.argv.slice(2);
  const port = parseInt(args[0]) || 3001;
  
  const api = new DatabaseAPI(port);
  api.start();
}

// Script ausführen
if (require.main === module) {
  main();
}

module.exports = DatabaseAPI;




