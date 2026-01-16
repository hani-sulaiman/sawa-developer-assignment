import { Request, Response, NextFunction } from 'express';
import { authService, type JWTPayload } from '../services';
import { createErrorResponse } from '../../shared/schemas';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        name: string;
        role: 'patient' | 'doctor';
        doctorId?: string | null;
      };
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      res.status(401).json(createErrorResponse('No authorization header provided'));
      return;
    }

    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json(createErrorResponse('Invalid authorization format. Use: Bearer <token>'));
      return;
    }

    const token = parts[1];
    const payload = authService.verifyToken(token);
    
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json(createErrorResponse('Invalid or expired token'));
  }
}

export function requireRole(...roles: ('patient' | 'doctor')[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json(createErrorResponse('Authentication required'));
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json(createErrorResponse(`Access denied. Required role: ${roles.join(' or ')}`));
      return;
    }

    next();
  };
}

export function requireDoctor(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json(createErrorResponse('Authentication required'));
    return;
  }

  if (req.user.role !== 'doctor') {
    res.status(403).json(createErrorResponse('Access denied. Doctor role required'));
    return;
  }

  if (!req.user.doctorId) {
    res.status(403).json(createErrorResponse('Doctor profile not linked'));
    return;
  }

  next();
}

export function requirePatient(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json(createErrorResponse('Authentication required'));
    return;
  }

  if (req.user.role !== 'patient') {
    res.status(403).json(createErrorResponse('Access denied. Patient role required'));
    return;
  }

  next();
}

export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    next();
    return;
  }

  try {
    const parts = authHeader.split(' ');
    
    if (parts.length === 2 && parts[0] === 'Bearer') {
      const token = parts[1];
      const payload = authService.verifyToken(token);
      req.user = payload;
    }
  } catch {
    // Token is invalid, but since auth is optional, continue without user
  }

  next();
}
