import { Router, Request, Response } from 'express';
import { ZodError } from 'zod';
import { doctorService, appointmentService } from '../../services';
import { authenticate, requireDoctor } from '../../middleware';
import {
  SpecialtySchema,
  UpdateDoctorProfileSchema,
  createSuccessResponse,
  createErrorResponse,
  specialties,
  type Appointment,
} from '../../../shared/schemas';

const router = Router();

// GET /api/doctors
router.get('/', async (req: Request, res: Response) => {
  try {
    const { specialty } = req.query;
    
    let validSpecialty;
    if (specialty && typeof specialty === 'string') {
      const parsed = SpecialtySchema.safeParse(specialty);
      if (parsed.success) {
        validSpecialty = parsed.data;
      }
    }

    const doctors = await doctorService.findAll(validSpecialty);
    res.json(createSuccessResponse({ doctors, specialties }));
  } catch (error) {
    res.status(500).json(createErrorResponse('Failed to fetch doctors'));
  }
});

// PUT /api/doctors/profile (protected - doctor only)
router.put('/profile', authenticate, requireDoctor, async (req: Request, res: Response) => {
  try {
    if (!req.user?.doctorId) {
      res.status(403).json(createErrorResponse('Doctor profile not linked'));
      return;
    }

    const updates = UpdateDoctorProfileSchema.parse(req.body);
    const doctor = await doctorService.updateProfile(req.user.doctorId, updates);

    if (!doctor) {
      res.status(404).json(createErrorResponse('Doctor not found'));
      return;
    }

    res.json(createSuccessResponse({ doctor }));
  } catch (error) {
    console.error('Update doctor profile error:', error);
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
      res.status(500).json(createErrorResponse(error.message));
      return;
    }

    res.status(500).json(createErrorResponse('Failed to update profile'));
  }
});

// GET /api/doctors/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const doctor = await doctorService.findById(id);
    
    if (!doctor) {
      res.status(404).json(createErrorResponse('Doctor not found'));
      return;
    }

    res.json(createSuccessResponse({ doctor }));
  } catch (error) {
    res.status(500).json(createErrorResponse('Failed to fetch doctor'));
  }
});

// GET /api/doctors/:doctorId/stats (protected - doctor only)
router.get('/:doctorId/stats', authenticate, requireDoctor, async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params;
    
    // Verify the logged-in doctor can only access their own stats
    if (req.user?.doctorId !== doctorId) {
      res.status(403).json(createErrorResponse('You can only view your own stats'));
      return;
    }

    const appointments = await appointmentService.findByDoctorId(doctorId);
    const today = new Date().toISOString().split('T')[0];
    
    const todayAppointments = appointments.filter((appointment: Appointment) => appointment.date === today).length;
    const pendingAppointments = appointments.filter((appointment: Appointment) => appointment.status === 'pending').length;
    const uniquePatients = new Set(
      appointments.map((appointment: Appointment) => appointment.patientId).filter(Boolean)
    ).size;
    
    const doctor = await doctorService.findById(doctorId);
    
    res.json(createSuccessResponse({ 
      todayAppointments,
      pendingAppointments,
      totalAppointments: appointments.length,
      totalPatients: uniquePatients,
      averageRating: doctor?.rating || 0,
      totalRevenue:
        appointments.filter((appointment: Appointment) => appointment.status === 'confirmed').length *
        (doctor?.fee || 0),
    }));
  } catch (error) {
    res.status(500).json(createErrorResponse('Failed to fetch stats'));
  }
});

// GET /api/doctors/:doctorId/appointments (protected - doctor only)
router.get('/:doctorId/appointments', authenticate, requireDoctor, async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params;
    
    // Verify the logged-in doctor can only access their own appointments
    if (req.user?.doctorId !== doctorId) {
      res.status(403).json(createErrorResponse('You can only view your own appointments'));
      return;
    }

    const appointments = await appointmentService.findByDoctorId(doctorId);
    res.json(createSuccessResponse({ appointments }));
  } catch (error) {
    res.status(500).json(createErrorResponse('Failed to fetch appointments'));
  }
});

export default router;
