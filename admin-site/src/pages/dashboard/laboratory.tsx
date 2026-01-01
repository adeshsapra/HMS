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
} from "@material-tailwind/react";
import {
  BeakerIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  CheckCircleIcon,
  DocumentArrowUpIcon,
  EyeIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import { apiService } from "@/services/api";
import { useToast } from "@/context/ToastContext";

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

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Stats
      const statsRes = await apiService.getLabStats();
      setStats(statsRes as any);

      // Fetch Tests based on tab
      let statusFilter = "";
      if (activeTab === "pending_sample") statusFilter = "ordered";
      else if (activeTab === "sample_collected") statusFilter = "sample_collected";
      else if (activeTab === "completed") statusFilter = "completed";

      const testsRes = await apiService.getLabTests(1, statusFilter);
      setTests(testsRes.data);
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

  return (
    <div className="mt-8">
      <div className="mb-6 flex flex-col justify-between gap-8 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-blue-gray-800">Laboratory</h2>
          <p className="text-blue-gray-600">Manage lab tests, samples, and reports</p>
        </div>
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
          <div className="rounded-none border-b border-blue-gray-50 p-4">
            <Tabs value={activeTab}>
              <TabsHeader className="max-w-4xl mx-auto bg-gray-100 p-1">
                <div className="grid grid-cols-2 md:grid-cols-4 w-full">
                  <Tab
                    value="all"
                    onClick={() => setActiveTab("all")}
                    className="text-center text-sm md:text-base py-2 hover:bg-white transition-colors"
                  >
                    All Tests
                  </Tab>
                  <Tab
                    value="pending_sample"
                    onClick={() => setActiveTab("pending_sample")}
                    className="text-center text-sm md:text-base py-2 hover:bg-white transition-colors"
                  >
                    Pending Sample
                  </Tab>
                  <Tab
                    value="sample_collected"
                    onClick={() => setActiveTab("sample_collected")}
                    className="text-center text-sm md:text-base py-2 hover:bg-white transition-colors"
                  >
                    Sample Collected
                  </Tab>
                  <Tab
                    value="completed"
                    onClick={() => setActiveTab("completed")}
                    className="text-center text-sm md:text-base py-2 hover:bg-white transition-colors"
                  >
                    Completed
                  </Tab>
                </div>
              </TabsHeader>
            </Tabs>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-max table-auto text-left">
              <thead>
                <tr>
                  <th className="border-b border-blue-gray-50 bg-blue-gray-50/50 p-4 w-[280px]">
                    <Typography variant="small" color="blue-gray" className="font-bold opacity-70">
                      Test Name
                    </Typography>
                  </th>
                  <th className="border-b border-blue-gray-50 bg-blue-gray-50/50 p-4 w-[200px]">
                    <Typography variant="small" color="blue-gray" className="font-bold opacity-70">
                      Patient
                    </Typography>
                  </th>
                  <th className="border-b border-blue-gray-50 bg-blue-gray-50/50 p-4 w-[180px]">
                    <Typography variant="small" color="blue-gray" className="font-bold opacity-70">
                      Doctor (Order)
                    </Typography>
                  </th>
                  <th className="border-b border-blue-gray-50 bg-blue-gray-50/50 p-4 w-[140px]">
                    <Typography variant="small" color="blue-gray" className="font-bold opacity-70">
                      Status
                    </Typography>
                  </th>
                  <th className="border-b border-blue-gray-50 bg-blue-gray-50/50 p-4 w-[180px]">
                    <Typography variant="small" color="blue-gray" className="font-bold opacity-70">
                      Action
                    </Typography>
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-blue-gray-500">
                      <div className="flex justify-center items-center">
                        <ClockIcon className="h-5 w-5 mr-2 animate-pulse" />
                        Loading...
                      </div>
                    </td>
                  </tr>
                ) : !tests || tests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <BeakerIcon className="h-12 w-12 text-gray-300 mb-2" />
                        No tests found.
                      </div>
                    </td>
                  </tr>
                ) : (
                  tests.map((test) => (
                    <tr key={test.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 border-b border-blue-gray-50">
                        <div className="flex flex-col gap-1">
                          <Typography variant="small" color="blue-gray" className="font-bold">
                            {test.test_name}
                          </Typography>
                          <Chip
                            size="sm"
                            variant="ghost"
                            value={test.priority}
                            color={test.priority === 'urgent' ? 'red' : 'blue'}
                            className="w-max rounded-full capitalize text-[10px] px-2 py-0"
                          />
                        </div>
                      </td>
                      <td className="p-4 border-b border-blue-gray-50">
                        <div className="flex flex-col">
                          <Typography variant="small" color="blue-gray" className="font-normal">
                            {/* Handle both User and Patient models */}
                            {test.prescription?.patient
                              ? (test.prescription.patient.first_name
                                ? `${test.prescription.patient.first_name} ${test.prescription.patient.last_name || ''}`
                                : (test.prescription.patient as any).name)
                              : 'Unknown'}
                          </Typography>
                        </div>
                      </td>
                      <td className="p-4 border-b border-blue-gray-50">
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {/* Handle Doctor name via User or Name fields */}
                          {test.prescription?.doctor
                            ? (test.prescription.doctor.first_name
                              ? `${test.prescription.doctor.first_name} ${test.prescription.doctor.last_name}`
                              : test.prescription.doctor.user?.name)
                            : 'No Doctor'}
                        </Typography>
                      </td>
                      <td className="p-4 border-b border-blue-gray-50">
                        <div className="flex flex-col gap-1">
                          <Chip
                            size="sm"
                            variant="ghost"
                            value={test.status.replace('_', ' ')}
                            color={getStatusColor(test.status) as any}
                            className="rounded-full capitalize w-max"
                          />
                          {test.report && test.report.verified_by && (
                            <div className="flex items-center gap-1 text-green-600 text-[10px] font-bold">
                              <CheckBadgeIcon className="h-3 w-3" /> Verified
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 border-b border-blue-gray-50">
                        <div className="flex flex-wrap gap-2">
                          {test.status === 'ordered' && !isDoctor && (
                            <Button
                              size="sm"
                              variant="outlined"
                              className="flex items-center gap-1 normal-case py-1 px-3 min-w-[100px]"
                              onClick={() => {
                                setSelectedTest(test);
                                setCollectModalOpen(true);
                                setSampleData({ ...sampleData, sample_type: 'Blood' });
                              }}
                            >
                              <BeakerIcon className="h-3 w-3" /> Collect
                            </Button>
                          )}
                          {test.status === 'sample_collected' && !isDoctor && (
                            <Button
                              size="sm"
                              variant="filled"
                              className="flex items-center gap-1 normal-case py-1 px-3 bg-blue-500 min-w-[100px]"
                              onClick={() => {
                                setSelectedTest(test);
                                setUploadModalOpen(true);
                                setReportData({ report_title: test.test_name + " Report", result_summary: "", file: null });
                              }}
                            >
                              <DocumentArrowUpIcon className="h-3 w-3" /> Upload
                            </Button>
                          )}
                          {test.status === 'completed' && test.report && (
                            <Button
                              size="sm"
                              variant="text"
                              className="flex items-center gap-1 normal-case py-1 px-3 text-blue-600 min-w-[100px]"
                              onClick={() => {
                                setSelectedTest(test);
                                setViewModalOpen(true);
                              }}
                            >
                              <EyeIcon className="h-3 w-3" /> View Report
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
