// Remember me prefill
const rememberCheckbox = document.getElementById('rememberMe');
const usernameInput = document.querySelector('input[name="username"]');
if (rememberCheckbox && usernameInput) {
    const savedUser = localStorage.getItem('remembered_username');
    if (savedUser) {
        usernameInput.value = savedUser;
        rememberCheckbox.checked = true;
    }
}

// Password visibility toggles
document.querySelectorAll('.password-toggle').forEach(btn => {
    btn.addEventListener('click', function () {
        const input = this.parentElement.querySelector('input');
        if (!input) return;
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        const eyeIcon = this.querySelector('.eye-icon');
        const eyeOffIcon = this.querySelector('.eye-off-icon');
        if (eyeIcon && eyeOffIcon) {
            eyeIcon.classList.toggle('hidden', !isPassword);
            eyeOffIcon.classList.toggle('hidden', isPassword);
        }
    });
});

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const username = document.querySelector('input[name="username"]').value.trim();
        const password = document.querySelector('input[name="password"]').value.trim();
        if (!username || !password) {
            return alert('Please fill in all fields.');
        }

        // Handle remember me state
        if (rememberCheckbox) {
            if (rememberCheckbox.checked) {
                localStorage.setItem('remembered_username', username);
            } else {
                localStorage.removeItem('remembered_username');
            }
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

const resetPasswordForm = document.getElementById('resetPasswordForm');
if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const username = document.querySelector('input[name="username"]').value.trim();
        const newPassword = document.querySelector('input[name="new_password"]').value.trim();
        const confirmPassword = document.querySelector('input[name="confirm_password"]').value.trim();

        if (!username || !newPassword || !confirmPassword) {
            return alert('Please fill in all fields.');
        }

        if (newPassword !== confirmPassword) {
            return alert('Passwords do not match.');
        }

        try {
            const res = await fetch(`${API_BASE}/reset-password/`, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, new_password: newPassword })
            });
            const data = await res.json();
            if (!res.ok || data.error) {
                return alert(data.error || data.detail || 'Password reset failed');
            }

            alert('Password reset successfully! Please sign in with your new password.');
            window.location.href = 'index.html';
        } catch (err) {
            console.error(err);
            alert('Network error, try again.');
        }
    });
}