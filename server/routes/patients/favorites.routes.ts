import { Router, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { ZodError } from 'zod';
import { authenticate } from '../../middleware/auth.middleware';
import { getDatabase, saveDatabase } from '../../database';
import { ToggleFavoriteSchema, createErrorResponse } from '../../../shared/schemas';

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

// Get all favorites for the authenticated user
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    
    if (!req.user?.userId) {
      return res.json({ success: true, data: { favorites: [] } });
    }
    
    const userId = req.user.userId;

    const favorites = db.exec(`
      SELECT f.*, d.name, d.specialty, d.hospital, d.location, d.rating, 
             d.review_count, d.experience, d.fee, d.image
      FROM favorites f
      JOIN doctors d ON f.doctor_id = d.id
      WHERE f.patient_id = ?
      ORDER BY f.created_at DESC
    `, [userId]);

    const result = favorites[0]?.values.map((row: any) => ({
      id: row[0],
      patientId: row[1],
      doctorId: row[2],
      createdAt: row[3],
      doctor: {
        id: row[2],
        name: row[4],
        specialty: row[5],
        hospital: row[6],
        location: row[7],
        rating: row[8],
        reviewCount: row[9],
        experience: row[10],
        fee: row[11],
        image: row[12],
      }
    })) || [];

    res.json({ success: true, data: { favorites: result } });
  } catch (error) {
    if (handleZodError(error, res)) {
      return;
    }
    console.error('Get favorites error:', error);
    res.status(500).json({ success: false, error: 'Failed to get favorites' });
  }
});

// Toggle favorite (add/remove)
router.post('/:doctorId', authenticate, async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    
    if (!req.user?.userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    
    const userId = req.user.userId;
    const { doctorId } = ToggleFavoriteSchema.parse(req.params);

    // Check if already favorited
    const existing = db.exec(`
      SELECT id FROM favorites WHERE patient_id = ? AND doctor_id = ?
    `, [userId, doctorId]);

    if (existing[0]?.values?.length > 0) {
      // Remove favorite
      db.run(`DELETE FROM favorites WHERE patient_id = ? AND doctor_id = ?`, [userId, doctorId]);
      saveDatabase();
      res.json({ success: true, data: { favorited: false } });
    } else {
      // Add favorite
      const id = uuid();
      db.run(`
        INSERT INTO favorites (id, patient_id, doctor_id, created_at)
        VALUES (?, ?, ?, datetime('now'))
      `, [id, userId, doctorId]);
      saveDatabase();
      res.json({ success: true, data: { favorited: true } });
    }
  } catch (error) {
    if (handleZodError(error, res)) {
      return;
    }
    console.error('Toggle favorite error:', error);
    res.status(500).json({ success: false, error: 'Failed to toggle favorite' });
  }
});

// Remove favorite
router.delete('/:doctorId', authenticate, async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    
    if (!req.user?.userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    
    const userId = req.user.userId;
    const { doctorId } = ToggleFavoriteSchema.parse(req.params);

    db.run(`DELETE FROM favorites WHERE patient_id = ? AND doctor_id = ?`, [userId, doctorId]);
    saveDatabase();

    res.json({ success: true, data: { message: 'Favorite removed' } });
  } catch (error) {
    if (handleZodError(error, res)) {
      return;
    }
    console.error('Delete favorite error:', error);
    res.status(500).json({ success: false, error: 'Failed to remove favorite' });
  }
});

export default router;
