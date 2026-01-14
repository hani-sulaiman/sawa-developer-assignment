export interface Doctor {
  id: string;
  name: string;
  specialty: Specialty;
  hospital: string;
  location: string;
  rating: number;
  reviewCount: number;
  experience: number;
  fee: number;
  currency: string;
  availableDays: string[];
  bio: string;
  image: string;
}

export type Specialty = 'general' | 'cardiology' | 'dermatology' | 'pediatrics' | 'orthopedics';

export interface SpecialtyOption {
  id: Specialty;
  name: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'rejected';

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  date: string;
  time: string;
  reason: string;
  status: AppointmentStatus;
  createdAt: string;
}

export interface ApiError {
  error: string;
  details?: Record<string, string[]>;
}
