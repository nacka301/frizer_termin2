# 🚀 STEP-BY-STEP COOLIFY SETUP

## 📋 **KORAK 1: HETZNER CLOUD REGISTRACIJA**

### 1.1 **Idite na Hetzner Cloud:**
```
URL: https://console.hetzner.cloud/
```

### 1.2 **Registracija:**
```
✅ Email adresa
✅ Lozinka (jaka)
✅ Verifikacija email-a
✅ Dodaj payment metodu (kreditna kartica)
```

### 1.3 **Kreiranje SSH ključa (ako nema):**
```powershell
# Na Windows PowerShell:
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# Kopiranje public key:
Get-Content ~/.ssh/id_rsa.pub | clip
```

---

## 🖥️ **KORAK 2: KREIRANJE SERVERA**

### 2.1 **Hetzner Console → "New Server":**
```
Location: Nuremberg (Germany)
Image: Ubuntu 22.04 LTS
Type: CX31 (8GB RAM, 2 vCPU, 80GB SSD)
Networking: IPv4 + IPv6
SSH Keys: Paste your public key
Firewall: Create new firewall
Name: coolify-server
```

### 2.2 **Firewall Rules:**
```
Inbound Rules:
✅ SSH (Port 22) - Your IP only
✅ HTTP (Port 80) - 0.0.0.0/0
✅ HTTPS (Port 443) - 0.0.0.0/0  
✅ Coolify (Port 8000) - Your IP only
✅ Custom (Port 3000) - 0.0.0.0/0
```

### 2.3 **Pokretanje servera:**
```
✅ Kliknite "Create & Buy Now"
✅ Server će biti spreman za ~1 minutu
✅ Zabilježite IP adresu: XXX.XXX.XXX.XXX
```

---

## 🔧 **KORAK 3: COOLIFY INSTALACIJA**

### 3.1 **SSH povezivanje:**
```powershell
# Connect to your server
ssh root@YOUR_SERVER_IP
```

### 3.2 **Update sistema:**
```bash
apt update && apt upgrade -y
```

### 3.3 **Coolify instalacija:**
```bash
# Install Coolify (single command)
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

### 3.4 **Čekanje instalacije:**
```
⏳ Instalacija traje ~5-10 minuta
✅ Docker se instalira
✅ Coolify se downloadira i pokreće
✅ SSL certifikati se konfiguriraju
```

### 3.5 **Pristup Coolify:**
```
URL: http://YOUR_SERVER_IP:8000
```

---

## 🔐 **KORAK 4: COOLIFY POČETNO PODEŠAVANJE**

### 4.1 **Prvi login:**
```
✅ Otvorite browser: http://YOUR_SERVER_IP:8000
✅ Kreirajte admin račun:
   - Email: your-email@example.com
   - Password: strong-password
   - Confirm password
```

### 4.2 **Server registracija:**
```
✅ Coolify će automatski detektirati lokalni server
✅ Server Name: "main-server"
✅ Description: "Production server for salons"
✅ Click "Validate Server"
```

### 4.3 **GitHub integracija:**
```
✅ Settings → Sources → Add Source
✅ Type: GitHub
✅ Name: "salon-repo"
✅ Follow GitHub OAuth flow
✅ Authorize Coolify access
```

---

## 📦 **KORAK 5: GITHUB REPO PRIPREMA**

### 5.1 **Push your code to GitHub:**
```powershell
# In your project directory
git add .
git commit -m "feat: Production ready multi-tenant frizerski saloni"
git push origin working-version

# Create production branch
git checkout -b production
git push origin production
```

### 5.2 **GitHub repository settings:**
```
✅ Repository: frizer_termin2
✅ Branch: production
✅ Make sure repository is public or add Coolify SSH key
```

---

## 🗄️ **KORAK 6: DATABASE SETUP**

### 6.1 **Coolify → Resources → Add Resource:**
```
✅ Type: PostgreSQL
✅ Name: salon-postgres
✅ Version: 15
✅ Database Name: postgres
✅ Username: frizerke_user
✅ Password: STRONG_DATABASE_PASSWORD (generate secure)
✅ Port: 5432
```

### 6.2 **Create databases for salons:**
```bash
# SSH to server and access PostgreSQL
docker exec -it salon-postgres psql -U frizerke_user -d postgres

# Create databases for each salon
CREATE DATABASE salon_marko_db;
CREATE DATABASE salon_ana_db;
CREATE DATABASE salon_petra_db;

# Grant permissions
GRANT ALL PRIVILEGES ON DATABASE salon_marko_db TO frizerke_user;
GRANT ALL PRIVILEGES ON DATABASE salon_ana_db TO frizerke_user;
GRANT ALL PRIVILEGES ON DATABASE salon_petra_db TO frizerke_user;

# Exit PostgreSQL
\q
```

---

## 🚀 **KORAK 7: PRVA APLIKACIJA (SALON MARKO)**

### 7.1 **Coolify → Applications → Add Application:**
```
✅ Name: salon-marko
✅ Description: Frizerski salon Marko
✅ Project: Create new "Frizerski Saloni"
```

### 7.2 **Source configuration:**
```
✅ Source: salon-repo (GitHub)
✅ Repository: nacka301/frizer_termin2
✅ Branch: production
✅ Build Pack: Docker
✅ Dockerfile: ./Dockerfile
```

### 7.3 **Domains configuration:**
```
✅ Domain: salon-marko.YOUR_DOMAIN.com
✅ Generate SSL: Yes (Let's Encrypt)
✅ Force HTTPS: Yes
```

### 7.4 **Environment Variables:**
```bash
# Click "Environment Variables" → Add all:
NODE_ENV=production
SALON_ID=marko
PORT=3000
DATABASE_URL=postgresql://frizerke_user:YOUR_DB_PASSWORD@salon-postgres:5432/salon_marko_db
SESSION_SECRET=GENERATE_WITH_SCRIPT
EMAIL_USER=notifications@YOUR_DOMAIN.com
EMAIL_PASS=YOUR_EMAIL_APP_PASSWORD
ADMIN_EMAIL=marko@salon-marko.com
HTTPS_ONLY=true
```

### 7.5 **Deploy:**
```
✅ Click "Deploy"
✅ Watch build logs
✅ Wait for deployment to complete (~5-10 minutes)
```

---

## 🌐 **KORAK 8: DOMAIN SETUP**

### 8.1 **Buy domain ili configure existing:**
```
Preporučene domene:
- frizerski-saloni.hr
- salon-booking.hr
- beautyhr.com
```

### 8.2 **DNS Configuration:**
```bash
# Add these DNS records:
A     yourdomain.com              → YOUR_SERVER_IP
A     *.yourdomain.com            → YOUR_SERVER_IP  # Wildcard
CNAME salon-marko.yourdomain.com  → yourdomain.com
CNAME salon-ana.yourdomain.com    → yourdomain.com
CNAME salon-petra.yourdomain.com  → yourdomain.com
```

---

## 🔑 **KORAK 9: GENERATE SECRETS**

### 9.1 **Session secrets za sve salone:**
```bash
# Run on your local machine
node generate-session-secret.js

# Copy the generated secret to Coolify environment variables
```

### 9.2 **Email setup:**
```bash
# Gmail App Password setup:
1. Gmail → Manage Google Account
2. Security → 2-Step Verification (enable)
3. App passwords → Generate password
4. Use generated password as EMAIL_PASS
```

---

## ✅ **KORAK 10: TESTING**

### 10.1 **Test first salon:**
```bash
# Check health
curl https://salon-marko.yourdomain.com/health

# Check salon config
curl https://salon-marko.yourdomain.com/api/salon-config

# Test booking (use Postman or browser)
```

### 10.2 **Verify functionality:**
```
✅ Website loads correctly
✅ Salon-specific branding shows
✅ Booking form works
✅ Email notifications work
✅ Admin panel accessible
```

---

## 🏪 **KORAK 11: DODAJ VIŠE SALONA**

### 11.1 **Salon Ana (repeat steps 7.1-7.5):**
```
Name: salon-ana
Domain: salon-ana.yourdomain.com
Environment:
  SALON_ID=ana
  DATABASE_URL=postgresql://frizerke_user:PASSWORD@salon-postgres:5432/salon_ana_db
  ADMIN_EMAIL=ana@beauty-salon-ana.com
```

### 11.2 **Salon Petra:**
```
Name: salon-petra
Domain: salon-petra.yourdomain.com
Environment:
  SALON_ID=petra
  DATABASE_URL=postgresql://frizerke_user:PASSWORD@salon-postgres:5432/salon_petra_db
  ADMIN_EMAIL=petra@salon-petra.com
```

---

## 🎉 **GOTOVO! FINAL CHECK:**

### ✅ **What you should have:**
```
✅ 3 working salon websites:
   - salon-marko.yourdomain.com
   - salon-ana.yourdomain.com  
   - salon-petra.yourdomain.com

✅ Each with:
   - Unique branding
   - Separate databases
   - Individual admin panels
   - SSL certificates
   - Email notifications

✅ Coolify dashboard managing all
✅ Automatic deployments on git push
✅ Built-in monitoring and backups
```

---

## 💰 **TROŠKOVI:**
```
Hetzner CX31: €9.48/mjesec
Domain: ~€12/godina
Email: Use Gmail (besplatno za start)

UKUPNO: ~€10/mjesec za početak!
```

---

## 🚀 **READY FOR BUSINESS:**

Sada možete:
✅ Dodavati nove salone u 10 minuta
✅ Naplaćivati €25/mjesec po salonu  
✅ Skalirati do 20+ salona na istom serveru

**Idemo korak po korak? S čim želite početi?** 💪
