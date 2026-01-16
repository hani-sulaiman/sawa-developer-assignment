import { getDatabase, saveDatabase } from '../database';
import type { User, UserResponse } from '../../shared/schemas';
import type { SqlValue } from 'sql.js';

interface UserRow {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'patient' | 'doctor';
  doctor_id: string | null;
  created_at: string;
}

export class UserRepository {
  private mapRowToUser(values: SqlValue[]): User {
    return {
      id: values[0] as string,
      name: values[1] as string,
      email: values[2] as string,
      password: values[3] as string,
      role: values[4] as 'patient' | 'doctor',
      doctorId: values[5] as string | null,
      createdAt: values[6] as string,
    };
  }

  private mapRowToUserResponse(values: SqlValue[]): UserResponse {
    return {
      id: values[0] as string,
      name: values[1] as string,
      email: values[2] as string,
      role: values[4] as 'patient' | 'doctor',
      doctorId: values[5] as string | null,
      createdAt: values[6] as string,
    };
  }

  async findById(id: string): Promise<User | null> {
    const db = await getDatabase();
    const result = db.exec('SELECT * FROM users WHERE id = ?', [id]);
    if (result.length === 0 || result[0].values.length === 0) return null;
    return this.mapRowToUser(result[0].values[0]);
  }

  async findByIdSafe(id: string): Promise<UserResponse | null> {
    const db = await getDatabase();
    const result = db.exec('SELECT * FROM users WHERE id = ?', [id]);
    if (result.length === 0 || result[0].values.length === 0) return null;
    return this.mapRowToUserResponse(result[0].values[0]);
  }

  async findByEmail(email: string): Promise<User | null> {
    const db = await getDatabase();
    const result = db.exec('SELECT * FROM users WHERE email = ?', [email]);
    if (result.length === 0 || result[0].values.length === 0) return null;
    return this.mapRowToUser(result[0].values[0]);
  }

  async findByDoctorId(doctorId: string): Promise<User | null> {
    const db = await getDatabase();
    const result = db.exec('SELECT * FROM users WHERE doctor_id = ?', [doctorId]);
    if (result.length === 0 || result[0].values.length === 0) return null;
    return this.mapRowToUser(result[0].values[0]);
  }

  async create(user: Omit<User, 'createdAt'>): Promise<UserResponse> {
    const db = await getDatabase();
    db.run(
      `INSERT INTO users (id, name, email, password, role, doctor_id) VALUES (?, ?, ?, ?, ?, ?)`,
      [user.id, user.name, user.email, user.password, user.role, user.doctorId || null]
    );
    saveDatabase();
    return (await this.findByIdSafe(user.id))!;
  }

  async emailExists(email: string): Promise<boolean> {
    const db = await getDatabase();
    const result = db.exec('SELECT 1 FROM users WHERE email = ?', [email]);
    return result.length > 0 && result[0].values.length > 0;
  }

  async updatePassword(id: string, hashedPassword: string): Promise<boolean> {
    const db = await getDatabase();
    db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
    saveDatabase();
    return true;
  }
}

export const userRepository = new UserRepository();
