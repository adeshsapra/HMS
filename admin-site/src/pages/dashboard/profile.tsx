import React, { useState } from "react";
import {
  Card,
  CardBody,
  Avatar,
  Typography,
  Button,
  Input,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Switch,
  Chip,
  Checkbox,
} from "@material-tailwind/react";
import {
  PencilIcon,
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  ShieldCheckIcon,
  CheckIcon,
  XMarkIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  IdentificationIcon,
  MapPinIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  CameraIcon,
  HeartIcon,
  CalendarDaysIcon,
  MapIcon,
  InformationCircleIcon,
  ClockIcon,
  UserIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/solid";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import apiService from "@/services/api";

// Internal standard components for better UI consistency
function InputGroup({ label, value, onChange, type = "text", readOnly = false, icon, placeholder }: any) {
  return (
    <div className="space-y-1">
      <Typography variant="small" color="blue-gray" className="font-bold text-[10px] opacity-60 ml-1 uppercase tracking-widest">{label}</Typography>
      <Input
        size="md"
        type={type}
        value={value}
        placeholder={placeholder}
        readOnly={readOnly}
        onChange={(e) => onChange && onChange(e.target.value)}
        className={`!border-blue-gray-200 focus:!border-blue-600 rounded-xl bg-white h-10 font-bold text-blue-gray-800 transition-all text-xs ${readOnly ? 'bg-blue-gray-50/20' : ''}`}
        labelProps={{ className: "hidden" }}
        icon={icon}
        crossOrigin={undefined}
      />
    </div>
  );
}

function MiniValueCard({ icon, label, value, color }: any) {
  const colors: any = {
    blue: "text-blue-600 bg-blue-50/50 border-blue-100/50 shadow-blue-900/5",
    emerald: "text-emerald-600 bg-emerald-50/50 border-emerald-100/50 shadow-emerald-900/5",
    rose: "text-rose-600 bg-rose-50/50 border-rose-100/50 shadow-rose-900/5",
    indigo: "text-indigo-600 bg-indigo-50/50 border-indigo-100/50 shadow-indigo-900/5",
  };
  return (
    <div className={`p-5 rounded-[2rem] border ${colors[color]} flex flex-row items-center gap-5 group transition-all duration-500 hover:shadow-2xl hover:bg-white hover:-translate-y-1 relative overflow-hidden h-24`}>
      <div className={`absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-current to-transparent opacity-[0.03] pointer-events-none translate-x-8 group-hover:translate-x-0 transition-transform duration-700`} />
      <div className="p-3.5 rounded-2xl bg-white shadow-lg transform transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 shrink-0 border border-inherit">
        {icon}
      </div>
      <div className="flex flex-col min-w-0 relative z-10">
        <Typography variant="small" className="opacity-40 text-[9px] uppercase font-black tracking-[0.1em] mb-1">{label}</Typography>
        <Typography variant="small" className="font-black text-blue-gray-900 truncate leading-none text-xs lg:text-sm">{value || "---"}</Typography>
      </div>
    </div>
  );
}

function CompactStat({ label, value }: any) {
  return (
    <div>
      <Typography variant="small" className="font-bold uppercase tracking-widest text-[8px] opacity-30 mb-0.5">{label}</Typography>
      <Typography variant="small" className="font-bold text-blue-gray-800 truncate">{value || "NOT SET"}</Typography>
    </div>
  );
}

function DialogInputField({ label, value, show, toggle, onChange }: any) {
  return (
    <div className="space-y-1.5">
      <Typography variant="small" color="blue-gray" className="font-bold text-[10px] opacity-60 ml-1 uppercase">{label}</Typography>
      <Input
        size="md"
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="!border-blue-gray-200 focus:!border-blue-600 h-12 rounded-xl font-bold"
        labelProps={{ className: "hidden" }}
        icon={<button type="button" onClick={toggle}>{show ? <EyeSlashIcon className="h-5 w-5 text-gray-400" /> : <EyeIcon className="h-5 w-5 text-gray-400" />}</button>}
        crossOrigin={undefined}
      />
    </div>
  );
}

export function Profile(): JSX.Element {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openPasswordModal, setOpenPasswordModal] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const isDoctor = !!user?.doctor;
  const isStaff = !!user?.staff;
  const isPatient = !!user?.patient;
  const isMedicalStaff = isDoctor || isStaff;
  const isSuperAdmin = !!user && !isDoctor && !isStaff && !isPatient;
  const roleName = user?.role?.name?.toUpperCase() || "USER";

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date);
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return "--:--";
    const parts = timeString.split(':');
    if (parts.length >= 2) {
      const hours = parseInt(parts[0]);
      const minutes = parts[1];
      const ampm = hours >= 12 ? 'PM' : 'AM';
      let hours12 = hours % 12 || 12;
      return `${hours12}:${minutes} ${ampm}`;
    }
    return timeString;
  };

  const getInitialFormData = () => {
    const roleData = user?.doctor || user?.staff || user?.patient || {};
    return {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      first_name: roleData.first_name || "",
      last_name: roleData.last_name || "",
      gender: roleData.gender || "",
      date_of_birth: roleData.date_of_birth || roleData.dob || "",
      address: roleData.address || "",
      city: roleData.city || "",
      state: roleData.state || "",
      country: roleData.country || "",
      postal_code: roleData.postal_code || roleData.pincode || "",
      bio: roleData.bio || "",
      specialization: roleData.specialization || "",
      qualification: roleData.qualification || "",
      experience_years: roleData.experience_years || "",
      designation: roleData.designation || "",
      age: roleData.age || "",
      blood_group: roleData.blood_group || "",
      emergency_contact_name: roleData.emergency_contact_name || "",
      emergency_contact_phone: roleData.emergency_contact_phone || roleData.emergency_contact || "",
      emergency_contact_relation: roleData.emergency_contact_relation || "",
      staff_type: roleData.staff_type || "",
      reporting_manager: roleData.reporting_manager || "",
      work_location: roleData.work_location || "",
      marital_status: roleData.marital_status || "",
      employment_status: roleData.employment_status || "active",
      staff_id: roleData.staff_id || "",
      probation_end_date: roleData.probation_end_date ? new Date(roleData.probation_end_date).toISOString().split('T')[0] : "",
      contract_end_date: roleData.contract_end_date ? new Date(roleData.contract_end_date).toISOString().split('T')[0] : "",
      languages: Array.isArray(roleData.languages) ? roleData.languages.join(", ") : (roleData.languages || ""),
      license_number: roleData.license_number || "",
      consultation_fee: roleData.consultation_fee || "",
      employment_type: roleData.employment_type || "",
      joining_date: roleData.joining_date ? new Date(roleData.joining_date).toISOString().split('T')[0] : "",
      employee_id: roleData.employee_id || "",
      badge_number: roleData.badge_number || "",
      shift: roleData.shift || "",
      is_available: roleData.is_available ?? true,
      working_days: roleData.working_days || [],
      working_hours_start: roleData.working_hours_start || roleData.work_hours_start || "",
      working_hours_end: roleData.working_hours_end || roleData.work_hours_end || "",
    };
  };

  const [formData, setFormData] = useState(getInitialFormData());
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");

  const handleEdit = () => {
    setIsEditing(true);
    setFormData(getInitialFormData());
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(getInitialFormData());
    setProfileImage(null);
    setImagePreview(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          // Optimization: Only send relevant data for SuperAdmin
          if (isSuperAdmin && !['name', 'email', 'phone'].includes(key)) {
            return;
          }

          if (key === 'languages' && typeof value === 'string') {
            const langArray = value.split(',').map(l => l.trim()).filter(l => l);
            langArray.forEach((lang, index) => {
              submitData.append(`languages[${index}]`, lang);
            });
          } else if (key === 'working_days' && Array.isArray(value)) {
            value.forEach((day, index) => {
              submitData.append(`working_days[${index}]`, day);
            });
          } else if (key === 'is_available') {
            // Convert boolean to 1/0 for Laravel compatibility
            submitData.append(key, value ? '1' : '0');
          } else if (isStaff && key === 'working_hours_start') {
            submitData.append('work_hours_start', value as any);
          } else if (isStaff && key === 'working_hours_end') {
            submitData.append('work_hours_end', value as any);
          } else {
            submitData.append(key, value as any);
          }
        }
      });

      if (profileImage) {
        const imageField = user?.doctor || user?.staff ? 'profile_picture' : 'profile_image';
        submitData.append(imageField, profileImage);
      }

      await apiService.updateProfile(submitData);
      await refreshUser();
      setIsEditing(false);
      setProfileImage(null);
      setImagePreview(null);
      showToast("Profile updated successfully!", "success");
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      showToast(error.message || "Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const getProfileImageUrl = () => {
    if (imagePreview) return imagePreview;
    const profileUrl = user?.doctor?.profile_picture_url ||
      user?.staff?.profile_picture_url ||
      user?.patient?.profile_image_url;
    if (profileUrl) return profileUrl;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=random&size=128`;
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError("All fields are required");
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    try {
      setLoading(true);
      await apiService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
        passwordData.confirmPassword
      );
      setOpenPasswordModal(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      showToast("Password changed successfully!", "success");
    } catch (error: any) {
      setPasswordError(error.message || "Failed to change password");
      showToast(error.message || "Failed to change password", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleWorkingDay = (day: string) => {
    const currentDays = Array.isArray(formData.working_days) ? formData.working_days : [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    handleChange("working_days", newDays);
  };

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <div className="mt-6 px-4 lg:px-12 w-full max-w-[1600px] mx-auto relative">
      {/* Header Section */}
      <div className="mb-6 animate-fade-in flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Typography variant="h4" color="blue-gray" className="mb-0.5 font-bold tracking-tight">
            Profile Settings
          </Typography>
          <Typography variant="small" color="gray" className="font-normal opacity-60">
            {isSuperAdmin
              ? "Manage your administrative account details and security settings."
              : "Manage your professional profile, contact information, and working schedule."}
          </Typography>
        </div>
        {!isEditing ? (
          <Button
            variant="gradient"
            color="blue"
            size="sm"
            className="rounded-xl px-6 flex items-center gap-2 shadow-blue-100 shadow-lg active:scale-95 transition-all h-10 text-[10px] font-black tracking-widest uppercase"
            onClick={handleEdit}
          >
            <PencilIcon className="h-3.5 w-3.5" /> EDIT PROFILE
          </Button>
        ) : (
          <Button
            variant="text"
            color="red"
            size="sm"
            className="rounded-xl px-6 flex items-center gap-2 font-bold h-10 text-[10px] tracking-widest uppercase"
            onClick={handleCancel}
          >
            <XMarkIcon className="h-4 w-4" /> CANCEL
          </Button>
        )}
      </div>

      <div className="space-y-4 md:space-y-5">
        {/* Top Profile Card - Hero Header */}
        <Card className="border border-blue-gray-100 shadow-lg overflow-hidden rounded-3xl group">
          <CardBody className="p-0">
            <div className="relative h-32 md:h-36 bg-gradient-to-r from-blue-700 via-blue-500 to-indigo-600 transition-all duration-500 group-hover:h-40">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            <div className="px-8 pb-6">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-10 relative z-10">
                <div className="relative group/avatar">
                  <Avatar
                    src={getProfileImageUrl()}
                    alt={user?.name || "User"}
                    size="xl"
                    className="relative border-4 border-white shadow-xl bg-white object-cover h-28 w-28 md:h-30 md:w-30 transform transition-transform group-hover/avatar:scale-105"
                  />
                  {isEditing && (
                    <label className="absolute bottom-1 right-1 p-2 bg-blue-600 rounded-full cursor-pointer shadow-lg hover:bg-blue-700 transition-all border-2 border-white flex items-center justify-center">
                      <CameraIcon className="h-3 w-3 text-white" />
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>
                  )}
                </div>

                <div className="flex-1 text-center md:text-left mb-1">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                    <Typography variant="h4" color="blue-gray" className="font-black tracking-tight text-2xl md:text-3xl">
                      {user?.name || "Practitioner Name"}
                    </Typography>
                    <Chip size="sm" variant="ghost" color="blue" value={user?.role?.name || "NO ROLE"} className="rounded-full px-3 py-0.5 h-fit text-[9px] font-bold" />
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-2 opacity-50">
                    <IdentificationIcon className="h-3.5 w-3.5" />
                    <Typography variant="small" className="font-bold tracking-widest text-[9px]">
                      ID: #{user?.id?.toString().padStart(4, '0')}
                    </Typography>
                  </div>
                </div>

                <div className="hidden lg:flex items-center gap-5 mb-2">
                  <div className="text-right">
                    <Typography variant="small" className="font-bold text-blue-gray-200 uppercase tracking-widest text-[7px]">Department</Typography>
                    <Typography variant="small" className="font-black text-blue-gray-800 uppercase tracking-tight text-[11px]">{user?.doctor?.department?.name || user?.staff?.department?.name || (isSuperAdmin ? 'ADMIN' : 'N/A')}</Typography>
                  </div>
                  <div className="h-6 w-px bg-blue-gray-100" />
                  <div className="text-left">
                    <Typography variant="small" className="font-bold text-blue-gray-200 uppercase tracking-widest text-[7px]">Experience</Typography>
                    <Typography variant="small" className="font-black text-blue-gray-800 uppercase tracking-tight text-[11px]">{isSuperAdmin ? 'INTERNAL' : ((user?.doctor || user?.staff)?.experience_years ? `${(user?.doctor || user?.staff)?.experience_years} Years` : 'N/A')}</Typography>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* BLOCK 1: ACCOUNT FOUNDATION (Common to all) */}
        <Card className="border border-blue-gray-100 shadow-sm rounded-3xl overflow-hidden">
          <div className="px-6 py-4 bg-blue-gray-50/30 border-b border-blue-gray-50 flex items-center justify-between">
            <Typography variant="small" className="font-black text-blue-gray-800 tracking-widest uppercase flex items-center gap-2">
              <UserCircleIcon className="h-4 w-4 text-blue-600" /> Personal Information
            </Typography>
            <Chip size="sm" variant="ghost" color="blue" value="ACCOUNT DETAILS" className="rounded-lg text-[7px]" />
          </div>
          <CardBody className="p-6">
            {isEditing ? (
              <div className="space-y-8">
                {isSuperAdmin ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                      <div className="p-6 bg-blue-gray-50/30 rounded-3xl border border-blue-gray-100/50 space-y-6">
                        <Typography variant="small" className="font-black text-blue-gray-800 tracking-widest uppercase text-[10px] opacity-40 mb-2">Core Identity</Typography>
                        <InputGroup label="Display Name" value={formData.name} onChange={(v: string) => handleChange("name", v)} icon={<UserCircleIcon className="h-4 w-4" />} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InputGroup label="Email Address" value={formData.email} readOnly icon={<EnvelopeIcon className="h-4 w-4" />} />
                          <InputGroup label="Phone Number" value={formData.phone} onChange={(v: string) => handleChange("phone", v)} icon={<PhoneIcon className="h-4 w-4" />} />
                        </div>
                      </div>
                      <div className="p-6 bg-gradient-to-br from-gray-900 to-blue-gray-900 rounded-3xl shadow-xl relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 h-24 w-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-700" />
                        <div className="relative z-10 flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/30">
                            <ShieldCheckIcon className="h-6 w-6" />
                          </div>
                          <div>
                            <Typography variant="small" className="font-black text-white uppercase tracking-[0.2em] text-[10px]">Root Administrative Token</Typography>
                            <Typography variant="small" className="text-blue-gray-300 text-[10px] font-medium">Your account possesses global read/write authority across all Hospital Management modules.</Typography>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="lg:col-span-1 p-6 bg-blue-50/50 rounded-3xl border border-blue-100 flex flex-col justify-between">
                      <div className="space-y-4">
                        <Typography variant="small" className="font-black text-blue-800 tracking-widest uppercase text-[10px]">Scope Matrix</Typography>
                        <div className="space-y-2">
                          {['System Configuration', 'User Orchestration', 'Database Integrity', 'Security Protocols'].map(item => (
                            <div key={item} className="flex items-center gap-2 py-2 border-b border-blue-100/50 last:border-0">
                              <CheckIcon className="h-3 w-3 text-blue-500" />
                              <Typography variant="small" className="font-bold text-blue-900/60 text-[9px] uppercase">{item}</Typography>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="mt-8">
                        <Typography variant="small" className="font-bold text-blue-900/30 text-[8px] uppercase leading-tight italic">Note: Core system credentials are immutable outside of verified security sessions.</Typography>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <InputGroup label="First Name" value={formData.first_name} onChange={(v: string) => handleChange("first_name", v)} />
                      <InputGroup label="Last Name" value={formData.last_name} onChange={(v: string) => handleChange("last_name", v)} />
                      <InputGroup label="Email Address" value={formData.email} readOnly icon={<EnvelopeIcon className="h-4 w-4" />} />
                      <InputGroup label="Phone Number" value={formData.phone} onChange={(v: string) => handleChange("phone", v)} icon={<PhoneIcon className="h-4 w-4" />} />
                    </div>
                    <div className="pt-4 border-t border-blue-gray-50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <Typography variant="small" color="blue-gray" className="font-bold text-[10px] opacity-60 ml-1 uppercase tracking-widest">Gender</Typography>
                        <select value={formData.gender} onChange={(e) => handleChange("gender", e.target.value)} className="w-full h-10 px-4 rounded-xl border border-blue-gray-200 bg-white font-bold text-xs outline-none focus:border-blue-500 transition-all">
                          <option value="">SELECT GENDER</option>
                          <option value="male">MALE</option>
                          <option value="female">FEMALE</option>
                          <option value="other">OTHER</option>
                        </select>
                      </div>

                      {/* Marital Status: ONLY FOR STAFF/PATIENT */}
                      {(isStaff || isPatient) && (
                        <div className="space-y-1">
                          <Typography variant="small" color="blue-gray" className="font-bold text-[10px] opacity-60 ml-1 uppercase tracking-widest">Marital Status</Typography>
                          <select value={formData.marital_status} onChange={(e) => handleChange("marital_status", e.target.value)} className="w-full h-10 px-4 rounded-xl border border-blue-gray-200 bg-white font-bold text-xs outline-none focus:border-blue-500 transition-all">
                            <option value="">SELECT STATUS</option>
                            <option value="single">SINGLE</option>
                            <option value="married">MARRIED</option>
                            <option value="divorced">DIVORCED</option>
                            <option value="widowed">WIDOWED</option>
                          </select>
                        </div>
                      )}

                      {/* Blood Group: ONLY FOR PATIENT */}
                      {isPatient && (
                        <div className="space-y-1">
                          <Typography variant="small" color="blue-gray" className="font-bold text-[10px] opacity-60 ml-1 uppercase tracking-widest">Blood Group</Typography>
                          <select value={formData.blood_group} onChange={(e) => handleChange("blood_group", e.target.value)} className="w-full h-10 px-4 rounded-xl border border-blue-gray-200 bg-white font-bold text-xs outline-none focus:border-blue-500 transition-all">
                            <option value="">SELECT GROUP</option>
                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => <option key={g} value={g}>{g}</option>)}
                          </select>
                        </div>
                      )}

                      <InputGroup label="Date of Birth" type="date" value={formData.date_of_birth} onChange={(v: string) => handleChange("date_of_birth", v)} />

                      {/* Emergency Contact: ONLY FOR STAFF (matched to staff DB) */}
                      {isStaff && (
                        <div className="md:col-span-4 p-5 bg-blue-gray-50/20 rounded-3xl border border-blue-gray-100/50 mt-2">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="h-2 w-2 rounded-full bg-orange-400" />
                            <Typography variant="small" className="font-black text-blue-gray-800 tracking-widest uppercase text-[9px] opacity-60">
                              Emergency Protocols & Next of Kin
                            </Typography>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <InputGroup label="Next of Kin Name" value={formData.emergency_contact_name} onChange={(v: string) => handleChange("emergency_contact_name", v)} icon={<UserIcon className="h-4 w-4" />} />
                            <InputGroup label="Relation" value={formData.emergency_contact_relation} onChange={(v: string) => handleChange("emergency_contact_relation", v)} />
                            <InputGroup label="Emergency Contact No" value={formData.emergency_contact_phone} onChange={(v: string) => handleChange("emergency_contact_phone", v)} icon={<PhoneIcon className="h-4 w-4" />} />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="pt-6 border-t border-blue-gray-50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="lg:col-span-2">
                        <InputGroup label="Address" value={formData.address} onChange={(v: string) => handleChange("address", v)} icon={<MapPinIcon className="h-4 w-4" />} />
                      </div>
                      <InputGroup label="City" value={formData.city} onChange={(v: string) => handleChange("city", v)} />
                      <InputGroup label="State" value={formData.state} onChange={(v: string) => handleChange("state", v)} />
                      {!isPatient && <InputGroup label="Country" value={formData.country} onChange={(v: string) => handleChange("country", v)} />}
                      <InputGroup label={isPatient ? "Pincode" : "Postal Code"} value={formData.postal_code} onChange={(v: string) => handleChange("postal_code", v)} />
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className={`grid grid-cols-1 md:grid-cols-2 ${isPatient ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6`}>
                  <MiniValueCard icon={<EnvelopeIcon className="h-4 w-4" />} label="Email Address" value={user?.email} color="blue" />
                  <MiniValueCard icon={<PhoneIcon className="h-4 w-4" />} label="Phone Number" value={user?.phone} color="emerald" />
                  {isPatient && <MiniValueCard icon={<HeartIcon className="h-4 w-4" />} label="Blood Group" value={user?.patient?.blood_group || "N/A"} color="rose" />}
                  {!isSuperAdmin && <MiniValueCard icon={<CalendarDaysIcon className="h-4 w-4" />} label="Date of Birth" value={formatDate((user?.doctor || user?.staff || user?.patient)?.date_of_birth || (user?.patient)?.dob)} color="indigo" />}
                  {isSuperAdmin && <MiniValueCard icon={<ShieldCheckIcon className="h-4 w-4" />} label="Authority" value="FULL SYSTEM ACCESS" color="indigo" />}
                </div>

                {!isSuperAdmin && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Primary Address Column */}
                    <div className="lg:col-span-12 p-1 bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent rounded-[2rem]">
                      <div className="bg-white/80 backdrop-blur-md p-6 rounded-[1.8rem] border border-white shadow-sm flex flex-col md:flex-row md:items-center gap-8">
                        {/* Section 1: Street Address */}
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner shrink-0">
                            <MapPinIcon className="h-6 w-6" />
                          </div>
                          <div className="min-w-0">
                            <Typography variant="small" className="font-bold text-blue-gray-400 uppercase tracking-widest text-[8px] mb-1">Residential Address</Typography>
                            <Typography variant="small" className="font-black text-blue-gray-800 leading-tight text-xs lg:text-sm">
                              {(user?.doctor || user?.staff || user?.patient)?.address || "ADDRESS NOT PROVIDED"}
                            </Typography>
                          </div>
                        </div>

                        {/* Divider for Desktop */}
                        <div className="hidden md:block w-px h-12 bg-blue-gray-50" />

                        {/* Section 2: Regional Details */}
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner shrink-0">
                            <GlobeAltIcon className="h-6 w-6" />
                          </div>
                          <div className="min-w-0">
                            <Typography variant="small" className="font-bold text-blue-gray-400 uppercase tracking-widest text-[8px] mb-1">Region & Locality</Typography>
                            <Typography variant="small" className="font-black text-blue-gray-800 uppercase text-[10px] truncate">
                              {(user?.doctor || user?.staff || user?.patient)?.city || '---'}, {(user?.doctor || user?.staff || user?.patient)?.state || '---'}
                            </Typography>
                            <Typography variant="small" className="font-bold text-indigo-600 uppercase text-[9px] tracking-tighter opacity-70 mt-0.5">
                              {(user?.doctor || user?.staff || user?.patient)?.country || '---'} | PIN: {(user?.doctor || user?.staff || user?.patient)?.postal_code || '---'}
                            </Typography>
                          </div>
                        </div>

                        {/* Divider for Desktop */}
                        <div className="hidden md:block w-px h-12 bg-blue-gray-50" />

                        {/* Section 3: Identity & Social */}
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 shadow-inner shrink-0">
                            <UserIcon className="h-6 w-6" />
                          </div>
                          <div className="min-w-0">
                            <Typography variant="small" className="font-bold text-blue-gray-400 uppercase tracking-widest text-[8px] mb-1">Identity & Social</Typography>
                            <div className="flex flex-col">
                              <Typography variant="small" className="font-black text-blue-gray-800 uppercase text-[10px]">
                                GENDER: {(user?.doctor || user?.staff || user?.patient)?.gender || 'UNSET'}
                              </Typography>
                              {(isStaff || isPatient) && (
                                <Typography variant="small" className="font-bold text-rose-600 uppercase text-[9px] tracking-tighter opacity-70 mt-0.5">
                                  STATUS: {user?.staff?.marital_status || user?.patient?.marital_status || 'NOT SET'}
                                </Typography>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Emergency Contact Summary for View Mode (STAFF ONLY) */}
                {isStaff && user?.staff?.emergency_contact_phone && (
                  <div className="p-4 bg-orange-50/30 rounded-2xl border border-orange-100 flex items-center gap-4">
                    <div className="p-2.5 rounded-xl bg-white shadow-sm text-orange-600"><PhoneIcon className="h-4 w-4" /></div>
                    <div className="flex flex-col">
                      <Typography variant="small" className="font-bold text-orange-400 uppercase tracking-widest text-[8px]">Emergency Next of Kin</Typography>
                      <div className="flex items-center gap-2">
                        <Typography variant="small" className="font-black text-orange-900 text-[10px] uppercase">
                          {user?.staff?.emergency_contact_name || 'Relative'}
                          <span className="font-bold opacity-40 ml-1">({user?.staff?.emergency_contact_relation || 'No Relation'})</span>
                        </Typography>
                        <div className="h-3 w-px bg-orange-200" />
                        <Typography variant="small" className="font-bold text-orange-700 text-[10px]">{user?.staff?.emergency_contact_phone}</Typography>
                      </div>
                    </div>
                  </div>
                )}

                {isSuperAdmin && (
                  <div className="p-6 bg-blue-50/30 rounded-2xl border border-blue-100/50 flex items-center gap-6">
                    <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-sm text-blue-600">
                      <ShieldCheckIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <Typography variant="small" className="font-black text-blue-900 uppercase tracking-[0.2em] text-[10px] mb-1">Administrative Privileges</Typography>
                      <Typography variant="small" className="font-bold text-blue-700 leading-none opacity-70">You are operating with root level credentials. Profile data is limited to core identity parameters.</Typography>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardBody>
        </Card>

        {/* BLOCK 2: CLINICAL / PROFESSIONAL CREDENTIALS (Role Specific) */}
        {(isMedicalStaff || isStaff) && (
          <Card className="border border-blue-gray-100 shadow-sm rounded-3xl overflow-hidden">
            <div className="px-6 py-4 bg-blue-50/30 border-b border-blue-50 flex items-center justify-between">
              <Typography variant="small" className="font-black text-blue-800 tracking-widest uppercase flex items-center gap-2">
                <AcademicCapIcon className="h-4 w-4 text-blue-600" /> Professional Information
              </Typography>
              <Chip size="sm" variant="ghost" color="blue" value={isDoctor ? "DOCTOR PROFILE" : "STAFF PROFILE"} className="rounded-lg text-[7px]" />
            </div>
            <CardBody className="p-6">
              {isEditing ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Doctors and Staff specialization/designation management */}
                    {isStaff && <InputGroup label="Designation" value={formData.designation} onChange={(v: string) => handleChange("designation", v)} />}
                    <InputGroup label="Specialization" value={formData.specialization} onChange={(v: string) => handleChange("specialization", v)} />
                    <InputGroup label="Qualification" value={formData.qualification} onChange={(v: string) => handleChange("qualification", v)} />
                    <InputGroup label="Years of Experience" type="number" value={formData.experience_years} onChange={(v: string) => handleChange("experience_years", v)} />
                    {!isDoctor && <InputGroup label="Staff Type" value={formData.staff_type} onChange={(v: string) => handleChange("staff_type", v)} />}
                    {isDoctor && <InputGroup label="Languages" value={formData.languages} placeholder="English, Hindi, etc." onChange={(v: string) => handleChange("languages", v)} />}
                  </div>
                  {isDoctor && (
                    <div className="pt-4 border-t border-blue-gray-50">
                      <Typography variant="small" color="blue-gray" className="font-bold text-[10px] mb-1.5 opacity-60 ml-1 uppercase tracking-widest">Short Biography</Typography>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => handleChange("bio", e.target.value)}
                        className="w-full h-24 p-3 rounded-xl border border-blue-gray-200 focus:border-blue-600 outline-none transition-all text-xs font-bold shadow-inner bg-gray-50/30"
                        placeholder="Write a short professional bio..."
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 bg-blue-gray-50/50 rounded-2xl border border-blue-gray-100 flex items-center justify-between">
                      <div className="flex flex-col min-w-0">
                        <Typography variant="small" className="font-bold text-blue-gray-400 uppercase tracking-widest text-[8px] mb-1">
                          {isDoctor ? "Specialization" : "Designation & Specialization"}
                        </Typography>
                        <Typography variant="small" className="font-bold text-gray-800 text-[11px] truncate uppercase">
                          {isDoctor ? user?.doctor?.specialization : `${user?.staff?.designation || 'Staff'} | ${user?.staff?.specialization || 'General'}`}
                        </Typography>
                        {!isDoctor && user?.staff?.staff_type && (
                          <Typography variant="small" className="font-bold text-blue-600 text-[8px] uppercase mt-0.5">{user?.staff?.staff_type}</Typography>
                        )}
                      </div>
                      <Chip size="sm" color="blue" variant="gradient" value={`${(user?.doctor || user?.staff)?.experience_years || 0} Years Exp`} className="rounded-lg text-[8px]" />
                    </div>
                    <div className="p-5 bg-blue-gray-50/50 rounded-2xl border border-blue-gray-100 grid grid-cols-2 gap-4">
                      <div>
                        <Typography variant="small" className="font-bold text-blue-gray-400 uppercase tracking-widest text-[8px] mb-1">Qualification</Typography>
                        <Typography variant="small" className="font-bold text-blue-600 truncate text-[11px] uppercase">{(user?.doctor || user?.staff)?.qualification || "Standard Certification"}</Typography>
                      </div>
                      <div>
                        <Typography variant="small" className="font-bold text-blue-gray-400 uppercase tracking-widest text-[8px] mb-1">Languages</Typography>
                        <Typography variant="small" className="font-bold text-blue-800 truncate text-[11px] uppercase">
                          {Array.isArray((user?.doctor || user?.staff)?.languages) ? (user?.doctor || user?.staff)?.languages.join(", ") : ((user?.doctor || user?.staff)?.languages || 'English')}
                        </Typography>
                      </div>
                    </div>
                  </div>
                  {isDoctor && (
                    <div className="p-6 bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-full bg-white/5 -skew-x-12 transform translate-x-16" />
                      <Typography variant="small" className="font-bold text-white/50 uppercase tracking-widest text-[8px] mb-2">Short Biography</Typography>
                      <Typography variant="small" className="italic text-white font-medium leading-relaxed block max-w-4xl text-[11px]">
                        "{user?.doctor?.bio || 'Profile biography not set.'}"
                      </Typography>
                    </div>
                  )}
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {isMedicalStaff && (
          <>
            {isStaff && (
              /* UNIFIED STAFF OPERATIONAL BLOCK */
              <Card className="border border-blue-gray-100 shadow-sm rounded-3xl overflow-hidden animate-fade-in group">
                <div className="px-6 py-4 bg-gradient-to-r from-blue-gray-50/50 to-indigo-50/30 border-b border-blue-gray-100 flex items-center justify-between">
                  <Typography variant="small" className="font-black text-indigo-900 tracking-widest uppercase flex items-center gap-2">
                    <ShieldCheckIcon className="h-4 w-4 text-indigo-600" /> Employment Details
                  </Typography>
                  {isEditing && (
                    <Chip size="sm" variant="ghost" value="SYSTEM SYNC READY" color="indigo" className="rounded-lg text-[7px] font-black" />
                  )}
                </div>
                <CardBody className="p-8">
                  {isEditing ? (
                    <div className="space-y-8 animate-fade-in">
                      {/* Primary Identification & Status Row */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <InputGroup label="Employee Registry ID" value={formData.employee_id} onChange={(v: string) => handleChange("employee_id", v)} />
                        <InputGroup label="Badge Identifier" value={formData.badge_number} onChange={(v: string) => handleChange("badge_number", v)} icon={<IdentificationIcon className="h-4 w-4" />} />
                        <div className="space-y-1">
                          <Typography variant="small" color="blue-gray" className="font-bold ml-1 text-[10px] uppercase tracking-widest opacity-60">Status Lifecycle</Typography>
                          <select value={formData.employment_status} onChange={(e) => handleChange("employment_status", e.target.value)} className="w-full h-10 px-4 rounded-xl border border-blue-gray-200 bg-white font-bold text-xs outline-none focus:border-blue-500 transition-all">
                            {["active", "inactive", "suspended", "terminated", "resigned", "on_leave"].map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <Typography variant="small" color="blue-gray" className="font-bold ml-1 text-[10px] uppercase tracking-widest opacity-60">Availability</Typography>
                          <div className="flex items-center justify-between h-10 px-4 bg-blue-gray-50/30 rounded-xl border border-blue-gray-100">
                            <Typography variant="small" className="font-bold text-[9px] uppercase opacity-40">Consultation Ready</Typography>
                            <Switch checked={Boolean(formData.is_available === true || formData.is_available === 'true')} onChange={(e) => handleChange("is_available", e.target.checked)} color="blue" crossOrigin={undefined} />
                          </div>
                        </div>
                      </div>

                      {/* Personnel Logistics Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-indigo-50/20 rounded-3xl border border-indigo-100/30">
                        <div className="space-y-1">
                          <Typography variant="small" color="blue-gray" className="font-bold ml-1 text-[10px] uppercase tracking-widest opacity-60">Staff Classification</Typography>
                          <select value={formData.staff_type} onChange={(e) => handleChange("staff_type", e.target.value)} className="w-full h-10 px-4 rounded-xl border border-blue-gray-200 bg-white font-bold text-xs outline-none focus:border-blue-500 transition-all">
                            {["administrative", "medical", "nursing", "technical", "paramedical", "support", "pharmacy", "management"].map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <Typography variant="small" color="blue-gray" className="font-bold ml-1 text-[10px] uppercase tracking-widest opacity-60">Engagement Protocol</Typography>
                          <select value={formData.employment_type} onChange={(e) => handleChange("employment_type", e.target.value)} className="w-full h-10 px-4 rounded-xl border border-blue-gray-200 bg-white font-bold text-xs outline-none focus:border-blue-500 transition-all">
                            {["full_time", "part_time", "contract", "visiting", "temporary", "intern", "probation"].map(t => <option key={t} value={t}>{t.replace('_', ' ').toUpperCase()}</option>)}
                          </select>
                        </div>
                        <InputGroup label="Reporting Manager" value={formData.reporting_manager} onChange={(v: string) => handleChange("reporting_manager", v)} />
                        <InputGroup label="Work Location" value={formData.work_location} onChange={(v: string) => handleChange("work_location", v)} />
                      </div>

                      {/* Duty Shift & Career Timeline */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <InputGroup label="Operational Shift" placeholder="e.g. Night Shift, Day A..." value={formData.shift} onChange={(v: string) => handleChange("shift", v)} icon={<ClockIcon className="h-4 w-4" />} />
                        <InputGroup label="Probation End Date" type="date" value={formData.probation_end_date} onChange={(v: string) => handleChange("probation_end_date", v)} />
                        <InputGroup label="Contract End Date" type="date" value={formData.contract_end_date} onChange={(v: string) => handleChange("contract_end_date", v)} />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      {/* Left: Primary Status Profile */}
                      <div className="lg:col-span-4 space-y-6">
                        <div className="p-6 bg-gradient-to-br from-indigo-700 to-blue-800 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-48 h-full bg-white/5 skew-x-[-20deg] translate-x-12" />
                          <div className="relative z-10">
                            <Typography variant="small" className="font-black text-white/40 uppercase tracking-[0.2em] text-[8px] mb-4">Current Duty Protocol</Typography>
                            <div className="flex items-center gap-4 mb-6">
                              <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/10">
                                <ClockIcon className="h-7 w-7" />
                              </div>
                              <div>
                                <Typography variant="h4" className="text-white font-black tracking-tighter uppercase leading-none">{user?.staff?.shift || 'GENERAL DUTY'}</Typography>
                                <Typography variant="small" className="text-white/60 font-bold text-[10px] uppercase mt-1 tracking-widest">Active Shift Window</Typography>
                              </div>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-white/10">
                              <div className="flex items-center gap-2">
                                <div className={`h-2 w-2 rounded-full ${user?.staff?.is_available ? 'bg-green-400' : 'bg-rose-400'}`} />
                                <Typography variant="small" className="text-white font-bold text-[9px] uppercase tracking-widest">{user?.staff?.is_available ? 'ONLINE' : 'OFFLINE'}</Typography>
                              </div>
                              <Chip size="sm" variant="ghost" value={user?.staff?.employment_status?.toUpperCase() || 'ACTIVE'} className="rounded-lg text-[8px] font-black text-white border-white/20" />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-blue-gray-50/50 rounded-3xl border border-blue-gray-100/50 text-center">
                            <Typography variant="small" className="font-bold text-blue-gray-300 uppercase text-[8px] mb-1">Registry ID</Typography>
                            <Typography variant="small" className="font-black text-blue-gray-800 text-[11px]">{user?.staff?.employee_id || 'ID-TBD'}</Typography>
                          </div>
                          <div className="p-4 bg-blue-gray-50/50 rounded-3xl border border-blue-gray-100/50 text-center">
                            <Typography variant="small" className="font-bold text-blue-gray-300 uppercase text-[8px] mb-1">Badge No.</Typography>
                            <Typography variant="small" className="font-black text-blue-gray-800 text-[11px]">{user?.staff?.badge_number || 'NONE'}</Typography>
                          </div>
                        </div>
                      </div>

                      {/* Right: Operational Details Matrix */}
                      <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-6">
                          <div className="flex flex-col gap-1 p-5 rounded-3xl border border-blue-gray-100 bg-white shadow-sm">
                            <Typography variant="small" className="font-black text-indigo-900/30 uppercase tracking-widest text-[8px] mb-3">Professional Classification</Typography>
                            <div className="flex justify-between items-center mb-1">
                              <Typography variant="small" className="font-bold text-blue-gray-500 text-[10px]">Staff Type</Typography>
                              <Typography variant="small" className="font-black text-indigo-900 text-[11px] uppercase">{user?.staff?.staff_type || 'STANDARD'}</Typography>
                            </div>
                            <div className="flex justify-between items-center">
                              <Typography variant="small" className="font-bold text-blue-gray-500 text-[10px]">Protocol</Typography>
                              <Typography variant="small" className="font-black text-indigo-600 text-[11px] uppercase">{user?.staff?.employment_type?.replace('_', ' ') || 'STANDARD'}</Typography>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1 p-5 rounded-3xl border border-blue-gray-100 bg-white shadow-sm">
                            <Typography variant="small" className="font-black text-indigo-900/30 uppercase tracking-widest text-[8px] mb-3">Liaison & Logistics</Typography>
                            <div className="flex justify-between items-center mb-1">
                              <Typography variant="small" className="font-bold text-blue-gray-500 text-[10px]">Manager</Typography>
                              <Typography variant="small" className="font-black text-blue-gray-800 text-[11px] uppercase">{user?.staff?.reporting_manager || 'NOT ASSIGNED'}</Typography>
                            </div>
                            <div className="flex justify-between items-center">
                              <Typography variant="small" className="font-bold text-blue-gray-500 text-[10px]">Location</Typography>
                              <Typography variant="small" className="font-black text-blue-gray-800 text-[11px] uppercase">{user?.staff?.work_location || 'HOSPITAL WIDE'}</Typography>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="h-full p-6 bg-blue-gray-50/30 rounded-[2rem] border border-blue-gray-100/50 flex flex-col justify-between">
                            <div>
                              <Typography variant="small" className="font-black text-blue-gray-800 tracking-widest uppercase text-[9px] mb-4 opacity-50">Timeline Milestone</Typography>
                              <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600"><CalendarDaysIcon className="h-4 w-4" /></div>
                                  <div>
                                    <Typography variant="small" className="font-bold text-blue-gray-400 uppercase text-[7px] leading-tight">Registry Joined</Typography>
                                    <Typography variant="small" className="font-black text-blue-gray-800 text-[10px]">{formatDate(user?.staff?.joining_date)}</Typography>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600"><ShieldCheckIcon className="h-4 w-4" /></div>
                                  <div>
                                    <Typography variant="small" className="font-bold text-blue-gray-400 uppercase text-[7px] leading-tight">Probation Concludes</Typography>
                                    <Typography variant="small" className="font-black text-blue-gray-800 text-[10px]">{user?.staff?.probation_end_date ? formatDate(user?.staff?.probation_end_date) : 'N/A'}</Typography>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600"><CheckIcon className="h-4 w-4" /></div>
                                  <div>
                                    <Typography variant="small" className="font-bold text-blue-gray-400 uppercase text-[7px] leading-tight">Contract Renewal</Typography>
                                    <Typography variant="small" className="font-black text-blue-gray-800 text-[10px]">{user?.staff?.contract_end_date ? formatDate(user?.staff?.contract_end_date) : 'N/A'}</Typography>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="mt-6 pt-4 border-t border-blue-gray-100/50 flex items-center gap-3">
                              <InformationCircleIcon className="h-4 w-4 text-blue-gray-300" />
                              <Typography variant="small" className="text-[8px] font-bold text-blue-gray-400 italic leading-tight uppercase">
                                Career milestones are calculated based on departmental entry and contract orchestration logs.
                              </Typography>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            )}
            {/* BLOCK 3: SCHEDULE & AVAILABILITY (Both Doctor and Staff) */}
            {(isDoctor || isStaff) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border border-blue-gray-100 shadow-sm rounded-3xl h-full overflow-hidden">
                  <div className="px-6 py-4 bg-orange-50/30 border-b border-orange-50">
                    <Typography variant="small" className="font-black text-orange-800 tracking-widest uppercase flex items-center gap-2">
                      <ShieldCheckIcon className="h-4 w-4 text-orange-600" /> {isDoctor ? 'Practice Information' : 'Duty Protocols'}
                    </Typography>
                  </div>
                  <CardBody className="p-6">
                    {isEditing ? (
                      <div className="space-y-4 animate-fade-in text-left">
                        {isDoctor ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputGroup label="Medical License Number" value={formData.license_number} onChange={(v: string) => handleChange("license_number", v)} />
                            <InputGroup label="Consultation Fee" type="number" value={formData.consultation_fee} onChange={(v: string) => handleChange("consultation_fee", v)} />
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputGroup label="Employee ID" value={formData.employee_id} onChange={(v: string) => handleChange("employee_id", v)} />
                            <InputGroup label="Badge Number" value={formData.badge_number} onChange={(v: string) => handleChange("badge_number", v)} />
                          </div>
                        )}

                        <div className="space-y-1">
                          <Typography variant="small" color="blue-gray" className="font-bold ml-1 text-[10px] uppercase tracking-widest opacity-60">Engagement Protocol</Typography>
                          <select value={formData.employment_type} onChange={(e) => handleChange("employment_type", e.target.value)} className="w-full h-10 px-4 rounded-xl border border-blue-gray-200 bg-white font-bold text-xs outline-none focus:border-blue-500 transition-all">
                            {["full_time", "part_time", "contract", "visiting", "temporary", "intern", "probation"].map(t => <option key={t} value={t}>{t.replace('_', ' ').toUpperCase()}</option>)}
                          </select>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-blue-gray-50/50 rounded-xl border-2 border-dashed border-blue-gray-100 mt-2">
                          <Typography variant="small" className="font-bold text-[10px] uppercase opacity-60 tracking-widest">Visibility Status</Typography>
                          <Switch checked={Boolean(formData.is_available === true || formData.is_available === 'true')} onChange={(e) => handleChange("is_available", e.target.checked)} color="blue" crossOrigin={undefined} />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6 flex flex-col h-full justify-between">
                        <div>
                          <div className="grid grid-cols-2 gap-4 mb-6">
                            {isDoctor ? (
                              <>
                                <CompactStat label="Medical License" value={user?.doctor?.license_number || 'ID-PENDING'} />
                                <CompactStat label="Consultation Fee" value={`$${user?.doctor?.consultation_fee || '0'}.00`} />
                              </>
                            ) : (
                              <>
                                <CompactStat label="Employee Registry" value={user?.staff?.employee_id || 'ID-PENDING'} />
                                <CompactStat label="Badge Identifier" value={user?.staff?.badge_number || 'NOT ISSUED'} />
                              </>
                            )}
                          </div>
                          <div className={`p-4 rounded-2xl border flex items-center justify-between mb-2 ${(user?.doctor?.is_available || user?.staff?.is_available) ? 'bg-green-50 border-green-100' : 'bg-rose-50 border-rose-100'}`}>
                            <div className="flex items-center gap-3">
                              <div className={`h-2 w-2 rounded-full ${(user?.doctor?.is_available || user?.staff?.is_available) ? 'bg-green-500 animate-pulse' : 'bg-rose-600'}`} />
                              <Typography variant="small" className="font-bold text-blue-gray-800 text-xs">Availability: {(user?.doctor?.is_available || user?.staff?.is_available) ? 'ONLINE' : 'OFFLINE'}</Typography>
                            </div>
                            <Chip size="sm" color={(user?.doctor?.is_available || user?.staff?.is_available) ? "green" : "red"} value={(user?.doctor?.is_available || user?.staff?.is_available) ? "ACTIVE" : "ABSENT"} className="rounded-lg text-[8px]" />
                          </div>
                        </div>

                        <div className="pt-6 border-t border-blue-gray-50 flex items-center justify-between mt-auto">
                          <div>
                            <Typography variant="small" className="font-bold uppercase opacity-30 text-[7px]">Registry Date</Typography>
                            <Typography variant="small" className="font-bold text-blue-gray-700 text-[10px]">{formatDate((user?.doctor || user?.staff)?.joining_date)}</Typography>
                          </div>
                          <div className="text-right">
                            <Typography variant="small" className="font-bold uppercase opacity-30 text-[7px]">Employment Protocol</Typography>
                            <Typography variant="small" className="font-bold text-blue-600 uppercase text-[10px]">{(user?.doctor?.employment_type || user?.staff?.employment_type || 'STANDARD').replace('_', ' ')}</Typography>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardBody>
                </Card>

                <Card className="border border-blue-gray-100 shadow-sm rounded-3xl h-full overflow-hidden">
                  <div className="px-6 py-4 bg-indigo-50/30 border-b border-indigo-50">
                    <Typography variant="small" className="font-black text-indigo-800 tracking-widest uppercase flex items-center gap-2">
                      <ClockIcon className="h-4 w-4 text-indigo-600" /> Schedule & Availability
                    </Typography>
                  </div>
                  <CardBody className="p-6">
                    {isEditing ? (
                      <div className="space-y-4 animate-fade-in">
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 p-4 bg-blue-gray-50/30 rounded-2xl border border-blue-gray-100/50">
                          {daysOfWeek.map((day) => (
                            <div
                              key={day}
                              className={`flex items-center justify-center gap-2.5 p-3 rounded-xl border transition-all cursor-pointer hover:bg-white/80 ${formData.working_days?.includes(day)
                                ? 'bg-white border-blue-200 shadow-sm ring-1 ring-blue-50'
                                : 'bg-transparent border-transparent opacity-50'
                                }`}
                              onClick={() => toggleWorkingDay(day)}
                            >
                              <Checkbox
                                key={day}
                                label={<Typography className="font-black text-[10px] uppercase text-blue-gray-900 leading-none shrink-0">{day.substring(0, 3)}</Typography>}
                                checked={formData.working_days?.includes(day)}
                                onChange={() => toggleWorkingDay(day)}
                                color="blue"
                                containerProps={{ className: "p-0" }}
                                crossOrigin={undefined}
                                className="h-4 w-4 bg-white"
                              />
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <InputGroup label="Start Time" type="time" value={formData.working_hours_start} onChange={(v: string) => handleChange("working_hours_start", v)} />
                          <InputGroup label="End Time" type="time" value={formData.working_hours_end} onChange={(v: string) => handleChange("working_hours_end", v)} />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6 flex flex-col h-full justify-between">
                        <div className="p-4 bg-blue-gray-50/30 rounded-2xl border border-blue-gray-100/50">
                          <Typography variant="small" className="font-black uppercase tracking-widest text-[8px] opacity-30 mb-3 text-center">Active Working Rotations</Typography>
                          <div className="flex flex-wrap justify-center gap-2">
                            {daysOfWeek.map((day) => {
                              const active = (user?.doctor || user?.staff)?.working_days?.includes(day);
                              return (
                                <div key={day} className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all flex items-center gap-1.5 ${active ? 'bg-white text-indigo-700 shadow-sm border border-indigo-100' : 'bg-transparent text-gray-300'}`}>
                                  {active && <div className="h-1 w-1 rounded-full bg-indigo-500" />}
                                  {day.substring(0, 3)}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-auto">
                          <div className="p-5 bg-white rounded-3xl border border-blue-gray-50 text-center shadow-sm group hover:border-indigo-200 transition-all">
                            <Typography variant="small" className="opacity-30 uppercase text-[7px] font-bold mb-1 tracking-widest">Shift Commencement</Typography>
                            <Typography variant="h5" className="text-indigo-600 font-black text-xl">{formatTime((user?.doctor || user?.staff)?.working_hours_start || (user?.doctor || user?.staff)?.work_hours_start)}</Typography>
                          </div>
                          <div className="p-5 bg-white rounded-3xl border border-blue-gray-50 text-center shadow-sm group hover:border-rose-200 transition-all">
                            <Typography variant="small" className="opacity-30 uppercase text-[7px] font-bold mb-1 tracking-widest">Shift Conclusion</Typography>
                            <Typography variant="h5" className="text-rose-600 font-black text-xl">{formatTime((user?.doctor || user?.staff)?.working_hours_end || (user?.doctor || user?.staff)?.work_hours_end)}</Typography>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </div>
            )}
          </>
        )}

        {/* BLOCK 4: SECURITY VAULT (Common to all) */}
        <Card className="border border-blue-gray-100 shadow-md rounded-3xl overflow-hidden mb-6">
          <CardBody className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 text-rose-600 shadow-sm">
                  <LockClosedIcon className="h-6 w-6" />
                </div>
                <div>
                  <Typography variant="h6" color="blue-gray" className="font-bold tracking-tight">Account Security</Typography>
                  <Typography variant="small" className="font-bold text-blue-gray-400 uppercase tracking-widest text-[8px]">Password and Access Control</Typography>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="gradient"
                  color="blue"
                  size="sm"
                  className="rounded-xl px-6 h-10 shadow-blue-100 shadow-lg font-bold text-[10px] tracking-widest"
                  onClick={() => setOpenPasswordModal(true)}
                >
                  CHANGE PASSWORD
                </Button>
                <Button
                  variant="outlined"
                  color="blue-gray"
                  size="sm"
                  className="rounded-xl px-6 h-10 font-bold text-[10px] tracking-widest border-blue-gray-100"
                >
                  2FA BIOMETRIC
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Global Sticky Action Bar */}
        {
          isEditing && (
            <div className="fixed bottom-6 left-0 right-0 z-[100] px-4 animate-slide-up flex justify-center">
              <Card className="w-full max-w-3xl border border-blue-50 shadow-[0_15px_40px_rgba(0,0,0,0.15)] rounded-3xl bg-white/90 backdrop-blur-md overflow-hidden ring-1 ring-black/5">
                <CardBody className="p-3 md:p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-xl text-white shadow-md animate-pulse shrink-0">
                      <CheckIcon className="h-5 w-5" />
                    </div>
                    <div className="hidden sm:block min-w-0">
                      <Typography variant="small" color="blue-gray" className="font-bold leading-none mb-0.5 truncate uppercase tracking-wider text-[11px]">Save Changes</Typography>
                      <Typography className="font-medium text-gray-500 text-[9px] uppercase tracking-tighter opacity-70">Update your account information</Typography>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="text" color="red" size="sm" onClick={handleCancel} disabled={loading} className="px-4 py-2 rounded-xl font-bold text-[10px] lowercase first-letter:uppercase">
                      Discard
                    </Button>
                    <Button color="blue" variant="gradient" onClick={handleSave} disabled={loading} className="h-9 px-6 rounded-xl shadow-blue-100 shadow-lg font-bold text-[10px] tracking-tight">
                      {loading ? "SAVING..." : "SAVE PROFILE"}
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </div>
          )
        }

        {/* Security Dialog */}
        <Dialog open={openPasswordModal} handler={setOpenPasswordModal} size="xs" className="rounded-[2rem] shadow-2xl">
          <DialogHeader className="flex flex-col gap-1 items-center pt-8 px-8">
            <Typography variant="h5" color="blue-gray" className="font-black">Identity Verification</Typography>
            <Typography variant="small" color="gray" className="font-bold opacity-40 text-center uppercase tracking-widest px-4">Secure your professional clinical registry.</Typography>
          </DialogHeader>
          <DialogBody className="px-8 pb-6 space-y-4">
            {passwordError && (
              <div className="p-3.5 rounded-xl bg-rose-50 text-rose-700 text-[10px] font-black flex items-center gap-3 border border-rose-100 uppercase">
                <XMarkIcon className="h-4 w-4" /> {passwordError}
              </div>
            )}
            <div className="space-y-4">
              <DialogInputField label="Current Password" value={passwordData.currentPassword} show={showPasswords.current} toggle={() => setShowPasswords(p => ({ ...p, current: !p.current }))} onChange={(v: string) => setPasswordData(p => ({ ...p, currentPassword: v }))} />
              <DialogInputField label="New Password" value={passwordData.newPassword} show={showPasswords.new} toggle={() => setShowPasswords(p => ({ ...p, new: !p.new }))} onChange={(v: string) => setPasswordData(p => ({ ...p, newPassword: v }))} />
              <DialogInputField label="Confirm New Password" value={passwordData.confirmPassword} show={showPasswords.confirm} toggle={() => setShowPasswords(p => ({ ...p, confirm: !p.confirm }))} onChange={(v: string) => setPasswordData(p => ({ ...p, confirmPassword: v }))} />
            </div>
          </DialogBody>
          <DialogFooter className="px-8 pb-10 pt-2 flex flex-col gap-3">
            <Button color="blue" fullWidth size="md" onClick={handleChangePassword} disabled={loading} className="rounded-xl h-11 font-bold shadow-sm">
              {loading ? "UPDATING..." : "UPDATE PASSWORD"}
            </Button>
            <Button variant="text" color="red" fullWidth onClick={() => setOpenPasswordModal(false)} className="rounded-xl h-10 font-bold uppercase text-[10px]">
              Cancel
            </Button>
          </DialogFooter>
        </Dialog>
      </div>
    </div>
  );
}

export default Profile;
