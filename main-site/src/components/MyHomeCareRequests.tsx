import { useState, useEffect } from 'react';
import { patientProfileAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

interface HomeCareRequest {
    id: number;
    name: string;
    phone: string;
    address: string;
    preferred_date: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    services_requested: string[] | string | null;
    service_id?: number;
    bill?: {
        id: number;
        bill_number: string;
        total_amount: number;
        status: string;
    };
    created_at: string;
}

const MyHomeCareRequests = () => {
    const { showToast } = useToast();
    const [requests, setRequests] = useState<HomeCareRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await patientProfileAPI.getMyHomeCareRequests();
            if (response.data.success) {
                setRequests(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching home care requests:', error);
            showToast('Failed to load home care requests', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Helper to get service names safely
    const getServiceNames = (serviceData: any) => {
        if (!serviceData) return ['General Home Care'];
        if (Array.isArray(serviceData)) return serviceData;
        if (typeof serviceData === 'string') {
            try {
                const parsed = JSON.parse(serviceData);
                return Array.isArray(parsed) ? parsed : [serviceData];
            } catch {
                return [serviceData];
            }
        }
        return ['General Home Care'];
    };

    const getStatusBadge = (status: string) => {
        const statuses: any = {
            'pending': 'bg-warning text-dark',
            'confirmed': 'bg-primary text-white',
            'completed': 'bg-success text-white',
            'cancelled': 'bg-danger text-white'
        };
        return <span className={`badge ${statuses[status] || 'bg-secondary'} rounded-pill`}>{status.toUpperCase()}</span>;
    };

    const CountdownTimer = ({ targetDate }: { targetDate: string }) => {
        const [remaining, setRemaining] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

        useEffect(() => {
            const calculateTimeLeft = () => {
                const target = new Date(targetDate).getTime();
                const now = new Date().getTime();
                const difference = target - now;

                if (difference > 0) {
                    return {
                        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                        minutes: Math.floor((difference / 1000 / 60) % 60),
                        seconds: Math.floor((difference / 1000) % 60),
                    };
                }
                return null;
            };

            setRemaining(calculateTimeLeft());
            const timer = setInterval(() => {
                setRemaining(calculateTimeLeft());
            }, 1000);

            return () => clearInterval(timer);
        }, [targetDate]);

        if (!remaining) return null;

        return (
            <div className="d-flex align-items-center gap-3 bg-white p-2 pe-4 rounded-pill shadow-sm border border-light" style={{ backdropFilter: 'blur(10px)' }}>
                <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                    <i className="bi bi-stopwatch-fill text-primary" style={{ fontSize: '1.2rem' }}></i>
                </div>
                <div className="d-flex flex-column me-2">
                    <span className="text-uppercase text-muted fw-bold" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Starting In</span>
                </div>
                <div className="d-flex align-items-center gap-3">
                    {[
                        { val: remaining.days, label: 'd' },
                        { val: remaining.hours, label: 'h' },
                        { val: remaining.minutes, label: 'm' },
                        { val: remaining.seconds, label: 's' }
                    ].map((t, i) => (
                        <div key={i} className="d-flex align-items-baseline gap-1">
                            <span className="fw-bold text-dark" style={{ fontSize: '1.2rem', fontFamily: 'monospace' }}>
                                {String(t.val).padStart(2, '0')}
                            </span>
                            <span className="text-muted small fw-medium text-uppercase">{t.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-50 py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="my-appointments-section container-fluid py-4" style={{ '--bs-primary': '#0299BE', '--bs-primary-rgb': '2, 153, 190' } as React.CSSProperties}>
            <div className="d-flex align-items-end justify-content-between mb-5">
                <div>
                    <h2 className="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
                        <i className="bi bi-house-heart text-primary"></i>
                        My Home Care
                    </h2>
                    <p className="text-muted mb-0 fs-5 fw-light">Manage your health visits and payments effortlessly.</p>
                </div>
                <button className="btn btn-outline-primary rounded-pill px-4 d-none d-md-block" onClick={() => window.location.reload()}>
                    <i className="bi bi-arrow-clockwise me-2"></i>Refresh
                </button>
            </div>

            {requests.length === 0 ? (
                <div className="text-center py-5 bg-white rounded-5 shadow-lg position-relative overflow-hidden">
                    <div className="position-absolute top-0 start-0 w-100 h-100 bg-primary opacity-0" style={{ pointerEvents: 'none', background: 'radial-gradient(circle at 50% 50%, rgba(2, 153, 190, 0.05) 0%, transparent 70%)' }}></div>
                    <div className="mb-4">
                        <div className="d-inline-flex bg-primary bg-opacity-10 p-4 rounded-circle mb-3 animate-bounce">
                            <i className="bi bi-clipboard-plus text-primary display-4"></i>
                        </div>
                    </div>
                    <h4 className="fw-bold text-dark">No Requests Found</h4>
                    <p className="text-muted mb-4 col-md-6 mx-auto">You don't have any active home care requests. Schedule a visit to get quality care at your doorstep.</p>
                    <a href="/home-care" className="btn btn-primary btn-lg rounded-pill px-5 shadow-sm hover-scale transition-all">
                        Book Now
                    </a>
                </div>
            ) : (
                <div className="row g-4">
                    {requests.map((request) => (
                        <div key={request.id} className="col-12">
                            <div className="card border-0 shadow-lg rounded-4 overflow-hidden bg-white group-hover-parent transition-all" style={{ transform: 'translateZ(0)' }}>
                                <div className="card-body p-0">
                                    <div className="d-md-flex">
                                        {/* Status Sidebar - Always use theme color */}
                                        <div className="p-1 d-none d-md-block bg-primary" style={{ width: '6px' }}></div>

                                        <div className="flex-grow-1 p-4">
                                            {/* Header Row */}
                                            <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
                                                <div>
                                                    <div className="d-flex align-items-center gap-2 mb-2">
                                                        {getStatusBadge(request.status)}
                                                        <span className="text-muted small fw-medium">#{request.id}</span>
                                                    </div>
                                                    <h3 className="fw-bold text-dark mb-1">
                                                        {getServiceNames(request.services_requested)[0]}
                                                    </h3>
                                                    {getServiceNames(request.services_requested).length > 1 && (
                                                        <span className="text-muted small">
                                                            + {getServiceNames(request.services_requested).slice(1).join(', ')}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Countdown Timer at Top */}
                                                <div className="text-end">
                                                    {request.preferred_date && (request.status === 'pending' || request.status === 'confirmed') ? (
                                                        <CountdownTimer targetDate={request.preferred_date} />
                                                    ) : (
                                                        <div className="text-muted">
                                                            <small className="fst-italic d-block mb-1" style={{ fontSize: '0.75rem' }}>
                                                                Requested on
                                                            </small>
                                                            <div className="fw-bold">{new Date(request.created_at).toLocaleDateString()}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Content Divider */}
                                            <hr className="border-secondary opacity-10 my-4" />

                                            {/* Bottom Details Row */}
                                            <div className="row g-0">
                                                {/* Left Section: Patient + Schedule + Address */}
                                                <div className="col-md-7 pe-md-4">
                                                    <div className="d-flex align-items-start gap-4 mb-3">
                                                        {/* Patient Info */}
                                                        <div className="d-flex align-items-center gap-3">
                                                            <div className="flex-shrink-0 bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold fs-5" style={{ width: '48px', height: '48px' }}>
                                                                {request.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <small className="text-uppercase text-muted fw-bold d-block mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>Patient</small>
                                                                <h6 className="fw-bold text-dark mb-1">{request.name}</h6>
                                                                <small className="text-muted d-flex align-items-center gap-1">
                                                                    <i className="bi bi-telephone" style={{ fontSize: '0.75rem' }}></i>
                                                                    {request.phone}
                                                                </small>
                                                            </div>
                                                        </div>

                                                        {/* Vertical Divider */}
                                                        <div className="vr d-none d-lg-block" style={{ opacity: 0.2 }}></div>

                                                        {/* Scheduled Info */}
                                                        <div className="d-flex align-items-center gap-3">
                                                            <div className="flex-shrink-0 p-2 bg-primary bg-opacity-10 rounded-3 text-primary">
                                                                <i className="bi bi-calendar-event fs-5"></i>
                                                            </div>
                                                            <div>
                                                                <small className="text-uppercase text-muted fw-bold d-block mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>Scheduled</small>
                                                                <div className="fw-bold text-dark mb-1">
                                                                    {request.preferred_date ? new Date(request.preferred_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Pending'}
                                                                </div>
                                                                <small className="text-muted">
                                                                    {request.preferred_date ? new Date(request.preferred_date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                                                </small>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Address Row */}
                                                    {request.address && (
                                                        <div className="ps-1">
                                                            <div className="d-flex align-items-start gap-2 p-2 bg-light bg-opacity-50 rounded-3">
                                                                <i className="bi bi-geo-alt-fill text-primary mt-1" style={{ fontSize: '0.9rem' }}></i>
                                                                <small className="text-muted flex-grow-1 lh-sm">{request.address}</small>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Right Section: Billing & Cost */}
                                                <div className="col-md-5 d-flex align-items-center justify-content-md-end mt-3 mt-md-0">
                                                    {request.bill ? (
                                                        <div className="bg-light rounded-4 px-4 py-3 border border-light shadow-sm">
                                                            <div className="small text-muted fw-bold text-uppercase mb-2 text-center" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>Total Amount</div>
                                                            <div className="text-center">
                                                                <div className="h3 fw-bolder text-dark mb-2">${parseFloat(request.bill.total_amount.toString()).toFixed(2)}</div>
                                                                <div className={`badge px-3 py-2 ${request.bill.status === 'paid' ? 'bg-primary' : 'bg-danger'} bg-opacity-10 border ${request.bill.status === 'paid' ? 'border-primary text-primary' : 'border-danger text-danger'}`}>
                                                                    {request.bill.status === 'finalized' ? 'Unpaid' : request.bill.status.replace('_', ' ').toUpperCase()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="d-flex flex-column align-items-center justify-content-center text-muted opacity-50 p-3">
                                                            <i className="bi bi-receipt fs-3 mb-2"></i>
                                                            <small className="fw-bold text-uppercase" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>No Bill</small>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyHomeCareRequests;
