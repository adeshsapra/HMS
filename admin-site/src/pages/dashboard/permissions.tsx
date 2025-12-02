import React, { useState, useEffect } from "react";
import { DataTable, FormModal, DeleteConfirmModal, Column, FormField } from "@/components";
import { Button, Typography, Chip, Select, Option } from "@material-tailwind/react";
import { KeyIcon, PlusIcon } from "@heroicons/react/24/outline";
import apiService from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { PermissionWrapper } from "@/components/PermissionWrapper";

interface Permission {
  id: number;
  name: string;
  slug: string;
  module?: string;
  description?: string;
}

export default function Permissions(): JSX.Element {
  const { hasPermission } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [filteredPermissions, setFilteredPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [selectedModule, setSelectedModule] = useState<string>("all");
  const [modules, setModules] = useState<string[]>([]);

  useEffect(() => {
    loadPermissions();
  }, []);

  useEffect(() => {
    filterPermissions();
  }, [selectedModule, permissions]);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPermissions();
      if (response.status && response.permissions) {
        setPermissions(response.permissions);
        const uniqueModules = Array.from(
          new Set(response.permissions.map((p: Permission) => p.module).filter(Boolean))
        ) as string[];
        setModules(uniqueModules.sort());
      }
    } catch (error) {
      console.error("Failed to load permissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterPermissions = () => {
    if (selectedModule === "all") {
      setFilteredPermissions(permissions);
    } else {
      setFilteredPermissions(
        permissions.filter((p) => p.module === selectedModule)
      );
    }
  };

  const columns: Column[] = [
    {
      key: "name",
      label: "Permission Name",
      render: (value: any, row: Permission) => (
        <div className="flex items-center gap-2">
          <KeyIcon className="h-5 w-5 text-purple-500" />
          <div>
            <Typography variant="small" className="font-bold">
              {value}
            </Typography>
            <Typography variant="small" color="gray" className="text-xs">
              {row.slug}
            </Typography>
          </div>
        </div>
      ),
    },
    {
      key: "module",
      label: "Module",
      render: (value: any) => (
        <Chip
          value={value || "General"}
          size="sm"
          color="purple"
          variant="outlined"
        />
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
  ];

  const formFields: FormField[] = [
    {
      name: "name",
      label: "Permission Name",
      type: "text",
      required: true,
      placeholder: "e.g., View Patients",
    },
    {
      name: "module",
      label: "Module",
      type: "select",
      required: false,
      options: [
        { value: "", label: "Select Module" },
        ...modules.map((m) => ({ value: m, label: m })),
        { value: "Custom", label: "Custom" },
      ],
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      required: false,
      placeholder: "Describe what this permission allows",
    },
  ];

  const handleAdd = (): void => {
    setSelectedPermission(null);
    setOpenModal(true);
  };

  const handleEdit = (permission: Permission): void => {
    setSelectedPermission(permission);
    setOpenModal(true);
  };

  const handleDelete = (permission: Permission): void => {
    setSelectedPermission(permission);
    setOpenDeleteModal(true);
  };

  const confirmDelete = async (): Promise<void> => {
    if (selectedPermission) {
      try {
        const response = await apiService.deletePermission(selectedPermission.id);
        if (response.status) {
          await loadPermissions();
          setOpenDeleteModal(false);
          setSelectedPermission(null);
        }
      } catch (error) {
        console.error("Failed to delete permission:", error);
      }
    }
  };

  const handleSubmit = async (data: Record<string, any>): Promise<void> => {
    try {
      if (selectedPermission) {
        await apiService.updatePermission(selectedPermission.id, {
          name: data.name,
          module: data.module || null,
          description: data.description,
        });
      } else {
        await apiService.createPermission({
          name: data.name,
          module: data.module || null,
          description: data.description,
        });
      }
      await loadPermissions();
      setOpenModal(false);
      setSelectedPermission(null);
    } catch (error) {
      console.error("Failed to save permission:", error);
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
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-4xl font-bold text-blue-gray-800 mb-2">Permissions</h2>
          <p className="text-blue-gray-600 text-base">
            Manage system permissions grouped by modules
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select
            label="Filter by Module"
            value={selectedModule}
            onChange={(val) => setSelectedModule(val as string)}
            className="w-64"
          >
            <Option value="all">All Modules</Option>
            {modules.map((module) => (
              <Option key={module} value={module}>
                {module}
              </Option>
            ))}
          </Select>
          <PermissionWrapper permission="create-permissions">
            <Button
              variant="gradient"
              color="purple"
              className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
              onClick={handleAdd}
            >
              <PlusIcon className="h-5 w-5" />
              Add Permission
            </Button>
          </PermissionWrapper>
        </div>
      </div>

      <DataTable
        title="Permission Management"
        data={filteredPermissions}
        columns={columns}
        onAdd={hasPermission("create-permissions") ? handleAdd : undefined}
        onEdit={hasPermission("edit-permissions") ? handleEdit : undefined}
        onDelete={hasPermission("delete-permissions") ? handleDelete : undefined}
        searchable={true}
        filterable={true}
        exportable={true}
        addButtonLabel="Add Permission"
        searchPlaceholder="Search permissions..."
      />

      <FormModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setSelectedPermission(null);
        }}
        title={selectedPermission ? "Edit Permission" : "Add New Permission"}
        formFields={formFields}
        initialData={selectedPermission || {}}
        onSubmit={handleSubmit}
        submitLabel={selectedPermission ? "Update Permission" : "Create Permission"}
      />

      <DeleteConfirmModal
        open={openDeleteModal}
        onClose={() => {
          setOpenDeleteModal(false);
          setSelectedPermission(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Permission"
        message="Are you sure you want to delete this permission?"
        itemName={selectedPermission?.name}
      />
    </div>
  );
}

