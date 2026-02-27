import React, { useRef, useState, useEffect } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Typography,
} from "@material-tailwind/react";
import { XMarkIcon, CheckCircleIcon, ChevronDownIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export interface FormField {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  error?: string;
  rows?: number;
  min?: number;
  max?: number;
  fullWidth?: boolean;
  accept?: string;
  multiple?: boolean;
  visible?: boolean;
}

export interface FormModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  formFields: FormField[];
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  submitLabel?: string;
  loading?: boolean;
  onValuesChange?: (name: string, value: any, setValues: (values: any) => void) => void;
}

const COMMON_ICONS = [
  // Medical & Clinical
  "bi-heart-pulse", "bi-lungs", "bi-virus", "bi-capsule", "bi-hospital",
  "bi-person-wheelchair", "bi-thermometer-half", "bi-bandaid", "bi-activity",
  "bi-clipboard2-pulse", "bi-file-medical", "bi-heart", "bi-gender-female",
  "bi-gender-male", "bi-droplet", "bi-prescription", "bi-scissors",
  "bi-radioactive", "bi-person-x", "bi-person-check", "bi-heart-fill",
  "bi-lungs-fill", "bi-capsule-pill", "bi-clipboard-pulse", "bi-file-earmark-medical",

  // Departments & Specialties
  "bi-eye", "bi-ear", "bi-brain", "bi-tooth", "bi-eyeglasses",
  "bi-ear-fill", "bi-eye-fill", "bi-journal-medical", "bi-person-standing-dress",
  "bi-person-standing", "bi-yin-yang", "bi-flower1", "bi-flower2", "bi-flower3",

  // Administrative & General
  "bi-people", "bi-person", "bi-person-gear", "bi-gear", "bi-calendar-check",
  "bi-clock", "bi-telephone", "bi-envelope", "bi-geo-alt", "bi-star",
  "bi-check-circle", "bi-exclamation-circle", "bi-info-circle", "bi-award",
  "bi-briefcase", "bi-building", "bi-calculator", "bi-camera", "bi-card-checklist",
  "bi-cash-coin", "bi-credit-card", "bi-file-earmark-text", "bi-graph-up",
  "bi-house", "bi-key", "bi-lock", "bi-megaphone", "bi-mic", "bi-bell",
  "bi-search", "bi-trash", "bi-pencil", "bi-printer", "bi-share",
  "bi-wifi", "bi-battery-charging", "bi-bluetooth", "bi-usb", "bi-hdd",
  "bi-cpu", "bi-display", "bi-phone", "bi-tablet", "bi-laptop",
  "bi-box-seam", "bi-bezier", "bi-x-diamond", "bi-shield-check", "bi-shield-lock"
];

const IconPicker = ({ value, onChange, label, error }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-sm font-medium text-blue-gray-700 mb-2">
        {label}
      </label>
      <div
        className={`w-full px-3 py-2.5 text-sm bg-white border rounded-lg cursor-pointer flex items-center justify-between transition-all ${error ? "border-red-500" : "border-blue-gray-200 hover:border-blue-gray-400"}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          {value ? (
            <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center text-blue-600">
              <i className={`bi ${value} text-lg`}></i>
            </div>
          ) : (
            <span className="text-gray-400">Select Icon</span>
          )}
          <span className="text-blue-gray-700 font-medium">{value || 'No icon selected'}</span>
        </div>
        <div className="flex items-center gap-2">
          {error && <ExclamationCircleIcon className="h-5 w-5 text-red-500" />}
          <ChevronDownIcon className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-blue-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto p-3">
          <div className="grid grid-cols-6 gap-2">
            {COMMON_ICONS.map(icon => (
              <div
                key={icon}
                className={`aspect-square rounded-lg hover:bg-blue-50 cursor-pointer flex justify-center items-center transition-colors ${value === icon ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-500 ring-offset-1' : 'text-gray-600 border border-gray-100'}`}
                onClick={() => { onChange(icon); setIsOpen(false); }}
                title={icon}
              >
                <i className={`bi ${icon} text-xl`}></i>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Custom Select Component
const CustomSelect = ({
  value,
  onChange,
  options,
  placeholder,
  label,
  required,
  error,
}: {
  value: string | number | undefined;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  label: string;
  required?: boolean;
  error?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={selectRef}>
      <label className="block text-sm font-medium text-blue-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2.5 text-sm bg-white border rounded-lg cursor-pointer flex items-center justify-between transition-all ${error
          ? "border-red-500"
          : isOpen
            ? "border-blue-500 ring-1 ring-blue-500"
            : "border-blue-gray-200 hover:border-blue-gray-400"
          }`}
      >
        <span className={selectedOption ? "text-blue-gray-700" : "text-blue-gray-400"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div className="flex items-center gap-2">
          {error && <ExclamationCircleIcon className="h-5 w-5 text-red-500" />}
          <ChevronDownIcon
            className={`h-4 w-4 text-blue-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </div>
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-blue-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`px-3 py-2.5 text-sm cursor-pointer transition-colors ${String(value) === String(option.value)
                ? "bg-blue-50 text-blue-700 font-medium"
                : "text-blue-gray-700 hover:bg-blue-gray-50"
                }`}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const TimePicker = ({ value, onChange, label, required, error }: any) => {
  const [hour, setHour] = useState('09');
  const [minute, setMinute] = useState('00');
  const [period, setPeriod] = useState('AM');

  useEffect(() => {
    if (value && value.includes(':')) {
      const [h, rest] = value.split(':');
      const [m, p] = rest.split(' ');
      setHour(h);
      setMinute(m);
      setPeriod(p || 'AM');
    } else if (!value) {
      onChange('09:00 AM');
    }
  }, [value, onChange]);

  const updateTime = (h: string, m: string, p: string) => {
    onChange(`${h}:${m} ${p}`);
  };

  const hoursList = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutesList = ['00', '15', '30', '45'];
  const periods = ['AM', 'PM'];

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-blue-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className={`bg-[#f8fafc] p-7 rounded-[2rem] border-2 transition-all duration-300 ${error ? 'border-red-100 shadow-[0_0_20px_rgba(239,68,68,0.05)]' : 'border-blue-gray-50 shadow-sm'}`}>
        <div className="flex items-center justify-end mb-8">
          <div className="bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-blue-50/50 flex items-center gap-3">
            <span className="text-2xl font-black text-blue-700 tracking-tight">{hour}</span>
            <span className="text-blue-gray-300 font-black animate-pulse">:</span>
            <span className="text-2xl font-black text-blue-700 tracking-tight">{minute}</span>
            <div className="w-px h-6 bg-blue-gray-100 mx-1" />
            <span className="text-sm font-black text-blue-400 uppercase">{period}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div>
            <span className="block text-[10px] font-black text-blue-gray-300 uppercase tracking-widest mb-4 text-center lg:text-left">Choose Hour</span>
            <div className="grid grid-cols-4 gap-2">
              {hoursList.map(h => (
                <button
                  key={h}
                  type="button"
                  onClick={() => { setHour(h); updateTime(h, minute, period); }}
                  className={`h-11 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center ${hour === h
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20 scale-[1.05]'
                    : 'bg-white text-blue-gray-600 hover:bg-white hover:text-blue-500 hover:shadow-md border border-blue-gray-50/50'}`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="block text-[10px] font-black text-blue-gray-300 uppercase tracking-widest mb-4 text-center lg:text-left">Choose Minute</span>
            <div className="grid grid-cols-2 gap-3 h-full pb-10 lg:pb-0">
              {minutesList.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMinute(m); updateTime(hour, m, period); }}
                  className={`h-11 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center ${minute === m
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20 scale-[1.05]'
                    : 'bg-white text-blue-gray-600 hover:bg-white hover:text-blue-500 hover:shadow-md border border-blue-gray-50/50'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="block text-[10px] font-black text-blue-gray-300 uppercase tracking-widest mb-4 text-center lg:text-left">Select Period</span>
            <div className="flex flex-col gap-3">
              {periods.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => { setPeriod(p); updateTime(hour, minute, p); }}
                  className={`h-11 w-full rounded-xl text-sm font-black transition-all duration-200 flex items-center justify-center tracking-widest ${period === p
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20 scale-[1.05]'
                    : 'bg-white text-blue-gray-600 hover:bg-white hover:text-blue-500 hover:shadow-md border border-blue-gray-50/50'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export function FormModal({
  open,
  onClose,
  title,
  formFields,
  initialData = {},
  onSubmit,
  submitLabel = "Save",
  loading = false,
  onValuesChange,
}: FormModalProps): JSX.Element {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData(initialData);
      setErrors({});
      setGeneralError("");
    }
  }, [open, initialData]);

  const handleChange = (name: string, value: any): void => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (onValuesChange) {
      onValuesChange(name, value, (updatedData: any) => {
        setFormData((prev) => ({ ...prev, ...updatedData }));
      });
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (generalError) {
      setGeneralError("");
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
      if (field.type === "password" && field.required && formData[field.name]) {
        if (formData[field.name].length < 8) {
          newErrors[field.name] = "Password must be at least 8 characters";
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setGeneralError("");

    try {
      await onSubmit(formData);
    } catch (error: any) {
      if (error.validationErrors) {
        const serverErrors: Record<string, string> = {};
        Object.keys(error.validationErrors).forEach((key) => {
          const errorMessages = error.validationErrors[key];
          serverErrors[key] = Array.isArray(errorMessages) ? errorMessages[0] : errorMessages;
        });
        setErrors(serverErrors);
      }
      setGeneralError(error.message || "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBaseClass = "w-full px-3 py-2.5 text-sm text-blue-gray-700 bg-white border border-blue-gray-200 rounded-lg transition-all focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 hover:border-blue-gray-400";
  const inputErrorClass = "!border-red-500 focus:!border-red-500 focus:!ring-red-500";

  const renderField = (field: FormField): JSX.Element => {
    const fieldValue = formData[field.name] || "";
    const hasError = !!(errors[field.name] || field.error);
    const inputClass = `${inputBaseClass} ${hasError ? inputErrorClass : ""}`;

    switch (field.type) {
      case "textarea":
        return (
          <div>
            <label className="block text-sm font-medium text-blue-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
              <textarea
                value={fieldValue}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                rows={field.rows || 4}
                className={`${inputClass} resize-none ${hasError ? "pr-10" : ""}`}
              />
              {hasError && (
                <div className="absolute right-3 top-3 text-red-500">
                  <ExclamationCircleIcon className="h-5 w-5" />
                </div>
              )}
            </div>
          </div>
        );
      case "select":
        return (
          <CustomSelect
            value={fieldValue}
            onChange={(value) => handleChange(field.name, value)}
            options={field.options || []}
            placeholder={field.placeholder || `Select ${field.label}`}
            label={field.label}
            required={field.required}
            error={hasError}
          />
        );
      case "icon-picker":
        return (
          <IconPicker
            value={fieldValue}
            onChange={(value: string) => handleChange(field.name, value)}
            label={field.label}
            error={hasError}
          />
        );
      case "rich-text":
        return (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-blue-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className={`rich-text-editor ${hasError ? 'border-red-500 ring-1 ring-red-500 rounded-lg' : ''}`}>
              <ReactQuill
                theme="snow"
                value={fieldValue}
                onChange={(content) => handleChange(field.name, content)}
                placeholder={field.placeholder || `Write ${field.label.toLowerCase()} here...`}
                className="bg-white"
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                    ['link', 'color'],
                    ['clean']
                  ],
                }}
              />
            </div>
          </div>
        );
      case "file":
        return (
          <div>
            <label className="block text-sm font-medium text-blue-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className={`flex items-center gap-4 p-3 border rounded-lg bg-white ${hasError ? 'border-red-500' : 'border-blue-gray-200'}`}>
              <label className="cursor-pointer bg-blue-50 text-blue-600 border border-blue-100 rounded-md px-4 py-2 hover:bg-blue-100 transition-all flex items-center gap-2 shadow-sm">
                <i className="bi bi-cloud-upload"></i>
                <span className="text-sm font-semibold">Choose File</span>
                <input
                  type="file"
                  className="hidden"
                  accept={field.accept}
                  multiple={field.multiple}
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      handleChange(field.name, field.multiple ? Array.from(files) : files[0]);
                    }
                  }}
                />
              </label>
              <div className="flex-grow overflow-hidden">
                {formData[field.name] instanceof File ? (
                  <div className="flex items-center gap-2 text-blue-gray-700">
                    <i className="bi bi-file-earmark-image text-blue-400"></i>
                    <span className="text-sm truncate font-medium">{formData[field.name].name}</span>
                    <span className="text-xs text-gray-400">({(formData[field.name].size / 1024).toFixed(1)} KB)</span>
                  </div>
                ) : formData[field.name] && typeof formData[field.name] === 'string' ? (
                  <div className="flex items-center gap-2 text-blue-gray-700">
                    <i className="bi bi-check-circle-fill text-green-500"></i>
                    <span className="text-sm truncate">Current file: {formData[field.name].split('/').pop()}</span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-400 italic">No file selected</span>
                )}
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div>
            <label className="block text-sm font-medium text-blue-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
              <input
                type={field.type || "text"}
                value={fieldValue}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                min={field.min}
                max={field.max}
                className={`${inputClass} ${hasError ? "pr-10" : ""}`}
              />
              {hasError && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                  <ExclamationCircleIcon className="h-5 w-5" />
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  const isLoading = loading || isSubmitting;

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
          {generalError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <ExclamationCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <Typography variant="small" className="font-medium text-red-800">
                  {generalError}
                </Typography>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {formFields.map((field) => {
              if (field.visible === false) return null;

              const errorMessage = errors[field.name] || field.error;

              if (field.type === "time") {
                return (
                  <div key={field.name} className="md:col-span-2">
                    <TimePicker
                      value={formData[field.name]}
                      onChange={(val: string) => handleChange(field.name, val)}
                      label={field.label}
                      required={field.required}
                      error={errorMessage}
                    />
                    {errorMessage && (
                      <Typography variant="small" color="red" className="mt-1 text-xs flex items-center gap-1">
                        <ExclamationCircleIcon className="h-3.5 w-3.5" />
                        {errorMessage}
                      </Typography>
                    )}
                  </div>
                );
              }

              return (
                <div key={field.name} className={field.fullWidth || field.type === "textarea" ? "md:col-span-2" : ""}>
                  {renderField(field)}
                  {errorMessage && (
                    <Typography variant="small" color="red" className="mt-1 text-xs flex items-center gap-1">
                      <ExclamationCircleIcon className="h-3.5 w-3.5" />
                      {errorMessage}
                    </Typography>
                  )}
                </div>
              );
            })}
          </div>
        </DialogBody>
        <DialogFooter className="bg-white border-t-2 border-blue-gray-200 px-8 py-5 flex items-center justify-between shadow-lg">
          <Button
            variant="text"
            color="blue-gray"
            onClick={onClose}
            className="px-8 py-3 font-bold text-sm uppercase tracking-wide hover:bg-blue-gray-50 transition-all"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="gradient"
            color="blue"
            disabled={isLoading}
            className="px-10 py-3 font-bold text-sm uppercase tracking-wide shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
