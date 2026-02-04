import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/CodeBlock";
import { DifficultyBadge } from "@/components/DifficultyBadge";

const sampleCode = `function findDuplicate(nums) {
  let slow = nums[0];
  let fast = nums[0];
  
  // Find meeting point
  do {
    slow = nums[slow];
    fast = nums[nums[fast]];
  } while (slow !== fast);
  
  // Find entrance
  slow = nums[0];
  while (slow !== fast) {
    slow = nums[slow];
    fast = nums[fast];  // Bug: should be nums[fast]
  }
  
  return slow;
}`;

interface DailyChallengeProps {
  onStartChallenge?: () => void;
}

export function DailyChallenge({ onStartChallenge }: DailyChallengeProps) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-secondary/30">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">Today's Challenge</span>
          <DifficultyBadge difficulty="medium" />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>5-10 min</span>
        </div>
      </div>
      
      {/* Challenge Info */}
      <div className="p-6 border-b">
        <h3 className="text-xl font-semibold mb-2">Daily Bug Fix</h3>
        <p className="text-muted-foreground">
          Find and fix the bug in this cycle detection algorithm. The function should return the duplicate number in the array.
        </p>
      </div>
      
      {/* Code Block */}
      <div className="p-4 bg-code-bg">
        <CodeBlock 
          code={sampleCode} 
          highlightLines={[15]} 
        />
      </div>
      
      {/* Actions */}
      <div className="p-4 border-t flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>1,247 solved today</span>
        </div>
        <Button variant="hero" size="lg" onClick={onStartChallenge}>
          Start Challenge
        </Button>
      </div>
    </div>
  );
}
