#!/usr/bin/env pwsh

Write-Host "🌱 Seeding appointments data..." -ForegroundColor Green

# Change to the backend directory
Set-Location $PSScriptRoot\..

# Run the seed script
Write-Host "`n📝 Running TypeScript seed script..." -ForegroundColor Cyan
npx ts-node scripts/seed-appointments.ts

Write-Host "`n✅ Appointments seeding completed!" -ForegroundColor Green
