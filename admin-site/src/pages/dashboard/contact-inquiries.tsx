import React, { useState, useEffect } from "react";
import { DataTable, ViewModal, DeleteConfirmModal, Column, ViewField } from "@/components";
import { apiService } from "@/services/api";
import { useToast } from "@/context/ToastContext";
import { CheckIcon, EyeIcon } from "@heroicons/react/24/outline";

interface ContactInquiry {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  created_at: string;
  status: 'unread' | 'read' | 'replied';
}

export default function ContactInquiries(): JSX.Element {
  const { showToast } = useToast();
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openViewModal, setOpenViewModal] = useState<boolean>(false);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const response = await apiService.getContactEnquiries();
      if (response.success || response.status) {
        setInquiries(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching enquiries:", error);
      showToast("Failed to load contact enquiries", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleStatusChange = async (id: number, status: 'read' | 'replied') => {
    try {
      await apiService.updateContactEnquiryStatus(id, status);
      showToast(`Status updated to ${status}`, "success");
      fetchInquiries();
    } catch (error) {
      showToast("Failed to update status", "error");
    }
  };

  const handleDelete = (inquiry: any): void => {
    setSelectedInquiry(inquiry as ContactInquiry);
    setOpenDeleteModal(true);
  };

  const confirmDelete = async (): Promise<void> => {
    if (selectedInquiry) {
      try {
        await apiService.deleteContactEnquiry(selectedInquiry.id);
        showToast("Enquiry deleted successfully", "success");
        fetchInquiries();
      } catch (error) {
        showToast("Failed to delete enquiry", "error");
      }
      setOpenDeleteModal(false);
      setSelectedInquiry(null);
    }
  };

  const handleView = async (inquiry: any): Promise<void> => {
    const item = inquiry as ContactInquiry;
    setSelectedInquiry(item);
    setOpenViewModal(true);

    // Automatically mark as read if it was unread
    if (item.status === 'unread') {
      await handleStatusChange(item.id, 'read');
    }
  };

  const columns: Column[] = [
    {
      key: "name",
      label: "Name",
      render: (value: any) => (
        <span className="font-bold text-blue-gray-800">{value}</span>
      ),
    },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "subject", label: "Subject" },
    {
      key: "message",
      label: "Message",
      render: (value: any) => (
        <div className="max-w-xs text-sm text-blue-gray-600 truncate">
          {value}
        </div>
      ),
    },
    {
      key: "created_at",
      label: "Date",
      render: (value: any) => (
        <span className="text-sm font-medium text-blue-gray-700">
          {new Date(value).toLocaleDateString()}
        </span>
      ),
    },
    { key: "status", label: "Status", type: "status" },
  ];

  const viewFields: ViewField[] = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "subject", label: "Subject" },
    { key: "message", label: "Message", fullWidth: true },
    { key: "created_at", label: "Date", type: "date" },
    { key: "status", label: "Status", type: "status" },
  ];

  const customActions = (row: any) => {
    const item = row as ContactInquiry;
    const actions = [];

    if (item.status === 'unread') {
      actions.push({
        label: "Mark Read",
        icon: <EyeIcon className="h-4 w-4" />,
        color: "blue" as const,
        onClick: () => handleStatusChange(item.id, 'read')
      });
    }

    if (item.status === 'read') {
      actions.push({
        label: "Mark Replied",
        icon: <CheckIcon className="h-4 w-4" />,
        color: "green" as const,
        onClick: () => handleStatusChange(item.id, 'replied')
      });
    }

    return actions;
  };

  return (
    <div className="mt-12 mb-8">
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-blue-gray-800 mb-2">Contact Inquiries</h2>
        <p className="text-blue-gray-600 text-base">Manage contact form submissions and inquiries from the main website</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <DataTable
          title="Contact Inquiries"
          data={inquiries}
          columns={columns}
          onDelete={handleDelete}
          onView={handleView}
          customActions={customActions}
          searchable={true}
          filterable={true}
          exportable={true}
          searchPlaceholder="Search enquiries..."
        />
      )}

      <ViewModal
        open={openViewModal}
        onClose={() => {
          setOpenViewModal(false);
          setSelectedInquiry(null);
        }}
        title="Inquiry Details"
        data={selectedInquiry || {}}
        fields={viewFields}
      />

      <DeleteConfirmModal
        open={openDeleteModal}
        onClose={() => {
          setOpenDeleteModal(false);
          setSelectedInquiry(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Inquiry"
        message="Are you sure you want to delete this inquiry? This action cannot be undone."
        itemName={selectedInquiry?.name}
      />
    </div>
  );
}

