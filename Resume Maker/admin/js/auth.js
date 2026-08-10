/**
 * Admin Authentication Guard and Login Logic
 */

const ADMIN_CREDENTIALS = {
    email: 'shayanresumaker@gmail.com',
    password: 'shayankhan@0333'
};

// Auto-run guard on load
function checkAdminAuth() {
    const isAuth = localStorage.getItem('isAdminAuthenticated');
    const isLoginPage = window.location.pathname.endsWith('login.html');
    
    if (!isAuth && !isLoginPage) {
        // Not authenticated and trying to access protected route (Admin Middleware)
        window.location.replace('../index.html');
    } else if (isAuth && isLoginPage) {
        // Already authenticated and trying to access login
        window.location.replace('dashboard.html');
    }
}

// Run immediately
checkAdminAuth();

// Attach login handlers when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('adminLoginForm');
    const errorMsg = document.getElementById('errorMsg');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('adminEmail').value.trim();
            const password = document.getElementById('adminPassword').value.trim();

            if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
                // Success
                localStorage.setItem('isAdminAuthenticated', 'true');
                window.location.replace('dashboard.html');
            } else {
                // Fail
                errorMsg.style.display = 'block';
                document.getElementById('adminPassword').value = ''; // clear password
            }
        });
    }

    // Attach logout handler if dashboard
    const logoutBtn = document.getElementById('adminLogoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('isAdminAuthenticated');
            window.location.replace('login.html');
        });
    }
});
