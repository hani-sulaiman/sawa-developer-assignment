import { appointmentRepository, doctorRepository } from '../repositories';
import type { Appointment, CreateAppointmentInput, AppointmentStatus } from '../../shared/schemas';
import { createNotification } from '../routes/shared/notifications.routes';

export class AppointmentService {
  async create(input: CreateAppointmentInput, patientId?: string, io?: any): Promise<Appointment> {
    // Verify doctor exists
    const doctor = await doctorRepository.findById(input.doctorId);
    if (!doctor) {
      throw new Error('Doctor not found');
    }

    // Check for conflicts
    if (await appointmentRepository.hasConflict(input.doctorId, input.date, input.time)) {
      throw new Error('This time slot is already booked');
    }

    const appointment = await appointmentRepository.create(input, doctor.name, patientId);

    // Send notification to doctor about new appointment
    // Find the user account linked to this doctor
    const { getDatabase } = await import('../database');
    const db = await getDatabase();
    const doctorUser = db.exec('SELECT id FROM users WHERE doctor_id = ? AND role = ?', [doctor.id, 'doctor']);
    
    if (doctorUser[0]?.values?.length > 0) {
      const doctorUserId = doctorUser[0].values[0][0] as string;
      await createNotification(
        doctorUserId,
        'new_appointment',
        'New Appointment Request',
        `${input.patientName} has requested an appointment on ${input.date} at ${input.time}`,
        { appointmentId: appointment.id, patientName: input.patientName, date: input.date, time: input.time },
        io
      );
    }

    return appointment;
  }

  async findByDoctorId(doctorId: string): Promise<Appointment[]> {
    return await appointmentRepository.findByDoctorId(doctorId);
  }

  async findByPatientId(patientId: string): Promise<Appointment[]> {
    return await appointmentRepository.findByPatientId(patientId);
  }

  async findById(id: string): Promise<Appointment | null> {
    return await appointmentRepository.findById(id);
  }

  async confirm(id: string, doctorId: string, io?: any): Promise<Appointment> {
    const appointment = await appointmentRepository.findById(id);
    
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    if (appointment.doctorId !== doctorId) {
      throw new Error('You can only manage your own appointments');
    }

    if (appointment.status !== 'pending') {
      throw new Error('Only pending appointments can be confirmed');
    }

    const updated = await appointmentRepository.updateStatus(id, 'confirmed');
    if (!updated) {
      throw new Error('Failed to confirm appointment');
    }

    // Send notification to patient about confirmed appointment
    if (appointment.patientId) {
      await createNotification(
        appointment.patientId,
        'appointment_confirmed',
        'Appointment Confirmed',
        `Your appointment with Dr. ${appointment.doctorName} on ${appointment.date} at ${appointment.time} has been confirmed`,
        { appointmentId: id, doctorName: appointment.doctorName, date: appointment.date, time: appointment.time },
        io
      );
    }

    return updated;
  }

  async reject(id: string, doctorId: string, io?: any): Promise<Appointment> {
    const appointment = await appointmentRepository.findById(id);
    
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    if (appointment.doctorId !== doctorId) {
      throw new Error('You can only manage your own appointments');
    }

    if (appointment.status !== 'pending') {
      throw new Error('Only pending appointments can be rejected');
    }

    const updated = await appointmentRepository.updateStatus(id, 'rejected');
    if (!updated) {
      throw new Error('Failed to reject appointment');
    }

    // Send notification to patient about rejected appointment
    if (appointment.patientId) {
      await createNotification(
        appointment.patientId,
        'appointment_rejected',
        'Appointment Rejected',
        `Your appointment request with Dr. ${appointment.doctorName} on ${appointment.date} at ${appointment.time} has been declined`,
        { appointmentId: id, doctorName: appointment.doctorName, date: appointment.date, time: appointment.time },
        io
      );
    }

    return updated;
  }

  async updateStatus(id: string, status: AppointmentStatus): Promise<Appointment | null> {
    return await appointmentRepository.updateStatus(id, status);
  }

  async getAppointmentsByDoctor(doctorId: string, status?: AppointmentStatus): Promise<Appointment[]> {
    const appointments = await appointmentRepository.findByDoctorId(doctorId);
    
    if (status) {
      return appointments.filter((apt) => apt.status === status);
    }
    
    return appointments;
  }
}

export const appointmentService = new AppointmentService();
