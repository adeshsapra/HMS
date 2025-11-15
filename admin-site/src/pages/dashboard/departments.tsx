import React, { useState } from "react";
import { DataTable, FormModal, ViewModal, DeleteConfirmModal, Column, FormField, ViewField } from "@/components";
import { departmentsData, doctorsData } from "@/data/hms-data";
import { Button } from "@material-tailwind/react";
import { BuildingOfficeIcon } from "@heroicons/react/24/outline";

interface Department {
  id: number;
  name: string;
  description: string;
  head: string;
  totalDoctors: number;
  totalPatients: number;
  status: string;
  icon?: string;
}

export default function Departments(): JSX.Element {
  const [departments, setDepartments] = useState<Department[]>(departmentsData);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openViewModal, setOpenViewModal] = useState<boolean>(false);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  const columns: Column[] = [
    {
      key: "name",
      label: "Department",
      render: (value: any) => (
        <span className="font-bold text-blue-gray-800 text-base">{value}</span>
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (value: any) => (
        <div className="max-w-md text-sm text-blue-gray-600">
          {value}
        </div>
      ),
    },
    {
      key: "head",
      label: "Head",
      render: (value: any) => (
        <span className="font-semibold text-blue-gray-700">{value}</span>
      ),
    },
    {
      key: "totalDoctors",
      label: "Doctors",
      render: (value: any) => (
        <span className="font-bold text-blue-gray-800">{value}</span>
      ),
    },
    {
      key: "totalPatients",
      label: "Patients",
      render: (value: any) => (
        <span className="font-bold text-blue-gray-800">{value}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      type: "status",
    },
  ];

  const viewFields: ViewField[] = [
    { key: "name", label: "Department Name" },
    { key: "description", label: "Description", fullWidth: true },
    { key: "head", label: "Department Head" },
    { key: "totalDoctors", label: "Total Doctors" },
    { key: "totalPatients", label: "Total Patients" },
    { key: "status", label: "Status", type: "status" },
  ];

  const formFields: FormField[] = [
    {
      name: "name",
      label: "Department Name",
      type: "text",
      required: true,
      placeholder: "Cardiology",
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      required: true,
      placeholder: "Department description",
      fullWidth: true,
    },
    {
      name: "head",
      label: "Department Head",
      type: "select",
      required: true,
      options: doctorsData.map((d) => ({ value: d.name, label: d.name })),
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
    },
  ];

  const handleAdd = (): void => {
    setSelectedDepartment(null);
    setOpenModal(true);
  };

  const handleEdit = (department: Department): void => {
    setSelectedDepartment(department);
    setOpenModal(true);
  };

  const handleDelete = (department: Department): void => {
    setSelectedDepartment(department);
    setOpenDeleteModal(true);
  };

  const confirmDelete = (): void => {
    if (selectedDepartment) {
      setDepartments(departments.filter((d) => d.id !== selectedDepartment.id));
      setOpenDeleteModal(false);
      setSelectedDepartment(null);
    }
  };

  const handleView = (department: Department): void => {
    setSelectedDepartment(department);
    setOpenViewModal(true);
  };

  const handleSubmit = (data: Record<string, any>): void => {
    if (selectedDepartment) {
      setDepartments(
        departments.map((d) =>
          d.id === selectedDepartment.id
            ? { ...d, ...data, totalDoctors: d.totalDoctors, totalPatients: d.totalPatients }
            : d
        )
      );
    } else {
      const newDepartment: Department = {
        id: departments.length + 1,
        ...data,
        totalDoctors: 0,
        totalPatients: 0,
        icon: "fa-hospital",
      } as Department;
      setDepartments([...departments, newDepartment]);
    }
    setOpenModal(false);
    setSelectedDepartment(null);
  };

  return (
    <div className="mt-12 mb-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold text-blue-gray-800 mb-2">Departments</h2>
          <p className="text-blue-gray-600 text-base">Manage hospital departments and specialties</p>
        </div>
        <Button
          variant="gradient"
          color="blue"
          className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
          onClick={handleAdd}
        >
          <BuildingOfficeIcon className="h-5 w-5" />
          Add Department
        </Button>
      </div>

      <DataTable
        title="Department Management"
        data={departments}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        searchable={true}
        filterable={true}
        exportable={true}
        addButtonLabel="Add Department"
        searchPlaceholder="Search departments..."
      />

      <FormModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setSelectedDepartment(null);
        }}
        title={selectedDepartment ? "Edit Department" : "Add New Department"}
        formFields={formFields}
        initialData={selectedDepartment || {}}
        onSubmit={handleSubmit}
        submitLabel={selectedDepartment ? "Update Department" : "Add Department"}
      />

      <ViewModal
        open={openViewModal}
        onClose={() => {
          setOpenViewModal(false);
          setSelectedDepartment(null);
        }}
        title="Department Details"
        data={selectedDepartment || {}}
        fields={viewFields}
      />

      <DeleteConfirmModal
        open={openDeleteModal}
        onClose={() => {
          setOpenDeleteModal(false);
          setSelectedDepartment(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Department"
        message="Are you sure you want to delete this department?"
        itemName={selectedDepartment?.name}
      />
    </div>
  );
}

