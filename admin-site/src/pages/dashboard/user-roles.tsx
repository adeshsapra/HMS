import React, { useState, useEffect } from "react";
import { DataTable, Column, FormModal, FormField, AdvancedFilter } from "@/components";
import {
  Card,
  CardBody,
  Typography,
  Button,
  Select,
  Option,
  Chip,
  Avatar,
  Input,
} from "@material-tailwind/react";
import { UserIcon, ShieldCheckIcon, PlusIcon } from "@heroicons/react/24/outline";
import apiService from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { PermissionWrapper } from "@/components/PermissionWrapper";

interface User {
  id: number;
  name: string;
  email: string;
  role_id?: number;
  role?: {
    id: number;
    name: string;
  };
}

interface Role {
  id: number;
  name: string;
  description?: string;
}

export default function UserRoles(): JSX.Element {
  const { hasPermission } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<Record<string, any>>({});

  useEffect(() => {
    loadData(1, filters);
  }, []);

  useEffect(() => {
    if (selectedUser) {
      setSelectedRoleId(selectedUser.role_id?.toString() || "");
    }
  }, [selectedUser]);

  const loadData = async (page: number = currentPage, currentFilters = filters) => {
    try {
      setLoading(true);
      const [usersResponse, rolesResponse] = await Promise.all([
        apiService.getUserRoles({
          page,
          keyword: currentFilters.keyword,
          role_id: currentFilters.role_id
        }),
        apiService.getRoles({ per_page: 1000 }), // Get all roles for select dropdown
      ]);

      if (usersResponse.status && usersResponse.users) {
        setUsers(usersResponse.users);
        setTotalPages(usersResponse.last_page || 1);
        setCurrentPage(usersResponse.current_page || 1);
      }

      const rolesData = rolesResponse.roles || rolesResponse;
      if (rolesData) {
        setRoles(Array.isArray(rolesData) ? rolesData : (rolesData.data || []));
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadData(page, filters);
  };

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRoleId) return;

    try {
      setSaving(true);
      const response = await apiService.assignRoleToUser(
        selectedUser.id,
        parseInt(selectedRoleId)
      );
      if (response.status) {
        await loadData(currentPage, filters);
        setSelectedUser(null);
        setSelectedRoleId("");
        alert("Role assigned successfully!");
      }
    } catch (error: any) {
      console.error("Failed to assign role:", error);
      alert(error.message || "Failed to assign role");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateUser = async (data: Record<string, any>) => {
    try {
      setCreating(true);
      const response = await apiService.createUser({
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        password: data.password,
        role_id: parseInt(data.role_id),
      });
      if (response.status) {
        await loadData(currentPage, filters);
        setOpenCreateModal(false);
        alert("User created successfully!");
      }
    } catch (error: any) {
      console.error("Failed to create user:", error);
      alert(error.message || "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  const createUserFields: FormField[] = [
    {
      name: "name",
      label: "Full Name",
      type: "text",
      required: true,
      placeholder: "Enter full name",
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      required: true,
      placeholder: "Enter email address",
    },
    {
      name: "phone",
      label: "Phone (Optional)",
      type: "text",
      required: false,
      placeholder: "Enter phone number",
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      required: true,
      placeholder: "Enter password (min 8 characters)",
    },
    {
      name: "role_id",
      label: "Role",
      type: "select",
      required: true,
      options: roles.map((role) => ({
        value: role.id.toString(),
        label: role.name,
      })),
    },
  ];

  const columns: Column[] = [
    {
      key: "name",
      label: "User",
      render: (value: any, row: User) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(value)}&background=random`}
            alt={value}
            size="sm"
          />
          <div>
            <Typography variant="small" className="font-bold">
              {value}
            </Typography>
            <Typography variant="small" color="gray" className="text-xs">
              {row.email}
            </Typography>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Current Role",
      render: (value: any, row: User) => (
        <Chip
          value={row.role?.name || "No Role"}
          size="sm"
          color={row.role ? "blue" : "gray"}
          variant="outlined"
        />
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (value: any, row: User) => (
        <Button
          size="sm"
          variant="outlined"
          color="blue"
          onClick={() => setSelectedUser(row)}
        >
          Assign Role
        </Button>
      ),
    },
  ];

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
          User-Role Assignment
        </h2>
        <p className="text-blue-gray-600 text-base">
          Assign roles to users to control their access permissions
        </p>
      </div>

      <PermissionWrapper permission="assign-roles">
        <div className="mb-6 flex justify-between items-center">
          <div></div>
          <Button
            color="blue"
            className="flex items-center gap-2"
            onClick={() => setOpenCreateModal(true)}
          >
            <PlusIcon className="h-5 w-5" />
            Create New User
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className={selectedUser ? "lg:col-span-2" : "lg:col-span-3"}>
            <DataTable
              title="Users"
              data={users}
              columns={columns}
              searchable={false}
              pagination={{
                currentPage: currentPage,
                totalPages: totalPages,
                onPageChange: handlePageChange
              }}
              advancedFilter={
                <AdvancedFilter
                  config={{
                    fields: [
                      {
                        name: 'keyword',
                        label: 'Search Users',
                        type: 'text',
                        placeholder: 'Search name, email, phone...'
                      },
                      {
                        name: 'role_id',
                        label: 'Role',
                        type: 'select',
                        options: [
                          { label: 'All Roles', value: 'all' },
                          ...roles.map(r => ({ label: r.name, value: r.id }))
                        ]
                      }
                    ],
                    onApplyFilters: (f) => {
                      setFilters(f);
                      setCurrentPage(1);
                      loadData(1, f);
                    },
                    onResetFilters: () => {
                      setFilters({});
                      setCurrentPage(1);
                      loadData(1, {});
                    },
                    initialValues: filters
                  }}
                />
              }
            />
          </div>

          {selectedUser && (
            <Card className="lg:col-span-1">
              <CardBody>
                <div className="flex items-center gap-3 mb-4">
                  <UserIcon className="h-6 w-6 text-blue-500" />
                  <Typography variant="h6">Assign Role</Typography>
                </div>

                <div className="space-y-4">
                  <div>
                    <Typography variant="small" color="gray" className="mb-2">
                      User
                    </Typography>
                    <Typography variant="paragraph" className="font-semibold">
                      {selectedUser.name}
                    </Typography>
                    <Typography variant="small" color="gray">
                      {selectedUser.email}
                    </Typography>
                  </div>

                  <div>
                    <Select
                      label="Select Role"
                      value={selectedRoleId}
                      onChange={(val) => setSelectedRoleId(val as string)}
                    >
                      {roles.map((role) => (
                        <Option key={role.id} value={role.id.toString()}>
                          {role.name}
                        </Option>
                      ))}
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      color="blue"
                      fullWidth
                      onClick={handleAssignRole}
                      disabled={saving || !selectedRoleId}
                    >
                      {saving ? "Assigning..." : "Assign Role"}
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => {
                        setSelectedUser(null);
                        setSelectedRoleId("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        <FormModal
          open={openCreateModal}
          onClose={() => setOpenCreateModal(false)}
          title="Create New User"
          formFields={createUserFields}
          initialData={{}}
          onSubmit={handleCreateUser}
          submitLabel={creating ? "Creating..." : "Create User"}
        />
      </PermissionWrapper>
    </div>
  );
}

