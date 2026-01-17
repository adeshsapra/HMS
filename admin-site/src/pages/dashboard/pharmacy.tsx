import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
  Button,
  Input,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Chip,
  IconButton,
  Textarea,
  Select,
  Option,
} from "@material-tailwind/react";
import {
  BeakerIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  EyeIcon,
  PencilIcon,
  PlusIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { apiService } from "@/services/api";
import { useToast } from "@/context/ToastContext";
import { DataTable, Column, ViewModal, ViewField } from "@/components";

// Get default page size from settings or use 10 as default
const DEFAULT_PAGE_SIZE = parseInt(localStorage.getItem('settings_page_size') || '10', 10);

export default function Pharmacy(): JSX.Element {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    pendingPrescriptions: 0,
    lowStockCount: 0,
    todayDispenses: 0,
  });

  // Prescriptions state
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [prescriptionPage, setPrescriptionPage] = useState(1);
  const [prescriptionTotalPages, setPrescriptionTotalPages] = useState(1);
  const [viewPrescriptionModal, setViewPrescriptionModal] = useState(false);
  const [viewMedicineModal, setViewMedicineModal] = useState(false);
  const [viewHistoryModal, setViewHistoryModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
  const [selectedHistory, setSelectedHistory] = useState<any>(null);
  const [dispenseModal, setDispenseModal] = useState(false);
  const [dispenseData, setDispenseData] = useState<any>(null);

  // Medicines state
  const [medicines, setMedicines] = useState<any[]>([]);
  const [medicinePage, setMedicinePage] = useState(1);
  const [medicineTotalPages, setMedicineTotalPages] = useState(1);
  const [medicineModal, setMedicineModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<any>(null);
  const [deleteMedicineModal, setDeleteMedicineModal] = useState(false);
  const [medicineFormData, setMedicineFormData] = useState({
    name: "",
    generic_name: "",
    manufacturer: "",
    category: "tablet" as "tablet" | "capsule" | "syrup" | "injection" | "other",
    unit: "tablet",
    current_stock: "",
    min_stock_level: "",
    max_stock_level: "",
    unit_price: "",
    selling_price: "",
    expiry_date: "",
    batch_number: "",
    status: "active" as "active" | "inactive" | "discontinued",
  });
  const [restockModal, setRestockModal] = useState(false);
  const [restockData, setRestockData] = useState({
    quantity: "",
    batch_number: "",
    expiry_date: "",
    unit_price: "",
    notes: "",
  });

  // Low stock alerts state
  const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([]);

  // Dispensing history state
  const [dispensingHistory, setDispensingHistory] = useState<any[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);

  useEffect(() => {
    loadStats();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "pending") {
      loadPrescriptions();
    }
  }, [activeTab, prescriptionPage]);

  useEffect(() => {
    if (activeTab === "inventory") {
      loadMedicines();
    }
  }, [activeTab, medicinePage]);

  useEffect(() => {
    if (activeTab === "alerts") {
      loadLowStockAlerts();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "history") {
      loadDispensingHistory();
    }
  }, [activeTab, historyPage]);

  useEffect(() => {
    if (!dispenseModal) {
      setDispenseData(null);
    }
  }, [dispenseModal]);

  const loadStats = async () => {
    try {
      const [prescriptionsRes, alertsRes] = await Promise.all([
        apiService.getPharmacyPrescriptions({ status: "pending_dispense", per_page: 1 }),
        apiService.getLowStockAlerts({ per_page: 1 }),
      ]);
      setStats({
        pendingPrescriptions: prescriptionsRes.data?.total || 0,
        lowStockCount: alertsRes.data?.count || 0,
        todayDispenses: 0, // Can be calculated from history
      });
    } catch (error: any) {
      console.error("Failed to load stats:", error);
    }
  };

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPharmacyPrescriptions({
        status: "pending_dispense",
        page: prescriptionPage,
        per_page: DEFAULT_PAGE_SIZE,
      });
      setPrescriptions(response.data?.data || []);
      setPrescriptionTotalPages(response.data?.last_page || 1);
    } catch (error: any) {
      showToast(error.message || "Failed to load prescriptions", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadMedicines = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMedicines({
        page: medicinePage,
        per_page: DEFAULT_PAGE_SIZE,
      });
      setMedicines(response.data?.data || []);
      setMedicineTotalPages(response.data?.last_page || 1);
    } catch (error: any) {
      showToast(error.message || "Failed to load medicines", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadLowStockAlerts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getLowStockAlerts({ per_page: 100 });
      setLowStockAlerts(response.data?.medicines || []);
    } catch (error: any) {
      showToast(error.message || "Failed to load low stock alerts", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadDispensingHistory = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDispensingHistory({
        page: historyPage,
        per_page: DEFAULT_PAGE_SIZE,
      });
      setDispensingHistory(response.data?.data || []);
      setHistoryTotalPages(response.data?.last_page || 1);
    } catch (error: any) {
      showToast(error.message || "Failed to load dispensing history", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDispensingHistory = (history: any) => {
    setSelectedHistory(history);
    setViewHistoryModal(true);
  };

  const handleViewMedicine = (medicine: any) => {
    setSelectedMedicine(medicine);
    setViewMedicineModal(true);
  };

  const handleViewPrescription = async (id: number) => {
    try {
      setLoading(true);
      const response = await apiService.getPharmacyPrescriptionDetails(id);
      setSelectedPrescription(response.data);
      setViewPrescriptionModal(true);
    } catch (error: any) {
      showToast(error.message || "Failed to load prescription details", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDispenseClick = async (prescription: any) => {
    try {
      setLoading(true);
      const response = await apiService.getPharmacyPrescriptionDetails(prescription.id);
      const prescriptionData = response.data;

      // Initialize dispense items
      const items = prescriptionData.items.map((item: any) => ({
        prescription_item_id: item.id,
        medicine_name: item.medicine_name,
        quantity_prescribed: item.quantity_prescribed,
        quantity_dispensed: item.quantity_dispensed,
        remaining: item.quantity_prescribed - item.quantity_dispensed,
        max_quantity: Math.max(0, Math.min(
          item.quantity_prescribed - item.quantity_dispensed,
          item.availability?.current_stock ?? 0
        )),
        availability: item.availability,
        quantity_to_dispense: Math.max(0, Math.min(
          item.quantity_prescribed - item.quantity_dispensed,
          item.availability?.current_stock ?? 0
        )),
        notes: "",
        dispense_type: item.availability?.status === 'not_in_catalog' ? 'manual_entry' :
          item.availability?.status === 'out_of_stock' ? 'stock_override' : 'from_stock',
        manual_medicine_name: "",
        manual_unit: "",
        unit_price: item.availability?.selling_price || "",
        dispense_remarks: "",
        alternative_medicine: "",
      }));

      setDispenseData({ prescription: prescriptionData, items });
      console.log('Dispense modal data:', { prescription: prescriptionData, items });
      setDispenseModal(true);
    } catch (error: any) {
      console.error('Error in handleDispenseClick:', error);
      showToast(error.message || "Failed to load prescription details", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDispenseSubmit = async () => {
    try {
      setLoading(true);
      const items = dispenseData?.items || [];
      const validItems = items
        .filter((item) =>
          item.quantity_to_dispense > 0 ||
          item.dispense_type === 'not_dispensed' ||
          item.dispense_type === 'external_purchase'
        )
        .map((item) => ({
          prescription_item_id: item.prescription_item_id,
          quantity_dispensed: (item.dispense_type === 'not_dispensed' || item.dispense_type === 'external_purchase')
            ? 0 // Ensure 0 for these types
            : item.quantity_to_dispense,
          notes: item.notes || undefined,
          dispense_type: item.dispense_type,
          manual_medicine_name: item.manual_medicine_name || undefined,
          manual_unit: item.manual_unit || undefined,
          unit_price: item.unit_price ? parseFloat(item.unit_price) : undefined,
          dispense_remarks: item.dispense_remarks || undefined,
          alternative_medicine: item.alternative_medicine || undefined,
        }));

      if (validItems.length === 0) {
        showToast("Please take action on at least one medicine", "error");
        return;
      }

      await apiService.dispensePrescription(dispenseData?.prescription?.id, {
        items: validItems,
      });

      showToast("Medicines dispensed successfully", "success");
      setDispenseModal(false);
      loadPrescriptions();
      loadStats();
    } catch (error: any) {
      showToast(error.message || "Failed to dispense medicines", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRestockClick = (medicine: any) => {
    setSelectedMedicine(medicine);
    setRestockData({
      quantity: "",
      batch_number: "",
      expiry_date: "",
      unit_price: "",
      notes: "",
    });
    setRestockModal(true);
  };

  const handleRestockSubmit = async () => {
    try {
      setLoading(true);
      await apiService.restockMedicine(selectedMedicine.id, {
        quantity: parseInt(restockData.quantity),
        batch_number: restockData.batch_number || undefined,
        expiry_date: restockData.expiry_date || undefined,
        unit_price: restockData.unit_price ? parseFloat(restockData.unit_price) : undefined,
        notes: restockData.notes || undefined,
      });

      showToast("Medicine restocked successfully", "success");
      setRestockModal(false);
      loadMedicines();
      loadLowStockAlerts();
      loadStats();
    } catch (error: any) {
      showToast(error.message || "Failed to restock medicine", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedicineClick = () => {
    setSelectedMedicine(null);
    setMedicineFormData({
      name: "",
      generic_name: "",
      manufacturer: "",
      category: "tablet",
      unit: "tablet",
      current_stock: "",
      min_stock_level: "10",
      max_stock_level: "",
      unit_price: "",
      selling_price: "",
      expiry_date: "",
      batch_number: "",
      status: "active",
    });
    setMedicineModal(true);
  };

  const handleEditMedicineClick = (medicine: any) => {
    setSelectedMedicine(medicine);
    setMedicineFormData({
      name: medicine.name || "",
      generic_name: medicine.generic_name || "",
      manufacturer: medicine.manufacturer || "",
      category: medicine.category || "tablet",
      unit: medicine.unit || "tablet",
      current_stock: medicine.current_stock?.toString() || "",
      min_stock_level: medicine.min_stock_level?.toString() || "10",
      max_stock_level: medicine.max_stock_level?.toString() || "",
      unit_price: medicine.unit_price?.toString() || "",
      selling_price: medicine.selling_price?.toString() || "",
      expiry_date: medicine.expiry_date || "",
      batch_number: medicine.batch_number || "",
      status: medicine.status || "active",
    });
    setMedicineModal(true);
  };

  const handleDeleteMedicineClick = (medicine: any) => {
    setSelectedMedicine(medicine);
    setDeleteMedicineModal(true);
  };

  const handleMedicineSubmit = async () => {
    try {
      setLoading(true);
      const data = {
        name: medicineFormData.name,
        generic_name: medicineFormData.generic_name || undefined,
        manufacturer: medicineFormData.manufacturer || undefined,
        category: medicineFormData.category,
        unit: medicineFormData.unit,
        current_stock: parseInt(medicineFormData.current_stock),
        min_stock_level: parseInt(medicineFormData.min_stock_level),
        max_stock_level: medicineFormData.max_stock_level ? parseInt(medicineFormData.max_stock_level) : undefined,
        unit_price: parseFloat(medicineFormData.unit_price),
        selling_price: parseFloat(medicineFormData.selling_price),
        expiry_date: medicineFormData.expiry_date || undefined,
        batch_number: medicineFormData.batch_number || undefined,
        status: medicineFormData.status,
      };

      if (selectedMedicine) {
        await apiService.updateMedicine(selectedMedicine.id, data);
        showToast("Medicine updated successfully", "success");
      } else {
        await apiService.createMedicine(data);
        showToast("Medicine created successfully", "success");
      }

      setMedicineModal(false);
      loadMedicines();
      loadLowStockAlerts();
      loadStats();
    } catch (error: any) {
      showToast(error.message || "Failed to save medicine", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMedicine = async () => {
    try {
      setLoading(true);
      await apiService.deleteMedicine(selectedMedicine.id);
      showToast("Medicine deleted successfully", "success");
      setDeleteMedicineModal(false);
      loadMedicines();
      loadLowStockAlerts();
      loadStats();
    } catch (error: any) {
      showToast(error.message || "Failed to delete medicine", "error");
    } finally {
      setLoading(false);
    }
  };

  const getAvailabilityBadge = (prescription: any) => {
    const available = prescription.available_items_count || 0;
    const unavailable = prescription.unavailable_items_count || 0;
    const total = prescription.items_count || 0;

    if (unavailable === 0) {
      return <Chip value="Ready to Dispense" color="green" size="sm" />;
    } else if (available > 0) {
      return <Chip value="Attention Needed" color="yellow" size="sm" />;
    } else {
      return <Chip value="Action Needed" color="orange" size="sm" />;
    }
  };

  const prescriptionColumns: Column[] = [
    {
      key: "id",
      label: "Prescription ID",
      render: (value: any) => `${value}`,
    },
    {
      key: "patient",
      label: "Patient",
      render: (value: any) => value?.name || "N/A",
    },
    {
      key: "doctor",
      label: "Doctor",
      render: (value: any) => value?.name || "N/A",
    },
    {
      key: "created_at",
      label: "Date",
      render: (value: any) => new Date(value).toLocaleDateString(),
    },
    {
      key: "items_count",
      label: "Medicines",
      render: (value: any) => `${value || 0} medicines`,
    },
    {
      key: "availability",
      label: "Availability",
      render: (value: any, row: any) => getAvailabilityBadge(row),
    },
    {
      key: "status",
      label: "Status",
      type: "badge" as const,
      render: (value: any) => (
        <Chip
          value={value?.replace(/_/g, " ").toUpperCase() || "PENDING"}
          color={
            value === "dispensed"
              ? "green"
              : value === "partially_dispensed"
                ? "yellow"
                : value === "externally_purchased"
                  ? "blue"
                  : value === "not_dispensed"
                    ? "red"
                    : "blue-gray"
          }
          size="sm"
        />
      ),
    },
  ];

  const medicineColumns: Column[] = [
    {
      key: "name",
      label: "Medicine Name",
    },
    {
      key: "generic_name",
      label: "Generic Name",
      render: (value: any) => value || "-",
    },
    {
      key: "category",
      label: "Category",
      render: (value: any) => value?.toUpperCase() || "-",
    },
    {
      key: "current_stock",
      label: "Current Stock",
      render: (value: any, row: any) => `${value} ${row.unit}`,
    },
    {
      key: "min_stock_level",
      label: "Min Level",
      render: (value: any, row: any) => `${value} ${row.unit}`,
    },
    {
      key: "selling_price",
      label: "Selling Price",
      render: (value: any) => `$${parseFloat(value).toFixed(2)}`,
    },
    {
      key: "status",
      label: "Status",
      type: "badge" as const,
      render: (value: any) => (
        <Chip
          value={value?.toUpperCase() || "ACTIVE"}
          color={value === "active" ? "green" : "gray"}
          size="sm"
        />
      ),
    },
    {
      key: "stock_status",
      label: "Stock Status",
      render: (value: any, row: any) => {
        if (row.current_stock === 0) {
          return <Chip value="Out of Stock" color="red" size="sm" />;
        } else if (row.is_low_stock) {
          return <Chip value="Low Stock" color="yellow" size="sm" />;
        } else {
          return <Chip value="Good" color="green" size="sm" />;
        }
      },
    },
  ];

  const prescriptionViewFields: ViewField[] = [
    { key: "id", label: "Prescription ID", render: (value: any) => `${value}` },
    { key: "patient", label: "Patient", render: (value: any) => value?.name || "N/A" },
    { key: "doctor", label: "Doctor", render: (value: any) => value?.name || "N/A" },
    { key: "created_at", label: "Date", type: "date" },
    { key: "diagnosis", label: "Diagnosis", fullWidth: true },
    { key: "status", label: "Status", type: "status" },
    {
      key: "items",
      label: "Medicines",
      fullWidth: true,
      render: (items: any[]) => (
        <div className="grid grid-cols-1 gap-4 mt-2">
          {items?.map((item: any, index: number) => (
            <Card key={index} className="border border-blue-gray-100 p-4 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <Typography variant="h6" color="blue-gray" className="text-sm">
                  {item.medicine_name}
                </Typography>
                <Chip
                  value={
                    item.availability?.status === "available" || item.availability?.status === "available_low_stock"
                      ? "Available"
                      : item.availability?.status === "low_stock"
                        ? "Insufficient Stock"
                        : item.availability?.status === "out_of_stock"
                          ? "Out of Stock"
                          : "Not in Catalog"
                  }
                  color={
                    item.availability?.status === "available" || item.availability?.status === "available_low_stock"
                      ? "green"
                      : item.availability?.status === "low_stock"
                        ? "orange"
                        : "red"
                  }
                  size="sm"
                  className="rounded-full px-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-blue-gray-600">
                <div className="flex justify-between">
                  <span>Prescribed:</span>
                  <span className="font-semibold">{item.quantity_prescribed} units</span>
                </div>
                <div className="flex justify-between">
                  <span>Dispensed:</span>
                  <span className="font-semibold">{item.quantity_dispensed} units</span>
                </div>
                {item.availability?.current_stock !== undefined && (
                  <div className="flex justify-between">
                    <span>In Stock:</span>
                    <span className="font-semibold">
                      {item.availability.current_stock} {item.availability.unit}
                    </span>
                  </div>
                )}
                {item.availability?.selling_price && (
                  <div className="flex justify-between">
                    <span>Price:</span>
                    <span className="font-semibold">
                      ${parseFloat(item.availability.selling_price).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-2 text-xs text-gray-500 italic">
                {item.instructions}
              </div>
            </Card>
          ))}
        </div>
      )
    }
  ];

  const medicineViewFields: ViewField[] = [
    { key: "name", label: "Medicine Name" },
    { key: "generic_name", label: "Generic Name" },
    { key: "category", label: "Category", render: (value: string) => value?.toUpperCase() || "N/A" },
    { key: "manufacturer", label: "Manufacturer" },
    { key: "unit", label: "Unit" },
    { key: "current_stock", label: "Current Stock", render: (value: any, row: any) => `${value} ${row.unit || ''}` },
    { key: "min_stock_level", label: "Min Stock Level", render: (value: any, row: any) => `${value} ${row.unit || ''}` },
    { key: "max_stock_level", label: "Max Stock Level", render: (value: any, row: any) => value ? `${value} ${row.unit || ''}` : "N/A" },
    { key: "unit_price", label: "Unit Price", type: "currency" },
    { key: "selling_price", label: "Selling Price", type: "currency" },
    { key: "batch_number", label: "Batch Number" },
    { key: "expiry_date", label: "Expiry Date", type: "date" },
    { key: "status", label: "Status", type: "status" },
  ];

  const historyViewFields: ViewField[] = [
    { key: "id", label: "Dispense ID", render: (value: any) => `#${value}` },
    { key: "prescription", label: "Prescription ID", render: (value: any) => `${value?.id || "N/A"}` },
    { key: "prescription", label: "Patient", render: (value: any) => value?.patient?.name || "N/A" },
    { key: "medicine_name", label: "Medicine Name" },
    { key: "quantity_dispensed", label: "Quantity Dispensed", render: (value: any) => `${value} units` },
    { key: "unit_price", label: "Unit Price", type: "currency" },
    { key: "total_price", label: "Total Price", type: "currency" },
    { key: "dispense_type", label: "Dispense Type", render: (value: string) => value?.replace(/_/g, ' ').toUpperCase() },
    { key: "dispensed_by", label: "Dispensed By", render: (value: any) => value?.name || "N/A" },
    { key: "dispensed_at", label: "Dispensed At", type: "datetime" },
    { key: "notes", label: "Notes", fullWidth: true },
  ];

  return (
    <div className="mt-12 mb-8">
      <div className="mb-4">
        <Typography variant="h2" color="blue-gray" className="mb-2">
          Pharmacy Management
        </Typography>
        <Typography variant="small" color="blue-gray">
          Manage medicine inventory, prescriptions, and dispensing
        </Typography>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border border-blue-gray-100">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="small" color="blue-gray" className="mb-1">
                  Pending Prescriptions
                </Typography>
                <Typography variant="h4" color="blue-gray">
                  {stats.pendingPrescriptions}
                </Typography>
              </div>
              <ClipboardDocumentListIcon className="h-12 w-12 text-blue-500" />
            </div>
          </CardBody>
        </Card>

        <Card className="border border-blue-gray-100">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="small" color="blue-gray" className="mb-1">
                  Low Stock Alerts
                </Typography>
                <Typography variant="h4" color="blue-gray">
                  {stats.lowStockCount}
                </Typography>
              </div>
              <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500" />
            </div>
          </CardBody>
        </Card>

        <Card className="border border-blue-gray-100">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="small" color="blue-gray" className="mb-1">
                  Today's Dispenses
                </Typography>
                <Typography variant="h4" color="blue-gray">
                  {stats.todayDispenses}
                </Typography>
              </div>
              <ClockIcon className="h-12 w-12 text-green-500" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="border border-blue-gray-100 shadow-sm">
        <CardBody className="p-0">
          <Tabs value={activeTab}>
            <TabsHeader
              className="bg-transparent border-b border-blue-gray-50 px-6 rounded-none"
              indicatorProps={{
                className: "bg-blue-500/10 shadow-none border-b-2 border-blue-500 rounded-none !z-0",
              }}
            >
              <Tab
                value="pending"
                onClick={() => setActiveTab("pending")}
                className={`py-4 font-semibold text-sm transition-colors duration-300 ${activeTab === "pending" ? "text-blue-500" : "text-blue-gray-500 hover:text-blue-700"
                  }`}
              >
                Pending Prescriptions
              </Tab>
              <Tab
                value="inventory"
                onClick={() => setActiveTab("inventory")}
                className={`py-4 font-semibold text-sm transition-colors duration-300 ${activeTab === "inventory" ? "text-blue-500" : "text-blue-gray-500 hover:text-blue-700"
                  }`}
              >
                Medicine Inventory
              </Tab>
              <Tab
                value="history"
                onClick={() => setActiveTab("history")}
                className={`py-4 font-semibold text-sm transition-colors duration-300 ${activeTab === "history" ? "text-blue-500" : "text-blue-gray-500 hover:text-blue-700"
                  }`}
              >
                Dispensing History
              </Tab>
              <Tab
                value="alerts"
                onClick={() => setActiveTab("alerts")}
                className={`py-4 font-semibold text-sm transition-colors duration-300 ${activeTab === "alerts" ? "text-blue-500" : "text-blue-gray-500 hover:text-blue-700"
                  }`}
              >
                Low Stock Alerts {stats.lowStockCount > 0 && (
                  <Chip value={stats.lowStockCount} color="red" size="sm" className="ml-2" />
                )}
              </Tab>
            </TabsHeader>

            <TabsBody>
              {/* Pending Prescriptions Tab */}
              <TabPanel value="pending" className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <DataTable
                    title="Pending Prescriptions"
                    data={prescriptions}
                    columns={prescriptionColumns}
                    searchable={true}
                    pagination={{
                      currentPage: prescriptionPage,
                      totalPages: prescriptionTotalPages,
                      onPageChange: setPrescriptionPage,
                    }}
                    customActions={(row) => [
                      {
                        label: "View Details",
                        icon: <EyeIcon className="h-4 w-4" />,
                        onClick: () => handleViewPrescription(row.id),
                      },
                      {
                        label: "Dispense",
                        icon: <BeakerIcon className="h-4 w-4" />,
                        color: "green",
                        onClick: () => handleDispenseClick(row),
                      },
                    ]}
                  />
                )}
              </TabPanel>

              {/* Medicine Inventory Tab */}
              <TabPanel value="inventory" className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <>
                    <div className="mb-8 flex justify-end">
                      <Button
                        variant="gradient"
                        color="blue"
                        className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                        onClick={handleAddMedicineClick}
                      >
                        <PlusIcon className="h-5 w-5" />
                        Add Medicine
                      </Button>
                    </div>
                    <DataTable
                      title="Medicine Inventory"
                      data={medicines}
                      columns={medicineColumns}
                      searchable={true}
                      pagination={{
                        currentPage: medicinePage,
                        totalPages: medicineTotalPages,
                        onPageChange: setMedicinePage,
                      }}
                      onEdit={handleEditMedicineClick}
                      onDelete={handleDeleteMedicineClick}
                      customActions={(row) => [
                        {
                          label: "View Details",
                          icon: <EyeIcon className="h-4 w-4" />,
                          onClick: () => handleViewMedicine(row),
                        },
                        {
                          label: "Restock",
                          icon: <ArrowPathIcon className="h-4 w-4" />,
                          color: "blue",
                          onClick: () => handleRestockClick(row),
                        },
                      ]}
                    />
                  </>
                )}
              </TabPanel>
              <TabPanel value="history" className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <DataTable
                    title="Dispensing History"
                    data={dispensingHistory}
                    columns={[
                      {
                        key: "dispensed_at",
                        label: "Date/Time",
                        render: (value: any) => new Date(value).toLocaleString(),
                      },
                      {
                        key: "prescription",
                        label: "Prescription ID",
                        render: (value: any) => `${value?.id || "N/A"}`,
                      },
                      {
                        key: "prescription",
                        label: "Patient",
                        render: (value: any) => value?.patient?.name || "N/A",
                      },
                      {
                        key: "medicine_name",
                        label: "Medicine",
                      },
                      {
                        key: "quantity_dispensed",
                        label: "Quantity",
                        render: (value: any, row: any) => `${value} units`,
                      },
                      {
                        key: "total_price",
                        label: "Total Price",
                        render: (value: any) => `$${parseFloat(value).toFixed(2)}`,
                      },
                      {
                        key: "dispensed_by",
                        label: "Dispensed By",
                        render: (value: any) => value?.name || "N/A",
                      },
                    ]}
                    searchable={true}
                    pagination={{
                      currentPage: historyPage,
                      totalPages: historyTotalPages,
                      onPageChange: setHistoryPage,
                    }}
                    customActions={(row) => [
                      {
                        label: "View Details",
                        icon: <EyeIcon className="h-4 w-4" />,
                        onClick: () => handleViewDispensingHistory(row),
                      }
                    ]}
                  />
                )}
              </TabPanel>

              {/* Low Stock Alerts Tab */}
              <TabPanel value="alerts" className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lowStockAlerts.map((medicine) => (
                      <Card key={medicine.id} className="border border-red-200">
                        <CardBody>
                          <Typography variant="h6" color="blue-gray" className="mb-2">
                            {medicine.name}
                          </Typography>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <Typography variant="small" color="blue-gray">
                                Current Stock:
                              </Typography>
                              <Typography variant="small" className="font-semibold text-red-600">
                                {medicine.current_stock} {medicine.unit}
                              </Typography>
                            </div>
                            <div className="flex justify-between">
                              <Typography variant="small" color="blue-gray">
                                Min Level:
                              </Typography>
                              <Typography variant="small" className="font-semibold">
                                {medicine.min_stock_level} {medicine.unit}
                              </Typography>
                            </div>
                            <div className="flex justify-between">
                              <Typography variant="small" color="blue-gray">
                                Needed:
                              </Typography>
                              <Typography variant="small" className="font-semibold text-red-600">
                                {medicine.stock_needed} {medicine.unit}
                              </Typography>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            color="blue"
                            className="mt-4 w-full"
                            onClick={() => handleRestockClick(medicine)}
                          >
                            Restock
                          </Button>
                        </CardBody>
                      </Card>
                    ))}
                    {lowStockAlerts.length === 0 && (
                      <div className="col-span-full text-center py-12">
                        <Typography variant="h6" color="blue-gray">
                          No Low Stock Alerts
                        </Typography>
                        <Typography variant="small" color="blue-gray">
                          All medicines are well stocked
                        </Typography>
                      </div>
                    )}
                  </div>
                )}
              </TabPanel>
            </TabsBody>
          </Tabs>
        </CardBody>
      </Card>

      {/* View Prescription Details Modal */}
      <ViewModal
        open={viewPrescriptionModal}
        onClose={() => setViewPrescriptionModal(false)}
        title="Prescription Details"
        data={selectedPrescription || {}}
        fields={prescriptionViewFields}
        actionButton={
          <Button
            color="blue"
            onClick={() => {
              setViewPrescriptionModal(false);
              handleDispenseClick(selectedPrescription);
            }}
          >
            Dispense
          </Button>
        }
      />

      {/* View Medicine Details Modal */}
      <ViewModal
        open={viewMedicineModal}
        onClose={() => setViewMedicineModal(false)}
        title="Medicine Details"
        data={selectedMedicine || {}}
        fields={medicineViewFields}
      />

      {/* View Dispensing History Modal */}
      <ViewModal
        open={viewHistoryModal}
        onClose={() => setViewHistoryModal(false)}
        title="Dispensing Record Details"
        data={selectedHistory || {}}
        fields={historyViewFields}
      />

      {/* Dispense Modal */}
      <Dialog open={dispenseModal} handler={() => setDispenseModal(!dispenseModal)} size="xl">
        <DialogHeader>Dispense Medicines</DialogHeader>
        <DialogBody className="overflow-y-auto max-h-[70vh]">
          {(() => {
            try {
              const prescription = dispenseData?.prescription;
              const items = dispenseData?.items || [];
              return prescription ? (
                <div className="space-y-4">
                  <div className="mb-4 p-4 bg-blue-50 rounded">
                    <Typography variant="small" color="blue-gray">
                      <strong>Patient:</strong> {prescription.patient?.name || "N/A"}
                    </Typography>
                    <Typography variant="small" color="blue-gray">
                      <strong>Prescription Date:</strong> {new Date(prescription.created_at).toLocaleDateString()}
                    </Typography>
                  </div>
                  {items.map((item, index) => (
                    <Card key={index} className="border border-blue-gray-100 p-4">
                      <div className="flex justify-between items-start mb-3">
                        <Typography variant="h6" color="blue-gray">
                          {item.medicine_name}
                        </Typography>
                        <Chip
                          value={
                            item.availability?.status === "available" || item.availability?.status === "available_low_stock"
                              ? "In Catalog"
                              : item.availability?.status === "low_stock"
                                ? "Insufficient Stock"
                                : item.availability?.status === "out_of_stock"
                                  ? "Stock Empty"
                                  : "Not in Catalog"
                          }
                          color={
                            item.availability?.status === "available" || item.availability?.status === "available_low_stock"
                              ? "green"
                              : item.availability?.status === "low_stock"
                                ? "orange"
                                : "red"
                          }
                          size="sm"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-sm mb-4 p-3 bg-gray-50 rounded">
                        <div>
                          <span className="text-blue-gray-600">Prescribed: </span>
                          <span className="font-semibold">{item.quantity_prescribed} units</span>
                        </div>
                        <div>
                          <span className="text-blue-gray-600">System Stock: </span>
                          <span className="font-semibold">
                            {item.availability?.current_stock || 0} {item.availability?.unit || "units"}
                          </span>
                        </div>
                        <div>
                          <span className="text-blue-gray-600">Max Dispense: </span>
                          <span className="font-semibold">{item.max_quantity} units</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="bg-blue-50 p-3 rounded border border-blue-100 mb-2">
                          <Typography variant="small" color="blue-gray" className="font-bold mb-1">
                            ⚠️ Decision Required: How will you handle this medicine?
                          </Typography>
                          <Select
                            label="Select Action"
                            value={item.dispense_type}
                            onChange={(val) => {
                              const newItems = [...items];
                              newItems[index].dispense_type = val as string;
                              setDispenseData({ ...dispenseData, items: newItems });
                            }}
                          >
                            <Option value="from_stock">✅ Dispense from Stock (Normal)</Option>
                            <Option value="manual_entry">📝 Available Physically (Not in Catalog)</Option>
                            <Option value="stock_override">🔢 Available Physically (Stock Count Wrong)</Option>
                            <Option value="external_purchase">🏪 Patient will Buy Outside</Option>
                            <Option value="alternative">💊 Substitute/Alternative</Option>
                            <Option value="not_dispensed">❌ Not Available (Cancel Item)</Option>
                          </Select>
                        </div>

                        {/* Conditional Fields Based on Dispense Type */}
                        {item.dispense_type === 'manual_entry' && (
                          <div className="p-3 bg-green-50 border border-green-200 rounded">
                            <Typography variant="small" color="green" className="mb-2 font-semibold">
                              👉 Enter details of the medicine you are dispensing:
                            </Typography>
                            <Input
                              label="Actual Medicine Name *"
                              value={item.manual_medicine_name}
                              onChange={(e) => {
                                const newItems = [...items];
                                newItems[index].manual_medicine_name = e.target.value;
                                setDispenseData({ ...dispenseData, items: newItems });
                              }}
                              className="mb-2"
                              crossOrigin={undefined}
                            />
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <Input
                                label="Unit (e.g., tablet) *"
                                value={item.manual_unit}
                                onChange={(e) => {
                                  const newItems = [...items];
                                  newItems[index].manual_unit = e.target.value;
                                  setDispenseData({ ...dispenseData, items: newItems });
                                }}
                                crossOrigin={undefined}
                              />
                              <Input
                                label="Unit Price *"
                                type="number"
                                step="0.01"
                                min="0"
                                value={item.unit_price}
                                onChange={(e) => {
                                  const newItems = [...items];
                                  newItems[index].unit_price = e.target.value;
                                  setDispenseData({ ...dispenseData, items: newItems });
                                }}
                                crossOrigin={undefined}
                              />
                            </div>
                            <Typography variant="small" color="gray" className="mt-2 text-xs italic">
                              * You'll be prompted to add this to the catalog after dispensing.
                            </Typography>
                          </div>
                        )}

                        {item.dispense_type === 'stock_override' && (
                          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                            <Typography variant="small" color="orange" className="mb-2 font-bold">
                              ⚠️ Reporting Inventory Mismatch
                            </Typography>
                            <Typography variant="small" color="blue-gray" className="mb-2">
                              This will dispense the medicine without deducting from system stock and flag the item for inventory check.
                            </Typography>
                            <Input
                              label="Unit Price (Optional, defaults to catalog)"
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.unit_price}
                              onChange={(e) => {
                                const newItems = [...items];
                                newItems[index].unit_price = e.target.value;
                                setDispenseData({ ...dispenseData, items: newItems });
                              }}
                              crossOrigin={undefined}
                            />
                          </div>
                        )}

                        {item.dispense_type === 'alternative' && (
                          <div className="p-3 bg-purple-50 border border-purple-200 rounded">
                            <Typography variant="small" color="purple" className="mb-2 font-bold">
                              💊 Substitute Medicine
                            </Typography>
                            <Input
                              label="Alternative Medicine Name *"
                              value={item.alternative_medicine}
                              onChange={(e) => {
                                const newItems = [...items];
                                newItems[index].alternative_medicine = e.target.value;
                                setDispenseData({ ...dispenseData, items: newItems });
                              }}
                              crossOrigin={undefined}
                            />
                            <Input
                              label="Unit Price (if not in catalog) *"
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.unit_price}
                              onChange={(e) => {
                                const newItems = [...items];
                                newItems[index].unit_price = e.target.value;
                                setDispenseData({ ...dispenseData, items: newItems });
                              }}
                              className="mt-2"
                              crossOrigin={undefined}
                            />
                          </div>
                        )}

                        {item.dispense_type === 'external_purchase' && (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                            <Typography variant="small" color="blue" className="font-bold">
                              🏪 External Purchase
                            </Typography>
                            <Typography variant="small" color="blue-gray">
                              This item will be marked as "Externally Purchased". No charge will be added.
                            </Typography>
                          </div>
                        )}

                        {item.dispense_type === 'not_dispensed' && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded">
                            <Typography variant="small" color="red" className="font-bold">
                              ❌ Item Not Dispensed
                            </Typography>
                            <Typography variant="small" color="blue-gray">
                              This item will be marked as unavailable/not dispensed.
                            </Typography>
                          </div>
                        )}

                        {/* Quantity to Dispense - Hide for not_dispensed */}
                        {item.dispense_type !== 'not_dispensed' && item.dispense_type !== 'external_purchase' && (
                          <Input
                            label="Quantity to Dispense *"
                            type="number"
                            min="0"
                            max={item.dispense_type === 'from_stock' ? item.max_quantity : item.remaining}
                            value={item.quantity_to_dispense}
                            onChange={(e) => {
                              const newItems = [...items];
                              newItems[index].quantity_to_dispense = parseInt(e.target.value) || 0;
                              setDispenseData({ ...dispenseData, items: newItems });
                            }}
                            crossOrigin={undefined}
                          />
                        )}

                        {/* Notes */}
                        <Textarea
                          label="Pharmacist Notes (Optional)"
                          value={item.notes}
                          onChange={(e) => {
                            const newItems = [...items];
                            newItems[index].notes = e.target.value;
                            setDispenseData({ ...dispenseData, items: newItems });
                          }}
                        />

                        {/* Price Calculation */}
                        {item.dispense_type !== 'not_dispensed' && item.dispense_type !== 'external_purchase' && item.quantity_to_dispense > 0 && (
                          <div className="p-3 bg-gray-100 rounded flex justify-between items-center">
                            <Typography variant="small" color="blue-gray">
                              Unit Price: <strong>
                                ${(() => {
                                  return (item.unit_price
                                    ? parseFloat(item.unit_price)
                                    : parseFloat(item.availability?.selling_price || "0")).toFixed(2);
                                })()}
                              </strong>
                            </Typography>
                            <Typography variant="h6" color="blue">
                              Total: $
                              {(() => {
                                const price = item.unit_price
                                  ? parseFloat(item.unit_price)
                                  : parseFloat(item.availability?.selling_price || "0");
                                return (item.quantity_to_dispense * price).toFixed(2);
                              })()}
                            </Typography>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}

                  {/* Total Amount */}
                  <div className="mt-4 p-4 bg-blue-gray-50 rounded">
                    <Typography variant="h6" color="blue-gray">
                      Total Amount: $
                      {items
                        .reduce((sum, item) => {
                          if (item.quantity_to_dispense > 0) {
                            const price = item.unit_price
                              ? parseFloat(item.unit_price)
                              : parseFloat(item.availability?.selling_price || "0");
                            return sum + item.quantity_to_dispense * price;
                          }
                          return sum;
                        }, 0)
                        .toFixed(2)}
                    </Typography>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center items-center p-8">
                  <Typography>No prescription data available</Typography>
                </div>
              );
            } catch (error) {
              console.error('Error rendering dispense modal:', error);
              return (
                <div className="flex justify-center items-center p-8">
                  <Typography color="red">Error loading prescription details. Please try again.</Typography>
                </div>
              );
            }
          })()}
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="red" onClick={() => setDispenseModal(false)}>
            Cancel
          </Button>
          <Button color="blue" onClick={handleDispenseSubmit} disabled={loading}>
            {loading ? "Processing..." : "Confirm Dispense"}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Add/Edit Medicine Modal */}
      <Dialog open={medicineModal} handler={() => setMedicineModal(!medicineModal)} size="lg">
        <DialogHeader>
          {selectedMedicine ? "Edit Medicine" : "Add New Medicine"}
        </DialogHeader>
        <DialogBody>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Medicine Name *"
                value={medicineFormData.name}
                onChange={(e) => setMedicineFormData({ ...medicineFormData, name: e.target.value })}
                crossOrigin={undefined}
              />
              <Input
                label="Generic Name"
                value={medicineFormData.generic_name}
                onChange={(e) => setMedicineFormData({ ...medicineFormData, generic_name: e.target.value })}
                crossOrigin={undefined}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Manufacturer"
                value={medicineFormData.manufacturer}
                onChange={(e) => setMedicineFormData({ ...medicineFormData, manufacturer: e.target.value })}
                crossOrigin={undefined}
              />
              <Select
                label="Category *"
                value={medicineFormData.category}
                onChange={(val) => setMedicineFormData({ ...medicineFormData, category: val as any })}
              >
                <Option value="tablet">Tablet</Option>
                <Option value="capsule">Capsule</Option>
                <Option value="syrup">Syrup</Option>
                <Option value="injection">Injection</Option>
                <Option value="other">Other</Option>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Unit *"
                value={medicineFormData.unit}
                onChange={(e) => setMedicineFormData({ ...medicineFormData, unit: e.target.value })}
                crossOrigin={undefined}
              />
              <Select
                label="Status *"
                value={medicineFormData.status}
                onChange={(val) => setMedicineFormData({ ...medicineFormData, status: val as any })}
              >
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
                <Option value="discontinued">Discontinued</Option>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Current Stock *"
                type="number"
                min="0"
                value={medicineFormData.current_stock}
                onChange={(e) => setMedicineFormData({ ...medicineFormData, current_stock: e.target.value })}
                crossOrigin={undefined}
              />
              <Input
                label="Min Stock Level *"
                type="number"
                min="0"
                value={medicineFormData.min_stock_level}
                onChange={(e) => setMedicineFormData({ ...medicineFormData, min_stock_level: e.target.value })}
                crossOrigin={undefined}
              />
              <Input
                label="Max Stock Level"
                type="number"
                min="0"
                value={medicineFormData.max_stock_level}
                onChange={(e) => setMedicineFormData({ ...medicineFormData, max_stock_level: e.target.value })}
                crossOrigin={undefined}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Unit Price *"
                type="number"
                step="0.01"
                min="0"
                value={medicineFormData.unit_price}
                onChange={(e) => setMedicineFormData({ ...medicineFormData, unit_price: e.target.value })}
                crossOrigin={undefined}
              />
              <Input
                label="Selling Price *"
                type="number"
                step="0.01"
                min="0"
                value={medicineFormData.selling_price}
                onChange={(e) => setMedicineFormData({ ...medicineFormData, selling_price: e.target.value })}
                crossOrigin={undefined}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Batch Number"
                value={medicineFormData.batch_number}
                onChange={(e) => setMedicineFormData({ ...medicineFormData, batch_number: e.target.value })}
                crossOrigin={undefined}
              />
              <Input
                label="Expiry Date"
                type="date"
                value={medicineFormData.expiry_date}
                onChange={(e) => setMedicineFormData({ ...medicineFormData, expiry_date: e.target.value })}
                crossOrigin={undefined}
              />
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="red" onClick={() => setMedicineModal(false)}>
            Cancel
          </Button>
          <Button
            color="blue"
            onClick={handleMedicineSubmit}
            disabled={
              loading ||
              !medicineFormData.name ||
              !medicineFormData.unit ||
              !medicineFormData.current_stock ||
              !medicineFormData.min_stock_level ||
              !medicineFormData.unit_price ||
              !medicineFormData.selling_price
            }
          >
            {loading ? "Saving..." : selectedMedicine ? "Update Medicine" : "Create Medicine"}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Delete Medicine Confirmation Modal */}
      <Dialog open={deleteMedicineModal} handler={() => setDeleteMedicineModal(!deleteMedicineModal)} size="sm">
        <DialogHeader>Delete Medicine</DialogHeader>
        <DialogBody>
          <Typography>
            Are you sure you want to delete <strong>{selectedMedicine?.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="red" onClick={() => setDeleteMedicineModal(false)}>
            Cancel
          </Button>
          <Button color="red" onClick={handleDeleteMedicine} disabled={loading}>
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Restock Modal */}
      <Dialog open={restockModal} handler={() => setRestockModal(!restockModal)} size="md">
        <DialogHeader>Restock Medicine</DialogHeader>
        <DialogBody>
          {selectedMedicine && (
            <div className="space-y-4">
              <div>
                <Typography variant="small" color="blue-gray" className="mb-1">
                  Medicine
                </Typography>
                <Typography variant="paragraph" className="font-semibold">
                  {selectedMedicine.name}
                </Typography>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Typography variant="small" color="blue-gray" className="mb-1">
                    Current Stock
                  </Typography>
                  <Typography variant="paragraph">
                    {selectedMedicine.current_stock} {selectedMedicine.unit}
                  </Typography>
                </div>
                <div>
                  <Typography variant="small" color="blue-gray" className="mb-1">
                    Min Stock Level
                  </Typography>
                  <Typography variant="paragraph">
                    {selectedMedicine.min_stock_level} {selectedMedicine.unit}
                  </Typography>
                </div>
              </div>
              <Input
                label="Quantity to Add *"
                type="number"
                min="1"
                value={restockData.quantity}
                onChange={(e) => setRestockData({ ...restockData, quantity: e.target.value })}
                crossOrigin={undefined}
              />
              <Input
                label="Batch Number (Optional)"
                value={restockData.batch_number}
                onChange={(e) => setRestockData({ ...restockData, batch_number: e.target.value })}
                crossOrigin={undefined}
              />
              <Input
                label="Expiry Date (Optional)"
                type="date"
                value={restockData.expiry_date}
                onChange={(e) => setRestockData({ ...restockData, expiry_date: e.target.value })}
                crossOrigin={undefined}
              />
              <Input
                label="Unit Price for This Batch (Optional)"
                type="number"
                step="0.01"
                value={restockData.unit_price}
                onChange={(e) => setRestockData({ ...restockData, unit_price: e.target.value })}
                crossOrigin={undefined}
              />
              <Textarea
                label="Notes (Optional)"
                value={restockData.notes}
                onChange={(e) => setRestockData({ ...restockData, notes: e.target.value })}
              />
              {restockData.quantity && (
                <div className="p-4 bg-blue-gray-50 rounded">
                  <Typography variant="small" color="blue-gray">
                    New Stock After Restock:{" "}
                    <span className="font-semibold">
                      {selectedMedicine.current_stock + parseInt(restockData.quantity || "0")}{" "}
                      {selectedMedicine.unit}
                    </span>
                  </Typography>
                </div>
              )}
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="red" onClick={() => setRestockModal(false)}>
            Cancel
          </Button>
          <Button color="blue" onClick={handleRestockSubmit} disabled={loading || !restockData.quantity}>
            {loading ? "Processing..." : "Confirm Restock"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div >
  );
}
