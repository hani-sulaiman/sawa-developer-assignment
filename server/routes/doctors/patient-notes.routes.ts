import { Router, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { authenticate } from '../../middleware/auth.middleware';
import { getDatabase, saveDatabase } from '../../database';

const router = Router();

// Get all patient notes for the authenticated doctor
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const doctorId = req.user!.doctorId;

    if (!doctorId) {
      return res.status(403).json({ success: false, error: 'Not a doctor' });
    }

    const notes = db.exec(`
      SELECT
        pn.id,
        pn.doctor_id,
        pn.patient_id,
        COALESCE(
          u.name,
          (
            SELECT a.patient_name
            FROM appointments a
            WHERE a.doctor_id = pn.doctor_id
              AND (a.patient_id = pn.patient_id OR a.patient_email = pn.patient_id)
            ORDER BY a.date DESC, a.time DESC
            LIMIT 1
          ),
          pn.patient_name
        ) AS patient_name,
        pn.appointment_id,
        pn.note,
        pn.created_at,
        pn.updated_at
      FROM patient_notes pn
      LEFT JOIN users u ON u.id = pn.patient_id
      WHERE pn.doctor_id = ?
      ORDER BY pn.updated_at DESC
    `, [doctorId]);

    const result = notes[0]?.values.map((row: any) => ({
      id: row[0],
      doctorId: row[1],
      patientId: row[2],
      patientName: row[3],
      appointmentId: row[4],
      note: row[5],
      createdAt: row[6],
      updatedAt: row[7],
    })) || [];

    res.json({ success: true, data: { notes: result } });
  } catch (error) {
    console.error('Get patient notes error:', error);
    res.status(500).json({ success: false, error: 'Failed to get patient notes' });
  }
});

// Get notes for a specific patient
router.get('/patient/:patientId', authenticate, async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const doctorId = req.user!.doctorId;
    const { patientId } = req.params;

    if (!doctorId) {
      return res.status(403).json({ success: false, error: 'Not a doctor' });
    }

    const notes = db.exec(`
      SELECT
        pn.id,
        pn.doctor_id,
        pn.patient_id,
        COALESCE(
          u.name,
          (
            SELECT a.patient_name
            FROM appointments a
            WHERE a.doctor_id = pn.doctor_id
              AND (a.patient_id = pn.patient_id OR a.patient_email = pn.patient_id)
            ORDER BY a.date DESC, a.time DESC
            LIMIT 1
          ),
          pn.patient_name
        ) AS patient_name,
        pn.appointment_id,
        pn.note,
        pn.created_at,
        pn.updated_at
      FROM patient_notes pn
      LEFT JOIN users u ON u.id = pn.patient_id
      WHERE pn.doctor_id = ? AND pn.patient_id = ?
      ORDER BY pn.updated_at DESC
    `, [doctorId, patientId]);

    const result = notes[0]?.values.map((row: any) => ({
      id: row[0],
      doctorId: row[1],
      patientId: row[2],
      patientName: row[3],
      appointmentId: row[4],
      note: row[5],
      createdAt: row[6],
      updatedAt: row[7],
    })) || [];

    res.json({ success: true, data: { notes: result } });
  } catch (error) {
    console.error('Get patient notes error:', error);
    res.status(500).json({ success: false, error: 'Failed to get patient notes' });
  }
});

// Create patient note
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const doctorId = req.user!.doctorId;

    if (!doctorId) {
      return res.status(403).json({ success: false, error: 'Not a doctor' });
    }

    const { patientId, appointmentId, note } = req.body;

    // Get patient name
    const patient = db.exec(`SELECT name FROM users WHERE id = ?`, [patientId]);
    const appointmentName = db.exec(`
      SELECT patient_name
      FROM appointments
      WHERE doctor_id = ?
        AND (patient_id = ? OR patient_email = ?)
      ORDER BY date DESC, time DESC
      LIMIT 1
    `, [doctorId, patientId, patientId]);
    const patientName =
      patient[0]?.values[0]?.[0] ||
      appointmentName[0]?.values[0]?.[0] ||
      'Unknown';

    const id = uuid();
    db.run(`
      INSERT INTO patient_notes (id, doctor_id, patient_id, patient_name, appointment_id, note, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `, [id, doctorId, patientId, patientName, appointmentId || null, note]);

    saveDatabase();

    res.json({
      success: true,
      data: {
        note: {
          id,
          doctorId,
          patientId,
          patientName,
          appointmentId,
          note,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      }
    });
  } catch (error) {
    console.error('Create patient note error:', error);
    res.status(500).json({ success: false, error: 'Failed to create patient note' });
  }
});

// Update patient note
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const doctorId = req.user!.doctorId;
    const { id } = req.params;
    const { note } = req.body;

    if (!doctorId) {
      return res.status(403).json({ success: false, error: 'Not a doctor' });
    }

    db.run(`
      UPDATE patient_notes SET note = ?, updated_at = datetime('now')
      WHERE id = ? AND doctor_id = ?
    `, [note, id, doctorId]);

    saveDatabase();

    res.json({ success: true, data: { message: 'Note updated' } });
  } catch (error) {
    console.error('Update patient note error:', error);
    res.status(500).json({ success: false, error: 'Failed to update patient note' });
  }
});

// Delete patient note
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const doctorId = req.user!.doctorId;
    const { id } = req.params;

    if (!doctorId) {
      return res.status(403).json({ success: false, error: 'Not a doctor' });
    }

    db.run(`DELETE FROM patient_notes WHERE id = ? AND doctor_id = ?`, [id, doctorId]);
    saveDatabase();

    res.json({ success: true, data: { message: 'Note deleted' } });
  } catch (error) {
    console.error('Delete patient note error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete patient note' });
  }
});

export default router;
