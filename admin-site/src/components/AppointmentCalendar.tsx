import React, { useMemo } from "react";
import { Calendar, momentLocalizer, Views, View } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
// We'll add some custom styles to make it look premium
import "./AppointmentCalendar.css";

const localizer = momentLocalizer(moment);

interface Appointment {
  id: number;
  patientName: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  status: string;
  reason?: string;
  original?: any;
}

interface AppointmentCalendarProps {
  appointments: Appointment[];
  onAppointmentClick?: (appointment: Appointment) => void;
}

export function AppointmentCalendar({ appointments, onAppointmentClick }: AppointmentCalendarProps): JSX.Element {

  const events = useMemo(() => {
    return appointments.map((appt) => {
      // Parse date and time
      // Assuming date is "YYYY-MM-DD" and time is "HH:mm" or "HH:mm AM/PM"
      const dateTimeString = `${appt.date} ${appt.time}`;
      const start = moment(dateTimeString, ["YYYY-MM-DD HH:mm", "YYYY-MM-DD hh:mm A"]).toDate();
      const end = moment(start).add(1, "hours").toDate(); // Default duration 1 hour

      return {
        id: appt.id,
        title: `${appt.patientName} - ${appt.doctorName}`,
        start,
        end,
        resource: appt,
        status: appt.status,
      };
    });
  }, [appointments]);

  const eventStyleGetter = (event: any) => {
    let backgroundColor = "#3b82f6"; // blue-500 default

    switch (event.status) {
      case "confirmed":
        backgroundColor = "#10b981"; // emerald-500
        break;
      case "pending":
        backgroundColor = "#f59e0b"; // amber-500
        break;
      case "cancelled":
        backgroundColor = "#ef4444"; // red-500
        break;
      case "completed":
        backgroundColor = "#6366f1"; // indigo-500
        break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "6px",
        opacity: 0.9,
        color: "white",
        border: "0px",
        display: "block",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        fontSize: "0.85rem",
        fontWeight: 500,
      },
    };
  };

  return (
    <div className="h-[800px] bg-white rounded-xl shadow-lg p-6 border border-blue-gray-100">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%" }}
        onSelectEvent={(event) => onAppointmentClick?.(event.resource)}
        eventPropGetter={eventStyleGetter}
        views={[Views.MONTH, Views.WEEK, Views.DAY]}
        defaultView={Views.MONTH}
        popup
        tooltipAccessor={(event) => `${event.title} (${event.status})`}
      />
    </div>
  );
}

export default AppointmentCalendar;


