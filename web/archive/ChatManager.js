// ChatManager.js - Chat Interface Management
export class ChatManager {
    constructor() {
        this.messages = [];
        this.isTyping = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.addBotMessage("Hey, woran willst du heute arbeiten?");
    }

    bindEvents() {
        const chatInput = document.getElementById('chat-input');
        const sendButton = document.getElementById('send-button');

        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        if (sendButton) {
            sendButton.addEventListener('click', () => this.sendMessage());
        }
    }

    addBotMessage(text) {
        const message = {
            id: Date.now(),
            type: 'bot',
            text: text,
            timestamp: new Date()
        };
        
        this.messages.push(message);
        this.renderMessage(message);
        this.scrollToBottom();
    }

    addUserMessage(text) {
        const message = {
            id: Date.now(),
            type: 'user',
            text: text,
            timestamp: new Date()
        };
        
        this.messages.push(message);
        this.renderMessage(message);
        this.scrollToBottom();
    }

    renderMessage(message) {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;

        const messageElement = document.createElement('div');
        messageElement.className = `${message.type}-message flex items-start space-x-3`;
        messageElement.setAttribute('data-message-id', message.id);

        if (message.type === 'bot') {
            messageElement.innerHTML = `
                <div class="bot-avatar w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <svg class="w-4 h-4 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                </div>
                <div class="bot-content bg-muted p-3 rounded-lg max-w-[80%]">
                    <p class="text-foreground">${this.escapeHtml(message.text)}</p>
                </div>
            `;
        } else {
            messageElement.innerHTML = `
                <div class="user-content bg-primary text-primary-foreground p-3 rounded-lg max-w-[80%] ml-auto">
                    <p>${this.escapeHtml(message.text)}</p>
                </div>
            `;
        }

        messagesContainer.appendChild(messageElement);
    }

    async sendMessage() {
        const chatInput = document.getElementById('chat-input');
        if (!chatInput) return;

        const messageText = chatInput.value.trim();
        if (!messageText) return;

        // Add user message
        this.addUserMessage(messageText);
        
        // Clear input
        chatInput.value = '';
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Process message (simulate bot response for now)
        setTimeout(() => {
            this.hideTypingIndicator();
            this.processUserMessage(messageText);
        }, 1000);
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;

        const typingElement = document.createElement('div');
        typingElement.id = 'typing-indicator';
        typingElement.className = 'bot-message flex items-start space-x-3';
        typingElement.innerHTML = `
            <div class="bot-avatar w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <svg class="w-4 h-4 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
            </div>
            <div class="bot-content bg-muted p-3 rounded-lg max-w-[80%]">
                <div class="typing-dots flex space-x-1">
                    <div class="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div class="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                    <div class="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                </div>
            </div>
        `;

        messagesContainer.appendChild(typingElement);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    processUserMessage(messageText) {
        // Simple keyword-based responses for now
        let response = this.generateBotResponse(messageText);
        this.addBotMessage(response);
    }

    generateBotResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        
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
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('chat-messages');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getMessages() {
        return this.messages;
    }
}
