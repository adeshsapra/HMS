import React from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Typography,
  Avatar,
  Chip,
} from "@material-tailwind/react";
import { XMarkIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { StatusBadge } from "./StatusBadge";

export interface ViewField {
  key: string;
  label: string;
  type?: "status" | "avatar" | "currency" | "date" | "badge";
  color?: string;
  fullWidth?: boolean;
  render?: (value: any, row: Record<string, any>) => React.ReactNode;
}

export interface ViewModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  data: Record<string, any> | null;
  fields: ViewField[];
}

export function ViewModal({ open, onClose, title, data, fields }: ViewModalProps): JSX.Element | null {
  if (!data) return null;

  const getStatusColor = (status: string): string => {
    const statusColors: Record<string, string> = {
      active: "green",
      inactive: "gray",
      pending: "yellow",
      confirmed: "green",
      completed: "blue",
      cancelled: "red",
      rescheduled: "orange",
      available: "green",
      busy: "red",
      in_stock: "green",
      low_stock: "yellow",
      out_of_stock: "red",
    };
    return statusColors[status?.toLowerCase()] || "gray";
  };

  const renderValue = (field: ViewField, value: any): JSX.Element => {
    // Use custom render function if provided
    if (field.render) {
      return <>{field.render(value, data)}</>;
    }
    
    if (field.type === "status") {
      return <StatusBadge status={value} size="lg" />;
    }
    if (field.type === "avatar" && value) {
      return (
        <Avatar 
          src={value} 
          alt={data.name || ""} 
          size="xl" 
          variant="rounded" 
          className="border-4 border-blue-gray-100 shadow-lg" 
        />
      );
    }
    if (field.type === "currency") {
      return (
        <span className="font-bold text-lg text-blue-gray-800">
          ${parseFloat(value || 0).toFixed(2)}
        </span>
      );
    }
    if (field.type === "date" && value) {
      return (
        <span className="text-blue-gray-700 font-medium">
          {new Date(value).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </span>
      );
    }
    if (field.type === "badge") {
      return (
        <Chip
          variant="gradient"
          color={(field.color || "blue") as any}
          value={value}
          className="py-1 px-3 text-sm font-semibold w-fit shadow-sm"
        />
      );
    }
    return (
      <span className="text-blue-gray-700 font-medium text-base">
        {value || <span className="text-blue-gray-400 italic">Not provided</span>}
      </span>
    );
  };

  return (
    <Dialog open={open} handler={onClose} size="lg" className="!max-w-3xl">
      <DialogHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-t-lg">
        <div className="flex items-center justify-between w-full">
          <Typography variant="h5" className="font-bold text-white">
            {title}
          </Typography>
          <Button
            variant="text"
            color="white"
            onClick={onClose}
            className="rounded-full hover:bg-white/20 p-2"
          >
            <XMarkIcon className="h-5 w-5" />
          </Button>
        </div>
      </DialogHeader>
      <DialogBody className="pt-6 px-6 bg-blue-gray-50/30">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields.map((field, index) => (
            <div 
              key={field.key} 
              className={field.fullWidth ? "md:col-span-2" : ""}
            >
              <div className="bg-white rounded-lg p-4 border border-blue-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="mb-2 font-bold uppercase text-xs tracking-wider"
                >
                  {field.label}
                </Typography>
                <div className="flex items-center gap-2 min-h-[2rem]">
                  {renderValue(field, data[field.key])}
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogBody>
      <DialogFooter className="bg-white border-t border-blue-gray-200 px-6 py-4">
        <Button 
          variant="text" 
          color="blue-gray" 
          onClick={onClose} 
          className="mr-2 px-6 py-2.5 font-semibold hover:bg-blue-gray-50"
        >
          Close
        </Button>
        <Button 
          variant="gradient" 
          color="blue" 
          onClick={onClose}
          className="px-8 py-2.5 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
        >
          <CheckCircleIcon className="h-5 w-5" />
          OK
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

export default ViewModal;

