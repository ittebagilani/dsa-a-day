import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const exchange = async () => {
      const code = searchParams.get('code');

      if (!code) {
        toast({
          variant: 'destructive',
          title: 'Authentication failed',
          description: 'No code received from the authentication provider.',
        });
        navigate('/');
        return;
      }

      try {
        const response = await fetch(`${API_URL}/auth/exchange-code`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });

        const data = await response.json();
        if (!response.ok || !data.token) {
          throw new Error(data.error || 'Failed to exchange authentication code.');
        }

        localStorage.setItem('auth-token', data.token);
        toast({
          title: 'Welcome!',
          description: 'You have successfully signed in with OAuth.',
        });
        navigate('/');
        window.location.reload();
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Authentication failed',
          description: error.message || 'Could not complete OAuth sign in.',
        });
        navigate('/');
      }
    };

    exchange();
  }, [searchParams, navigate, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Authenticating...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Please wait while we complete your sign-in.</p>
      </div>
    </div>
  );
}
