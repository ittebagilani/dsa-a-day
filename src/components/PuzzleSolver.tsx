import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CodeBlock } from "@/components/CodeBlock";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { Challenge } from "@/data/challenges";
import { cn } from "@/lib/utils";

interface PuzzleSolverProps {
  challenge: Challenge;
  isPremium?: boolean;
  onComplete?: (success: boolean) => void;
}

type SolveStatus = "unsolved" | "solved" | "failed";

export function PuzzleSolver({ challenge, isPremium = false, onComplete }: PuzzleSolverProps) {
  const [userAnswer, setUserAnswer] = useState("");
  const [status, setStatus] = useState<SolveStatus>("unsolved");
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const maxHints = isPremium ? 3 : 0;
  const currentHint = hintsUsed > 0 && hintsUsed <= challenge.hints.length 
    ? challenge.hints.slice(0, hintsUsed) 
    : [];

  useEffect(() => {
    // Reset state when challenge changes
    setUserAnswer("");
    setStatus("unsolved");
    setHintsUsed(0);
    setShowExplanation(false);
    setAttempts(0);
  }, [challenge.id]);

  const normalizeAnswer = (answer: string): string => {
    return answer
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/;\s*$/, '')
      .toLowerCase();
  };

  const handleSubmit = () => {
    const normalizedUser = normalizeAnswer(userAnswer);
    const normalizedCorrect = normalizeAnswer(challenge.correctAnswer);
    
    // Also check without the semicolon variations
    const isCorrect = normalizedUser === normalizedCorrect ||
      normalizedUser === normalizedCorrect.replace(';', '') ||
      normalizedUser + ';' === normalizedCorrect;
    
    setAttempts(prev => prev + 1);
    
    if (isCorrect) {
      setStatus("solved");
      onComplete?.(true);
    } else if (attempts >= 2) {
      setStatus("failed");
      onComplete?.(false);
    }
  };

  const handleUseHint = () => {
    if (hintsUsed < maxHints && hintsUsed < challenge.hints.length) {
      setHintsUsed(prev => prev + 1);
    }
  };

  const handleShowSolution = () => {
    setShowExplanation(true);
    setStatus("failed");
    onComplete?.(false);
  };

  const getChallengeTypeLabel = (type: Challenge["type"]): string => {
    switch (type) {
      case "bug-fix": return "Fix the Bug";
      case "complete-line": return "Complete the Line";
      case "find-problem": return "Find the Problem";
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            {getChallengeTypeLabel(challenge.type)}
          </span>
          <DifficultyBadge difficulty={challenge.difficulty} />
        </div>
        <h1 className="text-2xl font-bold mb-2">{challenge.title}</h1>
        <p className="text-muted-foreground">{challenge.description}</p>
      </div>

      {/* Code Block */}
      <div className="rounded-lg border bg-code-bg overflow-hidden mb-6">
        <div className="p-4">
          <CodeBlock 
            code={challenge.code} 
            highlightLines={challenge.bugLine ? [challenge.bugLine] : []} 
          />
        </div>
      </div>

      {/* Hints Section (Premium only) */}
      {isPremium && currentHint.length > 0 && (
        <div className="mb-6 space-y-2">
          {currentHint.map((hint, index) => (
            <div 
              key={index}
              className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-sm"
            >
              <span className="font-medium text-primary">Hint {index + 1}:</span>{" "}
              {hint}
            </div>
          ))}
        </div>
      )}

      {/* Answer Input */}
      {status === "unsolved" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {challenge.type === "complete-line" 
                ? "Enter the missing line:" 
                : "Enter the fixed line:"}
            </label>
            <Textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="font-mono bg-secondary/50 min-h-[60px]"
            />
          </div>
          
          {attempts > 0 && status === "unsolved" && (
            <p className="text-sm text-warning">
              Not quite right. {3 - attempts} attempt{3 - attempts !== 1 ? 's' : ''} remaining.
            </p>
          )}

          <div className="flex items-center gap-3">
            <Button variant="hero" onClick={handleSubmit} disabled={!userAnswer.trim()}>
              Submit Answer
            </Button>
            
            {isPremium && hintsUsed < maxHints && hintsUsed < challenge.hints.length && (
              <Button variant="outline" onClick={handleUseHint}>
                Use Hint ({maxHints - hintsUsed} left)
              </Button>
            )}
            
            {!isPremium && (
              <span className="text-sm text-muted-foreground">
                Hints available for premium users
              </span>
            )}
          </div>
        </div>
      )}

      {/* Success State */}
      {status === "solved" && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-success/10 border border-success/20">
            <h3 className="font-semibold text-success mb-2">Correct!</h3>
            <p className="text-sm text-muted-foreground">
              You solved it in {attempts} attempt{attempts !== 1 ? 's' : ''}.
              {hintsUsed > 0 && ` Used ${hintsUsed} hint${hintsUsed !== 1 ? 's' : ''}.`}
            </p>
          </div>
          
          <Button variant="outline" onClick={() => setShowExplanation(!showExplanation)}>
            {showExplanation ? "Hide" : "Show"} Explanation
          </Button>
          
          {showExplanation && (
            <div className="p-4 rounded-lg bg-secondary/50 border">
              <h4 className="font-medium mb-2">Explanation</h4>
              <p className="text-sm text-muted-foreground mb-3">{challenge.explanation}</p>
              <div className="font-mono text-sm p-2 bg-code-bg rounded">
                {challenge.correctAnswer}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Failed State */}
      {status === "failed" && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <h3 className="font-semibold text-destructive mb-2">Out of attempts</h3>
            <p className="text-sm text-muted-foreground">
              Don't worry, learning from solutions helps too!
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-secondary/50 border">
            <h4 className="font-medium mb-2">Solution</h4>
            <div className="font-mono text-sm p-2 bg-code-bg rounded mb-3">
              {challenge.correctAnswer}
            </div>
            <p className="text-sm text-muted-foreground">{challenge.explanation}</p>
          </div>
        </div>
      )}

      {/* Give Up Option */}
      {status === "unsolved" && attempts > 0 && (
        <div className="mt-4 pt-4 border-t">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground"
            onClick={handleShowSolution}
          >
            Give up and see solution
          </Button>
        </div>
      )}
    </div>
  );
}
