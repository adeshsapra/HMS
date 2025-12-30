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

  async updateProfile(data: any) {
    if (data instanceof FormData) {
      const token = this.getAuthToken();
      const url = `${API_BASE_URL}/profile`;
      data.append('_method', 'PUT');

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
        throw new Error(responseData.message || 'Failed to update profile');
      }
      return responseData;
    }
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
  async getDoctors(page: number = 1, perPage: number = 10) {
    return this.get<any>(`/doctors?page=${page}&per_page=${perPage}`);
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
      // Create custom error with validation details
      const error: any = new Error(responseData.message || 'Failed to create doctor');
      error.validationErrors = responseData.errors || {};
      throw error;
    }
    return responseData;
  }

  async updateDoctor(id: number, data: FormData) {
    const token = this.getAuthToken();
    const url = `${API_BASE_URL}/doctors/${id}`;

    // Laravel requires POST with _method for FormData updates
    data.append('_method', 'PUT');

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
      // Create custom error with validation details
      const error: any = new Error(responseData.message || 'Failed to update doctor');
      error.validationErrors = responseData.errors || {};
      throw error;
    }
    return responseData;
  }

  async deleteDoctor(id: number) {
    return this.delete<any>(`/doctors/${id}`);
  }

  // Staff methods
  async getStaff(page: number = 1, perPage: number = 10) {
    return this.get<any>(`/staff?page=${page}&per_page=${perPage}`);
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
      const error: any = new Error(responseData.message || 'Failed to create staff');
      error.validationErrors = responseData.errors || {};
      throw error;
    }
    return responseData;
  }

  async updateStaff(id: number, data: FormData) {
    const token = this.getAuthToken();
    const url = `${API_BASE_URL}/staff/${id}`;

    // Laravel requires POST with _method for FormData updates
    data.append('_method', 'PUT');

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
      const error: any = new Error(responseData.message || 'Failed to update staff');
      error.validationErrors = responseData.errors || {};
      throw error;
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

  async getDepartment(id: number) {
    return this.get<any>(`/departments/${id}`);
  }

  async createDepartment(data: any) {
    if (data instanceof FormData) {
      const token = this.getAuthToken();
      const url = `${API_BASE_URL}/departments`;

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
        const error: any = new Error(responseData.message || 'Failed to create department');
        error.validationErrors = responseData.errors || {};
        throw error;
      }
      return responseData;
    }
    return this.post<any>('/departments', data);
  }

  async updateDepartment(id: number, data: any) {
    if (data instanceof FormData) {
      const token = this.getAuthToken();
      const url = `${API_BASE_URL}/departments/${id}`;

      // Laravel requires POST with _method for FormData updates
      data.append('_method', 'PUT');

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
        const error: any = new Error(responseData.message || 'Failed to update department');
        error.validationErrors = responseData.errors || {};
        throw error;
      }
      return responseData;
    }
    return this.put<any>(`/departments/${id}`, data);
  }

  async deleteDepartment(id: number) {
    return this.delete<any>(`/departments/${id}`);
  }

  // Service methods
  async getServices() {
    return this.get<any[]>('/services');
  }

  async getService(id: number) {
    return this.get<any>(`/services/${id}`);
  }

  async createService(data: any) {
    return this.post<any>('/services', data);
  }

  async updateService(id: number, data: any) {
    return this.put<any>(`/services/${id}`, data);
  }

  async deleteService(id: number) {
    return this.delete<any>(`/services/${id}`);
  }

  // Appointment methods
  async getAppointments(page: number = 1) {
    return this.get<any>(`/appointments?page=${page}`);
  }

  async getAppointmentsByDateRange(startDate?: string, endDate?: string) {
    let endpoint = '/appointments?per_page=1000'; // Get all for calendar view
    if (startDate) endpoint += `&start_date=${startDate}`;
    if (endDate) endpoint += `&end_date=${endDate}`;
    return this.get<any>(endpoint);
  }

  async getAppointment(id: number) {
    return this.get<any>(`/appointments/${id}`);
  }

  async createAppointment(data: any) {
    return this.post<any>('/appointments', data);
  }

  async updateAppointment(id: number, data: any) {
    return this.put<any>(`/appointments/${id}`, data);
  }

  async deleteAppointment(id: number) {
    return this.delete<any>(`/appointments/${id}`);
  }

  // Patient methods
  async getPatients(page: number = 1, perPage: number = 10, search?: string) {
    let endpoint = `/patients?page=${page}&per_page=${perPage}`;
    if (search) endpoint += `&search=${search}`;
    return this.get<any>(endpoint);
  }

  async getPatient(id: number) {
    return this.get<any>(`/patients/${id}`);
  }

  async createPatient(data: any) {
    if (data instanceof FormData) {
      const token = this.getAuthToken();
      const url = `${API_BASE_URL}/patients`;

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
        const error: any = new Error(responseData.message || 'Failed to register patient');
        error.validationErrors = responseData.errors || {};
        throw error;
      }
      return responseData;
    }
    return this.post<any>('/patients', data);
  }

  async updatePatient(id: number, data: any) {
    if (data instanceof FormData) {
      const token = this.getAuthToken();
      const url = `${API_BASE_URL}/patients/${id}`;

      // Laravel requires POST with _method for FormData updates
      data.append('_method', 'PUT');

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
        const error: any = new Error(responseData.message || 'Failed to update patient');
        error.validationErrors = responseData.errors || {};
        throw error;
      }
      return responseData;
    }
    return this.put<any>(`/patients/${id}`, data);
  }

  async deletePatient(id: number) {
    return this.delete<any>(`/patients/${id}`);
  }

  // Home Care methods
  async getHomeCareServices() {
    return this.get<any[]>('/admin/home-care/services');
  }

  async createHomeCareService(data: any) {
    return this.post<any>('/admin/home-care/services', data);
  }

  async updateHomeCareService(id: number, data: any) {
    return this.put<any>(`/admin/home-care/services/${id}`, data);
  }

  async deleteHomeCareService(id: number) {
    return this.delete<any>(`/admin/home-care/services/${id}`);
  }

  async getHomeCareRequests() {
    return this.get<any[]>('/admin/home-care/requests');
  }

  async updateHomeCareRequestStatus(id: number, status: string) {
    return this.put<any>(`/admin/home-care/requests/${id}/status`, { status });
  }

  async getHomeCareSettings() {
    return this.get<any>('/admin/home-care/settings');
  }

  async updateHomeCareSettings(settings: any) {
    return this.post<any>('/admin/home-care/settings', { settings });
  }

  async reorderHomeCareServices(services: Array<{ id: number; sort_order: number }>) {
    return this.post<any>('/admin/home-care/services/reorder', { services });
  }

  // Home Care Professionals methods
  async getHomeCareProfessionals() {
    return this.get<any[]>('/admin/home-care/professionals');
  }

  async createHomeCareProfessional(data: any) {
    return this.post<any>('/admin/home-care/professionals', data);
  }

  async updateHomeCareProfessional(id: number, data: any) {
    return this.put<any>(`/admin/home-care/professionals/${id}`, data);
  }

  async deleteHomeCareProfessional(id: number) {
    return this.delete<any>(`/admin/home-care/professionals/${id}`);
  }

  async reorderHomeCareProfessionals(professionals: Array<{ id: number; sort_order: number }>) {
    return this.post<any>('/admin/home-care/professionals/reorder', { professionals });
  }

  // Prescription methods
  async getPrescriptions(page: number = 1, perPage: number = 10) {
    return this.get<any>(`/prescriptions?page=${page}&per_page=${perPage}`);
  }

  async createPrescription(data: any) {
    return this.post<any>('/prescriptions', data);
  }

  async getPrescription(id: number) {
    return this.get<any>(`/prescriptions/${id}`);
  }

  async getPrescriptionByAppointment(appointmentId: number) {
    return this.get<any>(`/prescriptions/appointment/${appointmentId}`);
  }

  // Medical Report methods
  async getMedicalReports(page: number = 1, perPage: number = 10) {
    return this.get<any>(`/medical-reports?page=${page}&per_page=${perPage}`);
  }

  async createMedicalReport(data: FormData) {
    const token = this.getAuthToken();
    const url = `${API_BASE_URL}/medical-reports`;

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
      const error: any = new Error(responseData.message || 'Failed to upload report');
      error.validationErrors = responseData.errors || {};
      throw error;
    }
    return responseData;
  }

  async getMedicalReportsByPatient(patientId: number) {
    return this.get<any>(`/medical-reports/patient/${patientId}`);
  }

  // Laboratory methods
  async getLabTests(page: number = 1, status?: string, search?: string) {
    let url = `/lab?page=${page}`;
    if (status) url += `&status=${status}`;
    if (search) url += `&search=${search}`;
    return this.get<any>(url);
  }

  async getLabStats() {
    return this.get<any>('/lab/stats');
  }

  async collectLabSample(id: number, data: any) {
    return this.post<any>(`/lab/tests/${id}/collect`, data);
  }

  async uploadLabReport(id: number, data: FormData) {
    const token = this.getAuthToken();
    const url = `${API_BASE_URL}/lab/tests/${id}/report`;

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
      const error: any = new Error(responseData.message || 'Failed to upload report');
      error.validationErrors = responseData.errors || {};
      throw error;
    }
    return responseData;
  }

  async verifyLabReport(id: number, data: any) {
    return this.post<any>(`/lab/tests/${id}/verify`, data);
  }
}

export const apiService = new ApiService();
export default apiService;

