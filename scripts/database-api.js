#!/usr/bin/env node

/**
 * Web-API für Datenbank-Management
 * Stellt REST-Endpoints für bidirektionale Synchronisation bereit
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const { MarkdownTaskParser, LocalTaskDatabase } = require('./markdown-parser');
const { MarkdownGenerator, SyncService } = require('./markdown-generator');

class DatabaseAPI {
  constructor(port = 3001) {
    this.app = express();
    this.port = port;
    this.parser = new MarkdownTaskParser();
    this.database = new LocalTaskDatabase();
    this.generator = new MarkdownGenerator();
    this.syncService = new SyncService();
    
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
    this.app.get('/api/tasks', this.getTasks.bind(this));
    this.app.get('/api/smart-tasks', this.getSmartTasks.bind(this));
    this.app.get('/api/tasks/:id', this.getTask.bind(this));
    this.app.put('/api/tasks/:id', this.updateTask.bind(this));
    this.app.post('/api/tasks', this.createTask.bind(this));
    this.app.delete('/api/tasks/:id', this.deleteTask.bind(this));
    
    // Sync Routes
    this.app.post('/api/sync/markdown-to-json', this.syncMarkdownToJson.bind(this));
    this.app.post('/api/sync/json-to-markdown', this.syncJsonToMarkdown.bind(this));
    this.app.post('/api/sync/bidirectional', this.bidirectionalSync.bind(this));
    
    // Stats Routes
    this.app.get('/api/stats', this.getStats.bind(this));
    this.app.get('/api/logs', this.getLogs.bind(this));
    
    // Health Check
    this.app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
    
    // Markdown Content Routes
    this.app.get('/api/markdown/dashboard', this.getDashboardMarkdown.bind(this));
    this.app.get('/api/markdown/sidebar', this.getSidebarMarkdown.bind(this));
    
    // AI Integration Routes
    this.app.post('/api/slash-command', this.executeSlashCommand.bind(this));
    this.app.post('/api/mistral', this.askMistral.bind(this));
  }

  // Markdown Content Endpoints
  async getDashboardMarkdown(req, res) {
    try {
      const dashboardPath = './core/Dashboard - Strukturierte To-do-Übersicht.md';
      if (!fs.existsSync(dashboardPath)) {
        return res.status(404).json({
          success: false,
          error: 'Dashboard Markdown-Datei nicht gefunden'
        });
      }
      
      const content = fs.readFileSync(dashboardPath, 'utf8');
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.send(content);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getSidebarMarkdown(req, res) {
    try {
      const sidebarPath = './core/right-sidebar.md';
      if (!fs.existsSync(sidebarPath)) {
        return res.status(404).json({
          success: false,
          error: 'Sidebar Markdown-Datei nicht gefunden'
        });
      }
      
      const content = fs.readFileSync(sidebarPath, 'utf8');
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.send(content);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Task Management Endpoints
  async getTasks(req, res) {
    try {
      const tasks = this.database.loadTasks();
      res.json({
        success: true,
        data: tasks,
        count: tasks.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

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

  async getTask(req, res) {
    try {
      const tasks = this.database.loadTasks();
      const task = tasks.find(t => t.id === req.params.id);
      
      if (!task) {
        return res.status(404).json({
          success: false,
          error: 'Task nicht gefunden'
        });
      }
      
      res.json({
        success: true,
        data: task
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async updateTask(req, res) {
    try {
      const tasks = this.database.loadTasks();
      const taskIndex = tasks.findIndex(t => t.id === req.params.id);
      
      if (taskIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Task nicht gefunden'
        });
      }
      
      // Update task
      tasks[taskIndex] = {
        ...tasks[taskIndex],
        ...req.body,
        updated_at: new Date().toISOString()
      };
      
      this.database.saveTasks(tasks);
      
      res.json({
        success: true,
        data: tasks[taskIndex]
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
      const tasks = this.database.loadTasks();
      const newTask = {
        id: this.generateTaskId(req.body.title),
        ...req.body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      tasks.push(newTask);
      this.database.saveTasks(tasks);
      
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
      const tasks = this.database.loadTasks();
      const filteredTasks = tasks.filter(t => t.id !== req.params.id);
      
      if (tasks.length === filteredTasks.length) {
        return res.status(404).json({
          success: false,
          error: 'Task nicht gefunden'
        });
      }
      
      this.database.saveTasks(filteredTasks);
      
      res.json({
        success: true,
        message: 'Task gelöscht'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Sync Endpoints
  async syncMarkdownToJson(req, res) {
    try {
      const markdownPath = req.body.markdownPath || './core/Dashboard - Strukturierte To-do-Übersicht.md';
      await this.syncService.syncMarkdownToJSON(markdownPath, './data/tasks.json');
      
      res.json({
        success: true,
        message: 'Markdown zu JSON synchronisiert'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async syncJsonToMarkdown(req, res) {
    try {
      const jsonPath = req.body.jsonPath || './data/tasks.json';
      const markdownPath = req.body.markdownPath || './core/Dashboard - Strukturierte To-do-Übersicht.md';
      
      await this.syncService.syncJSONToMarkdown(jsonPath, markdownPath);
      
      res.json({
        success: true,
        message: 'JSON zu Markdown synchronisiert'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async bidirectionalSync(req, res) {
    try {
      const markdownPath = './core/Dashboard - Strukturierte To-do-Übersicht.md';
      const jsonPath = './data/tasks.json';
      
      // Führe Markdown-zu-JSON Sync durch
      await this.syncMarkdownToJson(markdownPath, jsonPath);
      
      // Führe Smart Task Enhancement durch
      const { SmartTaskEnhancer } = require('./smart-task-enhancer');
      const enhancer = new SmartTaskEnhancer();
      enhancer.enhanceTasks();
      
      res.json({
        success: true,
        message: 'Bidirektionale Synchronisation abgeschlossen',
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
      
      // Execute Mistral API call using the automation script
      const { exec } = require('child_process');
      const util = require('util');
      const execAsync = util.promisify(exec);
      
      const scriptPath = './automation/mistral-api.sh';
      const { stdout, stderr } = await execAsync(`${scriptPath} "${prompt}"`);
      
      if (stderr) {
        console.error('Mistral API error:', stderr);
      }
      
      // Extrahiere nur die eigentliche Antwort (nach "✅ Mistral Response:")
      let response = stdout.trim();
      const responseMatch = response.match(/✅ Mistral Response:\s*(.+)/s);
      if (responseMatch) {
        response = responseMatch[1].trim();
      }
      
      res.json({
        success: true,
        response: response
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Helper Methods
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

  start() {
    this.app.listen(this.port, () => {
      console.log(`🚀 Datenbank-API läuft auf Port ${this.port}`);
      console.log(`📊 API-Endpoints:`);
      console.log(`   • GET  /api/tasks - Alle Tasks`);
      console.log(`   • GET  /api/tasks/:id - Einzelner Task`);
      console.log(`   • PUT  /api/tasks/:id - Task aktualisieren`);
      console.log(`   • POST /api/tasks - Neuen Task erstellen`);
      console.log(`   • DELETE /api/tasks/:id - Task löschen`);
      console.log(`   • POST /api/sync/markdown-to-json - Markdown → JSON`);
      console.log(`   • POST /api/sync/json-to-markdown - JSON → Markdown`);
      console.log(`   • POST /api/sync/bidirectional - Bidirektionale Sync`);
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




