import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  rank: number;
  username: string;
  streak: number;
  xp: number;
  isCurrentUser?: boolean;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  className?: string;
}

export function Leaderboard({ entries, className }: LeaderboardProps) {
  return (
    <div className={cn("rounded-xl border bg-card overflow-hidden", className)}>
      <div className="p-4 border-b bg-secondary/30">
        <h3 className="font-semibold">Weekly Leaderboard</h3>
      </div>
      <div className="divide-y">
        {entries.map((entry) => (
          <div 
            key={entry.rank}
            className={cn(
              "flex items-center gap-4 p-4 transition-colors",
              entry.isCurrentUser && "bg-primary/5"
            )}
          >
            <span className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
              entry.rank === 1 && "bg-warning/20 text-warning",
              entry.rank === 2 && "bg-muted text-muted-foreground",
              entry.rank === 3 && "bg-warning/10 text-warning/70",
              entry.rank > 3 && "text-muted-foreground"
            )}>
              {entry.rank}
            </span>
            <div className="flex-1">
              <span className={cn(
                "font-medium",
                entry.isCurrentUser && "text-primary"
              )}>
                {entry.username}
                {entry.isCurrentUser && " (You)"}
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="text-right">
                <div className="text-muted-foreground">Streak</div>
                <div className="font-semibold">{entry.streak} days</div>
              </div>
              <div className="text-right">
                <div className="text-muted-foreground">XP</div>
                <div className="font-semibold text-primary">{entry.xp.toLocaleString()}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
