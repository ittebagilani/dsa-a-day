import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { AuthModal } from "@/components/auth/AuthModal";

export function Header() {
  const { user, signOut, loading: authLoading } = useAuth();
  const { isPremium, loading: subLoading } = useSubscription();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

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
          {authLoading ? (
            <span className="text-sm text-muted-foreground">Loading...</span>
          ) : user ? (
            <>
              {!subLoading && isPremium && (
                <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded font-semibold">
                  PRO
                </span>
              )}
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={signOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAuthMode('signin');
                  setAuthModalOpen(true);
                }}
              >
                Sign In
              </Button>
              <Button
                variant="hero"
                size="sm"
                onClick={() => {
                  setAuthMode('signup');
                  setAuthModalOpen(true);
                }}
              >
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>

      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        defaultMode={authMode}
      />
    </header>
  );
}
