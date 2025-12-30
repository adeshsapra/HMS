import React, { useState, useEffect } from "react";
import { DataTable, FormModal, ViewModal, DeleteConfirmModal, Column, FormField, ViewField } from "@/components";
import { apiService } from "@/services/api";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";

interface Prescription {
    id: number;
    patientName: string;
    doctorName: string;
    date: string;
    diagnosis: string;
    advice: string;
    medicines?: string;
}

export default function Prescriptions(): JSX.Element {
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        perPage: 10
    });

    const [openViewModal, setOpenViewModal] = useState<boolean>(false);
    const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);

    const fetchPrescriptions = async (page = 1) => {
        try {
            setLoading(true);
            const response = await apiService.getPrescriptions(page);

            if (response && response.data) {
                const paginator = response.data;
                const mappedData = paginator.data.map((p: any) => ({
                    id: p.id,
                    patientName: p.patient?.name || "Unknown",
                    doctorName: p.doctor ? `${p.doctor.first_name} ${p.doctor.last_name}` : "Unknown",
                    date: p.created_at,
                    diagnosis: p.diagnosis,
                    advice: p.advice,
                    medicines: p.items ? p.items.map((m: any) => `${m.medicine_name} (${m.dosage})`).join(', ') : "No medicines",
                    original: p
                }));

                setPrescriptions(mappedData);
                setPagination({
                    currentPage: paginator.current_page,
                    totalPages: paginator.last_page,
                    totalItems: paginator.total,
                    perPage: paginator.per_page
                });
            }
        } catch (error) {
            console.error("Error fetching prescriptions:", error);
            toast.error("Failed to load prescriptions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrescriptions();
    }, []);

    const handlePageChange = (page: number) => {
        fetchPrescriptions(page);
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
            render: (value: any) => (
                <span className="font-semibold text-blue-gray-700">{value}</span>
            ),
        },
        {
            key: "doctorName",
            label: "Doctor",
            render: (value: any) => (
                <span className="font-medium text-blue-gray-600">{value}</span>
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
        { key: "diagnosis", label: "Diagnosis" },
    ];

    const viewFields: ViewField[] = [
        { key: "id", label: "Prescription ID" },
        {
            key: "doctorDetails",
            label: "Doctor",
            fullWidth: true,
            render: (_, row) => {
                const doc = row.original?.doctor;
                if (!doc) return <span className="text-gray-400">Unknown</span>;
                return (
                    <div className="flex items-center gap-4 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                            {doc.first_name?.[0]}{doc.last_name?.[0]}
                        </div>
                        <div>
                            <div className="font-bold text-blue-gray-900">{doc.first_name} {doc.last_name}</div>
                            <div className="flex gap-2 text-xs text-gray-600 mt-0.5">
                                {doc.specialization && <span className="bg-white border border-blue-100 text-blue-700 px-2 py-0.5 rounded shadow-sm">{doc.specialization}</span>}
                                {doc.department?.name && <span className="bg-white border border-gray-200 text-gray-700 px-2 py-0.5 rounded shadow-sm">{doc.department.name}</span>}
                            </div>
                        </div>
                    </div>
                );
            }
        },
        { key: "patientName", label: "Patient Name" },
        { key: "date", label: "Date Created", type: "date" },
        { key: "diagnosis", label: "Diagnosis", fullWidth: true },
        { key: "advice", label: "Advice", fullWidth: true },
        {
            key: "medicinesList",
            label: "Prescribed Medicines",
            fullWidth: true,
            render: (_, row) => {
                const items = row.original?.items;
                if (!items || items.length === 0) return <span className="text-gray-400 italic">No medicines prescribed</span>;
                return (
                    <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm mt-2">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-100/80 text-gray-700 font-bold uppercase text-xs tracking-wider">
                                <tr>
                                    <th className="p-3">Medicine</th>
                                    <th className="p-3">Dosage</th>
                                    <th className="p-3">Freq</th>
                                    <th className="p-3">Duration</th>
                                    <th className="p-3">Instructions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {items.map((item: any, i: number) => (
                                    <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="p-3 font-semibold text-gray-900">{item.medicine_name}</td>
                                        <td className="p-3">{item.dosage}</td>
                                        <td className="p-3">{item.frequency}</td>
                                        <td className="p-3">{item.duration}</td>
                                        <td className="p-3 text-gray-500 italic">{item.instructions || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            }
        },
        {
            key: "labTestsList",
            label: "Lab Tests",
            fullWidth: true,
            render: (_, row) => {
                const labs = row.original?.lab_tests || row.original?.labTests;
                if (!labs || labs.length === 0) return null;
                return (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {labs.map((test: any, i: number) => (
                            <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100 shadow-sm">
                                <span className="relative flex h-2 w-2">
                                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${test.status === 'completed' ? 'bg-green-400' : 'bg-blue-400'}`}></span>
                                    <span className={`relative inline-flex rounded-full h-2 w-2 ${test.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                                </span>
                                {test.test_name}
                                {test.priority === 'urgent' && <span className="ml-1 text-[10px] bg-red-100 text-red-600 px-1 rounded uppercase tracking-tighter">Urgent</span>}
                            </div>
                        ))}
                    </div>
                );
            }
        }
    ];

    const handleView = (prescription: Prescription): void => {
        setSelectedPrescription(prescription);
        setOpenViewModal(true);
        // Ideally fetch full details here if needed to show medicines list
    };

    return (
        <div className="mt-12 mb-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-bold text-blue-gray-800 mb-2">Prescriptions</h2>
                    <p className="text-blue-gray-600 text-base">View all patient prescriptions</p>
                </div>
            </div>

            <DataTable
                title="Prescriptions List"
                data={prescriptions}
                columns={columns}
                onView={handleView}
                searchable={false} // Would need backend search
                filterable={false}
                exportable={true}
                pagination={{
                    currentPage: pagination.currentPage,
                    totalPages: pagination.totalPages,
                    totalItems: pagination.totalItems,
                    perPage: pagination.perPage,
                    onPageChange: handlePageChange
                }}
            />

            <ViewModal
                open={openViewModal}
                onClose={() => {
                    setOpenViewModal(false);
                    setSelectedPrescription(null);
                }}
                title="Prescription Details"
                data={selectedPrescription || {}}
                fields={viewFields}
            />
        </div>
    );
}
