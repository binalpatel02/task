# ==========================================
# STAGE 1: Build & Compile Stage
# ==========================================
FROM node:24-alpine AS builder

WORKDIR /app

# Copy ONLY configuration packages to guarantee a clean slate
COPY package.json package-lock.json tsconfig.json ./

# Install pristine, native Linux-compiled dependencies
RUN npm ci

# Copy only your source code directory (Bypasses root-level windows node_modules)
COPY ./src ./src

# Compile TypeScript cleanly into standard production JavaScript
RUN npx tsc

# Remove development environments to save space
RUN npm prune --production


# ==========================================
# STAGE 2: Production Execution Stage
# ==========================================
FROM node:24-alpine AS runner

WORKDIR /app

# Copy production package metrics
COPY package.json package-lock.json ./

# Copy production dependencies and compiled JavaScript from Stage 1
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Expose server listener port
EXPOSE 3000

# Fire up the application natively using Node
CMD ["node", "dist/index.js"]
