import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DailyChallenge } from "@/components/DailyChallenge";
import { ChallengeTypeCard } from "@/components/ChallengeTypeCard";
import { StatsCard } from "@/components/StatsCard";
import { Leaderboard } from "@/components/Leaderboard";
import { Pricing } from "@/components/Pricing";
import { Button } from "@/components/ui/button";

const challengeTypes = [
  {
    title: "Daily Bug Fix",
    description: "Identify and fix bugs in code snippets. Sharpen your debugging skills with real-world scenarios.",
    example: "// Find the bug in this binary search...",
  },
  {
    title: "Complete the Line",
    description: "Fill in the missing line of code to complete the algorithm. Test your understanding of DSA patterns.",
    example: "// Add the missing recursive call...",
  },
  {
    title: "Find the Problem",
    description: "Spot logical or runtime issues in seemingly correct code. Train your eye for subtle errors.",
    example: "// This causes infinite loop, why?",
  },
];

const leaderboardData = [
  { rank: 1, username: "algo_master", streak: 45, xp: 12450 },
  { rank: 2, username: "code_ninja", streak: 38, xp: 11230 },
  { rank: 3, username: "bit_wizard", streak: 32, xp: 9870 },
  { rank: 4, username: "you_here", streak: 15, xp: 4560, isCurrentUser: true },
  { rank: 5, username: "dev_pro", streak: 28, xp: 8940 },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        {/* Subtle glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-glow opacity-30 pointer-events-none" />
        
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Sharpen Your DSA Skills,
              <br />
              <span className="text-primary">One Challenge at a Time</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Daily bite-sized coding challenges designed for busy developers. 
              5-10 minutes a day to master Data Structures & Algorithms.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button variant="hero" size="xl">
                Start Today's Challenge
              </Button>
              <Button variant="outline-primary" size="xl">
                View Demo
              </Button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-16">
            <StatsCard label="Active Users" value="12.4K" variant="primary" />
            <StatsCard label="Challenges Solved" value="847K" variant="default" />
            <StatsCard label="Avg. Streak" value="14 days" variant="success" />
            <StatsCard label="Topics Covered" value="25+" variant="default" />
          </div>
        </div>
      </section>
      
      {/* Daily Challenge Preview */}
      <section className="py-16" id="challenges">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Today's Challenge</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A fresh challenge every day. Debug, complete, or analyze code to earn XP and maintain your streak.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <DailyChallenge />
          </div>
        </div>
      </section>
      
      {/* Challenge Types */}
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Challenge Types</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Three challenge formats to keep your practice varied and engaging.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {challengeTypes.map((type, index) => (
              <ChallengeTypeCard key={index} {...type} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Leaderboard Section */}
      <section className="py-16" id="leaderboard">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-start max-w-5xl mx-auto">
            <div>
              <h2 className="text-3xl font-bold mb-4">Compete & Climb</h2>
              <p className="text-muted-foreground mb-6">
                Track your progress against the community. Build streaks, earn XP, and climb the weekly leaderboard.
              </p>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">+</span>
                  <div>
                    <div className="font-medium">Daily Streaks</div>
                    <div className="text-muted-foreground">Maintain consistency with streak tracking</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">+</span>
                  <div>
                    <div className="font-medium">XP System</div>
                    <div className="text-muted-foreground">Earn points based on challenge difficulty</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">+</span>
                  <div>
                    <div className="font-medium">Weekly Rankings</div>
                    <div className="text-muted-foreground">Compete for the top spot each week</div>
                  </div>
                </li>
              </ul>
            </div>
            <Leaderboard entries={leaderboardData} />
          </div>
        </div>
      </section>
      
      {/* Pricing Section */}
      <section className="py-16 bg-secondary/30" id="pricing">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Simple Pricing</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Start free, upgrade when you're ready for more challenges and insights.
            </p>
          </div>
          <Pricing />
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start?</h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of developers improving their DSA skills daily. 
              Your first challenge awaits.
            </p>
            <Button variant="hero" size="xl">
              Start Your Streak Today
            </Button>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
