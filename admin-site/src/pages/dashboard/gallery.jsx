import { useState } from "react";
import { Card, CardBody, CardHeader, Button, Typography, Dialog, DialogHeader, DialogBody, DialogFooter, Input, Select, Option } from "@material-tailwind/react";
import { PhotoIcon, PlusIcon, XMarkIcon, TrashIcon, PencilIcon, EyeIcon } from "@heroicons/react/24/outline";
import { FormModal, DeleteConfirmModal } from "@/components";

export default function Gallery() {
  const [images, setImages] = useState([
    { id: 1, url: "/assets/img/gallery/gallery-1.webp", category: "Facilities", title: "Main Entrance" },
    { id: 2, url: "/assets/img/gallery/gallery-2.webp", category: "Facilities", title: "Reception Area" },
    { id: 3, url: "/assets/img/gallery/gallery-3.webp", category: "Facilities", title: "Waiting Room" },
    { id: 4, url: "/assets/img/gallery/gallery-4.webp", category: "Equipment", title: "MRI Machine" },
    { id: 5, url: "/assets/img/gallery/gallery-5.webp", category: "Equipment", title: "Operating Room" },
    { id: 6, url: "/assets/img/gallery/gallery-6.webp", category: "Facilities", title: "Patient Room" },
  ]);
  const [openModal, setOpenModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const formFields = [
    {
      name: "title",
      label: "Image Title",
      type: "text",
      required: true,
      placeholder: "Enter image title",
    },
    {
      name: "category",
      label: "Category",
      type: "select",
      required: true,
      options: [
        { value: "Facilities", label: "Facilities" },
        { value: "Equipment", label: "Equipment" },
        { value: "Staff", label: "Staff" },
        { value: "Events", label: "Events" },
      ],
    },
    {
      name: "url",
      label: "Image URL",
      type: "text",
      required: true,
      placeholder: "Enter image URL",
      fullWidth: true,
    },
  ];

  const handleAdd = () => {
    setSelectedImage(null);
    setOpenModal(true);
  };

  const handleEdit = (image) => {
    setSelectedImage(image);
    setOpenModal(true);
  };

  const handleDelete = (image) => {
    setSelectedImage(image);
    setOpenDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedImage) {
      setImages(images.filter((img) => img.id !== selectedImage.id));
      setOpenDeleteModal(false);
      setSelectedImage(null);
    }
  };

  const handleView = (image) => {
    setSelectedImage(image);
    setOpenViewModal(true);
  };

  const handleSubmit = (data) => {
    if (selectedImage) {
      setImages(
        images.map((img) =>
          img.id === selectedImage.id ? { ...img, ...data } : img
        )
      );
    } else {
      const newImage = {
        id: images.length + 1,
        ...data,
      };
      setImages([...images, newImage]);
    }
    setOpenModal(false);
    setSelectedImage(null);
  };

  return (
    <div className="mt-12 mb-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold text-blue-gray-800 mb-2">Gallery</h2>
          <p className="text-blue-gray-600 text-base">Manage hospital gallery images</p>
        </div>
        <Button
          variant="gradient"
          color="blue"
          className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
          onClick={handleAdd}
        >
          <PlusIcon className="h-5 w-5" />
          Upload Image
        </Button>
      </div>

      <Card className="border border-blue-gray-100 shadow-lg">
        <CardHeader
          variant="gradient"
          color="blue"
          className="p-6"
        >
          <Typography variant="h6" color="white" className="font-bold">
            Gallery Management
          </Typography>
        </CardHeader>
        <CardBody className="p-6">
          {images.length === 0 ? (
            <div className="text-center py-16">
              <PhotoIcon className="h-20 w-20 mx-auto text-blue-gray-300 mb-4" />
              <Typography variant="h6" color="blue-gray" className="mb-2 font-bold">
                No Images
              </Typography>
              <Typography variant="small" color="blue-gray" className="mb-6 text-base">
                Upload images to get started
              </Typography>
              <Button
                variant="gradient"
                color="blue"
                onClick={handleAdd}
                className="shadow-lg hover:shadow-xl transition-all"
              >
                Upload First Image
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="relative group bg-white rounded-lg border border-blue-gray-100 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <div className="aspect-video overflow-hidden bg-blue-gray-50">
                    <img
                      src={image.url}
                      alt={image.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-4">
                    <Typography variant="h6" color="blue-gray" className="mb-1 font-bold text-base">
                      {image.title}
                    </Typography>
                    <Typography variant="small" className="text-blue-gray-500 mb-4 font-medium">
                      {image.category}
                    </Typography>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="text"
                        size="sm"
                        color="blue"
                        onClick={() => handleView(image)}
                        className="flex items-center gap-1 font-semibold"
                      >
                        <EyeIcon className="h-4 w-4" />
                        View
                      </Button>
                      <Button
                        variant="text"
                        size="sm"
                        color="blue-gray"
                        onClick={() => handleEdit(image)}
                        className="flex items-center gap-1 font-semibold"
                      >
                        <PencilIcon className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="text"
                        size="sm"
                        color="red"
                        onClick={() => handleDelete(image)}
                        className="flex items-center gap-1 font-semibold"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <FormModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setSelectedImage(null);
        }}
        title={selectedImage ? "Edit Image" : "Add New Image"}
        formFields={formFields}
        initialData={selectedImage || {}}
        onSubmit={handleSubmit}
        submitLabel={selectedImage ? "Update Image" : "Add Image"}
      />

      <Dialog open={openViewModal} handler={() => setOpenViewModal(false)} size="lg" className="!max-w-4xl">
        <DialogHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-5 px-6 rounded-t-lg shadow-lg">
          <div className="flex items-center justify-between w-full">
            <Typography variant="h5" className="font-bold text-white text-xl">
              {selectedImage?.title}
            </Typography>
            <Button
              variant="text"
              color="white"
              onClick={() => setOpenViewModal(false)}
              className="rounded-full hover:bg-white/20 p-2 transition-all"
            >
              <XMarkIcon className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>
        <DialogBody className="pt-6 px-6 bg-gradient-to-br from-blue-gray-50/50 to-white">
          {selectedImage && (
            <div>
              <div className="mb-6">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.title}
                  className="w-full h-auto rounded-lg shadow-xl border-2 border-blue-gray-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Typography variant="small" color="blue-gray" className="mb-2 font-semibold uppercase text-xs tracking-wider">
                    Title
                  </Typography>
                  <Typography variant="paragraph" color="blue-gray" className="font-semibold text-base">
                    {selectedImage.title}
                  </Typography>
                </div>
                <div>
                  <Typography variant="small" color="blue-gray" className="mb-2 font-semibold uppercase text-xs tracking-wider">
                    Category
                  </Typography>
                  <Typography variant="paragraph" color="blue-gray" className="font-semibold text-base">
                    {selectedImage.category}
                  </Typography>
                </div>
              </div>
            </div>
          )}
        </DialogBody>
        <DialogFooter className="bg-white border-t-2 border-blue-gray-200 px-6 py-5 flex items-center justify-between shadow-lg">
          <Button
            variant="text"
            color="blue-gray"
            onClick={() => setOpenViewModal(false)}
            className="px-8 py-3 font-bold text-sm uppercase tracking-wide hover:bg-blue-gray-50 transition-all"
          >
            Close
          </Button>
          <Button
            variant="gradient"
            color="blue"
            onClick={() => setOpenViewModal(false)}
            className="px-10 py-3 font-bold text-sm uppercase tracking-wide shadow-lg hover:shadow-xl transition-all duration-200"
          >
            OK
          </Button>
        </DialogFooter>
      </Dialog>

      <DeleteConfirmModal
        open={openDeleteModal}
        onClose={() => {
          setOpenDeleteModal(false);
          setSelectedImage(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Image"
        message="Are you sure you want to delete this image?"
        itemName={selectedImage?.title}
      />
    </div>
  );
}
