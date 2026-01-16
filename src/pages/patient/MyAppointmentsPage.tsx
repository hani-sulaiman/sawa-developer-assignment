import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Tabs } from '@mantine/core';
import {
  IconCalendar,
  IconClock,
  IconUser,
  IconX,
  IconCalendarCheck,
  IconCalendarTime,
  IconCalendarOff,
  IconMapPin,
} from '@tabler/icons-react';
import { DashboardLayout, PageLoader, ListSkeleton } from '@/components/layout';
import { Card, Button, EmptyState } from '@/components/ui';
import { notifySuccess, notifyError } from '@/services/notify';
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
  pending: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-700 dark:text-amber-400',
    icon: IconCalendarTime,
    label: 'Pending',
  },
  confirmed: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    text: 'text-green-700 dark:text-green-400',
    icon: IconCalendarCheck,
    label: 'Confirmed',
  },
  rejected: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-700 dark:text-red-400',
    icon: IconCalendarOff,
    label: 'Rejected',
  },
  completed: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-700 dark:text-blue-400',
    icon: IconCalendarCheck,
    label: 'Completed',
  },
  cancelled: {
    bg: 'bg-gray-50 dark:bg-gray-800',
    text: 'text-gray-500 dark:text-gray-400',
    icon: IconCalendarOff,
    label: 'Cancelled',
  },
};

export function MyAppointmentsPage() {
  const [activeTab, setActiveTab] = useState<string | null>('upcoming');
  const queryClient = useQueryClient();

  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ['my-appointments'],
    queryFn: async () => {
      const response = await api.get('/appointments/my');
      return response.data.data.appointments;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.patch(`/appointments/${id}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-appointments'] });
      notifySuccess('Appointment cancelled successfully');
    },
    onError: () => {
      notifyError('Failed to cancel appointment');
    },
  });

  const upcomingAppointments = appointments?.filter(
    (a) => a.status === 'pending' || a.status === 'confirmed'
  ) || [];
  
  const pastAppointments = appointments?.filter(
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

  const renderAppointmentCard = (appointment: Appointment, showCancel = false) => {
    const status = statusConfig[appointment.status];
    const StatusIcon = status.icon;

    return (
      <Card
        key={appointment.id}
        variant="elevated"
        padding="none"
        className="overflow-hidden animate-fade-in-up"
      >
        <div className="p-4 sm:p-5 lg:p-6">
          {/* Mobile: Status Badge at top */}
          <div className={`sm:hidden inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3 ${status.bg} ${status.text}`}>
            <StatusIcon size={14} />
            <span className="text-xs font-semibold">{status.label}</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center gap-3 sm:gap-4">
            {/* Doctor Info */}
            <div className="flex items-center gap-3 sm:gap-4 flex-1">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <IconUser size={20} className="text-white sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg truncate">
                  {appointment.doctorName}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm truncate">
                  {appointment.reason.substring(0, 40)}...
                </p>
              </div>
            </div>

            {/* Date & Time */}
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

            {/* Status Badge - Hidden on mobile, shown on larger */}
            <div className={`hidden sm:inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full ${status.bg} ${status.text}`}>
              <StatusIcon size={16} />
              <span className="text-xs sm:text-sm font-semibold">{status.label}</span>
            </div>
          </div>

          {/* Actions */}
          {showCancel && appointment.status === 'pending' && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center gap-2 sm:gap-3">
              <Link to={`/doctors/${appointment.doctorId}`}>
                <Button variant="secondary" size="sm" className="text-xs sm:text-sm">View Doctor</Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => cancelMutation.mutate(appointment.id)}
                disabled={cancelMutation.isPending}
                className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20 text-xs sm:text-sm"
              >
                <IconX size={14} className="mr-1" />
                Cancel
              </Button>
            </div>
          )}

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
        </div>
      </Card>
    );
  };

  return (
    <DashboardLayout
      title="My Appointments"
      subtitle="View and manage your upcoming and past appointments"
    >
      <PageLoader isLoading={isLoading} loadingText="Loading appointments...">
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List className="mb-6">
            <Tabs.Tab value="upcoming" leftSection={<IconCalendarTime size={16} />}>
              Upcoming ({upcomingAppointments.length})
            </Tabs.Tab>
            <Tabs.Tab value="past" leftSection={<IconCalendarCheck size={16} />}>
              Past ({pastAppointments.length})
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="upcoming">
            {isLoading ? (
              <ListSkeleton count={3} />
            ) : upcomingAppointments.length === 0 ? (
              <EmptyState
                icon={<IconCalendar size={48} className="text-gray-300" />}
                title="No upcoming appointments"
                description="You don't have any upcoming appointments scheduled"
                action={
                  <Link to="/doctors">
                    <Button variant="primary">Find a Doctor</Button>
                  </Link>
                }
              />
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => 
                  renderAppointmentCard(appointment, true)
                )}
              </div>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="past">
            {isLoading ? (
              <ListSkeleton count={3} />
            ) : pastAppointments.length === 0 ? (
              <EmptyState
                icon={<IconCalendar size={48} className="text-gray-300" />}
                title="No past appointments"
                description="Your appointment history will appear here"
              />
            ) : (
              <div className="space-y-4">
                {pastAppointments.map((appointment) => 
                  renderAppointmentCard(appointment, false)
                )}
              </div>
            )}
          </Tabs.Panel>
        </Tabs>
      </PageLoader>
    </DashboardLayout>
  );
}
