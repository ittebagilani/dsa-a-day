import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

interface User {
  id: string;
  email: string;
  password_hash: string;
  created_at: Date;
}

export const authService = {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  },

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  },

  generateToken(user: Omit<User, 'password_hash'>): string {
    return jwt.sign(
      { 
        userId: user.id, 
        email: user.email 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  },

  verifyToken(token: string): { userId: string; email: string } | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
      return decoded;
    } catch (error) {
      return null;
    }
  },

  async createUser(email: string, password: string) {
    const { db } = await connectToDatabase();
    const users = db.collection('users');

    // Check if user already exists
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const password_hash = await this.hashPassword(password);
    const user: User = {
      id: crypto.randomUUID(),
      email,
      password_hash,
      created_at: new Date(),
    };

    await users.insertOne(user);
    const { password_hash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  async authenticateUser(email: string, password: string) {
    const { db } = await connectToDatabase();
    const users = db.collection('users');

    const user = await users.findOne({ email });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await this.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const { password_hash: _, ...userWithoutPassword } = user;
    const token = this.generateToken(userWithoutPassword as any);
    
    return {
      user: userWithoutPassword,
      token,
    };
  },
};

// Helper to get current user from request
export function getCurrentUserFromRequest(request: Request): { userId: string; email: string } | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  return authService.verifyToken(token);
}