import React, { useState } from "react";
import { DataTable, FormModal, ViewModal, DeleteConfirmModal, Column, FormField, ViewField } from "@/components";
import { testimonialsData } from "@/data/hms-data";
import { Avatar, Typography, Button } from "@material-tailwind/react";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

interface Testimonial {
  id: number;
  patientName: string;
  rating: number;
  comment: string;
  date: string;
  status: string;
  avatar?: string;
}

export default function Testimonials(): JSX.Element {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(testimonialsData);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openViewModal, setOpenViewModal] = useState<boolean>(false);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);

  const columns: Column[] = [
    {
      key: "avatar",
      label: "Photo",
      render: (value: any, row: Testimonial) => (
        <Avatar 
          src={row.avatar || "/img/team-1.jpeg"} 
          alt={row.patientName} 
          size="sm" 
          variant="rounded" 
          className="border-2 border-blue-gray-100 shadow-sm" 
        />
      ),
    },
    {
      key: "patientName",
      label: "Patient",
      render: (value: any) => (
        <span className="font-bold text-blue-gray-800">{value}</span>
      ),
    },
    {
      key: "rating",
      label: "Rating",
      render: (value: any) => (
        <div className="flex items-center gap-1">
          <Typography className="text-sm font-bold text-blue-gray-800">
            {"⭐".repeat(value)} ({value}/5)
          </Typography>
        </div>
      ),
    },
    {
      key: "comment",
      label: "Comment",
      render: (value: any) => (
        <Typography className="text-sm text-blue-gray-600 max-w-md truncate">
          {value}
        </Typography>
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
    {
      key: "status",
      label: "Status",
      type: "status",
    },
  ];

  const viewFields: ViewField[] = [
    { key: "avatar", label: "Photo", type: "avatar" },
    { key: "patientName", label: "Patient Name" },
    { key: "rating", label: "Rating" },
    { key: "comment", label: "Comment", fullWidth: true },
    { key: "date", label: "Date", type: "date" },
    { key: "status", label: "Status", type: "status" },
  ];

  const formFields: FormField[] = [
    {
      name: "patientName",
      label: "Patient Name",
      type: "text",
      required: true,
      placeholder: "Enter patient name",
    },
    {
      name: "rating",
      label: "Rating",
      type: "select",
      required: true,
      options: [
        { value: "5", label: "5 Stars" },
        { value: "4", label: "4 Stars" },
        { value: "3", label: "3 Stars" },
        { value: "2", label: "2 Stars" },
        { value: "1", label: "1 Star" },
      ],
    },
    {
      name: "comment",
      label: "Comment",
      type: "textarea",
      required: true,
      placeholder: "Enter patient testimonial...",
      fullWidth: true,
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      options: [
        { value: "approved", label: "Approved" },
        { value: "pending", label: "Pending" },
        { value: "rejected", label: "Rejected" },
      ],
    },
  ];

  const handleAdd = (): void => {
    setSelectedTestimonial(null);
    setOpenModal(true);
  };

  const handleEdit = (testimonial: Testimonial): void => {
    setSelectedTestimonial(testimonial);
    setOpenModal(true);
  };

  const handleDelete = (testimonial: Testimonial): void => {
    setSelectedTestimonial(testimonial);
    setOpenDeleteModal(true);
  };

  const confirmDelete = (): void => {
    if (selectedTestimonial) {
      setTestimonials(testimonials.filter((t) => t.id !== selectedTestimonial.id));
      setOpenDeleteModal(false);
      setSelectedTestimonial(null);
    }
  };

  const handleView = (testimonial: Testimonial): void => {
    setSelectedTestimonial(testimonial);
    setOpenViewModal(true);
  };

  const handleSubmit = (data: Record<string, any>): void => {
    if (selectedTestimonial) {
      setTestimonials(
        testimonials.map((t) =>
          t.id === selectedTestimonial.id
            ? { ...t, ...data, avatar: t.avatar, date: t.date, rating: Number(data.rating) }
            : t
        )
      );
    } else {
      const newTestimonial: Testimonial = {
        id: testimonials.length + 1,
        ...data,
        avatar: "/img/team-1.jpeg",
        date: new Date().toISOString().split("T")[0],
        rating: Number(data.rating),
      } as Testimonial;
      setTestimonials([...testimonials, newTestimonial]);
    }
    setOpenModal(false);
    setSelectedTestimonial(null);
  };

  return (
    <div className="mt-12 mb-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold text-blue-gray-800 mb-2">Testimonials</h2>
          <p className="text-blue-gray-600 text-base">Manage patient testimonials and reviews</p>
        </div>
        <Button
          variant="gradient"
          color="blue"
          className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
          onClick={handleAdd}
        >
          <ChatBubbleLeftRightIcon className="h-5 w-5" />
          Add Testimonial
        </Button>
      </div>

      <DataTable
        title="Testimonial Management"
        data={testimonials}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        searchable={true}
        filterable={true}
        exportable={true}
        addButtonLabel="Add Testimonial"
        searchPlaceholder="Search testimonials..."
      />

      <FormModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setSelectedTestimonial(null);
        }}
        title={selectedTestimonial ? "Edit Testimonial" : "Add New Testimonial"}
        formFields={formFields}
        initialData={selectedTestimonial || {}}
        onSubmit={handleSubmit}
        submitLabel={selectedTestimonial ? "Update Testimonial" : "Add Testimonial"}
      />

      <ViewModal
        open={openViewModal}
        onClose={() => {
          setOpenViewModal(false);
          setSelectedTestimonial(null);
        }}
        title="Testimonial Details"
        data={selectedTestimonial || {}}
        fields={viewFields}
      />

      <DeleteConfirmModal
        open={openDeleteModal}
        onClose={() => {
          setOpenDeleteModal(false);
          setSelectedTestimonial(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Testimonial"
        message="Are you sure you want to delete this testimonial?"
        itemName={selectedTestimonial?.patientName}
      />
    </div>
  );
}

