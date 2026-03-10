/* api.js - Central API utility for GoHabit */

const API_CONFIG = {
    BASE_URL: `${window.location.origin}/api`,
    TOKEN_KEY: 'gohabit_token'
};

console.log('GoHabitAPI: Initialized with BASE_URL', API_CONFIG.BASE_URL);

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
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Something went wrong');
            }

            return result;
        } catch (error) {
            console.error('API Request Error:', error);
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
