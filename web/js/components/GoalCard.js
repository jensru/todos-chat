// GoalCard.js - React Goal Card Component
const { useState } = React;

function GoalCard({ goal, onUpdate }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(goal.title);
    const [editDescription, setEditDescription] = useState(goal.description || '');
    const [editProgress, setEditProgress] = useState(goal.progress || 0);
    
    const handleSaveEdit = () => {
        onUpdate(goals => goals.map(g => 
            g.id === goal.id ? { 
                ...g, 
                title: editTitle, 
                description: editDescription,
                progress: editProgress
            } : g
        ));
        setIsEditing(false);
    };
    
    const handleCancelEdit = () => {
        setEditTitle(goal.title);
        setEditDescription(goal.description || '');
        setEditProgress(goal.progress || 0);
        setIsEditing(false);
    };
    
    const handleDelete = () => {
        onUpdate(goals => goals.filter(g => g.id !== goal.id));
    };
    
    const handleProgressChange = (newProgress) => {
        onUpdate(goals => goals.map(g => 
            g.id === goal.id ? { ...g, progress: newProgress } : g
        ));
    };
    
    const getProgressColor = (progress) => {
        if (progress >= 80) return 'bg-primary';
        if (progress >= 50) return 'bg-secondary';
        return 'bg-muted-foreground';
    };
    
    const getProgressText = (progress) => {
        if (progress >= 80) return 'Fast geschafft!';
        if (progress >= 50) return 'Gut vorangekommen';
        if (progress >= 25) return 'Erste Schritte gemacht';
        return 'Noch am Anfang';
    };
    
    return (
        <div className="goal-card bg-background border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="goal-header flex items-start justify-between mb-3">
                {isEditing ? (
                    <div className="flex-1 mr-4">
                        <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full input-field mb-2"
                            placeholder="Ziel-Titel"
                        />
                        <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="w-full input-field mb-2"
                            placeholder="Beschreibung (optional)"
                            rows="2"
                        />
                        <div className="flex items-center space-x-2">
                            <label className="text-sm text-foreground">Fortschritt:</label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={editProgress}
                                onChange={(e) => setEditProgress(parseInt(e.target.value))}
                                className="flex-1"
                            />
                            <span className="text-sm text-muted-foreground">{editProgress}%</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 mr-4">
                        <h4 className="goal-title font-medium text-foreground">
                            {goal.title}
                        </h4>
                        {goal.description && (
                            <p className="goal-description text-muted-foreground text-sm mt-1">
                                {goal.description}
                            </p>
                        )}
                        {goal.targetDate && (
                            <div className="flex items-center space-x-2 mt-2">
                                <span className="text-xs text-muted-foreground">
                                    🎯 Ziel: {new Date(goal.targetDate).toLocaleDateString('de-DE')}
                                </span>
                            </div>
                        )}
                    </div>
                )}
                
                <div className="goal-actions flex space-x-2">
                    {isEditing ? (
                        <>
                            <button 
                                onClick={handleSaveEdit}
                                className="goal-action-btn p-1 rounded hover:bg-muted transition-colors"
                                title="Speichern"
                            >
                                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </button>
                            <button 
                                onClick={handleCancelEdit}
                                className="goal-action-btn p-1 rounded hover:bg-muted transition-colors"
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
                                className="goal-action-btn p-1 rounded hover:bg-muted transition-colors"
                                title="Bearbeiten"
                            >
                                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                            </button>
                            <button 
                                onClick={handleDelete}
                                className="goal-action-btn p-1 rounded hover:bg-muted transition-colors"
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
            
            {/* Progress Bar */}
            <div className="goal-progress-section mb-3">
                <div className="flex items-center justify-between mb-2">
                    <span className="goal-progress text-sm text-muted-foreground">
                        {goal.progress || 0}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {getProgressText(goal.progress || 0)}
                    </span>
                </div>
                <div className="goal-progress-bar bg-muted rounded-full h-2 mb-2">
                    <div 
                        className={`goal-progress-fill ${getProgressColor(goal.progress || 0)} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${goal.progress || 0}%` }}
                    ></div>
                </div>
                
                {/* Quick Progress Buttons */}
                {!isEditing && (
                    <div className="flex space-x-2 mt-2">
                        <button 
                            onClick={() => handleProgressChange(Math.max(0, (goal.progress || 0) - 10))}
                            className="btn-secondary text-xs px-2 py-1"
                        >
                            -10%
                        </button>
                        <button 
                            onClick={() => handleProgressChange(Math.min(100, (goal.progress || 0) + 10))}
                            className="btn-primary text-xs px-2 py-1"
                        >
                            +10%
                        </button>
                        <button 
                            onClick={() => handleProgressChange(100)}
                            className="btn-primary text-xs px-2 py-1"
                        >
                            Fertig!
                        </button>
                    </div>
                )}
            </div>
            
            {/* Milestones */}
            {goal.milestones && goal.milestones.length > 0 && (
                <div className="goal-milestones mt-3">
                    <div className="milestones-header text-sm font-medium text-muted-foreground mb-2">
                        Meilensteine:
                    </div>
                    <div className="milestones-list space-y-1">
                        {goal.milestones.map((milestone, index) => (
                            <div key={index} className="milestone-item flex items-center space-x-2 text-sm">
                                <div className={`w-2 h-2 rounded-full ${milestone.completed ? 'bg-primary' : 'bg-muted-foreground'}`}></div>
                                <span className={`text-foreground ${milestone.completed ? 'line-through opacity-60' : ''}`}>
                                    {milestone.title}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
