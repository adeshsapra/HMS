import React from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Input,
  Textarea,
  Select,
  Option,
  Typography,
} from "@material-tailwind/react";
import { XMarkIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import "../styles/forms.css";

export interface FormField {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  rows?: number;
  min?: number;
  max?: number;
  fullWidth?: boolean;
  accept?: string; // For file inputs
  multiple?: boolean; // For file inputs
}

export interface FormModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  formFields: FormField[];
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => void;
  submitLabel?: string;
  loading?: boolean;
}

export function FormModal({
  open,
  onClose,
  title,
  formFields,
  initialData = {},
  onSubmit,
  submitLabel = "Save",
  loading = false,
}: FormModalProps): JSX.Element {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setFormData(initialData);
      setErrors({});
    }
  }, [initialData, open]);

  const handleChange = (name: string, value: any): void => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    formFields.forEach((field) => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }
      if (field.type === "email" && formData[field.name]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData[field.name])) {
          newErrors[field.name] = "Invalid email address";
        }
      }
      if (field.type === "number" && formData[field.name] !== undefined && formData[field.name] !== null && formData[field.name] !== "") {
        const numValue = Number(formData[field.name]);
        if (isNaN(numValue)) {
          newErrors[field.name] = "Must be a valid number";
        } else {
          if (field.min !== undefined && numValue < field.min) {
            newErrors[field.name] = `Minimum value is ${field.min}`;
          }
          if (field.max !== undefined && numValue > field.max) {
            newErrors[field.name] = `Maximum value is ${field.max}`;
          }
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const renderField = (field: FormField): JSX.Element => {
    const fieldValue = formData[field.name] || "";
    const hasError = !!errors[field.name];

    // Simple static label and input - no floating effects
    const inputProps = {
      value: fieldValue,
      error: hasError,
      placeholder: field.placeholder || (field.type === "select" ? `Select ${field.label.toLowerCase()}` : `Enter ${field.label.toLowerCase()}`),
      className: "!border-blue-gray-200 focus:!border-blue-500",
      containerProps: {
        className: "!min-w-0 [&::before]:hidden [&::after]:hidden",
      },
    };

    switch (field.type) {
      case "textarea":
        return (
          <div className="[&::before]:hidden [&::after]:hidden">
            <label className="block text-sm font-normal text-blue-gray-700 mb-2">
              {field.label}
            </label>
            <Textarea
              {...inputProps}
              rows={field.rows || 4}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className={`${inputProps.className} resize-none [&::before]:hidden [&::after]:hidden`}
              label={undefined}
            />
          </div>
        );
      case "select":
        return (
          <div className="[&::before]:hidden [&::after]:hidden">
            <label className="block text-sm font-normal text-blue-gray-700 mb-2">
              {field.label}
            </label>
            <Select
              value={fieldValue}
              onChange={(value) => handleChange(field.name, value)}
              error={hasError}
              className={`${inputProps.className} [&::before]:hidden [&::after]:hidden`}
              containerProps={inputProps.containerProps}
            >
              {field.options?.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </div>
        );
      case "date":
        return (
          <div className="[&::before]:hidden [&::after]:hidden">
            <label className="block text-sm font-normal text-blue-gray-700 mb-2">
              {field.label}
            </label>
            <Input
              {...inputProps}
              type="date"
              onChange={(e) => handleChange(field.name, e.target.value)}
              label={undefined}
              className={`${inputProps.className} [&::before]:hidden [&::after]:hidden`}
              crossOrigin={undefined}
            />
          </div>
        );
      case "time":
        return (
          <div className="[&::before]:hidden [&::after]:hidden">
            <label className="block text-sm font-normal text-blue-gray-700 mb-2">
              {field.label}
            </label>
            <Input
              {...inputProps}
              type="time"
              onChange={(e) => handleChange(field.name, e.target.value)}
              label={undefined}
              className={`${inputProps.className} [&::before]:hidden [&::after]:hidden`}
              crossOrigin={undefined}
            />
          </div>
        );
      case "number":
        return (
          <div className="[&::before]:hidden [&::after]:hidden">
            <label className="block text-sm font-normal text-blue-gray-700 mb-2">
              {field.label}
            </label>
            <Input
              {...inputProps}
              type="number"
              min={field.min}
              max={field.max}
              onChange={(e) => handleChange(field.name, e.target.value)}
              label={undefined}
              className={`${inputProps.className} [&::before]:hidden [&::after]:hidden`}
              crossOrigin={undefined}
            />
          </div>
        );
      case "file":
        return (
          <div className="[&::before]:hidden [&::after]:hidden">
            <label className="block text-sm font-normal text-blue-gray-700 mb-2">
              {field.label}
            </label>
            <Input
              type="file"
              accept={field.accept}
              multiple={field.multiple}
              onChange={(e) => {
                const files = e.target.files;
                if (files && files.length > 0) {
                  handleChange(field.name, field.multiple ? Array.from(files) : files[0]);
                }
              }}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              crossOrigin={undefined}
            />
          </div>
        );
      default:
        return (
          <div className="[&::before]:hidden [&::after]:hidden">
            <label className="block text-sm font-normal text-blue-gray-700 mb-2">
              {field.label}
            </label>
            <Input
              {...inputProps}
              type={field.type || "text"}
              onChange={(e) => handleChange(field.name, e.target.value)}
              label={undefined}
              className={`${inputProps.className} [&::before]:hidden [&::after]:hidden`}
              crossOrigin={undefined}
            />
          </div>
        );
    }
  };

  return (
    <Dialog 
      open={open} 
      handler={onClose} 
      size="lg"
      className="!max-w-4xl"
    >
      <DialogHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-5 px-6 rounded-t-lg shadow-lg">
        <div className="flex items-center justify-between w-full">
          <Typography variant="h5" className="font-bold text-white text-xl">
            {title}
          </Typography>
          <Button
            variant="text"
            color="white"
            onClick={onClose}
            className="rounded-full hover:bg-white/20 p-2 transition-all"
          >
            <XMarkIcon className="h-5 w-5" />
          </Button>
        </div>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <DialogBody className="overflow-y-auto max-h-[65vh] pt-8 px-8 bg-gradient-to-br from-blue-gray-50/50 to-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {formFields.map((field) => (
              <div
                key={field.name}
                className={field.fullWidth ? "md:col-span-2" : ""}
              >
                {renderField(field)}
                {errors[field.name] && (
                  <Typography
                    variant="small"
                    color="red"
                    className="mt-1 text-xs"
                  >
                    {errors[field.name]}
                  </Typography>
                )}
              </div>
            ))}
          </div>
        </DialogBody>
        <DialogFooter className="bg-white border-t-2 border-blue-gray-200 px-8 py-5 flex items-center justify-between shadow-lg">
          <Button
            variant="text"
            color="blue-gray"
            onClick={onClose}
            className="px-8 py-3 font-bold text-sm uppercase tracking-wide hover:bg-blue-gray-50 transition-all"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="gradient"
            color="blue"
            disabled={loading}
            className="px-10 py-3 font-bold text-sm uppercase tracking-wide shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-5 w-5" />
                {submitLabel}
              </>
            )}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

export default FormModal;

