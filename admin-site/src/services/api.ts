const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000/api';

interface ApiResponse<T> {
  status: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}

class ApiService {
  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getAuthToken();
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      // Handle non-JSON responses
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || 'An error occurred');
      }

      if (!response.ok) {
        const errorMessage = data.message || data.error || 'An error occurred';
        throw new Error(errorMessage);
      }

      return data;
    } catch (error: any) {
      // If it's already our Error object, rethrow it
      if (error instanceof Error) {
        throw error;
      }
      // Otherwise, wrap it
      throw new Error(error.message || 'Network error occurred');
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Auth methods
  async login(email: string, password: string) {
    try {
      const response = await this.post<{ token: string; user: any }>('/login', {
        email,
        password,
      });
      if (response.status && response.token) {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        return response;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed. Please check your credentials.';
      throw new Error(errorMessage);
    }
  }

  async logout() {
    await this.post('/logout');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  async getProfile() {
    return this.get<any>('/profile');
  }

  async updateProfile(data: { name?: string; email?: string; phone?: string }) {
    return this.put<any>('/profile', data);
  }

  async changePassword(currentPassword: string, newPassword: string, confirmPassword: string) {
    return this.post<any>('/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirmation: confirmPassword,
    });
  }

  async getCurrentUserPermissions() {
    return this.get<string[]>('/user/permissions');
  }

  // Role methods
  async getRoles() {
    return this.get<any[]>('/roles');
  }

  async getRole(id: number) {
    return this.get<any>(`/roles/${id}`);
  }

  async createRole(data: { name: string; description?: string; permissions?: number[] }) {
    return this.post<any>('/roles', data);
  }

  async updateRole(id: number, data: { name: string; description?: string; permissions?: number[] }) {
    return this.put<any>(`/roles/${id}`, data);
  }

  async deleteRole(id: number) {
    return this.delete<any>(`/roles/${id}`);
  }

  async assignPermissionsToRole(roleId: number, permissionIds: number[]) {
    return this.post<any>(`/roles/${roleId}/assign-permissions`, { permissions: permissionIds });
  }

  // Permission methods
  async getPermissions(module?: string) {
    const endpoint = module ? `/permissions?module=${module}` : '/permissions';
    return this.get<any[]>(endpoint);
  }

  async getPermission(id: number) {
    return this.get<any>(`/permissions/${id}`);
  }

  async createPermission(data: { name: string; module?: string; description?: string }) {
    return this.post<any>('/permissions', data);
  }

  async updatePermission(id: number, data: { name: string; module?: string; description?: string }) {
    return this.put<any>(`/permissions/${id}`, data);
  }

  async deletePermission(id: number) {
    return this.delete<any>(`/permissions/${id}`);
  }

  // User-Role methods
  async getUserRoles() {
    return this.get<any[]>('/user-roles');
  }

  async createUser(data: { name: string; email: string; phone?: string; password: string; role_id: number }) {
    return this.post<any>('/users', data);
  }

  async assignRoleToUser(userId: number, roleId: number) {
    return this.post<any>(`/users/${userId}/assign-role`, { role_id: roleId });
  }

  async getUserPermissions(userId: number) {
    return this.get<any[]>(`/users/${userId}/permissions`);
  }

  async getUsersByRole(roleId: number) {
    return this.get<any[]>(`/roles/${roleId}/users`);
  }

  // Doctor methods
  async getDoctors() {
    return this.get<any[]>('/doctors');
  }

  async getDoctor(id: number) {
    return this.get<any>(`/doctors/${id}`);
  }

  async createDoctor(data: FormData) {
    const token = this.getAuthToken();
    const url = `${API_BASE_URL}/doctors`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: data,
    });

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to create doctor');
    }
    return responseData;
  }

  async updateDoctor(id: number, data: FormData) {
    const token = this.getAuthToken();
    const url = `${API_BASE_URL}/doctors/${id}`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: data,
    });

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to update doctor');
    }
    return responseData;
  }

  async deleteDoctor(id: number) {
    return this.delete<any>(`/doctors/${id}`);
  }

  // Staff methods
  async getStaff() {
    return this.get<any[]>('/staff');
  }

  async getStaffMember(id: number) {
    return this.get<any>(`/staff/${id}`);
  }

  async createStaff(data: FormData) {
    const token = this.getAuthToken();
    const url = `${API_BASE_URL}/staff`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: data,
    });

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to create staff');
    }
    return responseData;
  }

  async updateStaff(id: number, data: FormData) {
    const token = this.getAuthToken();
    const url = `${API_BASE_URL}/staff/${id}`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: data,
    });

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to update staff');
    }
    return responseData;
  }

  async deleteStaff(id: number) {
    return this.delete<any>(`/staff/${id}`);
  }

  // Department methods
  async getDepartments() {
    return this.get<any[]>('/departments');
  }
}

export const apiService = new ApiService();
export default apiService;

