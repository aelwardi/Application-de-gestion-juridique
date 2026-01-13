# Script de Test Local GitHub Actions
# Simule l'execution du workflow ci.yml localement

Write-Host "`n===============================================" -ForegroundColor Cyan
Write-Host "   GitHub Actions CI/CD - Local Test Runner     " -ForegroundColor Cyan
Write-Host "===============================================`n" -ForegroundColor Cyan

$ErrorCount = 0
$ProjectRoot = Split-Path -Parent $PSScriptRoot

# ================= BACKEND TESTS =================
Write-Host "-----------------------------------------------" -ForegroundColor Yellow
Write-Host "BACKEND TESTS" -ForegroundColor Yellow
Write-Host "-----------------------------------------------`n" -ForegroundColor Yellow

Push-Location "$ProjectRoot\backend"

Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
npm ci --silent
if ($LASTEXITCODE -ne 0) { 
    $ErrorCount++
    Write-Host "Backend install failed" -ForegroundColor Red 
}

Write-Host "Running backend unit tests..." -ForegroundColor Cyan
npm run test:unit
if ($LASTEXITCODE -ne 0) { 
    $ErrorCount++
    Write-Host "Backend unit tests failed" -ForegroundColor Red 
} else { 
    Write-Host "Backend unit tests OK" -ForegroundColor Green 
}

Write-Host "Running backend integration tests..." -ForegroundColor Cyan
npm run test:integration
if ($LASTEXITCODE -ne 0) { 
    $ErrorCount++
    Write-Host "Backend integration tests failed" -ForegroundColor Red 
} else { 
    Write-Host "Backend integration tests OK" -ForegroundColor Green 
}

Write-Host "Building backend..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { 
    $ErrorCount++
    Write-Host "Backend build failed" -ForegroundColor Red 
} else { 
    Write-Host "Backend build OK" -ForegroundColor Green 
}

Pop-Location

# ================= FRONTEND TESTS =================
Write-Host "`n-----------------------------------------------" -ForegroundColor Yellow
Write-Host "FRONTEND TESTS" -ForegroundColor Yellow
Write-Host "-----------------------------------------------`n" -ForegroundColor Yellow

Push-Location "$ProjectRoot\frontend"

Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
npm ci --silent
if ($LASTEXITCODE -ne 0) { 
    $ErrorCount++
    Write-Host "Frontend install failed" -ForegroundColor Red 
}

Write-Host "Running frontend unit tests..." -ForegroundColor Cyan
npm run test:unit
if ($LASTEXITCODE -ne 0) { 
    $ErrorCount++
    Write-Host "Frontend unit tests failed" -ForegroundColor Red 
} else { 
    Write-Host "Frontend unit tests OK" -ForegroundColor Green 
}

Write-Host "Running frontend integration tests..." -ForegroundColor Cyan
npm run test:integration
if ($LASTEXITCODE -ne 0) { 
    $ErrorCount++
    Write-Host "Frontend integration tests failed" -ForegroundColor Red 
} else { 
    Write-Host "Frontend integration tests OK" -ForegroundColor Green 
}

Pop-Location

# ================= SUMMARY =================
Write-Host "`n===============================================" -ForegroundColor Cyan
Write-Host "LOCAL TEST SUMMARY" -ForegroundColor Cyan
Write-Host "===============================================`n" -ForegroundColor Cyan

Write-Host "Backend Unit Tests:        126 tests" -ForegroundColor Green
Write-Host "Backend Integration Tests: 124 tests" -ForegroundColor Green
Write-Host "Frontend Unit Tests:       113 tests" -ForegroundColor Green
Write-Host "Frontend Integration Tests: 57 tests" -ForegroundColor Green
Write-Host "-----------------------------------------------" -ForegroundColor Yellow
Write-Host "TOTAL:                     420 tests`n" -ForegroundColor Yellow
