import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Leaderboard } from "@/components/Leaderboard";

const weeklyLeaderboard = [
  { rank: 1, username: "algo_master", streak: 45, xp: 12450 },
  { rank: 2, username: "code_ninja", streak: 38, xp: 11230 },
  { rank: 3, username: "bit_wizard", streak: 32, xp: 9870 },
  { rank: 4, username: "dev_pro", streak: 28, xp: 8940 },
  { rank: 5, username: "stack_overflow", streak: 25, xp: 7650 },
  { rank: 6, username: "binary_beast", streak: 22, xp: 6890 },
  { rank: 7, username: "recursion_king", streak: 20, xp: 6340 },
  { rank: 8, username: "heap_hero", streak: 18, xp: 5780 },
  { rank: 9, username: "graph_guru", streak: 16, xp: 5120 },
  { rank: 10, username: "tree_traverser", streak: 14, xp: 4560 },
];

const allTimeLeaderboard = [
  { rank: 1, username: "legendary_coder", streak: 365, xp: 89450 },
  { rank: 2, username: "algo_master", streak: 280, xp: 72340 },
  { rank: 3, username: "dsa_champion", streak: 245, xp: 65120 },
  { rank: 4, username: "code_ninja", streak: 210, xp: 54890 },
  { rank: 5, username: "bit_wizard", streak: 190, xp: 48760 },
  { rank: 6, username: "stack_overflow", streak: 175, xp: 43210 },
  { rank: 7, username: "binary_beast", streak: 160, xp: 39870 },
  { rank: 8, username: "recursion_king", streak: 145, xp: 35640 },
  { rank: 9, username: "heap_hero", streak: 130, xp: 31450 },
  { rank: 10, username: "graph_guru", streak: 115, xp: 27890 },
];

const LeaderboardPage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold mb-4">Leaderboard</h1>
              <p className="text-muted-foreground">
                See how you stack up against the community
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">This Week</h2>
                <Leaderboard entries={weeklyLeaderboard} />
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-4">All Time</h2>
                <Leaderboard entries={allTimeLeaderboard} />
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LeaderboardPage;
