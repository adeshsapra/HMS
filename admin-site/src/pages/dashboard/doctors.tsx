import React, { useState, useEffect } from "react";
import { DataTable, ViewModal, DeleteConfirmModal, Column, ViewField, FormModal, FormField, AdvancedFilter, FilterConfig } from "@/components";
import { Avatar, Typography, Button } from "@material-tailwind/react";
import { UserPlusIcon } from "@heroicons/react/24/outline";
import apiService from "@/services/api";
import { useToast } from "@/context/ToastContext";

// Backend storage URL for images
const STORAGE_URL = (import.meta as any).env?.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000';

interface Doctor {
  id: number;
  doctor_id?: string;
  first_name: string;
  last_name: string;
  user_id: number;
  user?: { id: number; name: string; email: string; phone?: string };
  gender: string;
  date_of_birth?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  specialization: string;
  qualification: string;
  experience_years: number;
  license_number: string;
  department_id?: number;
  department?: { id: number; name: string };
  joining_date: string;
  employment_type: string;
  consultation_fee: number;
  working_days?: string[];
  working_hours_start?: string;
  working_hours_end?: string;
  bio?: string;
  languages?: string[];
  status: string;
  profile_picture?: string;
}

interface ApiError {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  error?: string;
}

// Helper function to get profile picture URL
const getProfilePictureUrl = (profilePicture?: string): string => {
  if (!profilePicture) return "/img/team-1.jpeg";
  if (profilePicture.startsWith('http')) return profilePicture;
  return `${STORAGE_URL}/storage/${profilePicture}`;
};

export default function Doctors(): JSX.Element {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openViewModal, setOpenViewModal] = useState<boolean>(false);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const { showToast } = useToast();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const perPage = 10;

  useEffect(() => {
    loadDoctors(currentPage, activeFilters);
    loadDepartments();
  }, [currentPage]);

  const loadDoctors = async (page: number = currentPage, filters: Record<string, any> = activeFilters) => {
    try {
      setLoading(true);
      const response = await apiService.getDoctors(page, perPage, filters);
      if (response.success && response.data) {
        setDoctors(response.data);
        setTotalPages(response.last_page || 1);
        setTotalRecords(response.total || 0);
      }
    } catch (error) {
      console.error("Failed to load doctors:", error);
      showToast('Failed to load doctors. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await apiService.getDepartments();
      if (response.success && response.data) {
        setDepartments(response.data);
      }
    } catch (error) {
      console.error("Failed to load departments:", error);
    }
  };

  const columns: Column[] = [
    {
      key: "profile_picture",
      label: "Photo",
      render: (value: any, row: Doctor) => (
        <Avatar
          src={getProfilePictureUrl(row.profile_picture)}
          alt={`${row.first_name} ${row.last_name}`}
          size="sm"
          variant="rounded"
          className="border-2 border-blue-gray-100 shadow-sm"
          onError={(e: any) => {
            e.target.src = "/img/team-1.jpeg";
          }}
        />
      ),
    },
    {
      key: "name",
      label: "Name",
      render: (value: any, row: Doctor) => (
        <div>
          <Typography variant="small" color="blue-gray" className="font-bold text-sm">
            Dr. {row.first_name} {row.last_name}
          </Typography>
          <Typography className="text-xs font-normal text-blue-gray-500 mt-0.5">
            {row.user?.email}
          </Typography>
        </div>
      ),
    },
    {
      key: "specialization",
      label: "Specialization",
      render: (value: any) => (
        <span className="font-semibold text-blue-gray-700">{value}</span>
      ),
    },
    {
      key: "department",
      label: "Department",
      render: (value: any, row: Doctor) => (
        <span>{row.department?.name || "N/A"}</span>
      ),
    },
    {
      key: "experience_years",
      label: "Experience",
      render: (value: any) => (
        <span>{value} years</span>
      ),
    },
    {
      key: "consultation_fee",
      label: "Consultation Fee",
      render: (value: any) => (
        <span className="font-semibold text-blue-gray-700">${value || 0}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      type: "status",
    },
  ];

  const viewFields: ViewField[] = [
    { key: "profile_picture", label: "Photo", type: "avatar", render: (value: any, row: Doctor) => getProfilePictureUrl(row.profile_picture) },
    { key: "doctor_id", label: "Doctor ID" },
    { key: "first_name", label: "First Name" },
    { key: "last_name", label: "Last Name" },
    { key: "user", label: "Email", render: (value: any, row: Doctor) => row.user?.email || "N/A" },
    { key: "user", label: "Phone", render: (value: any, row: Doctor) => row.user?.phone || "N/A" },
    { key: "gender", label: "Gender", render: (value: string) => value ? value.charAt(0).toUpperCase() + value.slice(1) : "N/A" },
    { key: "date_of_birth", label: "Date of Birth", type: "date" },
    { key: "address", label: "Address", fullWidth: true },
    { key: "city", label: "City" },
    { key: "state", label: "State" },
    { key: "country", label: "Country" },
    { key: "postal_code", label: "Postal Code" },
    { key: "specialization", label: "Specialization" },
    { key: "qualification", label: "Qualification" },
    { key: "experience_years", label: "Experience", render: (value: number) => value !== undefined ? `${value} years` : "N/A" },
    { key: "license_number", label: "License Number" },
    { key: "department", label: "Department", render: (value: any, row: Doctor) => row.department?.name || "N/A" },
    { key: "joining_date", label: "Joining Date", type: "date" },
    {
      key: "employment_type", label: "Employment Type", render: (value: string) => {
        const types: Record<string, string> = {
          full_time: "Full Time",
          part_time: "Part Time",
          contract: "Contract",
          visiting: "Visiting"
        };
        return types[value] || value || "N/A";
      }
    },
    { key: "consultation_fee", label: "Consultation Fee", type: "currency" },
    { key: "working_days", label: "Working Days", render: (value: string[]) => value?.join(", ") || "N/A", fullWidth: true },
    { key: "working_hours_start", label: "Work Hours Start" },
    { key: "working_hours_end", label: "Work Hours End" },
    { key: "bio", label: "Bio", fullWidth: true },
    { key: "languages", label: "Languages", render: (value: string[]) => value?.join(", ") || "N/A" },
    { key: "status", label: "Status", type: "status" },
  ];

  const getFormFields = (): FormField[] => {
    const departmentOptions = departments.map(dept => ({
      value: dept.id.toString(),
      label: dept.name
    }));

    return [
      {
        name: "first_name",
        label: "First Name",
        type: "text",
        required: true,
        placeholder: "Enter first name",
        error: formErrors.first_name
      },
      {
        name: "last_name",
        label: "Last Name",
        type: "text",
        required: true,
        placeholder: "Enter last name",
        error: formErrors.last_name
      },
      {
        name: "email",
        label: "Email",
        type: "email",
        required: true,
        placeholder: "doctor@hospital.com",
        error: formErrors.email
      },
      {
        name: "phone",
        label: "Phone",
        type: "text",
        placeholder: "+1 234-567-8900",
        error: formErrors.phone
      },
      {
        name: "gender",
        label: "Gender",
        type: "select",
        required: true,
        placeholder: "Select Gender",
        options: [
          { value: "male", label: "Male" },
          { value: "female", label: "Female" },
          { value: "other", label: "Other" }
        ],
        error: formErrors.gender
      },
      {
        name: "date_of_birth",
        label: "Date of Birth",
        type: "date",
        error: formErrors.date_of_birth
      },
      {
        name: "password",
        label: "Password",
        type: "password",
        required: !selectedDoctor,
        placeholder: "Minimum 8 characters",
        error: formErrors.password
      },
      {
        name: "address",
        label: "Address",
        type: "textarea",
        fullWidth: true,
        rows: 2,
        placeholder: "Enter address",
        error: formErrors.address
      },
      {
        name: "city",
        label: "City",
        type: "text",
        placeholder: "Enter city",
        error: formErrors.city
      },
      {
        name: "state",
        label: "State",
        type: "text",
        placeholder: "Enter state",
        error: formErrors.state
      },
      {
        name: "country",
        label: "Country",
        type: "text",
        placeholder: "Enter country",
        error: formErrors.country
      },
      {
        name: "postal_code",
        label: "Postal Code",
        type: "text",
        placeholder: "Enter postal code",
        error: formErrors.postal_code
      },
      {
        name: "specialization",
        label: "Specialization",
        type: "text",
        required: true,
        placeholder: "e.g. Cardiology",
        error: formErrors.specialization
      },
      {
        name: "qualification",
        label: "Qualification",
        type: "text",
        required: true,
        placeholder: "e.g. MBBS, MD",
        error: formErrors.qualification
      },
      {
        name: "experience_years",
        label: "Experience (Years)",
        type: "number",
        required: true,
        min: 0,
        placeholder: "0",
        error: formErrors.experience_years
      },
      {
        name: "license_number",
        label: "License Number",
        type: "text",
        required: true,
        placeholder: "e.g. L12345",
        error: formErrors.license_number
      },
      {
        name: "department_id",
        label: "Department",
        type: "select",
        placeholder: "Select Department",
        options: departmentOptions,
        error: formErrors.department_id
      },
      {
        name: "joining_date",
        label: "Joining Date",
        type: "date",
        required: true,
        error: formErrors.joining_date
      },
      {
        name: "employment_type",
        label: "Employment Type",
        type: "select",
        required: true,
        placeholder: "Select Employment Type",
        options: [
          { value: "full_time", label: "Full Time" },
          { value: "part_time", label: "Part Time" },
          { value: "contract", label: "Contract" },
          { value: "visiting", label: "Visiting" }
        ],
        error: formErrors.employment_type
      },
      {
        name: "consultation_fee",
        label: "Consultation Fee ($)",
        type: "number",
        required: true,
        min: 0,
        placeholder: "0",
        error: formErrors.consultation_fee
      },
      {
        name: "working_hours_start",
        label: "Working Hours Start",
        type: "time",
        error: formErrors.working_hours_start
      },
      {
        name: "working_hours_end",
        label: "Working Hours End",
        type: "time",
        error: formErrors.working_hours_end
      },
      {
        name: "working_days",
        label: "Working Days",
        type: "text",
        placeholder: "mon, tue, wed, thu, fri",
        error: formErrors.working_days
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        placeholder: "Select Status",
        options: [
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
          { value: "on_leave", label: "On Leave" }
        ],
        error: formErrors.status
      },
      {
        name: "bio",
        label: "Bio",
        type: "textarea",
        fullWidth: true,
        rows: 3,
        placeholder: "Brief biography of the doctor",
        error: formErrors.bio
      },
      {
        name: "languages",
        label: "Languages",
        type: "text",
        placeholder: "English, Spanish, French",
        error: formErrors.languages
      },
      {
        name: "profile_picture",
        label: "Profile Picture",
        type: "file",
        accept: "image/*",
        error: formErrors.profile_picture
      },
    ];
  };

  const handleAdd = (): void => {
    setSelectedDoctor(null);
    setFormErrors({});
    setOpenModal(true);
  };

  const handleEdit = (doctor: Doctor): void => {
    setSelectedDoctor(doctor);
    setFormErrors({});
    setOpenModal(true);
  };

  const handleDelete = (doctor: Doctor): void => {
    setSelectedDoctor(doctor);
    setOpenDeleteModal(true);
  };

  const handleView = (doctor: Doctor): void => {
    setSelectedDoctor(doctor);
    setOpenViewModal(true);
  };

  const convertToFormData = (data: Record<string, any>): FormData => {
    const formData = new FormData();

    // Fields to exclude from form submission
    const excludeFields = ['id', 'doctor_id', 'is_available', 'created_at', 'updated_at', 'remember_token', 'user'];

    Object.keys(data).forEach(key => {
      // Skip excluded fields
      if (excludeFields.includes(key)) return;

      // Skip if value is undefined or null
      if (data[key] === undefined || data[key] === null) return;

      if (key === "profile_picture") {
        if (data[key] instanceof File) {
          formData.append(key, data[key]);
        }
      } else if (key === "working_days" && typeof data[key] === "string") {
        const days = data[key].split(",").map((day: string) => day.trim().toLowerCase()).filter(Boolean);
        days.forEach((day: string) => {
          formData.append("working_days[]", day);
        });
      } else if (key === "working_days" && Array.isArray(data[key])) {
        data[key].forEach((day: string) => {
          formData.append("working_days[]", day);
        });
      } else if (key === "languages" && typeof data[key] === "string") {
        const languages = data[key].split(",").map((lang: string) => lang.trim()).filter(Boolean);
        languages.forEach((lang: string) => {
          formData.append("languages[]", lang);
        });
      } else if (key === "languages" && Array.isArray(data[key])) {
        data[key].forEach((lang: string) => {
          formData.append("languages[]", lang);
        });
      } else if (typeof data[key] === "boolean") {
        formData.append(key, data[key] ? "1" : "0");
      } else if (data[key] !== "") {
        formData.append(key, data[key]);
      }
    });

    // For update, include _method=PUT
    if (selectedDoctor) {
      formData.append('_method', 'PUT');
    }

    return formData;
  };

  const handleSubmit = async (data: Record<string, any>): Promise<void> => {
    setFormLoading(true);
    setFormErrors({});

    try {
      const formData = convertToFormData(data);
      let response;

      if (selectedDoctor) {
        response = await apiService.updateDoctor(selectedDoctor.id, formData);
        showToast('Doctor updated successfully!', 'success');
      } else {
        response = await apiService.createDoctor(formData);
        showToast('Doctor created successfully!', 'success');
      }

      setCurrentPage(1);
      await loadDoctors();
      setOpenModal(false);
      setSelectedDoctor(null);
      setFormErrors({});
    } catch (error: any) {
      // Handle validation errors from backend
      if (error.validationErrors) {
        const errors: Record<string, string> = {};
        Object.keys(error.validationErrors).forEach(key => {
          errors[key] = error.validationErrors[key][0];
        });
        setFormErrors(errors);
        showToast('Please fix the form errors', 'error');
      } else {
        showToast(error.message || 'An error occurred', 'error');
      }
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDelete = async (): Promise<void> => {
    if (selectedDoctor) {
      try {
        await apiService.deleteDoctor(selectedDoctor.id);
        showToast('Doctor deleted successfully!', 'success');
        setCurrentPage(1);
        await loadDoctors();
        setOpenDeleteModal(false);
        setSelectedDoctor(null);
      } catch (error: any) {
        console.error("Failed to delete doctor:", error);
        showToast(error.response?.data?.message || 'Failed to delete doctor', 'error');
      }
    }
  };

  const prepareInitialData = (doctor: Doctor | null): Record<string, any> => {
    if (!doctor) return {};

    return {
      ...doctor,
      email: doctor.user?.email || "",
      phone: doctor.user?.phone || "",
      department_id: doctor.department_id?.toString() || "",
      working_days: Array.isArray(doctor.working_days) ? doctor.working_days.join(", ") : doctor.working_days || "",
      languages: Array.isArray(doctor.languages) ? doctor.languages.join(", ") : doctor.languages || "",
      // Convert date formats for input fields
      date_of_birth: doctor.date_of_birth ? doctor.date_of_birth.split('T')[0] : "",
      joining_date: doctor.joining_date ? doctor.joining_date.split('T')[0] : "",
    };
  };

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  const handleModalClose = (): void => {
    setOpenModal(false);
    setSelectedDoctor(null);
    setFormErrors({});
  };

  return (
    <div className="mt-12 mb-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold text-blue-gray-800 mb-2">Doctors</h2>
          <p className="text-blue-gray-600 text-base">Manage all doctors and medical specialists</p>
        </div>
        <Button
          variant="gradient"
          color="blue"
          className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
          onClick={handleAdd}
        >
          <UserPlusIcon className="h-5 w-5" />
          Add Doctor
        </Button>
      </div>

      <AdvancedFilter
        config={{
          fields: [
            {
              name: 'keyword',
              label: 'Search Everywhere',
              type: 'text',
              placeholder: 'Search by ID, name, specialization, email...'
            },
            {
              name: 'department_id',
              label: 'Department',
              type: 'select',
              options: [
                { label: 'All Departments', value: '' },
                ...departments.map(d => ({ label: d.name, value: d.id.toString() }))
              ]
            },
            {
              name: 'specialization',
              label: 'Specialization',
              type: 'text',
              placeholder: 'e.g. Cardiology'
            },
            {
              name: 'employment_type',
              label: 'Emp. Type',
              type: 'select',
              options: [
                { label: 'All Types', value: '' },
                { value: "full_time", label: "Full Time" },
                { value: "part_time", label: "Part Time" },
                { value: "contract", label: "Contract" },
                { value: "visiting", label: "Visiting" }
              ]
            },
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: [
                { label: 'All Statuses', value: '' },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
                { value: "on_leave", label: "On Leave" }
              ]
            },
            {
              name: 'gender',
              label: 'Gender',
              type: 'select',
              options: [
                { label: 'All Genders', value: '' },
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "other", label: "Other" }
              ]
            }
          ],
          onApplyFilters: (filters) => {
            setActiveFilters(filters);
            setCurrentPage(1);
            loadDoctors(1, filters);
          },
          onResetFilters: () => {
            setActiveFilters({});
            setCurrentPage(1);
            loadDoctors(1, {});
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
          title="Doctor Management"
          data={doctors}
          columns={columns}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          searchable={false}
          filterable={false}
          exportable={true}
          addButtonLabel="Add Doctor"
          searchPlaceholder="Search doctors..."
          pagination={{
            currentPage: currentPage,
            totalPages: totalPages,
            totalItems: totalRecords,
            perPage: perPage,
            onPageChange: handlePageChange
          }}
        />
      )}

      <FormModal
        open={openModal}
        onClose={handleModalClose}
        title={selectedDoctor ? "Edit Doctor" : "Add New Doctor"}
        formFields={getFormFields()}
        initialData={prepareInitialData(selectedDoctor)}
        onSubmit={handleSubmit}
        submitLabel={selectedDoctor ? "Update Doctor" : "Add Doctor"}
        loading={formLoading}

      />

      <ViewModal
        open={openViewModal}
        onClose={() => {
          setOpenViewModal(false);
          setSelectedDoctor(null);
        }}
        title="Doctor Details"
        data={selectedDoctor || {}}
        fields={viewFields}
      />

      <DeleteConfirmModal
        open={openDeleteModal}
        onClose={() => {
          setOpenDeleteModal(false);
          setSelectedDoctor(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Doctor"
        message="Are you sure you want to delete this doctor? This action cannot be undone and will delete all associated user data."
        itemName={selectedDoctor ? `Dr. ${selectedDoctor.first_name} ${selectedDoctor.last_name}` : ""}
      />
    </div>
  );
}