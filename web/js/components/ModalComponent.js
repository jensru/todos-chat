/**
 * Modal Component - Verwaltung aller Modals
 */

class ModalComponent {
    constructor() {
        this.activeModal = null;
    }

    // Task Creation Modal
    openTaskCreationModal() {
        this.activeModal = 'taskCreation';
        document.getElementById('taskCreationModal').style.display = 'flex';
        document.getElementById('taskTitle').focus();
    }

    closeTaskCreationModal() {
        document.getElementById('taskCreationModal').style.display = 'none';
        this.clearTaskForm();
        this.activeModal = null;
    }

    clearTaskForm() {
        document.getElementById('taskTitle').value = '';
        document.getElementById('taskCategory').value = 'General';
        document.getElementById('taskPriority').value = 'medium';
        document.getElementById('taskDueDate').value = '';
    }

    async submitTaskForm() {
        const title = document.getElementById('taskTitle').value.trim();
        const category = document.getElementById('taskCategory').value.trim();
        const priority = document.getElementById('taskPriority').value;
        const dueDate = document.getElementById('taskDueDate').value;

        if (!title) {
            alert('Bitte geben Sie einen Task-Titel ein.');
            return;
        }

        const taskData = {
            title: title,
            category: category || 'General',
            priority: priority,
            due_date: dueDate || null
        };

        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData)
            });

            if (response.ok) {
                this.closeTaskCreationModal();
                loadTasks(); // Reload tasks
            } else {
                alert('Fehler beim Erstellen des Tasks.');
            }
        } catch (error) {
            console.error('Error creating task:', error);
            alert('Fehler beim Erstellen des Tasks.');
        }
    }

    // Category Management Modal
    openCategoryManagementModal() {
        this.activeModal = 'categoryManagement';
        document.getElementById('categoryManagementModal').style.display = 'flex';
        this.loadCategories();
    }

    closeCategoryManagementModal() {
        document.getElementById('categoryManagementModal').style.display = 'none';
        this.activeModal = null;
    }

    async loadCategories() {
        try {
            const response = await fetch('/api/smart-tasks');
            const data = await response.json();
            
            if (data.success) {
                const categories = [...new Set(data.tasks.map(task => task.category))].sort();
                const categoryList = document.getElementById('categoryList');
                
                categoryList.innerHTML = categories.map(category => `
                    <div class="category-item">
                        <span class="category-name">📁 ${category}</span>
                        <div class="category-actions">
                            <button class="btn btn-small" onclick="renameCategory('${category}')">Umbenennen</button>
                            <button class="btn btn-small btn-danger" onclick="deleteCategory('${category}')">Löschen</button>
                        </div>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    async createCategory() {
        const categoryName = document.getElementById('newCategoryName').value.trim();
        
        if (!categoryName) {
            alert('Bitte geben Sie einen Kategorie-Namen ein.');
            return;
        }

        try {
            const response = await fetch('/api/mistral', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `Erstelle eine neue Kategorie namens "${categoryName}"`
                })
            });

            if (response.ok) {
                document.getElementById('newCategoryName').value = '';
                this.loadCategories(); // Reload categories
                loadTasks(); // Reload tasks
            } else {
                alert('Fehler beim Erstellen der Kategorie.');
            }
        } catch (error) {
            console.error('Error creating category:', error);
            alert('Fehler beim Erstellen der Kategorie.');
        }
    }

    async renameCategory(oldName) {
        const newName = prompt(`Neuer Name für Kategorie "${oldName}":`, oldName);
        
        if (!newName || newName.trim() === oldName) {
            return;
        }

        try {
            const response = await fetch('/api/mistral', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `Benenne die Kategorie "${oldName}" um zu "${newName.trim()}"`
                })
            });

            if (response.ok) {
                this.loadCategories(); // Reload categories
                loadTasks(); // Reload tasks
            } else {
                alert('Fehler beim Umbenennen der Kategorie.');
            }
        } catch (error) {
            console.error('Error renaming category:', error);
            alert('Fehler beim Umbenennen der Kategorie.');
        }
    }

    async deleteCategory(categoryName) {
        if (!confirm(`Möchten Sie die Kategorie "${categoryName}" wirklich löschen? Alle Tasks in dieser Kategorie werden gelöscht.`)) {
            return;
        }

        try {
            const response = await fetch('/api/mistral', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `Lösche die Kategorie "${categoryName}" und alle Tasks in dieser Kategorie`
                })
            });

            if (response.ok) {
                this.loadCategories(); // Reload categories
                loadTasks(); // Reload tasks
            } else {
                alert('Fehler beim Löschen der Kategorie.');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Fehler beim Löschen der Kategorie.');
        }
    }

    // Modal Event Handlers
    handleModalClick(event) {
        if (event.target.classList.contains('modal-overlay')) {
            this.closeActiveModal();
        }
    }

    handleEscapeKey(event) {
        if (event.key === 'Escape') {
            this.closeActiveModal();
        }
    }

    closeActiveModal() {
        if (this.activeModal === 'taskCreation') {
            this.closeTaskCreationModal();
        } else if (this.activeModal === 'categoryManagement') {
            this.closeCategoryManagementModal();
        }
    }

    // Initialize modal event listeners
    init() {
        // Click outside modal to close
        document.addEventListener('click', (event) => this.handleModalClick(event));
        
        // Escape key to close modal
        document.addEventListener('keydown', (event) => this.handleEscapeKey(event));
    }
}

// Globale Instanz
const modalComponent = new ModalComponent();

// Globale Funktionen für HTML-Event-Handler
function openTaskCreationModal() {
    modalComponent.openTaskCreationModal();
}

function closeTaskCreationModal() {
    modalComponent.closeTaskCreationModal();
}

function submitTaskForm() {
    modalComponent.submitTaskForm();
}

function openCategoryManagementModal() {
    modalComponent.openCategoryManagementModal();
}

function closeCategoryManagementModal() {
    modalComponent.closeCategoryManagementModal();
}

function createCategory() {
    modalComponent.createCategory();
}

function renameCategory(categoryName) {
    modalComponent.renameCategory(categoryName);
}

function deleteCategory(categoryName) {
    modalComponent.deleteCategory(categoryName);
}
