import React, { useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Card,
} from "@material-tailwind/react";
import {
  XMarkIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  IdentificationIcon,
  TagIcon,
} from "@heroicons/react/24/outline";

// --- Types & Interfaces ---
export interface ViewField {
  key: string;
  label: string;
  type?: "text" | "status" | "avatar" | "currency" | "date" | "datetime" | "badge" | "email" | "phone" | "longtext";
  color?: string; // For badges/chips
  fullWidth?: boolean; // Forces field to span full row
  icon?: React.ElementType; // Optional icon for the label
  render?: (value: any, row: Record<string, any>) => React.ReactNode;
}

export interface ViewModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string; // e.g. "ID: #12345"
  data: Record<string, any> | null;
  fields: ViewField[];
  actionButton?: React.ReactNode;
}

// --- Helper: Status Badge Component (Inline) ---
const StatusBadge = ({ status }: { status: string }) => {
  const s = status?.toLowerCase() || "";
  let color = "blue-gray";
  if (["active", "available", "completed", "paid"].includes(s)) color = "green";
  if (["inactive", "maintenance", "cancelled", "rejected"].includes(s)) color = "red";
  if (["pending", "processing", "occupied"].includes(s)) color = "orange";

  return (
    <Chip
      size="sm"
      variant="ghost"
      color={color as any}
      value={status}
      className="rounded-full px-3 py-1 font-bold uppercase tracking-wider text-[10px]"
    />
  );
};

// --- Main Component ---
export function ViewModal({
  open,
  onClose,
  title,
  subtitle,
  data,
  fields,
  actionButton,
}: ViewModalProps): JSX.Element | null {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!data) return null;

  // Separate Avatar/Header fields from Data fields
  const avatarField = fields.find((f) => f.type === "avatar");
  const dataFields = fields.filter((f) => f.type !== "avatar");

  // Copy Logic
  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Determine Icon based on field type if not provided
  const getFieldIcon = (field: ViewField) => {
    if (field.icon) return field.icon;
    switch (field.type) {
      case "email": return EnvelopeIcon;
      case "phone": return PhoneIcon;
      case "date": return CalendarDaysIcon;
      case "datetime": return CalendarDaysIcon;
      case "currency": return CurrencyDollarIcon;
      case "badge": return TagIcon;
      case "status": return UserCircleIcon;
      default: return IdentificationIcon;
    }
  };

  const renderValue = (field: ViewField, value: any) => {
    if (field.render) return field.render(value, data);
    if (value === null || value === undefined || value === "")
      return <span className="text-gray-400 italic text-sm">N/A</span>;

    switch (field.type) {
      case "status":
        return <StatusBadge status={value} />;
      case "badge":
        return (
          <Chip
            variant="gradient"
            size="sm"
            value={value}
            color={(field.color as any) || "blue"}
            className="rounded-md px-2 font-medium capitalize"
          />
        );
      case "currency":
        return (
          <Typography variant="h6" className="text-blue-gray-900 font-bold">
            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value))}
          </Typography>
        );
      case "date":
        return (
          <Typography className="text-sm font-medium text-blue-gray-800">
            {new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </Typography>
        );
      case "datetime":
        return (
          <Typography className="text-sm font-medium text-blue-gray-800">
            {new Date(value).toLocaleString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Typography>
        );
      case "email":
        return <a href={`mailto:${value}`} className="text-blue-600 hover:underline text-sm font-medium">{value}</a>;
      case "phone":
        return <a href={`tel:${value}`} className="text-blue-600 hover:underline text-sm font-medium">{value}</a>;
      case "longtext":
        return <Typography className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{value}</Typography>;
      default:
        return <Typography className="text-sm font-semibold text-blue-gray-900">{String(value)}</Typography>;
    }
  };

  return (
    <Dialog
      open={open}
      handler={onClose}
      size="lg"
      className="bg-transparent shadow-none"
      animate={{ mount: { scale: 1, y: 0 }, unmount: { scale: 0.95, y: -20 } }}
    >
      <Card className="mx-auto w-full max-w-[850px] overflow-hidden rounded-xl shadow-2xl">

        {/* --- 1. PROFESSIONAL HEADER --- */}
        <DialogHeader className="relative bg-white border-b border-gray-100 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            {/* Dynamic Icon based on Title context or generic */}
            <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <IdentificationIcon className="h-6 w-6" />
            </div>
            <div>
              <Typography variant="h5" color="blue-gray" className="font-bold tracking-tight">
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="small" className="text-gray-500 font-medium">
                  {subtitle}
                </Typography>
              )}
            </div>
          </div>
          <IconButton variant="text" color="blue-gray" onClick={onClose} className="rounded-full hover:bg-gray-50">
            <XMarkIcon className="h-5 w-5" />
          </IconButton>
        </DialogHeader>

        <DialogBody className="p-0 bg-gray-50/50 overflow-y-auto max-h-[75vh]">
          <div className="p-6 md:p-8 space-y-8">

            {/* --- 2. HERO SECTION (Only if Avatar exists) --- */}
            {avatarField && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6">
                <Avatar
                  src={avatarField.render ? (avatarField.render(data[avatarField.key], data) as string) : data[avatarField.key] || "/img/placeholder.jpg"}
                  alt="Profile"
                  size="xxl"
                  variant="rounded"
                  className="h-24 w-24 border border-gray-200 shadow-sm"
                />
                <div className="text-center md:text-left flex-1">
                  {/* Finds the first text field to use as the Main Name if specific key logic isn't added */}
                  <Typography variant="h4" color="blue-gray" className="font-bold mb-1">
                    {data[dataFields.find(f => f.key.includes('name'))?.key || dataFields[0].key]}
                  </Typography>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    {/* Render Status badge here if exists */}
                    {dataFields.find(f => f.type === 'status') &&
                      renderValue(dataFields.find(f => f.type === 'status')!, data[dataFields.find(f => f.type === 'status')!.key])
                    }
                  </div>
                </div>
              </div>
            )}

            {/* --- 3. DATA GRID --- */}
            <div>
              <Typography variant="small" className="font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1">
                Details Information
              </Typography>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dataFields.filter(f => f.type !== 'avatar' && !f.key.includes('name')).map((field) => {
                  const value = data[field.key];
                  const Icon = getFieldIcon(field);
                  const isLongText = field.type === "longtext" || field.fullWidth;

                  return (
                    <div
                      key={field.key}
                      className={`
                        bg-white p-4 rounded-xl border border-gray-200/60 shadow-[0_2px_4px_rgba(0,0,0,0.02)]
                        hover:border-blue-200 hover:shadow-md transition-all duration-200 group
                        ${isLongText ? "md:col-span-2" : "md:col-span-1"}
                      `}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-blue-500" />
                          <Typography variant="small" className="font-bold text-gray-500 uppercase text-[11px] tracking-wide">
                            {field.label}
                          </Typography>
                        </div>

                        {/* Copy Button (Only for text/email/phone) */}
                        {value && ["text", "email", "phone", undefined].includes(field.type) && (
                          <Tooltip content={copiedKey === field.key ? "Copied!" : "Copy"}>
                            <button
                              onClick={() => handleCopy(String(value), field.key)}
                              className="text-gray-300 hover:text-blue-500 transition-colors"
                            >
                              {copiedKey === field.key ? (
                                <CheckIcon className="h-4 w-4 text-green-500" />
                              ) : (
                                <DocumentDuplicateIcon className="h-4 w-4" />
                              )}
                            </button>
                          </Tooltip>
                        )}
                      </div>

                      <div className="pl-6 border-l-2 border-transparent group-hover:border-blue-100 transition-colors">
                        {renderValue(field, value)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </DialogBody>

        <DialogFooter className="bg-white border-t border-gray-100 px-6 py-4 flex justify-between items-center">
          <Typography variant="small" className="text-gray-400 font-normal">
            Viewing details for ID: <span className="text-gray-600 font-mono">{data.id || 'N/A'}</span>
          </Typography>
          <div className="flex gap-2">
            <Button variant="gradient" color="blue-gray" onClick={onClose} className="rounded-lg shadow-none hover:shadow-md">
              Close
            </Button>
            {actionButton}
          </div>
        </DialogFooter>
      </Card>
    </Dialog>
  );
}

export default ViewModal;