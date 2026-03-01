import { Header } from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAccountStats, useSolvedChallenges } from "@/hooks/use-progress";
import { formatChallengeDate } from "@/lib/challenge-date";
import { Link } from "react-router-dom";

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};

const ManageAccountPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { isPremium } = useSubscription();
  const { data: solvedChallenges = [], isLoading } = useSolvedChallenges();
  const { data: accountStats, isLoading: statsLoading } = useAccountStats();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <p className="text-muted-foreground">Loading account...</p>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Sign in required</h1>
            <p className="text-muted-foreground mb-6">
              Please sign in to view your account details.
            </p>
            <Button asChild>
              <Link to="/">Go Home</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-16">
        <div className="container max-w-5xl">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Manage Account</h1>
              <p className="text-muted-foreground mt-2">
                Review your XP and previously solved levels.
              </p>
            </div>
            {!isPremium && (
              <Button variant="hero" asChild>
                <Link to="/pricing">Upgrade</Link>
              </Button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <div className="rounded-lg border p-5">
              <p className="text-sm text-muted-foreground">Total XP</p>
              <p className="text-3xl font-bold mt-2">
                {statsLoading ? "—" : (accountStats?.total_xp ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg border p-5">
              <p className="text-sm text-muted-foreground">Previous Levels Solved</p>
              <p className="text-3xl font-bold mt-2">
                {statsLoading
                  ? "—"
                  : (accountStats?.solved_count ?? solvedChallenges.length).toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg border p-5">
              <p className="text-sm text-muted-foreground">Current Streak</p>
              <p className="text-3xl font-bold mt-2">
                {statsLoading ? "—" : (accountStats?.streak ?? 0).toLocaleString()}
              </p>
            </div>
          </div>

          {isLoading ? (
            <p className="text-muted-foreground">Loading solved problems...</p>
          ) : solvedChallenges.length === 0 ? (
            <div className="rounded-lg border p-8 text-center">
              <p className="text-muted-foreground">
                You have not solved any challenges yet.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Challenge</TableHead>
                    <TableHead>Time Spent</TableHead>
                    <TableHead>Attempts</TableHead>
                    <TableHead>Hints</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {solvedChallenges.map((entry) => (
                    <TableRow key={`${entry.challenge_id}-${entry.updated_at}`}>
                      <TableCell>
                        {entry.challenge_date
                          ? formatChallengeDate(entry.challenge_date, { month: "short", day: "numeric" })
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {entry.challenge_title || `Challenge #${entry.challenge_id}`}
                      </TableCell>
                      <TableCell>{formatDuration(entry.time_spent_seconds || 0)}</TableCell>
                      <TableCell>{entry.attempts ?? 0}</TableCell>
                      <TableCell>{entry.hints_used ?? 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ManageAccountPage;
