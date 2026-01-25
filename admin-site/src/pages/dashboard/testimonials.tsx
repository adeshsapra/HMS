import React, { useState, useEffect } from "react";
import { DataTable, ViewModal, DeleteConfirmModal, Column, ViewField } from "@/components";
import {
  Avatar,
  Typography,
  Chip,
  Input,
  IconButton,
  Card,
  CardBody,
  Tabs,
  TabsHeader,
  Tab,
} from "@material-tailwind/react";
import {
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { apiService } from "@/services/api";
import { useToast } from "@/context/ToastContext";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  message: string;
  rating: number;
  status: "pending" | "approved" | "rejected";
  image_url: string;
  created_at: string;
}

export default function Testimonials(): JSX.Element {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openViewModal, setOpenViewModal] = useState<boolean>(false);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [selectedTestimonial, setSelectedTestimonial] =
    useState<Testimonial | null>(null);

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    perPage: 10,
  });

  // Search
  const [searchQuery, setSearchQuery] = useState<string>("");

  const tabs = [
    { label: "All Reviews", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
  ];

  useEffect(() => {
    fetchTestimonials(pagination.currentPage);
  }, [pagination.currentPage, activeTab, searchQuery]);

  const fetchTestimonials = async (page = 1) => {
    try {
      setLoading(true);
      const response = await apiService.getTestimonials({
        page: page,
        per_page: pagination.perPage,
        status: activeTab === "all" ? "" : activeTab,
        search: searchQuery,
      });

      if (response.status) {
        setTestimonials(response.data);
        setPagination((prev) => ({
          ...prev,
          currentPage: response.meta.current_page,
          totalPages: response.meta.last_page,
          totalItems: response.meta.total,
        }));
      }
    } catch (error: any) {
      showToast(error.message || "Failed to fetch testimonials", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    id: number,
    status: "approved" | "rejected"
  ) => {
    try {
      const response = await apiService.updateTestimonialStatus(id, status);
      if (response.status) {
        showToast(`Testimonial ${status} successfully`, "success");
        fetchTestimonials(pagination.currentPage);
      }
    } catch (error: any) {
      showToast(error.message || "Failed to update status", "error");
    }
  };

  const handleDelete = (testimonial: Record<string, any>): void => {
    setSelectedTestimonial(testimonial as Testimonial);
    setOpenDeleteModal(true);
  };

  const confirmDelete = async (): Promise<void> => {
    if (selectedTestimonial) {
      try {
        const response = await apiService.deleteTestimonial(
          selectedTestimonial.id
        );
        if (response.status) {
          showToast("Testimonial deleted successfully", "success");
          fetchTestimonials(pagination.currentPage);
          setOpenDeleteModal(false);
          setSelectedTestimonial(null);
        }
      } catch (error: any) {
        showToast(error.message || "Failed to delete testimonial", "error");
      }
    }
  };

  const handleView = (testimonial: Record<string, any>): void => {
    setSelectedTestimonial(testimonial as Testimonial);
    setOpenViewModal(true);
  };

  const getFullImageUrl = (path: string | null) => {
    if (!path) return "/img/team-1.jpeg";
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000';
    return `${baseUrl}/storage/${path}`;
  };

  const columns: Column[] = [
    {
      key: "image_url",
      label: "Photo",
      render: (value: any, row: Record<string, any>) => (
        <Avatar
          src={getFullImageUrl(value)}
          alt={row.name}
          size="sm"
          variant="rounded"
          className="border-2 border-blue-gray-100 shadow-sm"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/img/team-1.jpeg";
          }}
        />
      ),
    },
    {
      key: "name",
      label: "Patient",
      render: (value: any, row: Record<string, any>) => (
        <div className="flex flex-col">
          <Typography variant="small" color="blue-gray" className="font-bold">
            {value}
          </Typography>
          <Typography
            variant="small"
            className="text-xs text-blue-gray-400 font-normal"
          >
            {row.role}
          </Typography>
        </div>
      ),
    },
    {
      key: "rating",
      label: "Rating",
      render: (value: any) => (
        <div className="flex items-center gap-1">
          <Typography className="text-sm font-bold text-amber-500">
            {"★".repeat(value)}
            {"☆".repeat(5 - value)}
          </Typography>
          <Typography className="text-xs text-blue-gray-400 font-normal">
            ({value}/5)
          </Typography>
        </div>
      ),
    },
    {
      key: "message",
      label: "Comment",
      render: (value: any) => (
        <Typography className="text-xs text-blue-gray-600 max-w-[250px] truncate italic">
          "{value}"
        </Typography>
      ),
    },
    {
      key: "created_at",
      label: "Date",
      render: (value: any) => (
        <span className="text-xs font-medium text-blue-gray-700">
          {new Date(value).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value: any) => {
        const colors: Record<string, string> = {
          approved: "green",
          pending: "amber",
          rejected: "red",
        };
        return (
          <Chip
            variant="gradient"
            color={(colors[value] as any) || "blue-gray"}
            value={value}
            className="py-0.5 px-2 text-[10px] font-medium"
          />
        );
      },
    },
    {
      key: "moderation",
      label: "Moderation",
      render: (_, row: Record<string, any>) => (
        <div className="flex items-center gap-1">
          {row.status !== "approved" && (
            <IconButton
              variant="text"
              color="green"
              size="sm"
              className="rounded-full hover:bg-green-50"
              onClick={() => handleUpdateStatus(row.id, "approved")}
              title="Approve"
            >
              <CheckCircleIcon className="h-5 w-5" />
            </IconButton>
          )}
          {row.status !== "rejected" && (
            <IconButton
              variant="text"
              color="red"
              size="sm"
              className="rounded-full hover:bg-red-50"
              onClick={() => handleUpdateStatus(row.id, "rejected")}
              title="Reject"
            >
              <XCircleIcon className="h-5 w-5" />
            </IconButton>
          )}
        </div>
      ),
    },
  ];

  const viewFields: ViewField[] = [
    { key: "image_url", label: "Photo", type: "avatar" },
    { key: "name", label: "Patient Name" },
    { key: "role", label: "Role/Title" },
    { key: "rating", label: "Rating" },
    { key: "message", label: "Message", fullWidth: true },
    { key: "created_at", label: "Date", type: "date" },
    { key: "status", label: "Status", type: "status" },
  ];

  return (
    <div className="mt-12 mb-8">
      <div className="mb-6">
        <Typography variant="h2" color="blue-gray" className="mb-2">
          Testimonials Management
        </Typography>
        <Typography variant="small" color="blue-gray" className="font-normal opacity-70">
          Manage patient testimonials and reviews appearing on the public site
        </Typography>
      </div>

      <Card className="border border-blue-gray-100 shadow-sm overflow-hidden">
        <CardBody className="p-0">
          <Tabs value={activeTab}>
            <TabsHeader
              className="bg-transparent border-b border-blue-gray-50 px-6 rounded-none"
              indicatorProps={{
                className: "bg-blue-500/10 shadow-none border-b-2 border-blue-500 rounded-none !z-0",
              }}
            >
              {tabs.map(({ label, value }) => (
                <Tab
                  key={value}
                  value={value}
                  onClick={() => {
                    setActiveTab(value);
                    setPagination((prev) => ({ ...prev, currentPage: 1 }));
                  }}
                  className={`py-4 font-semibold text-sm transition-colors duration-300 ${activeTab === value ? "text-blue-500" : "text-blue-gray-500 hover:text-blue-700"
                    }`}
                >
                  {label}
                </Tab>
              ))}
            </TabsHeader>

            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="w-full md:w-96">
                  <Input
                    label="Search reviews..."
                    icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPagination((prev) => ({ ...prev, currentPage: 1 }));
                    }}
                    crossOrigin={undefined}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Typography variant="small" color="blue-gray" className="font-bold">
                    {activeTab.toUpperCase()} REVIEWS:
                  </Typography>
                  <Chip
                    value={pagination.totalItems}
                    color="blue"
                    variant="ghost"
                    size="sm"
                    className="rounded-full"
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <DataTable
                  title="Patient Reviews List"
                  data={testimonials}
                  columns={columns}
                  onView={handleView}
                  onDelete={handleDelete}
                  searchable={false}
                  pagination={{
                    currentPage: pagination.currentPage,
                    totalPages: pagination.totalPages,
                    totalItems: pagination.totalItems,
                    perPage: pagination.perPage,
                    onPageChange: (page) =>
                      setPagination((prev) => ({ ...prev, currentPage: page })),
                  }}
                />
              )}
            </div>
          </Tabs>
        </CardBody>
      </Card>

      <ViewModal
        open={openViewModal}
        onClose={() => {
          setOpenViewModal(false);
          setSelectedTestimonial(null);
        }}
        title="Testimonial Details"
        data={selectedTestimonial || {}}
        fields={viewFields}
      />

      <DeleteConfirmModal
        open={openDeleteModal}
        onClose={() => {
          setOpenDeleteModal(false);
          setSelectedTestimonial(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Testimonial"
        message="Are you sure you want to permanently delete this testimonial? This action cannot be undone."
        itemName={selectedTestimonial?.name}
      />
    </div>
  );
}
