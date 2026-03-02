import { createContext, useContext, useEffect, useState } from 'react';
import { trackEvent } from '@/lib/analytics';

const API_URL = import.meta.env.VITE_API_URL || '/api';

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
  signInWithOAuth: (provider: 'google') => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 > Date.now()) {
          setUser({
            id: payload.userId,
            email: payload.email,
            created_at: new Date(payload.iat * 1000),
          });
        } else {
          localStorage.removeItem('auth-token');
        }
      } catch {
        localStorage.removeItem('auth-token');
      }
    }
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to sign up');
    }

    trackEvent('auth_sign_up_success', { method: 'email' });
  };

  const signIn = async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to sign in');
    }

    const { user: userData, token } = await response.json();
    setUser({
      id: userData.id,
      email: userData.email,
      created_at: new Date(userData.created_at),
    });
    localStorage.setItem('auth-token', token);
    trackEvent('auth_sign_in_success', { method: 'email' }, userData.id);
  };

  const signInWithOAuth = (provider: 'google') => {
    trackEvent('auth_oauth_started', { provider });
    window.location.href = `${API_URL}/auth/${provider}`;
  };

  const signOut = () => {
    trackEvent('auth_sign_out', {}, user?.id);
    localStorage.removeItem('auth-token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signUp, signIn, signInWithOAuth, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
