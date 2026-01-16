import { getDatabase, saveDatabase } from '../database';
import type { Appointment, AppointmentStatus, CreateAppointmentInput } from '../../shared/schemas';
import { v4 as uuidv4 } from 'uuid';
import type { SqlValue } from 'sql.js';

export class AppointmentRepository {
  private mapRowToAppointment(values: SqlValue[]): Appointment {
    return {
      id: values[0] as string,
      doctorId: values[1] as string,
      doctorName: values[2] as string,
      patientId: values[3] as string || undefined,
      patientName: values[4] as string,
      patientEmail: values[5] as string,
      patientPhone: values[6] as string,
      date: values[7] as string,
      time: values[8] as string,
      reason: values[9] as string,
      status: values[10] as AppointmentStatus,
      createdAt: values[11] as string,
    };
  }

  async findById(id: string): Promise<Appointment | null> {
    const db = await getDatabase();
    const result = db.exec('SELECT * FROM appointments WHERE id = ?', [id]);
    if (result.length === 0 || result[0].values.length === 0) return null;
    return this.mapRowToAppointment(result[0].values[0]);
  }

  async findByDoctorId(doctorId: string): Promise<Appointment[]> {
    const db = await getDatabase();
    const result = db.exec(
      'SELECT * FROM appointments WHERE doctor_id = ? ORDER BY date DESC, time ASC',
      [doctorId]
    );
    if (result.length === 0) return [];
    return result[0].values.map((row) => this.mapRowToAppointment(row));
  }

  async findByPatientId(patientId: string): Promise<Appointment[]> {
    const db = await getDatabase();
    const result = db.exec(
      'SELECT * FROM appointments WHERE patient_id = ? ORDER BY date DESC, time ASC',
      [patientId]
    );
    if (result.length === 0) return [];
    return result[0].values.map((row) => this.mapRowToAppointment(row));
  }

  async findByPatientEmail(email: string): Promise<Appointment[]> {
    const db = await getDatabase();
    const result = db.exec(
      'SELECT * FROM appointments WHERE patient_email = ? ORDER BY date DESC, time ASC',
      [email]
    );
    if (result.length === 0) return [];
    return result[0].values.map((row) => this.mapRowToAppointment(row));
  }

  async create(input: CreateAppointmentInput, doctorName: string, patientId?: string): Promise<Appointment> {
    const db = await getDatabase();
    const id = uuidv4();
    
    db.run(
      `INSERT INTO appointments (id, doctor_id, doctor_name, patient_id, patient_name, patient_email, patient_phone, date, time, reason, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        id,
        input.doctorId,
        doctorName,
        patientId || null,
        input.patientName,
        input.patientEmail,
        input.patientPhone,
        input.date,
        input.time,
        input.reason
      ]
    );
    
    saveDatabase();
    return (await this.findById(id))!;
  }

  async updateStatus(id: string, status: AppointmentStatus): Promise<Appointment | null> {
    const db = await getDatabase();
    db.run('UPDATE appointments SET status = ? WHERE id = ?', [status, id]);
    saveDatabase();
    return await this.findById(id);
  }

  async exists(id: string): Promise<boolean> {
    const db = await getDatabase();
    const result = db.exec('SELECT 1 FROM appointments WHERE id = ?', [id]);
    return result.length > 0 && result[0].values.length > 0;
  }

  async countByDoctorId(doctorId: string): Promise<number> {
    const db = await getDatabase();
    const result = db.exec('SELECT COUNT(*) as count FROM appointments WHERE doctor_id = ?', [doctorId]);
    return result.length > 0 && result[0].values.length > 0 ? result[0].values[0][0] as number : 0;
  }

  async hasConflict(doctorId: string, date: string, time: string, excludeId?: string): Promise<boolean> {
    const db = await getDatabase();
    let query = `SELECT 1 FROM appointments WHERE doctor_id = ? AND date = ? AND time = ? AND status != 'rejected'`;
    const params: string[] = [doctorId, date, time];
    
    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }
    
    const result = db.exec(query, params);
    return result.length > 0 && result[0].values.length > 0;
  }
}

export const appointmentRepository = new AppointmentRepository();
