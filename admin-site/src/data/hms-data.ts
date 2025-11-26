// HMS Data - Mock data for all modules

export interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  bloodGroup: string;
  status: string;
  lastVisit: string;
  totalVisits: number;
  avatar: string;
}

export interface Doctor {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  department: string;
  experience: string;
  status: string;
  rating: number;
  totalPatients: number;
  avatar: string;
}

export interface Appointment {
  id: number;
  patientName: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  status: string;
  reason: string;
  phone: string;
}

export interface Department {
  id: number;
  name: string;
  description: string;
  head: string;
  totalDoctors: number;
  totalPatients: number;
  status: string;
  icon: string;
}

export interface Service {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  status: string;
  icon: string;
}

export interface StaffMember {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: string;
  shift: string;
  avatar: string;
}

export interface Bill {
  id: number;
  invoiceNo: string;
  patientName: string;
  date: string;
  amount: number;
  status: string;
  paymentMethod: string;
}

export interface InventoryItem {
  id: number;
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  status: string;
  supplier: string;
  lastRestocked: string;
}

export interface Testimonial {
  id: number;
  patientName: string;
  rating: number;
  comment: string;
  date: string;
  status: string;
  avatar: string;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  status: string;
}

export interface ContactInquiry {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  date: string;
  status: string;
}

export interface Room {
  id: number;
  roomNumber: string;
  roomType: string;
  bedCount: number;
  occupiedBeds: number;
  status: string;
  floor: number;
}

export const patientsData: Patient[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "+1 234-567-8900",
    age: 45,
    gender: "Male",
    bloodGroup: "O+",
    status: "active",
    lastVisit: "2024-01-15",
    totalVisits: 12,
    avatar: "/img/team-1.jpeg",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@email.com",
    phone: "+1 234-567-8901",
    age: 32,
    gender: "Female",
    bloodGroup: "A+",
    status: "active",
    lastVisit: "2024-01-20",
    totalVisits: 8,
    avatar: "/img/team-2.jpeg",
  },
  {
    id: 3,
    name: "Robert Johnson",
    email: "robert.j@email.com",
    phone: "+1 234-567-8902",
    age: 58,
    gender: "Male",
    bloodGroup: "B+",
    status: "critical",
    lastVisit: "2024-01-22",
    totalVisits: 25,
    avatar: "/img/team-3.jpeg",
  },
  {
    id: 4,
    name: "Emily Davis",
    email: "emily.d@email.com",
    phone: "+1 234-567-8903",
    age: 28,
    gender: "Female",
    bloodGroup: "AB+",
    status: "active",
    lastVisit: "2024-01-18",
    totalVisits: 5,
    avatar: "/img/team-4.jpeg",
  },
];

export const doctorsData: Doctor[] = [
  {
    id: 1,
    name: "Dr. Sarah Mitchell",
    email: "sarah.mitchell@hospital.com",
    phone: "+1 234-567-9000",
    specialty: "Cardiology",
    department: "Cardiology",
    experience: "15 years",
    status: "available",
    rating: 4.9,
    totalPatients: 1250,
    avatar: "/img/team-1.jpeg",
  },
  {
    id: 2,
    name: "Dr. Michael Rodriguez",
    email: "michael.r@hospital.com",
    phone: "+1 234-567-9001",
    specialty: "Neurology",
    department: "Neurology",
    experience: "12 years",
    status: "busy",
    rating: 4.7,
    totalPatients: 980,
    avatar: "/img/team-2.jpeg",
  },
  {
    id: 3,
    name: "Dr. Emily Chen",
    email: "emily.chen@hospital.com",
    phone: "+1 234-567-9002",
    specialty: "Pediatrics",
    department: "Pediatrics",
    experience: "8 years",
    status: "available",
    rating: 5.0,
    totalPatients: 750,
    avatar: "/img/team-3.jpeg",
  },
  {
    id: 4,
    name: "Dr. James Thompson",
    email: "james.t@hospital.com",
    phone: "+1 234-567-9003",
    specialty: "Orthopedics",
    department: "Orthopedics",
    experience: "20 years",
    status: "available",
    rating: 4.8,
    totalPatients: 1500,
    avatar: "/img/team-4.jpeg",
  },
];

export const appointmentsData: Appointment[] = [
  {
    id: 1,
    patientName: "John Doe",
    doctorName: "Dr. Sarah Mitchell",
    department: "Cardiology",
    date: "2024-11-02",
    time: "2:00 PM",
    status: "confirmed",
    reason: "Regular checkup",
    phone: "+1 234-567-8900",
  },
  {
    id: 2,
    patientName: "Jane Smith",
    doctorName: "Dr. Emily Chen",
    department: "Pediatrics",
    date: "2024-11-02",
    time: "5:30 PM",
    status: "pending",
    reason: "Child vaccination",
    phone: "+1 234-567-8901",
  },
  {
    id: 3,
    patientName: "Robert Johnson",
    doctorName: "Dr. Michael Rodriguez",
    department: "Neurology",
    date: "2024-11-03",
    time: "10:00 AM",
    status: "confirmed",
    reason: "Follow-up consultation",
    phone: "+1 234-567-8902",
  },
  {
    id: 4,
    patientName: "Emily Davis",
    doctorName: "Dr. James Thompson",
    department: "Orthopedics",
    date: "2024-11-04",
    time: "8:30 AM",
    status: "pending",
    reason: "Knee pain consultation",
    phone: "+1 234-567-8903",
  },
  {
    id: 5,
    patientName: "Michael Brown",
    doctorName: "Dr. Sarah Mitchell",
    department: "Cardiology",
    date: "2024-11-04",
    time: "12:00 PM",
    status: "confirmed",
    reason: "Heart checkup",
    phone: "+1 234-567-8904",
  },
  {
    id: 6,
    patientName: "Sarah Wilson",
    doctorName: "Dr. Emily Chen",
    department: "Pediatrics",
    date: "2024-11-05",
    time: "3:00 PM",
    status: "confirmed",
    reason: "Child wellness exam",
    phone: "+1 234-567-8905",
  },
  {
    id: 7,
    patientName: "David Lee",
    doctorName: "Dr. James Thompson",
    department: "Orthopedics",
    date: "2024-11-05",
    time: "4:30 PM",
    status: "pending",
    reason: "Back pain",
    phone: "+1 234-567-8906",
  },
  {
    id: 8,
    patientName: "Lisa Anderson",
    doctorName: "Dr. Michael Rodriguez",
    department: "Neurology",
    date: "2024-11-06",
    time: "5:00 PM",
    status: "confirmed",
    reason: "Headache consultation",
    phone: "+1 234-567-8907",
  },
  {
    id: 9,
    patientName: "James Taylor",
    doctorName: "Dr. Sarah Mitchell",
    department: "Cardiology",
    date: "2024-11-07",
    time: "1:00 PM",
    status: "confirmed",
    reason: "Cardiac screening",
    phone: "+1 234-567-8908",
  },
  {
    id: 10,
    patientName: "Maria Garcia",
    doctorName: "Dr. Emily Chen",
    department: "Pediatrics",
    date: "2024-11-09",
    time: "9:30 AM",
    status: "pending",
    reason: "Vaccination",
    phone: "+1 234-567-8909",
  },
  {
    id: 11,
    patientName: "Thomas Martinez",
    doctorName: "Dr. Emily Chen",
    department: "Pediatrics",
    date: "2024-11-09",
    time: "10:00 AM",
    status: "confirmed",
    reason: "Child checkup",
    phone: "+1 234-567-8910",
  },
  {
    id: 12,
    patientName: "Jennifer White",
    doctorName: "Dr. James Thompson",
    department: "Orthopedics",
    date: "2024-11-10",
    time: "9:30 AM",
    status: "confirmed",
    reason: "Joint pain",
    phone: "+1 234-567-8911",
  },
  {
    id: 13,
    patientName: "Christopher Harris",
    doctorName: "Dr. Michael Rodriguez",
    department: "Neurology",
    date: "2024-11-11",
    time: "3:00 PM",
    status: "pending",
    reason: "Neurological exam",
    phone: "+1 234-567-8912",
  },
  {
    id: 14,
    patientName: "Amanda Clark",
    doctorName: "Dr. Sarah Mitchell",
    department: "Cardiology",
    date: "2024-11-12",
    time: "1:00 PM",
    status: "confirmed",
    reason: "ECG test",
    phone: "+1 234-567-8913",
  },
  {
    id: 15,
    patientName: "Daniel Lewis",
    doctorName: "Dr. Sarah Mitchell",
    department: "Cardiology",
    date: "2024-11-12",
    time: "1:30 PM",
    status: "pending",
    reason: "Blood pressure check",
    phone: "+1 234-567-8914",
  },
  {
    id: 16,
    patientName: "Patricia Walker",
    doctorName: "Dr. Emily Chen",
    department: "Pediatrics",
    date: "2024-11-13",
    time: "5:30 PM",
    status: "confirmed",
    reason: "Child development",
    phone: "+1 234-567-8915",
  },
  {
    id: 17,
    patientName: "Mark Hall",
    doctorName: "Dr. James Thompson",
    department: "Orthopedics",
    date: "2024-11-14",
    time: "4:30 PM",
    status: "confirmed",
    reason: "Sports injury",
    phone: "+1 234-567-8916",
  },
  {
    id: 18,
    patientName: "Nancy Allen",
    doctorName: "Dr. Michael Rodriguez",
    department: "Neurology",
    date: "2024-11-15",
    time: "1:00 PM",
    status: "pending",
    reason: "Memory assessment",
    phone: "+1 234-567-8917",
  },
  {
    id: 19,
    patientName: "Steven Young",
    doctorName: "Dr. Sarah Mitchell",
    department: "Cardiology",
    date: "2024-11-16",
    time: "2:30 PM",
    status: "confirmed",
    reason: "Heart monitoring",
    phone: "+1 234-567-8918",
  },
  {
    id: 20,
    patientName: "Karen King",
    doctorName: "Dr. Emily Chen",
    department: "Pediatrics",
    date: "2024-11-16",
    time: "5:30 PM",
    status: "confirmed",
    reason: "Pediatric consultation",
    phone: "+1 234-567-8919",
  },
  {
    id: 21,
    patientName: "Paul Wright",
    doctorName: "Dr. James Thompson",
    department: "Orthopedics",
    date: "2024-11-18",
    time: "6:30 PM",
    status: "confirmed",
    reason: "Fracture follow-up",
    phone: "+1 234-567-8920",
  },
  {
    id: 22,
    patientName: "Betty Scott",
    doctorName: "Dr. Michael Rodriguez",
    department: "Neurology",
    date: "2024-11-20",
    time: "11:30 AM",
    status: "pending",
    reason: "Headache evaluation",
    phone: "+1 234-567-8921",
  },
  {
    id: 23,
    patientName: "Gary Green",
    doctorName: "Dr. Michael Rodriguez",
    department: "Neurology",
    date: "2024-11-20",
    time: "12:30 PM",
    status: "confirmed",
    reason: "Neurological consultation",
    phone: "+1 234-567-8922",
  },
  {
    id: 24,
    patientName: "Donna Adams",
    doctorName: "Dr. Sarah Mitchell",
    department: "Cardiology",
    date: "2024-11-21",
    time: "8:30 AM",
    status: "confirmed",
    reason: "Cardiac consultation",
    phone: "+1 234-567-8923",
  },
  {
    id: 25,
    patientName: "Kevin Baker",
    doctorName: "Dr. Sarah Mitchell",
    department: "Cardiology",
    date: "2024-11-21",
    time: "9:00 AM",
    status: "pending",
    reason: "Heart health check",
    phone: "+1 234-567-8924",
  },
  {
    id: 26,
    patientName: "Ruth Nelson",
    doctorName: "Dr. Emily Chen",
    department: "Pediatrics",
    date: "2024-11-22",
    time: "9:00 AM",
    status: "confirmed",
    reason: "Child wellness",
    phone: "+1 234-567-8925",
  },
];

export const departmentsData: Department[] = [
  {
    id: 1,
    name: "Cardiology",
    description: "Heart and cardiovascular care",
    head: "Dr. Sarah Mitchell",
    totalDoctors: 8,
    totalPatients: 1250,
    status: "active",
    icon: "fa-heartbeat",
  },
  {
    id: 2,
    name: "Neurology",
    description: "Brain and nervous system care",
    head: "Dr. Michael Rodriguez",
    totalDoctors: 6,
    totalPatients: 980,
    status: "active",
    icon: "fa-brain",
  },
  {
    id: 3,
    name: "Pediatrics",
    description: "Child healthcare",
    head: "Dr. Emily Chen",
    totalDoctors: 10,
    totalPatients: 750,
    status: "active",
    icon: "fa-baby",
  },
  {
    id: 4,
    name: "Orthopedics",
    description: "Musculoskeletal care",
    head: "Dr. James Thompson",
    totalDoctors: 7,
    totalPatients: 1500,
    status: "active",
    icon: "fa-bone",
  },
  {
    id: 5,
    name: "Oncology",
    description: "Cancer care",
    head: "Dr. Robert Kim",
    totalDoctors: 5,
    totalPatients: 600,
    status: "active",
    icon: "fa-shield-alt",
  },
  {
    id: 6,
    name: "Emergency",
    description: "24/7 emergency care",
    head: "Dr. Lisa Anderson",
    totalDoctors: 12,
    totalPatients: 2500,
    status: "active",
    icon: "fa-ambulance",
  },
];

export const servicesData: Service[] = [
  {
    id: 1,
    name: "Cardiology Services",
    category: "Cardiology",
    description: "Comprehensive heart and cardiovascular care",
    price: 150,
    status: "active",
    icon: "fa-heartbeat",
  },
  {
    id: 2,
    name: "Neurology Services",
    category: "Neurology",
    description: "Expert care for brain and nervous system",
    price: 200,
    status: "active",
    icon: "fa-brain",
  },
  {
    id: 3,
    name: "Pediatric Services",
    category: "Pediatrics",
    description: "Specialized healthcare for children",
    price: 120,
    status: "active",
    icon: "fa-baby",
  },
  {
    id: 4,
    name: "Orthopedic Services",
    category: "Orthopedics",
    description: "Complete musculoskeletal care",
    price: 180,
    status: "active",
    icon: "fa-bone",
  },
];

export const staffData: StaffMember[] = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice.j@hospital.com",
    phone: "+1 234-567-8000",
    role: "Nurse",
    department: "Cardiology",
    status: "active",
    shift: "Day",
    avatar: "/img/team-1.jpeg",
  },
  {
    id: 2,
    name: "Bob Williams",
    email: "bob.w@hospital.com",
    phone: "+1 234-567-8001",
    role: "Receptionist",
    department: "General",
    status: "active",
    shift: "Day",
    avatar: "/img/team-2.jpeg",
  },
  {
    id: 3,
    name: "Carol Brown",
    email: "carol.b@hospital.com",
    phone: "+1 234-567-8002",
    role: "Pharmacist",
    department: "Pharmacy",
    status: "active",
    shift: "Day",
    avatar: "/img/team-3.jpeg",
  },
];

export const billingData: Bill[] = [
  {
    id: 1,
    invoiceNo: "INV-2024-001",
    patientName: "John Doe",
    date: "2024-01-20",
    amount: 450.00,
    status: "paid",
    paymentMethod: "Credit Card",
  },
  {
    id: 2,
    invoiceNo: "INV-2024-002",
    patientName: "Jane Smith",
    date: "2024-01-21",
    amount: 320.00,
    status: "pending",
    paymentMethod: "Cash",
  },
  {
    id: 3,
    invoiceNo: "INV-2024-003",
    patientName: "Robert Johnson",
    date: "2024-01-22",
    amount: 680.00,
    status: "paid",
    paymentMethod: "Insurance",
  },
];

export const inventoryData: InventoryItem[] = [
  {
    id: 1,
    itemName: "Surgical Masks",
    category: "Medical Supplies",
    quantity: 5000,
    unit: "pieces",
    status: "in_stock",
    supplier: "MedSupply Co.",
    lastRestocked: "2024-01-15",
  },
  {
    id: 2,
    itemName: "Antibiotics",
    category: "Medications",
    quantity: 150,
    unit: "boxes",
    status: "low_stock",
    supplier: "PharmaCorp",
    lastRestocked: "2024-01-10",
  },
  {
    id: 3,
    itemName: "Bandages",
    category: "Medical Supplies",
    quantity: 2000,
    unit: "rolls",
    status: "in_stock",
    supplier: "MedSupply Co.",
    lastRestocked: "2024-01-18",
  },
];

export const testimonialsData: Testimonial[] = [
  {
    id: 1,
    patientName: "John Doe",
    rating: 5,
    comment: "Excellent service and care. Highly recommended!",
    date: "2024-01-15",
    status: "approved",
    avatar: "/img/team-1.jpeg",
  },
  {
    id: 2,
    patientName: "Jane Smith",
    rating: 5,
    comment: "The doctors are very professional and caring.",
    date: "2024-01-18",
    status: "approved",
    avatar: "/img/team-2.jpeg",
  },
  {
    id: 3,
    patientName: "Robert Johnson",
    rating: 4,
    comment: "Good facilities and staff.",
    date: "2024-01-20",
    status: "pending",
    avatar: "/img/team-3.jpeg",
  },
];

export const faqData: FAQ[] = [
  {
    id: 1,
    question: "What are your operating hours?",
    answer: "We are open Monday to Saturday from 9 AM to 7 PM.",
    category: "General",
    status: "active",
  },
  {
    id: 2,
    question: "Do you accept insurance?",
    answer: "Yes, we accept most major insurance plans.",
    category: "Billing",
    status: "active",
  },
  {
    id: 3,
    question: "How do I book an appointment?",
    answer: "You can book online through our website or call our reception.",
    category: "Appointments",
    status: "active",
  },
];

export const roomsData: Room[] = [
  {
    id: 1,
    roomNumber: "101",
    roomType: "General Ward",
    bedCount: 4,
    occupiedBeds: 2,
    status: "available",
    floor: 1,
  },
  {
    id: 2,
    roomNumber: "201",
    roomType: "Private Room",
    bedCount: 1,
    occupiedBeds: 1,
    status: "occupied",
    floor: 2,
  },
  {
    id: 3,
    roomNumber: "301",
    roomType: "ICU",
    bedCount: 2,
    occupiedBeds: 1,
    status: "available",
    floor: 3,
  },
];

export interface Prescription {
  id: number;
  patientName: string;
  doctorName: string;
  date: string;
  medicines: string;
  status: string;
}

export const prescriptionsData: Prescription[] = [
  {
    id: 1,
    patientName: "John Doe",
    doctorName: "Dr. Sarah Mitchell",
    date: "2024-01-20",
    medicines: "Amoxicillin (500mg), Paracetamol (650mg)",
    status: "active",
  },
  {
    id: 2,
    patientName: "Jane Smith",
    doctorName: "Dr. Emily Chen",
    date: "2024-01-21",
    medicines: "Ibuprofen (400mg), Vitamin C",
    status: "completed",
  },
  {
    id: 3,
    patientName: "Robert Johnson",
    doctorName: "Dr. Michael Rodriguez",
    date: "2024-01-22",
    medicines: "Metformin (500mg), Atorvastatin (10mg)",
    status: "active",
  },
];

export interface MedicalRecord {
  id: number;
  patientName: string;
  doctorName: string;
  diagnosis: string;
  treatment: string;
  date: string;
  status: string;
}

export const medicalRecordsData: MedicalRecord[] = [
  {
    id: 1,
    patientName: "John Doe",
    doctorName: "Dr. Sarah Mitchell",
    diagnosis: "Hypertension",
    treatment: "Lifestyle changes, Medication",
    date: "2024-01-15",
    status: "ongoing",
  },
  {
    id: 2,
    patientName: "Jane Smith",
    doctorName: "Dr. Emily Chen",
    diagnosis: "Common Cold",
    treatment: "Rest, Fluids",
    date: "2024-01-18",
    status: "resolved",
  },
  {
    id: 3,
    patientName: "Robert Johnson",
    doctorName: "Dr. Michael Rodriguez",
    diagnosis: "Migraine",
    treatment: "Pain management",
    date: "2024-01-20",
    status: "ongoing",
  },
];

export interface PatientReport {
  id: number;
  patientName: string;
  reportType: string;
  date: string;
  doctorName: string;
  status: string;
  fileUrl: string;
}

export const patientReportsData: PatientReport[] = [
  {
    id: 1,
    patientName: "John Doe",
    reportType: "Blood Test",
    date: "2024-01-20",
    doctorName: "Dr. Sarah Mitchell",
    status: "available",
    fileUrl: "#",
  },
  {
    id: 2,
    patientName: "Jane Smith",
    reportType: "X-Ray",
    date: "2024-01-21",
    doctorName: "Dr. James Thompson",
    status: "available",
    fileUrl: "#",
  },
  {
    id: 3,
    patientName: "Robert Johnson",
    reportType: "MRI Scan",
    date: "2024-01-22",
    doctorName: "Dr. Michael Rodriguez",
    status: "processing",
    fileUrl: "#",
  },
];

export const contactInquiriesData: ContactInquiry[] = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice@example.com",
    phone: "123-456-7890",
    subject: "Appointment Inquiry",
    message: "I would like to know if Dr. Smith is available next week.",
    date: "2024-01-25",
    status: "new",
  },
  {
    id: 2,
    name: "Bob Williams",
    email: "bob@example.com",
    phone: "987-654-3210",
    subject: "Billing Question",
    message: "I have a question about my last bill.",
    date: "2024-01-24",
    status: "in_progress",
  },
];

