// Authentication related functionality

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        // User is logged in
        document.getElementById('loginBtn').style.display = 'none';
        document.getElementById('signupBtn').style.display = 'none';
        document.getElementById('userProfile').style.display = 'flex';
        document.getElementById('username').textContent = user.name;
    }
    
    // Login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            // Simple validation
            if (!email || !password) {
                alert('Please fill in all fields');
                return;
            }
            
            // Simulate login (in a real app, this would be an API call)
            // For demo purposes, we'll just check if the user exists in localStorage
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                // Login successful
                localStorage.setItem('user', JSON.stringify(user));
                
                // Update UI
                document.getElementById('loginBtn').style.display = 'none';
                document.getElementById('signupBtn').style.display = 'none';
                document.getElementById('userProfile').style.display = 'flex';
                document.getElementById('username').textContent = user.name;
                
                // Close modal
                closeLoginModal();
                
                // Refresh page
                location.reload();
            } else {
                alert('Invalid email or password');
            }
        });
    }
    
    // Signup form submission
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('signupConfirmPassword').value;
            
            // Simple validation
            if (!name || !email || !password || !confirmPassword) {
                alert('Please fill in all fields');
                return;
            }
            
            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }
            
            // Get existing users or initialize empty array
            const users = JSON.parse(localStorage.getItem('users')) || [];
            
            // Check if user already exists
            if (users.some(user => user.email === email)) {
                alert('User with this email already exists');
                return;
            }
            
            // Create new user
            const newUser = {
                id: Date.now().toString(),
                name,
                email,
                password,
                createdAt: new Date().toISOString()
            };
            
            // Add user to array
            users.push(newUser);
            
            // Save to localStorage
            localStorage.setItem('users', JSON.stringify(users));
            
            // Auto login
            localStorage.setItem('user', JSON.stringify(newUser));
            
            // Update UI
            document.getElementById('loginBtn').style.display = 'none';
            document.getElementById('signupBtn').style.display = 'none';
            document.getElementById('userProfile').style.display = 'flex';
            document.getElementById('username').textContent = newUser.name;
            
            // Close modal
            closeSignupModal();
            
            // Refresh page
            location.reload();
        });
    }
});

// Logout function
function logout() {
    // Remove user from localStorage
    localStorage.removeItem('user');
    
    // Update UI
    document.getElementById('loginBtn').style.display = 'inline-block';
    document.getElementById('signupBtn').style.display = 'inline-block';
    document.getElementById('userProfile').style.display = 'none';
    
    // Refresh page
    location.reload();
}