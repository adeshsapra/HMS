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
} from "@heroicons/react/24/outline";
import { apiService } from "@/services/api";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { DataTable, Column, ViewModal, ViewField, ActionItem, AdvancedFilter } from "@/components";

export default function Inventory(): JSX.Element {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("items");
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
  const [departments, setDepartments] = useState<any[]>([]);

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
      const res = await apiService.getDepartments();
      setDepartments(res.data || []);
    } catch (e) { }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case "items":
          const itemsRes = await apiService.getInventoryItems();
          setItems(Array.isArray(itemsRes) ? itemsRes : itemsRes.data || []);
          const catRes = await apiService.getInventoryCategories();
          setCategories(Array.isArray(catRes) ? catRes : catRes.data || []);
          break;
        case "categories":
          const categoriesRes = await apiService.getInventoryCategories();
          setCategories(Array.isArray(categoriesRes) ? categoriesRes : categoriesRes.data || []);
          break;
        case "vendors":
          const vendorsRes = await apiService.getInventoryVendors();
          setVendors(Array.isArray(vendorsRes) ? vendorsRes : vendorsRes.data || []);
          break;
        case "purchases":
          const purchasesRes = await apiService.getInventoryPurchases();
          setPurchases(Array.isArray(purchasesRes) ? purchasesRes : purchasesRes.data || []);
          const vendRes = await apiService.getInventoryVendors();
          setVendors(Array.isArray(vendRes) ? vendRes : vendRes.data || []);
          const itRes = await apiService.getInventoryItems();
          setItems(Array.isArray(itRes) ? itRes : itRes.data || []);
          break;
        case "requests":
          const requestsRes = await apiService.getInventoryRequests({
            page: requestCurrentPage,
            ...requestFilters
          });
          if (requestsRes.data) {
            setRequests(requestsRes.data);
            setRequestsTotalPages(requestsRes.last_page || 1);
            setRequestsTotalItems(requestsRes.total || 0);
          } else {
            setRequests(Array.isArray(requestsRes) ? requestsRes : []);
          }
          const itReqRes = await apiService.getInventoryItems();
          setItems(Array.isArray(itReqRes) ? itReqRes : itReqRes.data || []);
          break;
        case "issues":
          const issuesRes = await apiService.getInventoryIssues();
          setIssues(Array.isArray(issuesRes) ? issuesRes : issuesRes.data || []);
          break;
        case "adjustments":
          const adjustmentsRes = await apiService.getInventoryAdjustments();
          setAdjustments(Array.isArray(adjustmentsRes) ? adjustmentsRes : adjustmentsRes.data || []);
          const itAdjRes = await apiService.getInventoryItems();
          setItems(Array.isArray(itAdjRes) ? itAdjRes : itAdjRes.data || []);
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

  const handleOpenViewModal = (data: any) => {
    setSelectedData(data);
    setViewModalOpen(true);
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
          onView={(row) => handleOpenViewModal(row)}
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
        <DataTable
          title="Stock Purchases"
          data={purchases}
          columns={columns}
          onAdd={() => handleOpenModal("purchase")}
          onView={(row) => handleOpenViewModal(row)}
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
          onView={(row) => handleOpenViewModal(row)}
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
      { key: "request", label: "Dept", render: (req: any) => req?.department?.name || "N/A" },
      { key: "items", label: "Items Issued", render: (its: any[]) => its?.length || 0 },
    ];
    return (
      <CardBody className="p-0">
        <DataTable
          title="Stock Issues"
          data={issues}
          columns={columns}
          onAdd={() => handleOpenModal("issue")}
          onView={(row) => handleOpenViewModal(row)}
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
        <DataTable
          title="Stock Adjustments"
          data={adjustments}
          columns={columns}
          onAdd={() => handleOpenModal("adjustment")}
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
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <CardHeader variant="gradient" color="blue" className="mb-0 p-6 flex items-center justify-between shadow-blue-500/20">
        <div>
          <Typography variant="h3" color="white" className="font-bold tracking-tight">
            Inventory Management System
          </Typography>
          <Typography variant="small" color="white" className="font-medium opacity-90 mt-1">
            Comprehensive control over hospital supplies, stocks, and departmental issued items
          </Typography>
        </div>
      </CardHeader>

      <Card className="border border-blue-gray-100 shadow-sm overflow-hidden">
        <Tabs value={activeTab}>
          <TabsHeader className="bg-blue-gray-50/50 border-b border-blue-gray-100 p-0 rounded-none overflow-x-auto">
            <Tab value="items" onClick={() => setActiveTab("items")} className="py-4 font-bold text-sm tracking-wide">ITEMS</Tab>
            <Tab value="categories" onClick={() => setActiveTab("categories")} className="py-4 font-bold text-sm tracking-wide">CATEGORIES</Tab>
            <Tab value="vendors" onClick={() => setActiveTab("vendors")} className="py-4 font-bold text-sm tracking-wide">VENDORS</Tab>
            <Tab value="purchases" onClick={() => setActiveTab("purchases")} className="py-4 font-bold text-sm tracking-wide">PURCHASES</Tab>
            <Tab value="requests" onClick={() => setActiveTab("requests")} className="py-4 font-bold text-sm tracking-wide">REQUESTS</Tab>
            <Tab value="issues" onClick={() => setActiveTab("issues")} className="py-4 font-bold text-sm tracking-wide">ISSUES</Tab>
            <Tab value="adjustments" onClick={() => setActiveTab("adjustments")} className="py-4 font-bold text-sm tracking-wide">ADJUSTMENTS</Tab>
            <Tab value="reports" onClick={() => setActiveTab("reports")} className="py-4 font-bold text-sm tracking-wide">REPORTS</Tab>
          </TabsHeader>
          <TabsBody
            animate={{
              initial: { y: 250 },
              mount: { y: 0 },
              unmount: { y: 250 },
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
          title={`${modalType.toUpperCase()} Details`}
          data={selectedData}
          fields={getViewFields(modalType)}
        />
      )}
    </div>
  );
}

function getViewFields(type: string): ViewField[] {
  switch (type) {
    case "item":
      return [
        { key: "name", label: "Name" },
        { key: "category", label: "Category", render: (v: any) => v?.name },
        { key: "unit", label: "Unit" },
        { key: "current_stock", label: "Current Stock" },
        { key: "min_stock_level", label: "Min Level" },
        { key: "batch_number", label: "Batch #" },
        { key: "expiry_date", label: "Expiry", type: "date" },
        { key: "description", label: "Description" },
      ];
    case "purchase":
      return [
        { key: "invoice_number", label: "Invoice #" },
        { key: "vendor", label: "Vendor", render: (v: any) => v?.name },
        { key: "purchase_date", label: "Date", type: "date" },
        { key: "total_amount", label: "Total Amount" },
        { key: "status", label: "Status" },
      ];
    case "request":
      return [
        { key: "item", label: "Item", render: (v: any) => v?.name },
        { key: "quantity", label: "Quantity" },
        { key: "department", label: "Department", render: (v: any) => v?.name },
        { key: "staff", label: "Requested By", render: (v: any) => (v?.first_name + ' ' + v?.last_name) },
        { key: "reason", label: "Reason" },
        { key: "remarks", label: "Admin Remarks" },
        { key: "status", label: "Status", type: "status" },
        { key: "request_date", label: "Date", type: "date" },
      ];
    case "issue":
      return [
        { key: "reference_number", label: "Reference #" },
        { key: "issue_date", label: "Issue Date", type: "date" },
        { key: "request", label: "Linked Request ID", render: (v: any) => v?.id || "None" },
        { key: "items", label: "Items Contained", render: (v: any[]) => v?.length + " items" },
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
            <div className="grid grid-cols-2 gap-4">
              <Input label="Reference Number" crossOrigin={undefined} value={formData.reference_number || ""} onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })} />
              <Input type="date" label="Issue Date" crossOrigin={undefined} value={formData.issue_date || ""} onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })} />
            </div>
            <Select label="Select Item to Issue" value={formData.item_id ? String(formData.item_id) : ""} onChange={(val) => setFormData({ ...formData, item_id: val })}>
              {items.map((i: any) => <Option key={i.id} value={String(i.id)}>{i.name} (Available: {i.current_stock} {i.unit})</Option>)}
            </Select>
            <Input type="number" label="Quantity to Issue" crossOrigin={undefined} value={formData.quantity || ""} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} />
            {formData.request_id && (
              <Typography variant="small" color="blue" className="font-medium italic">
                * This issue is linked to request #{formData.request_id}
              </Typography>
            )}
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
