/**
 * Task Service - Business Logic für Task-Management
 * Baut auf dem APIManager auf und bietet höhere Abstraktionsebene
 */

class TaskService {
    constructor() {
        this.apiManager = new APIManager();
        this.eventListeners = new Map();
    }

    // Event System
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    off(event, callback) {
        if (!this.eventListeners.has(event)) return;
        
        const listeners = this.eventListeners.get(event);
        const index = listeners.indexOf(callback);
        if (index > -1) {
            listeners.splice(index, 1);
        }
    }

    emit(event, data) {
        if (!this.eventListeners.has(event)) return;
        
        this.eventListeners.get(event).forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event listener for ${event}:`, error);
            }
        });
    }

    // Task CRUD Operations
    async getAllTasks() {
        try {
            const tasks = await this.apiManager.getTasks();
            this.emit('tasksLoaded', tasks);
            return tasks;
        } catch (error) {
            this.emit('error', { operation: 'getAllTasks', error });
            throw error;
        }
    }

    async getTaskById(taskId) {
        try {
            const task = await this.apiManager.getTask(taskId);
            this.emit('taskLoaded', task);
            return task;
        } catch (error) {
            this.emit('error', { operation: 'getTaskById', error, taskId });
            throw error;
        }
    }

    async createTask(taskData) {
        try {
            // Validate task data
            const validatedData = this.validateTaskData(taskData);
            
            const newTask = await this.apiManager.createTask(validatedData);
            this.emit('taskCreated', newTask);
            return newTask;
        } catch (error) {
            this.emit('error', { operation: 'createTask', error, taskData });
            throw error;
        }
    }

    async updateTask(taskId, updates) {
        try {
            // Validate updates
            const validatedUpdates = this.validateTaskUpdates(updates);
            
            const updatedTask = await this.apiManager.updateTask(taskId, validatedUpdates);
            this.emit('taskUpdated', updatedTask);
            return updatedTask;
        } catch (error) {
            this.emit('error', { operation: 'updateTask', error, taskId, updates });
            throw error;
        }
    }

    async deleteTask(taskId) {
        try {
            const deletedTask = await this.apiManager.deleteTask(taskId);
            this.emit('taskDeleted', { taskId, task: deletedTask });
            return deletedTask;
        } catch (error) {
            this.emit('error', { operation: 'deleteTask', error, taskId });
            throw error;
        }
    }

    async toggleTaskStatus(taskId) {
        try {
            const toggledTask = await this.apiManager.toggleTask(taskId);
            this.emit('taskToggled', toggledTask);
            return toggledTask;
        } catch (error) {
            this.emit('error', { operation: 'toggleTaskStatus', error, taskId });
            throw error;
        }
    }

    // Task Filtering and Search
    async searchTasks(query) {
        try {
            const tasks = await this.apiManager.searchTasks(query);
            this.emit('tasksSearched', { query, results: tasks });
            return tasks;
        } catch (error) {
            this.emit('error', { operation: 'searchTasks', error, query });
            throw error;
        }
    }

    async getTasksByCategory(category) {
        try {
            const tasks = await this.apiManager.filterTasksByCategory(category);
            this.emit('tasksFiltered', { filter: 'category', value: category, results: tasks });
            return tasks;
        } catch (error) {
            this.emit('error', { operation: 'getTasksByCategory', error, category });
            throw error;
        }
    }

    async getTasksByStatus(status) {
        try {
            const tasks = await this.apiManager.filterTasksByStatus(status);
            this.emit('tasksFiltered', { filter: 'status', value: status, results: tasks });
            return tasks;
        } catch (error) {
            this.emit('error', { operation: 'getTasksByStatus', error, status });
            throw error;
        }
    }

    async getTasksByDate(date) {
        try {
            const tasks = await this.apiManager.filterTasksByDate(date);
            this.emit('tasksFiltered', { filter: 'date', value: date, results: tasks });
            return tasks;
        } catch (error) {
            this.emit('error', { operation: 'getTasksByDate', error, date });
            throw error;
        }
    }

    async getTasksByPriority(priority) {
        try {
            const tasks = await this.getAllTasks();
            const filteredTasks = tasks.filter(task => task.priority === priority);
            this.emit('tasksFiltered', { filter: 'priority', value: priority, results: filteredTasks });
            return filteredTasks;
        } catch (error) {
            this.emit('error', { operation: 'getTasksByPriority', error, priority });
            throw error;
        }
    }

    // Category Management
    async getAllCategories() {
        try {
            const categories = await this.apiManager.getCategories();
            this.emit('categoriesLoaded', categories);
            return categories;
        } catch (error) {
            this.emit('error', { operation: 'getAllCategories', error });
            throw error;
        }
    }

    async getTasksByCategory(category) {
        try {
            const tasks = await this.apiManager.filterTasksByCategory(category);
            this.emit('tasksFiltered', { filter: 'category', value: category, results: tasks });
            return tasks;
        } catch (error) {
            this.emit('error', { operation: 'getTasksByCategory', error, category });
            throw error;
        }
    }

    // Task Statistics
    async getTaskStatistics() {
        try {
            const tasks = await this.getAllTasks();
            const stats = this.calculateTaskStatistics(tasks);
            this.emit('statisticsCalculated', stats);
            return stats;
        } catch (error) {
            this.emit('error', { operation: 'getTaskStatistics', error });
            throw error;
        }
    }

    calculateTaskStatistics(tasks) {
        const stats = {
            total: tasks.length,
            pending: 0,
            completed: 0,
            highPriority: 0,
            mediumPriority: 0,
            lowPriority: 0,
            byCategory: {},
            byDate: {},
            overdue: 0,
            dueToday: 0,
            dueTomorrow: 0
        };

        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        tasks.forEach(task => {
            // Status counts
            if (task.status === 'pending') stats.pending++;
            if (task.status === 'completed') stats.completed++;

            // Priority counts
            if (task.priority === 'high') stats.highPriority++;
            if (task.priority === 'medium') stats.mediumPriority++;
            if (task.priority === 'low') stats.lowPriority++;

            // Category counts
            if (!stats.byCategory[task.category]) {
                stats.byCategory[task.category] = 0;
            }
            stats.byCategory[task.category]++;

            // Date counts
            if (task.due_date) {
                if (!stats.byDate[task.due_date]) {
                    stats.byDate[task.due_date] = 0;
                }
                stats.byDate[task.due_date]++;

                // Special date counts
                if (task.due_date < today) stats.overdue++;
                if (task.due_date === today) stats.dueToday++;
                if (task.due_date === tomorrow) stats.dueTomorrow++;
            }
        });

        return stats;
    }

    // Data Validation
    validateTaskData(taskData) {
        const validated = { ...taskData };

        // Required fields
        if (!validated.title || validated.title.trim() === '') {
            validated.title = 'Untitled Task';
        }

        // Optional fields with defaults
        if (!validated.category) validated.category = 'General';
        if (!validated.status) validated.status = 'pending';
        if (!validated.priority) validated.priority = 'medium';

        // Validate priority
        if (!['low', 'medium', 'high'].includes(validated.priority)) {
            validated.priority = 'medium';
        }

        // Validate status
        if (!['pending', 'completed'].includes(validated.status)) {
            validated.status = 'pending';
        }

        // Validate due_date format
        if (validated.due_date && !this.isValidDate(validated.due_date)) {
            validated.due_date = null;
        }

        return validated;
    }

    validateTaskUpdates(updates) {
        const validated = { ...updates };

        // Validate priority if provided
        if (validated.priority && !['low', 'medium', 'high'].includes(validated.priority)) {
            delete validated.priority;
        }

        // Validate status if provided
        if (validated.status && !['pending', 'completed'].includes(validated.status)) {
            delete validated.status;
        }

        // Validate due_date format if provided
        if (validated.due_date && !this.isValidDate(validated.due_date)) {
            delete validated.due_date;
        }

        return validated;
    }

    isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date) && dateString.match(/^\d{4}-\d{2}-\d{2}$/);
    }

    // Utility Methods
    async refreshData() {
        try {
            const tasks = await this.apiManager.refreshData();
            this.emit('dataRefreshed', tasks);
            return tasks;
        } catch (error) {
            this.emit('error', { operation: 'refreshData', error });
            throw error;
        }
    }

    // Batch Operations
    async batchUpdateTasks(updates) {
        try {
            const results = await this.apiManager.batchUpdateTasks(updates);
            this.emit('batchUpdateCompleted', results);
            return results;
        } catch (error) {
            this.emit('error', { operation: 'batchUpdateTasks', error, updates });
            throw error;
        }
    }

    // Health Check
    async healthCheck() {
        try {
            const health = await this.apiManager.healthCheck();
            this.emit('healthChecked', health);
            return health;
        } catch (error) {
            this.emit('error', { operation: 'healthCheck', error });
            throw error;
        }
    }
}

// Export for use in other modules
window.TaskService = TaskService;

