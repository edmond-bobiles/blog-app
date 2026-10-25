document.addEventListener('DOMContentLoaded', function() {
    const createPostForm = document.getElementById('createPostForm');
    
    if (createPostForm) {
        createPostForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const currentUser = getCurrentUser();
            if (!currentUser) {
                alert('You must be logged in to create a post.');
                return;
            }
            
            const title = document.getElementById('postTitle').value.trim();
            const description = document.getElementById('postDescription').value.trim();
            
            if (!title || !description) {
                alert('Please fill in all fields.');
                return;
            }
            
            try {
                const response = await fetch(`${API_BASE}/posts/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        title: title,
                        description: description,
                        user_id: currentUser.id
                    })
                });
                
                const data = await response.json();
                
                if (!response.ok || data.error) {
                    throw new Error(data.error || data.detail || 'Failed to create post');
                }
                
                alert('Post created successfully!');
                window.location.href = 'viewPosts.html';
                
            } catch (error) {
                console.error('Error creating post:', error);
                alert(error.message || 'Failed to create post.');
            }
        });
    }
});

