# JavaScript Interview Questions — Beginner to Advanced

---

## 1. Closures

**Q: What is a closure? Give a real-world example.**

A closure is a function that retains access to its outer scope even after the outer function has returned.

```javascript
function makeCounter(start = 0) {
  let count = start;
  return {
    increment: () => ++count,
    decrement: () => --count,
    value: () => count,
  };
}
const counter = makeCounter(10);
counter.increment(); // 11
counter.increment(); // 12
counter.value();     // 12
```

**Why it matters**: Used for data encapsulation, memoization, event handlers, React's useState hook internals.

---

## 2. Event Loop

**Q: Explain the JavaScript event loop.**

JS is single-threaded. The event loop coordinates:
- **Call Stack** — currently executing synchronous code
- **Microtask Queue** — Promise callbacks, queueMicrotask (higher priority)
- **Macrotask Queue** — setTimeout, setInterval, I/O callbacks

Order: Call Stack → Microtasks (drain all) → One Macrotask → Microtasks again → repeat

```javascript
console.log("1");                        // sync
setTimeout(() => console.log("2"), 0);  // macrotask
Promise.resolve().then(() => console.log("3")); // microtask
console.log("4");                        // sync
// Output: 1, 4, 3, 2
```

---

## 3. Promises & Async/Await

**Q: What is Promise chaining vs async/await?**

```javascript
// Promise chain
fetch('/api/user')
  .then(res => res.json())
  .then(user => fetch(`/api/orders/${user.id}`))
  .then(res => res.json())
  .catch(err => console.error(err));

// async/await — same thing, cleaner
async function getOrders() {
  try {
    const res = await fetch('/api/user');
    const user = await res.json();
    const ordRes = await fetch(`/api/orders/${user.id}`);
    return ordRes.json();
  } catch (err) {
    console.error(err);
  }
}
```

**Q: Run promises in parallel:**
```javascript
const [user, orders, products] = await Promise.all([
  fetchUser(),
  fetchOrders(),
  fetchProducts(),
]);
```

**Q: Promise.allSettled vs Promise.all:**
- `Promise.all` — rejects immediately if any promise rejects
- `Promise.allSettled` — waits for all, returns array of `{status, value/reason}`

---

## 4. Hoisting

**Q: What is hoisting?**

JavaScript moves declarations (not initializations) to the top of their scope before execution.

```javascript
console.log(x); // undefined (var hoisted, not initialized)
var x = 5;

console.log(y); // ReferenceError: Cannot access 'y' before initialization
let y = 5;

sayHi(); // Works — function declarations are fully hoisted
function sayHi() { console.log("Hi"); }

greet(); // TypeError: greet is not a function
var greet = function() { console.log("Hello"); };
```

---

## 5. Prototypes & Prototype Chain

**Q: How does prototypal inheritance work?**

```javascript
function Animal(name) {
  this.name = name;
}
Animal.prototype.speak = function() {
  return `${this.name} makes a sound`;
};

function Dog(name) {
  Animal.call(this, name);
}
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;
Dog.prototype.speak = function() {
  return `${this.name} barks`;
};

const d = new Dog("Rex");
d.speak();           // "Rex barks"
d instanceof Dog;    // true
d instanceof Animal; // true
```

**Modern equivalent with class syntax:**
```javascript
class Animal {
  constructor(name) { this.name = name; }
  speak() { return `${this.name} makes a sound`; }
}
class Dog extends Animal {
  speak() { return `${this.name} barks`; }
}
```

---

## 6. Debounce & Throttle

**Q: Implement debounce:**
```javascript
function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
// Use case: search input — only fire after user stops typing 300ms
const handleSearch = debounce((query) => fetchResults(query), 300);
```

**Q: Implement throttle:**
```javascript
function throttle(fn, limit) {
  let lastCall = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      fn.apply(this, args);
    }
  };
}
// Use case: scroll events, resize events, GPS emit
const onScroll = throttle(() => updatePosition(), 200);
```

---

## 7. This Keyword

```javascript
const obj = {
  name: "Mallesh",
  greet() { return `Hello ${this.name}`; },       // this = obj
  greetArrow: () => `Hello ${this.name}`,          // this = outer (window/undefined)
};

// Fixing this with bind
const greet = obj.greet;
greet();           // undefined — this lost
greet.bind(obj)(); // "Hello Mallesh"

// call vs apply vs bind
fn.call(context, arg1, arg2);   // call immediately, args separately
fn.apply(context, [arg1, arg2]); // call immediately, args as array
fn.bind(context, arg1);         // returns new function, doesn't call
```

---

## 8. Deep Clone vs Shallow Clone

```javascript
// Shallow (only top level)
const copy = { ...original };
const copy2 = Object.assign({}, original);

// Deep clone options
const deep1 = JSON.parse(JSON.stringify(obj)); // fast but loses Date, undefined, functions
const deep2 = structuredClone(obj);            // modern, handles Date/Map/Set

// Custom deep clone
function deepClone(obj) {
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(deepClone);
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, deepClone(v)]));
}
```

---

## 9. Memory Leaks — Common Causes

1. **Forgotten event listeners** — add but never remove
2. **Closures holding large objects** — function keeps reference alive
3. **setInterval without clearInterval**
4. **Global variables accidentally created** — `x = 5` without `let/const`
5. **Detached DOM nodes** — removed from DOM but still referenced in JS

---

## 10. Array & Object Methods (Production Use)

```javascript
// Map, filter, reduce chaining
const total = orders
  .filter(o => o.status === "DELIVERED")
  .map(o => o.total)
  .reduce((sum, t) => sum + t, 0);

// Object methods
Object.keys(obj), Object.values(obj), Object.entries(obj)
Object.fromEntries(entries)
Object.assign({}, a, b)  // merge
const { name, ...rest } = obj;  // destructuring + rest

// Array spread + flat
const all = [...arr1, ...arr2];
const flat = arr.flat(Infinity);
const unique = [...new Set(arr)];

// Optional chaining + nullish coalescing
const city = user?.address?.city ?? "Unknown";
```

---

## 11. var vs let vs const

| Feature | var | let | const |
|---|---|---|---|
| Scope | Function | Block | Block |
| Hoisted | Yes (undefined) | Yes (TDZ) | Yes (TDZ) |
| Re-declare | Yes | No | No |
| Re-assign | Yes | Yes | No |

**TDZ (Temporal Dead Zone)**: Between start of block scope and the declaration — accessing throws ReferenceError.

---

## 12. Logical Coding Questions

**Q: Flatten nested array without flat():**
```javascript
function flatten(arr) {
  return arr.reduce((acc, val) =>
    Array.isArray(val) ? acc.concat(flatten(val)) : acc.concat(val), []);
}
```

**Q: Find duplicates in array:**
```javascript
function findDuplicates(arr) {
  const seen = new Set();
  return arr.filter(x => seen.has(x) || !seen.add(x) && false);
  // simpler:
  return arr.filter((x, i) => arr.indexOf(x) !== i);
}
```

**Q: Memoize a function:**
```javascript
function memoize(fn) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}
const memoFib = memoize(function fib(n) {
  return n <= 1 ? n : memoFib(n - 1) + memoFib(n - 2);
});
```

**Q: Group array of objects by key:**
```javascript
function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const group = item[key];
    (acc[group] = acc[group] || []).push(item);
    return acc;
  }, {});
}
groupBy(orders, "status"); // { DELIVERED: [...], PENDING: [...] }
```

**Q: Curry a function:**
```javascript
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) return fn(...args);
    return (...more) => curried(...args, ...more);
  };
}
const add = curry((a, b, c) => a + b + c);
add(1)(2)(3); // 6
add(1, 2)(3); // 6
```
