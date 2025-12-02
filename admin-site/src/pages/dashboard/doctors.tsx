import React, { useState, useEffect } from "react";
import { DataTable, ViewModal, DeleteConfirmModal, Column, ViewField, FormModal, FormField } from "@/components";
import { Avatar, Typography, Button } from "@material-tailwind/react";
import { UserPlusIcon } from "@heroicons/react/24/outline";
import apiService from "@/services/api";

interface Doctor {
  id: number;
  doctor_id?: string;
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

export default function Doctors(): JSX.Element {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openViewModal, setOpenViewModal] = useState<boolean>(false);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadDoctors();
    loadDepartments();
  }, []);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDoctors();
      if (response.success && response.data) {
        setDoctors(response.data);
      }
    } catch (error) {
      console.error("Failed to load doctors:", error);
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
      render: (value: any, row: Doctor) => (
        <div>
          <Typography variant="small" color="blue-gray" className="font-bold text-sm">
            Dr. {row.first_name} {row.last_name}
          </Typography>
          <Typography className="text-xs font-normal text-blue-gray-500 mt-0.5">
            {row.email}
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
    { key: "profile_picture", label: "Photo", type: "avatar" },
    { key: "doctor_id", label: "Doctor ID" },
    { key: "first_name", label: "First Name" },
    { key: "last_name", label: "Last Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "gender", label: "Gender" },
    { key: "date_of_birth", label: "Date of Birth", type: "date" },
    { key: "address", label: "Address", fullWidth: true },
    { key: "city", label: "City" },
    { key: "state", label: "State" },
    { key: "country", label: "Country" },
    { key: "postal_code", label: "Postal Code" },
    { key: "specialization", label: "Specialization" },
    { key: "qualification", label: "Qualification" },
    { key: "experience_years", label: "Experience (Years)" },
    { key: "license_number", label: "License Number" },
    { key: "department", label: "Department", render: (value: any, row: Doctor) => row.department?.name || "N/A" },
    { key: "joining_date", label: "Joining Date", type: "date" },
    { key: "employment_type", label: "Employment Type" },
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
      { name: "first_name", label: "First Name", type: "text", required: true, placeholder: "Enter first name" },
      { name: "last_name", label: "Last Name", type: "text", required: true, placeholder: "Enter last name" },
      { name: "email", label: "Email", type: "email", required: true, placeholder: "doctor@hospital.com" },
      { name: "phone", label: "Phone", type: "text", placeholder: "+1 234-567-8900" },
      { name: "gender", label: "Gender", type: "select", required: true, options: [
        { value: "male", label: "Male" },
        { value: "female", label: "Female" },
        { value: "other", label: "Other" }
      ]},
      { name: "date_of_birth", label: "Date of Birth", type: "date" },
      { name: "password", label: "Password", type: "password", required: !selectedDoctor, placeholder: "Minimum 8 characters" },
      { name: "address", label: "Address", type: "textarea", fullWidth: true, rows: 3 },
      { name: "city", label: "City", type: "text" },
      { name: "state", label: "State", type: "text" },
      { name: "country", label: "Country", type: "text" },
      { name: "postal_code", label: "Postal Code", type: "text" },
      { name: "specialization", label: "Specialization", type: "text", required: true, placeholder: "e.g. Cardiology" },
      { name: "qualification", label: "Qualification", type: "text", required: true, placeholder: "e.g. MBBS, MD" },
      { name: "experience_years", label: "Experience (Years)", type: "number", required: true, min: 0 },
      { name: "license_number", label: "License Number", type: "text", required: true, placeholder: "e.g. L12345" },
      { name: "department", label: "Department", type: "select", options: departmentOptions },
      { name: "joining_date", label: "Joining Date", type: "date", required: true },
      { name: "employment_type", label: "Employment Type", type: "select", required: true, options: [
        { value: "full_time", label: "Full Time" },
        { value: "part_time", label: "Part Time" },
        { value: "contract", label: "Contract" },
        { value: "visiting", label: "Visiting" }
      ]},
      { name: "consultation_fee", label: "Consultation Fee", type: "number", required: true, min: 0 },
      { name: "working_hours_start", label: "Working Hours Start", type: "time" },
      { name: "working_hours_end", label: "Working Hours End", type: "time" },
      { name: "working_days", label: "Working Days (comma-separated)", type: "text", placeholder: "monday, tuesday, wednesday" },
      { name: "status", label: "Status", type: "select", options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
        { value: "on_leave", label: "On Leave" }
      ]},
      { name: "bio", label: "Bio", type: "textarea", fullWidth: true, rows: 4 },
      { name: "languages", label: "Languages (comma-separated)", type: "text", placeholder: "English, Spanish, French" },
      { name: "profile_picture", label: "Profile Picture", type: "file", accept: "image/*" },
    ];
  };

  const handleAdd = (): void => {
    setSelectedDoctor(null);
    setOpenModal(true);
  };

  const handleEdit = (doctor: Doctor): void => {
    setSelectedDoctor(doctor);
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
      } else if (key === "languages" && typeof data[key] === "string") {
        const languages = data[key].split(",").map((lang: string) => lang.trim()).filter(Boolean);
        languages.forEach((lang: string) => {
          formData.append("languages[]", lang);
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
      
      if (selectedDoctor) {
        await apiService.updateDoctor(selectedDoctor.id, formData);
      } else {
        await apiService.createDoctor(formData);
      }
      await loadDoctors();
      setOpenModal(false);
      setSelectedDoctor(null);
    } catch (error: any) {
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDelete = async (): Promise<void> => {
    if (selectedDoctor) {
      try {
        await apiService.deleteDoctor(selectedDoctor.id);
        await loadDoctors();
        setOpenDeleteModal(false);
        setSelectedDoctor(null);
      } catch (error) {
        console.error("Failed to delete doctor:", error);
      }
    }
  };

  const prepareInitialData = (doctor: Doctor | null): Record<string, any> => {
    if (!doctor) return {};
    
    return {
      ...doctor,
      department: doctor.department_id?.toString() || "",
      working_days: Array.isArray(doctor.working_days) ? doctor.working_days.join(", ") : doctor.working_days || "",
      languages: Array.isArray(doctor.languages) ? doctor.languages.join(", ") : doctor.languages || "",
    };
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
          searchable={true}
          filterable={true}
          exportable={true}
          addButtonLabel="Add Doctor"
          searchPlaceholder="Search doctors..."
        />
      )}

      <FormModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setSelectedDoctor(null);
        }}
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
        message="Are you sure you want to delete this doctor?"
        itemName={selectedDoctor ? `Dr. ${selectedDoctor.first_name} ${selectedDoctor.last_name}` : ""}
      />
    </div>
  );
}
