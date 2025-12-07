document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const res = await fetch('/api/users/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });

                const data = await res.json();

                if (res.ok) {
                    localStorage.setItem('userInfo', JSON.stringify(data));
                    window.location.href = '/';
                } else {
                    showToast(data.message || 'Login failed', 'danger');
                }
            } catch (error) {
                console.error(error);
                showToast('An error occurred', 'danger');
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (password !== confirmPassword) {
                showToast('Passwords do not match', 'danger');
                return;
            }

            try {
                const res = await fetch('/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password }),
                });

                const data = await res.json();

                if (res.ok) {
                    localStorage.setItem('userInfo', JSON.stringify(data));
                    window.location.href = '/';
                } else {
                    showToast(data.message || 'Registration failed', 'danger');
                }
            } catch (error) {
                console.error(error);
                showToast('An error occurred', 'danger');
            }
        });
    }
});
