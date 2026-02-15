import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Typography,
  Button,
  Select,
  Option,
  Chip,
} from "@material-tailwind/react";
import { ShieldCheckIcon, KeyIcon } from "@heroicons/react/24/outline";
import apiService from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { PermissionWrapper } from "@/components/PermissionWrapper";

interface Role {
  id: number;
  name: string;
  description?: string;
  permissions?: Permission[];
}

interface Permission {
  id: number;
  name: string;
  slug: string;
  module?: string;
}

const CustomCheckbox = ({ checked, onChange, label }: { checked: boolean; onChange: () => void; label?: React.ReactNode }) => (
  <div className="inline-flex items-center cursor-pointer group" onClick={onChange}>
    <div className="relative flex items-center justify-center p-1 rounded-full">
      <div
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${checked
          ? "bg-[#0e7490] border-[#0e7490]"
          : "bg-white border-blue-gray-200 group-hover:border-[#0e7490]"
          }`}
      >
        {checked && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5 text-white font-bold"
            viewBox="0 0 20 20"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
    </div>
    {label && <span className="ml-2 select-none">{label}</span>}
  </div>
);

export default function RolePermissions(): JSX.Element {
  const { hasPermission } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedRole) {
      setSelectedPermissions(selectedRole.permissions?.map((p) => p.id) || []);
    }
  }, [selectedRole]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesResponse, permissionsResponse] = await Promise.all([
        apiService.getRoles({ per_page: 1000 }),
        apiService.getPermissions({ per_page: 1000 }),
      ]);

      if (rolesResponse.status && rolesResponse.roles) {
        setRoles(rolesResponse.roles);
        if (rolesResponse.roles.length > 0 && !selectedRole) {
          setSelectedRole(rolesResponse.roles[0]);
        }
      }

      if (permissionsResponse.status && permissionsResponse.permissions) {
        setPermissions(permissionsResponse.permissions);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (roleId: string) => {
    const role = roles.find((r) => r.id === parseInt(roleId));
    if (role) {
      setSelectedRole(role);
    }
  };

  const handlePermissionToggle = (permissionId: number) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleModuleToggle = (module: string) => {
    const modulePermissions = permissions
      .filter((p) => p.module === module)
      .map((p) => p.id);
    const allSelected = modulePermissions.every((id) =>
      selectedPermissions.includes(id)
    );

    if (allSelected) {
      setSelectedPermissions((prev) =>
        prev.filter((id) => !modulePermissions.includes(id))
      );
    } else {
      setSelectedPermissions((prev) => [
        ...prev,
        ...modulePermissions.filter((id) => !prev.includes(id)),
      ]);
    }
  };

  const handleSave = async () => {
    if (!selectedRole) return;

    try {
      setSaving(true);
      const response = await apiService.assignPermissionsToRole(
        selectedRole.id,
        selectedPermissions
      );
      if (response.status) {
        await loadData();
        alert("Permissions updated successfully!");
      }
    } catch (error) {
      console.error("Failed to save permissions:", error);
      alert("Failed to update permissions");
    } finally {
      setSaving(false);
    }
  };

  const groupedPermissions = permissions.reduce((acc, perm) => {
    const module = perm.module || "General";
    if (!acc[module]) {
      acc[module] = [];
    }
    acc[module].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="mt-12 mb-8">
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-blue-gray-800 mb-2">
          Role-Permission Mapping
        </h2>
        <p className="text-blue-gray-600 text-base">
          Assign permissions to roles to control access
        </p>
      </div>

      <PermissionWrapper permission="manage-roles">
        <Card className="mb-6">
          <CardBody>
            <div className="flex items-center gap-4 mb-6">
              <ShieldCheckIcon className="h-6 w-6 text-blue-500" />
              <Select
                label="Select Role"
                value={selectedRole?.id.toString() || ""}
                onChange={handleRoleChange}
                className="flex-1"
              >
                {roles.map((role) => (
                  <Option key={role.id} value={role.id.toString()}>
                    {role.name}
                    {role.description && ` - ${role.description}`}
                  </Option>
                ))}
              </Select>
            </div>

            {selectedRole && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Typography variant="h6" color="blue-gray">
                    Permissions for {selectedRole.name}
                  </Typography>
                  <Button
                    color="blue"
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2"
                  >
                    {saving ? "Saving..." : "Save Permissions"}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                  {Object.entries(groupedPermissions).map(([module, perms]) => {
                    const modulePermissionIds = perms.map((p) => p.id);
                    const allSelected = modulePermissionIds.every((id) =>
                      selectedPermissions.includes(id)
                    );

                    return (
                      <Card key={module} className="p-4 shadow-sm border border-blue-gray-50">
                        <div className="mb-4 pb-2 border-b border-blue-gray-50">
                          <CustomCheckbox
                            checked={allSelected}
                            onChange={() => handleModuleToggle(module)}
                            label={
                              <Typography variant="small" className="font-bold text-blue-gray-800 text-sm uppercase tracking-wide">
                                {module}
                              </Typography>
                            }
                          />
                        </div>
                        <div className="space-y-3 pl-2">
                          {perms.map((perm) => (
                            <div key={perm.id} className="flex items-center gap-2">
                              <CustomCheckbox
                                checked={selectedPermissions.includes(perm.id)}
                                onChange={() => handlePermissionToggle(perm.id)}
                                label={
                                  <Typography variant="small" className="text-blue-gray-600 font-medium">
                                    {perm.name}
                                  </Typography>
                                }
                              />
                            </div>
                          ))}
                        </div>
                      </Card>
                    );
                  })}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <Typography variant="small" color="blue-gray">
                    Selected: {selectedPermissions.length} of {permissions.length}{" "}
                    permissions
                  </Typography>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </PermissionWrapper>
    </div>
  );
}
