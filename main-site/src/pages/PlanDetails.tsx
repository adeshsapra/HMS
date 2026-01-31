import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { subscriptionAPI, ApiService } from '../services/api'; // user api
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useToast } from '../context/ToastContext';
import ContentLoader from "../components/ContentLoader";

interface HealthPackage {
    id: number;
    title: string;
    subtitle: string;
    price_monthly: number;
    price_yearly: number;
    features_monthly: string[];
    features_yearly: string[];
    metadata?: any;
}

const PlanDetails = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const initialType = searchParams.get('type') as 'monthly' | 'yearly';

    const navigate = useNavigate();
    const { showToast } = useToast();

    const [plan, setPlan] = useState<HealthPackage | null>(null);
    const [loading, setLoading] = useState(true);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(initialType || 'monthly');
    const [paymentGateway, setPaymentGateway] = useState('paypal');

    // Payment Config State
    const [paypalClientId, setPaypalClientId] = useState<string | null>(null);
    const [loadingConfig, setLoadingConfig] = useState(false);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (id) fetchPlanDetails(parseInt(id));
        fetchPaymentConfigs();
    }, [id]);

    const fetchPlanDetails = async (planId: number) => {
        try {
            const res = await subscriptionAPI.getPackageById(planId);
            if (res.data.success) {
                setPlan(res.data.data);
            }
        } catch (error) {
            console.error(error);
            showToast("Failed to load plan details", 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchPaymentConfigs = async () => {
        setLoadingConfig(true);
        try {
            // Fetch PayPal Config
            try {
                const ppRes = await ApiService.getPayPalConfig();
                if (ppRes.data.success && ppRes.data.client_id) {
                    setPaypalClientId(ppRes.data.client_id);
                }
            } catch (e) {
                console.error('PayPal config error', e);
            }
            // Add Razorpay fetch if needed
        } catch (error) {
            console.error('Config fetch error', error);
        } finally {
            setLoadingConfig(false);
        }
    };

    const handleSubscription = async (paymentDetails: any) => {
        if (!plan) return;
        setProcessing(true);
        try {
            const res = await subscriptionAPI.subscribe({
                package_id: plan.id,
                type: billingCycle,
                payment_details: paymentDetails
            });

            if (res.data.success) {
                showToast("Subscription activated successfully!", 'success');
                navigate('/profile'); // Redirect to profile to see subscription
            }
        } catch (error: any) {
            showToast(error.response?.data?.message || "Subscription failed", 'error');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <ContentLoader message="Loading Plan Details..." />;
    if (!plan) return <div className="p-5 text-center">Plan not found</div>;

    const price = billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly;

    return (
        <div className="plan-details-page section" style={{ minHeight: '100vh', paddingTop: '100px', background: '#f8fafc' }}>
            <style>{`
                :root {
                    --primary: #0299BE;
                    --primary-soft: rgba(2, 153, 190, 0.1);
                    --dark-text: #1e293b;
                    --gray-text: #64748b;
                }
                .plan-card {
                    background: white;
                    border-radius: 24px;
                    border: 1px solid rgba(226, 232, 240, 0.8);
                    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.05);
                    overflow: hidden;
                    transition: all 0.3s ease;
                }
                .plan-header {
                    background: linear-gradient(135deg, var(--primary) 0%, #007cc7 100%);
                    padding: 3rem 2rem;
                    color: white;
                    position: relative;
                    overflow: hidden;
                }
                .plan-header::after {
                    content: '';
                    position: absolute;
                    bottom: -50px;
                    right: -50px;
                    width: 200px;
                    height: 200px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 50%;
                }
                .billing-toggle {
                    background: #f1f5f9;
                    padding: 5px;
                    border-radius: 16px;
                    display: inline-flex;
                    margin-bottom: 2rem;
                    position: relative;
                }
                .billing-btn {
                    padding: 10px 24px;
                    border-radius: 12px;
                    border: none;
                    background: transparent;
                    color: var(--gray-text);
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .billing-btn.active {
                    background: white;
                    color: var(--primary);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }
                .price-tag {
                    font-size: 3.5rem;
                    font-weight: 800;
                    color: var(--primary);
                    line-height: 1;
                    letter-spacing: -1px;
                }
                .feature-item {
                    display: flex;
                    align-items: center;
                    margin-bottom: 1rem;
                    padding: 0.75rem;
                    border-radius: 12px;
                    transition: background 0.2s;
                }
                .feature-item:hover {
                    background: var(--primary-soft);
                }
                .feature-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: var(--primary-soft);
                    color: var(--primary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 1rem;
                    flex-shrink: 0;
                }
                .benefit-card {
                    background: linear-gradient(to right, #f8fafc, #fff);
                    border: 1px solid #e2e8f0;
                    border-left: 4px solid var(--primary);
                    border-radius: 12px;
                    padding: 1rem;
                    margin-bottom: 1rem;
                }
                .payment-card {
                    background: white;
                    border-radius: 24px;
                    padding: 2rem;
                    box-shadow: 0 25px 50px -12px rgba(2, 153, 190, 0.15);
                    border: 1px solid rgba(2, 153, 190, 0.1);
                    position: sticky;
                    top: 120px;
                }
                .method-option {
                    border: 2px solid #e2e8f0;
                    border-radius: 16px;
                    padding: 1.25rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .method-option:hover {
                    border-color: #cbd5e1;
                    background: #f8fafc;
                }
                .method-option.selected {
                    border-color: var(--primary);
                    background: var(--primary-soft);
                }
                .trust-badge {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    color: #64748b;
                    font-size: 0.85rem;
                    margin-top: 2rem;
                    padding-top: 1rem;
                    border-top: 1px dashed #e2e8f0;
                }
            `}</style>

            <div className="container">
                <div className="row g-5">
                    {/* Left Column: Plan Information */}
                    <div className="col-lg-7">
                        <div className="plan-card h-100">
                            <div className="plan-header">
                                <span className="badge bg-white text-primary mb-3 px-3 py-2 rounded-pill fw-bold" style={{ letterSpacing: '1px' }}>
                                    SELECTED PLAN
                                </span>
                                <h1 className="h2 fw-bold mb-2">{plan.title}</h1>
                                <p className="mb-0 opacity-75 fs-5">{plan.subtitle}</p>
                            </div>

                            <div className="p-4 p-md-5">
                                {/* Billing Toggle */}
                                <div className="text-center">
                                    <div className="billing-toggle">
                                        <button
                                            className={`billing-btn ${billingCycle === 'monthly' ? 'active' : ''}`}
                                            onClick={() => setBillingCycle('monthly')}
                                        >
                                            Monthly
                                        </button>
                                        <button
                                            className={`billing-btn ${billingCycle === 'yearly' ? 'active' : ''}`}
                                            onClick={() => setBillingCycle('yearly')}
                                        >
                                            Yearly <span className="badge bg-success ms-1 px-2 py-1" style={{ fontSize: '0.65rem' }}>-20%</span>
                                        </button>
                                    </div>

                                    <div className="mb-5">
                                        <div className="d-flex align-items-end justify-content-center gap-2">
                                            <span className="price-tag">${price}</span>
                                            <span className="text-muted fw-bold mb-3 fs-5">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                                        </div>
                                        <p className="text-muted small">Tax included. Cancel anytime.</p>
                                    </div>
                                </div>

                                <h5 className="fw-bold text-dark mb-4">What's included in your plan:</h5>
                                <div className="row g-3 mb-5">
                                    {(billingCycle === 'monthly' ? plan.features_monthly : plan.features_yearly)?.map((feature, idx) => (
                                        <div className="col-md-6" key={idx}>
                                            <div className="feature-item">
                                                <div className="feature-icon">
                                                    <i className="bi bi-check-lg"></i>
                                                </div>
                                                <span className="text-dark fw-medium">{feature}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Dynamic Metadata Benefits */}
                                {plan.metadata && Object.keys(plan.metadata).length > 0 && (
                                    <div className="bg-light p-4 rounded-4">
                                        <h6 className="fw-bold mb-3 text-primary">
                                            <i className="bi bi-stars me-2"></i>Smart Benefits (Auto-Applied)
                                        </h6>
                                        <div className="row g-3">
                                            {plan.metadata.consultation_discount > 0 && (
                                                <div className="col-12">
                                                    <div className="benefit-card">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <div className="fw-bold text-dark">Consultation Discount</div>
                                                                <div className="small text-muted">Automatically applied on all doctor visits</div>
                                                            </div>
                                                            <span className="badge bg-primary fs-6">{plan.metadata.consultation_discount}% OFF</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {plan.metadata.lab_discount > 0 && (
                                                <div className="col-12">
                                                    <div className="benefit-card">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <div className="fw-bold text-dark">Lab Test Savings</div>
                                                                <div className="small text-muted">Discount on pathology and diagnostics</div>
                                                            </div>
                                                            <span className="badge bg-info text-dark fs-6">{plan.metadata.lab_discount}% OFF</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Payment & Summary */}
                    <div className="col-lg-5">
                        <div className="payment-card">
                            <h4 className="fw-bold mb-4">Summary & Payment</h4>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <span className="text-muted">Subtotal</span>
                                <span className="fw-semibold">${price}</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-4 pb-4 border-bottom">
                                <span className="text-muted">Tax</span>
                                <span className="fw-semibold">$0.00</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-5">
                                <span className="h5 fw-bold mb-0 text-dark">Total Due</span>
                                <span className="h3 fw-bold mb-0 text-primary">${price}</span>
                            </div>

                            <div className="mb-4">
                                <label className="form-label fw-bold text-muted small text-uppercase mb-3">Select Payment Method</label>
                                <div className="d-flex flex-column gap-3">
                                    <div
                                        className={`method-option ${paymentGateway === 'paypal' ? 'selected' : ''}`}
                                        onClick={() => setPaymentGateway('paypal')}
                                    >
                                        <div className="d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', background: '#eef2f6', borderRadius: '10px' }}>
                                            <i className="bi bi-paypal text-primary fs-5"></i>
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="fw-bold text-dark">PayPal</div>
                                            <div className="small text-muted">Pay securely with your PayPal account</div>
                                        </div>
                                        <div className={`rounded-circle border ${paymentGateway === 'paypal' ? 'bg-primary border-primary' : ''}`} style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {paymentGateway === 'paypal' && <i className="bi bi-check text-white small"></i>}
                                        </div>
                                    </div>

                                    <div className="method-option" style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                                        <div className="d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', background: '#eef2f6', borderRadius: '10px' }}>
                                            <i className="bi bi-credit-card text-dark fs-5"></i>
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="fw-bold text-dark">Credit/Debit Card</div>
                                            <div className="small text-muted">Coming soon via Razorpay</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* PayPal Button Container */}
                            {paymentGateway === 'paypal' && (
                                <div className="mt-4">
                                    {loadingConfig || processing ? (
                                        <div className="text-center py-4 bg-light rounded-3">
                                            <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                                            <span className="text-primary fw-medium">
                                                {processing ? 'Processing your subscription...' : 'Connecting to PayPal...'}
                                            </span>
                                        </div>
                                    ) : paypalClientId ? (
                                        <PayPalScriptProvider options={{ clientId: paypalClientId, currency: "USD" }}>
                                            <PayPalButtons
                                                style={{ layout: "vertical", shape: "rect", borderRadius: 12, height: 48 }}
                                                createOrder={(_data, actions) => {
                                                    return actions.order.create({
                                                        intent: "CAPTURE",
                                                        purchase_units: [{
                                                            amount: {
                                                                currency_code: "USD",
                                                                value: price.toString()
                                                            },
                                                            description: `Subscription: ${plan.title} (${billingCycle})`
                                                        }]
                                                    });
                                                }}
                                                onApprove={async (_data, actions) => {
                                                    if (actions.order) {
                                                        const details = await actions.order.capture();
                                                        handleSubscription({
                                                            gateway: 'paypal',
                                                            transaction_id: details.id,
                                                            details: details
                                                        });
                                                    }
                                                }}
                                                onError={(err) => {
                                                    console.error("PayPal Error:", err);
                                                    showToast("Payment processing failed. Please try again.", 'error');
                                                }}
                                            />
                                        </PayPalScriptProvider>
                                    ) : (
                                        <div className="alert alert-danger mb-0 small">
                                            <i className="bi bi-exclamation-triangle me-2"></i>
                                            Payment configuration missing. Please contact support.
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="trust-badge">
                                <i className="bi bi-shield-check fs-5"></i>
                                <div>
                                    <span className="fw-bold text-dark">SSL Secure Payment</span>
                                    <span className="mx-2">•</span>
                                    <span>24/7 Support</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlanDetails;
