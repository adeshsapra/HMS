import React, { useState, useEffect } from "react";
import { DataTable, FormModal, DeleteConfirmModal, Column, FormField, AdvancedFilter } from "@/components";
import { Button, Typography, Chip } from "@material-tailwind/react";
import { UserPlusIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import apiService from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { PermissionWrapper } from "@/components/PermissionWrapper";

interface Role {
  id: number;
  name: string;
  description?: string;
  is_system?: boolean;
  permissions?: Array<{ id: number; name: string; slug: string }>;
}

export default function Roles(): JSX.Element {
  const { hasPermission } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  useEffect(() => {
    loadRoles(1, filters);
  }, []);

  const loadRoles = async (page: number = currentPage, currentFilters = filters) => {
    try {
      setLoading(true);
      const response = await apiService.getRoles({
        page,
        keyword: currentFilters.keyword
      });
      if (response.status && response.roles) {
        setRoles(response.roles);
        setTotalPages(response.last_page || 1);
        setCurrentPage(response.current_page || 1);
      }
    } catch (error) {
      console.error("Failed to load roles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadRoles(page, filters);
  };

  const columns: Column[] = [
    {
      key: "name",
      label: "Role Name",
      render: (value: any, row: Role) => (
        <div className="flex items-center gap-2">
          <ShieldCheckIcon className="h-5 w-5 text-blue-500" />
          <Typography variant="small" className="font-bold">
            {value}
          </Typography>
          {row.is_system && (
            <Chip value="System" size="sm" color="blue" className="text-xs" />
          )}
        </div>
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (value: any) => (
        <Typography variant="small" color="gray">
          {value || "—"}
        </Typography>
      ),
    },
    {
      key: "permissions",
      label: "Permissions",
      render: (value: any, row: Role) => (
        <Typography variant="small" color="blue-gray">
          {row.permissions?.length || 0} permission(s)
        </Typography>
      ),
    },
  ];

  const formFields: FormField[] = [
    {
      name: "name",
      label: "Role Name",
      type: "text",
      required: true,
      placeholder: "e.g., Manager, Receptionist",
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      required: false,
      placeholder: "Describe the role's responsibilities",
    },
  ];

  const handleAdd = (): void => {
    setSelectedRole(null);
    setOpenModal(true);
  };

  const handleEdit = (role: Role): void => {
    setSelectedRole(role);
    setOpenModal(true);
  };

  const handleDelete = (role: Role): void => {
    setSelectedRole(role);
    setOpenDeleteModal(true);
  };

  const confirmDelete = async (): Promise<void> => {
    if (selectedRole) {
      try {
        const response = await apiService.deleteRole(selectedRole.id);
        if (response.status) {
          await loadRoles(currentPage, filters);
          setOpenDeleteModal(false);
          setSelectedRole(null);
        }
      } catch (error) {
        console.error("Failed to delete role:", error);
      }
    }
  };

  const handleSubmit = async (data: Record<string, any>): Promise<void> => {
    try {
      if (selectedRole) {
        await apiService.updateRole(selectedRole.id, {
          name: data.name,
          description: data.description,
        });
      } else {
        await apiService.createRole({
          name: data.name,
          description: data.description,
        });
      }
      await loadRoles(currentPage, filters);
      setOpenModal(false);
      setSelectedRole(null);
    } catch (error) {
      console.error("Failed to save role:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="mt-12 mb-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold text-blue-gray-800 mb-2">Roles</h2>
          <p className="text-blue-gray-600 text-base">
            Manage user roles and their permissions
          </p>
        </div>
        <PermissionWrapper permission="create-roles">
          <Button
            variant="gradient"
            color="blue"
            className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
            onClick={handleAdd}
          >
            <UserPlusIcon className="h-5 w-5" />
            Add Role
          </Button>
        </PermissionWrapper>
      </div>

      <DataTable
        title="Role Management"
        data={roles}
        columns={columns}
        onAdd={hasPermission("create-roles") ? handleAdd : undefined}
        onEdit={hasPermission("edit-roles") ? handleEdit : undefined}
        onDelete={hasPermission("delete-roles") ? handleDelete : undefined}
        searchable={false}
        exportable={true}
        addButtonLabel="Add Role"
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
                  label: 'Search Roles',
                  type: 'text',
                  placeholder: 'Search name or description...'
                }
              ],
              onApplyFilters: (f) => {
                setFilters(f);
                setCurrentPage(1);
                loadRoles(1, f);
              },
              onResetFilters: () => {
                setFilters({});
                setCurrentPage(1);
                loadRoles(1, {});
              },
              initialValues: filters
            }}
          />
        }
      />

      <FormModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setSelectedRole(null);
        }}
        title={selectedRole ? "Edit Role" : "Add New Role"}
        formFields={formFields}
        initialData={selectedRole || {}}
        onSubmit={handleSubmit}
        submitLabel={selectedRole ? "Update Role" : "Create Role"}
      />

      <DeleteConfirmModal
        open={openDeleteModal}
        onClose={() => {
          setOpenDeleteModal(false);
          setSelectedRole(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Role"
        message="Are you sure you want to delete this role? This action cannot be undone."
        itemName={selectedRole?.name}
      />
    </div>
  );
}

