import { IconCalendar, IconClock, IconUser, IconCheck, IconX } from '@tabler/icons-react';
import { Card, Button } from '@/components/ui';

interface AppointmentCardProps {
  id: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  date: string;
  time: string;
  reason: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled';
  onConfirm?: (id: string) => void;
  onReject?: (id: string) => void;
  isLoading?: boolean;
}

const statusConfig = {
  pending: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-700 dark:text-amber-400',
    label: 'Pending',
  },
  confirmed: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    text: 'text-green-700 dark:text-green-400',
    label: 'Confirmed',
  },
  rejected: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-700 dark:text-red-400',
    label: 'Rejected',
  },
  completed: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-700 dark:text-blue-400',
    label: 'Completed',
  },
  cancelled: {
    bg: 'bg-gray-50 dark:bg-gray-800',
    text: 'text-gray-500 dark:text-gray-400',
    label: 'Cancelled',
  },
};

export function AppointmentCard({
  id,
  patientName,
  patientEmail,
  patientPhone,
  date,
  time,
  reason,
  status,
  onConfirm,
  onReject,
  isLoading = false,
}: AppointmentCardProps) {
  const statusStyle = statusConfig[status];

  const formatDate = (dateStr: string) => {
    const dateObj = new Date(dateStr);
    return dateObj.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <Card variant="elevated" padding="none" className="overflow-hidden animate-fade-in-up">
      <div className="p-4 sm:p-5 lg:p-6">
        <div className={`sm:hidden inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3 ${statusStyle.bg} ${statusStyle.text}`}>
          <span className="text-xs font-semibold">{statusStyle.label}</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4 flex-1">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
              <IconUser size={20} className="text-white sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg truncate">
                {patientName}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm truncate">
                {reason.length > 50 ? `${reason.substring(0, 50)}...` : reason}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600 dark:text-gray-400">
              <IconCalendar size={16} />
              <span>{formatDate(date)}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600 dark:text-gray-400">
              <IconClock size={16} />
              <span>{time}</span>
            </div>
          </div>

          <div className={`hidden sm:inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
            <span className="text-xs sm:text-sm font-semibold">{statusStyle.label}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Email:</span>
              <span className="ml-2 text-gray-900 dark:text-white">{patientEmail}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Phone:</span>
              <span className="ml-2 text-gray-900 dark:text-white">{patientPhone}</span>
            </div>
          </div>
        </div>

        {status === 'pending' && onConfirm && onReject && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center gap-2 sm:gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => onConfirm(id)}
              disabled={isLoading}
              className="text-xs sm:text-sm"
            >
              <IconCheck size={14} className="mr-1" />
              Confirm
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReject(id)}
              disabled={isLoading}
              className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20 text-xs sm:text-sm"
            >
              <IconX size={14} className="mr-1" />
              Reject
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
