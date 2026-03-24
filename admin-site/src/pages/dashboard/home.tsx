import React, { useEffect, useState, useMemo } from "react";
import Chart from "react-apexcharts";
import { Typography, Avatar, Button, Chip, IconButton, Card, CardBody } from "@material-tailwind/react";
import {
  CalendarDaysIcon, UserGroupIcon, CurrencyDollarIcon, ClockIcon, UserPlusIcon,
  ChartBarIcon, ArrowRightIcon, BellIcon, ArrowPathIcon, ShieldCheckIcon,
  ExclamationTriangleIcon, DocumentTextIcon, ClipboardDocumentListIcon,
  UserCircleIcon, CheckCircleIcon, BuildingOfficeIcon, HeartIcon, CogIcon,
  PhotoIcon, UsersIcon, HomeIcon, KeyIcon, BriefcaseIcon, HomeModernIcon,
  ServerStackIcon, BeakerIcon, CubeIcon, PhoneIcon, WifiIcon, SparklesIcon,
  ChartPieIcon, PlusIcon,
} from "@heroicons/react/24/outline";
import { StatisticsChart } from "@/widgets/charts";
import { Link } from "react-router-dom";
import { apiService } from "@/services/api";
import { chartsConfig } from "@/configs";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

// ─── Variants ─────────────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: i * 0.06 } }),
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(v);
const fmtNum = (v: number) => new Intl.NumberFormat("en-US").format(v);

// ─── Loading / Error ──────────────────────────────────────────────────────────
export const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <div className="relative mb-8">
      <div className="h-24 w-24 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
      <div className="absolute inset-0 flex items-center justify-center">
        <HeartIcon className="h-8 w-8 text-blue-600 animate-pulse" />
      </div>
    </div>
    <p className="text-slate-700 font-bold text-lg">Preparing Dashboard</p>
    <p className="text-slate-400 text-sm mt-1 animate-pulse">Loading your workspace…</p>
  </div>
);

const ErrorScreen = ({ msg, retry }: { msg: string; retry: () => void }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
    <div className="p-6 bg-red-50 rounded-3xl mb-6"><ExclamationTriangleIcon className="h-16 w-16 text-red-400" /></div>
    <p className="text-slate-800 font-bold text-xl mb-2">Something went wrong</p>
    <p className="text-slate-500 text-sm max-w-xs mb-8">{msg}</p>
    <button onClick={retry} className="bg-blue-600 text-white font-bold text-sm px-8 py-3 rounded-2xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/25">
      Try Again
    </button>
  </div>
);

// ─── KPI Card — fully self-contained with inline styles ───────────────────────
interface KpiDef {
  label: string;
  value: string | number;
  icon: React.ElementType;
  from: string;
  to: string;
  glow: string;
  badge?: string;
}

const KpiCard = ({ label, value, icon: Icon, from, to, glow, badge }: KpiDef) => (
  <motion.div variants={fadeUp} whileHover={{ y: -6, scale: 1.01 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
    <div
      className="relative overflow-hidden rounded-2xl p-5 h-full"
      style={{ background: `linear-gradient(135deg, ${from}, ${to})`, boxShadow: `0 8px 32px ${glow}` }}
    >
      {/* Decorative orbs */}
      <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full opacity-20" style={{ background: "rgba(255,255,255,0.3)" }} />
      <div className="absolute -right-2 -bottom-4 w-16 h-16 rounded-full opacity-10" style={{ background: "rgba(255,255,255,0.4)" }} />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="p-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)" }}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          {badge && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-xl uppercase tracking-wider"
              style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
              {badge}
            </span>
          )}
        </div>
        <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">{label}</p>
        <p className="text-white font-black text-2xl tracking-tight leading-none">{value}</p>
      </div>
    </div>
  </motion.div>
);

// ─── Section Title ─────────────────────────────────────────────────────────────
const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-100" />
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">{children}</p>
    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-100" />
  </div>
);

// ─── Module Quick Action Card ─────────────────────────────────────────────────
interface ModuleDef {
  label: string;
  desc: string;
  path: string;
  permission: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  accentBorder: string;
}

const ALL_MODULES: ModuleDef[] = [
  { label: "Appointments", desc: "Schedule & manage", path: "/dashboard/appointments", permission: "view-appointments", icon: CalendarDaysIcon, iconBg: "#EFF6FF", iconColor: "#2563EB", accentBorder: "#BFDBFE" },
  { label: "Patients", desc: "Patient records", path: "/dashboard/patients", permission: "view-patients", icon: UserGroupIcon, iconBg: "#EDE9FE", iconColor: "#7C3AED", accentBorder: "#DDD6FE" },
  { label: "Doctors", desc: "Medical staff", path: "/dashboard/doctors", permission: "view-doctors", icon: UsersIcon, iconBg: "#ECFDF5", iconColor: "#059669", accentBorder: "#A7F3D0" },
  { label: "Departments", desc: "Hospital units", path: "/dashboard/departments", permission: "view-departments", icon: BuildingOfficeIcon, iconBg: "#F0FDF4", iconColor: "#16A34A", accentBorder: "#BBF7D0" },
  { label: "Staff", desc: "Manage team", path: "/dashboard/staff", permission: "view-staff", icon: BriefcaseIcon, iconBg: "#F8FAFC", iconColor: "#475569", accentBorder: "#CBD5E1" },
  { label: "Prescriptions", desc: "Issue & manage", path: "/dashboard/prescriptions", permission: "view-prescriptions", icon: DocumentTextIcon, iconBg: "#E8F4FC", iconColor: "#0070C0", accentBorder: "#B3E0FF" },
  { label: "Medical Reports", desc: "Upload and view patient test reports", path: "/dashboard/medical-records", permission: "view-medical-records", icon: ClipboardDocumentListIcon, iconBg: "#FDF4FF", iconColor: "#9333EA", accentBorder: "#E9D5FF" },
  { label: "Billing", desc: "Invoices & payments", path: "/dashboard/billing", permission: "view-billing-finance", icon: CurrencyDollarIcon, iconBg: "#FFFBEB", iconColor: "#D97706", accentBorder: "#FDE68A" },
  { label: "Pharmacy", desc: "Drug management", path: "/dashboard/pharmacy", permission: "view-pharmacy", icon: BeakerIcon, iconBg: "#FFF1F2", iconColor: "#E11D48", accentBorder: "#FECDD3" },
  { label: "Laboratory", desc: "Tests & results", path: "/dashboard/laboratory", permission: "view-laboratory", icon: BeakerIcon, iconBg: "#FFF7ED", iconColor: "#EA580C", accentBorder: "#FED7AA" },
  { label: "Inventory", desc: "Stock management", path: "/dashboard/inventory", permission: "view-inventory", icon: CubeIcon, iconBg: "#F0FDF4", iconColor: "#15803D", accentBorder: "#86EFAC" },
  { label: "Rooms", desc: "Room allocation", path: "/dashboard/rooms", permission: "view-rooms", icon: HomeIcon, iconBg: "#E8F4FC", iconColor: "#0070C0", accentBorder: "#B3E0FF" },
  { label: "Emergency", desc: "Emergency services", path: "/dashboard/emergency", permission: "view-emergency", icon: HeartIcon, iconBg: "#FEF2F2", iconColor: "#DC2626", accentBorder: "#FECACA" },
  { label: "Reports", desc: "Analytics", path: "/dashboard/reports", permission: "view-reports", icon: ChartBarIcon, iconBg: "#E8F4FC", iconColor: "#0070C0", accentBorder: "#B3E0FF" },
  { label: "Settings", desc: "System config", path: "/dashboard/settings", permission: "view-settings", icon: CogIcon, iconBg: "#F8FAFC", iconColor: "#64748B", accentBorder: "#E2E8F0" },
  { label: "Roles", desc: "Manage roles", path: "/dashboard/roles", permission: "view-roles", icon: KeyIcon, iconBg: "#FDF4FF", iconColor: "#A21CAF", accentBorder: "#F0ABFC" },
  { label: "Home Care", desc: "Home care services", path: "/dashboard/home-care", permission: "view-home-care", icon: HomeModernIcon, iconBg: "#F0FDFA", iconColor: "#0F766E", accentBorder: "#99F6E4" },
  { label: "Services", desc: "Hospital services", path: "/dashboard/services", permission: "view-services", icon: ServerStackIcon, iconBg: "#FFF7ED", iconColor: "#C2410C", accentBorder: "#FED7AA" },
  { label: "Patient Reports", desc: "Detailed reports", path: "/dashboard/patient-reports", permission: "view-patient-reports", icon: ChartBarIcon, iconBg: "#E8F4FC", iconColor: "#0070C0", accentBorder: "#B3E0FF" },
  { label: "Gallery", desc: "Media gallery", path: "/dashboard/gallery", permission: "view-gallery", icon: PhotoIcon, iconBg: "#FEFCE8", iconColor: "#CA8A04", accentBorder: "#FEF08A" },
  { label: "Contact", desc: "Inquiries & feedback", path: "/dashboard/contact-inquiries", permission: "view-contact-inquiries", icon: PhoneIcon, iconBg: "#E8F4FC", iconColor: "#0070C0", accentBorder: "#B3E0FF" },
];

const ModuleCard = ({ mod }: { mod: ModuleDef }) => (
  <motion.div variants={fadeUp} whileHover={{ y: -4, scale: 1.02 }} transition={{ type: "spring", stiffness: 350, damping: 22 }}>
    <Link to={mod.path}>
      <div className="bg-white rounded-2xl p-4 flex flex-col items-center gap-3 cursor-pointer transition-all duration-200 h-full"
        style={{ border: `1px solid ${mod.accentBorder}`, boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
        <div className="p-3 rounded-2xl" style={{ background: mod.iconBg }}>
          <mod.icon className="h-6 w-6" style={{ color: mod.iconColor }} />
        </div>
        <div className="text-center">
          <p className="text-xs font-bold text-slate-800 leading-tight">{mod.label}</p>
          <p className="text-[10px] font-medium mt-0.5" style={{ color: "#94a3b8" }}>{mod.desc}</p>
        </div>
      </div>
    </Link>
  </motion.div>
);

const QuickModulesGrid = ({ permissions, limit = 12 }: { permissions: string[]; limit?: number }) => {
  const allowed = ALL_MODULES.filter(m => permissions.includes(m.permission)).slice(0, limit);
  if (!allowed.length) return null;
  return (
    <motion.section variants={fadeUp}>
      <SectionTitle>Quick Access</SectionTitle>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
        {allowed.map((mod, i) => <ModuleCard key={i} mod={mod} />)}
      </div>
    </motion.section>
  );
};

// ─── Glass Card ───────────────────────────────────────────────────────────────
const Glass = ({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => (
  <div className={`bg-white rounded-2xl overflow-hidden ${className}`}
    style={{ border: "1px solid rgba(226,232,240,0.8)", boxShadow: "0 4px 24px rgba(15,23,42,0.06)", ...style }}>
    {children}
  </div>
);

// ─── Appointment Row ──────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, { text: string; bg: string; dot: string }> = {
  confirmed:  { text: "#16a34a", bg: "#f0fdf4", dot: "#22c55e" },
  pending:    { text: "#d97706", bg: "#fffbeb", dot: "#fbbf24" },
  cancelled:  { text: "#dc2626", bg: "#fef2f2", dot: "#f87171" },
  completed:  { text: "#0070C0", bg: "#e8f4fc", dot: "#00D2FF" },
};

const AptRow = ({ apt, showDoctor = true, idx = 0 }: { apt: any; showDoctor?: boolean; idx?: number }) => {
  const s = (apt.status || "pending").toLowerCase();
  const sc = STATUS_COLORS[s] || { text: "#64748b", bg: "#f8fafc", dot: "#94a3b8" };
  return (
    <tr className="group hover:bg-slate-50/60 transition-colors" style={{ borderBottom: "1px solid #f8fafc" }}>
      <td className="pl-5 pr-3 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-white flex-shrink-0"
            style={{ background: `hsl(${(idx * 47 + 200) % 360}, 60%, 55%)` }}>
            {(apt.patient_name || "P").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-800 leading-none capitalize truncate max-w-[90px]">{apt.patient_name || "—"}</p>
            <p className="text-[9px] text-slate-400 font-medium mt-0.5">#{apt.id}</p>
          </div>
        </div>
      </td>
      {showDoctor && (
        <td className="px-3 py-3">
          <div className="flex items-center gap-2">
            <Avatar
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(apt.doctor?.last_name || "D")}&background=6366f1&color=fff&size=28`}
              size="xs" className="rounded-lg flex-shrink-0 !w-7 !h-7"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-700 leading-none truncate max-w-[80px]">Dr. {apt.doctor?.last_name || "—"}</p>
              <p className="text-[9px] text-slate-400 font-medium mt-0.5 truncate max-w-[80px]">{apt.doctor?.department?.name || "—"}</p>
            </div>
          </div>
        </td>
      )}
      <td className="px-3 py-3 whitespace-nowrap">
        <div className="flex items-center gap-1 text-slate-500">
          <ClockIcon className="h-3 w-3 flex-shrink-0" />
          <p className="text-[11px] font-semibold">{apt.appointment_time || "—"}</p>
        </div>
      </td>
      <td className="pl-3 pr-5 py-3">
        <span className="inline-flex items-center gap-1.5 text-[9px] font-black px-2.5 py-1.5 rounded-full capitalize whitespace-nowrap"
          style={{ color: sc.text, background: sc.bg }}>
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: sc.dot }} />
          {apt.status || "pending"}
        </span>
      </td>
    </tr>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════

// Grouped quick links for Admin — organized by category, max 4 per group
const ADMIN_QUICK_GROUPS: { label: string; color: string; items: { label: string; path: string; icon: React.ElementType; iconBg: string; iconColor: string }[] }[] = [
  {
    label: "Patient Care",
    color: "#6366f1",
    items: [
      { label: "Appointments",   path: "/dashboard/appointments",   icon: CalendarDaysIcon,         iconBg: "#EFF6FF", iconColor: "#2563EB" },
      { label: "Patients",       path: "/dashboard/patients",        icon: UserGroupIcon,             iconBg: "#EDE9FE", iconColor: "#7C3AED" },
      { label: "Prescriptions",  path: "/dashboard/prescriptions",   icon: DocumentTextIcon,          iconBg: "#E8F4FC", iconColor: "#0070C0" },
      { label: "Medical Reports", path: "/dashboard/medical-records", icon: ClipboardDocumentListIcon, iconBg: "#FDF4FF", iconColor: "#9333EA" },
    ],
  },
  {
    label: "Hospital Management",
    color: "#0070C0",
    items: [
      { label: "Doctors",      path: "/dashboard/doctors",      icon: UsersIcon,          iconBg: "#ECFDF5", iconColor: "#059669" },
      { label: "Staff",        path: "/dashboard/staff",         icon: BriefcaseIcon,      iconBg: "#F8FAFC", iconColor: "#475569" },
      { label: "Departments",  path: "/dashboard/departments",   icon: BuildingOfficeIcon, iconBg: "#F0FDF4", iconColor: "#16A34A" },
      { label: "Rooms",        path: "/dashboard/rooms",         icon: HomeIcon,           iconBg: "#E8F4FC", iconColor: "#0070C0" },
    ],
  },
  {
    label: "Finance & Supply",
    color: "#d97706",
    items: [
      { label: "Billing",    path: "/dashboard/billing",   icon: CurrencyDollarIcon, iconBg: "#FFFBEB", iconColor: "#D97706" },
      { label: "Inventory",  path: "/dashboard/inventory", icon: CubeIcon,           iconBg: "#F0FDF4", iconColor: "#15803D" },
      { label: "Pharmacy",   path: "/dashboard/pharmacy",  icon: BeakerIcon,         iconBg: "#FFF1F2", iconColor: "#E11D48" },
      { label: "Laboratory", path: "/dashboard/laboratory",icon: BeakerIcon,         iconBg: "#FFF7ED", iconColor: "#EA580C" },
    ],
  },
  {
    label: "System & Reports",
    color: "#7c3aed",
    items: [
      { label: "Reports",   path: "/dashboard/reports",   icon: ChartBarIcon,   iconBg: "#E8F4FC", iconColor: "#0070C0" },
      { label: "Settings",  path: "/dashboard/settings",  icon: CogIcon,        iconBg: "#F8FAFC", iconColor: "#64748B" },
      { label: "Roles",     path: "/dashboard/roles",     icon: KeyIcon,        iconBg: "#FDF4FF", iconColor: "#A21CAF" },
      { label: "Emergency", path: "/dashboard/emergency", icon: HeartIcon,      iconBg: "#FEF2F2", iconColor: "#DC2626" },
    ],
  },
];

function AdminDashboard() {
  const { user, permissions } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [recentPatients, setRecentPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [revenueRange, setRevenueRange] = useState("30D");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => { const t = setInterval(() => setCurrentTime(new Date()), 30000); return () => clearInterval(t); }, []);

  const fetchData = async (isRefresh = false, rangeStr = revenueRange) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      const today = new Date().toISOString().split("T")[0];
      const [ovRes, apRes, ptRes, drRes] = await Promise.all([
        apiService.getDashboardOverview(rangeStr),
        apiService.getAppointments(1, { date_range_start: today, date_range_end: today }),
        apiService.getPatients(1, 5),
        apiService.getDoctors(1, 4),
      ]);
      if (ovRes.success) setOverview(ovRes.data);
      else setError("Failed to load dashboard overview.");
      if (apRes.success) setAppointments(apRes.data?.data || apRes.data || []);
      if (ptRes.success) setRecentPatients(ptRes.data?.data || ptRes.data || []);
      if (drRes.success) setDoctors(drRes.data?.data || drRes.data || []);
    } catch (e: any) { setError(e.message || "Dashboard error."); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const revenueChart = useMemo(() => {
    if (!overview?.charts?.revenue_trend) return null;
    const trend = overview.charts.revenue_trend;
    return {
      type: "area" as const, height: 220,
      series: [{ name: "Revenue", data: trend.map((t: any) => t.y) }],
      options: {
        ...chartsConfig,
        colors: ["#6366f1"],
        stroke: { curve: "smooth", width: 2.5 },
        fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.0, stops: [0, 100] } },
        markers: { size: 0, hover: { size: 5 } },
        xaxis: {
          ...chartsConfig.xaxis,
          categories: trend.map((t: any) => new Date(t.x).toLocaleDateString("en-US", { month: "short", day: "numeric" })),
          axisBorder: { show: false }, axisTicks: { show: false },
          labels: { style: { colors: "#94a3b8", fontSize: "10px", fontWeight: 600 } },
        },
        yaxis: { ...chartsConfig.yaxis, labels: { formatter: (v: number) => `$${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`, style: { colors: "#94a3b8", fontSize: "10px", fontWeight: 600 } } },
        grid: { borderColor: "#f1f5f9", strokeDashArray: 4, padding: { left: 0, right: 0, top: 0, bottom: 0 } },
        tooltip: { y: { formatter: (v: number) => fmtCurrency(v) }, theme: "light" },
      },
    };
  }, [overview]);

  if (loading) return <LoadingScreen />;
  if (error && !overview) return <ErrorScreen msg={error} retry={fetchData} />;

  const { kpis = {}, counts = {}, alerts = {} } = overview || {};
  const hour = currentTime.getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  // Appointment status breakdown
  const apptPending = appointments.filter(a => a.status === "pending").length;
  const apptConfirmed = appointments.filter(a => a.status === "confirmed").length;
  const apptCompleted = appointments.filter(a => a.status === "completed").length;

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger}
      className="min-h-screen py-6 px-4 md:px-6 space-y-7"
      style={{ background: "linear-gradient(160deg, #f8faff 0%, #f0f4ff 40%, #faf8ff 100%)" }}>

      {/* ── Hero Header ── */}
      <motion.section variants={fadeUp}
        className="relative overflow-hidden rounded-3xl p-6 md:p-8"
        style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 70%, #6366f1 100%)", boxShadow: "0 20px 60px rgba(99,102,241,0.35)" }}>
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #a5b4fc, transparent)", transform: "translate(30%, -40%)" }} />
        <div className="absolute bottom-0 left-20 w-48 h-48 rounded-full opacity-5" style={{ background: "radial-gradient(circle, #c7d2fe, transparent)", transform: "translateY(40%)" }} />

        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl"
                style={{ background: "rgba(255,255,255,0.15)", color: "#c7d2fe" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                Admin Dashboard · Live
              </span>
              <span className="text-[10px] font-bold px-2.5 py-1.5 rounded-xl" style={{ background: "rgba(255,255,255,0.1)", color: "#a5b4fc" }}>
                {currentTime.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </span>
            </div>
            <h1 className="text-white font-black text-2xl md:text-3xl tracking-tight leading-tight">
              {greeting}, {user?.name?.split(" ")[0] || "Admin"} 👋
            </h1>
            <p className="mt-1.5 font-medium" style={{ color: "rgba(165,180,252,0.75)", fontSize: "13px" }}>
              Full system access · Hospital Management Console
            </p>

            {/* Inline stats in header */}
            <div className="flex items-center gap-4 mt-5 flex-wrap">
              {[
                { label: "Staff Online", val: counts.staff?.total || 0, icon: "👥" },
                { label: "Beds Available", val: counts.rooms?.available || "—", icon: "🏥" },
                { label: "Pending Bills", val: alerts.pending_bills || 0, icon: "📄" },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.1)" }}>
                  <span className="text-base">{s.icon}</span>
                  <div>
                    <p className="text-white font-black text-sm leading-none">{s.val}</p>
                    <p className="text-[9px] font-bold uppercase tracking-wider mt-0.5" style={{ color: "rgba(165,180,252,0.75)" }}>{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right hidden md:block">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "rgba(165,180,252,0.6)" }}>Local Time</p>
              <p className="text-white font-black text-3xl leading-none tabular-nums">
                {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
              <p className="text-[10px] font-bold mt-1" style={{ color: "rgba(165,180,252,0.5)" }}>
                {currentTime.toLocaleTimeString([], { second: "2-digit" }).split(":")[2] ? "" : ""}
                {currentTime.getSeconds().toString().padStart(2, "0")}s
              </p>
            </div>
            <button onClick={() => fetchData(true)}
              className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
              style={{ background: "rgba(255,255,255,0.15)" }}>
              <ArrowPathIcon className={`h-5 w-5 text-white ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </motion.section>

      {/* ── Primary KPIs (8 cards, 4 per row) ── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label={`${revenueRange} Revenue`} value={fmtCurrency(kpis.revenue?.value || 0)}
          icon={CurrencyDollarIcon} from="#0070C0" to="#002D5A" glow="rgba(0,112,192,0.25)"
          badge={`${(kpis.revenue?.trend ?? 0) >= 0 ? "↑" : "↓"} ${Math.abs(kpis.revenue?.trend || 0)}%`} />
        <KpiCard label={`${revenueRange} Patients`} value={fmtNum(kpis.patients?.value || 0)}
          icon={UserGroupIcon} from="#a855f7" to="#7c3aed" glow="rgba(168,85,247,0.25)" 
          badge={`${(kpis.patients?.trend ?? 0) >= 0 ? "↑" : "↓"} ${Math.abs(kpis.patients?.trend || 0)}%`} />
        <KpiCard label="Active Doctors" value={counts.doctors?.total || 0}
          icon={UsersIcon} from="#10b981" to="#059669" glow="rgba(16,185,129,0.25)" badge="On Duty" />
        <KpiCard label="Today's Appointments" value={kpis.appointments?.today || 0}
          icon={CalendarDaysIcon} from="#f59e0b" to="#d97706" glow="rgba(245,158,11,0.25)" badge="Live" />
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Confirmed Appts" value={apptConfirmed}
          icon={CheckCircleIcon} from="#0070C0" to="#002D5A" glow="rgba(0,112,192,0.25)" badge="Ready" />
        <KpiCard label="Pending Appts" value={apptPending}
          icon={ClockIcon} from="#e11d48" to="#be123c" glow="rgba(225,29,72,0.25)" badge="Action" />
        <KpiCard label="Total Staff" value={counts.staff?.total || 0}
          icon={BriefcaseIcon} from="#7c3aed" to="#6d28d9" glow="rgba(124,58,237,0.25)" badge="Team" />
        <KpiCard label="Low Stock Alerts" value={alerts.low_inventory_items?.length || 0}
          icon={BellIcon} from="#dc2626" to="#b91c1c" glow="rgba(220,38,38,0.25)" badge="Alert" />
      </section>

      {/* ── Analytics & Insights Row ── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Appointment Status Donut */}
        <motion.div variants={fadeUp}>
          <Glass className="h-full flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100">
              <p className="text-slate-900 font-bold text-sm">Appointment Status</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">Today's breakdown</p>
            </div>
            <div className="flex-1 p-4 flex flex-col items-center">
              <Chart
                type="donut"
                height={240}
                series={[
                  Math.max(apptConfirmed, 0),
                  Math.max(apptPending, 0),
                  Math.max(apptCompleted, 0),
                  Math.max(appointments.filter(a => a.status === "cancelled").length, 0),
                ]}
                options={{
                  chart: { toolbar: { show: false } },
                  labels: ["Confirmed", "Pending", "Completed", "Cancelled"],
                  colors: ["#10b981", "#f59e0b", "#6366f1", "#ef4444"],
                  legend: { position: "bottom", fontSize: "11px", fontWeight: 600, fontFamily: "inherit", labels: { colors: "#475569" } },
                  plotOptions: { pie: { donut: { size: "68%", labels: {
                    show: true,
                    total: { show: true, label: "Total", fontSize: "12px", fontWeight: 700, color: "#475569", formatter: () => String(appointments.length) },
                    value: { fontSize: "20px", fontWeight: 800, color: "#1e293b" },
                  } } } },
                  dataLabels: { enabled: false },
                  stroke: { width: 2, colors: ["#fff"] },
                  tooltip: { style: { fontFamily: "inherit" } },
                }}
              />
            </div>
          </Glass>
        </motion.div>

        {/* 7-Day Appointment Trend (spark area) */}
        <motion.div variants={fadeUp}>
          <Glass className="h-full flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100">
              <p className="text-slate-900 font-bold text-sm">7-Day Activity</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">Appointments this week</p>
            </div>
            <div className="flex-1 p-2">
              {(() => {
                const sparkline = overview?.kpis?.appointments?.sparkline || [];
                const last7 = sparkline.length >= 7 ? sparkline.slice(-7) : [0,0,0,0,0,0,0].concat(sparkline).slice(-7);
                
                const days: string[] = [];
                const dayData: number[] = [];
                for (let i = 6; i >= 0; i--) {
                  const d = new Date();
                  d.setDate(d.getDate() - i);
                  days.push(d.toLocaleDateString("en-US", { weekday: "short" }));
                  
                  if (i === 0) {
                     dayData.push(Math.max((overview?.kpis?.appointments?.today || appointments.length), last7[6] || 0));
                  } else {
                     dayData.push(last7[6 - i] || 0);
                  }
                }
                return (
                  <Chart
                    type="bar"
                    height={230}
                    series={[{ name: "Appointments", data: dayData }]}
                    options={{
                      chart: { toolbar: { show: false }, sparkline: { enabled: false } },
                      colors: ["#6366f1"],
                      plotOptions: { bar: { borderRadius: 6, columnWidth: "55%" } },
                      dataLabels: { enabled: false },
                      xaxis: {
                        categories: days,
                        axisBorder: { show: false }, axisTicks: { show: false },
                        labels: { style: { colors: "#94a3b8", fontSize: "10px", fontWeight: 700, fontFamily: "inherit" } },
                      },
                      yaxis: { labels: { style: { colors: "#94a3b8", fontSize: "10px", fontFamily: "inherit" } } },
                      grid: { borderColor: "#f1f5f9", strokeDashArray: 4 },
                      tooltip: { theme: "light", style: { fontFamily: "inherit" } },
                    }}
                  />
                );
              })()}
            </div>
          </Glass>
        </motion.div>

        {/* Hospital Resource Utilization */}
        <motion.div variants={fadeUp}>
          <Glass className="h-full flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100">
              <p className="text-slate-900 font-bold text-sm">Resource Utilization</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">Capacity overview</p>
            </div>
            <div className="flex-1 p-2">
              <Chart
                type="radialBar"
                height={260}
                series={[
                  overview?.charts?.resource_utilization?.beds || 0,
                  overview?.charts?.resource_utilization?.doctors || 0,
                  overview?.charts?.resource_utilization?.staff || 0,
                  overview?.charts?.resource_utilization?.pharmacy || 0
                ]}
                options={{
                  chart: { toolbar: { show: false } },
                  colors: ["#6366f1", "#10b981", "#f59e0b", "#0070C0"],
                  labels: ["Beds", "Doctors", "Staff", "Pharmacy"],
                  plotOptions: {
                    radialBar: {
                      offsetY: 0,
                      hollow: { size: "38%" },
                      track: { background: "#f1f5f9", strokeWidth: "85%", margin: 4 },
                      dataLabels: {
                        name: { fontSize: "10px", fontWeight: 700, fontFamily: "inherit", offsetY: -5 },
                        value: { fontSize: "18px", fontWeight: 800, fontFamily: "inherit", color: "#1e293b", offsetY: 5 },
                        total: { show: true, label: "Avg", fontSize: "12px", fontWeight: 700, color: "#94a3b8",
                          formatter: () => `${overview?.charts?.resource_utilization?.avg || 0}%` },
                      },
                    },
                  },
                  legend: {
                    show: true, position: "bottom", fontFamily: "inherit", fontSize: "11px", fontWeight: 700,
                    labels: { colors: "#64748b" },
                    markers: { width: 8, height: 8, radius: 4 },
                    itemMargin: { horizontal: 8, vertical: 0 },
                  },
                  stroke: { lineCap: "round" },
                  tooltip: { theme: "light" },
                }}
              />
            </div>
          </Glass>
        </motion.div>
      </section>

      {/* ── Revenue Chart + Hospital Insights ── */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Revenue Chart */}
        <motion.div variants={fadeUp} className="xl:col-span-2">
          <Glass className="h-full flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl" style={{ background: "#eef2ff" }}>
                  <ChartBarIcon className="h-5 w-5" style={{ color: "#4f46e5" }} />
                </div>
                <div>
                  <p className="text-slate-900 font-extrabold text-sm">Revenue Analytics</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{revenueRange === "7D" ? "7-Day" : revenueRange === "30D" ? "30-Day" : "90-Day"} Fiscal Performance</p>
                </div>
              </div>
              <div className="flex gap-1.5 p-1.5 rounded-2xl bg-slate-100">
                {["7D", "30D", "90D"].map(p => (
                  <button key={p}
                    onClick={() => { setRevenueRange(p); fetchData(true, p); }}
                    className="px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                    style={p === revenueRange ? { background: "#fff", color: "#4f46e5", boxShadow: "0 4px 12px rgba(79,70,229,0.15)" } : { color: "#64748b" }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 px-4 pt-2">
              {revenueChart ? (
                <StatisticsChart chart={revenueChart} title="" description="" color="white" />
              ) : (
                <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-300">
                  <ChartBarIcon className="h-12 w-12" />
                  <p className="text-sm font-black uppercase tracking-widest">No Data</p>
                </div>
              )}
            </div>
            {/* KPI bar below chart */}
            <div className="px-6 py-5 grid grid-cols-3 gap-6 bg-slate-50/50 border-t border-slate-100">
              {[
                { label: "Beds",  val: `${overview?.charts?.resource_utilization?.beds || 0}%`, pct: overview?.charts?.resource_utilization?.beds || 0, color: "#4f46e5" },
                { label: "Satis.", val: "99.2%", pct: 99.2, color: "#10b981" },
                { label: "Bill.",  val: `${overview?.kpis?.collections?.ratio || 0}%`,  pct: overview?.kpis?.collections?.ratio || 0,  color: "#f59e0b" },
              ].map((s, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1.5 items-end">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter leading-none">{s.label}</p>
                    <p className="text-[10px] font-black leading-none" style={{ color: s.color }}>{s.val}</p>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200 shadow-inner overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${s.pct}%`, background: s.color }} />
                  </div>
                </div>
              ))}
            </div>
          </Glass>
        </motion.div>

        {/* Doctors on duty */}
        {permissions.includes("view-doctors") && (
          <motion.div variants={fadeUp} className="h-full">
            <Glass className="h-full flex flex-col shadow-xl shadow-emerald-500/5 border-emerald-500/10 hover:shadow-emerald-500/10 transition-shadow duration-500">
              <div className="px-5 py-5 flex items-center justify-between relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, #064e3b, #065f46)" }}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-xl" />
                <div className="relative z-10">
                  <p className="text-white font-black text-base tracking-tight leading-none mb-1">On Duty</p>
                  <p className="text-emerald-300 text-[9px] font-black uppercase tracking-widest">Active Staff</p>
                </div>
                <div className="relative z-10 w-9 h-9 rounded-xl flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20">
                  <UsersIcon className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin scrollbar-thumb-emerald-50">
                {doctors.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 gap-3 opacity-20">
                    <UsersIcon className="h-10 w-10 text-slate-400" />
                    <p className="text-xs font-black uppercase tracking-widest">No Active Staff</p>
                  </div>
                ) : doctors.slice(0, 8).map((dr: any, i: number) => (
                  <Link key={i} to="/dashboard/doctors" className="block">
                    <div className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-emerald-50/50 transition-all cursor-pointer group border border-transparent hover:border-emerald-100">
                      <Avatar 
                        src={dr.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(`${dr.first_name} ${dr.last_name}`)}&background=10b981&color=fff&size=40`} 
                        size="sm" className="rounded-xl shadow-sm group-hover:scale-105 transition-transform" 
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-slate-800 truncate leading-none mb-1">Dr. {dr.first_name} {dr.last_name}</p>
                        <p className="text-[10px] text-slate-400 font-bold tracking-tight truncate">{dr.department?.name || dr.specialization || "Clinical"}</p>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0">
                        <div className="px-2.5 py-1 rounded-full border border-emerald-200 bg-emerald-50 shadow-sm flex items-center gap-1.5 transition-colors">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">View</span>
                        </div>
                        <div className="w-8 h-8 rounded-xl bg-green-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 group-hover:bg-emerald-600 transition-colors">
                          <ArrowRightIcon className="h-4 w-4 stroke-[3]" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <Link to="/dashboard/doctors">
                <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between group cursor-pointer hover:bg-emerald-50 transition-colors">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{doctors.length} Active Staff</p>
                  <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                    Staff List
                    <ArrowRightIcon className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </Glass>
          </motion.div>
        )}
      </section>

      {/* ── Appointments + Patients + Finance row ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Appointments */}
        {permissions.includes("view-appointments") && (
          <motion.div variants={fadeUp} className="lg:col-span-5">
            <Glass className="h-[550px] flex flex-col shadow-xl shadow-indigo-500/5 border-indigo-500/10 hover:shadow-indigo-500/10 transition-shadow duration-500">
              <div className="px-6 py-5 flex items-center justify-between relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, #4f46e5, #4338ca, #3730a3)" }}>
                {/* Decorative glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                
                <div className="relative z-10 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
                    <CalendarDaysIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-black text-base tracking-tight leading-none mb-1">Today's Schedule</h3>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <p className="text-white/60 text-[9px] font-black uppercase tracking-[0.2em]">Verified Appointments</p>
                    </div>
                  </div>
                </div>

                <Link to="/dashboard/appointments" className="relative z-10">
                  <button className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 hover:scale-105 active:scale-95 shadow-md"
                    style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}>
                    View List
                  </button>
                </Link>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-indigo-100 scroll-smooth">
                {appointments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-12 opacity-40">
                    <div className="p-4 rounded-full bg-slate-100 mb-3 rotate-6">
                      <CalendarDaysIcon className="h-10 w-10 text-slate-400" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">Rest day — No appointments</p>
                  </div>
                ) : (
                  appointments.slice(0, 12).map((apt, i) => {
                    const s = (apt.status || "pending").toLowerCase();
                    const sc = STATUS_COLORS[s] || { text: "#64748b", bg: "#f8fafc", dot: "#94a3b8" };
                    return (
                      <Link key={i} to="/dashboard/appointments" className="block group">
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }} 
                          animate={{ opacity: 1, x: 0 }} 
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center gap-4 p-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-300 cursor-pointer"
                        >
                          {/* Patient Avatar or Initial */}
                          <div className="relative">
                            <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-black text-white shadow-inner flex-shrink-0 transition-transform group-hover:scale-105"
                              style={{ background: `linear-gradient(135deg, hsl(${(i * 47 + 210) % 360}, 65%, 60%), hsl(${(i * 47 + 210) % 360}, 75%, 50%))` }}>
                              {(apt.patient_name || "P").charAt(0).toUpperCase()}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center shadow-sm" style={{ background: sc.dot }}>
                              <div className="w-1 h-1 rounded-full bg-white animate-pulse" />
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <div>
                                <p className="text-sm font-black text-slate-800 leading-none mb-1 group-hover:text-indigo-600 transition-colors capitalize truncate max-w-[140px]">{apt.patient_name || "Guest Patient"}</p>
                                <p className="text-[10px] font-bold text-slate-400 tracking-tighter">ID: #{apt.id} • {apt.appointment_time || "Morning"}</p>
                              </div>
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0">
                                <div className="px-2.5 py-1 rounded-full border border-indigo-200 bg-indigo-50 shadow-sm flex items-center gap-1.5 transition-colors">
                                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-800">View</span>
                                </div>
                                <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:bg-indigo-600 transition-colors">
                                  <ArrowRightIcon className="h-4 w-4 stroke-[3]" />
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3 pt-2 mt-2 border-t border-slate-50">
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-lg bg-indigo-50 flex items-center justify-center overflow-hidden">
                                  <Avatar 
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(apt.doctor?.last_name || "D")}&background=E0E7FF&color=4F46E5&size=24`} 
                                    className="w-full h-full"
                                  />
                                </div>
                                <p className="text-[10px] font-bold text-slate-600 truncate max-w-[100px]">Dr. {apt.doctor?.last_name || "on Duty"}</p>
                              </div>
                              <div className="h-1 w-1 rounded-full bg-slate-200" />
                              <div className="flex items-center gap-1.5 opacity-60">
                                <BuildingOfficeIcon className="h-3 w-3 text-indigo-400" />
                                <p className="text-[10px] font-semibold text-slate-500 truncate max-w-[80px]">{apt.doctor?.department?.name || "OPD"}</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    );
                  })
                )}
              </div>
              
              <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{appointments.length} Appointments Today</p>
                <Link to="/dashboard/appointments" className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest flex items-center gap-1 group">
                  Full Schedule
                  <ArrowRightIcon className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </Glass>
          </motion.div>
        )}

        {/* Inventory Alerts */}
        <motion.div variants={fadeUp} className="lg:col-span-3">
          <Glass className="h-[550px] flex flex-col shadow-xl shadow-rose-500/5 border-rose-500/10 hover:shadow-rose-500/10 transition-shadow duration-500">
            <div className="px-5 py-5 flex items-center justify-between relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #be123c, #9f1239)" }}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-xl" />
              <div className="relative z-10">
                <p className="text-white font-black text-base tracking-tight leading-none mb-1">Inventory Alerts</p>
                <p className="text-rose-200 text-[9px] font-black uppercase tracking-widest">Stock Management</p>
              </div>
              <div className="relative z-10 w-9 h-9 rounded-xl flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20">
                <BellIcon className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-rose-50">
              {alerts.low_inventory_items?.slice(0, 6).map((item: any, i: number) => {
                const pct = Math.min((item.current_stock / Math.max(item.min_stock_level, 1)) * 100, 100);
                const color = pct < 30 ? "#ef4444" : pct < 60 ? "#f59e0b" : "#10b981";
                return (
                  <div key={i} className="p-3.5 rounded-2xl bg-white border border-slate-100 hover:border-rose-100 shadow-sm transition-all group">
                    <div className="flex justify-between items-center mb-2.5">
                      <p className="text-xs font-black text-slate-800 truncate max-w-[140px] uppercase tracking-tighter leading-none">{item.name}</p>
                      <span className="text-[10px] font-black px-2.5 py-1 rounded-lg" style={{ color: "#fff", background: color }}>{item.current_stock}</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full rounded-full" 
                        style={{ background: color }} 
                      />
                    </div>
                  </div>
                );
              })}
              {!alerts.low_inventory_items?.length && (
                <div className="flex flex-col items-center justify-center py-12 gap-3 opacity-30">
                  <ShieldCheckIcon className="h-10 w-10 text-emerald-500" />
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500">Stock Levels Perfect</p>
                </div>
              )}
            </div>
            {permissions.includes("view-inventory") && (
              <Link to="/dashboard/inventory">
                <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between group cursor-pointer hover:bg-rose-50 transition-colors">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{alerts.low_inventory_items?.length || 0} Stock Alerts</p>
                  <div className="text-[10px] font-black text-rose-600 uppercase tracking-widest flex items-center gap-1">
                    Manage Stock
                    <ArrowRightIcon className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            )}
          </Glass>
        </motion.div>

        {/* Recent Patients + Finance */}
        <motion.div variants={fadeUp} className="lg:col-span-4 flex flex-col gap-4 h-[550px]">
          {/* Recent Patients */}
          {permissions.includes("view-patients") && (
            <Glass className="flex-1 flex flex-col shadow-xl shadow-indigo-900/5 border-indigo-900/5 hover:shadow-indigo-900/10 transition-shadow duration-500">
              <div className="px-5 py-5 flex items-center justify-between relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, #312e81, #4338ca)" }}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-xl" />
                <div className="relative z-10">
                  <p className="text-white font-black text-base tracking-tight leading-none mb-1">Recent Patients</p>
                  <p className="text-indigo-200 text-[9px] font-black uppercase tracking-widest">Medical Reports</p>
                </div>
                <div className="relative z-10 w-9 h-9 rounded-xl flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20">
                  <UserGroupIcon className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin scrollbar-thumb-indigo-50">
                {recentPatients.slice(0, 10).map((p, i) => (
                  <Link key={i} to="/dashboard/patients" className="block">
                    <div className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer group border border-transparent hover:border-slate-100">
                      <Avatar src={p.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name || "P")}&background=4338ca&color=fff&size=40`}
                        size="sm" className="rounded-xl shadow-sm group-hover:scale-105 transition-transform" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-slate-800 group-hover:text-indigo-600 transition-colors truncate leading-none mb-1 capitalize">{p.name || "Anonymous"}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{p.gender || "—"} • {p.age || "?"} Yrs</p>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0">
                        <div className="px-2.5 py-1 rounded-full border border-indigo-200 bg-indigo-50 shadow-sm flex items-center gap-1.5 transition-colors">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-800">View</span>
                        </div>
                        <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:bg-indigo-600 transition-colors">
                          <ArrowRightIcon className="h-4 w-4 stroke-[3]" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <Link to="/dashboard/patients">
                <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between group cursor-pointer hover:bg-indigo-50 transition-colors">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{recentPatients.length} New Records</p>
                  <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1">
                    Directory
                    <ArrowRightIcon className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </Glass>
          )}

          {/* Finance widget */}
          {permissions.includes("view-billing-finance") && (
            <div className="rounded-2xl p-5 flex items-center gap-5 relative overflow-hidden group/finance cursor-pointer"
              style={{ background: "linear-gradient(135deg, #78350f, #92400e, #b45309)", boxShadow: "0 12px 32px rgba(120,53,15,0.25)" }}>
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/finance:opacity-100 transition-opacity duration-500" />
              <div className="p-3.5 rounded-2xl flex-shrink-0 bg-white/10 backdrop-blur-md border border-white/20 shadow-lg group-hover/finance:scale-110 transition-transform duration-500">
                <CurrencyDollarIcon className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-amber-200 text-[10px] font-black uppercase tracking-[0.15em] mb-1">Unpaid Invoices</p>
                <p className="text-white font-black text-3xl tracking-tight leading-none">{alerts.pending_bills || 0}</p>
              </div>
              <Link to="/dashboard/billing">
                <button className="px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all duration-300 hover:bg-white hover:text-amber-900 active:scale-95 shadow-xl"
                  style={{ background: "rgba(255,255,255,0.2)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }}>
                  Process
                </button>
              </Link>
            </div>
          )}
        </motion.div>
      </section>

      {/* ── Grouped Quick Links ── */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px flex-1" style={{ background: "linear-gradient(to right, transparent, #e2e8f0)" }} />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Management Console</p>
          <div className="h-px flex-1" style={{ background: "linear-gradient(to left, transparent, #e2e8f0)" }} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {ADMIN_QUICK_GROUPS.map((group, gi) => (
            <motion.div key={gi} variants={fadeUp}>
              <Glass className="h-full">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: group.color }} />
                  <p className="text-xs font-black uppercase tracking-widest" style={{ color: group.color }}>{group.label}</p>
                </div>
                <div className="p-3 space-y-1">
                  {group.items
                    .filter(item => {
                      // Find permission for this path
                      const mod = ALL_MODULES.find(m => m.path === item.path);
                      return mod ? permissions.includes(mod.permission) : true;
                    })
                    .map((item, ii) => (
                      <Link key={ii} to={item.path}>
                        <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                          style={{ border: "1px solid transparent" }}>
                          <div className="p-2 rounded-xl flex-shrink-0" style={{ background: item.iconBg }}>
                            <item.icon className="h-4 w-4" style={{ color: item.iconColor }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors leading-none">{item.label}</p>
                          </div>
                          <ArrowRightIcon className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-500 flex-shrink-0 transition-colors" />
                        </div>
                      </Link>
                    ))}
                </div>
              </Glass>
            </motion.div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DOCTOR DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
function DoctorDashboard() {
  const { user, permissions } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => { const t = setInterval(() => setCurrentTime(new Date()), 30000); return () => clearInterval(t); }, []);

  const fetchData = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      const today = new Date().toISOString().split("T")[0];
      const doctorId = user?.doctor?.id;
      const apptFilters: any = { date_range_start: today, date_range_end: today };
      if (doctorId) apptFilters.doctor_id = doctorId;

      const p: Promise<any>[] = [apiService.getAppointments(1, apptFilters)];
      if (permissions.includes("view-prescriptions")) {
        const pf: any = {};
        if (doctorId) pf.doctor_id = doctorId;
        p.push(apiService.getPrescriptions(1, 6, pf));
      }
      const [apRes, prRes] = await Promise.all(p);
      if (apRes.success) setAppointments(apRes.data?.data || apRes.data || []);
      if (prRes?.success) setPrescriptions(prRes.data?.data || prRes.data || []);
    } catch (e: any) { setError(e.message || "Dashboard error."); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen msg={error} retry={fetchData} />;

  const pending = appointments.filter(a => a.status === "pending").length;
  const confirmed = appointments.filter(a => a.status === "confirmed").length;
  const completed = appointments.filter(a => a.status === "completed").length;
  const hour = currentTime.getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger}
      className="min-h-screen py-6 px-4 md:px-6 space-y-8"
      style={{ background: "linear-gradient(160deg, #f0fdf8 0%, #ecfdf8 40%, #f0fdfa 100%)" }}>

      {/* Header */}
      <motion.section variants={fadeUp} className="relative overflow-hidden rounded-3xl p-6 md:p-8"
        style={{ background: "linear-gradient(135deg, #064e3b 0%, #065f46 40%, #047857 70%, #10b981 100%)", boxShadow: "0 20px 60px rgba(16,185,129,0.3)" }}>
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #6ee7b7, transparent)", transform: "translate(30%, -40%)" }} />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl"
                style={{ background: "rgba(255,255,255,0.15)", color: "#a7f3d0" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse flex-shrink-0" />
                Doctor Portal · Active
              </span>
            </div>
            <h1 className="text-white font-black text-2xl md:text-3xl tracking-tight">
              {greeting}, Dr. {user?.name?.split(" ").pop() || "Doctor"} 👨‍⚕️
            </h1>
            <p className="mt-1.5 font-medium" style={{ color: "rgba(167,243,208,0.8)", fontSize: "13px" }}>
              {currentTime.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              &nbsp;·&nbsp; Clinical Workspace
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right hidden md:block">
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(167,243,208,0.7)" }}>Current Time</p>
              <p className="text-white font-black text-2xl leading-tight">{currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
            </div>
            <button onClick={() => fetchData(true)}
              className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all hover:scale-105"
              style={{ background: "rgba(255,255,255,0.15)" }}>
              <ArrowPathIcon className={`h-5 w-5 text-white ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </motion.section>

      {/* KPIs */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Today's Patients" value={appointments.length} icon={CalendarDaysIcon} from="#0070C0" to="#002D5A" glow="rgba(0,112,192,0.25)" badge="Today" />
        <KpiCard label="Pending" value={pending} icon={ClockIcon} from="#d97706" to="#b45309" glow="rgba(217,119,6,0.25)" badge="Awaiting" />
        <KpiCard label="Confirmed" value={confirmed} icon={CheckCircleIcon} from="#0070C0" to="#002D5A" glow="rgba(0,112,192,0.25)" badge="Ready" />
        <KpiCard label={permissions.includes("view-prescriptions") ? "Prescriptions" : "Completed"} value={permissions.includes("view-prescriptions") ? prescriptions.length : completed}
          icon={permissions.includes("view-prescriptions") ? DocumentTextIcon : CheckCircleIcon}
          from="#7c3aed" to="#6d28d9" glow="rgba(124,58,237,0.25)" badge="Recent" />
      </section>

      {/* Analytics & Schedule */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Status Donut */}
        <motion.div variants={fadeUp}>
          <Glass className="h-[420px] flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-slate-900 font-bold text-sm">Today's Progress</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">Appointment Status</p>
              </div>
            </div>
            <div className="flex-1 p-4 flex flex-col items-center justify-center">
              {appointments.length > 0 ? (
                <Chart
                  type="donut"
                  height={260}
                  series={[
                    confirmed,
                    pending,
                    completed,
                    appointments.filter(a => a.status === "cancelled").length
                  ]}
                  options={{
                    chart: { toolbar: { show: false } },
                    labels: ["Confirmed", "Pending", "Completed", "Cancelled"],
                    colors: ["#0070C0", "#f59e0b", "#10b981", "#ef4444"],
                    legend: { position: "bottom", fontSize: "11px", fontWeight: 700, fontFamily: "inherit", labels: { colors: "#475569" } },
                    plotOptions: { pie: { donut: { size: "70%", labels: {
                      show: true,
                      total: { show: true, label: "Total", fontSize: "12px", fontWeight: 700, color: "#475569", formatter: () => String(appointments.length) },
                      value: { fontSize: "20px", fontWeight: 800, color: "#1e293b" },
                    } } } },
                    dataLabels: { enabled: false },
                    stroke: { width: 3, colors: ["#fff"] },
                    tooltip: { theme: "light" },
                  }}
                />
              ) : (
                <div className="flex flex-col items-center gap-3 opacity-30 mt-10">
                  <ChartPieIcon className="h-12 w-12 text-slate-400" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">No Data Available</p>
                </div>
              )}
            </div>
          </Glass>
        </motion.div>

        {/* Schedule Table */}
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <Glass className="h-[420px] flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-slate-900 font-bold text-sm">Patient Schedule</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#10b981" }} />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Live Queue</p>
                </div>
              </div>
              <Link to="/dashboard/appointments">
                <button className="text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-xl"
                  style={{ background: "#ecfdf5", color: "#059669", border: "1px solid #a7f3d0" }}>
                  View Full Schedule
                </button>
              </Link>
            </div>
            <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-slate-200">
              <table className="w-full text-left min-w-[400px]">
                <thead className="sticky top-0 z-10 bg-[#f8fafc]">
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                    {["Patient", "Time", "Status"].map(h => (
                      <th key={h} className="px-5 py-3 text-[9px] font-black uppercase tracking-widest" style={{ color: "#94a3b8" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {appointments.length === 0 ? (
                    <tr><td colSpan={3} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-2 opacity-40">
                        <CalendarDaysIcon className="h-10 w-10 text-emerald-600" />
                        <p className="text-[11px] font-black uppercase tracking-widest text-emerald-800">Clear Schedule Today</p>
                      </div>
                    </td></tr>
                  ) : appointments.slice(0, 15).map((apt, i) => (
                      <AptRow key={i} apt={apt} showDoctor={false} idx={i} />
                  ))}
                </tbody>
              </table>
            </div>
          </Glass>
        </motion.div>
      </section>

      {/* Prescriptions & Additional Doctor Tools */}
      {permissions.includes("view-prescriptions") && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <motion.div variants={fadeUp} className="lg:col-span-2">
            <Glass className="h-[350px] flex flex-col">
              <div className="px-5 py-4 flex items-center justify-between"
                style={{ background: "linear-gradient(135deg, #064e3b, #047857)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <div>
                  <p className="text-white font-bold text-sm">My Prescriptions</p>
                  <p className="text-emerald-300 text-[10px] font-bold uppercase tracking-widest mt-0.5">Recently Issued</p>
                </div>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
                  <DocumentTextIcon className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto scrollbar-thin">
                {prescriptions.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center p-10 gap-2 opacity-30">
                    <DocumentTextIcon className="h-10 w-10 text-slate-400" />
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">No recent prescriptions</p>
                  </div>
                ) : prescriptions.map((p: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer group"
                    style={{ background: "#fff", borderColor: "#f1f5f9" }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-slate-800 truncate leading-tight">{p.patient?.name || "Patient"}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                        {p.created_at ? new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                      </p>
                    </div>
                    <span className="text-[9px] font-black uppercase px-2.5 py-1 rounded-full border"
                      style={{ background: p.status === 'dispensed' ? "#ecfdf5" : "#fffbeb", color: p.status === 'dispensed' ? "#059669" : "#d97706", borderColor: p.status === 'dispensed' ? "#a7f3d0" : "#fde68a" }}>
                      {p.status || "Active"}
                    </span>
                  </div>
                ))}
              </div>
              <Link to="/dashboard/prescriptions">
                <div className="py-3 text-center bg-slate-50 hover:bg-emerald-50 transition-colors cursor-pointer" style={{ borderTop: "1px solid #f1f5f9" }}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-emerald-700 transition-colors">Manage All Prescriptions</p>
                </div>
              </Link>
            </Glass>
          </motion.div>

          {/* Quick Actions Panel */}
          <motion.div variants={fadeUp}>
             <Glass className="h-[350px] flex flex-col p-5 bg-gradient-to-br from-emerald-50 to-blue-50/80">
               <h3 className="text-slate-800 font-black text-sm mb-1">Quick Actions</h3>
               <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-5">Doctor Toolkit</p>
               
               <div className="flex flex-col gap-3">
                 <Link to="/dashboard/prescriptions" className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-emerald-200 hover:shadow-md group transition-all">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                       <PlusIcon className="w-5 h-5 stroke-[3]" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-800">Write Prescription</p>
                      <p className="text-[10px] text-slate-500 font-bold">Issue new medication</p>
                    </div>
                 </Link>
                 
                 <Link to="/dashboard/patients" className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-indigo-200 hover:shadow-md group transition-all">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                       <UserGroupIcon className="w-5 h-5 stroke-[3]" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-800">My Patients</p>
                      <p className="text-[10px] text-slate-500 font-bold">View medical histories</p>
                    </div>
                 </Link>

                 <Link to="/dashboard/appointments" className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-md group transition-all">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                       <CalendarDaysIcon className="w-5 h-5 stroke-[3]" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-800">Appointments</p>
                      <p className="text-[10px] text-slate-500 font-bold">Manage calendar</p>
                    </div>
                 </Link>
               </div>
             </Glass>
          </motion.div>
        </section>
      )}

      <QuickModulesGrid permissions={permissions} limit={8} />
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STAFF DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
function StaffDashboard() {
  const { user, permissions } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [recentPatients, setRecentPatients] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const canAppts = permissions.includes("view-appointments");
  const canPatients = permissions.includes("view-patients");

  useEffect(() => { const t = setInterval(() => setCurrentTime(new Date()), 30000); return () => clearInterval(t); }, []);

  const fetchData = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      const today = new Date().toISOString().split("T")[0];
      const ps: Promise<any>[] = [];
      if (canAppts) ps.push(apiService.getAppointments(1, { date_range_start: today, date_range_end: today }));
      if (canPatients) ps.push(apiService.getPatients(1, 6));
      const results = await Promise.all(ps);
      let idx = 0;
      if (canAppts && results[idx]) { if (results[idx].success) setAppointments(results[idx].data?.data || results[idx].data || []); idx++; }
      if (canPatients && results[idx]) { if (results[idx].success) setRecentPatients(results[idx].data?.data || results[idx].data || []); }
    } catch (e: any) { setError(e.message || "Dashboard error."); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen msg={error} retry={fetchData} />;

  const roleName = user?.role?.name || "Staff";
  const moduleCount = ALL_MODULES.filter(m => permissions.includes(m.permission)).length;
  const hour = currentTime.getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  // Role-specific gradient
  const headerGradient = "linear-gradient(135deg, #001a2e 0%, #002D5A 35%, #003d6b 65%, #0070C0 100%)";
  const headerGlow = "rgba(0,112,192,0.28)";

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger}
      className="min-h-screen py-6 px-4 md:px-6 space-y-8"
      style={{ background: "linear-gradient(160deg, #f8fafc 0%, #f1f5f9 40%, #f8fafc 100%)" }}>

      {/* Header */}
      <motion.section variants={fadeUp} className="relative overflow-hidden rounded-3xl p-6 md:p-8"
        style={{ background: headerGradient, boxShadow: `0 20px 60px ${headerGlow}` }}>
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #94a3b8, transparent)", transform: "translate(30%, -40%)" }} />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl"
                style={{ background: "rgba(255,255,255,0.1)", color: "#cbd5e1" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse flex-shrink-0" />
                {roleName} · Active
              </span>
            </div>
            <h1 className="text-white font-black text-2xl md:text-3xl tracking-tight">
              {greeting}, {user?.name?.split(" ")[0] || "Staff"} 👋
            </h1>
            <p className="mt-1.5 font-medium" style={{ color: "rgba(148,163,184,0.8)", fontSize: "13px" }}>
              {currentTime.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              &nbsp;·&nbsp; Staff Workspace
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right hidden md:block">
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(148,163,184,0.7)" }}>Current Time</p>
              <p className="text-white font-black text-2xl leading-tight">{currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
            </div>
            <button onClick={() => fetchData(true)}
              className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all hover:scale-105"
              style={{ background: "rgba(255,255,255,0.1)" }}>
              <ArrowPathIcon className={`h-5 w-5 text-white ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </motion.section>

      {/* KPIs */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {canAppts ? (
          <>
            <KpiCard label="Today's Appointments" value={appointments.length} icon={CalendarDaysIcon} from="#0070C0" to="#002D5A" glow="rgba(0,112,192,0.22)" badge="Today" />
            <KpiCard label="Pending" value={appointments.filter(a => a.status === "pending").length} icon={ClockIcon} from="#d97706" to="#b45309" glow="rgba(217,119,6,0.22)" badge="Action Needed" />
            <KpiCard label="Confirmed" value={appointments.filter(a => a.status === "confirmed").length} icon={CheckCircleIcon} from="#059669" to="#047857" glow="rgba(5,150,105,0.22)" badge="Ready" />
          </>
        ) : (
          <div className="col-span-3 flex items-center justify-center rounded-2xl p-6"
            style={{ background: "linear-gradient(135deg, #f8fafc, #f1f5f9)", border: "1px dashed #cbd5e1" }}>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl" style={{ background: "#fff" }}>
                <ShieldCheckIcon className="h-8 w-8" style={{ color: "#94a3b8" }} />
              </div>
              <div>
                <p className="text-slate-700 font-bold text-sm">Workspace Ready</p>
                <p className="text-slate-400 text-xs mt-0.5">Use the quick access below to navigate your modules</p>
              </div>
            </div>
          </div>
        )}
        <KpiCard label="My Modules" value={moduleCount} icon={SparklesIcon} from="#7c3aed" to="#6d28d9" glow="rgba(124,58,237,0.22)" badge="Accessible" />
      </section>

      {/* Appointments Row */}
      {canAppts && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Appointment Status Donut */}
          <motion.div variants={fadeUp}>
            <Glass className="h-[420px] flex flex-col">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-slate-900 font-bold text-sm">Today's Progress</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">Appointment Status</p>
                </div>
              </div>
              <div className="flex-1 p-4 flex flex-col items-center justify-center">
                {appointments.length > 0 ? (
                  <Chart
                    type="donut"
                    height={260}
                    series={[
                      appointments.filter(a => a.status === "confirmed").length,
                      appointments.filter(a => a.status === "pending").length,
                      appointments.filter(a => a.status === "completed").length,
                      appointments.filter(a => a.status === "cancelled").length
                    ]}
                    options={{
                      chart: { toolbar: { show: false } },
                      labels: ["Confirmed", "Pending", "Completed", "Cancelled"],
                      colors: ["#0070C0", "#f59e0b", "#10b981", "#ef4444"],
                      legend: { position: "bottom", fontSize: "11px", fontWeight: 700, fontFamily: "inherit", labels: { colors: "#475569" } },
                      plotOptions: { pie: { donut: { size: "70%", labels: {
                        show: true,
                        total: { show: true, label: "Total", fontSize: "12px", fontWeight: 700, color: "#475569", formatter: () => String(appointments.length) },
                        value: { fontSize: "20px", fontWeight: 800, color: "#1e293b" },
                      } } } },
                      dataLabels: { enabled: false },
                      stroke: { width: 3, colors: ["#fff"] },
                      tooltip: { theme: "light" },
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 opacity-30 mt-10">
                    <ChartPieIcon className="h-12 w-12 text-slate-400" />
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">No Appointments</p>
                  </div>
                )}
              </div>
            </Glass>
          </motion.div>

          <motion.div variants={fadeUp} className="lg:col-span-2">
            <Glass className="h-[420px] flex flex-col">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-slate-900 font-bold text-sm">Today's Appointments</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#22c55e" }} />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Live Schedule</p>
                  </div>
                </div>
                <Link to="/dashboard/appointments">
                  <button className="text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-xl"
                    style={{ background: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0" }}>View Full Schedule</button>
                </Link>
              </div>
              <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-slate-200">
                <table className="w-full text-left min-w-[440px]">
                  <thead className="sticky top-0 z-10 bg-[#f8fafc]">
                    <tr style={{ background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                      {["Patient", "Doctor", "Time", "Status"].map(h => (
                        <th key={h} className="px-5 py-3 text-[9px] font-black uppercase tracking-widest" style={{ color: "#94a3b8" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.length === 0 ? (
                      <tr><td colSpan={4} className="py-24 text-center">
                        <div className="flex flex-col items-center gap-2 opacity-40">
                          <CalendarDaysIcon className="h-10 w-10 text-slate-400" />
                          <p className="text-[11px] font-black uppercase tracking-widest text-slate-600">Clear Schedule Today</p>
                        </div>
                      </td></tr>
                    ) : appointments.slice(0, 15).map((apt, i) => <AptRow key={i} apt={apt} idx={i} />)}
                  </tbody>
                </table>
              </div>
            </Glass>
          </motion.div>
        </section>
      )}

      {/* Patients & Actions Row */}
      {canPatients && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <motion.div variants={fadeUp} className="lg:col-span-2">
            <Glass className="h-[350px] flex flex-col">
              <div className="px-5 py-4 flex items-center justify-between"
                style={{ background: "linear-gradient(135deg, #0f172a, #1e293b)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div>
                  <p className="text-white font-bold text-sm">Recent Patients</p>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">New Registrations</p>
                </div>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.1)" }}>
                  <UserGroupIcon className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto scrollbar-thin">
                {recentPatients.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center p-10 gap-2 opacity-30">
                    <UserGroupIcon className="h-10 w-10 text-slate-400" />
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">No recent patients</p>
                  </div>
                ) : recentPatients.map((p, i) => (
                  <Link key={i} to="/dashboard/patients">
                    <div className="flex items-center gap-3 p-3 rounded-2xl border hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group"
                      style={{ background: "#fff", borderColor: "#f1f5f9" }}>
                      <Avatar src={p.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name || "P")}&background=475569&color=fff&size=40`}
                        size="sm" className="rounded-xl flex-shrink-0 group-hover:scale-105 transition-transform" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-slate-800 group-hover:text-slate-900 truncate leading-tight capitalize">{p.name || "Anonymous"}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">{p.gender || "—"} · {p.age || "?"} yrs</p>
                      </div>
                      <ArrowRightIcon className="h-4 w-4 text-slate-300 group-hover:text-slate-600 transition-colors flex-shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
              <Link to="/dashboard/patients">
                <div className="py-3 text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer" style={{ borderTop: "1px solid #f1f5f9" }}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-800 transition-colors">Directory</p>
                </div>
              </Link>
            </Glass>
          </motion.div>

          {/* Quick Actions Panel */}
          <motion.div variants={fadeUp}>
             <Glass className="h-[350px] flex flex-col p-5 bg-gradient-to-br from-slate-50 to-slate-100/50">
               <h3 className="text-slate-800 font-black text-sm mb-1">Quick Actions</h3>
               <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-5">Staff Toolkit</p>
               
               <div className="flex flex-col gap-3">
                 <Link to="/dashboard/patients" className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-md group transition-all">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                       <PlusIcon className="w-5 h-5 stroke-[3]" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-800">Register Patient</p>
                      <p className="text-[10px] text-slate-500 font-bold">Add new profile</p>
                    </div>
                 </Link>
                 
                 <Link to="/dashboard/appointments" className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-emerald-200 hover:shadow-md group transition-all">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                       <CalendarDaysIcon className="w-5 h-5 stroke-[3]" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-800">Book Appointment</p>
                      <p className="text-[10px] text-slate-500 font-bold">Manage calendar</p>
                    </div>
                 </Link>

                 {permissions.includes('view-billing') && (
                   <Link to="/dashboard/billing" className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-amber-200 hover:shadow-md group transition-all">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                         <CurrencyDollarIcon className="w-5 h-5 stroke-[3]" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-800">Billing</p>
                        <p className="text-[10px] text-slate-500 font-bold">Process payments</p>
                      </div>
                   </Link>
                 )}
               </div>
             </Glass>
          </motion.div>
        </section>
      )}

      <QuickModulesGrid permissions={permissions} limit={18} />
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT ROUTER
// ═══════════════════════════════════════════════════════════════════════════════
export function Home(): JSX.Element {
  const { user, loading: authLoading } = useAuth();
  if (authLoading) return <LoadingScreen />;
  const role = (user?.role?.name || "").toLowerCase().trim();
  if (["admin", "super admin", "superadmin", "administrator"].includes(role)) return <AdminDashboard />;
  if (["doctor", "physician", "specialist", "consultant"].includes(role)) return <DoctorDashboard />;
  return <StaffDashboard />;
}

export default Home;
