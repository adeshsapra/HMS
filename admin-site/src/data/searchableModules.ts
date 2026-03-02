export interface AdminSearchableModule {
    id: string;
    title: string;
    description: string;
    path: string;
    permission?: string;
    icon: string;
}

export const adminSearchableModules: AdminSearchableModule[] = [
    {
        id: 'dashboard',
        title: 'Dashboard Home',
        description: 'Overview of system statistics and activities.',
        path: '/dashboard/home',
        permission: 'view-dashboard',
        icon: 'bi-grid-1x2'
    },
    {
        id: 'appointments',
        title: 'Appointments',
        description: 'Manage patient appointments and schedules.',
        path: '/dashboard/appointments',
        permission: 'view-appointments',
        icon: 'bi-calendar-event'
    },
    {
        id: 'patients',
        title: 'Patients',
        description: 'Manage patient records and information.',
        path: '/dashboard/patients',
        permission: 'view-patients',
        icon: 'bi-people'
    },
    {
        id: 'departments',
        title: 'Departments',
        description: 'Configure and manage hospital departments.',
        path: '/dashboard/departments',
        permission: 'view-departments',
        icon: 'bi-building'
    },
    {
        id: 'services',
        title: 'Hospital Services',
        description: 'Manage the medical services offered by the hospital.',
        path: '/dashboard/services',
        permission: 'view-services',
        icon: 'bi-clipboard2-pulse'
    },
    {
        id: 'staff',
        title: 'Staff Management',
        description: 'Manage hospital employees and roles.',
        path: '/dashboard/staff',
        permission: 'view-staff',
        icon: 'bi-person-badge'
    },
    {
        id: 'prescriptions',
        title: 'Prescriptions',
        description: 'View and manage medical prescriptions.',
        path: '/dashboard/prescriptions',
        permission: 'view-prescriptions',
        icon: 'bi-file-earmark-medical'
    },
    {
        id: 'patient-reports',
        title: 'Patient Reports',
        description: 'Access clinical reports and analytics.',
        path: '/dashboard/patient-reports',
        permission: 'view-patient-reports',
        icon: 'bi-bar-chart'
    },
    {
        id: 'bills',
        title: 'Billing Management',
        description: 'Generate and manage patient bills.',
        path: '/dashboard/bills',
        permission: 'view-bills',
        icon: 'bi-receipt'
    },
    {
        id: 'medicines',
        title: 'Pharmacy / Medicines',
        description: 'Manage medicine inventory and dispensing.',
        path: '/dashboard/medicines',
        permission: 'view-medicines',
        icon: 'bi-capsule'
    },
    {
        id: 'doctors',
        title: 'Doctor Directory',
        description: 'Manage doctor profiles and specializations.',
        path: '/dashboard/doctors',
        permission: 'view-doctors',
        icon: 'bi-person-vcard'
    },
    {
        id: 'gallery',
        title: 'Media Gallery',
        description: 'Manage website images and gallery content.',
        path: '/dashboard/gallery',
        permission: 'view-gallery',
        icon: 'bi-images'
    },
    {
        id: 'testimonials',
        title: 'Testimonials',
        description: 'Manage patient feedback and testimonials.',
        path: '/dashboard/testimonials',
        permission: 'view-testimonials',
        icon: 'bi-chat-heart'
    },
    {
        id: 'faq',
        title: 'FAQ Management',
        description: 'Manage frequently asked questions.',
        path: '/dashboard/faq',
        permission: 'view-faq',
        icon: 'bi-question-diamond'
    },
    {
        id: 'contact-inquiries',
        title: 'Contact Inquiries',
        description: 'View and respond to contact messages.',
        path: '/dashboard/contact-inquiries',
        permission: 'view-contact-inquiries',
        icon: 'bi-envelope-paper'
    },
    {
        id: 'health-packages',
        title: 'Health Packages',
        description: 'Manage wellness and health packages.',
        path: '/dashboard/health-packages',
        permission: 'view-health-packages',
        icon: 'bi-box-seam'
    },
    {
        id: 'email-studio',
        title: 'Email Templates',
        description: 'Customize system email notifications.',
        path: '/dashboard/email-templates',
        permission: 'view-email-templates',
        icon: 'bi-envelope-at'
    },
    {
        id: 'billing-finance',
        title: 'Finance Dashboard',
        description: 'Overall financial reports and revenue charts.',
        path: '/dashboard/billing',
        permission: 'view-billing-finance',
        icon: 'bi-cash-coin'
    },
    {
        id: 'inventory',
        title: 'Inventory',
        description: 'Manage hospital supplies and inventory.',
        path: '/dashboard/inventory',
        permission: 'view-inventory',
        icon: 'bi-database'
    },
    {
        id: 'reports',
        title: 'System Reports',
        description: 'Generate comprehensive system-wide reports.',
        path: '/dashboard/reports',
        permission: 'view-reports',
        icon: 'bi-file-earmark-bar-graph'
    },
    {
        id: 'settings',
        title: 'General Settings',
        description: 'System-wide configuration and settings.',
        path: '/dashboard/settings',
        permission: 'view-settings',
        icon: 'bi-sliders'
    },
    {
        id: 'roles',
        title: 'User Roles',
        description: 'Manage and define system user roles.',
        path: '/dashboard/roles',
        permission: 'view-roles',
        icon: 'bi-shield-lock'
    },
    {
        id: 'permissions',
        title: 'Permissions',
        description: 'Configure granular system permissions.',
        path: '/dashboard/permissions',
        permission: 'view-permissions',
        icon: 'bi-key'
    },
    {
        id: 'profile',
        title: 'My Profile',
        description: 'Manage your admin profile and password.',
        path: '/dashboard/profile',
        icon: 'bi-person-circle'
    },
    {
        id: 'notifications',
        title: 'Recent Notifications',
        description: 'View your recent system alerts.',
        path: '/dashboard/notifications',
        permission: 'view-notifications',
        icon: 'bi-bell'
    }
];
