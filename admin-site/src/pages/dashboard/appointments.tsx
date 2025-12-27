import React, { useState, useEffect } from "react";
import { DataTable, FormModal, ViewModal, DeleteConfirmModal, Column, FormField, ViewField, AppointmentCalendar } from "@/components";
import { ActionItem } from "@/components/DataTable";
import { patientsData, doctorsData } from "@/data/hms-data";
import { Button, Spinner } from "@material-tailwind/react";
import { CalendarDaysIcon, CheckIcon, XMarkIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { apiService } from "@/services/api";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";

interface Appointment {
  id: number;
  patientName: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  status: string;
  reason?: string;
  phone?: string;
  original?: any;
}

export default function Appointments(): JSX.Element {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    perPage: 10
  });

  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openViewModal, setOpenViewModal] = useState<boolean>(false);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  // Check if current user is a doctor
  const isDoctor = user?.role?.name === 'doctor';

  const fetchAppointments = async (page = 1) => {
    try {
      setLoading(true);
      let response;

      // For calendar view, fetch all appointments without pagination
      if (viewMode === "calendar") {
        response = await apiService.getAppointmentsByDateRange();
      } else {
        response = await apiService.getAppointments(page);
      }

      if (response && response.data) {
        // The controller returns the paginator object inside 'data'
        const paginator = response.data;

        const mappedData = paginator.data.map((appt: any) => ({
          id: appt.id,
          patientName: appt.patient_name || appt.user?.name || "Unknown",
          doctorName: appt.doctor ? `${appt.doctor.first_name} ${appt.doctor.last_name}` : "Unknown",
          department: appt.doctor?.department?.name || "General",
          date: appt.appointment_date,
          time: appt.appointment_time,
          status: appt.status || "pending",
          reason: appt.reason,
          phone: appt.patient_phone || appt.user?.phone,
          original: appt
        }));

        setAppointments(mappedData);

        // Only update pagination for list view
        if (viewMode === "list") {
          setPagination({
            currentPage: paginator.current_page,
            totalPages: paginator.last_page,
            totalItems: paginator.total,
            perPage: paginator.per_page
          });
        }
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments(pagination.currentPage);
  }, []);

  useEffect(() => {
    // Refetch appointments when view mode changes
    fetchAppointments(viewMode === "list" ? pagination.currentPage : 1);
  }, [viewMode]);

  const handlePageChange = (page: number) => {
    fetchAppointments(page);
  };

  const columns: Column[] = [
    {
      key: "id",
      label: "ID",
      render: (value: any) => (
        <span className="font-bold text-blue-gray-800">#{value}</span>
      ),
    },
    {
      key: "patientName",
      label: "Patient",
      render: (value: any) => (
        <span className="font-semibold text-blue-gray-700">{value}</span>
      ),
    },
    {
      key: "doctorName",
      label: "Doctor",
      render: (value: any) => (
        <span className="font-medium text-blue-gray-700">{value}</span>
      ),
    },
    {
      key: "department",
      label: "Department",
    },
    {
      key: "date",
      label: "Date",
      render: (value: any) => (
        <span className="text-sm font-medium text-blue-gray-700">
          {new Date(value).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "time",
      label: "Time",
      render: (value: any) => (
        <span className="font-semibold text-blue-gray-800">{value}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      type: "status",
    },
  ];

  const viewFields: ViewField[] = [
    { key: "id", label: "Appointment ID" },
    { key: "patientName", label: "Patient Name" },
    { key: "doctorName", label: "Doctor" },
    { key: "department", label: "Department" },
    { key: "date", label: "Date", type: "date" },
    { key: "time", label: "Time" },
    { key: "reason", label: "Reason", fullWidth: true },
    { key: "phone", label: "Contact Phone" },
    { key: "status", label: "Status", type: "status" },
  ];

  const formFields: FormField[] = [
    {
      name: "patientName",
      label: "Patient",
      type: "select",
      required: true,
      options: patientsData.map((p) => ({ value: p.name, label: p.name })),
    },
    {
      name: "doctorName",
      label: "Doctor",
      type: "select",
      required: true,
      options: doctorsData.map((d) => ({ value: d.name, label: d.name })),
    },
    {
      name: "department",
      label: "Department",
      type: "select",
      required: true,
      options: [
        { value: "Cardiology", label: "Cardiology" },
        { value: "Neurology", label: "Neurology" },
        { value: "Pediatrics", label: "Pediatrics" },
        { value: "Orthopedics", label: "Orthopedics" },
        { value: "Oncology", label: "Oncology" },
        { value: "Emergency", label: "Emergency" },
      ],
    },
    {
      name: "date",
      label: "Date",
      type: "date",
      required: true,
    },
    {
      name: "time",
      label: "Time",
      type: "time",
      required: true,
    },
    {
      name: "reason",
      label: "Reason",
      type: "textarea",
      required: false,
      placeholder: "Reason for appointment",
      fullWidth: true,
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      options: [
        { value: "pending", label: "Pending" },
        { value: "confirmed", label: "Confirmed" },
        { value: "completed", label: "Completed" },
        { value: "cancelled", label: "Cancelled" },
      ],
    },
  ];

  const handleAdd = (): void => {
    setSelectedAppointment(null);
    setOpenModal(true);
  };

  const handleEdit = (appointment: Record<string, any>): void => {
    setSelectedAppointment(appointment as Appointment);
    setOpenModal(true);
  };

  const handleDelete = (appointment: Record<string, any>): void => {
    setSelectedAppointment(appointment as Appointment);
    setOpenDeleteModal(true);
  };

  const confirmDelete = async (): Promise<void> => {
    if (selectedAppointment) {
      try {
        await apiService.deleteAppointment(selectedAppointment.id);
        toast.success("Appointment deleted successfully");
        fetchAppointments(pagination.currentPage);
      } catch (error) {
        toast.error("Failed to delete appointment");
        console.error(error);
      }
      setOpenDeleteModal(false);
      setSelectedAppointment(null);
    }
  };

  const handleView = (appointment: Record<string, any>): void => {
    setSelectedAppointment(appointment as Appointment);
    setOpenViewModal(true);
  };

  const handleStatusChange = async (appointment: Appointment, newStatus: string) => {
    try {
      // Optimistic update
      setAppointments(
        appointments.map((a) =>
          a.id === appointment.id ? { ...a, status: newStatus } : a
        )
      );

      await apiService.updateAppointment(appointment.id, {
        status: newStatus,
      });
      toast.success(`Appointment marked as ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update status");
      // Revert optimistic update
      fetchAppointments(pagination.currentPage);
    }
  };

  const getCustomActions = (row: Record<string, any>): ActionItem[] => {
    const appointment = row as Appointment;
    const actions: ActionItem[] = [];

    if (appointment.status === "pending") {
      actions.push({
        label: "Confirm",
        icon: <CheckIcon className="h-4 w-4" />,
        color: "green",
        onClick: () => handleStatusChange(appointment, "confirmed"),
      });
      actions.push({
        label: "Cancel",
        icon: <XMarkIcon className="h-4 w-4" />,
        color: "red",
        onClick: () => handleStatusChange(appointment, "cancelled"),
      });
    } else if (appointment.status === "confirmed") {
      actions.push({
        label: "Complete",
        icon: <CheckCircleIcon className="h-4 w-4" />,
        color: "blue",
        onClick: () => handleStatusChange(appointment, "completed"),
      });
      actions.push({
        label: "Cancel",
        icon: <XMarkIcon className="h-4 w-4" />,
        color: "red",
        onClick: () => handleStatusChange(appointment, "cancelled"),
      });
    }

    return actions;
  };

  const handleSubmit = async (data: Record<string, any>): Promise<void> => {
    try {
      const payload = {
        patient_name: data.patientName,
        appointment_date: data.date,
        appointment_time: data.time,
        reason: data.reason,
        status: data.status,
      };

      if (selectedAppointment) {
        await apiService.updateAppointment(selectedAppointment.id, payload);
        toast.success("Appointment updated successfully");
      } else {
        await apiService.createAppointment(payload);
        toast.success("Appointment created successfully");
      }
      fetchAppointments(pagination.currentPage);
      setOpenModal(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save appointment");
    }
  };

  return (
    <div className="mt-12 mb-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold text-blue-gray-800 mb-2">Appointments</h2>
        </div>
        <div className="flex gap-3">
          <Button
            variant={viewMode === "list" ? "filled" : "outlined"}
            color={viewMode === "list" ? "blue" : "blue-gray"}
            onClick={() => setViewMode("list")}
            className="capitalize font-semibold shadow-md"
          >
            List View
          </Button>
          <Button
            variant={viewMode === "calendar" ? "filled" : "outlined"}
            color={viewMode === "calendar" ? "blue" : "blue-gray"}
            onClick={() => setViewMode("calendar")}
            className="flex items-center gap-2 capitalize font-semibold shadow-md"
          >
            <CalendarDaysIcon className="h-5 w-5" />
            Calendar View
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : viewMode === "list" ? (
        <DataTable
          title="Appointments Management"
          data={appointments}
          columns={columns}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          customActions={getCustomActions}
          searchable={true}
          filterable={true}
          exportable={true}
          addButtonLabel="New Appointment"
          searchPlaceholder="Search appointments..."
          pagination={{ // Pass pagination props
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalItems: pagination.totalItems,
            perPage: pagination.perPage,
            onPageChange: handlePageChange
          }}
        />
      ) : (
        <AppointmentCalendar
          appointments={appointments}
          onAppointmentClick={(appt) => handleView(appt)}
        />
      )}

      <FormModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setSelectedAppointment(null);
        }}
        title={selectedAppointment ? "Edit Appointment" : "New Appointment"}
        formFields={formFields}
        initialData={selectedAppointment || {}}
        onSubmit={handleSubmit}
        submitLabel={selectedAppointment ? "Update Appointment" : "Create Appointment"}
      />

      <ViewModal
        open={openViewModal}
        onClose={() => {
          setOpenViewModal(false);
          setSelectedAppointment(null);
        }}
        title="Appointment Details"
        data={selectedAppointment || {}}
        fields={viewFields}
      />

      <DeleteConfirmModal
        open={openDeleteModal}
        onClose={() => {
          setOpenDeleteModal(false);
          setSelectedAppointment(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Appointment"
        message="Are you sure you want to delete this appointment?"
        itemName={selectedAppointment?.patientName}
      />
    </div>
  );
}

