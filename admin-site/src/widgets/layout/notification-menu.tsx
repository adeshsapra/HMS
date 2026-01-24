import React from "react";
import {
    Typography,
    IconButton,
    Menu,
    MenuHandler,
    MenuList,
    MenuItem,
    Avatar,
} from "@material-tailwind/react";
import { BellIcon, ClockIcon } from "@heroicons/react/24/solid";
import { useNotifications } from "@/context/NotificationContext";
import moment from "moment";
import { useNavigate } from "react-router-dom";

export function NotificationMenu() {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const navigate = useNavigate();

    const handleNotificationClick = (notification: any) => {
        if (!notification.read_at) {
            markAsRead(notification.id);
        }
        navigate(`/dashboard/notifications/${notification.id}`);
    };

    return (
        <Menu>
            <MenuHandler>
                <IconButton variant="text" color="blue-gray" className="relative overflow-visible">
                    {unreadCount > 0 && (
                        <span className="absolute right-2 top-2 z-10 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white shadow-sm" />
                    )}
                    <BellIcon className="h-5 w-5 text-blue-gray-500" />
                </IconButton>
            </MenuHandler>
            <MenuList className="w-80 max-h-[28rem] overflow-y-auto border-0 p-2 shadow-2xl shadow-blue-gray-500/20">
                <div className="mb-4 flex items-center justify-between p-2 border-b border-blue-gray-50 pb-3">
                    <div className="flex items-center gap-2">
                        <Typography variant="h6" color="blue-gray">
                            Notifications
                        </Typography>
                        {unreadCount > 0 && (
                            <span className="grid h-5 min-w-[20px] place-items-center rounded-full bg-red-100 px-1.5 text-[10px] font-bold text-red-600">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <Typography
                            variant="small"
                            color="blue"
                            className="cursor-pointer text-xs font-bold transition-all hover:text-blue-700"
                            onClick={(e) => {
                                e.stopPropagation();
                                markAllAsRead();
                            }}
                        >
                            Mark all as read
                        </Typography>
                    )}
                </div>

                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10">
                        <div className="rounded-full bg-blue-gray-50/50 p-4">
                            <BellIcon className="h-8 w-8 text-blue-gray-100" />
                        </div>
                        <Typography variant="small" color="blue-gray" className="mt-2 text-center opacity-50">
                            No new alerts at the moment.
                        </Typography>
                    </div>
                ) : (
                    <div className="flex flex-col gap-1">
                        {notifications.map((notification) => (
                            <MenuItem
                                key={notification.id}
                                className={`flex items-start gap-4 p-3 rounded-lg transition-all ${!notification.read_at ? "bg-blue-50/40 hover:bg-blue-50/60" : "hover:bg-blue-gray-50/50"
                                    }`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full ${notification.data?.type === 'alert' ? 'bg-red-100 text-red-600' :
                                    notification.data?.type === 'success' ? 'bg-green-100 text-green-600' :
                                        'bg-blue-100 text-blue-600'
                                    }`}>
                                    <BellIcon className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col gap-0.5 w-full">
                                    <div className="flex items-start justify-between gap-2">
                                        <Typography
                                            variant="small"
                                            color="blue-gray"
                                            className={`text-sm leading-tight ${!notification.read_at ? "font-bold" : "font-normal"}`}
                                        >
                                            {notification.data?.title}
                                        </Typography>
                                        {!notification.read_at && (
                                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                                        )}
                                    </div>
                                    <Typography
                                        variant="small"
                                        className="text-xs font-normal text-blue-gray-500 line-clamp-2"
                                    >
                                        {notification.data?.message}
                                    </Typography>
                                    <Typography
                                        variant="small"
                                        className="mt-1 flex items-center gap-1 text-[10px] font-medium text-blue-gray-300"
                                    >
                                        <ClockIcon className="h-3 w-3" /> {moment(notification.created_at).fromNow()}
                                    </Typography>
                                </div>
                            </MenuItem>
                        ))}
                    </div>
                )}

                <div className="mt-2 border-t border-blue-gray-50 pt-2">
                    <Typography
                        variant="small"
                        color="blue"
                        className="cursor-pointer text-center text-xs font-bold transition-all hover:text-blue-700 p-2"
                        onClick={() => navigate("/dashboard/notifications")}
                    >
                        See All Notifications
                    </Typography>
                </div>
            </MenuList>
        </Menu>
    );
}

export default NotificationMenu;
