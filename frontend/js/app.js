// API base URL - dynamically detect environment
/*function getApiBaseUrl() {
    // If we're in GitHub Codespaces
    if (window.location.hostname.includes('preview.app.github.dev')) {
        // Replace frontend port (3000) with backend port (8080)
        const backendUrl = window.location.href.replace('3000', '8080');
        return `${backendUrl}api`;
    }
    // Local development
    return 'http://localhost:8080/api';
} */
function getApiBaseUrl() {
    // In production (GitHub Pages)
    if (window.location.hostname === 'the-madmaster.github.io') {
        return 'https://your-render-backend-url.onrender.com/api';
    }
    // Development
    return 'http://localhost:8080/api';
}

const API_BASE_URL = getApiBaseUrl();
console.log('Environment:', window.location.hostname);
console.log('API URL:', API_BASE_URL);
// Load prompts when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded, loading prompts...');
    loadPrompts();
    setupForm();
});

// Load prompts from backend API
async function loadPrompts() {
    try {
        console.log('Loading prompts from:', `${API_BASE_URL}/prompts`);
        
        const response = await fetch(`${API_BASE_URL}/prompts`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const prompts = await response.json();
        console.log('Loaded prompts:', prompts);
        
        displayPrompts(prompts);
    } catch (error) {
        console.error('Error loading prompts:', error);
        document.getElementById('prompts-list').innerHTML = 
            `<div class="loading">
                Error loading prompts: ${error.message}<br>
                Backend URL: ${API_BASE_URL}/prompts<br>
                Make sure the backend server is running.
             </div>`;
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
                    ${prompt.credit ? `<br><strong>Credit:</strong> ${escapeHtml(prompt.credit)}` : ''}
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
    const successMessage = document.getElementById('success-message');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        
        // Show loading state
        submitButton.textContent = 'Submitting...';
        submitButton.disabled = true;
        successMessage.style.display = 'none';
        
        const formData = new FormData(form);
        const promptData = {
            promptText: formData.get('promptText'),
            model: formData.get('model'),
            sourceUrl: formData.get('sourceUrl'),
            credit: formData.get('credit'),
            uploaderName: formData.get('uploaderName')
        };
        
        // Basic validation
        if (!promptData.promptText || !promptData.sourceUrl) {
            alert('Please fill in required fields: Prompt Text and Source URL');
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            return;
        }
        
        try {
            console.log('Submitting prompt:', promptData);
            const response = await fetch(`${API_BASE_URL}/prompts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(promptData)
            });
            
            if (response.ok) {
                const newPrompt = await response.json();
                console.log('Prompt submitted successfully:', newPrompt);
                
                // Show success message
                successMessage.textContent = '✅ Prompt submitted successfully! It will appear after moderation.';
                successMessage.style.display = 'block';
                
                form.reset();
                loadPrompts(); // Reload prompts
            } else {
                const errorText = await response.text();
                throw new Error(`Server error: ${response.status} - ${errorText}`);
            }
        } catch (error) {
            console.error('Error submitting prompt:', error);
            alert('❌ Error submitting prompt: ' + error.message);
        } finally {
            // Reset button state
            submitButton.textContent = originalText;
            submitButton.disabled = false;
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
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        button.textContent = '✅ Copied!';
        button.classList.add('copied');
        setTimeout(() => {
            button.textContent = '📋 Copy';
            button.classList.remove('copied');
        }, 2000);
    }
}

// Helper function to escape HTML
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}