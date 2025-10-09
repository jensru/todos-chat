// ChatPanel.js - React Chat Component
const { useState, useRef, useEffect } = React;

function ChatPanel({ messages, onAddMessage, onAddTask, onAddGoal, theme, onToggleTheme }) {
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    
    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    
    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;
        
        // Add user message
        onAddMessage({ type: 'user', text: inputValue });
        
        // Clear input
        setInputValue('');
        
        // Show typing indicator
        setIsTyping(true);
        
        // Process message and generate response
        setTimeout(() => {
            setIsTyping(false);
            const response = generateBotResponse(inputValue);
            onAddMessage({ type: 'bot', text: response });
            
            // Check if task should be created
            if (isTaskCreationMessage(inputValue)) {
                const task = createTaskFromMessage(inputValue);
                onAddTask(task);
            } else if (isGoalCreationMessage(inputValue)) {
                const goal = createGoalFromMessage(inputValue);
                onAddGoal(goal);
            }
        }, 1000);
    };
    
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };
    
    const generateBotResponse = (message) => {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('präsentation') || lowerMessage.includes('vortrag')) {
            return "Okay, habe eine To-Do erstellt. Willst du die in Schritte aufteilen?";
        }
        
        if (lowerMessage.includes('ja') || lowerMessage.includes('unterteilen')) {
            return "Typischer Ablauf wäre: Struktur machen → Inhalte sammeln → Folien gestalten → Probevortrag. Passt das?";
        }
        
        if (lowerMessage.includes('aufgabe') || lowerMessage.includes('todo')) {
            return "Perfekt! Ich habe eine neue Aufgabe erstellt. Soll ich noch Details hinzufügen?";
        }
        
        if (lowerMessage.includes('ziel') || lowerMessage.includes('projekt')) {
            return "Ein neues Ziel! Das ist großartig. Lass uns das in messbare Schritte aufteilen.";
        }
        
        return "Interessant! Erzähl mir mehr darüber.";
    };
    
    const isTaskCreationMessage = (message) => {
        const taskKeywords = ['aufgabe', 'todo', 'muss', 'soll', 'präsentation', 'bericht', 'email', 'anruf'];
        return taskKeywords.some(keyword => message.toLowerCase().includes(keyword));
    };
    
    const isGoalCreationMessage = (message) => {
        const goalKeywords = ['ziel', 'projekt', 'erreichen', 'schaffen', 'fertigstellen', 'abschließen'];
        return goalKeywords.some(keyword => message.toLowerCase().includes(keyword));
    };
    
    const createTaskFromMessage = (message) => {
        const taskTitle = extractTaskTitle(message);
        return {
            title: taskTitle,
            description: '',
            completed: false,
            priority: extractPriority(message),
            dueDate: extractDueDate(message),
            subtasks: []
        };
    };
    
    const createGoalFromMessage = (message) => {
        const goalTitle = extractGoalTitle(message);
        return {
            title: goalTitle,
            description: '',
            progress: 0,
            targetDate: extractTargetDate(message)
        };
    };
    
    const extractTaskTitle = (message) => {
        const patterns = [
            /(?:ich muss|ich soll|ich will|ich möchte)\s+(.+?)(?:\.|$)/i,
            /(?:muss|soll|will|möchte)\s+(.+?)(?:\.|$)/i,
            /(.+?)\s+(?:vorbereiten|erstellen|schreiben|machen|fertigstellen)/i
        ];
        
        for (const pattern of patterns) {
            const match = message.match(pattern);
            if (match) {
                return match[1].trim();
            }
        }
        
        return message;
    };
    
    const extractGoalTitle = (message) => {
        const patterns = [
            /(?:ziel|projekt)\s+(.+?)(?:\.|$)/i,
            /(?:erreichen|schaffen|fertigstellen|abschließen)\s+(.+?)(?:\.|$)/i,
            /(.+?)\s+(?:bis|bis zum|bis zur)/i
        ];
        
        for (const pattern of patterns) {
            const match = message.match(pattern);
            if (match) {
                return match[1].trim();
            }
        }
        
        return message;
    };
    
    const extractPriority = (message) => {
        if (message.toLowerCase().includes('wichtig') || message.toLowerCase().includes('dringend')) {
            return 'high';
        } else if (message.toLowerCase().includes('niedrig') || message.toLowerCase().includes('später')) {
            return 'low';
        }
        return 'medium';
    };
    
    const extractDueDate = (message) => {
        const datePatterns = [
            /(?:morgen|heute)/i,
            /(?:montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag)/i,
            /(?:nächste woche|nächsten monat)/i
        ];
        
        for (const pattern of datePatterns) {
            if (pattern.test(message)) {
                return parseRelativeDate(message.match(pattern)[0]);
            }
        }
        
        return null;
    };
    
    const extractTargetDate = (message) => {
        return extractDueDate(message);
    };
    
    const parseRelativeDate = (dateString) => {
        const now = new Date();
        const lower = dateString.toLowerCase();
        
        if (lower.includes('heute')) {
            return now;
        } else if (lower.includes('morgen')) {
            return new Date(now.getTime() + 24 * 60 * 60 * 1000);
        } else if (lower.includes('nächste woche')) {
            return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        }
        
        return null;
    };
    
    return (
        <div className="chat-panel w-full lg:w-1/3 lg:max-w-[500px] border-border border-r flex flex-col bg-background">
            {/* Chat Header */}
            <div className="chat-header p-4 border-border border-b bg-muted">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">Chat</h2>
                    <button 
                        onClick={onToggleTheme}
                        className="theme-toggle-btn p-2 rounded-md hover:bg-muted transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Chat Messages */}
            <div className="chat-messages flex-1 p-4 overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                    {messages.map((message) => (
                        <div key={message.id} className={`${message.type}-message flex items-start space-x-3`}>
                            {message.type === 'bot' && (
                                <div className="bot-avatar w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                    <svg className="w-4 h-4 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                    </svg>
                                </div>
                            )}
                            <div className={`${message.type}-content ${
                                message.type === 'bot' 
                                    ? 'bg-muted p-3 rounded-lg max-w-[80%]' 
                                    : 'bg-primary text-primary-foreground p-3 rounded-lg max-w-[80%] ml-auto'
                            }`}>
                                <p className={message.type === 'bot' ? 'text-foreground' : ''}>
                                    {message.text}
                                </p>
                            </div>
                        </div>
                    ))}
                    
                    {isTyping && (
                        <div className="bot-message flex items-start space-x-3">
                            <div className="bot-avatar w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                <svg className="w-4 h-4 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                </svg>
                            </div>
                            <div className="bot-content bg-muted p-3 rounded-lg max-w-[80%]">
                                <div className="typing-dots flex space-x-1">
                                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Chat Input */}
            <div className="chat-input p-4 border-border border-t bg-background">
                <div className="flex space-x-2">
                    <input 
                        type="text" 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Schreibe deine Nachricht..." 
                        className="flex-1 input-field"
                    />
                    <button 
                        onClick={handleSendMessage}
                        className="btn-primary px-4 py-2 focus:outline-none focus:ring-2 ring-ring transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
