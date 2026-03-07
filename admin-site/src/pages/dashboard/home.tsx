import React, { useEffect, useState, useMemo } from "react";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  Avatar,
  Button,
  Chip,
  IconButton,
  Progress,
  Tooltip,
} from "@material-tailwind/react";
import {
  CalendarDaysIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  UserPlusIcon,
  BuildingOfficeIcon,
  HeartIcon,
  ChartBarIcon,
  ArrowRightIcon,
  BellIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";
import { StatisticsChart } from "@/widgets/charts";
import { Link } from "react-router-dom";
import { apiService } from "@/services/api";
import { chartsConfig } from "@/configs";
import { motion, AnimatePresence } from "framer-motion";

// --- Custom Components ---

const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center min-h-[80vh] bg-slate-50/50 text-center">
    <motion.div
      animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
      transition={{ repeat: Infinity, duration: 3 }}
      className="relative mb-8"
    >
      <div className="h-24 w-24 rounded-full border-4 border-blue-500/10 border-t-blue-600 animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center font-black text-blue-600 text-xl tracking-tighter">HMS</div>
    </motion.div>
    <Typography variant="h5" className="text-slate-900 font-semibold tracking-tight mb-2">Preparing Dashboard</Typography>
    <Typography className="text-slate-500 font-medium tracking-wide text-xs animate-pulse lowercase">
      Compiling latest statistics and records...
    </Typography>
  </div>
);

const GlassCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <Card className={`bg-white/70 backdrop-blur-md border border-white/40 shadow-xl shadow-blue-gray-900/5 ${className}`}>
    {children}
  </Card>
);

const PulseDot = ({ color = "emerald" }: { color?: string }) => (
  <span className="relative flex h-2 w-2">
    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-${color}-400 opacity-75`}></span>
    <span className={`relative inline-flex rounded-full h-2 w-2 bg-${color}-500`}></span>
  </span>
);

export function Home(): JSX.Element {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<any>(null);
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [recentPatients, setRecentPatients] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const [overviewRes, appointmentsRes, patientsRes] = await Promise.all([
        apiService.getDashboardOverview('month'),
        apiService.getAppointments(1, {
          date_range_start: new Date().toISOString().split('T')[0],
          date_range_end: new Date().toISOString().split('T')[0]
        }),
        apiService.getPatients(1, 5)
      ]);

      if (overviewRes.success) {
        setOverview(overviewRes.data);
      } else {
        setError("Critical: Failed to access dashboard intelligence.");
      }

      if (appointmentsRes.success) {
        setTodayAppointments(appointmentsRes.data?.data || appointmentsRes.data || []);
      }
      if (patientsRes.success) {
        setRecentPatients(patientsRes.data?.data || patientsRes.data || []);
      }
    } catch (err: any) {
      console.error("Dashboard Fetch Error:", err);
      setError(err.message || "An unexpected system anomaly occurred.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  // --- Animation Variants ---
  const fadeIn = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  // --- Chart Logic ---
  const revenueTrendChartProps = useMemo(() => {
    if (!overview || !overview.charts?.revenue_trend) return null;
    return {
      type: "area",
      height: 320,
      series: [{ name: "Revenue", data: overview.charts.revenue_trend.map((t: any) => t.y) }],
      options: {
        ...chartsConfig,
        colors: ["#3b82f6"],
        stroke: { curve: "smooth", width: 4 },
        fill: {
          type: "gradient",
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.5,
            opacityTo: 0.1,
            stops: [0, 90, 100]
          }
        },
        markers: { size: 0, hover: { size: 6 } },
        xaxis: {
          ...chartsConfig.xaxis,
          categories: overview.charts.revenue_trend.map((t: any) => {
            const d = new Date(t.x);
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          }),
          axisBorder: { show: false },
          axisTicks: { show: false },
        },
        yaxis: {
          ...chartsConfig.yaxis,
          labels: {
            formatter: (val: number) => `$${val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val}`,
            style: { colors: "#94a3b8", fontSize: "11px", fontWeight: 600 }
          }
        },
        grid: {
          borderColor: "#f1f5f9",
          strokeDashArray: 4,
          padding: { left: 20, right: 20 }
        }
      }
    };
  }, [overview]);

  if (loading && !overview) {
    return <LoadingScreen />;
  }

  if (error && !overview) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center bg-white">
        <div className="p-8 bg-red-50 rounded-[40px] mb-10 shadow-2xl shadow-red-500/10 border border-red-100">
          <ExclamationTriangleIcon className="h-20 w-20 text-red-500" />
        </div>
        <Typography variant="h2" className="font-black text-slate-900 mb-4 tracking-tight">Access Interrupted</Typography>
        <Typography className="text-slate-500 max-w-md mx-auto mb-12 leading-relaxed font-bold text-lg">{error}</Typography>
        <Button
          size="lg"
          variant="gradient"
          color="blue"
          onClick={() => fetchData()}
          className="rounded-3xl px-12 py-5 shadow-2xl shadow-blue-500/30 font-black tracking-widest uppercase text-xs"
        >
          Force Re-integration
        </Button>
      </div>
    );
  }

  const { kpis = {}, counts = {}, alerts = {} } = overview || {};

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="max-w-7xl mx-auto py-6 px-4 md:px-6 space-y-6 bg-slate-50/20 min-h-screen"
    >
      {/* 🏛️ Professional Dashboard Header */}
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200/60">
        <motion.div variants={fadeIn}>
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-md uppercase tracking-wider shadow-sm">Main Dashboard</span>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100/80 shadow-sm transition-all">
              <PulseDot color="emerald" />
              <span className="text-[10px] font-bold uppercase tracking-tight">System Online</span>
            </div>
          </div>
          <Typography variant="h1" className="text-slate-900 font-bold tracking-tight leading-tight mb-1 text-2xl lg:text-3xl">
            Hospital Overview
          </Typography>
          <Typography className="text-slate-500 font-medium text-xs flex items-center gap-2 uppercase tracking-widest">
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Real-time Monitoring
          </Typography>
        </motion.div>

        <motion.div variants={fadeIn} className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end pr-6 border-r border-slate-200">
            <Typography className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Local Time</Typography>
            <Typography variant="h5" className="text-slate-900 font-bold tracking-tight leading-none">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </Typography>
          </div>
          <div className="flex gap-2">
            <IconButton
              variant="outlined"
              color="blue-gray"
              onClick={() => fetchData(true)}
              className="rounded-xl border-slate-200 hover:bg-slate-50 transition-all h-10 w-10"
            >
              <ArrowPathIcon className={`h-5 w-5 text-slate-600 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
            </IconButton>
            <Button
              variant="filled"
              color="blue"
              className="rounded-xl shadow-md py-2.5 px-6 font-bold text-[11px] tracking-wider uppercase flex items-center gap-3 transition-all hover:shadow-lg active:scale-95"
            >
              <MagnifyingGlassIcon className="h-4 w-4" />
              Quick Search
            </Button>
          </div>
        </motion.div>
      </section>

      {/* 💎 KPI Performance Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Monthly Revenue", val: formatCurrency(kpis.monthly_revenue?.value || 0), icon: CurrencyDollarIcon, color: "blue", trend: `${kpis.monthly_revenue?.trend || 0}%`, sub: "Revenue this month" },
          { label: "Medical Staff", val: counts.doctors?.total || 0, icon: UserGroupIcon, color: "emerald", trend: "Active", sub: "Registered Specialists" },
          { label: "Today's Appointments", val: kpis.appointments?.today || 0, icon: CalendarDaysIcon, color: "indigo", trend: "Normal", sub: "Scheduled Sessions" },
          { label: "System Uptime", val: "99.9%", icon: BoltIcon, color: "amber", trend: "Stable", sub: "Operational Status" }
        ].map((kpi, idx) => (
          <motion.div
            key={idx}
            variants={fadeIn}
            whileHover={{ y: -5 }}
            className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden"
          >
            <div className={`absolute -right-4 -top-4 w-20 h-20 bg-${kpi.color}-500/5 rounded-full blur-xl`}></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className={`p-3 rounded-xl bg-${kpi.color}-50 text-${kpi.color}-600 border border-${kpi.color}-100/50 shadow-sm`}>
                <kpi.icon className="h-6 w-6" />
              </div>
              <div className="flex flex-col items-end">
                <span className={`text-[10px] font-bold uppercase py-1 px-2.5 rounded-lg bg-${kpi.color}-50 text-${kpi.color}-700 border border-${kpi.color}-100`}>
                  {kpi.trend}
                </span>
                <span className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-wider">{kpi.sub}</span>
              </div>
            </div>
            <Typography className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 leading-none">{kpi.label}</Typography>
            <Typography variant="h4" className="text-slate-900 font-bold tracking-tight text-xl">{kpi.val}</Typography>
          </motion.div>
        ))}
      </section>

      {/* 🧬 Analytics & Critical Tasks */}
      <section className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <motion.div variants={fadeIn} className="xl:col-span-3">
          <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white h-full">
            <CardHeader floated={false} shadow={false} className="m-0 p-6 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 rounded-none">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm">
                  <ChartBarIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <Typography variant="h5" className="text-slate-900 font-bold tracking-tight">Revenue Analysis</Typography>
                  <Typography className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">30-Day Fiscal Performance</Typography>
                </div>
              </div>
              <div className="flex gap-1 p-1 bg-slate-200/50 rounded-xl overflow-hidden">
                {['7D', '30D', '90D'].map(p => (
                  <button
                    key={p}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${p === '30D' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardBody className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8">
                  {revenueTrendChartProps && <StatisticsChart chart={revenueTrendChartProps} title="" description="" color="white" />}
                </div>
                <div className="lg:col-span-4 flex flex-col justify-center space-y-8">
                  <Typography className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3">Performance Indicators</Typography>
                  {[
                    { label: "Bed Occupancy", val: "91.8%", color: "blue" },
                    { label: "Patient Satisfaction", val: "99.2%", color: "emerald" },
                    { label: "Billing Accuracy", val: "100%", color: "amber" }
                  ].map((bench, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-end mb-2">
                        <Typography className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{bench.label}</Typography>
                        <Typography className="text-xl font-bold text-slate-900 tracking-tight leading-none">{bench.val}</Typography>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: bench.val === "100%" ? "100%" : bench.val }}
                          transition={{ duration: 1.5, ease: "easeOut", delay: idx * 0.2 }}
                          className={`h-full bg-${bench.color}-500 rounded-full`}
                        ></motion.div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outlined" color="blue-gray" fullWidth className="rounded-xl py-3 font-bold text-[10px] tracking-wider border-slate-200 hover:bg-slate-50 transition-all uppercase mt-2">
                    View Financial Audit
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* 🚨 Critical Alerts Stack */}
        <motion.div variants={fadeIn} className="flex flex-col gap-6">
          <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white flex-1 flex flex-col">
            <CardBody className="p-6 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <Typography className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">Inventory Alerts</Typography>
                  <Typography variant="h6" className="text-slate-900 font-bold tracking-tight">Low Stock items</Typography>
                </div>
                <div className="p-3 bg-red-50 text-red-600 rounded-xl border border-red-100 shadow-sm">
                  <BellIcon className="h-5 w-5" />
                </div>
              </div>
              <div className="space-y-6 flex-1">
                {alerts.low_inventory_items?.slice(0, 3).map((item: any, i: number) => (
                  <div key={i} className="group">
                    <div className="flex justify-between items-center mb-2">
                      <Typography className="text-[11px] font-bold text-slate-700 truncate max-w-[120px]">{item.name}</Typography>
                      <Typography className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">{item.current_stock} left</Typography>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((item.current_stock / item.min_stock_level) * 100, 100)}%` }}
                        transition={{ duration: 1 }}
                        className="h-full bg-red-500"
                      ></motion.div>
                    </div>
                  </div>
                ))}
                {!alerts.low_inventory_items?.length && (
                  <div className="flex flex-col items-center justify-center py-10 opacity-40 space-y-4">
                    <ShieldCheckIcon className="h-10 w-10 text-emerald-500" />
                    <Typography className="font-bold text-[10px] uppercase tracking-widest">Stock Level Optimal</Typography>
                  </div>
                )}
              </div>
              <Link to="/dashboard/inventory" className="w-full mt-6">
                <Button fullWidth variant="outlined" color="blue-gray" size="sm" className="rounded-xl font-bold text-[10px] tracking-wider uppercase">
                  Manage Inventory
                </Button>
              </Link>
            </CardBody>
          </Card>

          <Card className="border border-amber-200 bg-amber-50/20 rounded-2xl overflow-hidden relative group">
            <CardBody className="p-6 text-center flex flex-col items-center justify-center">
              <div className="p-4 bg-white text-amber-600 rounded-xl mb-4 shadow-sm border border-amber-100">
                <CurrencyDollarIcon className="h-6 w-6" />
              </div>
              <Typography className="text-[10px] font-bold text-amber-800/60 uppercase tracking-widest mb-1">Unpaid Invoices</Typography>
              <Typography variant="h3" className="text-amber-900 font-bold tracking-tight mb-4 text-3xl">
                {alerts.pending_bills || 0}
              </Typography>
              <Link to="/dashboard/billing" className="w-full">
                <Button
                  fullWidth
                  color="amber"
                  size="sm"
                  className="rounded-xl font-bold text-[10px] tracking-wider uppercase"
                >
                  Process Payments
                </Button>
              </Link>
            </CardBody>
          </Card>
        </motion.div>
      </section>

      {/* 📊 Data Tables */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={fadeIn} className="lg:col-span-2">
          <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white h-full flex flex-col">
            <CardHeader floated={false} shadow={false} className="m-0 p-6 bg-white border-b border-slate-100 flex items-center justify-between gap-4 rounded-none">
              <div>
                <Typography variant="h5" className="text-slate-900 font-bold tracking-tight">Today's Appointments</Typography>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  <Typography className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Live Schedule</Typography>
                </div>
              </div>
              <Link to="/dashboard/appointments">
                <Button
                  color="blue"
                  size="sm"
                  className="rounded-xl px-6 py-2.5 font-bold text-[10px] tracking-wider uppercase shadow-md transition-all hover:shadow-lg active:scale-95"
                >
                  Full Schedule
                </Button>
              </Link>
            </CardHeader>
            <CardBody className="p-0 flex-1 overflow-x-auto relative min-h-[400px]">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-500">
                    {["Patient", "Doctor", "Time", "Status"].map(h => (
                      <th key={h} className="px-6 py-4 font-bold uppercase text-[9px] tracking-widest border-b border-slate-100">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {todayAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-24 text-center">
                        <div className="flex flex-col items-center justify-center opacity-30">
                          <CalendarDaysIcon className="h-12 w-12 mb-4 text-slate-400" />
                          <Typography className="font-bold text-sm uppercase tracking-widest">No appointments today</Typography>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    todayAppointments.map((apt, i) => (
                      <tr key={i} className="hover:bg-blue-50/30 transition-all cursor-pointer group">
                        <td className="px-6 py-4">
                          <Typography className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase">{apt.patient_name}</Typography>
                          <Typography className="text-[10px] font-medium text-slate-400">ID: PAT-{apt.id}</Typography>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(apt.doctor?.last_name || 'D')}&background=0D8ABC&color=fff`}
                              size="sm"
                              className="h-8 w-8 rounded-lg"
                            />
                            <div>
                              <Typography className="text-sm font-bold text-slate-800 leading-none">Dr. {apt.doctor?.last_name || 'General'}</Typography>
                              <Typography className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">{apt.doctor?.department?.name || 'Unit'}</Typography>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-slate-600">
                            <ClockIcon className="h-4 w-4" />
                            <Typography className="text-xs font-bold">{apt.appointment_time}</Typography>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Chip
                            size="sm"
                            variant="ghost"
                            value={apt.status}
                            color={apt.status === "confirmed" ? "green" : apt.status === "pending" ? "amber" : "blue-gray"}
                            className="rounded-lg font-bold text-[9px] uppercase tracking-wider px-3"
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div variants={fadeIn}>
          <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white h-full flex flex-col">
            <CardHeader floated={false} shadow={false} className="m-0 p-6 bg-slate-900 flex flex-col gap-1 rounded-none border-b border-white/10">
              <Typography variant="h5" className="text-white font-bold tracking-tight">Recent Patients</Typography>
              <Typography className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">New Registrations</Typography>
            </CardHeader>
            <CardBody className="p-4 flex-1">
              <div className="space-y-2">
                {recentPatients.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group cursor-pointer"
                  >
                    <Avatar
                      src={p.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=random`}
                      variant="circular"
                      size="sm"
                      className="h-10 w-10 border-2 border-white shadow-sm transition-all group-hover:border-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      <Typography className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase truncate leading-none mb-1">{p.name || 'Anonymous'}</Typography>
                      <Typography className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">
                        {p.gender} | {p.age || '?'} Years
                      </Typography>
                    </div>
                    <ArrowRightIcon className="h-4 w-4 text-slate-300 group-hover:text-slate-900 transition-colors" />
                  </div>
                ))}
              </div>
            </CardBody>
            <Link to="/dashboard/patients" className="block w-full border-t border-slate-100 bg-slate-50/50 p-4 text-center hover:bg-slate-900 transition-all group">
              <Typography className="text-[10px] font-bold text-slate-500 group-hover:text-white uppercase tracking-widest">View All Patients</Typography>
            </Link>
          </Card>
        </motion.div>
      </section>

      {/* 🚀 Quick Actions Section */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "New Patient", icon: UserPlusIcon, path: "/dashboard/patients", color: "blue", desc: "Admission" },
          { label: "Appointments", icon: CalendarDaysIcon, path: "/dashboard/appointments", color: "indigo", desc: "Scheduling" },
          { label: "Billing & Fees", icon: CurrencyDollarIcon, path: "/dashboard/billing", color: "emerald", desc: "Financials" },
          { label: "System Reports", icon: ChartBarIcon, path: "/dashboard/reports", color: "slate", desc: "Analytics" }
        ].map((action, i) => (
          <motion.div key={i} variants={fadeIn} whileHover={{ y: -4 }}>
            <Link to={action.path}>
              <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col items-center gap-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 cursor-pointer h-full text-center">
                <div className={`p-4 rounded-xl bg-${action.color}-50 text-${action.color}-600 border border-${action.color}-100/50 shadow-sm`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <div>
                  <Typography className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-1">{action.label}</Typography>
                  <Typography className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">{action.desc}</Typography>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </section>
    </motion.div>
  );
}



export default Home;
