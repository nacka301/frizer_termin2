#!/bin/bash
# Deploy script za Hetzner server

echo "Ažuriranje koda..."
cd /opt/frizer_termin2
git pull origin working-version

echo "Zaustavljanje starih kontejnera..."
docker-compose down

echo "Pokretanje novih kontejnera..."
docker-compose up --build -d

echo "Gotovo! Aplikacija je dostupna na http://46.62.158.138:3000"
