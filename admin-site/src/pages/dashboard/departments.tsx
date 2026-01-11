import React, { useState, useEffect } from "react";
import { DataTable, FormModal, ViewModal, DeleteConfirmModal, Column, FormField, ViewField, Pagination } from "@/components";
import { Button } from "@material-tailwind/react";
import { BuildingOfficeIcon } from "@heroicons/react/24/outline";
import { apiService } from "@/services/api";

// Get default page size from settings or use 10 as default
const DEFAULT_PAGE_SIZE = parseInt(localStorage.getItem('settings_page_size') || '10', 10);

interface Department {
  id: number;
  name: string;
  description: string;
  head_of_department: string;
  icon?: string;
  category?: string;
  image?: string;
  subtitle?: string;
  features?: string[];
  technologies?: string[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function Departments(): JSX.Element {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openViewModal, setOpenViewModal] = useState<boolean>(false);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  useEffect(() => {
    fetchDepartments();
  }, [currentPage, pageSize]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDepartments(currentPage, pageSize);
      if (response.success && response.data) {
        setDepartments(response.data || []);
        setTotalPages(response.meta?.last_page || 1);
      }
    } catch (error: any) {
      alert(error.message || "Failed to fetch departments");
    } finally {
      setLoading(false);
    }
  };

  const columns: Column[] = [
    {
      key: "name",
      label: "Department",
      render: (value: any, row: any) => (
        <div className="flex items-center gap-3">
          {row.icon && <i className={`bi ${row.icon} text-2xl text-blue-500`}></i>}
          <div>
            <span className="font-bold text-blue-gray-800 text-base block">{value}</span>
            {row.subtitle && <span className="text-xs text-blue-gray-500">{row.subtitle}</span>}
          </div>
        </div>
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
      key: "head_of_department",
      label: "Head",
      render: (value: any) => (
        <span className="font-semibold text-blue-gray-700">{value || 'Not assigned'}</span>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (value: any) => (
        value ? <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">{value}</span> : '-'
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
    { key: "name", label: "Department Name" },
    { key: "subtitle", label: "Subtitle" },
    { key: "description", label: "Description", fullWidth: true },
    { key: "head_of_department", label: "Department Head" },
    { key: "category", label: "Category" },
    { key: "icon", label: "Icon" },
    { key: "image", label: "Image" },
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
      label: "Department Name",
      type: "text",
      required: true,
      placeholder: "Cardiology",
    },
    {
      name: "subtitle",
      label: "Subtitle",
      type: "text",
      required: false,
      placeholder: "Heart & Vascular Care",
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
      name: "head_of_department",
      label: "Department Head",
      type: "text",
      required: false,
      placeholder: "Dr. John Smith",
    },
    {
      name: "category",
      label: "Category",
      type: "select",
      required: false,
      options: [
        { value: "Surgical", label: "Surgical" },
        { value: "Specialized", label: "Specialized" },
        { value: "Pediatric", label: "Pediatric" },
        { value: "Cosmetic", label: "Cosmetic" },
        { value: "Emergency", label: "Emergency" },
      ],
    },
    {
      name: "icon",
      label: "Icon",
      type: "icon-picker",
      required: false,
      placeholder: "Select an icon",
    },
    {
      name: "image",
      label: "Department Image",
      type: "file",
      required: false,
      accept: "image/*",
    },
    {
      name: "features",
      label: "Features (comma-separated)",
      type: "textarea",
      required: false,
      placeholder: "Comprehensive Diagnostics, Personalized Treatment Plans, 24/7 Emergency Support",
      fullWidth: true,
    },
    {
      name: "technologies",
      label: "Technologies (comma-separated)",
      type: "textarea",
      required: false,
      placeholder: "Robotic-Assisted Surgery, 3D Imaging & MRI Scanners, Real-time Patient Monitoring",
      fullWidth: true,
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
    setSelectedDepartment(null);
    setOpenModal(true);
  };

  const handleEdit = (department: Department): void => {
    // Convert arrays to comma-separated strings for editing
    const editData = {
      ...department,
      features: department.features ? department.features.join(', ') : '',
      technologies: department.technologies ? department.technologies.join(', ') : ''
    };
    setSelectedDepartment(editData as any);
    setOpenModal(true);
  };

  const handleDelete = (department: Department): void => {
    setSelectedDepartment(department);
    setOpenDeleteModal(true);
  };

  const confirmDelete = async (): Promise<void> => {
    if (selectedDepartment) {
      try {
        await apiService.deleteDepartment(selectedDepartment.id);
        alert("Department deleted successfully!");
        fetchDepartments();
        setOpenDeleteModal(false);
        setSelectedDepartment(null);
      } catch (error: any) {
        alert(error.message || "Failed to delete department");
      }
    }
  };

  const handleView = (department: Department): void => {
    setSelectedDepartment(department);
    setOpenViewModal(true);
  };

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      const formData = new FormData();

      // Append simple fields
      Object.keys(data).forEach(key => {
        if (key === 'image') {
          if (data[key] instanceof File) {
            formData.append('image', data[key]);
          }
        } else if (key === 'features' || key === 'technologies') {
          // Skip these here, handle below
        } else if (key === 'is_active') {
          formData.append('is_active', (data[key] === "true" || data[key] === true) ? '1' : '0');
        } else if (data[key] !== null && data[key] !== undefined) {
          formData.append(key, data[key]);
        }
      });

      // Handle arrays (features, technologies)
      if (data.features) {
        const featuresArray = typeof data.features === 'string'
          ? data.features.split(',').map((f: string) => f.trim()).filter(Boolean)
          : data.features;
        formData.append('features', JSON.stringify(featuresArray));
      }

      if (data.technologies) {
        const techArray = typeof data.technologies === 'string'
          ? data.technologies.split(',').map((t: string) => t.trim()).filter(Boolean)
          : data.technologies;
        formData.append('technologies', JSON.stringify(techArray));
      }

      if (selectedDepartment) {
        await apiService.updateDepartment(selectedDepartment.id, formData);
        alert("Department updated successfully!");
      } else {
        await apiService.createDepartment(formData);
        alert("Department created successfully!");
      }
      fetchDepartments();
      setOpenModal(false);
      setSelectedDepartment(null);
    } catch (error: any) {
      alert(error.message || "Failed to save department");
    }
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
        message="Are you sure you want to delete this department? This action cannot be undone."
        itemName={selectedDepartment?.name}
      />
    </div>
  );
}
