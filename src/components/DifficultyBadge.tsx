import { cn } from "@/lib/utils";

interface DifficultyBadgeProps {
  difficulty: "easy" | "medium" | "hard";
  className?: string;
}

export function DifficultyBadge({ difficulty, className }: DifficultyBadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border",
      difficulty === "easy" && "difficulty-easy",
      difficulty === "medium" && "difficulty-medium",
      difficulty === "hard" && "difficulty-hard",
      className
    )}>
      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
    </span>
  );
}
