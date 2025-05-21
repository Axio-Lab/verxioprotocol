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

# Set build-time arguments
ARG NEXT_PUBLIC_HELIUS_API_KEY
ARG NEXT_PUBLIC_APP_URL
ARG DATABASE_URL
ARG PINATA_JWT
ARG PRISMA_FIELD_ENCRYPTION_KEY
ARG NEXT_PUBLIC_GATEWAY_URL

# Set environment variables
ENV NEXT_PUBLIC_HELIUS_API_KEY=$NEXT_PUBLIC_HELIUS_API_KEY
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV DATABASE_URL=$DATABASE_URL
ENV PINATA_JWT=$PINATA_JWT
ENV PRISMA_FIELD_ENCRYPTION_KEY=$PRISMA_FIELD_ENCRYPTION_KEY
ENV NEXT_PUBLIC_GATEWAY_URL=$NEXT_PUBLIC_GATEWAY_URL

# Build the application
RUN pnpm prisma generate --no-engine && pnpm build 

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"] 