import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PuzzleSolver } from "@/components/PuzzleSolver";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { Button } from "@/components/ui/button";
import { getPastChallenges, Challenge } from "@/data/challenges";
import { cn } from "@/lib/utils";

const PastChallengesPage = () => {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const pastChallenges = getPastChallenges();
  
  // Mock: assume user is premium for this page (would come from auth in real app)
  const isPremium = true;

  const getChallengeTypeLabel = (type: Challenge["type"]): string => {
    switch (type) {
      case "bug-fix": return "Bug Fix";
      case "complete-line": return "Complete Line";
      case "find-problem": return "Find Problem";
    }
  };

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Premium Feature</h1>
            <p className="text-muted-foreground mb-6">
              Access to past challenges is available for premium users only.
            </p>
            <Button variant="hero" asChild>
              <a href="/pricing">Upgrade to Premium</a>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (selectedChallenge) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 pt-24 pb-16">
          <div className="container">
            <Button 
              variant="ghost" 
              className="mb-6"
              onClick={() => setSelectedChallenge(null)}
            >
              ← Back to Past Challenges
            </Button>
            <PuzzleSolver challenge={selectedChallenge} isPremium={true} />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold mb-4">Past Challenges</h1>
              <p className="text-muted-foreground">
                Practice with previous daily challenges
              </p>
            </div>
            
            <div className="space-y-3">
              {pastChallenges.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No past challenges available yet. Check back tomorrow!
                </p>
              ) : (
                pastChallenges.map((challenge) => (
                  <button
                    key={challenge.id}
                    onClick={() => setSelectedChallenge(challenge)}
                    className="w-full text-left p-4 rounded-lg border bg-card hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-sm text-muted-foreground">
                            {new Date(challenge.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                            {getChallengeTypeLabel(challenge.type)}
                          </span>
                          <DifficultyBadge difficulty={challenge.difficulty} />
                        </div>
                        <h3 className="font-medium">{challenge.title}</h3>
                      </div>
                      <span className="text-muted-foreground">→</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PastChallengesPage;
