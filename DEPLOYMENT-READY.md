# 🚀 FINALNI DEPLOYMENT CHECKLIST - HETZNER

## ✅ Vaš kod je GOTOV za Hetzner deployment!

### 🔧 **DODANE IZMJENE ZA PRODUKCIJU:**

1. **🛡️ Aktivirani rate limiteri** - Automatski stroži u produkciji
2. **🔐 HTTPS cookies** - Automatski sigurni u produkciji (ako imate SSL)
3. **✅ Environment validacija** - Provjerava obavezne varijable
4. **🎯 Optimizirani limiteri** po rutama

---

## 📋 **DEPLOYMENT KORACI:**

### 1. **Server setup:**
```bash
# Na vašem Hetzner serveru:
chmod +x hetzner-setup.sh
./hetzner-setup.sh
```

### 2. **Generiraj sigurni SESSION_SECRET:**
```bash
node generate-session-secret.js
```

### 3. **Konfiguriraj .env datoteku:**
```bash
nano .env
# Postavite sve obavezne varijable!
```

### 4. **Deploy aplikaciju:**
```bash
chmod +x deploy-hetzner.sh
./deploy-hetzner.sh
```

---

## 🔐 **OBAVEZNE ENVIRONMENT VARIJABLE:**

```env
# Database (već postavljeno u docker-compose)
DATABASE_URL=postgresql://frizerke_user:STRONG_PASSWORD@postgres:5432/frizerke_db
POSTGRES_PASSWORD=STRONG_DATABASE_PASSWORD

# Session (OBVEZNO PROMIJENITI!)
SESSION_SECRET=VAŠ_GENERIRANI_64_CHAR_HEX_STRING

# Email (obvezno za rezervacije)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password  # Gmail App Password
ADMIN_EMAIL=admin@salon.hr

# Produkcija
NODE_ENV=production
PORT=3000

# SSL (ako imate HTTPS)
HTTPS_ONLY=false  # Postaviti na true ako imate SSL
```

---

## 🎯 **SIGURNOSNE MJERE UKLJUČENE:**

- ✅ **Rate limiting** - 5 login pokušaja / 15min, 10 rezervacija / sat
- ✅ **CSRF zaštita** - Automatska na svim formama
- ✅ **Helmet sigurnost** - HTTP headers zaštita
- ✅ **Input sanitizacija** - Automatska zaštita od injections
- ✅ **Security logging** - Sve sumnjive aktivnosti se logiraju
- ✅ **Session sigurnost** - PostgreSQL backend, httpOnly cookies
- ✅ **Health monitoring** - /health endpoint za nadzor

---

## 🌐 **NAKON DEPLOYMENT-a:**

### Vaša aplikacija će biti dostupna na:
```
http://VAS_SERVER_IP:3000
```

### Za SSL (HTTPS) - opciono:
1. Instalirajte Let's Encrypt ili koristite Cloudflare
2. Postavite `HTTPS_ONLY=true` u .env
3. Ponovno pokrenite: `./deploy-hetzner.sh`

---

## 📊 **MONITORING:**

```bash
# Provjera statusa
docker-compose -f docker-compose.prod.yml ps

# Praćenje logova
docker-compose -f docker-compose.prod.yml logs -f

# Health check
curl http://localhost:3000/health

# Restart ako treba
docker-compose -f docker-compose.prod.yml restart
```

---

## 🚨 **SIGURNOSNI SAVJETI:**

1. **🔐 Redovito mijenjanje lozinki** - Database, email passwords
2. **📊 Monitoring logova** - Pratite `/logs/` direktorij
3. **🔄 Backup baze** - Redoviti PostgreSQL backup
4. **🛡️ Firewall** - Zatvorite sve portove osim 22, 80, 443, 3000
5. **📦 Updates** - Redovito ažurirajte Docker images

---

## 🎉 **ČESTITKE!**
Vaša aplikacija je spremna za produkciju s enterprise-level sigurnošću!
