# 🚀 COOLIFY SETUP - STEP BY STEP

## 📋 **IMPLEMENTATION PLAN:**

### **FAZA 1: GitHub Priprema (10 min)**
✅ Push kod na GitHub  
✅ Kreirati production branch  
✅ Testirati Docker build lokalno

### **FAZA 2: Hetzner Server Setup (15 min)**
✅ Kreirati Hetzner Cloud server  
✅ Instalirati Coolify  
✅ Konfigurirati DNS

### **FAZA 3: Prvi Salon Deploy (20 min)**
✅ Kreirati prvu Coolify aplikaciju  
✅ Postaviti environment varijable  
✅ Testirati deployment

### **FAZA 4: Multi-Salon Setup (30 min)**
✅ Dodati 2-3 test salona  
✅ Testirati tenant detection  
✅ Verificirati odvojene baze

### **FAZA 5: Production Ready (15 min)**
✅ SSL certifikati  
✅ Monitoring setup  
✅ Backup konfiguracija

---

## 🛠️ **KORAK 1: GITHUB SETUP**

### 1.1 **Commit current changes:**
```bash
git add .
git commit -m "feat: Multi-tenant architecture ready for Coolify"
git push origin working-version
```

### 1.2 **Create production branch:**
```bash
git checkout -b production
git push origin production
```

### 1.3 **Test Docker build:**
```bash
docker build -t frizerke-test .
docker run -p 3000:3000 frizerke-test
```

---

## 🖥️ **KORAK 2: HETZNER SERVER**

### 2.1 **Create Hetzner Cloud server:**
```
Server Type: CX31 (8GB RAM, 2 vCPU)
Image: Ubuntu 22.04 LTS
Location: Nuremberg (Germany)
SSH Key: Upload your public key
Firewall: Allow ports 22, 80, 443, 3000
```

### 2.2 **Install Coolify:**
```bash
# SSH to your server
ssh root@YOUR_SERVER_IP

# Install Coolify
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash

# Access Coolify
# http://YOUR_SERVER_IP:8000
```

### 2.3 **Domain DNS setup:**
```
# Add DNS records:
A     yourdomain.com           → YOUR_SERVER_IP
A     *.yourdomain.com         → YOUR_SERVER_IP  # Wildcard for subdomains
CNAME salon-marko.yourdomain.com → yourdomain.com
CNAME salon-ana.yourdomain.com   → yourdomain.com
```

---

## 🏪 **KORAK 3: PRVI SALON (MARKO)**

### 3.1 **Coolify Application Setup:**
```
1. Coolify Dashboard → "New Application"
2. Name: salon-marko
3. Source: GitHub
4. Repository: nacka301/frizer_termin2
5. Branch: production
6. Domain: salon-marko.yourdomain.com
7. Port: 3000
8. Build Command: npm install
9. Start Command: npm start
```

### 3.2 **Environment Variables:**
```
NODE_ENV=production
SALON_ID=marko
PORT=3000
DATABASE_URL=postgresql://frizerke_user:STRONG_PASSWORD@postgres:5432/salon_marko_db
SESSION_SECRET=GENERATED_64_CHAR_HEX_STRING
EMAIL_USER=notifications@yourdomain.com
EMAIL_PASS=YOUR_APP_PASSWORD
ADMIN_EMAIL=marko@salon-marko.com
HTTPS_ONLY=true
```

### 3.3 **PostgreSQL Setup:**
```
1. Coolify → "New Database" 
2. Type: PostgreSQL 15
3. Name: postgres-cluster
4. Username: frizerke_user
5. Password: STRONG_PASSWORD
6. Create databases:
   - salon_marko_db
   - salon_ana_db
   - salon_petra_db
```

---

## 🎨 **KORAK 4: DODATI VIŠE SALONA**

### 4.1 **Salon Ana:**
```
Application: salon-ana
Domain: salon-ana.yourdomain.com
Environment:
  SALON_ID=ana
  ADMIN_EMAIL=ana@beauty-salon-ana.com
  DATABASE_URL=postgresql://frizerke_user:PASSWORD@postgres:5432/salon_ana_db
```

### 4.2 **Salon Petra:**
```
Application: salon-petra  
Domain: salon-petra.yourdomain.com
Environment:
  SALON_ID=petra
  ADMIN_EMAIL=petra@salon-petra.com
  DATABASE_URL=postgresql://frizerke_user:PASSWORD@postgres:5432/salon_petra_db
```

---

## 🔒 **KORAK 5: PRODUCTION SECURITY**

### 5.1 **SSL Certificates:**
```
Coolify automatski konfigurira Let's Encrypt
✅ salon-marko.yourdomain.com → HTTPS
✅ salon-ana.yourdomain.com → HTTPS  
✅ salon-petra.yourdomain.com → HTTPS
```

### 5.2 **Monitoring:**
```
Coolify built-in monitoring:
✅ Health checks svih aplikacija
✅ Resource monitoring (CPU, RAM)
✅ Log aggregation
✅ Email alerts
```

### 5.3 **Backup:**
```
PostgreSQL backup:
✅ Daily automated backups
✅ Retention: 7 days
✅ S3 storage (optional)
```

---

## 🧪 **KORAK 6: TESTING**

### 6.1 **Test svaki salon:**
```bash
# Test Salon Marko
curl https://salon-marko.yourdomain.com/health
curl https://salon-marko.yourdomain.com/api/salon-config

# Test Salon Ana  
curl https://salon-ana.yourdomain.com/health
curl https://salon-ana.yourdomain.com/api/salon-config

# Test rezervaciju
curl -X POST https://salon-marko.yourdomain.com/api/book \
  -H "Content-Type: application/json" \
  -d '{"ime":"Test","prezime":"User","email":"test@test.com",...}'
```

### 6.2 **Verify tenant isolation:**
```
✅ Svaki salon ima svoju bazu
✅ Svaki salon ima svoj admin panel  
✅ Rezervacije su odvojene
✅ Email-ovi idu na pravilne adrese
```

---

## 📊 **KORAK 7: MONITORING & ANALYTICS**

### 7.1 **Coolify Dashboard:**
```
✅ Real-time status svih salona
✅ Resource usage monitoring
✅ Log streaming
✅ Deployment history
```

### 7.2 **Business Analytics:**
```
✅ Broj rezervacija po salonu
✅ Revenue tracking
✅ Performance metrics
✅ Error monitoring
```

---

## 🎉 **FINAL RESULT:**

### **20 Funkcionalna salona:**
```
✅ salon-marko.yourdomain.com    → Muški salon
✅ salon-ana.yourdomain.com      → Beauty salon  
✅ salon-petra.yourdomain.com    → Unisex salon
✅ salon-zagreb1.yourdomain.com  → Zagreb Centar
✅ salon-split.yourdomain.com    → Split Marina
... (15 more salons)
```

### **Troškovi:**
```
💰 Server: €40.10/mjesec
💰 Email: €15/mjesec  
💰 Domain: €1/mjesec
💰 UKUPNO: €56.10/mjesec za 20 salona!
```

### **Revenue:**
```
💵 20 × €25/mjesec = €500/mjesec
💰 Profit: €443.90/mjesec (€5,327/godina)
```

---

## 🚀 **NEXT STEPS:**

1. **Odaberite domenu** (yourdomain.com)
2. **Kreirajte Hetzner account**  
3. **Pripremite GitHub repo**
4. **Krenemo s implementacijom!**

Jeste li spremni krenuti? S čim želite početi? 🎯
