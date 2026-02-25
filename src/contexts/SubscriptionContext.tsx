import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface Subscription {
  _id: string;
  user_id: string;
  status: 'active' | 'inactive' | 'canceled' | 'past_due';
  plan_type: 'free' | 'pro';
  current_period_end: Date | null;
  created_at: Date;
  updated_at: Date;
}

interface SubscriptionContextType {
  subscription: Subscription | null;
  isPremium: boolean;
  loading: boolean;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch(`${API_URL}/subscriptions/${user.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const contentType = response.headers.get('content-type') || '';

      if (!response.ok) {
        if (response.status === 404) {
          setSubscription(null);
        } else {
          throw new Error('Failed to fetch subscription');
        }
      } else {
        if (!contentType.includes('application/json')) {
          throw new Error(`Unexpected response type: ${contentType || 'unknown'}`);
        }
        const data = await response.json();
        setSubscription(data as Subscription);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setSubscription(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchSubscription();
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  const isPremium = subscription?.status === 'active' && subscription?.plan_type === 'pro';

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        isPremium,
        loading,
        refreshSubscription: fetchSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
