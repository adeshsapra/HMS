import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiService from '@/services/api';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role_id?: number;
  role?: {
    id: number;
    name: string;
    permissions?: Permission[];
  };
  doctor?: any;
  staff?: any;
  patient?: any;
}

interface Permission {
  id: number;
  name: string;
  slug: string;
  module?: string;
  description?: string;
}

interface AuthContextType {
  user: User | null;
  permissions: string[];
  loading: boolean;
  login: (email: string, password: string) => Promise<string[] | undefined>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Global singleton to prevent duplicate initial loads (StrictMode)
let isInitialLoadPending = false;
let initialLoadPromise: Promise<void> | null = null;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [permissions, setPermissions] = useState<string[]>(() => {
    const savedPerms = localStorage.getItem('permissions');
    try {
      return savedPerms ? JSON.parse(savedPerms) : [];
    } catch (e) {
      return [];
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          if (isMounted) setLoading(false);
          return;
        }

        // We already initialized user/permissions from localStorage in useState initializers.
        // Here we just verify the profile to ensure the token is still valid.
        const profileResponse = await apiService.getProfile();

        if (profileResponse.status && profileResponse.user && isMounted) {
          const roleName = profileResponse.user.role?.name?.toLowerCase();
          if (roleName === 'patient') {
            handleCleanLogout();
          } else {
            setUser(profileResponse.user);
            localStorage.setItem('user', JSON.stringify(profileResponse.user));

            try {
              const permResponse = await apiService.getCurrentUserPermissions();
              if (permResponse.status && permResponse.permissions && isMounted) {
                setPermissions(permResponse.permissions);
                localStorage.setItem('permissions', JSON.stringify(permResponse.permissions));
              }
            } catch (error) {
              console.error('Failed to update permissions from API:', error);
            }
          }
        } else if (isMounted) {
          handleCleanLogout();
        }
      } catch (error: any) {
        console.error('Session verification failed:', error);
        const isAuthError = error.message?.toLowerCase().includes('unauthorized') ||
          error.message?.toLowerCase().includes('unauthenticated');
        if (isAuthError && isMounted) {
          handleCleanLogout();
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const handleCleanLogout = () => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      localStorage.removeItem('permissions');
      setUser(null);
      setPermissions([]);
    };

    verifySession();

    return () => { isMounted = false; };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login(email, password);
      if (response.status && response.user) {
        const roleName = response.user.role?.name?.toLowerCase();
        if (roleName === 'patient') {
          throw new Error('Access Restricted: Administrative panel access is limited to authorized clinical and operational staff.');
        }

        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
        try {
          const permResponse = await apiService.getCurrentUserPermissions();
          if (permResponse.status && permResponse.permissions) {
            setPermissions(permResponse.permissions);
            localStorage.setItem('permissions', JSON.stringify(permResponse.permissions));
            return permResponse.permissions;
          }
        } catch (error) {
          console.error('Failed to load permissions:', error);
        }
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) { throw error; }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
      setPermissions([]);
    }
  };

  const refreshUser = async () => {
    try {
      const profileResponse = await apiService.getProfile();
      if (profileResponse.status && profileResponse.user) {
        const roleName = profileResponse.user.role?.name?.toLowerCase();
        if (roleName === 'patient') {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          localStorage.removeItem('permissions');
          setUser(null);
          setPermissions([]);
          return;
        }

        setUser(profileResponse.user);
        localStorage.setItem('user', JSON.stringify(profileResponse.user));
        try {
          const permResponse = await apiService.getCurrentUserPermissions();
          if (permResponse.status && permResponse.permissions) {
            setPermissions(permResponse.permissions);
            localStorage.setItem('permissions', JSON.stringify(permResponse.permissions));
          }
        } catch (error) {
          console.error('Failed to load permissions:', error);
        }
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!permission || !permissions || permissions.length === 0) {
      return false;
    }
    // Strict check: permission must exactly match (case-sensitive)
    return permissions.includes(permission);
  };

  const hasAnyPermission = (perms: string[]): boolean => {
    return perms.some(perm => permissions.includes(perm));
  };

  const hasAllPermissions = (perms: string[]): boolean => {
    return perms.every(perm => permissions.includes(perm));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        permissions,
        loading,
        login,
        logout,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

