import { useState } from "react";
import { DataTable, FormModal, ViewModal, DeleteConfirmModal } from "@/components";
import { contactInquiriesData } from "@/data/hms-data";
import { Button } from "@material-tailwind/react";
import { EnvelopeIcon } from "@heroicons/react/24/outline";

export default function ContactInquiries() {
  const [inquiries, setInquiries] = useState(contactInquiriesData);
  const [openModal, setOpenModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  const columns = [
    { 
      key: "name", 
      label: "Name",
      render: (value) => (
        <span className="font-bold text-blue-gray-800">{value}</span>
      ),
    },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "subject", label: "Subject" },
    {
      key: "message",
      label: "Message",
      render: (value) => (
        <div className="max-w-md text-sm text-blue-gray-600 truncate">
          {value}
        </div>
      ),
    },
    {
      key: "date",
      label: "Date",
      render: (value) => (
        <span className="text-sm font-medium text-blue-gray-700">
          {new Date(value).toLocaleDateString()}
        </span>
      ),
    },
    { key: "status", label: "Status", type: "status" },
  ];

  const viewFields = [
    { key: "name", label: "Name", type: "text" },
    { key: "email", label: "Email", type: "text" },
    { key: "phone", label: "Phone", type: "text" },
    { key: "subject", label: "Subject", type: "text" },
    { key: "message", label: "Message", type: "text", fullWidth: true },
    { key: "date", label: "Date", type: "date" },
    { key: "status", label: "Status", type: "status" },
  ];

  const formFields = [
    {
      name: "name",
      label: "Name",
      type: "text",
      required: true,
      placeholder: "Enter name",
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      required: true,
      placeholder: "Enter email",
    },
    {
      name: "phone",
      label: "Phone",
      type: "text",
      required: true,
      placeholder: "Enter phone number",
    },
    {
      name: "subject",
      label: "Subject",
      type: "text",
      required: true,
      placeholder: "Enter subject",
    },
    {
      name: "message",
      label: "Message",
      type: "textarea",
      required: true,
      placeholder: "Enter message",
      fullWidth: true,
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      options: [
        { value: "new", label: "New" },
        { value: "in_progress", label: "In Progress" },
        { value: "resolved", label: "Resolved" },
        { value: "closed", label: "Closed" },
      ],
    },
  ];

  const handleAdd = () => {
    setSelectedInquiry(null);
    setOpenModal(true);
  };

  const handleEdit = (inquiry) => {
    setSelectedInquiry(inquiry);
    setOpenModal(true);
  };

  const handleDelete = (inquiry) => {
    setSelectedInquiry(inquiry);
    setOpenDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedInquiry) {
      setInquiries(inquiries.filter((i) => i.id !== selectedInquiry.id));
      setOpenDeleteModal(false);
      setSelectedInquiry(null);
    }
  };

  const handleView = (inquiry) => {
    setSelectedInquiry(inquiry);
    setOpenViewModal(true);
  };

  const handleSubmit = (data) => {
    if (selectedInquiry) {
      setInquiries(
        inquiries.map((i) =>
          i.id === selectedInquiry.id ? { ...i, ...data, date: i.date } : i
        )
      );
    } else {
      const newInquiry = {
        id: inquiries.length + 1,
        ...data,
        date: new Date().toISOString().split("T")[0],
      };
      setInquiries([...inquiries, newInquiry]);
    }
    setOpenModal(false);
    setSelectedInquiry(null);
  };

  return (
    <div className="mt-12 mb-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold text-blue-gray-800 mb-2">Contact Inquiries</h2>
          <p className="text-blue-gray-600 text-base">Manage contact form submissions and inquiries</p>
        </div>
        <Button
          variant="gradient"
          color="blue"
          className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
          onClick={handleAdd}
        >
          <EnvelopeIcon className="h-5 w-5" />
          Add Inquiry
        </Button>
      </div>

      <DataTable
        title="Contact Inquiry Management"
        data={inquiries}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        searchable={true}
        filterable={true}
        exportable={true}
        addButtonLabel="Add Inquiry"
        searchPlaceholder="Search inquiries..."
      />

      <FormModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setSelectedInquiry(null);
        }}
        title={selectedInquiry ? "Edit Inquiry" : "Add New Inquiry"}
        formFields={formFields}
        initialData={selectedInquiry || {}}
        onSubmit={handleSubmit}
        submitLabel={selectedInquiry ? "Update Inquiry" : "Add Inquiry"}
      />

      <ViewModal
        open={openViewModal}
        onClose={() => {
          setOpenViewModal(false);
          setSelectedInquiry(null);
        }}
        title="Inquiry Details"
        data={selectedInquiry || {}}
        fields={viewFields}
      />

      <DeleteConfirmModal
        open={openDeleteModal}
        onClose={() => {
          setOpenDeleteModal(false);
          setSelectedInquiry(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Inquiry"
        message="Are you sure you want to delete this inquiry?"
        itemName={selectedInquiry?.name}
      />
    </div>
  );
}
