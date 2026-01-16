import { Router, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { ZodError } from 'zod';
import { authenticate } from '../../middleware/auth.middleware';
import { getDatabase, saveDatabase } from '../../database';
import { UpdatePatientProfileSchema, createErrorResponse } from '../../../shared/schemas';

const router = Router();

const handleZodError = (error: unknown, res: Response) => {
  if (error instanceof ZodError) {
    const { fieldErrors } = error.flatten();
    const details = Object.fromEntries(
      Object.entries(fieldErrors).map(([key, value]) => [key, value ?? []])
    );
    res.status(400).json(createErrorResponse('Validation error', details));
    return true;
  }
  return false;
};

// Get patient profile
router.get('/profile', authenticate, async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    
    if (!req.user?.userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    
    const userId = req.user.userId;

    const profile = db.exec(`
      SELECT * FROM patient_profiles WHERE user_id = ?
    `, [userId]);

    if (profile[0]?.values.length > 0) {
      const row = profile[0].values[0] as any;
      res.json({
        success: true,
        data: {
          profile: {
            id: row[0],
            userId: row[1],
            dateOfBirth: row[2],
            gender: row[3],
            bloodType: row[4],
            allergies: row[5],
            medicalHistory: row[6],
            emergencyContact: row[7],
            emergencyPhone: row[8],
            insuranceProvider: row[9],
            insuranceNumber: row[10],
            address: row[11],
            phone: row[12],
            updatedAt: row[13],
          }
        }
      });
    } else {
      // Create empty profile
      const id = uuid();
      db.run(`
        INSERT INTO patient_profiles (id, user_id, updated_at)
        VALUES (?, ?, datetime('now'))
      `, [id, userId]);
      saveDatabase();

      res.json({
        success: true,
        data: {
          profile: {
            id,
            userId,
            dateOfBirth: null,
            gender: null,
            bloodType: null,
            allergies: null,
            medicalHistory: null,
            emergencyContact: null,
            emergencyPhone: null,
            insuranceProvider: null,
            insuranceNumber: null,
            address: null,
            phone: null,
            updatedAt: new Date().toISOString(),
          }
        }
      });
    }
  } catch (error) {
    if (handleZodError(error, res)) {
      return;
    }
    console.error('Get patient profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to get profile' });
  }
});

// Update patient profile
router.put('/profile', authenticate, async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    
    if (!req.user?.userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    
    const userId = req.user.userId;
    const {
      dateOfBirth,
      gender,
      bloodType,
      allergies,
      medicalHistory,
      emergencyContact,
      emergencyPhone,
      insuranceProvider,
      insuranceNumber,
      address,
      phone,
    } = UpdatePatientProfileSchema.parse(req.body);

    const values = [
      dateOfBirth ?? null,
      gender ?? null,
      bloodType ?? null,
      allergies ?? null,
      medicalHistory ?? null,
      emergencyContact ?? null,
      emergencyPhone ?? null,
      insuranceProvider ?? null,
      insuranceNumber ?? null,
      address ?? null,
      phone ?? null,
    ];

    // Check if profile exists
    const existing = db.exec(`SELECT id FROM patient_profiles WHERE user_id = ?`, [userId]);

    if (existing[0]?.values.length > 0) {
      db.run(`
        UPDATE patient_profiles
        SET date_of_birth = ?, gender = ?, blood_type = ?, allergies = ?, medical_history = ?,
            emergency_contact = ?, emergency_phone = ?, insurance_provider = ?, insurance_number = ?,
            address = ?, phone = ?, updated_at = datetime('now')
        WHERE user_id = ?
      `, [...values, userId]);
    } else {
      const id = uuid();
      db.run(`
        INSERT INTO patient_profiles (
          id, user_id, date_of_birth, gender, blood_type, allergies, medical_history,
          emergency_contact, emergency_phone, insurance_provider, insurance_number,
          address, phone, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `, [id, userId, ...values]);
    }

    saveDatabase();
    res.json({ success: true, data: { message: 'Profile updated' } });
  } catch (error) {
    if (handleZodError(error, res)) {
      return;
    }
    console.error('Update patient profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

export default router;
