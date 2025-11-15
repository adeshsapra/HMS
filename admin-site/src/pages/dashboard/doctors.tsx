import React, { useState } from "react";
import { DataTable, FormModal, ViewModal, DeleteConfirmModal, Column, FormField, ViewField } from "@/components";
import { doctorsData, departmentsData } from "@/data/hms-data";
import { Avatar, Typography, Button } from "@material-tailwind/react";
import { UserPlusIcon } from "@heroicons/react/24/outline";

interface Doctor {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  department: string;
  experience: string;
  rating: number;
  status: string;
  avatar?: string;
  totalPatients: number;
}

export default function Doctors(): JSX.Element {
  const [doctors, setDoctors] = useState<Doctor[]>(doctorsData);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openViewModal, setOpenViewModal] = useState<boolean>(false);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const columns: Column[] = [
    {
      key: "avatar",
      label: "Photo",
      render: (value: any, row: Doctor) => (
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
      render: (value: any, row: Doctor) => (
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
      key: "specialty",
      label: "Specialty",
      render: (value: any) => (
        <span className="font-semibold text-blue-gray-700">{value}</span>
      ),
    },
    {
      key: "department",
      label: "Department",
    },
    {
      key: "experience",
      label: "Experience",
    },
    {
      key: "rating",
      label: "Rating",
      render: (value: any) => (
        <div className="flex items-center gap-1">
          <span className="text-yellow-500">⭐</span>
          <Typography className="text-sm font-bold text-blue-gray-800">
            {value}/5.0
          </Typography>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      type: "status",
    },
    {
      key: "totalPatients",
      label: "Patients",
      render: (value: any) => (
        <span className="font-semibold text-blue-gray-700">{value}</span>
      ),
    },
  ];

  const viewFields: ViewField[] = [
    { key: "avatar", label: "Photo", type: "avatar" },
    { key: "name", label: "Doctor Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "specialty", label: "Specialty" },
    { key: "department", label: "Department" },
    { key: "experience", label: "Experience" },
    { key: "rating", label: "Rating" },
    { key: "totalPatients", label: "Total Patients" },
    { key: "status", label: "Status", type: "status" },
  ];

  const formFields: FormField[] = [
    {
      name: "name",
      label: "Doctor Name",
      type: "text",
      required: true,
      placeholder: "Dr. John Doe",
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      required: true,
      placeholder: "doctor@hospital.com",
    },
    {
      name: "phone",
      label: "Phone",
      type: "text",
      required: true,
      placeholder: "+1 234-567-9000",
    },
    {
      name: "specialty",
      label: "Specialty",
      type: "text",
      required: true,
      placeholder: "Cardiology",
    },
    {
      name: "department",
      label: "Department",
      type: "select",
      required: true,
      options: departmentsData.map((d) => ({ value: d.name, label: d.name })),
    },
    {
      name: "experience",
      label: "Experience",
      type: "text",
      required: true,
      placeholder: "15 years",
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      options: [
        { value: "available", label: "Available" },
        { value: "busy", label: "Busy" },
        { value: "offline", label: "Offline" },
        { value: "on_leave", label: "On Leave" },
      ],
    },
  ];

  const handleAdd = (): void => {
    setSelectedDoctor(null);
    setOpenModal(true);
  };

  const handleEdit = (doctor: Doctor): void => {
    setSelectedDoctor(doctor);
    setOpenModal(true);
  };

  const handleDelete = (doctor: Doctor): void => {
    setSelectedDoctor(doctor);
    setOpenDeleteModal(true);
  };

  const confirmDelete = (): void => {
    if (selectedDoctor) {
      setDoctors(doctors.filter((d) => d.id !== selectedDoctor.id));
      setOpenDeleteModal(false);
      setSelectedDoctor(null);
    }
  };

  const handleView = (doctor: Doctor): void => {
    setSelectedDoctor(doctor);
    setOpenViewModal(true);
  };

  const handleSubmit = (data: Record<string, any>): void => {
    if (selectedDoctor) {
      setDoctors(
        doctors.map((d) =>
          d.id === selectedDoctor.id
            ? { ...d, ...data, avatar: d.avatar, rating: d.rating, totalPatients: d.totalPatients }
            : d
        )
      );
    } else {
      const newDoctor: Doctor = {
        id: doctors.length + 1,
        ...data,
        avatar: "/img/team-1.jpeg",
        rating: 4.5,
        totalPatients: 0,
      } as Doctor;
      setDoctors([...doctors, newDoctor]);
    }
    setOpenModal(false);
    setSelectedDoctor(null);
  };

  return (
    <div className="mt-12 mb-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold text-blue-gray-800 mb-2">Doctors</h2>
          <p className="text-blue-gray-600 text-base">Manage all doctors and medical specialists</p>
        </div>
        <Button
          variant="gradient"
          color="blue"
          className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
          onClick={handleAdd}
        >
          <UserPlusIcon className="h-5 w-5" />
          Add Doctor
        </Button>
      </div>

      <DataTable
        title="Doctor Management"
        data={doctors}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        searchable={true}
        filterable={true}
        exportable={true}
        addButtonLabel="Add Doctor"
        searchPlaceholder="Search doctors..."
      />

      <FormModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setSelectedDoctor(null);
        }}
        title={selectedDoctor ? "Edit Doctor" : "Add New Doctor"}
        formFields={formFields}
        initialData={selectedDoctor || {}}
        onSubmit={handleSubmit}
        submitLabel={selectedDoctor ? "Update Doctor" : "Add Doctor"}
      />

      <ViewModal
        open={openViewModal}
        onClose={() => {
          setOpenViewModal(false);
          setSelectedDoctor(null);
        }}
        title="Doctor Details"
        data={selectedDoctor || {}}
        fields={viewFields}
      />

      <DeleteConfirmModal
        open={openDeleteModal}
        onClose={() => {
          setOpenDeleteModal(false);
          setSelectedDoctor(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Doctor"
        message="Are you sure you want to delete this doctor?"
        itemName={selectedDoctor?.name}
      />
    </div>
  );
}

