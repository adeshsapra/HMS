import React, { createContext, useContext, useState, useEffect, type ReactNode, useCallback, useRef } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { notificationAPI } from '../services/api';
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

// Notification sound
const NOTIFICATION_SOUND = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDGH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxm8gBS';

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [stats, setStats] = useState<NotificationStats | null>(null);
    const [hasMoreNotifications, setHasMoreNotifications] = useState(true);
    const { user } = useAuth();
    const echoRef = useRef<any>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize audio
    useEffect(() => {
        audioRef.current = new Audio(NOTIFICATION_SOUND);
        audioRef.current.volume = 0.5;
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const playSound = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(err => console.log('Audio failed:', err));
        }
    }, []);

    const showBrowserNotif = useCallback((notif: Notification) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            const n = new Notification(notif.data.title, {
                body: notif.data.message,
                icon: '/favicon.ico',
            });
            n.onclick = () => {
                window.focus();
                n.close();
            };
        }
    }, []);

    const requestBrowserPermission = useCallback(async (): Promise<boolean> => {
        if (!('Notification' in window)) return false;
        if (Notification.permission === 'granted') return true;
        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
        return false;
    }, []);

    const fetchNotifications = useCallback(async (page: number = 1) => {
        try {
            setLoading(true);
            setError(null);
            const response = await notificationAPI.getAll(page, 20);
            if (response.data.status) {
                const notifs = response.data.data.data;
                if (page === 1) {
                    setNotifications(notifs);
                } else {
                    setNotifications(prev => {
                        const ids = new Set(prev.map(n => n.id));
                        return [...prev, ...notifs.filter((n: Notification) => !ids.has(n.id))];
                    });
                }
                setUnreadCount(response.data.unread_count);
                setHasMoreNotifications(notifs.length >= 20);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchStats = useCallback(async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/notifications/stats`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')}`,
                    'Accept': 'application/json',
                }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.status) setStats(data.data as NotificationStats);
            }
        } catch (err) {
            console.error('Stats error:', err);
        }
    }, []);

    const markAsRead = useCallback(async (id: string) => {
        try {
            await notificationAPI.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            await notificationAPI.markAllRead();
            setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }, []);

    const deleteNotification = useCallback(async (id: string) => {
        try {
            await notificationAPI.delete(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            const deleted = notifications.find(n => n.id === id);
            if (deleted && !deleted.read_at) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    }, [notifications]);

    const clearAllNotifications = useCallback(async () => {
        try {
            await notificationAPI.clearAll();
            setNotifications([]);
            setUnreadCount(0);
        } catch (error) {
            console.error('Error clearing all notifications:', error);
        }
    }, []);

    useEffect(() => {
        if (!user) return;

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
                    Authorization: `Bearer ${localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')}`,
                },
            },
        });

        echoRef.current = echo;

        echo.connector.pusher.connection.bind('connected', () => {
            setIsConnected(true);
        });

        echo.connector.pusher.connection.bind('disconnected', () => {
            setIsConnected(false);
        });

        echo.private(`App.Models.User.${user.id}`)
            .notification((notification: any) => {
                setNotifications(prev => {
                    if (prev.some(n => n.id === notification.id)) return prev;
                    return [{
                        id: notification.id || Date.now().toString(),
                        data: notification,
                        read_at: null,
                        created_at: new Date().toISOString()
                    }, ...prev];
                });
                setUnreadCount(prev => prev + 1);
                playSound();
                showBrowserNotif({
                    id: notification.id || Date.now().toString(),
                    data: notification,
                    read_at: null,
                    created_at: new Date().toISOString()
                });
            });

        return () => {
            echo.disconnect();
        };
    }, [user, playSound, showBrowserNotif, fetchNotifications]);

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
