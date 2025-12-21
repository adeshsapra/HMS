import React, { useState, useEffect } from "react";
import { DataTable, ViewModal, DeleteConfirmModal, Column, ViewField, FormModal, FormField } from "@/components";
import { Avatar, Typography, Button } from "@material-tailwind/react";
import { UserPlusIcon } from "@heroicons/react/24/outline";
import apiService from "@/services/api";
import { useToast } from "@/context/ToastContext";

// Backend storage URL for images
const STORAGE_URL = (import.meta as any).env?.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000';

interface StaffMember {
  id: number;
  staff_id?: string;
  first_name: string;
  last_name: string;
  user?: {
    id: number;
    email: string;
    phone?: string;
    role_id?: number;
    name?: string;
  };
  email?: string;
  phone?: string;
  gender: string;
  date_of_birth?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  designation: string;
  department_id?: number;
  department?: { id: number; name: string };
  staff_type: string;
  employment_type: string;
  joining_date: string;
  probation_end_date?: string;
  contract_end_date?: string;
  qualification?: string;
  specialization?: string;
  experience_years: number;
  employee_id?: string;
  badge_number?: string;
  shift?: string;
  work_hours_start?: string;
  work_hours_end?: string;
  working_days?: string[];
  reporting_manager?: string;
  work_location?: string;
  employment_status: string;
  marital_status?: string;
  profile_picture?: string;
}

// Helper function to get profile picture URL
const getProfilePictureUrl = (profilePicture?: string): string => {
  if (!profilePicture) return "/img/team-2.jpeg";
  if (profilePicture.startsWith('http')) return profilePicture;
  return `${STORAGE_URL}/storage/${profilePicture}`;
};

export default function Staff(): JSX.Element {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openViewModal, setOpenViewModal] = useState<boolean>(false);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const { showToast } = useToast();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const perPage = 10;

  useEffect(() => {
    loadStaff();
    loadDepartments();
  }, [currentPage]);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const response = await apiService.getStaff(currentPage, perPage);
      if (response.success && response.data) {
        setStaff(response.data);
        setTotalPages(response.last_page || 1);
        setTotalRecords(response.total || 0);
      }
    } catch (error) {
      console.error("Failed to load staff:", error);
      showToast('Failed to load staff members', 'error');
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
      render: (value: any, row: StaffMember) => (
        <Avatar
          src={getProfilePictureUrl(row.profile_picture)}
          alt={`${row.first_name} ${row.last_name}`}
          size="sm"
          variant="rounded"
          className="border-2 border-blue-gray-100 shadow-sm"
          onError={(e: any) => {
            e.target.src = "/img/team-2.jpeg";
          }}
        />
      ),
    },
    {
      key: "name",
      label: "Name",
      render: (value: any, row: StaffMember) => (
        <div>
          <Typography variant="small" color="blue-gray" className="font-bold text-sm">
            {row.first_name} {row.last_name}
          </Typography>
          <Typography className="text-xs font-normal text-blue-gray-500 mt-0.5">
            {row.user?.email || row.email}
          </Typography>
        </div>
      ),
    },
    {
      key: "designation",
      label: "Designation",
      render: (value: any) => (
        <span className="font-semibold text-blue-gray-700">{value}</span>
      ),
    },
    {
      key: "department",
      label: "Department",
      render: (value: any, row: StaffMember) => (
        <span>{row.department?.name || "N/A"}</span>
      ),
    },
    {
      key: "shift",
      label: "Shift",
      render: (value: string) => {
        const shifts: Record<string, string> = {
          morning: "Morning",
          afternoon: "Afternoon",
          night: "Night",
          rotating: "Rotating"
        };
        return shifts[value] || value || "N/A";
      }
    },
    {
      key: "employment_status",
      label: "Status",
      type: "status",
      render: (value: string) => {
        const statusConfig: Record<string, { color: string, label: string }> = {
          active: { color: "green", label: "Active" },
          inactive: { color: "gray", label: "Inactive" },
          on_leave: { color: "yellow", label: "On Leave" },
          terminated: { color: "red", label: "Terminated" }
        };
        const status = statusConfig[value] || { color: "gray", label: "N/A" };
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${status.color}-100 text-${status.color}-800`}>
            {status.label}
          </span>
        );
      }
    },
  ];

  const viewFields: ViewField[] = [
    { key: "profile_picture", label: "Photo", type: "avatar", render: (value: any, row: StaffMember) => getProfilePictureUrl(row.profile_picture) },
    { key: "staff_id", label: "Staff ID" },
    { key: "first_name", label: "First Name" },
    { key: "last_name", label: "Last Name" },
    { key: "email", label: "Email", render: (value: any, row: StaffMember) => row.user?.email || row.email },
    { key: "phone", label: "Phone", render: (value: any, row: StaffMember) => row.user?.phone || row.phone },
    { key: "gender", label: "Gender", render: (value: string) => value ? value.charAt(0).toUpperCase() + value.slice(1) : "N/A" },
    { key: "date_of_birth", label: "Date of Birth", type: "date" },
    { key: "marital_status", label: "Marital Status", render: (value: string) => value ? value.charAt(0).toUpperCase() + value.slice(1) : "N/A" },
    { key: "address", label: "Address", fullWidth: true },
    { key: "city", label: "City" },
    { key: "state", label: "State" },
    { key: "country", label: "Country" },
    { key: "postal_code", label: "Postal Code" },
    { key: "emergency_contact_name", label: "Emergency Contact" },
    { key: "emergency_contact_phone", label: "Emergency Phone" },
    { key: "emergency_contact_relation", label: "Relationship" },
    { key: "designation", label: "Designation" },
    { key: "department", label: "Department", render: (value: any, row: StaffMember) => row.department?.name || "N/A" },
    {
      key: "staff_type", label: "Staff Type", render: (value: string) => {
        const types: Record<string, string> = {
          administrative: "Administrative",
          medical: "Medical",
          nursing: "Nursing",
          technical: "Technical",
          paramedical: "Paramedical",
          support: "Support",
          pharmacy: "Pharmacy",
          management: "Management"
        };
        return types[value] || value || "N/A";
      }
    },
    {
      key: "employment_type", label: "Employment Type", render: (value: string) => {
        const types: Record<string, string> = {
          full_time: "Full Time",
          part_time: "Part Time",
          contract: "Contract",
          temporary: "Temporary",
          intern: "Intern",
          probation: "Probation",
          visiting: "Visiting"
        };
        return types[value] || value || "N/A";
      }
    },
    { key: "joining_date", label: "Joining Date", type: "date" },
    { key: "probation_end_date", label: "Probation End", type: "date" },
    { key: "contract_end_date", label: "Contract End", type: "date" },
    { key: "qualification", label: "Qualification" },
    { key: "specialization", label: "Specialization" },
    { key: "experience_years", label: "Experience", render: (value: number) => value !== undefined ? `${value} years` : "N/A" },
    { key: "employee_id", label: "Employee ID" },
    { key: "badge_number", label: "Badge Number" },
    {
      key: "shift", label: "Shift", render: (value: string) => {
        const shifts: Record<string, string> = {
          morning: "Morning",
          afternoon: "Afternoon",
          night: "Night",
          rotating: "Rotating"
        };
        return shifts[value] || value || "N/A";
      }
    },
    { key: "work_hours_start", label: "Work Start" },
    { key: "work_hours_end", label: "Work End" },
    { key: "working_days", label: "Working Days", render: (value: string[]) => value?.join(", ") || "N/A", fullWidth: true },
    { key: "reporting_manager", label: "Reporting Manager" },
    { key: "work_location", label: "Work Location" },
    { key: "employment_status", label: "Status", type: "status" },
  ];

  const getFormFields = (): FormField[] => {
    const departmentOptions = departments.map(dept => ({
      value: dept.id.toString(),
      label: dept.name
    }));

    const formFields: FormField[] = [
      { name: "first_name", label: "First Name", type: "text", required: true, placeholder: "Enter first name", error: errors.first_name?.[0] },
      { name: "last_name", label: "Last Name", type: "text", required: true, placeholder: "Enter last name", error: errors.last_name?.[0] },
      { name: "email", label: "Email", type: "email", required: true, placeholder: "staff@hospital.com", error: errors.email?.[0] },
      { name: "phone", label: "Phone", type: "text", placeholder: "+1 234-567-8900", error: errors.phone?.[0] },
      {
        name: "gender", label: "Gender", type: "select", required: true, placeholder: "Select Gender",
        options: [
          { value: "male", label: "Male" },
          { value: "female", label: "Female" },
          { value: "other", label: "Other" }
        ],
        error: errors.gender?.[0]
      },
      { name: "date_of_birth", label: "Date of Birth", type: "date", error: errors.date_of_birth?.[0] },
      {
        name: "marital_status", label: "Marital Status", type: "select", placeholder: "Select Marital Status",
        options: [
          { value: "single", label: "Single" },
          { value: "married", label: "Married" },
          { value: "divorced", label: "Divorced" },
          { value: "widowed", label: "Widowed" }
        ],
        error: errors.marital_status?.[0]
      },
      {
        name: "password",
        label: "Password",
        type: "password",
        required: !selectedStaff,
        placeholder: "Minimum 8 characters",
        error: errors.password?.[0]
      },
      { name: "address", label: "Address", type: "textarea", fullWidth: true, rows: 2, placeholder: "Enter address", error: errors.address?.[0] },
      { name: "city", label: "City", type: "text", placeholder: "Enter city", error: errors.city?.[0] },
      { name: "state", label: "State", type: "text", placeholder: "Enter state", error: errors.state?.[0] },
      { name: "country", label: "Country", type: "text", placeholder: "Enter country", error: errors.country?.[0] },
      { name: "postal_code", label: "Postal Code", type: "text", placeholder: "Enter postal code", error: errors.postal_code?.[0] },
      { name: "emergency_contact_name", label: "Emergency Contact Name", type: "text", placeholder: "Contact name", error: errors.emergency_contact_name?.[0] },
      { name: "emergency_contact_phone", label: "Emergency Contact Phone", type: "text", placeholder: "Contact phone", error: errors.emergency_contact_phone?.[0] },
      { name: "emergency_contact_relation", label: "Relationship", type: "text", placeholder: "e.g. Spouse, Parent", error: errors.emergency_contact_relation?.[0] },
      { name: "designation", label: "Designation", type: "text", required: true, placeholder: "e.g. Nurse, Receptionist", error: errors.designation?.[0] },
      { name: "department_id", label: "Department", type: "select", required: true, placeholder: "Select Department", options: departmentOptions, error: errors.department_id?.[0] },
      {
        name: "staff_type", label: "Staff Type", type: "select", required: true, placeholder: "Select Staff Type",
        options: [
          { value: "administrative", label: "Administrative" },
          { value: "medical", label: "Medical" },
          { value: "nursing", label: "Nursing" },
          { value: "technical", label: "Technical" },
          { value: "paramedical", label: "Paramedical" },
          { value: "support", label: "Support" },
          { value: "pharmacy", label: "Pharmacy" },
          { value: "management", label: "Management" }
        ],
        error: errors.staff_type?.[0]
      },
      {
        name: "employment_type", label: "Employment Type", type: "select", required: true, placeholder: "Select Employment Type",
        options: [
          { value: "full_time", label: "Full Time" },
          { value: "part_time", label: "Part Time" },
          { value: "contract", label: "Contract" },
          { value: "temporary", label: "Temporary" },
          { value: "intern", label: "Intern" },
          { value: "probation", label: "Probation" },
          { value: "visiting", label: "Visiting" }
        ],
        error: errors.employment_type?.[0]
      },
      { name: "joining_date", label: "Joining Date", type: "date", required: true, error: errors.joining_date?.[0] },
      { name: "probation_end_date", label: "Probation End Date", type: "date", error: errors.probation_end_date?.[0] },
      { name: "contract_end_date", label: "Contract End Date", type: "date", error: errors.contract_end_date?.[0] },
      { name: "qualification", label: "Qualification", type: "text", placeholder: "e.g. B.Sc Nursing", error: errors.qualification?.[0] },
      { name: "specialization", label: "Specialization", type: "text", placeholder: "e.g. ICU, Emergency", error: errors.specialization?.[0] },
      { name: "experience_years", label: "Experience (Years)", type: "number", required: true, min: 0, placeholder: "0", error: errors.experience_years?.[0] },
      { name: "employee_id", label: "Employee ID", type: "text", placeholder: "e.g. EMP001", error: errors.employee_id?.[0] },
      { name: "badge_number", label: "Badge Number", type: "text", placeholder: "e.g. B001", error: errors.badge_number?.[0] },
      {
        name: "shift", label: "Shift", type: "select", placeholder: "Select Shift",
        options: [
          { value: "morning", label: "Morning" },
          { value: "afternoon", label: "Afternoon" },
          { value: "night", label: "Night" },
          { value: "rotating", label: "Rotating" }
        ],
        error: errors.shift?.[0]
      },
      { name: "work_hours_start", label: "Work Hours Start", type: "time", error: errors.work_hours_start?.[0] },
      { name: "work_hours_end", label: "Work Hours End", type: "time", error: errors.work_hours_end?.[0] },
      {
        name: "working_days",
        label: "Working Days",
        type: "text",
        placeholder: "monday, tuesday, wednesday, thursday, friday, saturday, sunday",
        error: errors.working_days?.[0]
      },
      { name: "reporting_manager", label: "Reporting Manager", type: "text", placeholder: "Manager name", error: errors.reporting_manager?.[0] },
      { name: "work_location", label: "Work Location", type: "text", placeholder: "e.g. Building A, Floor 2", error: errors.work_location?.[0] },
      {
        name: "employment_status", label: "Employment Status", type: "select", required: true, placeholder: "Select Status",
        options: [
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
          { value: "on_leave", label: "On Leave" },
          { value: "terminated", label: "Terminated" }
        ],
        error: errors.employment_status?.[0]
      },
      { name: "profile_picture", label: "Profile Picture", type: "file", accept: "image/*", error: errors.profile_picture?.[0] },
    ];

    return formFields;
  };

  const handleAdd = (): void => {
    setSelectedStaff(null);
    setErrors({});
    setOpenModal(true);
  };

  const handleEdit = (staffMember: StaffMember): void => {
    setSelectedStaff(staffMember);
    setErrors({});
    setOpenModal(true);
  };

  const handleDelete = (staffMember: StaffMember): void => {
    setSelectedStaff(staffMember);
    setOpenDeleteModal(true);
  };

  const handleView = (staffMember: StaffMember): void => {
    setSelectedStaff(staffMember);
    setOpenViewModal(true);
  };

  const convertToFormData = (data: Record<string, any>): FormData => {
    const formData = new FormData();

    // Add all fields dynamically
    Object.keys(data).forEach(key => {
      if (key === "profile_picture") {
        if (data[key] instanceof File) {
          formData.append(key, data[key]);
        } else if (typeof data[key] === 'string' && data[key]) {
          // If it's a string URL, don't add it
          return;
        }
      } else if (key === "working_days" && typeof data[key] === "string") {
        const days = data[key]
          .split(",")
          .map((day: string) => day.trim().toLowerCase())
          .filter((day: string) =>
            ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].includes(day)
          );
        days.forEach((day: string) => {
          formData.append("working_days[]", day);
        });
      } else if (key === "department_id") {
        formData.append(key, data[key].toString());
      } else if (data[key] !== null && data[key] !== undefined && data[key] !== "") {
        formData.append(key, data[key].toString());
      }
    });

    return formData;
  };

  const handleSubmit = async (data: Record<string, any>): Promise<void> => {
    setFormLoading(true);
    setErrors({});

    try {
      const formData = convertToFormData(data);

      if (selectedStaff) {
        const response = await apiService.updateStaff(selectedStaff.id, formData);
        if (response.success) {
          showToast('Staff member updated successfully', 'success');
          setOpenModal(false);
          setSelectedStaff(null);
          loadStaff();
        } else {
          if (response.errors) {
            setErrors(response.errors);
          } else {
            showToast(response.message || 'Failed to update staff', 'error');
          }
          throw new Error(response.message || 'Update failed');
        }
      } else {
        const response = await apiService.createStaff(formData);
        if (response.success) {
          showToast('Staff member created successfully', 'success');
          setCurrentPage(1);
          setOpenModal(false);
          loadStaff();
        } else {
          if (response.errors) {
            setErrors(response.errors);
          } else {
            showToast(response.message || 'Failed to create staff', 'error');
          }
          throw new Error(response.message || 'Creation failed');
        }
      }
    } catch (error: any) {
      console.error("Submission error:", error);
      if (error.validationErrors) {
        setErrors(error.validationErrors);
        showToast('Please fix the form errors', 'error');
      } else {
        showToast(error.message || 'An unexpected error occurred', 'error');
      }
      throw error; // Rethrow to let FormModal handle state parsing if needed
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDelete = async (): Promise<void> => {
    if (selectedStaff) {
      try {
        const response = await apiService.deleteStaff(selectedStaff.id);
        if (response.success) {
          showToast('Staff member deleted successfully', 'success');
          setCurrentPage(1);
          setOpenDeleteModal(false);
          setSelectedStaff(null);
          loadStaff();
        } else {
          showToast(response.message || 'Failed to delete staff', 'error');
        }
      } catch (error: any) {
        console.error("Delete error:", error);
        showToast(error.message || 'Failed to delete staff', 'error');
      }
    }
  };

  const prepareInitialData = (staffMember: StaffMember | null): Record<string, any> => {
    if (!staffMember) return {};

    const initialData = {
      ...staffMember,
      email: staffMember.user?.email || staffMember.email || '',
      phone: staffMember.user?.phone || staffMember.phone || '',
      department_id: staffMember.department_id?.toString() || '',
      working_days: Array.isArray(staffMember.working_days)
        ? staffMember.working_days.join(", ")
        : staffMember.working_days || "",
      password: '', // Clear password field for edit
    };

    // Convert date strings to YYYY-MM-DD format for input fields
    const dateFields = ['date_of_birth', 'joining_date', 'probation_end_date', 'contract_end_date'];
    dateFields.forEach(field => {
      if (initialData[field]) {
        initialData[field] = initialData[field].split('T')[0];
      }
    });

    return initialData;
  };

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  return (
    <div className="mt-12 mb-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold text-blue-gray-800 mb-2">Staff Management</h2>
          <p className="text-blue-gray-600 text-base">Manage hospital staff members and roles</p>
        </div>
        <Button
          variant="gradient"
          color="blue"
          className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
          onClick={handleAdd}
        >
          <UserPlusIcon className="h-5 w-5" />
          Add Staff
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <DataTable
          title="Staff Management"
          data={staff}
          columns={columns}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          searchable={true}
          filterable={true}
          exportable={true}
          addButtonLabel="Add Staff"
          searchPlaceholder="Search staff..."
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
        onClose={() => {
          setOpenModal(false);
          setSelectedStaff(null);
          setErrors({});
        }}
        title={selectedStaff ? "Edit Staff" : "Add New Staff"}
        formFields={getFormFields()}
        initialData={prepareInitialData(selectedStaff)}
        onSubmit={handleSubmit}
        submitLabel={selectedStaff ? "Update Staff" : "Add Staff"}
        loading={formLoading}
      />

      <ViewModal
        open={openViewModal}
        onClose={() => {
          setOpenViewModal(false);
          setSelectedStaff(null);
        }}
        title="Staff Details"
        data={selectedStaff || {}}
        fields={viewFields}
      />

      <DeleteConfirmModal
        open={openDeleteModal}
        onClose={() => {
          setOpenDeleteModal(false);
          setSelectedStaff(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Staff"
        message="Are you sure you want to delete this staff member?"
        itemName={selectedStaff ? `${selectedStaff.first_name} ${selectedStaff.last_name}` : ""}
      />
    </div>
  );
}
