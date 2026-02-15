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
  CubeIcon,
  TagIcon,
  TruckIcon,
  ArrowDownOnSquareIcon,
  ArrowUpOnSquareIcon,
  ClipboardDocumentCheckIcon,
  AdjustmentsHorizontalIcon,
  ChartBarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon,
  ArrowLongRightIcon,
  XCircleIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { apiService } from "@/services/api";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { DataTable, Column, ViewModal, ViewField, ActionItem, AdvancedFilter } from "@/components";

export default function Inventory(): JSX.Element {
  const { showToast } = useToast();
  const { user, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState("requests"); // Default to requests for better staff UX
  const [loading, setLoading] = useState(false);

  // State for all entities
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [adjustments, setAdjustments] = useState<any[]>([]);
  const [requestFilters, setRequestFilters] = useState<Record<string, any>>({});
  const [requestCurrentPage, setRequestCurrentPage] = useState(1);
  const [requestsTotalPages, setRequestsTotalPages] = useState(1);
  const [requestsTotalItems, setRequestsTotalItems] = useState(0);
  const [itemFilters, setItemFilters] = useState<Record<string, any>>({});
  const [purchaseFilters, setPurchaseFilters] = useState<Record<string, any>>({});
  const [issueFilters, setIssueFilters] = useState<Record<string, any>>({});
  const [adjustmentFilters, setAdjustmentFilters] = useState<Record<string, any>>({});
  const [categoryFilters, setCategoryFilters] = useState<Record<string, any>>({});
  const [vendorFilters, setVendorFilters] = useState<Record<string, any>>({});
  const [departments, setDepartments] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStock: 0,
    outOfStock: 0,
    nearExpiry: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    totalCategories: 0,
    totalVendors: 0,
  });

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"item" | "category" | "vendor" | "purchase" | "request" | "issue" | "adjustment">("item");
  const [selectedData, setSelectedData] = useState<any>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  useEffect(() => {
    loadData();
    if (departments.length === 0) loadDepartments();
  }, [activeTab, requestCurrentPage]);

  const loadDepartments = async () => {
    try {
      const res = await apiService.getDepartments(1, 100);
      setDepartments(res.data || []);
    } catch (e) { }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // Load stats from backend
      const statsData = await apiService.getInventoryStatistics();
      setStats(statsData as any);

      // Load all items for modals (needed in multiple tabs)
      const itemsRes = await apiService.getInventoryItems();
      const allItems = Array.isArray(itemsRes) ? itemsRes : itemsRes.data || [];

      switch (activeTab) {
        case "items":
          const itemsFilteredRes = await apiService.getInventoryItems(itemFilters);
          setItems(Array.isArray(itemsFilteredRes) ? itemsFilteredRes : itemsFilteredRes.data || []);
          const catRes = await apiService.getInventoryCategories();
          setCategories(Array.isArray(catRes) ? catRes : catRes.data || []);
          break;
        case "categories":
          const categoriesRes = await apiService.getInventoryCategories(categoryFilters);
          setCategories(Array.isArray(categoriesRes) ? categoriesRes : categoriesRes.data || []);
          break;
        case "vendors":
          const vendorsRes = await apiService.getInventoryVendors(vendorFilters);
          setVendors(Array.isArray(vendorsRes) ? vendorsRes : vendorsRes.data || []);
          break;
        case "purchases":
          const purchasesRes = await apiService.getInventoryPurchases(purchaseFilters);
          setPurchases(Array.isArray(purchasesRes) ? purchasesRes : purchasesRes.data || []);
          const vendRes = await apiService.getInventoryVendors();
          setVendors(Array.isArray(vendRes) ? vendRes : vendRes.data || []);
          setItems(allItems);
          break;
        case "requests":
          const reqsRes = await apiService.getInventoryRequests({
            page: requestCurrentPage,
            ...requestFilters
          });
          if (reqsRes.data) {
            setRequests(reqsRes.data);
            setRequestsTotalPages(reqsRes.last_page || 1);
            setRequestsTotalItems(reqsRes.total || 0);
          } else {
            setRequests(Array.isArray(reqsRes) ? reqsRes : []);
          }
          setItems(allItems);
          break;
        case "issues":
          const issuesRes = await apiService.getInventoryIssues(issueFilters);
          setIssues(Array.isArray(issuesRes) ? issuesRes : issuesRes.data || []);
          break;
        case "adjustments":
          const adjustmentsRes = await apiService.getInventoryAdjustments(adjustmentFilters);
          setAdjustments(Array.isArray(adjustmentsRes) ? adjustmentsRes : adjustmentsRes.data || []);
          setItems(allItems);
          break;
      }
    } catch (error: any) {
      showToast(error.message || "Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (type: any, data: any = null) => {
    setModalType(type);
    setSelectedData(data);
    setModalOpen(true);
  };

  const handleOpenViewModal = async (data: any) => {
    setLoading(true);
    try {
      let fullData = data;
      const type = data._type || modalType;

      // Fetch full details based on type to ensure all relationships are loaded
      if (type === 'item') fullData = await apiService.getInventoryItem(data.id);
      else if (type === 'category') fullData = await apiService.getInventoryCategory(data.id);
      else if (type === 'vendor') fullData = await apiService.getInventoryVendor(data.id);
      else if (type === 'purchase') fullData = await apiService.getInventoryPurchase(data.id);
      else if (type === 'request') fullData = await apiService.getInventoryRequest(data.id);
      else if (type === 'issue') fullData = (await apiService.getInventoryIssue(data.id));
      else if (type === 'adjustment') fullData = await apiService.getInventoryAdjustment(data.id);

      setSelectedData({ ...fullData, _type: type });
      setViewModalOpen(true);
    } catch (e: any) {
      showToast("Failed to fetch details: " + e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (row: any, status: string) => {
    try {
      await apiService.updateInventoryRequestStatus(row.id, { status });
      showToast(`Request ${status}`, "success");
      loadData();
    } catch (e: any) {
      showToast(e.message, "error");
    }
  };

  // --- Render Functions for Tabs ---

  const renderItemsTab = () => {
    const columns: Column[] = [
      { key: "name", label: "Item Name" },
      { key: "category", label: "Category", render: (cat: any) => cat?.name || "N/A" },
      { key: "unit", label: "Unit" },
      {
        key: "current_stock",
        label: "Stock",
        render: (val: any, row: any) => (
          <div className="flex items-center gap-2">
            <Typography variant="small" className="font-bold">
              {val}
            </Typography>
            {row.low_stock_alert && (
              <Chip value="Low" color="orange" size="sm" variant="ghost" />
            )}
            {row.expiry_alert && (
              <Chip value="Expiring" color="red" size="sm" variant="ghost" />
            )}
          </div>
        )
      },
      { key: "min_stock_level", label: "Min Level" },
      { key: "expiry_date", label: "Expiry", render: (val: any) => val ? new Date(val).toLocaleDateString() : "N/A" },
    ];

    return (
      <CardBody className="p-0">
        <div className="px-4 py-2 border-b border-blue-gray-50 bg-blue-gray-50/20">
          <AdvancedFilter
            config={{
              fields: [
                {
                  name: 'category_id',
                  label: 'Category',
                  type: 'select',
                  options: [
                    { label: 'All Categories', value: '' },
                    ...categories.map(c => ({ label: c.name, value: c.id.toString() }))
                  ]
                },
                {
                  name: 'stock_status', label: 'Stock Status', type: 'select', options: [
                    { label: 'All', value: '' },
                    { label: 'Low Stock', value: 'low' },
                    { label: 'Out of Stock', value: 'out' }
                  ]
                },
              ],
              onApplyFilters: (f) => { setItemFilters(f); loadData(); },
              onResetFilters: () => { setItemFilters({}); loadData(); }
            }}
          />
        </div>
        <DataTable
          title="Inventory Items"
          data={items}
          columns={columns}
          onAdd={() => handleOpenModal("item")}
          onEdit={(row) => handleOpenModal("item", row)}
          onDelete={async (row) => {
            if (window.confirm("Are you sure you want to delete this item?")) {
              try {
                await apiService.deleteInventoryItem(row.id);
                showToast("Item deleted", "success");
                loadData();
              } catch (e: any) {
                showToast(e.message, "error");
              }
            }
          }}
          onView={(row) => handleOpenViewModal({ ...row, _type: 'item' })}
          searchable
          addButtonLabel="Add Item"
        />
      </CardBody>
    );
  };

  const renderCategoriesTab = () => {
    const columns: Column[] = [
      { key: "name", label: "Category Name" },
      { key: "description", label: "Description" },
      { key: "items_count", label: "Items Count" },
    ];
    return (
      <CardBody className="p-0">
        <div className="px-4 py-2 border-b border-blue-gray-50 bg-blue-gray-50/20">
          <AdvancedFilter
            config={{
              fields: [
                { name: 'keyword', label: 'Search Categories', type: 'text' }
              ],
              onApplyFilters: (f) => { setCategoryFilters(f); loadData(); },
              onResetFilters: () => { setCategoryFilters({}); loadData(); }
            }}
          />
        </div>
        <DataTable
          title="Categories"
          data={categories}
          columns={columns}
          onAdd={() => handleOpenModal("category")}
          onEdit={(row) => handleOpenModal("category", row)}
          onDelete={async (row) => {
            if (window.confirm("Delete category?")) {
              try {
                await apiService.deleteInventoryCategory(row.id);
                showToast("Category deleted", "success");
                loadData();
              } catch (e: any) {
                showToast(e.message, "error");
              }
            }
          }}
          onView={(row) => handleOpenViewModal({ ...row, _type: 'category' })}
          addButtonLabel="Add Category"
        />
      </CardBody>
    );
  };

  const renderVendorsTab = () => {
    const columns: Column[] = [
      { key: "name", label: "Vendor Name" },
      { key: "contact_person", label: "Contact Person" },
      { key: "phone", label: "Phone" },
      { key: "email", label: "Email" },
    ];
    return (
      <CardBody className="p-0">
        <div className="px-4 py-2 border-b border-blue-gray-50 bg-blue-gray-50/20">
          <AdvancedFilter
            config={{
              fields: [
                { name: 'keyword', label: 'Search Vendors', type: 'text' }
              ],
              onApplyFilters: (f) => { setVendorFilters(f); loadData(); },
              onResetFilters: () => { setVendorFilters({}); loadData(); }
            }}
          />
        </div>
        <DataTable
          title="Vendors"
          data={vendors}
          columns={columns}
          onAdd={() => handleOpenModal("vendor")}
          onEdit={(row) => handleOpenModal("vendor", row)}
          onDelete={async (row) => {
            if (window.confirm("Delete vendor?")) {
              try {
                await apiService.deleteInventoryVendor(row.id);
                showToast("Vendor deleted", "success");
                loadData();
              } catch (e: any) {
                showToast(e.message, "error");
              }
            }
          }}
          onView={(row) => handleOpenViewModal({ ...row, _type: 'vendor' })}
          addButtonLabel="Add Vendor"
        />
      </CardBody>
    );
  };

  const renderPurchasesTab = () => {
    const columns: Column[] = [
      { key: "invoice_number", label: "Invoice #" },
      { key: "vendor", label: "Vendor", render: (v: any) => v?.name || "N/A" },
      { key: "purchase_date", label: "Date", render: (val: any) => new Date(val).toLocaleDateString() },
      { key: "total_amount", label: "Total", render: (val: any) => `$${parseFloat(val).toFixed(2)}` },
      { key: "status", label: "Status", type: "status" },
    ];
    return (
      <CardBody className="p-0">
        <div className="px-4 py-2 border-b border-blue-gray-50 bg-blue-gray-50/20">
          <AdvancedFilter
            config={{
              fields: [
                {
                  name: 'vendor_id',
                  label: 'Vendor',
                  type: 'select',
                  options: [
                    { label: 'All Vendors', value: '' },
                    ...vendors.map(v => ({ label: v.name, value: v.id.toString() }))
                  ]
                },
                { name: 'purchase_date', label: 'Purchase Date', type: 'date' }
              ],
              onApplyFilters: (f) => { setPurchaseFilters(f); loadData(); },
              onResetFilters: () => { setPurchaseFilters({}); loadData(); }
            }}
          />
        </div>
        <DataTable
          title="Stock Purchases"
          data={purchases}
          columns={columns}
          onAdd={() => handleOpenModal("purchase")}
          onView={(row) => handleOpenViewModal({ ...row, _type: 'purchase' })}
          addButtonLabel="Record Purchase"
        />
      </CardBody>
    );
  };

  const renderRequestsTab = () => {
    const columns: Column[] = [
      { key: "item", label: "Item", render: (i: any) => i?.name || "N/A" },
      { key: "quantity", label: "Qty" },
      { key: "department", label: "Dept", render: (d: any) => d?.name || "N/A" },
      { key: "staff", label: "Staff", render: (s: any) => (s?.first_name + ' ' + s?.last_name) || "N/A" },
      { key: "status", label: "Status", type: "status" },
      { key: "request_date", label: "Date", render: (val: any) => new Date(val).toLocaleDateString() },
    ];

    const getCustomActions = (row: any): ActionItem[] => {
      const actions: ActionItem[] = [];
      if (row.status === "pending") {
        actions.push({
          label: "Approve",
          icon: <CheckIcon className="h-4 w-4" />,
          color: "green",
          onClick: () => handleRequestAction(row, "approved")
        });
        actions.push({
          label: "Reject",
          icon: <XMarkIcon className="h-4 w-4" />,
          color: "red",
          onClick: () => handleRequestAction(row, "rejected")
        });
      }
      if (row.status === "approved") {
        actions.push({
          label: "Issue Stock",
          icon: <ArrowLongRightIcon className="h-4 w-4" />,
          color: "blue",
          onClick: () => handleOpenModal("issue", { request_id: row.id, item_id: row.item_id, quantity: row.quantity })
        });
      }
      return actions;
    };

    return (
      <CardBody className="p-0">
        <div className="px-4 py-2 border-b border-blue-gray-50 bg-blue-gray-50/20">
          <AdvancedFilter
            config={{
              fields: [
                {
                  name: 'department_id',
                  label: 'Department',
                  type: 'select',
                  options: [
                    { label: 'All Depts', value: '' },
                    ...departments.map(d => ({ label: d.name, value: d.id.toString() }))
                  ]
                },
                {
                  name: 'status', label: 'Status', type: 'select', options: [
                    { label: 'All Status', value: '' },
                    { label: 'Pending', value: 'pending' },
                    { label: 'Approved', value: 'approved' },
                    { label: 'Rejected', value: 'rejected' },
                    { label: 'Issued', value: 'issued' }
                  ]
                },
                { name: 'request_date', label: 'Date', type: 'date' }
              ],
              onApplyFilters: (f) => { setRequestFilters(f); setRequestCurrentPage(1); loadData(); },
              onResetFilters: () => { setRequestFilters({}); setRequestCurrentPage(1); loadData(); }
            }}
          />
        </div>
        <DataTable
          title="Stock Requests"
          data={requests}
          columns={columns}
          onAdd={() => handleOpenModal("request")}
          onView={(row) => handleOpenViewModal({ ...row, _type: 'request' })}
          customActions={getCustomActions}
          addButtonLabel="New Request"
          pagination={{
            currentPage: requestCurrentPage,
            totalPages: requestsTotalPages,
            totalItems: requestsTotalItems,
            perPage: 10,
            onPageChange: (p) => setRequestCurrentPage(p)
          }}
        />
      </CardBody>
    );
  };

  const renderIssuesTab = () => {
    const columns: Column[] = [
      { key: "reference_number", label: "Ref #" },
      { key: "issue_date", label: "Date", render: (val: any) => new Date(val).toLocaleDateString() },
      { key: "request", label: "Department", render: (req: any) => req?.department?.name || "Direct" },
      { key: "request", label: "Staff", render: (req: any) => req?.staff ? `${req.staff.first_name} ${req.staff.last_name}` : "N/A" },
      { key: "notes", label: "Reason/Notes" },
      { key: "items", label: "Items count", render: (its: any[]) => its?.length || 0 },
    ];
    return (
      <CardBody className="p-0">
        <div className="px-4 py-2 border-b border-blue-gray-50 bg-blue-gray-50/20">
          <AdvancedFilter
            config={{
              fields: [
                {
                  name: 'department_id',
                  label: 'Department',
                  type: 'select',
                  options: [
                    { label: 'All Depts', value: '' },
                    ...departments.map(d => ({ label: d.name, value: d.id.toString() }))
                  ]
                },
                { name: 'issue_date', label: 'Issue Date', type: 'date' }
              ],
              onApplyFilters: (f) => { setIssueFilters(f); loadData(); },
              onResetFilters: () => { setIssueFilters({}); loadData(); }
            }}
          />
        </div>
        <DataTable
          title="Stock Issues"
          data={issues}
          columns={columns}
          onAdd={() => handleOpenModal("issue")}
          onView={(row) => handleOpenViewModal({ ...row, _type: 'issue' })}
          addButtonLabel="New Issue"
        />
      </CardBody>
    );
  };

  const renderAdjustmentsTab = () => {
    const columns: Column[] = [
      { key: "item", label: "Item", render: (i: any) => i?.name || "N/A" },
      { key: "type", label: "Type", render: (val: any) => <Chip value={val?.toUpperCase()} color={val === 'increase' ? 'green' : 'red'} size="sm" /> },
      { key: "quantity", label: "Qty" },
      { key: "reason", label: "Reason" },
      { key: "adjustment_date", label: "Date", render: (val: any) => new Date(val).toLocaleDateString() },
    ];
    return (
      <CardBody className="p-0">
        <div className="px-4 py-2 border-b border-blue-gray-50 bg-blue-gray-50/20">
          <AdvancedFilter
            config={{
              fields: [
                {
                  name: 'type',
                  label: 'Adjustment Type',
                  type: 'select',
                  options: [
                    { label: 'All Types', value: '' },
                    { label: 'Increase (+)', value: 'increase' },
                    { label: 'Decrease (-)', value: 'decrease' }
                  ]
                },
                { name: 'adjustment_date', label: 'Adjustment Date', type: 'date' }
              ],
              onApplyFilters: (f) => { setAdjustmentFilters(f); loadData(); },
              onResetFilters: () => { setAdjustmentFilters({}); loadData(); }
            }}
          />
        </div>
        <DataTable
          title="Stock Adjustments"
          data={adjustments}
          columns={columns}
          onAdd={() => handleOpenModal("adjustment")}
          onView={(row) => handleOpenViewModal({ ...row, _type: 'adjustment' })}
          addButtonLabel="Manual Adjustment"
        />
      </CardBody>
    );
  };

  const renderReportsTab = () => {
    return (
      <CardBody className="p-6">
        <Typography variant="h5" color="blue-gray" className="mb-4 font-bold">Generate Inventory Reports</Typography>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Button variant="outlined" color="blue" className="flex items-center justify-center gap-3 py-6" onClick={() => window.open(apiService.getReportUrl('stock-in'), '_blank')}>
            <ArrowDownOnSquareIcon className="h-6 w-6" />
            <div className="text-left">
              <Typography variant="small" className="font-bold">Stock In Report</Typography>
              <Typography variant="small" className="font-normal lowercase opacity-70">Purchase History</Typography>
            </div>
          </Button>
          <Button variant="outlined" color="indigo" className="flex items-center justify-center gap-3 py-6" onClick={() => window.open(apiService.getReportUrl('stock-out'), '_blank')}>
            <ArrowUpOnSquareIcon className="h-6 w-6" />
            <div className="text-left">
              <Typography variant="small" className="font-bold">Stock Out Report</Typography>
              <Typography variant="small" className="font-normal lowercase opacity-70">Issued Items</Typography>
            </div>
          </Button>
          <Button variant="outlined" color="orange" className="flex items-center justify-center gap-3 py-6" onClick={() => window.open(apiService.getReportUrl('low-stock'), '_blank')}>
            <ExclamationTriangleIcon className="h-6 w-6" />
            <div className="text-left">
              <Typography variant="small" className="font-bold">Low Stock Report</Typography>
              <Typography variant="small" className="font-normal lowercase opacity-70">Below Minimum Level</Typography>
            </div>
          </Button>
          <Button variant="outlined" color="red" className="flex items-center justify-center gap-3 py-6" onClick={() => window.open(apiService.getReportUrl('expiry'), '_blank')}>
            <ClipboardDocumentCheckIcon className="h-6 w-6" />
            <div className="text-left">
              <Typography variant="small" className="font-bold">Expiry Report</Typography>
              <Typography variant="small" className="font-normal lowercase opacity-70">Soon to Expire Items</Typography>
            </div>
          </Button>
          <Button variant="outlined" color="teal" className="flex items-center justify-center gap-3 py-6" onClick={() => window.open(apiService.getReportUrl('department-usage'), '_blank')}>
            <CubeIcon className="h-6 w-6" />
            <div className="text-left">
              <Typography variant="small" className="font-bold">Dept Usage Report</Typography>
              <Typography variant="small" className="font-normal lowercase opacity-70">Usage by Department</Typography>
            </div>
          </Button>
          <Button variant="outlined" color="blue-gray" className="flex items-center justify-center gap-3 py-6" onClick={() => window.open(apiService.getReportUrl('vendor-summary'), '_blank')}>
            <TruckIcon className="h-6 w-6" />
            <div className="text-left">
              <Typography variant="small" className="font-bold">Vendor Summary</Typography>
              <Typography variant="small" className="font-normal lowercase opacity-70">Purchase History by Vendor</Typography>
            </div>
          </Button>
        </div>
        <Card className="mt-8 bg-blue-gray-50/50 p-4 border border-blue-gray-100">
          <Typography variant="small" className="text-blue-gray-600">
            <strong>Note:</strong> Reports are generated in real-time. For large date ranges, the generation might take a few moments.
          </Typography>
        </Card>
      </CardBody>
    );
  };

  return (
    <div className="mt-12 mb-8 flex flex-col gap-8">
      <div className="mb-4">
        <Typography variant="h2" color="blue-gray" className="mb-2">
          Inventory Management
        </Typography>
        <Typography variant="small" color="blue-gray">
          Comprehensive control over hospital supplies, stocks, and departmental issued items
        </Typography>
      </div>

      {/* Stats Cards - Comprehensive Grid of 8 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-0">
        <Card className="border border-blue-gray-100 shadow-sm">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="small" color="blue-gray" className="mb-1 font-medium">Total Items</Typography>
                <Typography variant="h5" color="blue-gray" className="font-bold">{stats.totalItems}</Typography>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <CubeIcon className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-blue-gray-100 shadow-sm">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="small" color="blue-gray" className="mb-1 font-medium">Low Stock</Typography>
                <Typography variant="h5" color="blue-gray" className="font-bold">{stats.lowStock}</Typography>
              </div>
              <div className="p-2 bg-amber-50 rounded-lg">
                <ExclamationTriangleIcon className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-blue-gray-100 shadow-sm">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="small" color="blue-gray" className="mb-1 font-medium">Out of Stock</Typography>
                <Typography variant="h5" color="red" className="font-bold">{stats.outOfStock}</Typography>
              </div>
              <div className="p-2 bg-red-50 rounded-lg">
                <XCircleIcon className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-blue-gray-100 shadow-sm">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="small" color="blue-gray" className="mb-1 font-medium">Near Expiry</Typography>
                <Typography variant="h5" color="orange" className="font-bold">{stats.nearExpiry}</Typography>
              </div>
              <div className="p-2 bg-orange-50 rounded-lg">
                <CalendarDaysIcon className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-blue-gray-100 shadow-sm">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="small" color="blue-gray" className="mb-1 font-medium">Pending Req.</Typography>
                <Typography variant="h5" color="blue-gray" className="font-bold">{stats.pendingRequests}</Typography>
              </div>
              <div className="p-2 bg-indigo-50 rounded-lg">
                <ClipboardDocumentCheckIcon className="h-6 w-6 text-indigo-500" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-blue-gray-100 shadow-sm">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="small" color="blue-gray" className="mb-1 font-medium">Approved Req.</Typography>
                <Typography variant="h5" color="green" className="font-bold">{stats.approvedRequests}</Typography>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-blue-gray-100 shadow-sm">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="small" color="blue-gray" className="mb-1 font-medium">Categories</Typography>
                <Typography variant="h5" color="blue-gray" className="font-bold">{stats.totalCategories}</Typography>
              </div>
              <div className="p-2 bg-teal-50 rounded-lg">
                <TagIcon className="h-6 w-6 text-teal-500" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-blue-gray-100 shadow-sm">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="small" color="blue-gray" className="mb-1 font-medium">Active Vendors</Typography>
                <Typography variant="h5" color="blue-gray" className="font-bold">{stats.totalVendors}</Typography>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg">
                <TruckIcon className="h-6 w-6 text-gray-500" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card className="border border-blue-gray-100 shadow-sm overflow-hidden">
        <Tabs value={activeTab}>
          <TabsHeader
            className="bg-transparent border-b border-blue-gray-50 px-6 rounded-none"
            indicatorProps={{
              className: "bg-blue-500/10 shadow-none border-b-2 border-blue-500 rounded-none !z-0",
            }}
          >
            <Tab
              value="requests"
              onClick={() => setActiveTab("requests")}
              className={`py-4 font-semibold text-sm transition-colors duration-300 ${activeTab === "requests" ? "text-blue-500" : "text-blue-gray-500 hover:text-blue-700"}`}
            >
              REQUESTS {stats.pendingRequests > 0 && <Chip value={stats.pendingRequests} size="sm" color="amber" className="ml-2 rounded-full" />}
            </Tab>
            <Tab
              value="items"
              onClick={() => setActiveTab("items")}
              className={`py-4 font-semibold text-sm transition-colors duration-300 ${activeTab === "items" ? "text-blue-500" : "text-blue-gray-500 hover:text-blue-700"}`}
            >
              ITEMS
            </Tab>
            {hasPermission("create-inventory") && (
              <>
                <Tab
                  value="categories"
                  onClick={() => setActiveTab("categories")}
                  className={`py-4 font-semibold text-sm transition-colors duration-300 ${activeTab === "categories" ? "text-blue-500" : "text-blue-gray-500 hover:text-blue-700"}`}
                >
                  CATEGORIES
                </Tab>
                <Tab
                  value="vendors"
                  onClick={() => setActiveTab("vendors")}
                  className={`py-4 font-semibold text-sm transition-colors duration-300 ${activeTab === "vendors" ? "text-blue-500" : "text-blue-gray-500 hover:text-blue-700"}`}
                >
                  VENDORS
                </Tab>
                <Tab
                  value="purchases"
                  onClick={() => setActiveTab("purchases")}
                  className={`py-4 font-semibold text-sm transition-colors duration-300 ${activeTab === "purchases" ? "text-blue-500" : "text-blue-gray-500 hover:text-blue-700"}`}
                >
                  PURCHASES
                </Tab>
                <Tab
                  value="issues"
                  onClick={() => setActiveTab("issues")}
                  className={`py-4 font-semibold text-sm transition-colors duration-300 ${activeTab === "issues" ? "text-blue-500" : "text-blue-gray-500 hover:text-blue-700"}`}
                >
                  ISSUES
                </Tab>
                <Tab
                  value="adjustments"
                  onClick={() => setActiveTab("adjustments")}
                  className={`py-4 font-semibold text-sm transition-colors duration-300 ${activeTab === "adjustments" ? "text-blue-500" : "text-blue-gray-500 hover:text-blue-700"}`}
                >
                  ADJUSTMENTS
                </Tab>
                <Tab
                  value="reports"
                  onClick={() => setActiveTab("reports")}
                  className={`py-4 font-semibold text-sm transition-colors duration-300 ${activeTab === "reports" ? "text-blue-500" : "text-blue-gray-500 hover:text-blue-700"}`}
                >
                  REPORTS
                </Tab>
              </>
            )}
          </TabsHeader>
          <TabsBody
            animate={{
              initial: { opacity: 0, y: 20 },
              mount: { opacity: 1, y: 0 },
              unmount: { opacity: 0, y: 20 },
            }}
          >
            <TabPanel value="items" className="p-0">{renderItemsTab()}</TabPanel>
            <TabPanel value="categories" className="p-0">{renderCategoriesTab()}</TabPanel>
            <TabPanel value="vendors" className="p-0">{renderVendorsTab()}</TabPanel>
            <TabPanel value="purchases" className="p-0">{renderPurchasesTab()}</TabPanel>
            <TabPanel value="requests" className="p-0">{renderRequestsTab()}</TabPanel>
            <TabPanel value="issues" className="p-0">{renderIssuesTab()}</TabPanel>
            <TabPanel value="adjustments" className="p-0">{renderAdjustmentsTab()}</TabPanel>
            <TabPanel value="reports" className="p-0">{renderReportsTab()}</TabPanel>
          </TabsBody>
        </Tabs>
      </Card>

      <InventoryDialogs
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        type={modalType}
        data={selectedData}
        categories={categories}
        vendors={vendors}
        items={items}
        refresh={loadData}
      />

      {selectedData && (
        <ViewModal
          open={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          title={`${(selectedData?._type || modalType).toUpperCase()} Details`}
          data={selectedData}
          fields={getViewFields(selectedData?._type || modalType)}
        />
      )}
    </div>
  );
}

function getViewFields(type: string): ViewField[] {
  switch (type) {
    case "item":
      return [
        { key: "name", label: "Item Name" },
        { key: "category", label: "Category", render: (v: any) => v?.name || "N/A" },
        { key: "unit", label: "Measurement Unit" },
        { key: "current_stock", label: "In Stock", render: (v: any) => <Typography className="font-bold text-blue-600">{v}</Typography> },
        { key: "min_stock_level", label: "Low Stock Alert Level" },
        { key: "batch_number", label: "Latest Batch #" },
        { key: "expiry_date", label: "Expiry Date", type: "date" },
        { key: "description", label: "Item Description" },
        { key: "created_at", label: "Added On", type: "date" },
      ];
    case "category":
      return [
        { key: "name", label: "Category Name" },
        { key: "description", label: "Description" },
        { key: "items_count", label: "Total Items in Category" },
      ];
    case "vendor":
      return [
        { key: "name", label: "Company Name" },
        { key: "contact_person", label: "Contact Person" },
        { key: "phone", label: "Phone Number" },
        { key: "email", label: "Email Address" },
        { key: "address", label: "Warehouse Address" },
      ];
    case "purchase":
      return [
        { key: "invoice_number", label: "Invoice Number" },
        { key: "vendor", label: "Supplier", render: (v: any) => v?.name || "N/A" },
        { key: "purchase_date", label: "Purchase Date", type: "date" },
        { key: "total_amount", label: "Total Amount (Invoice)", render: (v: any) => `$${parseFloat(v).toLocaleString()}` },
        { key: "status", label: "Payment/Logistics Status", type: "status" },
        {
          key: "items",
          label: "Purchased Items",
          render: (items: any[]) => (
            <div className="flex flex-col gap-1">
              {items?.map((it: any, idx: number) => (
                <div key={idx} className="text-sm bg-blue-gray-50 p-1 rounded">
                  {it.item?.name}: {it.quantity} {it.item?.unit} @ ${it.unit_price}
                </div>
              ))}
            </div>
          )
        },
      ];
    case "request":
      return [
        { key: "item", label: "Requested Item", render: (v: any) => v?.name || "N/A" },
        { key: "quantity", label: "Requested Quantity" },
        { key: "department", label: "From Department", render: (v: any) => v?.name || "N/A" },
        { key: "staff", label: "Requested By", render: (v: any) => `${v?.first_name} ${v?.last_name}` },
        { key: "reason", label: "Reason for Request" },
        { key: "remarks", label: "Admin Response/Remarks" },
        { key: "status", label: "Current Status", type: "status" },
        { key: "request_date", label: "Request Date", type: "date" },
      ];
    case "issue":
      return [
        { key: "reference_number", label: "Issue Reference #" },
        { key: "issue_date", label: "Date Dispatched", type: "date" },
        { key: "request", label: "Linked Request", render: (v: any) => v ? `Dept: ${v.department?.name} (#${v.id})` : "Direct Issue" },
        { key: "notes", label: "Reason / Implementation Notes" },
        { key: "issuer", label: "Issued By (Admin)", render: (v: any) => v?.name || "N/A" },
        {
          key: "items",
          label: "Items Dispatched",
          render: (items: any[]) => (
            <div className="flex flex-col gap-1">
              {items?.map((it: any, idx: number) => (
                <div key={idx} className="text-sm bg-blue-gray-50 p-1 rounded">
                  {it.item?.name}: {it.quantity} {it.item?.unit}
                </div>
              ))}
            </div>
          )
        },
      ];
    case "adjustment":
      return [
        { key: "item", label: "Adjusted Item", render: (v: any) => v?.name || "N/A" },
        { key: "type", label: "Adjustment Type", render: (v: any) => <Chip value={v?.toUpperCase()} color={v === 'increase' ? 'green' : 'red'} size="sm" /> },
        { key: "quantity", label: "Quantity Adjusted" },
        { key: "reason", label: "Detailed Reason" },
        { key: "adjustment_date", label: "Date of Adjustment", type: "date" },
        { key: "adjustedBy", label: "Performed By", render: (v: any) => v?.name || "N/A" },
      ];
    default:
      return [];
  }
}

function InventoryDialogs({ open, onClose, type, data, categories, vendors, items, refresh }: any) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (data) setFormData(data);
    else setFormData({});
  }, [data, open]);

  const handleSubmit = async () => {
    try {
      if (type === "item") {
        if (data?.id) await apiService.updateInventoryItem(data.id, formData);
        else await apiService.createInventoryItem(formData);
      } else if (type === "category") {
        if (data?.id) await apiService.updateInventoryCategory(data.id, formData);
        else await apiService.createInventoryCategory(formData);
      } else if (type === "vendor") {
        if (data?.id) await apiService.updateInventoryVendor(data.id, formData);
        else await apiService.createInventoryVendor(formData);
      } else if (type === "purchase") {
        await apiService.createInventoryPurchase({
          ...formData,
          items: [
            { item_id: formData.item_id, quantity: formData.quantity, unit_price: formData.unit_price }
          ]
        });
      } else if (type === "request") {
        await apiService.createInventoryRequest(formData);
      } else if (type === "issue") {
        await apiService.createInventoryIssue({
          ...formData,
          items: [
            { item_id: formData.item_id, quantity: formData.quantity }
          ]
        });
      } else if (type === "adjustment") {
        await apiService.createInventoryAdjustment(formData);
      }

      showToast(`${type} saved successfully`, "success");
      refresh();
      onClose();
    } catch (e: any) {
      showToast(e.message, "error");
    }
  };

  return (
    <Dialog open={open} handler={onClose} size="md" className="max-h-[90vh] overflow-y-auto">
      <DialogHeader className="border-b border-blue-gray-50 pb-4">
        <Typography variant="h5" color="blue-gray">
          {data?.id ? 'Edit' : 'New'} {type.charAt(0).toUpperCase() + type.slice(1)}
        </Typography>
      </DialogHeader>
      <DialogBody className="flex flex-col gap-6 py-6 px-10">
        {type === "item" && (
          <>
            <Input label="Item Name" crossOrigin={undefined} value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <Select label="Category" value={formData.category_id ? String(formData.category_id) : ""} onChange={(val) => setFormData({ ...formData, category_id: val })}>
              {categories.map((c: any) => <Option key={c.id} value={String(c.id)}>{c.name}</Option>)}
            </Select>
            <Input label="Unit (e.g. pcs, box)" crossOrigin={undefined} value={formData.unit || ""} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} />
            <div className="grid grid-cols-2 gap-4">
              <Input type="number" label="Minimum Stock Level" crossOrigin={undefined} value={formData.min_stock_level || ""} onChange={(e) => setFormData({ ...formData, min_stock_level: e.target.value })} />
              <Input type="date" label="Initial Expiry Date" crossOrigin={undefined} value={formData.expiry_date || ""} onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })} />
            </div>
            <Textarea label="Description" value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </>
        )}
        {type === "category" && (
          <>
            <Input label="Category Name" crossOrigin={undefined} value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <Textarea label="Description" value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </>
        )}
        {type === "vendor" && (
          <>
            <Input label="Vendor Name" crossOrigin={undefined} value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <Input label="Contact Person" crossOrigin={undefined} value={formData.contact_person || ""} onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })} />
            <Input label="Phone Number" crossOrigin={undefined} value={formData.phone || ""} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            <Input label="Email Address" crossOrigin={undefined} value={formData.email || ""} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            <Textarea label="Office Address" value={formData.address || ""} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
          </>
        )}
        {type === "purchase" && (
          <>
            <Select label="Select Vendor" value={formData.vendor_id ? String(formData.vendor_id) : ""} onChange={(val) => setFormData({ ...formData, vendor_id: val })}>
              {vendors.map((v: any) => <Option key={v.id} value={String(v.id)}>{v.name}</Option>)}
            </Select>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Invoice Number" crossOrigin={undefined} value={formData.invoice_number || ""} onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })} />
              <Input type="date" label="Purchase Date" crossOrigin={undefined} value={formData.purchase_date || ""} onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })} />
            </div>
            <div className="border-t border-dashed border-blue-gray-200 mt-2 pt-4">
              <Typography variant="small" className="font-bold text-blue-gray-800 mb-4 uppercase">Item Selection</Typography>
              <Select label="Select Item" value={formData.item_id ? String(formData.item_id) : ""} onChange={(val) => setFormData({ ...formData, item_id: val })}>
                {items.map((i: any) => <Option key={i.id} value={String(i.id)}>{i.name} (Stock: {i.current_stock})</Option>)}
              </Select>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Input type="number" label="Quantity In" crossOrigin={undefined} value={formData.quantity || ""} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} />
                <Input type="number" label="Unit Purchase Price" crossOrigin={undefined} value={formData.unit_price || ""} onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })} />
              </div>
            </div>
          </>
        )}
        {type === "issue" && (
          <>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-2">
              <Typography variant="small" color="blue" className="font-bold flex items-center gap-2 mb-2">
                <CheckIcon className="h-4 w-4" />
                ISSUE DETAILS
              </Typography>
              {formData.request_id ? (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-blue-gray-600 font-medium">Linked Request:</span>
                  <span className="font-bold text-blue-gray-800">#{formData.request_id}</span>
                  <span className="text-blue-gray-600 font-medium">Recommended Item:</span>
                  <span className="font-bold text-blue-gray-800">
                    {items.find((i: any) => i.id == formData.item_id)?.name || "Unknown"}
                  </span>
                  <span className="text-blue-gray-600 font-medium">Requested Qty:</span>
                  <span className="font-bold text-blue-gray-800">{formData.quantity}</span>
                </div>
              ) : (
                <Typography variant="small" className="italic text-blue-gray-500">
                  Direct issue without a formal request link.
                </Typography>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Reference Number" crossOrigin={undefined} value={formData.reference_number || ""} onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })} />
              <Input type="date" label="Issue Date" crossOrigin={undefined} value={formData.issue_date || ""} onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })} />
            </div>

            <Select
              label="Select Item to Issue"
              value={formData.item_id ? String(formData.item_id) : ""}
              onChange={(val) => setFormData({ ...formData, item_id: val })}
              disabled={!!formData.request_id}
            >
              {items.map((i: any) => <Option key={i.id} value={String(i.id)}>{i.name} (Available: {i.current_stock} {i.unit})</Option>)}
            </Select>

            <Input
              type="number"
              label="Quantity to Issue"
              crossOrigin={undefined}
              value={formData.quantity || ""}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className={formData.request_id ? "font-bold text-blue-700" : ""}
            />
            <Textarea
              label="Issue Reason / Additional Notes"
              value={formData.notes || ""}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </>
        )}
        {type === "request" && (
          <>
            <Typography variant="small" color="blue-gray" className="font-medium mb-1">
              Item to Request
            </Typography>
            <Select label="Select Item" value={formData.item_id ? String(formData.item_id) : ""} onChange={(val) => setFormData({ ...formData, item_id: val })}>
              {items.map((i: any) => <Option key={i.id} value={String(i.id)}>{i.name} (Available: {i.current_stock} {i.unit})</Option>)}
            </Select>
            <Input type="number" label="Quantity Requested" crossOrigin={undefined} value={formData.quantity || ""} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} />
            <Textarea label="Reason / Usage Description" value={formData.reason || ""} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} />

            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mt-2">
              <Typography variant="small" color="blue" className="font-medium flex items-center gap-2">
                <EyeIcon className="h-4 w-4" />
                Auto-Fill Information
              </Typography>
              <Typography variant="small" color="blue-gray" className="mt-1 opacity-80">
                Your department and identity will be automatically attached to this request.
              </Typography>
            </div>
          </>
        )}
        {type === "adjustment" && (
          <>
            <Select label="Select Item" value={formData.item_id ? String(formData.item_id) : ""} onChange={(val) => setFormData({ ...formData, item_id: val })}>
              {items.map((i: any) => <Option key={i.id} value={String(i.id)}>{i.name} (Current: {i.current_stock})</Option>)}
            </Select>
            <div className="grid grid-cols-2 gap-4">
              <Select label="Adjustment Type" value={formData.type || ""} onChange={(val) => setFormData({ ...formData, type: val })}>
                <Option value="increase">Stock In (Increase +)</Option>
                <Option value="decrease">Stock Out (Decrease -)</Option>
              </Select>
              <Input type="number" label="Adjustment Quantity" crossOrigin={undefined} value={formData.quantity || ""} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} />
            </div>
            <Input type="date" label="Adjustment Date" crossOrigin={undefined} value={formData.adjustment_date || ""} onChange={(e) => setFormData({ ...formData, adjustment_date: e.target.value })} />
            <Textarea label="Reason for Adjustment (e.g. Damaged, Expired)" value={formData.reason || ""} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} />
          </>
        )}
      </DialogBody>
      <DialogFooter className="gap-2 border-t border-blue-gray-50 pt-4">
        <Button variant="text" color="blue-gray" onClick={onClose}>Cancel</Button>
        <Button variant="gradient" color="blue" className="flex items-center gap-2" onClick={handleSubmit}>
          <PlusIcon className="h-4 w-4" /> Save {type.charAt(0).toUpperCase() + type.slice(1)}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
