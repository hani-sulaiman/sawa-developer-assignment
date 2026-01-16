import { Router, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { ZodError, z } from 'zod';
import { authenticate } from '../../middleware/auth.middleware';
import { getDatabase, saveDatabase } from '../../database';
import { CreateMedicalRecordSchema, createErrorResponse } from '../../../shared/schemas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serverRoot = path.join(__dirname, '..', '..');

// Ensure uploads directory exists
const uploadsDir = path.join(serverRoot, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${uuid()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

const router = Router();

const MedicalRecordIdParamSchema = z.object({
  id: z.string().min(1, 'Medical record ID is required'),
});

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

// Get all medical records for the authenticated patient
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    
    if (!req.user?.userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    
    const userId = req.user.userId;

    const records = db.exec(`
      SELECT * FROM medical_records 
      WHERE patient_id = ?
      ORDER BY uploaded_at DESC
    `, [userId]);

    const result = records[0]?.values.map((row: any) => ({
      id: row[0],
      patientId: row[1],
      title: row[2],
      fileType: row[3],
      fileName: row[4],
      fileUrl: row[5],
      fileSize: row[6],
      notes: row[7],
      uploadedAt: row[8],
    })) || [];

    res.json({ success: true, data: { records: result } });
  } catch (error) {
    if (handleZodError(error, res)) {
      return;
    }
    console.error('Get medical records error:', error);
    res.status(500).json({ success: false, error: 'Failed to get medical records' });
  }
});

// Upload new medical record
router.post('/', authenticate, upload.single('file'), async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    
    if (!req.user?.userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    
    const userId = req.user.userId;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const parsed = CreateMedicalRecordSchema.parse({
      title: req.body.title ?? 'Medical Record',
      fileType: req.body.fileType ?? 'other',
      notes: req.body.notes,
    });

    const id = uuid();
    const fileUrl = `/uploads/${file.filename}`;

    db.run(`
      INSERT INTO medical_records (id, patient_id, title, file_type, file_name, file_url, file_size, notes, uploaded_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `, [id, userId, parsed.title, parsed.fileType, file.originalname, fileUrl, file.size, parsed.notes ?? null]);

    saveDatabase();

    res.json({
      success: true,
      data: {
        record: {
          id,
          patientId: userId,
          title: parsed.title,
          fileType: parsed.fileType,
          fileName: file.originalname,
          fileUrl,
          fileSize: file.size,
          notes: parsed.notes ?? null,
          uploadedAt: new Date().toISOString(),
        }
      }
    });
  } catch (error) {
    if (handleZodError(error, res)) {
      return;
    }
    console.error('Upload medical record error:', error);
    res.status(500).json({ success: false, error: 'Failed to upload medical record' });
  }
});

// Delete medical record
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    
    if (!req.user?.userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    
    const userId = req.user.userId;
    const { id } = MedicalRecordIdParamSchema.parse(req.params);

    // Get file info before deleting
    const record = db.exec(`
      SELECT file_url FROM medical_records WHERE id = ? AND patient_id = ?
    `, [id, userId]);

    if (record[0]?.values.length > 0) {
      const fileUrl = record[0].values[0][0] as string;
      const filePath = path.join(serverRoot, '..', fileUrl.replace(/^\/+/, ''));

      // Delete file from disk
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Delete from database
      db.run(`DELETE FROM medical_records WHERE id = ? AND patient_id = ?`, [id, userId]);
      saveDatabase();
    }

    res.json({ success: true, data: { message: 'Medical record deleted' } });
  } catch (error) {
    if (handleZodError(error, res)) {
      return;
    }
    console.error('Delete medical record error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete medical record' });
  }
});

export default router;
