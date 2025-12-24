#!/bin/bash

# Script pour créer des données de test : client, avocat et dossiers
# Usage: bash scripts/seed-cases.sh

BASE_URL="http://localhost:5000/api"

echo "🚀 Création des données de test..."
echo ""

# 1. Créer un client
echo "📝 Création du client..."
CLIENT_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "client.test@example.com",
    "password": "Client123!",
    "firstName": "Jean",
    "lastName": "Dupont",
    "phone": "0612345678",
    "role": "client"
  }')

echo "$CLIENT_RESPONSE"
CLIENT_ID=$(echo "$CLIENT_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo "✅ Client créé avec ID: $CLIENT_ID"
echo ""

# 2. Créer un avocat
echo "📝 Création de l'avocat..."
LAWYER_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "avocat.test@example.com",
    "password": "Avocat123!",
    "firstName": "Marie",
    "lastName": "Martin",
    "phone": "0623456789",
    "role": "avocat"
  }')

echo "$LAWYER_RESPONSE"
LAWYER_ID=$(echo "$LAWYER_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo "✅ Avocat créé avec ID: $LAWYER_ID"
echo ""

# 3. Se connecter en tant qu'avocat pour obtenir un token
echo "🔐 Connexion de l'avocat..."
LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"avocat.test@example.com\",
    \"password\": \"Avocat123!\"
  }")

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
echo "✅ Token obtenu: ${TOKEN:0:20}..."
echo ""

# Si les IDs n'ont pas été récupérés, utiliser des valeurs par défaut
if [ -z "$CLIENT_ID" ]; then
  echo "⚠️  CLIENT_ID non trouvé, veuillez le saisir manuellement:"
  read CLIENT_ID
fi

if [ -z "$LAWYER_ID" ]; then
  echo "⚠️  LAWYER_ID non trouvé, veuillez le saisir manuellement:"
  read LAWYER_ID
fi

if [ -z "$TOKEN" ]; then
  echo "❌ Token non obtenu, impossible de continuer"
  exit 1
fi

echo "📂 Création des dossiers..."
echo ""

# Dossier 1: Divorce contentieux
echo "1️⃣  Création du dossier: Divorce contentieux"
curl -s -X POST "${BASE_URL}/cases" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"title\": \"Divorce contentieux - Dupont\",
    \"description\": \"Procédure de divorce avec partage des biens et garde des enfants\",
    \"case_type\": \"familial\",
    \"priority\": \"high\",
    \"client_id\": \"$CLIENT_ID\",
    \"lawyer_id\": \"$LAWYER_ID\",
    \"court_name\": \"Tribunal de Grande Instance de Paris\",
    \"judge_name\": \"Juge Bernard\",
    \"next_hearing_date\": \"2025-02-15T10:00:00\",
    \"estimated_duration_months\": 6
  }" | jq '.'
echo ""

# Dossier 2: Litige commercial
echo "2️⃣  Création du dossier: Litige commercial"
curl -s -X POST "${BASE_URL}/cases" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"title\": \"Litige commercial - Fournisseur impayé\",
    \"description\": \"Réclamation de factures impayées pour un montant de 50 000€\",
    \"case_type\": \"commercial\",
    \"priority\": \"medium\",
    \"client_id\": \"$CLIENT_ID\",
    \"lawyer_id\": \"$LAWYER_ID\",
    \"court_name\": \"Tribunal de Commerce de Paris\",
    \"judge_name\": \"Juge Moreau\",
    \"next_hearing_date\": \"2025-01-20T14:00:00\",
    \"estimated_duration_months\": 4
  }" | jq '.'
echo ""

# Dossier 3: Accident du travail
echo "3️⃣  Création du dossier: Accident du travail"
curl -s -X POST "${BASE_URL}/cases" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"title\": \"Accident du travail - Indemnisation\",
    \"description\": \"Demande d'indemnisation suite à un accident du travail grave\",
    \"case_type\": \"travail\",
    \"priority\": \"urgent\",
    \"client_id\": \"$CLIENT_ID\",
    \"lawyer_id\": \"$LAWYER_ID\",
    \"court_name\": \"Conseil de Prud'hommes de Paris\",
    \"judge_name\": \"Conseiller Petit\",
    \"next_hearing_date\": \"2025-01-10T09:00:00\",
    \"estimated_duration_months\": 3
  }" | jq '.'
echo ""

# Dossier 4: Succession
echo "4️⃣  Création du dossier: Succession"
curl -s -X POST "${BASE_URL}/cases" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"title\": \"Succession - Partage de biens\",
    \"description\": \"Règlement de succession et partage entre héritiers\",
    \"case_type\": \"familial\",
    \"priority\": \"medium\",
    \"client_id\": \"$CLIENT_ID\",
    \"lawyer_id\": \"$LAWYER_ID\",
    \"court_name\": \"Tribunal Judiciaire de Paris\",
    \"judge_name\": \"Juge Durand\",
    \"next_hearing_date\": \"2025-03-05T11:00:00\",
    \"estimated_duration_months\": 8
  }" | jq '.'
echo ""

# Dossier 5: Litige immobilier
echo "5️⃣  Création du dossier: Litige immobilier"
curl -s -X POST "${BASE_URL}/cases" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"title\": \"Litige immobilier - Vices cachés\",
    \"description\": \"Action en justice pour vices cachés suite à l'achat d'une maison\",
    \"case_type\": \"immobilier\",
    \"priority\": \"high\",
    \"client_id\": \"$CLIENT_ID\",
    \"lawyer_id\": \"$LAWYER_ID\",
    \"court_name\": \"Tribunal de Grande Instance de Versailles\",
    \"judge_name\": \"Juge Lambert\",
    \"next_hearing_date\": \"2025-02-28T15:00:00\",
    \"estimated_duration_months\": 5
  }" | jq '.'
echo ""

# Dossier 6: Contestation d'amende
echo "6️⃣  Création du dossier: Contestation d'amende"
curl -s -X POST "${BASE_URL}/cases" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"title\": \"Contestation d'amende administrative\",
    \"description\": \"Contestation d'une amende de stationnement abusive\",
    \"case_type\": \"administratif\",
    \"priority\": \"low\",
    \"client_id\": \"$CLIENT_ID\",
    \"lawyer_id\": \"$LAWYER_ID\",
    \"court_name\": \"Tribunal Administratif de Paris\",
    \"estimated_duration_months\": 2
  }" | jq '.'
echo ""

# Dossier 7: Licenciement abusif
echo "7️⃣  Création du dossier: Licenciement abusif"
curl -s -X POST "${BASE_URL}/cases" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"title\": \"Licenciement abusif\",
    \"description\": \"Contestation d'un licenciement sans cause réelle et sérieuse\",
    \"case_type\": \"travail\",
    \"priority\": \"high\",
    \"client_id\": \"$CLIENT_ID\",
    \"lawyer_id\": \"$LAWYER_ID\",
    \"court_name\": \"Conseil de Prud'hommes de Nanterre\",
    \"judge_name\": \"Conseiller Thomas\",
    \"next_hearing_date\": \"2025-01-25T10:30:00\",
    \"estimated_duration_months\": 4
  }" | jq '.'
echo ""

# Dossier 8: Responsabilité civile
echo "8️⃣  Création du dossier: Responsabilité civile"
curl -s -X POST "${BASE_URL}/cases" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"title\": \"Responsabilité civile - Dommages corporels\",
    \"description\": \"Demande d'indemnisation pour dommages corporels suite à un accident\",
    \"case_type\": \"civil\",
    \"priority\": \"urgent\",
    \"client_id\": \"$CLIENT_ID\",
    \"lawyer_id\": \"$LAWYER_ID\",
    \"court_name\": \"Tribunal Judiciaire de Paris\",
    \"judge_name\": \"Juge Richard\",
    \"next_hearing_date\": \"2025-01-18T14:30:00\",
    \"estimated_duration_months\": 6
  }" | jq '.'
echo ""

echo "✅ Tous les dossiers ont été créés avec succès!"
echo ""
echo "📊 Résumé:"
echo "  - 1 client créé (ID: $CLIENT_ID)"
echo "  - 1 avocat créé (ID: $LAWYER_ID)"
echo "  - 8 dossiers créés"
echo ""
echo "🔍 Pour voir les dossiers:"
echo "  curl -X GET \"${BASE_URL}/cases/lawyer/${LAWYER_ID}\" -H \"Authorization: Bearer $TOKEN\" | jq '.'"
