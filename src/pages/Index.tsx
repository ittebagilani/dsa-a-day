import { useTodaysChallenge } from "@/hooks/use-challenges";
import { Navigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getChallengeSlug } from "@/lib/challenge-slug";

const Index = () => {
  const { data: todaysChallenge, isLoading, error } = useTodaysChallenge();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <p className="text-muted-foreground">Loading today&apos;s challenge...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !todaysChallenge) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <p className="text-muted-foreground">Unable to load today&apos;s challenge right now.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return <Navigate to={`/${getChallengeSlug(todaysChallenge)}`} replace />;
};

export default Index;
