import React, { useState, useEffect } from "react";
import { DataTable, FormModal, ViewModal, DeleteConfirmModal, Column, FormField, ViewField, AdvancedFilter, FilterConfig } from "@/components";
import { Pagination } from "@/components/Pagination";
import { Avatar, Typography, Button } from "@material-tailwind/react";
import { UserPlusIcon } from "@heroicons/react/24/outline";
import { apiService } from "@/services/api";
import { useToast } from "@/context/ToastContext";

interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  phone: string;
  gender?: string;
  dob?: string;
  age?: number;
  blood_group?: string;
  status: string;
  avatar?: string;
  lastVisit: string;
  totalVisits: number;
  registeredDate: string;
  emailVerified: string;
}

interface PaginationData {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
}

export default function Patients(): JSX.Element {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openViewModal, setOpenViewModal] = useState<boolean>(false);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pagination, setPagination] = useState<PaginationData>({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
    from: 0,
    to: 0
  });
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const { showToast } = useToast();

  // Fetch patients from API
  const fetchPatients = async (page: number = 1, currentFilters = activeFilters) => {
    try {
      setLoading(true);

      const params: any = { page };
      if (currentFilters.keyword) params.keyword = currentFilters.keyword;
      if (currentFilters.gender) params.gender = currentFilters.gender;
      if (currentFilters.blood_group) params.blood_group = currentFilters.blood_group;
      if (currentFilters.date_range_start) params.date_range_start = currentFilters.date_range_start;
      if (currentFilters.date_range_end) params.date_range_end = currentFilters.date_range_end;

      const response = await apiService.getPatients(page, 10, params.keyword, params);

      if (response.success) {
        setPatients(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else {
        showToast(response.message || 'Failed to fetch patients', 'error');
      }
    } catch (error: any) {
      console.error('Error fetching patients:', error);
      showToast(error.message || 'Failed to fetch patients', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients(currentPage, activeFilters);
  }, [currentPage]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const columns: Column[] = [
    {
      key: "avatar",
      label: "Photo",
      render: (value: any, row: Patient) => (
        <Avatar
          src={row.avatar || "/img/team-1.jpeg"}
          alt={row.name}
          size="sm"
          variant="rounded"
          className="border-2 border-blue-gray-100 shadow-sm"
        />
      ),
    },
    {
      key: "name",
      label: "Name",
      render: (value: any, row: Patient) => (
        <div>
          <Typography variant="small" color="blue-gray" className="font-bold text-sm">
            {row.name}
          </Typography>
          <Typography className="text-xs font-normal text-blue-gray-500 mt-0.5">
            {row.email}
          </Typography>
        </div>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      render: (value: any) => (
        <Typography className="text-sm font-medium text-blue-gray-700">
          {value || "N/A"}
        </Typography>
      ),
    },
    {
      key: "status",
      label: "Status",
      type: "status",
    },
    {
      key: "registeredDate",
      label: "Registered Date",
      render: (value: any) => (
        <Typography className="text-xs font-medium text-blue-gray-600">
          {new Date(value).toLocaleDateString()}
        </Typography>
      ),
    },
    {
      key: "lastVisit",
      label: "Last Visit",
      render: (value: any) => (
        <Typography className="text-xs font-medium text-blue-gray-600">
          {new Date(value).toLocaleDateString()}
        </Typography>
      ),
    },
  ];

  const viewFields: ViewField[] = [
    { key: "avatar", label: "Photo", type: "avatar" },
    { key: "name", label: "Full Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "gender", label: "Gender" },
    { key: "age", label: "Age" },
    { key: "dob", label: "Date of Birth", type: "date" },
    { key: "blood_group", label: "Blood Group" },
    { key: "status", label: "Status", type: "status" },
    { key: "registeredDate", label: "Registered Date", type: "date" },
    { key: "lastVisit", label: "Last Visit", type: "date" },
    { key: "emailVerified", label: "Email Verified" },
    { key: "totalVisits", label: "Total Visits" },
  ];

  const formFields: FormField[] = [
    {
      name: "profile_image",
      label: "Profile Photo",
      type: "file",
      accept: "image/*",
    },
    {
      name: "first_name",
      label: "First Name",
      type: "text",
      required: true,
      placeholder: "Enter first name",
    },
    {
      name: "last_name",
      label: "Last Name",
      type: "text",
      required: true,
      placeholder: "Enter last name",
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      required: true,
      placeholder: "patient@email.com",
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      required: true,
      placeholder: "Enter password",
      visible: !selectedPatient,
    },
    {
      name: "phone",
      label: "Phone",
      type: "text",
      required: true,
      placeholder: "+1 234-567-8900",
    },
    {
      name: "gender",
      label: "Gender",
      type: "select",
      options: [
        { value: "Male", label: "Male" },
        { value: "Female", label: "Female" },
        { value: "Other", label: "Other" },
      ],
    },
    {
      name: "dob",
      label: "Date of Birth",
      type: "date",
    },
    {
      name: "age",
      label: "Age",
      type: "number",
    },
    {
      name: "blood_group",
      label: "Blood Group",
      type: "select",
      options: [
        { value: "A+", label: "A+" },
        { value: "A-", label: "A-" },
        { value: "B+", label: "B+" },
        { value: "B-", label: "B-" },
        { value: "O+", label: "O+" },
        { value: "O-", label: "O-" },
        { value: "AB+", label: "AB+" },
        { value: "AB-", label: "AB-" },
      ]
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
        { value: "critical", label: "Critical" },
      ],
    },
  ];

  const handleAdd = (): void => {
    setSelectedPatient(null);
    setOpenModal(true);
  };

  const handleEdit = (patient: Patient): void => {
    setSelectedPatient(patient);
    setOpenModal(true);
  };

  const handleDelete = (patient: Patient): void => {
    setSelectedPatient(patient);
    setOpenDeleteModal(true);
  };

  const confirmDelete = async (): Promise<void> => {
    if (selectedPatient) {
      try {
        const response = await apiService.deletePatient(selectedPatient.id);

        if (response.success) {
          showToast(response.message || 'Patient deleted successfully', 'success');
          fetchPatients(currentPage, activeFilters);
          setOpenDeleteModal(false);
          setSelectedPatient(null);
        } else {
          showToast(response.message || 'Failed to delete patient', 'error');
        }
      } catch (error: any) {
        console.error('Error deleting patient:', error);
        showToast(error.message || 'Failed to delete patient', 'error');
      }
    }
  };

  const handleView = (patient: Patient): void => {
    setSelectedPatient(patient);
    setOpenViewModal(true);
  };

  const handleSubmit = async (data: Record<string, any>): Promise<void> => {
    try {
      let response;
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      if (selectedPatient) {
        // Update existing patient
        response = await apiService.updatePatient(selectedPatient.id, formData);
      } else {
        // Register new patient
        response = await apiService.createPatient(formData);
      }

      if (response.success) {
        showToast(
          response.message ||
          (selectedPatient ? 'Patient updated successfully' : 'Patient registered successfully'),
          'success'
        );
        fetchPatients(currentPage, activeFilters);
        setOpenModal(false);
        setSelectedPatient(null);
      } else {
        showToast(response.message || 'Failed to save patient', 'error');
      }
    } catch (error: any) {
      console.error('Error saving patient:', error);
      showToast(error.message || 'Failed to save patient', 'error');
    }
  };

  return (
    <div className="mt-12 mb-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold text-blue-gray-800 mb-2">Patients</h2>
          <p className="text-blue-gray-600 text-base">Manage all patient records</p>
        </div>
        <Button
          variant="gradient"
          color="blue"
          className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
          onClick={handleAdd}
        >
          <UserPlusIcon className="h-5 w-5" />
          Register Patient
        </Button>
      </div>

      <AdvancedFilter
        config={{
          fields: [
            {
              name: 'keyword',
              label: 'Search Everywhere',
              type: 'text',
              placeholder: 'Search by ID, name, phone, email...'
            },
            {
              name: 'gender',
              label: 'Gender',
              type: 'select',
              options: [
                { label: 'All', value: '' },
                { label: 'Male', value: 'Male' },
                { label: 'Female', value: 'Female' },
                { label: 'Other', value: 'Other' }
              ]
            },
            {
              name: 'blood_group',
              label: 'Blood Group',
              type: 'select',
              options: [
                { label: 'All', value: '' },
                { label: 'A+', value: 'A+' },
                { label: 'A-', value: 'A-' },
                { label: 'B+', value: 'B+' },
                { label: 'B-', value: 'B-' },
                { label: 'O+', value: 'O+' },
                { label: 'O-', value: 'O-' },
                { label: 'AB+', value: 'AB+' },
                { label: 'AB-', value: 'AB-' }
              ]
            },
            {
              name: 'age',
              label: 'Age',
              type: 'number'
            },
            {
              name: 'city',
              label: 'City',
              type: 'text'
            },
            {
              name: 'state',
              label: 'State',
              type: 'text'
            },
            {
              name: 'date_range',
              label: 'Registration Date Range',
              type: 'daterange'
            }
          ],
          onApplyFilters: (filters) => {
            const newFilters = { ...activeFilters, ...filters };
            setActiveFilters(newFilters);
            fetchPatients(1, newFilters);
          },
          onResetFilters: () => {
            setActiveFilters({});
            fetchPatients(1, {});
          },
          initialValues: activeFilters
        }}
      />

      <DataTable
        title="Patient Management"
        data={patients}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        searchable={false}
        filterable={false}
        exportable={true}
        addButtonLabel="Register Patient"
        searchPlaceholder="Search patients..."
        pagination={{
          currentPage: pagination.current_page,
          totalPages: pagination.last_page,
          onPageChange: handlePageChange,
          totalItems: pagination.total,
          perPage: pagination.per_page
        }}
      />

      <FormModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setSelectedPatient(null);
        }}
        title={selectedPatient ? "Edit Patient" : "Register New Patient"}
        formFields={formFields}
        initialData={selectedPatient || {}}
        onSubmit={handleSubmit}
        submitLabel={selectedPatient ? "Update Patient" : "Register Patient"}
      />

      <ViewModal
        open={openViewModal}
        onClose={() => {
          setOpenViewModal(false);
          setSelectedPatient(null);
        }}
        title="Patient Details"
        data={selectedPatient || {}}
        fields={viewFields}
      />

      <DeleteConfirmModal
        open={openDeleteModal}
        onClose={() => {
          setOpenDeleteModal(false);
          setSelectedPatient(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Patient"
        message="Are you sure you want to delete this patient record?"
        itemName={selectedPatient?.name}
      />
    </div>
  );
}
