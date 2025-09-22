// API base URL - points to your Spring Boot backend
const API_BASE_URL = 'http://localhost:8080/api';

// Load prompts when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadPrompts();
    setupForm();
});

// Load prompts from backend API
async function loadPrompts() {
    try {
        const response = await fetch(`${API_BASE_URL}/prompts`);
        const prompts = await response.json();
        
        displayPrompts(prompts);
    } catch (error) {
        console.error('Error loading prompts:', error);
        document.getElementById('prompts-list').innerHTML = 
            '<div class="loading">Error loading prompts. Please check if the backend server is running.</div>';
    }
}

// Display prompts in the grid
function displayPrompts(prompts) {
    const container = document.getElementById('prompts-list');
    
    if (prompts.length === 0) {
        container.innerHTML = '<div class="loading">No prompts found. Be the first to submit one!</div>';
        return;
    }
    
    container.innerHTML = prompts.map(prompt => `
        <div class="prompt-card">
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
    `).join('');
}

// Handle form submission
function setupForm() {
    const form = document.getElementById('prompt-form');
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const promptData = {
            promptText: formData.get('promptText'),
            model: formData.get('model'),
            sourceUrl: formData.get('sourceUrl'),
            credit: formData.get('credit'),
            uploaderName: formData.get('uploaderName')
        };
        
        try {
            const response = await fetch(`${API_BASE_URL}/prompts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(promptData)
            });
            
            if (response.ok) {
                alert('✅ Prompt submitted successfully! It will appear after moderation.');
                form.reset();
                loadPrompts(); // Reload prompts to show the new one
            } else {
                alert('❌ Error submitting prompt. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('❌ Network error. Please check if the backend server is running.');
        }
    });
}

// Copy prompt text to clipboard
async function copyToClipboard(text, button) {
    try {
        await navigator.clipboard.writeText(text);
        button.textContent = '✅ Copied!';
        button.classList.add('copied');
        
        setTimeout(() => {
            button.textContent = '📋 Copy';
            button.classList.remove('copied');
        }, 2000);
    } catch (error) {
        console.error('Copy failed:', error);
        alert('Copy failed. Please copy manually.');
    }
}

// Helper function to escape HTML
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}