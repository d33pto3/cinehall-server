# Base stage
FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install

# Development stage
FROM base AS dev
COPY . .
EXPOSE 8000
CMD ["npm", "run", "dev"]

# Build stage (only for prod)
FROM base AS build
COPY . .
RUN npm run build

# Production stage
FROM node:22-alpine AS prod
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
EXPOSE 8000
CMD ["npm", "start"]
