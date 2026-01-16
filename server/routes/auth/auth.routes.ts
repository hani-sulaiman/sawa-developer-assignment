import { Router, Request, Response } from 'express';
import { authService } from '../../services';
import { authenticate } from '../../middleware';
import { RegisterSchema, LoginSchema, createSuccessResponse, createErrorResponse } from '../../../shared/schemas';
import { ZodError } from 'zod';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const input = RegisterSchema.parse(req.body);
    const result = await authService.register(input);
    res.status(201).json(createSuccessResponse(result));
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
    
    res.status(500).json(createErrorResponse('Registration failed'));
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const input = LoginSchema.parse(req.body);
    const result = await authService.login(input);
    res.json(createSuccessResponse(result));
  } catch (error) {
    console.error('Login error:', error);
    
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
      res.status(401).json(createErrorResponse(error.message));
      return;
    }
    
    res.status(500).json(createErrorResponse('Login failed'));
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json(createErrorResponse('Not authenticated'));
      return;
    }

    const user = await authService.getCurrentUser(req.user.userId);
    
    if (!user) {
      res.status(404).json(createErrorResponse('User not found'));
      return;
    }

    res.json(createSuccessResponse({ user }));
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json(createErrorResponse('Failed to get user info'));
  }
});

export default router;
