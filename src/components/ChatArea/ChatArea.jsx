import { useState, useRef, useEffect } from "react";
import {
  FiSend,
  FiPaperclip,
  FiMic,
  FiCopy,
  FiDownload,
  FiRefreshCw,
  FiAlertTriangle,
  FiChevronRight,
  FiChevronDown,
  FiCpu,
  FiHelpCircle,
  FiAward,
  FiCheck,
  FiSettings,
} from "react-icons/fi";
import "./ChatArea.css";

// ==========================================
// OFFLINE BACKUP MOCK DATA (Local Fallback)
// ==========================================
const MOCK_DATASETS = {
  "two sum": {
    topic: "Two Sum",
    difficulty: "Easy",
    isDebug: false,
    step1: {
      title: "Step 1: Problem Understanding",
      problem: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.",
      input: "nums = [2, 7, 11, 15], target = 9",
      output: "[0, 1] (because nums[0] + nums[1] == 9)",
      constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9"]
    },
    step2: {
      title: "Step 2: Brute Force Solution",
      idea: "Iterate through each element i and search for another element j such that nums[i] + nums[j] == target.",
      code: "public class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        for (int i = 0; i < nums.length; i++) {\n            for (int j = i + 1; j < nums.length; j++) {\n                if (nums[i] + nums[j] == target) return new int[] { i, j };\n            }\n        }\n        return new int[] {};\n    }\n}",
      dryRun: ["Target 9. Outer loop i=0 (2). Inner loop j=1 (7). 2 + 7 == 9. Return [0, 1]."],
      timeComplexity: "O(n²)",
      spaceComplexity: "O(1)"
    },
    step3: {
      question: "Can you think of a way to avoid unnecessary nested loops?",
      hint1: "Think about storing previously seen values as we iterate.",
      hint2: "Can a HashMap reduce repeated searching to O(1) time?",
      hint3: "Check if (target - nums[i]) exists in our map."
    },
    step5: {
      title: "Step 5: Optimized Solution",
      explanation: "We use a HashMap to store the numbers and their indices, checking for the complement in O(1) time.",
      code: "import java.util.HashMap;\nimport java.util.Map;\n\npublic class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (map.containsKey(complement)) return new int[] { map.get(complement), i };\n            map.put(nums[i], i);\n        }\n        return new int[] {};\n    }\n}",
      dryRun: ["i=0 (2): complement=7. Not in map. Put (2,0).", "i=1 (7): complement=2. Found! Return [0,1]."],
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      betterWhy: "Using a HashMap reduces target lookups from O(n) to O(1), improving time complexity to O(n)."
    },
    step7: {
      title: "Step 7: Interview Mode Q&A",
      questions: [
        { q: "Why HashMap instead of HashSet?", a: "We need indices. HashMap allows caching value-to-index pairs." }
      ]
    },
    step8: {
      title: "Step 8: Learning Summary",
      difficulty: "Easy",
      concepts: ["HashMap Caching", "Space-Time Tradeoff"],
      mistakes: "Using a Set which does not preserve index details.",
      techniques: ["Linear single-pass hashing"],
      pattern: "Hashing"
    }
  },
  "binary search": {
    topic: "Binary Search",
    difficulty: "Easy",
    isDebug: false,
    step1: {
      title: "Step 1: Problem Understanding",
      problem: "Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, return its index. Otherwise, return `-1`.",
      input: "nums = [-1, 0, 3, 5, 9, 12], target = 9",
      output: "4 (9 exists in nums and its index is 4)",
      constraints: ["1 <= nums.length <= 10^4", "-10^4 < nums[i], target < 10^4", "All integers in nums are unique", "nums is sorted in ascending order"]
    },
    step2: {
      title: "Step 2: Brute Force Solution",
      idea: "Perform linear scan from beginning to end checking if nums[i] == target.",
      code: "public class Solution {\n    public int search(int[] nums, int target) {\n        for (int i = 0; i < nums.length; i++) {\n            if (nums[i] == target) return i;\n        }\n        return -1;\n    }\n}",
      dryRun: ["Inspect index 0 (-1), 1 (0), 2 (3), 3 (5), 4 (9 == target). Return index 4."],
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)"
    },
    step3: {
      question: "Can we exploit the sorted property of the array to eliminate half the elements in each step?",
      hint1: "Compare target with the middle element nums[mid].",
      hint2: "If target is greater than nums[mid], search only the right half.",
      hint3: "Calculate mid using left + (right - left) / 2 to prevent integer overflow."
    },
    step5: {
      title: "Step 5: Optimized Solution",
      explanation: "Using two pointers left and right, we compute mid and discard half the candidate search space each turn.",
      code: "public class Solution {\n    public int search(int[] nums, int target) {\n        int left = 0, right = nums.length - 1;\n        while (left <= right) {\n            int mid = left + (right - left) / 2;\n            if (nums[mid] == target) return mid;\n            else if (nums[mid] < target) left = mid + 1;\n            else right = mid - 1;\n        }\n        return -1;\n    }\n}",
      dryRun: ["left=0, right=5, mid=2 (val=3 < 9) -> left=3", "left=3, right=5, mid=4 (val=9 == 9) -> returns 4"],
      timeComplexity: "O(log n)",
      spaceComplexity: "O(1)",
      betterWhy: "Halving the search space each cycle reduces worst-case steps from n to log2(n)."
    },
    step7: {
      title: "Step 7: Interview Mode Q&A",
      questions: [
        { q: "Why use left + (right - left) / 2 instead of (left + right) / 2?", a: "Prevents 32-bit signed integer overflow when left + right exceeds 2^31 - 1." },
        { q: "When should the loop condition be left <= right vs left < right?", a: "Use left <= right when the search space includes the boundary and target could be at left == right." }
      ]
    },
    step8: {
      title: "Step 8: Learning Summary",
      difficulty: "Easy",
      concepts: ["Divide and Conquer", "Integer Overflow Prevention", "Search Space Invariants"],
      mistakes: "Using (left + right) / 2 directly or off-by-one errors with <= vs <.",
      techniques: ["Binary search range pruning"],
      pattern: "Binary Search"
    }
  },
  "valid parentheses": {
    topic: "Valid Parentheses",
    difficulty: "Easy",
    isDebug: false,
    step1: {
      title: "Step 1: Problem Understanding",
      problem: "Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid. Open brackets must be closed by the same type of brackets and in the correct order.",
      input: "s = '()[]{}'",
      output: "true",
      constraints: ["1 <= s.length <= 10^4", "s consists of parentheses only '()[]{}'"]
    },
    step2: {
      title: "Step 2: Brute Force Solution",
      idea: "Repeatedly find and remove matched pairs '()', '[]', and '{}' until none remain.",
      code: "public class Solution {\n    public boolean isValid(String s) {\n        while (s.contains(\"()\") || s.contains(\"[]\") || s.contains(\"{}\")) {\n            s = s.replace(\"()\", \"\").replace(\"[]\", \"\").replace(\"{}\", \"\");\n        }\n        return s.isEmpty();\n    }\n}",
      dryRun: ["'()[{}]' -> '[{}]' -> '[]' -> '' -> return true"],
      timeComplexity: "O(n²)",
      spaceComplexity: "O(n)"
    },
    step3: {
      question: "Which data structure follows Last-In-First-Out (LIFO) to match the most recently opened bracket?",
      hint1: "When an opening bracket is seen, push it onto a stack.",
      hint2: "When a closing bracket is seen, check if it matches the stack's top element.",
      hint3: "If the stack is empty at the end, all brackets were cleanly matched."
    },
    step5: {
      title: "Step 5: Optimized Solution",
      explanation: "Using an explicit Deque or Stack, we process characters in a single pass O(n) time.",
      code: "import java.util.ArrayDeque;\nimport java.util.Deque;\n\npublic class Solution {\n    public boolean isValid(String s) {\n        Deque<Character> stack = new ArrayDeque<>();\n        for (char c : s.toCharArray()) {\n            if (c == '(') stack.push(')');\n            else if (c == '{') stack.push('}');\n            else if (c == '[') stack.push(']');\n            else if (stack.isEmpty() || stack.pop() != c) return false;\n        }\n        return stack.isEmpty();\n    }\n}",
      dryRun: ["c='(' push ')'", "c=')' pop matching ')'", "stack is empty -> true"],
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      betterWhy: "Single-pass LIFO inspection eliminates repeated quadratic string allocations."
    },
    step7: {
      title: "Step 7: Interview Mode Q&A",
      questions: [
        { q: "Why use ArrayDeque instead of java.util.Stack?", a: "Stack extends Vector and has synchronized overhead; ArrayDeque is faster and non-synchronized." }
      ]
    },
    step8: {
      title: "Step 8: Learning Summary",
      difficulty: "Easy",
      concepts: ["Stack LIFO", "Character Mapping", "Early Exit Validation"],
      mistakes: "Forgetting to check if stack is empty before popping.",
      techniques: ["Push expected closing bracket onto stack"],
      pattern: "Stack"
    }
  },
  "recursion": {
    topic: "Recursion - Factorial",
    difficulty: "Easy",
    isDebug: false,
    step1: {
      title: "Step 1: Problem Understanding",
      problem: "Given a non-negative integer `n`, calculate `n!`. The factorial of 0 is 1, and every other factorial is `n * (n - 1)!`.",
      input: "n = 5",
      output: "120",
      constraints: ["0 <= n <= 12 for an int result", "Define a base case before the recursive call"]
    },
    step2: {
      title: "Step 2: Brute Force Solution",
      idea: "Multiply all integers from 2 through n using a loop.",
      code: "public class Solution {\n    public int factorial(int n) {\n        int result = 1;\n        for (int value = 2; value <= n; value++) {\n            result *= value;\n        }\n        return result;\n    }\n}",
      dryRun: ["result=1 -> multiply 2, 3, 4, and 5 -> 120"],
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)"
    },
    step3: {
      question: "How can the smaller instance factorial(n - 1) help solve factorial(n)?",
      hint1: "Identify the smallest input with a direct answer.",
      hint2: "For n > 0, reduce the problem size by one.",
      hint3: "Return n * factorial(n - 1), but stop at n <= 1."
    },
    step5: {
      title: "Step 5: Optimized Solution",
      explanation: "Recursion expresses the mathematical definition directly: solve a smaller factorial until the base case is reached.",
      code: "public class Solution {\n    public int factorial(int n) {\n        if (n <= 1) return 1;\n        return n * factorial(n - 1);\n    }\n}",
      dryRun: ["factorial(5) = 5 * factorial(4)", "factorial(1) returns 1, then calls return 2, 6, 24, and 120"],
      timeComplexity: "O(n)",
      spaceComplexity: "O(n) call stack",
      betterWhy: "The recursive version makes the reduction and base case explicit, which generalizes well to trees and divide-and-conquer problems."
    },
    step7: {
      title: "Step 7: Interview Mode Q&A",
      questions: [{ q: "What causes a stack overflow?", a: "A recursive function that has no reachable base case, or a recursion depth too large for the call stack." }]
    },
    step8: {
      title: "Step 8: Learning Summary",
      difficulty: "Easy",
      concepts: ["Base Case", "Recursive Case", "Call Stack"],
      mistakes: "Forgetting the base case or recursing without reducing the input.",
      techniques: ["Solve a smaller instance", "Trace the call stack"],
      pattern: "Recursion"
    }
  },
  "sliding window": {
    topic: "Sliding Window - Maximum Sum Subarray",
    difficulty: "Medium",
    isDebug: false,
    step1: {
      title: "Step 1: Problem Understanding",
      problem: "Find the maximum sum among all contiguous subarrays of size `k`.",
      input: "nums = [2, 1, 5, 1, 3, 2], k = 3",
      output: "9 (subarray [5, 1, 3])",
      constraints: ["1 <= k <= nums.length", "The window contains exactly k contiguous values"]
    },
    step2: {
      title: "Step 2: Brute Force Solution",
      idea: "For every possible starting index, sum the next k values from scratch.",
      code: "public class Solution {\n    public int maxSum(int[] nums, int k) {\n        int best = Integer.MIN_VALUE;\n        for (int start = 0; start <= nums.length - k; start++) {\n            int sum = 0;\n            for (int index = start; index < start + k; index++) sum += nums[index];\n            best = Math.max(best, sum);\n        }\n        return best;\n    }\n}",
      dryRun: ["[2,1,5] = 8, [1,5,1] = 7, [5,1,3] = 9"],
      timeComplexity: "O(n * k)",
      spaceComplexity: "O(1)"
    },
    step3: {
      question: "When the window moves right by one position, which two values change the sum?",
      hint1: "Remove the value leaving the left edge.",
      hint2: "Add the value entering from the right edge.",
      hint3: "Keep one running windowSum instead of recalculating it."
    },
    step5: {
      title: "Step 5: Optimized Solution",
      explanation: "Build the first window, then slide it by subtracting the outgoing value and adding the incoming value.",
      code: "public class Solution {\n    public int maxSum(int[] nums, int k) {\n        int windowSum = 0;\n        for (int i = 0; i < k; i++) windowSum += nums[i];\n        int best = windowSum;\n        for (int right = k; right < nums.length; right++) {\n            windowSum += nums[right] - nums[right - k];\n            best = Math.max(best, windowSum);\n        }\n        return best;\n    }\n}",
      dryRun: ["First window sum = 8", "Slide to [5,1,3]: 7 - 1 + 3 = 9"],
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      betterWhy: "Each array value is added and removed at most once."
    },
    step7: {
      title: "Step 7: Interview Mode Q&A",
      questions: [{ q: "When is a fixed-size window appropriate?", a: "When every valid subarray has the same required size, such as k consecutive elements." }]
    },
    step8: {
      title: "Step 8: Learning Summary",
      difficulty: "Medium",
      concepts: ["Contiguous Subarrays", "Running Sum", "Two Pointers"],
      mistakes: "Forgetting to subtract the element that leaves the window.",
      techniques: ["Fixed-size window", "Incremental sum update"],
      pattern: "Sliding Window"
    }
  },
  "prefix sum": {
    topic: "Prefix Sum - Range Sum Query",
    difficulty: "Easy",
    isDebug: false,
    step1: {
      title: "Step 1: Problem Understanding",
      problem: "Answer sum queries for inclusive ranges [left, right] in an integer array.",
      input: "nums = [-2, 0, 3, -5, 2, -1], query = [0, 2]",
      output: "1",
      constraints: ["0 <= left <= right < nums.length", "Many queries may be asked for the same array"]
    },
    step2: {
      title: "Step 2: Brute Force Solution",
      idea: "For each query, loop from left through right and add every value.",
      code: "public class Solution {\n    public int rangeSum(int[] nums, int left, int right) {\n        int sum = 0;\n        for (int i = left; i <= right; i++) sum += nums[i];\n        return sum;\n    }\n}",
      dryRun: ["For [0,2], add -2 + 0 + 3 = 1"],
      timeComplexity: "O(n) per query",
      spaceComplexity: "O(1)"
    },
    step3: {
      question: "Can a precomputed cumulative sum make every range query constant time?",
      hint1: "Let prefix[i] store the sum of the first i values.",
      hint2: "Use a prefix array with one extra leading zero.",
      hint3: "The sum from left to right is prefix[right + 1] - prefix[left]."
    },
    step5: {
      title: "Step 5: Optimized Solution",
      explanation: "Precompute cumulative sums once, then subtract the sum before left from the sum through right.",
      code: "public class Solution {\n    private final int[] prefix;\n\n    public Solution(int[] nums) {\n        prefix = new int[nums.length + 1];\n        for (int i = 0; i < nums.length; i++) {\n            prefix[i + 1] = prefix[i] + nums[i];\n        }\n    }\n\n    public int rangeSum(int left, int right) {\n        return prefix[right + 1] - prefix[left];\n    }\n}",
      dryRun: ["prefix = [0,-2,-2,1,-4,-2,-3]", "range [0,2] = prefix[3] - prefix[0] = 1"],
      timeComplexity: "O(n) setup, O(1) per query",
      spaceComplexity: "O(n)",
      betterWhy: "The preprocessing cost is shared by every later query."
    },
    step7: {
      title: "Step 7: Interview Mode Q&A",
      questions: [{ q: "Why use a prefix array of length n + 1?", a: "The leading zero makes ranges starting at index 0 use the same subtraction formula." }]
    },
    step8: {
      title: "Step 8: Learning Summary",
      difficulty: "Easy",
      concepts: ["Cumulative Sum", "Range Query", "Preprocessing"],
      mistakes: "Using prefix[right] - prefix[left] and excluding the right endpoint.",
      techniques: ["Leading-zero prefix array"],
      pattern: "Prefix Sum"
    }
  },
  "two pointers": {
    topic: "Two Pointers - Pair Sum in Sorted Array",
    difficulty: "Easy",
    isDebug: false,
    step1: {
      title: "Step 1: Problem Understanding",
      problem: "Given a sorted integer array `nums` and a target, return the indices of two values whose sum equals the target. Assume exactly one answer exists.",
      input: "nums = [1, 2, 4, 6, 10], target = 8",
      output: "[1, 3] (nums[1] + nums[3] == 8)",
      constraints: ["2 <= nums.length <= 10^4", "nums is sorted in ascending order", "Exactly one valid pair exists"]
    },
    step2: {
      title: "Step 2: Brute Force Solution",
      idea: "Check every pair until their sum equals the target.",
      code: "public class Solution {\n    public int[] pairSum(int[] nums, int target) {\n        for (int i = 0; i < nums.length; i++) {\n            for (int j = i + 1; j < nums.length; j++) {\n                if (nums[i] + nums[j] == target) return new int[] { i, j };\n            }\n        }\n        return new int[] { -1, -1 };\n    }\n}",
      dryRun: ["Try pairs until 2 + 6 == 8, then return [1, 3]."],
      timeComplexity: "O(n²)",
      spaceComplexity: "O(1)"
    },
    step3: {
      question: "How can the sorted order tell us which side of the search to move?",
      hint1: "Start one pointer at each end of the array.",
      hint2: "If the sum is too small, move the left pointer right.",
      hint3: "If the sum is too large, move the right pointer left."
    },
    step5: {
      title: "Step 5: Optimized Solution",
      explanation: "Because the array is sorted, each comparison lets us safely discard one side while moving two pointers inward.",
      code: "public class Solution {\n    public int[] pairSum(int[] nums, int target) {\n        int left = 0, right = nums.length - 1;\n        while (left < right) {\n            int sum = nums[left] + nums[right];\n            if (sum == target) return new int[] { left, right };\n            if (sum < target) left++;\n            else right--;\n        }\n        return new int[] { -1, -1 };\n    }\n}",
      dryRun: ["left=0, right=4: 1+10=11, too large -> right--", "left=0, right=3: 1+6=7, too small -> left++", "left=1, right=3: 2+6=8 -> return [1,3]"],
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      betterWhy: "Each pointer moves at most n times, so the sorted array is scanned once without extra storage."
    },
    step7: {
      title: "Step 7: Interview Mode Q&A",
      questions: [{ q: "Why does this pointer movement work?", a: "The array is sorted: increasing the left value raises the sum, while decreasing the right value lowers it." }]
    },
    step8: {
      title: "Step 8: Learning Summary",
      difficulty: "Easy",
      concepts: ["Sorted Arrays", "Monotonic Search"],
      mistakes: "Using this strategy on an unsorted array without first preserving or restoring the original indices.",
      techniques: ["Move pointers inward based on the current sum"],
      pattern: "Two Pointers"
    }
  },
  "kadane algorithm": {
    topic: "Kadane's Algorithm - Maximum Subarray",
    difficulty: "Medium",
    isDebug: false,
    step1: {
      title: "Step 1: Problem Understanding",
      problem: "Given an integer array, find the contiguous subarray with the largest sum and return that sum.",
      input: "nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]",
      output: "6 (subarray [4, -1, 2, 1])",
      constraints: ["1 <= nums.length <= 10^5", "The array may contain negative values"]
    },
    step2: {
      title: "Step 2: Brute Force Solution",
      idea: "Consider every possible starting index and extend each subarray, tracking its sum.",
      code: "public class Solution {\n    public int maxSubArray(int[] nums) {\n        int best = Integer.MIN_VALUE;\n        for (int start = 0; start < nums.length; start++) {\n            int sum = 0;\n            for (int end = start; end < nums.length; end++) {\n                sum += nums[end];\n                best = Math.max(best, sum);\n            }\n        }\n        return best;\n    }\n}",
      dryRun: ["Enumerate contiguous subarrays and keep the largest sum found: 6."],
      timeComplexity: "O(n²)",
      spaceComplexity: "O(1)"
    },
    step3: {
      question: "When should a running subarray sum be discarded?",
      hint1: "A negative running sum only makes a future subarray smaller.",
      hint2: "At each value, either extend the current subarray or start fresh.",
      hint3: "Keep a separate best value so arrays containing only negatives work."
    },
    step5: {
      title: "Step 5: Optimized Solution",
      explanation: "Track the best sum ending at the current position and the best sum seen anywhere. Start fresh when the current value is better than extending the prior sum.",
      code: "public class Solution {\n    public int maxSubArray(int[] nums) {\n        int current = nums[0];\n        int best = nums[0];\n        for (int i = 1; i < nums.length; i++) {\n            current = Math.max(nums[i], current + nums[i]);\n            best = Math.max(best, current);\n        }\n        return best;\n    }\n}",
      dryRun: ["At 4, start a new run with sum 4.", "Extend through -1, 2, 1 to reach sum 6.", "Keep best=6; later values do not improve it."],
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      betterWhy: "One pass considers the best subarray ending at each position, avoiding all repeated subarray scans."
    },
    step7: {
      title: "Step 7: Interview Mode Q&A",
      questions: [{ q: "Why initialize current and best from nums[0]?", a: "It handles arrays containing only negative values and avoids incorrectly returning zero." }]
    },
    step8: {
      title: "Step 8: Learning Summary",
      difficulty: "Medium",
      concepts: ["Dynamic Programming", "Running State", "Contiguous Subarrays"],
      mistakes: "Initializing the answer to zero, which fails when all values are negative.",
      techniques: ["Reset a negative running sum by starting a new subarray"],
      pattern: "Kadane's Algorithm"
    }
  },
  "offline unavailable": {
    topic: "Offline Demo - Limited Topics",
    difficulty: "Easy",
    isDebug: false,
    step1: {
      title: "Offline Demo Availability",
      problem: "This prompt is not included in the offline demo. Offline mode provides a limited set of prepared learning lessons.",
      input: "Try: Two Sum, Binary Search, Recursion, Sliding Window, Prefix Sum, Two Pointers, Kadane's Algorithm, Valid Parentheses, or a Java debugging question.",
      output: "This topic will be available soon in the offline demo. Connect an API key for an AI-generated answer.",
      constraints: ["Offline demo responses are prebuilt", "Live AI requires a valid API key with available quota"]
    },
    step8: {
      title: "Next Step",
      difficulty: "Easy",
      concepts: ["Offline Demo Mode"],
      mistakes: "Expecting an AI-generated answer while offline demo mode is selected.",
      techniques: ["Choose a supported lesson", "Connect a provider API key for live responses"],
      pattern: "Limited Offline Access"
    }
  },
  "debugging": {
    topic: "Debugging - Java Code Repair",
    difficulty: "Medium",
    isDebug: true,
    step6: {
      title: "Step 6: Debugging & Repairs",
      errors: [
        {
          type: "Index / Boundary Out of Bounds",
          problem: "Loop condition accessed index outside array length or unhandled empty condition.",
          reason: "Using <= array.length causes ArrayIndexOutOfBoundsException on the final iteration.",
          fix: "Change loop bound to < array.length, or use an enhanced for-loop."
        }
      ],
      correctedCode: "public class Solution {\n    // Repaired Java code with boundary protection\n    public static void main(String[] args) {\n        int[] numbers = { 1, 2, 3, 4, 5 };\n        for (int i = 0; i < numbers.length; i++) {\n            System.out.println(\"Element at \" + i + \": \" + numbers[i]);\n        }\n    }\n}"
    },
    step8: {
      title: "Step 8: Learning Summary",
      difficulty: "Medium",
      concepts: ["Array Boundary Conditions", "Defensive Programming", "Exception Handling"],
      mistakes: "Confusing index bounds (0 to n - 1) with length (n).",
      techniques: ["Pre-check array bounds", "Enhanced foreach loops"],
      pattern: "Defensive Programming"
    }
  }
};

function getOfflineDataset(promptText = "") {
  const lower = promptText.toLowerCase().replace(/[’]/g, "'");

  if (lower.includes("debug") || lower.includes("fix") || lower.includes("error") || (lower.includes("{") && lower.includes("}"))) {
    return JSON.parse(JSON.stringify(MOCK_DATASETS["debugging"]));
  }
  if (lower.includes("binary") || lower.includes("search")) {
    return JSON.parse(JSON.stringify(MOCK_DATASETS["binary search"]));
  }
  if (lower.includes("recursion") || lower.includes("recursive") || lower.includes("factorial")) {
    return JSON.parse(JSON.stringify(MOCK_DATASETS["recursion"]));
  }
  if (lower.includes("sliding window") || lower.includes("window") || (lower.includes("maximum sum subarray") && (lower.includes("size") || lower.includes(" k")))) {
    return JSON.parse(JSON.stringify(MOCK_DATASETS["sliding window"]));
  }
  if (lower.includes("prefix sum") || lower.includes("prefix-sum") || lower.includes("range sum") || lower.includes("subarray sum")) {
    return JSON.parse(JSON.stringify(MOCK_DATASETS["prefix sum"]));
  }
  if (lower.includes("kadane") || lower.includes("maximum subarray") || lower.includes("max subarray")) {
    return JSON.parse(JSON.stringify(MOCK_DATASETS["kadane algorithm"]));
  }
  if (lower.includes("two pointer") || lower.includes("two-pointer") || lower.includes("pair sum") || lower.includes("pair with target")) {
    return JSON.parse(JSON.stringify(MOCK_DATASETS["two pointers"]));
  }
  if (lower.includes("parenthes") || lower.includes("bracket") || lower.includes("stack")) {
    return JSON.parse(JSON.stringify(MOCK_DATASETS["valid parentheses"]));
  }
  
  if (lower.includes("two sum")) {
    return JSON.parse(JSON.stringify(MOCK_DATASETS["two sum"]));
  }
  return JSON.parse(JSON.stringify(MOCK_DATASETS["offline unavailable"]));
}

function ChatArea({ initialPrompt = "", onBackToLanding = () => {}, selectedModel = "gpt-4o-mini", selectedProvider = "openai", apiKey = "", onOpenSettings }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [model, setModel] = useState(selectedModel);
  const [copiedId, setCopiedId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTopic, setCurrentTopic] = useState("AI Workspace");

  // Interactive Optimization States
  const [optimizationOption, setOptimizationOption] = useState(null);
  const [revealedHintsCount, setRevealedHintsCount] = useState(0);
  const [isOptimizedUnlocked, setIsOptimizedUnlocked] = useState(false);
  const [openInterviewIndex, setOpenInterviewIndex] = useState(null);

  const textareaRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const processedInitialPromptRef = useRef("");

  useEffect(() => {
    if (selectedModel) {
      setModel(selectedModel);
    }
  }, [selectedModel]);

  useEffect(() => {
    if (initialPrompt && processedInitialPromptRef.current !== initialPrompt) {
      processedInitialPromptRef.current = initialPrompt;
      handleNewUserPrompt(initialPrompt);
    }
    if (!initialPrompt) processedInitialPromptRef.current = "";
  }, [initialPrompt]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading, optimizationOption, revealedHintsCount, isOptimizedUnlocked]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [inputValue]);

  const handleNewUserPrompt = async (promptText) => {
    const userMsg = { id: `msg-user-${Date.now()}`, type: "user", content: promptText };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // Reset interactive states for the new turn
    setOptimizationOption(null);
    setRevealedHintsCount(0);
    setIsOptimizedUnlocked(false);
    setOpenInterviewIndex(null);

    // Intentional Offline Demo Mode (only when explicitly selected by the user)
    if (model === "offline-demo") {
      const offlineData = getOfflineDataset(promptText);
      offlineData.id = `msg-ai-${Date.now()}`;
      offlineData.type = "ai";
      offlineData.isOfflineDemo = true;
      setCurrentTopic(offlineData.topic);
      setMessages((prev) => [...prev, offlineData]);
      setIsLoading(false);
      return;
    }

    try {
      // Connect to the Spring Boot REST endpoint
      // The optional provider key is sent only to the local backend.
      const requestBody = {
        prompt: promptText,
        ...(apiKey.trim() ? { apiKey: apiKey.trim() } : {}),
        model: model !== "offline-demo" ? model : "gpt-4o-mini",
        provider: selectedProvider
      };

      const response = await fetch("http://localhost:8080/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const responseText = await response.text();
      let responseBody = null;
      try {
        responseBody = responseText ? JSON.parse(responseText) : null;
      } catch {
        // Retain a short plain-text diagnostic for proxy/server error pages.
      }

      if (!response.ok) {
        const bodyMessage = responseBody?.message || (responseText && responseText.slice(0, 500).trim());
        const message = bodyMessage || `Server returned HTTP ${response.status} (${response.statusText})`;
        const error = new Error(message);
        error.status = response.status;
        error.upstreamStatus = responseBody?.upstreamStatus ? Number(responseBody.upstreamStatus) : null;
        throw error;
      }

      if (!responseBody || typeof responseBody !== "object" || Array.isArray(responseBody)) {
        const error = new Error("The backend returned a successful response that was not valid JSON.");
        error.status = response.status;
        error.kind = "invalid-response";
        throw error;
      }

      const requiredSteps = responseBody.isDebug
        ? [responseBody.step6, responseBody.step8]
        : [responseBody.step1, responseBody.step2, responseBody.step3, responseBody.step5, responseBody.step7, responseBody.step8];
      const hasExpectedFlow = requiredSteps.every((step) => step && typeof step === "object" && !Array.isArray(step));
      if (typeof responseBody.topic !== "string" || !responseBody.topic.trim() || !hasExpectedFlow) {
        const error = new Error("The AI response is missing the expected coding tutor fields.");
        error.status = response.status;
        error.kind = "invalid-response";
        throw error;
      }

      const data = responseBody;
      data.id = `msg-ai-${Date.now()}`;
      data.type = "ai";

      if (data.topic) {
        setCurrentTopic(data.topic);
      }

      setMessages((prev) => [...prev, data]);
    } catch (err) {
      console.error("AI service request failed:", err);

      const errorText = (err.message || "").toLowerCase();
      const isQuotaError = err.status === 429 || /quota|rate limit/.test(errorText);
      const isAuthError = /api key.*(invalid|revoked)|cannot access|unauthorized/.test(errorText);
      const isMissingKey = /key.*missing|missing.*key/.test(errorText);
      const isModelError = /model.*(unavailable|not available|supports chat)|selected model/.test(errorText);
      const isTimeout = err.status === 504 || /timed out|timeout/.test(errorText);
      const isInvalidResponse = err.kind === "invalid-response" || /invalid response|response data|tutor fields/.test(errorText);

      const errorMsg = {
        id: `msg-error-${Date.now()}`,
        type: "error",
        status: err.status ?? null,
        upstreamStatus: err.upstreamStatus ?? null,
        title: isQuotaError
          ? `AI Provider Rate Limit or Quota (HTTP ${err.status || 429})`
          : isAuthError
          ? `${selectedProvider === "nvidia" ? "NVIDIA" : "OpenAI"} API Key Rejected (HTTP ${err.status || "502"})`
          : isMissingKey
          ? `${selectedProvider === "nvidia" ? "NVIDIA" : "OpenAI"} API Key Missing (HTTP ${err.status || "503"})`
          : isModelError
          ? `AI Model Configuration Error (HTTP ${err.status ?? "unknown"})`
          : isTimeout
          ? `AI Provider Timeout (HTTP ${err.status || 504})`
          : isInvalidResponse
          ? `Invalid AI Response (HTTP ${err.status ?? "unknown"})`
          : `AI Service Error (${err.status ?? "Connection Error"})`,
        message: err.message || "Failed to communicate with the backend AI service.",
        failedPrompt: promptText,
      };

      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    handleNewUserPrompt(inputValue.trim());
    setInputValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleCopyCode = (codeText, blockId) => {
    navigator.clipboard.writeText(codeText);
    setCopiedId(blockId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadCode = (codeText, fileName = "Solution.java") => {
    const element = document.createElement("a");
    const file = new Blob([codeText], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleAttachCode = () => {
    setInputValue((prev) => {
      const prefix = prev ? `${prev}\n` : "";
      return `${prefix}// Paste code here\npublic class Solution {\n    \n}`;
    });
    if (textareaRef.current) textareaRef.current.focus();
  };

  return (
    <div className="chat-area">
      {/* 1. Header Area */}
      <header className="chat-area__header">
        <div className="chat-area__header-info">
          <button onClick={onBackToLanding} className="header-logo-btn" title="Back to main page">
            <span className="logo-icon-small">&lt;&gt;</span>
            <span className="logo-text-small">CodeMentor AI</span>
          </button>
          <span className="divider">/</span>
          <span className="chat-area__current-title">{currentTopic}</span>
        </div>

        <div className="chat-area__model-selector">
          <span className="model-label">Model:</span>
          <select value={model} onChange={(e) => setModel(e.target.value)} className="model-select">
            {selectedProvider === "nvidia" ? (
              <>
                <option value="openai/gpt-oss-20b">GPT OSS 20B (NVIDIA NIM)</option>
                <option value="qwen/qwen3-next-80b-a3b-instruct">Qwen3 Next 80B (NVIDIA NIM)</option>
              </>
            ) : (
              <>
                <option value="gpt-4o-mini">GPT-4o Mini (OpenAI)</option>
                <option value="gpt-4o">GPT-4o (High Intelligence)</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              </>
            )}
            <option value="offline-demo">Offline Demo Mode (Local Knowledge Base)</option>
          </select>
        </div>
      </header>

      {/* 2. Scrollable Message Panel */}
      <div className="chat-area__scroll-container" ref={scrollContainerRef}>
        <div className="chat-area__messages-list">
          {messages.length === 0 && !isLoading ? (
            <div style={{ textAlign: "center", color: "var(--text-faint)", marginTop: "25vh" }}>
              <FiCpu style={{ fontSize: "2.5rem", marginBottom: "16px" }} />
              <p>Type or paste your question to begin the learning session.</p>
            </div>
          ) : (
            messages.map((msg) => {
              if (msg.type === "user") {
                return (
                  <div key={msg.id} className="message-wrapper message-wrapper--user">
                    <div className="message message--user">
                      {msg.content.split("\n").map((line, idx) => (
                        <p key={idx} className="user-message-line">{line}</p>
                      ))}
                    </div>
                  </div>
                );
              }

              if (msg.type === "error") {
                return (
                  <div key={msg.id} className="message-wrapper message-wrapper--error">
                    <div className="message message--error">
                      <div className="api-error-card">
                        <div className="api-error-card__header">
                          <FiAlertTriangle className="api-error-card__icon" />
                          <h4 className="api-error-card__title">{msg.title || "AI Service Error"}</h4>
                        </div>
                        <p className="api-error-card__message">{msg.message}</p>
                        {msg.upstreamStatus && (
                          <p className="api-error-card__hint">Provider HTTP status: {msg.upstreamStatus}</p>
                        )}
                        <div className="api-error-card__actions">
                          {msg.failedPrompt && (
                            <button
                              type="button"
                              className="api-error-card__retry-btn"
                              onClick={() => handleNewUserPrompt(msg.failedPrompt)}
                              title="Retry prompt"
                            >
                              <FiRefreshCw /> Retry Request
                            </button>
                          )}
                          <span className="api-error-card__hint">
                            {msg.message?.toLowerCase().includes("quota") || msg.message?.toLowerCase().includes("rate limit")
                              ? `Check the ${selectedProvider === "nvidia" ? "NVIDIA NIM" : "OpenAI"} account quota and rate limits.`
                              : msg.message?.toLowerCase().includes("invalid") || msg.message?.toLowerCase().includes("revoked")
                              ? `Check that the ${selectedProvider === "nvidia" ? "NVIDIA" : "OpenAI"} API key is valid and can access the selected model.`
                              : msg.message?.toLowerCase().includes("missing")
                              ? `Enter a ${selectedProvider === "nvidia" ? "NVIDIA" : "OpenAI"} API key in Settings or configure the backend key.`
                              : "Check backend application console logs for details."}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              // AI responses follow the 8-step learning flow
              return (
                <div key={msg.id} className="message-wrapper message-wrapper--ai">
                  <div className="message message--ai">

                    {/* Explicit Offline Demo Notice Banner */}
                    {msg.isOfflineDemo && (
                      <div className="offline-notice-banner">
                        <div className="offline-notice-header">
                          <FiCpu className="offline-notice-icon" />
                          <span className="offline-notice-title">Offline Demo Mode</span>
                        </div>
                        <p className="offline-notice-desc">
                          Running in intentional offline demo mode using local curated algorithmic content. Switch to a live model in the header selector above for live AI responses.
                        </p>
                      </div>
                    )}

                    {/* General text fallback if returned */}
                    {msg.content && !msg.step1 && !msg.step6 && (
                      <section className="learning-step card-surface">
                        <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{msg.content}</p>
                      </section>
                    )}
                    
                    {/* Step 1: Problem Understanding */}
                    {msg.step1 && (
                      <section className="learning-step step-understanding">
                        <h4 className="step-title">{msg.step1.title}</h4>
                        <p className="problem-text">{msg.step1.problem}</p>
                        
                        <div className="example-box">
                          <div className="example-item">
                            <span className="example-label">Expected Input:</span>
                            <code>{msg.step1.input}</code>
                          </div>
                          <div className="example-item">
                            <span className="example-label">Expected Output:</span>
                            <code>{msg.step1.output}</code>
                          </div>
                        </div>

                        {msg.step1.constraints && msg.step1.constraints.length > 0 && (
                          <div className="constraints-box">
                            <span className="constraints-label">Constraints:</span>
                            <ul className="constraints-list">
                              {msg.step1.constraints.map((c, i) => (
                                <li key={i}>{c}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </section>
                    )}

                    {/* Step 2: Brute Force Solution */}
                    {msg.step2 && (
                      <section className="learning-step step-bruteforce card-surface">
                        <h4 className="step-title">{msg.step2.title}</h4>
                        <p className="step-desc"><strong>Idea:</strong> {msg.step2.idea}</p>

                        {msg.step2.code && (
                          <div className="code-block-wrapper">
                            <div className="code-block-header">
                              <span className="code-lang">Java (Brute Force)</span>
                              <div className="code-actions">
                                <button
                                  type="button"
                                  className="code-action-btn"
                                  onClick={() => handleCopyCode(msg.step2.code, "brute")}
                                  title="Copy code"
                                >
                                  {copiedId === "brute" ? <FiCheck className="text-green" /> : <FiCopy />}
                                  <span>{copiedId === "brute" ? "Copied" : "Copy"}</span>
                                </button>
                                <button
                                  type="button"
                                  className="code-action-btn"
                                  onClick={() => handleDownloadCode(msg.step2.code, "BruteSolution.java")}
                                  title="Download Java"
                                >
                                  <FiDownload />
                                </button>
                              </div>
                            </div>
                            <pre className="code-pre">
                              <code>{msg.step2.code}</code>
                            </pre>
                          </div>
                        )}

                        {msg.step2.dryRun && msg.step2.dryRun.length > 0 && (
                          <div className="dry-run-box">
                            <span className="section-label">Dry Run Walkthrough:</span>
                            <ol className="dry-run-list">
                              {msg.step2.dryRun.map((step, i) => (
                                <li key={i}>{step}</li>
                              ))}
                            </ol>
                          </div>
                        )}

                        <div className="complexities">
                          <div className="complexity-badge time">
                            <span>Time:</span> <strong>{msg.step2.timeComplexity}</strong>
                          </div>
                          <div className="complexity-badge space">
                            <span>Space:</span> <strong>{msg.step2.spaceComplexity}</strong>
                          </div>
                        </div>
                      </section>
                    )}

                    {/* Step 3: Think Before Optimization */}
                    {msg.step3 && (
                      <section className="learning-step step-think card-surface card-surface--glow">
                        <div className="step-think__header">
                          <FiCpu className="step-think__icon" />
                          <h4 className="step-think__title">Think Before Optimization</h4>
                        </div>
                        <p className="step-think__question">{msg.step3.question}</p>

                        <div className="step-think__buttons">
                          <button
                            type="button"
                            className={`think-btn ${optimizationOption === "try" ? "think-btn--active" : ""}`}
                            onClick={() => setOptimizationOption("try")}
                          >
                            I Want to Try
                          </button>
                          <button
                            type="button"
                            className={`think-btn ${optimizationOption === "hint" ? "think-btn--active" : ""}`}
                            onClick={() => {
                              setOptimizationOption("hint");
                              setRevealedHintsCount((c) => Math.min(3, c === 0 ? 1 : c));
                            }}
                          >
                            Show Hint
                          </button>
                          <button
                            type="button"
                            className={`think-btn think-btn--primary ${isOptimizedUnlocked ? "think-btn--active" : ""}`}
                            onClick={() => {
                              setIsOptimizedUnlocked(true);
                              setOptimizationOption("reveal");
                            }}
                          >
                            Reveal Optimized Solution
                          </button>
                        </div>

                        {/* Option 1: User Input */}
                        {optimizationOption === "try" && (
                          <div className="think-panel-expand try-panel">
                            <p className="try-panel__text">
                              How would you solve this optimally? Type your suggestion:
                            </p>
                            <div className="try-panel__input-group">
                              <input
                                type="text"
                                placeholder="Type your idea..."
                                className="try-panel__input"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    setIsOptimizedUnlocked(true);
                                  }
                                }}
                              />
                              <button
                                type="button"
                                className="try-panel__submit"
                                onClick={() => setIsOptimizedUnlocked(true)}
                              >
                                Check
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Option 2: Hint System */}
                        {optimizationOption === "hint" && (
                          <div className="think-panel-expand hint-panel">
                            <div className="hints-list">
                              {revealedHintsCount >= 1 && (
                                <div className="hint-item animate-hint">
                                  <span className="hint-badge">Hint 1</span>
                                  <p>{msg.step3.hint1}</p>
                                </div>
                              )}
                              {revealedHintsCount >= 2 && (
                                <div className="hint-item animate-hint">
                                  <span className="hint-badge">Hint 2</span>
                                  <p>{msg.step3.hint2}</p>
                                </div>
                              )}
                              {revealedHintsCount >= 3 && (
                                <div className="hint-item animate-hint">
                                  <span className="hint-badge">Hint 3</span>
                                  <p>{msg.step3.hint3}</p>
                                </div>
                              )}
                            </div>

                            <div className="hint-panel__actions">
                              {revealedHintsCount < 3 ? (
                                <button
                                  type="button"
                                  className="hint-action-btn"
                                  onClick={() => setRevealedHintsCount((c) => c + 1)}
                                >
                                  Next Hint
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="hint-action-btn hint-action-btn--primary"
                                  onClick={() => setIsOptimizedUnlocked(true)}
                                >
                                  Reveal Optimized Solution
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </section>
                    )}

                    {/* Step 5: Optimized Solution */}
                    {msg.step5 && isOptimizedUnlocked && (
                      <section className="learning-step step-optimized card-surface animate-fade-in">
                        <h4 className="step-title">{msg.step5.title}</h4>
                        <p className="step-desc">{msg.step5.explanation}</p>

                        {msg.step5.code && (
                          <div className="code-block-wrapper">
                            <div className="code-block-header">
                              <span className="code-lang">Java (Optimized)</span>
                              <div className="code-actions">
                                <button
                                  type="button"
                                  className="code-action-btn"
                                  onClick={() => handleCopyCode(msg.step5.code, "opt")}
                                  title="Copy code"
                                >
                                  {copiedId === "opt" ? <FiCheck className="text-green" /> : <FiCopy />}
                                  <span>{copiedId === "opt" ? "Copied" : "Copy"}</span>
                                </button>
                                <button
                                  type="button"
                                  className="code-action-btn"
                                  onClick={() => handleDownloadCode(msg.step5.code, "OptimizedSolution.java")}
                                  title="Download Java"
                                >
                                  <FiDownload />
                                </button>
                              </div>
                            </div>
                            <pre className="code-pre">
                              <code>{msg.step5.code}</code>
                            </pre>
                          </div>
                        )}

                        {msg.step5.dryRun && msg.step5.dryRun.length > 0 && (
                          <div className="dry-run-box">
                            <span className="section-label">Optimized Dry Run:</span>
                            <ol className="dry-run-list">
                              {msg.step5.dryRun.map((step, i) => (
                                <li key={i}>{step}</li>
                              ))}
                            </ol>
                          </div>
                        )}

                        <div className="complexities">
                          <div className="complexity-badge time">
                            <span>Time:</span> <strong>{msg.step5.timeComplexity}</strong>
                          </div>
                          <div className="complexity-badge space">
                            <span>Space:</span> <strong>{msg.step5.spaceComplexity}</strong>
                          </div>
                        </div>

                        <div className="why-better-box">
                          <span className="section-label">Why this approach is better:</span>
                          <p>{msg.step5.betterWhy}</p>
                        </div>
                      </section>
                    )}

                    {/* Step 6: Debugging details */}
                    {msg.isDebug && msg.step6 && (
                      <section className="learning-step step-debugging">
                        <h4 className="step-title">{msg.step6.title}</h4>
                        <p className="step-desc">
                          Bug analysis report for your Java submission:
                        </p>

                        <div className="errors-grid">
                          {msg.step6.errors && msg.step6.errors.map((err, idx) => (
                            <div key={idx} className="error-card">
                              <div className="error-card__header">
                                <FiAlertTriangle className="error-card__alert-icon" />
                                <span className="error-card__type">{err.type}</span>
                              </div>
                              <div className="error-card__body">
                                <p><strong>Problem:</strong> {err.problem}</p>
                                <p><strong>Reason:</strong> {err.reason}</p>
                                <p className="error-card__fix"><strong>Fix:</strong> {err.fix}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {msg.step6.correctedCode && (
                          <div className="code-block-wrapper">
                            <div className="code-block-header">
                              <span className="code-lang">Repaired Java Code</span>
                              <div className="code-actions">
                                <button
                                  type="button"
                                  className="code-action-btn"
                                  onClick={() => handleCopyCode(msg.step6.correctedCode, "debug")}
                                  title="Copy code"
                                >
                                  {copiedId === "debug" ? <FiCheck className="text-green" /> : <FiCopy />}
                                  <span>{copiedId === "debug" ? "Copied" : "Copy"}</span>
                                </button>
                                <button
                                  type="button"
                                  className="code-action-btn"
                                  onClick={() => handleDownloadCode(msg.step6.correctedCode, "SolutionFixed.java")}
                                  title="Download Java"
                                >
                                  <FiDownload />
                                </button>
                              </div>
                            </div>
                            <pre className="code-pre">
                              <code>{msg.step6.correctedCode}</code>
                            </pre>
                          </div>
                        )}
                      </section>
                    )}

                    {/* Step 7: Interview Qs */}
                    {msg.step7 && (msg.step7.questions && msg.step7.questions.length > 0) && (isOptimizedUnlocked || msg.isDebug) && (
                      <section className="learning-step step-interview card-surface">
                        <div className="step-interview__header">
                          <FiHelpCircle className="step-interview__icon" />
                          <h4 className="step-title">{msg.step7.title}</h4>
                        </div>
                        <p className="step-desc">Possible interviewer follow-ups:</p>

                        <div className="qa-accordion">
                          {msg.step7.questions.map((item, idx) => {
                            const isOpen = openInterviewIndex === idx;
                            return (
                              <div key={idx} className={`qa-item ${isOpen ? "qa-item--open" : ""}`}>
                                <button
                                  type="button"
                                  className="qa-question-btn"
                                  onClick={() => setOpenInterviewIndex(isOpen ? null : idx)}
                                >
                                  <span>{item.q}</span>
                                  {isOpen ? <FiChevronDown /> : <FiChevronRight />}
                                </button>
                                {isOpen && (
                                  <div className="qa-answer-content">
                                    <p>{item.a}</p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    )}

                    {/* Step 8: Learning Summary */}
                    {msg.step8 && (
                      <section className="learning-step step-summary card-surface card-surface--glow">
                        <div className="step-summary__header">
                          <FiAward className="step-summary__icon" />
                          <h4 className="step-title">{msg.step8.title}</h4>
                        </div>

                        <div className="summary-details">
                          {msg.step8.concepts && msg.step8.concepts.length > 0 && (
                            <div className="summary-group">
                              <span className="summary-label">Key Concepts:</span>
                              <div className="summary-badges-container">
                                {msg.step8.concepts.map((c, i) => (
                                  <span key={i} className="summary-badge-item">{c}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          {msg.step8.techniques && msg.step8.techniques.length > 0 && (
                            <div className="summary-group">
                              <span className="summary-label">Optimization Techniques:</span>
                              <p className="summary-text">{msg.step8.techniques.join(", ")}</p>
                            </div>
                          )}

                          {msg.step8.mistakes && (
                            <div className="summary-group">
                              <span className="summary-label">Common Mistakes:</span>
                              <p className="summary-text text-orange">{msg.step8.mistakes}</p>
                            </div>
                          )}

                          <div className="summary-row-double">
                            <div>
                              <span className="summary-label">Pattern:</span>
                              <span className="text-primary font-mono">{msg.step8.pattern || "N/A"}</span>
                            </div>
                            <div>
                              <span className="summary-label">Difficulty:</span>
                              <span className={`difficulty-badge difficulty-badge--${(msg.step8.difficulty || "easy").toLowerCase()}`}>
                                {msg.step8.difficulty || "Easy"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </section>
                    )}

                    {/* Action footer */}
                    <div className="ai-message-footer">
                      <button
                        type="button"
                        className="regenerate-btn"
                        onClick={() => {
                          const lastUser = [...messages].reverse().find(m => m.type === "user");
                          if (lastUser && lastUser.content) {
                            handleNewUserPrompt(lastUser.content);
                          }
                        }}
                        title="Regenerate AI Response"
                      >
                        <FiRefreshCw />
                        <span>Regenerate Response</span>
                      </button>
                    </div>

                  </div>
                </div>
              );
            })
          )}

          {/* SKELETON TYPING LOADER */}
          {isLoading && (
            <div className="message-wrapper message-wrapper--ai">
              <div className="message message--ai">
                <section className="learning-step card-surface skeleton-pulse">
                  <div className="skeleton-title"></div>
                  <div className="skeleton-text"></div>
                  <div className="skeleton-text"></div>
                  <div className="skeleton-text short"></div>
                  <div className="typing-loader">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                </section>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 3. Input Text Box */}
      <footer className="chat-area__footer">
        <form className="chat-area__form" onSubmit={handleSubmit}>
          <div className="chat-area__input-wrapper">
            <textarea
              ref={textareaRef}
              rows={1}
              className="chat-area__textarea"
              placeholder="Ask any Java, DSA, Debugging, or Interview question..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            <div className="chat-area__input-actions">
              <div className="chat-area__input-actions-left">
                <button
                  type="button"
                  className="input-action-btn"
                  onClick={handleAttachCode}
                  title="Attach Java Code"
                  disabled={isLoading}
                >
                  <FiPaperclip />
                  <span className="input-action-btn__text">Attach Code</span>
                </button>
                <button
                  type="button"
                  className="input-action-btn"
                  title="Voice Input (Optional)"
                  onClick={() => alert("Voice input module is not configured.")}
                  disabled={isLoading}
                >
                  <FiMic />
                </button>
              </div>
              <button
                type="submit"
                className={`chat-area__submit-btn ${inputValue.trim() && !isLoading ? "chat-area__submit-btn--active" : ""}`}
                disabled={!inputValue.trim() || isLoading}
              >
                <FiSend />
              </button>
            </div>
          </div>
        </form>
      </footer>
    </div>
  );
}

export default ChatArea;
