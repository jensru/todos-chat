/**
 * UI Component - Frontend-Komponenten und Event-Handler
 * Verwaltet alle UI-Interaktionen und DOM-Manipulationen
 */

class UIComponent {
    constructor() {
        this.taskService = new TaskService();
        this.currentTasks = [];
        this.currentFilter = 'all';
        this.currentSort = 'priority';
        this.isLoading = false;
        
        this.initializeEventListeners();
        this.setupTaskServiceEvents();
    }

    // Initialization
    async initialize() {
        try {
            this.showLoading(true);
            await this.loadTasks();
            this.renderTasks();
            this.showLoading(false);
        } catch (error) {
            console.error('Failed to initialize UI:', error);
            this.showError('Fehler beim Laden der Tasks');
        }
    }

    // Event Listeners Setup
    initializeEventListeners() {
        // Task creation
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="create-task"]')) {
                this.showCreateTaskModal();
            }
        });

        // Task editing
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="edit-task"]')) {
                const taskId = e.target.dataset.taskId;
                this.showEditTaskModal(taskId);
            }
        });

        // Task deletion
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="delete-task"]')) {
                const taskId = e.target.dataset.taskId;
                this.deleteTask(taskId);
            }
        });

        // Task status toggle
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="toggle-task"]')) {
                const taskId = e.target.dataset.taskId;
                this.toggleTaskStatus(taskId);
            }
        });

        // Filter buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-filter]')) {
                const filter = e.target.dataset.filter;
                this.setFilter(filter);
            }
        });

        // Sort buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-sort]')) {
                const sort = e.target.dataset.sort;
                this.setSort(sort);
            }
        });

        // Search input
        const searchInput = document.querySelector('[data-search]');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTasks(e.target.value);
            });
        }

        // Modal close
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="close-modal"]')) {
                this.closeModal();
            }
        });

        // Form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.matches('[data-form="create-task"]')) {
                e.preventDefault();
                this.handleCreateTask(e.target);
            }
            if (e.target.matches('[data-form="edit-task"]')) {
                e.preventDefault();
                this.handleEditTask(e.target);
            }
        });
    }

    setupTaskServiceEvents() {
        this.taskService.on('tasksLoaded', (tasks) => {
            this.currentTasks = tasks;
            this.renderTasks();
        });

        this.taskService.on('taskCreated', (task) => {
            this.showSuccess(`Task "${task.title}" wurde erstellt`);
            this.closeModal();
        });

        this.taskService.on('taskUpdated', (task) => {
            this.showSuccess(`Task "${task.title}" wurde aktualisiert`);
            this.closeModal();
        });

        this.taskService.on('taskDeleted', (data) => {
            this.showSuccess('Task wurde gelöscht');
        });

        this.taskService.on('taskToggled', (task) => {
            this.showSuccess(`Task "${task.title}" wurde ${task.status === 'completed' ? 'erledigt' : 'wieder geöffnet'}`);
        });

        this.taskService.on('error', (error) => {
            console.error('TaskService Error:', error);
            this.showError(`Fehler: ${error.error.message}`);
        });
    }

    // Task Loading and Rendering
    async loadTasks() {
        try {
            this.currentTasks = await this.taskService.getAllTasks();
        } catch (error) {
            console.error('Failed to load tasks:', error);
            throw error;
        }
    }

    renderTasks() {
        const container = document.querySelector('[data-tasks-container]');
        if (!container) return;

        const filteredTasks = this.getFilteredTasks();
        const sortedTasks = this.getSortedTasks(filteredTasks);

        if (sortedTasks.length === 0) {
            container.innerHTML = this.renderEmptyState();
            return;
        }

        container.innerHTML = sortedTasks.map(task => this.renderTask(task)).join('');
    }

    renderTask(task) {
        const statusClass = task.status === 'completed' ? 'completed' : 'pending';
        const priorityClass = `priority-${task.priority}`;
        const dueDateClass = this.getDueDateClass(task.due_date);

        return `
            <div class="task-item ${statusClass} ${priorityClass} ${dueDateClass}" data-task-id="${task.id}">
                <div class="task-content">
                    <div class="task-title" data-action="edit-task" data-task-id="${task.id}">
                        ${task.title}
                    </div>
                    <div class="task-meta">
                        <span class="task-category">${task.category}</span>
                        ${task.due_date ? `<span class="task-due-date">${this.formatDate(task.due_date)}</span>` : ''}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="btn-toggle" data-action="toggle-task" data-task-id="${task.id}" title="Status ändern">
                        ${task.status === 'completed' ? '↩️' : '✅'}
                    </button>
                    <button class="btn-edit" data-action="edit-task" data-task-id="${task.id}" title="Bearbeiten">
                        ✏️
                    </button>
                    <button class="btn-delete" data-action="delete-task" data-task-id="${task.id}" title="Löschen">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }

    renderEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <div class="empty-title">Keine Tasks gefunden</div>
                <div class="empty-description">
                    ${this.currentFilter === 'all' ? 'Erstelle deinen ersten Task!' : 'Keine Tasks entsprechen dem aktuellen Filter.'}
                </div>
                ${this.currentFilter === 'all' ? '<button class="btn-primary" data-action="create-task">Task erstellen</button>' : ''}
            </div>
        `;
    }

    // Task Operations
    async createTask(taskData) {
        try {
            await this.taskService.createTask(taskData);
        } catch (error) {
            console.error('Failed to create task:', error);
            throw error;
        }
    }

    async updateTask(taskId, updates) {
        try {
            await this.taskService.updateTask(taskId, updates);
        } catch (error) {
            console.error('Failed to update task:', error);
            throw error;
        }
    }

    async deleteTask(taskId) {
        if (!confirm('Möchtest du diesen Task wirklich löschen?')) {
            return;
        }

        try {
            await this.taskService.deleteTask(taskId);
        } catch (error) {
            console.error('Failed to delete task:', error);
            throw error;
        }
    }

    async toggleTaskStatus(taskId) {
        try {
            await this.taskService.toggleTaskStatus(taskId);
        } catch (error) {
            console.error('Failed to toggle task status:', error);
            throw error;
        }
    }

    // Filtering and Sorting
    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'pending':
                return this.currentTasks.filter(task => task.status === 'pending');
            case 'completed':
                return this.currentTasks.filter(task => task.status === 'completed');
            case 'high-priority':
                return this.currentTasks.filter(task => task.priority === 'high');
            case 'today':
                const today = new Date().toISOString().split('T')[0];
                return this.currentTasks.filter(task => task.due_date === today);
            default:
                return this.currentTasks;
        }
    }

    getSortedTasks(tasks) {
        return tasks.sort((a, b) => {
            switch (this.currentSort) {
                case 'priority':
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                case 'due-date':
                    if (!a.due_date && !b.due_date) return 0;
                    if (!a.due_date) return 1;
                    if (!b.due_date) return -1;
                    return new Date(a.due_date) - new Date(b.due_date);
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'category':
                    return a.category.localeCompare(b.category);
                default:
                    return 0;
            }
        });
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.updateFilterButtons();
        this.renderTasks();
    }

    setSort(sort) {
        this.currentSort = sort;
        this.updateSortButtons();
        this.renderTasks();
    }

    async searchTasks(query) {
        if (!query.trim()) {
            this.renderTasks();
            return;
        }

        try {
            const searchResults = await this.taskService.searchTasks(query);
            this.renderSearchResults(searchResults);
        } catch (error) {
            console.error('Search failed:', error);
        }
    }

    renderSearchResults(results) {
        const container = document.querySelector('[data-tasks-container]');
        if (!container) return;

        if (results.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🔍</div>
                    <div class="empty-title">Keine Ergebnisse gefunden</div>
                    <div class="empty-description">Versuche andere Suchbegriffe.</div>
                </div>
            `;
            return;
        }

        container.innerHTML = results.map(task => this.renderTask(task)).join('');
    }

    // Modal Management
    showCreateTaskModal() {
        const modal = this.createModal('create-task', 'Neuen Task erstellen');
        modal.innerHTML = this.renderCreateTaskForm();
        document.body.appendChild(modal);
    }

    showEditTaskModal(taskId) {
        const task = this.currentTasks.find(t => t.id === taskId);
        if (!task) return;

        const modal = this.createModal('edit-task', 'Task bearbeiten');
        modal.innerHTML = this.renderEditTaskForm(task);
        document.body.appendChild(modal);
    }

    createModal(type, title) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="btn-close" data-action="close-modal">×</button>
                </div>
                <div class="modal-body" data-form="${type}">
                    <!-- Form content will be inserted here -->
                </div>
            </div>
        `;
        return modal;
    }

    closeModal() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.remove();
        }
    }

    // Form Rendering
    renderCreateTaskForm() {
        return `
            <form data-form="create-task">
                <div class="form-group">
                    <label for="title">Titel *</label>
                    <input type="text" id="title" name="title" required>
                </div>
                <div class="form-group">
                    <label for="category">Kategorie</label>
                    <select id="category" name="category">
                        <option value="General">General</option>
                        <option value="Arbeit">Arbeit</option>
                        <option value="Privat">Privat</option>
                        <option value="Projekte">Projekte</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="priority">Priorität</label>
                    <select id="priority" name="priority">
                        <option value="low">Niedrig</option>
                        <option value="medium" selected>Mittel</option>
                        <option value="high">Hoch</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="due_date">Fälligkeitsdatum</label>
                    <input type="date" id="due_date" name="due_date">
                </div>
                <div class="form-group">
                    <label for="description">Beschreibung</label>
                    <textarea id="description" name="description" rows="3"></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" data-action="close-modal">Abbrechen</button>
                    <button type="submit" class="btn-primary">Erstellen</button>
                </div>
            </form>
        `;
    }

    renderEditTaskForm(task) {
        return `
            <form data-form="edit-task">
                <input type="hidden" name="taskId" value="${task.id}">
                <div class="form-group">
                    <label for="title">Titel *</label>
                    <input type="text" id="title" name="title" value="${task.title}" required>
                </div>
                <div class="form-group">
                    <label for="category">Kategorie</label>
                    <select id="category" name="category">
                        <option value="General" ${task.category === 'General' ? 'selected' : ''}>General</option>
                        <option value="Arbeit" ${task.category === 'Arbeit' ? 'selected' : ''}>Arbeit</option>
                        <option value="Privat" ${task.category === 'Privat' ? 'selected' : ''}>Privat</option>
                        <option value="Projekte" ${task.category === 'Projekte' ? 'selected' : ''}>Projekte</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="priority">Priorität</label>
                    <select id="priority" name="priority">
                        <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Niedrig</option>
                        <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Mittel</option>
                        <option value="high" ${task.priority === 'high' ? 'selected' : ''}>Hoch</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="due_date">Fälligkeitsdatum</label>
                    <input type="date" id="due_date" name="due_date" value="${task.due_date || ''}">
                </div>
                <div class="form-group">
                    <label for="description">Beschreibung</label>
                    <textarea id="description" name="description" rows="3">${task.description || ''}</textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" data-action="close-modal">Abbrechen</button>
                    <button type="submit" class="btn-primary">Speichern</button>
                </div>
            </form>
        `;
    }

    // Form Handling
    async handleCreateTask(form) {
        const formData = new FormData(form);
        const taskData = {
            title: formData.get('title'),
            category: formData.get('category'),
            priority: formData.get('priority'),
            due_date: formData.get('due_date') || null,
            description: formData.get('description') || ''
        };

        try {
            await this.createTask(taskData);
        } catch (error) {
            this.showError('Fehler beim Erstellen des Tasks');
        }
    }

    async handleEditTask(form) {
        const formData = new FormData(form);
        const taskId = formData.get('taskId');
        const updates = {
            title: formData.get('title'),
            category: formData.get('category'),
            priority: formData.get('priority'),
            due_date: formData.get('due_date') || null,
            description: formData.get('description') || ''
        };

        try {
            await this.updateTask(taskId, updates);
        } catch (error) {
            this.showError('Fehler beim Aktualisieren des Tasks');
        }
    }

    // UI Updates
    updateFilterButtons() {
        document.querySelectorAll('[data-filter]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === this.currentFilter);
        });
    }

    updateSortButtons() {
        document.querySelectorAll('[data-sort]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.sort === this.currentSort);
        });
    }

    showLoading(show) {
        this.isLoading = show;
        const loadingIndicator = document.querySelector('[data-loading]');
        if (loadingIndicator) {
            loadingIndicator.style.display = show ? 'block' : 'none';
        }
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Utility Methods
    getDueDateClass(dueDate) {
        if (!dueDate) return '';
        
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        if (dueDate < today) return 'overdue';
        if (dueDate === today) return 'due-today';
        if (dueDate === tomorrow) return 'due-tomorrow';
        return '';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
}

// Export for use in other modules
window.UIComponent = UIComponent;

