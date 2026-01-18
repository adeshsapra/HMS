import React, { useState, useEffect } from "react";
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Button,
    Chip,
    IconButton,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
} from "@material-tailwind/react";
import {
    EyeIcon,
    PrinterIcon,
} from "@heroicons/react/24/solid";
import ApiService from "@/services/api";

export function Billing() {
    const [bills, setBills] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBill, setSelectedBill] = useState<any>(null);
    const [openView, setOpenView] = useState(false);

    const fetchBills = async () => {
        try {
            const response = await ApiService.getBills({ per_page: 20 });
            if (response && response.data && Array.isArray(response.data.data)) {
                setBills(response.data.data);
            } else {
                setBills([]);
            }
        } catch (error) {
            console.error("Failed to fetch bills", error);
            setBills([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBills();
    }, []);

    const handleView = async (id: number) => {
        try {
            const response = await ApiService.getBill(id);
            if (response.success) {
                setSelectedBill(response.data);
                setOpenView(true);
            }
        } catch (error) {
            console.error("Failed to fetch bill details", error);
        }
    };

    const handleFinalize = async () => {
        if (!selectedBill) return;
        try {
            if (window.confirm("Are you sure you want to finalize this bill? This action cannot be undone.")) {
                const response = await ApiService.finalizeBill(selectedBill.id);
                if (response.success) {
                    alert("Bill finalized successfully");
                    setOpenView(false);
                    fetchBills();
                }
            }
        } catch (error) {
            console.error("Failed to finalize bill", error);
            alert("Failed to finalize bill");
        }
    };

    const handlePrint = async (billId: number) => {
        try {
            const url = await ApiService.getBillPdfUrl(billId);
            window.open(url, '_blank');
        } catch (error) {
            console.error("Failed to get PDF URL", error);
        }
    };

    return (
        <div className="mt-12 mb-8 flex flex-col gap-12">
            <Card>
                <CardHeader variant="gradient" color="blue" className="mb-8 p-6">
                    <Typography variant="h6" color="white">
                        Billing Management
                    </Typography>
                </CardHeader>
                <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                    {loading ? (
                        <div className="p-4 text-center">Loading...</div>
                    ) : (
                        <table className="w-full min-w-[640px] table-auto">
                            <thead>
                                <tr>
                                    {["Bill #", "Patient", "Status", "Subtotal", "Total", "Due Date", "Action"].map((el) => (
                                        <th
                                            key={el}
                                            className="border-b border-blue-gray-50 py-3 px-5 text-left"
                                        >
                                            <Typography
                                                variant="small"
                                                className="text-[11px] font-bold uppercase text-blue-gray-400"
                                            >
                                                {el}
                                            </Typography>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {bills.length > 0 ? (
                                    bills.map((bill) => (
                                        <tr key={bill.id}>
                                            <td className="py-3 px-5 border-b border-blue-gray-50">
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {bill.bill_number}
                                                </Typography>
                                            </td>
                                            <td className="py-3 px-5 border-b border-blue-gray-50">
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {bill.patient?.first_name} {bill.patient?.last_name}
                                                </Typography>
                                                <Typography className="text-[10px] text-blue-gray-400">
                                                    {bill.patient?.email}
                                                </Typography>
                                            </td>
                                            <td className="py-3 px-5 border-b border-blue-gray-50">
                                                <Chip
                                                    variant="gradient"
                                                    color={bill.status === "finalized" ? "green" : "blue-gray"}
                                                    value={bill.status}
                                                    className="py-0.5 px-2 text-[11px] font-medium"
                                                />
                                            </td>
                                            <td className="py-3 px-5 border-b border-blue-gray-50">
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    ${Number(bill.sub_total).toFixed(2)}
                                                </Typography>
                                            </td>
                                            <td className="py-3 px-5 border-b border-blue-gray-50">
                                                <Typography className="text-xs font-bold text-blue-gray-600">
                                                    ${Number(bill.total_amount).toFixed(2)}
                                                </Typography>
                                            </td>
                                            <td className="py-3 px-5 border-b border-blue-gray-50">
                                                <Typography className="text-xs font-semibold text-blue-gray-600">
                                                    {bill.due_date}
                                                </Typography>
                                            </td>
                                            <td className="py-3 px-5 border-b border-blue-gray-50 flex gap-2">
                                                <IconButton size="sm" color="blue" onClick={() => handleView(bill.id)}>
                                                    <EyeIcon className="h-4 w-4" />
                                                </IconButton>
                                                <IconButton size="sm" color="green" onClick={() => handlePrint(bill.id)}>
                                                    <PrinterIcon className="h-4 w-4" />
                                                </IconButton>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="p-4 text-center text-sm text-gray-500">
                                            No bills found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </CardBody>
            </Card>

            <Dialog open={openView} handler={() => setOpenView(!openView)} size="lg">
                <DialogHeader>Bill Details: {selectedBill?.bill_number}</DialogHeader>
                <DialogBody divider className="h-[25rem] overflow-y-scroll">
                    {selectedBill && (
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between border-b pb-2">
                                <div>
                                    <Typography variant="h6">Patient Info</Typography>
                                    <Typography variant="small">{selectedBill.patient?.first_name} {selectedBill.patient?.last_name}</Typography>
                                    <Typography variant="small">{selectedBill.patient?.email}</Typography>
                                </div>
                                <div className="text-right">
                                    <Typography variant="h6">Bill Info</Typography>
                                    <Typography variant="small">Date: {new Date(selectedBill.created_at).toLocaleDateString()}</Typography>
                                    <Typography variant="small">Status: {selectedBill.status}</Typography>
                                </div>
                            </div>

                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b">
                                        <th className="p-2">Item</th>
                                        <th className="p-2">Type</th>
                                        <th className="p-2 text-right">Qty</th>
                                        <th className="p-2 text-right">Price</th>
                                        <th className="p-2 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedBill.items?.map((item: any, idx: number) => (
                                        <tr key={idx} className="border-b border-gray-50">
                                            <td className="p-2 text-sm">{item.name}</td>
                                            <td className="p-2 text-xs text-gray-500">{item.billable_type?.split('\\').pop()}</td>
                                            <td className="p-2 text-right text-sm">{item.quantity}</td>
                                            <td className="p-2 text-right text-sm">${Number(item.unit_price).toFixed(2)}</td>
                                            <td className="p-2 text-right text-sm font-medium">${Number(item.amount).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="font-bold">
                                        <td colSpan={4} className="p-2 text-right">Subtotal:</td>
                                        <td className="p-2 text-right">${Number(selectedBill.sub_total).toFixed(2)}</td>
                                    </tr>
                                    <tr className="font-bold">
                                        <td colSpan={4} className="p-2 text-right">Total:</td>
                                        <td className="p-2 text-right text-blue-600">${Number(selectedBill.total_amount).toFixed(2)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                </DialogBody>
                <DialogFooter>
                    <Button
                        variant="text"
                        color="red"
                        onClick={() => setOpenView(false)}
                        className="mr-1"
                    >
                        Close
                    </Button>
                    <Button variant="gradient" color="green" onClick={() => handlePrint(selectedBill.id)}>
                        Print
                    </Button>
                    {selectedBill?.status === 'draft' && (
                        <Button variant="gradient" color="blue" onClick={handleFinalize} className="ml-2">
                            Finalize Bill
                        </Button>
                    )}
                </DialogFooter>
            </Dialog>
        </div>
    );
}

export default Billing;
