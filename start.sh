#!/bin/bash

# Production startup script
echo "🚀 Starting production server..."

# Navigate to the correct directory if needed
if [ -d "src" ]; then
  echo "📁 Found src directory, setting up paths..."
  export NODE_PATH="./src:$NODE_PATH"
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations (if in production)
if [ "$NODE_ENV" = "production" ]; then
  echo "🗄️ Running database migrations..."
  npx prisma migrate deploy
fi

# Start the server
echo "⚡ Starting Node.js server..."
exec node src/server/index.js
