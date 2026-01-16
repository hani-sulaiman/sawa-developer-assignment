import { Router, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { z, ZodError } from 'zod';
import { authenticate } from '../../middleware/auth.middleware';
import { getDatabase, saveDatabase } from '../../database';
import { createErrorResponse, CreateNotificationSchema } from '../../../shared/schemas';

const router = Router();

const NotificationIdParamSchema = z.object({
  id: z.string().min(1, 'Notification ID is required'),
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

// Get all notifications for the authenticated user
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    
    if (!req.user?.userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    
    const userId = req.user.userId;

    const notifications = db.exec(`
      SELECT * FROM notifications 
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `, [userId]);

    const result = notifications[0]?.values.map((row: any) => ({
      id: row[0],
      userId: row[1],
      type: row[2],
      title: row[3],
      message: row[4],
      data: row[5] ? JSON.parse(row[5]) : null,
      isRead: row[6] === 1,
      createdAt: row[7],
    })) || [];

    res.json({ success: true, data: { notifications: result } });
  } catch (error) {
    if (handleZodError(error, res)) {
      return;
    }
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, error: 'Failed to get notifications' });
  }
});

// Get unread count
router.get('/unread-count', authenticate, async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    
    if (!req.user?.userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    
    const userId = req.user.userId;

    const result = db.exec(`
      SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = 0
    `, [userId]);

    const count = result[0]?.values[0]?.[0] || 0;

    res.json({ success: true, data: { count } });
  } catch (error) {
    if (handleZodError(error, res)) {
      return;
    }
    console.error('Get unread count error:', error);
    res.status(500).json({ success: false, error: 'Failed to get unread count' });
  }
});

// Mark notification as read
router.patch('/:id/read', authenticate, async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    
    if (!req.user?.userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    
    const userId = req.user.userId;
    const { id } = NotificationIdParamSchema.parse(req.params);

    db.run(`
      UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?
    `, [id, userId]);

    saveDatabase();

    res.json({ success: true, data: { message: 'Notification marked as read' } });
  } catch (error) {
    if (handleZodError(error, res)) {
      return;
    }
    console.error('Mark notification read error:', error);
    res.status(500).json({ success: false, error: 'Failed to mark notification as read' });
  }
});

// Mark all as read
router.patch('/read-all', authenticate, async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    
    if (!req.user?.userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    
    const userId = req.user.userId;

    db.run(`UPDATE notifications SET is_read = 1 WHERE user_id = ?`, [userId]);
    saveDatabase();

    res.json({ success: true, data: { message: 'All notifications marked as read' } });
  } catch (error) {
    if (handleZodError(error, res)) {
      return;
    }
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ success: false, error: 'Failed to mark notifications as read' });
  }
});

// Delete notification
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    
    if (!req.user?.userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    
    const userId = req.user.userId;
    const { id } = NotificationIdParamSchema.parse(req.params);

    db.run(`DELETE FROM notifications WHERE id = ? AND user_id = ?`, [id, userId]);
    saveDatabase();

    res.json({ success: true, data: { message: 'Notification deleted' } });
  } catch (error) {
    if (handleZodError(error, res)) {
      return;
    }
    console.error('Delete notification error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete notification' });
  }
});

// Utility function to create notification (used by other routes)
export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  data?: Record<string, any>,
  io?: any
) {
  const db = await getDatabase();
  const id = uuid();
  const createdAt = new Date().toISOString();
  const parsed = CreateNotificationSchema.parse({ userId, type, title, message, data });
  const dataJson = parsed.data ? JSON.stringify(parsed.data) : null;

  db.run(`
    INSERT INTO notifications (id, user_id, type, title, message, data, is_read, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 0, ?)
  `, [id, parsed.userId, parsed.type, parsed.title, parsed.message, dataJson, createdAt]);

  saveDatabase();

  // Emit Socket.IO event for real-time notification
  if (io) {
    const notification = {
      id,
      userId: parsed.userId,
      type: parsed.type,
      title: parsed.title,
      message: parsed.message,
      data: parsed.data || null,
      isRead: false,
      createdAt,
    };
    
    // Emit to user's personal room
    io.to(`user:${userId}`).emit('new-notification', notification);
  }

  return id;
}

export default router;
