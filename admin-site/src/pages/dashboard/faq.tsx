import React, { useState, useEffect, useMemo } from "react";
import { DataTable, FormModal, ViewModal, DeleteConfirmModal, Column, FormField, ViewField } from "@/components";
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  IconButton,
  Typography,
  Chip,
  Input
} from "@material-tailwind/react";
import {
  QuestionMarkCircleIcon,
  TagIcon,
  PlusIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon
} from "@heroicons/react/24/outline";
import { apiService } from "@/services/api";
import { useToast } from "@/context/ToastContext";

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category_id: number;
  category?: {
    id: number;
    name: string;
  };
  status: string;
}

interface FAQCategory {
  id: number;
  name: string;
}

export default function FAQ(): JSX.Element {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // FAQ Modals
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openViewModal, setOpenViewModal] = useState<boolean>(false);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [selectedFaq, setSelectedFaq] = useState<FAQ | null>(null);

  // Category Management Modals (Following Laboratory Pattern)
  const [manageCategoriesModalOpen, setManageCategoriesModalOpen] = useState(false);
  const [categoryFormModalOpen, setCategoryFormModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<FAQCategory | null>(null);
  const [categoryName, setCategoryName] = useState("");

  const { showToast } = useToast();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [openCategoryDeleteModal, setOpenCategoryDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<FAQCategory | null>(null);

  const fetchFaqs = async (page = 1, search = "") => {
    setLoading(true);
    try {
      const response = await apiService.getFaqs({ page, search });
      if (response.status) {
        setFaqs(response.data);
        setTotalPages(response.meta.last_page);
      }
    } catch (error: any) {
      showToast(error.message || "Failed to fetch FAQs", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiService.getFaqCategories();
      if (response.status) {
        setCategories(response.data);
      }
    } catch (error: any) {
      showToast(error.message || "Failed to fetch categories", "error");
    }
  };

  useEffect(() => {
    fetchFaqs(currentPage, searchTerm);
    fetchCategories();
  }, [currentPage, searchTerm]);

  const columns: Column[] = [
    {
      key: "question",
      label: "Question",
      render: (value: any) => (
        <span className="font-bold text-blue-gray-800">{value}</span>
      ),
    },
    {
      key: "answer",
      label: "Answer",
      render: (value: any) => (
        <div className="max-w-md text-sm text-blue-gray-600 truncate">
          {value}
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (_, row) => <span>{(row as FAQ).category?.name || "N/A"}</span>
    },
    { key: "status", label: "Status", type: "status" },
  ];

  const viewFields: ViewField[] = [
    { key: "question", label: "Question", fullWidth: true },
    { key: "answer", label: "Answer", fullWidth: true },
    {
      key: "category",
      label: "Category",
      render: (_, row) => <span>{(row as FAQ).category?.name || "N/A"}</span>
    },
    { key: "status", label: "Status", type: "status" },
  ];

  const formFields: FormField[] = useMemo(() => [
    {
      name: "question",
      label: "Question",
      type: "text",
      required: true,
      placeholder: "Enter question",
      fullWidth: true,
    },
    {
      name: "answer",
      label: "Answer",
      type: "textarea",
      required: true,
      placeholder: "Enter answer...",
      fullWidth: true,
    },
    {
      name: "category_id",
      label: "Category",
      type: "select",
      required: true,
      options: categories.map(cat => ({ value: cat.id.toString(), label: cat.name })),
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
    },
  ], [categories]);

  const handleAdd = (): void => {
    setSelectedFaq(null);
    setOpenModal(true);
  };

  const handleEdit = (faq: FAQ): void => {
    setSelectedFaq(faq);
    setOpenModal(true);
  };

  const handleDelete = (faq: FAQ): void => {
    setSelectedFaq(faq);
    setOpenDeleteModal(true);
  };

  const confirmDelete = async (): Promise<void> => {
    if (selectedFaq) {
      try {
        const response = await apiService.deleteFaq(selectedFaq.id);
        if (response.status) {
          showToast("FAQ deleted successfully", "success");
          fetchFaqs(currentPage, searchTerm);
          setOpenDeleteModal(false);
          setSelectedFaq(null);
        }
      } catch (error: any) {
        showToast(error.message || "Failed to delete FAQ", "error");
      }
    }
  };

  const handleView = (faq: FAQ): void => {
    setSelectedFaq(faq);
    setOpenViewModal(true);
  };

  const handleSubmit = async (data: Record<string, any>): Promise<void> => {
    try {
      let response;
      if (selectedFaq) {
        response = await apiService.updateFaq(selectedFaq.id, data as any);
      } else {
        response = await apiService.createFaq(data as any);
      }

      if (response.status) {
        showToast(selectedFaq ? "FAQ updated successfully" : "FAQ created successfully", "success");
        fetchFaqs(currentPage, searchTerm);
        setOpenModal(false);
        setSelectedFaq(null);
      }
    } catch (error: any) {
      showToast(error.message || "Failed to save FAQ", "error");
    }
  };

  // Category Management CRUD
  const openCategoryForm = (category: FAQCategory | null = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryName(category.name);
    } else {
      setEditingCategory(null);
      setCategoryName("");
    }
    setCategoryFormModalOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryName.trim()) {
      showToast("Category name is required", "error");
      return;
    }

    try {
      let response;
      if (editingCategory) {
        response = await apiService.updateFaqCategory(editingCategory.id, { name: categoryName });
      } else {
        response = await apiService.createFaqCategory({ name: categoryName });
      }

      if (response.status) {
        showToast(editingCategory ? "Category updated successfully" : "Category created successfully", "success");
        fetchCategories();
        setCategoryFormModalOpen(false);
      }
    } catch (error: any) {
      showToast(error.message || "Failed to save category", "error");
    }
  };

  const handleDeleteCategory = (category: FAQCategory) => {
    setSelectedCategory(category);
    setOpenCategoryDeleteModal(true);
  };

  const confirmDeleteCategory = async () => {
    if (selectedCategory) {
      try {
        const response = await apiService.deleteFaqCategory(selectedCategory.id);
        if (response.status) {
          showToast("Category deleted successfully", "success");
          fetchCategories();
          fetchFaqs(currentPage, searchTerm);
          setOpenCategoryDeleteModal(false);
          setSelectedCategory(null);
        }
      } catch (error: any) {
        showToast(error.message || "Failed to delete category", "error");
      }
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  return (
    <div className="mt-12 mb-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold text-blue-gray-800 mb-2">FAQ</h2>
          <p className="text-blue-gray-600 text-base">Manage frequently asked questions</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outlined"
            color="blue"
            className="flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
            onClick={() => setManageCategoriesModalOpen(true)}
          >
            <TagIcon className="h-5 w-5" />
            Manage Categories
          </Button>
          <Button
            variant="gradient"
            color="blue"
            className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
            onClick={handleAdd}
          >
            <PlusIcon className="h-5 w-5" />
            Add FAQ
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <DataTable
          title="FAQ Management"
          data={faqs}
          columns={columns}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          searchable={true}
          filterable={true}
          exportable={true}
          addButtonLabel="Add FAQ"
          searchPlaceholder="Search FAQs..."
          pagination={{
            currentPage: currentPage,
            totalPages: totalPages,
            onPageChange: (page) => setCurrentPage(page),
            perPage: 10,
            totalItems: totalPages * 10
          }}
        />
      )}

      <FormModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setSelectedFaq(null);
        }}
        title={selectedFaq ? "Edit FAQ" : "Add New FAQ"}
        formFields={formFields}
        initialData={selectedFaq ? { ...selectedFaq, category_id: selectedFaq.category_id?.toString() } : {}}
        onSubmit={handleSubmit}
        submitLabel={selectedFaq ? "Update FAQ" : "Add FAQ"}
      />
      {/* Manage Categories Modal (Nested Pattern) */}
      <Dialog open={manageCategoriesModalOpen} handler={() => setManageCategoriesModalOpen(false)} size="lg">
        <DialogHeader className="justify-between">
          <div className="flex items-center gap-2">
            <Typography variant="h5" color="blue-gray">Manage FAQ Categories</Typography>
            <Chip value={`${categories.length} Categories`} size="sm" variant="ghost" className="rounded-full" />
          </div>
          <div className="flex gap-2">
            <Button size="sm" color="blue" className="flex items-center gap-2" onClick={() => openCategoryForm()}>
              <PlusIcon className="h-4 w-4" /> Add Category
            </Button>
            <IconButton variant="text" onClick={() => setManageCategoriesModalOpen(false)}>
              <XMarkIcon className="h-5 w-5" />
            </IconButton>
          </div>
        </DialogHeader>
        <DialogBody className="h-[60vh] overflow-y-auto p-0">
          <table className="w-full min-w-max table-auto text-left">
            <thead>
              <tr className="bg-blue-gray-50/50 sticky top-0 z-10">
                <th className="p-4 border-b border-blue-gray-50">Category Name</th>
                <th className="p-4 border-b border-blue-gray-50 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={2} className="p-8 text-center text-gray-500">No categories found.</td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50 border-b border-blue-gray-50">
                    <td className="p-4">
                      <div className="font-bold text-blue-gray-800">{cat.name}</div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <IconButton size="sm" variant="text" color="blue" onClick={() => openCategoryForm(cat)}>
                          <PencilIcon className="h-4 w-4" />
                        </IconButton>
                        <IconButton size="sm" variant="text" color="red" onClick={() => handleDeleteCategory(cat)}>
                          <TrashIcon className="h-4 w-4" />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </DialogBody>
      </Dialog>

      {/* Add/Edit Category Form Modal */}
      <Dialog open={categoryFormModalOpen} handler={() => setCategoryFormModalOpen(false)} size="xs">
        <DialogHeader>{editingCategory ? 'Edit FAQ Category' : 'Add New Category'}</DialogHeader>
        <DialogBody className="flex flex-col gap-4">
          <Input
            label="Category Name"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            crossOrigin={undefined}
          />
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="red" onClick={() => setCategoryFormModalOpen(false)} className="mr-1">Cancel</Button>
          <Button variant="gradient" color="blue" onClick={handleSaveCategory}>Save Category</Button>
        </DialogFooter>
      </Dialog>

      <ViewModal
        open={openViewModal}
        onClose={() => {
          setOpenViewModal(false);
          setSelectedFaq(null);
        }}
        title="FAQ Details"
        data={selectedFaq || {}}
        fields={viewFields}
      />

      <DeleteConfirmModal
        open={openDeleteModal}
        onClose={() => {
          setOpenDeleteModal(false);
          setSelectedFaq(null);
        }}
        onConfirm={confirmDelete}
        title="Delete FAQ"
        message="Are you sure you want to delete this FAQ?"
        itemName={selectedFaq?.question}
      />

      <DeleteConfirmModal
        open={openCategoryDeleteModal}
        onClose={() => {
          setOpenCategoryDeleteModal(false);
          setSelectedCategory(null);
        }}
        onConfirm={confirmDeleteCategory}
        title="Delete Category"
        message="Are you sure you want to delete this category? FAQs assigned to this category might be affected."
        itemName={selectedCategory?.name}
      />
    </div>
  );
}

