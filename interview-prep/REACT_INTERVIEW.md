# React Interview Questions — Hooks · Redux · Performance

---

## 1. useState vs useRef

```jsx
// useState — triggers re-render on change
const [count, setCount] = useState(0);

// useRef — persists across renders, NO re-render
const timerRef = useRef(null);
const inputRef = useRef(null); // DOM access

// Use useRef when: tracking previous value, storing timers, accessing DOM
function usePrevious(value) {
  const ref = useRef();
  useEffect(() => { ref.current = value; });
  return ref.current;
}
```

---

## 2. useEffect — Complete Guide

```jsx
useEffect(() => {}, []);          // runs once — componentDidMount
useEffect(() => {});              // runs every render
useEffect(() => {}, [dep]);       // runs when dep changes — componentDidUpdate
useEffect(() => { return cleanup; }, []); // cleanup on unmount — componentWillUnmount

// TOKOMORT pattern — socket subscription
useEffect(() => {
  if (!socket) return;
  socket.on("order.created", handleNewOrder);
  return () => socket.off("order.created", handleNewOrder); // cleanup!
}, [socket]);

// Fetching data — correct pattern
useEffect(() => {
  let cancelled = false;
  async function load() {
    const data = await fetchOrders();
    if (!cancelled) setOrders(data);
  }
  load();
  return () => { cancelled = true; }; // prevent state update on unmounted component
}, []);
```

**Common mistake**: Adding async directly to useEffect. Never do `useEffect(async () => {})`.

---

## 3. useMemo vs useCallback

```jsx
// useMemo — memoize expensive computed VALUE
const sortedOrders = useMemo(() =>
  orders.sort((a, b) => b.createdAt - a.createdAt),
  [orders]
);

// useCallback — memoize a FUNCTION (stable reference for child props)
const handleDelete = useCallback(
  (id) => deleteOrder(id),
  [deleteOrder]
);
// Without useCallback, handleDelete is a new function every render → child re-renders

// When to use:
// useMemo: expensive calculation, derived state from large list
// useCallback: function passed as prop to memo'd child, event handler in dependency array
```

---

## 4. React.memo

```jsx
// Prevents re-render if props haven't changed
const OrderCard = React.memo(({ order, onUpdate }) => {
  return <div>{order.orderNumber}</div>;
});

// Custom comparison
const OrderCard = React.memo(OrderCardComponent, (prev, next) =>
  prev.order.id === next.order.id && prev.order.status === next.order.status
);
```

**Rule**: Only memo when you've measured a performance problem. Premature memoization adds complexity.

---

## 5. Context API

```jsx
// Create
const ThemeContext = createContext({ theme: "light", toggle: () => {} });

// Provider
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  return (
    <ThemeContext.Provider value={{ theme, toggle: () => setTheme(t => t === "light" ? "dark" : "light") }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Consume
function Header() {
  const { theme, toggle } = useContext(ThemeContext);
  return <button onClick={toggle}>Current: {theme}</button>;
}
```

**Context vs Redux**: Context is fine for low-frequency updates (theme, locale, auth). Redux for high-frequency global state (cart, notifications, real-time data).

---

## 6. Redux Toolkit — Production Pattern (TOKOMORT)

```typescript
// slice
const cartSlice = createSlice({
  name: "cart",
  initialState: { items: [], total: 0 },
  reducers: {
    addItem(state, action) {
      const existing = state.items.find(i => i.id === action.payload.id);
      if (existing) existing.quantity++;
      else state.items.push({ ...action.payload, quantity: 1 });
      // Immer allows "mutation" syntax — it produces immutable update underneath
    },
    clearCart(state) { state.items = []; state.total = 0; },
  },
});

// Async thunk
export const loadUser = createAsyncThunk("auth/loadUser", async (_, { rejectWithValue }) => {
  try {
    const { data } = await authService.getProfile();
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message ?? "Failed to load user");
  }
});

// extraReducers
extraReducers: (builder) => {
  builder
    .addCase(loadUser.pending, (state) => { state.isLoading = true; })
    .addCase(loadUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
    })
    .addCase(loadUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
}
```

---

## 7. React Query v5 — Production Pattern (TOKOMORT)

```typescript
// Query
const { data: orders, isLoading, error } = useQuery({
  queryKey: ["orders", statusFilter, page],
  queryFn: async () => {
    const { data } = await orderService.getAll({ status: statusFilter, page });
    return data.data;
  },
  staleTime: 0,           // always fresh
  refetchInterval: 30_000, // auto-refresh every 30s
});

// Mutation
const updateMutation = useMutation({
  mutationFn: ({ id, status }) => orderService.updateStatus(id, status),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["orders"] }); // re-fetch
    toast.success("Status updated");
  },
  onError: (err) => toast.error(err.message),
});

// Optimistic update
const mutation = useMutation({
  mutationFn: updateFn,
  onMutate: async (newData) => {
    await queryClient.cancelQueries({ queryKey: ["orders"] });
    const prev = queryClient.getQueryData(["orders"]);
    queryClient.setQueryData(["orders"], (old) => ({ ...old, ...newData }));
    return { prev }; // rollback context
  },
  onError: (err, vars, context) => {
    queryClient.setQueryData(["orders"], context.prev); // rollback
  },
});
```

---

## 8. Performance Optimization

```jsx
// 1. Code splitting with lazy loading
const AdminDashboard = lazy(() => import("./dashboard/Admin"));
<Suspense fallback={<Spinner />}><AdminDashboard /></Suspense>

// 2. Virtualization for large lists
import { FixedSizeList } from "react-window";
<FixedSizeList height={600} itemCount={10000} itemSize={50}>
  {({ index, style }) => <OrderRow order={orders[index]} style={style} />}
</FixedSizeList>

// 3. Key prop — use stable IDs, never array index for dynamic lists
orders.map(order => <OrderCard key={order.id} />)  // ✅
orders.map((order, i) => <OrderCard key={i} />)    // ❌ causes DOM reconciliation issues

// 4. Avoid creating objects/arrays inline in JSX
// ❌ new function/object every render
<Component style={{ margin: 0 }} onClick={() => doThing()} />
// ✅
const style = useMemo(() => ({ margin: 0 }), []);
const handleClick = useCallback(() => doThing(), []);
```

---

## 9. Common Hooks Interview Questions

**Q: How do you prevent infinite loop in useEffect?**
```jsx
// ❌ Infinite: fetchOrders changes → re-render → fetchOrders changes again
useEffect(() => { fetchOrders(); }, [fetchOrders]);
// ✅ Wrap fetchOrders in useCallback or put it outside component
const fetchOrders = useCallback(async () => { ... }, []);
```

**Q: Implement useLocalStorage hook:**
```typescript
function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try { return JSON.parse(localStorage.getItem(key) ?? "null") ?? initial; }
    catch { return initial; }
  });
  const set = useCallback((v: T | ((prev: T) => T)) => {
    setValue(prev => {
      const next = typeof v === "function" ? (v as (p: T) => T)(prev) : v;
      localStorage.setItem(key, JSON.stringify(next));
      return next;
    });
  }, [key]);
  return [value, set] as const;
}
```

---

## 10. SSR vs CSR vs Hydration

- **CSR (Client-Side Rendering)**: React renders in browser. SEO poor, fast navigation.
- **SSR (Server-Side Rendering)**: HTML generated on server per request. Good SEO, slower TTFB.
- **SSG (Static Site Generation)**: HTML generated at build time. Fastest, good SEO, stale data.
- **ISR (Incremental Static Regeneration)**: SSG + revalidation interval.
- **Hydration**: Process where React attaches event listeners to server-rendered HTML. Mismatch errors if server HTML differs from client render.

**TOKOMORT uses**: SSR for product pages (SEO), CSR for dashboards (real-time data), `"use client"` directive boundaries.
