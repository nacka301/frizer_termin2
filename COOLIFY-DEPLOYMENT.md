# 🚀 COOLIFY DEPLOYMENT GUIDE

## 📋 **PREDNOSTI COOLIFY-ja za vaš projekt:**

✅ **Auto SSL** - Automatski HTTPS s Let's Encrypt  
✅ **GitHub Integration** - Push = Auto deploy  
✅ **GUI Management** - Sve preko web sučelja  
✅ **Built-in Monitoring** - Logs, metrics, health checks  
✅ **Easy Scaling** - Jedan klik za skaliranje  
✅ **Backup Integration** - Automatski backup baze  

---

## 🔧 **SETUP KORACI:**

### 1. **Hetzner + Coolify Setup:**
```bash
# Na Hetzner serveru instaliraj Coolify
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

### 2. **GitHub Repository:**
- Push vaš kod na GitHub
- U Coolify dodajte GitHub integration
- Coolify će automatski detectirati Docker setup

### 3. **Environment varijable u Coolify:**
```env
NODE_ENV=production
DATABASE_URL=postgresql://frizerke_user:STRONG_PASSWORD@postgres:5432/frizerke_db
POSTGRES_PASSWORD=STRONG_PASSWORD
SESSION_SECRET=GENERIRANI_64_CHAR_HEX_STRING
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
ADMIN_EMAIL=admin@salon.hr
HTTPS_ONLY=true  # Coolify automatski postavlja SSL!
```

### 4. **Deployment:**
- Coolify će automatski:
  - Buildati Docker container
  - Postaviti PostgreSQL
  - Konfigurirati SSL certificate
  - Napraviti health checks

---

## 🎯 **IZMJENE NAPRAVLJENE ZA COOLIFY:**

1. **📄 .coolify.yml** - Coolify konfiguracija
2. **🌐 CORS setup** - Dinamički za Coolify domene
3. **🔧 Environment detection** - Automatska detekcija Coolify varijabli

---

## 🚀 **WORKFLOW s COOLIFY-jem:**

```bash
# Lokalno razvijanje
git add .
git commit -m "New feature"
git push origin main

# Coolify automatski:
# 1. Detektira promjene
# 2. Builda novi container  
# 3. Deploya s zero downtime
# 4. Šalje notifikacije
```

---

## 📊 **COOLIFY FEATURES koji će vam koristiti:**

- **🔍 Real-time logs** - Pratite aplikaciju uživo
- **📈 Resource monitoring** - CPU, RAM, disk usage
- **🔔 Notifications** - Discord/Slack/email alerts
- **🔄 Rollback** - Jedan klik za vraćanje na prethodnu verziju
- **🗃️ Database management** - GUI za PostgreSQL
- **📦 Backup automation** - Redoviti backup baze

---

## 💡 **PREPORUKA:**

**DA, idite s Coolify!** 🎉

Razlozi:
1. **Vaš kod je već spreman** - Docker + health checks ✅
2. **Lakše održavanje** - GUI umjesto CLI skripti
3. **Profesionalniji** - SSL, monitoring, backup ugrađeni
4. **Budućnost** - Lakše dodavanje novih aplikacija
5. **DevOps friendly** - GitOps workflow

---

## 🛠️ **SLJEDEĆI KORACI:**

1. **Push kod na GitHub** (s novim izmjenama)
2. **Instaliraj Coolify na Hetzner**
3. **Dodaj GitHub repository u Coolify**
4. **Postavke environment varijable**
5. **Deploy! 🚀**

Vaša aplikacija će biti dostupna na: `https://your-domain.com` s automatskim SSL-om!
