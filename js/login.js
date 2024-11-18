// Simulated user database (in a real application, this would be stored securely on a server)
let users = JSON.parse(localStorage.getItem('users')) || [];

// Constants
const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds
const MAX_LOGIN_ATTEMPTS = 3;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes in milliseconds

// Global variables
let csrfToken = generateCSRFToken();
let sessionTimer;
let loginAttempts = {};

/**
 * Hashes the password (for demonstration purposes only).
 * In a real application, use a proper cryptographic hash function.
 * @param {string} password - The password to hash.
 * @return {string} The hashed password.
 */
function hashPassword(password) {
    return btoa(password);
}

/**
 * Checks if the password meets the strength requirements.
 * @param {string} password - The password to check.
 * @return {boolean} True if the password is strong, false otherwise.
 */
function isPasswordStrong(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasNonalphas = /\W/.test(password);
    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasNonalphas;
}

/**
 * Sanitizes user input to prevent XSS attacks.
 * @param {string} input - The user input to sanitize.
 * @return {string} The sanitized input.
 */
function sanitizeInput(input) {
    return input.replace(/[<>&"']/g, function (match) {
        switch (match) {
            case '<': return '<';
            case '>': return '>';
            case '&': return '&amp;';
            case '"': return '&quot;';
            case "'": return '&#x27;';
            default: return match;
        }
    });
}

/**
 * Generates a CSRF token (simulated for client-side demo).
 * @return {string} The generated CSRF token.
 */
function generateCSRFToken() {
    return Math.random().toString(36).substr(2);
}

document.addEventListener('DOMContentLoaded', () => {
    // Initially hide the register form

    const registerFormDiv = document.getElementById('register-form');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loggedInContent = document.getElementById('logged-in-content');
    const loginFormDiv = document.getElementById('login-form');
    const userNameSpan = document.getElementById('user-name');
    const logoutBtn = document.getElementById('logout-btn');
    const errorMessage = document.getElementById('error-message');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('password');
    const forgotPasswordBtn = document.getElementById('forgot-password');

    registerFormDiv.style.display = 'none';

    togglePasswordBtn.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePasswordBtn.querySelector('i').classList.toggle('bi-eye');
        togglePasswordBtn.querySelector('i').classList.toggle('bi-eye-slash');
    });

    forgotPasswordBtn.addEventListener('click', () => {
        const username = prompt('Enter your username to reset your password:');
        if (username) {
            // In a real application, this would trigger a server-side password reset process
            alert('If an account with this username exists, a password reset email has been sent.');
        }
    });

    // Client-side form validation
    loginForm.addEventListener('invalid', (event) => {
        event.preventDefault();
    }, true);

    registerForm.addEventListener('invalid', (event) => {
        event.preventDefault();
    }, true);
    // Add CSRF token to forms
    document.querySelectorAll('form').forEach(form => {
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = 'csrf_token';
        csrfInput.value = csrfToken;
        form.appendChild(csrfInput);
    });
    const toggleRegisterBtn = document.createElement('button');
    toggleRegisterBtn.textContent = 'Create an account';
    toggleRegisterBtn.type = 'button';
    toggleRegisterBtn.style.marginTop = '10px';
    loginFormDiv.appendChild(toggleRegisterBtn);

    toggleRegisterBtn.addEventListener('click', () => {
        if (registerFormDiv.style.display === 'none') {
            registerFormDiv.style.display = 'block';
            loginFormDiv.style.display = 'none';
            toggleRegisterBtn.textContent = 'Back to Login';
        } else {
            registerFormDiv.style.display = 'none';
            loginFormDiv.style.display = 'block';
            toggleRegisterBtn.textContent = 'Create an account';
        }
    });

    // Check if user is already logged in
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
        showLoggedInContent(loggedInUser);
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = sanitizeInput(document.getElementById('username').value.trim());
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('remember-me').checked;
        const submittedToken = loginForm.querySelector('input[name="csrf_token"]').value;

        if (submittedToken !== csrfToken) {
            showError('Invalid form submission. Please try again.');
            csrfToken = generateCSRFToken();
            return;
        }

        if (!username || !password) {
            showError('Please enter both username and password.');
            return;
        }

        // Check for rate limiting
        if (loginAttempts[username] && loginAttempts[username].attempts >= MAX_LOGIN_ATTEMPTS) {
            const timeSinceLastAttempt = Date.now() - loginAttempts[username].lastAttempt;
            if (timeSinceLastAttempt < LOCKOUT_TIME) {
                showError(`Too many login attempts. Please try again in ${Math.ceil((LOCKOUT_TIME - timeSinceLastAttempt) / 60000)} minutes.`);
                return;
            } else {
                // Reset attempts after lockout period
                delete loginAttempts[username];
            }
        }

        const user = users.find(u => u.username === username && u.password === hashPassword(password));

        if (user) {
            if (rememberMe) {
                localStorage.setItem('loggedInUser', username);
            } else {
                sessionStorage.setItem('loggedInUser', username);
            }
            showLoggedInContent(username);
            startSessionTimer();
            // Reset login attempts on successful login
            delete loginAttempts[username];
        } else {
            // Increment login attempts
            if (!loginAttempts[username]) {
                loginAttempts[username] = { attempts: 1, lastAttempt: Date.now() };
            } else {
                loginAttempts[username].attempts++;
                loginAttempts[username].lastAttempt = Date.now();
            }
            showError('Invalid username or password');
        }
    });

    // registerForm.addEventListener('submit', (e) => {
    //     e.preventDefault();
    //     const newUsername = sanitizeInput(document.getElementById('new-username').value.trim());
    //     const newPassword = document.getElementById('new-password').value;
    //     const confirmPassword = document.getElementById('confirm-password').value;
    //     const submittedToken = registerForm.querySelector('input[name="csrf_token"]').value;

    //     if (submittedToken !== csrfToken) {
    //         showError('Invalid form submission. Please try again.');
    //         csrfToken = generateCSRFToken();
    //         return;
    //     }

    //     if (!newUsername || !newPassword || !confirmPassword) {
    //         showError('Please fill in all fields.');
    //         return;
    //     }

    //     if (!isPasswordStrong(newPassword)) {
    //         showError('Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character.');
    //         return;
    //     }

    //     if (newPassword !== confirmPassword) {
    //         showError('Passwords do not match.');
    //         return;
    //     }

    //     if (users.some(u => u.username === newUsername)) {
    //         showError('Username already exists.');
    //         return;
    //     }

    //     users.push({ username: newUsername, password: hashPassword(newPassword) });
    //     localStorage.setItem('users', JSON.stringify(users));
    //     showError('Registration successful. Please log in.', 'success');
    //     registerForm.reset();
    // });

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newUsername = sanitizeInput(document.getElementById('new-username').value.trim());
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const submittedToken = registerForm.querySelector('input[name="csrf_token"]').value;
    
        if (submittedToken !== csrfToken) {
            showError('Invalid form submission. Please try again.');
            csrfToken = generateCSRFToken();
            return;
        }
    
        if (!newUsername || !newPassword || !confirmPassword) {
            showError('Please fill in all fields.');
            return;
        }
    
        if (!isPasswordStrong(newPassword)) {
            showError('Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character.');
            return;
        }
    
        if (newPassword !== confirmPassword) {
            showError('Passwords do not match.');
            return;
        }
    
        if (users.some(u => u.username === newUsername)) {
            showError('Username already exists.');
            return;
        }
    
        users.push({ username: newUsername, password: hashPassword(newPassword) });
        localStorage.setItem('users', JSON.stringify(users));
        
        // Clear the form
        registerForm.reset();
    
        // Hide register form and show login form
        registerFormDiv.style.display = 'none';
        loginFormDiv.style.display = 'block';
    
        // Update the toggle button text
        toggleRegisterBtn.textContent = 'Create an account';
    
        // Show success message
        showError('Registration successful. Please log in.', 'success');
    
        // Optional: Clear success message after 3 seconds
        setTimeout(() => {
            const errorMessage = document.getElementById('error-message');
            if (errorMessage) {
                errorMessage.style.display = 'none';
            }
        }, 3000);
    });
    
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('loggedInUser');
        sessionStorage.removeItem('loggedInUser');
        loginFormDiv.style.display = 'block';
        loggedInContent.style.display = 'none';
        registerFormDiv.style.display = 'none';
        toggleRegisterBtn.textContent = 'Create an account';
        toggleRegisterBtn.style.display = 'block';
        loginForm.reset();
        registerForm.reset();
    });

    function showLoggedInContent(username) {
        loginFormDiv.style.display = 'none';
        registerFormDiv.style.display = 'none';
        loggedInContent.style.display = 'block';
        userNameSpan.textContent = sanitizeInput(username);
        toggleRegisterBtn.style.display = 'none';
        localStorage.setItem('currentUser', username);
    }

    function startSessionTimer() {
        clearTimeout(sessionTimer);
        sessionTimer = setTimeout(() => {
            logoutBtn.click();
            showError('Your session has expired. Please log in again.');
        }, SESSION_TIMEOUT);
    }

    // Reset session timer on user activity
    document.addEventListener('click', startSessionTimer);
    document.addEventListener('keypress', startSessionTimer);

    function showError(message, type = 'error') {
        errorMessage.textContent = message;
        errorMessage.className = type;
        errorMessage.style.display = 'block';
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 3000);
    }
});
