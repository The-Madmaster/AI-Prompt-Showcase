const API_BASE_URL = location.hostname === 'the-madmaster.github.io'
    ? 'https://your-render-backend-url.onrender.com/api'
    : 'http://localhost:8080/api';

const tableBody = document.querySelector('#pendingPromptsTable tbody');
const messageDiv = document.getElementById('admin-message');

async function fetchPendingPrompts() {
    tableBody.innerHTML = '<tr><td colspan="9" class="loading">Loading...</td></tr>';
    let url = `${API_BASE_URL}/prompts/pending`;
    const category = document.getElementById('categoryInput').value.trim();
    const tag = document.getElementById('tagInput').value.trim();
    if (category) url += `?category=${encodeURIComponent(category)}`;
    else if (tag) url += `?tag=${encodeURIComponent(tag)}`;
    const res = await fetch(url);
    if (!res.ok) {
        tableBody.innerHTML = `<tr><td colspan="9" class="error-message">Failed to load prompts</td></tr>`;
        return;
    }
    let prompts = await res.json();
    // Search
    const search = document.getElementById('searchInput').value.trim().toLowerCase();
    if (search) {
        prompts = prompts.filter(p => p.promptText.toLowerCase().includes(search));
    }
    // Sort
    const sort = document.getElementById('sortSelect').value;
    if (sort === 'date') {
        prompts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    // TODO: Popularity sort if available
    renderTable(prompts);
}

function renderTable(prompts) {
    if (!prompts.length) {
        tableBody.innerHTML = '<tr><td colspan="9" class="loading">No pending prompts.</td></tr>';
        return;
    }
    tableBody.innerHTML = prompts.map(p => `
        <tr class="${p.isNsfw ? 'flagged nsfw' : ''} ${p.isLowQuality ? 'flagged low-quality' : ''}">
            <td>${p.id}</td>
            <td>${escapeHtml(p.promptText)}</td>
            <td>${escapeHtml(p.credit || p.uploaderName || '')}</td>
            <td>${escapeHtml(p.categories || '')}</td>
            <td>${escapeHtml(p.tags || '')}</td>
            <td><input type="checkbox" ${p.isNsfw ? 'checked' : ''} onchange="toggleFlag(${p.id},'nsfw',this.checked)"></td>
            <td><input type="checkbox" ${p.isLowQuality ? 'checked' : ''} onchange="toggleFlag(${p.id},'lowquality',this.checked)"></td>
            <td>${p.createdAt ? new Date(p.createdAt).toLocaleString() : ''}</td>
            <td class="admin-actions">
                <button onclick="approvePrompt(${p.id})">Approve</button>
                <button onclick="rejectPrompt(${p.id})">Reject</button>
            </td>
        </tr>
    `).join('');
}

window.approvePrompt = async function(id) {
    const res = await fetch(`${API_BASE_URL}/prompts/${id}/approve`, { method: 'PUT' });
    if (res.ok) showMessage('Prompt approved!');
    else showMessage('Failed to approve prompt', true);
    fetchPendingPrompts();
};

window.rejectPrompt = async function(id) {
    if (!confirm('Are you sure you want to reject/delete this prompt?')) return;
    const res = await fetch(`${API_BASE_URL}/prompts/${id}/reject`, { method: 'DELETE' });
    if (res.ok) showMessage('Prompt rejected.');
    else showMessage('Failed to reject prompt', true);
    fetchPendingPrompts();
};

window.toggleFlag = async function(id, flag, value) {
    const url = `${API_BASE_URL}/prompts/${id}/${flag}?${flag === 'nsfw' ? 'nsfw' : 'lowQuality'}=${value}`;
    const res = await fetch(url, { method: 'PUT' });
    if (res.ok) showMessage(`Prompt marked as ${flag.toUpperCase()}: ${value ? 'Yes' : 'No'}`);
    else showMessage('Failed to update flag', true);
    fetchPendingPrompts();
};

document.getElementById('refreshBtn').onclick = fetchPendingPrompts;
document.getElementById('searchInput').oninput = fetchPendingPrompts;
document.getElementById('categoryInput').oninput = fetchPendingPrompts;
document.getElementById('tagInput').oninput = fetchPendingPrompts;
document.getElementById('sortSelect').onchange = fetchPendingPrompts;

function showMessage(msg, error) {
    messageDiv.textContent = msg;
    messageDiv.className = error ? 'error-message' : 'success-message';
    messageDiv.style.display = 'block';
    setTimeout(() => messageDiv.style.display = 'none', 2500);
}

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Initial load
fetchPendingPrompts();
