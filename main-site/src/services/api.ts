import axios, { type AxiosInstance, type AxiosError } from 'axios';

// Create axios instance with base configuration
const api: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: false,
});

// Request interceptor to add auth token
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

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401 && !error.config?.url?.includes('/login')) {
            // Unauthorized - clear token and redirect to login
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            window.location.href = '/sign-in';
        }
        return Promise.reject(error);
    }
);

// API Helper Methods for Main Site (Public endpoints)
export const departmentAPI = {
    getAll: (page?: number, perPage?: number) => {
        const params = new URLSearchParams();
        if (page) params.append('page', page.toString());
        if (perPage) params.append('per_page', perPage.toString());
        return api.get(`/public/departments${params.toString() ? '?' + params.toString() : ''}`);
    },
    getById: (id: number) => api.get(`/public/departments/${id}`),
};

export const serviceAPI = {
    getAll: (page?: number, perPage?: number) => {
        const params = new URLSearchParams();
        if (page) params.append('page', page.toString());
        if (perPage) params.append('per_page', perPage.toString());
        return api.get(`/public/services${params.toString() ? '?' + params.toString() : ''}`);
    },
    getById: (id: number) => api.get(`/public/services/${id}`),
};

export const doctorAPI = {
    getAll: (page?: number, perPage?: number) => {
        const params = new URLSearchParams();
        if (page) params.append('page', page.toString());
        if (perPage) params.append('per_page', perPage.toString());
        return api.get(`/public/doctors${params.toString() ? '?' + params.toString() : ''}`);
    },
    getById: (id: number | string) => api.get(`/public/doctors/${id}`),
};

export const appointmentAPI = {
    create: (data: any) => api.post('/public/appointments', data),
};

export default api;

