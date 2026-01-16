import { Link, useNavigate } from 'react-router-dom';
import {
  IconBell,
  IconCalendar,
  IconMessage,
  IconCheck,
  IconChecks,
  IconTrash,
} from '@tabler/icons-react';
import { DashboardLayout, PageLoader } from '@/components/layout';
import { Card, Button, EmptyState } from '@/components/ui';
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

export function NotificationsPage() {
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();
  const { user } = useAuth();
  const navigate = useNavigate();

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
    <DashboardLayout
      title="Notifications"
      subtitle={`You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
      actions={
        unreadCount > 0 ? (
          <Button variant="secondary" onClick={markAllAsRead}>
            <IconChecks size={18} className="mr-2" />
            Mark all as read
          </Button>
        ) : null
      }
    >
      <PageLoader isLoading={isLoading} loadingText="Loading notifications...">
        {notifications.length === 0 ? (
          <EmptyState
            icon={<IconBell size={48} className="text-gray-300 dark:text-gray-600" />}
            title="No notifications"
            description="You're all caught up! Check back later for updates."
          />
        ) : (
          <div className="space-y-3">
            {notifications.map((notification, index) => {
              const Icon = notificationIcons[notification.type] || notificationIcons.default;
              const colorClass = notificationColors[notification.type] || notificationColors.default;

              return (
                <Card
                  key={notification.id}
                  variant="elevated"
                  padding="none"
                  className={`
                    overflow-hidden animate-fade-in-up
                    ${!notification.isRead ? 'border-l-4 border-l-blue-500' : ''}
                  `}
                  style={{ animationDelay: `${Math.min(index, 10) * 0.05}s` }}
                  onClick={() => handleNotificationClick(notification as Notification)}
                >
                  <div className="p-4 sm:p-5">
                    <div className="flex gap-3 sm:gap-4">
                      <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                        <Icon size={20} className="sm:w-6 sm:h-6" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className={`
                              font-semibold text-sm sm:text-base
                              ${notification.isRead 
                                ? 'text-gray-700 dark:text-gray-300' 
                                : 'text-gray-900 dark:text-white'
                              }
                            `}>
                              {notification.title}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                              {notification.message}
                            </p>
                            <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="p-2"
                                title="Mark as read"
                              >
                                <IconCheck size={18} className="text-blue-600 dark:text-blue-400" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(event) => {
                                event.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="p-2"
                              title="Delete"
                            >
                              <IconTrash size={18} className="text-gray-400 hover:text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </PageLoader>
    </DashboardLayout>
  );
}
