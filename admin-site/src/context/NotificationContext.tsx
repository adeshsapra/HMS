import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import apiService from '@/services/api';
import { useAuth } from './AuthContext';

interface NotificationData {
    title: string;
    message: string;
    type: string;
    priority?: string;
    category?: string;
    action_url?: string;
    metadata?: any;
    [key: string]: any;
}

export interface Notification {
    id: string;
    data: NotificationData;
    read_at: string | null;
    created_at: string;
}

interface NotificationStats {
    total: number;
    unread: number;
    read: number;
    by_category?: Record<string, number>;
    by_type?: Record<string, number>;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    error: string | null;
    isConnected: boolean;
    stats: NotificationStats | null;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    clearAllNotifications: () => Promise<void>;
    fetchNotifications: (page?: number) => Promise<void>;
    fetchStats: () => Promise<void>;
    requestBrowserPermission: () => Promise<boolean>;
    hasMoreNotifications: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Notification sound (data URL for a simple beep)
const NOTIFICATION_SOUND = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDGH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxm8gBS';

// Global flags to prevent duplicate calls across multiple mounts (StrictMode)
let isInitialFetchPending = false;
let initialFetchPromise: Promise<any> | null = null;

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [stats, setStats] = useState<NotificationStats | null>(null);
    const [hasMoreNotifications, setHasMoreNotifications] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const { user } = useAuth();
    const echoRef = useRef<Echo<any> | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const notificationSoundEnabled = useRef(true);
    const browserNotificationEnabled = useRef(false);
    const fetchInProgress = useRef(false); // Prevent duplicate fetch calls

    // Initialize audio element
    useEffect(() => {
        audioRef.current = new Audio(NOTIFICATION_SOUND);
        audioRef.current.volume = 0.5;
        
        // Check browser notification permission
        if ('Notification' in window && Notification.permission === 'granted') {
            browserNotificationEnabled.current = true;
        }
        
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const playNotificationSound = useCallback(() => {
        if (notificationSoundEnabled.current && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(err => console.log('Audio play failed:', err));
        }
    }, []);

    const showBrowserNotification = useCallback((notification: Notification) => {
        if (!browserNotificationEnabled.current || !('Notification' in window)) return;
        
        if (Notification.permission === 'granted') {
            const notif = new Notification(notification.data.title, {
                body: notification.data.message,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: notification.id,
                requireInteraction: notification.data.priority === 'high',
            });
            
            notif.onclick = () => {
                window.focus();
                notif.close();
                if (notification.data.action_url) {
                    window.location.href = notification.data.action_url;
                }
            };
        }
    }, []);

    const requestBrowserPermission = useCallback(async (): Promise<boolean> => {
        if (!('Notification' in window)) {
            console.warn('Browser does not support notifications');
            return false;
        }
        
        if (Notification.permission === 'granted') {
            browserNotificationEnabled.current = true;
            return true;
        }
        
        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            browserNotificationEnabled.current = permission === 'granted';
            return permission === 'granted';
        }
        
        return false;
    }, []);

    const fetchNotifications = useCallback(async (page: number = 1) => {
        // For page 1 (initial fetch), use global singleton pattern
        if (page === 1) {
            if (isInitialFetchPending) {
                // Wait for the existing promise
                return initialFetchPromise;
            }
            
            isInitialFetchPending = true;
            initialFetchPromise = (async () => {
                try {
                    setLoading(true);
                    setError(null);
                    const response = await apiService.getNotifications(page, 20);
                    if (response.status) {
                        const notifs = response.data?.data || [];
                        setNotifications(notifs);
                        setUnreadCount(response.unread_count || 0);
                        setHasMoreNotifications(notifs.length >= 20);
                        setCurrentPage(page);
                        
                        if (response.stats) {
                            setStats(response.stats);
                        }
                    }
                } catch (err: any) {
                    console.error('Error fetching notifications:', err);
                    setError(err.message || 'Failed to fetch notifications');
                } finally {
                    setLoading(false);
                    isInitialFetchPending = false;
                    initialFetchPromise = null;
                }
            })();
            
            return initialFetchPromise;
        }
        
        // For pagination (page > 1), use ref-based guard
        if (fetchInProgress.current) return;
        
        try {
            fetchInProgress.current = true;
            setLoading(true);
            setError(null);
            const response = await apiService.getNotifications(page, 20);
            if (response.status) {
                const notifs = response.data?.data || [];
                
                // Append and remove duplicates
                setNotifications(prev => {
                    const existingIds = new Set(prev.map(n => n.id));
                    const newNotifs = notifs.filter((n: Notification) => !existingIds.has(n.id));
                    return [...prev, ...newNotifs];
                });
                
                setUnreadCount(response.unread_count || 0);
                setHasMoreNotifications(notifs.length >= 20);
                setCurrentPage(page);
                
                if (response.stats) {
                    setStats(response.stats);
                }
            }
        } catch (err: any) {
            console.error('Error fetching notifications:', err);
            setError(err.message || 'Failed to fetch notifications');
        } finally {
            setLoading(false);
            fetchInProgress.current = false;
        }
    }, []);

    const fetchStats = useCallback(async () => {
        try {
            const response = await apiService.get<any>('/notifications/stats');
            if (response.status) {
                setStats(response.data as NotificationStats);
            }
        } catch (err) {
            console.error('Error fetching notification stats:', err);
        }
    }, []);

    const markAsRead = useCallback(async (id: string) => {
        try {
            await apiService.markNotificationAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
            setError('Failed to mark notification as read');
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            await apiService.markAllNotificationsAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            setError('Failed to mark all notifications as read');
        }
    }, []);

    const deleteNotification = useCallback(async (id: string) => {
        try {
            await apiService.deleteNotification(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            const deleted = notifications.find(n => n.id === id);
            if (deleted && !deleted.read_at) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
            setError('Failed to delete notification');
        }
    }, [notifications]);

    const clearAllNotifications = useCallback(async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/notifications/clear-all`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            });
            if (response.ok) {
                setNotifications([]);
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Error clearing all notifications:', error);
            setError('Failed to clear all notifications');
        }
    }, []);

    // WebSocket connection setup
    useEffect(() => {
        if (!user) return;

        let reconnectTimeout: number;
        let isCleanupCalled = false;

        const initializeEcho = () => {
            try {
                fetchNotifications();

                (window as any).Pusher = Pusher;

                const pusherKey = import.meta.env.VITE_PUSHER_APP_KEY;
                const pusherCluster = import.meta.env.VITE_PUSHER_APP_CLUSTER;

                if (!pusherKey || !pusherCluster) {
                    console.error('NotificationProvider: Pusher configuration missing. Please set VITE_PUSHER_APP_KEY and VITE_PUSHER_APP_CLUSTER.');
                    setError('WebSocket configuration missing');
                    return;
                }

                console.log('🚀 Initializing Pusher for real-time notifications...');
                const echo = new Echo({
                    broadcaster: 'pusher',
                    key: pusherKey,
                    cluster: pusherCluster,
                    forceTLS: true,
                    authEndpoint: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/broadcasting/auth`,
                    auth: {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
                        },
                    },
                });

                echoRef.current = echo;

                // Connection status handlers
                echo.connector.pusher.connection.bind('connected', () => {
                    console.log('WebSocket connected');
                    setIsConnected(true);
                    setError(null);
                });

                echo.connector.pusher.connection.bind('disconnected', () => {
                    console.log('WebSocket disconnected');
                    setIsConnected(false);
                });

                echo.connector.pusher.connection.bind('error', (err: any) => {
                    console.error('WebSocket error:', err);
                    setIsConnected(false);
                    setError('WebSocket connection error');
                    
                    // Attempt reconnection after 5 seconds
                    if (!isCleanupCalled) {
                        reconnectTimeout = setTimeout(() => {
                            console.log('Attempting to reconnect...');
                            echo.disconnect();
                            initializeEcho();
                        }, 5000);
                    }
                });

                echo.connector.pusher.connection.bind('state_change', (states: any) => {
                    console.log('WebSocket state changed:', states.current);
                });

                // Subscribe to user's private channel
                echo.private(`App.Models.User.${user.id}`)
                    .notification((notification: any) => {
                        console.log('New notification received:', notification);
                        
                        setNotifications(prev => {
                            // Check for duplicates
                            if (prev.some(n => n.id === notification.id)) {
                                return prev;
                            }
                            
                            return [{
                                id: notification.id || Date.now().toString(),
                                data: notification,
                                read_at: null,
                                created_at: new Date().toISOString()
                            }, ...prev];
                        });
                        
                        setUnreadCount(prev => prev + 1);
                        
                        // Play sound and show browser notification
                        playNotificationSound();
                        showBrowserNotification({
                            id: notification.id || Date.now().toString(),
                            data: notification,
                            read_at: null,
                            created_at: new Date().toISOString()
                        });
                    });

            } catch (err) {
                console.error('Error initializing Echo:', err);
                setError('Failed to initialize real-time connection');
            }
        };

        initializeEcho();

        return () => {
            isCleanupCalled = true;
            if (reconnectTimeout) clearTimeout(reconnectTimeout);
            if (echoRef.current) {
                echoRef.current.disconnect();
                echoRef.current = null;
            }
        };
    }, [user, playNotificationSound, showBrowserNotification, fetchNotifications]);

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            loading,
            error,
            isConnected,
            stats,
            markAsRead,
            markAllAsRead,
            deleteNotification,
            clearAllNotifications,
            fetchNotifications,
            fetchStats,
            requestBrowserPermission,
            hasMoreNotifications
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
