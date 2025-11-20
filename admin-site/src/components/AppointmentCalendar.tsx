import React, { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
import { Button } from "@material-tailwind/react";

interface Appointment {
  id: number;
  patientName: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  status: string;
}

interface AppointmentCalendarProps {
  appointments: Appointment[];
  onAppointmentClick?: (appointment: Appointment) => void;
}

export function AppointmentCalendar({ appointments, onAppointmentClick }: AppointmentCalendarProps): JSX.Element {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"day" | "week" | "month">("month");

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Date[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(new Date(year, month, -startingDayOfWeek + i + 1));
    }

    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const parseTime = (timeStr: string): number => {
    const time = timeStr.trim().toUpperCase();
    const isPM = time.includes('PM');
    const timePart = time.replace(/[AP]M/i, '').trim();
    const [hours, minutes = '0'] = timePart.split(':');
    let hour24 = parseInt(hours);
    
    if (isPM && hour24 !== 12) {
      hour24 += 12;
    } else if (!isPM && hour24 === 12) {
      hour24 = 0;
    }
    
    return hour24 * 60 + parseInt(minutes);
  };

  const getAppointmentsForDate = (date: Date): Appointment[] => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date).toISOString().split('T')[0];
      return aptDate === dateStr;
    }).sort((a, b) => {
      return parseTime(a.time) - parseTime(b.time);
    });
  };

  const goToPreviousMonth = (): void => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = (): void => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = (): void => {
    setCurrentDate(new Date());
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentDate.getMonth();
  };

  const days = getDaysInMonth(currentDate);
  const today = new Date();

  return (
    <div className="bg-white rounded-xl border border-blue-gray-100 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="border-b border-blue-gray-100 bg-white p-4">
        <div className="flex items-center justify-between mb-4">
          {/* Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-blue-gray-50 rounded-lg transition-colors"
            >
              <ChevronLeftIcon className="h-5 w-5 text-blue-gray-600" />
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-blue-gray-50 rounded-lg transition-colors"
            >
              <ChevronRightIcon className="h-5 w-5 text-blue-gray-600" />
            </button>
            <button
              onClick={goToToday}
              className="ml-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <CalendarDaysIcon className="h-4 w-4" />
              Today
            </button>
          </div>

          {/* Month/Year Display */}
          <div className="text-xl font-semibold text-blue-gray-800">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </div>

          {/* View Selection */}
          <div className="flex items-center gap-1 bg-blue-gray-50 rounded-lg p-1">
            <button
              onClick={() => setView("day")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                view === "day"
                  ? "bg-purple-600 text-white"
                  : "text-blue-gray-600 hover:text-blue-gray-800"
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setView("week")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                view === "week"
                  ? "bg-purple-600 text-white"
                  : "text-blue-gray-600 hover:text-blue-gray-800"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setView("month")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                view === "month"
                  ? "bg-purple-600 text-white"
                  : "text-blue-gray-600 hover:text-blue-gray-800"
              }`}
            >
              Month
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-semibold text-blue-gray-600 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => {
            const dayAppointments = getAppointmentsForDate(date);
            const isTodayDate = isToday(date);
            const isCurrentMonthDate = isCurrentMonth(date);

            return (
              <div
                key={index}
                className={`min-h-[120px] border border-blue-gray-100 rounded-lg p-2 ${
                  !isCurrentMonthDate ? "bg-blue-gray-50 opacity-50" : "bg-white"
                } ${
                  isTodayDate ? "ring-2 ring-purple-400 ring-opacity-50" : ""
                } hover:bg-blue-gray-50 transition-colors`}
              >
                <div
                  className={`text-sm font-medium mb-1 ${
                    isCurrentMonthDate ? "text-blue-gray-800" : "text-blue-gray-400"
                  }`}
                >
                  {date.getDate()}
                </div>
                <div className="space-y-1 overflow-y-auto max-h-[90px]">
                  {dayAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      onClick={() => onAppointmentClick?.(appointment)}
                      className="bg-blue-gray-100 hover:bg-blue-gray-200 rounded px-2 py-1 text-xs text-blue-gray-700 cursor-pointer transition-colors"
                    >
                      {appointment.time}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AppointmentCalendar;

