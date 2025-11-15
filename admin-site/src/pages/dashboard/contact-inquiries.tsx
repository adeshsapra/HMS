import React, { useState } from "react";
import { DataTable, FormModal, ViewModal, DeleteConfirmModal, Column, FormField, ViewField } from "@/components";
import { contactInquiriesData } from "@/data/hms-data";
import { Button } from "@material-tailwind/react";
import { EnvelopeIcon } from "@heroicons/react/24/outline";

interface ContactInquiry {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  date: string;
  status: string;
}

export default function ContactInquiries(): JSX.Element {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>(contactInquiriesData);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openViewModal, setOpenViewModal] = useState<boolean>(false);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);

  const columns: Column[] = [
    { 
      key: "name", 
      label: "Name",
      render: (value: any) => (
        <span className="font-bold text-blue-gray-800">{value}</span>
      ),
    },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "subject", label: "Subject" },
    {
      key: "message",
      label: "Message",
      render: (value: any) => (
        <div className="max-w-md text-sm text-blue-gray-600 truncate">
          {value}
        </div>
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
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "subject", label: "Subject" },
    { key: "message", label: "Message", fullWidth: true },
    { key: "date", label: "Date", type: "date" },
    { key: "status", label: "Status", type: "status" },
  ];

  const formFields: FormField[] = [
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

  const handleAdd = (): void => {
    setSelectedInquiry(null);
    setOpenModal(true);
  };

  const handleEdit = (inquiry: ContactInquiry): void => {
    setSelectedInquiry(inquiry);
    setOpenModal(true);
  };

  const handleDelete = (inquiry: ContactInquiry): void => {
    setSelectedInquiry(inquiry);
    setOpenDeleteModal(true);
  };

  const confirmDelete = (): void => {
    if (selectedInquiry) {
      setInquiries(inquiries.filter((i) => i.id !== selectedInquiry.id));
      setOpenDeleteModal(false);
      setSelectedInquiry(null);
    }
  };

  const handleView = (inquiry: ContactInquiry): void => {
    setSelectedInquiry(inquiry);
    setOpenViewModal(true);
  };

  const handleSubmit = (data: Record<string, any>): void => {
    if (selectedInquiry) {
      setInquiries(
        inquiries.map((i) =>
          i.id === selectedInquiry.id ? { ...i, ...data, date: i.date } : i
        )
      );
    } else {
      const newInquiry: ContactInquiry = {
        id: inquiries.length + 1,
        ...data,
        date: new Date().toISOString().split("T")[0],
      } as ContactInquiry;
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

