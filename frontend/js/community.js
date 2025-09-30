// User Auth UI
const authSection = document.createElement('section');
authSection.id = 'auth-section';
authSection.innerHTML = `
  <h2>User Login / Register</h2>
  <form id="auth-form">
    <input type="text" id="auth-username" placeholder="Username" required />
    <input type="password" id="auth-password" placeholder="Password" required />
    <button type="submit">Login</button>
    <button type="button" id="register-btn">Register</button>
    <div id="auth-message" class="success-message" style="display:none;"></div>
  </form>
  <div id="profile-info" style="display:none;"></div>
`;
document.body.prepend(authSection);

const API_BASE_URL = window.location.hostname === 'the-madmaster.github.io'
  ? 'https://your-render-backend-url.onrender.com/api'
  : 'http://localhost:8080/api';

let currentUser = null;

async function loginUser(username, password) {
  const res = await fetch(`${API_BASE_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, passwordHash: password })
  });
  if (res.ok) {
    currentUser = await res.json();
    showProfile();
    showAuthMessage('Login successful!');
  } else {
    showAuthMessage('Login failed', true);
  }
}

async function registerUser(username, password) {
  const res = await fetch(`${API_BASE_URL}/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, passwordHash: password })
  });
  if (res.ok) {
    showAuthMessage('Registration successful! You can now log in.');
  } else {
    showAuthMessage('Registration failed', true);
  }
}

function showAuthMessage(msg, error) {
  const msgDiv = document.getElementById('auth-message');
  msgDiv.textContent = msg;
  msgDiv.className = error ? 'error-message' : 'success-message';
  msgDiv.style.display = 'block';
  setTimeout(() => msgDiv.style.display = 'none', 2500);
}

function showProfile() {
  const profileDiv = document.getElementById('profile-info');
  if (currentUser) {
    profileDiv.innerHTML = `<b>Logged in as:</b> ${currentUser.username}`;
    profileDiv.style.display = 'block';
  } else {
    profileDiv.style.display = 'none';
  }
}

document.getElementById('auth-form').onsubmit = e => {
  e.preventDefault();
  const username = document.getElementById('auth-username').value.trim();
  const password = document.getElementById('auth-password').value;
  loginUser(username, password);
};
document.getElementById('register-btn').onclick = () => {
  const username = document.getElementById('auth-username').value.trim();
  const password = document.getElementById('auth-password').value;
  registerUser(username, password);
};

// Upvote/Favorite UI (to be integrated into prompt cards)
window.upvotePrompt = async function(promptId) {
  if (!currentUser) return showAuthMessage('Login to upvote!', true);
  const res = await fetch(`${API_BASE_URL}/prompts/${promptId}/upvote?user=${currentUser.username}`, { method: 'POST' });
  if (res.ok) showAuthMessage('Upvoted!');
  else showAuthMessage('Failed to upvote', true);
  // Optionally reload prompts
};
window.favoritePrompt = async function(promptId) {
  if (!currentUser) return showAuthMessage('Login to favorite!', true);
  const res = await fetch(`${API_BASE_URL}/prompts/${promptId}/favorite?user=${currentUser.username}`, { method: 'POST' });
  if (res.ok) showAuthMessage('Favorited!');
  else showAuthMessage('Failed to favorite', true);
  // Optionally reload prompts
};
// Filtering UI (to be integrated into main page)
// Add search/filter bar as needed in index.html and connect to API
