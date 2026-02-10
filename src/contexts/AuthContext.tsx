import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '@/services/auth.service';

interface User {
  id: string;
  email: string;
  created_at: Date;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token in localStorage
    const token = localStorage.getItem('auth-token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Check if token is expired
        if (payload.exp * 1000 > Date.now()) {
          setUser({
            id: payload.userId,
            email: payload.email,
            created_at: new Date(payload.iat * 1000),
          });
        } else {
          localStorage.removeItem('auth-token');
        }
      } catch (error) {
        localStorage.removeItem('auth-token');
      }
    }
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const newUser = await authService.createUser(email, password);
      setUser(newUser as User);
    } catch (error) {
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const result = await authService.authenticateUser(email, password);
      localStorage.setItem('auth-token', result.token);
      setUser(result.user as User);
    } catch (error) {
      throw error;
    }
  };

  const signOut = () => {
    localStorage.removeItem('auth-token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}