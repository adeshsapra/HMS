import React, { useState, useEffect } from "react";
import { DataTable, FormModal, ViewModal, DeleteConfirmModal, Column, FormField, ViewField, AppointmentCalendar, PrescriptionModal } from "@/components";
import { ActionItem } from "@/components/DataTable";
import { patientsData, doctorsData } from "@/data/hms-data";
import { Button } from "@material-tailwind/react";
import { CalendarDaysIcon, CheckIcon, XMarkIcon, CheckCircleIcon, DocumentPlusIcon, HomeModernIcon } from "@heroicons/react/24/outline";
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
  consultation_status?: string;
  lab_status?: string;
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
  const [openPrescriptionModal, setOpenPrescriptionModal] = useState<boolean>(false);
  const [openAdmissionModal, setOpenAdmissionModal] = useState<boolean>(false);
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

        let mappedData = paginator.data.map((appt: any) => ({
          id: appt.id,
          patientName: appt.patient_name || appt.user?.name || "Unknown",
          doctorName: appt.doctor ? `${appt.doctor.first_name} ${appt.doctor.last_name}` : "Unknown",
          department: appt.doctor?.department?.name || "General",
          date: appt.appointment_date,
          time: appt.appointment_time,
          status: appt.status || "pending",
          consultation_status: appt.consultation_status || "pending",
          lab_status: appt.lab_status || "not_required",
          reason: appt.reason,
          phone: appt.patient_phone || appt.user?.phone,
          original: appt
        }));

        // Show only confirmed and completed appointments for all users
        if (isDoctor) {
          mappedData = mappedData.filter((appt: Appointment) =>
            appt.status === "confirmed" || appt.status === "completed"
          );
        }

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
      key: "consultation_status",
      label: "Consultation",
      render: (value: any) => {
        const color = value === 'completed' ? 'green' : 'amber';
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase bg-${color}-50 text-${color}-600 border border-${color}-100`}>
            {value || 'pending'}
          </span>
        );
      }
    },
    {
      key: "lab_status",
      label: "Lab Status",
      render: (value: any) => {
        let color = 'gray';
        if (value === 'completed') color = 'green';
        if (value === 'pending') color = 'amber';
        if (value === 'reviewed') color = 'blue';
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase bg-${color}-50 text-${color}-600 border border-${color}-100`}>
            {value?.replace('_', ' ') || 'N/A'}
          </span>
        );
      }
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
    {
      key: "prescriptionDetails",
      label: "Prescription Details",
      fullWidth: true,
      render: (_, row) => {
        const prescription = row.original?.prescription;
        if (!prescription) return <span className="text-gray-400 italic text-sm">No prescription added</span>;
        return (
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/60 shadow-sm space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Diagnosis</span>
                <span className="text-sm font-semibold text-blue-gray-800">{prescription.diagnosis || 'N/A'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Advice</span>
                <span className="text-sm font-semibold text-blue-gray-800">{prescription.advice || 'N/A'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Follow-up</span>
                <span className="text-sm font-semibold text-blue-gray-800">{prescription.follow_up_date || 'N/A'}</span>
              </div>
            </div>
          </div>
        );
      }
    },
    {
      key: "prescriptionItems",
      label: "Prescribed Medicines",
      fullWidth: true,
      render: (_, row) => {
        const items = row.original?.prescription?.items;
        if (!items || items.length === 0) return null;
        return (
          <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm mt-2">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-100/80 text-gray-700 font-bold uppercase text-xs tracking-wider">
                <tr>
                  <th className="p-3">Medicine</th>
                  <th className="p-3">Dosage</th>
                  <th className="p-3">Frequency</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3">Instructions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {items.map((item: any, i: number) => (
                  <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-3 font-semibold text-gray-900">{item.medicine_name}</td>
                    <td className="p-3">{item.dosage}</td>
                    <td className="p-3">{item.frequency}</td>
                    <td className="p-3">{item.duration}</td>
                    <td className="p-3 text-gray-500 italic">{item.instructions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
    },
    {
      key: "labTests",
      label: "Lab Tests Records",
      fullWidth: true,
      render: (_, row) => {
        // Handle both camelCase and snake_case just in case, though usually snake_case from API
        const labs = row.original?.prescription?.lab_tests || row.original?.prescription?.labTests;
        if (!labs || labs.length === 0) return null;

        return (
          <div className="flex flex-wrap gap-2 mt-2">
            {labs.map((test: any, i: number) => (
              <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${test.status === 'completed' ? 'bg-green-400' : 'bg-blue-400'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${test.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                </span>
                {test.test_name}
                {test.status && <span className="ml-1 text-xs opacity-60 uppercase">({test.status})</span>}
              </div>
            ))}
          </div>
        );
      }
    }
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

  const admissionFields: FormField[] = [
    {
      name: "admission_date",
      label: "Recommended Date",
      type: "date",
      required: true,
    },
    {
      name: "notes",
      label: "Reason for Admission",
      type: "textarea",
      required: true,
      placeholder: "Clinical reason for recommending admission...",
      fullWidth: true,
    }
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

  const handlePrescribe = (appointment: Record<string, any>): void => {
    setSelectedAppointment(appointment as Appointment);
    setOpenPrescriptionModal(true);
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

    // Doctors cannot confirm appointments, only complete them
    if (appointment.status === "pending" && !isDoctor) {
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
      if (isDoctor) {
        actions.push({
          label: "Prescribe",
          icon: <DocumentPlusIcon className="h-4 w-4" />,
          color: "blue",
          onClick: () => handlePrescribe(appointment),
        });
        // Add Admission Recommendation action
        actions.push({
          label: "Admit",
          icon: <HomeModernIcon className="h-4 w-4" />,
          color: "purple",
          onClick: () => handleRecommendAdmission(appointment),
        });
      }
      actions.push({
        label: "Complete",
        icon: <CheckCircleIcon className="h-4 w-4" />,
        color: "green",
        onClick: () => handleStatusChange(appointment, "completed"),
      });

      // Only non-doctors can cancel confirmed appointments
      if (!isDoctor) {
        actions.push({
          label: "Cancel",
          icon: <XMarkIcon className="h-4 w-4" />,
          color: "red",
          onClick: () => handleStatusChange(appointment, "cancelled"),
        });
      }
    } else if (appointment.status === "pending" && isDoctor) {
      // Doctors can see pending appointments but cannot interact with them
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

  const handleRecommendAdmission = (appointment: Record<string, any>): void => {
    // Check if patient exists (must be a registered patient)
    const patientId = appointment.original?.user?.patient?.id;
    if (!patientId) {
      toast.error("Cannot recommend admission: This patient is not registered in the system.");
      return;
    }
    setSelectedAppointment(appointment as Appointment);
    setOpenAdmissionModal(true);
  };

  const handleAdmissionSubmit = async (data: any) => {
    if (!selectedAppointment?.original) return;

    const patientId = selectedAppointment.original.user?.patient?.id;
    if (!patientId) {
      toast.error("Patient ID not found.");
      return;
    }

    try {
      await apiService.admitPatient({
        patient_id: patientId,
        doctor_id: selectedAppointment.original.doctor_id,
        admission_date: data.admission_date,
        notes: data.notes,
        status: 'pending' // Pending recommendation
      });
      toast.success("Patient recommended for admission.");
      setOpenAdmissionModal(false);
      // Optionally update appointment status to handled/completed?
    } catch (error: any) {
      toast.error(error.message || "Failed to recommend admission");
    }
  };

  return (
    <div className="mt-12 mb-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold text-blue-gray-800 mb-2">
            {isDoctor ? "My Appointments" : "Appointments Management"}
          </h2>
          {isDoctor && (
            <p className="text-blue-gray-600">
              View and manage your confirmed and completed appointments. You can create prescriptions and mark them as completed.
            </p>
          )}
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
          title={isDoctor ? "My Confirmed & Completed Appointments" : "Appointments Management"}
          data={appointments}
          columns={columns}
          onAdd={!isDoctor ? handleAdd : undefined}
          onEdit={!isDoctor ? handleEdit : undefined}
          onDelete={!isDoctor ? handleDelete : undefined}
          onView={handleView}
          customActions={getCustomActions}
          searchable={true}
          filterable={true}
          exportable={true}
          addButtonLabel={!isDoctor ? "New Appointment" : undefined}
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

      {/* Admission Recommendation Modal */}
      <FormModal
        open={openAdmissionModal}
        onClose={() => {
          setOpenAdmissionModal(false);
          setSelectedAppointment(null);
        }}
        title="Recommend Admission"
        formFields={admissionFields}
        initialData={{ admission_date: new Date().toISOString().split('T')[0] }}
        onSubmit={handleAdmissionSubmit}
        submitLabel="Submit Recommendation"
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

      <PrescriptionModal
        open={openPrescriptionModal}
        onClose={() => {
          setOpenPrescriptionModal(false);
          setSelectedAppointment(null);
        }}
        appointment={selectedAppointment?.original}
        onSuccess={() => {
          fetchAppointments(pagination.currentPage);
        }}
      />
    </div>
  );
}
