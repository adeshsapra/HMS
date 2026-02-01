import React, { useState, useEffect } from "react";
import { DataTable, FormModal, DeleteConfirmModal, Column, FormField, AdvancedFilter } from "@/components";
import { Button, Typography, Chip } from "@material-tailwind/react";
import { KeyIcon, PlusIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
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
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [modules, setModules] = useState<string[]>([]);

  useEffect(() => {
    loadPermissions(1, filters);
  }, []);

  const loadPermissions = async (page: number = currentPage, currentFilters = filters) => {
    try {
      setLoading(true);
      const response = await apiService.getPermissions({
        page,
        module: currentFilters.module,
        keyword: currentFilters.keyword
      });
      if (response.status && response.permissions) {
        setPermissions(response.permissions);
        setTotalPages(response.last_page || 1);
        setCurrentPage(response.current_page || 1);

        // Also fetch modules if not already fetched (for filter dropdown)
        if (modules.length === 0) {
          const allRes = await apiService.getPermissions({ per_page: 500 });
          const uniqueModules = Array.from(
            new Set(allRes.permissions.map((p: Permission) => p.module).filter(Boolean))
          ) as string[];
          setModules(uniqueModules.sort());
        }
      }
    } catch (error) {
      console.error("Failed to load permissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadPermissions(page, filters);
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
      placeholder: "Select Module",
      options: [
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
          await loadPermissions(currentPage, filters);
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
      await loadPermissions(currentPage, filters);
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
        data={permissions}
        columns={columns}
        onAdd={hasPermission("create-permissions") ? handleAdd : undefined}
        onEdit={hasPermission("edit-permissions") ? handleEdit : undefined}
        onDelete={hasPermission("delete-permissions") ? handleDelete : undefined}
        searchable={false}
        exportable={true}
        addButtonLabel="Add Permission"
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
                  label: 'Search Permissions',
                  type: 'text',
                  placeholder: 'Search name, slug, or module...'
                },
                {
                  name: 'module',
                  label: 'Module',
                  type: 'select',
                  options: [
                    { label: 'All Modules', value: 'all' },
                    ...modules.map(m => ({ label: m, value: m }))
                  ]
                }
              ],
              onApplyFilters: (f) => {
                setFilters(f);
                setCurrentPage(1);
                loadPermissions(1, f);
              },
              onResetFilters: () => {
                setFilters({});
                setCurrentPage(1);
                loadPermissions(1, {});
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
