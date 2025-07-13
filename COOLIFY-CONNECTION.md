# 🔗 POVEZIVANJE GITHUB + HETZNER + COOLIFY

## 📋 **TRENUTNO STANJE:**
✅ GitHub repo: frizer_termin2  
✅ Hetzner server kreiran  
🔄 Trebamo: Coolify instalacija i konfiguracija

---

## 🖥️ **KORAK 1: SSH PRISTUP HETZNER SERVERU**

### 1.1 **Spojite se na server:**
```powershell
# Replace sa vašom IP adresom Hetzner servera
ssh root@YOUR_HETZNER_SERVER_IP
```

### 1.2 **Proverite server informacije:**
```bash
# Check system info
uname -a
free -h
df -h
```

---

## 🚀 **KORAK 2: COOLIFY INSTALACIJA**

### 2.1 **Update sistema:**
```bash
apt update && apt upgrade -y
```

### 2.2 **Instaliraj Coolify:**
```bash
# Single command installation
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

### 2.3 **Čekanje instalacije:**
```
⏳ Instalacija će trajati 5-10 minuta
✅ Pratite output na terminalu
✅ Docker se automatski instalira
✅ Coolify se downloadira i pokreće
```

### 2.4 **Verifikacija instalacije:**
```bash
# Check if Coolify is running
docker ps
# Should see coolify containers running

# Check Coolify status
systemctl status coolify
```

---

## 🌐 **KORAK 3: COOLIFY PRISTUP I SETUP**

### 3.1 **Otvorite Coolify u browser:**
```
URL: http://YOUR_HETZNER_SERVER_IP:8000
```

### 3.2 **Prvi login i setup:**
```
1. ✅ Create Admin Account:
   - Email: your-email@gmail.com
   - Password: strong-password
   - Confirm password

2. ✅ Complete initial setup wizard

3. ✅ Server će biti automatski registriran
```

---

## 📦 **KORAK 4: GITHUB INTEGRACIJA**

### 4.1 **GitHub Source dodavanje:**
```
Coolify Dashboard → Settings → Sources → Add Source

✅ Type: GitHub
✅ Name: "github-salons"
✅ Click "Connect to GitHub"
✅ Authorize Coolify u GitHub OAuth flow
✅ Select repositories ili "All repositories"
```

### 4.2 **Verify GitHub connection:**
```
✅ GitHub source should appear u Sources list
✅ Test connection (green status)
```

---

## 🗄️ **KORAK 5: POSTGRESQL DATABASE**

### 5.1 **Create database service:**
```
Coolify → Resources → Add Resource

✅ Type: PostgreSQL
✅ Name: salon-postgres
✅ Version: 15
✅ Initial Database: postgres
✅ Username: frizerke_user
✅ Password: [Generate strong password - save it!]
✅ Port: 5432
✅ Click "Create"
```

### 5.2 **Wait for database to start:**
```
⏳ Database startup ~2-3 minutes
✅ Status should show "Running"
✅ Note down the connection details
```

---

## 🏪 **KORAK 6: PRVA APLIKACIJA (SALON MARKO)**

### 6.1 **Create new application:**
```
Coolify → Applications → Add Application

✅ Name: salon-marko
✅ Description: Frizerski salon Marko
✅ Project: Create new "Frizerski Saloni"
```

### 6.2 **GitHub repository connection:**
```
✅ Source: github-salons
✅ Repository: nacka301/frizer_termin2
✅ Branch: working-version (ili production ako imate)
✅ Build Pack: Docker
✅ Dockerfile Location: ./Dockerfile
```

### 6.3 **Domain configuration:**
```
✅ Domain: salon-marko.yourdomain.com
   (ili koristite IP:PORT za testiranje)
✅ Generate SSL: Yes
✅ Force HTTPS: Yes (ako imate domenu)
```

---

## 🔧 **KORAK 7: ENVIRONMENT VARIABLES**

### 7.1 **Dodajte sve potrebne varijable:**
```bash
# Click na "Environment Variables" tab

NODE_ENV=production
SALON_ID=marko
PORT=3000
DATABASE_URL=postgresql://frizerke_user:YOUR_POSTGRES_PASSWORD@salon-postgres:5432/salon_marko_db
SESSION_SECRET=your_generated_session_secret_here
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your_gmail_app_password
ADMIN_EMAIL=marko@salon-marko.com
HTTPS_ONLY=false
```

### 7.2 **Generate SESSION_SECRET:**
```bash
# Na vašem lokalnom računalu
node generate-session-secret.js

# Kopirajte generirani secret u Coolify
```

---

## 🚀 **KORAK 8: DEPLOY!**

### 8.1 **Start deployment:**
```
✅ Click "Deploy" button
✅ Watch build logs u real-time
✅ First build może biti spor (5-10 min)
```

### 8.2 **Monitor deployment:**
```
✅ Build logs - trebaju biti bez errors
✅ Health check - trebao bi biti "Healthy"
✅ Status - trebao bi biti "Running"
```

---

## 🗄️ **KORAK 9: SETUP BAZE PODATAKA**

### 9.1 **Connect to PostgreSQL:**
```bash
# SSH to your Hetzner server
ssh root@YOUR_HETZNER_SERVER_IP

# Access PostgreSQL container
docker exec -it salon-postgres psql -U frizerke_user -d postgres
```

### 9.2 **Create salon databases:**
```sql
-- Create databases for each salon
CREATE DATABASE salon_marko_db;
CREATE DATABASE salon_ana_db;
CREATE DATABASE salon_petra_db;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE salon_marko_db TO frizerke_user;
GRANT ALL PRIVILEGES ON DATABASE salon_ana_db TO frizerke_user;
GRANT ALL PRIVILEGES ON DATABASE salon_petra_db TO frizerke_user;

-- List databases to verify
\l

-- Exit
\q
```

---

## 🧪 **KORAK 10: TESTIRANJE**

### 10.1 **Test application:**
```bash
# Check if app is running (replace with your URL/IP)
curl http://YOUR_HETZNER_IP:3000/health

# Should return JSON with status: "healthy"
```

### 10.2 **Test u browser:**
```
✅ Open: http://YOUR_HETZNER_IP:3000
✅ Should see frizerski salon website
✅ Check if salon-specific content loads
✅ Test booking form (optional)
```

---

## 🎉 **SUCCESS CRITERIA:**

Ovo znači da je uspješno:
```
✅ Coolify dashboard shows "Running" status
✅ Application responds on HTTP
✅ Health check returns positive
✅ Database connection works
✅ No error logs in Coolify
```

---

## 🚨 **AKO NEŠTO NE RADI:**

### Common issues:
```
🔴 Build fails → Check Dockerfile syntax
🔴 App won't start → Check environment variables
🔴 Database connection → Verify DATABASE_URL
🔴 Port issues → Check firewall settings
```

### Debug commands:
```bash
# Check Coolify logs
docker logs coolify

# Check application logs in Coolify dashboard
# Applications → salon-marko → Logs tab
```

---

## 📞 **GDJE STE TRENUTNO?**

Recite mi:
1. **Je li Hetzner server spreman?** (IP adresa?)
2. **Je li GitHub repo pushovan?** 
3. **Jeste li se već spojili na server preko SSH?**

**Krenimo odavde korak po korak!** 🚀
