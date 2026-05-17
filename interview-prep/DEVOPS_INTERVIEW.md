# DevOps Interview Questions — Docker · Nginx · CI/CD · AWS

---

## 1. Docker — Production Setup

```dockerfile
# Multi-stage build — smaller final image
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: "3.9"
services:
  frontend:
    build: ./frontend
    ports: ["3001:3001"]
    environment:
      - NEXT_PUBLIC_API_URL=${API_URL}
    depends_on: [api]

  api:
    build: ./backend
    ports: ["3000:3000"]
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
    depends_on: [postgres, redis]

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: tokomort
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redisdata:/data

volumes:
  pgdata:
  redisdata:
```

---

## 2. Nginx — Reverse Proxy & SSL

```nginx
# /etc/nginx/sites-available/tokomort
server {
    listen 80;
    server_name tokomort.com www.tokomort.com;
    return 301 https://$host$request_uri;  # redirect HTTP to HTTPS
}

server {
    listen 443 ssl http2;
    server_name tokomort.com;

    ssl_certificate /etc/letsencrypt/live/tokomort.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tokomort.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Socket.IO — WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
    }

    # Static files cache
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 3. PM2 — Process Management

```bash
# Start app in cluster mode (use all CPU cores)
pm2 start ecosystem.config.js

# ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "tokomort-api",
      script: "dist/main.js",
      instances: "max",       // one per CPU
      exec_mode: "cluster",
      max_memory_restart: "500M",
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "./logs/api-error.log",
      out_file: "./logs/api-out.log",
    },
    {
      name: "tokomort-frontend",
      script: "node_modules/.bin/next",
      args: "start",
      instances: 2,
      exec_mode: "cluster",
    },
  ],
};

# Zero-downtime reload
pm2 reload ecosystem.config.js --env production

# Monitoring
pm2 monit
pm2 logs tokomort-api --lines 100
```

---

## 4. GitHub Actions CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run lint
      - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SERVER_IP }}
          username: ubuntu
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/tokomort
            git pull origin main
            npm ci --production
            npm run build
            pm2 reload ecosystem.config.js --env production
```

---

## 5. Redis — Caching Patterns

```javascript
// Cache strategies:

// 1. Cache-Aside (Lazy Loading) — most common
async function getProduct(id) {
  const key = `product:${id}`;
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);
  const product = await db.product.findUnique({ where: { id } });
  await redis.setex(key, 300, JSON.stringify(product)); // 5 min TTL
  return product;
}

// 2. Rate limiting
async function rateLimiter(req, res, next) {
  const key = `ratelimit:${req.ip}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, 60); // 60 second window
  if (count > 100) return res.status(429).json({ message: "Too many requests" });
  next();
}

// 3. Session storage
await redis.setex(`session:${userId}`, 3600, JSON.stringify({ userId, role }));

// 4. Distributed locking (prevent duplicate payments)
const lock = await redis.set(`payment:${orderId}`, "1", "NX", "EX", 30);
if (!lock) return res.status(409).json({ message: "Payment already processing" });
```

---

## 6. AWS Basics

| Service | Use Case |
|---|---|
| EC2 | VPS — run Node.js + Next.js apps |
| S3 | Object storage — product images, delivery proof photos |
| CloudFront | CDN — serve static assets globally with low latency |
| RDS | Managed PostgreSQL — automated backups, multi-AZ |
| ElastiCache | Managed Redis — session storage, caching |
| SES | Transactional emails — order confirmations |
| Route 53 | DNS management |
| IAM | Access control — never use root credentials |

```bash
# S3 upload (Node.js)
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = new S3Client({ region: "ap-south-1" });

async function uploadImage(buffer, key) {
  await s3.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: "image/jpeg",
    ACL: "public-read",
  }));
  return `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${key}`;
}
```

---

## 7. Common Interview Questions

**Q: What is the difference between horizontal and vertical scaling?**
- **Vertical**: Add more CPU/RAM to existing server. Simple but has limits.
- **Horizontal**: Add more servers behind a load balancer. Unlimited scale, needs stateless app.

**Q: How do you make a Node.js app stateless for horizontal scaling?**
- Store sessions in Redis (not in-memory)
- Use JWT instead of session cookies
- Store uploaded files in S3 (not local disk)
- Use Socket.IO Redis adapter for WebSocket broadcast across instances

**Q: What is the difference between CMD and ENTRYPOINT in Docker?**
- `CMD` — default command, overridable by `docker run <image> <override>`
- `ENTRYPOINT` — fixed command, `CMD` becomes default arguments

**Q: Blue-green deployment?**
Run two identical environments. Route traffic to Green while Blue is idle. Deploy to Blue. If healthy, switch traffic to Blue. Instant rollback by switching back.
