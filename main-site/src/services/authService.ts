import api from './api';

export interface RegisterData {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    role_id: number;
    role?: {
        id: number;
        name: string;
    };
}

export interface AuthResponse {
    status: boolean;
    message: string;
    token: string;
    user: User;
}

class AuthService {
    async register(data: RegisterData): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/register', data);
        if (response.data.token) {
            this.setToken(response.data.token);
            this.setUser(response.data.user);
        }
        return response.data;
    }

    async login(data: LoginData, remember: boolean = true): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/login', data);
        if (response.data.token) {
            this.setToken(response.data.token, remember);
            this.setUser(response.data.user);
        }
        return response.data;
    }

    async logout(): Promise<void> {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.clearAuth();
            // Also clear token from sessionStorage if present
            sessionStorage.removeItem('auth_token');
        }
    }

    async getProfile(): Promise<User> {
        const response = await api.get<{ status: boolean; user: User }>('/profile');
        return response.data.user;
    }

    setToken(token: string, remember: boolean = true): void {
        if (remember) {
            localStorage.setItem('auth_token', token);
        } else {
            sessionStorage.setItem('auth_token', token);
        }
    }

    getToken(): string | null {
        return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    }

    setUser(user: User): void {
        const remember = !!localStorage.getItem('auth_token');
        if (remember) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            sessionStorage.setItem('user', JSON.stringify(user));
        }
    }

    getUser(): User | null {
        const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    clearAuth(): void {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('user');
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }
}

export default new AuthService();
