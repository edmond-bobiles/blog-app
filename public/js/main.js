

// TODO: In general, clean project structure (do not submit venv pycache node_modules)


document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('posts-container')) loadPosts();
    if (document.getElementById('single-post-container')) {
        const id = getQueryParam('id');
        if (id) loadSinglePost(id);
    }
});