/**
 * API Manager - Zentrale API-Verwaltung mit erweiterten Features
 * Baut auf dem bestehenden ApiService auf und fügt zusätzliche Funktionalität hinzu
 */

class APIManager {
    constructor() {
        this.apiService = new ApiService();
        this.cache = new Map();
        this.cacheTimeout = 30000; // 30 Sekunden
        this.retryAttempts = 3;
        this.retryDelay = 1000; // 1 Sekunde
    }

    // Cache Management
    setCache(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    getCache(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;
        
        const isExpired = Date.now() - cached.timestamp > this.cacheTimeout;
        if (isExpired) {
            this.cache.delete(key);
            return null;
        }
        
        return cached.data;
    }

    clearCache() {
        this.cache.clear();
    }

    // Enhanced API methods with retry logic
    async requestWithRetry(endpoint, options = {}, attempt = 1) {
        try {
            return await this.apiService.request(endpoint, options);
        } catch (error) {
            if (attempt < this.retryAttempts) {
                console.warn(`API request failed (attempt ${attempt}), retrying...`, error);
                await this.delay(this.retryDelay * attempt);
                return this.requestWithRetry(endpoint, options, attempt + 1);
            }
            throw error;
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Task Management with caching
    async getTasks(forceRefresh = false) {
        const cacheKey = 'tasks';
        
        if (!forceRefresh) {
            const cached = this.getCache(cacheKey);
            if (cached) return cached;
        }

        try {
            const response = await this.requestWithRetry('/api/smart-tasks');
            const tasks = response.tasks || [];
            
            this.setCache(cacheKey, tasks);
            return tasks;
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
            throw error;
        }
    }

    async getTask(taskId) {
        const cacheKey = `task_${taskId}`;
        const cached = this.getCache(cacheKey);
        if (cached) return cached;

        try {
            const response = await this.requestWithRetry(`/api/tasks/${taskId}`);
            this.setCache(cacheKey, response);
            return response;
        } catch (error) {
            console.error(`Failed to fetch task ${taskId}:`, error);
            throw error;
        }
    }

    async createTask(taskData) {
        try {
            const response = await this.requestWithRetry('/api/tasks', {
                method: 'POST',
                body: JSON.stringify(taskData)
            });
            
            // Invalidate cache
            this.clearCache();
            
            return response;
        } catch (error) {
            console.error('Failed to create task:', error);
            throw error;
        }
    }

    async updateTask(taskId, updates) {
        try {
            const response = await this.requestWithRetry(`/api/tasks/${taskId}`, {
                method: 'PUT',
                body: JSON.stringify(updates)
            });
            
            // Invalidate cache
            this.clearCache();
            
            return response;
        } catch (error) {
            console.error(`Failed to update task ${taskId}:`, error);
            throw error;
        }
    }

    async deleteTask(taskId) {
        try {
            const response = await this.requestWithRetry(`/api/tasks/${taskId}`, {
                method: 'DELETE'
            });
            
            // Invalidate cache
            this.clearCache();
            
            return response;
        } catch (error) {
            console.error(`Failed to delete task ${taskId}:`, error);
            throw error;
        }
    }

    async toggleTask(taskId) {
        try {
            const task = await this.getTask(taskId);
            const newStatus = task.status === 'completed' ? 'pending' : 'completed';
            return await this.updateTask(taskId, { status: newStatus });
        } catch (error) {
            console.error(`Failed to toggle task ${taskId}:`, error);
            throw error;
        }
    }

    // Category Management
    async getCategories(forceRefresh = false) {
        const cacheKey = 'categories';
        
        if (!forceRefresh) {
            const cached = this.getCache(cacheKey);
            if (cached) return cached;
        }

        try {
            const response = await this.requestWithRetry('/api/categories');
            const categories = response.categories || [];
            
            this.setCache(cacheKey, categories);
            return categories;
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            throw error;
        }
    }

    // Mistral AI Integration
    async sendMistralMessage(message) {
        try {
            const response = await this.requestWithRetry('/api/mistral', {
                method: 'POST',
                body: JSON.stringify({ prompt: message })
            });
            
            return response;
        } catch (error) {
            console.error('Failed to send Mistral message:', error);
            throw error;
        }
    }

    // Statistics
    async getStats() {
        const cacheKey = 'stats';
        const cached = this.getCache(cacheKey);
        if (cached) return cached;

        try {
            const response = await this.requestWithRetry('/api/stats');
            this.setCache(cacheKey, response);
            return response;
        } catch (error) {
            console.error('Failed to fetch stats:', error);
            throw error;
        }
    }

    // Health Check
    async healthCheck() {
        try {
            return await this.requestWithRetry('/api/health');
        } catch (error) {
            console.error('Health check failed:', error);
            throw error;
        }
    }

    // Batch Operations
    async batchUpdateTasks(updates) {
        const results = [];
        
        for (const update of updates) {
            try {
                const result = await this.updateTask(update.taskId, update.data);
                results.push({ success: true, taskId: update.taskId, result });
            } catch (error) {
                results.push({ success: false, taskId: update.taskId, error });
            }
        }
        
        return results;
    }

    // Search and Filter
    async searchTasks(query) {
        const tasks = await this.getTasks();
        
        if (!query) return tasks;
        
        const searchTerm = query.toLowerCase();
        return tasks.filter(task => 
            task.title.toLowerCase().includes(searchTerm) ||
            task.category.toLowerCase().includes(searchTerm) ||
            (task.description && task.description.toLowerCase().includes(searchTerm))
        );
    }

    async filterTasksByCategory(category) {
        const tasks = await this.getTasks();
        return tasks.filter(task => task.category === category);
    }

    async filterTasksByStatus(status) {
        const tasks = await this.getTasks();
        return tasks.filter(task => task.status === status);
    }

    async filterTasksByDate(date) {
        const tasks = await this.getTasks();
        return tasks.filter(task => task.due_date === date);
    }

    // Utility Methods
    async refreshData() {
        this.clearCache();
        return await this.getTasks(true);
    }

    getCacheStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }

    // Event-driven cache invalidation
    onTaskCreated(task) {
        this.clearCache();
    }

    onTaskUpdated(task) {
        this.clearCache();
    }

    onTaskDeleted(taskId) {
        this.clearCache();
    }
}

// Export for use in other modules
window.APIManager = APIManager;