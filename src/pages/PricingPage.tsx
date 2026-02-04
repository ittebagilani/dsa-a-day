import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Pricing } from "@/components/Pricing";

const PricingPage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-4">Simple Pricing</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Start free, upgrade when you're ready for more challenges and insights.
            </p>
          </div>
          
          <Pricing />
          
          <div className="max-w-2xl mx-auto mt-16">
            <h2 className="text-xl font-semibold mb-6 text-center">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">What's included in the free tier?</h3>
                <p className="text-sm text-muted-foreground">
                  Free users get access to the daily challenge every day. No hints are available, 
                  but you can still learn from the solution after 3 attempts.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">What do premium users get?</h3>
                <p className="text-sm text-muted-foreground">
                  Premium users get 3 hints per challenge, access to all 30+ previous challenges, 
                  and detailed analytics on their progress.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Can I cancel anytime?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes, you can cancel your subscription at any time. You'll retain access 
                  to premium features until the end of your billing period.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Do challenges repeat?</h3>
                <p className="text-sm text-muted-foreground">
                  New challenges are added regularly. Once you've completed all available 
                  challenges, you can revisit them to reinforce your learning.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PricingPage;
