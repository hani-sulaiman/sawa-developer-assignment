import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tabs } from '@mantine/core';
import {
  IconCalendar,
  IconCalendarTime,
  IconCalendarCheck,
  IconCalendarOff,
} from '@tabler/icons-react';
import { DashboardLayout, PageLoader } from '@/components/layout';
import { EmptyState } from '@/components/ui';
import { AppointmentCard } from '@/components/appointments';
import { notifySuccess, notifyError } from '@/services/notify';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  date: string;
  time: string;
  reason: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled';
  createdAt: string;
}

export function DoctorCalendarPage() {
  const [activeTab, setActiveTab] = useState<string | null>('pending');
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const doctorId = user?.doctorId;

  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ['doctor-appointments', doctorId],
    queryFn: async () => {
      if (!doctorId) return [];
      const response = await api.get(`/doctors/${doctorId}/appointments`);
      return response.data.data.appointments;
    },
    enabled: !!doctorId,
  });

  const confirmMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.patch(`/appointments/${id}/confirm`);
    },
    onSuccess: (_response, id) => {
      queryClient.invalidateQueries({ queryKey: ['doctor-appointments', doctorId] });
      queryClient.setQueryData<Appointment[]>(['doctor-appointments', doctorId], (current) =>
        current?.map((appointment) =>
          appointment.id === id ? { ...appointment, status: 'confirmed' } : appointment
        ) ?? current
      );
      setActiveTab('confirmed');
      notifySuccess('Appointment confirmed successfully');
    },
    onError: () => {
      notifyError('Failed to confirm appointment');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.patch(`/appointments/${id}/reject`);
    },
    onSuccess: (_response, id) => {
      queryClient.invalidateQueries({ queryKey: ['doctor-appointments', doctorId] });
      queryClient.setQueryData<Appointment[]>(['doctor-appointments', doctorId], (current) =>
        current?.map((appointment) =>
          appointment.id === id ? { ...appointment, status: 'rejected' } : appointment
        ) ?? current
      );
      setActiveTab('completed');
      notifySuccess('Appointment rejected');
    },
    onError: () => {
      notifyError('Failed to reject appointment');
    },
  });

  const pendingAppointments = appointments?.filter((a) => a.status === 'pending') || [];
  const confirmedAppointments = appointments?.filter((a) => a.status === 'confirmed') || [];
  const completedAppointments = appointments?.filter(
    (a) => a.status === 'completed' || a.status === 'rejected' || a.status === 'cancelled'
  ) || [];

  const isActionLoading = confirmMutation.isPending || rejectMutation.isPending;

  return (
    <DashboardLayout
      title="Calendar & Appointments"
      subtitle="Manage your patient appointments and schedule"
    >
      <PageLoader isLoading={isLoading} loadingText="Loading appointments...">
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List className="mb-6">
            <Tabs.Tab value="pending" leftSection={<IconCalendarTime size={16} />}>
              Pending ({pendingAppointments.length})
            </Tabs.Tab>
            <Tabs.Tab value="confirmed" leftSection={<IconCalendarCheck size={16} />}>
              Confirmed ({confirmedAppointments.length})
            </Tabs.Tab>
            <Tabs.Tab value="completed" leftSection={<IconCalendarOff size={16} />}>
              History ({completedAppointments.length})
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="pending">
            {pendingAppointments.length === 0 ? (
              <EmptyState
                icon={<IconCalendar size={48} className="text-gray-300" />}
                title="No pending appointments"
                description="New appointment requests will appear here"
              />
            ) : (
              <div className="space-y-4">
                {pendingAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    {...appointment}
                    onConfirm={confirmMutation.mutate}
                    onReject={rejectMutation.mutate}
                    isLoading={isActionLoading}
                  />
                ))}
              </div>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="confirmed">
            {confirmedAppointments.length === 0 ? (
              <EmptyState
                icon={<IconCalendar size={48} className="text-gray-300" />}
                title="No confirmed appointments"
                description="Confirmed appointments will appear here"
              />
            ) : (
              <div className="space-y-4">
                {confirmedAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    {...appointment}
                  />
                ))}
              </div>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="completed">
            {completedAppointments.length === 0 ? (
              <EmptyState
                icon={<IconCalendar size={48} className="text-gray-300" />}
                title="No appointment history"
                description="Past appointments will appear here"
              />
            ) : (
              <div className="space-y-4">
                {completedAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    {...appointment}
                  />
                ))}
              </div>
            )}
          </Tabs.Panel>
        </Tabs>
      </PageLoader>
    </DashboardLayout>
  );
}
