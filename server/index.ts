import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import { config } from './config';
import { initializeDatabase } from './database';
import { seedDatabase } from './database/seed';
import { 
  authRoutes, 
  doctorRoutes,
  doctorPatientsRoutes,
  appointmentRoutes,
  favoritesRoutes,
  patientRoutes,
  prescriptionsRoutes,
  schedulesRoutes,
  patientNotesRoutes,
  medicalRecordsRoutes,
  notificationsRoutes,
  chatRoutes,
  analyticsRoutes,
} from './routes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// Socket.IO setup
const io = new Server(httpServer, {
  cors: config.cors,
});

const PORT = config.port;
const JWT_SECRET = config.jwtSecret;

// Store online users: Map<userId, Set<socketId>>
const onlineUsers = new Map<string, Set<string>>();

// Socket authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication required'));
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string; doctorId?: string; name?: string };
    socket.data.user = decoded;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  const user = socket.data.user;
  console.log(`🔌 User connected: ${user.name} (${user.userId})`);

  // Add user to online users
  if (!onlineUsers.has(user.userId)) {
    onlineUsers.set(user.userId, new Set());
  }
  onlineUsers.get(user.userId)!.add(socket.id);

  // Join user's personal room
  socket.join(`user:${user.userId}`);
  
  // If doctor, also join doctor room
  if (user.role === 'doctor' && user.doctorId) {
    socket.join(`doctor:${user.doctorId}`);
  }

  // Handle joining a conversation room
  socket.on('join-conversation', (conversationId: string) => {
    socket.join(`conversation:${conversationId}`);
    console.log(`📝 ${user.name} joined conversation ${conversationId}`);
  });

  // Handle leaving a conversation room
  socket.on('leave-conversation', (conversationId: string) => {
    socket.leave(`conversation:${conversationId}`);
    console.log(`📝 ${user.name} left conversation ${conversationId}`);
  });

  // Handle sending a message
  socket.on('send-message', async (data: { conversationId: string; message: string; recipientId: string }) => {
    const { conversationId, message, recipientId } = data;
    
    // Broadcast to the conversation room (including sender for confirmation)
    io.to(`conversation:${conversationId}`).emit('new-message', {
      id: `temp-${Date.now()}`,
      conversationId,
      senderId: user.userId,
      senderName: user.name,
      senderRole: user.role,
      message,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    // Also emit to recipient's personal room (for notification badge update)
    io.to(`user:${recipientId}`).emit('conversation-updated', { conversationId });
  });

  // Handle typing indicator
  socket.on('typing', (data: { conversationId: string }) => {
    socket.to(`conversation:${data.conversationId}`).emit('user-typing', {
      conversationId: data.conversationId,
      userId: user.userId,
      userName: user.name,
    });
  });

  // Handle stop typing
  socket.on('stop-typing', (data: { conversationId: string }) => {
    socket.to(`conversation:${data.conversationId}`).emit('user-stop-typing', {
      conversationId: data.conversationId,
      userId: user.userId,
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${user.name} (${user.userId})`);
    
    const userSockets = onlineUsers.get(user.userId);
    if (userSockets) {
      userSockets.delete(socket.id);
      if (userSockets.size === 0) {
        onlineUsers.delete(user.userId);
      }
    }
  });
});

// Make io available to routes
app.set('io', io);

// Middleware
app.use(cors(config.cors));
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
// Legacy fallback for older uploads stored under server/uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Initialize and seed database
async function initApp() {
  try {
    await initializeDatabase();
    await seedDatabase();
    console.log('✓ Database ready');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}

initApp();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors/patients', doctorPatientsRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/prescriptions', prescriptionsRoutes);
app.use('/api/schedules', schedulesRoutes);
app.use('/api/patient-notes', patientNotesRoutes);
app.use('/api/medical-records', medicalRecordsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ 
    success: true,
    data: {
      status: 'ok', 
      message: 'MedBook API is running!',
      timestamp: new Date().toISOString(),
      onlineUsers: onlineUsers.size,
    }
  });
});

// 404 handler
app.use('/api/*', (_req: Request, res: Response) => {
  res.status(404).json({ 
    success: false,
    error: 'Endpoint not found' 
  });
});

// Error handler
interface AppError extends Error {
  status?: number;
}

app.use((err: AppError, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

httpServer.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════════════╗
  ║                                                ║
  ║   🏥 MedBook API Server                        ║
  ║   http://localhost:${PORT}                        ║
  ║                                                ║
  ╠════════════════════════════════════════════════╣
  ║                                                ║
  ║   API Endpoints:                               ║
  ║                                                ║
  ║   AUTH:       /api/auth                        ║
  ║   DOCTORS:    /api/doctors                     ║
  ║   APPTS:      /api/appointments                ║
  ║   FAVORITES:  /api/favorites                   ║
  ║   PATIENT:    /api/patient                     ║
  ║   RX:         /api/prescriptions               ║
  ║   SCHEDULES:  /api/schedules                   ║
  ║   NOTES:      /api/patient-notes               ║
  ║   RECORDS:    /api/medical-records             ║
  ║   NOTIFY:     /api/notifications               ║
  ║   CHAT:       /api/chat (WebSocket enabled)    ║
  ║   ANALYTICS:  /api/analytics                   ║
  ║                                                ║
  ║   Health: http://localhost:${PORT}/api/health      ║
  ║                                                ║
  ╚════════════════════════════════════════════════╝

  Test Users:
  - Patient: john@example.com / password123
  - Doctor:  dr.ahmed@medbook.com / doctor123
  `);
});
