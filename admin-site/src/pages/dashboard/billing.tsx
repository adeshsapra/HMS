import React, { useState, useEffect } from 'react';
import {
    Card,
    CardHeader,
    CardBody,
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
} from "@material-tailwind/react";
import {
    MagnifyingGlassIcon,
    DocumentTextIcon,
    CurrencyDollarIcon,
    PrinterIcon,
} from "@heroicons/react/24/outline";
import { apiService } from '@/services/api';
import DataTable from '@/components/DataTable';
import { useToast } from '@/context/ToastContext';

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
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentNotes, setPaymentNotes] = useState('');
    const [processingPayment, setProcessingPayment] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const tabs = [
        { label: "All Bills", value: "all" },
        { label: "Draft", value: "draft" },
        { label: "Finalized", value: "finalized" },
        { label: "Partially Paid", value: "partially_paid" },
        { label: "Paid", value: "paid" },
    ];

    useEffect(() => {
        fetchBills();
    }, [currentPage, statusFilter]);

    const fetchBills = async () => {
        try {
            setLoading(true);
            const params: any = {
                page: currentPage,
                per_page: 10,
            };

            if (statusFilter !== 'all') {
                params.status = statusFilter;
            }

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
                // Open PDF in new window for viewing/printing
                window.open(url, '_blank');
            }
        } catch (error: any) {
            showToast('Failed to generate invoice', 'error');
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

    const filteredBills = bills.filter((bill) => {
        const matchesSearch =
            bill.bill_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            `${bill.patient.first_name} ${bill.patient.last_name}`
                .toLowerCase()
                .includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const columns: any[] = [
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
                    {/* Filters */}
                    <div className="mb-4 px-6">
                        <Tabs value={statusFilter}>
                            <TabsHeader>
                                {tabs.map(({ label, value }) => (
                                    <Tab
                                        key={value}
                                        value={value}
                                        onClick={() => {
                                            setStatusFilter(value);
                                            setCurrentPage(1);
                                        }}
                                    >
                                        {label}
                                    </Tab>
                                ))}
                            </TabsHeader>
                        </Tabs>
                    </div>

                    {/* Search */}
                    <div className="mb-4 px-6">
                        <div className="w-full md:w-96">
                            <Input
                                label="Search bills or patients..."
                                icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                crossOrigin={undefined}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <DataTable
                        title="Billing List"
                        columns={columns}
                        data={filteredBills}
                        customActions={customActions}
                        searchable={false}
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
                size="lg"
            >
                <DialogHeader>Bill Details - {selectedBill?.bill_number}</DialogHeader>
                <DialogBody divider className="max-h-[70vh] overflow-y-auto">
                    {selectedBill && (
                        <div className="space-y-4">
                            {/* Patient Info */}
                            <div>
                                <Typography variant="h6" className="mb-2">
                                    Patient Information
                                </Typography>
                                <div className="bg-gray-50 p-4 rounded">
                                    <p>
                                        <strong>Name:</strong> {selectedBill.patient.first_name}{' '}
                                        {selectedBill.patient.last_name}
                                    </p>
                                    <p>
                                        <strong>Phone:</strong> {selectedBill.patient.phone}
                                    </p>
                                </div>
                            </div>

                            {/* Bill Summary */}
                            <div>
                                <Typography variant="h6" className="mb-2">
                                    Bill Summary
                                </Typography>
                                <div className="bg-gray-50 p-4 rounded space-y-2">
                                    <div className="flex justify-between">
                                        <span>Total Amount:</span>
                                        <span className="font-semibold">
                                            {formatCurrency(selectedBill.total_amount)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-green-600">
                                        <span>Paid Amount:</span>
                                        <span className="font-semibold">
                                            {formatCurrency(selectedBill.paid_amount)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-red-600">
                                        <span>Due Amount:</span>
                                        <span className="font-semibold">
                                            {formatCurrency(selectedBill.due_amount)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t">
                                        <span>Status:</span>
                                        <Chip
                                            size="sm"
                                            value={selectedBill.status.replace('_', ' ')}
                                            color={getStatusColor(selectedBill.status) as any}
                                            className="capitalize"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Payment History */}
                            {selectedBill.payments && selectedBill.payments.length > 0 && (
                                <div>
                                    <Typography variant="h6" className="mb-2">
                                        Payment History
                                    </Typography>
                                    <div className="space-y-2">
                                        {selectedBill.payments.map((payment) => (
                                            <div
                                                key={payment.id}
                                                className="bg-gray-50 p-3 rounded flex justify-between items-center"
                                            >
                                                <div>
                                                    <p className="font-medium">{payment.payment_number}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {formatDate(payment.payment_date)} •{' '}
                                                        {payment.payment_mode}
                                                        {payment.collector && ` • By ${payment.collector.name}`}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold">
                                                        {formatCurrency(payment.amount)}
                                                    </p>
                                                    <Chip
                                                        size="sm"
                                                        value={payment.payment_status}
                                                        color={
                                                            payment.payment_status === 'completed'
                                                                ? 'green'
                                                                : 'amber'
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogBody>
                <DialogFooter>
                    <Button
                        variant="text"
                        color="gray"
                        onClick={() => setShowDetailsModal(false)}
                    >
                        Close
                    </Button>
                </DialogFooter>
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
