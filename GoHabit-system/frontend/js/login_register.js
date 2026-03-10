document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const showRegister = document.getElementById("show-register");
    const showLogin = document.getElementById("show-login");
    const container = document.querySelector(".container");

    // UI State Management
    showRegister.addEventListener("click", () => {
        container.classList.add("register-active");
        document.body.classList.add("bg-register");
    });

    showLogin.addEventListener("click", () => {
        container.classList.remove("register-active");
        document.body.classList.remove("bg-register");
    });

    // Helper to show/hide errors
    const setFieldError = (inputId, message) => {
        const errorEl = document.getElementById(`${inputId}-error`);
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = message ? 'block' : 'none';
        }
    };

    // Login Logic
    loginForm.querySelector("form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;
        const submitBtn = loginForm.querySelector("button[type='submit']");

        // Simple client-side validation
        setFieldError('login-email', !email ? 'Email is required' : '');
        setFieldError('login-password', !password ? 'Password is required' : '');

        if (!email || !password) return;

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Logging in...';

            console.log('Login Attempt - GoHabitAPI state:', window.GoHabitAPI);
            const response = await window.GoHabitAPI.post('/auth/login', { email, password });

            // Success! Store token and redirect
            window.GoHabitAPI.setToken(response.data.token);
            window.location.href = 'index.html';
        } catch (err) {
            setFieldError('login-password', err.message || 'Invalid credentials');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Login';
        }
    });

    // Register Logic
    registerForm.querySelector("form").addEventListener("submit", async (e) => {
        e.preventDefault();

        const data = {
            firstname: document.getElementById("register-firstname").value,
            lastname: document.getElementById("register-lastname").value,
            email: document.getElementById("register-email").value,
            password: document.getElementById("register-password").value,
            birthdate: document.getElementById("register-birthdate").value,
            phone: document.getElementById("register-phone").value,
            username: document.getElementById("register-email").value.split('@')[0] // Fallback username
        };

        const submitBtn = registerForm.querySelector("button[type='submit']");

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creating account...';

            const response = await window.GoHabitAPI.post('/auth/register', data);

            // Success! Store token and redirect
            window.GoHabitAPI.setToken(response.data.token);
            window.location.href = 'index.html';
        } catch (err) {
            alert('Registration failed: ' + err.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Register';
        }
    });
});