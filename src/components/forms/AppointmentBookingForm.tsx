import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { TextInput, Textarea } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconCalendar, IconClock, IconPhone, IconCheck } from '@tabler/icons-react';
import { z } from 'zod';
import { Button } from '@/components/ui';
import api from '@/services/api';
import { notifyError, notifySuccess } from '@/services/notify';
import { useAuth } from '@/contexts/AuthContext';

const bookingSchema = z.object({
  date: z.date({ required_error: 'Please select a date' }),
  time: z.string().min(1, 'Please select a time'),
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^[+]?[\d\s-]+$/, 'Invalid phone number format'),
  reason: z.string().min(10, 'Please provide more details about your visit'),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface AppointmentBookingFormProps {
  doctorId: string;
}

const timeSlots = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
];

export function AppointmentBookingForm({ doctorId }: AppointmentBookingFormProps) {
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  const selectedDate = watch('date');
  const selectedTime = watch('time');

  const bookMutation = useMutation({
    mutationFn: async (data: BookingFormData) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      const formattedDate = data.date.toISOString().split('T')[0];
      return api.post('/appointments', {
        doctorId,
        patientName: user.name,
        patientEmail: user.email,
        patientPhone: data.phone,
        date: formattedDate,
        time: data.time,
        reason: data.reason,
      });
    },
    onSuccess: () => {
      setSuccess(true);
      reset();
      notifySuccess('Your appointment request was sent to the doctor.', 'Request submitted');
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to book appointment. Please try again.';
      notifyError(message, 'Booking failed');
    },
  });

  const onSubmit = (data: BookingFormData) => {
    bookMutation.mutate(data);
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
          <IconCheck size={32} className="text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Appointment Requested!</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          You'll receive a confirmation once the doctor approves your appointment.
        </p>
        <Button variant="secondary" onClick={() => setSuccess(false)}>
          Book Another Appointment
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <DateInput
        label="Select Date"
        placeholder="Choose a date"
        leftSection={<IconCalendar size={18} className="text-gray-400" />}
        minDate={new Date()}
        value={selectedDate}
        onChange={(value) => setValue('date', value as Date)}
        error={errors.date?.message}
        size="md"
      />

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Select Time</label>
        <div className="grid grid-cols-3 gap-2">
          {timeSlots.map((time) => (
            <button
              key={time}
              type="button"
              onClick={() => setValue('time', time)}
              className={`
                py-2.5 px-3 text-sm font-medium rounded-xl transition-all duration-200
                ${selectedTime === time
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }
              `}
            >
              {time}
            </button>
          ))}
        </div>
        {errors.time && (
          <p className="text-red-500 dark:text-red-400 text-sm mt-2">{errors.time.message}</p>
        )}
      </div>

      <TextInput
        label="Phone Number"
        placeholder="e.g. +1 555 0101"
        leftSection={<IconPhone size={18} className="text-gray-400" />}
        error={errors.phone?.message}
        {...register('phone')}
      />

      <Textarea
        label="Reason for Visit"
        placeholder="Please describe your symptoms or reason for this appointment..."
        minRows={3}
        error={errors.reason?.message}
        {...register('reason')}
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={bookMutation.isPending}
      >
        Confirm Booking
      </Button>
    </form>
  );
}
