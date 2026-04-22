/* api.js - Central API utility for GoHabit */

const API_CONFIG = {
    // Robust detection: if we are on localhost, use localhost. If on IP, use IP.
    BASE_URL: `${window.location.origin}/api`,
    TOKEN_KEY: 'gohabit_token',
    USER_KEY: 'gohabit_user'
};

// Help debug sync: Log origin and connectivity
console.log('GoHabitAPI: 🚀 Initializing...', {
    origin: window.location.origin,
    api_url: API_CONFIG.BASE_URL,
    device: navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'
});

const api = {
    setToken(token) {
        localStorage.setItem(API_CONFIG.TOKEN_KEY, token);
    },

    getToken() {
        return localStorage.getItem(API_CONFIG.TOKEN_KEY);
    },

    clearToken() {
        localStorage.removeItem(API_CONFIG.TOKEN_KEY);
    },

    setSession(token, user) {
        this.setToken(token);
        if (user) {
            localStorage.setItem(API_CONFIG.USER_KEY, JSON.stringify(user));
        }
    },

    getSessionUser() {
        try {
            const raw = localStorage.getItem(API_CONFIG.USER_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    },

    clearSession() {
        this.clearToken();
        localStorage.removeItem(API_CONFIG.USER_KEY);
    },

    async request(endpoint, options = {}) {
        const url = `${API_CONFIG.BASE_URL}${endpoint}`;
        const token = this.getToken();

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers
        };

        try {
            const response = await fetch(url, config);
            
            // Check for CORS or Network issues explicitly
            if (response.status === 0) {
                 console.error('API Network Error: Possible CORS or disconnected server.');
            }

            const result = await response.json();

            if (!response.ok) {
                const err = new Error(result?.error?.message || result?.message || 'Something went wrong');
                err.status = response.status;
                err.details = result?.error?.details || null;
                throw err;
            }

            return result;
        } catch (error) {
            console.group('GoHabitAPI: ❌ Request Failed');
            console.error('Endpoint:', endpoint);
            console.error('Error:', error.message);
            if (error.status === 401) console.warn('Authentication expired or invalid.');
            console.groupEnd();
            throw error;
        }
    },

    get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    },

    post(endpoint, body, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(body)
        });
    },

    put(endpoint, body, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(body)
        });
    },

    delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }
};

window.GoHabitAPI = api;
