# Render Deployment Guide

## Korak 1: Kreiranje PostgreSQL baze podataka

1. Idite na [Render Dashboard](https://dashboard.render.com/)
2. Kliknite na "New +" i odaberite "PostgreSQL"
3. Konfiguriši:
   - **Name**: `frizerke-db`
   - **Database**: `frizerke_db`
   - **User**: `frizerke_user`
   - **Region**: Frankfurt (EU Central)
   - **Plan**: Free
4. Kliknite "Create Database"
5. Sačekajte da se baza kreira (1-2 minuta)

## Korak 2: Kreiranje Web Service

1. Na Render Dashboard, kliknite "New +" i odaberite "Web Service"
2. Konektujte GitHub repository: `nacka301/frizer_termin2`
3. Konfiguriši:
   - **Name**: `frizerke-salon`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

## Korak 3: Environment Variables

Dodajte sledeće environment variables:

### Automatski generiše Render:
- `DATABASE_URL` - (linkovan sa PostgreSQL bazom)
- `SESSION_SECRET` - (auto-generated)

### Manuelno dodajte:
```
NODE_ENV=production
PORT=10000
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password
ADMIN_EMAIL=admin@salon.hr
```

**Važno za EMAIL setup:**
1. Koristite Gmail sa App Password
2. Idite na Google Account Settings > Security > 2-Step Verification > App passwords
3. Generiši App Password za "Mail"
4. Koristite to kao EMAIL_PASS

## Korak 4: Povezivanje baze

1. U Web Service settings, idite na "Environment"
2. Dodajte novu environment variable:
   - **Key**: `DATABASE_URL`
   - **Value**: Odaberite "From Database" i izaberite `frizerke-db`

## Korak 5: Deploy

1. Kliknite "Create Web Service"
2. Render će automatski deployovati aplikaciju
3. Build proces traje 2-5 minuta

## Korak 6: Inicijalizacija baze (prvi put)

Nakon uspešnog deploy-a:
1. Idite na Render Dashboard > Web Service > Shell
2. Pokrenite: `npm run init-db`

## Korak 7: Testiranje

Vaša aplikacija će biti dostupna na:
```
https://frizerke-salon.onrender.com
```

### Test stranice:
- `/` - Glavna stranica
- `/rezervacija.html` - Rezervacija termina
- `/admin-login.html` - Admin login

### Default admin credentials:
- Username: `admin`
- Password: `admin123`

**VAŽNO**: Promenite admin password nakon prvog logina!

## Troubleshooting

### Baza podataka problemi:
- Proverite DATABASE_URL u environment variables
- Pokrenite `npm run init-db` u Render Shell

### Email problemi:
- Proverite Gmail App Password
- Proverite EMAIL_USER i EMAIL_PASS variables

### Build problemi:
- Proverite build logs u Render Dashboard
- Node.js version mora biti >=18.0.0

## Auto-deploy

Render će automatski re-deployovati aplikaciju svaki put kada push-ujete na `master` branch.

## Monitoring

- Health check endpoint: `/api/health`
- Logs dostupni u Render Dashboard > Logs
