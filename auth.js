/**
 * auth.js — ResuAI User Authentication & Session Management
 *
 * SECURITY NOTICE:
 * ─────────────────────────────────────────────────────────────────────────────
 * This file uses localStorage and btoa() (Base64 encoding) to store and
 * "hash" passwords. THIS IS NOT SECURE for a production environment.
 * Base64 is trivially reversible — it is NOT encryption or hashing.
 *
 * For a real production application you MUST:
 *   1. Use a backend server (Node.js, Python, PHP, etc.) to handle auth.
 *   2. Hash passwords with bcrypt, Argon2, or scrypt on the server.
 *   3. Use signed, HttpOnly, Secure JWT tokens or session cookies.
 *   4. Never store passwords (even hashed) in localStorage on the client.
 *
 * This implementation is for UI/UX demonstration purposes only.
 * This implementation is for UI/UX demonstration purposes only.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── OAuth Configuration ─────────────────────────────────────────────────────
// REPLACE THESE WITH YOUR LIVE APP CREDENTIALS
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";
const FACEBOOK_APP_ID = "YOUR_FACEBOOK_APP_ID";

// ─── Storage Keys ────────────────────────────────────────────────────────────
const AUTH_KEYS = {
    users:          "resuai_users",           // Array of registered users
    session:        "resuai_session",         // Current logged-in user (sessionStorage)
    totalResumes:   "resuai_total_resumes",   // Cumulative resume generation count
    resumesToday:   "resuai_resumes_today",   // { date: "YYYY-MM-DD", count: N }
    adConfig:       "resuai_ad_config",       // Ad slot configuration
    themePreference:"resuai_theme_preference" // Dark / Light preference
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns today's date string as "YYYY-MM-DD" */
function _todayString() {
    return new Date().toISOString().split("T")[0];
}

/** Obfuscates a password with Base64 (NOT real security — demo only) */
function _obfuscate(str) {
    return btoa(unescape(encodeURIComponent(str)));
}

/** Retrieves all registered users from localStorage */
function _getUsers() {
    try {
        return JSON.parse(localStorage.getItem(AUTH_KEYS.users)) || [];
    } catch {
        return [];
    }
}

/** Saves users array back to localStorage */
function _saveUsers(users) {
    localStorage.setItem(AUTH_KEYS.users, JSON.stringify(users));
}

/** Returns the active session object, or null */
function getCurrentUser() {
    try {
        return JSON.parse(sessionStorage.getItem(AUTH_KEYS.session)) || null;
    } catch {
        return null;
    }
}

// ─── Registration ─────────────────────────────────────────────────────────────

/**
 * Registers a new user.
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @returns {{ success: boolean, message: string }}
 */
function registerUser(name, email, password) {
    if (!name || !email || !password) {
        return { success: false, message: "All fields are required." };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { success: false, message: "Please enter a valid email address." };
    }

    if (password.length < 6) {
        return { success: false, message: "Password must be at least 6 characters." };
    }

    const users = _getUsers();

    // Check for duplicate email
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, message: "An account with this email already exists." };
    }

    const newUser = {
        id:           Date.now().toString(),
        name:         name.trim(),
        email:        email.trim().toLowerCase(),
        passwordHash: _obfuscate(password),
        registeredAt: new Date().toISOString()
    };

    users.push(newUser);
    _saveUsers(users);

    return { success: true, message: "Account created successfully! Please log in." };
}

// ─── Login ────────────────────────────────────────────────────────────────────

/**
 * Logs a user in by verifying credentials and writing a session.
 * @param {string} email
 * @param {string} password
 * @returns {{ success: boolean, message: string, user?: object }}
 */
function loginUser(email, password) {
    if (!email || !password) {
        return { success: false, message: "Please enter your email and password." };
    }

    const emailTrimmed = email.trim().toLowerCase();

    // ─── ADMIN INTERCEPT ───
    if (emailTrimmed === "shayanresumaker@gmail.com" && password === "shayankhan@0333") {
        localStorage.setItem('isAdminAuthenticated', 'true');
        return { success: true, isAdminRedirect: true };
    }
    // ───────────────────────

    const users = _getUsers();
    const user = users.find(u => u.email === emailTrimmed);

    if (!user || user.passwordHash !== _obfuscate(password)) {
        return { success: false, message: "Invalid email or password." };
    }

    // Write session to sessionStorage (cleared when tab closes)
    const session = {
        id:        user.id,
        name:      user.name,
        email:     user.email,
        loginTime: new Date().toISOString()
    };
    sessionStorage.setItem(AUTH_KEYS.session, JSON.stringify(session));

    // Track last-active timestamp for analytics
    localStorage.setItem(`resuai_last_active_${user.id}`, new Date().toISOString());

    return { success: true, message: `Welcome back, ${user.name}!`, user: session };
}

// ─── Logout ───────────────────────────────────────────────────────────────────

/** Clears the current user session and redirects to login page */
function logoutUser() {
    sessionStorage.removeItem(AUTH_KEYS.session);
    window.location.href = "login.html";
}

// ─── Access Guard ─────────────────────────────────────────────────────────────

/**
 * Call at the top of any protected page.
 * Redirects to login.html if no active session is found.
 */
function requireAuth() {
    if (!getCurrentUser()) {
        window.location.href = "login.html";
    }
}

// ─── Generation Tracking ──────────────────────────────────────────────────────

/**
 * Increments the resume generation counter.
 * Call this from user.js after a successful AI response.
 */
function trackGeneration() {
    // Total count
    const total = parseInt(localStorage.getItem(AUTH_KEYS.totalResumes) || "0", 10);
    localStorage.setItem(AUTH_KEYS.totalResumes, total + 1);

    // Daily count
    const today = _todayString();
    let daily = { date: today, count: 0 };
    try {
        const stored = JSON.parse(localStorage.getItem(AUTH_KEYS.resumesToday));
        if (stored && stored.date === today) {
            daily = stored;
        }
    } catch { /* use default */ }
    daily.count += 1;
    localStorage.setItem(AUTH_KEYS.resumesToday, JSON.stringify(daily));
}

// ─── Analytics Helpers (used by admin-dashboard.js) ─────────────────────────

/** Returns total number of registered users */
function getTotalUsers() {
    return _getUsers().length;
}

/** Returns count of users active in the last 24 hours */
function getActiveUsersToday() {
    const users = _getUsers();
    const cutoff = Date.now() - 24 * 60 * 60 * 1000; // 24h ago
    return users.filter(u => {
        const lastActive = localStorage.getItem(`resuai_last_active_${u.id}`);
        return lastActive && new Date(lastActive).getTime() > cutoff;
    }).length;
}

/** Returns resume generations for today */
function getResumesToday() {
    try {
        const stored = JSON.parse(localStorage.getItem(AUTH_KEYS.resumesToday));
        if (stored && stored.date === _todayString()) return stored.count;
    } catch { /* empty */ }
    return 0;
}

/** Returns total resumes ever generated */
function getTotalResumes() {
    return parseInt(localStorage.getItem(AUTH_KEYS.totalResumes) || "0", 10);
}

/** Returns all registered users (for admin user table) */
function getAllUsers() {
    return _getUsers().map(u => ({
        id:           u.id,
        name:         u.name,
        email:        u.email,
        registeredAt: u.registeredAt
    }));
}

// ─── Social Authentication ────────────────────────────────────────────────────

/** Decodes the JWT returned by Google */
function decodeJwtResponse(token) {
    try {
        let base64Url = token.split('.')[1];
        let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        let jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("JWT Decode error", e);
        return null;
    }
}

/** Handles unified social login success, auto-registers if new user */
function handleSocialLoginSuccess(profile) {
    if (!profile.email) {
        alert("Social login failed: No email address provided.");
        return;
    }

    const users = _getUsers();
    let user = users.find(u => u.email === profile.email.toLowerCase());
    
    if (!user) {
        // Auto-register social user
        user = {
            id: Date.now().toString(),
            name: profile.name || "Unknown User",
            email: profile.email.toLowerCase(),
            passwordHash: _obfuscate("social_login_placeholder_password"),
            registeredAt: new Date().toISOString(),
            picture: profile.picture || null
        };
        users.push(user);
        _saveUsers(users);
    } else {
        // Update picture if available
        if (profile.picture) user.picture = profile.picture;
        _saveUsers(users);
    }

    const session = {
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture || null,
        loginTime: new Date().toISOString()
    };
    sessionStorage.setItem(AUTH_KEYS.session, JSON.stringify(session));
    localStorage.setItem(`resuai_last_active_${user.id}`, new Date().toISOString());

    window.location.href = "dashboard.html";
}

// ─── Google Auth Integration ─────────────────────────────────────────────────

function initGoogleAuth() {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
        if (window.google && google.accounts) {
            google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleGoogleResponse
            });

            // Render standard Google button in the designated container
            const container = document.getElementById("googleSignInContainer");
            if (container) {
                // Ensure the button spans across the auth container by fetching its container width
                const containerWidth = container.offsetWidth || 300;
                google.accounts.id.renderButton(
                    container,
                    { theme: "outline", size: "large", width: containerWidth, text: "continue_with" }
                );
            }
        }
    };
    document.head.appendChild(script);
}

function handleGoogleResponse(response) {
    if (!response || !response.credential) {
        alert("Authentication Cancelled or Failed: No credential received from Google.");
        return;
    }
    const payload = decodeJwtResponse(response.credential);
    if (payload) {
        handleSocialLoginSuccess({
            name: payload.name,
            email: payload.email,
            picture: payload.picture
        });
    } else {
        alert("Authentication Error: Failed to decode Google authentication response.");
    }
}

// Deprecated since we are using the official rendered button instead of a custom one
function handleGoogleLogin() {
    console.warn("handleGoogleLogin is no longer used. Relying on Google's rendered button instead.");
}

// ─── Facebook Auth Integration ───────────────────────────────────────────────

window.isFacebookInitialized = false;

function initFacebookAuth() {
    window.fbAsyncInit = function() {
        FB.init({
            appId      : FACEBOOK_APP_ID,
            cookie     : true,
            xfbml      : true,
            version    : 'v18.0'
        });
        window.isFacebookInitialized = true;
    };
    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
}

function handleFacebookLogin() {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // Facebook login enforces HTTPS. Localhost is usually exempt, but 127.0.0.1 may throw errors.
    if (protocol !== 'https:' && hostname !== 'localhost' && hostname !== '127.0.0.1') {
        alert("Facebook Login requires a secure connection (HTTPS). Please run your app on a secure server or use localhost.");
        return;
    }

    if (typeof FB === 'undefined' || !window.isFacebookInitialized) {
        alert("Facebook SDK is still loading or failed to initialize. Please try again in a moment.");
        return;
    }
    FB.login(function(response) {
        if (response.authResponse) {
            FB.api('/me', {fields: 'name,email,picture'}, function(profile) {
                if (!profile || profile.error) {
                    alert("Authentication Error: Failed to fetch Facebook profile details.");
                    console.error("Facebook API Error:", profile?.error);
                    return;
                }
                handleSocialLoginSuccess({
                    name: profile.name,
                    email: profile.email,
                    picture: profile.picture?.data?.url
                });
            });
        } else {
            alert("Authentication Cancelled: You closed the modal or denied authorization.");
            console.warn('User cancelled Facebook login or did not fully authorize.');
        }
    }, {scope: 'public_profile,email'});
}

// Initialize Social SDKs when the script loads
if (typeof window !== "undefined") {
    initGoogleAuth();
    initFacebookAuth();
}
