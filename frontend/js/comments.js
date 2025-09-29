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