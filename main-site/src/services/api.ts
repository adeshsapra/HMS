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
        const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
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
            sessionStorage.removeItem('auth_token');
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
    getProfile: (id: number | string) => api.get(`/public/doctors/${id}/profile`),
    getByDepartment: (departmentId: number | string) => api.get(`/public/doctors/department/${departmentId}`),
};

export const doctorReviewAPI = {
    getDoctorReviews: (doctorId: number | string) => api.get(`/public/doctors/${doctorId}/reviews`),
    submitReview: (data: {
        doctor_id: number | string;
        rating: number;
        review?: string;
        title?: string;
        appointment_id?: number | string;
    }) => api.post('/patient-profile/doctor-reviews', data),
};

export const appointmentAPI = {
    create: (data: any) => api.post('/public/appointments', data),
};

export const homeCareAPI = {
    getServices: () => api.get('/public/home-care/services'),
    getSettings: () => api.get('/public/home-care/settings'),
    getProfessionals: () => api.get('/public/home-care/professionals'),
    submitRequest: (data: {
        name: string;
        phone: string;
        email?: string;
        address?: string;
        preferred_date?: string;
        services_requested?: number[];
        service_id?: number;
        user_id?: number | string;
    }) => api.post('/public/home-care/requests', data),
};

export const profileAPI = {
    get: () => api.get('/profile'),
    update: (data: FormData) => api.post('/profile', data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),
    changePassword: (data: any) => api.post('/change-password', data),
    changeEmail: (data: any) => api.post('/change-email', data),
};

// Patient Profile API for My Appointments
export const patientProfileAPI = {
    getMyAppointments: (params?: { status?: string; start_date?: string; end_date?: string; per_page?: number }) => {
        const queryParams = new URLSearchParams();
        if (params?.status) queryParams.append('status', params.status);
        if (params?.start_date) queryParams.append('start_date', params.start_date);
        if (params?.end_date) queryParams.append('end_date', params.end_date);
        if (params?.per_page) queryParams.append('per_page', params.per_page.toString());

        const queryString = queryParams.toString();
        return api.get(`/patient-profile/appointments${queryString ? '?' + queryString : ''}`);
    },

    getAppointmentDetails: (id: number) => api.get(`/patient-profile/appointments/${id}`),

    rescheduleAppointment: (id: number, data: { appointment_date: string; appointment_time: string; reason?: string }) =>
        api.put(`/patient-profile/appointments/${id}/reschedule`, data),

    cancelAppointment: (id: number) => api.put(`/patient-profile/appointments/${id}/cancel`),

    getAppointmentStatistics: () => api.get('/patient-profile/appointments/statistics'),

    getAvailableTimeSlots: (doctorId: number, date: string) =>
        api.get(`/patient-profile/doctors/${doctorId}/available-slots?date=${date}`),

    getMyMedicalRecords: (params?: { category?: string; status?: string; start_date?: string; end_date?: string; per_page?: number; page?: number }) => {
        const queryParams = new URLSearchParams();
        if (params?.category) queryParams.append('category', params.category);
        if (params?.status) queryParams.append('status', params.status);
        if (params?.start_date) queryParams.append('start_date', params.start_date);
        if (params?.end_date) queryParams.append('end_date', params.end_date);
        if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
        if (params?.page) queryParams.append('page', params.page.toString());

        const queryString = queryParams.toString();
        return api.get(`/patient-profile/medical-records${queryString ? '?' + queryString : ''}`);
    },

    getMyHomeCareRequests: () => api.get('/patient-profile/home-care-requests'),
};

export const contactAPI = {
    submitEnquiry: (data: {
        name: string;
        email: string;
        subject: string;
        message: string;
        phone?: string;
    }) => api.post('/public/contact-enquiries', data),
};

export const testimonialAPI = {
    getAll: (params?: { page?: number; per_page?: number }) => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
        const queryString = queryParams.toString();
        return api.get(`/public/testimonials${queryString ? '?' + queryString : ''}`);
    },
    submit: (data: { message: string; rating: number; role?: string }) =>
        api.post('/patient-profile/testimonials', data),
};

export const notificationAPI = {
    getAll: (page: number = 1, perPage: number = 20, filters?: { category?: string; type?: string; unread?: boolean }) => {
        let endpoint = `/notifications?page=${page}&per_page=${perPage}`;
        if (filters?.category) endpoint += `&category=${filters.category}`;
        if (filters?.type) endpoint += `&type=${filters.type}`;
        if (filters?.unread) endpoint += `&unread=true`;
        return api.get(endpoint);
    },

    getById: (id: string) =>
        api.get(`/notifications/${id}`),

    markAsRead: (id: string) =>
        api.patch(`/notifications/${id}/read`),

    markAllRead: () =>
        api.patch('/notifications/mark-all-read'),

    delete: (id: string) =>
        api.delete(`/notifications/${id}`),

    clearAll: () =>
        api.delete('/notifications/clear-all'),

    getStats: () =>
        api.get('/notifications/stats'),
};

// Billing API
export const billingAPI = {
    getBills: (params?: { patient_id?: number; status?: string; per_page?: number; page?: number }) => {
        const queryParams = new URLSearchParams();
        if (params?.patient_id) queryParams.append('patient_id', params.patient_id.toString());
        if (params?.status) queryParams.append('status', params.status);
        if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
        if (params?.page) queryParams.append('page', params.page.toString());

        const queryString = queryParams.toString();
        return api.get(`/billing/bills${queryString ? '?' + queryString : ''}`);
    },

    getBillById: (id: number) => api.get(`/billing/bills/${id}`),

    finalizeBill: (id: number) => api.post(`/billing/bills/${id}/finalize`),

    downloadInvoice: (id: number) => api.get(`/billing/bills/${id}/pdf`, {
        responseType: 'blob'
    }),
};

// Payment API
export const paymentAPI = {
    getPayments: (params?: { bill_id?: number; patient_id?: number; payment_status?: string; payment_mode?: string; per_page?: number; page?: number }) => {
        const queryParams = new URLSearchParams();
        if (params?.bill_id) queryParams.append('bill_id', params.bill_id.toString());
        if (params?.patient_id) queryParams.append('patient_id', params.patient_id.toString());
        if (params?.payment_status) queryParams.append('payment_status', params.payment_status);
        if (params?.payment_mode) queryParams.append('payment_mode', params.payment_mode);
        if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
        if (params?.page) queryParams.append('page', params.page.toString());

        const queryString = queryParams.toString();
        return api.get(`/payments${queryString ? '?' + queryString : ''}`);
    },

    getPaymentById: (id: number) => api.get(`/payments/${id}`),

    collectCash: (data: { bill_id: number; amount: number; notes?: string }) =>
        api.post('/payments/collect-cash', data),

    initiateOnlinePayment: (data: { bill_id: number; amount: number; payment_gateway: string }) =>
        api.post('/payments/initiate-online', data),

    verifyPayment: (id: number, data: { transaction_id: string; gateway_response?: any; status: string }) =>
        api.post(`/payments/${id}/verify`, data),

    generateReceipt: (id: number) => api.get(`/payments/${id}/receipt`, {
        responseType: 'blob'
    }),

    getStatistics: () => api.get('/payments/statistics/summary'),
};

export const faqAPI = {
    getAll: () => api.get('/public/faqs'),
};

// Unified ApiService export for backward compatibility
export const ApiService = {
    // Billing methods
    getBills: () => billingAPI.getBills(),
    getBillById: (id: number) => billingAPI.getBillById(id),
    finalizeBill: (id: number) => billingAPI.finalizeBill(id),
    downloadInvoice: (id: number) => billingAPI.downloadInvoice(id),

    // Payment methods
    getPayments: (params?: any) => paymentAPI.getPayments(params),
    getPaymentById: (id: number) => paymentAPI.getPaymentById(id),
    collectCash: (data: any) => paymentAPI.collectCash(data),
    initiateOnlinePayment: (data: any) => paymentAPI.initiateOnlinePayment(data),
    verifyPayment: (id: number, data: any) => paymentAPI.verifyPayment(id, data),
    getPayPalConfig: () => api.get('/payments/paypal/config'),
    capturePayPalPayment: (token: string) => api.post('/payments/paypal-capture', { token }),
    getRazorpayConfig: () => api.get('/payments/razorpay/config'),
    captureRazorpayPayment: (data: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) =>
        api.post('/payments/razorpay-capture', data),
    generateReceipt: (id: number) => paymentAPI.generateReceipt(id),
    getPaymentStatistics: () => paymentAPI.getStatistics(),
};

export default api;


