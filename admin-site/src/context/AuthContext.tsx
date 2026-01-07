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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const profileResponse = await apiService.getProfile();
      if (profileResponse.status && profileResponse.user) {
        // Strict Security: Patients are NEVER allowed in the admin panel
        const roleName = profileResponse.user.role?.name?.toLowerCase();
        if (roleName === 'patient') {
          console.error('Access denied: Patients cannot access the admin panel.');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          setUser(null);
          setLoading(false);
          return;
        }

        setUser(profileResponse.user);

        // Load permissions
        try {
          const permResponse = await apiService.getCurrentUserPermissions();
          if (permResponse.status && permResponse.permissions) {
            setPermissions(permResponse.permissions);
          }
        } catch (error) {
          console.error('Failed to load permissions:', error);
        }
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login(email, password);
      if (response.status && response.user) {
        // Strict Security: Patients are NEVER allowed in the admin panel
        const roleName = response.user.role?.name?.toLowerCase();
        if (roleName === 'patient') {
          throw new Error('Access Restricted: Administrative panel access is limited to authorized clinical and operational staff. Please use the Patient Portal for all personal healthcare management.');
        }

        setUser(response.user);
        // Load permissions after successful login
        try {
          const permResponse = await apiService.getCurrentUserPermissions();
          if (permResponse.status && permResponse.permissions) {
            setPermissions(permResponse.permissions);
            // Return permissions so caller can use them immediately
            return permResponse.permissions;
          }
        } catch (error) {
          console.error('Failed to load permissions:', error);
        }
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setPermissions([]);
    }
  };

  const refreshUser = async () => {
    await loadUser();
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

