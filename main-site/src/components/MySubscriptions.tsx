import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscriptionAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

interface Subscription {
    id: number;
    package_id: number;
    type: 'monthly' | 'yearly';
    start_date: string;
    end_date: string;
    status: 'active' | 'expired' | 'cancelled';
    created_at: string;
    package: {
        id: number;
        title: string;
        subtitle: string;
        price_monthly: number;
        price_yearly: number;
        features_monthly: string[];
        features_yearly: string[];
        metadata?: any;
    };
    payment?: {
        id: number;
        payment_number: string;
        amount: number;
        payment_mode: string;
        payment_status: string;
    };
}

const MySubscriptions = () => {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
    const { showToast } = useToast();
    const navigate = useNavigate();

    // Fetch subscriptions
    const fetchSubscriptions = async () => {
        try {
            setLoading(true);
            const response = await subscriptionAPI.getCurrentSubscription();
            const historyResponse = await subscriptionAPI.getSubscriptionHistory();

            let allSubs: Subscription[] = [];

            if (response.data && response.data.data) {
                if (Array.isArray(response.data.data)) {
                    allSubs = [...response.data.data];
                } else {
                    allSubs.push(response.data.data);
                }
            }

            if (historyResponse.data && historyResponse.data.data) {
                const history = Array.isArray(historyResponse.data.data) ? historyResponse.data.data : [historyResponse.data.data];
                history.forEach((sub: Subscription) => {
                    if (!allSubs.find(s => s.id === sub.id)) {
                        allSubs.push(sub);
                    }
                });
            }

            allSubs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            // Deduplicate just in case
            const uniqueSubs = Array.from(new Map(allSubs.map(item => [item.id, item])).values());

            setSubscriptions(uniqueSubs);
        } catch (error: any) {
            console.error('Error fetching subscriptions:', error);
            if (error.response?.status !== 404) {
                showToast('Failed to fetch subscriptions', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const handleBuyMore = () => {
        navigate('/');
        setTimeout(() => {
            const section = document.getElementById('packages');
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
            } else {
                setTimeout(() => {
                    const sectionRetry = document.getElementById('packages');
                    if (sectionRetry) sectionRetry.scrollIntoView({ behavior: 'smooth' });
                }, 500);
            }
        }, 100);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, { bg: string; color: string; icon: string }> = {
            active: { bg: 'color-mix(in srgb, #198754, transparent 90%)', color: '#198754', icon: 'bi-check-circle-fill' }, // Success green
            expired: { bg: 'color-mix(in srgb, var(--default-color), transparent 90%)', color: 'var(--default-color)', icon: 'bi-clock-history' },
            cancelled: { bg: 'color-mix(in srgb, #dc3545, transparent 90%)', color: '#dc3545', icon: 'bi-x-circle-fill' } // Danger red
        };
        const style = styles[status] || styles.expired;
        return (
            <span className="status-badge" style={{ backgroundColor: style.bg, color: style.color }}>
                <i className={`bi ${style.icon} me-1`}></i>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    // Modal Close Handler
    const closeModal = () => setSelectedSub(null);

    return (
        <div className="subscriptions-container">
            <style>{`
                .subscriptions-container {
                    width: 100%;
                    font-family: var(--default-font);
                    color: var(--default-color);
                }

                .subs-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                    border-bottom: 1px solid color-mix(in srgb, var(--default-color), transparent 90%);
                    padding-bottom: 1.5rem;
                }

                .subs-title h3 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--heading-color);
                    margin: 0;
                    font-family: var(--heading-font);
                }
                
                .subs-title p {
                    color: color-mix(in srgb, var(--default-color), transparent 40%);
                    margin: 0.25rem 0 0 0;
                    font-size: 0.95rem;
                }

                .buy-more-btn {
                    background: var(--accent-color);
                    color: var(--contrast-color);
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 50px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    cursor: pointer;
                    font-family: var(--heading-font);
                }

                .buy-more-btn:hover {
                    background: color-mix(in srgb, var(--accent-color), transparent 15%);
                    transform: translateY(-2px);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.15);
                    color: var(--contrast-color);
                }

                .subs-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 1.5rem;
                }

                .sub-card {
                    background: var(--surface-color);
                    border-radius: 16px;
                    border: 1px solid color-mix(in srgb, var(--default-color), transparent 90%);
                    overflow: hidden;
                    transition: all 0.3s ease;
                    position: relative;
                }

                .sub-card:hover {
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
                    border-color: var(--accent-color);
                    transform: translateY(-4px);
                }

                .card-top {
                    padding: 1.5rem;
                    background: color-mix(in srgb, var(--accent-color), transparent 96%);
                    border-bottom: 1px solid color-mix(in srgb, var(--default-color), transparent 95%);
                }

                .package-name {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: var(--heading-color);
                    margin-bottom: 0.25rem;
                    font-family: var(--heading-font);
                }

                .plan-type {
                    font-size: 0.875rem;
                    color: var(--accent-color);
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .card-body {
                    padding: 1.5rem;
                }

                .info-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 1rem;
                    font-size: 0.95rem;
                }

                .info-label {
                    color: color-mix(in srgb, var(--default-color), transparent 40%);
                }

                .info-value {
                    font-weight: 600;
                    color: var(--heading-color);
                }

                .status-badge {
                    display: inline-flex;
                    align-items: center;
                    padding: 0.35rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    letter-spacing: 0.025em;
                    text-transform: uppercase;
                }

                .view-details-btn {
                    width: 100%;
                    padding: 0.75rem;
                    background: transparent;
                    border: 1px solid color-mix(in srgb, var(--default-color), transparent 80%);
                    color: var(--default-color);
                    font-weight: 600;
                    border-radius: 8px;
                    transition: all 0.2s;
                    margin-top: 1rem;
                    cursor: pointer;
                    font-family: var(--heading-font);
                }

                .view-details-btn:hover {
                    background: transparent;
                    border-color: var(--accent-color);
                    color: var(--accent-color);
                }

                /* Empty State */
                .empty-state {
                    text-align: center;
                    padding: 4rem 2rem;
                    background: color-mix(in srgb, var(--default-color), transparent 96%);
                    border-radius: 16px;
                    border: 2px dashed color-mix(in srgb, var(--default-color), transparent 80%);
                }
                
                .empty-icon {
                    font-size: 3rem;
                    color: color-mix(in srgb, var(--default-color), transparent 80%);
                    margin-bottom: 1rem;
                }

                /* Modal Overlay and Content */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1050;
                    padding: 1rem;
                    backdrop-filter: blur(4px);
                    animation: fadeIn 0.2s ease-out;
                }

                .modal-content-custom {
                    background: var(--surface-color);
                    border-radius: 20px;
                    width: 100%;
                    max-width: 800px;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    animation: slideUp 0.3s ease-out;
                    display: flex;
                    flex-direction: column;
                }

                .modal-header-custom {
                    padding: 1.5rem 2rem;
                    border-bottom: 1px solid color-mix(in srgb, var(--default-color), transparent 90%);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    position: sticky;
                    top: 0;
                    background: var(--surface-color);
                    z-index: 10;
                    border-top-left-radius: 20px;
                    border-top-right-radius: 20px;
                }

                .modal-body-custom {
                    padding: 2rem;
                    overflow-y: auto;
                }

                .modal-footer-custom {
                    padding: 1.5rem 2rem;
                    border-top: 1px solid color-mix(in srgb, var(--default-color), transparent 90%);
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                    background: color-mix(in srgb, var(--default-color), transparent 98%);
                    border-bottom-left-radius: 20px;
                    border-bottom-right-radius: 20px;
                }

                .close-btn {
                    background: transparent;
                    border: none;
                    font-size: 1.5rem;
                    color: color-mix(in srgb, var(--default-color), transparent 60%);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    transition: all 0.2s;
                }

                .close-btn:hover {
                    background: color-mix(in srgb, var(--default-color), transparent 90%);
                    color: var(--heading-color);
                }

                .modal-features-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .modal-features-list li {
                    display: flex;
                    align-items: flex-start;
                    margin-bottom: 0.75rem;
                    color: var(--default-color);
                }

                .modal-features-list i {
                    color: var(--accent-color);
                    margin-right: 0.75rem;
                    margin-top: 0.25rem;
                }

                .benefit-tag {
                    background: color-mix(in srgb, var(--accent-color), transparent 92%);
                    color: var(--accent-color);
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    margin-bottom: 0.5rem;
                }

                .btn-secondary-custom {
                    background: transparent;
                    border: 1px solid color-mix(in srgb, var(--default-color), transparent 80%);
                    color: var(--default-color);
                    padding: 0.6rem 1.2rem;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-secondary-custom:hover {
                    background: color-mix(in srgb, var(--default-color), transparent 96%);
                    border-color: color-mix(in srgb, var(--default-color), transparent 60%);
                }

                .btn-primary-custom {
                    background: var(--accent-color);
                    color: var(--contrast-color);
                    border: none;
                    padding: 0.6rem 1.2rem;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                }

                .btn-primary-custom:hover {
                    background: color-mix(in srgb, var(--accent-color), transparent 15%);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            <div className="subs-header">
                <div className="subs-title">
                    <h3>My Subscriptions</h3>
                    <p>Manage your active health plans and view history</p>
                </div>
                <button className="buy-more-btn" onClick={handleBuyMore}>
                    <i className="bi bi-plus-lg"></i>
                    Buy More Packages
                </button>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : subscriptions.length > 0 ? (
                <div className="subs-grid">
                    {subscriptions.map(sub => (
                        <div key={sub.id} className="sub-card">
                            <div className="card-top d-flex justify-content-between align-items-start">
                                <div>
                                    <div className="package-name">{sub.package.title}</div>
                                    <div className="plan-type">{sub.type} Plan</div>
                                </div>
                                {getStatusBadge(sub.status)}
                            </div>
                            <div className="card-body">
                                <div className="info-row">
                                    <span className="info-label">Start Date</span>
                                    <span className="info-value">{formatDate(sub.start_date)}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">End Date</span>
                                    <span className="info-value">{formatDate(sub.end_date)}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Amount Paid</span>
                                    <span className="info-value">
                                        ${sub.payment?.amount || (sub.type === 'monthly' ? sub.package.price_monthly : sub.package.price_yearly)}
                                    </span>
                                </div>
                                <button className="view-details-btn" onClick={() => setSelectedSub(sub)}>
                                    View Full Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-icon">
                        <i className="bi bi-box-seam"></i>
                    </div>
                    <h4>No Active Subscriptions</h4>
                    <p className="text-muted mb-4">You haven't subscribed to any health packages yet.</p>
                    <button className="btn btn-primary" onClick={handleBuyMore} style={{ background: 'var(--accent-color)', border: 'none' }}>
                        Browse Health Packages
                    </button>
                </div>
            )}

            {/* Custom Modal */}
            {selectedSub && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content-custom" onClick={e => e.stopPropagation()}>
                        <div className="modal-header-custom">
                            <div>
                                <h4 className="fw-bold mb-1" style={{ color: 'var(--heading-color)' }}>{selectedSub.package.title}</h4>
                                <p className="mb-0" style={{ color: 'color-mix(in srgb, var(--default-color), transparent 40%)' }}>{selectedSub.package.subtitle}</p>
                            </div>
                            <button className="close-btn" onClick={closeModal}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        <div className="modal-body-custom">
                            <div className="row g-5">
                                <div className="col-md-7 border-end-md">
                                    <h6 className="fw-bold mb-4 text-uppercase small" style={{ color: 'color-mix(in srgb, var(--default-color), transparent 40%)' }}>Package Features</h6>
                                    <ul className="modal-features-list">
                                        {(selectedSub.type === 'monthly' ? selectedSub.package.features_monthly : selectedSub.package.features_yearly)?.map((feature: string, idx: number) => (
                                            <li key={idx}>
                                                <i className="bi bi-check-circle-fill"></i>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    {selectedSub.package.metadata && (selectedSub.package.metadata.consultation_discount > 0 || selectedSub.package.metadata.lab_discount > 0) && (
                                        <div className="mt-5">
                                            <h6 className="fw-bold mb-3 text-uppercase small" style={{ color: 'color-mix(in srgb, var(--default-color), transparent 40%)' }}>Smart Benefits & Discounts</h6>
                                            <div className="d-flex flex-wrap gap-3">
                                                {selectedSub.package.metadata.consultation_discount > 0 && (
                                                    <div className="benefit-tag">
                                                        <i className="bi bi-person-video me-2"></i>
                                                        {selectedSub.package.metadata.consultation_discount}% Off Consultations
                                                    </div>
                                                )}
                                                {selectedSub.package.metadata.lab_discount > 0 && (
                                                    <div className="benefit-tag">
                                                        <i className="bi bi-eyedropper me-2"></i>
                                                        {selectedSub.package.metadata.lab_discount}% Off Lab Tests
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="col-md-5">
                                    <div className="p-4 rounded-4 h-100" style={{ background: 'color-mix(in srgb, var(--default-color), transparent 96%)' }}>
                                        <h6 className="fw-bold mb-4" style={{ color: 'var(--heading-color)' }}>Subscription Details</h6>
                                        <div className="mb-3 d-flex justify-content-between align-items-center">
                                            <span style={{ color: 'color-mix(in srgb, var(--default-color), transparent 40%)' }}>Status</span>
                                            {getStatusBadge(selectedSub.status)}
                                        </div>
                                        <div className="mb-3 d-flex justify-content-between align-items-center">
                                            <span style={{ color: 'color-mix(in srgb, var(--default-color), transparent 40%)' }}>Plan Type</span>
                                            <span className="fw-semibold text-capitalize" style={{ color: 'var(--heading-color)' }}>{selectedSub.type}</span>
                                        </div>
                                        <div className="mb-3 d-flex justify-content-between align-items-center">
                                            <span style={{ color: 'color-mix(in srgb, var(--default-color), transparent 40%)' }}>Start Date</span>
                                            <span className="fw-semibold" style={{ color: 'var(--heading-color)' }}>{formatDate(selectedSub.start_date)}</span>
                                        </div>
                                        <div className="mb-3 d-flex justify-content-between align-items-center">
                                            <span style={{ color: 'color-mix(in srgb, var(--default-color), transparent 40%)' }}>End Date</span>
                                            <span className="fw-semibold" style={{ color: 'var(--heading-color)' }}>{formatDate(selectedSub.end_date)}</span>
                                        </div>

                                        {selectedSub.payment && (
                                            <>
                                                <hr className="my-4" style={{ borderColor: 'color-mix(in srgb, var(--default-color), transparent 85%)' }} />
                                                <div className="mb-3">
                                                    <span className="d-block small mb-1" style={{ color: 'color-mix(in srgb, var(--default-color), transparent 40%)' }}>Payment Reference</span>
                                                    <span className="font-monospace small bg-white px-2 py-1 rounded border d-block" style={{ color: 'var(--default-color)' }}>{selectedSub.payment.payment_number}</span>
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <span style={{ color: 'color-mix(in srgb, var(--default-color), transparent 40%)' }}>Total Paid</span>
                                                    <span className="fs-4 fw-bold" style={{ color: 'var(--accent-color)' }}>${selectedSub.payment.amount}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer-custom">
                            <button className="btn-secondary-custom" onClick={closeModal}>Close</button>
                            {selectedSub.status === 'active' && (
                                <button className="btn-primary-custom" onClick={handleBuyMore}>
                                    <i className="bi bi-arrow-up-right-circle me-2"></i>
                                    Upgrade Plan
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MySubscriptions;
