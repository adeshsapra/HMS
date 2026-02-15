import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Typography,
  Button,
  Chip,
  Spinner,
  Popover,
  PopoverHandler,
  PopoverContent,
  Input,
  IconButton,
} from "@material-tailwind/react";
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  UsersIcon,
  CreditCardIcon,
  CubeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  TableCellsIcon,
  ChartPieIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { StatisticsCard } from "@/widgets/cards";
import { ReportFilters } from "@/components/reports/ReportFilters";
import { ReportChart } from "@/components/reports/ReportChart";
import { ReportTable } from "@/components/reports/ReportTable";
import { ReportExport } from "@/components/reports/ReportExport";
import { useReportData } from "@/hooks/useReportData";
import apiService from "@/services/api";

// ——— Report Category definitions ———
const reportCategories = [
  {
    id: "revenue",
    title: "Revenue & Financial",
    description: "Total billed, collected, and due amounts with trends",
    icon: CurrencyDollarIcon,
    gradient: "from-green-500 to-teal-600",
    bgColor: "bg-green-50/50",
    iconBg: "bg-gradient-to-r from-green-500 to-teal-600",
    shadowColor: "shadow-green-500/30",
    reportType: "revenue",
  },
  {
    id: "appointments",
    title: "Appointments",
    description: "Appointment counts by status, doctor, and daily trends",
    icon: CalendarDaysIcon,
    gradient: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-50/50",
    iconBg: "bg-gradient-to-r from-blue-500 to-indigo-600",
    shadowColor: "shadow-blue-500/30",
    reportType: "appointments",
  },
  {
    id: "patients",
    title: "Patients",
    description: "New registrations, demographics, and age distribution",
    icon: UserGroupIcon,
    gradient: "from-purple-500 to-deep-purple-600",
    bgColor: "bg-purple-50/50",
    iconBg: "bg-gradient-to-r from-purple-500 to-deep-purple-600",
    shadowColor: "shadow-purple-500/30",
    reportType: "patients",
  },
  {
    id: "payments",
    title: "Payments & Billing",
    description: "Payment modes, gateway usage, and collection trends",
    icon: CreditCardIcon,
    gradient: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-50/50",
    iconBg: "bg-gradient-to-r from-amber-500 to-orange-600",
    shadowColor: "shadow-amber-500/30",
    reportType: "payments",
  },
  {
    id: "staff",
    title: "Staff & Performance",
    description: "Staff distribution, hiring trends, and doctor workload",
    icon: UsersIcon,
    gradient: "from-cyan-500 to-blue-600",
    bgColor: "bg-cyan-50/50",
    iconBg: "bg-gradient-to-r from-cyan-500 to-blue-600",
    shadowColor: "shadow-cyan-500/30",
    reportType: "staff",
  },
  {
    id: "inventory",
    title: "Inventory & Operations",
    description: "Stock levels, expiry alerts, department usage reports",
    icon: CubeIcon,
    gradient: "from-pink-500 to-rose-600",
    bgColor: "bg-pink-50/50",
    iconBg: "bg-gradient-to-r from-pink-500 to-rose-600",
    shadowColor: "shadow-pink-500/30",
    reportType: "inventory-low-stock",
  },
];

// ——— Utility: format number ———
function fmt(val: number | undefined, prefix = ""): string {
  if (val === undefined || val === null) return "—";
  return `${prefix}${val.toLocaleString()}`;
}

function fmtCurrency(val: number | undefined): string {
  if (val === undefined || val === null) return "—";
  return `₹${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ——— Growth badge ———
function GrowthBadge({ value, label = "vs prev" }: { value: number, label?: string }) {
  if (value === 0) return (
    <div className="flex items-center gap-1 text-[10px] font-bold text-blue-gray-400">
      <div className="h-1 w-2 bg-blue-gray-200 rounded-full" /> 0%
    </div>
  );
  const isPositive = value > 0;
  return (
    <div className={`flex items-center gap-1 text-[10px] font-bold ${isPositive ? "text-emerald-500" : "text-rose-500"}`}>
      {isPositive ? (
        <ArrowTrendingUpIcon className="h-3 w-3" />
      ) : (
        <ArrowTrendingDownIcon className="h-3 w-3" />
      )}
      {Math.abs(value).toFixed(1)}% <span className="text-blue-gray-300 font-medium lowercase tracking-tighter">{label}</span>
    </div>
  );
}

// ——— Compact KPI card with Sparkline ———
function CompactKPI({ title, value, trend, sparkline, icon: Icon, color }: any) {
  return (
    <Card className="border border-blue-gray-50/50 shadow-sm bg-white group hover:shadow-md transition-all duration-300">
      <CardBody className="p-4 flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1 min-w-[120px]">
          <div className="flex items-center gap-1.5 opacity-70 mb-1">
            <Icon className={`h-4 w-4 text-${color}-500`} />
            <Typography variant="small" className="text-[10px] font-extrabold uppercase tracking-widest text-blue-gray-400">
              {title}
            </Typography>
          </div>
          <Typography variant="h4" color="blue-gray" className="font-extrabold leading-none tracking-tight">
            {value}
          </Typography>
          <GrowthBadge value={trend} />
        </div>

        {/* Compact Sparkline using ReportChart */}
        <div className="flex-1 h-12 max-w-[100px] opacity-80 group-hover:opacity-100 transition-opacity overflow-visible">
          <ReportChart
            type="area"
            noCard
            series={[{ name: 'Trend', data: sparkline || [] }]}
            options={{
              chart: {
                sparkline: { enabled: true },
                animations: { enabled: true },
                toolbar: { show: false }
              },
              tooltip: {
                enabled: true,
                theme: 'light',
                x: { show: false },
                y: {
                  title: { formatter: () => '' },
                  formatter: (val: any) => fmt(val)
                },
                marker: { show: false },
                fixed: { enabled: false },
                style: { fontSize: '10px' }
              },
              stroke: { curve: 'smooth', width: 2 },
              fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05 } },
              colors: [color === 'green' ? '#10b981' : color === 'blue' ? '#3b82f6' : color === 'purple' ? '#8b5cf6' : '#f59e0b']
            }}
            height={50}
          />
        </div>
      </CardBody>
    </Card>
  );
}

// ——— Skeleton loaders ———
function SkeletonDashboard() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 bg-blue-gray-50 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 h-[400px] bg-blue-gray-50 rounded-3xl" />
        <div className="h-[400px] bg-blue-gray-50 rounded-3xl" />
      </div>
    </div>
  );
}

function SkeletonChart() {
  return (
    <Card className="border border-blue-gray-100 shadow-sm animate-pulse">
      <CardBody className="p-6">
        <div className="h-4 bg-blue-gray-100 rounded w-40 mb-4" />
        <div className="h-64 bg-blue-gray-50 rounded" />
      </CardBody>
    </Card>
  );
}

// ——— Revenue Report View ———
function RevenueReport({ data }: { data: any }) {
  if (!data) return null;
  const d = data;

  const tableData = (d.bills_by_status || []).map((item: any) => ({
    status: item.status,
    count: item.count,
    total: fmtCurrency(parseFloat(item.total)),
  }));

  const exportColumns = [
    { key: "status", label: "Bill Status" },
    { key: "count", label: "Count" },
    { key: "total", label: "Total Amount" },
  ];

  return (
    <div>
      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 mb-6">
        <StatisticsCard
          color="green"
          icon={<CurrencyDollarIcon className="h-6 w-6 text-white" />}
          title="Total Billed"
          value={fmtCurrency(d.total_billed)}
          footer={<GrowthBadge value={d.growth_percent || 0} />}
        />
        <StatisticsCard
          color="blue"
          icon={<CurrencyDollarIcon className="h-6 w-6 text-white" />}
          title="Total Collected"
          value={fmtCurrency(d.total_collected)}
        />
        <StatisticsCard
          color="orange"
          icon={<CurrencyDollarIcon className="h-6 w-6 text-white" />}
          title="Total Due"
          value={fmtCurrency(d.total_due)}
        />
        <StatisticsCard
          color="purple"
          icon={<ChartBarIcon className="h-6 w-6 text-white" />}
          title="Total Bills"
          value={fmt(d.total_bills)}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        {d.daily_revenue && d.daily_revenue.length > 0 && (
          <ReportChart
            type="area"
            title="Revenue Trend"
            description="Daily collection over selected period"
            series={[
              {
                name: "Revenue",
                data: d.daily_revenue.map((item: any) => parseFloat(item.total)),
              },
            ]}
            options={{
              xaxis: {
                categories: d.daily_revenue.map((item: any) =>
                  new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                ),
              },
            }}
          />
        )}

        {d.payments_by_mode && d.payments_by_mode.length > 0 && (
          <ReportChart
            type="donut"
            title="Payment Modes"
            description="Distribution of payment methods"
            series={d.payments_by_mode.map((item: any) => parseFloat(item.total))}
            options={{
              labels: d.payments_by_mode.map((item: any) =>
                item.payment_mode === "cash" ? "Cash" : "Online"
              ),
            }}
            height={300}
          />
        )}
      </div>

      {/* Table */}
      <div className="flex justify-between items-center mb-3">
        <Typography variant="small" className="font-semibold text-blue-gray-700">
          Bills by Status
        </Typography>
        <ReportExport data={tableData} columns={exportColumns} filename="revenue_report" title="Revenue Report" />
      </div>
      <ReportTable
        columns={[
          {
            key: "status", label: "Status", render: (val: string) => (
              <Chip
                size="sm"
                variant="ghost"
                value={val}
                color={
                  val === "paid" ? "green" :
                    val === "finalized" ? "blue" :
                      val === "partially_paid" ? "amber" :
                        "blue-gray"
                }
              />
            )
          },
          { key: "count", label: "Count", align: "right" },
          { key: "total", label: "Total Amount", align: "right" },
        ]}
        data={tableData}
      />
    </div>
  );
}

// ——— Appointments Report View ———
function AppointmentsReport({ data }: { data: any }) {
  if (!data) return null;
  const d = data;

  const doctorTableData = (d.by_doctor || []).map((item: any) => ({
    doctor: `Dr. ${item.first_name} ${item.last_name}`,
    appointments: item.count,
  }));

  const exportColumns = [
    { key: "doctor", label: "Doctor" },
    { key: "appointments", label: "Appointments" },
  ];

  return (
    <div>
      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 mb-6">
        <StatisticsCard
          color="blue"
          icon={<CalendarDaysIcon className="h-6 w-6 text-white" />}
          title="Total Appointments"
          value={fmt(d.total_appointments)}
          footer={<GrowthBadge value={d.growth_percent || 0} />}
        />
        {(d.by_status || []).map((s: any) => (
          <StatisticsCard
            key={s.status}
            color={
              s.status === "completed" ? "green" :
                s.status === "confirmed" ? "blue" :
                  s.status === "pending" ? "amber" :
                    s.status === "cancelled" ? "red" :
                      "blue-gray"
            }
            icon={<CalendarDaysIcon className="h-6 w-6 text-white" />}
            title={s.status.charAt(0).toUpperCase() + s.status.slice(1)}
            value={fmt(s.count)}
          />
        )).slice(0, 3)}
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        {d.daily_trend && d.daily_trend.length > 0 && (
          <ReportChart
            type="area"
            title="Appointments Trend"
            description="Daily appointment count"
            series={[
              {
                name: "Appointments",
                data: d.daily_trend.map((item: any) => item.count),
              },
            ]}
            options={{
              xaxis: {
                categories: d.daily_trend.map((item: any) =>
                  new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                ),
              },
              colors: ["#3b82f6"],
            }}
          />
        )}

        {d.by_status && d.by_status.length > 0 && (
          <ReportChart
            type="donut"
            title="By Status"
            description="Appointment status distribution"
            series={d.by_status.map((s: any) => s.count)}
            options={{
              labels: d.by_status.map((s: any) =>
                s.status.charAt(0).toUpperCase() + s.status.slice(1)
              ),
            }}
            height={300}
          />
        )}
      </div>

      {/* Top Doctors Table */}
      <div className="flex justify-between items-center mb-3">
        <Typography variant="small" className="font-semibold text-blue-gray-700">
          Top Doctors by Appointments
        </Typography>
        <ReportExport data={doctorTableData} columns={exportColumns} filename="appointments_report" title="Appointments Report" />
      </div>
      <ReportTable
        columns={[
          { key: "doctor", label: "Doctor" },
          { key: "appointments", label: "Appointments", align: "right" },
        ]}
        data={doctorTableData}
      />
    </div>
  );
}

// ——— Patients Report View ———
function PatientsReport({ data }: { data: any }) {
  if (!data) return null;
  const d = data;

  const genderData = (d.by_gender || []).map((item: any) => ({
    gender: item.gender ? item.gender.charAt(0).toUpperCase() + item.gender.slice(1) : "Unknown",
    count: item.count,
  }));

  const exportColumns = [
    { key: "gender", label: "Gender" },
    { key: "count", label: "Count" },
  ];

  return (
    <div>
      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 mb-6">
        <StatisticsCard
          color="purple"
          icon={<UserGroupIcon className="h-6 w-6 text-white" />}
          title="Total Patients"
          value={fmt(d.total_patients)}
        />
        <StatisticsCard
          color="blue"
          icon={<UserGroupIcon className="h-6 w-6 text-white" />}
          title="New Patients"
          value={fmt(d.new_patients)}
          footer={<GrowthBadge value={d.growth_percent || 0} />}
        />
        <StatisticsCard
          color="green"
          icon={<CalendarDaysIcon className="h-6 w-6 text-white" />}
          title="With Appointments"
          value={fmt(d.patients_with_appointments)}
        />
        <StatisticsCard
          color="orange"
          icon={<ChartBarIcon className="h-6 w-6 text-white" />}
          title="Period Growth"
          value={`${d.growth_percent || 0}%`}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        {d.daily_registrations && d.daily_registrations.length > 0 && (
          <ReportChart
            type="area"
            title="Registration Trend"
            description="New patient registrations per day"
            series={[
              {
                name: "Registrations",
                data: d.daily_registrations.map((item: any) => item.count),
              },
            ]}
            options={{
              xaxis: {
                categories: d.daily_registrations.map((item: any) =>
                  new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                ),
              },
              colors: ["#8b5cf6"],
            }}
          />
        )}

        {d.age_distribution && d.age_distribution.length > 0 && (
          <ReportChart
            type="bar"
            title="Age Distribution"
            description="Patient age groups"
            series={[
              {
                name: "Patients",
                data: d.age_distribution.map((item: any) => item.count),
              },
            ]}
            options={{
              xaxis: {
                categories: d.age_distribution.map((item: any) => item.age_group),
              },
              colors: ["#06b6d4"],
              plotOptions: { bar: { distributed: true } },
            }}
            height={300}
          />
        )}
      </div>

      {/* Gender Table */}
      <div className="flex justify-between items-center mb-3">
        <Typography variant="small" className="font-semibold text-blue-gray-700">
          Gender Distribution
        </Typography>
        <ReportExport data={genderData} columns={exportColumns} filename="patients_report" title="Patients Report" />
      </div>
      <ReportTable columns={[
        { key: "gender", label: "Gender" },
        { key: "count", label: "Count", align: "right" },
      ]} data={genderData} />
    </div>
  );
}

// ——— Payments Report View ———
function PaymentsReport({ data }: { data: any }) {
  if (!data) return null;
  const d = data;

  const modeData = [
    { mode: "Cash", count: d.cash_payments || 0, amount: fmtCurrency(d.cash_amount) },
    { mode: "Online", count: d.online_payments || 0, amount: fmtCurrency(d.online_amount) },
  ];

  const exportColumns = [
    { key: "mode", label: "Payment Mode" },
    { key: "count", label: "Count" },
    { key: "amount", label: "Amount" },
  ];

  return (
    <div>
      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 mb-6">
        <StatisticsCard
          color="blue"
          icon={<CreditCardIcon className="h-6 w-6 text-white" />}
          title="Total Payments"
          value={fmt(d.total_payments)}
          footer={<GrowthBadge value={d.growth_percent || 0} />}
        />
        <StatisticsCard
          color="green"
          icon={<CurrencyDollarIcon className="h-6 w-6 text-white" />}
          title="Amount Collected"
          value={fmtCurrency(d.total_amount_collected)}
        />
        <StatisticsCard
          color="amber"
          icon={<CreditCardIcon className="h-6 w-6 text-white" />}
          title="Pending Payments"
          value={fmt(d.pending_payments)}
        />
        <StatisticsCard
          color="red"
          icon={<CurrencyDollarIcon className="h-6 w-6 text-white" />}
          title="Pending Amount"
          value={fmtCurrency(d.pending_amount)}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        {d.daily_payments && d.daily_payments.length > 0 && (
          <ReportChart
            type="area"
            title="Collection Trend"
            description="Daily payment collections"
            series={[
              {
                name: "Amount",
                data: d.daily_payments.map((item: any) => parseFloat(item.total)),
              },
            ]}
            options={{
              xaxis: {
                categories: d.daily_payments.map((item: any) =>
                  new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                ),
              },
              colors: ["#10b981"],
            }}
          />
        )}

        <ReportChart
          type="donut"
          title="Cash vs Online"
          description="Payment mode split"
          series={[d.cash_amount || 0, d.online_amount || 0]}
          options={{
            labels: ["Cash", "Online"],
            colors: ["#f59e0b", "#3b82f6"],
          }}
          height={300}
        />
      </div>

      {/* Table */}
      <div className="flex justify-between items-center mb-3">
        <Typography variant="small" className="font-semibold text-blue-gray-700">
          Payment Mode Summary
        </Typography>
        <ReportExport data={modeData} columns={exportColumns} filename="payments_report" title="Payments Report" />
      </div>
      <ReportTable columns={[
        { key: "mode", label: "Payment Mode" },
        { key: "count", label: "Count", align: "right" },
        { key: "amount", label: "Amount", align: "right" },
      ]} data={modeData} />
    </div>
  );
}

// ——— Staff Report View ———
function StaffReport({ data }: { data: any }) {
  if (!data) return null;
  const d = data;

  const deptData = (d.staff_by_department || []).map((item: any) => ({
    department: item.department?.name || `Dept #${item.department_id}`,
    count: item.count,
  }));

  const doctorTableData = (d.appointments_by_doctor || []).map((item: any) => ({
    doctor: `Dr. ${item.first_name} ${item.last_name}`,
    appointments: item.appointment_count,
  }));

  const deptExportColumns = [
    { key: "department", label: "Department" },
    { key: "count", label: "Staff Count" },
  ];

  return (
    <div>
      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 mb-6">
        <StatisticsCard
          color="blue"
          icon={<UsersIcon className="h-6 w-6 text-white" />}
          title="Total Staff"
          value={fmt(d.total_staff)}
        />
        <StatisticsCard
          color="green"
          icon={<UsersIcon className="h-6 w-6 text-white" />}
          title="Active Staff"
          value={fmt(d.active_staff)}
        />
        <StatisticsCard
          color="amber"
          icon={<UsersIcon className="h-6 w-6 text-white" />}
          title="On Leave"
          value={fmt(d.on_leave)}
        />
        <StatisticsCard
          color="purple"
          icon={<ArrowTrendingUpIcon className="h-6 w-6 text-white" />}
          title="New Hires"
          value={fmt(d.new_hires)}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        {d.staff_by_department && d.staff_by_department.length > 0 && (
          <ReportChart
            type="bar"
            title="Staff by Department"
            description="Number of staff per department"
            series={[
              {
                name: "Staff",
                data: d.staff_by_department.map((item: any) => item.count),
              },
            ]}
            options={{
              xaxis: {
                categories: d.staff_by_department.map((item: any) =>
                  item.department?.name || `#${item.department_id}`
                ),
              },
              plotOptions: { bar: { distributed: true, borderRadius: 6, columnWidth: '55%' } },
            }}
          />
        )}

        {d.staff_by_status && d.staff_by_status.length > 0 && (
          <ReportChart
            type="donut"
            title="Staff Status"
            description="Employment status distribution"
            series={d.staff_by_status.map((s: any) => s.count)}
            options={{
              labels: d.staff_by_status.map((s: any) =>
                s.employment_status.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())
              ),
            }}
            height={300}
          />
        )}
      </div>

      {/* Tables */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <div className="flex justify-between items-center mb-3">
            <Typography variant="small" className="font-semibold text-blue-gray-700">
              Staff by Department
            </Typography>
            <ReportExport data={deptData} columns={deptExportColumns} filename="staff_dept_report" title="Staff by Department" />
          </div>
          <ReportTable columns={[
            { key: "department", label: "Department" },
            { key: "count", label: "Staff Count", align: "right" },
          ]} data={deptData} />
        </div>

        <div>
          <Typography variant="small" className="font-semibold text-blue-gray-700 mb-3">
            Top Doctors by Appointments
          </Typography>
          <ReportTable columns={[
            { key: "doctor", label: "Doctor" },
            { key: "appointments", label: "Appointments", align: "right" },
          ]} data={doctorTableData} emptyMessage="No appointment data for this period" />
        </div>
      </div>
    </div>
  );
}

// ——— Inventory Report View ———
function InventoryReport({ data, subType, onSubTypeChange }: { data: any; subType: string; onSubTypeChange: (type: string) => void }) {
  const inventorySubTypes = [
    { id: "inventory-low-stock", label: "Low Stock" },
    { id: "inventory-expiry", label: "Expiry Report" },
    { id: "inventory-stock-in", label: "Stock In" },
    { id: "inventory-stock-out", label: "Stock Out" },
    { id: "inventory-department-usage", label: "Department Usage" },
    { id: "inventory-vendor-summary", label: "Vendor Summary" },
  ];

  const renderTable = () => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return (
        <Card className="border border-blue-gray-100 shadow-sm">
          <CardBody className="p-12 text-center">
            <CubeIcon className="h-12 w-12 mx-auto text-blue-gray-300 mb-3" />
            <Typography variant="h6" color="blue-gray">No Data</Typography>
            <Typography variant="small" className="text-blue-gray-400">
              No inventory data found for the selected report type and filters.
            </Typography>
          </CardBody>
        </Card>
      );
    }

    // Dynamic columns based on sub-type
    let columns: any[] = [];
    let exportData = data;

    switch (subType) {
      case "inventory-low-stock":
        columns = [
          { key: "name", label: "Item Name" },
          { key: "current_stock", label: "Current Stock", align: "right" as const },
          { key: "min_stock_level", label: "Min Level", align: "right" as const },
          {
            key: "category", label: "Category",
            render: (_: any, row: any) => (
              <Typography variant="small" className="font-normal text-blue-gray-700">
                {row.category?.name || "—"}
              </Typography>
            )
          },
        ];
        break;
      case "inventory-expiry":
        columns = [
          { key: "name", label: "Item Name" },
          {
            key: "expiry_date", label: "Expiry Date",
            render: (val: string) => (
              <Typography variant="small" className={`font-normal ${new Date(val) < new Date() ? "text-red-500 font-semibold" : "text-blue-gray-700"}`}>
                {val ? new Date(val).toLocaleDateString() : "—"}
              </Typography>
            )
          },
          { key: "current_stock", label: "Stock", align: "right" as const },
        ];
        break;
      case "inventory-department-usage":
        columns = [
          { key: "department", label: "Department" },
          { key: "item", label: "Item" },
          { key: "total_quantity", label: "Quantity Used", align: "right" as const },
        ];
        break;
      case "inventory-vendor-summary":
        columns = [
          { key: "name", label: "Vendor" },
          { key: "purchases_count", label: "Purchases", align: "right" as const },
          {
            key: "total_spent", label: "Total Spent", align: "right" as const,
            render: (val: any) => (
              <Typography variant="small" className="font-normal text-blue-gray-700">
                {fmtCurrency(parseFloat(val || 0))}
              </Typography>
            )
          },
        ];
        break;
      case "inventory-stock-in":
        columns = [
          { key: "purchase_number", label: "Order #" },
          {
            key: "vendor", label: "Vendor",
            render: (_: any, row: any) => row.vendor?.name || "—"
          },
          {
            key: "purchase_date", label: "Date",
            render: (val: string) => val ? new Date(val).toLocaleDateString() : "—"
          },
          {
            key: "total_amount", label: "Amount", align: "right" as const,
            render: (val: any) => fmtCurrency(parseFloat(val || 0))
          },
        ];
        break;
      case "inventory-stock-out":
        columns = [
          { key: "issue_number", label: "Issue #" },
          {
            key: "request", label: "To Department",
            render: (_: any, row: any) => row.request?.department?.name || "—"
          },
          {
            key: "issue_date", label: "Date",
            render: (val: string) => val ? new Date(val).toLocaleDateString() : "—"
          },
          {
            key: "items", label: "Items Count", align: "right" as const,
            render: (items: any[]) => items?.length || 0
          },
        ];
        break;
      default:
        columns = [
          { key: "id", label: "ID" },
          {
            key: "created_at", label: "Date",
            render: (val: string) => val ? new Date(val).toLocaleDateString() : "—"
          },
        ];
        break;
    }

    const exportColumns = columns.map(c => ({ key: c.key, label: c.label }));

    return (
      <>
        <div className="flex justify-between items-center mb-3">
          <Typography variant="small" className="font-semibold text-blue-gray-700">
            {inventorySubTypes.find(s => s.id === subType)?.label || "Inventory Data"}
          </Typography>
          <ReportExport data={exportData} columns={exportColumns} filename="inventory_report" title="Inventory Report" />
        </div>
        <ReportTable columns={columns} data={data} />
      </>
    );
  };

  return (
    <div>
      {/* Sub-type tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {inventorySubTypes.map((st) => (
          <button
            key={st.id}
            onClick={() => onSubTypeChange(st.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${subType === st.id
              ? "bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/25"
              : "bg-blue-gray-50 text-blue-gray-700 hover:bg-blue-gray-100"
              }`}
          >
            {st.label}
          </button>
        ))}
      </div>

      {renderTable()}
    </div>
  );
}

// ══════════════════════════════════════════
// ——— Main Reports Page ———
// ══════════════════════════════════════════

export default function Reports(): JSX.Element {
  const [activeView, setActiveView] = useState<'dashboard' | 'module'>('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPeriod, setCurrentPeriod] = useState<'daily' | 'weekly' | 'month' | 'custom'>('month');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [inventorySubType, setInventorySubType] = useState("inventory-low-stock");

  const [overviewData, setOverviewData] = useState<any>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);

  const { data, loading, error, fetchReport, refresh } = useReportData();

  // Fetch overview data on mount
  useEffect(() => {
    if (!selectedCategory) {
      if (currentPeriod === 'custom') {
        if (customRange.start && customRange.end) {
          loadOverview('custom', customRange.start, customRange.end);
        }
      } else {
        loadOverview(currentPeriod);
      }
    }
  }, [selectedCategory, currentPeriod, customRange]);

  const loadOverview = async (range: string = 'month', start?: string, end?: string) => {
    setOverviewLoading(true);
    try {
      const response = await apiService.getReportsOverview(range === 'custom' ? undefined : range, start, end);
      if (response.success) {
        setOverviewData(response.data);
      }
    } catch (err) {
      console.error("Failed to load overview:", err);
    } finally {
      setOverviewLoading(false);
    }
  };

  const handlePeriodChange = (period: 'daily' | 'weekly' | 'month') => {
    setCurrentPeriod(period);
    setCustomRange({ start: '', end: '' });
  };

  // Get the current default date range (this month)
  const getDefaultRange = useCallback(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      start_date: start.toISOString().split("T")[0],
      end_date: now.toISOString().split("T")[0],
    };
  }, []);

  // When a category is selected, fetch data immediately
  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    setActiveView('module');
    const category = reportCategories.find((c) => c.id === categoryId);
    if (category) {
      fetchReport(category.reportType, getDefaultRange());
    }
  }, [fetchReport, getDefaultRange]);

  const handleFilterChange = useCallback((filters: any) => {
    const category = reportCategories.find((c) => c.id === selectedCategory);
    if (category) {
      const reportType = selectedCategory === "inventory" ? inventorySubType : category.reportType;
      fetchReport(reportType, filters);
    }
  }, [selectedCategory, inventorySubType, fetchReport]);

  const handleInventorySubTypeChange = useCallback((type: string) => {
    setInventorySubType(type);
    fetchReport(type, getDefaultRange());
  }, [fetchReport, getDefaultRange]);

  const handleBackToDashboard = () => {
    setActiveView('dashboard');
    setSelectedCategory(null);
  };

  // ——— Analytical Center View ———
  if (activeView === 'dashboard') {
    return (
      <div className="mt-8 space-y-8 print:m-0 print:p-0">
        <style dangerouslySetInnerHTML={{
          __html: `
          @media print {
            nav, aside, footer, .no-print, button, .button-group {
              display: none !important;
            }
            body { background: white !important; margin: 0 !important; padding: 0 !important; }
            .print-only { display: block !important; }
            .grid { display: block !important; }
            .grid > div { width: 100% !important; margin-bottom: 2rem !important; page-break-inside: avoid; }
            canvas { max-width: 100% !important; height: auto !important; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            .Card { box-shadow: none !important; border: 1px solid #eee !important; }
          }
        `}} />

        {/* Print-Only Professional Header */}
        <div className="hidden print:flex flex-col gap-4 mb-10 border-b-2 border-indigo-600 pb-8">
          <div className="flex justify-between items-end">
            <div className="flex items-center gap-5">
              <div className="h-20 w-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-indigo-100">
                MT
              </div>
              <div>
                <Typography variant="h2" color="blue-gray" className="font-black tracking-tight leading-none mb-2">
                  MediTrust <span className="text-indigo-600">Health Hub</span>
                </Typography>
                <Typography variant="small" className="text-blue-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                  Operational Intelligence & Performance Audit Report
                </Typography>
              </div>
            </div>
            <div className="text-right">
              <Typography variant="small" className="text-blue-gray-400 font-bold text-[10px] uppercase mb-1">Generated On</Typography>
              <Typography variant="h5" color="blue-gray" className="font-extrabold">{new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}</Typography>
            </div>
          </div>
        </div>

        {/* 1. Global Command Filter Bar */}
        <div className="sticky top-[80px] z-40 bg-white/80 backdrop-blur-xl border border-blue-gray-50 p-4 rounded-3xl shadow-xl shadow-blue-gray-900/5 flex flex-wrap items-center justify-between gap-4 no-print">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-500 shadow-lg shadow-blue-500/20">
              <ChartPieIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <Typography variant="h5" color="blue-gray" className="font-extrabold tracking-tight leading-none">
                Analytics Command Center
              </Typography>
              <Typography variant="small" className="text-blue-gray-400 font-bold uppercase text-[9px] tracking-widest mt-1">
                System-wide Operational Intelligence
              </Typography>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-blue-gray-50/50 p-1.5 rounded-2xl border border-blue-gray-100">
              <Button
                variant={currentPeriod === 'daily' ? 'gradient' : 'text'}
                color={currentPeriod === 'daily' ? 'indigo' : 'blue-gray'}
                size="sm"
                className="rounded-xl text-[11px] font-bold px-4 hover:bg-white hover:shadow-sm"
                onClick={() => handlePeriodChange('daily')}
              >
                Daily
              </Button>
              <Button
                variant={currentPeriod === 'weekly' ? 'gradient' : 'text'}
                color={currentPeriod === 'weekly' ? 'indigo' : 'blue-gray'}
                size="sm"
                className="rounded-xl text-[11px] font-bold px-4 hover:bg-white hover:shadow-sm"
                onClick={() => handlePeriodChange('weekly')}
              >
                Weekly
              </Button>
              <Button
                variant={currentPeriod === 'month' ? 'gradient' : 'text'}
                color={currentPeriod === 'month' ? 'indigo' : 'blue-gray'}
                size="sm"
                className="rounded-xl text-[11px] font-bold px-6 shadow-md"
                onClick={() => handlePeriodChange('month')}
              >
                This Month
              </Button>
            </div>
            <div className="h-8 w-px bg-blue-gray-100 hidden md:block" />

            <Popover placement="bottom-end">
              <PopoverHandler>
                <Button
                  size="sm"
                  variant={currentPeriod === 'custom' ? 'gradient' : 'outlined'}
                  color={currentPeriod === 'custom' ? 'indigo' : 'blue-gray'}
                  className="rounded-xl flex items-center gap-2 border-blue-gray-100 bg-white shadow-sm normal-case"
                >
                  <CalendarDaysIcon className="h-4 w-4" />
                  {currentPeriod === 'custom' && customRange.start ? `${customRange.start} - ${customRange.end}` : 'Custom Range'}
                </Button>
              </PopoverHandler>
              <PopoverContent className="w-80 p-4 rounded-3xl border-blue-gray-50 shadow-2xl z-50">
                <Typography variant="small" color="blue-gray" className="font-bold mb-4">Select Date Range</Typography>
                <div className="space-y-4">
                  <Input
                    type="date"
                    label="Start Date"
                    value={customRange.start}
                    onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                    onPointerEnterCapture={() => { }}
                    onPointerLeaveCapture={() => { }}
                    crossOrigin=""
                  />
                  <Input
                    type="date"
                    label="End Date"
                    value={customRange.end}
                    onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
                    onPointerEnterCapture={() => { }}
                    onPointerLeaveCapture={() => { }}
                    crossOrigin=""
                  />
                  <Button
                    variant="gradient"
                    color="indigo"
                    fullWidth
                    size="sm"
                    disabled={!customRange.start || !customRange.end}
                    onClick={() => setCurrentPeriod('custom')}
                  >
                    Apply Range
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <Button size="sm" color="indigo" className="rounded-xl flex items-center gap-2 shadow-sm" onClick={() => loadOverview(currentPeriod === 'custom' ? 'custom' : currentPeriod, customRange.start, customRange.end)}>
              <ArrowPathIcon className={`h-4 w-4 ${overviewLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        {overviewLoading ? <SkeletonDashboard /> : overviewData ? (
          <>
            {/* 2. Compact KPI Summary Bar */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <CompactKPI
                title="Total Revenue"
                value={fmtCurrency(overviewData.kpis.revenue.value)}
                trend={overviewData.kpis.revenue.trend}
                sparkline={overviewData.kpis.revenue.sparkline}
                icon={CurrencyDollarIcon}
                color="green"
              />
              <CompactKPI
                title="Appointments"
                value={fmt(overviewData.kpis.appointments.value)}
                trend={overviewData.kpis.appointments.trend}
                sparkline={overviewData.kpis.appointments.sparkline}
                icon={CalendarDaysIcon}
                color="blue"
              />
              <CompactKPI
                title="Patient Visits"
                value={fmt(overviewData.kpis.patients.value)}
                trend={overviewData.kpis.patients.trend}
                sparkline={overviewData.kpis.patients.sparkline}
                icon={UserGroupIcon}
                color="purple"
              />
              <Card className="border border-blue-gray-50/50 shadow-sm bg-gradient-to-br from-indigo-50 to-white overflow-hidden">
                <CardBody className="p-4 flex flex-col justify-between h-full">
                  <div className="flex items-center gap-1.5 opacity-70 mb-2">
                    <ChartBarIcon className="h-4 w-4 text-indigo-500" />
                    <Typography variant="small" className="text-[10px] font-extrabold uppercase tracking-widest text-blue-gray-400">
                      Collection Ratio
                    </Typography>
                  </div>
                  <div className="flex items-end justify-between gap-2">
                    <Typography variant="h3" color="blue-gray" className="font-extrabold leading-none tracking-tight">
                      {overviewData.kpis.collections.ratio}%
                    </Typography>
                    <div className="text-right">
                      <Typography variant="small" className="text-[10px] font-bold text-blue-gray-400">PENDING</Typography>
                      <Typography variant="small" className="text-xs font-bold text-rose-500">{fmtCurrency(overviewData.kpis.collections.pending)}</Typography>
                    </div>
                  </div>
                </CardBody>
              </Card>
              <Card className="border border-blue-gray-50/50 shadow-sm bg-white overflow-hidden">
                <CardBody className="p-4 flex flex-col justify-between h-full">
                  <div className="flex items-center gap-1.5 opacity-70 mb-2">
                    <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-500" />
                    <Typography variant="small" className="text-[10px] font-extrabold uppercase tracking-widest text-blue-gray-400">
                      Avg. Billing
                    </Typography>
                  </div>
                  <Typography variant="h4" color="blue-gray" className="font-extrabold leading-none tracking-tight">
                    {fmtCurrency(overviewData.kpis.revenue.value / (overviewData.kpis.appointments.value || 1))}
                  </Typography>
                  <Typography variant="small" className="text-[10px] text-blue-gray-400 font-bold mt-1">PER APPOINTMENT</Typography>
                </CardBody>
              </Card>
            </div>

            {/* 3. Core Analytics Grid (Revenue & Operations) */}
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <ReportChart
                  type="area"
                  title="Revenue Velocity"
                  description="Real-time revenue inflow vs historical averages"
                  series={[{ name: "Actual Revenue", data: overviewData.charts.revenue_trend.map((t: any) => t.y) }]}
                  options={{
                    xaxis: {
                      categories: overviewData.charts.revenue_trend.map((t: any) =>
                        new Date(t.x).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
                      )
                    },
                    colors: ['#10b981'],
                    stroke: { width: 3, curve: 'smooth' },
                    grid: { borderColor: '#f1f5f9' }
                  }}
                  height={380}
                />
              </div>

              <div className="space-y-6">
                <ReportChart
                  type="donut"
                  title="Revenue Breakdown"
                  description="Distribution by service/method"
                  series={overviewData.charts.revenue_methods.map((m: any) => parseFloat(m.total))}
                  options={{
                    labels: overviewData.charts.revenue_methods.map((m: any) => m.payment_method || 'Other'),
                    colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
                    legend: { position: 'bottom', fontSize: '12px', fontWeight: 600 }
                  }}
                  height={380}
                />
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <ReportChart
                type="pie"
                title="Patient Demographics"
                description="Gender split of registered patients"
                series={overviewData.charts.patient_gender.map((g: any) => g.count)}
                options={{
                  labels: overviewData.charts.patient_gender.map((g: any) => g.gender || 'Not Specified'),
                  colors: ['#8b5cf6', '#ec4899', '#3b82f6'],
                  legend: { position: 'bottom' }
                }}
                height={320}
              />

              <div className="lg:col-span-2">
                <ReportChart
                  type="bar"
                  title="Top Care Providers"
                  description="Workload distribution by specialist"
                  series={[{ name: "Appointments", data: overviewData.charts.top_performers.map((d: any) => d.count) }]}
                  options={{
                    xaxis: { categories: overviewData.charts.top_performers.map((d: any) => d.name) },
                    colors: ['#3b82f6'],
                    plotOptions: { bar: { borderRadius: 8, columnWidth: '40%' } }
                  }}
                  height={320}
                />
              </div>
            </div>

            {/* 4. Financial & Alerts Panel Row */}
            {/* 4. Operational Control Deck (Unified Pulse & Quick Controls) */}
            <Card className="border border-blue-gray-50 shadow-sm overflow-hidden bg-white">
              <CardHeader
                floated={false}
                shadow={false}
                className="mx-0 mt-0 p-6 pb-4 bg-transparent border-b border-blue-gray-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Typography variant="h6" color="blue-gray" className="font-extrabold flex items-center gap-2">
                      <ShieldCheckIcon className="h-5 w-5 text-indigo-500" />
                      Operational Control Deck
                    </Typography>
                    <div className="flex items-center gap-2">
                      <Chip value="Live System Pulse" size="sm" variant="ghost" color="indigo" className="rounded-full lowercase font-bold text-[10px]" />
                      <Typography variant="small" className="text-[10px] text-blue-gray-300 font-bold uppercase tracking-tighter">
                        Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </div>
                  </div>
                  <Typography variant="small" className="text-blue-gray-400 font-medium text-[11px]">
                    Command-level oversight of hospital logistics, finances, and workload.
                  </Typography>
                </div>

                <div className="flex items-center gap-2 bg-blue-gray-50/30 p-1.5 rounded-2xl border border-blue-gray-100 no-print">
                  <Button
                    variant="gradient"
                    color="indigo"
                    size="sm"
                    className="rounded-xl flex items-center gap-2 text-[11px] font-bold shadow-indigo-100 shadow-lg hover:shadow-xl transition-all px-6 py-2.5 active:scale-95 group overflow-hidden relative"
                    onClick={() => window.print()}
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
                    <ArrowPathIcon className="h-4 w-4 animate-pulse group-hover:rotate-180 transition-transform duration-500" />
                    EXPORT DASHBOARD (PDF)
                  </Button>
                  <div className="w-[1px] h-4 bg-blue-gray-100" />
                  <Button
                    variant="text"
                    size="sm"
                    className="rounded-xl flex items-center gap-2 text-[11px] font-bold text-indigo-600 hover:bg-white hover:shadow-sm transition-all px-4"
                    onClick={() => alert("Report Scheduling Service will be integrated in the next update.")}
                  >
                    <CalendarDaysIcon className="h-4 w-4" />
                    Schedule Email
                  </Button>
                </div>
              </CardHeader>
              <CardBody className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Alert 1: Inventory */}
                  <div
                    className="group relative p-5 rounded-[2rem] bg-gradient-to-br from-white to-red-50/10 border border-blue-gray-50 hover:border-red-100 transition-all duration-300 cursor-pointer active:scale-95"
                    onClick={() => handleCategorySelect('inventory')}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 rounded-2xl bg-red-50 text-red-500 group-hover:scale-110 transition-transform">
                        <CubeIcon className="h-6 w-6" />
                      </div>
                      <Chip value="Action Required" size="sm" variant="ghost" color="red" className="rounded-full lowercase font-bold text-[9px]" />
                    </div>
                    <Typography variant="h3" color="red" className="font-extrabold mb-1">{overviewData.alerts.low_inventory}</Typography>
                    <Typography variant="small" className="text-[10px] font-bold text-blue-gray-400 uppercase tracking-widest mb-1">Low Inventory Items</Typography>
                    <div className="flex items-center gap-1.5 mt-4 text-[10px] font-extrabold text-red-600 bg-red-50/50 p-2 rounded-xl w-fit">
                      <ExclamationCircleIcon className="h-3 w-3" />
                      SYSTEM REORDER ALERT
                    </div>
                  </div>

                  {/* Alert 2: Billing */}
                  <div
                    className="group relative p-5 rounded-[2rem] bg-gradient-to-br from-white to-orange-50/10 border border-blue-gray-50 hover:border-orange-100 transition-all duration-300 cursor-pointer active:scale-95"
                    onClick={() => handleCategorySelect('revenue')}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 rounded-2xl bg-orange-50 text-orange-500 group-hover:scale-110 transition-transform">
                        <TableCellsIcon className="h-6 w-6" />
                      </div>
                      <Chip value="Verification" size="sm" variant="ghost" color="orange" className="rounded-full lowercase font-bold text-[9px]" />
                    </div>
                    <Typography variant="h3" color="orange" className="font-extrabold mb-1">{overviewData.alerts.pending_bills}</Typography>
                    <Typography variant="small" className="text-[10px] font-bold text-blue-gray-400 uppercase tracking-widest mb-1">Unpaid Patient Bills</Typography>
                    <div className="flex items-center gap-1.5 mt-4 text-[10px] font-extrabold text-orange-600 bg-orange-50/50 p-2 rounded-xl w-fit">
                      <CurrencyDollarIcon className="h-3 w-3" />
                      PENDING CLEARANCE
                    </div>
                  </div>

                  {/* Alert 3: Appointments */}
                  <div
                    className="group relative p-5 rounded-[2rem] bg-gradient-to-br from-white to-blue-50/10 border border-blue-gray-50 hover:border-blue-100 transition-all duration-300 cursor-pointer active:scale-95"
                    onClick={() => handleCategorySelect('appointments')}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 rounded-2xl bg-blue-50 text-blue-500 group-hover:scale-110 transition-transform">
                        <CalendarDaysIcon className="h-6 w-6" />
                      </div>
                      <Chip value="Active Load" size="sm" variant="ghost" color="blue" className="rounded-full lowercase font-bold text-[9px]" />
                    </div>
                    <Typography variant="h3" color="blue" className="font-extrabold mb-1">{overviewData.alerts.today_appointments}</Typography>
                    <Typography variant="small" className="text-[10px] font-bold text-blue-gray-400 uppercase tracking-widest mb-1">Consultations Today</Typography>
                    <div className="flex items-center gap-1.5 mt-4 text-[10px] font-extrabold text-blue-600 bg-blue-50/50 p-2 rounded-xl w-fit">
                      <UsersIcon className="h-3 w-3" />
                      CLINICAL FLOW STATUS
                    </div>
                  </div>

                  {/* CTA 4: Analytics Module Switcher */}
                  <div
                    className="p-5 rounded-[2rem] bg-indigo-600 shadow-xl shadow-indigo-500/20 text-white cursor-pointer hover:bg-indigo-700 transition-all active:scale-95 flex flex-col justify-between group"
                    onClick={() => document.getElementById('report-explorer')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <div className="flex justify-between items-start">
                      <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md group-hover:scale-110 transition-transform">
                        <ArrowTrendingUpIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="p-1 rounded-lg bg-white/20">
                        <ArrowRightIcon className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div>
                      <Typography variant="h3" className="font-extrabold leading-none mb-1">Explorer</Typography>
                      <Typography variant="small" className="text-indigo-100 font-bold text-[10px] uppercase tracking-widest italic opacity-80 group-hover:opacity-100">
                        Detailed Reports Hub &rsaquo;
                      </Typography>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* 4.5. Strategic Intelligence Hub (Bridging the Gap) */}
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2 border border-blue-gray-50 shadow-sm bg-white overflow-hidden">
                <CardHeader floated={false} shadow={false} className="p-6 pb-0 bg-transparent flex items-center justify-between">
                  <div>
                    <Typography variant="h6" color="blue-gray" className="font-extrabold flex items-center gap-2">
                      <ChartBarIcon className="h-5 w-5 text-indigo-500" />
                      Appointment Outcome Analysis
                    </Typography>
                    <Typography variant="small" className="text-blue-gray-400 font-medium text-[11px]">
                      Efficiency breakdown by clinical status for the current period
                    </Typography>
                  </div>
                  <Chip value="Operational Health" size="sm" variant="ghost" color="green" className="rounded-full lowercase font-bold" />
                </CardHeader>
                <CardBody className="p-6 pt-0">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="w-full md:w-1/2">
                      <ReportChart
                        type="donut"
                        noCard
                        series={overviewData.charts.appointment_status.map((s: any) => s.count)}
                        options={{
                          labels: overviewData.charts.appointment_status.map((s: any) => s.status.toUpperCase()),
                          colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
                          legend: { show: false },
                          plotOptions: { pie: { donut: { size: '75%', labels: { show: true, total: { show: true, label: 'TOTAL', fontSize: '12px', fontWeight: 800 } } } } }
                        }}
                        height={250}
                      />
                    </div>
                    <div className="w-full md:w-1/2 space-y-4">
                      {overviewData.charts.appointment_status.map((s: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-blue-gray-50/50 border border-transparent hover:border-blue-gray-100 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`h-2.5 w-2.5 rounded-full ${idx === 0 ? 'bg-blue-500' : idx === 1 ? 'bg-emerald-500' : idx === 2 ? 'bg-amber-500' : 'bg-rose-500'}`} />
                            <Typography variant="small" className="font-bold text-blue-gray-700 uppercase text-[10px] tracking-wider">{s.status}</Typography>
                          </div>
                          <Typography variant="small" className="font-extrabold text-blue-gray-900">{s.count}</Typography>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card className="border border-blue-gray-50 shadow-sm bg-white overflow-hidden flex flex-col justify-between">
                <CardHeader floated={false} shadow={false} className="p-6 pb-2 bg-transparent">
                  <Typography variant="h6" color="blue-gray" className="font-extrabold flex items-center gap-2">
                    <CurrencyDollarIcon className="h-5 w-5 text-emerald-500" />
                    Collection Integrity
                  </Typography>
                  <Typography variant="small" className="text-blue-gray-400 font-medium text-[11px]">
                    Recovery ratio for billed amount
                  </Typography>
                </CardHeader>
                <CardBody className="p-6 pt-0 flex flex-col justify-center items-center flex-grow">
                  <div className="relative h-32 w-32 mb-6">
                    <svg className="h-32 w-32 transform -rotate-90">
                      <circle className="text-blue-gray-100" strokeWidth="10" stroke="currentColor" fill="transparent" r="50" cx="64" cy="64" />
                      <circle
                        className="text-emerald-500 transition-all duration-1000"
                        strokeWidth="10"
                        strokeDasharray={314.159}
                        strokeDashoffset={314.159 * (1 - overviewData.kpis.collections.ratio / 100)}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="50"
                        cx="64"
                        cy="64"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Typography variant="h4" className="font-black text-emerald-600">{overviewData.kpis.collections.ratio}%</Typography>
                      <Typography variant="small" className="text-[9px] font-bold text-blue-gray-400 uppercase tracking-tighter">Recovered</Typography>
                    </div>
                  </div>
                  <div className="w-full space-y-3">
                    <div className="flex justify-between items-end">
                      <Typography variant="small" className="text-[10px] font-bold text-blue-gray-400">TOTAL BILLED</Typography>
                      <Typography variant="small" className="font-extrabold text-blue-gray-900">{fmtCurrency(overviewData.kpis.collections.collected + overviewData.kpis.collections.pending)}</Typography>
                    </div>
                    <div className="h-1.5 w-full bg-blue-gray-50 rounded-full overflow-hidden flex">
                      <div className="h-full bg-emerald-500" style={{ width: `${overviewData.kpis.collections.ratio}%` }} />
                      <div className="h-full bg-amber-200" style={{ width: `${100 - overviewData.kpis.collections.ratio}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] font-extrabold">
                      <span className="text-emerald-600">COLLECTED: {fmtCurrency(overviewData.kpis.collections.collected)}</span>
                      <span className="text-amber-700">DUE: {fmtCurrency(overviewData.kpis.collections.pending)}</span>
                    </div>
                  </div>
                </CardBody>
                <div className="p-4 bg-emerald-50/50 border-t border-emerald-50">
                  <Typography variant="small" className="text-[9px] font-bold text-emerald-800 uppercase tracking-widest text-center">
                    Financial Health: {overviewData.kpis.collections.ratio > 80 ? 'EXCELLENT' : overviewData.kpis.collections.ratio > 60 ? 'STABLE' : 'CRITICAL ACTION'}
                  </Typography>
                </div>
              </Card>
            </div>

            {/* 4.7. Operations Intelligence Monitoring (Granular Efficiency) */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Critical Watchlist: Low Stock Items */}
              <Card className="lg:col-span-2 border border-blue-gray-50 shadow-sm bg-white overflow-hidden">
                <CardHeader floated={false} shadow={false} className="p-6 pb-2 bg-transparent flex items-center justify-between">
                  <div>
                    <Typography variant="h6" color="blue-gray" className="font-extrabold flex items-center gap-2">
                      <CubeIcon className="h-5 w-5 text-rose-500" />
                      Critical Inventory Watchlist
                    </Typography>
                    <Typography variant="small" className="text-blue-gray-400 font-medium text-[11px]">
                      Top 5 urgent reorder items based on current stock levels
                    </Typography>
                  </div>
                  <Button
                    variant="text"
                    size="sm"
                    color="blue-gray"
                    className="flex items-center gap-2 rounded-xl text-[10px] font-bold"
                    onClick={() => handleCategorySelect('inventory')}
                  >
                    View All Inventory
                    <ArrowRightIcon className="h-3 w-3" />
                  </Button>
                </CardHeader>
                <CardBody className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[500px] table-auto">
                      <thead>
                        <tr className="bg-blue-gray-50/50">
                          {['Item Name', 'Category', 'Current', 'Min Level', 'Status'].map((head) => (
                            <th key={head} className="p-4 text-left border-b border-blue-gray-50">
                              <Typography variant="small" className="text-[10px] font-black text-blue-gray-400 uppercase tracking-widest">{head}</Typography>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {overviewData.alerts.low_inventory_items?.map((item: any, idx: number) => (
                          <tr key={idx} className="hover:bg-blue-gray-50/30 transition-colors">
                            <td className="p-4 border-b border-blue-gray-50">
                              <Typography variant="small" color="blue-gray" className="font-bold">{item.name}</Typography>
                            </td>
                            <td className="p-4 border-b border-blue-gray-50">
                              <Chip value={item.category?.name || 'General'} size="sm" variant="ghost" className="rounded-full text-[9px] lowercase font-bold" />
                            </td>
                            <td className="p-4 border-b border-blue-gray-50">
                              <Typography variant="small" className="font-extrabold text-blue-900">{item.current_stock}</Typography>
                            </td>
                            <td className="p-4 border-b border-blue-gray-50">
                              <Typography variant="small" className="font-bold text-blue-gray-400">{item.min_stock_level}</Typography>
                            </td>
                            <td className="p-4 border-b border-blue-gray-50">
                              <div className="flex items-center gap-1.5 text-[10px] font-black text-rose-600 uppercase italic">
                                <ExclamationCircleIcon className="h-3.5 w-3.5" />
                                CRITICAL
                              </div>
                            </td>
                          </tr>
                        ))}
                        {(!overviewData.alerts.low_inventory_items || overviewData.alerts.low_inventory_items.length === 0) && (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-blue-gray-300 italic text-sm">No critical inventory alerts at this time.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardBody>
              </Card>

              {/* Departmental Revenue Distribution */}
              <Card className="border border-blue-gray-50 shadow-sm bg-white overflow-hidden">
                <CardHeader floated={false} shadow={false} className="p-6 pb-2 bg-transparent">
                  <Typography variant="h6" color="blue-gray" className="font-extrabold flex items-center gap-2">
                    <ChartPieIcon className="h-5 w-5 text-indigo-500" />
                    Department Distribution
                  </Typography>
                  <Typography variant="small" className="text-blue-gray-400 font-medium text-[11px]">
                    Revenue weightage by department
                  </Typography>
                </CardHeader>
                <CardBody className="p-6 pt-0 flex flex-col justify-between h-full">
                  <ReportChart
                    type="pie"
                    noCard
                    series={overviewData.charts.revenue_by_dept.map((d: any) => parseFloat(d.total))}
                    options={{
                      labels: overviewData.charts.revenue_by_dept.map((d: any) => d.name),
                      colors: ['#4f46e5', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
                      legend: { position: 'bottom', fontSize: '10px', fontWeight: 600 },
                      stroke: { width: 0 }
                    }}
                    height={280}
                  />
                  <div className="mt-4 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/50">
                    <Typography variant="small" className="text-[10px] font-bold text-indigo-900 uppercase tracking-widest mb-1">Top Contributor</Typography>
                    <div className="flex justify-between items-center">
                      <Typography variant="h6" color="indigo" className="font-extrabold">{overviewData.charts.revenue_by_dept[0]?.name || 'N/A'}</Typography>
                      <Typography variant="small" className="font-black text-indigo-600">{fmtCurrency(overviewData.charts.revenue_by_dept[0]?.total || 0)}</Typography>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* 5. Report Explorer (Original 6 Category Cards, Redesigned) */}
            <div id="report-explorer" className="pt-10 border-t border-blue-gray-50/50">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-8 w-1.5 bg-indigo-600 rounded-full" />
                <div>
                  <Typography variant="h5" color="blue-gray" className="font-extrabold tracking-tight">
                    Report Modules Explorer
                  </Typography>
                  <Typography variant="small" className="text-blue-gray-400 font-medium">
                    Select a category to deep-dive into detailed analytical data and tables
                  </Typography>
                </div>
              </div>
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                {reportCategories.map((cat) => (
                  <Card
                    key={cat.id}
                    className="group border border-blue-gray-50 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1.5 transition-all duration-500 cursor-pointer overflow-hidden rounded-[2rem] bg-white/80 backdrop-blur-sm"
                    onClick={() => handleCategorySelect(cat.id)}
                  >
                    <CardBody className="p-6">
                      <div className="flex justify-between items-center mb-5 relative">
                        <div className={`p-4 rounded-2xl bg-gradient-to-br ${cat.gradient} shadow-md ${cat.shadowColor} group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 z-10 relative`}>
                          {React.createElement(cat.icon, { className: "h-6 w-6 text-white" })}
                        </div>

                        {/* Interactive Visual Path: Inspired by User Request */}
                        <div className="absolute left-16 right-12 h-[1px] bg-blue-gray-100/30 no-print overflow-hidden group-hover:overflow-visible">
                          <div className="absolute top-1/2 -translate-y-1/2 left-0 h-4 px-2 rounded-full bg-white border border-blue-gray-100 flex items-center gap-1 shadow-sm opacity-0 group-hover:opacity-100 group-hover:left-[calc(100%-35px)] transition-all duration-700 ease-in-out z-20">
                            <div className={`h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse`} />
                            <span className="text-[7px] font-bold text-blue-gray-600 uppercase tracking-tighter">VIEW</span>
                          </div>
                          <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-indigo-200 to-transparent w-full -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-out`} />
                        </div>

                        <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-blue-gray-50/50 group-hover:bg-indigo-600 group-hover:shadow-lg group-hover:shadow-indigo-200 transition-all duration-300 z-10 relative">
                          <ArrowRightIcon className="h-4 w-4 text-blue-gray-400 group-hover:text-white group-hover:translate-x-1.5 transition-all duration-300" />
                        </div>
                      </div>
                      <Typography variant="h6" color="blue-gray" className="font-extrabold mb-1.5 group-hover:text-indigo-600 transition-colors tracking-tight text-[15px]">
                        {cat.title}
                      </Typography>
                      <Typography variant="small" className="text-blue-gray-400 font-medium leading-relaxed mb-4 text-[11px]">
                        {cat.description}
                      </Typography>
                      <div className="flex items-center gap-1.5 text-indigo-500 transition-all duration-500">
                        <Typography variant="small" className="font-bold text-[9px] uppercase tracking-[0.2em] flex items-center gap-1">
                          EXPLORE MODULE
                          <span className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span>
                        </Typography>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="p-12 text-center text-blue-gray-400">
            Failed to initialize dashboard. Please check your connection.
          </div>
        )}
      </div>
    );
  }

  // ——— Render Individual Report View ———
  const currentCategory = reportCategories.find((c) => c.id === selectedCategory);

  return (
    <div className="mt-8 print:m-0 print:p-0" id="report-print-area">
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          nav, aside, footer, .no-print, button, .button-group, .report-filters {
            display: none !important;
          }
          body { background: white !important; margin: 0 !important; padding: 0 !important; }
          .print-only { display: block !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .Card { box-shadow: none !important; border: 1px solid #eee !important; margin-bottom: 20px !important; }
        }
      `}} />

      {/* Print-Only Header */}
      <div className="hidden print:flex flex-col gap-4 mb-8 border-b-2 border-indigo-600 pb-6">
        <div className="flex justify-between items-end">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">
              MT
            </div>
            <div>
              <Typography variant="h4" color="blue-gray" className="font-black tracking-tight leading-none mb-1">
                MediTrust <span className="text-indigo-600">Health Reports</span>
              </Typography>
              <Typography variant="small" className="text-blue-gray-400 font-bold uppercase tracking-widest text-[9px]">
                Detailed Analytics: {currentCategory?.title}
              </Typography>
            </div>
          </div>
          <div className="text-right">
            <Typography variant="small" className="text-blue-gray-400 font-bold text-[9px] uppercase">Generated On</Typography>
            <Typography variant="h6" color="blue-gray" className="font-extrabold">{new Date().toLocaleString()}</Typography>
          </div>
        </div>
      </div>

      {/* Header with Back button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-2xl border border-blue-gray-100 shadow-sm no-print">
        <div className="flex items-center gap-4">
          <Button
            variant="text"
            size="sm"
            color="blue-gray"
            className="flex items-center gap-1 hover:bg-blue-gray-50 rounded-full"
            onClick={handleBackToDashboard}
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics Center</span>
          </Button>
          <div className="h-8 w-[1px] bg-blue-gray-100 mx-2 hidden sm:block" />
          <div className="flex items-center gap-4 text-left">
            {currentCategory && (
              <div className={`p-3 rounded-2xl bg-gradient-to-r ${currentCategory.gradient} shadow-lg ${currentCategory.shadowColor}`}>
                {React.createElement(currentCategory.icon, { className: "h-6 w-6 text-white" })}
              </div>
            )}
            <div>
              <Typography variant="h4" color="blue-gray" className="font-bold tracking-tight">
                {currentCategory?.title}
              </Typography>
              <Typography variant="small" className="text-blue-gray-500 font-medium">
                Detailed Analytics & Insights
              </Typography>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 no-print">
          <Chip
            variant="ghost"
            color="blue"
            size="sm"
            value="Real-time Data"
            className="rounded-full font-bold uppercase text-[10px]"
          />
        </div>
      </div>

      {/* Filters (Hidden on Print) */}
      <div className="no-print">
        <ReportFilters
          onFilterChange={handleFilterChange}
          onRefresh={refresh}
          loading={loading}
          showDepartmentFilter={selectedCategory === "appointments"}
          showDoctorFilter={selectedCategory === "appointments"}
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-6 mt-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="h-24 bg-blue-gray-50 rounded-2xl animate-pulse" />
            <div className="h-24 bg-blue-gray-50 rounded-2xl animate-pulse" />
            <div className="h-24 bg-blue-gray-50 rounded-2xl animate-pulse" />
            <div className="h-24 bg-blue-gray-50 rounded-2xl animate-pulse" />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="h-80 bg-blue-gray-50 rounded-3xl animate-pulse" />
            <div className="h-80 bg-blue-gray-50 rounded-3xl animate-pulse" />
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card className="border border-red-200 bg-red-50/50 mt-6">
          <CardBody className="p-8 text-center">
            <ExclamationCircleIcon className="h-12 w-12 mx-auto text-red-400 mb-3" />
            <Typography variant="h6" color="red" className="mb-2">
              Failed to Load Report
            </Typography>
            <Typography variant="small" className="text-red-400 mb-4">
              {error}
            </Typography>
            <Button
              size="sm"
              color="red"
              variant="outlined"
              onClick={refresh}
              className="flex items-center gap-2 mx-auto"
            >
              <ArrowPathIcon className="h-4 w-4" />
              Retry
            </Button>
          </CardBody>
        </Card>
      )}

      {/* Report Content */}
      {!loading && !error && data && (
        <div className="mt-6">
          {selectedCategory === "revenue" && <RevenueReport data={data} />}
          {selectedCategory === "appointments" && <AppointmentsReport data={data} />}
          {selectedCategory === "patients" && <PatientsReport data={data} />}
          {selectedCategory === "payments" && <PaymentsReport data={data} />}
          {selectedCategory === "staff" && <StaffReport data={data} />}
          {selectedCategory === "inventory" && (
            <InventoryReport
              data={data}
              subType={inventorySubType}
              onSubTypeChange={handleInventorySubTypeChange}
            />
          )}
        </div>
      )}

      {/* Empty state if no data and not loading */}
      {!loading && !error && !data && (
        <Card className="border border-blue-gray-100 shadow-sm mt-6">
          <CardBody className="p-12 text-center">
            <ChartBarIcon className="h-16 w-16 mx-auto text-blue-gray-300 mb-4" />
            <Typography variant="h5" color="blue-gray" className="mb-2">
              No Data Available
            </Typography>
            <Typography variant="small" className="text-blue-gray-400 mb-4">
              Apply filters to generate results.
            </Typography>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
