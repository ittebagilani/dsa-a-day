import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PuzzleSolver } from "@/components/PuzzleSolver";
import { useTodaysChallenge } from "@/hooks/use-challenges";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { getTodaysChallenge } from "@/data/challenges";

const Index = () => {
  const { data: todaysChallenge, isLoading, error } = useTodaysChallenge();
  const { isPremium } = useSubscription();

  // Fallback to hardcoded challenge if database fetch fails
  const fallbackChallenge = getTodaysChallenge();
  const challenge = todaysChallenge || fallbackChallenge;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="container">
          <div className="text-center mb-8">
            <p className="text-sm text-muted-foreground mb-2">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            <h1 className="text-3xl font-bold">Daily Challenge</h1>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading today's challenge...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Using offline challenge</p>
              <PuzzleSolver
                challenge={fallbackChallenge}
                isPremium={isPremium}
              />
            </div>
          ) : (
            <PuzzleSolver
              challenge={challenge}
              isPremium={isPremium}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
