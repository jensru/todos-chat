// CanvasPanel.js - React Canvas Component
const { useState, useEffect } = React;

function CanvasPanel({ tasks, goals, workingStyleDNA, onUpdateTasks, onUpdateGoals, onUpdateDNA, taskService }) {
    const [showEmptyState, setShowEmptyState] = useState(tasks.length === 0 && goals.length === 0);
    const [mobileView, setMobileView] = useState('canvas');
    const [groupedTasks, setGroupedTasks] = useState({});
    const [dragDropService, setDragDropService] = useState(null);
    
    useEffect(() => {
        setShowEmptyState(tasks.length === 0 && goals.length === 0);
        
        // Gruppiere Tasks nach Datum
        const grouped = tasks.reduce((acc, task) => {
            const dateKey = task.dueDate ? task.dueDate.toISOString().split('T')[0] : 'ohne-datum';
            if (!acc[dateKey]) {
                acc[dateKey] = [];
            }
            acc[dateKey].push(task);
            return acc;
        }, {});
        
        // Sortiere die Gruppen nach Datum
        const sortedGroups = Object.keys(grouped).sort((a, b) => {
            if (a === 'ohne-datum') return 1;
            if (b === 'ohne-datum') return -1;
            return new Date(a) - new Date(b);
        });
        
        const sortedGrouped = {};
        sortedGroups.forEach(date => {
            sortedGrouped[date] = grouped[date];
        });
        
        setGroupedTasks(sortedGrouped);
    }, [tasks]);
    
    useEffect(() => {
        // Initialisiere Drag & Drop Service
        if (window.DragDropService) {
            setDragDropService(new window.DragDropService());
        }
    }, []);
    
    // Behandelt Task-Bewegung durch Drag & Drop
    const handleTaskMove = async (draggedTask, targetDate, targetPosition) => {
        console.log('handleTaskMove called with:', { draggedTask, targetDate, targetPosition });
        
        const newDueDate = targetDate === 'ohne-datum' ? null : new Date(targetDate);
        
        console.log('New due date:', newDueDate);
        
        // Aktualisiere den lokalen State
        onUpdateTasks(currentTasks => {
            console.log('Updating local state, current tasks:', currentTasks.length);
            
            // Entferne die Task aus der aktuellen Position
            const filteredTasks = currentTasks.filter(task => task.id !== draggedTask.id);
            console.log('Tasks after removing dragged task:', filteredTasks.length);
            
            // Erstelle die aktualisierte Task mit neuer Position basierend auf Drop-Zone
            const updatedTask = {
                ...draggedTask,
                dueDate: newDueDate,
                // Weise eine neue Position basierend auf der Drop-Position zu
                globalPosition: targetPosition || Date.now()
            };
            
            // Füge die Task an der neuen Position hinzu
            const newTasks = [...filteredTasks, updatedTask];
            
            // Sortiere die Tasks nach Datum und dann nach globaler Position (gleiche Logik wie TaskService)
            newTasks.sort((a, b) => {
                // 1. Sortierung nach Datum
                const dateA = a.dueDate ? a.dueDate.toISOString().split('T')[0] : 'ohne-datum';
                const dateB = b.dueDate ? b.dueDate.toISOString().split('T')[0] : 'ohne-datum';
                
                if (dateA !== dateB) {
                    if (dateA === 'ohne-datum') return 1;
                    if (dateB === 'ohne-datum') return -1;
                    return new Date(dateA) - new Date(dateB);
                }
                
                // 2. Sortierung nach Priorität (high > medium > low)
                const priorityOrder = { 'high': 1, 'medium': 2, 'low': 3 };
                const priorityA = priorityOrder[a.priority] || 4;
                const priorityB = priorityOrder[b.priority] || 4;
                
                if (priorityA !== priorityB) {
                    return priorityA - priorityB;
                }
                
                // 3. Sortierung nach globaler Position (falls vorhanden)
                const globalPosA = a.globalPosition || a.lineNumber || 999;
                const globalPosB = b.globalPosition || b.lineNumber || 999;
                
                return globalPosA - globalPosB;
            });
            
            // Weise neue globale Positionen basierend auf der finalen Sortierung zu
            const finalTasks = newTasks.map((task, index) => ({
                ...task,
                globalPosition: index + 1
            }));
            
            console.log('New tasks after move:', finalTasks.length);
            return finalTasks;
        });
        
        // Aktualisiere die Task in der Datenbank (asynchron)
        if (taskService) {
            console.log('Updating task in database...');
            try {
                await taskService.updateTask(draggedTask.id, {
                    due_date: newDueDate ? newDueDate.toISOString().split('T')[0] : null,
                    // Speichere die neue globale Position
                    global_position: targetPosition || Date.now()
                });
                console.log('Database update completed');
            } catch (error) {
                console.error('Database update failed:', error);
            }
        }
        
        console.log('Task move completed');
    };
    
    const handleQuickAction = (action) => {
        // This would trigger a chat message
        console.log('Quick action:', action);
    };
    
    const toggleMobileView = (view) => {
        setMobileView(view);
    };
    
    const formatDate = (dateString) => {
        if (dateString === 'ohne-datum') return 'Ohne Datum';
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return 'Ungültiges Datum';
            }
            
            const today = new Date();
            const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
            
            if (dateString === today.toISOString().split('T')[0]) {
                return 'Heute';
            } else if (dateString === tomorrow.toISOString().split('T')[0]) {
                return 'Morgen';
            } else {
                return date.toLocaleDateString('de-DE', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                });
            }
        } catch (error) {
            console.warn('Error formatting date:', dateString, error);
            return 'Ungültiges Datum';
        }
    };
    
    const getTaskStats = () => {
        if (!taskService) return null;
        return taskService.getTaskStats();
    };
    
    const stats = getTaskStats();
    
    return (
        <div className="canvas-panel w-full lg:w-2/3 flex flex-col bg-background">
            {/* Canvas Header */}
            <div className="canvas-header p-4 border-border border-b bg-muted">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">Canvas</h2>
                    <div className="flex items-center space-x-2">
                        {/* Mobile Toggle Buttons */}
                        <button 
                            onClick={() => toggleMobileView('chat')}
                            className="lg:hidden p-2 rounded-md hover:bg-muted transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                            </svg>
                        </button>
                        <button 
                            onClick={() => toggleMobileView('canvas')}
                            className="lg:hidden p-2 rounded-md hover:bg-muted transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Canvas Content */}
            <div className="canvas-content flex-1 p-6 overflow-y-auto custom-scrollbar">
                {showEmptyState ? (
                    <EmptyState onQuickAction={handleQuickAction} />
                ) : (
                    <div className="tasks-container">
                        {/* Goals Section */}
                        {goals.length > 0 && (
                            <div className="goals-section mb-8">
                                <h3 className="text-lg font-semibold text-foreground mb-4">Ziele</h3>
                                <div className="goals-list space-y-3">
                                    {goals.map((goal) => (
                                        <GoalCard 
                                            key={goal.id} 
                                            goal={goal} 
                                            onUpdate={onUpdateGoals}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tasks Section */}
                        {tasks.length > 0 && (
                            <div className="tasks-section">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-foreground">Aufgaben</h3>
                                    {stats && (
                                        <div className="text-sm text-muted-foreground">
                                            {stats.active} aktiv • {stats.today} heute • {stats.overdue} überfällig
                                        </div>
                                    )}
                                </div>
                                
                                {/* Gruppierte Tasks nach Datum */}
                                {Object.entries(groupedTasks).map(([dateKey, dateTasks]) => (
                                    <div key={dateKey} className="date-group mb-6">
                                        <h4 className="text-md font-medium text-foreground mb-3 flex items-center">
                                            <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                                            {formatDate(dateKey)}
                                            <span className="ml-2 text-sm text-muted-foreground">
                                                ({dateTasks.length})
                                            </span>
                                        </h4>
                                        <div 
                                            className="tasks-list ml-4"
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                console.log('Date group drag over:', dateKey);
                                            }}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                console.log('Date group drop:', dateKey);
                                                if (window.currentDraggedTask) {
                                                    console.log('Dropping task:', window.currentDraggedTask.title, 'to date:', dateKey);
                                                    handleTaskMove(window.currentDraggedTask, dateKey, 0);
                                                }
                                            }}
                                        >
                                            {/* Drop-Zone am Anfang des Tages */}
                                            <div 
                                                className="drop-zone"
                                                onDragOver={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    e.currentTarget.classList.add('drop-zone-active');
                                                }}
                                                onDragLeave={(e) => {
                                                    e.currentTarget.classList.remove('drop-zone-active');
                                                }}
                                                onDrop={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    e.currentTarget.classList.remove('drop-zone-active');
                                                    console.log('Drop at beginning of day:', dateKey);
                                                    if (window.currentDraggedTask) {
                                                        console.log('Dropping task at beginning:', window.currentDraggedTask.title);
                                                        handleTaskMove(window.currentDraggedTask, dateKey, 0);
                                                    }
                                                }}
                                            ></div>
                                            
                                            {dateTasks.map((task, index) => (
                                                <div key={task.id}>
                                                    <TaskCard 
                                                        task={task} 
                                                        onUpdate={onUpdateTasks}
                                                    />
                                                    {/* Drop-Zone nach jeder Task */}
                                                    <div 
                                                        className="drop-zone"
                                                        onDragOver={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            e.currentTarget.classList.add('drop-zone-active');
                                                        }}
                                                        onDragLeave={(e) => {
                                                            e.currentTarget.classList.remove('drop-zone-active');
                                                        }}
                                                        onDrop={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            e.currentTarget.classList.remove('drop-zone-active');
                                                            console.log('Drop after task:', task.title, 'at position:', index + 1);
                                                            if (window.currentDraggedTask) {
                                                                console.log('Dropping task after:', window.currentDraggedTask.title, 'at position:', index + 1);
                                                                handleTaskMove(window.currentDraggedTask, dateKey, index + 1);
                                                            }
                                                        }}
                                                    ></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Working Style DNA Section */}
                        <div className="dna-section mt-8 p-4 bg-muted rounded-lg">
                            <h3 className="text-lg font-semibold text-foreground mb-4">Dein Arbeitsstil</h3>
                            <div className="dna-content text-muted-foreground">
                                {Object.keys(workingStyleDNA).length === 0 ? (
                                    <p>Lerne deine Arbeitsweise kennen...</p>
                                ) : (
                                    <div className="dna-items space-y-2">
                                        {Object.entries(workingStyleDNA).map(([key, value]) => (
                                            <div key={key} className="dna-item flex items-center space-x-2">
                                                <span className="text-sm text-foreground">{value}</span>
                                                <button className="dna-edit-btn p-1 rounded hover:bg-muted transition-colors">
                                                    <svg className="w-3 h-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
