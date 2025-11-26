import React, { useState } from "react";
import { DataTable, FormModal, ViewModal, DeleteConfirmModal, Column, FormField, ViewField } from "@/components";
import { prescriptionsData, doctorsData, patientsData, Prescription } from "@/data/hms-data";
import { Button } from "@material-tailwind/react";
import { PlusIcon } from "@heroicons/react/24/outline";

export default function Prescriptions(): JSX.Element {
    const [prescriptions, setPrescriptions] = useState<Prescription[]>(prescriptionsData);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [openViewModal, setOpenViewModal] = useState<boolean>(false);
    const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
    const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);

    const columns: Column[] = [
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
        { key: "medicines", label: "Medicines" },
        { key: "status", label: "Status", type: "status" },
    ];

    const viewFields: ViewField[] = [
        { key: "patientName", label: "Patient Name" },
        { key: "doctorName", label: "Doctor Name" },
        { key: "date", label: "Date", type: "date" },
        { key: "medicines", label: "Medicines" },
        { key: "status", label: "Status", type: "status" },
    ];

    const formFields: FormField[] = [
        {
            name: "patientName",
            label: "Patient",
            type: "select",
            required: true,
            options: patientsData.map((p) => ({ value: p.name, label: p.name })),
        },
        {
            name: "doctorName",
            label: "Doctor",
            type: "select",
            required: true,
            options: doctorsData.map((d) => ({ value: d.name, label: d.name })),
        },
        {
            name: "date",
            label: "Date",
            type: "date",
            required: true,
        },
        {
            name: "medicines",
            label: "Medicines",
            type: "textarea",
            required: true,
            placeholder: "List medicines here...",
        },
        {
            name: "status",
            label: "Status",
            type: "select",
            required: true,
            options: [
                { value: "active", label: "Active" },
                { value: "completed", label: "Completed" },
                { value: "cancelled", label: "Cancelled" },
            ],
        },
    ];

    const handleAdd = (): void => {
        setSelectedPrescription(null);
        setOpenModal(true);
    };

    const handleEdit = (prescription: Prescription): void => {
        setSelectedPrescription(prescription);
        setOpenModal(true);
    };

    const handleDelete = (prescription: Prescription): void => {
        setSelectedPrescription(prescription);
        setOpenDeleteModal(true);
    };

    const confirmDelete = (): void => {
        if (selectedPrescription) {
            setPrescriptions(prescriptions.filter((p) => p.id !== selectedPrescription.id));
            setOpenDeleteModal(false);
            setSelectedPrescription(null);
        }
    };

    const handleView = (prescription: Prescription): void => {
        setSelectedPrescription(prescription);
        setOpenViewModal(true);
    };

    const handleSubmit = (data: Record<string, any>): void => {
        if (selectedPrescription) {
            setPrescriptions(
                prescriptions.map((p) =>
                    p.id === selectedPrescription.id ? { ...p, ...data } as Prescription : p
                )
            );
        } else {
            const newPrescription: Prescription = {
                id: prescriptions.length + 1,
                ...data,
            } as Prescription;
            setPrescriptions([...prescriptions, newPrescription]);
        }
        setOpenModal(false);
        setSelectedPrescription(null);
    };

    return (
        <div className="mt-12 mb-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-bold text-blue-gray-800 mb-2">Prescriptions</h2>
                    <p className="text-blue-gray-600 text-base">Manage patient prescriptions</p>
                </div>
                <Button
                    variant="gradient"
                    color="blue"
                    className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                    onClick={handleAdd}
                >
                    <PlusIcon className="h-5 w-5" />
                    Add Prescription
                </Button>
            </div>

            <DataTable
                title="Prescriptions List"
                data={prescriptions}
                columns={columns}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
                searchable={true}
                filterable={true}
                exportable={true}
                addButtonLabel="Add Prescription"
                searchPlaceholder="Search prescriptions..."
            />

            <FormModal
                open={openModal}
                onClose={() => {
                    setOpenModal(false);
                    setSelectedPrescription(null);
                }}
                title={selectedPrescription ? "Edit Prescription" : "Add New Prescription"}
                formFields={formFields}
                initialData={selectedPrescription || {}}
                onSubmit={handleSubmit}
                submitLabel={selectedPrescription ? "Update Prescription" : "Add Prescription"}
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

            <DeleteConfirmModal
                open={openDeleteModal}
                onClose={() => {
                    setOpenDeleteModal(false);
                    setSelectedPrescription(null);
                }}
                onConfirm={confirmDelete}
                title="Delete Prescription"
                message="Are you sure you want to delete this prescription?"
                itemName={selectedPrescription?.patientName}
            />
        </div>
    );
}
