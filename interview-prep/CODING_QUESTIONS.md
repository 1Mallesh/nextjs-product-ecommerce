# Coding Questions — Arrays · Strings · Trees · JS Logical

---

## Arrays

**Two Sum:**
```javascript
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) return [map.get(complement), i];
    map.set(nums[i], i);
  }
  return [];
}
// O(n) time, O(n) space
```

**Maximum Subarray (Kadane's):**
```javascript
function maxSubArray(nums) {
  let maxSum = nums[0], curr = nums[0];
  for (let i = 1; i < nums.length; i++) {
    curr = Math.max(nums[i], curr + nums[i]);
    maxSum = Math.max(maxSum, curr);
  }
  return maxSum;
}
```

**Rotate Array by K:**
```javascript
function rotate(nums, k) {
  k = k % nums.length;
  nums.reverse();
  reverse(nums, 0, k - 1);
  reverse(nums, k, nums.length - 1);
  function reverse(arr, l, r) {
    while (l < r) { [arr[l], arr[r]] = [arr[r], arr[l]]; l++; r--; }
  }
}
```

**Find Missing Number (XOR trick):**
```javascript
function missingNumber(nums) {
  let xor = nums.length;
  for (let i = 0; i < nums.length; i++) xor ^= i ^ nums[i];
  return xor;
}
```

---

## Strings

**Valid Palindrome:**
```javascript
function isPalindrome(s) {
  s = s.toLowerCase().replace(/[^a-z0-9]/g, "");
  let l = 0, r = s.length - 1;
  while (l < r) {
    if (s[l] !== s[r]) return false;
    l++; r--;
  }
  return true;
}
```

**Longest Substring Without Repeating:**
```javascript
function lengthOfLongestSubstring(s) {
  const map = new Map();
  let max = 0, left = 0;
  for (let right = 0; right < s.length; right++) {
    if (map.has(s[right])) left = Math.max(left, map.get(s[right]) + 1);
    map.set(s[right], right);
    max = Math.max(max, right - left + 1);
  }
  return max;
}
```

**Anagram Check:**
```javascript
function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  const count = {};
  for (const c of s) count[c] = (count[c] ?? 0) + 1;
  for (const c of t) {
    if (!count[c]) return false;
    count[c]--;
  }
  return true;
}
```

---

## Sorting

**QuickSort:**
```javascript
function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low >= high) return;
  const pi = partition(arr, low, high);
  quickSort(arr, low, pi - 1);
  quickSort(arr, pi + 1, high);
}
function partition(arr, low, high) {
  const pivot = arr[high];
  let i = low - 1;
  for (let j = low; j < high; j++) {
    if (arr[j] <= pivot) { i++; [arr[i], arr[j]] = [arr[j], arr[i]]; }
  }
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
}
// Average O(n log n), worst O(n²)
```

---

## Trees

**Binary Tree Level Order Traversal (BFS):**
```javascript
function levelOrder(root) {
  if (!root) return [];
  const queue = [root], result = [];
  while (queue.length) {
    const levelSize = queue.length;
    const level = [];
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(level);
  }
  return result;
}
```

**Validate BST:**
```javascript
function isValidBST(root, min = -Infinity, max = Infinity) {
  if (!root) return true;
  if (root.val <= min || root.val >= max) return false;
  return isValidBST(root.left, min, root.val) &&
         isValidBST(root.right, root.val, max);
}
```

---

## Linked Lists

**Reverse Linked List:**
```javascript
function reverseList(head) {
  let prev = null, curr = head;
  while (curr) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev;
}
```

**Detect Cycle (Floyd's):**
```javascript
function hasCycle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}
```

---

## JavaScript Logical Questions

**Event delegation:**
```javascript
// Instead of attaching listener to 1000 items:
document.getElementById("order-list").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-order-id]");
  if (btn) handleOrderClick(btn.dataset.orderId);
});
```

**Flatten object:**
```javascript
function flattenObject(obj, prefix = "") {
  return Object.entries(obj).reduce((acc, [key, val]) => {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof val === "object" && val !== null && !Array.isArray(val)) {
      Object.assign(acc, flattenObject(val, newKey));
    } else {
      acc[newKey] = val;
    }
    return acc;
  }, {});
}
// { a: { b: { c: 1 } } } → { "a.b.c": 1 }
```

**Promise.all implementation:**
```javascript
function myPromiseAll(promises) {
  return new Promise((resolve, reject) => {
    const results = [];
    let remaining = promises.length;
    if (remaining === 0) return resolve([]);
    promises.forEach((p, i) => {
      Promise.resolve(p).then(val => {
        results[i] = val;
        if (--remaining === 0) resolve(results);
      }).catch(reject);
    });
  });
}
```

**Implement EventEmitter:**
```javascript
class EventEmitter {
  #events = {};
  on(event, fn) { (this.#events[event] ??= []).push(fn); return this; }
  off(event, fn) { this.#events[event] = (this.#events[event] ?? []).filter(f => f !== fn); return this; }
  emit(event, ...args) { (this.#events[event] ?? []).forEach(fn => fn(...args)); return this; }
  once(event, fn) {
    const wrapper = (...args) => { fn(...args); this.off(event, wrapper); };
    return this.on(event, wrapper);
  }
}
```

**LRU Cache:**
```javascript
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map(); // Map maintains insertion order
  }
  get(key) {
    if (!this.cache.has(key)) return -1;
    const val = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, val); // move to end (most recently used)
    return val;
  }
  put(key, value) {
    this.cache.delete(key);
    if (this.cache.size >= this.capacity) {
      this.cache.delete(this.cache.keys().next().value); // remove oldest
    }
    this.cache.set(key, value);
  }
}
```

**Deep equality check:**
```javascript
function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== "object" || typeof b !== "object") return false;
  if (a === null || b === null) return false;
  const keysA = Object.keys(a), keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every(k => deepEqual(a[k], b[k]));
}
```

---

## Big O Complexity Reference

| Algorithm | Time | Space |
|---|---|---|
| Binary Search | O(log n) | O(1) |
| QuickSort avg | O(n log n) | O(log n) |
| MergeSort | O(n log n) | O(n) |
| HashMap get/set | O(1) avg | O(n) |
| BFS/DFS | O(V + E) | O(V) |
| Two Pointer | O(n) | O(1) |
| Sliding Window | O(n) | O(k) |
