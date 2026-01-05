import { useState, useEffect } from "react";
import { patientProfileAPI } from "../services/api";
import { useToast } from "../context/ToastContext";

interface MedicalRecord {
  id: number;
  report_title: string;
  report_category: string;
  file_type: string;
  file_path: string | null;
  result_summary: string | null;
  report_status: string;
  doctor_name: string;
  doctor_specialization: string | null;
  appointment_date: string | null;
  lab_test_name: string | null;
  verified_by: number | null;
  verified_at: string | null;
  uploaded_at: string;
  created_at: string;
}

interface MedicalRecordFilters {
  category: string;
  status: string;
  start_date: string;
  end_date: string;
}

interface MedicalRecordPagination {
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

const MyMedicalRecords = () => {
  const { showToast } = useToast();

  // State management
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsPagination, setRecordsPagination] =
    useState<MedicalRecordPagination>({
      current_page: 1,
      last_page: 1,
      total: 0,
      per_page: 10,
    });
  const [recordFilters, setRecordFilters] = useState<MedicalRecordFilters>({
    category: "",
    status: "",
    start_date: "",
    end_date: "",
  });

  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(
    null
  );
  const [viewingDocument, setViewingDocument] = useState<{
    url: string;
    title: string;
    type: string;
    recordId?: number;
  } | null>(null);

  // Helper function to format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  // Fetch medical records
  const fetchMedicalRecords = async (page = 1) => {
    try {
      setRecordsLoading(true);
      const response = await patientProfileAPI.getMyMedicalRecords({
        ...recordFilters,
        per_page: 10,
        page: page,
      });

      if (response.data.status) {
        const paginator = response.data.data;
        setRecords(paginator.data);
        setRecordsPagination({
          current_page: paginator.current_page,
          last_page: paginator.last_page,
          total: paginator.total,
          per_page: paginator.per_page,
        });
      }
    } catch (error) {
      console.error("Error fetching medical records:", error);
      showToast("Failed to load medical records", "error");
    } finally {
      setRecordsLoading(false);
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    const baseClass = "profile-medical-record-status-badge";
    switch (status?.toLowerCase()) {
      case "uploaded":
        return `${baseClass} uploaded`;
      case "verified":
        return `${baseClass} verified`;
      default:
        return `${baseClass} uploaded`;
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "uploaded":
        return "bi-file-earmark-check";
      case "verified":
        return "bi-shield-check";
      default:
        return "bi-file-earmark";
    }
  };

  // Handle record actions
  const handleViewRecord = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setViewModalOpen(true);
  };

  // Handle document viewer - use secure endpoint with blob URL
  const handleViewDocument = async (record: MedicalRecord) => {
    if (record.file_path && record.id) {
      try {
        const apiBaseUrl =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
        const token = localStorage.getItem("auth_token");

        if (!token) {
          showToast("Authentication required", "error");
          return;
        }

        const secureUrl = `${apiBaseUrl}/patient-profile/medical-records/${record.id}/file`;

        // Fetch the file with authentication
        const response = await fetch(secureUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: record.file_type === "pdf" ? "application/pdf" : "image/*",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load document");
        }

        // Create blob URL for the iframe
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        setViewingDocument({
          url: blobUrl,
          title: record.report_title,
          type: record.file_type,
          recordId: record.id,
        });
        setDocumentViewerOpen(true);
      } catch (error) {
        console.error("Error loading document:", error);
        showToast(
          "Failed to load document. Please try downloading instead.",
          "error"
        );
      }
    }
  };

  // Handle download - use secure endpoint with authentication
  const handleDownload = async (recordId: number, filename: string) => {
    try {
      const apiBaseUrl =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
      const token = localStorage.getItem("auth_token");

      if (!token) {
        showToast("Authentication required", "error");
        return;
      }

      const secureUrl = `${apiBaseUrl}/patient-profile/medical-records/${recordId}/file`;

      // Fetch the file with authentication
      const response = await fetch(secureUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/pdf, image/*",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to download file: ${response.status} ${response.statusText}`
        );
      }

      // Get the blob
      const blob = await response.blob();

      // Get file extension from blob type
      let fileExtension = "pdf";
      if (blob.type) {
        if (blob.type.includes("pdf")) {
          fileExtension = "pdf";
        } else if (blob.type.includes("image")) {
          const typeMatch = blob.type.match(/image\/(\w+)/);
          if (typeMatch) {
            fileExtension = typeMatch[1];
          }
        }
      }

      // Clean filename - remove invalid characters and add extension
      const cleanFilename = (filename || "medical-report")
        .replace(/[^a-z0-9\s-]/gi, "_")
        .replace(/\s+/g, "_")
        .toLowerCase();

      // Create download link with proper filename
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${cleanFilename}.${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showToast("File downloaded successfully", "success");
    } catch (error: any) {
      console.error("Download error:", error);
      const errorMessage = error?.message || "Failed to download file";
      showToast(errorMessage, "error");
    }
  };

  // Initial load
  useEffect(() => {
    fetchMedicalRecords();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    fetchMedicalRecords(1);
  }, [recordFilters]);

  return (
    <div className="profile-medical-record-container">
      <style>{`
                .profile-medical-record-container {
                    --pmr-bg-color: #ffffff;
                    --pmr-default-color: #2c3031;
                    --pmr-heading-color: #18444c;
                    --pmr-accent-color: #049ebb;
                    --pmr-surface-color: #ffffff;
                    --pmr-contrast-color: #ffffff;
                    
                    width: 100%;
                    font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                }

                /* --- Main Card Section --- */
                .profile-medical-record-section {
                    background: var(--pmr-surface-color);
                    border-radius: 20px;
                    padding: 2.5rem;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
                    min-height: 600px;
                    border: 1px solid rgba(0,0,0,0.02);
                }

                .profile-medical-record-section-header {
                    margin-bottom: 2.5rem;
                    padding-bottom: 1.5rem;
                    border-bottom: 1px solid color-mix(in srgb, var(--pmr-default-color), transparent 92%);
                }

                .profile-medical-record-section-header h3 {
                    font-size: 1.85rem;
                    color: var(--pmr-heading-color);
                    margin-bottom: 0.5rem;
                    font-weight: 700;
                    letter-spacing: -0.5px;
                }

                .profile-medical-record-section-header p {
                    color: color-mix(in srgb, var(--pmr-default-color), transparent 30%);
                    font-weight: 500;
                }

                /* --- Filters & Buttons --- */
                .profile-medical-record-filters {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    flex-wrap: wrap;
                }

                .profile-medical-record-filters .form-control {
                    min-width: 160px;
                    border-radius: 8px;
                    border: 1px solid #e0e0e0;
                    padding: 0.4rem 0.8rem;
                }
                
                .profile-medical-record-filters .form-control:focus {
                    border-color: var(--pmr-accent-color);
                    box-shadow: 0 0 0 4px color-mix(in srgb, var(--pmr-accent-color), transparent 90%);
                }

                .profile-medical-record-btn-refresh {
                    color: var(--pmr-accent-color);
                    border-color: var(--pmr-accent-color);
                    border-radius: 8px;
                    padding: 0.4rem 1rem;
                    transition: all 0.3s;
                }

                .profile-medical-record-btn-refresh:hover {
                    background-color: var(--pmr-accent-color);
                    color: #fff;
                }

                /* --- Record Cards --- */
                .profile-medical-record-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                    position: relative;
                }

                .profile-medical-record-card {
                    background: var(--pmr-surface-color);
                    border: 1px solid color-mix(in srgb, var(--pmr-default-color), transparent 92%);
                    border-radius: 16px;
                    padding: 1.75rem;
                    transition: all 0.3s ease;
                    position: relative;
                    z-index: 1;
                }

                .profile-medical-record-card:hover {
                    border-color: color-mix(in srgb, var(--pmr-accent-color), transparent 70%);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
                    transform: translateY(-3px);
                    z-index: 2;
                }

                .profile-medical-record-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1.25rem;
                }

                .profile-medical-record-title {
                    color: var(--pmr-heading-color);
                    font-size: 1.15rem;
                    font-weight: 700;
                    margin-bottom: 0.25rem;
                }

                .profile-medical-record-category {
                    font-size: 0.9rem;
                    color: color-mix(in srgb, var(--pmr-default-color), transparent 40%);
                    font-weight: 500;
                    text-transform: capitalize;
                }

                /* --- Status Badges --- */
                .profile-medical-record-status-badge {
                    padding: 0.5rem 1rem;
                    border-radius: 30px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.25rem;
                }

                .profile-medical-record-status-badge.uploaded { background: #fff8e1; color: #f57f17; }
                .profile-medical-record-status-badge.verified { background: #e8f5e9; color: #2e7d32; }

                /* --- Details Grid --- */
                .profile-medical-record-details {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 1rem;
                    margin-bottom: 1.25rem;
                    padding-bottom: 1.25rem;
                    border-bottom: 1px dashed color-mix(in srgb, var(--pmr-default-color), transparent 85%);
                }

                .profile-medical-record-detail-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    color: var(--pmr-default-color);
                    font-size: 0.95rem;
                }

                .profile-medical-record-icon-box {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    background: color-mix(in srgb, var(--pmr-accent-color), transparent 92%);
                    color: var(--pmr-accent-color);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .profile-medical-record-summary {
                    background: color-mix(in srgb, var(--pmr-heading-color), transparent 96%);
                    border-radius: 10px;
                    padding: 1rem;
                    margin-bottom: 1rem;
                    font-size: 0.9rem;
                    color: var(--pmr-default-color);
                }

                /* --- Action Button & Dropdown --- */
                .profile-medical-record-card .dropdown {
                    position: relative;
                    z-index: 10;
                }

                .profile-medical-record-action-trigger {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    border: 1px solid #eee;
                    background: white;
                    color: var(--pmr-default-color);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                    position: relative;
                    z-index: 10;
                }

                .profile-medical-record-action-trigger:hover {
                    background: var(--pmr-heading-color);
                    color: white;
                    border-color: var(--pmr-heading-color);
                }

                .profile-medical-record-card .dropdown-menu {
                    position: absolute !important;
                    z-index: 1050 !important;
                    top: 100% !important;
                    right: 0 !important;
                    left: auto !important;
                    margin-top: 0.5rem;
                    min-width: 180px;
                }

                /* --- Pagination --- */
                .profile-medical-record-pagination {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 0.5rem;
                    margin-top: 2rem;
                }

                .profile-medical-record-page-link {
                    color: var(--pmr-heading-color);
                    border: none;
                    margin: 0 4px;
                    border-radius: 8px;
                    font-weight: 500;
                    padding: 0.5rem 0.75rem;
                    text-decoration: none;
                    background: transparent;
                    cursor: pointer;
                }
                
                .profile-medical-record-page-item.active .profile-medical-record-page-link {
                    background-color: var(--pmr-accent-color);
                    color: white;
                    box-shadow: 0 4px 10px color-mix(in srgb, var(--pmr-accent-color), transparent 50%);
                }

                /* --- MODAL DESIGN --- */
                .profile-medical-record-modal-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: color-mix(in srgb, var(--pmr-heading-color), transparent 40%);
                    backdrop-filter: blur(8px);
                    z-index: 1050;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    animation: pmrFadeIn 0.3s forwards;
                }

                .profile-medical-record-modal-content {
                    background: var(--pmr-surface-color);
                    width: 90%;
                    max-width: 700px;
                    border-radius: 24px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    overflow: hidden;
                    opacity: 0;
                    transform: scale(0.95) translateY(20px);
                    animation: pmrScaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }

                .profile-medical-record-modal-header {
                    padding: 1.5rem 2rem;
                    background: var(--pmr-surface-color);
                    border-bottom: 1px solid rgba(0,0,0,0.05);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .profile-medical-record-modal-title {
                    font-size: 1.4rem;
                    font-weight: 700;
                    color: var(--pmr-heading-color);
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                
                .profile-medical-record-modal-title i {
                    color: var(--pmr-accent-color);
                }

                .profile-medical-record-btn-close {
                    background: transparent;
                    border: none;
                    font-size: 1.5rem;
                    color: #999;
                    cursor: pointer;
                    transition: color 0.2s;
                    line-height: 1;
                }
                
                .profile-medical-record-btn-close:hover {
                    color: var(--pmr-heading-color);
                }

                .profile-medical-record-modal-body {
                    padding: 2rem;
                    overflow-y: auto;
                    max-height: 70vh;
                }

                .profile-medical-record-modal-footer {
                    padding: 1.5rem 2rem;
                    background: color-mix(in srgb, var(--pmr-surface-color), #f9f9f9 50%);
                    border-top: 1px solid rgba(0,0,0,0.05);
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                }

                .profile-medical-record-modal-label {
                    font-size: 0.8rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: color-mix(in srgb, var(--pmr-heading-color), transparent 40%);
                    margin-bottom: 0.5rem;
                    display: block;
                }

                .profile-medical-record-modal-value {
                    font-size: 14px;
                    color: var(--pmr-heading-color);
                    font-weight: 500;
                }

                .profile-medical-record-btn-secondary {
                    background: transparent;
                    border: 1px solid #ddd;
                    color: var(--pmr-default-color);
                    padding: 0.6rem 1.25rem;
                    border-radius: 10px;
                    font-weight: 600;
                    transition: all 0.2s;
                    cursor: pointer;
                }
                
                .profile-medical-record-btn-secondary:hover {
                    background: #f5f5f5;
                }

                .profile-medical-record-btn-primary {
                    background: var(--pmr-accent-color);
                    border: 1px solid var(--pmr-accent-color);
                    color: white;
                    padding: 0.6rem 1.5rem;
                    border-radius: 10px;
                    font-weight: 600;
                    box-shadow: 0 4px 12px color-mix(in srgb, var(--pmr-accent-color), transparent 60%);
                    transition: all 0.2s;
                    cursor: pointer;
                    text-decoration: none;
                    display: inline-block;
                }

                .profile-medical-record-btn-primary:hover {
                    background: color-mix(in srgb, var(--pmr-accent-color), black 10%);
                    transform: translateY(-1px);
                }

                @keyframes pmrFadeIn {
                    to { opacity: 1; }
                }

                @keyframes pmrScaleUp {
                    to { 
                        opacity: 1; 
                        transform: scale(1) translateY(0);
                    }
                }

                /* --- Document Viewer Modal --- */
                .profile-medical-record-document-viewer {
                    background: var(--pmr-surface-color);
                    width: 95%;
                    max-width: 1200px;
                    height: 90vh;
                    border-radius: 16px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    overflow: hidden;
                    opacity: 0;
                    transform: scale(0.95) translateY(20px);
                    animation: pmrScaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }

                .profile-medical-record-document-header {
                    padding: 1rem 1.5rem;
                    background: var(--pmr-surface-color);
                    border-bottom: 1px solid rgba(0,0,0,0.1);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-shrink: 0;
                }

                .profile-medical-record-document-title {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: var(--pmr-heading-color);
                    display: flex;
                    align-items: center;
                    flex: 1;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .profile-medical-record-document-title i {
                    color: var(--pmr-accent-color);
                    font-size: 1.2rem;
                }

                .profile-medical-record-document-actions {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .profile-medical-record-document-body {
                    flex: 1;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f5f5f5;
                    position: relative;
                }

                .profile-medical-record-document-iframe {
                    width: 100%;
                    height: 100%;
                    border: none;
                    background: white;
                }

                .profile-medical-record-document-image {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                    background: white;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }

                @media (max-width: 768px) {
                    .profile-medical-record-section { padding: 1.5rem; }
                    .profile-medical-record-card-header { flex-direction: column; gap: 0.5rem; }
                    .profile-medical-record-modal-content { width: 95%; margin: 1rem; max-height: 90vh; }
                    .profile-medical-record-document-viewer { 
                        width: 100%; 
                        height: 100vh;
                        border-radius: 0;
                        max-width: 100%;
                    }
                    .profile-medical-record-document-header {
                        padding: 0.75rem 1rem;
                    }
                    .profile-medical-record-document-title {
                        font-size: 0.9rem;
                    }
                }
            `}</style>

      <div className="profile-medical-record-section">
        <div className="profile-medical-record-section-header">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h3>My Medical Records</h3>
              <p className="mb-0">
                View and download your medical reports and test results
              </p>
            </div>
            <div className="profile-medical-record-filters">
              <select
                className="form-control"
                value={recordFilters.category}
                onChange={(e) =>
                  setRecordFilters((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
              >
                <option value="">All Categories</option>
                <option value="lab">Lab Reports</option>
                <option value="xray">X-Ray</option>
                <option value="scan">Scan</option>
                <option value="other">Other</option>
              </select>
              <select
                className="form-control"
                value={recordFilters.status}
                onChange={(e) =>
                  setRecordFilters((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }))
                }
              >
                <option value="">All Status</option>
                <option value="uploaded">Uploaded</option>
                <option value="verified">Verified</option>
              </select>
              <button
                className="btn btn-outline-primary profile-medical-record-btn-refresh"
                onClick={() => fetchMedicalRecords(1)}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {recordsLoading ? (
          <div className="text-center py-5">
            <div
              className="spinner-border text-primary"
              role="status"
              style={{ color: "var(--pmr-accent-color)" }}
            >
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading your medical records...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="no-records text-center py-5">
            <div
              style={{ fontSize: "3rem", color: "#e0e0e0" }}
              className="mb-3"
            >
              <i className="bi bi-file-earmark-medical"></i>
            </div>
            <h4 style={{ color: "var(--pmr-heading-color)" }}>
              No Medical Records Found
            </h4>
            <p className="text-muted">
              You don't have any medical records matching your criteria.
            </p>
          </div>
        ) : (
          <>
            <div className="profile-medical-record-list">
              {records.map((record) => (
                <div key={record.id} className="profile-medical-record-card">
                  <div className="profile-medical-record-card-header">
                    <div className="record-info">
                      <h5 className="profile-medical-record-title">
                        {record.report_title}
                      </h5>
                      <p className="profile-medical-record-category">
                        {record.report_category}
                        {record.lab_test_name && ` • ${record.lab_test_name}`}
                      </p>
                    </div>
                    <div className="record-status">
                      <span
                        className={getStatusBadgeClass(record.report_status)}
                      >
                        <i
                          className={`bi ${getStatusIcon(
                            record.report_status
                          )}`}
                        ></i>
                        {record.report_status}
                      </span>
                    </div>
                  </div>

                  <div className="profile-medical-record-details">
                    <div className="profile-medical-record-detail-item">
                      <div className="profile-medical-record-icon-box">
                        <i className="bi bi-person-badge"></i>
                      </div>
                      <span>{record.doctor_name}</span>
                    </div>
                    {record.appointment_date && (
                      <div className="profile-medical-record-detail-item">
                        <div className="profile-medical-record-icon-box">
                          <i className="bi bi-calendar-event"></i>
                        </div>
                        <span>{formatDate(record.appointment_date)}</span>
                      </div>
                    )}
                    <div className="profile-medical-record-detail-item">
                      <div className="profile-medical-record-icon-box">
                        <i className="bi bi-clock"></i>
                      </div>
                      <span>{formatDate(record.uploaded_at)}</span>
                    </div>
                  </div>

                  {record.result_summary && (
                    <div className="profile-medical-record-summary mb-3">
                      <strong>Summary:</strong> {record.result_summary}
                    </div>
                  )}

                  <div className="d-flex justify-content-between align-items-center">
                    <div style={{ flex: 1 }}>
                      {record.file_path && (
                        <button
                          onClick={() => handleViewDocument(record)}
                          className="profile-medical-record-btn-primary"
                          style={{ border: "none", cursor: "pointer" }}
                        >
                          <i className="bi bi-eye me-2"></i>
                          View Document
                        </button>
                      )}
                    </div>

                    <div className="dropdown">
                      <button
                        className="profile-medical-record-action-trigger dropdown-toggle no-arrow"
                        type="button"
                        data-bs-toggle="dropdown"
                      >
                        <i className="bi bi-three-dots-vertical"></i>
                      </button>
                      <ul
                        className="dropdown-menu dropdown-menu-end shadow-sm border-0"
                        style={{ borderRadius: "12px", padding: "0.5rem" }}
                      >
                        <li>
                          <button
                            className="dropdown-item py-2 rounded"
                            onClick={() => handleViewRecord(record)}
                          >
                            <i className="bi bi-eye me-2 text-primary"></i>
                            View Details
                          </button>
                        </li>
                        {record.file_path && (
                          <li>
                            <button
                              className="dropdown-item py-2 rounded"
                              onClick={() =>
                                handleDownload(record.id, record.report_title)
                              }
                            >
                              <i className="bi bi-download me-2 text-success"></i>
                              Download
                            </button>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {recordsPagination.last_page > 1 && (
              <div className="profile-medical-record-pagination">
                <button
                  className="profile-medical-record-page-link"
                  onClick={() =>
                    fetchMedicalRecords(recordsPagination.current_page - 1)
                  }
                  disabled={recordsPagination.current_page === 1}
                >
                  <i className="bi bi-chevron-left"></i>
                </button>
                {Array.from(
                  { length: recordsPagination.last_page },
                  (_, i) => i + 1
                ).map((page) => (
                  <button
                    key={page}
                    className={`profile-medical-record-page-link ${
                      recordsPagination.current_page === page ? "active" : ""
                    }`}
                    onClick={() => fetchMedicalRecords(page)}
                  >
                    {page}
                  </button>
                ))}
                <button
                  className="profile-medical-record-page-link"
                  onClick={() =>
                    fetchMedicalRecords(recordsPagination.current_page + 1)
                  }
                  disabled={
                    recordsPagination.current_page ===
                    recordsPagination.last_page
                  }
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* View Modal */}
      {viewModalOpen && selectedRecord && (
        <div
          className="profile-medical-record-modal-backdrop"
          onClick={() => setViewModalOpen(false)}
        >
          <div
            className="profile-medical-record-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="profile-medical-record-modal-header">
              <h5 className="profile-medical-record-modal-title">
                <i className="bi bi-file-medical"></i>
                Medical Record Details
              </h5>
              <button
                type="button"
                className="profile-medical-record-btn-close"
                onClick={() => setViewModalOpen(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="profile-medical-record-modal-body">
              <div className="row g-4">
                <div className="col-md-6 border-end">
                  <div className="mb-4">
                    <label className="profile-medical-record-modal-label">
                      Report Title
                    </label>
                    <div className="profile-medical-record-modal-value">
                      {selectedRecord.report_title}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="profile-medical-record-modal-label">
                      Category
                    </label>
                    <div className="profile-medical-record-modal-value text-capitalize">
                      {selectedRecord.report_category}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="profile-medical-record-modal-label">
                      Status
                    </label>
                    <span
                      className={getStatusBadgeClass(
                        selectedRecord.report_status
                      )}
                    >
                      {selectedRecord.report_status}
                    </span>
                  </div>
                  {selectedRecord.lab_test_name && (
                    <div className="mb-4">
                      <label className="profile-medical-record-modal-label">
                        Lab Test
                      </label>
                      <div className="profile-medical-record-modal-value">
                        {selectedRecord.lab_test_name}
                      </div>
                    </div>
                  )}
                </div>
                <div className="col-md-6 ps-md-4">
                  <div className="mb-4">
                    <label className="profile-medical-record-modal-label">
                      Doctor
                    </label>
                    <div className="profile-medical-record-modal-value">
                      {selectedRecord.doctor_name}
                      {selectedRecord.doctor_specialization && (
                        <small className="text-muted d-block">
                          {selectedRecord.doctor_specialization}
                        </small>
                      )}
                    </div>
                  </div>
                  {selectedRecord.appointment_date && (
                    <div className="mb-4">
                      <label className="profile-medical-record-modal-label">
                        Appointment Date
                      </label>
                      <div className="profile-medical-record-modal-value">
                        {formatDate(selectedRecord.appointment_date)}
                      </div>
                    </div>
                  )}
                  <div className="mb-4">
                    <label className="profile-medical-record-modal-label">
                      Uploaded At
                    </label>
                    <div className="profile-medical-record-modal-value">
                      {formatDate(selectedRecord.uploaded_at)}
                    </div>
                  </div>
                  {selectedRecord.verified_at && (
                    <div className="mb-4">
                      <label className="profile-medical-record-modal-label">
                        Verified At
                      </label>
                      <div className="profile-medical-record-modal-value">
                        {formatDate(selectedRecord.verified_at)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {selectedRecord.result_summary && (
                <div className="mt-4">
                  <label className="profile-medical-record-modal-label">
                    Result Summary
                  </label>
                  <p className="p-3 bg-light rounded-3 mb-0 text-secondary">
                    {selectedRecord.result_summary}
                  </p>
                </div>
              )}
            </div>
            <div className="profile-medical-record-modal-footer">
              {selectedRecord.file_path && (
                <>
                  <button
                    className="profile-medical-record-btn-primary"
                    onClick={() => {
                      setViewModalOpen(false);
                      handleViewDocument(selectedRecord);
                    }}
                  >
                    <i className="bi bi-eye me-2"></i>
                    View Document
                  </button>
                  <button
                    className="profile-medical-record-btn-secondary"
                    onClick={() =>
                      handleDownload(
                        selectedRecord.id,
                        selectedRecord.report_title
                      )
                    }
                  >
                    <i className="bi bi-download me-2"></i>
                    Download
                  </button>
                </>
              )}
              <button
                className="profile-medical-record-btn-secondary"
                onClick={() => setViewModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {documentViewerOpen && viewingDocument && (
        <div
          className="profile-medical-record-modal-backdrop"
          onClick={() => {
            // Clean up blob URL when closing
            if (viewingDocument.url.startsWith("blob:")) {
              URL.revokeObjectURL(viewingDocument.url);
            }
            setDocumentViewerOpen(false);
          }}
        >
          <div
            className="profile-medical-record-document-viewer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="profile-medical-record-document-header">
              <div className="profile-medical-record-document-title">
                <i className="bi bi-file-earmark-medical me-2"></i>
                {viewingDocument.title}
              </div>
              <div className="profile-medical-record-document-actions">
                <button
                  className="profile-medical-record-btn-primary"
                  onClick={async () => {
                    if (viewingDocument.recordId) {
                      await handleDownload(
                        viewingDocument.recordId,
                        viewingDocument.title
                      );
                    } else {
                      showToast(
                        "Unable to download. Record ID not found.",
                        "error"
                      );
                    }
                  }}
                  style={{ marginRight: "0.5rem" }}
                >
                  <i className="bi bi-download me-2"></i>
                  Download
                </button>
                <button
                  type="button"
                  className="profile-medical-record-btn-close"
                  onClick={() => setDocumentViewerOpen(false)}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
            </div>
            <div className="profile-medical-record-document-body">
              {viewingDocument.type === "pdf" ? (
                <iframe
                  src={viewingDocument.url}
                  className="profile-medical-record-document-iframe"
                  title={viewingDocument.title}
                />
              ) : (
                <img
                  src={viewingDocument.url}
                  alt={viewingDocument.title}
                  className="profile-medical-record-document-image"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyMedicalRecords;
