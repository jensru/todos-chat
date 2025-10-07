/**
 * Task Component - Zentrale Task-Verwaltung
 * Verwaltet alle Task-bezogenen Funktionen und Rendering
 */

class TaskComponent {
    constructor() {
        this.allTasks = [];
        this.currentFilter = 'heute';
        this.currentSorting = 'priority';
    }

    // Task-Rendering
    renderSingleTask(task) {
        const hierarchyClass = task.hierarchy_level ? `hierarchy-level-${task.hierarchy_level}` : '';
        const completedClass = task.status === 'completed' ? 'completed-task' : '';
        
        // Remove markdown formatting (**) and category symbols from task titles
        const cleanTitle = task.title.replace(/\*\*/g, '').replace(/\s*📁\s*[^-\s]+/g, '').trim();
        
        // Bei Kategorie-Sortierung: Priorität-Badge nur anzeigen wenn nicht "medium"
        const showPriorityBadge = this.currentSorting === 'priority' || task.priority !== 'medium';
        
        return `
            <div class="smart-task-card ${task.priority}-priority ${task.deadline_status && task.deadline_status !== null ? task.deadline_status.replace('_', '-') : 'no-deadline'} ${hierarchyClass} ${completedClass}" 
                 draggable="true" 
                 ondragstart="dragStart(event, '${task.id}')" 
                 ondragend="dragEnd(event)">
                <div class="task-content">
                    <div class="task-title">
                        <span class="task-checkbox" onclick="event.stopPropagation(); toggleTask('${task.id}')">
                            ${task.status === 'completed' ? '✅' : '☐'}
                        </span>
                        <span class="task-title-text" ondblclick="event.stopPropagation(); startEditTitle('${task.id}', '${cleanTitle.replace(/'/g, "\\'")}')">${cleanTitle}</span>
                        <input type="text" class="task-title-edit" style="display: none;" onblur="saveEditTitle('${task.id}')" onkeypress="handleEditKeypress(event, '${task.id}')" />
                    </div>
                </div>
                <div class="task-meta">
                    ${showPriorityBadge ? `<span class="priority-badge priority-${task.priority}" ondblclick="event.stopPropagation(); startEditPriority('${task.id}', '${task.priority}')">${task.priority}</span>` : ''}
                    ${task.deadline_status && task.deadline_status !== null && task.deadline_status !== 'no_deadline' && task.deadline_status !== 'due_today' ? `<span class="deadline-badge deadline-${task.deadline_status.replace('_', '-')}">${this.getDeadlineText(task.deadline_status)}</span>` : ''}
                    <button class="delete-task-btn" onclick="event.stopPropagation(); deleteTask('${task.id}')" title="Task löschen">🗑️</button>
                </div>
                ${task.due_date ? `
                    ${(() => {
                        const dueDate = new Date(task.due_date);
                        const today = dateSync.getCurrentDate();
                        const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
                        
                        // Bei "Heute" Filterung: Kein Datums-Label für heute fällige Tasks
                        if (this.currentFilter === 'heute' && diffDays === 0) return '';
                        
                        return `
                            <div class="due-date-display" ondblclick="event.stopPropagation(); startEditDueDate('${task.id}', '${task.due_date}')">
                                📅 ${dateSync.formatDateForDisplay(new Date(task.due_date))}
                                ${(() => {
                                    // Nur zusätzliche Info anzeigen, wenn es nicht "heute" ist
                                    if (diffDays === 0) return ''; // Keine zusätzliche Info für heute
                                    if (diffDays === 1) return '<span style="color: var(--primary); font-weight: 500;">(Morgen)</span>';
                                    if (diffDays === -1) return '<span style="color: var(--highlight); font-weight: 600;">(Gestern)</span>';
                                    if (diffDays < 0) return `<span style="color: var(--highlight); font-weight: 600;">(vor ${Math.abs(diffDays)} Tagen)</span>`;
                                    return `<span style="color: var(--text-secondary);">(in ${diffDays} Tagen)</span>`;
                                })()}
                            </div>
                        `;
                    })()}
                ` : ''}
                <div class="task-stats">
                    <span ondblclick="event.stopPropagation(); startEditCategory('${task.id}', '${task.category}')">📁 ${task.category}</span>
                </div>
            </div>
        `;
    }

    // Task-Gruppierung und Rendering
    renderTaskGroup(tasks) {
        if (this.currentSorting === 'category') {
            return this.renderByCategory(tasks);
        } else {
            return this.renderByPriority(tasks);
        }
    }

    renderByPriority(tasks) {
        const pendingTasks = tasks.filter(task => task.status !== 'completed');
        const completedTasks = tasks.filter(task => task.status === 'completed');
        
        let html = '';
        
        // Render pending tasks first
        if (pendingTasks.length > 0) {
            html += pendingTasks.map(task => this.renderSingleTask(task)).join('');
        }
        
        // Add separator if there are both pending and completed tasks
        if (pendingTasks.length > 0 && completedTasks.length > 0) {
            html += '<div class="task-separator"><div class="separator-line"></div><span class="separator-text">Erledigte Tasks</span><div class="separator-line"></div></div>';
        }
        
        // Render completed tasks last
        if (completedTasks.length > 0) {
            html += completedTasks.map(task => this.renderSingleTask(task)).join('');
        }
        
        return html;
    }

    renderByCategory(tasks) {
        // Gruppiere Tasks nach Kategorien
        const tasksByCategory = {};
        tasks.forEach(task => {
            const category = task.category || 'General';
            if (!tasksByCategory[category]) {
                tasksByCategory[category] = [];
            }
            tasksByCategory[category].push(task);
        });

        let html = '';
        
        // Sortiere Kategorien alphabetisch
        const sortedCategories = Object.keys(tasksByCategory).sort();
        
        sortedCategories.forEach(category => {
            const categoryTasks = tasksByCategory[category];
            const pendingTasks = categoryTasks.filter(task => task.status !== 'completed');
            const completedTasks = categoryTasks.filter(task => task.status === 'completed');
            
            // Nur Kategorie-Header anzeigen wenn es Tasks gibt
            if (categoryTasks.length > 0) {
                html += `
                    <div class="category-header">
                        <h3>📁 ${category}</h3>
                        <span class="category-count">${categoryTasks.length}</span>
                    </div>
                    <div class="category-drop-zone" 
                         ondrop="dropOnCategory(event, '${category}')" 
                         ondragover="event.preventDefault(); event.dataTransfer.dropEffect = 'move';"
                         ondragenter="event.preventDefault(); event.target.style.background='var(--primary-light)';"
                         ondragleave="event.target.style.background='transparent';">
                        ${pendingTasks.map(task => this.renderSingleTask(task)).join('')}
                    </div>
                `;
            }
        });
        
        // Alle erledigten Tasks ganz nach unten ohne Kategorie-Header
        const allCompletedTasks = tasks.filter(task => task.status === 'completed');
        if (allCompletedTasks.length > 0) {
            html += '<div class="task-separator"><div class="separator-line"></div><span class="separator-text">Erledigte Tasks</span><div class="separator-line"></div></div>';
            html += `
                <div class="category-drop-zone" 
                     ondrop="dropOnCategory(event, 'General')" 
                     ondragover="event.preventDefault(); event.dataTransfer.dropEffect = 'move';"
                     ondragenter="event.preventDefault(); event.target.style.background='var(--primary-light)';"
                     ondragleave="event.target.style.background='transparent';">
                    ${allCompletedTasks.map(task => this.renderSingleTask(task)).join('')}
                </div>
            `;
        }
        
        return html;
    }

    // Task-Management
    async updateTask(taskId, updates) {
        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            
            if (response.ok) {
                // Update local data
                const task = this.allTasks.find(t => t.id === taskId);
                if (task) {
                    Object.assign(task, updates);
                    this.renderTasks();
                }
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error updating task:', error);
            return false;
        }
    }

    async deleteTask(taskId) {
        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                // Remove from local data
                this.allTasks = this.allTasks.filter(task => task.id !== taskId);
                this.renderTasks();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error deleting task:', error);
            return false;
        }
    }

    async toggleTask(taskId) {
        const task = this.allTasks.find(t => t.id === taskId);
        if (!task) return false;
        
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        return await this.updateTask(taskId, { status: newStatus });
    }

    // Inline-Editing Functions
    startEditTitle(taskId, currentTitle) {
        console.log('startEditTitle called with:', taskId, currentTitle);
        const taskElement = document.querySelector(`[onclick*="${taskId}"]`);
        console.log('taskElement found:', taskElement);
        
        if (!taskElement) {
            console.error('Task element not found for ID:', taskId);
            return;
        }
        
        const titleText = taskElement.querySelector('.task-title-text');
        const titleInput = taskElement.querySelector('.task-title-edit');
        
        console.log('titleText:', titleText, 'titleInput:', titleInput);
        
        if (!titleText || !titleInput) {
            console.error('Title elements not found');
            return;
        }
        
        titleText.style.display = 'none';
        titleInput.style.display = 'inline-block';
        titleInput.value = currentTitle;
        titleInput.focus();
        titleInput.select();
    }

    saveEditTitle(taskId) {
        const taskElement = document.querySelector(`[onclick*="${taskId}"]`);
        const titleText = taskElement.querySelector('.task-title-text');
        const titleInput = taskElement.querySelector('.task-title-edit');
        const newTitle = titleInput.value.trim();
        
        if (newTitle && newTitle !== titleText.textContent) {
            this.updateTask(taskId, { title: newTitle });
        }
        
        titleText.style.display = 'inline-block';
        titleInput.style.display = 'none';
    }

    handleEditKeypress(event, taskId) {
        if (event.key === 'Enter') {
            this.saveEditTitle(taskId);
        } else if (event.key === 'Escape') {
            const taskElement = document.querySelector(`[onclick*="${taskId}"]`);
            const titleText = taskElement.querySelector('.task-title-text');
            const titleInput = taskElement.querySelector('.task-title-edit');
            
            titleText.style.display = 'inline-block';
            titleInput.style.display = 'none';
        }
    }

    startEditPriority(taskId, currentPriority) {
        const priorities = ['low', 'medium', 'high'];
        const currentIndex = priorities.indexOf(currentPriority);
        const nextIndex = (currentIndex + 1) % priorities.length;
        const newPriority = priorities[nextIndex];
        
        this.updateTask(taskId, { priority: newPriority });
    }

    startEditCategory(taskId, currentCategory) {
        const newCategory = prompt(`Neue Kategorie für Task "${currentCategory}":`, currentCategory);
        if (newCategory && newCategory.trim() !== currentCategory) {
            this.updateTask(taskId, { category: newCategory.trim() });
        }
    }

    startEditDueDate(taskId, currentDueDate) {
        const newDueDate = prompt(`Neues Fälligkeitsdatum für Task:`, currentDueDate);
        if (newDueDate && newDueDate !== currentDueDate) {
            this.updateTask(taskId, { due_date: newDueDate });
        }
    }

    // Filtering und Sorting
    filterTasks(filter) {
        this.currentFilter = filter;
        this.renderTasks();
    }

    setSorting(sorting) {
        this.currentSorting = sorting;
        this.renderTasks();
    }

    // Rendering
    renderTasks() {
        const container = document.getElementById('smartTasks');
        if (!container) return;
        
        const filteredTasks = this.getFilteredTasks();
        container.innerHTML = this.renderTaskGroup(filteredTasks);
    }

    getFilteredTasks() {
        const today = dateSync.getCurrentDate();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Montag
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Sonntag

        return this.allTasks.filter(task => {
            if (this.currentFilter === 'heute') {
                return task.due_date && new Date(task.due_date).toDateString() === today.toDateString();
            } else if (this.currentFilter === 'woche') {
                return task.due_date && new Date(task.due_date) >= startOfWeek && new Date(task.due_date) <= endOfWeek;
            } else {
                return true; // Alle Tasks
            }
        });
    }

    // Utility Functions
    getDeadlineText(status) {
        const statusMap = {
            'overdue': 'Überfällig',
            'due_today': 'Heute fällig',
            'due_tomorrow': 'Morgen fällig',
            'due_this_week': 'Diese Woche',
            'due_later': 'Später fällig',
            'no_deadline': 'Kein Datum'
        };
        return statusMap[status] || status;
    }

    // Load tasks from API
    async loadTasks() {
        try {
            const response = await fetch('/api/smart-tasks');
            const data = await response.json();
            
            if (data.success) {
                this.allTasks = data.tasks;
                this.renderTasks();
            }
        } catch (error) {
            console.error('Error loading tasks:', error);
        }
    }
}

// Globale Instanz
const taskComponent = new TaskComponent();

// Globale Funktionen für HTML-Event-Handler
function startEditTitle(taskId, currentTitle) {
    taskComponent.startEditTitle(taskId, currentTitle);
}

function saveEditTitle(taskId) {
    taskComponent.saveEditTitle(taskId);
}

function handleEditKeypress(event, taskId) {
    taskComponent.handleEditKeypress(event, taskId);
}

function startEditPriority(taskId, currentPriority) {
    taskComponent.startEditPriority(taskId, currentPriority);
}

function startEditCategory(taskId, currentCategory) {
    taskComponent.startEditCategory(taskId, currentCategory);
}

function startEditDueDate(taskId, currentDueDate) {
    taskComponent.startEditDueDate(taskId, currentDueDate);
}

function updateTask(taskId, updates) {
    return taskComponent.updateTask(taskId, updates);
}

function deleteTask(taskId) {
    return taskComponent.deleteTask(taskId);
}

function toggleTask(taskId) {
    return taskComponent.toggleTask(taskId);
}

function filterTasks(filter) {
    taskComponent.filterTasks(filter);
}

function setSorting(sorting) {
    taskComponent.setSorting(sorting);
}

function loadTasks() {
    return taskComponent.loadTasks();
}

function renderTasks() {
    taskComponent.renderTasks();
}
