import React, { useState, useEffect } from "react";
import { DataTable, Column } from "@/components";
import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Typography,
    Chip,
    IconButton
} from "@material-tailwind/react";
import { DocumentArrowDownIcon, CheckBadgeIcon, EyeIcon } from "@heroicons/react/24/outline";
import { apiService } from "@/services/api";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
export default function PatientReports(): JSX.Element {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [openViewModal, setOpenViewModal] = useState<boolean>(false);
    const [selectedReport, setSelectedReport] = useState<any | null>(null);
    const { user } = useAuth(); // Need to access auth context
    const { showToast } = useToast();
    const isDoctor = user?.role?.name === 'doctor';

    const fetchReports = async () => {
        setLoading(true);
        try {
            // Fetch all reports using the generic endpoint
            const response = await apiService.getMedicalReports();
            if (response.status && response.data) {
                // Map the pagination data if necessary, or just the data array
                const data = response.data.data.map((report: any) => ({
                    id: report.id,
                    patientName: report.patient ? `${report.patient.first_name} ${report.patient.last_name}` : 'Unknown',
                    report_title: report.report_title,
                    report_category: report.report_category,
                    date: report.created_at,
                    doctorName: report.doctor ? `${report.doctor.first_name} ${report.doctor.last_name}` : 'N/A',
                    status: report.report_status,
                    file_path: report.file_path,
                    verified_by: report.verified_by,
                    original: report
                }));
                setReports(data);
            }
        } catch (error) {
            console.error("Failed to fetch reports", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleVerify = async () => {
        if (!selectedReport) return;
        try {
            await apiService.verifyMedicalReport(selectedReport.id, { doctor_id: user?.id });
            showToast("Report verified successfully", "success");
            setOpenViewModal(false);
            fetchReports();
        } catch (error: any) {
            console.error(error);
            showToast(error.message || "Failed to verify report", "error");
        }
    };

    const columns: Column[] = [
        {
            key: "patientName",
            label: "Patient",
            render: (value: any) => (
                <span className="font-semibold text-blue-gray-700">{value}</span>
            ),
        },
        {
            key: "report_title",
            label: "Report Title",
            render: (value: any) => (
                <span className="font-medium text-blue-gray-800">{value}</span>
            ),
        },
        {
            key: "report_category",
            label: "Category",
            render: (value: any) => (
                <span className="text-xs font-bold uppercase text-gray-500 bg-gray-100 px-2 py-1 rounded">{value}</span>
            ),
        },
        {
            key: "date",
            label: "Date",
            render: (value: any) => (
                <span className="text-sm font-medium text-blue-gray-700">
                    {new Date(value).toLocaleDateString()}
                </span>
            ),
        },
        {
            key: "doctorName",
            label: "Doctor",
        },
        {
            key: "status",
            label: "Status",
            render: (value: any) => {
                const color = value === 'verified' ? 'green' : 'amber';
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase bg-${color}-50 text-${color}-600 border border-${color}-100`}>
                        {value}
                    </span>
                );
            }
        },
        {
            key: "actions",
            label: "Action",
            render: (_, row) => (
                <div className="flex gap-2">
                    <Button variant="text" size="sm" className="flex items-center gap-2 text-blue-500" onClick={() => handleView(row)}>
                        <DocumentArrowDownIcon className="h-4 w-4" /> View
                    </Button>
                </div>
            ),
        },
    ];



    const handleView = (report: any): void => {
        setSelectedReport(report);
        setOpenViewModal(true);
    };

    return (
        <div className="mt-12 mb-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-bold text-blue-gray-800 mb-2">Patient Reports</h2>
                    <p className="text-blue-gray-600 text-base">View and verified patient medical reports</p>
                </div>
            </div>

            <DataTable
                title="Reports List"
                data={reports}
                columns={columns}
                // onView={handleView} // We are handling view via custom action
                searchable={true}
                filterable={true}
                exportable={true}
                searchPlaceholder="Search reports..."
            />

            <Dialog open={openViewModal} handler={() => setOpenViewModal(false)} size="lg">
                <DialogHeader className="justify-between">
                    Medical Report
                    <IconButton variant="text" onClick={() => setOpenViewModal(false)}>
                        <span className="text-xl">×</span>
                    </IconButton>
                </DialogHeader>
                <DialogBody className="h-[70vh] overflow-y-auto">
                    {selectedReport && (
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <Typography variant="h6" color="blue-gray">{selectedReport.report_title}</Typography>
                                    <Typography variant="small" color="gray">
                                        Patient: {selectedReport.patientName} | Doctor: {selectedReport.doctorName}
                                    </Typography>
                                    <Typography variant="small" color="gray">
                                        Category: <span className="uppercase font-bold">{selectedReport.report_category}</span>
                                    </Typography>
                                </div>
                                {selectedReport.status === 'verified' ? (
                                    <Chip color="green" value="Verified" icon={<CheckBadgeIcon className="h-4 w-4" />} />
                                ) : (
                                    <Chip color="amber" value="Pending Verification" />
                                )}
                            </div>

                            <div className="border rounded p-2 bg-gray-50 flex justify-center min-h-[300px] items-center">
                                {selectedReport.file_path ? (
                                    selectedReport.file_path.endsWith('.pdf') ? (
                                        <iframe
                                            src={`http://localhost:8000/storage/${selectedReport.file_path}`}
                                            className="w-full h-[60vh]"
                                            title="Report PDF"
                                        />
                                    ) : (
                                        <img
                                            src={`http://localhost:8000/storage/${selectedReport.file_path}`}
                                            alt="Report"
                                            className="max-h-[60vh] object-contain"
                                        />
                                    )
                                ) : (
                                    <span className="text-gray-400">No file available</span>
                                )}
                            </div>
                        </div>
                    )}
                </DialogBody>
                <DialogFooter>
                    <Button variant="text" onClick={() => setOpenViewModal(false)} className="mr-1">Close</Button>
                    {selectedReport?.status !== 'verified' && isDoctor && (
                        <Button variant="gradient" color="green" onClick={handleVerify}>
                            VERIFY REPORT
                        </Button>
                    )}
                </DialogFooter>
            </Dialog>
        </div>
    );
}
