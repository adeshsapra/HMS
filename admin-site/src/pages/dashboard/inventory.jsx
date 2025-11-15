import { useState } from "react";
import { DataTable, FormModal, ViewModal, DeleteConfirmModal } from "@/components";
import { inventoryData } from "@/data/hms-data";
import { Button } from "@material-tailwind/react";
import { CubeIcon } from "@heroicons/react/24/outline";

export default function Inventory() {
  const [inventory, setInventory] = useState(inventoryData);
  const [openModal, setOpenModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const columns = [
    { 
      key: "itemName", 
      label: "Item Name",
      render: (value) => (
        <span className="font-bold text-blue-gray-800">{value}</span>
      ),
    },
    { key: "category", label: "Category" },
    {
      key: "quantity",
      label: "Quantity",
      render: (value, row) => (
        <span className="font-bold text-blue-gray-800">
          {value} {row.unit}
        </span>
      ),
    },
    { key: "status", label: "Status", type: "status" },
    { key: "supplier", label: "Supplier" },
    { 
      key: "lastRestocked", 
      label: "Last Restocked",
      render: (value) => (
        <span className="text-sm font-medium text-blue-gray-700">
          {new Date(value).toLocaleDateString()}
        </span>
      ),
    },
  ];

  const viewFields = [
    { key: "itemName", label: "Item Name", type: "text" },
    { key: "category", label: "Category", type: "text" },
    { key: "quantity", label: "Quantity", type: "text" },
    { key: "unit", label: "Unit", type: "text" },
    { key: "status", label: "Status", type: "status" },
    { key: "supplier", label: "Supplier", type: "text" },
    { key: "lastRestocked", label: "Last Restocked", type: "date" },
  ];

  const formFields = [
    {
      name: "itemName",
      label: "Item Name",
      type: "text",
      required: true,
      placeholder: "Enter item name",
    },
    {
      name: "category",
      label: "Category",
      type: "select",
      required: true,
      options: [
        { value: "Medical Supplies", label: "Medical Supplies" },
        { value: "Medications", label: "Medications" },
        { value: "Equipment", label: "Equipment" },
        { value: "Consumables", label: "Consumables" },
      ],
    },
    {
      name: "quantity",
      label: "Quantity",
      type: "number",
      required: true,
      min: 0,
      placeholder: "Enter quantity",
    },
    {
      name: "unit",
      label: "Unit",
      type: "select",
      required: true,
      options: [
        { value: "pieces", label: "Pieces" },
        { value: "boxes", label: "Boxes" },
        { value: "rolls", label: "Rolls" },
        { value: "bottles", label: "Bottles" },
        { value: "units", label: "Units" },
      ],
    },
    {
      name: "supplier",
      label: "Supplier",
      type: "text",
      required: true,
      placeholder: "Enter supplier name",
    },
    {
      name: "lastRestocked",
      label: "Last Restocked",
      type: "date",
      required: true,
    },
  ];

  const handleAdd = () => {
    setSelectedItem(null);
    setOpenModal(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setOpenModal(true);
  };

  const handleDelete = (item) => {
    setSelectedItem(item);
    setOpenDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      setInventory(inventory.filter((i) => i.id !== selectedItem.id));
      setOpenDeleteModal(false);
      setSelectedItem(null);
    }
  };

  const handleView = (item) => {
    setSelectedItem(item);
    setOpenViewModal(true);
  };

  const handleSubmit = (data) => {
    if (selectedItem) {
      const updatedItem = { ...selectedItem, ...data };
      if (updatedItem.quantity < 50) {
        updatedItem.status = "low_stock";
      } else if (updatedItem.quantity === 0) {
        updatedItem.status = "out_of_stock";
      } else {
        updatedItem.status = "in_stock";
      }
      setInventory(
        inventory.map((i) => (i.id === selectedItem.id ? updatedItem : i))
      );
    } else {
      const newItem = {
        id: inventory.length + 1,
        ...data,
        status: data.quantity < 50 ? "low_stock" : data.quantity === 0 ? "out_of_stock" : "in_stock",
      };
      setInventory([...inventory, newItem]);
    }
    setOpenModal(false);
    setSelectedItem(null);
  };

  return (
    <div className="mt-12 mb-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold text-blue-gray-800 mb-2">Inventory Management</h2>
          <p className="text-blue-gray-600 text-base">Manage hospital inventory, supplies, and stock levels</p>
        </div>
        <Button
          variant="gradient"
          color="blue"
          className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
          onClick={handleAdd}
        >
          <CubeIcon className="h-5 w-5" />
          Add Item
        </Button>
      </div>

      <DataTable
        title="Inventory Management"
        data={inventory}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        searchable={true}
        filterable={true}
        exportable={true}
        addButtonLabel="Add Item"
        searchPlaceholder="Search inventory..."
      />

      <FormModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setSelectedItem(null);
        }}
        title={selectedItem ? "Edit Item" : "Add New Item"}
        formFields={formFields}
        initialData={selectedItem || {}}
        onSubmit={handleSubmit}
        submitLabel={selectedItem ? "Update Item" : "Add Item"}
      />

      <ViewModal
        open={openViewModal}
        onClose={() => {
          setOpenViewModal(false);
          setSelectedItem(null);
        }}
        title="Item Details"
        data={selectedItem || {}}
        fields={viewFields}
      />

      <DeleteConfirmModal
        open={openDeleteModal}
        onClose={() => {
          setOpenDeleteModal(false);
          setSelectedItem(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Item"
        message="Are you sure you want to delete this inventory item?"
        itemName={selectedItem?.itemName}
      />
    </div>
  );
}
