import { Chip } from "@material-tailwind/react";

export function StatusBadge({ status, size = "sm" }) {
  const getStatusConfig = (status) => {
    const configs = {
      // Appointment Status
      pending: { color: "yellow", label: "Pending" },
      confirmed: { color: "green", label: "Confirmed" },
      completed: { color: "blue", label: "Completed" },
      cancelled: { color: "red", label: "Cancelled" },
      rescheduled: { color: "orange", label: "Rescheduled" },
      
      // Patient Status
      active: { color: "green", label: "Active" },
      inactive: { color: "gray", label: "Inactive" },
      critical: { color: "red", label: "Critical" },
      
      // Doctor Status
      available: { color: "green", label: "Available" },
      busy: { color: "red", label: "Busy" },
      offline: { color: "gray", label: "Offline" },
      on_leave: { color: "orange", label: "On Leave" },
      
      // Inventory Status
      in_stock: { color: "green", label: "In Stock" },
      low_stock: { color: "yellow", label: "Low Stock" },
      out_of_stock: { color: "red", label: "Out of Stock" },
      
      // Inquiry Status
      new: { color: "blue", label: "New" },
      in_progress: { color: "orange", label: "In Progress" },
      resolved: { color: "green", label: "Resolved" },
      closed: { color: "gray", label: "Closed" },
      
      // Billing Status
      paid: { color: "green", label: "Paid" },
      overdue: { color: "red", label: "Overdue" },
      
      // Testimonial Status
      approved: { color: "green", label: "Approved" },
      rejected: { color: "red", label: "Rejected" },
      
      // General
      online: { color: "green", label: "Online" },
      offline: { color: "gray", label: "Offline" },
    };
    
    return configs[status?.toLowerCase()] || { color: "gray", label: status || "Unknown" };
  };

  const config = getStatusConfig(status);
  
  const sizeClasses = {
    sm: "py-0.5 px-2 text-[11px]",
    md: "py-1 px-3 text-xs",
    lg: "py-1.5 px-4 text-sm",
  };

  return (
    <Chip
      variant="gradient"
      color={config.color}
      value={config.label}
      className={`${sizeClasses[size]} font-semibold w-fit capitalize shadow-sm`}
    />
  );
}

export default StatusBadge;
