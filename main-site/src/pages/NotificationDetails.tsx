import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { notificationAPI } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import moment from 'moment';

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
    }, [id, isAuthenticated]);

    if (authLoading || loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!notification) {
        return (
            <div className="container text-center" style={{ minHeight: '80vh', paddingTop: '150px' }}>
                <h3>Notification not found</h3>
                <button className="btn btn-primary mt-3" onClick={() => navigate('/notifications')}>
                    Back to Notifications
                </button>
            </div>
        );
    }

    return (
        <section className="notification-details-page section-bg" style={{ minHeight: '80vh', paddingTop: '120px', paddingBottom: '60px' }}>
            <div className="container" data-aos="fade-up">
                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <nav aria-label="breadcrumb" className="mb-4">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><a href="#" onClick={(e) => { e.preventDefault(); navigate('/notifications'); }}>Notifications</a></li>
                                <li className="breadcrumb-item active" aria-current="page">Detail</li>
                            </ol>
                        </nav>

                        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
                            <div className="card-body p-5">
                                <div className="d-flex align-items-center gap-3 mb-4">
                                    <div className={`rounded-circle d-flex align-items-center justify-content-center bg-light text-primary`} style={{ width: '60px', height: '60px' }}>
                                        <i className={`bi ${notification.data?.type === 'alert' ? 'bi-exclamation-triangle' : notification.data?.type === 'appointment' ? 'bi-calendar-event' : 'bi-bell'}`} style={{ fontSize: '1.5rem' }}></i>
                                    </div>
                                    <div>
                                        <h2 className="mb-1 fw-bold h3">{notification.data?.title}</h2>
                                        <p className="text-muted mb-0 small">
                                            <i className="bi bi-clock me-1"></i>
                                            {moment(notification.created_at).format('LLL')} ({moment(notification.created_at).fromNow()})
                                        </p>
                                    </div>
                                </div>

                                <hr className="opacity-10 my-4" />

                                <div className="notification-content mb-5">
                                    <p className="lead text-dark" style={{ lineHeight: '1.6' }}>
                                        {notification.data?.message}
                                    </p>
                                </div>

                                {notification.data?.action_url && (
                                    <div className="bg-light p-4 rounded-3 border-start border-primary border-4 mb-4">
                                        <h5 className="fw-bold mb-2">Action Required</h5>
                                        <p className="text-muted small mb-3">There is a specific action related to this update that requires your attention.</p>
                                        <button
                                            className="btn btn-primary btn-lg rounded-pill px-4"
                                            onClick={() => navigate(notification.data.action_url)}
                                        >
                                            View Relevant Record <i className="bi bi-arrow-right ms-2"></i>
                                        </button>
                                    </div>
                                )}

                                <div className="d-flex justify-content-between align-items-center mt-5 pt-4 border-top">
                                    <div className="d-flex gap-2">
                                        <button className="btn btn-outline-secondary rounded-pill px-4 shadow-sm" onClick={() => navigate('/notifications')}>
                                            <i className="bi bi-arrow-left me-2"></i> Back
                                        </button>
                                        <button
                                            className="btn btn-outline-danger rounded-pill px-4 shadow-sm"
                                            onClick={async () => {
                                                if (window.confirm('Delete this notification?')) {
                                                    await deleteNotification(notification.id);
                                                    navigate('/notifications');
                                                }
                                            }}
                                        >
                                            <i className="bi bi-trash me-2"></i> Delete
                                        </button>
                                    </div>
                                    <span className={`badge rounded-pill ${notification.read_at ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'} px-3 py-2 uppercase`}>
                                        {notification.read_at ? 'Read' : 'Unread'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default NotificationDetails;
