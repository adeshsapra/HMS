import React, { useState, useEffect } from "react";
import { DataTable, ViewModal, DeleteConfirmModal, Column, ViewField, FormModal, FormField } from "@/components";
import { Avatar, Typography, Button } from "@material-tailwind/react";
import { UserPlusIcon } from "@heroicons/react/24/outline";
import apiService from "@/services/api";

// Backend storage URL for images
const STORAGE_URL = (import.meta as any).env?.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000';

interface StaffMember {
  id: number;
  staff_id?: string;
  first_name: string;
  last_name: string;
  email: string;
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

  useEffect(() => {
    loadStaff();
    loadDepartments();
  }, []);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const response = await apiService.getStaff();
      if (response.success && response.data) {
        setStaff(response.data);
      }
    } catch (error) {
      console.error("Failed to load staff:", error);
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
            {row.email}
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
    { key: "employment_status", label: "Status", type: "status" },
  ];

  const viewFields: ViewField[] = [
    { key: "profile_picture", label: "Photo", type: "avatar", render: (value: any, row: StaffMember) => getProfilePictureUrl(row.profile_picture) },
    { key: "staff_id", label: "Staff ID" },
    { key: "first_name", label: "First Name" },
    { key: "last_name", label: "Last Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
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

    return [
      { name: "first_name", label: "First Name", type: "text", required: true, placeholder: "Enter first name" },
      { name: "last_name", label: "Last Name", type: "text", required: true, placeholder: "Enter last name" },
      { name: "email", label: "Email", type: "email", required: true, placeholder: "staff@hospital.com" },
      { name: "phone", label: "Phone", type: "text", placeholder: "+1 234-567-8900" },
      {
        name: "gender", label: "Gender", type: "select", required: true, placeholder: "Select Gender", options: [
          { value: "male", label: "Male" },
          { value: "female", label: "Female" },
          { value: "other", label: "Other" }
        ]
      },
      { name: "date_of_birth", label: "Date of Birth", type: "date" },
      {
        name: "marital_status", label: "Marital Status", type: "select", placeholder: "Select Marital Status", options: [
          { value: "single", label: "Single" },
          { value: "married", label: "Married" },
          { value: "divorced", label: "Divorced" },
          { value: "widowed", label: "Widowed" }
        ]
      },
      { name: "password", label: "Password", type: "password", required: !selectedStaff, placeholder: "Minimum 8 characters" },
      { name: "address", label: "Address", type: "textarea", fullWidth: true, rows: 2, placeholder: "Enter address" },
      { name: "city", label: "City", type: "text", placeholder: "Enter city" },
      { name: "state", label: "State", type: "text", placeholder: "Enter state" },
      { name: "country", label: "Country", type: "text", placeholder: "Enter country" },
      { name: "postal_code", label: "Postal Code", type: "text", placeholder: "Enter postal code" },
      { name: "emergency_contact_name", label: "Emergency Contact Name", type: "text", placeholder: "Contact name" },
      { name: "emergency_contact_phone", label: "Emergency Contact Phone", type: "text", placeholder: "Contact phone" },
      { name: "emergency_contact_relation", label: "Relationship", type: "text", placeholder: "e.g. Spouse, Parent" },
      { name: "designation", label: "Designation", type: "text", required: true, placeholder: "e.g. Nurse, Receptionist" },
      { name: "department_id", label: "Department", type: "select", required: true, placeholder: "Select Department", options: departmentOptions },
      {
        name: "staff_type", label: "Staff Type", type: "select", required: true, placeholder: "Select Staff Type", options: [
          { value: "administrative", label: "Administrative" },
          { value: "medical", label: "Medical" },
          { value: "nursing", label: "Nursing" },
          { value: "technical", label: "Technical" },
          { value: "paramedical", label: "Paramedical" },
          { value: "support", label: "Support" },
          { value: "pharmacy", label: "Pharmacy" },
          { value: "management", label: "Management" }
        ]
      },
      {
        name: "employment_type", label: "Employment Type", type: "select", required: true, placeholder: "Select Employment Type", options: [
          { value: "full_time", label: "Full Time" },
          { value: "part_time", label: "Part Time" },
          { value: "contract", label: "Contract" },
          { value: "temporary", label: "Temporary" },
          { value: "intern", label: "Intern" },
          { value: "probation", label: "Probation" },
          { value: "visiting", label: "Visiting" }
        ]
      },
      { name: "joining_date", label: "Joining Date", type: "date", required: true },
      { name: "probation_end_date", label: "Probation End Date", type: "date" },
      { name: "contract_end_date", label: "Contract End Date", type: "date" },
      { name: "qualification", label: "Qualification", type: "text", placeholder: "e.g. B.Sc Nursing" },
      { name: "specialization", label: "Specialization", type: "text", placeholder: "e.g. ICU, Emergency" },
      { name: "experience_years", label: "Experience (Years)", type: "number", required: true, min: 0, placeholder: "0" },
      { name: "employee_id", label: "Employee ID", type: "text", placeholder: "e.g. EMP001" },
      { name: "badge_number", label: "Badge Number", type: "text", placeholder: "e.g. B001" },
      {
        name: "shift", label: "Shift", type: "select", placeholder: "Select Shift", options: [
          { value: "morning", label: "Morning" },
          { value: "afternoon", label: "Afternoon" },
          { value: "night", label: "Night" },
          { value: "rotating", label: "Rotating" }
        ]
      },
      { name: "work_hours_start", label: "Work Hours Start", type: "time" },
      { name: "work_hours_end", label: "Work Hours End", type: "time" },
      { name: "working_days", label: "Working Days", type: "text", placeholder: "mon, tue, wed, thu, fri" },
      { name: "reporting_manager", label: "Reporting Manager", type: "text", placeholder: "Manager name" },
      { name: "work_location", label: "Work Location", type: "text", placeholder: "e.g. Building A, Floor 2" },
      {
        name: "employment_status", label: "Employment Status", type: "select", required: true, placeholder: "Select Status", options: [
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
          { value: "on_leave", label: "On Leave" },
          { value: "terminated", label: "Terminated" }
        ]
      },
      { name: "profile_picture", label: "Profile Picture", type: "file", accept: "image/*" },
    ];
  };

  const handleAdd = (): void => {
    setSelectedStaff(null);
    setOpenModal(true);
  };

  const handleEdit = (staffMember: StaffMember): void => {
    setSelectedStaff(staffMember);
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

    // Fields to exclude from form submission
    const excludeFields = ['id', 'staff_id', 'is_available', 'created_at', 'updated_at', 'remember_token'];

    Object.keys(data).forEach(key => {
      // Skip excluded fields
      if (excludeFields.includes(key)) return;

      // Skip the department object
      if (key === 'department' && typeof data[key] === 'object' && data[key] !== null) return;

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
      } else if (typeof data[key] === "boolean") {
        formData.append(key, data[key] ? "1" : "0");
      } else if (data[key] !== null && data[key] !== undefined && data[key] !== "") {
        formData.append(key, data[key]);
      }
    });

    return formData;
  };

  const handleSubmit = async (data: Record<string, any>): Promise<void> => {
    setFormLoading(true);
    try {
      const formData = convertToFormData(data);

      if (selectedStaff) {
        await apiService.updateStaff(selectedStaff.id, formData);
      } else {
        await apiService.createStaff(formData);
      }
      await loadStaff();
      setOpenModal(false);
      setSelectedStaff(null);
    } catch (error) {
      setFormLoading(false);
      throw error;
    }
    setFormLoading(false);
  };

  const confirmDelete = async (): Promise<void> => {
    if (selectedStaff) {
      try {
        await apiService.deleteStaff(selectedStaff.id);
        await loadStaff();
        setOpenDeleteModal(false);
        setSelectedStaff(null);
      } catch (error) {
        console.error("Failed to delete staff:", error);
      }
    }
  };

  const prepareInitialData = (staffMember: StaffMember | null): Record<string, any> => {
    if (!staffMember) return {};

    return {
      ...staffMember,
      department_id: staffMember.department_id?.toString() || "",
      working_days: Array.isArray(staffMember.working_days) ? staffMember.working_days.join(", ") : staffMember.working_days || "",
    };
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
        />
      )}

      <FormModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setSelectedStaff(null);
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
