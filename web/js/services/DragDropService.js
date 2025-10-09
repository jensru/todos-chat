// DragDropService.js - Service für Drag & Drop Funktionalität
class DragDropService {
    constructor() {
        this.draggedTask = null;
        this.dragOverElement = null;
        this.dropZones = new Map();
    }

    // Startet das Drag & Drop für eine Task
    startDrag(task, event) {
        console.log('Starting drag for task:', task);
        this.draggedTask = task;
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', task.id);
        
        // Füge visuelle Klasse hinzu
        event.target.classList.add('dragging');
        
        console.log('Drag started, draggedTask set to:', this.draggedTask);
    }

    // Beendet das Drag & Drop
    endDrag(event) {
        event.target.classList.remove('dragging');
        this.draggedTask = null;
        this.dragOverElement = null;
        
        // Entferne alle Drop-Zone-Highlights
        document.querySelectorAll('.drop-zone-active').forEach(el => {
            el.classList.remove('drop-zone-active');
        });
    }

    // Wird aufgerufen wenn über ein Element gedraggt wird
    handleDragOver(event, dropZone) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        
        // Highlight der Drop-Zone
        if (this.dragOverElement !== dropZone) {
            this.clearDropZoneHighlights();
            dropZone.classList.add('drop-zone-active');
            this.dragOverElement = dropZone;
        }
    }

    // Wird aufgerufen wenn das Drag-Element eine Drop-Zone verlässt
    handleDragLeave(event, dropZone) {
        // Nur highlight entfernen wenn wir wirklich die Zone verlassen
        if (!dropZone.contains(event.relatedTarget)) {
            dropZone.classList.remove('drop-zone-active');
            this.dragOverElement = null;
        }
    }

    // Wird aufgerufen wenn ein Element gedroppt wird
    handleDrop(event, dropZone, onTaskMove) {
        event.preventDefault();
        event.stopPropagation();
        
        console.log('Drop event triggered', event);
        
        const taskId = event.dataTransfer.getData('text/plain');
        const targetDate = dropZone.dataset.date;
        const targetPosition = parseInt(dropZone.dataset.position) || 0;
        
        console.log('Drop data:', { taskId, targetDate, targetPosition, draggedTask: this.draggedTask });
        
        // Entferne Highlights
        this.clearDropZoneHighlights();
        
        // Führe die Task-Bewegung durch
        if (onTaskMove && this.draggedTask) {
            console.log('Calling onTaskMove');
            onTaskMove(this.draggedTask, targetDate, targetPosition);
        } else {
            console.warn('onTaskMove not available or draggedTask is null');
        }
        
        this.draggedTask = null;
        this.dragOverElement = null;
    }

    // Entfernt alle Drop-Zone-Highlights
    clearDropZoneHighlights() {
        document.querySelectorAll('.drop-zone-active').forEach(el => {
            el.classList.remove('drop-zone-active');
        });
    }

    // Erstellt eine Drop-Zone
    createDropZone(date, position = 0) {
        const dropZone = document.createElement('div');
        dropZone.className = 'drop-zone';
        dropZone.dataset.date = date;
        dropZone.dataset.position = position;
        
        // Event Listeners
        dropZone.addEventListener('dragover', (e) => this.handleDragOver(e, dropZone));
        dropZone.addEventListener('dragleave', (e) => this.handleDragLeave(e, dropZone));
        dropZone.addEventListener('drop', (e) => this.handleDrop(e, dropZone));
        
        return dropZone;
    }

    // Macht ein Element draggable
    makeDraggable(element, task) {
        element.draggable = true;
        element.classList.add('draggable');
        
        element.addEventListener('dragstart', (e) => this.startDrag(task, e));
        element.addEventListener('dragend', (e) => this.endDrag(e));
    }

    // Entfernt Drag-Funktionalität
    removeDraggable(element) {
        element.draggable = false;
        element.classList.remove('draggable');
        
        element.removeEventListener('dragstart', this.startDrag);
        element.removeEventListener('dragend', this.endDrag);
    }
}

// Export für Verwendung in React-Komponenten
window.DragDropService = DragDropService;
