import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-8">
          <a href="/" className="font-bold text-lg">
            DSA a Day
          </a>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#challenges" className="text-muted-foreground hover:text-foreground transition-colors">
              Challenges
            </a>
            <a href="#leaderboard" className="text-muted-foreground hover:text-foreground transition-colors">
              Leaderboard
            </a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm">
            Sign In
          </Button>
          <Button variant="hero" size="sm">
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
}
