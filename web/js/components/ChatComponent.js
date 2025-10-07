/**
 * Mistral Chat Component - Verwaltung des AI-Chats
 */

class MistralChatComponent {
    constructor() {
        this.chatContainer = null;
        this.isLoading = false;
    }

    init() {
        this.chatContainer = document.getElementById('mistralChat');
        if (!this.chatContainer) return;

        // Load chat history from localStorage
        this.loadChatHistory();
    }

    async sendMessage(message) {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.addMessage('user', message);
        this.showTypingIndicator();

        try {
            const response = await fetch('/api/mistral', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: message })
            });

            const data = await response.json();
            
            this.hideTypingIndicator();
            
            if (data.success) {
                this.addMessage('assistant', data.response);
                
                // Check if response contains task operations and reload tasks
                if (this.containsTaskOperations(data.response)) {
                    setTimeout(() => loadTasks(), 1000);
                }
            } else {
                this.addMessage('assistant', `❌ Fehler: ${data.error || 'Unbekannter Fehler'}`);
            }
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('assistant', `❌ Verbindungsfehler: ${error.message}`);
        } finally {
            this.isLoading = false;
        }
    }

    addMessage(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}-message`;
        
        const timestamp = new Date().toLocaleTimeString('de-DE', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        messageDiv.innerHTML = `
            <div class="message-header">
                <span class="message-role">${role === 'user' ? '👤 Sie' : '🤖 Mistral'}</span>
                <span class="message-time">${timestamp}</span>
            </div>
            <div class="message-content">${this.formatMessage(content)}</div>
        `;
        
        this.chatContainer.appendChild(messageDiv);
        this.scrollToBottom();
        this.saveChatHistory();
    }

    formatMessage(content) {
        // Convert markdown-like formatting to HTML
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant-message typing-indicator';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="message-header">
                <span class="message-role">🤖 Mistral</span>
                <span class="message-time">${new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        this.chatContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    scrollToBottom() {
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }

    containsTaskOperations(response) {
        const taskKeywords = ['erstellt', 'gelöscht', 'verschoben', 'aktualisiert', 'geändert', 'Tool ausgeführt'];
        return taskKeywords.some(keyword => response.toLowerCase().includes(keyword));
    }

    clearChat() {
        this.chatContainer.innerHTML = '';
        localStorage.removeItem('mistralChatHistory');
    }

    saveChatHistory() {
        const messages = Array.from(this.chatContainer.children).map(msg => ({
            role: msg.classList.contains('user-message') ? 'user' : 'assistant',
            content: msg.querySelector('.message-content').innerHTML,
            timestamp: msg.querySelector('.message-time').textContent
        }));
        
        localStorage.setItem('mistralChatHistory', JSON.stringify(messages));
    }

    loadChatHistory() {
        const history = localStorage.getItem('mistralChatHistory');
        if (!history) return;
        
        try {
            const messages = JSON.parse(history);
            messages.forEach(msg => {
                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${msg.role}-message`;
                messageDiv.innerHTML = `
                    <div class="message-header">
                        <span class="message-role">${msg.role === 'user' ? '👤 Sie' : '🤖 Mistral'}</span>
                        <span class="message-time">${msg.timestamp}</span>
                    </div>
                    <div class="message-content">${msg.content}</div>
                `;
                this.chatContainer.appendChild(messageDiv);
            });
            
            this.scrollToBottom();
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    }

    // Quick Actions
    async createTaskQuickAction() {
        const title = prompt('Task-Titel:');
        if (!title) return;
        
        const category = prompt('Kategorie (optional):') || 'General';
        const priority = prompt('Priorität (low/medium/high):') || 'medium';
        const dueDate = prompt('Fälligkeitsdatum (YYYY-MM-DD, optional):') || null;
        
        const message = `Erstelle einen Task mit dem Titel "${title}" in der Kategorie "${category}" mit Priorität "${priority}"${dueDate ? ` und Fälligkeitsdatum "${dueDate}"` : ''}`;
        
        await this.sendMessage(message);
    }

    async deleteTaskQuickAction() {
        const taskId = prompt('Task-ID zum Löschen:');
        if (!taskId) return;
        
        await this.sendMessage(`Lösche den Task mit der ID "${taskId}"`);
    }

    async moveTaskQuickAction() {
        const taskId = prompt('Task-ID zum Verschieben:');
        if (!taskId) return;
        
        const newDate = prompt('Neues Datum (YYYY-MM-DD):');
        if (!newDate) return;
        
        await this.sendMessage(`Verschiebe den Task "${taskId}" auf das Datum "${newDate}"`);
    }
}

// Globale Instanz
const mistralChat = new MistralChatComponent();

// Globale Funktionen für HTML-Event-Handler
function sendMistralMessage() {
    const input = document.getElementById('mistralInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    input.value = '';
    mistralChat.sendMessage(message);
}

function clearMistralChat() {
    mistralChat.clearChat();
}

function handleMistralKeypress(event) {
    if (event.key === 'Enter') {
        sendMistralMessage();
    }
}

// Quick Action Functions
function createTaskQuickAction() {
    mistralChat.createTaskQuickAction();
}

function deleteTaskQuickAction() {
    mistralChat.deleteTaskQuickAction();
}

function moveTaskQuickAction() {
    mistralChat.moveTaskQuickAction();
}
