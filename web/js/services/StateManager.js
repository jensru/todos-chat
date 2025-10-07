/**
 * State Manager - Zentrale State-Verwaltung
 */

class StateManager {
    constructor() {
        this.state = {
            // Tasks
            tasks: [],
            filteredTasks: [],
            
            // UI State
            currentFilter: 'heute',
            currentSorting: 'priority',
            isLoading: false,
            
            // Modal State
            activeModal: null,
            
            // Chat State
            chatMessages: [],
            isTyping: false,
            
            // Error State
            error: null
        };
        
        this.listeners = [];
        this.middleware = [];
    }

    // Get current state
    getState() {
        return { ...this.state };
    }

    // Set state with middleware support
    setState(newState) {
        const previousState = { ...this.state };
        
        // Apply middleware
        let processedState = newState;
        for (const middleware of this.middleware) {
            processedState = middleware(processedState, previousState);
        }
        
        // Update state
        this.state = { ...this.state, ...processedState };
        
        // Notify listeners
        this.notifyListeners(this.state, previousState);
    }

    // Subscribe to state changes
    subscribe(listener) {
        this.listeners.push(listener);
        
        // Return unsubscribe function
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }

    // Notify all listeners
    notifyListeners(newState, previousState) {
        this.listeners.forEach(listener => {
            try {
                listener(newState, previousState);
            } catch (error) {
                console.error('State listener error:', error);
            }
        });
    }

    // Add middleware
    addMiddleware(middleware) {
        this.middleware.push(middleware);
    }

    // Task-specific state methods
    setTasks(tasks) {
        this.setState({ tasks });
        this.updateFilteredTasks();
    }

    addTask(task) {
        const tasks = [...this.state.tasks, task];
        this.setState({ tasks });
        this.updateFilteredTasks();
    }

    updateTask(taskId, updates) {
        const tasks = this.state.tasks.map(task => 
            task.id === taskId ? { ...task, ...updates } : task
        );
        this.setState({ tasks });
        this.updateFilteredTasks();
    }

    removeTask(taskId) {
        const tasks = this.state.tasks.filter(task => task.id !== taskId);
        this.setState({ tasks });
        this.updateFilteredTasks();
    }

    // Filter and sort methods
    setFilter(filter) {
        this.setState({ currentFilter: filter });
        this.updateFilteredTasks();
    }

    setSorting(sorting) {
        this.setState({ currentSorting: sorting });
        this.updateFilteredTasks();
    }

    updateFilteredTasks() {
        const { tasks, currentFilter, currentSorting } = this.state;
        let filteredTasks = [...tasks];

        // Apply filter
        if (currentFilter === 'heute') {
            const today = new Date().toISOString().split('T')[0];
            filteredTasks = filteredTasks.filter(task => 
                task.due_date && task.due_date === today
            );
        } else if (currentFilter === 'woche') {
            const today = new Date();
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay() + 1);
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            
            filteredTasks = filteredTasks.filter(task => {
                if (!task.due_date) return false;
                const dueDate = new Date(task.due_date);
                return dueDate >= startOfWeek && dueDate <= endOfWeek;
            });
        }

        // Apply sorting
        if (currentSorting === 'priority') {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            filteredTasks.sort((a, b) => 
                (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
            );
        } else if (currentSorting === 'category') {
            filteredTasks.sort((a, b) => 
                (a.category || '').localeCompare(b.category || '')
            );
        }

        this.setState({ filteredTasks });
    }

    // UI state methods
    setLoading(isLoading) {
        this.setState({ isLoading });
    }

    setError(error) {
        this.setState({ error });
    }

    clearError() {
        this.setState({ error: null });
    }

    // Modal state methods
    openModal(modalName) {
        this.setState({ activeModal: modalName });
    }

    closeModal() {
        this.setState({ activeModal: null });
    }

    // Chat state methods
    addChatMessage(message) {
        const chatMessages = [...this.state.chatMessages, message];
        this.setState({ chatMessages });
    }

    setTyping(isTyping) {
        this.setState({ isTyping });
    }

    clearChat() {
        this.setState({ chatMessages: [] });
    }

    // Computed properties
    get completedTasks() {
        return this.state.tasks.filter(task => task.status === 'completed');
    }

    get pendingTasks() {
        return this.state.tasks.filter(task => task.status !== 'completed');
    }

    get taskStats() {
        const tasks = this.state.tasks;
        const categories = [...new Set(tasks.map(task => task.category))];
        const priorities = [...new Set(tasks.map(task => task.priority))];
        
        return {
            total: tasks.length,
            completed: this.completedTasks.length,
            pending: this.pendingTasks.length,
            categories: categories.length,
            priorities: priorities.length
        };
    }

    // Persistence methods
    saveToStorage() {
        try {
            localStorage.setItem('todoAppState', JSON.stringify(this.state));
        } catch (error) {
            console.error('Failed to save state to localStorage:', error);
        }
    }

    loadFromStorage() {
        try {
            const savedState = localStorage.getItem('todoAppState');
            if (savedState) {
                const parsedState = JSON.parse(savedState);
                this.setState(parsedState);
            }
        } catch (error) {
            console.error('Failed to load state from localStorage:', error);
        }
    }

    clearStorage() {
        try {
            localStorage.removeItem('todoAppState');
        } catch (error) {
            console.error('Failed to clear localStorage:', error);
        }
    }
}

// Export for use in other modules
window.StateManager = StateManager;
