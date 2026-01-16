import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { userRepository } from '../repositories';
import { config } from '../config';
import type { RegisterInput, LoginInput, UserResponse } from '../../shared/schemas';

const JWT_SECRET = config.jwtSecret;
const JWT_EXPIRES_IN = '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  role: 'patient' | 'doctor';
  doctorId?: string | null;
}

export interface AuthResult {
  token: string;
  user: UserResponse;
}

export class AuthService {
  async register(input: RegisterInput): Promise<AuthResult> {
    // Check if email already exists
    if (await userRepository.emailExists(input.email)) {
      throw new Error('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(input.password, 10);

    // Create user
    const user = await userRepository.create({
      id: uuidv4(),
      name: input.name,
      email: input.email,
      password: hashedPassword,
      role: input.role,
      doctorId: input.doctorId || null,
    });

    // Generate token
    const token = this.generateToken(user);

    return { token, user };
  }

  async login(input: LoginInput): Promise<AuthResult> {
    // Find user by email
    const user = await userRepository.findByEmail(input.email);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(input.password, user.password);
    
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Generate token
    const userResponse: UserResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      doctorId: user.doctorId,
      createdAt: user.createdAt,
    };
    
    const token = this.generateToken(userResponse);

    return { token, user: userResponse };
  }

  async getCurrentUser(userId: string): Promise<UserResponse | null> {
    return await userRepository.findByIdSafe(userId);
  }

  verifyToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      return decoded;
    } catch {
      throw new Error('Invalid or expired token');
    }
  }

  private generateToken(user: UserResponse): string {
    const payload: JWTPayload = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      doctorId: user.doctorId,
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }
}

export const authService = new AuthService();
