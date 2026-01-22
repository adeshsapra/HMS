import React, { useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

const Notifications: React.FC = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearAllNotifications } = useNotifications();
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate('/sign-in');
        }
    }, [isAuthenticated, isLoading, navigate]);

    const handleNotificationClick = (notification: any) => {
        if (!notification.read_at) {
            markAsRead(notification.id);
        }
        navigate(`/notifications/${notification.id}`);
    };

    if (isLoading) return null;

    return (
        <section className="notifications-page section-bg" style={{ minHeight: '80vh', paddingTop: '120px', paddingBottom: '60px' }}>
            <div className="container" data-aos="fade-up">
                <div className="section-title">
                    <h2>Notification Center</h2>
                    <p>Stay updated with your healthcare journey. Manage your alerts and activity here.</p>
                </div>

                <div className="row justify-content-center">
                    <div className="col-lg-10">
                        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                            <div className="card-header bg-white border-0 py-4 px-4 d-flex justify-content-between align-items-center">
                                <div>
                                    <h5 className="mb-0 fw-bold">Recent Notifications</h5>
                                    <span className="text-muted small">You have {unreadCount} unread messages</span>
                                </div>
                                {notifications.length > 0 && (
                                    <div className="d-flex gap-2">
                                        {unreadCount > 0 && (
                                            <button
                                                className="btn btn-outline-primary btn-sm rounded-pill px-3"
                                                onClick={markAllAsRead}
                                            >
                                                <i className="bi bi-check2-all me-1"></i> Mark All as Read
                                            </button>
                                        )}
                                        <button
                                            className="btn btn-outline-danger btn-sm rounded-pill px-3"
                                            onClick={() => {
                                                if (window.confirm("Are you sure you want to delete all notifications?")) {
                                                    clearAllNotifications();
                                                }
                                            }}
                                        >
                                            <i className="bi bi-trash me-1"></i> Clear All
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="card-body p-0">
                                {notifications.length === 0 ? (
                                    <div className="text-center py-5">
                                        <div className="mb-3">
                                            <i className="bi bi-bell-slash text-muted" style={{ fontSize: '3rem' }}></i>
                                        </div>
                                        <h4 className="text-muted">No notifications yet</h4>
                                        <p className="text-muted small">We'll notify you here when there's an update on your activity.</p>
                                    </div>
                                ) : (
                                    <div className="list-group list-group-flush">
                                        {notifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                className={`list-group-item list-group-item-action border-0 px-4 py-4 d-flex align-items-start gap-3 transition-colors ${!notification.read_at ? 'bg-light border-start border-primary border-4' : ''}`}
                                                style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                                                onClick={() => handleNotificationClick(notification)}
                                            >
                                                <div className={`flex-shrink-0 d-flex align-items-center justify-content-center rounded-circle ${!notification.read_at ? 'bg-primary text-white' : 'bg-light text-muted'}`} style={{ width: '48px', height: '48px' }}>
                                                    <i className={`bi ${notification.data?.type === 'alert' ? 'bi-exclamation-triangle' : notification.data?.type === 'appointment' ? 'bi-calendar-event' : 'bi-bell'}`} style={{ fontSize: '1.2rem' }}></i>
                                                </div>
                                                <div className="flex-grow-1">
                                                    <div className="d-flex justify-content-between align-items-start mb-1">
                                                        <h6 className={`mb-0 ${!notification.read_at ? 'fw-bold' : ''}`}>
                                                            {notification.data?.title}
                                                        </h6>
                                                        <span className="text-muted extra-small" style={{ fontSize: '0.75rem' }}>
                                                            {moment(notification.created_at).calendar()}
                                                        </span>
                                                    </div>
                                                    <p className="text-muted small mb-0">
                                                        {notification.data?.message}
                                                    </p>

                                                    {notification.data?.action_url && (
                                                        <div className="mt-2">
                                                            <span className="text-primary small fw-semibold">View details <i className="bi bi-arrow-right small ms-1"></i></span>
                                                        </div>
                                                    )}
                                                </div>
                                                {!notification.read_at && (
                                                    <div className="flex-shrink-0 align-self-center ms-2">
                                                        <div className="bg-primary rounded-circle" style={{ width: '10px', height: '10px' }}></div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {notifications.length > 10 && (
                                <div className="card-footer bg-white border-0 py-3 text-center">
                                    <button className="btn btn-link text-decoration-none text-muted small">Load more notifications</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Notifications;
