import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { Header } from '@/components/Header';

export default function SuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      navigate('/');
    }
  }, [sessionId, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8 text-center bg-card rounded-xl border shadow-lg animate-in fade-in zoom-in duration-300">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-primary/10 p-4">
              <CheckCircle2 className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-4">Subscription Success!</h1>
          <p className="text-muted-foreground mb-8">
            Thank you for subscribing to DSA a Day Pro. Your premium features are now active.
          </p>
          <div className="space-y-4">
            <Button className="w-full" onClick={() => navigate('/')}>
              Get Started
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate('/past-challenges')}>
              View Past Challenges
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
