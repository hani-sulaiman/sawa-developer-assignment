import { getDatabase, saveDatabase } from '../database';
import type { Doctor, Specialty, UpdateDoctorProfileInput } from '../../shared/schemas';
import type { SqlValue } from 'sql.js';

export class DoctorRepository {
  private mapRowToDoctor(values: SqlValue[]): Doctor {
    return {
      id: values[0] as string,
      name: values[1] as string,
      specialty: values[2] as Specialty,
      hospital: values[3] as string,
      location: values[4] as string,
      rating: values[5] as number,
      reviewCount: values[6] as number,
      experience: values[7] as number,
      fee: values[8] as number,
      currency: values[9] as string,
      availableDays: JSON.parse(values[10] as string),
      bio: values[11] as string,
      image: values[12] as string,
      phone: (values[13] as string) || null,
    };
  }

  async findAll(specialty?: Specialty): Promise<Doctor[]> {
    const db = await getDatabase();
    let query = 'SELECT * FROM doctors';
    const params: (string | number)[] = [];

    if (specialty) {
      query += ' WHERE specialty = ?';
      params.push(specialty);
    }

    query += ' ORDER BY rating DESC, review_count DESC';

    const result = db.exec(query, params);
    if (result.length === 0) return [];
    return result[0].values.map((row) => this.mapRowToDoctor(row));
  }

  async findById(id: string): Promise<Doctor | null> {
    const db = await getDatabase();
    const result = db.exec('SELECT * FROM doctors WHERE id = ?', [id]);
    if (result.length === 0 || result[0].values.length === 0) return null;
    return this.mapRowToDoctor(result[0].values[0]);
  }

  async findBySpecialty(specialty: Specialty): Promise<Doctor[]> {
    const db = await getDatabase();
    const result = db.exec('SELECT * FROM doctors WHERE specialty = ? ORDER BY rating DESC', [specialty]);
    if (result.length === 0) return [];
    return result[0].values.map((row) => this.mapRowToDoctor(row));
  }

  async exists(id: string): Promise<boolean> {
    const db = await getDatabase();
    const result = db.exec('SELECT 1 FROM doctors WHERE id = ?', [id]);
    return result.length > 0 && result[0].values.length > 0;
  }

  async count(): Promise<number> {
    const db = await getDatabase();
    const result = db.exec('SELECT COUNT(*) as count FROM doctors');
    return result.length > 0 && result[0].values.length > 0 ? result[0].values[0][0] as number : 0;
  }

  async getSpecialties(): Promise<Specialty[]> {
    const db = await getDatabase();
    const result = db.exec('SELECT DISTINCT specialty FROM doctors');
    if (result.length === 0) return [];
    return result[0].values.map((row) => row[0] as Specialty);
  }

  async updateProfile(doctorId: string, updates: UpdateDoctorProfileInput): Promise<Doctor | null> {
    const db = await getDatabase();
    const fields: string[] = [];
    const values: Array<string | number | null> = [];

    const addField = (field: string, value: string | number | null) => {
      fields.push(`${field} = ?`);
      values.push(value);
    };

    if (updates.name !== undefined) addField('name', updates.name);
    if (updates.specialty !== undefined) addField('specialty', updates.specialty);
    if (updates.hospital !== undefined) addField('hospital', updates.hospital);
    if (updates.location !== undefined) addField('location', updates.location);
    if (updates.phone !== undefined) addField('phone', updates.phone);
    if (updates.experience !== undefined) addField('experience', updates.experience);
    if (updates.fee !== undefined) addField('fee', updates.fee);
    if (updates.currency !== undefined) addField('currency', updates.currency);
    if (updates.availableDays !== undefined) {
      addField('available_days', JSON.stringify(updates.availableDays));
    }
    if (updates.bio !== undefined) addField('bio', updates.bio);
    if (updates.image !== undefined) addField('image', updates.image);

    if (fields.length === 0) {
      return await this.findById(doctorId);
    }

    db.run(`UPDATE doctors SET ${fields.join(', ')} WHERE id = ?`, [...values, doctorId]);
    saveDatabase();
    return await this.findById(doctorId);
  }
}

export const doctorRepository = new DoctorRepository();
