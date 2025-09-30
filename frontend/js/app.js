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
    // Use environment variable if set (for deployment)
    if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE_URL) {
        return process.env.REACT_APP_API_BASE_URL;
    }
    // In production (GitHub Pages)
    if (window.location.hostname === 'the-madmaster.github.io') {
        return 'https://your-render-backend-url.onrender.com/api';
    }
    // Development
    return 'http://localhost:8081/api';
}

const API_BASE_URL = getApiBaseUrl();
console.log('Environment:', window.location.hostname);
console.log('API URL:', API_BASE_URL);
// Load prompts when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded, loading prompts...');
    setupFilterBar();
    loadPrompts();
    setupForm();
});

// Load prompts from backend API with filters
async function loadPrompts() {
    const container = document.getElementById('prompts-list');
    container.innerHTML = '<div class="loading"><span class="loading-dots">Loading</span></div>';
    // Gather filter values
    const search = document.getElementById('searchInput')?.value.trim().toLowerCase() || '';
    const category = document.getElementById('categoryInput')?.value.trim() || '';
    const tag = document.getElementById('tagInput')?.value.trim() || '';
    const nsfw = document.getElementById('nsfwSelect')?.value || '';
    const sort = document.getElementById('sortSelect')?.value || '';
    const contributor = document.getElementById('contributorInput')?.value.trim() || '';
    let url = `${API_BASE_URL}/prompts?`;
    if (category) url += `category=${encodeURIComponent(category)}&`;
    if (tag) url += `tag=${encodeURIComponent(tag)}&`;
    if (nsfw) url += `nsfw=${encodeURIComponent(nsfw)}&`;
    if (contributor) url += `contributor=${encodeURIComponent(contributor)}&`;
    if (sort) url += `sort=${encodeURIComponent(sort)}&`;
    try {
        console.log('Loading prompts from:', url);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        let prompts = await response.json();
        // Client-side search (if needed)
        if (search) {
            prompts = prompts.filter(p => p.promptText.toLowerCase().includes(search));
        }
        // Client-side sort fallback
        if (sort === 'date') {
            prompts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (sort === 'popularity') {
            prompts.sort((a, b) => (b.upvoteCount || 0) - (a.upvoteCount || 0));
        }
        displayPrompts(prompts);
    } catch (error) {
        console.error('Error loading prompts:', error);
        container.innerHTML = 
            `<div class="error-message">
                ❌ Error loading prompts: ${error.message}<br>
                <small>Backend URL: ${API_BASE_URL}/prompts<br>
                Make sure the backend server is running.</small>
             </div>`;
    }
}

// Setup filter bar event listeners
function setupFilterBar() {
    const ids = ['searchInput','categoryInput','tagInput','nsfwSelect','sortSelect','contributorInput','filterRefreshBtn'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (id === 'filterRefreshBtn') el.onclick = loadPrompts;
            else el.oninput = loadPrompts;
        }
    });
}

// Display prompts in the grid
function displayPrompts(prompts) {
    const container = document.getElementById('prompts-list');
    
    if (prompts.length === 0) {
        container.innerHTML = '<div class="loading">No prompts found. Be the first to submit one!</div>';
        return;
    }
    
    container.innerHTML = prompts.map(prompt => {
        const exportText =
`Prompt: ${prompt.promptText}\nModel: ${prompt.model || 'Not specified'}\nSource: ${prompt.sourceUrl}\n${prompt.credit ? 'Credit: ' + prompt.credit + '\n' : ''}`;
        return `
        <div class="prompt-card">
            <div class="prompt-text">${escapeHtml(prompt.promptText)}</div>
            <div class="prompt-meta">
                <div>
                    <strong>Model:</strong> ${prompt.model || 'Not specified'}<br>
                    <strong>Source:</strong> <a href="${prompt.sourceUrl}" target="_blank">View original</a>
                    ${prompt.credit ? `<br><strong>Credit:</strong> ${escapeHtml(prompt.credit)}` : ''}
                </div>
                <button class="copy-btn" onclick="copyToClipboard('${escapeHtml(prompt.promptText)}', this)">📋 Copy</button>
            </div>
            <div class="prompt-actions" style="margin-top:0.5rem; display:flex; gap:0.5rem; align-items:center;">
                <button onclick="upvotePrompt(${prompt.id})" class="upvote-btn">👍 Upvote <span>${prompt.upvoteCount || 0}</span></button>
                <button onclick="favoritePrompt(${prompt.id})" class="favorite-btn">⭐ Favorite <span>${prompt.favoriteCount || 0}</span></button>
                <button onclick="exportPromptText(\`${exportText.replace(/`/g, '\`')}\`, this)" class="export-btn">⬇️ Export</button>
            </div>
        </div>
        `;
    }).join('');
}

// Export prompt as text
window.exportPromptText = async function(text, button) {
    try {
        await navigator.clipboard.writeText(text);
        button.textContent = '✅ Exported!';
        button.classList.add('copied');
        setTimeout(() => {
            button.textContent = '⬇️ Export';
            button.classList.remove('copied');
        }, 2000);
    } catch (error) {
        alert('Failed to export: ' + error.message);
    }
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
        // Remove any previous error
        let errorBanner = document.getElementById('form-error-banner');
        if (errorBanner) errorBanner.remove();
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
            showFormError('Please fill in required fields: Prompt Text and Source URL');
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
            showFormError('❌ Error submitting prompt: ' + error.message);
        } finally {
            // Reset button state
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    });
    // Helper to show error banner
    function showFormError(msg) {
        let errorBanner = document.createElement('div');
        errorBanner.id = 'form-error-banner';
        errorBanner.className = 'error-message';
        errorBanner.textContent = msg;
        form.insertBefore(errorBanner, form.firstChild);
    }
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