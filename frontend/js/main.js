// main.js
const API_BASE = "http://127.0.0.1:8000"; // backend base URL

// ----------------- UTILITIES -----------------
function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem('user')) || null;
    } catch (e) {
        return null;
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str
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

// ----------------- AUTH -----------------
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
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
            const data = await res.json();
            if (!res.ok || data.error) {
                return alert(data.error || data.detail || 'Login failed');
            }
            localStorage.setItem('user', JSON.stringify(data));
            window.location.href = 'viewPosts.html';
        } catch (err) {
            console.error(err);
            alert('Network error, try again.');
        }
    });
}

document.querySelectorAll('.logoutLink').forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault();
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });
});

// ----------------- NAVBAR -----------------
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}

// ----------------- POSTS LIST -----------------
function createPostCard(post) {
    const ownerLabel = `User #${post.user_id}`;
    const commentsHtml = (post.comments && post.comments.length)
        ? post.comments.map(c => `
            <div class="bg-gray-50 rounded-lg p-3 mb-2">
                <div class="flex items-center justify-between mb-1">
                    <span class="font-medium text-sm text-gray-900">User #${c.user_id}</span>
                    ${getCurrentUser() && getCurrentUser().id === post.user_id
                        ? `<button data-comment-id="${c.id}" data-post-id="${post.id}" class="delete-comment-btn text-xs text-red-600 hover:underline">Delete</button>`
                        : ''}
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

async function loadPosts() {
    const container = document.getElementById('posts-container');
    const noPosts = document.getElementById('no-posts');
    if (!container) return;

    try {
        const res = await fetch(`${API_BASE}/posts/`);
        if (!res.ok) {
            throw new Error('HTTP error: ' + res.status);
        }
        const posts = await res.json();
        if (posts.error) {
            throw new Error(posts.error);
        }
        if (!posts || posts.length === 0) {
            if (noPosts) noPosts.classList.remove('hidden');
            container.innerHTML = '';
            return;
        }
        if (noPosts) noPosts.classList.add('hidden');
        container.innerHTML = posts.map(createPostCard).join('');
    } catch (err) {
        console.error('Error loading posts:', err);
        container.innerHTML = `<div class="text-red-600">Failed to load posts. Is the backend running?</div>`;
    }
}

// ----------------- SINGLE POST -----------------
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
                    ${getCurrentUser() && getCurrentUser().id === post.user_id
                        ? `<button data-comment-id="${c.id}" data-post-id="${post.id}" class="delete-comment-btn text-xs text-red-600 hover:underline">Delete</button>`
                        : ''}
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
            const data = await res.json();
            if (!res.ok || data.error) {
                throw new Error(data.error || data.detail || 'Failed to post comment');
            }
            input.value = '';
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
        const post = await res.json();
        if (!res.ok || post.error) {
            throw new Error(post.error || post.detail || 'Post not found');
        }
        renderSinglePost(post);
    } catch (err) {
        console.error(err);
        renderSinglePost(null);
    }
}

// ----------------- COMMENT HANDLERS -----------------
document.addEventListener('click', async function (e) {
    // Add comment
    if (e.target.matches('.post-comment-btn')) {
        const postId = e.target.dataset.postId;
        const input = document.querySelector(`input[data-post-input="${postId}"]`);
        const text = input?.value.trim();
        const currentUser = getCurrentUser();
        if (!currentUser) return alert('You must be logged in to comment.');
        if (!text) return;

        try {
            const res = await fetch(`${API_BASE}/posts/${postId}/comments`, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: text, user_id: currentUser.id })
            });
            const data = await res.json();
            if (!res.ok || data.error) {
                throw new Error(data.error || data.detail || 'Failed to post comment');
            }
            input.value = '';

            // refresh the right page
            if (document.getElementById('posts-container')) {
                await loadPosts();
            } else if (document.getElementById('single-post-container')) {
                await loadSinglePost(postId);
            }
        } catch (err) {
            console.error(err);
            alert(err.message || 'Could not post comment');
        }
    }

    // Delete comment
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
            const data = await res.json();
            if (!res.ok || data.error) {
                throw new Error(data.error || data.detail || 'Failed to delete comment');
            }

            // refresh the right page
            if (document.getElementById('posts-container')) {
                await loadPosts();
            } else if (document.getElementById('single-post-container')) {
                await loadSinglePost(postId);
            }
        } catch (err) {
            console.error(err);
            alert(err.message || 'Could not delete comment');
        }
    }
});

document.addEventListener('keypress', function (e) {
    if (e.key === 'Enter' && e.target.matches('.comment-input')) {
        const postId = e.target.getAttribute('data-post-input');
        const btn = document.querySelector(`.post-comment-btn[data-post-id="${postId}"]`);
        if (btn) btn.click();
    }
});

// ----------------- INIT -----------------
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('posts-container')) loadPosts();
    if (document.getElementById('single-post-container')) {
        const id = getQueryParam('id');
        if (id) loadSinglePost(id);
    }
});