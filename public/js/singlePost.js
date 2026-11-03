async function renderSinglePost(post) {
    const container = document.getElementById('single-post-container');
    if (!container) return;

    if (!post) {
        container.innerHTML = `
            <div class="bg-white rounded-xl border border-gray-200/80 shadow-sm p-12 text-center max-w-lg mx-auto">
                <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                </div>
                <h2 class="text-xl font-bold text-gray-900 mb-1">Post not found</h2>
                <p class="text-gray-500 text-sm">The post you're looking for doesn't exist or has been removed.</p>
            </div>
        `;
        return;
    }

    const ownerUsername = await getUsernameById(post.user_id);
    const initial = (ownerUsername && ownerUsername.length > 0) ? ownerUsername.charAt(0).toUpperCase() : 'U';

    let commentsHtml = '';
    if (post.comments && post.comments.length) {
        const commentPromises = post.comments.map(async (c) => {
            const commenterUsername = await getUsernameById(c.user_id);
            const commentInitial = (commenterUsername && commenterUsername.length > 0) ? commenterUsername.charAt(0).toUpperCase() : 'U';
            return `
                <div class="comment-card bg-gray-50/80 rounded-r-lg p-3.5 mb-2.5 border border-gray-100 border-l-4 border-l-blue-500">
                    <div class="flex items-center justify-between mb-1.5">
                        <div class="flex items-center gap-2">
                            <span class="avatar-initial" style="width:20px;height:20px;font-size:0.65rem;">${escapeHtml(commentInitial)}</span>
                            <span class="font-semibold text-xs text-gray-800">${escapeHtml(commenterUsername)}</span>
                        </div>
                        ${getCurrentUser() && getCurrentUser().id === post.user_id
                            ? `<button data-comment-id="${c.id}" data-post-id="${post.id}" class="delete-comment-btn text-xs text-red-500 hover:text-red-700 hover:underline">Delete</button>`
                            : ''}
                    </div>
                    <p class="text-gray-700 text-sm pl-7 leading-relaxed">${escapeHtml(c.content)}</p>
                </div>
            `;
        });
        const commentResults = await Promise.all(commentPromises);
        commentsHtml = commentResults.join('');
    } else {
        commentsHtml = `<div class="text-center py-6 text-gray-400 bg-gray-50/50 rounded-lg border border-dashed border-gray-200"><p class="text-sm">No comments yet. Be the first to share your thoughts!</p></div>`;
    }

    container.innerHTML = `
        <article class="bg-white rounded-xl shadow-sm border border-gray-200/80 overflow-hidden">
            <header class="p-8 sm:p-10 border-b border-gray-100">
                <div class="flex items-center gap-3 mb-5">
                    <span class="avatar-initial" style="width:36px;height:36px;font-size:0.875rem;">${escapeHtml(initial)}</span>
                    <div>
                        <div class="font-semibold text-sm text-gray-900">${escapeHtml(ownerUsername)}</div>
                        <div class="text-xs text-gray-500">Published author</div>
                    </div>
                </div>
                <h1 class="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">${escapeHtml(post.title)}</h1>
                <hr class="border-gray-100 my-6" />
                <div class="text-gray-700 text-base sm:text-lg leading-relaxed whitespace-pre-line">${escapeHtml(post.description)}</div>
            </header>
            <section class="p-8 sm:p-10 bg-slate-50/30">
                <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Comments (${(post.comments || []).length})</h3>
                <div id="single-comments">${commentsHtml}</div>
                <div class="mt-6 flex space-x-2">
                    <input type="text" id="single-comment-input" placeholder="Write a comment..." 
                        class="comment-input flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm">
                    <button id="single-comment-btn" class="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium shadow-sm hover:shadow">
                        Post
                    </button>
                </div>
            </section>
        </article>
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

    // Show loading spinner
    container.innerHTML = `
        <div class="flex flex-col items-center justify-center py-20 text-gray-400">
            <div class="spinner mb-3"></div>
            <p class="text-sm text-gray-500">Loading post...</p>
        </div>
    `;

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