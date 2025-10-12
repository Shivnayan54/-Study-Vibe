// Admin authentication JavaScript

// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    const loginBtn = document.getElementById('loginBtn');
    
    // Hide previous error
    errorMessage.style.display = 'none';
    
    // Disable login button
    loginBtn.disabled = true;
    loginBtn.textContent = 'Logging in...';
    
    try {
        const auth = window.firebaseAuth;
        await auth.signInWithEmailAndPassword(email, password);
        
        // Redirect to admin dashboard
        window.location.href = 'admin.html';
    } catch (error) {
        console.error('Login error:', error);
        
        let errorText = 'Invalid email or password';
        
        switch (error.code) {
            case 'auth/user-not-found':
                errorText = 'No admin account found with this email';
                break;
            case 'auth/wrong-password':
                errorText = 'Incorrect password';
                break;
            case 'auth/invalid-email':
                errorText = 'Invalid email format';
                break;
            case 'auth/user-disabled':
                errorText = 'This account has been disabled';
                break;
            case 'auth/too-many-requests':
                errorText = 'Too many failed attempts. Please try again later';
                break;
        }
        
        errorMessage.textContent = errorText;
        errorMessage.style.display = 'block';
        
        // Re-enable login button
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login';
    }
});

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', () => {
    const auth = window.firebaseAuth;
    
    if (auth) {
        auth.onAuthStateChanged((user) => {
            if (user) {
                // User is already logged in, redirect to admin
                window.location.href = 'admin.html';
            }
        });
    }
});

