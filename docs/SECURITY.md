# Sigurnosne mjere - Frizerski salon

## 📋 Pregled implementiranih sigurnosnih mjera

### 1. 📧 Email notifikacije
- ✅ **Potvrda rezervacije** - Automatska email potvrda korisniku
- ✅ **Admin notifikacija** - Obavijest administratoru o novoj rezervaciji
- ✅ **HTML email template** - Profesionalno oblikovane poruke
- ✅ **Error handling** - Graceful handling ako email ne može biti poslan

**Konfiguracija:**
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
ADMIN_EMAIL=admin@salon.hr
```

### 2. 🔒 CSRF zaštita
- ✅ **CSRF tokens** - Zaštita od Cross-Site Request Forgery napada
- ✅ **Session integration** - CSRF tokeni vezani za sesiju
- ✅ **Automatic validation** - Automatska provjera za kritične operacije

### 3. 📋 GDPR Compliance
- ✅ **Privacy Policy stranica** - Detaljno objašnjenje prikupljanja podataka
- ✅ **Terms of Service** - Uvjeti korištenja usluge
- ✅ **Data retention policy** - Politika čuvanja podataka
- ✅ **User rights** - Prava korisnika prema GDPR-u

### 4. 📊 Security Logging
- ✅ **Login attempts** - Logiranje uspješnih i neuspješnih prijava
- ✅ **Booking attempts** - Logiranje rezervacija
- ✅ **Rate limit violations** - Logiranje prekoračenja ograničenja
- ✅ **Security events** - Općenito logiranje sigurnosnih događaja
- ✅ **Log rotation** - Automatsko brisanje starih logova (30 dana)
- ✅ **Security analytics** - Analiza sigurnosnih logova

**Log lokacija:** `./logs/security-YYYY-MM-DD.log`

### 5. 🏥 Health Check & Monitoring
- ✅ **Database health** - Provjera konekcije na bazu
- ✅ **Memory usage** - Monitoring memorije
- ✅ **CPU usage** - Aproksimativni CPU monitoring
- ✅ **Uptime tracking** - Vrijeme rada aplikacije
- ✅ **Disk space** - Provjera slobodnog prostora (ako dostupno)
- ✅ **Periodic checks** - Automatske provjere svakih 5 minuta

**Endpoint:** `GET /health`

### 6. 🛡️ Enhanced Rate Limiting
- ✅ **General rate limiting** - 100 zahtjeva po 15 minuta
- ✅ **Auth rate limiting** - 5 login pokušaja po 15 minuta  
- ✅ **Booking rate limiting** - 3 rezervacije po satu
- ✅ **Rate limit logging** - Logiranje svih prekoračenja
- ✅ **IP tracking** - Praćenje sumnjive aktivnosti

## 🚀 Pokretanje s novim sigurnosnim mjerama

### 1. Instalacija dependencies
```bash
npm install
```

### 2. Konfiguracija environment varijabli
```bash
cp .env.example .env
# Editiraj .env datoteku s vlastitim podacima
```

### 3. Pokretanje aplikacije
```bash
npm start
```

## 📈 Monitoring i analytics

### Health Check
```bash
curl http://localhost:3000/health
```

### Security Analytics (admin only)
```bash
curl -H "Cookie: session=..." http://localhost:3000/api/security-analytics?days=7
```

## 🔧 Konfiguracija email-a

### Gmail setup
1. Uključi 2FA na Gmail računu
2. Generiraj App Password u Google Account settings
3. Koristi App Password kao `EMAIL_PASS`

### Ostali email provideri
Konfiguracija se može prilagoditi u `email.js` za druge SMTP servise.

## 📁 Datotečna struktura novih sigurnosnih komponenti

```
├── email.js              # Email notifikacije
├── security-logger.js    # Sigurnosno logiranje
├── health-check.js       # Health check i monitoring
├── logs/                 # Security logovi (auto-generirani)
├── public/
│   ├── privacy-policy.html    # GDPR Privacy Policy
│   └── terms-of-service.html  # Uvjeti korištenja
└── .env.example          # Environment varijable template
```

## ⚠️ Sigurnosne napomene

### Produkcijska sigurnost
- [ ] **HTTPS enforcing** - Forsiranje HTTPS-a u produkciji
- [ ] **Environment varijable** - Sigurne environment varijable
- [ ] **Database encryption** - Enkripcija baze podataka
- [ ] **Regular updates** - Redovita ažuriranja dependencies
- [ ] **WAF** - Web Application Firewall (Cloudflare/AWS)

### Monitoring u produkciji
- [ ] **External monitoring** - UptimeRobot, Pingdom
- [ ] **Error tracking** - Sentry, Bugsnag
- [ ] **Performance monitoring** - New Relic, DataDog
- [ ] **Log aggregation** - ELK Stack, Splunk

### Backup i recovery
- [ ] **Database backup** - Redoviti automated backup
- [ ] **Code versioning** - Git verzioning
- [ ] **Disaster recovery plan** - Plan oporavka

## 🎯 Sljedeći koraci za produkiju

1. **SSL certifikat** - Let's Encrypt ili komercijalni
2. **Environment separation** - Dev/Stage/Prod okruženja
3. **CI/CD pipeline** - Automated deployment
4. **Load balancing** - Za scalability
5. **Database clustering** - High availability
6. **Legal review** - Pravni pregled GDPR compliance

## 📞 Podrška

Za pitanja o sigurnosnim mjerama:
- **Email:** security@salon.hr
- **Dokumentacija:** [Link to docs]
- **Issue tracker:** [GitHub issues]
