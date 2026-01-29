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
                let errorMessage = data.message || data.error || 'An error occurred';

                // If there are detailed validation errors from Laravel (data.errors), join them
                if (data.errors && typeof data.errors === 'object') {
                    const validationMessages = Object.values(data.errors)
                        .flat()
                        .filter(msg => typeof msg === 'string')
                        .join(' ');
                    if (validationMessages) {
                        errorMessage = `${errorMessage} ${validationMessages}`;
                    }
                }

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

    async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
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
    async getDoctors(page: number = 1, perPage: number = 10, filters?: Record<string, any>) {
        if (!filters) {
            return this.get<any>(`/doctors?page=${page}&per_page=${perPage}`);
        }

        let endpoint = `/doctors?page=${page}&per_page=${perPage}`;
        Object.keys(filters).forEach(key => {
            if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
                endpoint += `&${key}=${encodeURIComponent(filters[key])}`;
            }
        });
        return this.get<any>(endpoint);
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
    async getStaff(page: number = 1, perPage: number = 10, filters?: Record<string, any>) {
        let endpoint = `/staff?page=${page}&per_page=${perPage}`;

        if (filters) {
            Object.keys(filters).forEach(key => {
                if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
                    endpoint += `&${key}=${encodeURIComponent(filters[key])}`;
                }
            });
        }

        return this.get<any>(endpoint);
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
    async getDepartments(page: number = 1, perPage: number = 10, filters?: Record<string, any>) {
        let endpoint = `/departments?page=${page}&per_page=${perPage}`;

        if (filters) {
            Object.keys(filters).forEach(key => {
                if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
                    endpoint += `&${key}=${encodeURIComponent(filters[key])}`;
                }
            });
        }

        return this.get<any>(endpoint);
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
    async getServices(page: number = 1, perPage: number = 10, filters?: Record<string, any>) {
        let endpoint = `/services?page=${page}&per_page=${perPage}`;

        if (filters) {
            Object.keys(filters).forEach(key => {
                if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
                    endpoint += `&${key}=${encodeURIComponent(filters[key])}`;
                }
            });
        }

        return this.get<any>(endpoint);
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
    async getAppointments(page: number = 1, filters?: Record<string, any>) {
        let endpoint = `/appointments?page=${page}`;

        // Append filter parameters if provided
        if (filters) {
            Object.keys(filters).forEach(key => {
                if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
                    endpoint += `&${key}=${encodeURIComponent(filters[key])}`;
                }
            });
        }

        return this.get<any>(endpoint);
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
    async getPatients(page: number = 1, perPage: number = 10, search?: string, filters?: Record<string, any>): Promise<ApiResponse<any>> {
        let endpoint = `/patients?page=${page}&per_page=${perPage}`;
        if (search) endpoint += `&keyword=${encodeURIComponent(search)}`;

        if (filters) {
            Object.keys(filters).forEach(key => {
                // Skip if value is empty or if it's the search keyword (which we already handled)
                if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '' && key !== 'keyword') {
                    endpoint += `&${key}=${encodeURIComponent(filters[key])}`;
                }
            });
        }

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
    async getPrescriptions(page: number = 1, perPage: number = 10, filters?: Record<string, any>) {
        let endpoint = `/prescriptions?page=${page}&per_page=${perPage}`;
        if (filters) {
            Object.keys(filters).forEach(key => {
                if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
                    endpoint += `&${key}=${encodeURIComponent(filters[key])}`;
                }
            });
        }
        return this.get<any>(endpoint);
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
    async getMedicalReports(page: number = 1, perPage: number = 10): Promise<ApiResponse<any>> {
        return this.get<any>(`/medical-reports?page=${page}&per_page=${perPage}`);
    }

    async createMedicalReport(data: FormData): Promise<ApiResponse<any>> {
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

    async verifyMedicalReport(id: number, data: any) {
        return this.post<any>(`/medical-reports/${id}/verify`, data);
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

    // Lab Catalog methods
    async getLabTestCatalog() {
        return this.get<any[]>('/lab/catalog');
    }

    async createLabCatalogTest(data: any) {
        return this.post<any>('/lab/catalog', data);
    }

    async updateLabCatalogTest(id: number, data: any) {
        return this.put<any>(`/lab/catalog/${id}`, data);
    }

    async deleteLabCatalogTest(id: number) {
        return this.delete<any>(`/lab/catalog/${id}`);
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

    // Pharmacy methods
    async getPharmacyPrescriptions(params?: {
        status?: string;
        patient_id?: number;
        date_from?: string;
        date_to?: string;
        page?: number;
        per_page?: number;
    }) {
        let endpoint = '/pharmacy/prescriptions?';
        const queryParams = new URLSearchParams();

        if (params?.status) queryParams.append('status', params.status);
        if (params?.patient_id) queryParams.append('patient_id', params.patient_id.toString());
        if (params?.date_from) queryParams.append('date_from', params.date_from);
        if (params?.date_to) queryParams.append('date_to', params.date_to);
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.per_page) queryParams.append('per_page', params.per_page.toString());

        endpoint += queryParams.toString();
        return this.get<any>(endpoint);
    }

    async getPharmacyPrescriptionDetails(id: number) {
        return this.get<any>(`/pharmacy/prescriptions/${id}`);
    }

    async dispensePrescription(prescriptionId: number, data: {
        items: Array<{
            prescription_item_id: number;
            quantity_dispensed: number;
            notes?: string;
        }>;
    }) {
        return this.post<any>(`/pharmacy/prescriptions/${prescriptionId}/dispense`, data);
    }

    async getMedicines(params?: {
        search?: string;
        category?: string;
        low_stock_only?: boolean;
        status?: string;
        page?: number;
        per_page?: number;
    }) {
        let endpoint = '/pharmacy/medicines?';
        const queryParams = new URLSearchParams();

        if (params?.search) queryParams.append('search', params.search);
        if (params?.category) queryParams.append('category', params.category);
        if (params?.low_stock_only) queryParams.append('low_stock_only', 'true');
        if (params?.status) queryParams.append('status', params.status);
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.per_page) queryParams.append('per_page', params.per_page.toString());

        endpoint += queryParams.toString();
        return this.get<any>(endpoint);
    }

    async createMedicine(data: {
        name: string;
        generic_name?: string;
        manufacturer?: string;
        category: 'tablet' | 'capsule' | 'syrup' | 'injection' | 'other';
        unit: string;
        current_stock: number;
        min_stock_level: number;
        max_stock_level?: number;
        unit_price: number;
        selling_price: number;
        expiry_date?: string;
        batch_number?: string;
        status?: 'active' | 'inactive' | 'discontinued';
    }) {
        return this.post<any>('/pharmacy/medicines', data);
    }

    async updateMedicine(id: number, data: Partial<{
        name: string;
        generic_name: string;
        manufacturer: string;
        category: 'tablet' | 'capsule' | 'syrup' | 'injection' | 'other';
        unit: string;
        current_stock: number;
        min_stock_level: number;
        max_stock_level: number;
        unit_price: number;
        selling_price: number;
        expiry_date: string;
        batch_number: string;
        status: 'active' | 'inactive' | 'discontinued';
    }>) {
        return this.put<any>(`/pharmacy/medicines/${id}`, data);
    }

    async deleteMedicine(id: number) {
        return this.delete<any>(`/pharmacy/medicines/${id}`);
    }

    async restockMedicine(id: number, data: {
        quantity: number;
        batch_number?: string;
        expiry_date?: string;
        unit_price?: number;
        notes?: string;
    }) {
        return this.post<any>(`/pharmacy/medicines/${id}/restock`, data);
    }

    async getGatewaySettings() {
        return this.get<any[]>('/gateway-settings');
    }

    async saveGatewaySettings(data: {
        gateway_name: string;
        mode: 'sandbox' | 'live';
        client_id: string;
        secret_key: string;
    }) {
        return this.post<any>('/gateway-settings', data);
    }

    async getLowStockAlerts(params?: {
        page?: number;
        per_page?: number;
    }) {
        let endpoint = '/pharmacy/low-stock-alerts?';
        const queryParams = new URLSearchParams();

        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.per_page) queryParams.append('per_page', params.per_page.toString());

        endpoint += queryParams.toString();
        return this.get<any>(endpoint);
    }

    async getDispensingHistory(params?: {
        prescription_id?: number;
        patient_id?: number;
        medicine_id?: number;
        date_from?: string;
        date_to?: string;
        dispensed_by?: number;
        page?: number;
        per_page?: number;
    }) {
        let endpoint = '/pharmacy/dispensing-history?';
        const queryParams = new URLSearchParams();

        if (params?.prescription_id) queryParams.append('prescription_id', params.prescription_id.toString());
        if (params?.patient_id) queryParams.append('patient_id', params.patient_id.toString());
        if (params?.medicine_id) queryParams.append('medicine_id', params.medicine_id.toString());
        if (params?.date_from) queryParams.append('date_from', params.date_from);
        if (params?.date_to) queryParams.append('date_to', params.date_to);
        if (params?.dispensed_by) queryParams.append('dispensed_by', params.dispensed_by.toString());
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.per_page) queryParams.append('per_page', params.per_page.toString());

        endpoint += queryParams.toString();
        return this.get<any>(endpoint);
    }

    // Notification methods
    async getNotifications(page: number = 1, perPage: number = 20, filters?: { category?: string; type?: string; unread?: boolean }) {
        let endpoint = `/notifications?page=${page}&per_page=${perPage}`;
        if (filters?.category) endpoint += `&category=${filters.category}`;
        if (filters?.type) endpoint += `&type=${filters.type}`;
        if (filters?.unread) endpoint += `&unread=true`;
        return this.get<any>(endpoint);
    }

    async getNotification(id: string) {
        return this.get<any>(`/notifications/${id}`);
    }

    async markNotificationAsRead(id: string) {
        return this.request<any>(`/notifications/${id}/read`, { method: 'PATCH' });
    }

    async markAllNotificationsAsRead() {
        return this.request<any>('/notifications/mark-all-read', { method: 'PATCH' });
    }

    async deleteNotification(id: string) {
        return this.delete<any>(`/notifications/${id}`);
    }

    async clearAllNotifications() {
        return this.delete<any>('/notifications/clear-all');
    }

    async getNotificationStats() {
        return this.get<any>('/notifications/stats');
    }

    // Room Management
    async getRoomTypes() {
        return this.get<any[]>('/room-types');
    }

    async getRoomType(id: number) {
        return this.get<any>(`/room-types/${id}`);
    }

    async createRoomType(data: any) {
        return this.post<any>('/room-types', data);
    }

    async updateRoomType(id: number, data: any) {
        return this.put<any>(`/room-types/${id}`, data);
    }

    async deleteRoomType(id: number) {
        return this.delete<any>(`/room-types/${id}`);
    }

    async getRooms(params?: { type_id?: number; status?: string }) {
        return this.get<any[]>('/rooms');
    }

    async getRoom(id: number) {
        return this.get<any>(`/rooms/${id}`);
    }

    async createRoom(data: any) {
        return this.post<any>('/rooms', data);
    }

    async updateRoom(id: number, data: any) {
        return this.put<any>(`/rooms/${id}`, data);
    }

    async deleteRoom(id: number) {
        return this.delete<any>(`/rooms/${id}`);
    }

    async getBeds(params?: { room_id?: number; status?: string }) {
        let url = '/beds?';
        if (params?.room_id) url += `room_id=${params.room_id}&`;
        if (params?.status) url += `status=${params.status}&`;
        return this.get<any[]>(url);
    }

    async getBed(id: number) {
        return this.get<any>(`/beds/${id}`);
    }

    async createBed(data: any) {
        return this.post<any>('/beds', data);
    }

    async updateBed(id: number, data: any) {
        return this.put<any>(`/beds/${id}`, data);
    }

    async deleteBed(id: number) {
        return this.delete<any>(`/beds/${id}`);
    }

    async getAdmissions(params?: { status?: string; patient_id?: number }) {
        let url = '/admissions?';
        if (params?.status) url += `status=${params.status}&`;
        if (params?.patient_id) url += `patient_id=${params.patient_id}&`;
        return this.get<any[]>(url);
    }

    async getAdmission(id: number) {
        return this.get<any>(`/admissions/${id}`);
    }

    async admitPatient(data: any) {
        return this.post<any>('/admissions', data);
    }

    async processAdmission(admissionId: number, data: {
        room_id: number;
        bed_id: number;
        admission_date: string;
    }) {
        return this.post<any>(`/admissions/${admissionId}/admit`, data);
    }

    async dischargePatient(admissionId: number, data: { discharge_date: string }) {
        return this.post<any>(`/admissions/${admissionId}/discharge`, data);
    }

    // Billing methods
    async getBills(params?: { patient_id?: number; status?: string; per_page?: number; page?: number }) {
        let endpoint = '/billing/bills?';
        const queryParams = new URLSearchParams();

        if (params?.patient_id) queryParams.append('patient_id', params.patient_id.toString());
        if (params?.status) queryParams.append('status', params.status);
        if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
        if (params?.page) queryParams.append('page', params.page.toString());

        endpoint += queryParams.toString();
        return this.get<any>(endpoint);
    }

    async getBill(id: number) {
        return this.get<any>(`/billing/bills/${id}`);
    }

    async finalizeBill(id: number) {
        return this.post<any>(`/billing/bills/${id}/finalize`);
    }

    async downloadInvoice(id: number) {
        const token = this.getAuthToken();
        const url = `${API_BASE_URL}/billing/bills/${id}/pdf`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/pdf',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        });

        if (!response.ok) {
            throw new Error('Failed to download invoice');
        }

        const blob = await response.blob();
        return window.URL.createObjectURL(blob);
    }


    // Payment methods
    async getPayments(params?: { bill_id?: number; patient_id?: number; payment_status?: string; payment_mode?: string; per_page?: number; page?: number }) {
        let endpoint = '/payments?';
        const queryParams = new URLSearchParams();

        if (params?.bill_id) queryParams.append('bill_id', params.bill_id.toString());
        if (params?.patient_id) queryParams.append('patient_id', params.patient_id.toString());
        if (params?.payment_status) queryParams.append('payment_status', params.payment_status);
        if (params?.payment_mode) queryParams.append('payment_mode', params.payment_mode);
        if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
        if (params?.page) queryParams.append('page', params.page.toString());

        endpoint += queryParams.toString();
        return this.get<any>(endpoint);
    }

    async getPayment(id: number) {
        return this.get<any>(`/payments/${id}`);
    }

    async collectCash(data: { bill_id: number; amount: number; notes?: string }) {
        return this.post<any>('/payments/collect-cash', data);
    }

    async initiateOnlinePayment(data: { bill_id: number; amount: number; payment_gateway: string }) {
        return this.post<any>('/payments/initiate-online', data);
    }

    async updatePaymentStatus(id: number, data: { transaction_id: string; gateway_response?: any; status: string }) {
        return this.post<any>(`/payments/${id}/verify`, data);
    }

    // Contact Enquiry methods
    async getContactEnquiries() {
        return this.get<any[]>('/contact-enquiries');
    }

    async updateContactEnquiryStatus(id: number, status: 'unread' | 'read' | 'replied') {
        return this.patch<any>(`/contact-enquiries/${id}`, { status });
    }

    async deleteContactEnquiry(id: number) {
        return this.delete<any>(`/contact-enquiries/${id}`);
    }

    async generateReceipt(id: number) {
        const token = this.getAuthToken();
        const url = `${API_BASE_URL}/payments/${id}/receipt`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/pdf',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        });

        if (!response.ok) {
            throw new Error('Failed to generate receipt');
        }

        const blob = await response.blob();
        return window.URL.createObjectURL(blob);
    }

    async getPaymentStatistics() {
        return this.get<any>('/payments/statistics/summary');
    }
    async getTestimonials(params?: { page?: number; per_page?: number; status?: string; search?: string }) {
        let endpoint = '/admin/testimonials?';
        const queryParams = new URLSearchParams();

        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
        if (params?.status) queryParams.append('status', params.status);
        if (params?.search) queryParams.append('search', params.search);

        endpoint += queryParams.toString();
        return this.get<any>(endpoint);
    }

    async updateTestimonialStatus(id: number, status: 'pending' | 'approved' | 'rejected') {
        return this.put<any>(`/admin/testimonials/${id}/status`, { status });
    }

    async deleteTestimonial(id: number) {
        return this.delete<any>(`/admin/testimonials/${id}`);
    }
}

export const apiService = new ApiService();
export default apiService;
