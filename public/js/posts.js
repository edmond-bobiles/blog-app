async function createPostCard(post) {
    const ownerUsername = await getUsernameById(post.user_id);
    const initial = (ownerUsername && ownerUsername.length > 0) ? ownerUsername.charAt(0).toUpperCase() : 'U';
    
    let commentsHtml = '';
    if (post.comments && post.comments.length) {
        const commentPromises = post.comments.map(async (c) => {
            const commenterUsername = await getUsernameById(c.user_id);
            const commentInitial = (commenterUsername && commenterUsername.length > 0) ? commenterUsername.charAt(0).toUpperCase() : 'U';
            return `
                <div class="comment-card bg-gray-50/80 rounded-r-lg p-3 mb-2 border border-gray-100 border-l-4 border-l-blue-500">
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
        commentsHtml = `<div class="text-center py-4 text-gray-400 bg-gray-50/50 rounded-lg border border-dashed border-gray-200"><p class="text-sm">No comments yet. Be the first to comment!</p></div>`;
    }

    return `
        <div class="bg-white rounded-lg shadow-sm border border-gray-200/80 hover:shadow-md transition-all duration-200 overflow-hidden" data-post-id="${post.id}">
            <div class="p-6 border-b border-gray-100">
                <div class="flex items-start justify-between gap-4">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="avatar-initial">${escapeHtml(initial)}</span>
                            <span class="font-semibold text-xs text-gray-600">${escapeHtml(ownerUsername)}</span>
                        </div>
                        <h2 class="text-xl font-bold text-gray-900 mb-2 leading-snug">
                            <a href="singlePost.html?id=${post.id}" class="hover:text-blue-600 transition-colors duration-200">
                                ${escapeHtml(post.title)}
                            </a>
                        </h2>
                        <p class="text-gray-600 text-sm leading-relaxed">${escapeHtml(post.description)}</p>
                    </div>
                    <div class="flex-shrink-0 self-start">
                        <a href="singlePost.html?id=${post.id}" 
                           class="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 text-blue-600 bg-blue-50/80 hover:bg-blue-100 rounded-md border border-blue-200 transition-colors">
                           View
                           <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                        </a>
                    </div>
                </div>
            </div>
            <div class="p-6 bg-slate-50/30">
                <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Comments (${(post.comments || []).length})</h4>
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

    // Show loading spinner
    container.innerHTML = `
        <div class="flex flex-col items-center justify-center py-16 text-gray-400">
            <div class="spinner mb-3"></div>
            <p class="text-sm text-gray-500">Loading posts...</p>
        </div>
    `;

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
            container.innerHTML = '';
            if (noPosts) noPosts.classList.remove('hidden');
            return;
        }
        if (noPosts) noPosts.classList.add('hidden');
        
        // Generate all post cards with usernames
        const postCardPromises = posts.map(post => createPostCard(post));
        const postCards = await Promise.all(postCardPromises);
        container.innerHTML = postCards.join('');
    } catch (err) {
        console.error('Error loading posts:', err);
        container.innerHTML = `
            <div class="text-center py-12 bg-white rounded-xl border border-red-100 p-6 shadow-sm">
                <p class="text-red-600 font-medium">Failed to load posts.</p>
                <p class="text-gray-500 text-xs mt-1">Please make sure the backend server is running.</p>
            </div>
        `;
    }
}