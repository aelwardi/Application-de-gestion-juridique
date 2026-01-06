# Frontend Dockerfile
FROM node:20-alpine AS base

WORKDIR /app

# Development stage
FROM node:20-alpine AS development

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3001

ENV HOST=0.0.0.0
ENV PORT=3001

CMD ["npm", "run", "dev"]

# Build stage
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3001

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY --from=build /app/.output ./.output

EXPOSE 3001

CMD ["node", ".output/server/index.mjs"]