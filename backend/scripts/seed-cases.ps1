# Script PowerShell pour créer des données de test
# Usage: powershell .\scripts\seed-cases.ps1

$BASE_URL = "http://localhost:5000/api"

Write-Host "Creation des donnees de test..." -ForegroundColor Cyan
Write-Host ""

# 1. Créer un client (ou obtenir l'existant)
Write-Host "Creation du client..." -ForegroundColor Yellow
$clientBody = @{
    email = "client.test@example.com"
    password = "Client123!"
    firstName = "Jean"
    lastName = "Dupont"
    phone = "0612345678"
    role = "client"
} | ConvertTo-Json

try {
    $clientResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/register" -Method Post -Body $clientBody -ContentType "application/json"
    $CLIENT_ID = $clientResponse.data.user.id
    Write-Host "Client cree avec ID: $CLIENT_ID" -ForegroundColor Green
} catch {
    Write-Host "Client existe deja, connexion pour obtenir l'ID..." -ForegroundColor Yellow
    $clientLoginBody = @{
        email = "client.test@example.com"
        password = "Client123!"
    } | ConvertTo-Json
    $clientLoginResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method Post -Body $clientLoginBody -ContentType "application/json"
    $CLIENT_ID = $clientLoginResponse.data.user.id
    Write-Host "Client ID obtenu: $CLIENT_ID" -ForegroundColor Green
}
Write-Host ""

# 2. Créer un avocat (ou obtenir l'existant)
Write-Host "Creation de l'avocat..." -ForegroundColor Yellow
$lawyerBody = @{
    email = "avocat.test@example.com"
    password = "Avocat123!"
    firstName = "Marie"
    lastName = "Martin"
    phone = "0623456789"
    role = "avocat"
} | ConvertTo-Json

try {
    $lawyerResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/register" -Method Post -Body $lawyerBody -ContentType "application/json"
    $LAWYER_ID = $lawyerResponse.data.user.id
    Write-Host "Avocat cree avec ID: $LAWYER_ID" -ForegroundColor Green
} catch {
    Write-Host "Avocat existe deja, connexion pour obtenir l'ID..." -ForegroundColor Yellow
    $lawyerLoginBody = @{
        email = "avocat.test@example.com"
        password = "Avocat123!"
    } | ConvertTo-Json
    $lawyerLoginResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method Post -Body $lawyerLoginBody -ContentType "application/json"
    $LAWYER_ID = $lawyerLoginResponse.data.user.id
    Write-Host "Avocat ID obtenu: $LAWYER_ID" -ForegroundColor Green
}
Write-Host ""

# 3. Se connecter en tant qu'avocat
Write-Host "Connexion de l'avocat..." -ForegroundColor Yellow
$loginBody = @{
    email = "avocat.test@example.com"
    password = "Avocat123!"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$TOKEN = $loginResponse.data.accessToken
Write-Host "Token obtenu" -ForegroundColor Green
Write-Host ""

$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
}

Write-Host "Creation des dossiers..." -ForegroundColor Cyan
Write-Host ""

# Dossier 1: Divorce contentieux
Write-Host "1. Divorce contentieux"
$case1 = @{
    title = "Divorce contentieux - Dupont"
    description = "Procédure de divorce avec partage des biens et garde des enfants"
    case_type = "familial"
    priority = "high"
    client_id = $CLIENT_ID
    lawyer_id = $LAWYER_ID
    court_name = "Tribunal de Grande Instance de Paris"
    judge_name = "Juge Bernard"
    next_hearing_date = "2025-02-15T10:00:00"
    estimated_duration_months = 6
} | ConvertTo-Json

Invoke-RestMethod -Uri "$BASE_URL/cases" -Method Post -Headers $headers -Body $case1 | Out-Null

# Dossier 2: Litige commercial
Write-Host "2. Litige commercial"
$case2 = @{
    title = "Litige commercial - Fournisseur impayé"
    description = "Réclamation de factures impayées pour un montant de 50 000€"
    case_type = "commercial"
    priority = "medium"
    client_id = $CLIENT_ID
    lawyer_id = $LAWYER_ID
    court_name = "Tribunal de Commerce de Paris"
    judge_name = "Juge Moreau"
    next_hearing_date = "2025-01-20T14:00:00"
    estimated_duration_months = 4
} | ConvertTo-Json

Invoke-RestMethod -Uri "$BASE_URL/cases" -Method Post -Headers $headers -Body $case2 | Out-Null

# Dossier 3: Accident du travail
Write-Host "3. Accident du travail"
$case3 = @{
    title = "Accident du travail - Indemnisation"
    description = "Demande d'indemnisation suite à un accident du travail grave"
    case_type = "travail"
    priority = "urgent"
    client_id = $CLIENT_ID
    lawyer_id = $LAWYER_ID
    court_name = "Conseil de Prud'hommes de Paris"
    judge_name = "Conseiller Petit"
    next_hearing_date = "2025-01-10T09:00:00"
    estimated_duration_months = 3
} | ConvertTo-Json

Invoke-RestMethod -Uri "$BASE_URL/cases" -Method Post -Headers $headers -Body $case3 | Out-Null

# Dossier 4: Succession
Write-Host "4. Succession"
$case4 = @{
    title = "Succession - Partage de biens"
    description = "Règlement de succession et partage entre héritiers"
    case_type = "familial"
    priority = "medium"
    client_id = $CLIENT_ID
    lawyer_id = $LAWYER_ID
    court_name = "Tribunal Judiciaire de Paris"
    judge_name = "Juge Durand"
    next_hearing_date = "2025-03-05T11:00:00"
    estimated_duration_months = 8
} | ConvertTo-Json

Invoke-RestMethod -Uri "$BASE_URL/cases" -Method Post -Headers $headers -Body $case4 | Out-Null

# Dossier 5: Litige immobilier
Write-Host "5. Litige immobilier"
$case5 = @{
    title = "Litige immobilier - Vices cachés"
    description = "Action en justice pour vices cachés suite à l'achat d'une maison"
    case_type = "immobilier"
    priority = "high"
    client_id = $CLIENT_ID
    lawyer_id = $LAWYER_ID
    court_name = "Tribunal de Grande Instance de Versailles"
    judge_name = "Juge Lambert"
    next_hearing_date = "2025-02-28T15:00:00"
    estimated_duration_months = 5
} | ConvertTo-Json

Invoke-RestMethod -Uri "$BASE_URL/cases" -Method Post -Headers $headers -Body $case5 | Out-Null

# Dossier 6: Contestation d'amende
Write-Host "6. Contestation d'amende"
$case6 = @{
    title = "Contestation d'amende administrative"
    description = "Contestation d'une amende de stationnement abusive"
    case_type = "administratif"
    priority = "low"
    client_id = $CLIENT_ID
    lawyer_id = $LAWYER_ID
    court_name = "Tribunal Administratif de Paris"
    estimated_duration_months = 2
} | ConvertTo-Json

Invoke-RestMethod -Uri "$BASE_URL/cases" -Method Post -Headers $headers -Body $case6 | Out-Null

# Dossier 7: Licenciement abusif
Write-Host "7. Licenciement abusif"
$case7 = @{
    title = "Licenciement abusif"
    description = "Contestation d'un licenciement sans cause réelle et sérieuse"
    case_type = "travail"
    priority = "high"
    client_id = $CLIENT_ID
    lawyer_id = $LAWYER_ID
    court_name = "Conseil de Prud'hommes de Nanterre"
    judge_name = "Conseiller Thomas"
    next_hearing_date = "2025-01-25T10:30:00"
    estimated_duration_months = 4
} | ConvertTo-Json

Invoke-RestMethod -Uri "$BASE_URL/cases" -Method Post -Headers $headers -Body $case7 | Out-Null

# Dossier 8: Responsabilité civile
Write-Host "8. Responsabilite civile"
$case8 = @{
    title = "Responsabilité civile - Dommages corporels"
    description = "Demande d'indemnisation pour dommages corporels suite à un accident"
    case_type = "civil"
    priority = "urgent"
    client_id = $CLIENT_ID
    lawyer_id = $LAWYER_ID
    court_name = "Tribunal Judiciaire de Paris"
    judge_name = "Juge Richard"
    next_hearing_date = "2025-01-18T14:30:00"
    estimated_duration_months = 6
} | ConvertTo-Json

Invoke-RestMethod -Uri "$BASE_URL/cases" -Method Post -Headers $headers -Body $case8 | Out-Null

Write-Host ""
Write-Host "Tous les dossiers ont ete crees avec succes!" -ForegroundColor Green
Write-Host ""
Write-Host "Resume:" -ForegroundColor Cyan
Write-Host "  - 1 client cree (ID: $CLIENT_ID)"
Write-Host "  - 1 avocat cree (ID: $LAWYER_ID)"
Write-Host "  - 8 dossiers crees"
Write-Host ""
Write-Host "Identifiants de connexion avocat:" -ForegroundColor Yellow
Write-Host "  Email: avocat.test@example.com"
Write-Host "  Mot de passe: Avocat123!"
Write-Host ""
Write-Host "Identifiants de connexion client:" -ForegroundColor Yellow
Write-Host "  Email: client.test@example.com"
Write-Host "  Mot de passe: Client123!"
