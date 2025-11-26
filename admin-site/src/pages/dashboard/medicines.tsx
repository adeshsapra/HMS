import React, { useState } from "react";
import { DataTable, ViewModal, Column, ViewField } from "@/components";
import { inventoryData, InventoryItem } from "@/data/hms-data";
import { Button } from "@material-tailwind/react";
import { BeakerIcon } from "@heroicons/react/24/outline";

export default function Medicines(): JSX.Element {
    const [medicines] = useState<InventoryItem[]>(inventoryData.filter(i => i.category === "Medications"));
    const [openViewModal, setOpenViewModal] = useState<boolean>(false);
    const [selectedMedicine, setSelectedMedicine] = useState<InventoryItem | null>(null);

    const columns: Column[] = [
        {
            key: "itemName",
            label: "Medicine Name",
            render: (value: any) => (
                <span className="font-bold text-blue-gray-800">{value}</span>
            ),
        },
        {
            key: "quantity",
            label: "Quantity",
            render: (value: any, row: InventoryItem) => (
                <span className="font-medium text-blue-gray-700">{value} {row.unit}</span>
            ),
        },
        {
            key: "supplier",
            label: "Supplier",
        },
        {
            key: "lastRestocked",
            label: "Last Restocked",
            render: (value: any) => (
                <span className="text-sm font-medium text-blue-gray-700">
                    {new Date(value).toLocaleDateString()}
                </span>
            ),
        },
        { key: "status", label: "Status", type: "status" },
    ];

    const viewFields: ViewField[] = [
        { key: "itemName", label: "Medicine Name" },
        { key: "category", label: "Category" },
        { key: "quantity", label: "Quantity" },
        { key: "unit", label: "Unit" },
        { key: "supplier", label: "Supplier" },
        { key: "lastRestocked", label: "Last Restocked", type: "date" },
        { key: "status", label: "Status", type: "status" },
    ];

    const handleView = (medicine: InventoryItem): void => {
        setSelectedMedicine(medicine);
        setOpenViewModal(true);
    };

    return (
        <div className="mt-12 mb-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-bold text-blue-gray-800 mb-2">Medicines</h2>
                    <p className="text-blue-gray-600 text-base">View pharmacy inventory and medicines</p>
                </div>
            </div>

            <DataTable
                title="Medicines List"
                data={medicines}
                columns={columns}
                onView={handleView}
                searchable={true}
                filterable={true}
                exportable={true}
                searchPlaceholder="Search medicines..."
            />

            <ViewModal
                open={openViewModal}
                onClose={() => {
                    setOpenViewModal(false);
                    setSelectedMedicine(null);
                }}
                title="Medicine Details"
                data={selectedMedicine || {}}
                fields={viewFields}
            />
        </div>
    );
}
