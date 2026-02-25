import jwt from 'jsonwebtoken';
import { requireEnv } from '../lib/env';

const JWT_SECRET = requireEnv('JWT_SECRET');

export interface AuthenticatedRequest {
  user?: {
    userId: string;
    email: string;
    iat?: number;
    exp?: number;
  };
  headers: Record<string, string | string[] | undefined>;
  [key: string]: any;
}

export const authenticateToken = (req: AuthenticatedRequest, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.toString().split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedRequest['user'];
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};
