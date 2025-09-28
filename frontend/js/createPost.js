// createPost.js
const createPostForm = document.getElementById('createPostForm');
const API_BASE = "http://127.0.0.1:8000";

if (createPostForm) {
    createPostForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const title = document.getElementById('postTitle').value.trim();
        const description = document.getElementById('postDescription').value.trim();
        const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
        if (!currentUser) return alert('You must be logged in to create posts.');

        if (!title || !description) return alert('Please fill in all fields.');

        try {
            const res = await fetch(`${API_BASE}/posts/`, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, description, user_id: currentUser.id })
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || 'Failed to create post');
            }
            const post = await res.json();
            // redirect to posts page (or single post)
            window.location.href = 'viewPosts.html';
        } catch (err) {
            console.error(err);
            alert(err.message || 'Could not create post');
        }
    });
}
