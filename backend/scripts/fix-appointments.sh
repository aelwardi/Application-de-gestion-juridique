#!/bin/bash

echo "🔄 Fixing appointments schema..."

# Run the migration
echo "📦 Running migration 011..."
npx ts-node scripts/run-migration-011.ts

if [ $? -eq 0 ]; then
    echo "✅ Migration successful!"
    
    echo ""
    echo "🌱 Reseeding appointments with correct IDs..."
    npx ts-node scripts/seed-appointments.ts
    
    echo ""
    echo "✅ All done! Appointments now use lawyers.id and clients.id"
else
    echo "❌ Migration failed!"
    exit 1
fi
