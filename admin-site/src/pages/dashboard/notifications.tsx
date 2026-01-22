import React from "react";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  IconButton,
  Button,
} from "@material-tailwind/react";
import {
  BellIcon,
  CheckCircleIcon,
  TrashIcon,
  ClockIcon,
  ShoppingBagIcon,
  CalendarIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";
import { useNotifications } from "@/context/NotificationContext";
import moment from "moment";
import { useNavigate } from "react-router-dom";

export function Notifications(): JSX.Element {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = (notification: any) => {
    if (!notification.read_at) {
      markAsRead(notification.id);
    }
    navigate(`/dashboard/notifications/${notification.id}`);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'appointment': return <CalendarIcon className="h-5 w-5" />;
      case 'pharmacy': return <ShoppingBagIcon className="h-5 w-5" />;
      case 'success': return <CheckCircleIcon className="h-5 w-5" />;
      case 'alert': return <InformationCircleIcon className="h-5 w-5" />;
      default: return <BellIcon className="h-5 w-5" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'appointment': return 'blue';
      case 'pharmacy': return 'purple';
      case 'success': return 'green';
      case 'alert': return 'red';
      default: return 'blue-gray';
    }
  };

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="blue" className="mb-8 p-6 flex items-center justify-between">
          <div>
            <Typography variant="h6" color="white">
              Notification Center
            </Typography>
            <Typography variant="small" color="white" className="font-normal opacity-80">
              You have {unreadCount} unread notifications.
            </Typography>
          </div>
          {unreadCount > 0 && (
            <div className="flex gap-2">
              <Button
                variant="filled"
                color="white"
                size="sm"
                className="flex items-center gap-2"
                onClick={markAllAsRead}
              >
                <CheckCircleIcon className="h-4 w-4" />
                Mark all as read
              </Button>
              <Button
                variant="outlined"
                color="white"
                size="sm"
                className="flex items-center gap-2 border-white text-white hover:bg-white/10"
                onClick={() => {
                  if (window.confirm("Are you sure you want to delete all notifications?")) {
                    clearAllNotifications();
                  }
                }}
              >
                <TrashIcon className="h-4 w-4" />
                Clear All
              </Button>
            </div>
          )}
        </CardHeader>
        <CardBody className="px-0 pt-0 pb-2">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="rounded-full bg-blue-gray-50 p-6 mb-4">
                <BellIcon className="h-12 w-12 text-blue-gray-200" />
              </div>
              <Typography variant="h5" color="blue-gray">
                All caught up!
              </Typography>
              <Typography color="gray" className="font-normal">
                No new notifications to show.
              </Typography>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] table-auto">
                <thead>
                  <tr>
                    {["Status", "Notification", "Time", "Actions"].map((el) => (
                      <th
                        key={el}
                        className="border-b border-blue-gray-50 py-3 px-5 text-left"
                      >
                        <Typography
                          variant="small"
                          className="text-[11px] font-bold uppercase text-blue-gray-400"
                        >
                          {el}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {notifications.map((notification, key) => {
                    const isLast = key === notifications.length - 1;
                    const classes = isLast
                      ? "py-3 px-5"
                      : "py-3 px-5 border-b border-blue-gray-50";

                    return (
                      <tr
                        key={notification.id}
                        className={`cursor-pointer transition-colors hover:bg-blue-gray-50/50 ${!notification.read_at ? "bg-blue-50/30" : ""}`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <td className={classes}>
                          <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-${getColor(notification.data?.type || 'info')}-100 text-${getColor(notification.data?.type || 'info')}-600`}>
                            {getIcon(notification.data?.type || 'info')}
                          </div>
                        </td>
                        <td className={classes}>
                          <div className="flex flex-col">
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className={`font-semibold ${!notification.read_at ? "text-blue-700" : ""}`}
                            >
                              {notification.data?.title}
                            </Typography>
                            <Typography className="text-xs font-normal text-blue-gray-500">
                              {notification.data?.message}
                            </Typography>
                          </div>
                        </td>
                        <td className={classes}>
                          <div className="flex items-center gap-1">
                            <ClockIcon className="h-3 w-3 text-blue-gray-300" />
                            <Typography className="text-xs font-normal text-blue-gray-400">
                              {moment(notification.created_at).calendar()}
                            </Typography>
                          </div>
                        </td>
                        <td className={classes}>
                          <div className="flex items-center gap-2">
                            {!notification.read_at && (
                              <IconButton
                                variant="text"
                                size="sm"
                                color="blue"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                              >
                                <CheckCircleIcon className="h-5 w-5" />
                              </IconButton>
                            )}
                            <IconButton
                              variant="text"
                              size="sm"
                              color="red"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                            >
                              <TrashIcon className="h-5 w-5" />
                            </IconButton>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default Notifications;
