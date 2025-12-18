export const mockServices = [
    { id: 1, title: "Physiotherapy", category: "Therapy", is_24_7: false, is_active: true, description: "Professional physio sessions", icon: "bi-person-arms-up" },
    { id: 2, title: "Nursing Care", category: "Medical", is_24_7: true, is_active: true, description: "Round the clock nursing", icon: "bi-heart-pulse" },
    { id: 3, title: "Elderly Companion", category: "Assistance", is_24_7: false, is_active: true, description: "Daily assistance for seniors", icon: "bi-eyeglasses" },
    { id: 4, title: "Lab Tests", category: "Diagnostics", is_24_7: false, is_active: true, description: "Home sample collection", icon: "bi-droplet" },
    { id: 5, title: "Doctor Visit", category: "Consultation", is_24_7: false, is_active: false, description: "GP home visits", icon: "bi-stethoscope" },
];

export const mockRequests = [
    {
        id: 1,
        name: "John Doe",
        phone: "+1 555-0199",
        email: "john.d@example.com",
        address: "123 Maple Ave, Springfield",
        preferred_date: "2023-12-25T10:00:00",
        services_requested: [1, 2], // IDs of services
        status: "pending"
    },
    {
        id: 2,
        name: "Jane Smith",
        phone: "+1 555-0256",
        email: "iane.s@example.com",
        address: "456 Oak Dr, Shelbyville",
        preferred_date: "2023-12-26T14:30:00",
        services_requested: [4],
        status: "confirmed"
    },
    {
        id: 3,
        name: "Robert Johnson",
        phone: "+1 555-0312",
        email: "bob.j@example.com",
        address: "789 Pine Ln, Capital City",
        preferred_date: "2023-12-24T09:00:00",
        services_requested: [1],
        status: "completed"
    }
];

export const mockSettings = {
    home_care_title: "Professional Home Care Services",
    home_care_subtitle: "Hospital-grade care at your doorstep",
    home_care_desc: "We bring certified doctors, nurses, and physiotherapists to your home. Book a visit today.",
    home_care_cta: "Book Now",
    home_care_image: ""
};
