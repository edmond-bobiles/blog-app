const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const username = document.querySelector('input[name="username"]').value.trim();
        const password = document.querySelector('input[name="password"]').value.trim();
        if (!username || !password) {
            return alert('Please fill in all fields.');
        }

        // check if on signup page 
        const isSignupPage = document.title.includes('Sign Up') || window.location.pathname.includes('signup');
        const endpoint = isSignupPage ? '/users/' : '/login/';
        const action = isSignupPage ? 'Signup' : 'Login';

        try {
            const res = await fetch(`${API_BASE}${endpoint}`, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (!res.ok || data.error) {
                return alert(data.error || data.detail || `${action} failed`);
            }
            
            if (isSignupPage) {
                alert('Account created successfully! Please login.');
                window.location.href = 'index.html';
            } else {
                localStorage.setItem('user', JSON.stringify(data));
                window.location.href = 'viewPosts.html';
            }
        } catch (err) {
            console.error(err);
            alert('Network error, try again.');
        }
    });
}

document.querySelectorAll('.logoutLink').forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault();
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });
});