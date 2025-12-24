#!/usr/bin/env pwsh

Write-Host "🚀 Setup Appointments Table & Data" -ForegroundColor Cyan
Write-Host ""

# Change to backend directory
$BackendDir = Split-Path -Parent $PSScriptRoot
Set-Location $BackendDir

# Step 1: Run migration
Write-Host "📊 Creating appointments table..." -ForegroundColor Yellow
$migrationFile = "src/database/migrations/010_create_appointments_table.sql"

if (Test-Path $migrationFile) {
    # Read migration file content
    $sqlContent = Get-Content $migrationFile -Raw
    
    # Execute SQL via psql or node
    try {
        # Try with node and pg
        $nodeScript = @"
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

const sql = \`$sqlContent\`;

pool.query(sql)
  .then(() => {
    console.log('✅ Migration executed successfully');
    pool.end();
  })
  .catch(err => {
    console.error('❌ Migration failed:', err.message);
    pool.end();
    process.exit(1);
  });
"@
        
        $nodeScript | Out-File -FilePath "temp-migration.js" -Encoding UTF8
        node temp-migration.js
        Remove-Item "temp-migration.js" -ErrorAction SilentlyContinue
        
        Write-Host "✅ Appointments table created successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to create table: $_" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "⚠️  Migration file not found: $migrationFile" -ForegroundColor Yellow
}

Write-Host ""

# Step 2: Run seed
Write-Host "🌱 Seeding appointments data..." -ForegroundColor Yellow

if (Get-Command npx -ErrorAction SilentlyContinue) {
    npx ts-node scripts/seed-appointments.ts
} elseif (Get-Command node -ErrorAction SilentlyContinue) {
    # Alternative: compile and run
    Write-Host "Compiling TypeScript..." -ForegroundColor Cyan
    npx tsc scripts/seed-appointments.ts --esModuleInterop --resolveJsonModule
    node scripts/seed-appointments.js
    Remove-Item scripts/seed-appointments.js -ErrorAction SilentlyContinue
} else {
    Write-Host "❌ Node.js/npx not found in PATH" -ForegroundColor Red
    Write-Host "Please run manually: npx ts-node scripts/seed-appointments.ts" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "✅ Setup completed successfully!" -ForegroundColor Green
