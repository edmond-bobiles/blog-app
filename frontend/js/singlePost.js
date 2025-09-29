async function renderSinglePost(post) {
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

    let commentsHtml = '';
    if (post.comments && post.comments.length) {
        const commentPromises = post.comments.map(async (c) => {
            const commenterUsername = await getUsernameById(c.user_id);
            return `
                <div class="bg-gray-50 rounded-lg p-3 mb-2">
                    <div class="flex items-center justify-between mb-1">
                        <span class="font-medium text-sm text-gray-900">${escapeHtml(commenterUsername)}</span>
                        ${getCurrentUser() && getCurrentUser().id === post.user_id
                            ? `<button data-comment-id="${c.id}" data-post-id="${post.id}" class="delete-comment-btn text-xs text-red-600 hover:underline">Delete</button>`
                            : ''}
                    </div>
                    <p class="text-gray-700 text-sm">${escapeHtml(c.content)}</p>
                </div>
            `;
        });
        const commentResults = await Promise.all(commentPromises);
        commentsHtml = commentResults.join('');
    } else {
        commentsHtml = `<div class="text-center py-4 text-gray-500"><p class="text-sm">No comments yet. Be the first to comment!</p></div>`;
    }

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
        await renderSinglePost(post);
    } catch (err) {
        console.error(err);
        await renderSinglePost(null);
    }
}