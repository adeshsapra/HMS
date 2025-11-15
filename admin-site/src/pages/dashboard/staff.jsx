import { useState } from "react";
import { DataTable, FormModal, ViewModal, DeleteConfirmModal } from "@/components";
import { staffData, departmentsData } from "@/data/hms-data";
import { Avatar, Typography, Button } from "@material-tailwind/react";
import { UserPlusIcon } from "@heroicons/react/24/outline";

export default function Staff() {
  const [staff, setStaff] = useState(staffData);
  const [openModal, setOpenModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const columns = [
    {
      key: "avatar",
      label: "Photo",
      render: (value, row) => (
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
      render: (value, row) => (
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
      render: (value) => (
        <span className="font-semibold text-blue-gray-700">{value}</span>
      ),
    },
    { key: "department", label: "Department" },
    { key: "shift", label: "Shift" },
    { key: "status", label: "Status", type: "status" },
  ];

  const viewFields = [
    { key: "avatar", label: "Photo", type: "avatar" },
    { key: "name", label: "Full Name", type: "text" },
    { key: "email", label: "Email", type: "text" },
    { key: "phone", label: "Phone", type: "text" },
    { key: "role", label: "Role", type: "text" },
    { key: "department", label: "Department", type: "text" },
    { key: "shift", label: "Shift", type: "text" },
    { key: "status", label: "Status", type: "status" },
  ];

  const formFields = [
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

  const handleAdd = () => {
    setSelectedStaff(null);
    setOpenModal(true);
  };

  const handleEdit = (staffMember) => {
    setSelectedStaff(staffMember);
    setOpenModal(true);
  };

  const handleDelete = (staffMember) => {
    setSelectedStaff(staffMember);
    setOpenDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedStaff) {
      setStaff(staff.filter((s) => s.id !== selectedStaff.id));
      setOpenDeleteModal(false);
      setSelectedStaff(null);
    }
  };

  const handleView = (staffMember) => {
    setSelectedStaff(staffMember);
    setOpenViewModal(true);
  };

  const handleSubmit = (data) => {
    if (selectedStaff) {
      setStaff(
        staff.map((s) =>
          s.id === selectedStaff.id ? { ...s, ...data, avatar: s.avatar } : s
        )
      );
    } else {
      const newStaff = {
        id: staff.length + 1,
        ...data,
        avatar: "/img/team-1.jpeg",
      };
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
