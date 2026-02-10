import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { getCollection } from '@/lib/mongodb';

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
      const collection = await getCollection('subscriptions');
      const data = await collection.findOne({ user_id: user.id });
      
      if (data) {
        setSubscription(data as Subscription);
      } else {
        setSubscription(null);
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

  // For simplicity, we'll poll for changes periodically
  // In a real app, you might use WebSocket or Server-Sent Events
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      fetchSubscription();
    }, 30000); // Poll every 30 seconds
    
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
