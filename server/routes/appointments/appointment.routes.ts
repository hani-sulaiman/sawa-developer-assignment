import { Router, Request, Response } from 'express';
import { appointmentService } from '../../services';
import { authenticate, requirePatient, requireDoctor } from '../../middleware';
import { CreateAppointmentSchema, createSuccessResponse, createErrorResponse } from '../../../shared/schemas';
import { ZodError } from 'zod';

const router = Router();

// POST /api/appointments (protected - patient only)
router.post('/', authenticate, requirePatient, async (req: Request, res: Response) => {
  try {
    const input = CreateAppointmentSchema.parse(req.body);
    const io = req.app.get('io');
    const appointment = await appointmentService.create(input, req.user?.userId, io);
    res.status(201).json(createSuccessResponse({ appointment }));
  } catch (error) {
    if (error instanceof ZodError) {
      const details: Record<string, string[]> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!details[path]) {
          details[path] = [];
        }
        details[path].push(err.message);
      });
      res.status(400).json(createErrorResponse('Validation failed', details));
      return;
    }
    
    if (error instanceof Error) {
      res.status(400).json(createErrorResponse(error.message));
      return;
    }
    
    res.status(500).json(createErrorResponse('Failed to create appointment'));
  }
});

// GET /api/appointments/my (protected - get user's appointments)
router.get('/my', authenticate, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json(createErrorResponse('Not authenticated'));
      return;
    }

    const appointments = await appointmentService.findByPatientId(req.user.userId);
    res.json(createSuccessResponse({ appointments }));
  } catch (error) {
    res.status(500).json(createErrorResponse('Failed to fetch appointments'));
  }
});

// PATCH /api/appointments/:id/confirm (protected - doctor only)
router.patch('/:id/confirm', authenticate, requireDoctor, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!req.user?.doctorId) {
      res.status(403).json(createErrorResponse('Doctor profile not linked'));
      return;
    }

    const io = req.app.get('io');
    const appointment = await appointmentService.confirm(id, req.user.doctorId, io);
    res.json(createSuccessResponse({ appointment }));
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json(createErrorResponse(error.message));
      return;
    }
    
    res.status(500).json(createErrorResponse('Failed to confirm appointment'));
  }
});

// PATCH /api/appointments/:id/reject (protected - doctor only)
router.patch('/:id/reject', authenticate, requireDoctor, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!req.user?.doctorId) {
      res.status(403).json(createErrorResponse('Doctor profile not linked'));
      return;
    }

    const io = req.app.get('io');
    const appointment = await appointmentService.reject(id, req.user.doctorId, io);
    res.json(createSuccessResponse({ appointment }));
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json(createErrorResponse(error.message));
      return;
    }
    
    res.status(500).json(createErrorResponse('Failed to reject appointment'));
  }
});

export default router;
