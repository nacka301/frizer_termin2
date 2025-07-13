#!/bin/bash

# Quick setup script for generating session secrets for all salons
# Run with: node generate-all-secrets.js

echo "🔐 Generating session secrets for all salons..."
echo ""

# Generate secrets for each salon
SALONS=("marko" "ana" "petra" "zagreb1" "split" "osijek" "rijeka" "zadar" "pula" "karlovac" "sisak" "bjelovar" "koprivnica" "cakovec" "varazdin" "krapina" "samobor" "dugo-selo" "velika-gorica" "sesvete")

echo "# Session secrets for all salons" > salon-secrets.env
echo "# Generated on $(date)" >> salon-secrets.env
echo "" >> salon-secrets.env

for salon in "${SALONS[@]}"; do
    secret=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
    echo "SESSION_SECRET_${salon^^}=$secret" >> salon-secrets.env
    echo "✅ Generated secret for salon: $salon"
done

echo ""
echo "🎉 All secrets generated and saved to salon-secrets.env"
echo "📋 Copy these to your Coolify environment variables:"
echo ""
cat salon-secrets.env
