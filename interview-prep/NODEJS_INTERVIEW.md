# Node.js & Express.js Interview Questions

---

## 1. Event Loop (Node.js specific)

Node.js event loop phases (libuv):
1. **timers** — setTimeout, setInterval callbacks
2. **pending callbacks** — I/O errors from previous iteration
3. **idle, prepare** — internal use
4. **poll** — retrieve new I/O events (blocking here if queue empty)
5. **check** — setImmediate callbacks
6. **close callbacks** — socket.on("close")

```javascript
setImmediate(() => console.log("setImmediate")); // check phase
setTimeout(() => console.log("setTimeout"), 0);  // timers phase
process.nextTick(() => console.log("nextTick")); // before next phase (micro)
Promise.resolve().then(() => console.log("Promise")); // microtask
// Output: nextTick → Promise → setTimeout/setImmediate (order may vary)
```

---

## 2. Streams

```javascript
const fs = require("fs");
const zlib = require("zlib");
const { Transform } = require("stream");

// Without streams — loads entire file into memory ❌
const data = fs.readFileSync("large.csv");

// With streams — processes chunks ✅
const readStream = fs.createReadStream("large.csv", { highWaterMark: 64 * 1024 });
const writeStream = fs.createWriteStream("output.csv.gz");
const gzip = zlib.createGzip();

readStream.pipe(gzip).pipe(writeStream);

// Transform stream (e.g. CSV row processing)
const csvTransform = new Transform({
  transform(chunk, encoding, callback) {
    const processed = chunk.toString().toUpperCase();
    callback(null, processed);
  }
});
readStream.pipe(csvTransform).pipe(writeStream);
```

**Types**: Readable, Writable, Duplex (both), Transform (duplex + modify)

---

## 3. Express.js Middleware Pattern

```javascript
const express = require("express");
const app = express();

// Global middleware
app.use(express.json());
app.use(cors());

// Auth middleware
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

// Error handling middleware — must have 4 params
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status ?? 500).json({ message: err.message });
});

// Route-specific middleware
app.get("/admin/orders", authMiddleware, roleGuard("ADMIN"), getOrders);
```

---

## 4. JWT Authentication Flow

```javascript
// Login — issue tokens
async function login(req, res) {
  const user = await User.findOne({ email: req.body.email });
  if (!user || !bcrypt.compareSync(req.body.password, user.password)) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const accessToken = jwt.sign(
    { sub: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
  const refreshToken = jwt.sign(
    { sub: user.id },
    process.env.REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  // Store refresh token in httpOnly cookie (never in localStorage)
  res.cookie("refresh_token", refreshToken, {
    httpOnly: true, secure: true, sameSite: "strict", maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.json({ accessToken });
}

// Refresh
async function refresh(req, res) {
  const token = req.cookies.refresh_token;
  if (!token) return res.status(401).json({ message: "No refresh token" });
  const payload = jwt.verify(token, process.env.REFRESH_SECRET);
  const newAccessToken = jwt.sign({ sub: payload.sub }, process.env.JWT_SECRET, { expiresIn: "15m" });
  res.json({ accessToken: newAccessToken });
}
```

---

## 5. File Uploads with Multer

```javascript
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) return cb(new Error("Images only"));
    cb(null, true);
  },
});

app.post("/delivery/proof", authMiddleware, upload.single("proof"), async (req, res) => {
  const imageUrl = `/uploads/${req.file.filename}`;
  await db.delivery.update({ where: { id: req.params.id }, data: { proofImageUrl: imageUrl } });
  res.json({ imageUrl });
});
```

---

## 6. Clustering & Scaling

```javascript
const cluster = require("cluster");
const os = require("os");

if (cluster.isPrimary) {
  // Fork one worker per CPU core
  for (let i = 0; i < os.cpus().length; i++) {
    cluster.fork();
  }
  cluster.on("exit", (worker) => {
    console.log(`Worker ${worker.process.pid} died, restarting...`);
    cluster.fork();
  });
} else {
  // Each worker runs the Express app
  require("./server");
}
```

**Better in production**: Use PM2 `cluster mode` which manages this automatically + zero-downtime reload.

---

## 7. Redis Caching Pattern

```javascript
const redis = require("ioredis");
const client = new redis(process.env.REDIS_URL);

// Cache-aside pattern
async function getProducts(filters) {
  const cacheKey = `products:${JSON.stringify(filters)}`;

  const cached = await client.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const products = await db.product.findMany({ where: filters });
  await client.set(cacheKey, JSON.stringify(products), "EX", 300); // 5 min TTL

  return products;
}

// Cache invalidation on update
async function updateProduct(id, data) {
  const product = await db.product.update({ where: { id }, data });
  await client.del(`products:*`); // invalidate all product caches
  return product;
}
```

---

## 8. BullMQ — Background Jobs

```javascript
const { Queue, Worker } = require("bullmq");

// Producer — add job to queue
const emailQueue = new Queue("emails", { connection: redis });

async function sendOrderConfirmation(order) {
  await emailQueue.add("order-confirmation", {
    to: order.customer.email,
    orderId: order.id,
    orderNumber: order.orderNumber,
  }, {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
  });
}

// Worker — process jobs
const emailWorker = new Worker("emails", async (job) => {
  await emailService.send({
    to: job.data.to,
    subject: `Order #${job.data.orderNumber} confirmed`,
    html: emailTemplate(job.data),
  });
}, { connection: redis });

emailWorker.on("failed", (job, err) => console.error(`Email job failed: ${err.message}`));
```

---

## 9. Common Interview Questions

**Q: What is the difference between process.nextTick and setImmediate?**
- `process.nextTick` fires before the next iteration of the event loop (before I/O callbacks)
- `setImmediate` fires in the check phase, after I/O callbacks

**Q: How do you handle unhandled promise rejections?**
```javascript
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled rejection:", reason);
  process.exit(1); // crash and let PM2/Docker restart
});
```

**Q: What is CORS and how do you configure it?**
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true, // allow cookies
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
}));
```
