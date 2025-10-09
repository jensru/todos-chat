// EmptyState.js - React Empty State Component
function EmptyState({ onQuickAction }) {
    const handleQuickAction = (action) => {
        onQuickAction(action);
    };
    
    return (
        <div className="empty-state flex flex-col items-center justify-center h-full text-center">
            <div className="empty-icon mb-6">
                <svg className="w-24 h-24 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                </svg>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Deine Aufgaben & Ziele</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
                Deine Aufgaben & Ziele erscheinen hier. Fang einfach im Chat an.
            </p>
            
            {/* Quick Action Chips */}
            <div className="quick-actions flex flex-wrap gap-3 justify-center">
                <button 
                    onClick={() => handleQuickAction('+ Neue Aufgabe')}
                    className="quick-action-chip px-4 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
                >
                    + Neue Aufgabe
                </button>
                <button 
                    onClick={() => handleQuickAction('+ Neues Ziel')}
                    className="quick-action-chip px-4 py-2 bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/90 transition-colors"
                >
                    + Neues Ziel
                </button>
            </div>
        </div>
    );
}
