class PromptWebSocket {
    constructor() {
        this.stompClient = null;
        this.connected = false;
    }

    connect() {
        const socket = new SockJS('/ws');
        this.stompClient = Stomp.over(socket);
        
        this.stompClient.connect({}, (frame) => {
            console.log('Connected: ' + frame);
            this.connected = true;
            
            // Subscribe to new prompts
            this.stompClient.subscribe('/topic/new-prompts', (message) => {
                const newPrompt = JSON.parse(message.body);
                this.addNewPromptToUI(newPrompt);
            });
            
            // Subscribe to updates
            this.stompClient.subscribe('/topic/updates', (message) => {
                const updatedPrompt = JSON.parse(message.body);
                this.updatePromptInUI(updatedPrompt);
            });
        });
    }

    addNewPromptToUI(prompt) {
        const container = document.getElementById('prompts-list');
        const promptCard = this.createPromptCard(prompt);
        
        // Add new prompt at the top with animation
        container.insertAdjacentHTML('afterbegin', promptCard);
        
        // Show notification
        this.showNotification('New prompt added: ' + prompt.model);
    }

    createPromptCard(prompt) {
        return `
            <div class="prompt-card new-prompt">
                <div class="prompt-text">${escapeHtml(prompt.promptText)}</div>
                <div class="prompt-meta">
                    <div>
                        <strong>Model:</strong> ${prompt.model || 'Not specified'}<br>
                        <strong>Source:</strong> <a href="${prompt.sourceUrl}" target="_blank">View original</a>
                    </div>
                    <button class="copy-btn" onclick="copyToClipboard('${escapeHtml(prompt.promptText)}', this)">
                        📋 Copy
                    </button>
                </div>
            </div>
        `;
    }

    showNotification(message) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'notification-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 1rem;
            border-radius: 5px;
            z-index: 1000;
        `;
        
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
}

// Initialize WebSocket when page loads
document.addEventListener('DOMContentLoaded', function() {
    const promptSocket = new PromptWebSocket();
    promptSocket.connect();
});