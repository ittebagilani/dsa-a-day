import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface CheckoutButtonProps {
  priceId?: string;
  buttonText?: string;
  variant?: 'default' | 'hero' | 'outline';
  className?: string;
}

export function CheckoutButton({
  priceId,
  buttonText = 'Subscribe Now',
  variant = 'hero',
  className,
}: CheckoutButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to subscribe.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      if (!priceId) {
        throw new Error('Missing Stripe price configuration');
      }

      const token = localStorage.getItem('auth-token');
      const response = await fetch(`${API_URL}/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (!data.url) {
        throw new Error('No checkout URL received');
      }

      window.location.href = data.url;
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        variant: 'destructive',
        title: 'Checkout failed',
        description: error.message || 'Failed to start checkout. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant={variant} onClick={handleCheckout} disabled={loading} className={className}>
      {loading ? 'Processing...' : buttonText}
    </Button>
  );
}
