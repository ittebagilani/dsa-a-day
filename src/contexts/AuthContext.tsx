import { createContext, useContext, useEffect, useState } from 'react';

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
    // In a real app, this would call your backend API
    // For now, we'll simulate the process
    const newUser = {
      id: crypto.randomUUID(),
      email,
      created_at: new Date(),
    };
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setUser(newUser as User);
    // In a real app, you would store the token received from the backend
    localStorage.setItem('auth-token', 'fake-jwt-token');
  };

  const signIn = async (email: string, password: string) => {
    // In a real app, this would call your backend API
    // For now, we'll simulate the process
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const signedInUser = {
      id: 'user-123',
      email,
      created_at: new Date(),
    };
    
    setUser(signedInUser as User);
    // In a real app, you would store the token received from the backend
    localStorage.setItem('auth-token', 'fake-jwt-token');
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