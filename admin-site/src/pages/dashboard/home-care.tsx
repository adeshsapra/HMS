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
import { useToast } from "@/context/ToastContext";

export default function HomeCare() {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState("services");
    const [loading, setLoading] = useState(true);
    const [formLoading, setFormLoading] = useState(false);

    // Services State
    const [services, setServices] = useState<any[]>([]);
    const [serviceModalOpen, setServiceModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<any>(null);

    // Professionals State - Note: This would need a separate backend table or link to doctors
    const [doctorsList, setDoctorsList] = useState<any[]>([]);
    const [professionals, setProfessionals] = useState<any[]>([]);
    const [professionalModalOpen, setProfessionalModalOpen] = useState(false);
    const [selectedProfessional, setSelectedProfessional] = useState<any>(null);

    // Requests State
    const [requests, setRequests] = useState<any[]>([]);
    const [viewRequestModalOpen, setViewRequestModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);

    // Settings State
    const [settings, setSettings] = useState<any>({
        module_active: true,
        show_professionals: true,
        show_cta: true,
        features_enabled: true,
        professionals_enabled: true,
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            await Promise.all([
                loadServices(),
                loadRequests(),
                loadSettings(),
                loadDoctors(),
                loadProfessionals()
            ]);
        } catch (error: any) {
            console.error('Error loading data:', error);
            showToast('Failed to load data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadServices = async () => {
        try {
            const response = await apiService.getHomeCareServices();
            if (response.success && response.data) {
                setServices(response.data);
            }
        } catch (error: any) {
            console.error('Error loading services:', error);
            showToast('Failed to load services', 'error');
        }
    };

    const loadRequests = async () => {
        try {
            const response = await apiService.getHomeCareRequests();
            if (response.success && response.data) {
                setRequests(response.data);
            }
        } catch (error: any) {
            console.error('Error loading requests:', error);
            showToast('Failed to load requests', 'error');
        }
    };

    const loadSettings = async () => {
        try {
            const response = await apiService.getHomeCareSettings();
            if (response.success && response.data) {
                setSettings((prev: any) => ({ ...prev, ...response.data }));
            }
        } catch (error: any) {
            console.error('Error loading settings:', error);
            showToast('Failed to load settings', 'error');
        }
    };

    const loadDoctors = async () => {
        try {
            const response = await apiService.getDoctors();
            if (response.success && response.data) {
                setDoctorsList(response.data);
            }
        } catch (error: any) {
            console.error('Error loading doctors:', error);
        }
    };

    const loadProfessionals = async () => {
        try {
            const response = await apiService.getHomeCareProfessionals();
            if (response.success && response.data) {
                setProfessionals(response.data);
            }
        } catch (error: any) {
            console.error('Error loading professionals:', error);
            showToast('Failed to load professionals', 'error');
        }
    };

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
    const handleEditService = (item: any) => {
        setSelectedService(item);
        setServiceModalOpen(true);
    };
    const handleDeleteService = (item: any) => {
        setSelectedService(item);
        setDeleteModalOpen(true);
    };
    const confirmDeleteService = async () => {
        if (selectedService) {
            try {
                setFormLoading(true);
                const response = await apiService.deleteHomeCareService(selectedService.id);
                if (response.success) {
                    showToast('Service deleted successfully', 'success');
                    await loadServices();
                    setDeleteModalOpen(false);
                    setSelectedService(null);
                }
            } catch (error: any) {
                console.error('Error deleting service:', error);
                showToast(error.response?.data?.message || 'Failed to delete service', 'error');
            } finally {
                setFormLoading(false);
            }
        }
    };
    const handleSubmitService = async (data: any) => {
        try {
            setFormLoading(true);
            
            // Convert string booleans to actual booleans
            if (data.is_24_7 === "1" || data.is_24_7 === "true") data.is_24_7 = true;
            else if (data.is_24_7 === "0" || data.is_24_7 === "false") data.is_24_7 = false;

            if (data.is_active === "1" || data.is_active === "true") data.is_active = true;
            else if (data.is_active === "0" || data.is_active === "false") data.is_active = false;

            // Handle benefits - convert comma-separated string to array
            if (data.benefits && typeof data.benefits === 'string') {
                data.benefits = data.benefits.split(',').map((b: string) => b.trim()).filter((b: string) => b);
            }

            // Handle image field
            if (data.image_url) {
                data.image = data.image_url;
                delete data.image_url;
            }

            // Handle descriptions
            if (data.description && !data.short_description) {
                data.short_description = data.description;
            }

            // Remove hms_service_id if not needed
            if (data.hms_service_id === "") {
                delete data.hms_service_id;
            }

            // Set default sort_order if not provided
            if (!data.sort_order && !selectedService) {
                data.sort_order = services.length > 0 ? Math.max(...services.map(s => s.sort_order || 0)) + 1 : 1;
            }

            let response;
            if (selectedService) {
                response = await apiService.updateHomeCareService(selectedService.id, data);
                showToast('Service updated successfully', 'success');
            } else {
                response = await apiService.createHomeCareService(data);
                showToast('Service created successfully', 'success');
            }

            if (response.success) {
                await loadServices();
                setServiceModalOpen(false);
                setSelectedService(null);
            }
        } catch (error: any) {
            console.error('Error saving service:', error);
            showToast(error.response?.data?.message || 'Failed to save service', 'error');
            throw error; // Re-throw to let FormModal handle it
        } finally {
            setFormLoading(false);
        }
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
        { key: "sort_order", label: "Order" },
        { key: "is_24_7", label: "24/7", render: (val: any) => val ? "Yes" : "No" },
        { key: "is_active", label: "Active", render: (val: any) => val ? <Chip value="Active" color="green" size="sm" /> : <Chip value="Inactive" color="gray" size="sm" /> },
    ];

    const serviceFormFields = [
        { name: "title", label: "Service Title", type: "text", required: true },
        { name: "category", label: "Category", type: "text", placeholder: "e.g. Nursing, Physio, Medical" },
        { name: "icon", label: "Bootstrap Icon Class", type: "text", placeholder: "e.g. bi-heart-pulse" },
        { name: "price", label: "Price Label", type: "text", placeholder: "e.g. $50 / visit or $40 / hour" },
        { name: "image_url", label: "Featured Image URL", type: "text", placeholder: "Full URL to image" },
        { name: "description", label: "Short Description", type: "textarea", placeholder: "Brief description for cards" },
        { name: "short_description", label: "Short Description (Alternative)", type: "textarea", placeholder: "If different from description" },
        { name: "long_description", label: "Detailed Description", type: "textarea", placeholder: "Full description for detail modal" },
        { name: "benefits", label: "Clinical Benefits (Comma separated)", type: "text", placeholder: "Pain Management, Post-Surgery Rehab, Mobility Improvement" },
        { name: "rating", label: "Rating (1-5)", type: "number", placeholder: "e.g. 4.8" },
        { name: "reviews_count", label: "Number of Reviews", type: "number", placeholder: "e.g. 124" },
        { name: "sort_order", label: "Sort Order", type: "number", placeholder: "Lower numbers appear first" },
        { name: "is_24_7", label: "Available 24/7", type: "select", options: [{ value: "1", label: "Yes" }, { value: "0", label: "No" }] },
        { name: "is_active", label: "Show on Main Site", type: "select", options: [{ value: "1", label: "Yes" }, { value: "0", label: "No" }] },
    ];

    // Professionals Handlers
    const handleAddProfessional = () => {
        setSelectedProfessional(null);
        setProfessionalModalOpen(true);
    };
    const handleEditProfessional = (item: any) => {
        setSelectedProfessional(item);
        setProfessionalModalOpen(true);
    };
    const handleDeleteProfessional = (item: any) => {
        setSelectedProfessional(item);
        setDeleteModalOpen(true);
    };
    const confirmDeleteProfessional = async () => {
        if (selectedProfessional) {
            try {
                setFormLoading(true);
                const response = await apiService.deleteHomeCareProfessional(selectedProfessional.id);
                if (response.success) {
                    showToast('Professional removed successfully', 'success');
                    await loadProfessionals();
                    setDeleteModalOpen(false);
                    setSelectedProfessional(null);
                }
            } catch (error: any) {
                console.error('Error deleting professional:', error);
                showToast(error.response?.data?.message || 'Failed to remove professional', 'error');
            } finally {
                setFormLoading(false);
            }
        }
    };
    const handleSubmitProfessional = async (data: any) => {
        try {
            setFormLoading(true);

            // Convert string booleans
            if (data.is_active === "1" || data.is_active === "true") data.is_active = true;
            else if (data.is_active === "0" || data.is_active === "false") data.is_active = false;

            // Set default sort_order if not provided
            if (!data.sort_order && !selectedProfessional) {
                data.sort_order = professionals.length > 0 ? Math.max(...professionals.map((p: any) => p.sort_order || 0)) + 1 : 1;
            }

            // Convert rating to number if provided
            if (data.home_care_rating && typeof data.home_care_rating === 'string') {
                data.home_care_rating = parseFloat(data.home_care_rating);
            }

            let response;
            if (selectedProfessional) {
                response = await apiService.updateHomeCareProfessional(selectedProfessional.id, data);
                showToast('Professional updated successfully', 'success');
            } else {
                // Ensure doctor_id is provided
                if (!data.doctor_id) {
                    showToast('Please select a doctor', 'error');
                    throw new Error('Doctor is required');
                }
                response = await apiService.createHomeCareProfessional(data);
                showToast('Professional assigned successfully', 'success');
            }

            if (response.success) {
                await loadProfessionals();
                setProfessionalModalOpen(false);
                setSelectedProfessional(null);
            }
        } catch (error: any) {
            console.error('Error saving professional:', error);
            showToast(error.response?.data?.message || 'Failed to save professional', 'error');
            throw error;
        } finally {
            setFormLoading(false);
        }
    };

    const professionalColumns = [
        {
            key: "name", label: "Expert Name", render: (val: any, row: any) => (
                <div className="flex flex-col">
                    <span className="font-bold">{val}</span>
                    {row.doctor_id && (
                        <span className="text-[10px] text-blue-500 uppercase tracking-tighter">Doctor ID: {row.doctor_id}</span>
                    )}
                </div>
            )
        },
        { key: "specialization", label: "Clinical Role", render: (val: any) => val || 'N/A' },
        { key: "experience_years", label: "Experience", render: (val: any) => val ? `${val} Years` : 'N/A' },
        { key: "home_care_rating", label: "Rating", render: (val: any) => {
            if (val == null) return 'N/A';
            const numVal = typeof val === 'number' ? val : parseFloat(String(val));
            return isNaN(numVal) ? 'N/A' : numVal.toFixed(1);
        }},
        { key: "sort_order", label: "Order" },
        { key: "is_active", label: "Status", render: (val: any) => val ? <Chip value="Active" color="green" size="sm" /> : <Chip value="Inactive" color="gray" size="sm" /> },
    ];

    // Filter out doctors that are already assigned
    const availableDoctors = doctorsList.filter((doctor: any) => 
        !professionals.some((prof: any) => prof.doctor_id === doctor.id)
    );

    const professionalFormFields = [
        {
            name: "doctor_id",
            label: "Select Doctor from HMS Database",
            type: "select",
            required: true,
            options: selectedProfessional ? [
                { value: selectedProfessional.doctor_id.toString(), label: `${selectedProfessional.name} (${selectedProfessional.specialization})` }
            ] : [
                { value: "", label: "Choose a Clinical Specialist" },
                ...availableDoctors.map((d: any) => ({
                    value: d.id.toString(),
                    label: `Dr. ${d.first_name} ${d.last_name} (${d.specialization}) - ${d.experience_years || 0} Years Exp.`
                }))
            ],
            disabled: !!selectedProfessional // Can't change doctor after assignment
        },
        { name: "home_care_availability", label: "Home Visit Availability", type: "text", placeholder: "e.g. Weekends only, Mon-Fri 9am-5pm" },
        { name: "home_care_rating", label: "Home Care Rating (1-5)", type: "number", placeholder: "e.g. 4.8 (leave empty to use default)" },
        { name: "sort_order", label: "Display Order", type: "number", placeholder: "Lower numbers appear first" },
        { name: "is_active", label: "Show on Home Care Page", type: "select", options: [{ value: "1", label: "Yes" }, { value: "0", label: "No" }] },
    ];

    // Requests Handlers
    const handleStatusChange = async (id: number, newStatus: string) => {
        try {
            const response = await apiService.updateHomeCareRequestStatus(id, newStatus);
            if (response.success) {
                showToast('Request status updated', 'success');
                await loadRequests();
            }
        } catch (error: any) {
            console.error('Error updating request status:', error);
            showToast(error.response?.data?.message || 'Failed to update status', 'error');
        }
    };

    const handleViewRequest = (request: any) => {
        setSelectedRequest(request);
        setViewRequestModalOpen(true);
    };

    const requestColumns = [
        { key: "name", label: "Patient Name", render: (val: any) => <span className="font-semibold text-blue-gray-900">{val}</span> },
        { key: "phone", label: "Phone" },
        {
            key: "preferred_date", label: "Visit Date", render: (val: any) => (
                val ? <span>{new Date(val).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span> : <span className="text-gray-400">Not specified</span>
            )
        },
        {
            key: "status", label: "Status", render: (val: any, row: any) => (
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
            key: "actions", label: "Actions", render: (_: any, row: any) => (
                <IconButton variant="text" color="blue-gray" onClick={() => handleViewRequest(row)}>
                    <EyeIcon className="h-5 w-5" />
                </IconButton>
            )
        }
    ];

    // Helper to get service names from IDs
    const getRequestedServiceNames = (serviceIds: any) => {
        if (!serviceIds) return [];
        let parsedIds: any[] = [];
        try {
            parsedIds = typeof serviceIds === 'string' ? JSON.parse(serviceIds) : serviceIds;
            if (!Array.isArray(parsedIds)) parsedIds = [parsedIds]; // Handle single ID case if any
        } catch (e) {
            console.error("Error parsing service IDs", e);
            return [];
        }

        // Ensure parsedIds accounts for strings vs numbers if necessary
        return parsedIds.map((id: any) => {
            const service = services.find(s => s.id == id);
            return service ? service.title : `Service ID: ${id}`;
        });
    };

    // Settings Handler
    const handleSettingsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setFormLoading(true);
            const response = await apiService.updateHomeCareSettings(settings);
            if (response.success) {
                showToast('Settings updated successfully', 'success');
                await loadSettings();
            }
        } catch (error: any) {
            console.error('Error updating settings:', error);
            showToast(error.response?.data?.message || 'Failed to update settings', 'error');
        } finally {
            setFormLoading(false);
        }
    };


    return (
        <div className="mt-8 mb-8 flex flex-col gap-12">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: "Total Requests", value: requests.length, icon: EyeIcon, color: "blue" },
                    { label: "Active Services", value: services.filter(s => s.is_active).length, icon: PlusIcon, color: "green" },
                    { label: "Assigned Professionals", value: professionals.filter((p: any) => p.is_active).length, icon: EyeIcon, color: "purple" },
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
                                {settings.module_active !== false ?
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
                                    <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                        <Typography variant="small" className="text-blue-gray-700 font-semibold mb-1">
                                            Assign Doctors to Home Care
                                        </Typography>
                                        <Typography variant="small" className="text-blue-gray-600">
                                            Select doctors from your database to display in the Home Care professionals section. Only assigned doctors will appear on the main site.
                                        </Typography>
                                    </div>
                                    <DataTable
                                        title="Clinical Professionals"
                                        data={professionals}
                                        columns={professionalColumns}
                                        onAdd={handleAddProfessional}
                                        addButtonLabel="Assign Doctor"
                                        onEdit={handleEditProfessional}
                                        onDelete={handleDeleteProfessional}
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
                                            <Typography variant="small" className="font-bold">{settings.module_active !== false ? 'ENABLED' : 'DISABLED'}</Typography>
                                            <input
                                                type="checkbox"
                                                checked={settings.module_active !== false}
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
                                                    checked={settings.show_professionals !== false}
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
                                                    checked={settings.payment_required !== false}
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
                                                value={settings.hero_image || settings.banner_image || settings.home_care_image || ''}
                                                onChange={e => setSettings({ ...settings, hero_image: e.target.value })}
                                                className="w-full px-3 py-2.5 text-sm text-blue-gray-700 bg-white border border-blue-gray-200 rounded-lg transition-all focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-blue-gray-700 mb-2">Hero Title</label>
                                                <input
                                                    type="text"
                                                    value={settings.hero_title || ''}
                                                    onChange={e => setSettings({ ...settings, hero_title: e.target.value })}
                                                    className="w-full px-3 py-2.5 text-sm text-blue-gray-700 bg-white border border-blue-gray-200 rounded-lg transition-all focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-blue-gray-700 mb-2">Hero Subtitle</label>
                                                <input
                                                    type="text"
                                                    value={settings.hero_subtitle || ''}
                                                    onChange={e => setSettings({ ...settings, hero_subtitle: e.target.value })}
                                                    className="w-full px-3 py-2.5 text-sm text-blue-gray-700 bg-white border border-blue-gray-200 rounded-lg transition-all focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <Typography variant="h6" color="blue-gray" className="mb-3">Features Section</Typography>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-blue-gray-700 mb-2">Features Title</label>
                                                    <input
                                                        type="text"
                                                        value={settings.features_title || ''}
                                                        onChange={e => setSettings({ ...settings, features_title: e.target.value })}
                                                        className="w-full px-3 py-2.5 text-sm text-blue-gray-700 bg-white border border-blue-gray-200 rounded-lg"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-blue-gray-700 mb-2">Features Subtitle</label>
                                                    <input
                                                        type="text"
                                                        value={settings.features_subtitle || ''}
                                                        onChange={e => setSettings({ ...settings, features_subtitle: e.target.value })}
                                                        className="w-full px-3 py-2.5 text-sm text-blue-gray-700 bg-white border border-blue-gray-200 rounded-lg"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={settings.features_enabled !== 'false'}
                                                    onChange={e => setSettings({ ...settings, features_enabled: e.target.checked ? 'true' : 'false' })}
                                                    className="w-5 h-5 text-blue-500 rounded"
                                                />
                                                <label className="text-sm font-medium text-blue-gray-700">Show Features Section</label>
                                            </div>
                                        </div>

                                        <div>
                                            <Typography variant="h6" color="blue-gray" className="mb-3">Professionals Section</Typography>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-blue-gray-700 mb-2">Professionals Title</label>
                                                    <input
                                                        type="text"
                                                        value={settings.professionals_title || ''}
                                                        onChange={e => setSettings({ ...settings, professionals_title: e.target.value })}
                                                        className="w-full px-3 py-2.5 text-sm text-blue-gray-700 bg-white border border-blue-gray-200 rounded-lg"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-blue-gray-700 mb-2">Professionals Subtitle</label>
                                                    <input
                                                        type="text"
                                                        value={settings.professionals_subtitle || ''}
                                                        onChange={e => setSettings({ ...settings, professionals_subtitle: e.target.value })}
                                                        className="w-full px-3 py-2.5 text-sm text-blue-gray-700 bg-white border border-blue-gray-200 rounded-lg"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 mb-4">
                                                <input
                                                    type="checkbox"
                                                    checked={settings.professionals_enabled !== 'false'}
                                                    onChange={e => setSettings({ ...settings, professionals_enabled: e.target.checked ? 'true' : 'false' })}
                                                    className="w-5 h-5 text-blue-500 rounded"
                                                />
                                                <label className="text-sm font-medium text-blue-gray-700">Show Professionals Section</label>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-blue-gray-700 mb-2">Maximum Doctors to Display</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="12"
                                                    value={settings.professionals_limit || '4'}
                                                    onChange={e => setSettings({ ...settings, professionals_limit: e.target.value })}
                                                    className="w-full px-3 py-2.5 text-sm text-blue-gray-700 bg-white border border-blue-gray-200 rounded-lg"
                                                    placeholder="4"
                                                />
                                                <Typography variant="small" className="text-gray-500 font-normal mt-1">
                                                    Number of doctors to show (automatically pulled from active doctors in your database)
                                                </Typography>
                                            </div>
                                        </div>

                                        <div>
                                            <Typography variant="h6" color="blue-gray" className="mb-3">CTA Section</Typography>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-blue-gray-700 mb-2">CTA Title</label>
                                                    <input
                                                        type="text"
                                                        value={settings.cta_title || ''}
                                                        onChange={e => setSettings({ ...settings, cta_title: e.target.value })}
                                                        className="w-full px-3 py-2.5 text-sm text-blue-gray-700 bg-white border border-blue-gray-200 rounded-lg"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-blue-gray-700 mb-2">CTA Phone</label>
                                                    <input
                                                        type="text"
                                                        value={settings.cta_phone || ''}
                                                        onChange={e => setSettings({ ...settings, cta_phone: e.target.value })}
                                                        className="w-full px-3 py-2.5 text-sm text-blue-gray-700 bg-white border border-blue-gray-200 rounded-lg"
                                                    />
                                                </div>
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-blue-gray-700 mb-2">CTA Description</label>
                                                <textarea
                                                    value={settings.cta_description || ''}
                                                    onChange={e => setSettings({ ...settings, cta_description: e.target.value })}
                                                    className="w-full px-3 py-2.5 text-sm text-blue-gray-700 bg-white border border-blue-gray-200 rounded-lg"
                                                    rows={3}
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={settings.cta_enabled !== 'false'}
                                                    onChange={e => setSettings({ ...settings, cta_enabled: e.target.checked ? 'true' : 'false' })}
                                                    className="w-5 h-5 text-blue-500 rounded"
                                                />
                                                <label className="text-sm font-medium text-blue-gray-700">Show CTA Section</label>
                                            </div>
                                        </div>

                                    <div className="flex justify-end pt-4 gap-3">
                                        <Button 
                                            variant="text" 
                                            color="red"
                                            onClick={() => {
                                                if (confirm('Reset all settings to defaults?')) {
                                                    setSettings({
                                                        module_active: true,
                                                        show_professionals: true,
                                                        show_cta: true,
                                                        features_enabled: true,
                                                        professionals_enabled: true,
                                                    });
                                                }
                                            }}
                                            disabled={formLoading}
                                        >
                                            Reset Defaults
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="bg-blue-500 shadow-blue-500/20 hover:shadow-blue-500/40"
                                            disabled={formLoading}
                                        >
                                            {formLoading ? 'Saving...' : 'Apply Changes'}
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
                    {selectedRequest ? (
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
                                        {selectedRequest.preferred_date ? new Date(selectedRequest.preferred_date).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Not specified'}
                                    </Typography>
                                </div>
                            </div>

                            <div>
                                <Typography variant="small" color="blue-gray" className="font-semibold mb-1">
                                    Address
                                </Typography>
                                <Typography variant="paragraph" className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    {selectedRequest.address || 'Not provided'}
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

                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Typography variant="paragraph" className="text-gray-500">
                                No request selected
                            </Typography>
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
                onClose={() => {
                    setServiceModalOpen(false);
                    setSelectedService(null);
                }}
                formFields={serviceFormFields}
                initialData={selectedService ? {
                    ...selectedService,
                    image_url: selectedService.image,
                    benefits: selectedService.benefits ? (Array.isArray(selectedService.benefits) ? selectedService.benefits.join(', ') : selectedService.benefits) : '',
                    is_24_7: selectedService.is_24_7 ? "1" : "0",
                    is_active: selectedService.is_active ? "1" : "0"
                } : {}}
                onSubmit={handleSubmitService}
                title={selectedService ? "Edit Service" : "Add Service"}
                submitLabel={selectedService ? "Update" : "Add"}
                loading={formLoading}
            />
            <FormModal
                open={professionalModalOpen}
                onClose={() => {
                    setProfessionalModalOpen(false);
                    setSelectedProfessional(null);
                }}
                formFields={professionalFormFields}
                initialData={selectedProfessional ? {
                    ...selectedProfessional,
                    is_active: selectedProfessional.is_active ? "1" : "0"
                } : {}}
                onSubmit={handleSubmitProfessional}
                title={selectedProfessional ? "Edit Professional" : "Assign Doctor to Home Care"}
                submitLabel={selectedProfessional ? "Update" : "Assign"}
                loading={formLoading}
            />
            <DeleteConfirmModal
                open={deleteModalOpen && selectedProfessional && selectedProfessional.doctor_id && !selectedService}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setSelectedProfessional(null);
                }}
                onConfirm={confirmDeleteProfessional}
                title="Remove Professional"
                message="Are you sure you want to remove this doctor from the Home Care professionals section?"
                itemName={selectedProfessional?.name}
            />
            <DeleteConfirmModal
                open={deleteModalOpen && selectedService && !selectedProfessional}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDeleteService}
                title="Delete Service"
                message="Are you sure you want to delete this home care service?"
                itemName={selectedService?.title}
            />
        </div>
    );
}
