// main.js (replace your current file with this)
const API_BASE = "http://127.0.0.1:8000"; // change if your backend is elsewhere

// get current user from localStorage (after login)
function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem('user')) || null;
    } catch (e) {
        return null;
    }
}

// LOGIN form (if present)
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const username = document.querySelector('input[name="username"]').value.trim();
        const password = document.querySelector('input[name="password"]').value.trim();
        if (!username || !password) return alert('Please fill in all fields.');

        try {
            const res = await fetch(`${API_BASE}/login/`, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });
            if (!res.ok) {
                const err = await res.json();
                return alert(err.detail || 'Login failed');
            }
            const data = await res.json(); // { id, username }
            localStorage.setItem('user', JSON.stringify(data));
            window.location.href = 'viewPosts.html';
        } catch (err) {
            console.error(err);
            alert('Network error, try again.');
        }
    });
}

// LOGOUT links (global)
document.querySelectorAll('.logoutLink').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });
});

// mobile hamburger menu
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}

/* ---------------------------
   POSTS / RENDERING LOGIC
   --------------------------- */

function createPostCard(post) {
    // show username as "User #<id>" unless you extend backend to include username.
    const ownerLabel = `User #${post.user_id}`;

    const commentsHtml = (post.comments && post.comments.length)
        ? post.comments.map(c => `
            <div class="bg-gray-50 rounded-lg p-3 mb-2">
                <div class="flex items-center justify-between mb-1">
                    <span class="font-medium text-sm text-gray-900">User #${c.user_id}</span>
                    ${getCurrentUser() && getCurrentUser().id === post.user_id ? `<button data-comment-id="${c.id}" data-post-id="${post.id}" class="delete-comment-btn text-xs text-red-600 hover:underline">Delete</button>` : ''}
                </div>
                <p class="text-gray-700 text-sm">${escapeHtml(c.content)}</p>
            </div>
        `).join('')
        : `<div class="text-center py-4 text-gray-500"><p class="text-sm">No comments yet. Be the first to comment!</p></div>`;

    return `
        <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden" data-post-id="${post.id}">
            <div class="p-6 border-b border-gray-100">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex-1 pr-4">
                        <h3 class="font-semibold text-gray-900">${ownerLabel}</h3>
                        <h2 class="text-xl font-bold text-gray-900 mb-2">
                            <a href="singlePost.html?id=${post.id}" class="hover:text-blue-600 cursor-pointer transition-colors duration-200">
                                ${escapeHtml(post.title)}
                            </a>
                        </h2>
                        <p class="text-gray-600 leading-relaxed">${escapeHtml(post.description)}</p>
                    </div>
                    <div class="flex-shrink-0 ml-4 self-start">
                        <a href="singlePost.html?id=${post.id}" 
                           class="inline-block text-sm font-medium px-3 py-1.5 border border-blue-600 rounded-md hover:bg-blue-50">
                           View
                        </a>
                    </div>
                </div>
            </div>

            <div class="p-6">
                <h4 class="font-semibold text-gray-900 mb-4">Comments (${(post.comments || []).length})</h4>
                ${commentsHtml}

                <div class="mt-4 flex space-x-2">
                    <input type="text" placeholder="Write a comment..." data-post-input="${post.id}" class="comment-input flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm">
                    <button data-post-id="${post.id}" class="post-comment-btn px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium">
                        Post
                    </button>
                </div>
            </div>
        </div>
    `;
}

// escape helper to avoid HTML injection
function escapeHtml(str) {
    if (!str) return '';
    return str
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
}

async function loadPosts() {
    const container = document.getElementById('posts-container');
    const noPosts = document.getElementById('no-posts');
    if (!container) return;

    try {
        const res = await fetch(`${API_BASE}/posts/`);
        if (!res.ok) throw new Error('Failed to load posts');
        const posts = await res.json();
        if (!posts || posts.length === 0) {
            noPosts.classList.remove('hidden');
            container.innerHTML = '';
            return;
        }
        noPosts.classList.add('hidden');
        container.innerHTML = posts.map(createPostCard).join('');
    } catch (err) {
        console.error(err);
        container.innerHTML = `<div class="text-red-600">Failed to load posts. Is the backend running?</div>`;
    }
}

// event delegation: handle comment posting and deletion and Enter key
document.addEventListener('click', async function(e) {
    // Post comment
    if (e.target.matches('.post-comment-btn')) {
        const postId = e.target.dataset.postId;
        const input = document.querySelector(`input[data-post-input="${postId}"]`);
        const text = input?.value.trim();
        const currentUser = getCurrentUser();
        if (!currentUser) return alert('You must be logged in to comment.');
        if (!text) return;
        // call API
        try {
            const res = await fetch(`${API_BASE}/posts/${postId}/comments`, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: text, user_id: currentUser.id })
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || 'Failed to post comment');
            }
            // refresh posts (simple)
            await loadPosts();
        } catch (err) {
            console.error(err);
            alert(err.message || 'Could not post comment');
        }
    }

    // Delete comment (only shown when current user is post owner)
    if (e.target.matches('.delete-comment-btn')) {
        const commentId = e.target.dataset.commentId;
        const postId = e.target.dataset.postId;
        const currentUser = getCurrentUser();
        if (!currentUser) return alert('You must be logged in to delete comments.');
        if (!confirm('Delete this comment?')) return;
        try {
            const res = await fetch(`${API_BASE}/comments/${commentId}`, {
                method: 'DELETE',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ owner_user_id: currentUser.id })
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || 'Failed to delete comment');
            }
            // refresh posts
            await loadPosts();
        } catch (err) {
            console.error(err);
            alert(err.message || 'Could not delete comment');
        }
    }
});

// Enter key to submit comment
document.addEventListener('keypress', function(e) {
    const el = e.target;
    if (e.key === 'Enter' && el.matches('.comment-input')) {
        const postId = el.getAttribute('data-post-input');
        const btn = document.querySelector(`.post-comment-btn[data-post-id="${postId}"]`);
        if (btn) btn.click();
    }
});

// Only load posts on pages that have posts-container
document.addEventListener('DOMContentLoaded', () => {
    loadPosts();
});

// Utility: get query param
function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

// Render a single post
function renderSinglePost(post) {
    const container = document.getElementById('single-post-container');
    if (!container) return;

    if (!post) {
        container.innerHTML = `
            <div class="bg-white rounded-lg shadow-md p-8 text-center">
                <h2 class="text-2xl font-semibold text-gray-800 mb-2">Post not found</h2>
                <p class="text-gray-600">The post you're looking for doesn't exist.</p>
            </div>
        `;
        return;
    }

    const commentsHtml = (post.comments && post.comments.length)
        ? post.comments.map(c => `
            <div class="bg-gray-50 rounded-lg p-3 mb-2">
                <div class="flex items-center justify-between mb-1">
                    <span class="font-medium text-sm text-gray-900">User #${c.user_id}</span>
                </div>
                <p class="text-gray-700 text-sm">${escapeHtml(c.content)}</p>
            </div>
        `).join('')
        : `<div class="text-center py-4 text-gray-500"><p class="text-sm">No comments yet. Be the first to comment!</p></div>`;

    container.innerHTML = `
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="p-6 border-b border-gray-100">
                <h1 class="text-3xl font-bold text-gray-900 mb-3">${escapeHtml(post.title)}</h1>
                <p class="text-gray-700 leading-relaxed">${escapeHtml(post.description)}</p>
            </div>
            <div class="p-6">
                <h4 class="font-semibold text-gray-900 mb-4">Comments (${(post.comments || []).length})</h4>
                <div id="single-comments">${commentsHtml}</div>

                <div class="mt-6 flex space-x-2">
                    <input type="text" id="single-comment-input" placeholder="Write a comment..." 
                        class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm">
                    <button id="single-comment-btn" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium">
                        Post
                    </button>
                </div>
            </div>
        </div>
    `;

    // attach handler for new comment
    document.getElementById('single-comment-btn').addEventListener('click', async () => {
        const input = document.getElementById('single-comment-input');
        const text = input.value.trim();
        const currentUser = getCurrentUser();
        if (!currentUser) return alert('You must be logged in to comment.');
        if (!text) return;

        try {
            const res = await fetch(`${API_BASE}/posts/${post.id}/comments`, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: text, user_id: currentUser.id })
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || 'Failed to post comment');
            }
            // refresh single post after comment
            await loadSinglePost(post.id);
        } catch (err) {
            console.error(err);
            alert(err.message || 'Could not post comment');
        }
    });
}

async function loadSinglePost(id) {
    const container = document.getElementById('single-post-container');
    if (!container) return;
    try {
        const res = await fetch(`${API_BASE}/posts/${id}`);
        if (!res.ok) throw new Error('Post not found');
        const post = await res.json();
        renderSinglePost(post);
    } catch (err) {
        console.error(err);
        renderSinglePost(null);
    }
}

// Detect page
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('posts-container')) {
        loadPosts();
    }
    if (document.getElementById('single-post-container')) {
        const id = getQueryParam('id');
        if (id) loadSinglePost(id);
    }
});

