import React, { useState } from "react";
import { DataTable, FormModal, ViewModal, DeleteConfirmModal, Column, FormField, ViewField } from "@/components";
import { billingData, patientsData, Bill } from "@/data/hms-data";
import { Button } from "@material-tailwind/react";
import { CurrencyDollarIcon, PrinterIcon } from "@heroicons/react/24/outline";

export default function Bills(): JSX.Element {
    const [bills, setBills] = useState<Bill[]>(billingData);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [openViewModal, setOpenViewModal] = useState<boolean>(false);
    const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
    const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

    const columns: Column[] = [
        {
            key: "invoiceNo",
            label: "Invoice No",
            render: (value: any) => (
                <span className="font-bold text-blue-gray-800">{value}</span>
            ),
        },
        {
            key: "patientName",
            label: "Patient",
            render: (value: any) => (
                <span className="font-semibold text-blue-gray-700">{value}</span>
            ),
        },
        {
            key: "date",
            label: "Date",
            render: (value: any) => (
                <span className="text-sm font-medium text-blue-gray-700">
                    {new Date(value).toLocaleDateString()}
                </span>
            ),
        },
        {
            key: "amount",
            label: "Amount",
            render: (value: any) => (
                <span className="font-bold text-green-600 text-base">
                    ${value.toFixed(2)}
                </span>
            ),
        },
        { key: "status", label: "Status", type: "status" },
        { key: "paymentMethod", label: "Payment Method" },
    ];

    const viewFields: ViewField[] = [
        { key: "invoiceNo", label: "Invoice Number" },
        { key: "patientName", label: "Patient Name" },
        { key: "date", label: "Date", type: "date" },
        { key: "amount", label: "Amount", type: "currency" },
        { key: "status", label: "Status", type: "status" },
        { key: "paymentMethod", label: "Payment Method" },
    ];

    const formFields: FormField[] = [
        {
            name: "patientName",
            label: "Patient",
            type: "select",
            required: true,
            options: patientsData.map((p) => ({ value: p.name, label: p.name })),
        },
        {
            name: "date",
            label: "Date",
            type: "date",
            required: true,
        },
        {
            name: "amount",
            label: "Amount ($)",
            type: "number",
            required: true,
            min: 0,
            placeholder: "Enter amount",
        },
        {
            name: "status",
            label: "Status",
            type: "select",
            required: true,
            options: [
                { value: "paid", label: "Paid" },
                { value: "pending", label: "Pending" },
                { value: "overdue", label: "Overdue" },
            ],
        },
        {
            name: "paymentMethod",
            label: "Payment Method",
            type: "select",
            required: true,
            options: [
                { value: "Cash", label: "Cash" },
                { value: "Credit Card", label: "Credit Card" },
                { value: "Debit Card", label: "Debit Card" },
                { value: "Insurance", label: "Insurance" },
                { value: "Online", label: "Online" },
            ],
        },
    ];

    const handleAdd = (): void => {
        setSelectedBill(null);
        setOpenModal(true);
    };

    const handleEdit = (bill: Bill): void => {
        setSelectedBill(bill);
        setOpenModal(true);
    };

    const handleDelete = (bill: Bill): void => {
        setSelectedBill(bill);
        setOpenDeleteModal(true);
    };

    const confirmDelete = (): void => {
        if (selectedBill) {
            setBills(bills.filter((b) => b.id !== selectedBill.id));
            setOpenDeleteModal(false);
            setSelectedBill(null);
        }
    };

    const handleView = (bill: Bill): void => {
        setSelectedBill(bill);
        setOpenViewModal(true);
    };

    const handlePrintInvoice = (bill: Bill): void => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const invoiceHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice - ${bill.invoiceNo}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
                    .invoice-title { font-size: 24px; font-weight: bold; }
                    .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
                    .bill-info { flex: 1; }
                    .patient-info { flex: 1; }
                    .amount-section { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
                    .status { padding: 5px 10px; border-radius: 4px; color: white; }
                    .paid { background-color: green; }
                    .pending { background-color: orange; }
                    .overdue { background-color: red; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1 class="invoice-title">HMS Hospital</h1>
                    <p>Medical Invoice</p>
                </div>

                <div class="invoice-details">
                    <div class="bill-info">
                        <h3>Invoice Details</h3>
                        <p><strong>Invoice No:</strong> ${bill.invoiceNo}</p>
                        <p><strong>Date:</strong> ${new Date(bill.date).toLocaleDateString()}</p>
                        <p><strong>Payment Method:</strong> ${bill.paymentMethod}</p>
                    </div>
                    <div class="patient-info">
                        <h3>Patient Information</h3>
                        <p><strong>Name:</strong> ${bill.patientName}</p>
                    </div>
                </div>

                <div class="amount-section">
                    <p><strong>Total Amount: $${bill.amount.toFixed(2)}</strong></p>
                    <p><span class="status ${bill.status.toLowerCase()}">${bill.status.toUpperCase()}</span></p>
                </div>

                <div style="margin-top: 50px; text-align: center; font-size: 12px; color: #666;">
                    <p>Thank you for choosing HMS Hospital</p>
                    <p>For any queries, please contact billing@hmshospital.com</p>
                </div>
            </body>
            </html>
        `;

        printWindow.document.write(invoiceHTML);
        printWindow.document.close();
        printWindow.print();
    };

    const handleSubmit = async (data: Record<string, any>): Promise<void> => {
        if (selectedBill) {
            setBills(
                bills.map((b) =>
                    b.id === selectedBill.id ? { ...b, ...data, invoiceNo: b.invoiceNo } as Bill : b
                )
            );
        } else {
            const newBill: Bill = {
                id: bills.length + 1,
                ...data,
                invoiceNo: `INV-2024-${String(bills.length + 1).padStart(3, "0")}`,
            } as Bill;
            setBills([...bills, newBill]);
        }
        setOpenModal(false);
        setSelectedBill(null);
    };

    return (
        <div className="mt-12 mb-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-bold text-blue-gray-800 mb-2">Manage Bills</h2>
                    <p className="text-blue-gray-600 text-base">Create, update, and view patient bills</p>
                </div>
                <Button
                    variant="gradient"
                    color="blue"
                    className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                    onClick={handleAdd}
                >
                    <CurrencyDollarIcon className="h-5 w-5" />
                    Create Bill
                </Button>
            </div>

            <DataTable
                title="Bills List"
                data={bills}
                columns={columns}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
                customActions={(bill: Bill) => [
                    {
                        label: "Print Invoice",
                        icon: <PrinterIcon className="h-4 w-4" />,
                        onClick: () => handlePrintInvoice(bill),
                        color: "blue",
                    },
                ]}
                searchable={true}
                filterable={true}
                exportable={true}
                addButtonLabel="Create Bill"
                searchPlaceholder="Search bills..."
            />

            <FormModal
                open={openModal}
                onClose={() => {
                    setOpenModal(false);
                    setSelectedBill(null);
                }}
                title={selectedBill ? "Edit Bill" : "Create New Bill"}
                formFields={formFields}
                initialData={selectedBill || {}}
                onSubmit={handleSubmit}
                submitLabel={selectedBill ? "Update Bill" : "Create Bill"}
            />

            <ViewModal
                open={openViewModal}
                onClose={() => {
                    setOpenViewModal(false);
                    setSelectedBill(null);
                }}
                title="Bill Details"
                data={selectedBill || {}}
                fields={viewFields}
            />

            <DeleteConfirmModal
                open={openDeleteModal}
                onClose={() => {
                    setOpenDeleteModal(false);
                    setSelectedBill(null);
                }}
                onConfirm={confirmDelete}
                title="Delete Bill"
                message="Are you sure you want to delete this bill?"
                itemName={selectedBill?.invoiceNo}
            />
        </div>
    );
}
