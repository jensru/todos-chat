// CanvasManager.js - Canvas Interface Management
export class CanvasManager {
    constructor() {
        this.tasks = [];
        this.goals = [];
        this.workingStyleDNA = {};
        this.init();
    }

    init() {
        this.bindEvents();
        this.showEmptyState();
    }

    bindEvents() {
        // Quick action chips
        const quickActionChips = document.querySelectorAll('.quick-action-chip');
        quickActionChips.forEach(chip => {
            chip.addEventListener('click', (e) => {
                const text = e.target.textContent.trim();
                this.handleQuickAction(text);
            });
        });

        // Mobile toggle buttons
        const mobileChatToggle = document.getElementById('mobile-chat-toggle');
        const mobileCanvasToggle = document.getElementById('mobile-canvas-toggle');
        
        if (mobileChatToggle) {
            mobileChatToggle.addEventListener('click', () => this.toggleMobileView('chat'));
        }
        
        if (mobileCanvasToggle) {
            mobileCanvasToggle.addEventListener('click', () => this.toggleMobileView('canvas'));
        }
    }

    handleQuickAction(actionText) {
        // Trigger chat input with pre-filled text
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            if (actionText.includes('Aufgabe')) {
                chatInput.value = 'Ich möchte eine neue Aufgabe erstellen: ';
            } else if (actionText.includes('Ziel')) {
                chatInput.value = 'Ich möchte ein neues Ziel setzen: ';
            }
            chatInput.focus();
        }
    }

    toggleMobileView(view) {
        const chatPanel = document.getElementById('chat-panel');
        const canvasPanel = document.getElementById('canvas-panel');
        
        if (view === 'chat') {
            chatPanel.classList.remove('hidden');
            canvasPanel.classList.add('hidden');
        } else {
            chatPanel.classList.add('hidden');
            canvasPanel.classList.remove('hidden');
        }
    }

    showEmptyState() {
        const emptyState = document.getElementById('empty-state');
        const tasksContainer = document.getElementById('tasks-container');
        
        if (emptyState) emptyState.classList.remove('hidden');
        if (tasksContainer) tasksContainer.classList.add('hidden');
    }

    hideEmptyState() {
        const emptyState = document.getElementById('empty-state');
        const tasksContainer = document.getElementById('tasks-container');
        
        if (emptyState) emptyState.classList.add('hidden');
        if (tasksContainer) tasksContainer.classList.remove('hidden');
    }

    addTask(task) {
        this.tasks.push(task);
        this.renderTask(task);
        this.hideEmptyState();
    }

    addGoal(goal) {
        this.goals.push(goal);
        this.renderGoal(goal);
        this.hideEmptyState();
    }

    renderTask(task) {
        const tasksList = document.getElementById('tasks-list');
        if (!tasksList) return;

        const taskElement = document.createElement('div');
        taskElement.className = 'task-card bg-background border border-border rounded-lg p-4 hover:shadow-md transition-shadow';
        taskElement.setAttribute('data-task-id', task.id);

        taskElement.innerHTML = `
            <div class="task-header flex items-start justify-between mb-2">
                <h4 class="task-title font-medium text-foreground">${this.escapeHtml(task.title)}</h4>
                <div class="task-actions flex space-x-2">
                    <button class="task-action-btn p-1 rounded hover:bg-muted transition-colors" title="Unteraufgaben">
                        <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                    </button>
                    <button class="task-action-btn p-1 rounded hover:bg-muted transition-colors" title="Fälligkeitsdatum">
                        <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                    </button>
                    <button class="task-action-btn p-1 rounded hover:bg-muted transition-colors" title="Priorität">
                        <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="task-content">
                <p class="text-muted-foreground text-sm">${this.escapeHtml(task.description || '')}</p>
            </div>
            ${task.subtasks && task.subtasks.length > 0 ? `
                <div class="task-subtasks mt-3">
                    <div class="subtasks-header text-sm font-medium text-muted-foreground mb-2">Unteraufgaben:</div>
                    <div class="subtasks-list space-y-1">
                        ${task.subtasks.map(subtask => `
                            <div class="subtask-item flex items-center space-x-2 text-sm">
                                <input type="checkbox" class="subtask-checkbox rounded border-border">
                                <span class="text-foreground">${this.escapeHtml(subtask.title)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        `;

        tasksList.appendChild(taskElement);
    }

    renderGoal(goal) {
        const goalsList = document.getElementById('goals-list');
        if (!goalsList) return;

        const goalElement = document.createElement('div');
        goalElement.className = 'goal-card bg-background border border-border rounded-lg p-4 hover:shadow-md transition-shadow';
        goalElement.setAttribute('data-goal-id', goal.id);

        const progressPercentage = goal.progress || 0;

        goalElement.innerHTML = `
            <div class="goal-header flex items-start justify-between mb-3">
                <h4 class="goal-title font-medium text-foreground">${this.escapeHtml(goal.title)}</h4>
                <span class="goal-progress text-sm text-muted-foreground">${progressPercentage}%</span>
            </div>
            <div class="goal-progress-bar bg-muted rounded-full h-2 mb-2">
                <div class="goal-progress-fill bg-primary h-2 rounded-full transition-all duration-300" style="width: ${progressPercentage}%"></div>
            </div>
            <p class="goal-description text-muted-foreground text-sm">${this.escapeHtml(goal.description || '')}</p>
        `;

        goalsList.appendChild(goalElement);
    }

    showFloatingSubtasks(subtasks) {
        // Create floating subtasks suggestion
        const floatingContainer = document.createElement('div');
        floatingContainer.id = 'floating-subtasks';
        floatingContainer.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
        
        floatingContainer.innerHTML = `
            <div class="floating-content bg-background border border-border rounded-lg p-6 max-w-md w-full mx-4">
                <div class="floating-header mb-4">
                    <h3 class="text-lg font-semibold text-foreground">KI-Vorschlag – du entscheidest</h3>
                    <p class="text-sm text-muted-foreground">Typischer Ablauf für diese Aufgabe:</p>
                </div>
                <div class="floating-subtasks space-y-2 mb-6">
                    ${subtasks.map(subtask => `
                        <div class="floating-subtask flex items-center space-x-3 p-2 bg-muted rounded">
                            <input type="checkbox" class="floating-checkbox rounded border-border" checked>
                            <span class="text-foreground">${this.escapeHtml(subtask)}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="floating-actions flex space-x-3">
                    <button id="confirm-subtasks" class="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                        Bestätigen
                    </button>
                    <button id="reject-subtasks" class="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors">
                        Verwerfen
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(floatingContainer);

        // Bind events
        document.getElementById('confirm-subtasks').addEventListener('click', () => {
            this.confirmSubtasks(subtasks);
            document.body.removeChild(floatingContainer);
        });

        document.getElementById('reject-subtasks').addEventListener('click', () => {
            document.body.removeChild(floatingContainer);
        });
    }

    confirmSubtasks(subtasks) {
        // Add subtasks to the main task
        const mainTask = this.tasks[this.tasks.length - 1];
        if (mainTask) {
            mainTask.subtasks = subtasks.map(title => ({ title, completed: false }));
            this.updateTaskDisplay(mainTask);
        }
    }

    updateTaskDisplay(task) {
        const taskElement = document.querySelector(`[data-task-id="${task.id}"]`);
        if (taskElement) {
            // Re-render the task with updated subtasks
            taskElement.remove();
            this.renderTask(task);
        }
    }

    updateWorkingStyleDNA(dna) {
        this.workingStyleDNA = { ...this.workingStyleDNA, ...dna };
        this.renderWorkingStyleDNA();
    }

    renderWorkingStyleDNA() {
        const dnaContent = document.getElementById('dna-content');
        if (!dnaContent) return;

        const dnaItems = Object.entries(this.workingStyleDNA);
        
        if (dnaItems.length === 0) {
            dnaContent.innerHTML = '<p>Lerne deine Arbeitsweise kennen...</p>';
            return;
        }

        dnaContent.innerHTML = `
            <div class="dna-items space-y-2">
                ${dnaItems.map(([key, value]) => `
                    <div class="dna-item flex items-center space-x-2">
                        <span class="text-sm text-foreground">${this.escapeHtml(value)}</span>
                        <button class="dna-edit-btn p-1 rounded hover:bg-muted transition-colors">
                            <svg class="w-3 h-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getTasks() {
        return this.tasks;
    }

    getGoals() {
        return this.goals;
    }

    getWorkingStyleDNA() {
        return this.workingStyleDNA;
    }
}
