export interface SearchableModule {
    id: string;
    title: string;
    description: string;
    path: string;
    roles?: number[]; // Role IDs that have access. If undefined, it's public.
    icon: string;
}

export const searchableModules: SearchableModule[] = [
    {
        id: 'home',
        title: 'Home',
        description: 'Main landing page of Arovis Hospital.',
        path: '/',
        icon: 'bi-house'
    },
    {
        id: 'about',
        title: 'About Us',
        description: 'Learn about our history, mission, and values.',
        path: '/about',
        icon: 'bi-info-circle'
    },
    {
        id: 'departments',
        title: 'Departments',
        description: 'Explore our specialized medical departments.',
        path: '/departments',
        icon: 'bi-building'
    },
    {
        id: 'doctors',
        title: 'Doctors',
        description: 'Find and book appointments with our expert doctors.',
        path: '/doctors',
        icon: 'bi-person-badge'
    },
    {
        id: 'services',
        title: 'Services',
        description: 'View the healthcare services we offer.',
        path: '/services',
        icon: 'bi-clipboard2-pulse'
    },
    {
        id: 'contact',
        title: 'Contact',
        description: 'Get in touch with us for any inquiries.',
        path: '/contact',
        icon: 'bi-envelope'
    },
    {
        id: 'quick-appointment',
        title: 'Quick Appointment',
        description: 'Book a medical appointment rapidly.',
        path: '/quickappointment',
        icon: 'bi-calendar-check'
    },
    {
        id: 'home-care',
        title: 'Home Care',
        description: 'Book medical services at your doorstep.',
        path: '/home-care',
        icon: 'bi-house-heart'
    },
    {
        id: 'profile',
        title: 'My Profile',
        description: 'Manage your personal information and settings.',
        path: '/profile',
        roles: [1, 2, 3], // Example role IDs
        icon: 'bi-person-gear'
    },
    {
        id: 'notifications',
        title: 'Notifications',
        description: 'View your latest updates and alerts.',
        path: '/notifications',
        roles: [1, 2, 3],
        icon: 'bi-bell'
    },
    {
        id: 'appointments-list',
        title: 'My Appointments',
        description: 'View and manage your upcoming appointments.',
        path: '/profile?tab=appointments',
        roles: [1, 2, 3],
        icon: 'bi-calendar3'
    },
    {
        id: 'medical-records',
        title: 'Medical Records',
        description: 'Access your health records and reports.',
        path: '/profile?tab=records',
        roles: [1, 2, 3],
        icon: 'bi-file-earmark-medical'
    },
    {
        id: 'bills',
        title: 'My Bills',
        description: 'View and pay your medical bills.',
        path: '/profile?tab=bills',
        roles: [1, 2, 3],
        icon: 'bi-receipt'
    },
    {
        id: 'testimonials',
        title: 'Testimonials',
        description: 'Read what our patients say about us.',
        path: '/testimonials',
        icon: 'bi-chat-quote'
    },
    {
        id: 'faq',
        title: 'FAQ',
        description: 'Frequently asked questions about our services.',
        path: '/faq',
        icon: 'bi-question-circle'
    },
    {
        id: 'gallery',
        title: 'Hospital Gallery',
        description: 'Take a virtual tour of our facilities.',
        path: '/gallery',
        icon: 'bi-images'
    },
    {
        id: 'privacy',
        title: 'Privacy Policy',
        description: 'Learn how we protect your data.',
        path: '/privacy',
        icon: 'bi-shield-check'
    },
    {
        id: 'terms',
        title: 'Terms of Service',
        description: 'Read our terms and conditions.',
        path: '/terms',
        icon: 'bi-file-text'
    }
];
