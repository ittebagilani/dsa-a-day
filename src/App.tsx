import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import Index from "./pages/Index";
import PricingPage from "./pages/PricingPage";
import PastChallengesPage from "./pages/PastChallengesPage";
import ChallengePage from "./pages/ChallengePage";
import LegacyChallengeRedirect from "./pages/LegacyChallengeRedirect";
import ManageAccountPage from "./pages/ManageAccountPage";
import AuthCallback from "./pages/AuthCallback";
import SuccessPage from "./pages/SuccessPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SubscriptionProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/challenges/:id" element={<LegacyChallengeRedirect />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/past-challenges" element={<PastChallengesPage />} />
              <Route path="/account" element={<ManageAccountPage />} />
              <Route path="/auth-callback" element={<AuthCallback />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/success" element={<SuccessPage />} />
              <Route path="/:slug" element={<ChallengePage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SubscriptionProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
