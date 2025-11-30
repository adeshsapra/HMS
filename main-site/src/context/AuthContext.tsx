import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import authService, { type User } from '../services/authService';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string, remember?: boolean) => Promise<void>;
    register: (data: {
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
        password: string;
        password_confirmation: string;
    }) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = () => {
            const storedUser = authService.getUser();
            const token = authService.getToken();
            if (storedUser && token) {
                setUser(storedUser);
            }
            setIsLoading(false);
        };
        initAuth();
    }, []);

    const login = async (email: string, password: string, remember: boolean = true) => {
        const response = await authService.login({ email, password }, remember);
        setUser(response.user);
    };

    const register = async (data: {
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
        password: string;
        password_confirmation: string;
    }) => {
        const response = await authService.register(data);
        setUser(response.user);
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
    };

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
        authService.setUser(updatedUser);
    };

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
