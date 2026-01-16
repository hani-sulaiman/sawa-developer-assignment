import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Select, Switch } from '@mantine/core';
import { TimeInput } from '@mantine/dates';
import {
  IconClock,
  IconPlus,
  IconTrash,
  IconCalendarOff,
  IconEdit,
} from '@tabler/icons-react';
import { DashboardLayout, PageLoader, ListSkeleton } from '@/components/layout';
import { Card, Button, EmptyState } from '@/components/ui';
import { notifySuccess, notifyError } from '@/services/notify';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { dayNames, type ScheduleSlot, type CreateScheduleSlotInput } from '@shared/schemas';

interface Appointment {
  id: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  date: string;
  time: string;
  reason: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled';
}

const slotDurationOptions = [
  { value: '15', label: '15 minutes' },
  { value: '30', label: '30 minutes' },
  { value: '45', label: '45 minutes' },
  { value: '60', label: '60 minutes' },
];

export function ScheduleManagementPage() {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<ScheduleSlot | null>(null);
  const [formData, setFormData] = useState<CreateScheduleSlotInput>({
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '17:00',
    slotDuration: 30,
    isActive: true,
  });
  const queryClient = useQueryClient();

  const { data: schedules, isLoading } = useQuery<ScheduleSlot[]>({
    queryKey: ['doctor-schedules', user?.doctorId],
    queryFn: async () => {
      const response = await api.get(`/schedules/${user?.doctorId}`);
      return response.data.data.schedules;
    },
    enabled: !!user?.doctorId,
  });

  const { data: appointments, isLoading: isAppointmentsLoading } = useQuery<Appointment[]>({
    queryKey: ['doctor-appointments', user?.doctorId],
    queryFn: async () => {
      const response = await api.get(`/doctors/${user?.doctorId}/appointments`);
      return response.data.data.appointments;
    },
    enabled: !!user?.doctorId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateScheduleSlotInput) => {
      return api.post('/schedules', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-schedules'] });
      notifySuccess('Schedule slot created');
      closeModal();
    },
    onError: () => {
      notifyError('Failed to create schedule slot');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateScheduleSlotInput> }) => {
      return api.put(`/schedules/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-schedules'] });
      notifySuccess('Schedule updated');
      closeModal();
    },
    onError: () => {
      notifyError('Failed to update schedule');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/schedules/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-schedules'] });
      notifySuccess('Schedule slot deleted');
    },
    onError: () => {
      notifyError('Failed to delete schedule slot');
    },
  });

  const openCreateModal = () => {
    setEditingSlot(null);
    setFormData({
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '17:00',
      slotDuration: 30,
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (slot: ScheduleSlot) => {
    setEditingSlot(slot);
    setFormData({
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      slotDuration: slot.slotDuration,
      isActive: slot.isActive,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingSlot(null);
  };

  const handleSubmit = () => {
    if (editingSlot) {
      updateMutation.mutate({ id: editingSlot.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  // Group schedules by day
  const schedulesByDay = dayNames.map((day, index) => ({
    day,
    dayIndex: index,
    slots: schedules?.filter((s) => s.dayOfWeek === index) || [],
  }));

  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());

  const weekDates = dayNames.map((day, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    return {
      day,
      dayIndex: index,
      date,
      dateKey: date.toISOString().split('T')[0],
      dateLabel: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    };
  });

  const activeAppointments = appointments?.filter((appointment) =>
    appointment.status === 'pending' || appointment.status === 'confirmed'
  ) || [];

  const appointmentsByDate = activeAppointments.reduce<Record<string, Appointment[]>>(
    (acc, appointment) => {
      if (!acc[appointment.date]) {
        acc[appointment.date] = [];
      }
      acc[appointment.date].push(appointment);
      return acc;
    },
    {}
  );

  const appointmentStatusStyles: Record<Appointment['status'], { bg: string; text: string } | null> = {
    pending: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400' },
    confirmed: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-400' },
    rejected: null,
    completed: null,
    cancelled: null,
  };

  return (
    <DashboardLayout
      title="Schedule Management"
      subtitle="Set your availability for patient appointments"
      actions={
        <Button variant="primary" onClick={openCreateModal}>
          <IconPlus size={18} className="mr-2" />
          Add Time Slot
        </Button>
      }
    >
      <PageLoader isLoading={isLoading} loadingText="Loading schedule...">
        <div className="grid lg:grid-cols-2 gap-6">
          {schedulesByDay.map(({ day, dayIndex, slots }) => (
            <Card
              key={dayIndex}
              variant="elevated"
              padding="none"
              className="animate-fade-in-up overflow-hidden"
            >
              <div className={`px-6 py-4 border-b border-gray-100 dark:border-gray-800 ${
                dayIndex === new Date().getDay() 
                  ? 'bg-blue-50 dark:bg-blue-900/20' 
                  : 'bg-gray-50 dark:bg-gray-800'
              }`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 dark:text-white">{day}</h3>
                  {dayIndex === new Date().getDay() && (
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full">
                      Today
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4">
                {slots.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                    <IconCalendarOff size={24} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Not available</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {slots.map((slot) => (
                      <div
                        key={slot.id}
                        className={`
                          flex items-center justify-between p-3 rounded-xl
                          ${slot.isActive 
                            ? 'bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800' 
                            : 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 opacity-60'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <IconClock size={18} className={slot.isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-400'} />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {slot.startTime} - {slot.endTime}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {slot.slotDuration} min slots
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(slot)}
                            className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <IconEdit size={16} className="text-gray-500" />
                          </button>
                          <button
                            onClick={() => deleteMutation.mutate(slot.id)}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <IconTrash size={16} className="text-red-500" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">This Week's Appointments</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Patients scheduled this week</p>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {weekDates[0].dateLabel} - {weekDates[6].dateLabel}
            </span>
          </div>

          {isAppointmentsLoading ? (
            <ListSkeleton count={3} />
          ) : activeAppointments.length === 0 ? (
            <EmptyState
              icon={<IconCalendarOff size={48} className="text-gray-300" />}
              title="No appointments this week"
              description="Accepted appointments for this week will appear here"
            />
          ) : (
            <div className="grid lg:grid-cols-2 gap-6">
              {weekDates.map((weekDay) => {
                const dayAppointments = (appointmentsByDate[weekDay.dateKey] || []).sort(
                  (a, b) => a.time.localeCompare(b.time)
                );

                return (
                  <Card
                    key={weekDay.dateKey}
                    variant="elevated"
                    padding="none"
                    className="overflow-hidden"
                  >
                    <div className={`px-6 py-4 border-b border-gray-100 dark:border-gray-800 ${
                      weekDay.dayIndex === new Date().getDay()
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : 'bg-gray-50 dark:bg-gray-800'
                    }`}>
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {weekDay.day}
                        </h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {weekDay.dateLabel}
                        </span>
                      </div>
                    </div>

                    <div className="p-4">
                      {dayAppointments.length === 0 ? (
                        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                          <p className="text-sm">No patients booked</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {dayAppointments.map((appointment) => {
                            const statusStyle = appointmentStatusStyles[appointment.status];
                            return (
                              <div
                                key={appointment.id}
                                className="flex items-start justify-between gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800"
                              >
                                <div>
                                  <p className="font-semibold text-gray-900 dark:text-white">
                                    {appointment.time} · {appointment.patientName}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {appointment.reason.length > 50
                                      ? `${appointment.reason.substring(0, 50)}...`
                                      : appointment.reason}
                                  </p>
                                </div>
                                {statusStyle && (
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-semibold ${statusStyle.bg} ${statusStyle.text}`}
                                  >
                                    {appointment.status}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </PageLoader>

      {/* Create/Edit Modal */}
      <Modal
        opened={modalOpen}
        onClose={closeModal}
        title={editingSlot ? 'Edit Schedule Slot' : 'Add Schedule Slot'}
        centered
      >
        <div className="space-y-4">
          <Select
            label="Day of Week"
            data={dayNames.map((day, index) => ({ value: index.toString(), label: day }))}
            value={formData.dayOfWeek.toString()}
            onChange={(value) => setFormData({ ...formData, dayOfWeek: parseInt(value || '1') })}
          />

          <div className="grid grid-cols-2 gap-4">
            <TimeInput
              label="Start Time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.currentTarget.value })}
            />
            <TimeInput
              label="End Time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.currentTarget.value })}
            />
          </div>

          <Select
            label="Slot Duration"
            data={slotDurationOptions}
            value={formData.slotDuration.toString()}
            onChange={(value) => setFormData({ ...formData, slotDuration: parseInt(value || '30') })}
          />

          <Switch
            label="Active"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.currentTarget.checked })}
          />

          <div className="flex items-center gap-3 pt-4">
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={createMutation.isPending || updateMutation.isPending}
              fullWidth
            >
              {editingSlot ? 'Update' : 'Create'} Slot
            </Button>
            <Button variant="secondary" onClick={closeModal} fullWidth>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
