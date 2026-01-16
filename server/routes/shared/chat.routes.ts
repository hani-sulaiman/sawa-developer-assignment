import { Router, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { z, ZodError } from 'zod';
import { authenticate } from '../../middleware/auth.middleware';
import { getDatabase, saveDatabase } from '../../database';
import { createErrorResponse } from '../../../shared/schemas';
import { createNotification } from './notifications.routes';

const router = Router();

const ConversationIdSchema = z.object({
  id: z.string().min(1, 'Conversation ID is required'),
});

const DoctorIdParamSchema = z.object({
  doctorId: z.string().min(1, 'Doctor ID is required'),
});

const SendMessageBodySchema = z.object({
  message: z.string().min(1, 'Message is required').max(2000),
});

const StartConversationBodySchema = z.object({
  doctorId: z.string().min(1, 'Doctor ID is required'),
  message: z.string().max(2000).optional(),
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

// Get all conversations for the authenticated user
router.get('/conversations', authenticate, async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    
    if (!req.user || !req.user.userId) {
      return res.json({ success: true, data: { conversations: [] } });
    }
    
    const userId = req.user.userId;
    const role = req.user.role;

    let result: any[] = [];
    
    if (role === 'patient') {
      const conversations = db.exec(`
        SELECT c.id, c.patient_id, c.patient_name, c.doctor_id, c.doctor_name, 
               c.last_message, c.last_message_at, c.created_at,
               (SELECT COUNT(*) FROM chat_messages m WHERE m.conversation_id = c.id AND m.is_read = 0 AND m.sender_id != ?) as unread_count
        FROM conversations c
        WHERE c.patient_id = ?
        ORDER BY c.last_message_at DESC NULLS LAST
      `, [userId, userId]);
      
      result = conversations[0]?.values.map((row: any) => ({
        id: row[0],
        patientId: row[1],
        patientName: row[2],
        doctorId: row[3],
        doctorName: row[4],
        lastMessage: row[5],
        lastMessageAt: row[6],
        createdAt: row[7],
        unreadCount: row[8] || 0,
      })) || [];
    } else if (role === 'doctor' && req.user.doctorId) {
      const doctorId = req.user.doctorId;
      const conversations = db.exec(`
        SELECT c.id, c.patient_id, c.patient_name, c.doctor_id, c.doctor_name, 
               c.last_message, c.last_message_at, c.created_at,
               (SELECT COUNT(*) FROM chat_messages m WHERE m.conversation_id = c.id AND m.is_read = 0 AND m.sender_id != ?) as unread_count
        FROM conversations c
        WHERE c.doctor_id = ?
        ORDER BY c.last_message_at DESC NULLS LAST
      `, [userId, doctorId]);
      
      result = conversations[0]?.values.map((row: any) => ({
        id: row[0],
        patientId: row[1],
        patientName: row[2],
        doctorId: row[3],
        doctorName: row[4],
        lastMessage: row[5],
        lastMessageAt: row[6],
        createdAt: row[7],
        unreadCount: row[8] || 0,
      })) || [];
    }

    res.json({ success: true, data: { conversations: result } });
  } catch (error) {
    if (handleZodError(error, res)) {
      return;
    }
    console.error('Get conversations error:', error);
    res.status(500).json({ success: false, error: 'Failed to get conversations' });
  }
});

// Get or create conversation with a doctor (for patients)
router.get('/conversation-with/:doctorId', authenticate, async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    
    if (!req.user?.userId || !req.user?.name || req.user?.role !== 'patient') {
      return res.status(401).json({ success: false, error: 'Patient authentication required' });
    }
    
    const userId = req.user.userId;
    const userName = req.user.name;
    const { doctorId } = DoctorIdParamSchema.parse(req.params);

    // Check if conversation already exists
    const existing = db.exec(`
      SELECT c.id, c.patient_id, c.patient_name, c.doctor_id, c.doctor_name, 
             c.last_message, c.last_message_at, c.created_at
      FROM conversations c
      WHERE c.patient_id = ? AND c.doctor_id = ?
    `, [userId, doctorId]);

    if (existing[0]?.values?.length > 0) {
      const row = existing[0].values[0];
      return res.json({
        success: true,
        data: {
          conversation: {
            id: row[0],
            patientId: row[1],
            patientName: row[2],
            doctorId: row[3],
            doctorName: row[4],
            lastMessage: row[5],
            lastMessageAt: row[6],
            createdAt: row[7],
            unreadCount: 0,
          },
          isNew: false,
        }
      });
    }

    // Get doctor info
    const doctor = db.exec(`SELECT name FROM doctors WHERE id = ?`, [doctorId]);
    const doctorName = (doctor[0]?.values[0]?.[0] as string) || 'Doctor';

    // Create new conversation
    const conversationId = uuid();
    const now = new Date().toISOString();

    db.run(`
      INSERT INTO conversations (id, patient_id, patient_name, doctor_id, doctor_name, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [conversationId, userId, userName, doctorId, doctorName, now]);

    saveDatabase();

    res.json({
      success: true,
      data: {
        conversation: {
          id: conversationId,
          patientId: userId,
          patientName: userName,
          doctorId,
          doctorName,
          lastMessage: null,
          lastMessageAt: null,
          createdAt: now,
          unreadCount: 0,
        },
        isNew: true,
      }
    });
  } catch (error) {
    if (handleZodError(error, res)) {
      return;
    }
    console.error('Get/create conversation error:', error);
    res.status(500).json({ success: false, error: 'Failed to get/create conversation' });
  }
});

// Get messages for a conversation
router.get('/conversations/:id/messages', authenticate, async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const doctorId = req.user?.doctorId || null;
    const { id: conversationId } = ConversationIdSchema.parse(req.params);

    if (!userId || !conversationId) {
      return res.json({ success: true, data: { messages: [] } });
    }

    // Verify conversation ownership
    const conv = db.exec(`SELECT patient_id, doctor_id FROM conversations WHERE id = ?`, [conversationId]);
    if (!conv[0]?.values?.length) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    const patientId = conv[0].values[0][0] as string;
    const convDoctorId = conv[0].values[0][1] as string;

    if (userRole === 'patient' && patientId !== userId) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    if (userRole === 'doctor' && (!doctorId || convDoctorId !== doctorId)) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Mark messages as read
    db.run(`
      UPDATE chat_messages SET is_read = 1 
      WHERE conversation_id = ? AND sender_id != ?
    `, [conversationId, userId]);
    saveDatabase();

    const messages = db.exec(`
      SELECT * FROM chat_messages 
      WHERE conversation_id = ?
      ORDER BY created_at ASC
    `, [conversationId]);

    const result = messages[0]?.values.map((row: any) => ({
      id: row[0],
      conversationId: row[1],
      senderId: row[2],
      senderName: row[3],
      senderRole: row[4],
      message: row[5],
      isRead: row[6] === 1,
      createdAt: row[7],
    })) || [];

    res.json({ success: true, data: { messages: result } });
  } catch (error) {
    if (handleZodError(error, res)) {
      return;
    }
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, error: 'Failed to get messages' });
  }
});

// Send message
router.post('/conversations/:id/messages', authenticate, async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    
    if (!req.user?.userId || !req.user?.name || !req.user?.role) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    
    const userId = req.user.userId;
    const userName = req.user.name;
    const userRole = req.user.role;
    const doctorId = req.user.doctorId || null;
    const { id: conversationId } = ConversationIdSchema.parse(req.params);
    const { message } = SendMessageBodySchema.parse(req.body);

    // Get conversation to find recipient
    const conv = db.exec(`SELECT patient_id, doctor_id FROM conversations WHERE id = ?`, [conversationId]);
    if (!conv[0]?.values?.length) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }
    
    const patientId = conv[0].values[0][0] as string;
    const convDoctorId = conv[0].values[0][1] as string;

    // Enforce ownership: patient can only send in their conversations,
    // doctor can only send in their own doctor conversations.
    if (userRole === 'patient' && patientId !== userId) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    if (userRole === 'doctor' && (!doctorId || convDoctorId !== doctorId)) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const messageId = uuid();
    const now = new Date().toISOString();
    db.run(`
      INSERT INTO chat_messages (id, conversation_id, sender_id, sender_name, sender_role, message, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 0, ?)
    `, [messageId, conversationId, userId, userName, userRole, message, now]);

    // Update conversation last message
    const lastMsg = message.substring(0, 100);
    db.run(`
      UPDATE conversations SET last_message = ?, last_message_at = ? WHERE id = ?
    `, [lastMsg, now, conversationId]);

    saveDatabase();

    const newMessage = {
      id: messageId,
      conversationId,
      senderId: userId,
      senderName: userName,
      senderRole: userRole,
      message,
      isRead: false,
      createdAt: now,
    };

    // Emit socket event for real-time updates
    const io = req.app.get('io');

    // Determine recipient and send notification
    let recipientId: string;
    let recipientName: string;
    
    if (userRole === 'patient') {
      // Patient sent message to doctor - find doctor's user account
      const doctorUserResult = db.exec('SELECT id, name FROM users WHERE doctor_id = ? AND role = ?', [convDoctorId, 'doctor']);
      if (doctorUserResult[0]?.values?.length > 0) {
        recipientId = doctorUserResult[0].values[0][0] as string;
        recipientName = doctorUserResult[0].values[0][1] as string;
        
        // Send notification to doctor
        await createNotification(
          recipientId,
          'new_message',
          'New Message',
          `${userName} sent you a message`,
          { conversationId, senderId: userId, senderName: userName, messagePreview: message.substring(0, 100) },
          io
        );
      }
    } else {
      // Doctor sent message to patient
      recipientId = patientId;
      
      // Send notification to patient
      await createNotification(
        recipientId,
        'new_message',
        'New Message',
        `Dr. ${userName} sent you a message`,
        { conversationId, senderId: userId, senderName: userName, messagePreview: message.substring(0, 100) },
        io
      );
    }
    if (io) {
      // Emit to conversation room
      io.to(`conversation:${conversationId}`).emit('new-message', newMessage);
      
      // Emit to recipient room for notification update
      if (userRole === 'patient') {
        // Notify doctor room
        io.to(`doctor:${convDoctorId}`).emit('conversation-updated', {
          conversationId,
          lastMessage: message,
          lastMessageAt: now,
        });
      } else {
        // Notify patient room
        io.to(`user:${patientId}`).emit('conversation-updated', {
          conversationId,
          lastMessage: message,
          lastMessageAt: now,
        });
      }
    }

    res.json({
      success: true,
      data: {
        message: newMessage,
      }
    });
  } catch (error) {
    if (handleZodError(error, res)) {
      return;
    }
    console.error('Send message error:', error);
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
});

// Start new conversation (patient to doctor) - returns existing or creates new
router.post('/start', authenticate, async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    
    if (!req.user?.userId || !req.user?.name || !req.user?.role) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    
    const userId = req.user.userId;
    const userName = req.user.name;
    const userRole = req.user.role;
    const { doctorId, message } = StartConversationBodySchema.parse(req.body);

    if (userRole !== 'patient') {
      return res.status(403).json({ success: false, error: 'Only patients can start conversations' });
    }

    // Get doctor info
    const doctor = db.exec(`SELECT name FROM doctors WHERE id = ?`, [doctorId]);
    const doctorName = (doctor[0]?.values[0]?.[0] as string) || 'Doctor';

    // Check if conversation already exists
    const existing = db.exec(`
      SELECT id FROM conversations WHERE patient_id = ? AND doctor_id = ?
    `, [userId, doctorId]);

    let conversationId: string;
    let isNewConversation = false;

    if (existing[0]?.values?.length > 0) {
      conversationId = existing[0].values[0][0] as string;
    } else {
      conversationId = uuid();
      isNewConversation = true;
      db.run(`
        INSERT INTO conversations (id, patient_id, patient_name, doctor_id, doctor_name, created_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
      `, [conversationId, userId, userName, doctorId, doctorName]);
    }

    // If there's a message, send it
    let sentMessage = null;
    if (message && message.trim()) {
      const messageId = uuid();
      const now = new Date().toISOString();
      db.run(`
        INSERT INTO chat_messages (id, conversation_id, sender_id, sender_name, sender_role, message, is_read, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 0, ?)
      `, [messageId, conversationId, userId, userName, userRole, message, now]);

      const lastMsg = message.substring(0, 100);
      db.run(`
        UPDATE conversations SET last_message = ?, last_message_at = ? WHERE id = ?
      `, [lastMsg, now, conversationId]);

      sentMessage = {
        id: messageId,
        conversationId,
        senderId: userId,
        senderName: userName,
        senderRole: userRole,
        message,
        isRead: false,
        createdAt: now,
      };

      // Emit socket events
      const io = req.app.get('io');

      // Send notification to doctor about new message
      const doctorUserResult = db.exec('SELECT id FROM users WHERE doctor_id = ? AND role = ?', [doctorId, 'doctor']);
      if (doctorUserResult[0]?.values?.length > 0) {
        const doctorUserId = doctorUserResult[0].values[0][0] as string;
        await createNotification(
          doctorUserId,
          'new_message',
          'New Message',
          `${userName} sent you a message`,
          { conversationId, senderId: userId, senderName: userName, messagePreview: message.substring(0, 100) },
          io
        );
      }
      if (io) {
        io.to(`conversation:${conversationId}`).emit('new-message', sentMessage);
        io.to(`doctor:${doctorId}`).emit('conversation-updated', {
          conversationId,
          lastMessage: message,
          lastMessageAt: now,
        });
      }
    }

    saveDatabase();

    res.json({
      success: true,
      data: {
        conversationId,
        isNewConversation,
        conversation: {
          id: conversationId,
          patientId: userId,
          patientName: userName,
          doctorId,
          doctorName,
        },
        message: sentMessage,
      }
    });
  } catch (error) {
    if (handleZodError(error, res)) {
      return;
    }
    console.error('Start conversation error:', error);
    res.status(500).json({ success: false, error: 'Failed to start conversation' });
  }
});

// Mark messages as read
router.post('/conversations/:id/read', authenticate, async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const doctorId = req.user?.doctorId || null;
    const { id: conversationId } = ConversationIdSchema.parse(req.params);

    if (!userId || !conversationId) {
      return res.status(400).json({ success: false, error: 'Invalid request' });
    }

    // Verify conversation ownership
    const conv = db.exec(`SELECT patient_id, doctor_id FROM conversations WHERE id = ?`, [conversationId]);
    if (!conv[0]?.values?.length) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    const patientId = conv[0].values[0][0] as string;
    const convDoctorId = conv[0].values[0][1] as string;

    if (userRole === 'patient' && patientId !== userId) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    if (userRole === 'doctor' && (!doctorId || convDoctorId !== doctorId)) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    db.run(`
      UPDATE chat_messages SET is_read = 1 
      WHERE conversation_id = ? AND sender_id != ?
    `, [conversationId, userId]);
    saveDatabase();

    res.json({ success: true, data: { message: 'Messages marked as read' } });
  } catch (error) {
    if (handleZodError(error, res)) {
      return;
    }
    console.error('Mark messages read error:', error);
    res.status(500).json({ success: false, error: 'Failed to mark messages as read' });
  }
});

export default router;
