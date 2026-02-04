import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PuzzleSolver } from "@/components/PuzzleSolver";
import { getTodaysChallenge } from "@/data/challenges";

const Index = () => {
  const todaysChallenge = getTodaysChallenge();
  
  // Mock: Check if user is premium (would come from auth state in real app)
  const isPremium = false;

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
          
          <PuzzleSolver 
            challenge={todaysChallenge} 
            isPremium={isPremium}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
