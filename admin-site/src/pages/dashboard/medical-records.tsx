import React, { useState } from "react";
import { DataTable, FormModal, ViewModal, DeleteConfirmModal, Column, FormField, ViewField } from "@/components";
import { medicalRecordsData, doctorsData, patientsData, MedicalRecord } from "@/data/hms-data";
import { Button } from "@material-tailwind/react";
import { PlusIcon } from "@heroicons/react/24/outline";

export default function MedicalRecords(): JSX.Element {
    const [records, setRecords] = useState<MedicalRecord[]>(medicalRecordsData);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [openViewModal, setOpenViewModal] = useState<boolean>(false);
    const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
    const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

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
            key: "diagnosis",
            label: "Diagnosis",
            render: (value: any) => (
                <span className="font-medium text-blue-gray-800">{value}</span>
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
        { key: "status", label: "Status", type: "status" },
    ];

    const viewFields: ViewField[] = [
        { key: "patientName", label: "Patient Name" },
        { key: "doctorName", label: "Doctor Name" },
        { key: "diagnosis", label: "Diagnosis" },
        { key: "treatment", label: "Treatment" },
        { key: "date", label: "Date", type: "date" },
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
            name: "diagnosis",
            label: "Diagnosis",
            type: "text",
            required: true,
            placeholder: "e.g. Hypertension",
        },
        {
            name: "treatment",
            label: "Treatment",
            type: "textarea",
            required: true,
            placeholder: "Treatment plan...",
        },
        {
            name: "date",
            label: "Date",
            type: "date",
            required: true,
        },
        {
            name: "status",
            label: "Status",
            type: "select",
            required: true,
            options: [
                { value: "ongoing", label: "Ongoing" },
                { value: "resolved", label: "Resolved" },
                { value: "critical", label: "Critical" },
            ],
        },
    ];

    const handleAdd = (): void => {
        setSelectedRecord(null);
        setOpenModal(true);
    };

    const handleEdit = (record: MedicalRecord): void => {
        setSelectedRecord(record);
        setOpenModal(true);
    };

    const handleDelete = (record: MedicalRecord): void => {
        setSelectedRecord(record);
        setOpenDeleteModal(true);
    };

    const confirmDelete = (): void => {
        if (selectedRecord) {
            setRecords(records.filter((r) => r.id !== selectedRecord.id));
            setOpenDeleteModal(false);
            setSelectedRecord(null);
        }
    };

    const handleView = (record: MedicalRecord): void => {
        setSelectedRecord(record);
        setOpenViewModal(true);
    };

    const handleSubmit = (data: Record<string, any>): void => {
        if (selectedRecord) {
            setRecords(
                records.map((r) =>
                    r.id === selectedRecord.id ? { ...r, ...data } as MedicalRecord : r
                )
            );
        } else {
            const newRecord: MedicalRecord = {
                id: records.length + 1,
                ...data,
            } as MedicalRecord;
            setRecords([...records, newRecord]);
        }
        setOpenModal(false);
        setSelectedRecord(null);
    };

    return (
        <div className="mt-12 mb-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-bold text-blue-gray-800 mb-2">Medical Records</h2>
                    <p className="text-blue-gray-600 text-base">Manage patient medical history and records</p>
                </div>
                <Button
                    variant="gradient"
                    color="blue"
                    className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                    onClick={handleAdd}
                >
                    <PlusIcon className="h-5 w-5" />
                    Add Record
                </Button>
            </div>

            <DataTable
                title="Medical Records List"
                data={records}
                columns={columns}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
                searchable={true}
                filterable={true}
                exportable={true}
                addButtonLabel="Add Record"
                searchPlaceholder="Search records..."
            />

            <FormModal
                open={openModal}
                onClose={() => {
                    setOpenModal(false);
                    setSelectedRecord(null);
                }}
                title={selectedRecord ? "Edit Medical Record" : "Add New Medical Record"}
                formFields={formFields}
                initialData={selectedRecord || {}}
                onSubmit={handleSubmit}
                submitLabel={selectedRecord ? "Update Record" : "Add Record"}
            />

            <ViewModal
                open={openViewModal}
                onClose={() => {
                    setOpenViewModal(false);
                    setSelectedRecord(null);
                }}
                title="Medical Record Details"
                data={selectedRecord || {}}
                fields={viewFields}
            />

            <DeleteConfirmModal
                open={openDeleteModal}
                onClose={() => {
                    setOpenDeleteModal(false);
                    setSelectedRecord(null);
                }}
                onConfirm={confirmDelete}
                title="Delete Record"
                message="Are you sure you want to delete this medical record?"
                itemName={selectedRecord?.diagnosis}
            />
        </div>
    );
}
