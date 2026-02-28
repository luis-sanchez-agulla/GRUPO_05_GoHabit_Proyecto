/**
 * api.js
 * Script temporal para conectar el frontend con el backend de Next.js.
 * Auto-registra o auto-loguea un usuario de prueba para obtener un Token JWT.
 */

const API_BASE_URL = 'http://localhost:3000/api';
let authToken = localStorage.getItem('gohabit_token');

// Configuración del usuario de prueba
const testUser = {
    email: 'test_user@gohabit.dev',
    username: 'test_user_123',
    password: 'password123',
    firstName: 'Alex'
};

/**
 * Asegura que tengamos un token JWT válido antes de hacer peticiones.
 */
async function ensureAuthenticated() {
    if (authToken) return authToken;

    try {
        // 1. Intentar hacer login
        let res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testUser.email, password: testUser.password })
        });

        let data = await res.json();

        if (res.ok && data.data && data.data.token) {
            authToken = data.data.token;
            localStorage.setItem('gohabit_token', authToken);
            return authToken;
        }

        // 2. Si el login falla (ej. usuario no existe), intentamos registrarlo
        res = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });

        data = await res.json();

        if (res.ok && data.data && data.data.token) {
            authToken = data.data.token;
            localStorage.setItem('gohabit_token', authToken);
            return authToken;
        }

        console.error('Error auto-autenticando:', data);
        return null;

    } catch (err) {
        console.error('Error de red al auto-autenticar:', err);
        return null;
    }
}

/**
 * Wrapper para hacer peticiones fetch al API con el token JWT inyectado.
 */
async function fetchApi(endpoint, options = {}) {
    const token = await ensureAuthenticated();

    if (!token) {
        throw new Error('No se pudo autenticar al usuario de prueba');
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...(options.headers || {})
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Error en la petición API');
    }

    return data;
}

// Inicializar la autenticación nada más cargar el script (opcional pero acelera)
ensureAuthenticated().catch(console.error);

// Agregarlo a la ventana global
window.fetchApi = fetchApi;
window.gohabitTestUser = testUser;
