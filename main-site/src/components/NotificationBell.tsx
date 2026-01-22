import { useNotifications } from '../context/NotificationContext';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const navigate = useNavigate();

    return (
        <div className="dropdown me-2 me-lg-3">
            <button
                className="btn btn-link p-0 position-relative text-dark text-decoration-none dropdown-toggle no-caret"
                type="button"
                id="notificationDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
            >
                <i className="bi bi-bell fs-5"></i>
                {unreadCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem', padding: '0.25em 0.4em' }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 rounded-4 mt-3 p-0 pb-2 overflow-hidden" aria-labelledby="notificationDropdown" style={{ width: '320px', maxHeight: '420px', zIndex: 1050 }}>
                <li className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
                    <h6 className="m-0 fw-bold" style={{ color: '#012970' }}>Notifications</h6>
                    {unreadCount > 0 && (
                        <button
                            className="btn btn-link btn-sm p-0 text-decoration-none fw-semibold"
                            style={{ fontSize: '0.75rem', color: '#049EBB' }}
                            onClick={(e) => { e.stopPropagation(); markAllAsRead(); }}
                        >
                            Mark all as read
                        </button>
                    )}
                </li>
                <div className="overflow-y-auto" style={{ maxHeight: '350px' }}>
                    {notifications.length === 0 ? (
                        <li className="p-5 text-center text-muted">
                            <i className="bi bi-bell-slash d-block fs-1 mb-2 opacity-25"></i>
                            <small className="fw-medium">No new notifications</small>
                        </li>
                    ) : (
                        notifications.map((notif: any) => (
                            <li
                                key={notif.id}
                                className={`border-bottom notification-item transition-all ${!notif.read_at ? 'bg-info bg-opacity-10' : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (!notif.read_at) markAsRead(notif.id);
                                    navigate(`/notifications/${notif.id}`);
                                }}
                            >
                                <div className="p-3 hover-bg-light">
                                    <div className="d-flex justify-content-between align-items-start mb-1 gap-2">
                                        <span className={`fw-bold small ${!notif.read_at ? 'text-dark' : 'text-secondary'}`} style={{ fontSize: '0.85rem' }}>
                                            {notif.data?.title}
                                        </span>
                                        <small className="text-muted shrink-0" style={{ fontSize: '0.65rem' }}>
                                            {moment(notif.created_at).fromNow()}
                                        </small>
                                    </div>
                                    <p className="mb-0 small text-secondary line-clamp-2" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                                        {notif.data?.message}
                                    </p>
                                </div>
                            </li>
                        ))
                    )}
                </div>
                <li className="p-2 text-center border-top">
                    <button
                        className="btn btn-link btn-sm text-decoration-none fw-bold"
                        style={{ fontSize: '0.75rem', color: '#049EBB' }}
                        onClick={() => navigate('/notifications')}
                    >
                        See all notifications
                    </button>
                </li>
            </ul>
            <style>{`
                .no-caret::after { display: none !important; }
                .notification-item { cursor: pointer; border-left: 3px solid transparent; }
                .notification-item:hover { background-color: #f8f9fa !important; }
                .notification-item.bg-info.bg-opacity-10 { border-left-color: #049EBB; }
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .hover-bg-light:hover { background-color: rgba(0,0,0,0.02); }
            `}</style>
        </div>
    );
};

export default NotificationBell;
