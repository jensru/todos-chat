// TaskCard.js - React Task Card Component
const { useState, useEffect, useRef } = React;

function TaskCard({ task, onUpdate }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(task.title);
    const [editDescription, setEditDescription] = useState(task.description || '');
    const taskRef = useRef(null);
    
    // Speichere die Task-Daten für Drag & Drop
    const [draggedTask, setDraggedTask] = useState(null);
    
    const handleToggleComplete = () => {
        onUpdate(tasks => tasks.map(t => 
            t.id === task.id ? { ...t, completed: !t.completed } : t
        ));
    };
    
    const handleSaveEdit = () => {
        onUpdate(tasks => tasks.map(t => 
            t.id === task.id ? { 
                ...t, 
                title: editTitle, 
                description: editDescription 
            } : t
        ));
        setIsEditing(false);
    };
    
    const handleCancelEdit = () => {
        setEditTitle(task.title);
        setEditDescription(task.description || '');
        setIsEditing(false);
    };
    
    const handleDelete = () => {
        onUpdate(tasks => tasks.filter(t => t.id !== task.id));
    };
    
    const handleAddSubtask = () => {
        const subtaskTitle = prompt('Unteraufgabe hinzufügen:');
        if (subtaskTitle) {
            onUpdate(tasks => tasks.map(t => 
                t.id === task.id ? {
                    ...t,
                    subtasks: [...(t.subtasks || []), {
                        id: Date.now(),
                        title: subtaskTitle,
                        completed: false
                    }]
                } : t
            ));
        }
    };
    
    const handleToggleSubtask = (subtaskId) => {
        onUpdate(tasks => tasks.map(t => 
            t.id === task.id ? {
                ...t,
                subtasks: (t.subtasks || []).map(subtask =>
                    subtask.id === subtaskId 
                        ? { ...subtask, completed: !subtask.completed }
                        : subtask
                )
            } : t
        ));
    };
    
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'text-destructive';
            case 'medium': return 'text-secondary';
            case 'low': return 'text-muted';
            default: return 'text-secondary';
        }
    };
    
    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'high': return '🔴';
            case 'medium': return '🟡';
            case 'low': return '🟢';
            default: return '⚪';
        }
    };
    
    return (
        <div 
            ref={taskRef}
            className={`task-card bg-background border border-border rounded-lg p-4 hover:shadow-md transition-shadow ${task.completed ? 'opacity-60' : ''}`}
            draggable="true"
            onDragStart={(e) => {
                console.log('TaskCard drag start:', task.title);
                e.dataTransfer.setData('text/plain', task.id);
                e.dataTransfer.effectAllowed = 'move';
                e.target.classList.add('dragging');
                setDraggedTask(task);
                // Speichere die Task-Daten global für Drop-Handler
                window.currentDraggedTask = task;
            }}
            onDragEnd={(e) => {
                console.log('TaskCard drag end:', task.title);
                e.target.classList.remove('dragging');
                setDraggedTask(null);
                window.currentDraggedTask = null;
            }}
        >
            <div className="task-header flex items-start justify-between mb-2">
                {/* Drag Handle */}
                <div className="drag-handle mr-2 flex items-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16"></path>
                    </svg>
                </div>
                {isEditing ? (
                    <div className="flex-1 mr-4">
                        <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full input-field mb-2"
                            placeholder="Aufgabentitel"
                        />
                        <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="w-full input-field"
                            placeholder="Beschreibung (optional)"
                            rows="2"
                        />
                    </div>
                ) : (
                    <div className="flex-1 mr-4">
                        <h4 className={`task-title font-medium ${task.completed ? 'line-through' : ''}`}>
                            {task.title}
                        </h4>
                        {task.description && (
                            <p className="text-muted-foreground text-sm mt-1">
                                {task.description}
                            </p>
                        )}
                        <div className="flex items-center space-x-2 mt-2">
                            <span className={`text-xs ${getPriorityColor(task.priority)}`}>
                                {getPriorityIcon(task.priority)} {task.priority}
                            </span>
                            {task.dueDate && (
                                <span className="text-xs text-muted-foreground">
                                    📅 {task.dueDate.toLocaleDateString('de-DE')}
                                </span>
                            )}
                            {task.category && (
                                <span className="text-xs text-muted-foreground">
                                    📁 {task.category}
                                </span>
                            )}
                            {task.complexity && (
                                <span className="text-xs text-muted-foreground">
                                    ⚡ {task.complexity}
                                </span>
                            )}
                        </div>
                    </div>
                )}
                
                <div className="task-actions flex space-x-2">
                    {isEditing ? (
                        <>
                            <button 
                                onClick={handleSaveEdit}
                                className="task-action-btn p-1 rounded hover:bg-muted transition-colors"
                                title="Speichern"
                            >
                                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </button>
                            <button 
                                onClick={handleCancelEdit}
                                className="task-action-btn p-1 rounded hover:bg-muted transition-colors"
                                title="Abbrechen"
                            >
                                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </>
                    ) : (
                        <>
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="task-action-btn p-1 rounded hover:bg-muted transition-colors"
                                title="Bearbeiten"
                            >
                                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                            </button>
                            <button 
                                onClick={handleAddSubtask}
                                className="task-action-btn p-1 rounded hover:bg-muted transition-colors"
                                title="Unteraufgabe hinzufügen"
                            >
                                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                </svg>
                            </button>
                            <button 
                                onClick={handleToggleComplete}
                                className="task-action-btn p-1 rounded hover:bg-muted transition-colors"
                                title={task.completed ? "Als unerledigt markieren" : "Als erledigt markieren"}
                            >
                                <svg className={`w-4 h-4 ${task.completed ? 'text-primary' : 'text-muted-foreground'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </button>
                            <button 
                                onClick={handleDelete}
                                className="task-action-btn p-1 rounded hover:bg-muted transition-colors"
                                title="Löschen"
                            >
                                <svg className="w-4 h-4 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                            </button>
                        </>
                    )}
                </div>
            </div>
            
            {/* Subtasks */}
            {task.subtasks && task.subtasks.length > 0 && (
                <div className="task-subtasks mt-3">
                    <div className="subtasks-header text-sm font-medium text-muted-foreground mb-2">
                        Unteraufgaben:
                    </div>
                    <div className="subtasks-list space-y-1">
                        {task.subtasks.map((subtask) => (
                            <div key={subtask.id} className="subtask-item flex items-center space-x-2 text-sm">
                                <input 
                                    type="checkbox" 
                                    checked={subtask.completed}
                                    onChange={() => handleToggleSubtask(subtask.id)}
                                    className="subtask-checkbox rounded border-border"
                                />
                                <span className={`text-foreground ${subtask.completed ? 'line-through opacity-60' : ''}`}>
                                    {subtask.title}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
