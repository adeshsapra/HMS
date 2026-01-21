import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ApiService } from '../services/api';
import { useToast } from '../context/ToastContext';

interface Bill {
    id: number;
    bill_number: string;
    total_amount: number;
    paid_amount: number;
    due_amount: number;
    status: string;
    created_at: string;
    finalized_at: string | null;
}

const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const bill = location.state?.bill as Bill | undefined;

    const [paymentGateway, setPaymentGateway] = useState('paypal');
    const [processingPayment, setProcessingPayment] = useState(false);

    useEffect(() => {
        if (!bill) {
            showToast('No bill selected', 'error');
            navigate('/profile');
            return;
        }
    }, [bill, navigate, showToast]);

    if (!bill) {
        return null;
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const handleInitiatePayment = async () => {
        // Always pay the full due amount in this simplified flow
        const amount = bill.due_amount;

        try {
            setProcessingPayment(true);
            const response = await ApiService.initiateOnlinePayment({
                bill_id: bill.id,
                amount: amount,
                payment_gateway: paymentGateway
            });

            if (response.data && response.data.success) {
                showToast('Payment initiated successfully. Redirecting...', 'success');
                setTimeout(() => {
                    navigate('/profile');
                }, 2000);
            }
        } catch (error: any) {
            console.error('Error initiating payment:', error);
            showToast(error.response?.data?.message || error.message || 'Failed to initiate payment', 'error');
        } finally {
            setProcessingPayment(false);
        }
    };

    const paymentMethods = [
        {
            id: 'paypal',
            name: 'PayPal',
            description: 'Safe payment online',
            icon: (
                <svg viewBox="0 0 24 24" fill="currentColor" height="24" width="24">
                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.946 5.05-4.336 6.795-9.116 6.795H9.52c-.63 0-1.133.521-1.254 1.14l-.67 4.16c-.06.375.228.693.608.693h1.13c.63 0 1.133.521 1.254 1.14l.173 1.08c.06.375-.228.693-.608.693h-3.07z" />
                </svg>
            )
        },
        {
            id: 'razorpay',
            name: 'Razorpay',
            description: 'UPI, Net Banking',
            icon: (
                <svg viewBox="0 0 24 24" fill="currentColor" height="24" width="24">
                    <path d="M13.25 21.25L9.63 15.68L2 19.34L13.25 21.25ZM21.96 17.58L16.29 2.58L10.58 6.64L18.42 19.46L21.96 17.58ZM8.42 13.92L14.46 9.63L11.58 5.58L2 12.38L8.42 13.92Z" />
                </svg>
            )
        }
    ];

    return (
        <div className="payment-page-container">
            <style>{`
                .payment-page-container {
                    min-height: 100vh;
                    background-color: #f5f7f9;
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                }

                /* Layout Wrapper */
                .checkout-wrapper {
                    display: flex;
                    max-width: 1100px;
                    width: 100%;
                    background: var(--surface-color);
                    border-radius: 24px;
                    overflow: hidden;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.05);
                    border: 1px solid rgba(0,0,0,0.05);
                }

                /* Left Side - Receipt Summary */
                .checkout-summary {
                    flex: 1;
                    background-color: #f8fafc;
                    padding: 3.5rem;
                    border-right: 1px solid #edf2f7;
                    display: flex;
                    flex-direction: column;
                }

                .summary-header {
                    margin-bottom: 2.5rem;
                }

                .summary-eyebrow {
                    color: var(--accent-color);
                    font-size: 0.875rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 0.5rem;
                }

                .summary-title {
                    font-size: 2rem;
                    color: var(--heading-color);
                    font-weight: 700;
                    margin: 0;
                }

                .bill-details-box {
                    background: var(--surface-color);
                    border-radius: 16px;
                    padding: 2rem;
                    border: 1px solid #edf2f7;
                    margin-bottom: auto;
                }

                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 1rem;
                    font-size: 0.95rem;
                    color: var(--default-color);
                    opacity: 0.8;
                }

                .detail-row span:last-child {
                    font-weight: 600;
                    color: var(--heading-color);
                    opacity: 1;
                }

                .divider {
                    height: 1px;
                    background-color: #edf2f7;
                    margin: 1.5rem 0;
                }

                .total-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                }

                .total-label {
                    font-size: 1rem;
                    color: var(--heading-color);
                    font-weight: 600;
                }

                .total-amount {
                    font-size: 2.5rem;
                    color: var(--heading-color);
                    font-weight: 800;
                    line-height: 1;
                }

                .back-link {
                    margin-top: 2rem;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--default-color);
                    opacity: 0.6;
                    text-decoration: none;
                    font-size: 0.9rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: opacity 0.2s;
                    border: none;
                    background: none;
                    padding: 0;
                }

                .back-link:hover {
                    opacity: 1;
                }

                /* Right Side - Payment Action */
                .checkout-action {
                    flex: 1.2;
                    padding: 3.5rem;
                    background: var(--surface-color);
                    display: flex;
                    flex-direction: column;
                }

                .action-header {
                    margin-bottom: 2rem;
                }

                .action-title {
                    font-size: 1.5rem;
                    color: var(--heading-color);
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                }

                .action-desc {
                    color: var(--default-color);
                    opacity: 0.7;
                    font-size: 0.95rem;
                }

                /* Method Grid */
                .payment-methods-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                    margin-bottom: 2.5rem;
                }

                .method-card {
                    position: relative;
                    border: 2px solid #edf2f7;
                    border-radius: 12px;
                    padding: 1.5rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    gap: 0.75rem;
                }

                .method-card:hover {
                    border-color: #cbd5e1;
                }

                .method-card.selected {
                    border-color: var(--accent-color);
                    background-color: rgba(4, 158, 187, 0.04);
                }

                .method-icon {
                    color: var(--default-color);
                    transition: color 0.2s;
                }

                .method-card.selected .method-icon {
                    color: var(--accent-color);
                }

                .method-name {
                    font-weight: 600;
                    color: var(--heading-color);
                    font-size: 1rem;
                }

                /* Radio hidden checkmark */
                .check-circle {
                    position: absolute;
                    top: 0.75rem;
                    right: 0.75rem;
                    width: 20px;
                    height: 20px;
                    border: 2px solid #edf2f7;
                    border-radius: 50%;
                }

                .method-card.selected .check-circle {
                    border-color: var(--accent-color);
                    background: var(--accent-color);
                }

                .method-card.selected .check-circle::after {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 8px;
                    height: 8px;
                    background: white;
                    border-radius: 50%;
                }

                /* Pay Button */
                .pay-button {
                    margin-top: auto;
                    width: 100%;
                    background-color: var(--accent-color);
                    color: white;
                    border: none;
                    padding: 1.25rem;
                    border-radius: 12px;
                    font-size: 1.125rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: transform 0.2s, opacity 0.2s;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 0.75rem;
                }

                .pay-button:hover:not(:disabled) {
                    opacity: 0.9;
                    transform: translateY(-2px);
                }

                .pay-button:disabled {
                    background-color: #cbd5e1;
                    cursor: not-allowed;
                }

                /* Secure Badge */
                .secure-badge {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    margin-top: 1.5rem;
                    color: var(--default-color);
                    opacity: 0.5;
                    font-size: 0.85rem;
                    font-weight: 500;
                }

                .spinner {
                    width: 20px;
                    height: 20px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                /* Responsive */
                @media (max-width: 900px) {
                    .checkout-wrapper {
                        flex-direction: column;
                        max-width: 500px;
                    }
                    
                    .checkout-summary, .checkout-action {
                        padding: 2rem;
                    }

                    .checkout-summary {
                        border-right: none;
                        border-bottom: 1px solid #edf2f7;
                    }
                }
            `}</style>

            <div className="checkout-wrapper">
                {/* Left Column: Summary */}
                <div className="checkout-summary">
                    <div className="summary-header">
                        <div className="summary-eyebrow">Order Summary</div>
                        <h1 className="summary-title">Bill #{bill.bill_number}</h1>
                    </div>

                    <div className="bill-details-box">
                        <div className="detail-row">
                            <span>Issue Date</span>
                            <span>{formatDate(bill.created_at)}</span>
                        </div>
                        <div className="detail-row">
                            <span>Status</span>
                            <span style={{ textTransform: 'capitalize' }}>{bill.status}</span>
                        </div>

                        <div className="divider"></div>

                        <div className="detail-row">
                            <span>Subtotal</span>
                            <span>{formatCurrency(bill.total_amount)}</span>
                        </div>
                        {bill.paid_amount > 0 && (
                            <div className="detail-row" style={{ color: '#10b981' }}>
                                <span>Paid</span>
                                <span>- {formatCurrency(bill.paid_amount)}</span>
                            </div>
                        )}

                        <div className="divider"></div>

                        <div className="total-row">
                            <span className="total-label">Total Due</span>
                            <span className="total-amount">{formatCurrency(bill.due_amount)}</span>
                        </div>
                    </div>

                    <button onClick={() => navigate('/profile')} className="back-link">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Cancel and return to profile
                    </button>
                </div>

                {/* Right Column: Payment */}
                <div className="checkout-action">
                    <div className="action-header">
                        <h2 className="action-title">Select Payment Method</h2>
                        <p className="action-desc">Choose how you would like to pay for this bill.</p>
                    </div>

                    <div className="payment-methods-grid">
                        {paymentMethods.map((method) => (
                            <div
                                key={method.id}
                                className={`method-card ${paymentGateway === method.id ? 'selected' : ''}`}
                                onClick={() => setPaymentGateway(method.id)}
                            >
                                <div className="check-circle"></div>
                                <div className="method-icon">{method.icon}</div>
                                <span className="method-name">{method.name}</span>
                            </div>
                        ))}
                    </div>

                    <button
                        className="pay-button"
                        onClick={handleInitiatePayment}
                        disabled={processingPayment}
                    >
                        {processingPayment ? (
                            <>
                                <div className="spinner"></div>
                                Processing...
                            </>
                        ) : (
                            <>
                                Pay {formatCurrency(bill.due_amount)}
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </>
                        )}
                    </button>

                    <div className="secure-badge">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        Payments are secure and encrypted
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;