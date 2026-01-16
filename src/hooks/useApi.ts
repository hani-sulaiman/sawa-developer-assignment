import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Specialty, CreateAppointmentInput } from '../../shared/schemas';

// Query keys
export const queryKeys = {
  doctors: ['doctors'] as const,
  doctor: (id: string) => ['doctor', id] as const,
  doctorAppointments: (doctorId: string) => ['doctorAppointments', doctorId] as const,
  myAppointments: ['myAppointments'] as const,
};

// Doctors hooks
export function useDoctors(specialty?: Specialty) {
  return useQuery({
    queryKey: [...queryKeys.doctors, specialty],
    queryFn: async () => {
      const params = specialty ? { specialty } : {};
      const response = await api.get('/doctors', { params });
      return response.data.data;
    },
  });
}

export function useDoctor(id: string) {
  return useQuery({
    queryKey: queryKeys.doctor(id),
    queryFn: async () => {
      const response = await api.get(`/doctors/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
}

// Doctor appointments hook
export function useDoctorAppointments(doctorId: string) {
  const { token } = useAuth();
  
  return useQuery({
    queryKey: queryKeys.doctorAppointments(doctorId),
    queryFn: async () => {
      if (!token) throw new Error('Not authenticated');
      const response = await api.get(`/doctors/${doctorId}/appointments`);
      return response.data.data;
    },
    enabled: !!token && !!doctorId,
  });
}

// Patient appointments hook
export function useMyAppointments() {
  const { token } = useAuth();
  
  return useQuery({
    queryKey: queryKeys.myAppointments,
    queryFn: async () => {
      if (!token) throw new Error('Not authenticated');
      const response = await api.get('/appointments/my');
      return response.data.data;
    },
    enabled: !!token,
  });
}

// Create appointment mutation
export function useCreateAppointment() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateAppointmentInput) => {
      if (!token) throw new Error('Not authenticated');
      const response = await api.post('/appointments', input);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.myAppointments });
    },
  });
}

// Confirm appointment mutation
export function useConfirmAppointment() {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentId: string) => {
      if (!token) throw new Error('Not authenticated');
      const response = await api.patch(`/appointments/${appointmentId}/confirm`);
      return response.data.data;
    },
    onSuccess: () => {
      if (user?.doctorId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.doctorAppointments(user.doctorId) });
      }
    },
  });
}

// Reject appointment mutation
export function useRejectAppointment() {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentId: string) => {
      if (!token) throw new Error('Not authenticated');
      const response = await api.patch(`/appointments/${appointmentId}/reject`);
      return response.data.data;
    },
    onSuccess: () => {
      if (user?.doctorId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.doctorAppointments(user.doctorId) });
      }
    },
  });
}
