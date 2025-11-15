import React, { useState } from "react";
import { DataTable, FormModal, ViewModal, DeleteConfirmModal, Column, FormField, ViewField } from "@/components";
import { servicesData, departmentsData } from "@/data/hms-data";
import { Button } from "@material-tailwind/react";
import { BriefcaseIcon } from "@heroicons/react/24/outline";

interface Service {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  status: string;
  icon?: string;
}

export default function Services(): JSX.Element {
  const [services, setServices] = useState<Service[]>(servicesData);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openViewModal, setOpenViewModal] = useState<boolean>(false);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const columns: Column[] = [
    { 
      key: "name", 
      label: "Service Name",
      render: (value: any) => (
        <span className="font-bold text-blue-gray-800">{value}</span>
      ),
    },
    { key: "category", label: "Category" },
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
      key: "price",
      label: "Price",
      render: (value: any) => (
        <span className="font-bold text-green-600 text-base">
          ${value.toFixed(2)}
        </span>
      ),
    },
    { key: "status", label: "Status", type: "status" },
  ];

  const viewFields: ViewField[] = [
    { key: "name", label: "Service Name" },
    { key: "category", label: "Category" },
    { key: "description", label: "Description", fullWidth: true },
    { key: "price", label: "Price", type: "currency" },
    { key: "status", label: "Status", type: "status" },
  ];

  const formFields: FormField[] = [
    {
      name: "name",
      label: "Service Name",
      type: "text",
      required: true,
      placeholder: "Cardiology Services",
    },
    {
      name: "category",
      label: "Category",
      type: "select",
      required: true,
      options: departmentsData.map((d) => ({ value: d.name, label: d.name })),
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      required: true,
      placeholder: "Service description",
      fullWidth: true,
    },
    {
      name: "price",
      label: "Price ($)",
      type: "number",
      required: true,
      min: 0,
      placeholder: "Enter price",
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
    setSelectedService(null);
    setOpenModal(true);
  };

  const handleEdit = (service: Service): void => {
    setSelectedService(service);
    setOpenModal(true);
  };

  const handleDelete = (service: Service): void => {
    setSelectedService(service);
    setOpenDeleteModal(true);
  };

  const confirmDelete = (): void => {
    if (selectedService) {
      setServices(services.filter((s) => s.id !== selectedService.id));
      setOpenDeleteModal(false);
      setSelectedService(null);
    }
  };

  const handleView = (service: Service): void => {
    setSelectedService(service);
    setOpenViewModal(true);
  };

  const handleSubmit = (data: Record<string, any>): void => {
    if (selectedService) {
      setServices(
        services.map((s) =>
          s.id === selectedService.id ? { ...s, ...data } : s
        )
      );
    } else {
      const newService: Service = {
        id: services.length + 1,
        ...data,
        icon: "fa-medical",
      } as Service;
      setServices([...services, newService]);
    }
    setOpenModal(false);
    setSelectedService(null);
  };

  return (
    <div className="mt-12 mb-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold text-blue-gray-800 mb-2">Services</h2>
          <p className="text-blue-gray-600 text-base">Manage hospital services and offerings</p>
        </div>
        <Button
          variant="gradient"
          color="blue"
          className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
          onClick={handleAdd}
        >
          <BriefcaseIcon className="h-5 w-5" />
          Add Service
        </Button>
      </div>

      <DataTable
        title="Service Management"
        data={services}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        searchable={true}
        filterable={true}
        exportable={true}
        addButtonLabel="Add Service"
        searchPlaceholder="Search services..."
      />

      <FormModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setSelectedService(null);
        }}
        title={selectedService ? "Edit Service" : "Add New Service"}
        formFields={formFields}
        initialData={selectedService || {}}
        onSubmit={handleSubmit}
        submitLabel={selectedService ? "Update Service" : "Add Service"}
      />

      <ViewModal
        open={openViewModal}
        onClose={() => {
          setOpenViewModal(false);
          setSelectedService(null);
        }}
        title="Service Details"
        data={selectedService || {}}
        fields={viewFields}
      />

      <DeleteConfirmModal
        open={openDeleteModal}
        onClose={() => {
          setOpenDeleteModal(false);
          setSelectedService(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Service"
        message="Are you sure you want to delete this service?"
        itemName={selectedService?.name}
      />
    </div>
  );
}

