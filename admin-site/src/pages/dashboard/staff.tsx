import React, { useState } from "react";
import { DataTable, FormModal, ViewModal, DeleteConfirmModal, Column, FormField, ViewField } from "@/components";
import { staffData, departmentsData } from "@/data/hms-data";
import { Avatar, Typography, Button } from "@material-tailwind/react";
import { UserPlusIcon } from "@heroicons/react/24/outline";

interface StaffMember {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  shift: string;
  status: string;
  avatar?: string;
}

export default function Staff(): JSX.Element {
  const [staff, setStaff] = useState<StaffMember[]>(staffData);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openViewModal, setOpenViewModal] = useState<boolean>(false);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  const columns: Column[] = [
    {
      key: "avatar",
      label: "Photo",
      render: (value: any, row: StaffMember) => (
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
      render: (value: any, row: StaffMember) => (
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
      key: "role", 
      label: "Role",
      render: (value: any) => (
        <span className="font-semibold text-blue-gray-700">{value}</span>
      ),
    },
    { key: "department", label: "Department" },
    { key: "shift", label: "Shift" },
    { key: "status", label: "Status", type: "status" },
  ];

  const viewFields: ViewField[] = [
    { key: "avatar", label: "Photo", type: "avatar" },
    { key: "name", label: "Full Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "role", label: "Role" },
    { key: "department", label: "Department" },
    { key: "shift", label: "Shift" },
    { key: "status", label: "Status", type: "status" },
  ];

  const formFields: FormField[] = [
    {
      name: "name",
      label: "Full Name",
      type: "text",
      required: true,
      placeholder: "Enter full name",
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      required: true,
      placeholder: "staff@hospital.com",
    },
    {
      name: "phone",
      label: "Phone",
      type: "text",
      required: true,
      placeholder: "+1 234-567-8000",
    },
    {
      name: "role",
      label: "Role",
      type: "select",
      required: true,
      options: [
        { value: "Nurse", label: "Nurse" },
        { value: "Receptionist", label: "Receptionist" },
        { value: "Pharmacist", label: "Pharmacist" },
        { value: "Lab Technician", label: "Lab Technician" },
        { value: "Administrator", label: "Administrator" },
      ],
    },
    {
      name: "department",
      label: "Department",
      type: "select",
      required: true,
      options: [
        { value: "General", label: "General" },
        ...departmentsData.map((d) => ({ value: d.name, label: d.name })),
      ],
    },
    {
      name: "shift",
      label: "Shift",
      type: "select",
      required: true,
      options: [
        { value: "Day", label: "Day" },
        { value: "Night", label: "Night" },
        { value: "Flexible", label: "Flexible" },
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
      ],
    },
  ];

  const handleAdd = (): void => {
    setSelectedStaff(null);
    setOpenModal(true);
  };

  const handleEdit = (staffMember: StaffMember): void => {
    setSelectedStaff(staffMember);
    setOpenModal(true);
  };

  const handleDelete = (staffMember: StaffMember): void => {
    setSelectedStaff(staffMember);
    setOpenDeleteModal(true);
  };

  const confirmDelete = (): void => {
    if (selectedStaff) {
      setStaff(staff.filter((s) => s.id !== selectedStaff.id));
      setOpenDeleteModal(false);
      setSelectedStaff(null);
    }
  };

  const handleView = (staffMember: StaffMember): void => {
    setSelectedStaff(staffMember);
    setOpenViewModal(true);
  };

  const handleSubmit = (data: Record<string, any>): void => {
    if (selectedStaff) {
      setStaff(
        staff.map((s) =>
          s.id === selectedStaff.id ? { ...s, ...data, avatar: s.avatar } : s
        )
      );
    } else {
      const newStaff: StaffMember = {
        id: staff.length + 1,
        ...data,
        avatar: "/img/team-1.jpeg",
      } as StaffMember;
      setStaff([...staff, newStaff]);
    }
    setOpenModal(false);
    setSelectedStaff(null);
  };

  return (
    <div className="mt-12 mb-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold text-blue-gray-800 mb-2">Staff Management</h2>
          <p className="text-blue-gray-600 text-base">Manage hospital staff members and roles</p>
        </div>
        <Button
          variant="gradient"
          color="blue"
          className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
          onClick={handleAdd}
        >
          <UserPlusIcon className="h-5 w-5" />
          Add Staff
        </Button>
      </div>

      <DataTable
        title="Staff Management"
        data={staff}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        searchable={true}
        filterable={true}
        exportable={true}
        addButtonLabel="Add Staff"
        searchPlaceholder="Search staff..."
      />

      <FormModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setSelectedStaff(null);
        }}
        title={selectedStaff ? "Edit Staff" : "Add New Staff"}
        formFields={formFields}
        initialData={selectedStaff || {}}
        onSubmit={handleSubmit}
        submitLabel={selectedStaff ? "Update Staff" : "Add Staff"}
      />

      <ViewModal
        open={openViewModal}
        onClose={() => {
          setOpenViewModal(false);
          setSelectedStaff(null);
        }}
        title="Staff Details"
        data={selectedStaff || {}}
        fields={viewFields}
      />

      <DeleteConfirmModal
        open={openDeleteModal}
        onClose={() => {
          setOpenDeleteModal(false);
          setSelectedStaff(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Staff"
        message="Are you sure you want to delete this staff member?"
        itemName={selectedStaff?.name}
      />
    </div>
  );
}

