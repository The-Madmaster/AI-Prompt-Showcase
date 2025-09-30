const API_BASE_URL = window.location.hostname === 'the-madmaster.github.io'
  ? 'https://your-render-backend-url.onrender.com/api'
  : 'http://localhost:8080/api';

const form = document.getElementById('playground-form');
const resultDiv = document.getElementById('playground-result');

form.onsubmit = async e => {
  e.preventDefault();
  const prompt = document.getElementById('playground-prompt').value.trim();
  const model = document.getElementById('playground-model').value.trim();
  resultDiv.style.display = 'block';
  resultDiv.textContent = 'Running prompt...';
  try {
    const res = await fetch(`${API_BASE_URL}/playground`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, model })
    });
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    resultDiv.textContent = data.output || JSON.stringify(data);
  } catch (err) {
    resultDiv.textContent = 'Error: ' + err.message;
  }
};
