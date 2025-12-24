Write-Host "🔄 Fixing appointments schema..." -ForegroundColor Cyan

# Run the migration
Write-Host "📦 Running migration 011..." -ForegroundColor Yellow
npx ts-node scripts/run-migration-011.ts

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Migration successful!" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "🌱 Reseeding appointments with correct IDs..." -ForegroundColor Yellow
    npx ts-node scripts/seed-appointments.ts
    
    Write-Host ""
    Write-Host "✅ All done! Appointments now use lawyers.id and clients.id" -ForegroundColor Green
} else {
    Write-Host "❌ Migration failed!" -ForegroundColor Red
    exit 1
}
