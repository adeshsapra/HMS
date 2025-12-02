import React, { useState, useEffect } from "react";
import { DataTable, ViewModal, DeleteConfirmModal, Column, ViewField, FormModal, FormField } from "@/components";
import { Avatar, Typography, Button } from "@material-tailwind/react";
import { UserPlusIcon } from "@heroicons/react/24/outline";
import apiService from "@/services/api";

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
          src={row.profile_picture ? `/storage/${row.profile_picture}` : "/img/team-1.jpeg"} 
          alt={`${row.first_name} ${row.last_name}`} 
          size="sm" 
          variant="rounded" 
          className="border-2 border-blue-gray-100 shadow-sm" 
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
    { key: "shift", label: "Shift" },
    { key: "employment_status", label: "Status", type: "status" },
  ];

  const viewFields: ViewField[] = [
    { key: "profile_picture", label: "Photo", type: "avatar" },
    { key: "staff_id", label: "Staff ID" },
    { key: "first_name", label: "First Name" },
    { key: "last_name", label: "Last Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "gender", label: "Gender" },
    { key: "date_of_birth", label: "Date of Birth", type: "date" },
    { key: "marital_status", label: "Marital Status" },
    { key: "address", label: "Address", fullWidth: true },
    { key: "city", label: "City" },
    { key: "state", label: "State" },
    { key: "country", label: "Country" },
    { key: "postal_code", label: "Postal Code" },
    { key: "emergency_contact_name", label: "Emergency Contact Name" },
    { key: "emergency_contact_phone", label: "Emergency Contact Phone" },
    { key: "emergency_contact_relation", label: "Emergency Contact Relation" },
    { key: "designation", label: "Designation" },
    { key: "department", label: "Department", render: (value: any, row: StaffMember) => row.department?.name || "N/A" },
    { key: "staff_type", label: "Staff Type" },
    { key: "employment_type", label: "Employment Type" },
    { key: "joining_date", label: "Joining Date", type: "date" },
    { key: "probation_end_date", label: "Probation End Date", type: "date" },
    { key: "contract_end_date", label: "Contract End Date", type: "date" },
    { key: "qualification", label: "Qualification" },
    { key: "specialization", label: "Specialization" },
    { key: "experience_years", label: "Experience (Years)" },
    { key: "employee_id", label: "Employee ID" },
    { key: "badge_number", label: "Badge Number" },
    { key: "shift", label: "Shift" },
    { key: "work_hours_start", label: "Work Hours Start" },
    { key: "work_hours_end", label: "Work Hours End" },
    { key: "working_days", label: "Working Days", render: (value: string[]) => value?.join(", ") || "N/A", fullWidth: true },
    { key: "reporting_manager", label: "Reporting Manager" },
    { key: "work_location", label: "Work Location" },
    { key: "employment_status", label: "Employment Status", type: "status" },
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
      { name: "gender", label: "Gender", type: "select", required: true, options: [
        { value: "male", label: "Male" },
        { value: "female", label: "Female" },
        { value: "other", label: "Other" }
      ]},
      { name: "date_of_birth", label: "Date of Birth", type: "date" },
      { name: "marital_status", label: "Marital Status", type: "select", options: [
        { value: "single", label: "Single" },
        { value: "married", label: "Married" },
        { value: "divorced", label: "Divorced" },
        { value: "widowed", label: "Widowed" }
      ]},
      { name: "password", label: "Password", type: "password", required: !selectedStaff, placeholder: "Minimum 8 characters" },
      { name: "address", label: "Address", type: "textarea", fullWidth: true, rows: 3 },
      { name: "city", label: "City", type: "text" },
      { name: "state", label: "State", type: "text" },
      { name: "country", label: "Country", type: "text" },
      { name: "postal_code", label: "Postal Code", type: "text" },
      { name: "emergency_contact_name", label: "Emergency Contact Name", type: "text" },
      { name: "emergency_contact_phone", label: "Emergency Contact Phone", type: "text" },
      { name: "emergency_contact_relation", label: "Emergency Contact Relation", type: "text" },
      { name: "designation", label: "Designation", type: "text", required: true, placeholder: "e.g. Nurse, Receptionist" },
      { name: "department_id", label: "Department", type: "select", required: true, options: departmentOptions },
      { name: "staff_type", label: "Staff Type", type: "select", required: true, options: [
        { value: "administrative", label: "Administrative" },
        { value: "medical", label: "Medical" },
        { value: "nursing", label: "Nursing" },
        { value: "technical", label: "Technical" },
        { value: "paramedical", label: "Paramedical" },
        { value: "support", label: "Support" },
        { value: "pharmacy", label: "Pharmacy" },
        { value: "management", label: "Management" }
      ]},
      { name: "employment_type", label: "Employment Type", type: "select", required: true, options: [
        { value: "full_time", label: "Full Time" },
        { value: "part_time", label: "Part Time" },
        { value: "contract", label: "Contract" },
        { value: "temporary", label: "Temporary" },
        { value: "intern", label: "Intern" },
        { value: "probation", label: "Probation" },
        { value: "visiting", label: "Visiting" }
      ]},
      { name: "joining_date", label: "Joining Date", type: "date", required: true },
      { name: "probation_end_date", label: "Probation End Date", type: "date" },
      { name: "contract_end_date", label: "Contract End Date", type: "date" },
      { name: "qualification", label: "Qualification", type: "text", placeholder: "e.g. B.Sc Nursing" },
      { name: "specialization", label: "Specialization", type: "text" },
      { name: "experience_years", label: "Experience (Years)", type: "number", required: true, min: 0 },
      { name: "employee_id", label: "Employee ID", type: "text" },
      { name: "badge_number", label: "Badge Number", type: "text" },
      { name: "shift", label: "Shift", type: "select", options: [
        { value: "morning", label: "Morning" },
        { value: "afternoon", label: "Afternoon" },
        { value: "night", label: "Night" },
        { value: "rotating", label: "Rotating" }
      ]},
      { name: "work_hours_start", label: "Work Hours Start", type: "time" },
      { name: "work_hours_end", label: "Work Hours End", type: "time" },
      { name: "working_days", label: "Working Days (comma-separated)", type: "text", placeholder: "monday, tuesday, wednesday" },
      { name: "reporting_manager", label: "Reporting Manager", type: "text" },
      { name: "work_location", label: "Work Location", type: "text" },
      { name: "employment_status", label: "Employment Status", type: "select", required: true, options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
        { value: "on_leave", label: "On Leave" },
        { value: "terminated", label: "Terminated" }
      ]},
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
    
    Object.keys(data).forEach(key => {
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
      } else if (data[key] !== null && data[key] !== undefined && data[key] !== "") {
        formData.append(key, data[key]);
      }
    });

    return formData;
  };

  const handleSubmit = async (data: Record<string, any>): Promise<void> => {
    try {
      setFormLoading(true);
      const formData = convertToFormData(data);
      
      if (selectedStaff) {
        await apiService.updateStaff(selectedStaff.id, formData);
      } else {
        await apiService.createStaff(formData);
      }
      await loadStaff();
      setOpenModal(false);
      setSelectedStaff(null);
    } catch (error: any) {
      throw error;
    } finally {
      setFormLoading(false);
    }
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
