// TaskService.js - Service für Todo-Datenbank Integration
class TaskService {
    constructor() {
        this.tasks = [];
        this.loadTasks();
    }

    async loadTasks() {
        try {
            // Lade Tasks aus der smart-tasks.json
            const response = await fetch('/data/smart-tasks.json');
            if (response.ok) {
                const data = await response.json();
                this.tasks = data.tasks || [];
            } else {
                // Fallback auf tasks.json
                const fallbackResponse = await fetch('/data/tasks.json');
                if (fallbackResponse.ok) {
                    const fallbackData = await fallbackResponse.json();
                    this.tasks = fallbackData.tasks || [];
                }
            }
        } catch (error) {
            console.error('Fehler beim Laden der Tasks:', error);
            this.tasks = [];
        }
    }

    getTasksSortedByDateAndPosition() {
        return this.tasks
            .filter(task => task.status !== 'completed') // Nur aktive Tasks
            .sort((a, b) => {
                // 1. Sortierung nach due_date
                const dateA = a.due_date ? a.due_date : 'ohne-datum';
                const dateB = b.due_date ? b.due_date : 'ohne-datum';
                
                if (dateA !== dateB) {
                    if (dateA === 'ohne-datum') return 1;
                    if (dateB === 'ohne-datum') return -1;
                    return new Date(dateA) - new Date(dateB);
                }
                
                // 2. Sortierung nach Priorität (high > medium > low)
                const priorityOrder = { 'high': 1, 'medium': 2, 'low': 3 };
                const priorityA = priorityOrder[a.priority] || 4;
                const priorityB = priorityOrder[b.priority] || 4;
                
                if (priorityA !== priorityB) {
                    return priorityA - priorityB;
                }
                
                // 3. Sortierung nach globaler Position (falls vorhanden)
                const globalPosA = a.global_position || a.line_number || 999;
                const globalPosB = b.global_position || b.line_number || 999;
                
                return globalPosA - globalPosB;
            });
    }

    getTasksByDate(date) {
        const targetDate = new Date(date).toISOString().split('T')[0];
        return this.tasks.filter(task => 
            task.due_date === targetDate && task.status !== 'completed'
        );
    }

    getTasksByCategory(category) {
        return this.tasks.filter(task => 
            task.category === category && task.status !== 'completed'
        );
    }

    getTasksByPriority(priority) {
        return this.tasks.filter(task => 
            task.priority === priority && task.status !== 'completed'
        );
    }

    getOverdueTasks() {
        const today = new Date().toISOString().split('T')[0];
        return this.tasks.filter(task => 
            task.due_date && 
            task.due_date < today && 
            task.status !== 'completed'
        );
    }

    getTodayTasks() {
        const today = new Date().toISOString().split('T')[0];
        return this.tasks.filter(task => 
            task.due_date === today && task.status !== 'completed'
        );
    }

    getUpcomingTasks(days = 7) {
        const today = new Date();
        const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
        const todayStr = today.toISOString().split('T')[0];
        const futureStr = futureDate.toISOString().split('T')[0];
        
        return this.tasks.filter(task => 
            task.due_date && 
            task.due_date >= todayStr && 
            task.due_date <= futureStr && 
            task.status !== 'completed'
        );
    }

    getTaskStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.status === 'completed').length;
        const active = total - completed;
        const overdue = this.getOverdueTasks().length;
        const today = this.getTodayTasks().length;
        
        return {
            total,
            completed,
            active,
            overdue,
            today,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
        };
    }

    getCategories() {
        const categories = [...new Set(this.tasks.map(task => task.category))];
        return categories.sort();
    }

    getPriorities() {
        return ['high', 'medium', 'low'];
    }

    // Konvertiert Database-Task zu React-Task-Format
    convertToReactTask(dbTask) {
        // Sichere Datum-Parsing-Funktion
        const parseDate = (dateString) => {
            if (!dateString) return null;
            try {
                const date = new Date(dateString);
                return isNaN(date.getTime()) ? null : date;
            } catch (error) {
                console.warn('Invalid date:', dateString);
                return null;
            }
        };

        return {
            id: dbTask.id,
            title: dbTask.title,
            description: dbTask.description || '',
            completed: dbTask.status === 'completed',
            priority: dbTask.priority || 'medium',
            dueDate: parseDate(dbTask.due_date),
            category: dbTask.category || 'General',
            tags: dbTask.tags || [],
            subtasks: dbTask.subtasks ? dbTask.subtasks.map(subtask => ({
                id: subtask.id,
                title: subtask.title,
                completed: subtask.status === 'completed'
            })) : [],
            createdAt: parseDate(dbTask.created_at) || new Date(),
            updatedAt: parseDate(dbTask.updated_at) || new Date(),
            sourceFile: dbTask.source_file,
            lineNumber: dbTask.line_number,
            globalPosition: dbTask.global_position || dbTask.line_number || 0,
            complexity: dbTask.complexity,
            smartScore: dbTask.smart_score
        };
    }

    // Lädt alle Tasks und konvertiert sie für React
    getReactTasks() {
        return this.getTasksSortedByDateAndPosition().map(task => 
            this.convertToReactTask(task)
        );
    }

    // Lädt Tasks für heute
    getTodayReactTasks() {
        return this.getTodayTasks().map(task => 
            this.convertToReactTask(task)
        );
    }

    // Lädt überfällige Tasks
    getOverdueReactTasks() {
        return this.getOverdueTasks().map(task => 
            this.convertToReactTask(task)
        );
    }

    // Lädt kommende Tasks
    getUpcomingReactTasks(days = 7) {
        return this.getUpcomingTasks(days).map(task => 
            this.convertToReactTask(task)
        );
    }
    
    // Aktualisiert eine Task in der Datenbank
    async updateTask(taskId, updates) {
        try {
            // Finde und aktualisiere die Task in den lokalen Tasks
            const taskIndex = this.tasks.findIndex(task => task.id === taskId);
            if (taskIndex !== -1) {
                this.tasks[taskIndex] = {
                    ...this.tasks[taskIndex],
                    ...updates,
                    updated_at: new Date().toISOString()
                };
                
                console.log('Task updated locally:', this.tasks[taskIndex]);
                
                // In einer echten App würde hier eine API-Call gemacht werden
                // Für jetzt aktualisieren wir nur die lokalen Tasks
                return true;
            } else {
                console.warn('Task not found for update:', taskId);
                return false;
            }
        } catch (error) {
            console.error('Error updating task:', error);
            return false;
        }
    }
    
    // Speichert die neue Reihenfolge der Tasks
    async saveTaskOrder(tasks) {
        try {
            // Aktualisiere line_number basierend auf der neuen Reihenfolge
            const updatedTasks = tasks.map((task, index) => ({
                ...task,
                line_number: index + 1,
                updated_at: new Date().toISOString()
            }));
            
            // Speichere in der Datenbank
            await this.updateTasks(updatedTasks);
            
            console.log('Task order saved');
        } catch (error) {
            console.error('Error saving task order:', error);
        }
    }
}

// Export für Verwendung in React-Komponenten
window.TaskService = TaskService;
