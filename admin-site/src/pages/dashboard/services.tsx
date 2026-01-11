import React, { useState, useEffect } from "react";
import { DataTable, FormModal, ViewModal, DeleteConfirmModal, Column, FormField, ViewField, Pagination } from "@/components";
import { Button } from "@material-tailwind/react";
import { BriefcaseIcon } from "@heroicons/react/24/outline";
import { apiService } from "@/services/api";

// Get default page size from settings or use 10 as default
const DEFAULT_PAGE_SIZE = parseInt(localStorage.getItem('settings_page_size') || '10', 10);

interface Service {
  id: number;
  name: string;
  department_id?: number;
  department?: {
    id: number;
    name: string;
  };
  description: string;
  price: number;
  category?: string;
  icon?: string;
  duration?: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface Department {
  id: number;
  name: string;
}

export default function Services(): JSX.Element {
  const [services, setServices] = useState<Service[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openViewModal, setOpenViewModal] = useState<boolean>(false);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  useEffect(() => {
    fetchServices();
  }, [currentPage, pageSize]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await apiService.getServices(currentPage, pageSize);
      if (response.success && response.data) {
        setServices(response.data || []);
        setTotalPages(response.meta?.last_page || 1);
      }
    } catch (error: any) {
      alert(error.message || "Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await apiService.getDepartments(1, 100); // Get first 100 departments for dropdown
      if (response.success && response.data) {
        setDepartments(response.data || []);
      }
    } catch (error: any) {
      console.error("Failed to fetch departments:", error);
    }
  };

  const columns: Column[] = [
    {
      key: "name",
      label: "Service Name",
      render: (value: any, row: any) => (
        <div className="flex items-center gap-3">
          {row.icon && <i className={`bi ${row.icon} text-xl text-blue-500`}></i>}
          <span className="font-bold text-blue-gray-800">{value}</span>
        </div>
      ),
    },
    {
      key: "department",
      label: "Department",
      render: (value: any) => (
        <span className="text-blue-gray-700">{value?.name || 'Not assigned'}</span>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (value: any) => (
        value ? <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-semibold">{value}</span> : '-'
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
      key: "price",
      label: "Price",
      render: (value: any) => (
        <span className="font-bold text-green-600 text-base">
          ${parseFloat(value).toFixed(2)}
        </span>
      ),
    },
    {
      key: "duration",
      label: "Duration",
      render: (value: any) => (
        value ? <span className="text-sm text-blue-gray-600">{value} min</span> : '-'
      ),
    },
    {
      key: "is_active",
      label: "Status",
      render: (value: any) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  const viewFields: ViewField[] = [
    { key: "name", label: "Service Name" },
    {
      key: "department",
      label: "Department",
      render: (value: any) => value?.name || 'Not assigned'
    },
    { key: "category", label: "Category" },
    { key: "description", label: "Description", fullWidth: true },
    { key: "price", label: "Price", type: "currency" },
    {
      key: "duration",
      label: "Duration",
      render: (value: any) => value ? `${value} minutes` : '-'
    },
    { key: "icon", label: "Icon" },
    {
      key: "is_active",
      label: "Status",
      render: (value: any) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  const formFields: FormField[] = [
    {
      name: "name",
      label: "Service Name",
      type: "text",
      required: true,
      placeholder: "Cardiology Consultation",
    },
    {
      name: "department_id",
      label: "Department",
      type: "select",
      required: false,
      options: departments.map(d => ({ value: String(d.id), label: d.name })),
    },
    {
      name: "category",
      label: "Category",
      type: "select",
      required: false,
      options: [
        { value: "Consultation", label: "Consultation" },
        { value: "Diagnostic", label: "Diagnostic" },
        { value: "Surgery", label: "Surgery" },
        { value: "Treatment", label: "Treatment" },
        { value: "Emergency", label: "Emergency" },
        { value: "Preventive", label: "Preventive" },
        { value: "Checkup", label: "Checkup" },
      ],
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
      name: "duration",
      label: "Duration (minutes)",
      type: "number",
      required: false,
      min: 0,
      placeholder: "30",
    },
    {
      name: "icon",
      label: "Icon",
      type: "icon-picker",
      required: false,
      placeholder: "Select an icon",
    },
    {
      name: "is_active",
      label: "Status",
      type: "select",
      required: true,
      options: [
        { value: "true", label: "Active" },
        { value: "false", label: "Inactive" },
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

  const confirmDelete = async (): Promise<void> => {
    if (selectedService) {
      try {
        await apiService.deleteService(selectedService.id);
        alert("Service deleted successfully!");
        fetchServices();
        setOpenDeleteModal(false);
        setSelectedService(null);
      } catch (error: any) {
        alert(error.message || "Failed to delete service");
      }
    }
  };

  const handleView = (service: Service): void => {
    setSelectedService(service);
    setOpenViewModal(true);
  };

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      // Convert string types to proper types
      if (data.department_id) {
        data.department_id = parseInt(data.department_id);
      }
      if (data.is_active === "true" || data.is_active === true) {
        data.is_active = true;
      } else if (data.is_active === "false" || data.is_active === false) {
        data.is_active = false;
      }

      if (selectedService) {
        await apiService.updateService(selectedService.id, data);
        alert("Service updated successfully!");
      } else {
        await apiService.createService(data);
        alert("Service created successfully!");
      }
      fetchServices();
      setOpenModal(false);
      setSelectedService(null);
    } catch (error: any) {
      alert(error.message || "Failed to save service");
    }
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
        pagination={{
          currentPage,
          totalPages,
          onPageChange: setCurrentPage,
        }}
      />

      {/* Pagination Component */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

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
        message="Are you sure you want to delete this service? This action cannot be undone."
        itemName={selectedService?.name}
      />
    </div>
  );
}
