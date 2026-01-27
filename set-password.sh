#!/bin/bash

# Set Admin Password Script
# Usage: ./set-password.sh YOUR_ANON_KEY

PROJECT_REF="azhurpnhsvoaczuktldw"
EMAIL="info@tasmentalhealthdirectory.com.au"
PASSWORD="Tasmental@123"

if [ -z "$1" ]; then
    echo "❌ Error: Anon key is required"
    echo ""
    echo "Usage: ./set-password.sh YOUR_ANON_KEY"
    echo ""
    echo "Get your anon key from:"
    echo "Supabase Dashboard → Settings → API → anon public key"
    exit 1
fi

ANON_KEY="$1"

echo "🔐 Setting password for $EMAIL..."
echo ""

response=$(curl -s -w "\n%{http_code}" -X POST \
  "https://${PROJECT_REF}.supabase.co/functions/v1/set-admin-password" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${EMAIL}\",
    \"password\": \"${PASSWORD}\"
  }")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" -eq 200 ]; then
    echo "✅ Success! Password has been set."
    echo ""
    echo "You can now log in at:"
    echo "https://tasmentalhealthdirectory.com.au/admin-login"
    echo ""
    echo "Email: $EMAIL"
    echo "Password: $PASSWORD"
else
    echo "❌ Error: Failed to set password"
    echo "HTTP Status: $http_code"
    echo "Response: $body"
    exit 1
fi
