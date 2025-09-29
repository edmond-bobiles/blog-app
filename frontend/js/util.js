const API_BASE = "http://127.0.0.1:8000"; 

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('user')) || null;
  } catch (e) {
    return null;
  }
}

const usernameCache = new Map();

async function getUsernameById(userId) {
  if (usernameCache.has(userId)) return usernameCache.get(userId);

  try {
    const res = await fetch(`${API_BASE}/users/${userId}`);
    if (!res.ok) throw new Error('User not found');
    const user = await res.json();
    if (user && user.username) {
      usernameCache.set(userId, user.username);
      return user.username;
    }
    // fallback if API returns a different shape
    throw new Error(user?.error || 'Unexpected user response');
  } catch (err) {
    console.error(`Error fetching username for user ${userId}:`, err);
    const fallback = `User #${userId}`;
    usernameCache.set(userId, fallback);
    return fallback;
  }
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}