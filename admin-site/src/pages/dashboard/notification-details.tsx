import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Typography,
    Card,
    CardHeader,
    CardBody,
    Button,
    IconButton,
    Spinner,
} from "@material-tailwind/react";
import {
    ArrowLeftIcon,
    BellIcon,
    CalendarIcon,
    ShoppingBagIcon,
    CheckCircleIcon,
    InformationCircleIcon,
    ClockIcon,
    ArrowTopRightOnSquareIcon,
    TrashIcon,
} from "@heroicons/react/24/outline";
import apiService from "@/services/api";
import { useNotifications } from "@/context/NotificationContext";
import moment from "moment";

// Global singleton to prevent duplicate fetches (StrictMode)
const notificationCache = new Map<string, Promise<any>>();

export function NotificationDetails(): JSX.Element {
    const { id } = useParams();
    const navigate = useNavigate();
    const { markAsRead, deleteNotification } = useNotifications();
    const [notification, setNotification] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchDetails = async () => {
            try {
                if (!id) return;

                // Check if fetch is already in progress or completed
                if (notificationCache.has(id)) {
                    const cachedPromise = notificationCache.get(id);
                    const cachedData = await cachedPromise;
                    if (isMounted && cachedData) {
                        setNotification(cachedData);
                        setLoading(false);
                    }
                    return;
                }

                // Create new fetch promise and cache it
                const fetchPromise = apiService.getNotification(id).then(response => {
                    if (response.status) {
                        if (!response.data.read_at) {
                            markAsRead(id);
                        }
                        return response.data;
                    }
                    return null;
                }).catch(error => {
                    console.error("Error fetching notification details:", error);
                    return null;
                });

                notificationCache.set(id, fetchPromise);

                const data = await fetchPromise;
                if (isMounted) {
                    setNotification(data);
                    setLoading(false);
                }

                // Clear cache after 5 seconds to allow fresh data on re-visits
                setTimeout(() => {
                    notificationCache.delete(id);
                }, 5000);

            } catch (error) {
                console.error("Error fetching notification details:", error);
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchDetails();

        return () => {
            isMounted = false;
        };
    }, [id, markAsRead]);

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Spinner className="h-12 w-12" />
            </div>
        );
    }

    if (!notification) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
                <Typography variant="h4" color="blue-gray">
                    Notification not found
                </Typography>
                <Button variant="text" onClick={() => navigate(-1)}>
                    Go Back
                </Button>
            </div>
        );
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'appointment': return <CalendarIcon className="h-8 w-8 text-blue-600" />;
            case 'pharmacy': return <ShoppingBagIcon className="h-8 w-8 text-purple-600" />;
            case 'success': return <CheckCircleIcon className="h-8 w-8 text-green-600" />;
            case 'alert': return <InformationCircleIcon className="h-8 w-8 text-red-600" />;
            default: return <BellIcon className="h-8 w-8 text-blue-gray-600" />;
        }
    };

    const getColorClass = (type: string) => {
        switch (type) {
            case 'appointment': return 'bg-blue-100';
            case 'pharmacy': return 'bg-purple-100';
            case 'success': return 'bg-green-100';
            case 'alert': return 'bg-red-100';
            default: return 'bg-blue-gray-100';
        }
    };

    return (
        <div className="mt-12 mb-8 flex flex-col gap-6 max-w-3xl mx-auto">
            <div className="flex items-center gap-4">
                <IconButton variant="text" color="blue-gray" onClick={() => navigate(-1)}>
                    <ArrowLeftIcon className="h-5 w-5" />
                </IconButton>
                <Typography variant="h5" color="blue-gray">
                    Notification Details
                </Typography>
            </div>

            <Card className="overflow-hidden border border-blue-gray-50 shadow-sm">
                <CardHeader
                    variant="gradient"
                    color="white"
                    floated={false}
                    shadow={false}
                    className="m-0 p-8 border-b border-blue-gray-50 flex items-center gap-6"
                >
                    <div className={`p-4 rounded-xl ${getColorClass(notification.data?.type || 'info')}`}>
                        {getIcon(notification.data?.type || 'info')}
                    </div>
                    <div className="flex-1">
                        <Typography variant="h4" color="blue-gray" className="mb-1 font-bold">
                            {notification.data?.title}
                        </Typography>
                        <div className="flex items-center gap-2 text-blue-gray-400">
                            <ClockIcon className="h-4 w-4" />
                            <Typography variant="small" className="font-normal">
                                {moment(notification.created_at).format('MMMM Do YYYY, h:mm:ss a')}
                            </Typography>
                            <span className="mx-1">•</span>
                            <Typography variant="small" className="font-medium text-blue-gray-600">
                                {moment(notification.created_at).fromNow()}
                            </Typography>
                        </div>
                    </div>
                </CardHeader>
                <CardBody className="p-8">
                    <Typography variant="lead" color="blue-gray" className="mb-8 font-normal leading-relaxed opacity-80">
                        {notification.data?.message}
                    </Typography>

                    {notification.data?.action_url && (
                        <div className="flex flex-col gap-4 bg-blue-50/30 p-6 rounded-2xl border border-blue-100/50">
                            <Typography variant="h6" color="blue" className="flex items-center gap-2">
                                <InformationCircleIcon className="h-5 w-5" />
                                Related Action Required
                            </Typography>
                            <Typography variant="small" color="blue-gray" className="font-normal">
                                There is an action associated with this notification. Click the button below to view the relevant record.
                            </Typography>
                            <Button
                                variant="gradient"
                                color="blue"
                                className="flex items-center justify-center gap-2 self-start mt-2"
                                onClick={() => navigate(notification.data.action_url)}
                            >
                                Go to Record
                                <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                            </Button>
                        </div>
                    )}

                    <div className="mt-12 flex items-center justify-between border-t border-blue-gray-50 pt-6">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Typography variant="small" color="blue-gray" className="font-bold uppercase opacity-50">
                                    Status:
                                </Typography>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${notification.read_at ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                    {notification.read_at ? 'Read' : 'Unread'}
                                </span>
                            </div>
                            <Button
                                variant="text"
                                color="red"
                                size="sm"
                                className="flex items-center gap-2"
                                onClick={async () => {
                                    if (window.confirm("Are you sure you want to delete this notification?")) {
                                        await deleteNotification(notification.id);
                                        navigate("/dashboard/notifications");
                                    }
                                }}
                            >
                                <TrashIcon className="h-4 w-4" />
                                Delete
                            </Button>
                        </div>
                        <Typography variant="small" color="blue-gray" className="font-normal opacity-50 italic">
                            Ref: {notification.id}
                        </Typography>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}

export default NotificationDetails;
