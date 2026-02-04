interface ChallengeTypeCardProps {
  title: string;
  description: string;
  example: string;
}

export function ChallengeTypeCard({ title, description, example }: ChallengeTypeCardProps) {
  return (
    <div className="group rounded-xl border bg-card p-6 transition-all duration-200 hover:border-primary/50 hover:bg-card/80">
      <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        {description}
      </p>
      <div className="code-block text-xs p-3">
        <code className="text-code-text">{example}</code>
      </div>
    </div>
  );
}
