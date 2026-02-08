import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';

interface Subscription {
  id: string;
  status: 'active' | 'inactive' | 'canceled' | 'past_due';
  plan_type: 'free' | 'pro';
  current_period_end: string | null;
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

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') {
        // PGRST116 = not found, which is okay for new users
        console.error('Error fetching subscription:', error);
      }
      setSubscription(null);
    } else {
      setSubscription(data as Subscription);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  // Set up real-time subscription to changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchSubscription();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
