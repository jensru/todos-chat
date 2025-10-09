// App.js - Main Application Controller
import { ThemeManager } from './ThemeManager.js';
import { ChatManager } from './ChatManager.js';
import { CanvasManager } from './CanvasManager.js';
import { TaskManager } from './TaskManager.js';

export class App {
    constructor() {
        this.themeManager = new ThemeManager();
        this.chatManager = new ChatManager();
        this.canvasManager = new CanvasManager();
        this.taskManager = new TaskManager();
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadExistingData();
        this.setupDemoData();
    }

    bindEvents() {
        // Listen for chat messages to process tasks
        document.addEventListener('chat-message-sent', (e) => {
            this.processChatMessage(e.detail.message);
        });

        // Listen for quick actions
        document.addEventListener('quick-action-triggered', (e) => {
            this.handleQuickAction(e.detail.action);
        });

        // Listen for task updates
        document.addEventListener('task-updated', (e) => {
            this.handleTaskUpdate(e.detail.task);
        });

        // Listen for goal updates
        document.addEventListener('goal-updated', (e) => {
            this.handleGoalUpdate(e.detail.goal);
        });
    }

    loadExistingData() {
        const tasks = this.taskManager.getTasksByStatus('active');
        const goals = this.taskManager.getGoals();
        const dna = this.taskManager.getWorkingStyleDNA();

        // Render existing tasks
        tasks.forEach(task => {
            this.canvasManager.addTask(task);
        });

        // Render existing goals
        goals.forEach(goal => {
            this.canvasManager.addGoal(goal);
        });

        // Update working style DNA
        this.canvasManager.updateWorkingStyleDNA(dna);
    }

    setupDemoData() {
        // Only add demo data if no existing data
        if (this.taskManager.getTasksByStatus('active').length === 0) {
            // Demo task
            const demoTask = this.taskManager.createTask(
                'Präsentation für Montag vorbereiten',
                'Wichtige Präsentation für das Team-Meeting am Montag',
                {
                    priority: 'high',
                    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
                }
            );
            this.canvasManager.addTask(demoTask);

            // Demo goal
            const demoGoal = this.taskManager.createGoal(
                'Projekt A fertigstellen',
                'Das große Projekt bis Ende des Monats abschließen',
                {
                    progress: 60,
                    targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 2 weeks from now
                }
            );
            this.canvasManager.addGoal(demoGoal);

            // Hide empty state
            this.canvasManager.hideEmptyState();
        }
    }

    processChatMessage(message) {
        const lowerMessage = message.toLowerCase();
        
        // Task creation patterns
        if (this.isTaskCreationMessage(message)) {
            this.createTaskFromMessage(message);
        }
        
        // Goal creation patterns
        else if (this.isGoalCreationMessage(message)) {
            this.createGoalFromMessage(message);
        }
        
        // Subtask breakdown patterns
        else if (this.isSubtaskBreakdownMessage(message)) {
            this.handleSubtaskBreakdown(message);
        }
        
        // Working style DNA patterns
        else if (this.isWorkingStyleMessage(message)) {
            this.updateWorkingStyleFromMessage(message);
        }
    }

    isTaskCreationMessage(message) {
        const taskKeywords = ['aufgabe', 'todo', 'muss', 'soll', 'präsentation', 'bericht', 'email', 'anruf'];
        return taskKeywords.some(keyword => message.toLowerCase().includes(keyword));
    }

    isGoalCreationMessage(message) {
        const goalKeywords = ['ziel', 'projekt', 'erreichen', 'schaffen', 'fertigstellen', 'abschließen'];
        return goalKeywords.some(keyword => message.toLowerCase().includes(keyword));
    }

    isSubtaskBreakdownMessage(message) {
        const breakdownKeywords = ['unterteilen', 'schritte', 'aufteilen', 'zerlegen', 'planen'];
        return breakdownKeywords.some(keyword => message.toLowerCase().includes(keyword));
    }

    isWorkingStyleMessage(message) {
        const styleKeywords = ['arbeitsweise', 'stil', 'gewohnheit', 'muster', 'typisch'];
        return styleKeywords.some(keyword => message.toLowerCase().includes(keyword));
    }

    createTaskFromMessage(message) {
        // Extract task title from message
        const taskTitle = this.extractTaskTitle(message);
        
        if (taskTitle) {
            const task = this.taskManager.createTask(taskTitle, '', {
                priority: this.extractPriority(message),
                dueDate: this.extractDueDate(message)
            });
            
            this.canvasManager.addTask(task);
            
            // Ask for subtasks if it seems like a complex task
            if (this.isComplexTask(message)) {
                setTimeout(() => {
                    this.chatManager.addBotMessage("Willst du die Aufgabe in Schritte aufteilen?");
                }, 1000);
            }
        }
    }

    createGoalFromMessage(message) {
        const goalTitle = this.extractGoalTitle(message);
        
        if (goalTitle) {
            const goal = this.taskManager.createGoal(goalTitle, '', {
                progress: 0,
                targetDate: this.extractTargetDate(message)
            });
            
            this.canvasManager.addGoal(goal);
            
            setTimeout(() => {
                this.chatManager.addBotMessage("Ein neues Ziel! Das ist großartig. Lass uns das in messbare Schritte aufteilen.");
            }, 1000);
        }
    }

    handleSubtaskBreakdown(message) {
        const lastTask = this.taskManager.getTasksByStatus('active').slice(-1)[0];
        
        if (lastTask) {
            const subtasks = this.generateSubtasks(lastTask.title);
            
            // Show floating subtasks suggestion
            this.canvasManager.showFloatingSubtasks(subtasks);
            
            // Update working style DNA
            this.taskManager.updateWorkingStyleDNA({
                taskBreakdown: 'Zerlegt Aufgaben gern in 3 Schritte'
            });
            this.canvasManager.updateWorkingStyleDNA(this.taskManager.getWorkingStyleDNA());
        }
    }

    updateWorkingStyleFromMessage(message) {
        // Analyze message for working style insights
        const insights = this.extractWorkingStyleInsights(message);
        
        if (Object.keys(insights).length > 0) {
            this.taskManager.updateWorkingStyleDNA(insights);
            this.canvasManager.updateWorkingStyleDNA(this.taskManager.getWorkingStyleDNA());
        }
    }

    extractTaskTitle(message) {
        // Simple extraction - look for patterns like "Ich muss X" or "Ich soll X"
        const patterns = [
            /(?:ich muss|ich soll|ich will|ich möchte)\s+(.+?)(?:\.|$)/i,
            /(?:muss|soll|will|möchte)\s+(.+?)(?:\.|$)/i,
            /(.+?)\s+(?:vorbereiten|erstellen|schreiben|machen|fertigstellen)/i
        ];
        
        for (const pattern of patterns) {
            const match = message.match(pattern);
            if (match) {
                return match[1].trim();
            }
        }
        
        return message; // Fallback to full message
    }

    extractGoalTitle(message) {
        const patterns = [
            /(?:ziel|projekt)\s+(.+?)(?:\.|$)/i,
            /(?:erreichen|schaffen|fertigstellen|abschließen)\s+(.+?)(?:\.|$)/i,
            /(.+?)\s+(?:bis|bis zum|bis zur)/i
        ];
        
        for (const pattern of patterns) {
            const match = message.match(pattern);
            if (match) {
                return match[1].trim();
            }
        }
        
        return message;
    }

    extractPriority(message) {
        if (message.toLowerCase().includes('wichtig') || message.toLowerCase().includes('dringend')) {
            return 'high';
        } else if (message.toLowerCase().includes('niedrig') || message.toLowerCase().includes('später')) {
            return 'low';
        }
        return 'medium';
    }

    extractDueDate(message) {
        // Look for date patterns
        const datePatterns = [
            /(?:morgen|heute)/i,
            /(?:montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag)/i,
            /(?:nächste woche|nächsten monat)/i
        ];
        
        for (const pattern of datePatterns) {
            if (pattern.test(message)) {
                return this.parseRelativeDate(message.match(pattern)[0]);
            }
        }
        
        return null;
    }

    extractTargetDate(message) {
        // Similar to extractDueDate but for goals
        return this.extractDueDate(message);
    }

    parseRelativeDate(dateString) {
        const now = new Date();
        const lower = dateString.toLowerCase();
        
        if (lower.includes('heute')) {
            return now;
        } else if (lower.includes('morgen')) {
            return new Date(now.getTime() + 24 * 60 * 60 * 1000);
        } else if (lower.includes('nächste woche')) {
            return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        }
        
        return null;
    }

    isComplexTask(message) {
        const complexKeywords = ['präsentation', 'bericht', 'projekt', 'planung', 'vorbereitung'];
        return complexKeywords.some(keyword => message.toLowerCase().includes(keyword));
    }

    generateSubtasks(taskTitle) {
        // Simple subtask generation based on task type
        const lowerTitle = taskTitle.toLowerCase();
        
        if (lowerTitle.includes('präsentation')) {
            return [
                'Struktur erstellen',
                'Inhalte sammeln',
                'Folien gestalten',
                'Probevortrag halten'
            ];
        } else if (lowerTitle.includes('bericht')) {
            return [
                'Daten sammeln',
                'Struktur planen',
                'Text schreiben',
                'Korrektur lesen'
            ];
        } else if (lowerTitle.includes('projekt')) {
            return [
                'Planung erstellen',
                'Ressourcen organisieren',
                'Umsetzung starten',
                'Abschluss vorbereiten'
            ];
        }
        
        return [
            'Vorbereitung',
            'Umsetzung',
            'Abschluss'
        ];
    }

    extractWorkingStyleInsights(message) {
        const insights = {};
        
        if (message.toLowerCase().includes('schritte') || message.toLowerCase().includes('unterteilen')) {
            insights.taskBreakdown = 'Zerlegt Aufgaben gern in Schritte';
        }
        
        if (message.toLowerCase().includes('schnell') || message.toLowerCase().includes('quick')) {
            insights.quickWins = 'Setzt Quick Wins an den Anfang';
        }
        
        if (message.toLowerCase().includes('fällig') || message.toLowerCase().includes('deadline')) {
            insights.dueDates = 'Arbeitet gerne mit Fälligkeitsdaten';
        }
        
        return insights;
    }

    handleQuickAction(action) {
        if (action.includes('Aufgabe')) {
            this.chatManager.addBotMessage("Was für eine Aufgabe möchtest du erstellen?");
        } else if (action.includes('Ziel')) {
            this.chatManager.addBotMessage("Was für ein Ziel möchtest du erreichen?");
        }
    }

    handleTaskUpdate(task) {
        this.taskManager.updateTask(task.id, task);
        this.canvasManager.updateTaskDisplay(task);
    }

    handleGoalUpdate(goal) {
        this.taskManager.updateGoal(goal.id, goal);
        // Canvas manager would need a similar update method for goals
    }

    getAppState() {
        return {
            theme: this.themeManager.getCurrentTheme(),
            tasks: this.taskManager.getTasks(),
            goals: this.taskManager.getGoals(),
            workingStyleDNA: this.taskManager.getWorkingStyleDNA(),
            stats: this.taskManager.getStats()
        };
    }

    exportAppData() {
        return this.taskManager.exportData();
    }

    importAppData(data) {
        return this.taskManager.importData(data);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
