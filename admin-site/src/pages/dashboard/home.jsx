import React from "react";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  Avatar,
  Button,
  Chip,
} from "@material-tailwind/react";
import {
  CalendarDaysIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ArrowUpIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { StatisticsCard } from "@/widgets/cards";
import { StatisticsChart } from "@/widgets/charts";
import {
  statisticsCardsData,
  statisticsChartsData,
} from "@/data";
import { appointmentsData, patientsData, doctorsData, departmentsData } from "@/data/hms-data";
import { Link } from "react-router-dom";

export function Home() {
  const todayAppointments = appointmentsData.filter(apt => apt.date === "2024-01-25");
  const pendingAppointments = appointmentsData.filter(apt => apt.status === "pending");
  const recentPatients = patientsData.slice(0, 5);

  return (
    <div className="mt-12 mb-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-blue-gray-800 mb-2">Dashboard</h1>
        <p className="text-blue-gray-600 text-base">Welcome back! Here's what's happening at your hospital today.</p>
      </div>

      {/* Statistics Cards */}
      <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
        {statisticsCardsData.slice(0, 4).map(({ icon, title, footer, ...rest }) => (
          <StatisticsCard
            key={title}
            {...rest}
            title={title}
            icon={React.createElement(icon, {
              className: "w-6 h-6 text-white",
            })}
            footer={
              <Typography className="font-normal text-blue-gray-600">
                <strong className={footer.color}>{footer.value}</strong>
                &nbsp;{footer.label}
              </Typography>
            }
          />
        ))}
      </div>

      {/* Additional Statistics Cards */}
      <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
        {statisticsCardsData.slice(4).map(({ icon, title, footer, ...rest }) => (
          <StatisticsCard
            key={title}
            {...rest}
            title={title}
            icon={React.createElement(icon, {
              className: "w-6 h-6 text-white",
            })}
            footer={
              <Typography className="font-normal text-blue-gray-600">
                <strong className={footer.color}>{footer.value}</strong>
                &nbsp;{footer.label}
              </Typography>
            }
          />
        ))}
      </div>

      {/* Charts */}
      <div className="mb-8 grid grid-cols-1 gap-y-12 gap-x-6 md:grid-cols-2 xl:grid-cols-3">
        {statisticsChartsData.map((props) => (
          <StatisticsChart
            key={props.title}
            {...props}
            footer={
              <Typography
                variant="small"
                className="flex items-center font-normal text-blue-gray-600"
              >
                <ClockIcon strokeWidth={2} className="h-4 w-4 text-blue-gray-400" />
                &nbsp;{props.footer}
              </Typography>
            }
          />
        ))}
      </div>

      {/* Today's Appointments and Recent Patients */}
      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Today's Appointments */}
        <Card className="overflow-hidden xl:col-span-2 border border-blue-gray-100 shadow-lg">
          <CardHeader
            variant="gradient"
            color="blue"
            className="p-6 flex items-center justify-between"
          >
            <div>
              <Typography variant="h6" color="white" className="mb-1 font-bold">
                Today's Appointments
              </Typography>
              <Typography
                variant="small"
                className="flex items-center gap-1 font-normal text-white/90"
              >
                <CalendarDaysIcon strokeWidth={2} className="h-4 w-4" />
                <strong>{todayAppointments.length} appointments</strong> scheduled today
              </Typography>
            </div>
            <Button 
              variant="text" 
              size="sm" 
              color="white" 
              as={Link} 
              to="/dashboard/appointments"
              className="font-semibold hover:bg-white/20"
            >
              View All
            </Button>
          </CardHeader>
          <CardBody className="overflow-x-scroll px-0 pt-0 pb-2 bg-white">
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr className="bg-blue-gray-50/50">
                  {["Patient", "Doctor", "Time", "Department", "Status"].map((el) => (
                    <th
                      key={el}
                      className="border-b border-blue-gray-100 py-4 px-6 text-left"
                    >
                      <Typography
                        variant="small"
                        className="text-[11px] font-bold uppercase text-blue-gray-600 tracking-wider"
                      >
                        {el}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {todayAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <CalendarDaysIcon className="h-12 w-12 text-blue-gray-300 mb-2" />
                        <Typography variant="small" className="text-blue-gray-500 font-medium">
                          No appointments scheduled for today
                        </Typography>
                      </div>
                    </td>
                  </tr>
                ) : (
                  todayAppointments.map((apt, key) => {
                    const className = `py-4 px-6 ${
                      key === todayAppointments.length - 1
                        ? ""
                        : "border-b border-blue-gray-100"
                    }`;
                    const statusColors = {
                      confirmed: "green",
                      pending: "yellow",
                      cancelled: "red",
                    };

                    return (
                      <tr key={apt.id} className="hover:bg-blue-gray-50/30 transition-colors">
                        <td className={className}>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-bold"
                          >
                            {apt.patientName}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography className="text-sm font-semibold text-blue-gray-700">
                            {apt.doctorName}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography className="text-sm font-semibold text-blue-gray-700">
                            {apt.time}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography className="text-sm font-semibold text-blue-gray-700">
                            {apt.department}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Chip
                            variant="gradient"
                            color={statusColors[apt.status] || "gray"}
                            value={apt.status}
                            className="py-1 px-3 text-[11px] font-semibold w-fit capitalize shadow-sm"
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </CardBody>
        </Card>

        {/* Recent Patients */}
        <Card className="border border-blue-gray-100 shadow-lg">
          <CardHeader
            variant="gradient"
            color="green"
            className="p-6"
          >
            <Typography variant="h6" color="white" className="mb-2 font-bold">
              Recent Patients
            </Typography>
            <Typography
              variant="small"
              className="flex items-center gap-1 font-normal text-white/90"
            >
              <ArrowUpIcon
                strokeWidth={3}
                className="h-3.5 w-3.5 text-green-200"
              />
              <strong>+12%</strong> this month
            </Typography>
          </CardHeader>
          <CardBody className="pt-6 bg-white">
            {recentPatients.map((patient, key) => (
              <div key={patient.id} className="flex items-center gap-4 py-3 border-b border-blue-gray-100 last:border-0">
                <Avatar 
                  src={patient.avatar} 
                  alt={patient.name} 
                  size="sm" 
                  variant="rounded" 
                  className="border-2 border-blue-gray-100" 
                />
                <div className="flex-1 min-w-0">
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="block font-bold truncate"
                  >
                    {patient.name}
                  </Typography>
                  <Typography
                    as="span"
                    variant="small"
                    className="text-xs font-medium text-blue-gray-500"
                  >
                    {patient.gender}, {patient.age} years
                  </Typography>
                </div>
                <Chip
                  variant="gradient"
                  color={patient.status === "active" ? "green" : patient.status === "critical" ? "red" : "gray"}
                  value={patient.status}
                  className="py-0.5 px-2 text-[10px] font-semibold w-fit capitalize shadow-sm"
                />
              </div>
            ))}
            <div className="mt-4 pt-4 border-t border-blue-gray-100">
              <Button 
                variant="text" 
                size="sm" 
                fullWidth 
                as={Link} 
                to="/dashboard/patients"
                className="text-blue-600 font-semibold hover:bg-blue-50"
              >
                View All Patients
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border border-blue-gray-100 shadow-lg">
        <CardHeader
          variant="gradient"
          color="purple"
          className="p-6"
        >
          <Typography variant="h6" color="white" className="font-bold">
            Quick Actions
          </Typography>
        </CardHeader>
        <CardBody className="p-6 bg-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="gradient"
              color="blue"
              className="flex items-center justify-center gap-2 py-4 shadow-md hover:shadow-lg transition-all"
              as={Link}
              to="/dashboard/appointments"
            >
              <CalendarDaysIcon className="h-5 w-5" />
              <span className="font-semibold">New Appointment</span>
            </Button>
            <Button
              variant="gradient"
              color="green"
              className="flex items-center justify-center gap-2 py-4 shadow-md hover:shadow-lg transition-all"
              as={Link}
              to="/dashboard/patients"
            >
              <UserGroupIcon className="h-5 w-5" />
              <span className="font-semibold">Register Patient</span>
            </Button>
            <Button
              variant="gradient"
              color="orange"
              className="flex items-center justify-center gap-2 py-4 shadow-md hover:shadow-lg transition-all"
              as={Link}
              to="/dashboard/billing"
            >
              <CurrencyDollarIcon className="h-5 w-5" />
              <span className="font-semibold">Create Invoice</span>
            </Button>
            <Button
              variant="gradient"
              color="purple"
              className="flex items-center justify-center gap-2 py-4 shadow-md hover:shadow-lg transition-all"
              as={Link}
              to="/dashboard/reports"
            >
              <ClockIcon className="h-5 w-5" />
              <span className="font-semibold">View Reports</span>
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default Home;
