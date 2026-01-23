import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ApiService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

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
    const [loadingConfig, setLoadingConfig] = useState(false);
    const [paypalClientId, setPaypalClientId] = useState<string | null>(null);

    useEffect(() => {
        if (!bill) {
            showToast('No bill selected', 'error');
            navigate('/profile');
            return;
        }

        // Fetch PayPal Client ID if PayPal is selected
        const fetchPaypalConfig = async () => {
            console.log('🔍 [DEBUG] Starting PayPal config fetch...');
            setLoadingConfig(true);
            try {
                console.log('🔍 [DEBUG] Calling ApiService.getPayPalConfig()...');
                const response = await ApiService.getPayPalConfig();

                console.log('🔍 [DEBUG] Full API Response:', response);
                console.log('🔍 [DEBUG] Response Data:', response.data);
                console.log('🔍 [DEBUG] Response Data Success:', response.data?.success);
                console.log('🔍 [DEBUG] Response Data client_id:', response.data?.client_id);

                if (response.data.success && response.data.client_id) {
                    console.log('✅ [DEBUG] PayPal client_id found:', response.data.client_id);
                    setPaypalClientId(response.data.client_id);
                } else {
                    console.error('❌ [DEBUG] PayPal client_id missing in response');
                    console.error('❌ [DEBUG] Response structure:', JSON.stringify(response.data, null, 2));
                    // Keep paypalClientId as null to show the error UI
                }
            } catch (error: any) {
                console.error('❌ [DEBUG] Failed to fetch PayPal config', error);
                console.error('❌ [DEBUG] Error response:', error.response);
                console.error('❌ [DEBUG] Error response data:', error.response?.data);
                console.error('❌ [DEBUG] Error status:', error.response?.status);

                // If it's a 404, we just leave it as null and show the custom error message
                if (error.response?.status !== 404) {
                    showToast('Failed to load payment configuration', 'error');
                }
            } finally {
                setLoadingConfig(false);
                console.log('🔍 [DEBUG] fetchPaypalConfig completed. paypalClientId will be set shortly.');
            }
        };

        fetchPaypalConfig();
    }, [bill, navigate, showToast]);

    // Add a useEffect to log when paypalClientId changes
    useEffect(() => {
        console.log('🔍 [DEBUG] paypalClientId state changed to:', paypalClientId);
        console.log('🔍 [DEBUG] paypalClientId type:', typeof paypalClientId);
        if (paypalClientId) {
            console.log('🔍 [DEBUG] paypalClientId length:', paypalClientId.length);
            console.log('🔍 [DEBUG] paypalClientId trimmed:', paypalClientId.trim());
        }
    }, [paypalClientId]);

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

    // For other gateways (like Razorpay if integrated later)
    const handleInitiatePayment = async () => {
        if (paymentGateway === 'paypal') return; // PayPal is handled by buttons

        const amount = bill.due_amount;
        try {
            setProcessingPayment(true);
            const response = await ApiService.initiateOnlinePayment({
                bill_id: bill.id,
                amount: amount,
                payment_gateway: paymentGateway
            });

            if (response.data && response.data.success) {
                if (response.data.data.payment_url) {
                    window.location.href = response.data.data.payment_url;
                }
            }
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to initiate payment', 'error');
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

                .checkout-wrapper {
                    display: flex;
                    max-width: 1100px;
                    width: 100%;
                    background: white;
                    border-radius: 24px;
                    overflow: hidden;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.05);
                    border: 1px solid rgba(0,0,0,0.05);
                }

                .checkout-summary {
                    flex: 1;
                    background-color: #f8fafc;
                    padding: 3.5rem;
                    border-right: 1px solid #edf2f7;
                    display: flex;
                    flex-direction: column;
                }

                .summary-header { margin-bottom: 2.5rem; }
                .summary-eyebrow { color: var(--accent-color, #049ebb); font-size: 0.875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.5rem; }
                .summary-title { font-size: 2rem; color: #1e293b; font-weight: 700; margin: 0; }

                .bill-details-box {
                    background: white;
                    border-radius: 16px;
                    padding: 2rem;
                    border: 1px solid #edf2f7;
                    margin-bottom: auto;
                }

                .detail-row { display: flex; justify-content: space-between; margin-bottom: 1rem; font-size: 0.95rem; color: #64748b; }
                .detail-row span:last-child { font-weight: 600; color: #1e293b; }

                .divider { height: 1px; background-color: #edf2f7; margin: 1.5rem 0; }
                .total-row { display: flex; justify-content: space-between; align-items: flex-end; }
                .total-label { font-size: 1rem; color: #1e293b; font-weight: 600; }
                .total-amount { font-size: 2.5rem; color: #1e293b; font-weight: 800; line-height: 1; }

                .back-link {
                    margin-top: 2rem;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: #64748b;
                    text-decoration: none;
                    font-size: 0.9rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: color 0.2s;
                    border: none;
                    background: none;
                }
                .back-link:hover { color: #1e293b; }

                .checkout-action {
                    flex: 1.2;
                    padding: 3.5rem;
                    background: white;
                    display: flex;
                    flex-direction: column;
                }

                .action-header { margin-bottom: 2rem; }
                .action-title { font-size: 1.5rem; color: #1e293b; font-weight: 700; margin-bottom: 0.5rem; }
                .action-desc { color: #64748b; font-size: 0.95rem; }

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

                .method-card:hover { border-color: #cbd5e1; }
                .method-card.selected { border-color: var(--accent-color, #049ebb); background-color: rgba(4, 158, 187, 0.04); }
                .method-icon { color: #64748b; }
                .selected .method-icon { color: var(--accent-color, #049ebb); }
                .method-name { font-weight: 600; color: #1e293b; font-size: 1rem; }

                .check-circle { position: absolute; top: 0.75rem; right: 0.75rem; width: 20px; height: 20px; border: 2px solid #edf2f7; border-radius: 50%; }
                .selected .check-circle { border-color: var(--accent-color, #049ebb); background: var(--accent-color, #049ebb); }
                .selected .check-circle::after { content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 8px; height: 8px; background: white; border-radius: 50%; }

                .paypal-button-container {
                    margin-top: 1rem;
                    min-height: 150px;
                }

                .pay-button {
                    margin-top: auto;
                    width: 100%;
                    background-color: var(--accent-color, #049ebb);
                    color: white;
                    border: none;
                    padding: 1.25rem;
                    border-radius: 12px;
                    font-size: 1.125rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 0.75rem;
                }

                .secure-badge {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    margin-top: 1.5rem;
                    color: #64748b;
                    opacity: 0.6;
                    font-size: 0.85rem;
                }

                @media (max-width: 900px) {
                    .checkout-wrapper { flex-direction: column; }
                    .checkout-summary, .checkout-action { padding: 2rem; }
                    .checkout-summary { border-right: none; border-bottom: 1px solid #edf2f7; }
                }
            `}</style>

            <div className="checkout-wrapper">
                <div className="checkout-summary">
                    <div className="summary-header">
                        <div className="summary-eyebrow">Order Summary</div>
                        <h1 className="summary-title">Bill #{bill.bill_number}</h1>
                    </div>

                    <div className="bill-details-box">
                        <div className="detail-row"><span>Issue Date</span><span>{formatDate(bill.created_at)}</span></div>
                        <div className="detail-row"><span>Status</span><span style={{ textTransform: 'capitalize' }}>{bill.status}</span></div>
                        <div className="divider"></div>
                        <div className="detail-row"><span>Subtotal</span><span>{formatCurrency(bill.total_amount)}</span></div>
                        {bill.paid_amount > 0 && <div className="detail-row" style={{ color: '#10b981' }}><span>Paid</span><span>- {formatCurrency(bill.paid_amount)}</span></div>}
                        <div className="divider"></div>
                        <div className="total-row"><span className="total-label">Total Due</span><span className="total-amount">{formatCurrency(bill.due_amount)}</span></div>
                    </div>

                    <button onClick={() => navigate('/profile')} className="back-link">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                        Cancel and return to profile
                    </button>
                </div>

                <div className="checkout-action">
                    <div className="action-header">
                        <h2 className="action-title">Select Payment Method</h2>
                        <p className="action-desc">Securely complete your payment using PayPal or other methods.</p>
                    </div>

                    <div className="payment-methods-grid">
                        {paymentMethods.map((method) => (
                            <div key={method.id} className={`method-card ${paymentGateway === method.id ? 'selected' : ''}`} onClick={() => setPaymentGateway(method.id)}>
                                <div className="check-circle"></div>
                                <div className="method-icon">{method.icon}</div>
                                <span className="method-name">{method.name}</span>
                            </div>
                        ))}
                    </div>

                    {paymentGateway === 'paypal' ? (
                        <div className="paypal-button-container">
                            {loadingConfig ? (
                                <div className="loading-paypal" style={{ textAlign: 'center', padding: '2rem' }}>
                                    <div className="spinner" style={{ margin: '0 auto 1rem', borderColor: '#e2e8f0', borderTopColor: '#049ebb' }}></div>
                                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading secure payment buttons...</p>
                                </div>
                            ) : (paypalClientId && paypalClientId.trim() !== '') ? (
                                <>
                                    {console.log('🔍 [DEBUG] Rendering PayPalScriptProvider with clientId:', paypalClientId)}
                                    {console.log('🔍 [DEBUG] clientId type:', typeof paypalClientId)}
                                    {console.log('🔍 [DEBUG] clientId length:', paypalClientId.length)}
                                    <PayPalScriptProvider options={{ clientId: paypalClientId, currency: "USD", intent: "capture" }}>
                                        <PayPalButtons
                                            style={{ layout: "vertical", shape: "rect", label: "pay" }}
                                            createOrder={async () => {
                                                try {
                                                    const response = await ApiService.initiateOnlinePayment({
                                                        bill_id: bill.id,
                                                        amount: bill.due_amount,
                                                        payment_gateway: 'paypal'
                                                    });
                                                    return response.data.data.payment.transaction_id;
                                                } catch (error) {
                                                    showToast('Failed to create PayPal order', 'error');
                                                    throw error;
                                                }
                                            }}
                                            onApprove={async (data) => {
                                                try {
                                                    const response = await ApiService.capturePayPalPayment(data.orderID);
                                                    if (response.data.success) {
                                                        navigate(`/payment/success?token=${data.orderID}`);
                                                    }
                                                } catch (error) {
                                                    showToast('Payment capture failed', 'error');
                                                }
                                            }}
                                            onError={(err) => {
                                                console.error("PayPal Error:", err);
                                                showToast('An error occurred with PayPal', 'error');
                                            }}
                                        />
                                    </PayPalScriptProvider>
                                </>
                            ) : (
                                <div className="error-paypal" style={{ textAlign: 'center', padding: '2rem', background: '#fff1f2', borderRadius: '12px', border: '1px solid #fecaca' }}>
                                    <p style={{ color: '#e11d48', fontSize: '0.95rem', fontWeight: '500', marginBottom: '0.5rem' }}>PayPal is not configured correctly.</p>
                                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Please contact the hospital administration or set up the PayPal Client ID in the integrations panel.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button className="pay-button" onClick={handleInitiatePayment} disabled={processingPayment}>
                            {processingPayment ? 'Processing...' : `Pay ${formatCurrency(bill.due_amount)}`}
                        </button>
                    )}

                    <div className="secure-badge">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        Secure 256-bit encrypted payment
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;