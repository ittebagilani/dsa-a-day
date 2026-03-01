import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/CodeBlock";
import { CodeEditor } from "@/components/CodeEditor";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { Challenge } from "@/services/challenge.service";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProgress, useRecordAttempt } from "@/hooks/use-progress";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Timer, Trophy, Flame, PlayCircle } from "lucide-react";

interface PuzzleSolverProps {
  challenge: Challenge;
  isPremium?: boolean;
  onComplete?: (success: boolean) => void;
}

type SolveStatus = "unsolved" | "solved" | "failed";
type PersistedTimer = { startTime: number };

export function PuzzleSolver({ challenge, isPremium = false, onComplete }: PuzzleSolverProps) {
  const { user } = useAuth();
  const { data: progress } = useUserProgress(challenge.id);
  const recordAttempt = useRecordAttempt();
  const { toast } = useToast();

  const [userAnswer, setUserAnswer] = useState("");
  const [status, setStatus] = useState<SolveStatus>("unsolved");
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showConcept, setShowConcept] = useState(false);
  const [attempts, setAttempts] = useState(0);
  
  // Gamification states
  const [isStarted, setIsStarted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeTaken, setTimeTaken] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);
  const [newStreak, setNewStreak] = useState<number | undefined>(undefined);

  const maxHints = isPremium ? 3 : 0;
  const timerStorageKey = `dcq.timer.${user?.id ?? 'guest'}.${challenge.id}`;
  const currentHint = hintsUsed > 0 && hintsUsed <= challenge.hints.length 
    ? challenge.hints.slice(0, hintsUsed) 
    : [];

  const readPersistedTimer = (): PersistedTimer | null => {
    try {
      const raw = localStorage.getItem(timerStorageKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as PersistedTimer;
      if (!parsed || typeof parsed.startTime !== "number") return null;
      return parsed;
    } catch {
      return null;
    }
  };

  const persistTimer = (value: PersistedTimer) => {
    try {
      localStorage.setItem(timerStorageKey, JSON.stringify(value));
    } catch {
      // Ignore storage failures.
    }
  };

  const clearPersistedTimer = () => {
    try {
      localStorage.removeItem(timerStorageKey);
    } catch {
      // Ignore storage failures.
    }
  };

  useEffect(() => {
    // Load saved progress when challenge changes or progress is fetched
    if (progress) {
      setStatus(progress.status);
      setAttempts(progress.attempts);
      setHintsUsed(progress.hints_used);
      setUserAnswer(progress.user_answer || "");
      setTimeTaken(progress.time_spent_seconds || 0);
      if (progress.status === "solved" || progress.status === "failed") {
        setShowExplanation(true);
        setIsStarted(true);
        clearPersistedTimer();
      } else {
        const persistedTimer = readPersistedTimer();
        if (persistedTimer) {
          setIsStarted(true);
          setStartTime(persistedTimer.startTime);
          setElapsedTime(Math.floor((Date.now() - persistedTimer.startTime) / 1000));
        } else {
          setStartTime(null);
          setElapsedTime(0);
        }
      }
    } else {
      // Reset state when no progress or new challenge
      setUserAnswer("");
      setStatus("unsolved");
      setHintsUsed(0);
      setShowExplanation(false);
      setAttempts(0);
      setIsStarted(false);
      setStartTime(null);
      setTimeTaken(0);
      setElapsedTime(0);

      const persistedTimer = readPersistedTimer();
      if (persistedTimer) {
        setIsStarted(true);
        setStartTime(persistedTimer.startTime);
        setElapsedTime(Math.floor((Date.now() - persistedTimer.startTime) / 1000));
      }
    }
  }, [challenge.id, progress, timerStorageKey]);

  useEffect(() => {
    if (!isStarted || !startTime || status !== "unsolved") {
      return;
    }

    const interval = window.setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isStarted, startTime, status]);

  useEffect(() => {
    if (status === "solved" || status === "failed") {
      clearPersistedTimer();
    }
  }, [status, timerStorageKey]);

  const normalizeAnswer = (answer: string): string => {
    return answer
      .trim()
      .replace(/\s+/g, '')
      .replace(/;\s*$/, '')
      .toLowerCase();
  };

  const handleStart = () => {
    setIsStarted(true);
    const now = Date.now();
    setStartTime(now);
    setElapsedTime(0);
    persistTimer({ startTime: now });
  };

  const handleSubmit = async () => {
    const now = Date.now();
    const duration = startTime ? Math.floor((now - startTime) / 1000) : 0;
    setTimeTaken(duration);

    const normalizedUser = normalizeAnswer(userAnswer);
    const normalizedCorrect = normalizeAnswer(challenge.correctAnswer);

    // Also check without the semicolon variations
    const isCorrect = normalizedUser === normalizedCorrect ||
      normalizedUser === normalizedCorrect.replace(';', '') ||
      normalizedUser + ';' === normalizedCorrect;

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    const submissionStatus: SolveStatus = isCorrect
      ? "solved"
      : (newAttempts >= 3 ? "failed" : "unsolved");

    if (submissionStatus === "solved") {
      setStatus("solved");
      onComplete?.(true);
    } else if (submissionStatus === "failed") {
      setStatus("failed");
      onComplete?.(false);
    }

    // Save progress to database if user is logged in
    if (user) {
      try {
        const result = await recordAttempt.mutateAsync({
          challengeId: challenge.id,
          status: submissionStatus,
          userAnswer,
          hintsUsed,
          timeTaken: duration,
        });

        if (isCorrect) {
          setEarnedXp(result.xpEarned || 0);
          setNewStreak(result.newStreak);
          setShowSuccessModal(true);
        }
      } catch (error) {
        console.error('Failed to save progress:', error);
        toast({
          variant: 'destructive',
          title: 'Failed to save progress',
          description: 'Your answer was checked but progress was not saved.',
        });
      }
    } else if (isCorrect) {
      // For non-logged in users, calculate XP client-side for the UI
      const baseXP = challenge.difficulty === 'easy' ? 100 : challenge.difficulty === 'medium' ? 200 : 300;
      const penalty = hintsUsed * 0.2;
      setEarnedXp(Math.max(0, Math.floor(baseXP * (1 - penalty))));
      setShowSuccessModal(true);
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
    setTimeTaken(startTime ? Math.floor((Date.now() - startTime) / 1000) : 0);
    onComplete?.(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getChallengeTypeLabel = (type: Challenge["type"]): string => {
    switch (type) {
      case "bug-fix": return "Fix the Bug";
      case "complete-line": return "Complete the Line";
      case "find-problem": return "Find the Problem";
    }
  };

  const challengeLanguage = challenge.code.includes("def ") ? "python" : "javascript";
  const displayCode = challenge.code
    .replace(/\s+#\s*bug here\s*$/gim, "")
    .replace(/\s+\/\/\s*bug here\s*$/gim, "")
    .replace(/^\s*(#|\/\/)\s*missing line here\s*$/gim, "");

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
        
        {challenge.conceptTitle && (
          <div className="mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowConcept(!showConcept)}
              className="text-xs h-8"
            >
              {showConcept ? "Hide" : "Learn about"} {challenge.conceptTitle}
            </Button>
            
            {showConcept && (
              <div className="mt-3 p-4 rounded-lg bg-primary/5 border border-primary/10 animate-in fade-in slide-in-from-top-2 duration-300">
                <h4 className="font-semibold text-sm mb-2 text-primary">{challenge.conceptTitle}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {challenge.conceptContent || "No detailed content available for this concept yet."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {!isStarted ? (
        <div className="py-12 px-6 rounded-xl border bg-card/50 text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Timer className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">Ready to test your skills?</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Once you start, the timer will begin. You'll get 3 attempts to solve the daily challenge.
          </p>
          <Button size="lg" onClick={handleStart} className="gap-2">
            <PlayCircle className="w-5 h-5" />
            Start Challenge
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-end">
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 bg-card/70">
              <Timer className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">
                {formatTime(status === "unsolved" ? elapsedTime : timeTaken)}
              </span>
            </div>
          </div>

          {/* Code Block */}
          <div className="rounded-lg border bg-code-bg overflow-hidden mb-6">
            <div className="p-4">
              <CodeBlock
                code={displayCode}
                language={challengeLanguage}
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
                <CodeEditor
                  value={userAnswer}
                  onChange={setUserAnswer}
                  language={challengeLanguage}
                  placeholder="Write your code answer..."
                  minLines={3}
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

          {/* Success State (In-page) */}
          {status === "solved" && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                <h3 className="font-semibold text-success mb-2">Correct!</h3>
                <p className="text-sm text-muted-foreground">
                  You solved it in {attempts} attempt{attempts !== 1 ? 's' : ''}.
                  {hintsUsed > 0 && ` Used ${hintsUsed} hint${hintsUsed !== 1 ? 's' : ''}.`}
                </p>
              </div>

              {userAnswer.trim() && (
                <div className="p-4 rounded-lg bg-secondary/50 border">
                  <h4 className="font-medium mb-2">Your Answer</h4>
                  <div className="font-mono text-sm p-2 bg-code-bg rounded">
                    {userAnswer}
                  </div>
                </div>
              )}
              
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

              {userAnswer.trim() && (
                <div className="p-4 rounded-lg bg-secondary/50 border">
                  <h4 className="font-medium mb-2">Your Last Answer</h4>
                  <div className="font-mono text-sm p-2 bg-code-bg rounded">
                    {userAnswer}
                  </div>
                </div>
              )}
              
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
        </>
      )}

      {/* Completion Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10 mb-4 text-success">
              <Trophy className="h-6 w-6" />
            </div>
            <DialogTitle className="text-2xl text-center">Challenge Complete!</DialogTitle>
            <DialogDescription className="text-center pt-2">
              Great work! You've successfully solved today's challenge.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-3 gap-4 py-8 border-y my-4">
            <div className="text-center space-y-1">
              <p className="text-xs text-muted-foreground uppercase font-semibold">Time</p>
              <div className="flex items-center justify-center gap-1 text-lg font-bold">
                <Timer className="w-4 h-4 text-primary" />
                {formatTime(timeTaken)}
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-xs text-muted-foreground uppercase font-semibold">XP Gained</p>
              <div className="text-lg font-bold text-primary">+{earnedXp}</div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-xs text-muted-foreground uppercase font-semibold">Streak</p>
              <div className="flex items-center justify-center gap-1 text-lg font-bold text-orange-500">
                <Flame className="w-4 h-4" />
                {newStreak ?? 0}
              </div>
            </div>
          </div>

          <DialogFooter className="sm:justify-center">
            <Button
              type="button"
              className="w-full sm:w-auto"
              onClick={() => setShowSuccessModal(false)}
            >
              Continue Learning
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
