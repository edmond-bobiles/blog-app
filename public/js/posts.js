async function createPostCard(post) {
    const ownerUsername = await getUsernameById(post.user_id);
    
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

    return `
        <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden" data-post-id="${post.id}">
            <div class="p-6 border-b border-gray-100">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex-1 pr-4">
                        <h3 class="font-semibold text-gray-900">${escapeHtml(ownerUsername)}</h3>
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
        
        // Generate all post cards with usernames
        const postCardPromises = posts.map(post => createPostCard(post));
        const postCards = await Promise.all(postCardPromises);
        container.innerHTML = postCards.join('');
    } catch (err) {
        console.error('Error loading posts:', err);
        container.innerHTML = `<div class="text-red-600">Failed to load posts. Is the backend running?</div>`;
    }
}