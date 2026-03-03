import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { notificationAPI } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import moment from 'moment';
import { motion, type Variants } from 'framer-motion';

type ProfileTab = 'personal' | 'account' | 'security' | 'notifications' | 'appointments' | 'subscriptions' | 'home-care' | 'medical' | 'bills' | 'testimonials';

interface ActionNavigationTarget {
    pathname: string;
    search?: string;
}

const parsePositiveInt = (value: string | null | undefined): number | null => {
    if (!value) return null;
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const firstDefinedString = (...values: unknown[]): string | null => {
    for (const value of values) {
        if (typeof value === 'string' && value.trim()) {
            return value.trim();
        }
    }
    return null;
};

const detectTabFromNotification = (notificationData: any): ProfileTab | null => {
    const category = String(notificationData?.category || '').toLowerCase();
    const type = String(notificationData?.type || '').toLowerCase();
    const title = String(notificationData?.title || '').toLowerCase();
    const message = String(notificationData?.message || '').toLowerCase();
    const combined = `${category} ${type} ${title} ${message}`;

    if (combined.includes('appointment')) return 'appointments';
    if (combined.includes('bill') || combined.includes('billing') || combined.includes('invoice') || combined.includes('payment')) return 'bills';
    if (combined.includes('medical') || combined.includes('clinical') || combined.includes('report') || combined.includes('lab')) return 'medical';
    if (combined.includes('home care') || combined.includes('home-care')) return 'home-care';
    if (combined.includes('subscription') || combined.includes('plan')) return 'subscriptions';
    if (combined.includes('review') || combined.includes('feedback') || combined.includes('testimonial')) return 'testimonials';

    return null;
};

const resolveActionNavigationTarget = (notificationData: any): ActionNavigationTarget => {
    const rawActionUrl = String(notificationData?.action_url || '').trim();
    const metadata = notificationData?.metadata || {};
    const fallbackTab = detectTabFromNotification(notificationData);

    let parsedPathname = '';
    let parsedParams = new URLSearchParams();

    if (rawActionUrl) {
        try {
            const parsedUrl = new URL(rawActionUrl, window.location.origin);
            parsedPathname = parsedUrl.pathname;
            parsedParams = parsedUrl.searchParams;
        } catch (error) {
            parsedPathname = rawActionUrl;
        }
    }

    const lowercasePathname = parsedPathname.toLowerCase();
    const profileParams = new URLSearchParams(parsedParams.toString());
    let tab: ProfileTab | null = null;

    if (parsedPathname.startsWith('/profile')) {
        const tabFromUrl = profileParams.get('tab');
        if (tabFromUrl) tab = tabFromUrl as ProfileTab;
    } else if (lowercasePathname.includes('/patient-profile/appointments') || lowercasePathname.includes('/appointments')) {
        tab = 'appointments';
    } else if (lowercasePathname.includes('/medical-records') || lowercasePathname.includes('/lab')) {
        tab = 'medical';
    } else if (lowercasePathname.includes('/billing') || lowercasePathname.includes('/bills') || lowercasePathname.includes('/invoice') || lowercasePathname.includes('/payment')) {
        tab = 'bills';
    } else if (lowercasePathname.includes('/home-care')) {
        tab = 'home-care';
    } else if (lowercasePathname.includes('/subscription') || lowercasePathname.includes('/health-plans')) {
        tab = 'subscriptions';
    }

    if (!tab && fallbackTab) {
        tab = fallbackTab;
    }

    if (tab) {
        profileParams.set('tab', tab);
    }

    const appointmentId = parsePositiveInt(
        firstDefinedString(
            metadata?.appointment_id,
            metadata?.appointmentId,
            parsedParams.get('appointment_id'),
            parsedParams.get('appointmentId'),
            parsedParams.get('apptId'),
            lowercasePathname.match(/appointments\/(\d+)/)?.[1]
        )
    );
    const recordId = parsePositiveInt(
        firstDefinedString(
            metadata?.record_id,
            metadata?.recordId,
            metadata?.medical_report_id,
            metadata?.medicalReportId,
            parsedParams.get('record_id'),
            parsedParams.get('recordId'),
            parsedParams.get('medical_report_id'),
            parsedParams.get('medicalReportId'),
            lowercasePathname.match(/medical-records\/(\d+)/)?.[1]
        )
    );
    const billId = parsePositiveInt(
        firstDefinedString(
            metadata?.bill_id,
            metadata?.billId,
            metadata?.invoice_id,
            metadata?.invoiceId,
            parsedParams.get('bill_id'),
            parsedParams.get('billId'),
            parsedParams.get('invoice_id'),
            parsedParams.get('invoiceId'),
            lowercasePathname.match(/bills\/(\d+)/)?.[1]
        )
    );

    if (appointmentId) profileParams.set('appointmentId', String(appointmentId));
    if (recordId) profileParams.set('recordId', String(recordId));
    if (billId) profileParams.set('billId', String(billId));

    if (tab || rawActionUrl.startsWith('/profile')) {
        const search = profileParams.toString();
        return { pathname: '/profile', search: search ? `?${search}` : '' };
    }

    if (rawActionUrl.startsWith('http://') || rawActionUrl.startsWith('https://')) {
        return { pathname: rawActionUrl };
    }

    return { pathname: parsedPathname || rawActionUrl || '/profile' };
};

// Framer Motion Variants
const pageVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    },
    exit: { opacity: 0, y: -20 }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 300, damping: 28 }
    }
};

const NotificationDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { markAsRead, deleteNotification } = useNotifications();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const [notification, setNotification] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/sign-in');
        }
    }, [isAuthenticated, authLoading, navigate]);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                if (!id) return;
                const response = await notificationAPI.getById(id);
                if (response.data.status) {
                    setNotification(response.data.data);
                    if (!response.data.data.read_at) {
                        markAsRead(id);
                    }
                }
            } catch (error) {
                console.error('Error fetching notification details:', error);
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchDetails();
        }
    }, [id, isAuthenticated, markAsRead]);

    const getTypeDetails = (type?: string) => {
        switch (type) {
            case 'alert': return { icon: 'bi-exclamation-triangle-fill', color: 'text-warning', bg: 'bg-warning-subtle' };
            case 'appointment': return { icon: 'bi-calendar-event-fill', color: 'text-primary', bg: 'bg-primary-subtle' };
            case 'success': return { icon: 'bi-check-circle-fill', color: 'text-success', bg: 'bg-success-subtle' };
            default: return { icon: 'bi-bell-fill', color: 'text-info', bg: 'bg-info-subtle' };
        }
    };

    const handleActionClick = () => {
        const target = resolveActionNavigationTarget(notification.data || {});
        if (target.pathname.startsWith('http://') || target.pathname.startsWith('https://')) {
            window.location.assign(target.pathname);
            return;
        }

        if (target.search) {
            navigate(`${target.pathname}${target.search}`);
            return;
        }

        navigate(target.pathname);
    };

    if (authLoading || loading) {
        return (
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="d-flex flex-column justify-content-center align-items-center"
                style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}
            >
                <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted fw-medium">Loading notification details...</p>
            </motion.div>
        );
    }

    if (!notification) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="container text-center d-flex flex-column justify-content-center align-items-center"
                style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}
            >
                <div className="bg-white p-5 rounded-4 shadow-sm" style={{ maxWidth: '500px', width: '100%' }}>
                    <i className="bi bi-file-earmark-x text-muted mb-3 d-block" style={{ fontSize: '4rem' }}></i>
                    <h3 className="fw-bold text-dark mb-2">Notification Not Found</h3>
                    <p className="text-muted mb-4">The notification you are looking for might have been deleted or doesn't exist.</p>
                    <button className="btn btn-primary rounded-pill px-4 py-2 fw-semibold" onClick={() => navigate('/notifications')}>
                        <i className="bi bi-arrow-left me-2"></i> Back to Notifications
                    </button>
                </div>
            </motion.div>
        );
    }

    const typeDetails = getTypeDetails(notification.data?.type);

    return (
        <motion.section
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={pageVariants}
            className="notification-details-page section-bg"
            style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '80px', backgroundColor: '#f8fafc' }}
        >
            <div className="container" style={{ maxWidth: '850px' }}>
                <div className="row justify-content-center">
                    <div className="col-12">
                        {/* Breadcrumb Navigation */}
                        <motion.nav variants={itemVariants} aria-label="breadcrumb" className="mb-4">
                            <ol className="breadcrumb align-items-center bg-white px-4 py-3 rounded-pill shadow-sm border" style={{ width: 'fit-content' }}>
                                <li className="breadcrumb-item">
                                    <a href="#" className="text-decoration-none text-muted fw-medium breadcrumb-link" onClick={(e) => { e.preventDefault(); navigate('/notifications'); }}>
                                        <i className="bi bi-bell me-1"></i> Notifications
                                    </a>
                                </li>
                                <li className="breadcrumb-item active fw-bold text-dark" aria-current="page">Details</li>
                            </ol>
                        </motion.nav>

                        {/* Main Detail Card */}
                        <motion.div variants={itemVariants} className="card shadow-sm border-0 rounded-4 overflow-hidden detail-card">
                            <div className="card-body p-4 p-md-5">
                                {/* Header Section */}
                                <div className="d-flex flex-column flex-sm-row align-items-sm-center gap-4 mb-4">
                                    <div className={`flex-shrink-0 rounded-circle d-flex align-items-center justify-content-center ${typeDetails.bg} ${typeDetails.color}`} style={{ width: '70px', height: '70px' }}>
                                        <i className={`bi ${typeDetails.icon}`} style={{ fontSize: '1.8rem' }}></i>
                                    </div>
                                    <div className="flex-grow-1">
                                        <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                                            {notification.data?.type && (
                                                <span className="badge bg-light text-secondary border px-2 py-1 rounded-pill text-capitalize fw-medium">
                                                    {notification.data.type}
                                                </span>
                                            )}
                                            {notification.data?.category && (
                                                <span className="badge bg-light text-secondary border px-2 py-1 rounded-pill text-capitalize fw-medium">
                                                    {notification.data.category}
                                                </span>
                                            )}
                                            <span className={`badge rounded-pill ms-auto ${notification.read_at ? 'bg-success-subtle text-success' : 'bg-primary-subtle text-primary'} px-3 py-1 text-uppercase fw-bold`} style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                                                {notification.read_at ? 'Read' : 'New'}
                                            </span>
                                        </div>
                                        <h2 className="mb-2 fw-bold text-dark h3">{notification.data?.title}</h2>
                                        <p className="text-muted mb-0 small d-flex align-items-center flex-wrap gap-2">
                                            <span><i className="bi bi-calendar3 me-1"></i> {moment(notification.created_at).format('MMMM Do YYYY')}</span>
                                            <span className="d-none d-sm-inline text-light-gray">•</span>
                                            <span><i className="bi bi-clock me-1"></i> {moment(notification.created_at).format('h:mm A')}</span>
                                            <span className="d-none d-sm-inline text-light-gray">•</span>
                                            <span className="text-primary fw-medium">{moment(notification.created_at).fromNow()}</span>
                                        </p>
                                    </div>
                                </div>

                                <hr className="border-light-gray my-4" />

                                {/* Message Content */}
                                <motion.div variants={itemVariants} className="notification-content mb-5">
                                    <p className="fs-5 text-secondary" style={{ lineHeight: '1.8', whiteSpace: 'pre-line' }}>
                                        {notification.data?.message}
                                    </p>
                                </motion.div>

                                {/* Action Box (If Applicable) */}
                                {notification.data?.action_url && (
                                    <motion.div variants={itemVariants} className="action-box p-4 rounded-4 border-start border-4 border-primary mb-5 bg-primary-subtle position-relative overflow-hidden">
                                        <div className="position-relative z-1">
                                            <h5 className="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
                                                <i className="bi bi-lightning-charge-fill text-primary"></i> Action Required
                                            </h5>
                                            <p className="text-secondary mb-4" style={{ fontSize: '0.95rem' }}>
                                                There is a specific action related to this update that requires your attention. Click below to proceed.
                                            </p>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="btn btn-primary rounded-pill px-4 py-2 shadow-sm fw-semibold d-inline-flex align-items-center gap-2"
                                                onClick={handleActionClick}
                                            >
                                                View Relevant Record <i className="bi bi-arrow-right"></i>
                                            </motion.button>
                                        </div>
                                        <i className="bi bi-link-45deg position-absolute text-white opacity-50" style={{ fontSize: '10rem', right: '-20px', bottom: '-40px', transform: 'rotate(-15deg)' }}></i>
                                    </motion.div>
                                )}

                                {/* Footer Actions */}
                                <motion.div variants={itemVariants} className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 pt-4 border-top">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                        className="btn btn-light border rounded-pill px-4 py-2 text-secondary fw-semibold w-100 w-sm-auto"
                                        onClick={() => navigate('/notifications')}
                                    >
                                        <i className="bi bi-arrow-left me-2"></i> Back to List
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                        className="btn btn-outline-danger rounded-pill px-4 py-2 fw-semibold w-100 w-sm-auto"
                                        onClick={async () => {
                                            if (window.confirm('Are you sure you want to delete this notification?')) {
                                                await deleteNotification(notification.id);
                                                navigate('/notifications');
                                            }
                                        }}
                                    >
                                        <i className="bi bi-trash me-2"></i> Delete
                                    </motion.button>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            <style>{`
                /* Global Component Styles */
                .notification-details-page {
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                }

                /* Breadcrumb styling */
                .breadcrumb-link {
                    transition: color 0.2s ease;
                }
                .breadcrumb-link:hover {
                    color: #0ea5e9 !important;
                }
                .breadcrumb-item + .breadcrumb-item::before {
                    content: "›";
                    font-size: 1.2rem;
                    vertical-align: middle;
                    line-height: 1;
                    color: #cbd5e1;
                }

                /* Card Styling */
                .detail-card {
                    border: 1px solid rgba(0,0,0,0.04) !important;
                    box-shadow: 0 20px 40px -15px rgba(0,0,0,0.05) !important;
                }

                /* Text & Borders */
                .text-light-gray {
                    color: #cbd5e1;
                }
                .border-light-gray {
                    border-color: #f1f5f9 !important;
                }

                /* Action Box */
                .action-box {
                    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                    transition: all 0.3s ease;
                }
                .action-box:hover {
                    box-shadow: 0 10px 25px -5px rgba(14, 165, 233, 0.15);
                }

                /* Utility for responsive buttons */
                @media (min-width: 576px) {
                    .w-sm-auto {
                        width: auto !important;
                    }
                }
            `}</style>
        </motion.section>
    );
};

export default NotificationDetails;
