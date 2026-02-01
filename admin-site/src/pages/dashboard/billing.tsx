import React, { useState, useEffect } from 'react';
import {
    Card,
    CardBody,
    CardHeader,
    Typography,
    Button,
    Chip,
    Input,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Tabs,
    TabsHeader,
    Tab,
    IconButton,
    Tooltip,
} from "@material-tailwind/react";
import {
    MagnifyingGlassIcon,
    DocumentTextIcon,
    CurrencyDollarIcon,
    PrinterIcon,
    UserCircleIcon,
    CalendarDaysIcon,
    CreditCardIcon,
    BanknotesIcon,
    XMarkIcon,
    ClipboardDocumentIcon,
    CheckCircleIcon,
    ClockIcon
} from "@heroicons/react/24/outline";
import { apiService } from '@/services/api';
import DataTable, { Column } from '@/components/DataTable';
import { useToast } from '@/context/ToastContext';
import { AdvancedFilter } from '@/components/AdvancedFilter';

interface Bill {
    id: number;
    bill_number: string;
    patient: {
        id: number;
        first_name: string;
        last_name: string;
        phone: string;
    };
    total_amount: number;
    paid_amount: number;
    due_amount: number;
    status: 'draft' | 'finalized' | 'partially_paid' | 'paid' | 'cancelled';
    created_at: string;
    finalized_at: string | null;
    payments: Payment[];
}

interface Payment {
    id: number;
    payment_number: string;
    amount: number;
    payment_mode: string;
    payment_status: string;
    payment_date: string | null;
    collector?: {
        name: string;
    };
}

const Billing = () => {
    const { showToast } = useToast();
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentNotes, setPaymentNotes] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});

    const tabs = [
        { label: "All Bills", value: "all" },
        { label: "Draft", value: "draft" },
        { label: "Finalized", value: "finalized" },
        { label: "Partially Paid", value: "partially_paid" },
        { label: "Paid", value: "paid" },
    ];

    useEffect(() => {
        fetchBills(currentPage, activeFilters);
    }, [currentPage]);

    const fetchBills = async (page = 1, currentFilters = activeFilters) => {
        try {
            setLoading(true);
            const params: any = {
                page,
                per_page: 10,
                ...currentFilters
            };

            const response = await apiService.getBills(params);
            if (response.success) {
                setBills(response.data?.data || []);
                setTotalPages(response.data?.last_page || 1);
            }
        } catch (error: any) {
            showToast(error.message || 'Failed to fetch bills', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (bill: Bill) => {
        setSelectedBill(bill);
        setShowDetailsModal(true);
    };

    const handleCollectCash = (bill: Bill) => {
        setSelectedBill(bill);
        setPaymentAmount(bill.due_amount.toString());
        setPaymentNotes('');
        setShowPaymentModal(true);
    };

    const handleSubmitPayment = async () => {
        if (!selectedBill) return;

        const amount = parseFloat(paymentAmount);
        if (isNaN(amount) || amount <= 0) {
            showToast('Please enter a valid amount', 'error');
            return;
        }

        if (amount > selectedBill.due_amount) {
            showToast('Payment amount cannot exceed due amount', 'error');
            return;
        }

        try {
            setProcessingPayment(true);
            const response = await apiService.collectCash({
                bill_id: selectedBill.id,
                amount: amount,
                notes: paymentNotes,
            });

            if (response.success) {
                showToast('Payment collected successfully', 'success');
                setShowPaymentModal(false);
                fetchBills();
            }
        } catch (error: any) {
            showToast(error.message || 'Failed to collect payment', 'error');
        } finally {
            setProcessingPayment(false);
        }
    };

    const handleFinalizeBill = async (bill: Bill) => {
        if (!confirm(`Are you sure you want to finalize bill ${bill.bill_number}? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await apiService.finalizeBill(bill.id);
            if (response.success) {
                showToast('Bill finalized successfully', 'success');
                fetchBills();
            }
        } catch (error: any) {
            showToast(error.message || 'Failed to finalize bill', 'error');
        }
    };

    const handlePrintInvoice = async (billId: number) => {
        try {
            const url = await apiService.downloadInvoice(billId);
            if (url) {
                window.open(url, '_blank');
            }
        } catch (error: any) {
            showToast('Failed to generate invoice', 'error');
        }
    };

    const handleCopyId = async (id: string) => {
        try {
            await navigator.clipboard.writeText(id);
            showToast('ID copied to clipboard', 'success');
        } catch (error: any) {
            showToast('Failed to copy ID', 'error');
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            draft: 'gray',
            finalized: 'blue',
            partially_paid: 'amber',
            paid: 'green',
            cancelled: 'red',
        };
        return colors[status] || 'gray';
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };


    const columns: Column[] = [
        {
            label: 'Bill Number',
            key: 'bill_number',
            render: (value: string) => (
                <Typography variant="small" className="font-semibold">
                    {value}
                </Typography>
            ),
        },
        {
            label: 'Patient',
            key: 'patient',
            render: (patient: Bill['patient']) => (
                <div>
                    <Typography variant="small" className="font-medium">
                        {patient.first_name} {patient.last_name}
                    </Typography>
                    <Typography variant="small" className="text-gray-600 border-none">
                        {patient.phone}
                    </Typography>
                </div>
            ),
        },
        {
            label: 'Total Amount',
            key: 'total_amount',
            render: (value: number) => (
                <Typography variant="small" className="font-semibold">
                    {formatCurrency(value)}
                </Typography>
            ),
        },
        {
            label: 'Paid',
            key: 'paid_amount',
            render: (value: number) => (
                <Typography variant="small" className="text-green-600 font-medium">
                    {formatCurrency(value)}
                </Typography>
            ),
        },
        {
            label: 'Due',
            key: 'due_amount',
            render: (value: number) => (
                <Typography variant="small" className="text-red-600 font-medium">
                    {formatCurrency(value)}
                </Typography>
            ),
        },
        {
            label: 'Status',
            key: 'status',
            render: (value: string) => (
                <Chip
                    size="sm"
                    value={value.replace('_', ' ')}
                    color={getStatusColor(value) as any}
                    className="capitalize"
                />
            ),
        },
        {
            label: 'Date',
            key: 'created_at',
            render: (value: string) => (
                <Typography variant="small">{formatDate(value)}</Typography>
            ),
        },
    ];

    const customActions = (row: any) => {
        const bill = row as Bill;
        return [
            {
                label: 'View Details',
                icon: <DocumentTextIcon className="h-4 w-4" />,
                onClick: () => handleViewDetails(bill),
                color: 'blue',
            },
            ...(bill.status === 'draft' ? [
                {
                    label: 'Finalize Bill',
                    icon: <DocumentTextIcon className="h-4 w-4" />,
                    onClick: () => handleFinalizeBill(bill),
                    color: 'indigo',
                }
            ] : []),
            ...((bill.status === 'finalized' || bill.status === 'partially_paid') && bill.due_amount > 0 ? [
                {
                    label: 'Collect Cash',
                    icon: <CurrencyDollarIcon className="h-4 w-4" />,
                    onClick: () => handleCollectCash(bill),
                    color: 'green',
                }
            ] : []),
            {
                label: 'Print Invoice',
                icon: <PrinterIcon className="h-4 w-4" />,
                onClick: () => handlePrintInvoice(bill.id),
                color: 'gray',
            },
        ];
    };

    return (
        <div className="mt-12 mb-8 flex flex-col gap-12">
            <Card>
                <CardHeader variant="gradient" color="blue" className="mb-8 p-6">
                    <Typography variant="h6" color="white">
                        Billing Management
                    </Typography>
                </CardHeader>
                <CardBody className="px-0 pt-0 pb-2">
                    <div className="px-6 mb-4">
                        <AdvancedFilter
                            config={{
                                fields: [
                                    {
                                        name: 'keyword',
                                        label: 'Search Bills',
                                        type: 'text',
                                        placeholder: 'Search by bill #, patient name, phone...'
                                    },
                                    {
                                        name: 'status',
                                        label: 'Status',
                                        type: 'select',
                                        options: [
                                            { label: 'All Statuses', value: '' },
                                            { label: 'Draft', value: 'draft' },
                                            { label: 'Finalized', value: 'finalized' },
                                            { label: 'Partially Paid', value: 'partially_paid' },
                                            { label: 'Paid', value: 'paid' },
                                            { label: 'Cancelled', value: 'cancelled' }
                                        ]
                                    },
                                    {
                                        name: 'date_range',
                                        label: 'Bill Date',
                                        type: 'daterange'
                                    }
                                ],
                                onApplyFilters: (filters) => {
                                    setActiveFilters(filters);
                                    fetchBills(1, filters);
                                },
                                onResetFilters: () => {
                                    setActiveFilters({});
                                    fetchBills(1, {});
                                },
                                initialValues: activeFilters
                            }}
                        />
                    </div>

                    {/* Table */}
                    <DataTable
                        title="Billing List"
                        columns={columns}
                        data={bills}
                        customActions={customActions}
                        searchable={false}
                        filterable={false}
                        pagination={{
                            currentPage: currentPage,
                            totalPages: totalPages,
                            onPageChange: setCurrentPage,
                        }}
                    />
                </CardBody>
            </Card>

            {/* Bill Details Modal */}
            <Dialog
                open={showDetailsModal}
                handler={() => setShowDetailsModal(false)}
                size="xl" // Increased size for split view
                className="overflow-hidden bg-gray-50"
            >
                {selectedBill && (
                    <>
                        {/* 1. Modal Header: Clean, Status-focused */}
                        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Typography variant="h5" color="blue-gray" className="tracking-tight">
                                            {selectedBill.bill_number}
                                        </Typography>
                                        <Tooltip content="Copy ID">
                                            <IconButton
                                                variant="text"
                                                size="sm"
                                                className="h-6 w-6 rounded-full hover:bg-gray-100"
                                                onClick={() => handleCopyId(selectedBill.bill_number)}
                                            >
                                                <ClipboardDocumentIcon className="h-4 w-4 text-gray-500" />
                                            </IconButton>
                                        </Tooltip>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <ClockIcon className="h-3.5 w-3.5 text-gray-400" />
                                        <Typography variant="small" className="text-gray-500 font-normal">
                                            Created {formatDate(selectedBill.created_at)}
                                        </Typography>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className={`px-4 py-1.5 rounded-full border ${selectedBill.status === 'paid' ? 'bg-green-50 border-green-100 text-green-700' :
                                    selectedBill.status === 'partially_paid' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                                        'bg-gray-50 border-gray-200 text-gray-700'
                                    }`}>
                                    <span className="text-xs font-bold uppercase tracking-wider">
                                        {selectedBill.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <IconButton variant="text" color="gray" onClick={() => setShowDetailsModal(false)}>
                                    <XMarkIcon className="h-6 w-6" />
                                </IconButton>
                            </div>
                        </div>

                        {/* 2. Modal Body: Split View (Content | Sidebar) */}
                        <DialogBody className="p-0 overflow-y-auto max-h-[75vh]">
                            <div className="flex flex-col lg:flex-row min-h-[500px]">

                                {/* LEFT COLUMN: History & Data (65% width) */}
                                <div className="flex-1 p-6 lg:p-8">

                                    {/* Timeline / Meta Stats */}
                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        <div className="p-4 rounded-xl border border-gray-200 bg-white">
                                            <Typography variant="small" className="text-gray-500 mb-1">Generated By</Typography>
                                            <Typography variant="h6" color="blue-gray" className="font-medium">System Admin</Typography>
                                            <Typography variant="small" className="text-gray-400 text-xs mt-1">Reception Desk</Typography>
                                        </div>
                                        <div className="p-4 rounded-xl border border-gray-200 bg-white">
                                            <Typography variant="small" className="text-gray-500 mb-1">Finalized Date</Typography>
                                            <Typography variant="h6" color="blue-gray" className="font-medium">
                                                {selectedBill.finalized_at ? formatDate(selectedBill.finalized_at) : 'Pending'}
                                            </Typography>
                                            <Typography variant="small" className="text-gray-400 text-xs mt-1">
                                                {selectedBill.finalized_at ? 'Ready for accounting' : 'Draft mode'}
                                            </Typography>
                                        </div>
                                    </div>

                                    {/* Payment History Section */}
                                    <div className="mb-4 flex items-center justify-between">
                                        <Typography variant="h6" color="blue-gray">Transaction History</Typography>
                                    </div>

                                    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                                        {selectedBill.payments.length > 0 ? (
                                            <table className="w-full text-left">
                                                <thead className="bg-gray-50 border-b border-gray-100">
                                                    <tr>
                                                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reference</th>
                                                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Method</th>
                                                        <th className="p-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {selectedBill.payments.map((pay) => (
                                                        <tr key={pay.id} className="hover:bg-gray-50/50 transition-colors">
                                                            <td className="p-4">
                                                                <div className="font-medium text-gray-900 text-sm">{pay.payment_number}</div>
                                                                <div className="text-xs text-gray-500">Col: {pay.collector?.name}</div>
                                                            </td>
                                                            <td className="p-4 text-sm text-gray-600">{formatDate(pay.payment_date)}</td>
                                                            <td className="p-4">
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 capitalize">
                                                                    {pay.payment_mode}
                                                                </span>
                                                            </td>
                                                            <td className="p-4 text-right font-medium text-green-600">
                                                                + {formatCurrency(pay.amount)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <div className="p-8 text-center flex flex-col items-center justify-center text-gray-500">
                                                <BanknotesIcon className="h-10 w-10 text-gray-300 mb-2" />
                                                <p>No payments recorded for this invoice yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* RIGHT SIDEBAR: Summary & Patient (35% width) */}
                                <div className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-gray-200 p-6 lg:p-8 flex flex-col h-auto">

                                    {/* Patient Profile Widget */}
                                    <div className="flex items-start gap-4 mb-8">
                                        <div className="h-12 w-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-bold shadow-lg shadow-blue-500/30">
                                            {selectedBill.patient.first_name.charAt(0)}
                                        </div>
                                        <div>
                                            <Typography variant="h6" color="blue-gray">
                                                {selectedBill.patient.first_name} {selectedBill.patient.last_name}
                                            </Typography>
                                            <Typography variant="small" className="text-gray-500 font-normal">
                                                ID: P-{selectedBill.patient.id}
                                            </Typography>
                                            <Typography variant="small" className="text-blue-600 mt-1 font-medium cursor-pointer hover:underline">
                                                {selectedBill.patient.phone}
                                            </Typography>
                                        </div>
                                    </div>

                                    <hr className="border-dashed border-gray-200 mb-8" />

                                    {/* Financial Summary Widget */}
                                    <div className="space-y-4 mb-auto">
                                        <Typography variant="small" className="font-bold text-gray-900 uppercase tracking-wider mb-4">
                                            Payment Summary
                                        </Typography>

                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600">Total Invoiced</span>
                                            <span className="font-semibold text-gray-900">{formatCurrency(selectedBill.total_amount)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600">Total Paid</span>
                                            <span className="font-medium text-green-600">
                                                ({formatCurrency(selectedBill.paid_amount)})
                                            </span>
                                        </div>

                                        <div className="my-4 border-t border-gray-100"></div>

                                        <div className={`p-4 rounded-xl flex items-center justify-between ${selectedBill.due_amount > 0 ? 'bg-red-50' : 'bg-green-50'
                                            }`}>
                                            <span className={`text-sm font-medium ${selectedBill.due_amount > 0 ? 'text-red-700' : 'text-green-700'
                                                }`}>
                                                Balance Due
                                            </span>
                                            <span className={`text-xl font-bold ${selectedBill.due_amount > 0 ? 'text-red-700' : 'text-green-700'
                                                }`}>
                                                {formatCurrency(selectedBill.due_amount)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons in Sidebar */}
                                    <div className="mt-8 space-y-3">
                                        {(selectedBill.status === 'finalized' || selectedBill.status === 'partially_paid') && selectedBill.due_amount > 0 && (
                                            <Button
                                                size="lg"
                                                color="green"
                                                fullWidth
                                                className="flex items-center justify-center gap-2 shadow-green-500/20"
                                                onClick={() => {
                                                    setShowDetailsModal(false);
                                                    handleCollectCash(selectedBill);
                                                }}
                                            >
                                                <CreditCardIcon className="h-5 w-5" />
                                                Collect Payment
                                            </Button>
                                        )}

                                        <Button
                                            size="lg"
                                            variant="outlined"
                                            color="blue-gray"
                                            fullWidth
                                            className="flex items-center justify-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                                            onClick={() => handlePrintInvoice(selectedBill.id)}
                                        >
                                            <PrinterIcon className="h-5 w-5" />
                                            Print Invoice
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </DialogBody>
                    </>
                )}
            </Dialog>

            {/* Payment Collection Modal */}
            <Dialog
                open={showPaymentModal}
                handler={() => setShowPaymentModal(false)}
                size="md"
            >
                <DialogHeader>Collect Cash Payment</DialogHeader>
                <DialogBody divider>
                    {selectedBill && (
                        <div className="space-y-4">
                            <div className="bg-blue-50 p-4 rounded">
                                <p className="text-sm">
                                    <strong>Bill:</strong> {selectedBill.bill_number}
                                </p>
                                <p className="text-sm">
                                    <strong>Patient:</strong> {selectedBill.patient.first_name}{' '}
                                    {selectedBill.patient.last_name}
                                </p>
                                <p className="text-sm">
                                    <strong>Due Amount:</strong>{' '}
                                    <span className="text-red-600 font-semibold">
                                        {formatCurrency(selectedBill.due_amount)}
                                    </span>
                                </p>
                            </div>

                            <div>
                                <Input
                                    type="number"
                                    label="Payment Amount"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    step="0.01"
                                    max={selectedBill.due_amount}
                                    crossOrigin={undefined}
                                />
                            </div>

                            <div>
                                <Input
                                    label="Notes (Optional)"
                                    value={paymentNotes}
                                    onChange={(e) => setPaymentNotes(e.target.value)}
                                    crossOrigin={undefined}
                                />
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                                <Typography variant="small" className="text-yellow-800">
                                    <strong>Note:</strong> Cash payments are immediately marked as
                                    completed and a receipt will be generated.
                                </Typography>
                            </div>
                        </div>
                    )}
                </DialogBody>
                <DialogFooter>
                    <Button
                        variant="text"
                        color="gray"
                        onClick={() => setShowPaymentModal(false)}
                        className="mr-2"
                        disabled={processingPayment}
                    >
                        Cancel
                    </Button>
                    <Button
                        color="green"
                        onClick={handleSubmitPayment}
                        disabled={processingPayment}
                    >
                        {processingPayment ? 'Processing...' : 'Collect Payment'}
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
};

export default Billing;
