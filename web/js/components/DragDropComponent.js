/**
 * Drag & Drop Component - Verwaltung des Drag & Drop für Tasks
 */

class DragDropComponent {
    constructor() {
        this.draggedTaskId = null;
        this.dragOverCategory = null;
    }

    init() {
        // Event listeners werden automatisch über HTML-Attribute gesetzt
        console.log('Drag & Drop Component initialized');
    }

    // Drag Start
    dragStart(event, taskId) {
        this.draggedTaskId = taskId;
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/html', event.target.outerHTML);
        
        // Add visual feedback
        event.target.style.opacity = '0.5';
        
        console.log('Drag started for task:', taskId);
    }

    // Drag End
    dragEnd(event) {
        event.target.style.opacity = '1';
        this.draggedTaskId = null;
        this.dragOverCategory = null;
        
        // Remove all drag-over styles
        document.querySelectorAll('.category-drop-zone').forEach(zone => {
            zone.style.background = 'transparent';
        });
        
        console.log('Drag ended');
    }

    // Drag Over
    dragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }

    // Drag Enter
    dragEnter(event, category) {
        event.preventDefault();
        this.dragOverCategory = category;
        event.target.style.background = 'var(--primary-light)';
        event.target.style.border = '2px dashed var(--primary)';
    }

    // Drag Leave
    dragLeave(event) {
        event.target.style.background = 'transparent';
        event.target.style.border = 'none';
    }

    // Drop on Category
    async dropOnCategory(event, category) {
        event.preventDefault();
        
        if (!this.draggedTaskId) {
            console.error('No dragged task ID found');
            return;
        }

        console.log(`Dropping task ${this.draggedTaskId} on category ${category}`);
        
        // Reset visual feedback
        event.target.style.background = 'transparent';
        event.target.style.border = 'none';
        
        try {
            // Update task category via API
            const response = await fetch(`/api/tasks/${this.draggedTaskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category: category })
            });

            if (response.ok) {
                console.log(`Successfully moved task to category: ${category}`);
                
                // Reload tasks to reflect the change
                setTimeout(() => {
                    loadTasks();
                }, 100);
            } else {
                console.error('Failed to update task category');
                alert('Fehler beim Verschieben des Tasks.');
            }
        } catch (error) {
            console.error('Error updating task category:', error);
            alert('Fehler beim Verschieben des Tasks.');
        }
        
        this.draggedTaskId = null;
        this.dragOverCategory = null;
    }

    // Drop on Date (for moving tasks between dates)
    async dropOnDate(event, date) {
        event.preventDefault();
        
        if (!this.draggedTaskId) {
            console.error('No dragged task ID found');
            return;
        }

        console.log(`Dropping task ${this.draggedTaskId} on date ${date}`);
        
        try {
            // Update task due date via API
            const response = await fetch(`/api/tasks/${this.draggedTaskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ due_date: date })
            });

            if (response.ok) {
                console.log(`Successfully moved task to date: ${date}`);
                
                // Reload tasks to reflect the change
                setTimeout(() => {
                    loadTasks();
                }, 100);
            } else {
                console.error('Failed to update task date');
                alert('Fehler beim Verschieben des Tasks.');
            }
        } catch (error) {
            console.error('Error updating task date:', error);
            alert('Fehler beim Verschieben des Tasks.');
        }
        
        this.draggedTaskId = null;
    }

    // Utility: Check if element is a valid drop target
    isValidDropTarget(element) {
        return element.classList.contains('category-drop-zone') || 
               element.classList.contains('date-drop-zone');
    }

    // Utility: Get category from drop target
    getCategoryFromDropTarget(element) {
        // Try to find category from various sources
        if (element.dataset.category) {
            return element.dataset.category;
        }
        
        // Look for category in parent elements
        let parent = element.parentElement;
        while (parent) {
            if (parent.dataset.category) {
                return parent.dataset.category;
            }
            parent = parent.parentElement;
        }
        
        return 'General'; // Default fallback
    }

    // Utility: Get date from drop target
    getDateFromDropTarget(element) {
        if (element.dataset.date) {
            return element.dataset.date;
        }
        
        // Look for date in parent elements
        let parent = element.parentElement;
        while (parent) {
            if (parent.dataset.date) {
                return parent.dataset.date;
            }
            parent = parent.parentElement;
        }
        
        return null;
    }

    // Enable drag and drop for a task element
    enableDragForTask(taskElement, taskId) {
        taskElement.draggable = true;
        taskElement.ondragstart = (event) => this.dragStart(event, taskId);
        taskElement.ondragend = (event) => this.dragEnd(event);
    }

    // Enable drop zone for a category
    enableDropZoneForCategory(dropZoneElement, category) {
        dropZoneElement.ondrop = (event) => this.dropOnCategory(event, category);
        dropZoneElement.ondragover = (event) => this.dragOver(event);
        dropZoneElement.ondragenter = (event) => this.dragEnter(event, category);
        dropZoneElement.ondragleave = (event) => this.dragLeave(event);
    }

    // Enable drop zone for a date
    enableDropZoneForDate(dropZoneElement, date) {
        dropZoneElement.ondrop = (event) => this.dropOnDate(event, date);
        dropZoneElement.ondragover = (event) => this.dragOver(event);
        dropZoneElement.ondragenter = (event) => this.dragEnter(event, date);
        dropZoneElement.ondragleave = (event) => this.dragLeave(event);
    }
}

// Globale Instanz
const dragDropComponent = new DragDropComponent();

// Globale Funktionen für HTML-Event-Handler
function dragStart(event, taskId) {
    dragDropComponent.dragStart(event, taskId);
}

function dragEnd(event) {
    dragDropComponent.dragEnd(event);
}

function dropOnCategory(event, category) {
    dragDropComponent.dropOnCategory(event, category);
}

function dropOnDate(event, date) {
    dragDropComponent.dropOnDate(event, date);
}
