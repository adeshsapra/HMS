import React, { useState } from "react";
import { DataTable, FormModal, ViewModal, DeleteConfirmModal, Column, FormField, ViewField } from "@/components";
import { appointmentsData, patientsData, doctorsData } from "@/data/hms-data";
import { Button } from "@material-tailwind/react";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";

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
}

export default function Appointments(): JSX.Element {
  const [appointments, setAppointments] = useState<Appointment[]>(appointmentsData);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openViewModal, setOpenViewModal] = useState<boolean>(false);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

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

  const handleEdit = (appointment: Appointment): void => {
    setSelectedAppointment(appointment);
    setOpenModal(true);
  };

  const handleDelete = (appointment: Appointment): void => {
    setSelectedAppointment(appointment);
    setOpenDeleteModal(true);
  };

  const confirmDelete = (): void => {
    if (selectedAppointment) {
      setAppointments(appointments.filter((a) => a.id !== selectedAppointment.id));
      setOpenDeleteModal(false);
      setSelectedAppointment(null);
    }
  };

  const handleView = (appointment: Appointment): void => {
    setSelectedAppointment(appointment);
    setOpenViewModal(true);
  };

  const handleSubmit = (data: Record<string, any>): void => {
    if (selectedAppointment) {
      setAppointments(
        appointments.map((a) =>
          a.id === selectedAppointment.id ? { ...a, ...data } : a
        )
      );
    } else {
      const newAppointment: Appointment = {
        id: appointments.length + 1,
        ...data,
        phone: patientsData.find((p) => p.name === data.patientName)?.phone || "",
      } as Appointment;
      setAppointments([...appointments, newAppointment]);
    }
    setOpenModal(false);
    setSelectedAppointment(null);
  };

  return (
    <div className="mt-12 mb-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold text-blue-gray-800 mb-2">Appointments</h2>
          <p className="text-blue-gray-600 text-base">Manage all patient appointments and schedules</p>
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

      {viewMode === "list" ? (
        <DataTable
          title="Appointments Management"
          data={appointments}
          columns={columns}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          searchable={true}
          filterable={true}
          exportable={true}
          addButtonLabel="New Appointment"
          searchPlaceholder="Search appointments..."
        />
      ) : (
        <div className="bg-white rounded-xl border border-blue-gray-100 shadow-lg p-16">
          <div className="text-center">
            <CalendarDaysIcon className="h-20 w-20 mx-auto text-blue-gray-300 mb-4" />
            <p className="text-xl font-bold text-blue-gray-700 mb-2">
              Calendar View
            </p>
            <p className="text-blue-gray-500 text-base">
              Calendar view coming soon. Please use list view for now.
            </p>
          </div>
        </div>
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

