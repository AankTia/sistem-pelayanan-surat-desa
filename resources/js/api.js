import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
    baseURL: '/api/v1',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Add token to requests if it exists
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle responses and errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // If unauthorized, clear token and redirect to login
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('admin_user');

            // Only redirect if not already on login page
            if (!window.location.pathname.includes('/admin/login')) {
                window.location.href = '/admin/login';
            }
        }
        return Promise.reject(error);
    }
);

// API endpoints
export const authAPI = {
    login: async (email, password) => {
        const response = await api.post('/login', { email, password });
        return response.data;
    },

    logout: async () => {
        const response = await api.post('/logout');
        return response.data;
    },

    me: async () => {
        const response = await api.get('/me');
        return response.data;
    },
};

export default api;
