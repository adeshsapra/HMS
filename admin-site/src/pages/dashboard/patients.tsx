import React, { useState } from "react";
import { DataTable, FormModal, ViewModal, DeleteConfirmModal, Column, FormField, ViewField } from "@/components";
import { patientsData } from "@/data/hms-data";
import { Avatar, Typography, Button } from "@material-tailwind/react";
import { UserPlusIcon } from "@heroicons/react/24/outline";

interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  bloodGroup: string;
  status: string;
  avatar?: string;
  lastVisit: string;
  totalVisits: number;
}

export default function Patients(): JSX.Element {
  const [patients, setPatients] = useState<Patient[]>(patientsData);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openViewModal, setOpenViewModal] = useState<boolean>(false);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const columns: Column[] = [
    {
      key: "avatar",
      label: "Photo",
      render: (value: any, row: Patient) => (
        <Avatar 
          src={row.avatar || "/img/team-1.jpeg"} 
          alt={row.name} 
          size="sm" 
          variant="rounded" 
          className="border-2 border-blue-gray-100 shadow-sm" 
        />
      ),
    },
    {
      key: "name",
      label: "Name",
      render: (value: any, row: Patient) => (
        <div>
          <Typography variant="small" color="blue-gray" className="font-bold text-sm">
            {row.name}
          </Typography>
          <Typography className="text-xs font-normal text-blue-gray-500 mt-0.5">
            {row.email}
          </Typography>
        </div>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      render: (value: any) => (
        <Typography className="text-sm font-medium text-blue-gray-700">
          {value}
        </Typography>
      ),
    },
    {
      key: "age",
      label: "Age",
      render: (value: any) => (
        <Typography className="text-sm font-medium text-blue-gray-700">
          {value} years
        </Typography>
      ),
    },
    {
      key: "gender",
      label: "Gender",
    },
    {
      key: "bloodGroup",
      label: "Blood Group",
    },
    {
      key: "status",
      label: "Status",
      type: "status",
    },
    {
      key: "lastVisit",
      label: "Last Visit",
      render: (value: any) => (
        <Typography className="text-xs font-medium text-blue-gray-600">
          {new Date(value).toLocaleDateString()}
        </Typography>
      ),
    },
  ];

  const viewFields: ViewField[] = [
    { key: "avatar", label: "Photo", type: "avatar" },
    { key: "name", label: "Full Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "age", label: "Age" },
    { key: "gender", label: "Gender" },
    { key: "bloodGroup", label: "Blood Group" },
    { key: "status", label: "Status", type: "status" },
    { key: "lastVisit", label: "Last Visit", type: "date" },
    { key: "totalVisits", label: "Total Visits" },
  ];

  const formFields: FormField[] = [
    {
      name: "name",
      label: "Full Name",
      type: "text",
      required: true,
      placeholder: "Enter patient name",
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      required: true,
      placeholder: "patient@email.com",
    },
    {
      name: "phone",
      label: "Phone",
      type: "text",
      required: true,
      placeholder: "+1 234-567-8900",
    },
    {
      name: "age",
      label: "Age",
      type: "number",
      required: true,
      min: 0,
      max: 150,
      placeholder: "Enter age",
    },
    {
      name: "gender",
      label: "Gender",
      type: "select",
      required: true,
      options: [
        { value: "Male", label: "Male" },
        { value: "Female", label: "Female" },
        { value: "Other", label: "Other" },
      ],
    },
    {
      name: "bloodGroup",
      label: "Blood Group",
      type: "select",
      required: true,
      options: [
        { value: "A+", label: "A+" },
        { value: "A-", label: "A-" },
        { value: "B+", label: "B+" },
        { value: "B-", label: "B-" },
        { value: "AB+", label: "AB+" },
        { value: "AB-", label: "AB-" },
        { value: "O+", label: "O+" },
        { value: "O-", label: "O-" },
      ],
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
        { value: "critical", label: "Critical" },
      ],
    },
  ];

  const handleAdd = (): void => {
    setSelectedPatient(null);
    setOpenModal(true);
  };

  const handleEdit = (patient: Patient): void => {
    setSelectedPatient(patient);
    setOpenModal(true);
  };

  const handleDelete = (patient: Patient): void => {
    setSelectedPatient(patient);
    setOpenDeleteModal(true);
  };

  const confirmDelete = (): void => {
    if (selectedPatient) {
      setPatients(patients.filter((p) => p.id !== selectedPatient.id));
      setOpenDeleteModal(false);
      setSelectedPatient(null);
    }
  };

  const handleView = (patient: Patient): void => {
    setSelectedPatient(patient);
    setOpenViewModal(true);
  };

  const handleSubmit = (data: Record<string, any>): void => {
    if (selectedPatient) {
      setPatients(
        patients.map((p) =>
          p.id === selectedPatient.id
            ? { ...p, ...data, avatar: p.avatar }
            : p
        )
      );
    } else {
      const newPatient: Patient = {
        id: patients.length + 1,
        ...data,
        avatar: "/img/team-1.jpeg",
        lastVisit: new Date().toISOString().split("T")[0],
        totalVisits: 0,
      } as Patient;
      setPatients([...patients, newPatient]);
    }
    setOpenModal(false);
    setSelectedPatient(null);
  };

  return (
    <div className="mt-12 mb-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold text-blue-gray-800 mb-2">Patients</h2>
          <p className="text-blue-gray-600 text-base">Manage all patient records and medical information</p>
        </div>
        <Button
          variant="gradient"
          color="blue"
          className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
          onClick={handleAdd}
        >
          <UserPlusIcon className="h-5 w-5" />
          Register Patient
        </Button>
      </div>

      <DataTable
        title="Patient Management"
        data={patients}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        searchable={true}
        filterable={true}
        exportable={true}
        addButtonLabel="Register Patient"
        searchPlaceholder="Search patients..."
      />

      <FormModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setSelectedPatient(null);
        }}
        title={selectedPatient ? "Edit Patient" : "Register New Patient"}
        formFields={formFields}
        initialData={selectedPatient || {}}
        onSubmit={handleSubmit}
        submitLabel={selectedPatient ? "Update Patient" : "Register Patient"}
      />

      <ViewModal
        open={openViewModal}
        onClose={() => {
          setOpenViewModal(false);
          setSelectedPatient(null);
        }}
        title="Patient Details"
        data={selectedPatient || {}}
        fields={viewFields}
      />

      <DeleteConfirmModal
        open={openDeleteModal}
        onClose={() => {
          setOpenDeleteModal(false);
          setSelectedPatient(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Patient"
        message="Are you sure you want to delete this patient record?"
        itemName={selectedPatient?.name}
      />
    </div>
  );
}

