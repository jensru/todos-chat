// TaskManager.js - Task and Goal Management
export class TaskManager {
    constructor() {
        this.tasks = [];
        this.goals = [];
        this.workingStyleDNA = {
            taskBreakdown: 'Zerlegt Aufgaben gern in 3 Schritte',
            quickWins: 'Setzt Quick Wins an den Anfang',
            dueDates: 'Meist Fälligkeiten < 3 Tage'
        };
        this.init();
    }

    init() {
        this.loadFromStorage();
    }

    createTask(title, description = '', options = {}) {
        const task = {
            id: Date.now(),
            title: title,
            description: description,
            completed: false,
            priority: options.priority || 'medium',
            dueDate: options.dueDate || null,
            subtasks: options.subtasks || [],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.tasks.push(task);
        this.saveToStorage();
        return task;
    }

    createGoal(title, description = '', options = {}) {
        const goal = {
            id: Date.now(),
            title: title,
            description: description,
            progress: options.progress || 0,
            targetDate: options.targetDate || null,
            milestones: options.milestones || [],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.goals.push(goal);
        this.saveToStorage();
        return goal;
    }

    updateTask(taskId, updates) {
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...updates, updatedAt: new Date() };
            this.saveToStorage();
            return this.tasks[taskIndex];
        }
        return null;
    }

    updateGoal(goalId, updates) {
        const goalIndex = this.goals.findIndex(goal => goal.id === goalId);
        if (goalIndex !== -1) {
            this.goals[goalIndex] = { ...this.goals[goalIndex], ...updates, updatedAt: new Date() };
            this.saveToStorage();
            return this.goals[goalIndex];
        }
        return null;
    }

    deleteTask(taskId) {
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            const deletedTask = this.tasks.splice(taskIndex, 1)[0];
            this.saveToStorage();
            return deletedTask;
        }
        return null;
    }

    deleteGoal(goalId) {
        const goalIndex = this.goals.findIndex(goal => goal.id === goalId);
        if (goalIndex !== -1) {
            const deletedGoal = this.goals.splice(goalIndex, 1)[0];
            this.saveToStorage();
            return deletedGoal;
        }
        return null;
    }

    addSubtasksToTask(taskId, subtasks) {
        const task = this.tasks.find(task => task.id === taskId);
        if (task) {
            const newSubtasks = subtasks.map(title => ({
                id: Date.now() + Math.random(),
                title: title,
                completed: false
            }));
            
            task.subtasks = [...(task.subtasks || []), ...newSubtasks];
            task.updatedAt = new Date();
            this.saveToStorage();
            return task;
        }
        return null;
    }

    toggleSubtask(taskId, subtaskId) {
        const task = this.tasks.find(task => task.id === taskId);
        if (task && task.subtasks) {
            const subtask = task.subtasks.find(sub => sub.id === subtaskId);
            if (subtask) {
                subtask.completed = !subtask.completed;
                task.updatedAt = new Date();
                this.saveToStorage();
                return task;
            }
        }
        return null;
    }

    updateWorkingStyleDNA(dna) {
        this.workingStyleDNA = { ...this.workingStyleDNA, ...dna };
        this.saveToStorage();
    }

    analyzeWorkingStyle() {
        // Analyze user patterns and update DNA
        const completedTasks = this.tasks.filter(task => task.completed);
        const recentTasks = this.tasks.filter(task => {
            const daysSinceCreated = (new Date() - new Date(task.createdAt)) / (1000 * 60 * 60 * 24);
            return daysSinceCreated <= 7;
        });

        // Analyze task breakdown patterns
        const tasksWithSubtasks = completedTasks.filter(task => task.subtasks && task.subtasks.length > 0);
        if (tasksWithSubtasks.length > 0) {
            const avgSubtasks = tasksWithSubtasks.reduce((sum, task) => sum + task.subtasks.length, 0) / tasksWithSubtasks.length;
            if (avgSubtasks >= 3) {
                this.workingStyleDNA.taskBreakdown = `Zerlegt Aufgaben gern in ${Math.round(avgSubtasks)} Schritte`;
            }
        }

        // Analyze due date patterns
        const tasksWithDueDates = recentTasks.filter(task => task.dueDate);
        if (tasksWithDueDates.length > 0) {
            const avgDaysToDue = tasksWithDueDates.reduce((sum, task) => {
                const daysToDue = (new Date(task.dueDate) - new Date(task.createdAt)) / (1000 * 60 * 60 * 24);
                return sum + daysToDue;
            }, 0) / tasksWithDueDates.length;
            
            if (avgDaysToDue < 3) {
                this.workingStyleDNA.dueDates = 'Meist Fälligkeiten < 3 Tage';
            } else if (avgDaysToDue < 7) {
                this.workingStyleDNA.dueDates = 'Meist Fälligkeiten < 1 Woche';
            } else {
                this.workingStyleDNA.dueDates = 'Meist Fälligkeiten > 1 Woche';
            }
        }

        this.saveToStorage();
        return this.workingStyleDNA;
    }

    getTasksByStatus(status) {
        switch (status) {
            case 'active':
                return this.tasks.filter(task => !task.completed);
            case 'completed':
                return this.tasks.filter(task => task.completed);
            case 'overdue':
                return this.tasks.filter(task => {
                    if (!task.dueDate || task.completed) return false;
                    return new Date(task.dueDate) < new Date();
                });
            default:
                return this.tasks;
        }
    }

    getTasksByPriority(priority) {
        return this.tasks.filter(task => task.priority === priority);
    }

    getUpcomingTasks(days = 7) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);
        
        return this.tasks.filter(task => {
            if (!task.dueDate || task.completed) return false;
            const dueDate = new Date(task.dueDate);
            return dueDate <= futureDate && dueDate >= new Date();
        });
    }

    getStats() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.completed).length;
        const activeTasks = totalTasks - completedTasks;
        const overdueTasks = this.getTasksByStatus('overdue').length;
        
        return {
            total: totalTasks,
            completed: completedTasks,
            active: activeTasks,
            overdue: overdueTasks,
            completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
        };
    }

    saveToStorage() {
        const data = {
            tasks: this.tasks,
            goals: this.goals,
            workingStyleDNA: this.workingStyleDNA,
            lastUpdated: new Date()
        };
        
        localStorage.setItem('todo-app-data', JSON.stringify(data));
    }

    loadFromStorage() {
        const data = localStorage.getItem('todo-app-data');
        if (data) {
            try {
                const parsed = JSON.parse(data);
                this.tasks = parsed.tasks || [];
                this.goals = parsed.goals || [];
                this.workingStyleDNA = parsed.workingStyleDNA || {};
            } catch (error) {
                console.error('Error loading data from storage:', error);
                this.tasks = [];
                this.goals = [];
                this.workingStyleDNA = {};
            }
        }
    }

    exportData() {
        return {
            tasks: this.tasks,
            goals: this.goals,
            workingStyleDNA: this.workingStyleDNA,
            stats: this.getStats(),
            exportedAt: new Date()
        };
    }

    importData(data) {
        if (data.tasks) this.tasks = data.tasks;
        if (data.goals) this.goals = data.goals;
        if (data.workingStyleDNA) this.workingStyleDNA = data.workingStyleDNA;
        
        this.saveToStorage();
        return true;
    }
}
