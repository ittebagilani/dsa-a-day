import { Link, useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { PuzzleSolver } from "@/components/PuzzleSolver";
import { Button } from "@/components/ui/button";
import { usePastChallenges, useTodaysChallenge } from "@/hooks/use-challenges";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { formatChallengeDate } from "@/lib/challenge-date";
import { getChallengeSlug } from "@/lib/challenge-slug";

const ChallengePage = () => {
  const { slug } = useParams();
  const { data: todaysChallenge, isLoading: isTodayLoading } =
    useTodaysChallenge();
  const { data: pastChallenges = [], isLoading: isPastLoading } =
    usePastChallenges();
  const { isPremium, loading: subLoading } = useSubscription();

  if (!slug) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <p className="text-muted-foreground">Invalid challenge URL.</p>
        </main>
      </div>
    );
  }

  if (subLoading || isTodayLoading || isPastLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <p className="text-muted-foreground">Loading challenge...</p>
        </main>
      </div>
    );
  }

  const allChallenges = todaysChallenge
    ? [todaysChallenge, ...pastChallenges]
    : pastChallenges;
  const challenge = allChallenges.find(
    (item) => getChallengeSlug(item) === slug,
  );

  if (!challenge) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <p className="text-muted-foreground">Challenge not found.</p>
        </main>
      </div>
    );
  }

  const isTodayChallenge = todaysChallenge
    ? challenge.id === todaysChallenge.id
    : false;
  const canAccess = isTodayChallenge || isPremium;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-16">
        <div className="container">
          {!isTodayChallenge && (
            <Button variant="ghost" asChild className="mb-6">
              <Link to="/past-challenges">← Back to Past Challenges</Link>
            </Button>
          )}
          <div className="flex max-w-4xl mx-auto">
            <p className="text-sm text-muted-foreground font-bold mb-4">
              {formatChallengeDate(challenge.date, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {canAccess ? (
            <PuzzleSolver challenge={challenge} isPremium={isPremium} />
          ) : (
            <div className="text-center py-16">
              <h1 className="text-2xl font-bold mb-4">Premium Feature</h1>
              <p className="text-muted-foreground mb-6">
                Access to previous challenges is available for premium users
                only.
              </p>
              <Button variant="hero" asChild>
                <Link to="/pricing">Upgrade to Premium</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ChallengePage;
