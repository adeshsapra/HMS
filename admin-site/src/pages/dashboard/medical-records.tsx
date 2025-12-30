import React, { useState, useEffect } from "react";
import { DataTable, FormModal, ViewModal, DeleteConfirmModal, Column, FormField, ViewField } from "@/components";
import { apiService } from "@/services/api";
import { toast } from "react-toastify";
import { patientsData, doctorsData } from "@/data/hms-data"; // Fallback/Reference
import { Button } from "@material-tailwind/react";
import { PlusIcon } from "@heroicons/react/24/outline";

interface MedicalReport {
    id: number;
    patientName: string;
    doctorName: string;
    reportType: string;
    reportTitle: string;
    date: string;
    filePath: string;
}

export default function MedicalRecords(): JSX.Element {
    const [records, setRecords] = useState<MedicalReport[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        perPage: 10
    });

    const [openModal, setOpenModal] = useState<boolean>(false);
    const [openViewModal, setOpenViewModal] = useState<boolean>(false);
    const [selectedRecord, setSelectedRecord] = useState<MedicalReport | null>(null);

    const fetchReports = async (page = 1) => {
        try {
            setLoading(true);
            const response = await apiService.getMedicalReports(page);
            if (response && response.data) {
                const paginator = response.data;
                const mappedData = paginator.data.map((r: any) => ({
                    id: r.id,
                    patientName: r.patient?.name || "Unknown",
                    doctorName: r.doctor ? `${r.doctor.first_name} ${r.doctor.last_name}` : "Unknown",
                    reportType: r.report_type,
                    reportTitle: r.report_title,
                    date: r.created_at,
                    filePath: r.file_path,
                }));

                setRecords(mappedData);
                setPagination({
                    currentPage: paginator.current_page,
                    totalPages: paginator.last_page,
                    totalItems: paginator.total,
                    perPage: paginator.per_page
                });
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load medical reports");
        } finally {
            setLoading(false);
        }
    };


    const handlePageChange = (page: number) => {
        fetchReports(page);
    };

    const columns: Column[] = [
        {
            key: "id",
            label: "ID",
            render: (value: any) => (
                <span className="font-bold text-blue-gray-800">#{value}</span>
            ),
        },
        {
            key: "patientName",
            label: "Patient",
        },
        {
            key: "reportTitle",
            label: "Title",
        },
        {
            key: "reportType",
            label: "Type",
            render: (value: any) => (
                <span className="capitalize px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-bold">
                    {value}
                </span>
            ),
        },
        {
            key: "date",
            label: "Date",
            render: (value: any) => (
                <span className="text-sm text-gray-600">
                    {new Date(value).toLocaleDateString()}
                </span>
            ),
        },
        {
            key: "filePath",
            label: "View",
            render: (value: any) => (
                <a href={`http://localhost:8000${value}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
                    Download/View
                </a>
            ),
        },
    ];

    const [patients, setPatients] = useState<any[]>([]);

    useEffect(() => {
        const fetchPatients = async () => {
            const response = await apiService.getPatients(1, 100); // Fetch enough patients
            if (response && response.data) {
                setPatients(response.data.data);
            }
        };
        fetchPatients();
        fetchReports();
    }, []);

    const formFields: FormField[] = [
        {
            name: "patient_id",
            label: "Patient",
            type: "select",
            required: true,
            options: patients.map((p) => ({ value: String(p.id), label: `${p.name} (${p.email})` })),
        },
        // We really need to fetch patients from API for this select to work properly with real IDs.
        // For now, I'll rely on what's available or assuming the user sets this up correctly.
        // Let's change the options to fetch from API in useEffect if we want perfection.
        // But for this step I'll stick to a simpler approach.
        {
            name: "report_title",
            label: "Report Title",
            type: "text",
            required: true,
            placeholder: "e.g. Blood Test Result",
        },
        {
            name: "report_type",
            label: "Report Type",
            type: "select",
            required: true,
            options: [
                { value: "blood", label: "Blood Test" },
                { value: "x-ray", label: "X-Ray" },
                { value: "mri", label: "MRI" },
                { value: "ct-scan", label: "CT Scan" },
                { value: "other", label: "Other" },
            ],
        },
        {
            name: "report_file",
            label: "Upload File",
            type: "file",
            required: true,
            accept: ".pdf,.jpg,.jpeg,.png",
        },
    ];

    const handleAdd = (): void => {
        setSelectedRecord(null);
        setOpenModal(true);
    };

    const handleView = (record: MedicalReport): void => {
        setSelectedRecord(record);
        setOpenViewModal(true);
    };

    const handleSubmit = async (data: Record<string, any>): Promise<void> => {
        try {
            const formData = new FormData();
            formData.append("patient_id", data.patient_id); // Use ID here
            formData.append("report_title", data.report_title);
            formData.append("report_type", data.report_type);
            formData.append("report_file", data.report_file);

            await apiService.createMedicalReport(formData);
            toast.success("Report uploaded successfully");
            fetchReports(pagination.currentPage);
            setOpenModal(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to upload report");
        }
    };

    const viewFields: ViewField[] = [
        { key: "patientName", label: "Patient Name" },
        { key: "doctorName", label: "Doctor Name" },
        { key: "reportTitle", label: "Report Title" },
        { key: "reportType", label: "Report Type" },
        { key: "date", label: "Date Uploaded", type: "date" },
    ];

    return (
        <div className="mt-12 mb-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-bold text-blue-gray-800 mb-2">Medical Reports</h2>
                    <p className="text-blue-gray-600 text-base">Upload and view patient test reports</p>
                </div>
                <Button
                    variant="gradient"
                    color="blue"
                    className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                    onClick={handleAdd}
                >
                    <PlusIcon className="h-5 w-5" />
                    Upload Report
                </Button>
            </div>

            <DataTable
                title="Reports List"
                data={records}
                columns={columns}
                onView={handleView}
                searchable={false}
                filterable={false}
                exportable={false}
                addButtonLabel="Upload Report"
                onAdd={handleAdd}
                pagination={{
                    currentPage: pagination.currentPage,
                    totalPages: pagination.totalPages,
                    totalItems: pagination.totalItems,
                    perPage: pagination.perPage,
                    onPageChange: handlePageChange
                }}
            />

            <FormModal
                open={openModal}
                onClose={() => {
                    setOpenModal(false);
                    setSelectedRecord(null);
                }}
                title="Upload Medical Report"
                formFields={formFields}
                onSubmit={handleSubmit}
                submitLabel="Upload"
            />

            <ViewModal
                open={openViewModal}
                onClose={() => {
                    setOpenViewModal(false);
                    setSelectedRecord(null);
                }}
                title="Report Details"
                data={selectedRecord || {}}
                fields={viewFields}
            />
        </div>
    );
}
