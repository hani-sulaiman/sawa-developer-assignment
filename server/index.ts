import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ===========================================
// TODO: Implement the following endpoints:
//
// PATIENT ENDPOINTS:
// GET  /api/doctors              - List all doctors (support ?specialty= filter)
// GET  /api/doctors/:id          - Get single doctor by ID
// POST /api/appointments         - Create a new appointment (status: pending)
//
// DOCTOR ENDPOINTS:
// GET   /api/doctors/:doctorId/appointments  - Get all appointments for a doctor
// PATCH /api/appointments/:id/confirm        - Confirm an appointment
// PATCH /api/appointments/:id/reject         - Reject an appointment
//
// Use the data from ./data.ts
// ===========================================

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Server is running!' });
});

// TODO: Add your routes here

app.use('/api/*', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

interface AppError extends Error {
  status?: number;
}

app.use((err: AppError, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`
  ====================================
  MedBook API - http://localhost:${PORT}
  ====================================

  Endpoints to implement:

  PATIENT:
  - GET  /api/doctors
  - GET  /api/doctors/:id
  - POST /api/appointments

  DOCTOR:
  - GET   /api/doctors/:doctorId/appointments
  - PATCH /api/appointments/:id/confirm
  - PATCH /api/appointments/:id/reject

  Health check: http://localhost:${PORT}/api/health
  `);
});
