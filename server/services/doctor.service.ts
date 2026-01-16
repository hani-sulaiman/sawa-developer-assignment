import { doctorRepository } from '../repositories';
import type { Doctor, Specialty, UpdateDoctorProfileInput } from '../../shared/schemas';

export class DoctorService {
  async findAll(specialty?: Specialty): Promise<Doctor[]> {
    return await doctorRepository.findAll(specialty);
  }

  async findById(id: string): Promise<Doctor | null> {
    return await doctorRepository.findById(id);
  }

  async findBySpecialty(specialty: Specialty): Promise<Doctor[]> {
    return await doctorRepository.findBySpecialty(specialty);
  }

  async exists(id: string): Promise<boolean> {
    return await doctorRepository.exists(id);
  }

  async getCount(): Promise<number> {
    return await doctorRepository.count();
  }

  async getAvailableSpecialties(): Promise<Specialty[]> {
    return await doctorRepository.getSpecialties();
  }

  async updateProfile(doctorId: string, updates: UpdateDoctorProfileInput): Promise<Doctor | null> {
    return await doctorRepository.updateProfile(doctorId, updates);
  }
}

export const doctorService = new DoctorService();
