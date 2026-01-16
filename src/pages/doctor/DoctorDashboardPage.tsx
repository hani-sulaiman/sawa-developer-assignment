import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  IconCalendar, 
  IconClock, 
  IconUser, 
  IconCheck, 
  IconX,
  IconCalendarCheck,
  IconCalendarTime,
  IconCalendarOff,
  IconFileDescription
} from '@tabler/icons-react';
import { Layout } from '@/components/layout';
import { Card, Loader, EmptyState, Button } from '@/components/ui';
import api from '@/services/api';
import { notifyError, notifySuccess } from '@/services/notify';
import type { Appointment, Doctor } from '@shared/schemas';

const statusConfig = {
  pending: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: IconCalendarTime,
    label: 'Pending Review',
  },
  confirmed: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    icon: IconCalendarCheck,
    label: 'Confirmed',
  },
  rejected: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    icon: IconCalendarOff,
    label: 'Rejected',
  },
};

export function DoctorDashboardPage() {
  const { doctorId } = useParams<{ doctorId: string }>();
  const queryClient = useQueryClient();

  const { data: doctor } = useQuery<Doctor>({
    queryKey: ['doctor-profile', doctorId],
    queryFn: async () => {
      const response = await api.get(`/doctors/${doctorId}`);
      return response.data.data.doctor;
    },
    enabled: !!doctorId,
  });

  const { data: appointments, isLoading, error } = useQuery<Appointment[]>({
    queryKey: ['doctor-appointments', doctorId],
    queryFn: async () => {
      const response = await api.get(`/doctors/${doctorId}/appointments`);
      return response.data.data.appointments;
    },
    enabled: !!doctorId,
  });

  const confirmMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/appointments/${id}/confirm`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-appointments', doctorId] });
      notifySuccess('Appointment confirmed and the patient will be notified.', 'Confirmed');
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to confirm appointment. Please try again.';
      notifyError(message, 'Action failed');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/appointments/${id}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-appointments', doctorId] });
      notifySuccess('Appointment rejected and the patient will be notified.', 'Rejected');
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to reject appointment. Please try again.';
      notifyError(message, 'Action failed');
    },
  });

  const stats = {
    total: appointments?.length || 0,
    pending: appointments?.filter((a) => a.status === 'pending').length || 0,
    confirmed: appointments?.filter((a) => a.status === 'confirmed').length || 0,
    rejected: appointments?.filter((a) => a.status === 'rejected').length || 0,
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Layout>
      {/* Header */}
      <div className="mb-10">
        <p className="text-blue-600 font-semibold mb-2">Welcome back,</p>
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
          {doctor?.name || 'Doctor Dashboard'}
        </h1>
        <p className="text-gray-500">Manage your appointments and patient schedule</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <IconCalendar size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Total Appointments</p>
            </div>
          </div>
        </Card>
        
        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <IconCalendarTime size={24} className="text-amber-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-sm text-gray-500">Pending Review</p>
            </div>
          </div>
        </Card>
        
        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <IconCalendarCheck size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.confirmed}</p>
              <p className="text-sm text-gray-500">Confirmed</p>
            </div>
          </div>
        </Card>
        
        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <IconCalendarOff size={24} className="text-red-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.rejected}</p>
              <p className="text-sm text-gray-500">Rejected</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Recent Appointments</h2>
        {stats.pending > 0 && (
          <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-semibold rounded-full">
            {stats.pending} pending
          </span>
        )}
      </div>

      {/* Loading State */}
      {isLoading && <Loader size="lg" text="Loading appointments..." />}

      {/* Error State */}
      {error && (
        <Card variant="bordered" className="text-center py-12">
          <p className="text-red-500">Failed to load appointments. Please try again.</p>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && appointments && appointments.length === 0 && (
        <EmptyState
          icon={<IconCalendar size={48} className="text-gray-300" />}
          title="No appointments yet"
          description="Your upcoming appointments will appear here"
        />
      )}

      {/* Appointments List */}
      {appointments && appointments.length > 0 && (
        <div className="space-y-4">
          {appointments.map((appointment) => {
            const status = statusConfig[appointment.status];
            const StatusIcon = status.icon;
            const isPending = appointment.status === 'pending';
            
            return (
              <Card 
                key={appointment.id} 
                variant="elevated" 
                padding="none"
                className={isPending ? 'border-l-4 border-l-amber-400' : ''}
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    {/* Patient Info */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                        <span className="text-xl font-bold text-white">
                          {appointment.patientName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-gray-900 text-lg">{appointment.patientName}</h3>
                        <p className="text-gray-500 text-sm truncate">{appointment.patientEmail}</p>
                      </div>
                    </div>

                    {/* Date & Time */}
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <IconCalendar size={18} className="text-gray-400" />
                        <span>{formatDate(appointment.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <IconClock size={18} className="text-gray-400" />
                        <span>{appointment.time}</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${status.bg} ${status.text}`}>
                      <StatusIcon size={16} />
                      <span className="text-sm font-semibold">{status.label}</span>
                    </div>
                  </div>

                  {/* Reason */}
                  {appointment.reason && (
                    <div className="mt-5 pt-5 border-t border-gray-100">
                      <div className="flex items-start gap-3">
                        <IconFileDescription size={18} className="text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Visit Reason</p>
                          <p className="text-gray-600 text-sm">{appointment.reason}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions for Pending */}
                  {isPending && (
                    <div className="mt-5 pt-5 border-t border-gray-100 flex items-center gap-3">
                      <Button
                        variant="success"
                        onClick={() => confirmMutation.mutate(appointment.id)}
                        disabled={confirmMutation.isPending || rejectMutation.isPending}
                        className="flex-1 md:flex-none"
                      >
                        <IconCheck size={18} className="mr-2" />
                        Confirm Appointment
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => rejectMutation.mutate(appointment.id)}
                        disabled={confirmMutation.isPending || rejectMutation.isPending}
                        className="flex-1 md:flex-none border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <IconX size={18} className="mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
