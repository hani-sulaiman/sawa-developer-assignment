import { Link, useNavigate } from 'react-router-dom';
import { Menu } from '@mantine/core';
import {
  IconBell,
  IconCalendar,
  IconMessage,
  IconCheck,
  IconChecks,
  IconTrash,
  IconChevronRight,
} from '@tabler/icons-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import type { Notification } from '@shared/schemas';

const notificationIcons: Record<string, typeof IconBell> = {
  appointment: IconCalendar,
  message: IconMessage,
  default: IconBell,
};

const notificationColors: Record<string, string> = {
  appointment: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  message: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  default: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
};

export function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const { user } = useAuth();
  const navigate = useNavigate();

  const recentNotifications = notifications.slice(0, 5);

  const getNotificationTarget = (notification: Notification) => {
    switch (notification.type) {
      case 'new_message': {
        const conversationId = notification.data?.conversationId;
        return conversationId ? `/chat?conversationId=${encodeURIComponent(conversationId)}` : '/chat';
      }
      case 'new_appointment': {
        return user?.role === 'doctor' ? '/doctor/calendar?tab=pending' : '/patient/appointments';
      }
      case 'appointment_confirmed':
      case 'appointment_rejected':
      case 'appointment_reminder': {
        return user?.role === 'doctor' ? '/doctor/calendar' : '/patient/appointments';
      }
      case 'prescription_created': {
        return user?.role === 'doctor' ? '/doctor/prescriptions' : '/patient/prescriptions';
      }
      default:
        return '/notifications';
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    navigate(getNotificationTarget(notification));
  };

  return (
    <Menu shadow="lg" width={380} position="bottom-end">
      <Menu.Target>
        <button className="relative p-2.5 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
          <IconBell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-semibold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </Menu.Target>

      <Menu.Dropdown className="dark:bg-gray-900 dark:border-gray-800">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1"
            >
              <IconChecks size={14} />
              Mark all read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="max-h-[400px] overflow-y-auto">
          {recentNotifications.length === 0 ? (
            <div className="py-8 text-center">
              <IconBell size={32} className="text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">No notifications yet</p>
            </div>
          ) : (
            recentNotifications.map((notification) => {
              const Icon = notificationIcons[notification.type] || notificationIcons.default;
              const colorClass = notificationColors[notification.type] || notificationColors.default;

              return (
                <div
                  key={notification.id}
                  className={`
                    px-4 py-3 border-b border-gray-50 dark:border-gray-800 last:border-0
                    hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors
                    ${!notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}
                  `}
                  onClick={() => handleNotificationClick(notification as Notification)}
                >
                  <div className="flex gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                          {notification.title}
                        </p>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!notification.isRead && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                              title="Mark as read"
                            >
                              <IconCheck size={14} className="text-blue-600 dark:text-blue-400" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                            title="Delete"
                          >
                            <IconTrash size={14} className="text-gray-400 hover:text-red-500" />
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-gray-400 dark:text-gray-500 text-[10px] mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800">
            <Link
              to="/notifications"
              className="flex items-center justify-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              View all notifications
              <IconChevronRight size={16} />
            </Link>
          </div>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}
