import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  IconCalendar,
  IconClock,
  IconUser,
  IconCalendarCheck,
  IconCalendarOff,
  IconHistory,
} from '@tabler/icons-react';
import { DashboardLayout, PageLoader } from '@/components/layout';
import { Card, Button, EmptyState } from '@/components/ui';
import api from '@/services/api';

interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  reason: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled';
  createdAt: string;
}

const statusConfig = {
  completed: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-700 dark:text-blue-400',
    icon: IconCalendarCheck,
    label: 'Completed',
  },
  rejected: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-700 dark:text-red-400',
    icon: IconCalendarOff,
    label: 'Rejected',
  },
  cancelled: {
    bg: 'bg-gray-50 dark:bg-gray-800',
    text: 'text-gray-500 dark:text-gray-400',
    icon: IconCalendarOff,
    label: 'Cancelled',
  },
};

export function AppointmentHistoryPage() {
  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ['my-appointments'],
    queryFn: async () => {
      const response = await api.get('/appointments/my');
      return response.data.data.appointments;
    },
  });

  const historyAppointments = appointments?.filter(
    (a) => a.status === 'completed' || a.status === 'rejected' || a.status === 'cancelled'
  ) || [];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const renderAppointmentCard = (appointment: Appointment) => {
    const status = statusConfig[appointment.status as keyof typeof statusConfig];
    if (!status) return null;
    
    const StatusIcon = status.icon;

    return (
      <Card
        key={appointment.id}
        variant="elevated"
        padding="none"
        className="overflow-hidden animate-fade-in-up"
      >
        <div className="p-4 sm:p-5 lg:p-6">
          <div className={`sm:hidden inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3 ${status.bg} ${status.text}`}>
            <StatusIcon size={14} />
            <span className="text-xs font-semibold">{status.label}</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4 flex-1">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <IconUser size={20} className="text-white sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg truncate">
                  {appointment.doctorName}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm truncate">
                  {appointment.reason.length > 40 ? `${appointment.reason.substring(0, 40)}...` : appointment.reason}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600 dark:text-gray-400">
                <IconCalendar size={16} />
                <span>{formatDate(appointment.date)}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600 dark:text-gray-400">
                <IconClock size={16} />
                <span>{appointment.time}</span>
              </div>
            </div>

            <div className={`hidden sm:inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full ${status.bg} ${status.text}`}>
              <StatusIcon size={16} />
              <span className="text-xs sm:text-sm font-semibold">{status.label}</span>
            </div>
          </div>

          {appointment.status === 'completed' && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center gap-2 sm:gap-3">
              <Link to={`/doctors/${appointment.doctorId}`}>
                <Button variant="secondary" size="sm" className="text-xs sm:text-sm">Book Again</Button>
              </Link>
              <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                Leave Review
              </Button>
            </div>
          )}

          {appointment.status === 'rejected' && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center gap-2 sm:gap-3">
              <Link to={`/doctors/${appointment.doctorId}`}>
                <Button variant="primary" size="sm" className="text-xs sm:text-sm">Book New Appointment</Button>
              </Link>
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <DashboardLayout
      title="Appointment History"
      subtitle="View your past appointments and medical records"
    >
      <PageLoader isLoading={isLoading} loadingText="Loading history...">
        {historyAppointments.length === 0 ? (
          <EmptyState
            icon={<IconHistory size={48} className="text-gray-300" />}
            title="No appointment history"
            description="Your past appointments will appear here once you complete them"
            action={
              <Link to="/doctors">
                <Button variant="primary">Find a Doctor</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {historyAppointments.map((appointment) => 
              renderAppointmentCard(appointment)
            )}
          </div>
        )}
      </PageLoader>
    </DashboardLayout>
  );
}
