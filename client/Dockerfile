# Use Node.js LTS version
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json ./

# Only copy pnpm-lock.yaml if it exists
COPY pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install

# Copy the rest of the application
COPY . .

# Build the application
RUN pnpm prisma generate --no-engine && pnpm build 

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"] 