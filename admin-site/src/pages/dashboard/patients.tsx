import React, { useState, useEffect } from "react";
import { DataTable, FormModal, ViewModal, DeleteConfirmModal, Column, FormField, ViewField } from "@/components";
import { Pagination } from "@/components/Pagination";
import { Avatar, Typography, Button } from "@material-tailwind/react";
import { UserPlusIcon } from "@heroicons/react/24/outline";
import { apiService } from "@/services/api";
import { useToast } from "@/context/ToastContext";

interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string;
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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { showToast } = useToast();

  // Fetch patients from API
  const fetchPatients = async (page: number = 1, search?: string) => {
    try {
      setLoading(true);
      const response = await apiService.getPatients(page, 10, search);

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
    fetchPatients(currentPage, searchQuery);
  }, [currentPage]);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    fetchPatients(1, query);
  };

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
    { key: "status", label: "Status", type: "status" },
    { key: "registeredDate", label: "Registered Date", type: "date" },
    { key: "lastVisit", label: "Last Visit", type: "date" },
    { key: "emailVerified", label: "Email Verified" },
    { key: "totalVisits", label: "Total Visits" },
  ];

  const formFields: FormField[] = [
    {
      name: "name",
      label: "Full Name",
      type: "text",
      required: true,
      placeholder: "Enter patient name",
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
          fetchPatients(currentPage, searchQuery);
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

      if (selectedPatient) {
        // Update existing patient
        response = await apiService.updatePatient(selectedPatient.id, data);
      } else {
        // Register new patient
        response = await apiService.createPatient(data);
      }

      if (response.success) {
        showToast(
          response.message ||
          (selectedPatient ? 'Patient updated successfully' : 'Patient registered successfully'),
          'success'
        );
        fetchPatients(currentPage, searchQuery);
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

      <DataTable
        title="Patient Management"
        data={patients}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        searchable={true}
        filterable={true}
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
