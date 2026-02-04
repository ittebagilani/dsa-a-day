export type ChallengeType = "bug-fix" | "complete-line" | "find-problem";
export type Difficulty = "easy" | "medium" | "hard";

export interface Challenge {
  id: number;
  date: string; // YYYY-MM-DD
  type: ChallengeType;
  difficulty: Difficulty;
  title: string;
  description: string;
  code: string;
  bugLine?: number; // Line with the bug (1-indexed)
  correctAnswer: string; // The fixed line or answer
  hints: string[];
  explanation: string;
}

// Helper to get date string for N days ago
const getDateString = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

export const challenges: Challenge[] = [
  // Day 0 - Today
  {
    id: 1,
    date: getDateString(0),
    type: "bug-fix",
    difficulty: "medium",
    title: "Floyd's Cycle Detection",
    description: "Find and fix the bug in this cycle detection algorithm. The function should return the duplicate number in the array.",
    code: `function findDuplicate(nums) {
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
    fast = fast;  // Bug here
  }
  
  return slow;
}`,
    bugLine: 14,
    correctAnswer: "fast = nums[fast];",
    hints: [
      "Look at the second phase of Floyd's algorithm",
      "Both pointers should move at the same speed in phase 2",
      "The fast pointer isn't being updated correctly"
    ],
    explanation: "In Floyd's cycle detection, the second phase requires both pointers to move one step at a time. The bug is on line 14 where 'fast = fast' doesn't advance the pointer. It should be 'fast = nums[fast]' to properly traverse the array."
  },
  // Day 1
  {
    id: 2,
    date: getDateString(1),
    type: "bug-fix",
    difficulty: "easy",
    title: "Binary Search",
    description: "Fix the bug in this binary search implementation.",
    code: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length;
  
  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return -1;
}`,
    bugLine: 3,
    correctAnswer: "let right = arr.length - 1;",
    hints: [
      "Check the initial bounds of the search",
      "What is the valid index range for an array?",
      "arr.length is out of bounds"
    ],
    explanation: "The right pointer should start at arr.length - 1, not arr.length. Starting at arr.length could cause an out-of-bounds access when checking arr[mid]."
  },
  // Day 2
  {
    id: 3,
    date: getDateString(2),
    type: "complete-line",
    difficulty: "medium",
    title: "Merge Sort - Merge Step",
    description: "Complete the missing line in the merge function.",
    code: `function merge(left, right) {
  let result = [];
  let i = 0, j = 0;
  
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result.push(left[i]);
      i++;
    } else {
      result.push(right[j]);
      // Missing line here
    }
  }
  
  return result.concat(left.slice(i)).concat(right.slice(j));
}`,
    bugLine: 12,
    correctAnswer: "j++;",
    hints: [
      "What needs to happen after pushing right[j]?",
      "We need to move to the next element",
      "Increment the right array pointer"
    ],
    explanation: "After pushing right[j] to the result, we need to increment j to move to the next element in the right array, just like we increment i when pushing from the left array."
  },
  // Day 3
  {
    id: 4,
    date: getDateString(3),
    type: "find-problem",
    difficulty: "hard",
    title: "Quick Sort Partition",
    description: "Find the logical error that causes incorrect sorting.",
    code: `function partition(arr, low, high) {
  let pivot = arr[high];
  let i = low - 1;
  
  for (let j = low; j < high; j++) {
    if (arr[j] < pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  
  [arr[i], arr[high]] = [arr[high], arr[i]];
  return i;
}`,
    bugLine: 12,
    correctAnswer: "[arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];",
    hints: [
      "Where should the pivot be placed?",
      "Check the final swap position",
      "The pivot should go at position i + 1, not i"
    ],
    explanation: "The pivot should be swapped with arr[i + 1], not arr[i]. Position i is the last element smaller than pivot, so the pivot belongs at i + 1."
  },
  // Day 4
  {
    id: 5,
    date: getDateString(4),
    type: "bug-fix",
    difficulty: "easy",
    title: "Fibonacci Recursion",
    description: "Fix the bug in this recursive Fibonacci function.",
    code: `function fibonacci(n) {
  if (n <= 0) return 0;
  if (n === 1) return 1;
  
  return fibonacci(n - 1) + fibonacci(n - 1);
}`,
    bugLine: 5,
    correctAnswer: "return fibonacci(n - 1) + fibonacci(n - 2);",
    hints: [
      "Check the recursive calls",
      "Fibonacci adds two different previous numbers",
      "The second call should be n - 2"
    ],
    explanation: "The Fibonacci sequence adds the two previous numbers. The bug is calling fibonacci(n - 1) twice instead of fibonacci(n - 1) + fibonacci(n - 2)."
  },
  // Day 5
  {
    id: 6,
    date: getDateString(5),
    type: "bug-fix",
    difficulty: "medium",
    title: "Reverse Linked List",
    description: "Fix the bug in this linked list reversal.",
    code: `function reverseList(head) {
  let prev = null;
  let current = head;
  
  while (current !== null) {
    let next = current.next;
    current.next = prev;
    prev = current;
    current = prev;
  }
  
  return prev;
}`,
    bugLine: 9,
    correctAnswer: "current = next;",
    hints: [
      "Track how current moves through the list",
      "We saved the next node for a reason",
      "Current should move to the saved next node"
    ],
    explanation: "The bug is on line 9 where current = prev causes an infinite loop. It should be current = next to advance to the next node."
  },
  // Day 6
  {
    id: 7,
    date: getDateString(6),
    type: "complete-line",
    difficulty: "easy",
    title: "Stack - Check Balanced Parentheses",
    description: "Complete the line to check for balanced parentheses.",
    code: `function isBalanced(str) {
  const stack = [];
  const pairs = { ')': '(', '}': '{', ']': '[' };
  
  for (let char of str) {
    if ('({['.includes(char)) {
      stack.push(char);
    } else if (')}]'.includes(char)) {
      // Missing line here
        return false;
      }
    }
  }
  
  return stack.length === 0;
}`,
    bugLine: 9,
    correctAnswer: "if (stack.pop() !== pairs[char]) {",
    hints: [
      "What should we compare from the stack?",
      "Pop the stack and compare with the expected pair",
      "Use the pairs object to find the matching bracket"
    ],
    explanation: "We need to pop from the stack and check if it matches the expected opening bracket for the current closing bracket using the pairs object."
  },
  // Day 7
  {
    id: 8,
    date: getDateString(7),
    type: "bug-fix",
    difficulty: "hard",
    title: "BFS Level Order Traversal",
    description: "Fix the bug causing incorrect level order output.",
    code: `function levelOrder(root) {
  if (!root) return [];
  
  const result = [];
  const queue = [root];
  
  while (queue.length > 0) {
    const level = [];
    const size = queue.length;
    
    for (let i = 0; i <= size; i++) {
      const node = queue.shift();
      level.push(node.val);
      
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    
    result.push(level);
  }
  
  return result;
}`,
    bugLine: 11,
    correctAnswer: "for (let i = 0; i < size; i++) {",
    hints: [
      "Check the loop bounds",
      "How many nodes should be processed per level?",
      "The condition should be i < size, not i <= size"
    ],
    explanation: "Using i <= size processes one extra node per level, mixing nodes from different levels. It should be i < size to process exactly 'size' nodes per level."
  },
  // Day 8
  {
    id: 9,
    date: getDateString(8),
    type: "find-problem",
    difficulty: "medium",
    title: "Two Sum - Hash Map",
    description: "Find why this returns incorrect indices sometimes.",
    code: `function twoSum(nums, target) {
  const map = new Map();
  
  for (let i = 0; i < nums.length; i++) {
    map.set(nums[i], i);
  }
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [i, map.get(complement)];
    }
  }
  
  return [];
}`,
    bugLine: 10,
    correctAnswer: "if (map.has(complement) && map.get(complement) !== i) {",
    hints: [
      "What if the complement is the same number?",
      "Can an element be used twice?",
      "Check if the indices are different"
    ],
    explanation: "The bug is that it doesn't check if the complement's index is different from the current index. For [3, 3] with target 6, it works, but for [3, 2, 4] with target 6, it would incorrectly return [0, 0] if 3+3=6."
  },
  // Day 9
  {
    id: 10,
    date: getDateString(9),
    type: "bug-fix",
    difficulty: "easy",
    title: "Maximum Subarray (Kadane's)",
    description: "Fix the initialization bug in Kadane's algorithm.",
    code: `function maxSubArray(nums) {
  let maxSum = 0;
  let currentSum = 0;
  
  for (let num of nums) {
    currentSum = Math.max(num, currentSum + num);
    maxSum = Math.max(maxSum, currentSum);
  }
  
  return maxSum;
}`,
    bugLine: 2,
    correctAnswer: "let maxSum = nums[0];",
    hints: [
      "What if all numbers are negative?",
      "Check the initial value of maxSum",
      "Initialize with the first element"
    ],
    explanation: "Initializing maxSum to 0 fails for arrays with all negative numbers. It should be initialized to nums[0] to handle this case correctly."
  },
  // Day 10
  {
    id: 11,
    date: getDateString(10),
    type: "complete-line",
    difficulty: "medium",
    title: "DFS - Path Sum",
    description: "Complete the recursive call to check path sum.",
    code: `function hasPathSum(root, targetSum) {
  if (!root) return false;
  
  if (!root.left && !root.right) {
    return targetSum === root.val;
  }
  
  const remaining = targetSum - root.val;
  // Missing line here
}`,
    bugLine: 9,
    correctAnswer: "return hasPathSum(root.left, remaining) || hasPathSum(root.right, remaining);",
    hints: [
      "We need to check both subtrees",
      "Use OR to check if either path works",
      "Pass the remaining sum to children"
    ],
    explanation: "We need to recursively check both left and right subtrees with the remaining sum. If either path has the target sum, return true."
  },
  // Day 11
  {
    id: 12,
    date: getDateString(11),
    type: "bug-fix",
    difficulty: "hard",
    title: "LRU Cache - Get Operation",
    description: "Fix the bug in the LRU cache get operation.",
    code: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }
  
  get(key) {
    if (!this.cache.has(key)) return -1;
    
    const value = this.cache.get(key);
    // Move to end (most recently used)
    this.cache.delete(key);
    return value;
  }
  
  put(key, value) {
    this.cache.delete(key);
    this.cache.set(key, value);
    
    if (this.cache.size > this.capacity) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }
}`,
    bugLine: 12,
    correctAnswer: "this.cache.set(key, value);",
    hints: [
      "After deleting, the key-value pair is gone",
      "What happens after we delete the key?",
      "We need to re-add it to move to end"
    ],
    explanation: "After deleting the key to move it to the end, we forgot to add it back. The line 'this.cache.set(key, value);' is missing before the return statement."
  },
  // Day 12
  {
    id: 13,
    date: getDateString(12),
    type: "find-problem",
    difficulty: "medium",
    title: "Valid Palindrome",
    description: "Find why this fails for some edge cases.",
    code: `function isPalindrome(s) {
  const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  let left = 0;
  let right = cleaned.length;
  
  while (left < right) {
    if (cleaned[left] !== cleaned[right]) {
      return false;
    }
    left++;
    right--;
  }
  
  return true;
}`,
    bugLine: 4,
    correctAnswer: "let right = cleaned.length - 1;",
    hints: [
      "Check the initial value of right",
      "What's the last valid index?",
      "length - 1 is the last index"
    ],
    explanation: "The right pointer should start at cleaned.length - 1, not cleaned.length. Starting at length accesses undefined which causes incorrect comparisons."
  },
  // Day 13
  {
    id: 14,
    date: getDateString(13),
    type: "bug-fix",
    difficulty: "easy",
    title: "Remove Duplicates from Sorted Array",
    description: "Fix the pointer logic bug.",
    code: `function removeDuplicates(nums) {
  if (nums.length === 0) return 0;
  
  let i = 0;
  
  for (let j = 1; j < nums.length; j++) {
    if (nums[j] !== nums[i]) {
      nums[i] = nums[j];
      i++;
    }
  }
  
  return i + 1;
}`,
    bugLine: 8,
    correctAnswer: "i++; nums[i] = nums[j];",
    hints: [
      "When should we increment i?",
      "The order of operations matters",
      "Increment i first, then copy"
    ],
    explanation: "We need to increment i before copying nums[j] to nums[i]. The current code overwrites the unique element at position i instead of placing the new unique element at i+1."
  },
  // Day 14
  {
    id: 15,
    date: getDateString(14),
    type: "complete-line",
    difficulty: "hard",
    title: "Coin Change - DP",
    description: "Complete the DP transition for minimum coins.",
    code: `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  
  for (let i = 1; i <= amount; i++) {
    for (let coin of coins) {
      if (coin <= i) {
        // Missing line here
      }
    }
  }
  
  return dp[amount] === Infinity ? -1 : dp[amount];
}`,
    bugLine: 8,
    correctAnswer: "dp[i] = Math.min(dp[i], dp[i - coin] + 1);",
    hints: [
      "We want the minimum number of coins",
      "If we use this coin, we need dp[i - coin] + 1",
      "Take the minimum of current and new option"
    ],
    explanation: "The DP transition compares the current minimum with using one more coin plus the optimal solution for the remaining amount (i - coin)."
  },
  // Day 15
  {
    id: 16,
    date: getDateString(15),
    type: "bug-fix",
    difficulty: "medium",
    title: "Invert Binary Tree",
    description: "Fix the recursive tree inversion.",
    code: `function invertTree(root) {
  if (!root) return null;
  
  let temp = root.left;
  root.left = invertTree(root.left);
  root.right = invertTree(temp);
  
  return root;
}`,
    bugLine: 5,
    correctAnswer: "root.left = invertTree(root.right);",
    hints: [
      "What should we assign to root.left?",
      "We're swapping left and right",
      "root.left should get the inverted right subtree"
    ],
    explanation: "When inverting, root.left should receive the inverted root.right, and root.right should receive the inverted root.left (saved in temp). Line 5 incorrectly inverts root.left again."
  },
  // Day 16
  {
    id: 17,
    date: getDateString(16),
    type: "find-problem",
    difficulty: "easy",
    title: "Contains Duplicate",
    description: "Find the inefficiency in this solution.",
    code: `function containsDuplicate(nums) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = 0; j < nums.length; j++) {
      if (i !== j && nums[i] === nums[j]) {
        return true;
      }
    }
  }
  return false;
}`,
    bugLine: 3,
    correctAnswer: "for (let j = i + 1; j < nums.length; j++) {",
    hints: [
      "This is O(n²) but can be optimized",
      "We're checking some pairs twice",
      "Start j from i + 1"
    ],
    explanation: "Starting j from 0 checks each pair twice. Starting j from i + 1 still finds duplicates but avoids redundant comparisons. Better yet, use a Set for O(n) time."
  },
  // Day 17
  {
    id: 18,
    date: getDateString(17),
    type: "bug-fix",
    difficulty: "medium",
    title: "Merge Two Sorted Lists",
    description: "Fix the pointer assignment bug.",
    code: `function mergeTwoLists(l1, l2) {
  const dummy = { val: 0, next: null };
  let current = dummy;
  
  while (l1 && l2) {
    if (l1.val <= l2.val) {
      current.next = l1;
      l1 = l1.next;
    } else {
      current.next = l2;
      l2 = l2.next;
    }
  }
  
  current.next = l1 || l2;
  return dummy.next;
}`,
    bugLine: 7,
    correctAnswer: "current.next = l1; current = current.next;",
    hints: [
      "After assigning next, what about current?",
      "Current should advance",
      "Add current = current.next after each assignment"
    ],
    explanation: "The current pointer is never advanced, so only the last comparison's node is linked. We need to add 'current = current.next' after setting current.next in both branches."
  },
  // Day 18
  {
    id: 19,
    date: getDateString(18),
    type: "complete-line",
    difficulty: "hard",
    title: "Longest Palindromic Substring",
    description: "Complete the expand around center helper.",
    code: `function longestPalindrome(s) {
  let start = 0, maxLen = 1;
  
  function expandAroundCenter(left, right) {
    while (left >= 0 && right < s.length && s[left] === s[right]) {
      // Missing line here
    }
    return right - left - 1;
  }
  
  for (let i = 0; i < s.length; i++) {
    const len1 = expandAroundCenter(i, i);
    const len2 = expandAroundCenter(i, i + 1);
    const len = Math.max(len1, len2);
    
    if (len > maxLen) {
      maxLen = len;
      start = i - Math.floor((len - 1) / 2);
    }
  }
  
  return s.substring(start, start + maxLen);
}`,
    bugLine: 6,
    correctAnswer: "left--; right++;",
    hints: [
      "How do we expand outward?",
      "Move both pointers away from center",
      "Decrease left, increase right"
    ],
    explanation: "To expand around the center, we need to move left pointer left (decrease) and right pointer right (increase) to check the next characters."
  },
  // Day 19
  {
    id: 20,
    date: getDateString(19),
    type: "bug-fix",
    difficulty: "easy",
    title: "Climbing Stairs",
    description: "Fix the off-by-one error in this DP solution.",
    code: `function climbStairs(n) {
  if (n <= 2) return n;
  
  const dp = new Array(n);
  dp[1] = 1;
  dp[2] = 2;
  
  for (let i = 3; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  
  return dp[n];
}`,
    bugLine: 4,
    correctAnswer: "const dp = new Array(n + 1);",
    hints: [
      "Check the array size",
      "We're accessing dp[n] at the end",
      "Array needs n + 1 elements"
    ],
    explanation: "The array size should be n + 1 to accommodate index n. With size n, dp[n] would be out of bounds."
  },
  // Day 20
  {
    id: 21,
    date: getDateString(20),
    type: "find-problem",
    difficulty: "medium",
    title: "Valid Anagram",
    description: "Find why this fails for certain inputs.",
    code: `function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  
  const count = {};
  
  for (let char of s) {
    count[char] = (count[char] || 0) + 1;
  }
  
  for (let char of t) {
    count[char]--;
    if (count[char] < 0) return false;
  }
  
  return true;
}`,
    bugLine: 11,
    correctAnswer: "if (!count[char] || count[char] < 0) return false;",
    hints: [
      "What if a character in t isn't in s?",
      "Decrementing undefined gives NaN",
      "Check if the character exists first"
    ],
    explanation: "If a character in t doesn't exist in count, count[char] is undefined. Decrementing undefined gives NaN, which fails the < 0 check but for the wrong reason. Should check if character exists."
  },
  // Day 21
  {
    id: 22,
    date: getDateString(21),
    type: "bug-fix",
    difficulty: "hard",
    title: "Word Search - Backtracking",
    description: "Fix the backtracking logic in this word search.",
    code: `function exist(board, word) {
  const rows = board.length, cols = board[0].length;
  
  function dfs(r, c, i) {
    if (i === word.length) return true;
    if (r < 0 || c < 0 || r >= rows || c >= cols) return false;
    if (board[r][c] !== word[i]) return false;
    
    board[r][c] = '#';  // Mark visited
    
    const found = dfs(r + 1, c, i + 1) || dfs(r - 1, c, i + 1) ||
                  dfs(r, c + 1, i + 1) || dfs(r, c - 1, i + 1);
    
    return found;
  }
  
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (dfs(r, c, 0)) return true;
    }
  }
  
  return false;
}`,
    bugLine: 13,
    correctAnswer: "board[r][c] = word[i];  // Restore",
    hints: [
      "What happens after exploring all directions?",
      "We marked the cell but never unmarked it",
      "Add backtracking to restore the cell"
    ],
    explanation: "After exploring all directions, we need to restore the cell's original value for backtracking. Add 'board[r][c] = word[i];' after the recursive calls and before returning."
  },
  // Day 22
  {
    id: 23,
    date: getDateString(22),
    type: "complete-line",
    difficulty: "easy",
    title: "Rotate Array",
    description: "Complete the reverse helper function.",
    code: `function rotate(nums, k) {
  k = k % nums.length;
  
  function reverse(start, end) {
    while (start < end) {
      // Missing line here
      start++;
      end--;
    }
  }
  
  reverse(0, nums.length - 1);
  reverse(0, k - 1);
  reverse(k, nums.length - 1);
}`,
    bugLine: 6,
    correctAnswer: "[nums[start], nums[end]] = [nums[end], nums[start]];",
    hints: [
      "We need to swap elements",
      "Use array destructuring for clean swap",
      "Swap nums[start] and nums[end]"
    ],
    explanation: "To reverse a portion of the array, we swap elements at start and end positions, then move the pointers inward."
  },
  // Day 23
  {
    id: 24,
    date: getDateString(23),
    type: "bug-fix",
    difficulty: "medium",
    title: "Product of Array Except Self",
    description: "Fix the prefix/suffix calculation bug.",
    code: `function productExceptSelf(nums) {
  const n = nums.length;
  const result = new Array(n).fill(1);
  
  let prefix = 1;
  for (let i = 0; i < n; i++) {
    result[i] = prefix;
    prefix *= nums[i];
  }
  
  let suffix = 1;
  for (let i = n - 1; i >= 0; i--) {
    result[i] = suffix;
    suffix *= nums[i];
  }
  
  return result;
}`,
    bugLine: 13,
    correctAnswer: "result[i] *= suffix;",
    hints: [
      "The suffix calculation overwrites the prefix",
      "We need to combine prefix and suffix",
      "Multiply instead of assign"
    ],
    explanation: "The suffix loop should multiply into result[i], not overwrite it. result[i] already has the prefix product, so we need result[i] *= suffix to combine both."
  },
  // Day 24
  {
    id: 25,
    date: getDateString(24),
    type: "find-problem",
    difficulty: "hard",
    title: "Serialize Binary Tree",
    description: "Find the deserialization bug.",
    code: `function serialize(root) {
  if (!root) return 'null';
  return root.val + ',' + serialize(root.left) + ',' + serialize(root.right);
}

function deserialize(data) {
  const nodes = data.split(',');
  let index = 0;
  
  function build() {
    if (nodes[index] === 'null') {
      index++;
      return null;
    }
    
    const node = { val: nodes[index], left: null, right: null };
    index++;
    node.left = build();
    node.right = build();
    return node;
  }
  
  return build();
}`,
    bugLine: 15,
    correctAnswer: "const node = { val: parseInt(nodes[index]), left: null, right: null };",
    hints: [
      "What type is nodes[index]?",
      "The split returns strings",
      "Node values should be numbers"
    ],
    explanation: "The split operation returns strings, so node values become strings instead of numbers. Use parseInt(nodes[index]) to convert back to numbers."
  },
  // Day 25
  {
    id: 26,
    date: getDateString(25),
    type: "bug-fix",
    difficulty: "easy",
    title: "Single Number",
    description: "Fix the XOR accumulator bug.",
    code: `function singleNumber(nums) {
  let result = 1;
  
  for (let num of nums) {
    result ^= num;
  }
  
  return result;
}`,
    bugLine: 2,
    correctAnswer: "let result = 0;",
    hints: [
      "What's the identity for XOR?",
      "Check the initial value",
      "0 XOR x = x"
    ],
    explanation: "The XOR identity is 0, not 1. Starting with 1 would XOR an extra 1 into the result, giving the wrong answer."
  },
  // Day 26
  {
    id: 27,
    date: getDateString(26),
    type: "complete-line",
    difficulty: "medium",
    title: "Number of Islands",
    description: "Complete the DFS to mark visited cells.",
    code: `function numIslands(grid) {
  if (!grid.length) return 0;
  
  let count = 0;
  const rows = grid.length, cols = grid[0].length;
  
  function dfs(r, c) {
    if (r < 0 || c < 0 || r >= rows || c >= cols) return;
    if (grid[r][c] !== '1') return;
    
    // Missing line here
    
    dfs(r + 1, c);
    dfs(r - 1, c);
    dfs(r, c + 1);
    dfs(r, c - 1);
  }
  
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '1') {
        count++;
        dfs(r, c);
      }
    }
  }
  
  return count;
}`,
    bugLine: 11,
    correctAnswer: "grid[r][c] = '0';",
    hints: [
      "How do we prevent revisiting cells?",
      "Mark the cell as visited",
      "Set the cell to '0' or another marker"
    ],
    explanation: "We need to mark the current cell as visited by changing it to '0' (or any non-'1' value) to prevent infinite recursion and double counting."
  },
  // Day 27
  {
    id: 28,
    date: getDateString(27),
    type: "bug-fix",
    difficulty: "hard",
    title: "Trapping Rain Water",
    description: "Fix the two-pointer water calculation.",
    code: `function trap(height) {
  let left = 0, right = height.length - 1;
  let leftMax = 0, rightMax = 0;
  let water = 0;
  
  while (left < right) {
    if (height[left] < height[right]) {
      if (height[left] >= leftMax) {
        leftMax = height[left];
      } else {
        water += leftMax - height[right];
      }
      left++;
    } else {
      if (height[right] >= rightMax) {
        rightMax = height[right];
      } else {
        water += rightMax - height[right];
      }
      right--;
    }
  }
  
  return water;
}`,
    bugLine: 11,
    correctAnswer: "water += leftMax - height[left];",
    hints: [
      "Check what we're subtracting",
      "We're in the left branch",
      "Should subtract height[left], not height[right]"
    ],
    explanation: "On line 11, we're processing the left side but subtracting height[right] instead of height[left]. It should be water += leftMax - height[left]."
  },
  // Day 28
  {
    id: 29,
    date: getDateString(28),
    type: "find-problem",
    difficulty: "medium",
    title: "Group Anagrams",
    description: "Find the sorting key issue.",
    code: `function groupAnagrams(strs) {
  const groups = {};
  
  for (let str of strs) {
    const key = str.split('').sort();
    
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(str);
  }
  
  return Object.values(groups);
}`,
    bugLine: 5,
    correctAnswer: "const key = str.split('').sort().join('');",
    hints: [
      "What type is the key?",
      "Arrays don't make good object keys",
      "Convert the sorted array back to string"
    ],
    explanation: "sort() returns an array, and using an array as an object key converts it to a string like 'a,e,t'. While this might work, it's better to explicitly join('') for cleaner keys."
  },
  // Day 29
  {
    id: 30,
    date: getDateString(29),
    type: "bug-fix",
    difficulty: "easy",
    title: "Move Zeroes",
    description: "Fix the swap logic for moving zeroes.",
    code: `function moveZeroes(nums) {
  let insertPos = 0;
  
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== 0) {
      nums[insertPos] = nums[i];
      insertPos++;
    }
  }
  
  while (insertPos < nums.length) {
    nums[insertPos] = 1;
    insertPos++;
  }
}`,
    bugLine: 12,
    correctAnswer: "nums[insertPos] = 0;",
    hints: [
      "What value should fill the remaining spots?",
      "We're moving zeroes to the end",
      "Fill with 0, not 1"
    ],
    explanation: "The function is meant to move zeroes to the end, so we should fill remaining positions with 0, not 1."
  },
  // Day 30
  {
    id: 31,
    date: getDateString(30),
    type: "complete-line",
    difficulty: "hard",
    title: "Course Schedule - Topological Sort",
    description: "Complete the cycle detection in DFS.",
    code: `function canFinish(numCourses, prerequisites) {
  const graph = Array.from({ length: numCourses }, () => []);
  
  for (let [course, prereq] of prerequisites) {
    graph[prereq].push(course);
  }
  
  const visited = new Set();
  const inStack = new Set();
  
  function hasCycle(node) {
    if (inStack.has(node)) return true;
    if (visited.has(node)) return false;
    
    inStack.add(node);
    
    for (let neighbor of graph[node]) {
      if (hasCycle(neighbor)) return true;
    }
    
    // Missing line here
    visited.add(node);
    return false;
  }
  
  for (let i = 0; i < numCourses; i++) {
    if (hasCycle(i)) return false;
  }
  
  return true;
}`,
    bugLine: 20,
    correctAnswer: "inStack.delete(node);",
    hints: [
      "What should happen after exploring neighbors?",
      "We added the node to inStack",
      "Remove from inStack when backtracking"
    ],
    explanation: "After exploring all neighbors, we need to remove the node from inStack (the recursion stack) to properly handle separate paths that might visit the same node."
  },
];

// Get today's challenge
export const getTodaysChallenge = (): Challenge => {
  const today = new Date().toISOString().split('T')[0];
  return challenges.find(c => c.date === today) || challenges[0];
};

// Get challenge by date
export const getChallengeByDate = (date: string): Challenge | undefined => {
  return challenges.find(c => c.date === date);
};

// Get all past challenges (for premium users)
export const getPastChallenges = (): Challenge[] => {
  const today = new Date().toISOString().split('T')[0];
  return challenges.filter(c => c.date < today);
};
