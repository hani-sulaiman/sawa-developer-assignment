import { Router, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { authenticate } from '../../middleware/auth.middleware';
import { getDatabase, saveDatabase } from '../../database';
import { createNotification } from '../shared/notifications.routes';

const router = Router();

// Get prescriptions for patient
router.get('/my', authenticate, async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const userId = req.user!.userId;

    const prescriptions = db.exec(`
      SELECT * FROM prescriptions 
      WHERE patient_id = ?
      ORDER BY created_at DESC
    `, [userId]);

    const result = prescriptions[0]?.values.map((row: any) => ({
      id: row[0],
      doctorId: row[1],
      doctorName: row[2],
      patientId: row[3],
      patientName: row[4],
      appointmentId: row[5],
      medications: JSON.parse(row[6] || '[]'),
      diagnosis: row[7],
      instructions: row[8],
      validUntil: row[9],
      createdAt: row[10],
    })) || [];

    res.json({ success: true, data: { prescriptions: result } });
  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({ success: false, error: 'Failed to get prescriptions' });
  }
});

// Update prescription (doctor only)
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const doctorId = req.user!.doctorId;
    const doctorName = req.user!.name;
    const { id } = req.params;

    if (!doctorId) {
      return res.status(403).json({ success: false, error: 'Not a doctor' });
    }

    const existing = db.exec(`
      SELECT patient_id, patient_name, medications, created_at
      FROM prescriptions
      WHERE id = ? AND doctor_id = ?
    `, [id, doctorId]);

    if (!existing[0]?.values?.length) {
      return res.status(404).json({ success: false, error: 'Prescription not found' });
    }

    const [existingPatientId, existingPatientName, existingMedications, existingCreatedAt] = existing[0].values[0];
    const { patientId, appointmentId, medications, diagnosis, instructions, validUntil } = req.body;

    const resolvedPatientId = patientId || existingPatientId;
    let patientName = existingPatientName;

    if (resolvedPatientId && resolvedPatientId !== existingPatientId) {
      const patient = db.exec(`SELECT name FROM users WHERE id = ?`, [resolvedPatientId]);
      patientName = patient[0]?.values[0]?.[0] || existingPatientName;
    }

    const updatedMedications = medications || JSON.parse(existingMedications ? String(existingMedications) : '[]');

    db.run(`
      UPDATE prescriptions
      SET patient_id = ?, patient_name = ?, appointment_id = ?, medications = ?, diagnosis = ?, instructions = ?, valid_until = ?
      WHERE id = ? AND doctor_id = ?
    `, [
      resolvedPatientId,
      patientName,
      appointmentId || null,
      JSON.stringify(updatedMedications),
      diagnosis || null,
      instructions || null,
      validUntil || null,
      id,
      doctorId,
    ]);

    saveDatabase();

    // Send notification to patient about updated prescription
    const io = req.app.get('io');
    await createNotification(
      resolvedPatientId,
      'prescription_created',
      'Prescription Updated',
      `Dr. ${doctorName} has updated your prescription`,
      { prescriptionId: id, doctorName },
      io
    );

    res.json({
      success: true,
      data: {
        prescription: {
          id,
          doctorId,
          doctorName,
          patientId: resolvedPatientId,
          patientName,
          appointmentId: appointmentId || null,
          medications: updatedMedications,
          diagnosis: diagnosis || null,
          instructions: instructions || null,
          validUntil: validUntil || null,
          createdAt: existingCreatedAt,
        },
      },
    });
  } catch (error) {
    console.error('Update prescription error:', error);
    res.status(500).json({ success: false, error: 'Failed to update prescription' });
  }
});

// Delete prescription (doctor only)
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const doctorId = req.user!.doctorId;
    const { id } = req.params;

    if (!doctorId) {
      return res.status(403).json({ success: false, error: 'Not a doctor' });
    }

    const existing = db.exec(`SELECT id FROM prescriptions WHERE id = ? AND doctor_id = ?`, [id, doctorId]);

    if (!existing[0]?.values?.length) {
      return res.status(404).json({ success: false, error: 'Prescription not found' });
    }

    db.run(`DELETE FROM prescriptions WHERE id = ? AND doctor_id = ?`, [id, doctorId]);
    saveDatabase();

    res.json({ success: true, data: { id } });
  } catch (error) {
    console.error('Delete prescription error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete prescription' });
  }
});

// Get prescriptions created by doctor
router.get('/doctor', authenticate, async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const doctorId = req.user!.doctorId;

    if (!doctorId) {
      return res.status(403).json({ success: false, error: 'Not a doctor' });
    }

    const prescriptions = db.exec(`
      SELECT * FROM prescriptions 
      WHERE doctor_id = ?
      ORDER BY created_at DESC
    `, [doctorId]);

    const result = prescriptions[0]?.values.map((row: any) => ({
      id: row[0],
      doctorId: row[1],
      doctorName: row[2],
      patientId: row[3],
      patientName: row[4],
      appointmentId: row[5],
      medications: JSON.parse(row[6] || '[]'),
      diagnosis: row[7],
      instructions: row[8],
      validUntil: row[9],
      createdAt: row[10],
    })) || [];

    res.json({ success: true, data: { prescriptions: result } });
  } catch (error) {
    console.error('Get doctor prescriptions error:', error);
    res.status(500).json({ success: false, error: 'Failed to get prescriptions' });
  }
});

// Create prescription (doctor only)
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const doctorId = req.user!.doctorId;
    const doctorName = req.user!.name;

    if (!doctorId) {
      return res.status(403).json({ success: false, error: 'Not a doctor' });
    }

    const { patientId, appointmentId, medications, diagnosis, instructions, validUntil } = req.body;

    // Get patient name
    const patient = db.exec(`SELECT name FROM users WHERE id = ?`, [patientId]);
    const patientName = patient[0]?.values[0]?.[0] || 'Unknown';

    const id = uuid();
    db.run(`
      INSERT INTO prescriptions (
        id, doctor_id, doctor_name, patient_id, patient_name, appointment_id,
        medications, diagnosis, instructions, valid_until, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `, [
      id,
      doctorId,
      doctorName,
      patientId,
      patientName,
      appointmentId || null,
      JSON.stringify(medications),
      diagnosis || null,
      instructions || null,
      validUntil || null,
    ]);

    saveDatabase();

    // Send notification to patient about new prescription
    const io = req.app.get('io');
    await createNotification(
      patientId,
      'prescription_created',
      'New Prescription',
      `Dr. ${doctorName} has created a new prescription for you`,
      { prescriptionId: id, doctorName, medications: medications.map((m: any) => m.name).join(', ') },
      io
    );

    res.json({
      success: true,
      data: {
        prescription: {
          id,
          doctorId,
          doctorName,
          patientId,
          patientName,
          appointmentId,
          medications,
          diagnosis,
          instructions,
          validUntil,
          createdAt: new Date().toISOString(),
        }
      }
    });
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({ success: false, error: 'Failed to create prescription' });
  }
});

export default router;
