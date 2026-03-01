import { Header } from "@/components/Header";
import { Leaderboard } from "@/components/Leaderboard";
import { useLeaderboard } from "@/hooks/use-leaderboard";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

const LeaderboardPage = () => {
  const { data: leaderboard, isLoading, isError } = useLeaderboard();
  const { user } = useAuth();

  const entriesWithCurrentUser = leaderboard?.map(entry => ({
    ...entry,
    isCurrentUser: user?.id === entry.userId
  })) || [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold mb-4">Leaderboard</h1>
              <p className="text-muted-foreground">
                See how you stack up against the global community
              </p>
            </div>
            
            <div className="max-w-2xl mx-auto">
              {isLoading ? (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold mb-4 text-center">Top Performers</h2>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-xl" />
                  ))}
                </div>
              ) : isError ? (
                <div className="text-center py-12 text-destructive">
                  <p>Failed to load leaderboard. Please try again later.</p>
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-center">Top Performers</h2>
                  <Leaderboard entries={entriesWithCurrentUser} />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LeaderboardPage;
