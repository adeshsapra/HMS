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

export default function HomeCare() {
    const [activeTab, setActiveTab] = useState("services");

    // Services State
    const [services, setServices] = useState([]);
    const [serviceModalOpen, setServiceModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState(null);

    // Requests State
    const [requests, setRequests] = useState([]);
    const [viewRequestModalOpen, setViewRequestModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    // Settings State
    const [settings, setSettings] = useState({
        home_care_title: "",
        home_care_subtitle: "",
        home_care_desc: "",
        home_care_cta: "",
        home_care_image: ""
    });

    useEffect(() => {
        fetchServices();
        fetchRequests();
        fetchSettings();
    }, []);

    const fetchServices = async () => {
        try {
            const res = await apiService.getHomeCareServices();
            if (res.success) setServices(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchRequests = async () => {
        try {
            const res = await apiService.getHomeCareRequests();
            if (res.success) setRequests(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchSettings = async () => {
        try {
            const res = await apiService.getHomeCareSettings();
            if (res.success) setSettings(prev => ({ ...prev, ...res.data }));
        } catch (e) {
            console.error(e);
        }
    };

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
            await apiService.deleteHomeCareService(selectedService.id);
            fetchServices();
            setDeleteModalOpen(false);
        }
    };
    const handleSubmitService = async (data) => {
        // Handle specific field conversions if necessary
        if (data.is_24_7 === "1" || data.is_24_7 === "true") data.is_24_7 = true;
        else if (data.is_24_7 === "0" || data.is_24_7 === "false") data.is_24_7 = false;

        if (data.is_active === "1" || data.is_active === "true") data.is_active = true;
        else if (data.is_active === "0" || data.is_active === "false") data.is_active = false;

        if (selectedService) {
            await apiService.updateHomeCareService(selectedService.id, data);
        } else {
            await apiService.createHomeCareService(data);
        }
        fetchServices();
        setServiceModalOpen(false);
    };

    const serviceColumns = [
        { key: "title", label: "Title" },
        { key: "category", label: "Category" },
        { key: "is_24_7", label: "24/7", render: val => val ? "Yes" : "No" },
        { key: "is_active", label: "Active", render: val => val ? "Yes" : "No" },
    ];

    const serviceFormFields = [
        { name: "title", label: "Title", type: "text", required: true },
        { name: "description", label: "Description", type: "textarea" },
        { name: "category", label: "Category", type: "text" },
        { name: "icon", label: "Icon Class", type: "text" },
        { name: "is_24_7", label: "Available 24/7", type: "select", options: [{ value: "1", label: "Yes" }, { value: "0", label: "No" }] },
        { name: "is_active", label: "Active", type: "select", options: [{ value: "1", label: "Yes" }, { value: "0", label: "No" }] },
    ];

    // Requests Handlers
    const handleStatusChange = async (id, newStatus) => {
        await apiService.updateHomeCareRequestStatus(id, newStatus);
        fetchRequests();
    };

    const handleViewRequest = (request) => {
        setSelectedRequest(request);
        setViewRequestModalOpen(true);
    };

    const requestColumns = [
        { key: "name", label: "Patient Name", render: (val) => <span className="font-semibold text-blue-gray-900">{val}</span> },
        { key: "phone", label: "Phone" },
        {
            key: "preferred_date", label: "Preferred Date", render: (val) => (
                <span>{new Date(val).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            )
        },
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
        await apiService.updateHomeCareSettings(settings);
        alert("Settings updated!");
    };


    return (
        <div className="mt-8 mb-8 flex flex-col gap-12">
            <Card className="h-full w-full overflow-visible shadow-lg rounded-2xl border border-blue-gray-100">
                <CardHeader floated={false} shadow={false} className="rounded-none p-2 border-b border-blue-gray-50">
                    <div className="mb-4 flex flex-col justify-between gap-8 md:flex-row md:items-center p-4">
                        <div>
                            <Typography variant="h4" color="blue-gray" className="font-bold">
                                Home Care Management
                            </Typography>
                            <Typography color="gray" className="mt-1 font-normal">
                                Manage services, requests, and page content.
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
                            {["services", "requests", "settings"].map((tab) => (
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
                                        title="Home Care Services"
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
                            <TabPanel value="requests" className="p-6">
                                <DataTable
                                    title="Home Care Requests"
                                    data={requests}
                                    columns={requestColumns}
                                    searchable
                                />
                            </TabPanel>
                            <TabPanel value="settings" className="p-6">
                                <form onSubmit={handleSettingsSubmit} className="flex flex-col gap-6 max-w-4xl mx-auto p-8 border border-blue-gray-100 rounded-xl bg-white shadow-sm">
                                    <div>
                                        <Typography variant="h5" color="blue-gray" className="mb-2">
                                            Content Settings
                                        </Typography>
                                        <Typography className="text-gray-600 font-normal">
                                            Customize how the Home Care section appears on the main website.
                                        </Typography>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-blue-gray-700 mb-2">Section Title</label>
                                            <input
                                                type="text"
                                                value={settings.home_care_title || ''}
                                                onChange={e => setSettings({ ...settings, home_care_title: e.target.value })}
                                                className="w-full px-3 py-2.5 text-sm text-blue-gray-700 bg-white border border-blue-gray-200 rounded-lg transition-all focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 hover:border-blue-gray-400"
                                                placeholder="Enter section title"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-blue-gray-700 mb-2">Subtitle</label>
                                            <input
                                                type="text"
                                                value={settings.home_care_subtitle || ''}
                                                onChange={e => setSettings({ ...settings, home_care_subtitle: e.target.value })}
                                                className="w-full px-3 py-2.5 text-sm text-blue-gray-700 bg-white border border-blue-gray-200 rounded-lg transition-all focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 hover:border-blue-gray-400"
                                                placeholder="Enter subtitle"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-blue-gray-700 mb-2">Description</label>
                                        <textarea
                                            value={settings.home_care_desc || ''}
                                            onChange={e => setSettings({ ...settings, home_care_desc: e.target.value })}
                                            className="w-full px-3 py-2.5 text-sm text-blue-gray-700 bg-white border border-blue-gray-200 rounded-lg transition-all focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 hover:border-blue-gray-400 resize-none h-32"
                                            placeholder="Enter description"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-blue-gray-700 mb-2">CTA Button Text</label>
                                        <input
                                            type="text"
                                            value={settings.home_care_cta || ''}
                                            onChange={e => setSettings({ ...settings, home_care_cta: e.target.value })}
                                            className="w-full px-3 py-2.5 text-sm text-blue-gray-700 bg-white border border-blue-gray-200 rounded-lg transition-all focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 hover:border-blue-gray-400"
                                            placeholder="Enter button text"
                                        />
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        <Button
                                            type="submit"
                                            className="bg-blue-500 shadow-blue-500/20 hover:shadow-blue-500/40"
                                        >
                                            Save Changes
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
