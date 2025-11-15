import { useState } from "react";
import { DataTable, FormModal, ViewModal, DeleteConfirmModal } from "@/components";
import { faqData } from "@/data/hms-data";
import { Button } from "@material-tailwind/react";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

export default function FAQ() {
  const [faqs, setFaqs] = useState(faqData);
  const [openModal, setOpenModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState(null);

  const columns = [
    {
      key: "question",
      label: "Question",
      render: (value) => (
        <span className="font-bold text-blue-gray-800">{value}</span>
      ),
    },
    {
      key: "answer",
      label: "Answer",
      render: (value) => (
        <div className="max-w-md text-sm text-blue-gray-600 truncate">
          {value}
        </div>
      ),
    },
    { key: "category", label: "Category" },
    { key: "status", label: "Status", type: "status" },
  ];

  const viewFields = [
    { key: "question", label: "Question", type: "text", fullWidth: true },
    { key: "answer", label: "Answer", type: "text", fullWidth: true },
    { key: "category", label: "Category", type: "text" },
    { key: "status", label: "Status", type: "status" },
  ];

  const formFields = [
    {
      name: "question",
      label: "Question",
      type: "text",
      required: true,
      placeholder: "Enter question",
      fullWidth: true,
    },
    {
      name: "answer",
      label: "Answer",
      type: "textarea",
      required: true,
      placeholder: "Enter answer...",
      fullWidth: true,
    },
    {
      name: "category",
      label: "Category",
      type: "select",
      required: true,
      options: [
        { value: "General", label: "General" },
        { value: "Appointments", label: "Appointments" },
        { value: "Billing", label: "Billing" },
        { value: "Services", label: "Services" },
        { value: "Insurance", label: "Insurance" },
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
    setSelectedFaq(null);
    setOpenModal(true);
  };

  const handleEdit = (faq) => {
    setSelectedFaq(faq);
    setOpenModal(true);
  };

  const handleDelete = (faq) => {
    setSelectedFaq(faq);
    setOpenDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedFaq) {
      setFaqs(faqs.filter((f) => f.id !== selectedFaq.id));
      setOpenDeleteModal(false);
      setSelectedFaq(null);
    }
  };

  const handleView = (faq) => {
    setSelectedFaq(faq);
    setOpenViewModal(true);
  };

  const handleSubmit = (data) => {
    if (selectedFaq) {
      setFaqs(
        faqs.map((f) => (f.id === selectedFaq.id ? { ...f, ...data } : f))
      );
    } else {
      const newFaq = {
        id: faqs.length + 1,
        ...data,
      };
      setFaqs([...faqs, newFaq]);
    }
    setOpenModal(false);
    setSelectedFaq(null);
  };

  return (
    <div className="mt-12 mb-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold text-blue-gray-800 mb-2">FAQ</h2>
          <p className="text-blue-gray-600 text-base">Manage frequently asked questions</p>
        </div>
        <Button
          variant="gradient"
          color="blue"
          className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
          onClick={handleAdd}
        >
          <QuestionMarkCircleIcon className="h-5 w-5" />
          Add FAQ
        </Button>
      </div>

      <DataTable
        title="FAQ Management"
        data={faqs}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        searchable={true}
        filterable={true}
        exportable={true}
        addButtonLabel="Add FAQ"
        searchPlaceholder="Search FAQs..."
      />

      <FormModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setSelectedFaq(null);
        }}
        title={selectedFaq ? "Edit FAQ" : "Add New FAQ"}
        formFields={formFields}
        initialData={selectedFaq || {}}
        onSubmit={handleSubmit}
        submitLabel={selectedFaq ? "Update FAQ" : "Add FAQ"}
      />

      <ViewModal
        open={openViewModal}
        onClose={() => {
          setOpenViewModal(false);
          setSelectedFaq(null);
        }}
        title="FAQ Details"
        data={selectedFaq || {}}
        fields={viewFields}
      />

      <DeleteConfirmModal
        open={openDeleteModal}
        onClose={() => {
          setOpenDeleteModal(false);
          setSelectedFaq(null);
        }}
        onConfirm={confirmDelete}
        title="Delete FAQ"
        message="Are you sure you want to delete this FAQ?"
        itemName={selectedFaq?.question}
      />
    </div>
  );
}
