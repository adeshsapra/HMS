import React, { useState, useEffect } from "react";
import {
  Button,
  Typography,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Textarea,
  Select,
  Option,
  IconButton,
  Chip,
} from "@material-tailwind/react";
import {
  PhotoIcon,
  PlusIcon,
  XMarkIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  RectangleGroupIcon,
} from "@heroicons/react/24/outline";
import { apiService } from "@/services/api";
import { useToast } from "@/context/ToastContext";
import { DataTable, DeleteConfirmModal, Column, AdvancedFilter } from "@/components";

const STORAGE_URL = (import.meta as any).env?.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000';

const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return "/img/placeholder.png";
  if (imagePath.startsWith('http')) return imagePath;
  return `${STORAGE_URL}/storage/${imagePath}`;
};

interface GalleryCategory {
  id: number;
  name: string;
  status: boolean | number;
}

interface GalleryImage {
  id: number;
  title: string;
  image: string;
  description: string;
  gallery_category_id: number;
  status: boolean | number;
  category?: GalleryCategory;
  created_at?: string;
}

export default function Gallery(): JSX.Element {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  // Pagination & Filter States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage] = useState(10);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});

  // Modal States
  const [openModal, setOpenModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [manageCategoriesModalOpen, setManageCategoriesModalOpen] = useState(false);
  const [categoryFormModalOpen, setCategoryFormModalOpen] = useState(false);

  // Selected States
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<GalleryCategory | null>(null);

  // Form States
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    gallery_category_id: "",
    status: "1",
    files: [] as File[],
  });

  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    status: "1",
  });

  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchImages(currentPage, activeFilters);
  }, [currentPage, activeFilters]);

  const fetchCategories = async () => {
    try {
      const res = await apiService.getGalleryCategories();
      setCategories(res.data || []);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  const fetchImages = async (page = 1, filters = activeFilters) => {
    setLoading(true);
    try {
      const res = await apiService.getGalleries({
        page,
        keyword: filters.keyword,
        category_id: filters.category_id,
        status: filters.status,
        per_page: perPage
      });
      if (res.success) {
        setImages(res.data || []);
        setTotalPages(res.meta?.last_page || 1);
        setTotalItems(res.meta?.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch images", error);
      showToast("Failed to fetch images", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFormData(prev => ({
        ...prev,
        files: selectedImage ? [droppedFiles[0]] : [...prev.files, ...droppedFiles]
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        files: selectedImage ? newFiles : [...prev.files, ...newFiles]
      }));
    }
  };

  const handleAdd = () => {
    setSelectedImage(null);
    setFormData({
      title: "",
      description: "",
      gallery_category_id: categories.length > 0 ? categories[0].id.toString() : "",
      status: "1",
      files: [],
    });
    setOpenModal(true);
  };

  const handleEdit = (image: GalleryImage) => {
    setSelectedImage(image);
    setFormData({
      title: image.title,
      description: image.description || "",
      gallery_category_id: image.gallery_category_id.toString(),
      status: Number(image.status) === 1 ? "1" : "0",
      files: [],
    });
    setOpenModal(true);
  };

  const handleDelete = (image: GalleryImage) => {
    setSelectedImage(image);
    setOpenDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedImage) {
      try {
        await apiService.deleteGallery(selectedImage.id);
        showToast("Image deleted successfully", "success");
        fetchImages(currentPage, activeFilters);
        setOpenDeleteModal(false);
      } catch (error: any) {
        showToast(error.message || "Failed to delete image", "error");
      }
    }
  };

  const handleView = (image: GalleryImage) => {
    setSelectedImage(image);
    setOpenViewModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.gallery_category_id) {
      showToast("Please fill in required fields", "error");
      return;
    }

    if (!selectedImage && formData.files.length === 0) {
      showToast("Please select at least one image", "error");
      return;
    }

    try {
      setSaving(true);
      const fd = new FormData();
      fd.append("title", formData.title);
      fd.append("description", formData.description || "");
      fd.append("gallery_category_id", formData.gallery_category_id);
      fd.append("status", formData.status);

      if (selectedImage) {
        if (formData.files.length > 0) {
          fd.append("image", formData.files[0]);
        }
        await apiService.updateGallery(selectedImage.id, fd);
        showToast("Image updated successfully", "success");
      } else {
        formData.files.forEach((file) => {
          fd.append("images[]", file);
        });
        await apiService.createGallery(fd);
        showToast("Images uploaded successfully", "success");
      }

      setOpenModal(false);
      fetchImages(currentPage, activeFilters);
    } catch (error: any) {
      showToast(error.message || "Failed to save gallery", "error");
    } finally {
      setSaving(false);
    }
  };

  const openCategoryForm = (category: GalleryCategory | null = null) => {
    if (category) {
      setSelectedCategory(category);
      setCategoryFormData({
        name: category.name,
        status: Number(category.status) === 1 ? "1" : "0",
      });
    } else {
      setSelectedCategory(null);
      setCategoryFormData({
        name: "",
        status: "1",
      });
    }
    setCategoryFormModalOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryFormData.name) {
      showToast("Please enter category name", "error");
      return;
    }

    try {
      setSaving(true);
      if (selectedCategory) {
        await apiService.updateGalleryCategory(selectedCategory.id, {
          ...categoryFormData,
          status: categoryFormData.status === "1",
        });
        showToast("Category updated successfully", "success");
      } else {
        await apiService.createGalleryCategory({
          ...categoryFormData,
          status: categoryFormData.status === "1",
        });
        showToast("Category created successfully", "success");
      }
      setCategoryFormModalOpen(false);
      fetchCategories();
    } catch (error: any) {
      showToast(error.message || "Failed to save category", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm("Are you sure? This will delete all images in this category.")) return;
    try {
      await apiService.deleteGalleryCategory(id);
      showToast("Category deleted successfully", "success");
      fetchCategories();
      fetchImages(currentPage, activeFilters);
    } catch (error: any) {
      showToast(error.message || "Failed to delete category", "error");
    }
  };

  const columns: Column[] = [
    {
      key: "image",
      label: "Image",
      render: (val, row) => (
        <img
          src={getImageUrl(val)}
          alt={row.title}
          className="h-12 w-16 object-cover rounded shadow-sm hover:scale-150 transition-transform cursor-pointer"
          onClick={() => handleView(row as GalleryImage)}
        />
      ),
    },
    {
      key: "title",
      label: "Title",
      render: (val) => <span className="font-bold text-blue-gray-800">{val}</span>,
    },
    {
      key: "category",
      label: "Category",
      render: (_, row) => (
        <Chip
          variant="ghost"
          size="sm"
          value={(row as GalleryImage).category?.name || "Uncategorized"}
          color="blue"
          className="rounded-full"
        />
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (val) => (
        <Chip
          variant="gradient"
          color={Number(val) === 1 ? "green" : "gray"}
          value={Number(val) === 1 ? "Active" : "Inactive"}
          size="sm"
          className="rounded-full"
        />
      ),
    },
    {
      key: "created_at",
      label: "Created Date",
      render: (val) => (
        <Typography variant="small" className="text-blue-gray-500 font-normal">
          {val ? new Date(val).toLocaleDateString() : "N/A"}
        </Typography>
      ),
    },
  ];

  return (
    <div className="mt-12 mb-8">
      <div className="mb-8 flex flex-col justify-between gap-8 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="bg-blue-500 p-3 rounded-xl shadow-lg shadow-blue-200">
            <PhotoIcon className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-4xl font-bold text-blue-gray-800">Gallery</h2>
            <p className="text-blue-gray-600 font-medium tracking-tight">Manage your hospital photo gallery and image categories with ease.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <Button
            variant="outlined"
            size="md"
            className="flex items-center gap-2 border-blue-gray-200 hover:bg-blue-gray-50 transition-all font-bold text-blue-gray-800"
            onClick={() => setManageCategoriesModalOpen(true)}
          >
            <RectangleGroupIcon className="h-5 w-5" /> Manage Categories
          </Button>
          <Button
            size="md"
            className="flex items-center gap-2 bg-blue-500 shadow-md shadow-blue-200 hover:shadow-lg transition-all font-bold"
            onClick={handleAdd}
          >
            <PlusIcon className="h-5 w-5" /> Upload Image
          </Button>
        </div>
      </div>

      <AdvancedFilter
        config={{
          fields: [
            {
              name: 'keyword',
              label: 'Search Gallery',
              type: 'text',
              placeholder: 'Search by title or description...'
            },
            {
              name: 'category_id',
              label: 'Filter by Category',
              type: 'select',
              options: [
                { label: 'All Categories', value: '' },
                ...categories.map(cat => ({
                  label: cat.name,
                  value: cat.id
                }))
              ]
            },
            {
              name: 'status',
              label: 'Filter by Status',
              type: 'select',
              options: [
                { label: 'All Status', value: '' },
                { label: 'Active', value: '1' },
                { label: 'Inactive', value: '0' }
              ]
            }
          ],
          onApplyFilters: (filters) => {
            setActiveFilters(filters);
            setCurrentPage(1);
          },
          onResetFilters: () => {
            setActiveFilters({});
            setCurrentPage(1);
          },
          initialValues: activeFilters
        }}
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <DataTable
          title="Hospital Gallery Content"
          data={images}
          columns={columns}
          onEdit={(row) => handleEdit(row as GalleryImage)}
          onDelete={(row) => handleDelete(row as GalleryImage)}
          onView={(row) => handleView(row as GalleryImage)}
          searchable={false}
          pagination={{
            currentPage: currentPage,
            totalPages: totalPages,
            onPageChange: (page) => setCurrentPage(page),
            perPage: perPage,
            totalItems: totalItems,
          }}
        />
      )}

      {/* Upload/Edit Image Modal */}
      <Dialog open={openModal} handler={() => setOpenModal(false)} size="md">
        <DialogHeader className="bg-blue-500 text-white">
          <div className="flex items-center gap-2">
            <PhotoIcon className="h-6 w-6" />
            <Typography variant="h5" color="white">
              {selectedImage ? "Edit Gallery Image" : "Upload New Image(s)"}
            </Typography>
          </div>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-5 overflow-y-auto max-h-[70vh] p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Image Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              crossOrigin={undefined}
              containerProps={{ className: "min-w-0" }}
            />
            <Select
              label="Select Category"
              value={formData.gallery_category_id}
              onChange={(val) => setFormData({ ...formData, gallery_category_id: val as string })}
            >
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </div>

          <Textarea
            label="Image Description (Optional)"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <Select
            label="Visibility Status"
            value={formData.status}
            onChange={(val) => setFormData({ ...formData, status: val as string })}
          >
            <Option value="1">Active (Visible in Gallery)</Option>
            <Option value="0">Inactive (Hidden)</Option>
          </Select>

          <div
            className={`mt-2 border-2 border-dashed rounded-2xl p-10 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer ${isDragging
              ? "border-blue-500 bg-blue-50/50 scale-[1.01]"
              : "border-blue-gray-100 bg-blue-gray-50/20 hover:bg-blue-gray-50/40 hover:border-blue-gray-300"
              }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('gallery-upload-input')?.click()}
          >
            <input
              id="gallery-upload-input"
              type="file"
              multiple={!selectedImage}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="text-center group">
              <div className={`mx-auto h-16 w-16 rounded-full mb-4 flex items-center justify-center transition-all ${isDragging ? "bg-blue-500 text-white shadow-lg shadow-blue-100" : "bg-blue-gray-50 text-blue-gray-300 group-hover:bg-blue-500 group-hover:text-white"
                }`}>
                {isDragging ? <PlusIcon className="h-8 w-8 animate-bounce" /> : <PhotoIcon className="h-8 w-8" />}
              </div>
              <Typography variant="h6" color="blue-gray" className="mb_1 font-bold">
                {isDragging ? "Release to drop images" : (selectedImage ? "Click or drag to replace current image" : "Click or drag images to start upload")}
              </Typography>
              <Typography variant="small" color="gray" className="text-xs font-normal mt-1">
                Accepted formats: PNG, JPG, JPEG, WEBP (Max 2MB per file)
              </Typography>
            </div>

            {formData.files.length > 0 && (
              <div className="mt-8 w-full border-t border-blue-gray-100/50 pt-6">
                <div className="flex flex-wrap gap-3 justify-center">
                  {formData.files.map((file, idx) => (
                    <div key={idx} className="relative group/item shadow-sm hover:shadow-md transition-shadow">
                      <div className="h-20 w-20 rounded-xl overflow-hidden border border-blue-gray-100 bg-white p-1">
                        <img
                          src={URL.createObjectURL(file)}
                          alt="preview"
                          className="h-full w-full object-cover rounded-lg"
                        />
                      </div>
                      <IconButton
                        size="sm"
                        color="red"
                        variant="gradient"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover/item:opacity-100 transition-opacity ring-2 ring-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData({ ...formData, files: formData.files.filter((_, i) => i !== idx) });
                        }}
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </IconButton>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-center">
                  <Chip
                    value={`${formData.files.length} file${formData.files.length > 1 ? 's' : ''} selected`}
                    color="blue"
                    variant="gradient"
                    size="sm"
                    className="rounded-full px-4"
                  />
                </div>
              </div>
            )}
          </div>
        </DialogBody>
        <DialogFooter className="gap-3 border-t border-blue-gray-50 p-6">
          <Button variant="text" color="red" onClick={() => setOpenModal(false)} className="font-bold" disabled={saving}>Cancel</Button>
          <Button variant="gradient" color="blue" onClick={handleSubmit} className="font-bold flex items-center gap-2" disabled={saving}>
            {saving ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              selectedImage ? <PlusIcon className="h-4 w-4" /> : <PhotoIcon className="h-4 w-4" />
            )}
            {saving ? "Processing..." : (selectedImage ? "Update Image" : `Upload ${formData.files.length > 1 ? 'Images' : 'Image'}`)}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Same Manage Categories Modal */}
      <Dialog open={manageCategoriesModalOpen} handler={() => setManageCategoriesModalOpen(false)} size="lg">
        <DialogHeader className="justify-between border-b border-blue-gray-50">
          <div className="flex items-center gap-2">
            <RectangleGroupIcon className="h-6 w-6 text-blue-500" />
            <Typography variant="h5" color="blue-gray">Manage Gallery Categories</Typography>
            <Chip value={`${categories.length}`} size="sm" variant="ghost" color="blue" className="rounded-full" />
          </div>
          <div className="flex gap-2">
            <Button size="sm" color="blue" className="flex items-center gap-2 shadow-sm" onClick={() => openCategoryForm()}>
              <PlusIcon className="h-4 w-4" /> Add New Category
            </Button>
            <IconButton variant="text" onClick={() => setManageCategoriesModalOpen(false)}>
              <XMarkIcon className="h-5 w-5" />
            </IconButton>
          </div>
        </DialogHeader>
        <DialogBody className="h-[50vh] overflow-y-auto p-0">
          <table className="w-full min-w-max table-auto text-left">
            <thead>
              <tr className="bg-blue-gray-50/50 sticky top-0 z-10">
                <th className="p-4 border-b border-blue-gray-50 text-[11px] uppercase text-blue-gray-400 font-bold">Category Name</th>
                <th className="p-4 border-b border-blue-gray-50 text-[11px] uppercase text-blue-gray-400 font-bold">Status</th>
                <th className="p-4 border-b border-blue-gray-50 text-[11px] uppercase text-blue-gray-400 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-gray-500 italic">No categories found. Click "Add Category" to create one.</td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-blue-gray-50/50 border-b border-blue-gray-50 transition-colors">
                    <td className="p-4 font-bold text-blue-gray-800">{cat.name}</td>
                    <td className="p-4">
                      <Chip
                        value={Number(cat.status) === 1 ? "Active" : "Inactive"}
                        color={Number(cat.status) === 1 ? "green" : "blue-gray"}
                        size="sm"
                        variant="ghost"
                        className="rounded-full w-max uppercase"
                      />
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1">
                        <IconButton size="sm" variant="text" color="blue" onClick={() => openCategoryForm(cat)}>
                          <PencilIcon className="h-4 w-4" />
                        </IconButton>
                        <IconButton size="sm" variant="text" color="red" onClick={() => handleDeleteCategory(cat.id)}>
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

      {/* Category Form Modal */}
      <Dialog open={categoryFormModalOpen} handler={() => setCategoryFormModalOpen(false)} size="xs">
        <DialogHeader className="bg-blue-gray-800 text-white">
          <Typography variant="h5" color="white">
            {selectedCategory ? "Edit Category" : "Add New Category"}
          </Typography>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-4 p-8">
          <Input
            label="Category Name"
            value={categoryFormData.name}
            onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
            crossOrigin={undefined}
          />
          <Select
            label="Category Status"
            value={categoryFormData.status}
            onChange={(val) => setCategoryFormData({ ...categoryFormData, status: val as string })}
          >
            <Option value="1">Active</Option>
            <Option value="0">Inactive</Option>
          </Select>
        </DialogBody>
        <DialogFooter className="gap-2 border-t border-blue-gray-50 p-6">
          <Button variant="text" color="red" onClick={() => setCategoryFormModalOpen(false)} className="font-bold" disabled={saving}>Cancel</Button>
          <Button variant="gradient" color="blue" onClick={handleSaveCategory} className="font-bold" disabled={saving}>
            {saving ? "Saving..." : "Save Category"}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Same View Modal */}
      <Dialog open={openViewModal} handler={() => setOpenViewModal(false)} size="lg">
        <DialogHeader className="justify-between border-b border-blue-gray-50 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-lg">
              <PhotoIcon className="h-6 w-6 text-blue-500" />
            </div>
            <Typography variant="h5" color="blue-gray" className="font-bold">{selectedImage?.title}</Typography>
          </div>
          <IconButton variant="text" color="blue-gray" onClick={() => setOpenViewModal(false)}>
            <XMarkIcon className="h-5 w-5" strokeWidth={2.5} />
          </IconButton>
        </DialogHeader>
        <DialogBody className="p-8 overflow-y-auto max-h-[75vh]">
          {selectedImage && (
            <div className="flex flex-col gap-6">
              <div className="w-full overflow-hidden rounded-2xl bg-blue-gray-50 flex items-center justify-center border border-blue-gray-100 shadow-inner">
                <img
                  src={getImageUrl(selectedImage.image)}
                  alt={selectedImage.title}
                  className="max-w-full max-h-[55vh] object-contain shadow-2xl"
                />
              </div>
              <div className="flex flex-wrap justify-between items-center gap-4 border-b border-blue-gray-50 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-blue-gray-400 tracking-wider">Category</span>
                    <Chip color="blue" variant="ghost" value={selectedImage.category?.name || "Uncategorized"} className="rounded-full mt-1 font-bold" />
                  </div>
                  <div className="h-8 w-[1px] bg-blue-gray-50 mx-2"></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-blue-gray-400 tracking-wider">Status</span>
                    <Chip
                      color={Number(selectedImage.status) === 1 ? "green" : "gray"}
                      value={Number(selectedImage.status) === 1 ? "Active" : "Inactive"}
                      className="rounded-full mt-1 font-bold"
                    />
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] uppercase font-bold text-blue-gray-400 tracking-wider">Upload Date</span>
                  <Typography variant="small" color="blue-gray" className="font-bold mt-1">
                    {selectedImage.created_at ? new Date(selectedImage.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                  </Typography>
                </div>
              </div>
              <div className="bg-blue-gray-50/40 p-6 rounded-2xl border border-blue-gray-100/50">
                <Typography variant="small" color="blue-gray" className="font-bold uppercase text-[11px] tracking-widest mb-2 text-blue-gray-400">Image Description</Typography>
                <Typography color="blue-gray" className="text-base leading-relaxed font-medium">
                  {selectedImage.description || "No description provided for this gallery item."}
                </Typography>
              </div>
            </div>
          )}
        </DialogBody>
        <DialogFooter className="border-t border-blue-gray-50 p-6">
          <Button variant="gradient" color="blue" onClick={() => setOpenViewModal(false)} className="px-8 font-bold">Close Preview</Button>
        </DialogFooter>
      </Dialog>

      <DeleteConfirmModal
        open={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Gallery Image"
        message="Are you sure you want to permanently delete this image from the hospital gallery? This action will remove the record and its physical file from the server."
        itemName={selectedImage?.title}
      />
    </div>
  );
}
