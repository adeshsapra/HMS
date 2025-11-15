import { useState } from "react";
import { DataTable, FormModal, ViewModal, DeleteConfirmModal } from "@/components";
import { testimonialsData } from "@/data/hms-data";
import { Avatar, Typography, Button } from "@material-tailwind/react";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState(testimonialsData);
  const [openModal, setOpenModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);

  const columns = [
    {
      key: "avatar",
      label: "Photo",
      render: (value, row) => (
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
      render: (value) => (
        <span className="font-bold text-blue-gray-800">{value}</span>
      ),
    },
    {
      key: "rating",
      label: "Rating",
      render: (value) => (
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
      render: (value) => (
        <Typography className="text-sm text-blue-gray-600 max-w-md truncate">
          {value}
        </Typography>
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
    {
      key: "status",
      label: "Status",
      type: "status",
    },
  ];

  const viewFields = [
    { key: "avatar", label: "Photo", type: "avatar" },
    { key: "patientName", label: "Patient Name", type: "text" },
    { key: "rating", label: "Rating", type: "text" },
    { key: "comment", label: "Comment", type: "text", fullWidth: true },
    { key: "date", label: "Date", type: "date" },
    { key: "status", label: "Status", type: "status" },
  ];

  const formFields = [
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
        { value: 5, label: "5 Stars" },
        { value: 4, label: "4 Stars" },
        { value: 3, label: "3 Stars" },
        { value: 2, label: "2 Stars" },
        { value: 1, label: "1 Star" },
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

  const handleAdd = () => {
    setSelectedTestimonial(null);
    setOpenModal(true);
  };

  const handleEdit = (testimonial) => {
    setSelectedTestimonial(testimonial);
    setOpenModal(true);
  };

  const handleDelete = (testimonial) => {
    setSelectedTestimonial(testimonial);
    setOpenDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedTestimonial) {
      setTestimonials(testimonials.filter((t) => t.id !== selectedTestimonial.id));
      setOpenDeleteModal(false);
      setSelectedTestimonial(null);
    }
  };

  const handleView = (testimonial) => {
    setSelectedTestimonial(testimonial);
    setOpenViewModal(true);
  };

  const handleSubmit = (data) => {
    if (selectedTestimonial) {
      setTestimonials(
        testimonials.map((t) =>
          t.id === selectedTestimonial.id
            ? { ...t, ...data, avatar: t.avatar, date: t.date }
            : t
        )
      );
    } else {
      const newTestimonial = {
        id: testimonials.length + 1,
        ...data,
        avatar: "/img/team-1.jpeg",
        date: new Date().toISOString().split("T")[0],
      };
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
