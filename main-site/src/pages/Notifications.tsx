import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNotifications, type Notification, type NotificationFilters } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { motion, AnimatePresence } from 'framer-motion';

type ReadFilter = 'all' | 'unread' | 'read';

// Framer Motion Variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring' as const, stiffness: 300 as const, damping: 24 as const }
    },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 as const } }
} as const;

const Notifications: React.FC = () => {
    const {
        notifications,
        unreadCount,
        loading,
        error,
        stats,
        markAsRead,
        markAllAsRead,
        clearAllNotifications,
        fetchNotifications,
        fetchStats,
        hasMoreNotifications
    } = useNotifications();
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();

    const [readFilter, setReadFilter] = useState<ReadFilter>('all');
    const [activeType, setActiveType] = useState<string>('all');
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate('/sign-in');
        }
    }, [isAuthenticated, isLoading, navigate]);

    const typeOptions = useMemo(() => {
        const fromStats = stats?.by_type ? Object.keys(stats.by_type) : [];
        const fromList = notifications.map((n) => n.data?.type).filter(Boolean) as string[];
        return ['all', ...Array.from(new Set([...fromStats, ...fromList]))];
    }, [stats, notifications]);

    const categoryOptions = useMemo(() => {
        const fromStats = stats?.by_category ? Object.keys(stats.by_category) : [];
        const fromList = notifications.map((n) => n.data?.category).filter(Boolean) as string[];
        return ['all', ...Array.from(new Set([...fromStats, ...fromList]))];
    }, [stats, notifications]);

    const buildApiFilters = useCallback((): NotificationFilters => {
        const filters: NotificationFilters = {};
        if (activeType !== 'all') filters.type = activeType;
        if (activeCategory !== 'all') filters.category = activeCategory;
        if (readFilter === 'unread') filters.unread = true;
        return filters;
    }, [activeType, activeCategory, readFilter]);

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchStats();
    }, [isAuthenticated, fetchStats]);

    useEffect(() => {
        if (!isAuthenticated) return;
        setCurrentPage(1);
        fetchNotifications(1, buildApiFilters());
    }, [isAuthenticated, buildApiFilters, fetchNotifications]);

    const filteredNotifications = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();

        return notifications.filter((notification) => {
            const isUnread = !notification.read_at;
            const readMatch = readFilter !== 'read' || !isUnread;
            const title = String(notification.data?.title || '').toLowerCase();
            const message = String(notification.data?.message || '').toLowerCase();
            const searchMatch = !query || title.includes(query) || message.includes(query);

            return readMatch && searchMatch;
        });
    }, [notifications, readFilter, searchTerm]);

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.read_at) {
            markAsRead(notification.id);
        }
        navigate(`/notifications/${notification.id}`);
    };

    const handleLoadMore = async () => {
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        await fetchNotifications(nextPage, buildApiFilters());
    };

    const resetFilters = () => {
        setReadFilter('all');
        setActiveType('all');
        setActiveCategory('all');
        setSearchTerm('');
    };

    const getTypeIcon = (type?: string) => {
        switch (type) {
            case 'alert': return 'bi-exclamation-triangle-fill text-warning';
            case 'appointment': return 'bi-calendar-event-fill text-primary';
            case 'success': return 'bi-check-circle-fill text-success';
            default: return 'bi-bell-fill text-info';
        }
    };

    if (isLoading) return null;

    return (
        <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="notifications-page section-bg"
            style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '80px', backgroundColor: '#f8fafc' }}
        >
            <div className="container" style={{ maxWidth: '1000px' }}>
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-5 text-center text-md-start"
                >
                    <h2 className="fw-bold mb-2" style={{ color: '#0f172a' }}>Notification Center</h2>
                    <p className="text-muted">Stay updated with your healthcare journey. Manage alerts and activity seamlessly.</p>
                </motion.div>

                {/* Dashboard Filters Card */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                    className="notification-filter-wrap mb-5 bg-white rounded-4 shadow-sm p-4"
                >
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 border-bottom pb-3">
                        <div>
                            <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                                <i className="bi bi-funnel text-primary"></i> Filter & Search
                            </h5>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-light text-dark border px-3 py-2 rounded-pill shadow-sm">
                                <i className="bi bi-bell me-1"></i> {notifications.length} Total
                            </span>
                            {unreadCount > 0 && (
                                <motion.span
                                    initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                                    className="badge bg-primary px-3 py-2 rounded-pill shadow-sm"
                                >
                                    <i className="bi bi-dot"></i> {unreadCount} Unread
                                </motion.span>
                            )}
                        </div>
                    </div>

                    <div className="row g-4">
                        <div className="col-12 col-md-4">
                            <div className="notification-search-wrap">
                                <i className="bi bi-search"></i>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search notifications..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="col-12 col-md-8">
                            <div className="d-flex flex-wrap gap-2">
                                {['all', 'unread', 'read'].map((status) => (
                                    <motion.button
                                        key={status}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`btn-notif-filter ${readFilter === status ? 'active' : ''}`}
                                        onClick={() => setReadFilter(status as ReadFilter)}
                                    >
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </motion.button>
                                ))}

                                <div className="vr d-none d-md-block mx-2 text-muted"></div>

                                {typeOptions.map((type) => (
                                    <motion.button
                                        key={type}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`btn-notif-filter ${activeType === type ? 'active' : ''}`}
                                        onClick={() => setActiveType(type)}
                                    >
                                        {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mt-4 pt-3 border-top">
                        <div className="d-flex flex-wrap gap-2 mb-3 mb-md-0">
                            {categoryOptions.map((category) => (
                                <button
                                    key={category}
                                    className={`btn-notif-filter category-filter ${activeCategory === category ? 'active' : ''}`}
                                    onClick={() => setActiveCategory(category)}
                                >
                                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                                </button>
                            ))}
                        </div>
                        <button className="btn btn-light btn-sm rounded-pill px-3 text-muted fw-semibold" onClick={resetFilters}>
                            <i className="bi bi-arrow-clockwise me-1"></i> Reset
                        </button>
                    </div>
                </motion.div>

                {/* Main Notifications List */}
                <div className="d-flex justify-content-between align-items-end mb-3 px-2">
                    <h5 className="mb-0 fw-bold text-secondary">
                        Recent Activity <span className="text-muted fs-6 fw-normal ms-2">({filteredNotifications.length} results)</span>
                    </h5>
                    {notifications.length > 0 && (
                        <div className="d-flex gap-2">
                            {unreadCount > 0 && (
                                <button className="btn btn-link text-primary text-decoration-none btn-sm p-0 fw-semibold" onClick={markAllAsRead}>
                                    Mark All Read
                                </button>
                            )}
                            <button
                                className="btn btn-link text-danger text-decoration-none btn-sm p-0 fw-semibold ms-3"
                                onClick={() => window.confirm('Clear all notifications?') && clearAllNotifications()}
                            >
                                Clear All
                            </button>
                        </div>
                    )}
                </div>

                {loading ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-5">
                        <div className="spinner-border text-primary" role="status"></div>
                        <p className="mt-3 text-muted fw-medium">Fetching your updates...</p>
                    </motion.div>
                ) : error ? (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-5 bg-white rounded-4 shadow-sm">
                        <i className="bi bi-exclamation-triangle text-danger" style={{ fontSize: '2.5rem' }}></i>
                        <h5 className="mt-3 fw-bold">Oops! Something went wrong</h5>
                        <p className="text-muted mb-0">{error}</p>
                    </motion.div>
                ) : filteredNotifications.length === 0 ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-5 bg-white rounded-4 shadow-sm">
                        <div className="mb-3">
                            <i className="bi bi-bell-slash text-light" style={{ fontSize: '4rem', color: '#cbd5e1' }}></i>
                        </div>
                        <h4 className="fw-bold text-dark">All caught up!</h4>
                        <p className="text-muted mb-0">
                            {notifications.length === 0
                                ? "You have no notifications at the moment."
                                : "No notifications match your current filters."}
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="notifications-list"
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredNotifications.map((notification) => (
                                <motion.div
                                    layout
                                    variants={itemVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    key={notification.id}
                                    whileHover={{ scale: 1.01, translateY: -2 }}
                                    className={`notification-card card border-0 shadow-sm rounded-4 mb-3 overflow-hidden ${!notification.read_at ? 'unread-card' : ''}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="card-body p-4 d-flex align-items-start gap-4 position-relative">
                                        {!notification.read_at && (
                                            <div className="unread-indicator position-absolute top-0 start-0 h-100 bg-primary" style={{ width: '4px' }}></div>
                                        )}

                                        <div className={`flex-shrink-0 d-flex align-items-center justify-content-center rounded-circle notif-icon ${!notification.read_at ? 'bg-primary-subtle' : 'bg-light'}`}>
                                            <i className={`bi ${getTypeIcon(notification.data?.type)} fs-4`}></i>
                                        </div>

                                        <div className="flex-grow-1">
                                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-1">
                                                <h6 className={`mb-0 ${!notification.read_at ? 'fw-bold text-dark' : 'text-secondary fw-semibold'}`}>
                                                    {notification.data?.title}
                                                </h6>
                                                <span className="text-muted small fw-medium d-flex align-items-center gap-1">
                                                    <i className="bi bi-clock"></i> {moment(notification.created_at).fromNow()}
                                                </span>
                                            </div>

                                            <p className={`mb-3 ${!notification.read_at ? 'text-dark' : 'text-muted'}`}>
                                                {notification.data?.message}
                                            </p>

                                            <div className="d-flex flex-wrap align-items-center gap-2">
                                                {notification.data?.type && (
                                                    <span className="badge bg-light text-secondary border px-2 py-1 rounded-pill text-capitalize">
                                                        {notification.data.type}
                                                    </span>
                                                )}
                                                {notification.data?.category && (
                                                    <span className="badge bg-light text-secondary border px-2 py-1 rounded-pill text-capitalize">
                                                        {notification.data.category}
                                                    </span>
                                                )}
                                                {notification.data?.action_url && (
                                                    <span className="text-primary small fw-bold ms-auto action-text">
                                                        View details <i className="bi bi-arrow-right-short fs-5 align-middle"></i>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}

                {!loading && hasMoreNotifications && notifications.length >= 20 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-4">
                        <button className="btn btn-outline-primary rounded-pill px-4 py-2 fw-semibold shadow-sm" onClick={handleLoadMore}>
                            Load More Notifications
                        </button>
                    </motion.div>
                )}
            </div>

            <style>{`
                /* Global Component Styles */
                .notifications-page {
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                }

                /* Search Input */
                .notification-search-wrap {
                    position: relative;
                }
                .notification-search-wrap i {
                    position: absolute;
                    left: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #94a3b8;
                    font-size: 1.1rem;
                }
                .notification-search-wrap .form-control {
                    background-color: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 0.75rem 1rem 0.75rem 2.5rem;
                    font-size: 0.95rem;
                    transition: all 0.3s ease;
                }
                .notification-search-wrap .form-control:focus {
                    background-color: #fff;
                    border-color: #0ea5e9;
                    box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.1);
                }

                /* Filter Buttons */
                .btn-notif-filter {
                    background: transparent;
                    border: 1px solid #e2e8f0;
                    padding: 0.4rem 1rem;
                    border-radius: 99px;
                    color: #64748b;
                    font-weight: 500;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .btn-notif-filter.category-filter {
                    border-color: transparent;
                    background: #f1f5f9;
                }
                .btn-notif-filter:hover {
                    color: #0f172a;
                    background: #f1f5f9;
                }
                .btn-notif-filter.active {
                    background: #0ea5e9;
                    color: #fff;
                    border-color: #0ea5e9;
                    box-shadow: 0 4px 12px rgba(14, 165, 233, 0.25);
                }

                /* Notification Cards */
                .notification-card {
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 1px solid rgba(0,0,0,0.03) !important;
                }
                .notification-card:hover {
                    box-shadow: 0 12px 24px -4px rgba(0, 0, 0, 0.08) !important;
                }
                .notification-card.unread-card {
                    background-color: #f0f9ff;
                }
                
                /* Notification Icons */
                .notif-icon {
                    width: 56px;
                    height: 56px;
                    transition: all 0.3s ease;
                }
                .notification-card:hover .notif-icon {
                    transform: scale(1.05);
                }

                /* Action Text Animation */
                .action-text i {
                    transition: transform 0.2s ease;
                }
                .notification-card:hover .action-text i {
                    transform: translateX(4px);
                }

                /* Custom Scrollbar for container if needed */
                ::-webkit-scrollbar {
                    width: 6px;
                }
                ::-webkit-scrollbar-track {
                    background: transparent;
                }
                ::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 4px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
        </motion.section>
    );
};

export default Notifications;