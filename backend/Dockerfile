# Climate Cardinals API — container image (portable to Railway, Fly.io, etc.)
FROM node:20-slim AS base
WORKDIR /app

# System deps Prisma needs at runtime.
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Install dependencies (cached unless package files change).
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

# App source + Prisma client.
COPY prisma ./prisma
RUN npx prisma generate
COPY src ./src

ENV NODE_ENV=production
EXPOSE 4000

# Apply migrations + seed on boot, then start the server.
CMD npx prisma migrate deploy && node prisma/seed.js && node src/server.js
