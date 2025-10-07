/**
 * API Service - Zentrale API-Verwaltung
 */

class ApiService {
    constructor() {
        this.baseURL = '';
        this.defaultHeaders = {
            'Content-Type': 'application/json'
        };
    }

    // Generic HTTP methods
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: { ...this.defaultHeaders, ...options.headers },
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`API request failed for ${endpoint}:`, error);
            throw error;
        }
    }

    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // Task-specific API methods
    async getTasks() {
        return this.get('/api/smart-tasks');
    }

    async getTask(taskId) {
        return this.get(`/api/tasks/${taskId}`);
    }

    async createTask(taskData) {
        return this.post('/api/tasks', taskData);
    }

    async updateTask(taskId, updates) {
        return this.put(`/api/tasks/${taskId}`, updates);
    }

    async deleteTask(taskId) {
        return this.delete(`/api/tasks/${taskId}`);
    }

    async toggleTask(taskId) {
        const task = await this.getTask(taskId);
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        return this.updateTask(taskId, { status: newStatus });
    }

    // Mistral AI API methods
    async sendMistralMessage(message) {
        return this.post('/api/mistral', { message });
    }

    // Health check
    async healthCheck() {
        return this.get('/api/health');
    }

    // Statistics
    async getStats() {
        return this.get('/api/stats');
    }

    // Set authentication token
    setAuthToken(token) {
        this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    // Remove authentication token
    removeAuthToken() {
        delete this.defaultHeaders['Authorization'];
    }
}

// Export for use in other modules
window.ApiService = ApiService;
