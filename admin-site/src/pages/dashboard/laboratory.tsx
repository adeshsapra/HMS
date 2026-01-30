import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Typography,
  Button,
  Tabs,
  TabsHeader,
  Tab,
  Chip,
  IconButton,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Textarea,
  Select,
  Option,
} from "@material-tailwind/react";
import {
  BeakerIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  CheckCircleIcon,
  DocumentArrowUpIcon,
  EyeIcon,
  CheckBadgeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { apiService } from "@/services/api";
import { useToast } from "@/context/ToastContext";
import { DataTable, AdvancedFilter, Column } from "@/components";

// Types
interface LabTest {
  id: number;
  test_name: string;
  priority: string;
  status: string;
  created_at: string;
  prescription: {
    id: number;
    patient: {
      id: number;
      first_name?: string;
      last_name?: string;
      name?: string;
      patient_id?: string;
    };
    doctor: {
      id: number;
      first_name?: string;
      last_name?: string;
      user?: {
        name: string;
      };
    };
  };
  sample: {
    sample_type: string;
    collected_at: string;
    sample_status: string;
  } | null;
  report: {
    report_title: string;
    file_path: string;
    uploaded_at: string;
    verified_by: number | null;
    result_summary: string | null;
  } | null;
}

export default function Laboratory(): JSX.Element {
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(false);
  const [tests, setTests] = useState<LabTest[]>([]);
  const [stats, setStats] = useState({
    total_requests: 0,
    pending_samples: 0,
    pending_reports: 0,
    completed: 0,
  });
  const { showToast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal States
  const [collectModalOpen, setCollectModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);

  // Form States
  const [sampleData, setSampleData] = useState({
    sample_type: "Blood",
    collected_at: new Date().toISOString().split('T')[0],
  });
  const [reportData, setReportData] = useState({
    report_title: "",
    result_summary: "",
    file: null as File | null,
  });

  // Manage Lab Tests State
  const [manageTestsModalOpen, setManageTestsModalOpen] = useState(false);
  const [testFormModalOpen, setTestFormModalOpen] = useState(false);
  const [catalogTests, setCatalogTests] = useState<any[]>([]);
  const [editingTest, setEditingTest] = useState<any>(null);
  const [testFormData, setTestFormData] = useState({
    test_name: "",
    price: "",
    description: "",
    status: "active",
  });

  // Filter State
  const [filters, setFilters] = useState<Record<string, any>>({});

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when tab changes
    fetchData(1, filters);
  }, [activeTab]);

  const fetchData = async (page: number = currentPage, currentFilters = filters) => {
    setLoading(true);
    try {
      // Fetch Stats
      const statsRes = await apiService.getLabStats();
      setStats(statsRes as any);

      // Fetch Tests based on tab
      let statusFilter = currentFilters.status || "";
      if (activeTab === "pending_sample") statusFilter = "ordered";
      else if (activeTab === "sample_collected") statusFilter = "sample_collected";
      else if (activeTab === "completed") statusFilter = "completed";

      const testsRes = await apiService.getLabTests({
        page,
        status: statusFilter !== "all" ? statusFilter : undefined,
        keyword: currentFilters.keyword,
        date_range_start: currentFilters.date_range_start,
        date_range_end: currentFilters.date_range_end
      });
      setTests(testsRes.data?.data || testsRes.data || []);
      setTotalPages(testsRes.data?.last_page || testsRes.data?.total_pages || 1);
    } catch (error) {
      console.error("Error fetching lab data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCollectSample = async () => {
    if (!selectedTest) return;
    try {
      const staffId = currentUser?.id || 1;

      await apiService.collectLabSample(selectedTest.id, {
        ...sampleData,
        collected_by: staffId
      });
      showToast("Sample collected successfully!", "success");
      setCollectModalOpen(false);
      fetchData();
    } catch (error: any) {
      showToast(error.message || "Failed to collect sample", "error");
    }
  };

  const handleUploadReport = async () => {
    if (!selectedTest || !reportData.file) {
      showToast("Please select a file", "error");
      return;
    }
    try {
      const staffId = currentUser?.id || 1;

      const formData = new FormData();
      formData.append('report_title', reportData.report_title);
      formData.append('report_category', 'lab'); // Default for lab orders
      formData.append('result_summary', reportData.result_summary);
      formData.append('report_file', reportData.file);
      formData.append('uploaded_by', String(staffId));

      await apiService.uploadLabReport(selectedTest.id, formData);
      showToast("Report uploaded & Lab Status Updated!", "success");
      setUploadModalOpen(false);
      fetchData();
    } catch (error: any) {
      showToast(error.message || "Failed to upload report", "error");
    }
  };

  const handleVerifyReport = async () => {
    if (!selectedTest) return;
    try {
      const doctorId = currentUser?.id; // Assuming User ID maps to Doctor ID or backend handles it via Auth
      await apiService.verifyLabReport(selectedTest.id, { doctor_id: doctorId });
      showToast("Report verified successfully!", "success");
      setViewModalOpen(false); // Close Report View
      fetchData();
    } catch (error: any) {
      showToast(error.message || "Failed to verify report", "error");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ordered": return "blue";
      case "sample_collected": return "orange";
      case "completed": return "green";
      case "cancelled": return "red";
      default: return "gray";
    }
  };

  const isDoctor = currentUser?.role_id === 2 || currentUser?.role?.name === 'doctor' || currentUser?.role === 'doctor'; // Basic check, refine based on actual role structure

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchData(page, filters);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const columns: Column[] = [
    {
      key: "test_name",
      label: "Test Name",
      render: (val, row) => (
        <div className="flex flex-col gap-1">
          <Typography variant="small" color="blue-gray" className="font-bold">
            {val}
          </Typography>
          <Chip
            size="sm"
            variant="ghost"
            value={row.priority}
            color={row.priority === 'urgent' ? 'red' : 'blue'}
            className="w-max rounded-full capitalize text-[10px] px-2 py-0"
          />
        </div>
      )
    },
    {
      key: "patient",
      label: "Patient",
      render: (val, row) => (
        <Typography variant="small" color="blue-gray" className="font-normal">
          {row.prescription?.patient
            ? (row.prescription.patient.first_name
              ? `${row.prescription.patient.first_name} ${row.prescription.patient.last_name || ''}`
              : (row.prescription.patient as any).name)
            : 'Unknown'}
        </Typography>
      )
    },
    {
      key: "doctor",
      label: "Doctor (Order)",
      render: (val, row) => (
        <Typography variant="small" color="blue-gray" className="font-normal">
          {row.prescription?.doctor
            ? (row.prescription.doctor.first_name
              ? `${row.prescription.doctor.first_name} ${row.prescription.doctor.last_name}`
              : row.prescription.doctor.user?.name)
            : 'No Doctor'}
        </Typography>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (val, row) => (
        <div className="flex flex-col gap-1">
          <Chip
            size="sm"
            variant="ghost"
            value={row.status.replace('_', ' ')}
            color={getStatusColor(row.status) as any}
            className="rounded-full capitalize w-max"
          />
          {row.report && row.report.verified_by && (
            <div className="flex items-center gap-1 text-green-600 text-[10px] font-bold">
              <CheckBadgeIcon className="h-3 w-3" /> Verified
            </div>
          )}
        </div>
      )
    }
  ];

  // Lab Test Functionality
  const fetchCatalogTests = async () => {
    try {
      const res = await apiService.getLabTestCatalog();
      setCatalogTests(res.data || []);
    } catch (error) {
      console.error("Failed to fetch catalog tests", error);
    }
  };

  useEffect(() => {
    if (manageTestsModalOpen) {
      fetchCatalogTests();
    }
  }, [manageTestsModalOpen]);

  const handleSaveTest = async () => {
    if (!testFormData.test_name || !testFormData.price) {
      showToast("Please fill in required fields", "error");
      return;
    }

    try {
      if (editingTest) {
        await apiService.updateLabCatalogTest(editingTest.id, testFormData);
        showToast("Lab test updated successfully", "success");
      } else {
        await apiService.createLabCatalogTest(testFormData);
        showToast("Lab test created successfully", "success");
      }
      setTestFormModalOpen(false);
      fetchCatalogTests();
    } catch (error: any) {
      showToast(error.message || "Failed to save lab test", "error");
    }
  };

  const handleDeleteTest = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this test?")) return;
    try {
      await apiService.deleteLabCatalogTest(id);
      showToast("Lab test deleted successfully", "success");
      fetchCatalogTests();
    } catch (error: any) {
      showToast(error.message || "Failed to delete lab test", "error");
    }
  };

  const openTestForm = (test: any = null) => {
    if (test) {
      setEditingTest(test);
      setTestFormData({
        test_name: test.test_name,
        price: test.price,
        description: test.description || "",
        status: test.status,
      });
    } else {
      setEditingTest(null);
      setTestFormData({
        test_name: "",
        price: "",
        description: "",
        status: "active",
      });
    }
    setTestFormModalOpen(true);
  };

  return (
    <div className="mt-8">
      <div className="mb-6 flex flex-col justify-between gap-8 md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <BeakerIcon className="h-6 w-6 text-blue-500" />
          <div>
            <h2 className="text-2xl font-bold text-blue-gray-800">Laboratory</h2>
            <p className="text-blue-gray-600">Manage lab tests, samples, and reports</p>
          </div>
        </div>
        {!isDoctor && (
          <Button
            className="flex items-center gap-2 bg-blue-500"
            onClick={() => setManageTestsModalOpen(true)}
          >
            <PlusIcon className="h-4 w-4" /> Manage Lab Tests
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Requests"
          value={stats.total_requests}
          icon={<BeakerIcon className="h-6 w-6" />}
          color="blue"
        />
        <StatCard
          title="Pending Samples"
          value={stats.pending_samples}
          icon={<BeakerIcon className="h-6 w-6" />}
          color="orange"
        />
        <StatCard
          title="Pending Reports"
          value={stats.pending_reports}
          icon={<ClockIcon className="h-6 w-6" />}
          color="purple"
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={<CheckCircleIcon className="h-6 w-6" />}
          color="green"
        />
      </div>

      <Card className="h-full w-full border border-blue-gray-100 shadow-sm">
        <CardBody className="p-0">
          <Tabs value={activeTab} className="w-full">
            <TabsHeader
              className="bg-transparent border-b border-blue-gray-50 px-6 rounded-none"
              indicatorProps={{
                className: "bg-blue-500/10 shadow-none border-b-2 border-blue-500 rounded-none !z-0",
              }}
            >
              {[
                { label: "All Tests", value: "all" },
                { label: "Pending Sample", value: "pending_sample" },
                { label: "Sample Collected", value: "sample_collected" },
                { label: "Completed", value: "completed" },
              ].map(({ label, value }) => (
                <Tab
                  key={value}
                  value={value}
                  onClick={() => setActiveTab(value)}
                  className={`py-4 font-semibold text-sm transition-colors duration-300 ${activeTab === value ? "text-blue-500" : "text-blue-gray-500 hover:text-blue-700"}`}
                >
                  {label}
                </Tab>
              ))}
            </TabsHeader>
          </Tabs>

          <div className="p-4">
            <DataTable
              title="Lab Tests"
              data={tests}
              columns={columns}
              pagination={{
                currentPage: currentPage,
                totalPages: totalPages,
                onPageChange: handlePageChange
              }}
              searchable={false}
              advancedFilter={
                <AdvancedFilter
                  config={{
                    fields: [
                      {
                        name: 'keyword',
                        label: 'Search Tests',
                        type: 'text',
                        placeholder: 'Search by test, patient, or ID...'
                      },
                      {
                        name: 'status',
                        label: 'Status',
                        type: 'select',
                        options: [
                          { label: 'All Statuses', value: 'all' },
                          { label: 'Ordered', value: 'ordered' },
                          { label: 'Sample Collected', value: 'sample_collected' },
                          { label: 'Completed', value: 'completed' }
                        ]
                      },
                      {
                        name: 'date_range',
                        label: 'Date Range',
                        type: 'daterange'
                      }
                    ],
                    onApplyFilters: (newFilters) => {
                      setFilters(newFilters);
                      setCurrentPage(1);
                      fetchData(1, newFilters);
                    },
                    onResetFilters: () => {
                      setFilters({});
                      setCurrentPage(1);
                      fetchData(1, {});
                    },
                    initialValues: filters
                  }}
                />
              }
              customActions={(row: any) => {
                const actions = [];
                const labTest = row as LabTest;
                if (labTest.status === 'ordered' && !isDoctor) {
                  actions.push({
                    label: "Collect",
                    icon: <BeakerIcon className="h-4 w-4" />,
                    onClick: () => {
                      setSelectedTest(labTest);
                      setCollectModalOpen(true);
                      setSampleData({ ...sampleData, sample_type: 'Blood' });
                    }
                  });
                }
                if (labTest.status === 'sample_collected' && !isDoctor) {
                  actions.push({
                    label: "Upload",
                    icon: <DocumentArrowUpIcon className="h-4 w-4" />,
                    color: "blue" as const,
                    onClick: () => {
                      setSelectedTest(labTest);
                      setUploadModalOpen(true);
                      setReportData({ report_title: labTest.test_name + " Report", result_summary: "", file: null });
                    }
                  });
                }
                if (labTest.status === 'completed' && labTest.report) {
                  actions.push({
                    label: "View Report",
                    icon: <EyeIcon className="h-4 w-4" />,
                    color: "blue" as const,
                    onClick: () => {
                      setSelectedTest(labTest);
                      setViewModalOpen(true);
                    }
                  });
                }
                return actions;
              }}
            />
          </div>
        </CardBody>
      </Card>
      {/* Collect Sample Modal */}
      <Dialog open={collectModalOpen} handler={() => setCollectModalOpen(false)} size="xs">
        <DialogHeader>Collect Sample</DialogHeader>
        <DialogBody>
          <div className="flex flex-col gap-4">
            <Input label="Sample Type" value={sampleData.sample_type} onChange={(e) => setSampleData({ ...sampleData, sample_type: e.target.value })} crossOrigin={undefined} />
            <Input type="date" label="Collection Date" value={sampleData.collected_at} onChange={(e) => setSampleData({ ...sampleData, collected_at: e.target.value })} crossOrigin={undefined} />
            <div className="p-3 bg-blue-50 rounded text-blue-800 text-xs">
              Assigning current user as collector.
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="text" onClick={() => setCollectModalOpen(false)} className="mr-1">Cancel</Button>
          <Button variant="gradient" color="blue" onClick={handleCollectSample}>Confirm Collection</Button>
        </DialogFooter>
      </Dialog>

      {/* Upload Report Modal */}
      <Dialog open={uploadModalOpen} handler={() => setUploadModalOpen(false)} size="sm">
        <DialogHeader>Upload Test Report</DialogHeader>
        <DialogBody>
          <div className="flex flex-col gap-4">
            <Input label="Report Title" value={reportData.report_title} onChange={(e) => setReportData({ ...reportData, report_title: e.target.value })} crossOrigin={undefined} />
            <Textarea label="Result Summary" value={reportData.result_summary} onChange={(e) => setReportData({ ...reportData, result_summary: e.target.value })} />

            <div className="relative flex w-full max-w-[24rem]">
              <Input
                type="file"
                label="Report File (PDF/Image)"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setReportData({ ...reportData, file: e.target.files[0] });
                  }
                }}
                crossOrigin={undefined}
              />
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="text" onClick={() => setUploadModalOpen(false)} className="mr-1">Cancel</Button>
          <Button variant="gradient" color="blue" onClick={handleUploadReport}>Upload & Complete</Button>
        </DialogFooter>
      </Dialog>

      {/* View/Verify Report Modal */}
      <Dialog open={viewModalOpen} handler={() => setViewModalOpen(false)} size="lg">
        <DialogHeader className="justify-between">
          Test Report
          <IconButton variant="text" onClick={() => setViewModalOpen(false)}><span className="text-xl">×</span></IconButton>
        </DialogHeader>
        <DialogBody className="h-[70vh] overflow-y-auto">
          {selectedTest && selectedTest.report && (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <Typography variant="h6" color="blue-gray">{selectedTest.report.report_title}</Typography>
                  <Typography variant="small" color="gray">Summary: {selectedTest.report.result_summary || 'No summary provided.'}</Typography>
                </div>
                {selectedTest.report.verified_by ? (
                  <Chip color="green" value="Verified" icon={<CheckBadgeIcon className="h-4 w-4" />} />
                ) : (
                  <Chip color="amber" value="Pending Verification" />
                )}
              </div>

              <div className="border rounded p-2 bg-gray-50 flex justify-center">
                {selectedTest.report.file_path.endsWith('.pdf') ? (
                  <iframe
                    src={`http://localhost:8000/storage/${selectedTest.report.file_path}`}
                    className="w-full h-[60vh]"
                    title="Report PDF"
                  />
                ) : (
                  <img
                    src={`http://localhost:8000/storage/${selectedTest.report.file_path}`}
                    alt="Report"
                    className="max-h-[60vh] object-contain"
                  />
                )}
              </div>
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button variant="text" onClick={() => setViewModalOpen(false)} className="mr-1">Close</Button>
          {selectedTest?.report && !selectedTest.report.verified_by && isDoctor && (
            <Button variant="gradient" color="green" onClick={handleVerifyReport}>
              VERIFY REPORT
            </Button>
          )}
        </DialogFooter>
      </Dialog>

      {/* Manage Tests Modal (List) */}
      <Dialog open={manageTestsModalOpen} handler={() => setManageTestsModalOpen(false)} size="lg">
        <DialogHeader className="justify-between">
          <div className="flex items-center gap-2">
            <Typography variant="h5" color="blue-gray">Manage Lab Tests</Typography>
            <Chip value={`${catalogTests.length} Tests`} size="sm" variant="ghost" className="rounded-full" />
          </div>
          <div className="flex gap-2">
            <Button size="sm" color="blue" className="flex items-center gap-2" onClick={() => openTestForm()}>
              <PlusIcon className="h-4 w-4" /> Add Test
            </Button>
            <IconButton variant="text" onClick={() => setManageTestsModalOpen(false)}>
              <XMarkIcon className="h-5 w-5" />
            </IconButton>
          </div>
        </DialogHeader>
        <DialogBody className="h-[60vh] overflow-y-auto p-0">
          <table className="w-full min-w-max table-auto text-left">
            <thead>
              <tr className="bg-blue-gray-50/50 sticky top-0 z-10">
                <th className="p-4 border-b border-blue-gray-50">Test Name</th>
                <th className="p-4 border-b border-blue-gray-50">Price</th>
                <th className="p-4 border-b border-blue-gray-50">Status</th>
                <th className="p-4 border-b border-blue-gray-50 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {catalogTests.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">No lab tests found.</td>
                </tr>
              ) : (
                catalogTests.map((test) => (
                  <tr key={test.id} className="hover:bg-gray-50 border-b border-blue-gray-50">
                    <td className="p-4">
                      <div className="font-bold text-blue-gray-800">{test.test_name}</div>
                      <div className="text-xs text-gray-500">{test.description}</div>
                    </td>
                    <td className="p-4 font-medium">${Number(test.price).toFixed(2)}</td>
                    <td className="p-4">
                      <Chip
                        value={test.status}
                        color={test.status === 'active' ? 'green' : 'gray'}
                        size="sm"
                        variant="ghost"
                        className="rounded-full w-max uppercase"
                      />
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <IconButton size="sm" variant="text" color="blue" onClick={() => openTestForm(test)}>
                          <PencilIcon className="h-4 w-4" />
                        </IconButton>
                        <IconButton size="sm" variant="text" color="red" onClick={() => handleDeleteTest(test.id)}>
                          <TrashIcon className="h-4 w-4" />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </DialogBody>
      </Dialog>

      {/* Add/Edit Test Form Modal */}
      <Dialog open={testFormModalOpen} handler={() => setTestFormModalOpen(false)} size="xs">
        <DialogHeader>{editingTest ? 'Edit Lab Test' : 'Add New Lab Test'}</DialogHeader>
        <DialogBody className="flex flex-col gap-4">
          <Input
            label="Test Name"
            value={testFormData.test_name}
            onChange={(e) => setTestFormData({ ...testFormData, test_name: e.target.value })}
            crossOrigin={undefined}
          />
          <Input
            label="Price ($)"
            type="number"
            value={testFormData.price}
            onChange={(e) => setTestFormData({ ...testFormData, price: e.target.value })}
            crossOrigin={undefined}
          />
          <Textarea
            label="Description"
            value={testFormData.description}
            onChange={(e) => setTestFormData({ ...testFormData, description: e.target.value })}
          />
          <Select
            label="Status"
            value={testFormData.status}
            onChange={(val) => setTestFormData({ ...testFormData, status: val as string })}
          >
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
          </Select>
        </DialogBody>
        <DialogFooter>
          <Button variant="text" onClick={() => setTestFormModalOpen(false)} className="mr-1">Cancel</Button>
          <Button variant="gradient" color="blue" onClick={handleSaveTest}>Save</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  return (
    <Card className="border border-blue-gray-100 shadow-sm">
      <CardBody className="p-4 text-right">
        <div className={`mb-4 grid h-10 w-10 place-items-center rounded-lg bg-${color}-500 text-white shadow-lg shadow-${color}-500/40 float-left`}>
          {icon}
        </div>
        <Typography variant="small" className="font-normal text-blue-gray-600">
          {title}
        </Typography>
        <Typography variant="h4" color="blue-gray">
          {value}
        </Typography>
      </CardBody>
    </Card>
  );
}
