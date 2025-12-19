import React, { useState, useEffect } from "react";
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Tabs,
    TabsHeader,
    TabsBody,
    Tab,
    TabPanel,
    Button,
    Input,
    Textarea,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Chip,
    IconButton
} from "@material-tailwind/react";
import { EyeIcon, PlusIcon } from "@heroicons/react/24/solid";
import { apiService } from "@/services/api";
import { DataTable, FormModal, DeleteConfirmModal } from "@/components";

// Mock Data Imports
import { mockServices, mockRequests, mockSettings } from "@/data/homeCareMockData";

export default function HomeCare() {
    const [activeTab, setActiveTab] = useState("services");
    const [loading, setLoading] = useState(true);

    // Services State
    const [hmsServicesList] = useState([
        { id: 201, name: "General Physiotherapy", category: "Therapy", price: 45, icon: "bi-person-arms-up" },
        { id: 202, name: "Nursing Consultation", category: "Medical", price: 55, icon: "bi-heart-pulse" },
        { id: 203, name: "Senior Health Check", category: "Elderly Care", price: 120, icon: "bi-eyeglasses" },
        { id: 204, name: "Blood Sample Collection", category: "Diagnostics", price: 30, icon: "bi-droplet" },
    ]);
    const [services, setServices] = useState(mockServices);
    const [serviceModalOpen, setServiceModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState(null);

    // Professionals State
    const [doctorsList] = useState([
        { id: 101, first_name: "Sarah", last_name: "Jenkins", specialization: "Senior ICU Nurse", experience_years: 8 },
        { id: 102, first_name: "Alan", last_name: "Grant", specialization: "General Physician", experience_years: 12 },
        { id: 103, first_name: "Emily", last_name: "Chen", specialization: "Physiotherapist", experience_years: 5 },
        { id: 104, first_name: "Marcus", last_name: "Vane", specialization: "Cardiologist", experience_years: 15 },
    ]);
    const [professionals, setProfessionals] = useState([
        { id: 1, name: "Nurse Sarah Jenkins", role: "Senior ICU Nurse", experience: "8 Years", rating: 4.9, is_active: true, doctor_id: 101 },
        { id: 2, name: "Dr. Alan Grant", role: "General Physician", experience: "12 Years", rating: 4.8, is_active: true, doctor_id: 102 },
    ]);
    const [professionalModalOpen, setProfessionalModalOpen] = useState(false);
    const [selectedProfessional, setSelectedProfessional] = useState(null);

    // Requests State
    const [requests, setRequests] = useState(mockRequests);
    const [viewRequestModalOpen, setViewRequestModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    // Settings State
    const [settings, setSettings] = useState({
        ...mockSettings,
        banner_image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=2000',
        show_professionals: true,
        show_cta: true,
        emergency_disclaimer: 'Inclusive of all essential logistics',
        payment_required: true,
        module_active: true
    });

    useEffect(() => {
        // Simulate data loading
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Services Handlers
    const handleAddService = () => {
        setSelectedService(null);
        setServiceModalOpen(true);
    };
    const handleEditService = (item) => {
        setSelectedService(item);
        setServiceModalOpen(true);
    };
    const handleDeleteService = (item) => {
        setSelectedService(item);
        setDeleteModalOpen(true);
    };
    const confirmDeleteService = async () => {
        if (selectedService) {
            setServices(prev => prev.filter(s => s.id !== selectedService.id));
            setDeleteModalOpen(false);
        }
    };
    const handleSubmitService = async (data) => {
        if (data.is_24_7 === "1" || data.is_24_7 === "true") data.is_24_7 = true;
        else if (data.is_24_7 === "0" || data.is_24_7 === "false") data.is_24_7 = false;

        if (data.is_active === "1" || data.is_active === "true") data.is_active = true;
        else if (data.is_active === "0" || data.is_active === "false") data.is_active = false;

        // Auto-fill from HMS Service if linked
        const hmsService = hmsServicesList.find(s => s.id == data.hms_service_id);
        if (hmsService && !selectedService) {
            data.title = hmsService.name;
            data.category = hmsService.category;
            data.icon = hmsService.icon;
            data.price = `$${hmsService.price} / session`;
        }

        if (selectedService) {
            setServices(prev => prev.map(s => s.id === selectedService.id ? { ...s, ...data } : s));
        } else {
            const newService = { ...data, id: Math.max(...services.map(s => s.id), 0) + 1 };
            setServices(prev => [...prev, newService]);
        }
        setServiceModalOpen(false);
    };

    const serviceColumns = [
        {
            key: "title", label: "Title", render: (val, row) => (
                <div className="flex flex-col">
                    <span className="font-bold">{val}</span>
                    {row.hms_service_id && (
                        <span className="text-[10px] text-green-600 font-bold uppercase tracking-tight">HMS Linked: {row.hms_service_id}</span>
                    )}
                </div>
            )
        },
        { key: "category", label: "Category" },
        { key: "price", label: "Price" },
        { key: "is_24_7", label: "24/7", render: val => val ? "Yes" : "No" },
        { key: "is_active", label: "Active", render: val => val ? "Yes" : "No" },
    ];

    const serviceFormFields = [
        {
            name: "hms_service_id",
            label: "Link Existing Hospital Service (Optional)",
            type: "select",
            options: [
                { value: "", label: "— Create Standalone Home Care Service —" },
                ...hmsServicesList.map(s => ({
                    value: s.id.toString(),
                    label: `${s.name} ($${s.price})`
                }))
            ]
        },
        { name: "title", label: "Service Title (Custom)", type: "text", placeholder: "Leave blank to use Hospital Service name" },
        { name: "category", label: "Category", type: "text" },
        { name: "icon", label: "Bootstrap Icon Class", type: "text" },
        { name: "price", label: "Price Label (e.g. $50 / visit)", type: "text" },
        { name: "image_url", label: "Featured Image URL", type: "text" },
        { name: "description", label: "Short Description", type: "textarea" },
        { name: "long_description", label: "Detailed Description (Full Page)", type: "textarea" },
        { name: "benefits", label: "Clinical Benefits (Comma separated)", type: "text" },
        { name: "is_24_7", label: "Available 24/7", type: "select", options: [{ value: "1", label: "Yes" }, { value: "0", label: "No" }] },
        { name: "is_active", label: "Show on Main Site", type: "select", options: [{ value: "1", label: "Yes" }, { value: "0", label: "No" }] },
    ];

    // Professionals Handlers
    const handleAddProfessional = () => {
        setSelectedProfessional(null);
        setProfessionalModalOpen(true);
    };
    const handleEditProfessional = (item) => {
        setSelectedProfessional(item);
        setProfessionalModalOpen(true);
    };
    const handleSubmitProfessional = async (data) => {
        if (data.is_active === "1" || data.is_active === "true") data.is_active = true;
        else if (data.is_active === "0" || data.is_active === "false") data.is_active = false;

        // Auto-fill from doctor if doctor_id is provided
        const doctor = doctorsList.find(d => d.id == data.doctor_id);
        if (doctor && !selectedProfessional) {
            data.name = `Dr. ${doctor.first_name} ${doctor.last_name}`;
            data.role = doctor.specialization;
            data.experience = `${doctor.experience_years} Years`;
        }

        if (selectedProfessional) {
            setProfessionals(prev => prev.map(p => p.id === selectedProfessional.id ? { ...p, ...data } : p));
        } else {
            const newProf = { ...data, id: Date.now() };
            setProfessionals(prev => [...prev, newProf]);
        }
        setProfessionalModalOpen(false);
    };

    const professionalColumns = [
        {
            key: "name", label: "Expert Name", render: (val, row) => (
                <div className="flex flex-col">
                    <span className="font-bold">{val}</span>
                    <span className="text-[10px] text-blue-500 uppercase tracking-tighter">HMS Linked: {row.doctor_id}</span>
                </div>
            )
        },
        { key: "role", label: "Clinical Role" },
        { key: "experience", label: "Experience" },
        { key: "rating", label: "Rating" },
        { key: "is_active", label: "Status", render: val => val ? <Chip value="Active" color="green" /> : <Chip value="Inactive" color="gray" /> },
    ];

    const professionalFormFields = [
        {
            name: "doctor_id",
            label: "Select Doctor from HMS Database",
            type: "select",
            required: true,
            options: [
                { value: "", label: "Choose a Clinical Specialist" },
                ...doctorsList.map(d => ({
                    value: d.id.toString(),
                    label: `Dr. ${d.first_name} ${d.last_name} (${d.specialization})`
                }))
            ]
        },
        { name: "availability", label: "Home Visit Availability (e.g. Weekends only)", type: "text" },
        { name: "rating", label: "Expert Patient Rating (1-5)", type: "text" },
        { name: "is_active", label: "Enable for Home Visits", type: "select", options: [{ value: "1", label: "Yes" }, { value: "0", label: "No" }] },
    ];

    // Requests Handlers
    const handleStatusChange = async (id, newStatus) => {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    };

    const handleViewRequest = (request) => {
        setSelectedRequest(request);
        setViewRequestModalOpen(true);
    };

    const requestColumns = [
        { key: "name", label: "Patient Name", render: (val) => <span className="font-semibold text-blue-gray-900">{val}</span> },
        { key: "phone", label: "Phone" },
        {
            key: "preferred_date", label: "Visit Date", render: (val) => (
                <span>{new Date(val).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            )
        },
        { key: "payment_status", label: "Payment", render: (val) => <Chip value={val || "Paid"} color={val === 'Unpaid' ? "red" : "green"} variant="ghost" className="text-[10px]" /> },
        {
            key: "status", label: "Status", render: (val, row) => (
                <div className="w-max">
                    <select
                        value={val}
                        onClick={(e) => e.stopPropagation()}
                        onChange={e => handleStatusChange(row.id, e.target.value)}
                        className={`p-2 rounded-lg text-xs font-semibold uppercase tracking-wider border-none focus:ring-2 cursor-pointer
                            ${val === 'pending' ? 'bg-orange-50 text-orange-900 ring-orange-200' :
                                val === 'confirmed' ? 'bg-blue-50 text-blue-900 ring-blue-200' :
                                    val === 'completed' ? 'bg-green-50 text-green-900 ring-green-200' :
                                        'bg-red-50 text-red-900 ring-red-200'
                            }`}
                    >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            )
        },
        {
            key: "actions", label: "Actions", render: (_, row) => (
                <IconButton variant="text" color="blue-gray" onClick={() => handleViewRequest(row)}>
                    <EyeIcon className="h-5 w-5" />
                </IconButton>
            )
        }
    ];

    // Helper to get service names from IDs
    const getRequestedServiceNames = (serviceIds) => {
        if (!serviceIds) return [];
        let parsedIds = [];
        try {
            parsedIds = typeof serviceIds === 'string' ? JSON.parse(serviceIds) : serviceIds;
            if (!Array.isArray(parsedIds)) parsedIds = [parsedIds]; // Handle single ID case if any
        } catch (e) {
            console.error("Error parsing service IDs", e);
            return [];
        }

        // Ensure parsedIds accounts for strings vs numbers if necessary
        return parsedIds.map(id => {
            const service = services.find(s => s.id == id);
            return service ? service.title : `Service ID: ${id}`;
        });
    };

    // Settings Handler
    const handleSettingsSubmit = async (e) => {
        e.preventDefault();
        // Mock Save
        // apiService.updateHomeCareSettings(settings);
        alert("Settings updated (Mock)!");
    };


    return (
        <div className="mt-8 mb-8 flex flex-col gap-12">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: "Total Requests", value: requests.length, icon: EyeIcon, color: "blue" },
                    { label: "Active Services", value: services.filter(s => s.is_active).length, icon: PlusIcon, color: "green" },
                    { label: "Clinical Experts", value: professionals.length, icon: EyeIcon, color: "purple" },
                    { label: "Pending Visit", value: requests.filter(r => r.status === 'pending').length, icon: PlusIcon, color: "orange" },
                ].map((stat, idx) => (
                    <Card key={idx} className="border border-blue-gray-100 shadow-sm">
                        <CardBody className="p-4 flex items-center gap-4">
                            <div className={`p-3 rounded-lg bg-${stat.color === 'purple' ? 'purple-50' : stat.color + '-50'} text-${stat.color === 'purple' ? 'purple-500' : stat.color + '-500'}`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <Typography variant="small" className="font-normal text-blue-gray-600">
                                    {stat.label}
                                </Typography>
                                <Typography variant="h4" color="blue-gray" className="font-bold text-2xl">
                                    {stat.value}
                                </Typography>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>

            <Card className="h-full w-full overflow-visible shadow-lg rounded-2xl border border-blue-gray-100">
                <CardHeader floated={false} shadow={false} className="rounded-none p-2 border-b border-blue-gray-50">
                    <div className="mb-4 flex flex-col justify-between gap-8 md:flex-row md:items-center p-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <Typography variant="h4" color="blue-gray" className="font-bold">
                                    Home Care Management
                                </Typography>
                                {settings.module_active ?
                                    <Chip value="Live" color="green" size="sm" variant="ghost" className="rounded-full" /> :
                                    <Chip value="Offline" color="gray" size="sm" variant="ghost" className="rounded-full" />
                                }
                            </div>
                            <Typography color="gray" className="mt-1 font-normal">
                                Control services, medical professionals, and patient visit requests.
                            </Typography>
                        </div>
                    </div>
                </CardHeader>
                <CardBody className="p-0">
                    <Tabs value={activeTab} className="h-full">
                        <TabsHeader
                            className="bg-transparent border-b border-blue-gray-50 px-6 rounded-none"
                            indicatorProps={{
                                className: "bg-blue-500/10 shadow-none border-b-2 border-blue-500 rounded-none !z-0",
                            }}
                        >
                            {["services", "professionals", "requests", "settings"].map((tab) => (
                                <Tab
                                    key={tab}
                                    value={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`py-4 font-semibold text-sm transition-colors duration-300 ${activeTab === tab ? "text-blue-500" : "text-blue-gray-500 hover:text-blue-700"}`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </Tab>
                            ))}
                        </TabsHeader>
                        <TabsBody animate={{ initial: { y: 20, opacity: 0 }, mount: { y: 0, opacity: 1 }, unmount: { y: 20, opacity: 0 } }}>
                            <TabPanel value="services" className="p-0">
                                <div className="p-6">
                                    <DataTable
                                        title="Service Catalog"
                                        data={services}
                                        columns={serviceColumns}
                                        onAdd={handleAddService}
                                        addButtonLabel="Add Service"
                                        onEdit={handleEditService}
                                        onDelete={handleDeleteService}
                                        searchable
                                    />
                                </div>
                            </TabPanel>
                            <TabPanel value="professionals" className="p-0">
                                <div className="p-6">
                                    <DataTable
                                        title="Clinical Professionals"
                                        data={professionals}
                                        columns={professionalColumns}
                                        onAdd={handleAddProfessional}
                                        addButtonLabel="Register Expert"
                                        onEdit={handleEditProfessional}
                                        searchable
                                    />
                                </div>
                            </TabPanel>
                            <TabPanel value="requests" className="p-6">
                                <DataTable
                                    title="Active Patient Requests"
                                    data={requests}
                                    columns={requestColumns}
                                    searchable
                                />
                            </TabPanel>
                            <TabPanel value="settings" className="p-6">
                                <form onSubmit={handleSettingsSubmit} className="flex flex-col gap-6 max-w-4xl mx-auto p-8 border border-blue-gray-100 rounded-xl bg-white shadow-sm">
                                    <div className="flex justify-between items-center bg-blue-50 p-4 rounded-xl border border-blue-100 mb-2">
                                        <div>
                                            <Typography variant="h6" color="blue-gray">Module Status</Typography>
                                            <Typography variant="small" className="text-gray-600">Toggle entire Home Care section on Main Site</Typography>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Typography variant="small" className="font-bold">{settings.module_active ? 'ENABLED' : 'DISABLED'}</Typography>
                                            <input
                                                type="checkbox"
                                                checked={settings.module_active}
                                                onChange={e => setSettings({ ...settings, module_active: e.target.checked })}
                                                className="w-6 h-6 text-blue-500 rounded-lg cursor-pointer"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Typography variant="h5" color="blue-gray" className="mb-2">
                                            Main Page Content
                                        </Typography>
                                        <Typography className="text-gray-600 font-normal">
                                            Manage headings and visibility rules for the Home Care landing area.
                                        </Typography>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-blue-gray-700 mb-2">Main Heading</label>
                                            <input
                                                type="text"
                                                value={settings.home_care_title || ''}
                                                onChange={e => setSettings({ ...settings, home_care_title: e.target.value })}
                                                className="w-full px-3 py-2.5 text-sm text-blue-gray-700 bg-white border border-blue-gray-200 rounded-lg transition-all focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-blue-gray-700 mb-2">Sub-header</label>
                                            <input
                                                type="text"
                                                value={settings.home_care_subtitle || ''}
                                                onChange={e => setSettings({ ...settings, home_care_subtitle: e.target.value })}
                                                className="w-full px-3 py-2.5 text-sm text-blue-gray-700 bg-white border border-blue-gray-200 rounded-lg transition-all focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                            <div className="flex justify-between items-center mb-1">
                                                <Typography variant="small" color="blue-gray" className="font-bold">Professional Expert Box</Typography>
                                                <input
                                                    type="checkbox"
                                                    checked={settings.show_professionals}
                                                    onChange={e => setSettings({ ...settings, show_professionals: e.target.checked })}
                                                    className="w-5 h-5 text-blue-500 rounded"
                                                />
                                            </div>
                                            <Typography variant="small" className="text-gray-500 font-normal">Display certified therapist section</Typography>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                            <div className="flex justify-between items-center mb-1">
                                                <Typography variant="small" color="blue-gray" className="font-bold">Upfront Payment</Typography>
                                                <input
                                                    type="checkbox"
                                                    checked={settings.payment_required}
                                                    onChange={e => setSettings({ ...settings, payment_required: e.target.checked })}
                                                    className="w-5 h-5 text-blue-500 rounded"
                                                />
                                            </div>
                                            <Typography variant="small" className="text-gray-500 font-normal">Require payment during booking</Typography>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-blue-gray-700 mb-2">Tax/Price Disclaimer</label>
                                        <input
                                            type="text"
                                            value={settings.emergency_disclaimer || ''}
                                            onChange={e => setSettings({ ...settings, emergency_disclaimer: e.target.value })}
                                            className="w-full px-3 py-2.5 text-sm text-blue-gray-700 bg-white border border-blue-gray-200 rounded-lg transition-all focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            placeholder="e.g. Inclusive of all taxes"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-blue-gray-700 mb-2">Hero Image URL</label>
                                        <input
                                            type="text"
                                            value={settings.banner_image || ''}
                                            onChange={e => setSettings({ ...settings, banner_image: e.target.value })}
                                            className="w-full px-3 py-2.5 text-sm text-blue-gray-700 bg-white border border-blue-gray-200 rounded-lg transition-all focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="flex justify-end pt-4 gap-3">
                                        <Button variant="text" color="red">Reset Defaults</Button>
                                        <Button
                                            type="submit"
                                            className="bg-blue-500 shadow-blue-500/20 hover:shadow-blue-500/40"
                                        >
                                            Apply Changes
                                        </Button>
                                    </div>
                                </form>
                            </TabPanel>
                        </TabsBody>
                    </Tabs>
                </CardBody>
            </Card>

            {/* View Request Modal */}
            <Dialog open={viewRequestModalOpen} handler={() => setViewRequestModalOpen(false)} size="md">
                <DialogHeader className="flex flex-col items-start gap-1 pb-4 border-b border-blue-gray-50">
                    <Typography variant="h5" color="blue-gray">
                        Request Details
                    </Typography>
                    <Typography variant="small" className="font-normal text-gray-600">
                        View patient request information and required services.
                    </Typography>
                </DialogHeader>
                <DialogBody className="p-6 overflow-y-auto max-h-[70vh]">
                    {selectedRequest && (
                        <div className="flex flex-col gap-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Typography variant="small" color="blue-gray" className="font-semibold mb-1">
                                        Patient Name
                                    </Typography>
                                    <Typography variant="paragraph" className="text-gray-700">
                                        {selectedRequest.name}
                                    </Typography>
                                </div>
                                <div>
                                    <Typography variant="small" color="blue-gray" className="font-semibold mb-1">
                                        Phone Number
                                    </Typography>
                                    <Typography variant="paragraph" className="text-gray-700">
                                        {selectedRequest.phone}
                                    </Typography>
                                </div>
                                <div>
                                    <Typography variant="small" color="blue-gray" className="font-semibold mb-1">
                                        Email
                                    </Typography>
                                    <Typography variant="paragraph" className="text-gray-700">
                                        {selectedRequest.email || "N/A"}
                                    </Typography>
                                </div>
                                <div>
                                    <Typography variant="small" color="blue-gray" className="font-semibold mb-1">
                                        Preferred Date
                                    </Typography>
                                    <Typography variant="paragraph" className="text-gray-700">
                                        {new Date(selectedRequest.preferred_date).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </Typography>
                                </div>
                            </div>

                            <div>
                                <Typography variant="small" color="blue-gray" className="font-semibold mb-1">
                                    Address
                                </Typography>
                                <Typography variant="paragraph" className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    {selectedRequest.address}
                                </Typography>
                            </div>

                            <div>
                                <Typography variant="small" color="blue-gray" className="font-semibold mb-2">
                                    Requested Services
                                </Typography>
                                <div className="flex flex-wrap gap-2">
                                    {getRequestedServiceNames(selectedRequest.services_requested).map((serviceName, index) => (
                                        <Chip key={index} value={serviceName} className="rounded-full bg-blue-50 text-blue-900 normal-case font-medium border border-blue-100" />
                                    ))}
                                    {getRequestedServiceNames(selectedRequest.services_requested).length === 0 && (
                                        <Typography variant="small" className="text-gray-500 italic">No specific services selected.</Typography>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Typography variant="small" color="blue-gray" className="font-semibold mb-1">
                                    Current Status
                                </Typography>
                                <Chip
                                    value={selectedRequest.status}
                                    className={`w-max rounded-full ${selectedRequest.status === 'pending' ? 'bg-orange-50 text-orange-900 border border-orange-100' :
                                        selectedRequest.status === 'confirmed' ? 'bg-blue-50 text-blue-900 border border-blue-100' :
                                            selectedRequest.status === 'completed' ? 'bg-green-50 text-green-900 border border-green-100' :
                                                'bg-red-50 text-red-900 border border-red-100'
                                        }`}
                                />
                            </div>

                            <div className="pt-4 border-t border-blue-gray-50">
                                <Typography variant="small" color="blue-gray" className="font-semibold mb-3">
                                    Financial Transaction (Mock)
                                </Typography>
                                <div className="bg-green-50/30 p-4 rounded-xl border border-green-100/50">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs text-gray-600 uppercase font-bold">Transaction ID</span>
                                        <span className="font-monospace text-sm">TXN-882910442</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs text-gray-600 uppercase font-bold">Amount Paid</span>
                                        <span className="font-bold text-green-700">$60.00</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-600 uppercase font-bold">Payment Method</span>
                                        <span className="text-sm">UPI / Credit Card</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogBody>
                <DialogFooter className="pt-4 border-t border-blue-gray-50">
                    <Button variant="text" color="red" onClick={() => setViewRequestModalOpen(false)} className="mr-1">
                        Close
                    </Button>
                </DialogFooter>
            </Dialog>

            <FormModal
                open={serviceModalOpen}
                onClose={() => setServiceModalOpen(false)}
                formFields={serviceFormFields}
                initialData={selectedService || {}}
                onSubmit={handleSubmitService}
                title={selectedService ? "Edit Service" : "Add Service"}
                submitLabel={selectedService ? "Update" : "Add"}
            />
            <FormModal
                open={professionalModalOpen}
                onClose={() => setProfessionalModalOpen(false)}
                formFields={professionalFormFields}
                initialData={selectedProfessional || {}}
                onSubmit={handleSubmitProfessional}
                title={selectedProfessional ? "Edit Professional" : "Add Professional"}
                submitLabel={selectedProfessional ? "Update" : "Add"}
            />
            <DeleteConfirmModal
                open={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDeleteService}
                title="Delete Service"
                message="Are you sure you want to delete this home care service?"
                itemName={selectedService?.title}
            />
        </div>
    );
}
