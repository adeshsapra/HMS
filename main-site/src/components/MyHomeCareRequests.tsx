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

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="my-appointments-section" style={{ '--bs-primary': '#0299BE', '--bs-primary-rgb': '2, 153, 190' } as React.CSSProperties}>
            <div className="section-header mb-4">
                <h3>My Home Care Requests</h3>
                <p>Track the status of your home care visits and payments.</p>
            </div>

            {requests.length === 0 ? (
                <div className="text-center py-5 bg-light rounded-3">
                    <i className="bi bi-calendar-x text-muted" style={{ fontSize: '3rem' }}></i>
                    <h5 className="mt-3">No Home Care Requests Found</h5>
                    <p className="text-muted">You haven't booked any home care services yet.</p>
                    <a href="/home-care" className="btn btn-primary mt-2">Book a Home Visit</a>
                </div>
            ) : (
                <div className="row g-4">
                    {requests.map((request) => (
                        <div key={request.id} className="col-12">
                            <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
                                <div className="card-header bg-white border-bottom-0 py-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                                    <h6 className="mb-0 fw-bold d-flex align-items-center gap-2">
                                        <i className="bi bi-house-heart-fill text-primary fs-5"></i>
                                        Home Visit Request
                                    </h6>
                                    {getStatusBadge(request.status)}
                                </div>
                                <div className="card-body bg-light bg-opacity-10">
                                    <div className="row g-4">
                                        <div className="col-md-4">
                                            <small className="text-uppercase text-muted fw-bold" style={{ fontSize: '0.75rem' }}>Patient Details</small>
                                            <div className="mt-2">
                                                <p className="mb-1 fw-bold text-dark">{request.name}</p>
                                                <p className="mb-1 text-muted small"><i className="bi bi-phone me-1"></i> {request.phone}</p>
                                                <p className="mb-0 text-muted small"><i className="bi bi-geo-alt me-1"></i> {request.address || 'Address not provided'}</p>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <small className="text-uppercase text-muted fw-bold" style={{ fontSize: '0.75rem' }}>Service Information</small>
                                            <div className="mt-2">
                                                <div className="mb-2">
                                                    {getServiceNames(request.services_requested).map((svc: string, i: number) => (
                                                        <span key={i} className="badge bg-white text-primary border me-1 mb-1">{svc}</span>
                                                    ))}
                                                </div>
                                                <p className="mb-0 text-dark small">
                                                    <i className="bi bi-clock me-1 text-primary"></i>
                                                    <strong>Scheduled for:</strong><br />
                                                    {request.preferred_date ? formatDate(request.preferred_date) : 'Date Pending'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <small className="text-uppercase text-muted fw-bold" style={{ fontSize: '0.75rem' }}>Payment Status</small>
                                            <div className="mt-2">
                                                {request.bill ? (
                                                    <div className="p-3 bg-white rounded-3 border">
                                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                                            <span className="small text-muted">Total Amount</span>
                                                            <span className="fw-bold text-dark">${parseFloat(request.bill.total_amount.toString()).toFixed(2)}</span>
                                                        </div>
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <span className="small text-muted">Status</span>
                                                            <span className={`badge ${request.bill.status === 'paid' ? 'bg-success' :
                                                                request.bill.status === 'partially_paid' ? 'bg-warning' : 'bg-danger'
                                                                } bg-opacity-10 text-${request.bill.status === 'paid' ? 'success' :
                                                                    request.bill.status === 'partially_paid' ? 'warning' : 'danger'
                                                                } border border-${request.bill.status === 'paid' ? 'success' :
                                                                    request.bill.status === 'partially_paid' ? 'warning' : 'danger'
                                                                }`}>
                                                                {request.bill.status === 'finalized' ? 'UNPAID' : request.bill.status.toUpperCase().replace('_', ' ')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="p-3 bg-light rounded-3 border border-dashed text-center">
                                                        <small className="text-muted">No bill generated yet.</small>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-footer bg-white py-3 border-top-0 d-flex justify-content-end">
                                    <small className="text-muted me-auto align-self-center">
                                        Requested on {new Date(request.created_at).toLocaleDateString()}
                                    </small>
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
