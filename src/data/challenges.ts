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
    code: `def find_duplicate(nums):
    slow = nums[0]
    fast = nums[0]

    # Find meeting point
    while True:
        slow = nums[slow]
        fast = nums[nums[fast]]
        if slow == fast:
            break

    # Find entrance
    slow = nums[0]
    while slow != fast:
        slow = nums[slow]
        fast = fast  # Bug here

    return slow`,
    bugLine: 15,
    correctAnswer: "fast = nums[fast]",
    hints: [
      "Look at the second phase of Floyd's algorithm",
      "Both pointers should move at the same speed in phase 2",
      "The fast pointer isn't being updated correctly"
    ],
    explanation: "In Floyd's cycle detection, the second phase requires both pointers to move one step at a time. The bug is on line 15 where 'fast = fast' doesn't advance the pointer. It should be 'fast = nums[fast]' to properly traverse the array."
  },
  // Day 1
  {
    id: 2,
    date: getDateString(1),
    type: "bug-fix",
    difficulty: "easy",
    title: "Binary Search",
    description: "Fix the bug in this binary search implementation.",
    code: `def binary_search(arr, target):
    left = 0
    right = len(arr)

    while left <= right:
        mid = (left + right) // 2

        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1

    return -1`,
    bugLine: 3,
    correctAnswer: "right = len(arr) - 1",
    hints: [
      "Check the initial bounds of the search",
      "What is the valid index range for an array?",
      "len(arr) is out of bounds"
    ],
    explanation: "The right pointer should start at len(arr) - 1, not len(arr). Starting at len(arr) could cause an out-of-bounds access when checking arr[mid]."
  },
  // Day 2
  {
    id: 3,
    date: getDateString(2),
    type: "complete-line",
    difficulty: "medium",
    title: "Merge Sort - Merge Step",
    description: "Complete the missing line in the merge function.",
    code: `def merge(left, right):
    result = []
    i = j = 0

    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            # Missing line here

    result.extend(left[i:])
    result.extend(right[j:])
    return result`,
    bugLine: 11,
    correctAnswer: "j += 1",
    hints: [
      "What needs to happen after appending right[j]?",
      "We need to move to the next element",
      "Increment the right array pointer"
    ],
    explanation: "After appending right[j] to the result, we need to increment j to move to the next element in the right array, just like we increment i when appending from the left array."
  },
  // Day 3
  {
    id: 4,
    date: getDateString(3),
    type: "find-problem",
    difficulty: "hard",
    title: "Quick Sort Partition",
    description: "Find the logical error that causes incorrect sorting.",
    code: `def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1

    for j in range(low, high):
        if arr[j] < pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]

    arr[i], arr[high] = arr[high], arr[i]
    return i`,
    bugLine: 10,
    correctAnswer: "arr[i + 1], arr[high] = arr[high], arr[i + 1]",
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
    code: `def fibonacci(n):
    if n <= 0:
        return 0
    if n == 1:
        return 1

    return fibonacci(n - 1) + fibonacci(n - 1)`,
    bugLine: 7,
    correctAnswer: "return fibonacci(n - 1) + fibonacci(n - 2)",
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
    code: `def reverse_list(head):
    prev = None
    current = head

    while current is not None:
        next = current.next
        current.next = prev
        prev = current
        current = prev

    return prev`,
    bugLine: 9,
    correctAnswer: "current = next",
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
    code: `def is_balanced(s):
    stack = []
    pairs = {')': '(', '}': '{', ']': '['}

    for char in s:
        if char in '({[':
            stack.append(char)
        elif char in ')}]':
            # Missing line here
                return False

    return len(stack) == 0`,
    bugLine: 9,
    correctAnswer: "if not stack or stack.pop() != pairs[char]:",
    hints: [
      "What should we check from the stack?",
      "Pop the stack and compare with the expected pair",
      "Check if stack is empty first"
    ],
    explanation: "We need to check if the stack is empty and pop from it to verify it matches the expected opening bracket for the current closing bracket using the pairs dictionary."
  },
  // Day 7
  {
    id: 8,
    date: getDateString(7),
    type: "bug-fix",
    difficulty: "hard",
    title: "BFS Level Order Traversal",
    description: "Fix the bug causing incorrect level order output.",
    code: `def level_order(root):
    if not root:
        return []

    result = []
    queue = [root]

    while queue:
        level = []
        size = len(queue)

        for i in range(size + 1):
            if not queue:
                break
            node = queue.pop(0)
            level.append(node.val)

            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)

        result.append(level)

    return result`,
    bugLine: 12,
    correctAnswer: "for i in range(size):",
    hints: [
      "Check the loop bounds",
      "How many nodes should be processed per level?",
      "The range should be range(size), not range(size + 1)"
    ],
    explanation: "Using range(size + 1) processes one extra node per level, mixing nodes from different levels. It should be range(size) to process exactly 'size' nodes per level."
  },
  // Day 8
  {
    id: 9,
    date: getDateString(8),
    type: "find-problem",
    difficulty: "medium",
    title: "Two Sum - Hash Map",
    description: "Find why this returns incorrect indices sometimes.",
    code: `def two_sum(nums, target):
    num_map = {}

    for i in range(len(nums)):
        num_map[nums[i]] = i

    for i in range(len(nums)):
        complement = target - nums[i]
        if complement in num_map:
            return [i, num_map[complement]]

    return []`,
    bugLine: 9,
    correctAnswer: "if complement in num_map and num_map[complement] != i:",
    hints: [
      "What if the complement is the same number?",
      "Can an element be used twice?",
      "Check if the indices are different"
    ],
    explanation: "The bug is that it doesn't check if the complement's index is different from the current index. If nums[i] + nums[i] = target, it should only work if there are two different indices."
  },
  // Day 9
  {
    id: 10,
    date: getDateString(9),
    type: "bug-fix",
    difficulty: "easy",
    title: "Maximum Subarray (Kadane's)",
    description: "Fix the initialization bug in Kadane's algorithm.",
    code: `def max_sub_array(nums):
    max_sum = 0
    current_sum = 0

    for num in nums:
        current_sum = max(num, current_sum + num)
        max_sum = max(max_sum, current_sum)

    return max_sum`,
    bugLine: 2,
    correctAnswer: "max_sum = nums[0]",
    hints: [
      "What if all numbers are negative?",
      "Check the initial value of max_sum",
      "Initialize with the first element"
    ],
    explanation: "Initializing max_sum to 0 fails for arrays with all negative numbers. It should be initialized to nums[0] to handle this case correctly."
  },
  // Day 10
  {
    id: 11,
    date: getDateString(10),
    type: "complete-line",
    difficulty: "medium",
    title: "DFS - Path Sum",
    description: "Complete the recursive call to check path sum.",
    code: `def has_path_sum(root, target_sum):
    if not root:
        return False

    if not root.left and not root.right:
        return target_sum == root.val

    remaining = target_sum - root.val
    # Missing line here`,
    bugLine: 8,
    correctAnswer: "return has_path_sum(root.left, remaining) or has_path_sum(root.right, remaining)",
    hints: [
      "We need to check both subtrees",
      "Use 'or' to check if either path works",
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
    code: `class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.cache = {}

    def get(self, key):
        if key not in self.cache:
            return -1

        value = self.cache[key]
        # Move to end (most recently used)
        del self.cache[key]
        return value

    def put(self, key, value):
        if key in self.cache:
            del self.cache[key]
        self.cache[key] = value

        if len(self.cache) > self.capacity:
            first_key = next(iter(self.cache))
            del self.cache[first_key]`,
    bugLine: 12,
    correctAnswer: "self.cache[key] = value",
    hints: [
      "After deleting, the key-value pair is gone",
      "What happens after we delete the key?",
      "We need to re-add it to move to end"
    ],
    explanation: "After deleting the key to move it to the end, we forgot to add it back. The line 'self.cache[key] = value' is missing before the return statement."
  },
  // Day 12
  {
    id: 13,
    date: getDateString(12),
    type: "find-problem",
    difficulty: "medium",
    title: "Valid Palindrome",
    description: "Find why this fails for some edge cases.",
    code: `def is_palindrome(s):
    cleaned = ''.join(c.lower() for c in s if c.isalnum())
    left = 0
    right = len(cleaned)

    while left < right:
        if cleaned[left] != cleaned[right]:
            return False
        left += 1
        right -= 1

    return True`,
    bugLine: 4,
    correctAnswer: "right = len(cleaned) - 1",
    hints: [
      "Check the initial value of right",
      "What's the last valid index?",
      "len(cleaned) - 1 is the last index"
    ],
    explanation: "The right pointer should start at len(cleaned) - 1, not len(cleaned). Starting at length causes an index out of bounds error which returns False."
  },
  // Day 13
  {
    id: 14,
    date: getDateString(13),
    type: "bug-fix",
    difficulty: "easy",
    title: "Remove Duplicates from Sorted Array",
    description: "Fix the pointer logic bug.",
    code: `def remove_duplicates(nums):
    if len(nums) == 0:
        return 0

    i = 0

    for j in range(1, len(nums)):
        if nums[j] != nums[i]:
            nums[i] = nums[j]
            i += 1

    return i + 1`,
    bugLine: 9,
    correctAnswer: "i += 1\n            nums[i] = nums[j]",
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
    code: `def coin_change(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0

    for i in range(1, amount + 1):
        for coin in coins:
            if coin <= i:
                # Missing line here
                pass

    return -1 if dp[amount] == float('inf') else dp[amount]`,
    bugLine: 8,
    correctAnswer: "dp[i] = min(dp[i], dp[i - coin] + 1)",
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
    code: `def invert_tree(root):
    if not root:
        return None

    temp = root.left
    root.left = invert_tree(root.left)
    root.right = invert_tree(temp)

    return root`,
    bugLine: 6,
    correctAnswer: "root.left = invert_tree(root.right)",
    hints: [
      "What should we assign to root.left?",
      "We're swapping left and right",
      "root.left should get the inverted right subtree"
    ],
    explanation: "When inverting, root.left should receive the inverted root.right, and root.right should receive the inverted root.left (saved in temp). Line 6 incorrectly inverts root.left again."
  },
  // Day 16
  {
    id: 17,
    date: getDateString(16),
    type: "find-problem",
    difficulty: "easy",
    title: "Contains Duplicate",
    description: "Find the inefficiency in this solution.",
    code: `def contains_duplicate(nums):
    for i in range(len(nums)):
        for j in range(len(nums)):
            if i != j and nums[i] == nums[j]:
                return True
    return False`,
    bugLine: 3,
    correctAnswer: "for j in range(i + 1, len(nums)):",
    hints: [
      "This is O(n²) but can be optimized",
      "We're checking some pairs twice",
      "Start j from i + 1"
    ],
    explanation: "Starting j from 0 checks each pair twice. Starting j from i + 1 still finds duplicates but avoids redundant comparisons. Better yet, use a set for O(n) time."
  },
  // Day 17
  {
    id: 18,
    date: getDateString(17),
    type: "bug-fix",
    difficulty: "medium",
    title: "Merge Two Sorted Lists",
    description: "Fix the pointer assignment bug.",
    code: `def merge_two_lists(l1, l2):
    dummy = {'val': 0, 'next': None}
    current = dummy

    while l1 and l2:
        if l1['val'] <= l2['val']:
            current['next'] = l1
            l1 = l1['next']
        else:
            current['next'] = l2
            l2 = l2['next']

    current['next'] = l1 or l2
    return dummy['next']`,
    bugLine: 7,
    correctAnswer: "current['next'] = l1\n        current = current['next']",
    hints: [
      "After assigning next, what about current?",
      "Current should advance",
      "Add current = current['next'] after each assignment"
    ],
    explanation: "The current pointer is never advanced, so only the last comparison's node is linked. We need to add 'current = current['next']' after setting current['next'] in both branches."
  },
  // Day 18
  {
    id: 19,
    date: getDateString(18),
    type: "complete-line",
    difficulty: "hard",
    title: "Longest Palindromic Substring",
    description: "Complete the expand around center helper.",
    code: `def longest_palindrome(s):
    start = 0
    max_len = 1

    def expand_around_center(left, right):
        while left >= 0 and right < len(s) and s[left] == s[right]:
            # Missing line here
            pass
        return right - left - 1

    for i in range(len(s)):
        len1 = expand_around_center(i, i)
        len2 = expand_around_center(i, i + 1)
        length = max(len1, len2)

        if length > max_len:
            max_len = length
            start = i - (length - 1) // 2

    return s[start:start + max_len]`,
    bugLine: 7,
    correctAnswer: "left -= 1\n            right += 1",
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
    code: `def climb_stairs(n):
    if n <= 2:
        return n

    dp = [0] * n
    dp[0] = 1
    dp[1] = 2

    for i in range(2, n):
        dp[i] = dp[i - 1] + dp[i - 2]

    return dp[n - 1]`,
    bugLine: 4,
    correctAnswer: "dp = [0] * (n + 1)",
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
    code: `def is_anagram(s, t):
    if len(s) != len(t):
        return False

    count = {}

    for char in s:
        count[char] = count.get(char, 0) + 1

    for char in t:
        count[char] -= 1
        if count[char] < 0:
            return False

    return True`,
    bugLine: 11,
    correctAnswer: "if char not in count or count[char] < 0:",
    hints: [
      "What if a character in t isn't in s?",
      "Decrementing a missing key causes a KeyError",
      "Check if the character exists first"
    ],
    explanation: "If a character in t doesn't exist in count, we get a KeyError. We should check if the character exists in the dictionary first before decrementing."
  },
  // Day 21
  {
    id: 22,
    date: getDateString(21),
    type: "bug-fix",
    difficulty: "hard",
    title: "Word Search - Backtracking",
    description: "Fix the backtracking logic in this word search.",
    code: `def exist(board, word):
    rows, cols = len(board), len(board[0])

    def dfs(r, c, i):
        if i == len(word):
            return True
        if r < 0 or c < 0 or r >= rows or c >= cols:
            return False
        if board[r][c] != word[i]:
            return False

        board[r][c] = '#'  # Mark visited

        found = (dfs(r + 1, c, i + 1) or dfs(r - 1, c, i + 1) or
                 dfs(r, c + 1, i + 1) or dfs(r, c - 1, i + 1))

        return found

    for r in range(rows):
        for c in range(cols):
            if dfs(r, c, 0):
                return True

    return False`,
    bugLine: 16,
    correctAnswer: "board[r][c] = word[i]  # Restore",
    hints: [
      "What happens after exploring all directions?",
      "We marked the cell but never unmarked it",
      "Add backtracking to restore the cell"
    ],
    explanation: "After exploring all directions, we need to restore the cell's original value for backtracking. Add 'board[r][c] = word[i]' after the recursive calls and before returning."
  },
  // Day 22
  {
    id: 23,
    date: getDateString(22),
    type: "complete-line",
    difficulty: "easy",
    title: "Rotate Array",
    description: "Complete the reverse helper function.",
    code: `def rotate(nums, k):
    k = k % len(nums)

    def reverse(start, end):
        while start < end:
            # Missing line here
            start += 1
            end -= 1

    reverse(0, len(nums) - 1)
    reverse(0, k - 1)
    reverse(k, len(nums) - 1)`,
    bugLine: 6,
    correctAnswer: "nums[start], nums[end] = nums[end], nums[start]",
    hints: [
      "We need to swap elements",
      "Use tuple unpacking for clean swap",
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
    code: `def product_except_self(nums):
    n = len(nums)
    result = [1] * n

    prefix = 1
    for i in range(n):
        result[i] = prefix
        prefix *= nums[i]

    suffix = 1
    for i in range(n - 1, -1, -1):
        result[i] = suffix
        suffix *= nums[i]

    return result`,
    bugLine: 12,
    correctAnswer: "result[i] *= suffix",
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
    code: `def serialize(root):
    if not root:
        return 'null'
    return (str(root.val) + ',' + serialize(root.left) + ',' +
            serialize(root.right))

def deserialize(data):
    nodes = data.split(',')
    index = [0]

    def build():
        if nodes[index[0]] == 'null':
            index[0] += 1
            return None

        node = {'val': nodes[index[0]], 'left': None, 'right': None}
        index[0] += 1
        node['left'] = build()
        node['right'] = build()
        return node

    return build()`,
    bugLine: 16,
    correctAnswer: "node = {'val': int(nodes[index[0]]), 'left': None, 'right': None}",
    hints: [
      "What type is nodes[index[0]]?",
      "The split returns strings",
      "Node values should be numbers"
    ],
    explanation: "The split operation returns strings, so node values become strings instead of numbers. Use int(nodes[index[0]]) to convert back to integers."
  },
  // Day 25
  {
    id: 26,
    date: getDateString(25),
    type: "bug-fix",
    difficulty: "easy",
    title: "Single Number",
    description: "Fix the XOR accumulator bug.",
    code: `def single_number(nums):
    result = 1

    for num in nums:
        result ^= num

    return result`,
    bugLine: 2,
    correctAnswer: "result = 0",
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
    code: `def num_islands(grid):
    if not grid:
        return 0

    count = 0
    rows, cols = len(grid), len(grid[0])

    def dfs(r, c):
        if r < 0 or c < 0 or r >= rows or c >= cols:
            return
        if grid[r][c] != '1':
            return

        # Missing line here

        dfs(r + 1, c)
        dfs(r - 1, c)
        dfs(r, c + 1)
        dfs(r, c - 1)

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == '1':
                count += 1
                dfs(r, c)

    return count`,
    bugLine: 14,
    correctAnswer: "grid[r][c] = '0'",
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
    code: `def trap(height):
    left = 0
    right = len(height) - 1
    left_max = 0
    right_max = 0
    water = 0

    while left < right:
        if height[left] < height[right]:
            if height[left] >= left_max:
                left_max = height[left]
            else:
                water += left_max - height[right]
            left += 1
        else:
            if height[right] >= right_max:
                right_max = height[right]
            else:
                water += right_max - height[right]
            right -= 1

    return water`,
    bugLine: 13,
    correctAnswer: "water += left_max - height[left]",
    hints: [
      "Check what we're subtracting",
      "We're in the left branch",
      "Should subtract height[left], not height[right]"
    ],
    explanation: "On line 13, we're processing the left side but subtracting height[right] instead of height[left]. It should be water += left_max - height[left]."
  },
  // Day 28
  {
    id: 29,
    date: getDateString(28),
    type: "find-problem",
    difficulty: "medium",
    title: "Group Anagrams",
    description: "Find the sorting key issue.",
    code: `def group_anagrams(strs):
    groups = {}

    for s in strs:
        key = ''.join(sorted(s))

        if key not in groups:
            groups[key] = []
        groups[key].append(s)

    return list(groups.values())`,
    bugLine: 5,
    correctAnswer: "key = ''.join(sorted(s))",
    hints: [
      "What type is the key?",
      "Lists don't make good dictionary keys",
      "Convert the sorted array to string"
    ],
    explanation: "sorted() returns a list, but we need a hashable key for the dictionary. We should use ''.join(sorted(s)) to create a string key."
  },
  // Day 29
  {
    id: 30,
    date: getDateString(29),
    type: "bug-fix",
    difficulty: "easy",
    title: "Move Zeroes",
    description: "Fix the swap logic for moving zeroes.",
    code: `def move_zeroes(nums):
    insert_pos = 0

    for i in range(len(nums)):
        if nums[i] != 0:
            nums[insert_pos] = nums[i]
            insert_pos += 1

    while insert_pos < len(nums):
        nums[insert_pos] = 1
        insert_pos += 1`,
    bugLine: 10,
    correctAnswer: "nums[insert_pos] = 0",
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
    code: `def can_finish(num_courses, prerequisites):
    graph = [[] for _ in range(num_courses)]

    for course, prereq in prerequisites:
        graph[prereq].append(course)

    visited = set()
    in_stack = set()

    def has_cycle(node):
        if node in in_stack:
            return True
        if node in visited:
            return False

        in_stack.add(node)

        for neighbor in graph[node]:
            if has_cycle(neighbor):
                return True

        # Missing line here
        visited.add(node)
        return False

    for i in range(num_courses):
        if has_cycle(i):
            return False

    return True`,
    bugLine: 22,
    correctAnswer: "in_stack.remove(node)",
    hints: [
      "What should happen after exploring neighbors?",
      "We added the node to in_stack",
      "Remove from in_stack when backtracking"
    ],
    explanation: "After exploring all neighbors, we need to remove the node from in_stack (the recursion stack) to properly handle separate paths that might visit the same node."
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
