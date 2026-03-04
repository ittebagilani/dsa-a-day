import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/CodeEditor";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { Challenge } from "@/services/challenge.service";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProgress, useRecordAttempt } from "@/hooks/use-progress";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/analytics";
import { Link } from "react-router-dom";
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
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);
  const [newStreak, setNewStreak] = useState<number | undefined>(undefined);
  const [solvedBugIndices, setSolvedBugIndices] = useState<number[]>([]);

  const maxHints = isPremium ? 3 : 1;
  const timerStorageKey = `dcq.timer.${user?.id ?? 'guest'}.${challenge.id}`;
  const welcomeStorageKey = `dcq.welcome.${user?.id ?? 'guest'}.v1`;
  const currentHint = hintsUsed > 0 && hintsUsed <= challenge.hints.length 
    ? challenge.hints.slice(0, hintsUsed) 
    : [];
  const challengeLanguage = challenge.code.includes("def ") ? "python" : "javascript";
  const attemptsRemaining = Math.max(0, 3 - attempts);
  const displayCode = useMemo(
    () =>
      challenge.code
        .replace(/\s+#\s*bug here\s*$/gim, "")
        .replace(/\s+\/\/\s*bug here\s*$/gim, "")
        .replace(/^\s*(#|\/\/)\s*missing line here\s*$/gim, ""),
    [challenge.code]
  );
  const bugLines = useMemo(
    () => {
      if (Array.isArray(challenge.bugLines) && challenge.bugLines.length > 0) {
        return challenge.bugLines;
      }
      return challenge.bugLine ? [challenge.bugLine] : [];
    },
    [challenge.bugLine, challenge.bugLines],
  );
  const correctAnswers = useMemo(
    () => {
      if (Array.isArray(challenge.correctAnswers) && challenge.correctAnswers.length > 0) {
        return challenge.correctAnswers;
      }
      return challenge.correctAnswer ? [challenge.correctAnswer] : [];
    },
    [challenge.correctAnswer, challenge.correctAnswers],
  );
  const bugTargets = useMemo(
    () =>
      bugLines
        .map((bugLine, index) => {
          const correctAnswer = correctAnswers[index] ?? "";
          return {
            index,
            lineIndex: bugLine - 1,
            normalizedAnswer: correctAnswer.replace(/\s+/g, "").trim(),
          };
        })
        .filter((target) => target.lineIndex >= 0 && target.normalizedAnswer.length > 0),
    [bugLines, correctAnswers],
  );
  const bugsRemaining = Math.max(0, bugTargets.length - solvedBugIndices.length);
  const solutionPreview = useMemo(
    () => correctAnswers.join("\n"),
    [correctAnswers],
  );

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

  const hasSeenWelcome = (): boolean => {
    try {
      return localStorage.getItem(welcomeStorageKey) === "1";
    } catch {
      return false;
    }
  };

  const persistWelcomeSeen = () => {
    try {
      localStorage.setItem(welcomeStorageKey, "1");
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
      setUserAnswer(progress.user_answer || displayCode);
      setSolvedBugIndices(Array.isArray(progress.solved_bug_indices) ? progress.solved_bug_indices : []);
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
      setUserAnswer(displayCode);
      setStatus("unsolved");
      setHintsUsed(0);
      setShowExplanation(false);
      setAttempts(0);
      setSolvedBugIndices([]);
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
  }, [challenge.id, progress, timerStorageKey, displayCode]);

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

  useEffect(() => {
    if (isStarted || status !== "unsolved") {
      setShowWelcomeModal(false);
      return;
    }

    if (!hasSeenWelcome()) {
      setShowWelcomeModal(true);
    }
  }, [isStarted, status, welcomeStorageKey]);

  useEffect(() => {
    trackEvent(
      'challenge_viewed',
      {
        challenge_id: challenge.id,
        challenge_type: challenge.type,
        challenge_difficulty: challenge.difficulty,
      },
      user?.id
    );
  }, [challenge.id, challenge.type, challenge.difficulty, user?.id]);

  const normalizeCode = (answer: string): string => {
    return answer.replace(/\s+/g, '').trim();
  };

  const evaluateSolvedBugs = (submittedCode: string, existingSolved: number[]): number[] => {
    const userLines = submittedCode.split("\n");
    const originalLines = displayCode.split("\n");
    const solvedSet = new Set(existingSolved);

    for (const target of bugTargets) {
      if (solvedSet.has(target.index)) {
        continue;
      }
      const directLine = userLines[target.lineIndex] ?? "";
      if (normalizeCode(directLine) === target.normalizedAnswer) {
        solvedSet.add(target.index);
        continue;
      }
      const maxLines = Math.max(userLines.length, originalLines.length);
      for (let i = 0; i < maxLines; i += 1) {
        const normalizedUserLine = normalizeCode(userLines[i] ?? "");
        const normalizedOriginalLine = normalizeCode(originalLines[i] ?? "");
        if (normalizedUserLine !== normalizedOriginalLine && normalizedUserLine === target.normalizedAnswer) {
          solvedSet.add(target.index);
          break;
        }
      }
    }

    return Array.from(solvedSet).sort((a, b) => a - b);
  };

  const handleStart = () => {
    setIsStarted(true);
    const now = Date.now();
    setStartTime(now);
    setElapsedTime(0);
    persistTimer({ startTime: now });
    trackEvent(
      'challenge_started',
      {
        challenge_id: challenge.id,
        challenge_type: challenge.type,
        challenge_difficulty: challenge.difficulty,
      },
      user?.id
    );
  };

  const handleWelcomeStart = () => {
    persistWelcomeSeen();
    setShowWelcomeModal(false);
    handleStart();
  };

  const handleWelcomeModalChange = (open: boolean) => {
    setShowWelcomeModal(open);
    if (!open) {
      persistWelcomeSeen();
    }
  };

  const handleSubmit = async () => {
    const now = Date.now();
    const duration = startTime ? Math.floor((now - startTime) / 1000) : 0;
    setTimeTaken(duration);

    const updatedSolvedBugIndices = evaluateSolvedBugs(userAnswer, solvedBugIndices);
    const solvedNewBugsCount = updatedSolvedBugIndices.length - solvedBugIndices.length;
    const isCorrect = updatedSolvedBugIndices.length === bugTargets.length && bugTargets.length > 0;
    const nextBugsRemaining = Math.max(0, bugTargets.length - updatedSolvedBugIndices.length);
    setSolvedBugIndices(updatedSolvedBugIndices);

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

    trackEvent(
      'attempt_submitted',
      {
        challenge_id: challenge.id,
        attempt_number: newAttempts,
        is_correct: isCorrect,
        status: submissionStatus,
        hints_used: hintsUsed,
        bugs_solved_count: updatedSolvedBugIndices.length,
        bugs_remaining: nextBugsRemaining,
      },
      user?.id
    );

    if (!isCorrect && solvedNewBugsCount > 0) {
      toast({
        title: `You fixed ${solvedNewBugsCount} bug${solvedNewBugsCount === 1 ? "" : "s"}`,
        description: `${nextBugsRemaining} bug${nextBugsRemaining === 1 ? "" : "s"} left.`,
      });
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
          solvedBugIndices: updatedSolvedBugIndices,
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
      const nextHintsUsed = hintsUsed + 1;
      setHintsUsed(nextHintsUsed);
      trackEvent(
        'hint_used',
        {
          challenge_id: challenge.id,
          hint_number: nextHintsUsed,
        },
        user?.id
      );
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
            Once you start, the timer will begin. Edit the code directly and submit your fix.
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

          {status === "unsolved" && (
            <div className="rounded-lg border p-3 bg-card/50 mb-4">
              <p className="text-sm font-medium mb-2">
                Chances Left: {attemptsRemaining}/3
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map((slot) => {
                  const isAvailable = slot < attemptsRemaining;
                  return (
                    <div
                      key={slot}
                      className={`h-2 rounded-full transition-colors ${
                        isAvailable ? "bg-success" : "bg-destructive/40"
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          )}
          {status === "unsolved" && bugTargets.length > 0 && (
            <div className="rounded-lg border p-3 bg-card/50 mb-4">
              <p className="text-sm font-medium mb-2">
                Bugs Left: {bugsRemaining}/{bugTargets.length}
              </p>
              <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${bugTargets.length}, minmax(0, 1fr))` }}>
                {bugTargets.map((target) => (
                  <div
                    key={target.index}
                    className={`h-2 rounded-full transition-colors ${
                      solvedBugIndices.includes(target.index) ? "bg-success" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Hints Section */}
          {currentHint.length > 0 && (
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
                  Edit the code and submit your fix:
                </label>
                <CodeEditor
                  value={userAnswer}
                  onChange={setUserAnswer}
                  language={challengeLanguage}
                  placeholder="Edit the code here..."
                  minLines={Math.max(12, displayCode.split('\n').length)}
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
                
                {hintsUsed < maxHints && hintsUsed < challenge.hints.length && (
                  <Button variant="outline" onClick={handleUseHint}>
                    Use Hint ({maxHints - hintsUsed} left)
                  </Button>
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

              {isPremium && (
                <>
                  <Button variant="outline" onClick={() => setShowExplanation(!showExplanation)}>
                    {showExplanation ? "Hide" : "Show"} Explanation
                  </Button>
                  
                  {showExplanation && (
                    <div className="p-4 rounded-lg bg-secondary/50 border">
                      <h4 className="font-medium mb-2">Explanation</h4>
                      <p className="text-sm text-muted-foreground mb-3">{challenge.explanation}</p>
                      <div className="font-mono text-sm p-2 bg-code-bg rounded">
                        {solutionPreview}
                      </div>
                    </div>
                  )}
                </>
              )}
              {!isPremium && (
                <div className="p-4 rounded-lg bg-secondary/50 border">
                  <p className="text-sm text-muted-foreground mb-3">
                    Upgrade to Pro to see full explanations.
                  </p>
                  <Button size="sm" asChild>
                    <Link to="/pricing">Upgrade to Pro</Link>
                  </Button>
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
                  {isPremium ? "Don't worry, learning from solutions helps too!" : "Better luck next time."}
                </p>
              </div>

              {isPremium && (
                <div className="p-4 rounded-lg bg-secondary/50 border">
                  <h4 className="font-medium mb-2">Expected Fix</h4>
                  <div className="font-mono text-sm p-2 bg-code-bg rounded">
                    {solutionPreview}
                  </div>
                </div>
              )}

              {isPremium && (
                <div className="p-4 rounded-lg bg-secondary/50 border">
                  <h4 className="font-medium mb-2">Solution</h4>
                  <div className="font-mono text-sm p-2 bg-code-bg rounded mb-3">
                    {solutionPreview}
                  </div>
                  <p className="text-sm text-muted-foreground">{challenge.explanation}</p>
                </div>
              )}
            </div>
          )}

          {/* Give Up Option */}
          {status === "unsolved" && attempts > 0 && isPremium && (
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
        <DialogContent className="w-[92vw] max-w-[360px] sm:max-w-md p-4 sm:p-6">
          <DialogHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10 mb-4 text-success">
              <Trophy className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl sm:text-2xl text-center">Challenge Complete!</DialogTitle>
            <DialogDescription className="text-center pt-2">
              Great work! You've successfully solved today's challenge.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-3 gap-3 sm:gap-4 py-4 sm:py-8 border-y my-3 sm:my-4">
            <div className="text-center space-y-1">
              <p className="text-xs text-muted-foreground uppercase font-semibold">Time</p>
              <div className="flex items-center justify-center gap-1 text-base sm:text-lg font-bold">
                <Timer className="w-4 h-4 text-primary" />
                {formatTime(timeTaken)}
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-xs text-muted-foreground uppercase font-semibold">XP Gained</p>
              <div className="text-base sm:text-lg font-bold text-primary">+{earnedXp}</div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-xs text-muted-foreground uppercase font-semibold">Streak</p>
              <div className="flex items-center justify-center gap-1 text-base sm:text-lg font-bold text-orange-500">
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

      {/* Welcome Modal */}
      <Dialog open={showWelcomeModal} onOpenChange={handleWelcomeModalChange}>
        <DialogContent className="w-[92vw] max-w-[360px] sm:max-w-md p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Welcome to DSA a Day</DialogTitle>
            <DialogDescription>
              Solve one DSA bug-fix challenge each day, build consistency, and level up your problem-solving skills.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="rounded-lg border p-4 bg-card/50">
              <p className="text-sm font-medium mb-2">You get 3 attempts per challenge.</p>
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map((slot) => (
                  <div key={slot} className="h-2 rounded-full bg-success" />
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              The timer starts when you begin. Use hints if you need help, and review the explanation after you solve or run out of attempts.
            </p>
          </div>

          <DialogFooter className="sm:justify-center">
            <Button type="button" className="w-full sm:w-auto gap-2" onClick={handleWelcomeStart}>
              <PlayCircle className="w-4 h-4" />
              Start Challenge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
