import React, { useState, useEffect } from "react";
import { DataTable, FormModal, ViewModal, Column, FormField, ViewField } from "@/components";
import { apiService } from "@/services/api";
import { useToast } from "@/context/ToastContext";
import { Button, Dialog, DialogHeader, DialogBody, DialogFooter, IconButton, Typography, Input } from "@material-tailwind/react";
import { PlusIcon, ArrowDownTrayIcon, DocumentMagnifyingGlassIcon, XMarkIcon, Squares2X2Icon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

const STORAGE_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL?.replace(/\/api\/?$/, "") || "http://localhost:8000";

function getReportFileUrl(filePath: string | undefined): string {
    if (!filePath) return "#";
    if (filePath.startsWith("http")) return filePath;
    const base = STORAGE_BASE_URL.replace(/\/$/, "");
    const path = filePath.startsWith("/") ? filePath : `/${filePath}`;
    return `${base}${path}`;
}

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
    const { showToast } = useToast();
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
    const [openPreviewModal, setOpenPreviewModal] = useState<boolean>(false);
    const [previewRecord, setPreviewRecord] = useState<MedicalReport | null>(null);
    const [openCategoriesModal, setOpenCategoriesModal] = useState<boolean>(false);
    const [categoryName, setCategoryName] = useState("");
    const [categoryLabel, setCategoryLabel] = useState("");
    const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
    const [editCategoryName, setEditCategoryName] = useState("");
    const [editCategoryLabel, setEditCategoryLabel] = useState("");
    const [typeToDelete, setTypeToDelete] = useState<{ id: number; label: string } | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchReports = async (page = 1) => {
        try {
            setLoading(true);
            const response = await apiService.getMedicalReports(page);
            if (response && response.data) {
                const paginator = response.data;
                const mappedData = paginator.data.map((r: any) => ({
                    id: r.id,
                    patientName: r.patient?.name || (r.patient ? `${r.patient.first_name || ''} ${r.patient.last_name || ''}`.trim() : "Unknown") || "Unknown",
                    doctorName: r.doctor ? `${r.doctor.first_name} ${r.doctor.last_name}` : "Unknown",
                    reportType: r.report_category || r.report_type,
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
            showToast("Failed to load medical reports", "error");
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
            render: (value: any, row: MedicalReport) => (
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            setPreviewRecord(row);
                            setOpenPreviewModal(true);
                        }}
                        className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium text-sm hover:underline"
                    >
                        <DocumentMagnifyingGlassIcon className="h-4 w-4" />
                        View
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                        type="button"
                        onClick={() => handleDownload(row)}
                        className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium text-sm hover:underline"
                    >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                        Download
                    </button>
                </div>
            ),
        },
    ];

    const [patients, setPatients] = useState<any[]>([]);
    const [patientsLoading, setPatientsLoading] = useState(true);
    const [reportCategories, setReportCategories] = useState<{ id?: number; value: string; label: string; sort_order?: number }[]>([
        { id: 0, value: "lab", label: "Lab (Blood, etc.)", sort_order: 1 },
        { id: 0, value: "radiology", label: "Radiology (X-Ray, MRI, CT)", sort_order: 2 },
        { id: 0, value: "other", label: "Other", sort_order: 3 },
    ]);

    useEffect(() => {
        const fetchPatients = async () => {
            setPatientsLoading(true);
            try {
                const response = await apiService.getPatients(1, 100);
                if (response && response.data) {
                    const list = Array.isArray(response.data) ? response.data : (response.data.data || []);
                    setPatients(list);
                } else {
                    setPatients([]);
                }
            } catch (error) {
                console.error("Failed to fetch patients:", error);
                setPatients([]);
            } finally {
                setPatientsLoading(false);
            }
        };
        const fetchCategories = async () => {
            try {
                const res = await apiService.getMedicalReportCategories();
                if (res?.data && Array.isArray(res.data)) setReportCategories(res.data);
            } catch {
                // keep default static list
            }
        };
        fetchPatients();
        fetchCategories();
        fetchReports();
    }, []);

    const refetchCategories = async () => {
        try {
            const res = await apiService.getMedicalReportCategories();
            if (res?.data && Array.isArray(res.data)) setReportCategories(res.data);
        } catch {
            // ignore
        }
    };

    const patientOptions: { value: string; label: string }[] = patientsLoading
        ? [{ value: "", label: "Loading patients..." }]
        : patients.length === 0
            ? [{ value: "", label: "No patients found. Add patients in Patients module first." }]
            : patients.map((p) => {
                const name = p.name || [p.first_name, p.last_name].filter(Boolean).join(" ").trim() || "Unknown";
                return { value: String(p.id), label: `${name} (${p.email ?? "N/A"})` };
            });

    const formFields: FormField[] = [
        {
            name: "patient_id",
            label: "Patient",
            type: "select",
            required: true,
            placeholder: "Select patient",
            options: patientOptions,
            disabled: patientsLoading || patients.length === 0,
        },
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
            placeholder: "Select report type",
            options: reportCategories.map((c) => ({ value: c.value, label: c.label })),
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

    const handleDownload = async (record: MedicalReport): Promise<void> => {
        const ext = record.filePath?.split(".").pop() || "";
        const suggestedName = ext ? `${record.reportTitle}.${ext}` : record.reportTitle;
        try {
            await apiService.downloadMedicalReport(record.id, suggestedName);
            showToast("Download started", "success");
        } catch (e: any) {
            showToast(e?.message || "Download failed", "error");
        }
    };

    const handleAddCategory = async () => {
        const name = categoryName.trim().toLowerCase().replace(/\s+/g, "_");
        const label = categoryLabel.trim();
        if (!name || !label) {
            showToast("Name and label are required", "error");
            return;
        }
        try {
            await apiService.createMedicalReportCategory({ name, label });
            showToast("Type added", "success");
            setCategoryName("");
            setCategoryLabel("");
            await refetchCategories();
        } catch (e: any) {
            showToast(e?.response?.data?.errors ? Object.values(e.response.data.errors).flat().join(" ") : e?.message || "Failed to add type", "error");
        }
    };

    const handleUpdateCategory = async (id: number) => {
        const label = editCategoryLabel.trim();
        if (!label) {
            showToast("Label is required", "error");
            return;
        }
        try {
            await apiService.updateMedicalReportCategory(id, { label: label || undefined, name: editCategoryName.trim() || undefined });
            showToast("Type updated", "success");
            setEditingCategoryId(null);
            setEditCategoryName("");
            setEditCategoryLabel("");
            await refetchCategories();
        } catch (e: any) {
            showToast(e?.response?.data?.errors ? Object.values(e.response.data.errors).flat().join(" ") : e?.message || "Failed to update type", "error");
        }
    };

    const handleDeleteCategory = async () => {
        if (!typeToDelete) return;
        setDeleting(true);
        try {
            await apiService.deleteMedicalReportCategory(typeToDelete.id);
            showToast("Type deleted", "success");
            setTypeToDelete(null);
            await refetchCategories();
        } catch (e: any) {
            showToast(e?.response?.data?.message || e?.message || "Failed to delete type", "error");
        } finally {
            setDeleting(false);
        }
    };

    const handleSubmit = async (data: Record<string, any>): Promise<void> => {
        try {
            const formData = new FormData();
            formData.append("patient_id", String(data.patient_id ?? ""));
            formData.append("report_title", String(data.report_title ?? ""));
            formData.append("report_category", String(data.report_type ?? ""));
            if (data.report_file instanceof File) {
                formData.append("report_file", data.report_file);
            }

            await apiService.createMedicalReport(formData);
            showToast("Report uploaded successfully", "success");
            fetchReports(pagination.currentPage);
            setOpenModal(false);
        } catch (error) {
            console.error(error);
            showToast("Failed to upload report", "error");
        }
    };

    const viewFields: ViewField[] = [
        { key: "patientName", label: "Patient Name" },
        { key: "doctorName", label: "Doctor Name" },
        { key: "reportTitle", label: "Report Title" },
        { key: "reportType", label: "Report Type" },
        { key: "date", label: "Date Uploaded", type: "date" },
        {
            key: "filePath",
            label: "Report File",
            fullWidth: true,
            render: (value: string, row: MedicalReport) => {
                const fileName = value ? value.split("/").pop() || "Report" : "Report";
                return (
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setPreviewRecord(row);
                                setOpenPreviewModal(true);
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-sm transition-colors"
                        >
                            <DocumentMagnifyingGlassIcon className="h-5 w-5" />
                            Preview
                        </button>
                        <button
                            type="button"
                            onClick={() => handleDownload(row)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold text-sm transition-colors shadow-sm"
                        >
                            <ArrowDownTrayIcon className="h-5 w-5" />
                            Download
                        </button>
                        {value && (
                            <span className="text-xs text-gray-500 truncate max-w-[200px]" title={value}>
                                {fileName}
                            </span>
                        )}
                    </div>
                );
            },
        },
    ];

    if (loading && records.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="h-16 w-16 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
                <p className="text-slate-500 text-sm font-medium">Loading medical records…</p>
            </div>
        );
    }

    return (
        <div className="mt-12 mb-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-bold text-blue-gray-800 mb-2">Medical Reports</h2>
                    <p className="text-blue-gray-600 text-base">Upload and view patient test reports</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outlined"
                        color="blue-gray"
                        className="flex items-center gap-2"
                        onClick={() => setOpenCategoriesModal(true)}
                    >
                        <Squares2X2Icon className="h-5 w-5" />
                        Manage types
                    </Button>
                    <Button
                        variant="gradient"
                        color="blue"
                        className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                        onClick={handleAdd}
                    >
                        <PlusIcon className="h-5 w-5" />
                        Upload report
                    </Button>
                </div>
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
                headerAction={
                    <Button
                        size="sm"
                        variant="outlined"
                        color="white"
                        className="rounded-lg border-white/80 text-white hover:bg-white/20 font-medium"
                        onClick={() => setOpenCategoriesModal(true)}
                    >
                        Add type
                    </Button>
                }
            />

            <ViewModal
                open={openViewModal}
                onClose={() => {
                    setOpenViewModal(false);
                    setSelectedRecord(null);
                }}
                title="Report Details"
                subtitle={selectedRecord ? `#${selectedRecord.id} · ${selectedRecord.reportTitle}` : undefined}
                data={selectedRecord || {}}
                fields={viewFields}
                actionButton={
                    selectedRecord?.filePath ? (
                        <Button variant="gradient" color="blue" size="sm" className="rounded-lg gap-2" onClick={() => handleDownload(selectedRecord)}>
                            <ArrowDownTrayIcon className="h-4 w-4" />
                            Download report
                        </Button>
                    ) : undefined
                }
            />

            {/* Document Preview Modal – no redirect, inline PDF/image */}
            <Dialog
                open={openPreviewModal}
                handler={() => {
                    setOpenPreviewModal(false);
                    setPreviewRecord(null);
                }}
                size="xl"
                className="!max-w-6xl"
            >
                <DialogHeader className="flex items-center justify-between border-b border-blue-gray-100">
                    <div>
                        <Typography variant="h5" color="blue-gray" className="font-bold">
                            Document Preview
                        </Typography>
                        {previewRecord && (
                            <Typography variant="small" color="gray" className="font-normal mt-0.5">
                                {previewRecord.reportTitle} · {previewRecord.patientName}
                            </Typography>
                        )}
                    </div>
                    <IconButton
                        variant="text"
                        size="sm"
                        onClick={() => {
                            setOpenPreviewModal(false);
                            setPreviewRecord(null);
                        }}
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </IconButton>
                </DialogHeader>
                <DialogBody className="p-0 bg-blue-gray-50 min-h-[60vh] flex items-center justify-center">
                    {previewRecord?.filePath ? (
                        (() => {
                            const url = getReportFileUrl(previewRecord.filePath);
                            const isPdf = /\.pdf$/i.test(previewRecord.filePath);
                            return isPdf ? (
                                <iframe
                                    src={url}
                                    title={previewRecord.reportTitle}
                                    className="w-full h-[70vh] border-0 rounded-b-xl"
                                />
                            ) : (
                                <img
                                    src={url}
                                    alt={previewRecord.reportTitle}
                                    className="max-w-full max-h-[70vh] w-auto object-contain"
                                />
                            );
                        })()
                    ) : (
                        <Typography color="gray" className="p-8">
                            No document to preview.
                        </Typography>
                    )}
                </DialogBody>
                <DialogFooter className="border-t border-blue-gray-100 flex justify-between">
                    <Typography variant="small" color="gray">
                        {previewRecord?.filePath && (
                            <span className="truncate max-w-[280px] inline-block" title={previewRecord.filePath}>
                                {previewRecord.filePath.split("/").pop()}
                            </span>
                        )}
                    </Typography>
                    <div className="flex gap-2">
                        <Button variant="text" color="blue-gray" onClick={() => { setOpenPreviewModal(false); setPreviewRecord(null); }}>
                            Close
                        </Button>
                        {previewRecord?.filePath && (
                            <Button variant="gradient" color="blue" size="sm" className="gap-2" onClick={() => previewRecord && handleDownload(previewRecord)}>
                                <ArrowDownTrayIcon className="h-4 w-4" />
                                Download
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </Dialog>

            {/* Manage report types modal */}
            <Dialog open={openCategoriesModal} handler={() => { setOpenCategoriesModal(false); refetchCategories(); }} size="md" className="!max-w-lg">
                <DialogHeader className="flex items-center justify-between border-b">
                    <div>
                        <Typography variant="h5" color="blue-gray">Report types</Typography>
                        <Typography variant="small" color="gray" className="font-normal">Add or edit types for report uploads</Typography>
                    </div>
                    <IconButton variant="text" size="sm" onClick={() => setOpenCategoriesModal(false)}>
                        <XMarkIcon className="h-5 w-5" />
                    </IconButton>
                </DialogHeader>
                <DialogBody className="space-y-6">
                    <div className="flex flex-wrap items-end gap-3">
                        <Input
                            label="Name (slug)"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            className="min-w-[120px]"
                            containerProps={{ className: "min-w-0 flex-1" }}
                            crossOrigin={undefined}
                        />
                        <Input
                            label="Label"
                            value={categoryLabel}
                            onChange={(e) => setCategoryLabel(e.target.value)}
                            className="min-w-[140px]"
                            containerProps={{ className: "min-w-0 flex-1" }}
                            crossOrigin={undefined}
                        />
                        <Button size="md" color="blue" className="shrink-0 gap-1" onClick={handleAddCategory}>
                            <PlusIcon className="h-4 w-4" />
                            Add type
                        </Button>
                    </div>
                    <div>
                        <Typography variant="small" color="gray" className="mb-2 block font-semibold uppercase">Current types</Typography>
                        <ul className="divide-y divide-blue-gray-100 rounded-lg border border-blue-gray-100">
                            {reportCategories.map((c) => (
                                <li key={c.id ? String(c.id) : c.value} className="flex items-center justify-between gap-2 px-3 py-2.5">
                                    {editingCategoryId === c.id && c.id != null ? (
                                        <>
                                            <Input
                                                size="md"
                                                label="Name"
                                                value={editCategoryName}
                                                onChange={(e) => setEditCategoryName(e.target.value)}
                                                className="!min-w-0 flex-1"
                                                containerProps={{ className: "flex-1 min-w-0" }}
                                                crossOrigin={undefined}
                                            />
                                            <Input
                                                size="md"
                                                label="Label"
                                                value={editCategoryLabel}
                                                onChange={(e) => setEditCategoryLabel(e.target.value)}
                                                className="!min-w-0 flex-1"
                                                containerProps={{ className: "flex-1 min-w-0" }}
                                                crossOrigin={undefined}
                                            />
                                            <Button size="sm" color="green" onClick={() => c.id != null && handleUpdateCategory(c.id)}>Save</Button>
                                            <Button size="sm" variant="text" color="blue-gray" onClick={() => { setEditingCategoryId(null); setEditCategoryName(""); setEditCategoryLabel(""); }}>Cancel</Button>
                                        </>
                                    ) : (
                                        <>
                                            <span className="font-medium text-blue-gray-800">{c.label}</span>
                                            <span className="text-xs text-gray-500">({c.value})</span>
                                            {c.id != null && c.id > 0 && (
                                                <div className="flex gap-1">
                                                    <IconButton variant="text" size="sm" color="blue-gray" onClick={() => { setEditingCategoryId(c.id!); setEditCategoryName(c.value); setEditCategoryLabel(c.label); }}>
                                                        <PencilIcon className="h-4 w-4" />
                                                    </IconButton>
                                                    <IconButton variant="text" size="sm" color="red" onClick={() => setTypeToDelete({ id: c.id!, label: c.label })}>
                                                        <TrashIcon className="h-4 w-4" />
                                                    </IconButton>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </DialogBody>
                <DialogFooter className="border-t">
                    <Button variant="text" color="blue-gray" onClick={() => { setOpenCategoriesModal(false); refetchCategories(); }}>Close</Button>
                </DialogFooter>
            </Dialog>

            {/* Delete type confirmation modal */}
            <Dialog open={!!typeToDelete} handler={() => !deleting && setTypeToDelete(null)} size="xs" className="!max-w-sm">
                <DialogHeader className="border-b">
                    <Typography variant="h6" color="blue-gray">Delete type?</Typography>
                    <IconButton variant="text" size="sm" onClick={() => !deleting && setTypeToDelete(null)}>
                        <XMarkIcon className="h-5 w-5" />
                    </IconButton>
                </DialogHeader>
                <DialogBody>
                    <Typography color="blue-gray">
                        Delete type &quot;{typeToDelete?.label}&quot;? This will fail if any report uses it.
                    </Typography>
                </DialogBody>
                <DialogFooter className="border-t flex gap-2">
                    <Button variant="text" color="blue-gray" onClick={() => setTypeToDelete(null)} disabled={deleting}>
                        Cancel
                    </Button>
                    <Button variant="filled" color="red" onClick={handleDeleteCategory} disabled={deleting}>
                        {deleting ? "Deleting…" : "Delete"}
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
}
