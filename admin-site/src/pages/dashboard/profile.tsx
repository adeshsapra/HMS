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
} from "@heroicons/react/24/solid";
import { useAuth } from "@/context/AuthContext";
import apiService from "@/services/api";

export function Profile(): JSX.Element {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openPasswordModal, setOpenPasswordModal] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await apiService.updateProfile(formData);
      await refreshUser();
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      alert(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    
    // Validation
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

    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordError("New password must be different from current password");
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
      setPasswordError("");
      alert("Password changed successfully!");
    } catch (error: any) {
      console.error("Failed to change password:", error);
      setPasswordError(error.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="mt-12 mb-8">
      {/* Header */}
      <div className="mb-8">
        <Typography variant="h2" color="blue-gray" className="mb-2">
          Profile
        </Typography>
        <Typography variant="small" color="gray" className="font-normal">
          Manage your account information and preferences
        </Typography>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1 border border-blue-gray-100 shadow-lg">
          <CardBody className="p-6">
            <div className="flex flex-col items-center text-center">
              <Avatar
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=random&size=128`}
                alt={user?.name || "User"}
                size="xxl"
                className="mb-4 border-4 border-blue-500 shadow-lg"
              />
              <Typography variant="h4" color="blue-gray" className="mb-1">
                {user?.name || "User"}
              </Typography>
              <Typography
                variant="small"
                color="blue-gray"
                className="font-medium mb-4 capitalize"
              >
                {user?.role?.name || "No Role"}
              </Typography>
              
              {/* Role Badge */}
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200">
                  <ShieldCheckIcon className="h-4 w-4 text-blue-600" />
                  <Typography variant="small" className="font-semibold text-blue-700 capitalize">
                    {user?.role?.name || "No Role"}
                  </Typography>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Profile Information */}
        <Card className="lg:col-span-2 border border-blue-gray-100 shadow-lg">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-6">
              <Typography variant="h5" color="blue-gray">
                Profile Information
              </Typography>
              {!isEditing && (
                <Button
                  variant="outlined"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={handleEdit}
                >
                  <PencilIcon className="h-4 w-4" />
                  Edit Profile
                </Button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-6">
                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="mb-2 font-semibold"
                  >
                    Full Name
                  </Typography>
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="!border-blue-gray-200 focus:!border-blue-500"
                    labelProps={{
                      className: "before:content-none after:content-none",
                    }}
                    crossOrigin={undefined}
                  />
                </div>

                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="mb-2 font-semibold"
                  >
                    Email Address
                  </Typography>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="!border-blue-gray-200 focus:!border-blue-500"
                    labelProps={{
                      className: "before:content-none after:content-none",
                    }}
                    icon={<EnvelopeIcon className="h-5 w-5" />}
                    crossOrigin={undefined}
                  />
                </div>

                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="mb-2 font-semibold"
                  >
                    Phone Number
                  </Typography>
                  <Input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="!border-blue-gray-200 focus:!border-blue-500"
                    labelProps={{
                      className: "before:content-none after:content-none",
                    }}
                    icon={<PhoneIcon className="h-5 w-5" />}
                    crossOrigin={undefined}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    color="blue"
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <CheckIcon className="h-4 w-4" />
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    variant="outlined"
                    color="red"
                    onClick={handleCancel}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <XMarkIcon className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-blue-50">
                    <UserCircleIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="mb-1 font-semibold uppercase text-xs"
                    >
                      Full Name
                    </Typography>
                    <Typography variant="paragraph" color="blue-gray" className="font-medium">
                      {user?.name || "Not set"}
                    </Typography>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-green-50">
                    <EnvelopeIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="mb-1 font-semibold uppercase text-xs"
                    >
                      Email Address
                    </Typography>
                    <Typography variant="paragraph" color="blue-gray" className="font-medium">
                      {user?.email || "Not set"}
                    </Typography>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-purple-50">
                    <PhoneIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="mb-1 font-semibold uppercase text-xs"
                    >
                      Phone Number
                    </Typography>
                    <Typography variant="paragraph" color="blue-gray" className="font-medium">
                      {user?.phone || "Not set"}
                    </Typography>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-orange-50">
                    <ShieldCheckIcon className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="mb-1 font-semibold uppercase text-xs"
                    >
                      Role
                    </Typography>
                    <Typography variant="paragraph" color="blue-gray" className="font-medium capitalize">
                      {user?.role?.name || "No role assigned"}
                    </Typography>
                  </div>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Account Security Section */}
      <Card className="mt-6 border border-blue-gray-100 shadow-lg">
        <CardBody className="p-6">
          <Typography variant="h5" color="blue-gray" className="mb-4">
            Account Security
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-lg border border-blue-gray-100 bg-blue-gray-50/50">
              <Typography variant="h6" color="blue-gray" className="mb-2">
                Password
              </Typography>
              <Typography variant="small" color="gray" className="mb-4">
                Keep your account secure with a strong password
              </Typography>
              <Button 
                variant="outlined" 
                size="sm"
                onClick={() => setOpenPasswordModal(true)}
                className="flex items-center gap-2"
              >
                <LockClosedIcon className="h-4 w-4" />
                Change Password
              </Button>
            </div>
            <div className="p-4 rounded-lg border border-blue-gray-100 bg-blue-gray-50/50">
              <Typography variant="h6" color="blue-gray" className="mb-2">
                Two-Factor Authentication
              </Typography>
              <Typography variant="small" color="gray" className="mb-4">
                Add an extra layer of security to your account
              </Typography>
              <Button variant="outlined" size="sm">
                Enable 2FA
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Change Password Modal */}
      <Dialog open={openPasswordModal} handler={setOpenPasswordModal} size="md">
        <DialogHeader className="flex items-center gap-2">
          <LockClosedIcon className="h-5 w-5 text-blue-600" />
          <Typography variant="h5" color="blue-gray">
            Change Password
          </Typography>
        </DialogHeader>
        <DialogBody className="pt-4">
          <div className="space-y-4">
            {passwordError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <Typography variant="small" color="red" className="font-medium">
                  {passwordError}
                </Typography>
              </div>
            )}

            <div>
              <Typography
                variant="small"
                color="blue-gray"
                className="mb-2 font-semibold"
              >
                Current Password
              </Typography>
              <Input
                type={showPasswords.current ? "text" : "password"}
                placeholder="Enter current password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
                className="!border-blue-gray-200 focus:!border-blue-500"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                icon={
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((prev) => ({
                        ...prev,
                        current: !prev.current,
                      }))
                    }
                    className="focus:outline-none"
                  >
                    {showPasswords.current ? (
                      <EyeSlashIcon className="h-5 w-5 text-blue-gray-500" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-blue-gray-500" />
                    )}
                  </button>
                }
                crossOrigin={undefined}
              />
            </div>

            <div>
              <Typography
                variant="small"
                color="blue-gray"
                className="mb-2 font-semibold"
              >
                New Password
              </Typography>
              <Input
                type={showPasswords.new ? "text" : "password"}
                placeholder="Enter new password (min 8 characters)"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
                className="!border-blue-gray-200 focus:!border-blue-500"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                icon={
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((prev) => ({
                        ...prev,
                        new: !prev.new,
                      }))
                    }
                    className="focus:outline-none"
                  >
                    {showPasswords.new ? (
                      <EyeSlashIcon className="h-5 w-5 text-blue-gray-500" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-blue-gray-500" />
                    )}
                  </button>
                }
                crossOrigin={undefined}
              />
              <Typography variant="small" color="gray" className="mt-1">
                Must be at least 8 characters long
              </Typography>
            </div>

            <div>
              <Typography
                variant="small"
                color="blue-gray"
                className="mb-2 font-semibold"
              >
                Confirm New Password
              </Typography>
              <Input
                type={showPasswords.confirm ? "text" : "password"}
                placeholder="Confirm new password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                className="!border-blue-gray-200 focus:!border-blue-500"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                icon={
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((prev) => ({
                        ...prev,
                        confirm: !prev.confirm,
                      }))
                    }
                    className="focus:outline-none"
                  >
                    {showPasswords.confirm ? (
                      <EyeSlashIcon className="h-5 w-5 text-blue-gray-500" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-blue-gray-500" />
                    )}
                  </button>
                }
                crossOrigin={undefined}
              />
            </div>
          </div>
        </DialogBody>
        <DialogFooter className="gap-2">
          <Button
            variant="outlined"
            color="red"
            onClick={() => {
              setOpenPasswordModal(false);
              setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
              });
              setPasswordError("");
            }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            color="blue"
            onClick={handleChangePassword}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <LockClosedIcon className="h-4 w-4" />
            {loading ? "Changing..." : "Change Password"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default Profile;
