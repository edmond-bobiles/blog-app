// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // Get the login form
    const loginForm = document.getElementById('loginForm');
    
    // Add event listener for form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent the default form submission
        
        // Get form input values
        const username = document.querySelector('input[name="username"]').value;
        const password = document.querySelector('input[name="password"]').value;
        
        // Basic validation
        if (username && password) {
            // Redirect to viewPosts.html
            window.location.href = 'viewPosts.html';
        } else {
            alert('Please fill in all fields');
        }
    });
    
});