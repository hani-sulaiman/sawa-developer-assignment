import { Router, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { authenticate } from '../../middleware/auth.middleware';
import { getDatabase, saveDatabase } from '../../database';

const router = Router();

// Get schedules for a doctor
router.get('/:doctorId', async (req, res: Response) => {
  try {
    const db = await getDatabase();
    const { doctorId } = req.params;

    const schedules = db.exec(`
      SELECT * FROM schedules WHERE doctor_id = ? ORDER BY day_of_week
    `, [doctorId]);

    const result = schedules[0]?.values.map((row: any) => ({
      id: row[0],
      doctorId: row[1],
      dayOfWeek: row[2],
      startTime: row[3],
      endTime: row[4],
      slotDuration: row[5],
      isActive: row[6] === 1,
    })) || [];

    res.json({ success: true, data: { schedules: result } });
  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({ success: false, error: 'Failed to get schedules' });
  }
});

// Create schedule slot (doctor only)
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const doctorId = req.user!.doctorId;

    if (!doctorId) {
      return res.status(403).json({ success: false, error: 'Not a doctor' });
    }

    const { dayOfWeek, startTime, endTime, slotDuration = 30, isActive = true } = req.body;

    // Check if slot exists for this day
    const existing = db.exec(`
      SELECT id FROM schedules WHERE doctor_id = ? AND day_of_week = ?
    `, [doctorId, dayOfWeek]);

    if (existing[0]?.values.length > 0) {
      return res.status(400).json({ success: false, error: 'Schedule already exists for this day' });
    }

    const id = uuid();
    db.run(`
      INSERT INTO schedules (id, doctor_id, day_of_week, start_time, end_time, slot_duration, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [id, doctorId, dayOfWeek, startTime, endTime, slotDuration, isActive ? 1 : 0]);

    saveDatabase();

    res.json({
      success: true,
      data: {
        schedule: { id, doctorId, dayOfWeek, startTime, endTime, slotDuration, isActive }
      }
    });
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({ success: false, error: 'Failed to create schedule' });
  }
});

// Update schedule slot
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const doctorId = req.user!.doctorId;
    const { id } = req.params;

    if (!doctorId) {
      return res.status(403).json({ success: false, error: 'Not a doctor' });
    }

    const { dayOfWeek, startTime, endTime, slotDuration, isActive } = req.body;

    db.run(`
      UPDATE schedules SET
        day_of_week = COALESCE(?, day_of_week),
        start_time = COALESCE(?, start_time),
        end_time = COALESCE(?, end_time),
        slot_duration = COALESCE(?, slot_duration),
        is_active = COALESCE(?, is_active)
      WHERE id = ? AND doctor_id = ?
    `, [dayOfWeek, startTime, endTime, slotDuration, isActive !== undefined ? (isActive ? 1 : 0) : null, id, doctorId]);

    saveDatabase();

    res.json({ success: true, data: { message: 'Schedule updated' } });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({ success: false, error: 'Failed to update schedule' });
  }
});

// Delete schedule slot
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const doctorId = req.user!.doctorId;
    const { id } = req.params;

    if (!doctorId) {
      return res.status(403).json({ success: false, error: 'Not a doctor' });
    }

    db.run(`DELETE FROM schedules WHERE id = ? AND doctor_id = ?`, [id, doctorId]);
    saveDatabase();

    res.json({ success: true, data: { message: 'Schedule deleted' } });
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete schedule' });
  }
});

export default router;
