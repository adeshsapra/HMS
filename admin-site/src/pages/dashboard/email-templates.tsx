import React, { useState, useEffect, useMemo } from "react";
import { DataTable, FormModal, ViewModal, DeleteConfirmModal, Column, FormField, ViewField } from "@/components";
import {
    Button,
    Typography,
} from "@material-tailwind/react";
import {
    PlusIcon,
    PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import { apiService } from "@/services/api";
import { useToast } from "@/context/ToastContext";

interface EmailTemplate {
    id: number;
    name: string;
    subject: string;
    body: string;
    type: string;
    cc?: string;
    bcc?: string;
    status: boolean;
    created_at?: string;
}

export default function EmailTemplates(): JSX.Element {
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [openViewModal, setOpenViewModal] = useState<boolean>(false);
    const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
    const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
    const [openSendModal, setOpenSendModal] = useState<boolean>(false);
    const [sendFormData, setSendFormData] = useState<Record<string, any>>({});

    const { showToast } = useToast();

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const response = await apiService.getEmailTemplates();
            if (response.success) {
                setTemplates(response.data);
            }
        } catch (error: any) {
            showToast(error.message || "Failed to fetch templates", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const columns: Column[] = [
        {
            key: "name",
            label: "Name",
            render: (value: any) => (
                <span className="font-bold text-blue-gray-800">{value}</span>
            ),
        },
        {
            key: "type",
            label: "Type",
            render: (value: any) => (
                <span className="text-xs font-mono bg-blue-gray-50 px-2 py-1 rounded text-blue-gray-700">{value}</span>
            ),
        },
        {
            key: "subject",
            label: "Subject",
        },
        {
            key: "status",
            label: "Status",
            type: "status",
            render: (value: any) => (value ? "Active" : "Inactive")
        },
    ];

    const viewFields: ViewField[] = [
        { key: "name", label: "Template Name" },
        { key: "type", label: "System Type" },
        { key: "cc", label: "CC" },
        { key: "bcc", label: "BCC" },
        { key: "subject", label: "Email Subject", fullWidth: true },
        {
            key: "body",
            label: "Email Body",
            fullWidth: true,
            render: (value: any) => (
                <div className="prose max-w-none p-4 bg-gray-50 rounded-lg border border-gray-200 overflow-auto max-h-[400px]"
                    dangerouslySetInnerHTML={{ __html: value }}
                />
            )
        },
        {
            key: "status",
            label: "Status",
            type: "status",
            render: (value: any) => (value ? "Active" : "Inactive")
        },
    ];

    const formFields: FormField[] = useMemo(() => [
        {
            name: "name",
            label: "Template Name",
            type: "text",
            required: true,
            placeholder: "e.g., Welcome Email",
        },
        {
            name: "cc",
            label: "CC",
            type: "text",
            placeholder: "e.g., support@meditrust.com",
        },
        {
            name: "bcc",
            label: "BCC",
            type: "text",
            placeholder: "e.g., admin@meditrust.com",
        },
        {
            name: "subject",
            label: "Email Subject",
            type: "text",
            required: true,
            placeholder: "Enter email subject line",
            fullWidth: true,
        },
        {
            name: "body",
            label: "Template Content",
            type: "rich-text",
            required: true,
            fullWidth: true,
        },
        {
            name: "status",
            label: "Status",
            type: "select",
            required: true,
            options: [
                { value: "1", label: "Active" },
                { value: "0", label: "Inactive" },
            ],
        },
    ], []);

    const sendFormFields: FormField[] = useMemo(() => [
        {
            name: "template_id",
            label: "Select Template",
            type: "select",
            required: true,
            options: templates.map(t => ({ value: t.id.toString(), label: t.name })),
            placeholder: "Choose a template to load its content",
            fullWidth: true,
        },
        {
            name: "to",
            label: "Recipient Email (Testing)",
            type: "email",
            required: true,
            placeholder: "e.g., patient@example.com",
            fullWidth: true,
        },
        {
            name: "subject",
            label: "Email Subject",
            type: "text",
            required: true,
            fullWidth: true,
        },
        {
            name: "cc",
            label: "CC",
            type: "text",
        },
        {
            name: "bcc",
            label: "BCC",
            type: "text",
        },
        {
            name: "body",
            label: "Email Body",
            type: "rich-text",
            required: true,
        },
    ], [templates]);

    const handleAdd = (): void => {
        setSelectedTemplate(null);
        setOpenModal(true);
    };

    const handleEdit = (template: EmailTemplate): void => {
        setSelectedTemplate(template);
        setOpenModal(true);
    };

    const handleDelete = (template: EmailTemplate): void => {
        setSelectedTemplate(template);
        setOpenDeleteModal(true);
    };

    const confirmDelete = async (): Promise<void> => {
        if (selectedTemplate) {
            try {
                const response = await apiService.deleteEmailTemplate(selectedTemplate.id);
                if (response.success) {
                    showToast("Template deleted successfully", "success");
                    fetchTemplates();
                    setOpenDeleteModal(false);
                    setSelectedTemplate(null);
                }
            } catch (error: any) {
                showToast(error.message || "Failed to delete template", "error");
            }
        }
    };

    const handleView = (template: EmailTemplate): void => {
        setSelectedTemplate(template);
        setOpenViewModal(true);
    };

    const handleSubmit = async (data: Record<string, any>): Promise<void> => {
        try {
            let response;
            const payload = {
                ...data,
                status: data.status === "1"
            };

            if (selectedTemplate) {
                response = await apiService.updateEmailTemplate(selectedTemplate.id, payload as any);
            } else {
                response = await apiService.createEmailTemplate(payload as any);
            }

            if (response.success) {
                showToast(selectedTemplate ? "Template updated successfully" : "Template created successfully", "success");
                fetchTemplates();
                setOpenModal(false);
                setSelectedTemplate(null);
            }
        } catch (error: any) {
            showToast(error.message || "Failed to save template", "error");
            throw error; // Re-throw to keep modal open if server-side validation fails
        }
    };

    const handleSendMailSubmit = async (data: Record<string, any>): Promise<void> => {
        try {
            const response = await apiService.sendEmail(data as any);
            if (response.success) {
                showToast(response.message || "Email sent successfully", "success");
                setOpenSendModal(false);
                setSendFormData({});
            }
        } catch (error: any) {
            showToast(error.message || "Failed to send email", "error");
            throw error;
        }
    };

    const handleSendFormChange = (name: string, value: any, setValues: (values: any) => void) => {
        if (name === 'template_id') {
            const template = templates.find(t => t.id.toString() === value);
            if (template) {
                const updates = {
                    subject: template.subject,
                    body: template.body,
                    cc: template.cc || '',
                    bcc: template.bcc || '',
                };
                setValues(updates);
                // Sync with parent state to prevent initialData reset in FormModal's useEffect
                setSendFormData(prev => ({ ...prev, [name]: value, ...updates }));
            } else {
                setSendFormData(prev => ({ ...prev, [name]: value }));
            }
        } else {
            setSendFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    return (
        <div className="mt-12 mb-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-bold text-blue-gray-800 mb-2">Email Studio</h2>
                    <p className="text-blue-gray-600 text-base">Design and manage your communication templates</p>
                </div>
                <div className="flex gap-4">
                    <Button
                        variant="outlined"
                        color="blue"
                        className="flex items-center gap-2 shadow-sm hover:shadow-md transition-all border-2"
                        onClick={() => {
                            setSendFormData({});
                            setOpenSendModal(true);
                        }}
                    >
                        <PaperAirplaneIcon className="h-5 w-5" />
                        Send Mail
                    </Button>
                    <Button
                        variant="gradient"
                        color="blue"
                        className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                        onClick={handleAdd}
                    >
                        <PlusIcon className="h-5 w-5" />
                        Add Template
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <DataTable
                    title="Template Management"
                    data={templates}
                    columns={columns}
                    onAdd={handleAdd}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                    searchable={true}
                    addButtonLabel="Add Template"
                    searchPlaceholder="Search templates..."
                />
            )}

            <FormModal
                open={openModal}
                onClose={() => {
                    setOpenModal(false);
                    setSelectedTemplate(null);
                }}
                title={selectedTemplate ? "Edit Template" : "Add New Template"}
                formFields={formFields}
                initialData={selectedTemplate ? {
                    ...selectedTemplate,
                    status: selectedTemplate.status ? "1" : "0"
                } : { status: "1" }}
                onSubmit={handleSubmit}
                submitLabel={selectedTemplate ? "Update Template" : "Create Template"}
            />

            <ViewModal
                open={openViewModal}
                onClose={() => {
                    setOpenViewModal(false);
                    setSelectedTemplate(null);
                }}
                title="Template Details"
                data={selectedTemplate || {}}
                fields={viewFields}
            />

            <DeleteConfirmModal
                open={openDeleteModal}
                onClose={() => {
                    setOpenDeleteModal(false);
                    setSelectedTemplate(null);
                }}
                onConfirm={confirmDelete}
                title="Delete Template"
                message="Are you sure you want to delete this template? Any automated systems using this type will fail."
                itemName={selectedTemplate?.name}
            />

            <FormModal
                open={openSendModal}
                onClose={() => {
                    setOpenSendModal(false);
                    setSendFormData({});
                }}
                title="Send Test Email"
                formFields={sendFormFields}
                initialData={sendFormData}
                onSubmit={handleSendMailSubmit}
                submitLabel="Send Email Now"
                onValuesChange={handleSendFormChange}
            />
        </div>
    );
}
