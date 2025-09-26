// login form
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault(); 
        
        const username = document.querySelector('input[name="username"]').value;
        const password = document.querySelector('input[name="password"]').value;
        
        if (username && password) {
            window.location.href = 'viewPosts.html';
        } else {
            alert('Please fill in all fields');
        }
    });
}

// logout link 
document.querySelectorAll('.logoutLink').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        console.log("Logout clicked");
        window.location.href = 'index.html';
    });
});

// mobile hamburger menu 
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}
