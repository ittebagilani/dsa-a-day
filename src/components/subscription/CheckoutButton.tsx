import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface CheckoutButtonProps {
  priceId?: string;
  buttonText?: string;
  variant?: 'default' | 'hero' | 'outline';
  className?: string;
}

export function CheckoutButton({
  priceId = 'price_pro_monthly',
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
      // TODO: Implement Stripe checkout
      // For now, show a message that this feature is coming soon
      toast({
        title: 'Coming Soon!',
        description: 'Stripe checkout integration is being set up. You can test auth and database features for now.',
      });

      // Future implementation:
      // 1. Call Supabase Edge Function to create checkout session
      // 2. Redirect to Stripe Checkout
      // Example code:
      /*
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId,
          userId: user.id,
        },
      });

      if (error) throw error;

      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe not loaded');

      await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });
      */
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
    <Button
      variant={variant}
      onClick={handleCheckout}
      disabled={loading}
      className={className}
    >
      {loading ? 'Processing...' : buttonText}
    </Button>
  );
}
