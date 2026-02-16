import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

interface User {
  id: string;
  email: string;
  created_at: Date;
}

export const authService = {
  async hashPassword(password: string): Promise<string> {
    // This should only run on the server, so we'll throw an error if called in browser
    throw new Error('Password hashing should only occur on the server');
  },

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    // This should only run on the server, so we'll throw an error if called in browser
    throw new Error('Password verification should only occur on the server');
  },

  generateToken(user: User): string {
    // This should only run on the server, so we'll throw an error if called in browser
    throw new Error('Token generation should only occur on the server');
  },

  verifyToken(token: string): { userId: string; email: string } | null {
    // This should only run on the server, so we'll throw an error if called in browser
    throw new Error('Token verification should only occur on the server');
  },

  async createUser(email: string, password: string) {
    // This should only run on the server, so we'll throw an error if called in browser
    throw new Error('User creation should only occur on the server');
  },

  async authenticateUser(email: string, password: string) {
    // This should only run on the server, so we'll throw an error if called in browser
    throw new Error('Authentication should only occur on the server');
  },
};

// Helper to get current user from request
export function getCurrentUserFromRequest(request: Request): { userId: string; email: string } | null {
  // This should only run on the server, so we'll throw an error if called in browser
  throw new Error('Getting user from request should only occur on the server');
}