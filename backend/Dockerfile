# Backend Dockerfile
FROM node:25-alpine AS base

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Development stage
FROM node:25-alpine AS development

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

# Utiliser ts-node-dev pour le hot reload en dev
CMD ["npx", "ts-node-dev", "--respawn", "--transpile-only", "src/index.ts"]

# Build stage
FROM node:25-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

# Production stage
FROM node:25-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY --from=build /app/dist ./dist
COPY --from=build /app/src/database/migrations ./src/database/migrations

EXPOSE 3000

CMD ["node", "dist/index.js"]