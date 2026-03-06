import React, { useState, useEffect } from "react";
import { DataTable, FormModal, ViewModal, DeleteConfirmModal, Column, FormField, ViewField, Pagination, AdvancedFilter, FilterConfig } from "@/components";
import { Button } from "@material-tailwind/react";
import { BuildingOfficeIcon } from "@heroicons/react/24/outline";
import { apiService } from "@/services/api";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";

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
  const { hasPermission } = useAuth();
  const { showToast } = useToast();
  const backendBaseUrl = ((import.meta as any).env?.VITE_API_BASE_URL?.replace(/\/api\/?$/, '') || 'http://localhost:8000');

  const getDepartmentImageCandidates = (value: string): string[] => {
    if (!value) return [];
    if (value.startsWith('http')) return [value];

    const cleanPath = String(value).replace(/\\/g, '/').replace(/^\/+/, '');
    const candidates: string[] = [];

    if (cleanPath.startsWith('departments/')) {
      candidates.push(`${backendBaseUrl}/storage/${cleanPath}`);
      candidates.push(`${backendBaseUrl}/${cleanPath}`);
    } else if (cleanPath.startsWith('storage/') || cleanPath.startsWith('images/')) {
      candidates.push(`${backendBaseUrl}/${cleanPath}`);
    } else {
      candidates.push(`${backendBaseUrl}/${cleanPath}`);
      candidates.push(`${backendBaseUrl}/storage/${cleanPath}`);
      candidates.push(`${backendBaseUrl}/storage/departments/${cleanPath}`);
      candidates.push(`${backendBaseUrl}/images/departments/${cleanPath}`);
    }

    return [...new Set(candidates)];
  };

  const normalizeCommaSeparated = (value: any): string => {
    if (!value) return "";
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed.join(", ");
      } catch {
        // Keep as plain string if it is not JSON
      }
      return value;
    }
    return "";
  };

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
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchDepartments(currentPage, activeFilters);
  }, [currentPage, pageSize]);

  const fetchDepartments = async (page: number = currentPage, filters: Record<string, any> = activeFilters) => {
    try {
      setLoading(true);
      const response = await apiService.getDepartments(page, pageSize, filters);
      if ((response.success || response.status) && response.data) {
        setDepartments(response.data || []);
        setTotalPages(response.meta?.last_page || 1);
      }
    } catch (error: any) {
      showToast(error.message || "Failed to fetch departments", "error");
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
    { key: "id", label: "ID" },
    { key: "name", label: "Department Name" },
    { key: "subtitle", label: "Subtitle" },
    { key: "description", label: "Description", type: "longtext", fullWidth: true },
    { key: "head_of_department", label: "Department Head" },
    { key: "category", label: "Category" },
    {
      key: "icon",
      label: "Icon",
      render: (value: any) => (
        value ? (
          <div className="flex items-center gap-2">
            <i className={`bi ${value} text-lg text-blue-600`} />
            <span>{value}</span>
          </div>
        ) : '-'
      ),
    },
    {
      key: "image",
      label: "Image",
      fullWidth: true,
      render: (value: any) => (
        value ? (
          <img
            src={getDepartmentImageCandidates(String(value))[0]}
            alt="Department"
            className="max-h-40 rounded-lg border border-blue-gray-100 object-cover"
            data-try-index="0"
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              const candidates = getDepartmentImageCandidates(String(value));
              const currentIndex = Number(img.dataset.tryIndex || '0');
              const nextIndex = currentIndex + 1;

              if (nextIndex < candidates.length) {
                img.dataset.tryIndex = String(nextIndex);
                img.src = candidates[nextIndex];
                return;
              }

              img.style.display = 'none';
            }}
          />
        ) : '-'
      ),
    },
    {
      key: "features",
      label: "Features",
      fullWidth: true,
      render: (value: any) => {
        const parsed = typeof value === 'string'
          ? (() => {
            try { return JSON.parse(value); } catch { return []; }
          })()
          : value;
        return parsed && Array.isArray(parsed) && parsed.length > 0 ? (
          <ul className="list-disc list-inside text-sm">
            {parsed.map((item: string, idx: number) => <li key={idx}>{item}</li>)}
          </ul>
        ) : '-';
      }
    },
    {
      key: "technologies",
      label: "Technologies",
      fullWidth: true,
      render: (value: any) => {
        const parsed = typeof value === 'string'
          ? (() => {
            try { return JSON.parse(value); } catch { return []; }
          })()
          : value;
        return parsed && Array.isArray(parsed) && parsed.length > 0 ? (
          <ul className="list-disc list-inside text-sm">
            {parsed.map((item: string, idx: number) => <li key={idx}>{item}</li>)}
          </ul>
        ) : '-';
      }
    },
    {
      key: "is_active",
      label: "Status",
      type: "status",
      render: (value: any) => value ? "Active" : "Inactive",
    },
    { key: "created_at", label: "Created At", type: "datetime" },
    { key: "updated_at", label: "Updated At", type: "datetime" },
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
    if (!hasPermission("create-departments")) {
      showToast("You don't have permission to create departments", "error");
      return;
    }
    setSelectedDepartment(null);
    setOpenModal(true);
  };

  const handleEdit = async (department: Department): Promise<void> => {
    if (!hasPermission("edit-departments")) {
      showToast("You don't have permission to edit departments", "error");
      return;
    }

    const baseEditData = {
      ...department,
      features: normalizeCommaSeparated((department as any).features),
      technologies: normalizeCommaSeparated((department as any).technologies),
    };
    setSelectedDepartment(baseEditData as any);
    setOpenModal(true);

    try {
      const response = await apiService.getDepartment(department.id);
      const fullDepartment = ((response as any).data && !(response as any).data.data)
        ? (response as any).data
        : (response as any).data?.data || department;

      const editData = {
        ...fullDepartment,
        features: normalizeCommaSeparated(fullDepartment?.features),
        technologies: normalizeCommaSeparated(fullDepartment?.technologies),
      };

      setSelectedDepartment(editData as any);
    } catch (error: any) {
      showToast(error.message || "Loaded editable data from table row only", "error");
    }
  };

  const handleDelete = (department: Department): void => {
    if (!hasPermission("delete-departments")) {
      showToast("You don't have permission to delete departments", "error");
      return;
    }
    setSelectedDepartment(department);
    setOpenDeleteModal(true);
  };

  const confirmDelete = async (): Promise<void> => {
    if (selectedDepartment) {
      try {
        const response = await apiService.deleteDepartment(selectedDepartment.id);
        showToast(response.message || "Department deleted successfully!", "success");
        fetchDepartments();
        setOpenDeleteModal(false);
        setSelectedDepartment(null);
      } catch (error: any) {
        showToast(error.message || "Failed to delete department", "error");
      }
    }
  };

  const handleView = async (department: Department): Promise<void> => {
    setSelectedDepartment(department);
    setOpenViewModal(true);

    try {
      const response = await apiService.getDepartment(department.id);
      const fullDepartment = ((response as any).data && !(response as any).data.data)
        ? (response as any).data
        : (response as any).data?.data || department;
      setSelectedDepartment(fullDepartment);
    } catch (error: any) {
      showToast(error.message || "Showing row data only", "error");
    }
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
        const response = await apiService.updateDepartment(selectedDepartment.id, formData);
        showToast(response.message || "Department updated successfully!", "success");
      } else {
        const response = await apiService.createDepartment(formData);
        showToast(response.message || "Department created successfully!", "success");
      }
      fetchDepartments();
      setOpenModal(false);
      setSelectedDepartment(null);
    } catch (error: any) {
      showToast(error.message || "Failed to save department", "error");
    }
  };

  return (
    <div className="mt-12 mb-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold text-blue-gray-800 mb-2">Departments</h2>
          <p className="text-blue-gray-600 text-base">Manage hospital departments and specialties</p>
        </div>
        {hasPermission("create-departments") && (
          <Button
            variant="gradient"
            color="blue"
            className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
            onClick={handleAdd}
          >
            <BuildingOfficeIcon className="h-5 w-5" />
            Add Department
          </Button>
        )}
      </div>

      <AdvancedFilter
        config={{
          fields: [
            {
              name: 'keyword',
              label: 'Search Everywhere',
              type: 'text',
              placeholder: 'Search by name, description, head...'
            },
            {
              name: 'is_active',
              label: 'Status',
              type: 'select',
              options: [
                { label: 'All Statuses', value: '' },
                { label: 'Active', value: '1' },
                { label: 'Inactive', value: '0' }
              ]
            },
            {
              name: 'category',
              label: 'Category',
              type: 'select',
              options: [
                { label: 'All Categories', value: '' },
                { value: "Surgical", label: "Surgical" },
                { value: "Specialized", label: "Specialized" },
                { value: "Pediatric", label: "Pediatric" },
                { value: "Cosmetic", label: "Cosmetic" },
                { value: "Emergency", label: "Emergency" },
              ]
            }
          ],
          onApplyFilters: (filters) => {
            setActiveFilters(filters);
            setCurrentPage(1);
            fetchDepartments(1, filters);
          },
          onResetFilters: () => {
            setActiveFilters({});
            setCurrentPage(1);
            fetchDepartments(1, {});
          },
          initialValues: activeFilters
        }}
      />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <DataTable
          title="Department Management"
          data={departments}
          columns={columns}
          onAdd={hasPermission("create-departments") ? handleAdd : undefined}
          onEdit={hasPermission("edit-departments") ? handleEdit : undefined}
          onDelete={hasPermission("delete-departments") ? handleDelete : undefined}
          onView={handleView}
          searchable={false}
          filterable={false}
          exportable={true}
          addButtonLabel="Add Department"
          searchPlaceholder="Search departments..."
          pagination={{
            currentPage,
            totalPages,
            onPageChange: setCurrentPage,
          }}
        />
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
