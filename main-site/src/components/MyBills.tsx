import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiService } from '../services/api';
import { useToast } from '../context/ToastContext';

interface BillItem {
    id: number;
    name: string;
    quantity: number;
    unit_price: number;
    amount: number;
}

interface Bill {
    id: number;
    bill_number: string;
    total_amount: number;
    paid_amount: number;
    due_amount: number;
    status: 'draft' | 'finalized' | 'partially_paid' | 'paid' | 'cancelled';
    created_at: string;
    finalized_at: string | null;
    invoice_path: string | null;
    payments: Payment[];
    items?: BillItem[];
}

interface Payment {
    id: number;
    payment_number: string;
    amount: number;
    payment_mode: string;
    payment_status: string;
    payment_date: string | null;
}

const MyBills = () => {
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedBillId, setExpandedBillId] = useState<number | null>(null);
    const { showToast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        fetchBills();
    }, []);

    const fetchBills = async () => {
        try {
            setLoading(true);
            const response = await ApiService.getBills();
            if (response.data && response.data.success) {
                const billsData = response.data.data?.data || response.data.data || [];
                setBills(billsData);
            }
        } catch (error: any) {
            console.error('Error fetching bills:', error);
            showToast(error.response?.data?.message || error.message || 'Failed to fetch bills', 'error');
        } finally {
            setLoading(false);
        }
    };

    const toggleDetails = (id: number) => {
        setExpandedBillId(expandedBillId === id ? null : id);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const handlePayNow = (e: React.MouseEvent, bill: Bill) => {
        e.stopPropagation();
        navigate('/payment', { state: { bill } });
    };

    const handleDownloadInvoice = async (e: React.MouseEvent, billId: number) => {
        e.stopPropagation();
        try {
            showToast('Generating invoice PDF...', 'info');
            const response = await ApiService.downloadInvoice(billId);

            // Create a blob from the response data
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);

            // Create a temporary link element and trigger download
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Invoice-${billId}.pdf`);
            document.body.appendChild(link);
            link.click();

            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            showToast('Invoice downloaded successfully', 'success');
        } catch (error: any) {
            console.error('Error downloading invoice:', error);
            showToast('Failed to download invoice', 'error');
        }
    };

    // Helper to get colors based on status
    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'paid': return { color: '#10b981', label: 'Paid', bg: '#ecfdf5' };
            case 'partially_paid': return { color: '#f59e0b', label: 'Partial', bg: '#fffbeb' };
            case 'finalized': return { color: '#3b82f6', label: 'Outstanding', bg: '#eff6ff' };
            case 'cancelled': return { color: '#ef4444', label: 'Cancelled', bg: '#fef2f2' };
            default: return { color: '#6b7280', label: 'Draft', bg: '#f9fafb' };
        }
    };

    return (
        <div className="ledger-container">
            <style>{`
                .ledger-container {
                    width: 100%;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                    color: var(--default-color);
                    max-width: 1100px;
                    margin: 0 auto;
                }

                /* Header */
                .ledger-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 2rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid #e5e7eb;
                }

                .ledger-title h2 {
                    font-size: 1.75rem;
                    color: var(--heading-color);
                    font-weight: 800;
                    margin: 0;
                    letter-spacing: -0.5px;
                }

                .ledger-title p {
                    margin: 0.5rem 0 0 0;
                    color: #64748b;
                    font-size: 0.95rem;
                }

                .action-icon-btn {
                    background: transparent;
                    border: 1px solid #cbd5e1;
                    border-radius: 8px;
                    padding: 0.5rem;
                    color: #64748b;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-weight: 500;
                    font-size: 0.875rem;
                }

                .action-icon-btn:hover {
                    background: #f1f5f9;
                    color: var(--heading-color);
                    border-color: #94a3b8;
                }

                /* List Container */
                .ledger-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                }

                /* Bill Row Card */
                .ledger-card {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.02), 0 1px 1px rgba(0,0,0,0.02);
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                    border: 1px solid #f1f5f9;
                    overflow: hidden;
                    position: relative;
                }

                .ledger-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 24px rgba(0,0,0,0.06);
                }

                /* The Status Stripe (Left Border) */
                .status-stripe {
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 5px;
                    z-index: 10;
                    background-color: var(--heading-color);
                }

                /* Main Content Row */
                .card-main {
                    padding: 1.5rem;
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr 1.2fr 120px 40px;
                    align-items: center;
                    gap: 1.5rem;
                    cursor: pointer;
                }

                /* Typography in Grid */
                .cell-label {
                    display: block;
                    font-size: 0.7rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #94a3b8;
                    font-weight: 600;
                    margin-bottom: 0.35rem;
                }

                .cell-value {
                    display: block;
                    font-size: 1rem;
                    font-weight: 600;
                    color: var(--heading-color);
                }

                .cell-value.primary { font-size: 1.1rem; }
                .cell-value.secondary { font-size: 0.9rem; color: #64748b; font-weight: 500; }
                
                .amount-due { color: #dc2626; }
                .amount-paid { color: #10b981; }

                /* Status Badge */
                .status-badge {
                    display: inline-flex;
                    align-items: center;
                    padding: 0.4rem 0.8rem;
                    border-radius: 6px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.025em;
                }

                /* Actions */
                .pay-btn {
                    background: var(--heading-color);
                    color: white;
                    border: none;
                    padding: 0.6rem 1.25rem;
                    border-radius: 6px;
                    font-size: 0.875rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: opacity 0.2s;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
                }

                .pay-btn:hover {
                    opacity: 0.9;
                    box-shadow: 0 6px 12px rgba(0,0,0,0.1);
                }

                .toggle-chevron {
                    color: #cbd5e1;
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .ledger-card.expanded .toggle-chevron {
                    transform: rotate(180deg);
                    color: var(--heading-color);
                }

                /* Expanded Section - Unique Timeline Design */
                .details-panel {
                    max-height: 0;
                    overflow: hidden;
                    transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    background: #f8fafc;
                    border-top: 1px solid #f1f5f9;
                }

                .ledger-card.expanded .details-panel {
                    max-height: 800px; /* Safe max-height */
                }

                .panel-content {
                    padding: 2rem;
                    display: grid;
                    grid-template-columns: 1fr 300px;
                    gap: 3rem;
                }

                .section-header {
                    font-size: 0.85rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #64748b;
                    font-weight: 700;
                    margin-bottom: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                /* Timeline Styles */
                .timeline {
                    position: relative;
                    padding-left: 1.5rem;
                }

                .timeline::before {
                    content: '';
                    position: absolute;
                    left: 6px;
                    top: 0;
                    bottom: 0;
                    width: 2px;
                    background: #e2e8f0;
                }

                .timeline-item {
                    position: relative;
                    margin-bottom: 1.5rem;
                }

                .timeline-dot {
                    position: absolute;
                    left: -1.5rem;
                    top: 0.25rem;
                    width: 14px;
                    height: 14px;
                    background: white;
                    border: 3px solid #cbd5e1;
                    border-radius: 50%;
                    z-index: 2;
                }

                .timeline-item.completed .timeline-dot { border-color: #10b981; }
                .timeline-item.pending .timeline-dot { border-color: #f59e0b; }

                .timeline-content {
                    background: white;
                    border: 1px solid #e2e8f0;
                    padding: 1rem;
                    border-radius: 8px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .timeline-date { font-size: 0.85rem; color: #64748b; }
                .timeline-mode { font-weight: 600; color: var(--heading-color); display: block; }
                .timeline-amount { font-weight: 700; color: var(--heading-color); }
                .timeline-status { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }

                /* Action Panel */
                .action-panel-box {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                }

                .download-btn {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    padding: 0.875rem;
                    background: white;
                    border: 2px solid #e2e8f0;
                    border-radius: 8px;
                    color: var(--heading-color);
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    margin-top: 1rem;
                }

                .download-btn:hover {
                    border-color: var(--heading-color);
                    background: #f8fafc;
                }

                /* Loading & Empty */
                .center-state {
                    text-align: center;
                    padding: 4rem;
                    color: #94a3b8;
                }
                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid #f1f5f9;
                    border-top-color: var(--heading-color);
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                    margin: 0 auto 1rem;
                }
                @keyframes spin { to { transform: rotate(360deg); } }

                /* Responsive */
                @media (max-width: 900px) {
                    .card-main {
                        grid-template-columns: 1fr 1fr;
                        gap: 1rem;
                    }
                    .cell-value.primary { grid-column: 1 / -1; }
                    .toggle-chevron { position: absolute; top: 1.5rem; right: 1.5rem; }
                    .panel-content { grid-template-columns: 1fr; }
                }
            `}</style>

            <div className="ledger-header">
                <div className="ledger-title">
                    <h2>Bills & Payments</h2>
                    <p>Track your invoices and payment history</p>
                </div>
                <button onClick={fetchBills} className="action-icon-btn">
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    Refresh List
                </button>
            </div>

            {loading ? (
                <div className="center-state">
                    <div className="spinner"></div>
                    <p>Retrieving records...</p>
                </div>
            ) : bills.length === 0 ? (
                <div className="center-state">
                    <svg width="64" height="64" style={{ marginBottom: '1rem', opacity: 0.2 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <p>No invoice records found.</p>
                </div>
            ) : (
                <div className="ledger-list">
                    {bills.map((bill) => {
                        const statusConfig = getStatusConfig(bill.status);
                        const isExpanded = expandedBillId === bill.id;

                        return (
                            <div key={bill.id} className={`ledger-card ${isExpanded ? 'expanded' : ''}`}>
                                {/* Status Color Stripe */}
                                <div className="status-stripe"></div>

                                {/* Main Clickable Row */}
                                <div className="card-main" onClick={() => toggleDetails(bill.id)}>

                                    {/* 1. Bill Info */}
                                    <div>
                                        <span className="cell-label">Invoice Reference</span>
                                        <span className="cell-value primary">{bill.bill_number}</span>
                                        <span className="cell-value secondary" style={{ marginTop: '0.25rem', fontSize: '0.8rem' }}>
                                            Issued: {formatDate(bill.created_at)}
                                        </span>
                                    </div>

                                    {/* 2. Total */}
                                    <div>
                                        <span className="cell-label">Total Amount</span>
                                        <span className="cell-value">{formatCurrency(bill.total_amount)}</span>
                                    </div>

                                    {/* 3. Balance */}
                                    <div>
                                        <span className="cell-label">Balance Due</span>
                                        <span className={`cell-value ${bill.due_amount > 0 ? 'amount-due' : 'amount-paid'}`}>
                                            {formatCurrency(bill.due_amount)}
                                        </span>
                                    </div>

                                    {/* 4. Status Badge */}
                                    <div>
                                        <div className="status-badge" style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}>
                                            {statusConfig.label}
                                        </div>
                                    </div>

                                    {/* 5. Action Button */}
                                    <div style={{ textAlign: 'right' }}>
                                        {(bill.status === 'finalized' || bill.status === 'partially_paid') && bill.due_amount > 0 && (
                                            <button onClick={(e) => handlePayNow(e, bill)} className="pay-btn">
                                                Pay Now
                                            </button>
                                        )}
                                    </div>

                                    {/* 6. Chevron */}
                                    <div className="toggle-chevron">
                                        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>

                                {/* Detailed View (Accordion) */}
                                <div className="details-panel">
                                    <div className="panel-content">

                                        {/* Left: Charge Breakdown + Payment Timeline */}
                                        <div>
                                            <div className="section-header">
                                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                                Charge Breakdown
                                            </div>
                                            {bill.items && bill.items.length > 0 ? (
                                                <div style={{ marginBottom: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', background: 'white' }}>
                                                    <table style={{ width: '100%', fontSize: '0.9rem' }}>
                                                        <thead>
                                                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                                                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#64748b' }}>Description</th>
                                                                <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: '#64748b' }}>Qty</th>
                                                                <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: '#64748b' }}>Amount</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {bill.items.map((item) => (
                                                                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                                    <td style={{ padding: '0.75rem 1rem', fontWeight: 500, color: '#1e293b' }}>{item.name}</td>
                                                                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#64748b' }}>{item.quantity}</td>
                                                                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: '#1e293b' }}>{formatCurrency(item.amount)}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <div style={{ padding: '1rem', border: '1px dashed #cbd5e1', borderRadius: '8px', color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                                    No charge details available.
                                                </div>
                                            )}

                                            <div className="section-header">
                                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                Payment Timeline
                                            </div>

                                            {bill.payments && bill.payments.length > 0 ? (
                                                <div className="timeline">
                                                    {bill.payments.map(payment => (
                                                        <div key={payment.id} className={`timeline-item ${payment.payment_status}`}>
                                                            <div className="timeline-dot"></div>
                                                            <div className="timeline-content">
                                                                <div>
                                                                    <span className="timeline-mode">{payment.payment_mode}</span>
                                                                    <span className="timeline-date">{formatDate(payment.payment_date)} • Ref: {payment.payment_number}</span>
                                                                </div>
                                                                <div style={{ textAlign: 'right' }}>
                                                                    <div className="timeline-amount">{formatCurrency(payment.amount)}</div>
                                                                    <div className="timeline-status" style={{ color: payment.payment_status === 'completed' ? '#10b981' : '#f59e0b' }}>
                                                                        {payment.payment_status}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div style={{ padding: '1rem', border: '1px dashed #cbd5e1', borderRadius: '8px', color: '#94a3b8', fontSize: '0.9rem' }}>
                                                    No payments recorded for this invoice yet.
                                                </div>
                                            )}
                                        </div>

                                        {/* Right: Actions Box */}
                                        <div>
                                            <div className="section-header">
                                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                Documents
                                            </div>
                                            <div className="action-panel-box">
                                                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
                                                    Need a copy for your records? Download the official PDF invoice below.
                                                </div>
                                                <button onClick={(e) => handleDownloadInvoice(e, bill.id)} className="download-btn">
                                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                                    Download PDF
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyBills;