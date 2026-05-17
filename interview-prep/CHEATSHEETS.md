# Command Cheatsheets — Git · Linux · Docker · Prisma · Next.js · NestJS

---

## Git

```bash
# Setup
git config --global user.name "Mallesh N"
git config --global user.email "mallesh.n@terralogic.com"

# Daily workflow
git status
git add <file>              # stage specific file
git add -p                  # interactive staging (review each hunk)
git commit -m "feat: add payment verification"
git push origin main

# Branching
git checkout -b feature/delivery-tracking
git merge feature/delivery-tracking
git branch -d feature/delivery-tracking

# Undo
git restore <file>           # discard working dir changes
git restore --staged <file>  # unstage
git reset HEAD~1             # undo last commit, keep changes
git reset --hard HEAD~1      # undo last commit, DISCARD changes
git revert <commit>          # safe undo — creates new commit

# Remote
git remote add origin <url>
git fetch origin
git pull --rebase origin main  # cleaner history than merge
git push --force-with-lease    # safer than --force

# Stash
git stash push -m "WIP: payment modal"
git stash list
git stash pop                  # apply + remove latest stash
git stash apply stash@{1}      # apply specific, keep in stash

# Log & Diff
git log --oneline --graph --all
git diff HEAD~1 HEAD
git blame <file>
git bisect start               # binary search for bug commit

# Tags
git tag v1.0.0
git push origin --tags
```

---

## Linux

```bash
# File operations
ls -la                    # list with hidden files + permissions
find . -name "*.ts" -type f
find . -name "node_modules" -prune -o -name "*.ts" -print
grep -r "razorpay" src/ --include="*.ts"
grep -rn "TODO" . --include="*.tsx"

# Permissions
chmod 755 deploy.sh       # rwxr-xr-x
chmod +x script.sh
chown -R ubuntu:ubuntu /var/www/tokomort

# Process management
ps aux | grep node
kill -9 <pid>
pkill -f "next start"
lsof -i :3000             # what's using port 3000
netstat -tulpn | grep 3000

# Networking
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"addressId":"xxx"}'

# System info
df -h                     # disk usage
free -h                   # memory usage
htop                      # process monitor
top

# Logs
tail -f /var/log/nginx/error.log
journalctl -u nginx -f
journalctl -u pm2-ubuntu -n 100

# Compress
tar -czf backup.tar.gz /var/www/tokomort
tar -xzf backup.tar.gz

# SSH
ssh -i ~/.ssh/key.pem ubuntu@<ip>
scp -i key.pem ./dist ubuntu@<ip>:/var/www/tokomort/
rsync -avz --exclude node_modules . ubuntu@<ip>:/var/www/tokomort/
```

---

## Docker

```bash
# Build
docker build -t tokomort-api:latest .
docker build -t tokomort-api:v1.2 --no-cache .

# Run
docker run -d -p 3000:3000 --name api tokomort-api:latest
docker run -d -p 3000:3000 --env-file .env tokomort-api:latest

# Compose
docker-compose up -d              # start all services
docker-compose up -d api          # start specific service
docker-compose down               # stop and remove containers
docker-compose down -v            # also remove volumes
docker-compose logs -f api        # follow logs
docker-compose restart api

# Inspect
docker ps                          # running containers
docker ps -a                       # all containers
docker images
docker logs -f <container>
docker exec -it <container> sh     # shell into container
docker inspect <container>
docker stats                       # live resource usage

# Cleanup
docker system prune -af            # remove all unused
docker volume prune
docker rmi $(docker images -q)    # remove all images

# Push to registry
docker tag tokomort-api:latest <registry>/tokomort-api:latest
docker push <registry>/tokomort-api:latest
```

---

## Prisma

```bash
# Setup
npm install prisma @prisma/client
npx prisma init

# Schema → DB
npx prisma migrate dev --name init           # create + apply migration
npx prisma migrate dev --name add_wallet     # incremental migration
npx prisma migrate deploy                    # apply in production
npx prisma db push                           # push schema without migration (dev only)

# Generate client
npx prisma generate                          # after schema changes

# Seed
npx prisma db seed

# Studio (GUI)
npx prisma studio

# Introspect existing DB
npx prisma db pull                           # generate schema from existing DB

# Reset
npx prisma migrate reset                     # drop all + re-run all migrations

# Common queries
// findUnique
await prisma.order.findUnique({ where: { id }, include: { items: true } });

// findMany with pagination
await prisma.order.findMany({
  where: { status: "DELIVERED" },
  skip: (page - 1) * 10,
  take: 10,
  orderBy: { createdAt: "desc" },
});

// upsert
await prisma.wallet.upsert({
  where: { userId },
  create: { userId, balance: amount },
  update: { balance: { increment: amount } },
});

// transaction
await prisma.$transaction([op1, op2, op3]);
await prisma.$transaction(async (tx) => {
  const order = await tx.order.update(...);
  await tx.payment.create(...);
});
```

---

## Next.js

```bash
npx create-next-app@latest --typescript --tailwind --app
npm run dev          # development
npm run build        # production build
npm run start        # production server
npm run lint         # ESLint
npx next info        # environment info for bug reports

# Environment variables
# .env.local → local dev (not committed)
# .env.production → production (not committed)
# NEXT_PUBLIC_ prefix → exposed to browser
# No prefix → server-side only

# Useful patterns
next/link     → client-side navigation (no full page reload)
next/image    → optimized images (WebP, lazy, LQIP)
next/font     → self-hosted fonts (no FOUT)
next/dynamic  → code splitting
next/headers  → read request headers in Server Components
next/cookies  → read/write cookies in Server Components
```

---

## NestJS

```bash
npm i -g @nestjs/cli
nest new tokomort-api
nest generate module orders
nest generate service orders
nest generate controller orders
nest generate guard auth/roles
nest generate interceptor common/transform
nest generate pipe common/validation
nest generate filter common/prisma-exception

npm run start:dev    # development with watch
npm run build        # compile TypeScript
npm run start:prod   # production
npm run test         # unit tests
npm run test:e2e     # end-to-end tests
npm run test:cov     # coverage report

# Useful decorators
@Controller('orders')
@Get(':id')          @Post()      @Put(':id')    @Patch(':id')    @Delete(':id')
@Param('id')         @Body()      @Query()       @Headers()       @Req()
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(TransformInterceptor)
@UsePipes(ValidationPipe)
@HttpCode(201)
@Public()            # skip auth guard (custom decorator)
```

---

## PM2

```bash
pm2 start ecosystem.config.js --env production
pm2 stop all
pm2 restart all
pm2 reload all          # zero-downtime reload
pm2 delete all
pm2 list                # process list
pm2 monit               # live monitoring
pm2 logs                # all logs
pm2 logs api --lines 50
pm2 flush               # clear all logs
pm2 save                # save process list for reboot
pm2 startup             # generate startup script
```
