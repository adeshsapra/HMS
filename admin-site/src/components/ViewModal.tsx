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
} from "@material-tailwind/react";
import {
  XMarkIcon,
  CheckCircleIcon,
  DocumentDuplicateIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { StatusBadge } from "./StatusBadge"; // Ensure this path is correct

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

export function ViewModal({
  open,
  onClose,
  title,
  data,
  fields,
}: ViewModalProps): JSX.Element | null {
  const [copied, setCopied] = useState<string | null>(null);

  if (!data) return null;

  // Function to handle copying text to clipboard
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const renderValue = (field: ViewField, value: any): JSX.Element => {
    // 1. Avatar Type (Enhanced Hero Style)
    if (field.type === "avatar") {
      const avatarUrl = field.render ? field.render(value, data) : value;
      return (
        <div className="flex flex-col items-center justify-center w-full py-4">
          <div className="relative group/avatar">
            <Avatar
              src={(avatarUrl as string) || "/img/team-1.jpeg"}
              alt="Avatar"
              size="xxl"
              variant="rounded" // Changed to rounded for a modern app feel
              className="h-28 w-28 object-cover border-4 border-white shadow-xl rounded-2xl"
              onError={(e: any) => {
                e.target.src = "/img/team-1.jpeg";
              }}
            />
          </div>
        </div>
      );
    }

    // 2. Custom Render
    if (field.render) {
      return <div className="w-full">{field.render(value, data)}</div>;
    }

    // 3. Status Type
    if (field.type === "status") {
      // Using your existing StatusBadge or a fallback
      return <StatusBadge status={value} size="lg" />;
    }

    // 4. Currency
    if (field.type === "currency") {
      return (
        <Typography
          variant="h6"
          color="blue-gray"
          className="font-bold tracking-tight"
        >
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(parseFloat(value || "0"))}
        </Typography>
      );
    }

    // 5. Date
    if (field.type === "date" && value) {
      return (
        <div className="flex items-center gap-2 text-blue-gray-800 font-medium">
          {/* Simple Calendar Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-blue-500/70">
            <path d="M12.75 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM7.5 15.75a.75.75 0 100-1.5 .75.75 0 000 1.5zM8.25 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9.75 15.75a.75.75 0 100-1.5 .75.75 0 000 1.5zM10.5 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 15.75a.75.75 0 100-1.5 .75.75 0 000 1.5zM12.75 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM14.25 15.75a.75.75 0 100-1.5 .75.75 0 000 1.5zM15 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 15.75a.75.75 0 100-1.5 .75.75 0 000 1.5zM15 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 13.5a.75.75 0 100-1.5 .75.75 0 000 1.5z" />
            <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" />
          </svg>
          {new Date(value).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      );
    }

    // 6. Badges
    if (field.type === "badge") {
      return (
        <Chip
          variant="ghost"
          size="sm"
          color={(field.color || "blue") as any}
          value={value}
          className="rounded-full px-3 capitalize font-bold tracking-wide"
        />
      );
    }

    // 7. Default Text with Copy functionality
    const stringValue = String(value || "");
    const isEmpty = !value;

    return (
      <div className="flex items-center justify-between w-full group">
        <Typography
          variant="paragraph"
          className={`font-medium text-sm ${isEmpty ? "text-gray-400 italic" : "text-blue-gray-900"
            }`}
        >
          {isEmpty ? "Not provided" : stringValue}
        </Typography>

        {!isEmpty && (
          <Tooltip content={copied === field.key ? "Copied!" : "Copy value"}>
            <IconButton
              variant="text"
              color={copied === field.key ? "green" : "blue-gray"}
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 w-6 h-6 rounded-full"
              onClick={() => handleCopy(stringValue, field.key)}
            >
              {copied === field.key ? (
                <CheckIcon className="h-3.5 w-3.5" />
              ) : (
                <DocumentDuplicateIcon className="h-3.5 w-3.5" />
              )}
            </IconButton>
          </Tooltip>
        )}
      </div>
    );
  };

  return (
    <Dialog
      open={open}
      handler={onClose}
      size="lg"
      className="!max-w-3xl bg-white shadow-2xl rounded-xl overflow-hidden"
      animate={{
        mount: { scale: 1, y: 0 },
        unmount: { scale: 0.9, y: -100 },
      }}
    >
      {/* --- OLD HEADER DESIGN (RESTORED) --- */}
      <DialogHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-5 px-6">
        <div className="flex items-center justify-between w-full">
          <Typography variant="h5" className="font-bold text-white tracking-wide">
            {title}
          </Typography>
          <IconButton
            variant="text"
            color="white"
            onClick={onClose}
            className="rounded-full hover:bg-white/20 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </IconButton>
        </div>
      </DialogHeader>
      {/* ------------------------------------ */}

      <DialogBody className="p-8 bg-white overflow-y-auto max-h-[70vh] custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields.map((field) => {
            const isAvatar = field.type === "avatar";
            const colSpan = field.fullWidth || isAvatar ? "md:col-span-2" : "";

            return (
              <div
                key={field.key}
                className={`
                  relative transition-all duration-300 rounded-lg p-3
                  ${isAvatar
                    ? "bg-transparent flex justify-center mb-2"
                    : "bg-gray-50 hover:bg-blue-50/50 border border-transparent hover:border-blue-100/50"
                  }
                  ${colSpan}
                `}
              >
                {!isAvatar && (
                  <Typography
                    variant="small"
                    className="font-bold text-blue-gray-400 uppercase tracking-widest text-[10px] mb-2"
                  >
                    {field.label}
                  </Typography>
                )}

                <div className={isAvatar ? "w-full flex justify-center" : "pl-1"}>
                  {renderValue(field, data[field.key])}
                </div>
              </div>
            );
          })}
        </div>
      </DialogBody>

      <DialogFooter className="bg-white border-t border-blue-gray-50 px-6 py-4 flex justify-end gap-2">
        <Button
          variant="text"
          color="blue-gray"
          onClick={onClose}
          className="font-semibold text-gray-600 hover:bg-gray-100"
        >
          Close
        </Button>
        <Button
          variant="gradient"
          color="blue"
          onClick={onClose}
          className="px-6 shadow-md hover:shadow-lg flex items-center gap-2"
        >
          <CheckCircleIcon className="h-4 w-4" />
          Done
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

export default ViewModal;