export function Footer() {
  return (
    <footer className="border-t bg-card/50 py-12 mt-24">
      <div className="container">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="font-bold text-lg mb-4">DSA a Day</div>
            <p className="text-sm text-muted-foreground">
              Daily bite-sized coding challenges to sharpen your DSA skills.
            </p>
          </div>
          <div>
            <div className="font-semibold mb-4">Product</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Daily Challenges</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Leaderboards</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Pro Features</a></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-4">Resources</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Community</a></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-4">Legal</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
          2024 DSA a Day. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
