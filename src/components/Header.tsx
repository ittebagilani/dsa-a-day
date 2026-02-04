import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-8">
          <NavLink to="/" className="font-bold text-lg">
            DSA a Day
          </NavLink>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <NavLink 
              to="/leaderboard" 
              className="text-muted-foreground hover:text-foreground transition-colors"
              activeClassName="text-foreground"
            >
              Leaderboard
            </NavLink>
            <NavLink 
              to="/past-challenges" 
              className="text-muted-foreground hover:text-foreground transition-colors"
              activeClassName="text-foreground"
            >
              Past Challenges
            </NavLink>
            <NavLink 
              to="/pricing" 
              className="text-muted-foreground hover:text-foreground transition-colors"
              activeClassName="text-foreground"
            >
              Pricing
            </NavLink>
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
