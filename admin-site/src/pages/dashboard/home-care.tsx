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
        {
            key: "home_care_rating", label: "Rating", render: (val: any) => {
                if (val == null) return 'N/A';
                const numVal = typeof val === 'number' ? val : parseFloat(String(val));
                return isNaN(numVal) ? 'N/A' : numVal.toFixed(1);
            }
        },
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
            key: "bill_id", label: "Payment", render: (val: any, row: any) => (
                row.bill ? (
                    <span
                        className={`px-2 py-1 rounded text-xs font-bold uppercase ${row.bill.status === 'paid' ? 'bg-green-100 text-green-800' :
                                row.bill.status === 'partially_paid' ? 'bg-yellow-100 text-yellow-800' :
                                    row.bill.status === 'finalized' ? 'bg-red-100 text-red-800' :
                                        'bg-gray-100 text-gray-800'
                            }`}
                    >
                        {row.bill.status === 'finalized' ? 'UNPAID' : row.bill.status.replace('_', ' ')}
                    </span>
                ) : <span className="text-gray-400 text-xs italic">No Bill</span>
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
            // First, try to handle if it is already an array of strings (names) from backend
            if (Array.isArray(serviceIds)) {
                // Check if the array contains numbers (IDs) or strings (Names)
                const isAllNumbers = serviceIds.every(id => !isNaN(parseFloat(id as any)) && isFinite(id as any));
                if (!isAllNumbers) return serviceIds; // It's already names
                parsedIds = serviceIds;
            } else if (typeof serviceIds === 'string') {
                // If it looks like a JSON array of strings/numbers
                if (serviceIds.startsWith('[') && serviceIds.endsWith(']')) {
                    const parsed = JSON.parse(serviceIds);
                    // Check logic again
                    const isAllNumbers = parsed.every((id: any) => !isNaN(parseFloat(id)) && isFinite(id));
                    if (!isAllNumbers) return parsed; // Already names
                    parsedIds = parsed;
                } else {
                    // Maybe it is a single ID as a string or a single Name as a string
                    if (!isNaN(parseFloat(serviceIds)) && isFinite(Number(serviceIds))) {
                        parsedIds = [serviceIds];
                    } else {
                        return [serviceIds]; // It is a name
                    }
                }
            } else if (typeof serviceIds === 'number') {
                parsedIds = [serviceIds];
            } else {
                // Unknown format
                return [];
            }
        } catch (e) {
            console.error("Error parsing service IDs", e);
            return [];
        }

        // Now map the IDs to names using the 'services' state
        return parsedIds.map((id: any) => {
            const service = services.find(s => s.id == id);
            return service ? service.title : `Service ID: ${id}`;
        });
    };

    const RequestDetailsModal = ({ open, handleOpen, request }: any) => {
        if (!request) return null;

        return (
            <Dialog open={open} handler={handleOpen} size="lg" className="p-0 overflow-hidden">
                <DialogHeader className="bg-gray-50 border-b border-gray-100 p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Typography variant="h5" color="blue-gray">
                            Request Details
                        </Typography>
                        <Chip
                            value={request.status}
                            color={request.status === 'completed' ? 'green' : request.status === 'pending' ? 'orange' : 'blue'}
                            className="rounded-full uppercase"
                            size="sm"
                        />
                    </div>
                    <IconButton variant="text" color="gray" onClick={handleOpen}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </IconButton>
                </DialogHeader>
                <DialogBody className="p-0 overflow-y-auto max-h-[70vh]">
                    <div className="flex flex-col md:flex-row h-full">
                        {/* Sidebar / Core Info */}
                        <div className="md:w-1/3 bg-gray-50 p-6 border-r border-gray-100 space-y-6">
                            <div>
                                <Typography variant="small" className="font-bold text-gray-500 uppercase mb-1">Patient Info</Typography>
                                <Typography variant="h6" color="blue-gray" className="mb-1">{request.name}</Typography>
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                    <i className="fas fa-phone w-4"></i> {request.phone}
                                </div>
                                {request.email && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                        <i className="fas fa-envelope w-4"></i> {request.email}
                                    </div>
                                )}
                            </div>

                            <div>
                                <Typography variant="small" className="font-bold text-gray-500 uppercase mb-1">Schedule</Typography>
                                <div className="p-3 bg-white rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-2 mb-1">
                                        <i className="far fa-calendar text-blue-500"></i>
                                        <span className="font-semibold text-gray-800">
                                            {request.preferred_date ? new Date(request.preferred_date).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <i className="far fa-clock text-blue-500"></i>
                                        <span className="text-gray-600">
                                            {request.preferred_date ? new Date(request.preferred_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Anytime'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Typography variant="small" className="font-bold text-gray-500 uppercase mb-1">Location</Typography>
                                <Typography className="text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-200">
                                    <i className="fas fa-map-marker-alt text-red-400 mr-2"></i>
                                    {request.address || 'No address provided'}
                                </Typography>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="md:w-2/3 p-6 space-y-6">
                            {/* Services Section */}
                            <div>
                                <Typography variant="h6" color="blue-gray" className="mb-3 border-b pb-2">Requested Services</Typography>
                                <div className="grid gap-3">
                                    {getRequestedServiceNames(request.services_requested).length > 0 ? (
                                        getRequestedServiceNames(request.services_requested).map((serviceName: string, idx: number) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                                                <span className="font-semibold text-blue-900">{serviceName}</span>
                                                <span className="text-xs bg-white px-2 py-1 rounded text-blue-700 border border-blue-100 font-bold">SERVICE</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center p-4 bg-gray-50 rounded-lg border border-dashed text-gray-500">
                                            No specific services listed
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Billing & Finance Section */}
                            <div>
                                <div className="flex items-center justify-between mb-3 border-b pb-2">
                                    <Typography variant="h6" color="blue-gray">Financial Overview</Typography>
                                    {request.bill && (
                                        <span className="text-xs text-gray-500 font-mono">Bill #{request.bill.bill_number}</span>
                                    )}
                                </div>

                                {request.bill ? (
                                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                        <div className="p-4 grid grid-cols-2 gap-4 bg-gray-50 border-b border-gray-100">
                                            <div>
                                                <span className="text-xs text-gray-500 uppercase font-bold">Total Amount</span>
                                                <div className="text-xl font-bold text-blue-gray-900">${parseFloat(request.bill.total_amount).toFixed(2)}</div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs text-gray-500 uppercase font-bold">Bill Status</span>
                                                <div>
                                                    <Chip
                                                        value={request.bill.status}
                                                        color={request.bill.status === 'paid' ? 'green' : 'gray'}
                                                        size="sm"
                                                        className="inline-block"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Subtotal:</span>
                                                <span className="font-semibold">${parseFloat(request.bill.sub_total).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Tax:</span>
                                                <span className="font-semibold">${parseFloat(request.bill.tax_amount || 0).toFixed(2)}</span>
                                            </div>
                                            <div className="border-t border-dashed my-2"></div>
                                            <div className="flex justify-between text-base font-bold text-blue-gray-900">
                                                <span>Total Due:</span>
                                                <span>${parseFloat(request.bill.due_amount).toFixed(2)}</span>
                                            </div>
                                        </div>

                                        {/* Payments List if available */}
                                        {request.bill.payments && request.bill.payments.length > 0 && (
                                            <div className="border-t border-gray-200 p-4 bg-gray-50">
                                                <Typography variant="small" className="font-bold text-gray-700 mb-2">Transaction History</Typography>
                                                <div className="space-y-2">
                                                    {request.bill.payments.map((payment: any, idx: number) => (
                                                        <div key={idx} className="flex justify-between items-center text-sm p-2 bg-white rounded border border-gray-200 shadow-sm">
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold text-gray-800">{payment.payment_mode ? payment.payment_mode.toUpperCase() : 'N/A'}</span>
                                                                <span className="text-xs text-gray-500">{new Date(payment.created_at).toLocaleDateString()}</span>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="font-bold text-green-600">+${parseFloat(payment.amount).toFixed(2)}</div>
                                                                <span className="text-[10px] text-gray-400 capitalize">{payment.payment_status}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-6 bg-orange-50 rounded-xl border border-orange-100 text-center">
                                        <i className="fas fa-file-invoice-dollar text-orange-300 text-3xl mb-2"></i>
                                        <Typography color="orange" className="font-semibold">No Bill Generated</Typography>
                                        <p className="text-sm text-orange-600 mt-1">This request does not have an associated bill yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </DialogBody>
            </Dialog>
        );
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

            <RequestDetailsModal
                open={viewRequestModalOpen}
                handleOpen={() => setViewRequestModalOpen(!viewRequestModalOpen)}
                request={selectedRequest}
            />

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
        </div >
    );
}
