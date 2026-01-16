import { Router, Request, Response } from 'express';
import { authenticate, requireDoctor } from '../../middleware';
import { getDatabase } from '../../database';
import { createSuccessResponse, createErrorResponse } from '../../../shared/schemas';

const router = Router();

// GET /api/doctors/patients - Get list of patients for the logged-in doctor
router.get('/', authenticate, requireDoctor, async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const doctorId = req.user!.doctorId;

    if (!doctorId) {
      return res.status(403).json(createErrorResponse('Not a doctor'));
    }

    const result = db.exec(`
      SELECT DISTINCT 
        COALESCE(u.id, a.patient_id, a.patient_email) AS id,
        COALESCE(u.name, a.patient_name) AS name,
        COALESCE(u.email, a.patient_email) AS email,
        a.patient_phone AS phone
      FROM appointments a
      LEFT JOIN users u ON u.id = a.patient_id
      WHERE a.doctor_id = ?
      ORDER BY name ASC
    `, [doctorId]);

    const patients = result[0]?.values.map((row: any) => ({
      id: row[0],
      name: row[1],
      email: row[2],
      phone: row[3],
    })) || [];

    res.json(createSuccessResponse({ patients }));
  } catch (error) {
    console.error('Get doctor patients error:', error);
    res.status(500).json(createErrorResponse('Failed to get patients'));
  }
});

export default router;
