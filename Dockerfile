# Use official Node.js runtime
FROM node:24-alpine

# Set working directory
WORKDIR /app

# Copy package files first
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy application source
COPY . .

# Build TypeScript
RUN npm run build

# Application port
EXPOSE 3000

# Start compiled application
CMD ["npm", "start"]