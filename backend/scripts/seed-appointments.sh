#!/bin/bash

echo "🌱 Seeding appointments data..."

# Change to the backend directory
cd "$(dirname "$0")/.."

# Run the seed script
echo ""
echo "📝 Running TypeScript seed script..."
npx ts-node scripts/seed-appointments.ts

echo ""
echo "✅ Appointments seeding completed!"
