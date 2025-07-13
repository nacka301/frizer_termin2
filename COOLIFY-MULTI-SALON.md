# 🚀 COOLIFY DEPLOYMENT ZA SVAKI SALON

## 📋 **DEPLOYMENT STRATEGIJA:**

### 🎯 **1 GitHub Repo → 20 Coolify Aplikacija**

```
Repository: frizer_termin2
├── Coolify App 1: salon-marko.yourdomain.com
├── Coolify App 2: salon-ana.yourdomain.com  
├── Coolify App 3: salon-petra.yourdomain.com
├── ... (17 more apps)
└── Shared PostgreSQL: 20 databases
```

---

## 🔧 **COOLIFY KONFIGURACIJA PO SALONU:**

### 🔵 **Salon Marko:**
```yaml
# Coolify aplikacija: salon-marko
Domain: salon-marko.yourdomain.com
Source: GitHub - frizer_termin2 (same repo)

Environment Variables:
SALON_ID=marko
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@postgres:5432/salon_marko_db
SESSION_SECRET=generated_secret_marko
EMAIL_USER=notifications@yourdomain.com
EMAIL_PASS=app_password
ADMIN_EMAIL=marko@salon-marko.com
SALON_NAME="Frizerski salon Marko"
PRIMARY_COLOR=#2C3E50
SECONDARY_COLOR=#3498DB

Build Command: npm install
Start Command: npm start
Health Check: /health
Port: 3000
```

### 🌸 **Salon Ana:**
```yaml
# Coolify aplikacija: salon-ana
Domain: salon-ana.yourdomain.com
Source: GitHub - frizer_termin2 (same repo)

Environment Variables:
SALON_ID=ana
NODE_ENV=production  
DATABASE_URL=postgresql://user:pass@postgres:5432/salon_ana_db
SESSION_SECRET=generated_secret_ana
EMAIL_USER=notifications@yourdomain.com
EMAIL_PASS=app_password
ADMIN_EMAIL=ana@beauty-salon-ana.com
SALON_NAME="Beauty Salon Ana"
PRIMARY_COLOR=#E91E63
SECONDARY_COLOR=#FF9800
```

### 💚 **Salon Petra:**
```yaml
# Coolify aplikacija: salon-petra
Domain: salon-petra.yourdomain.com
Source: GitHub - frizer_termin2 (same repo)

Environment Variables:
SALON_ID=petra
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@postgres:5432/salon_petra_db  
SESSION_SECRET=generated_secret_petra
EMAIL_USER=notifications@yourdomain.com
EMAIL_PASS=app_password
ADMIN_EMAIL=petra@salon-petra.com
SALON_NAME="Unisex Salon Petra"
PRIMARY_COLOR=#27AE60
SECONDARY_COLOR=#2ECC71
```

---

## 🗄️ **POSTGRESQL SETUP:**

### **Shared Database Cluster:**
```sql
-- Kreiranje baza za sve salone
CREATE DATABASE salon_marko_db;
CREATE DATABASE salon_ana_db;
CREATE DATABASE salon_petra_db;
-- ... (17 more databases)

-- Kreiranje korisnika po salonu
CREATE USER salon_marko WITH PASSWORD 'secure_pass_marko';
GRANT ALL PRIVILEGES ON DATABASE salon_marko_db TO salon_marko;

CREATE USER salon_ana WITH PASSWORD 'secure_pass_ana';  
GRANT ALL PRIVILEGES ON DATABASE salon_ana_db TO salon_ana;

-- etc...
```

---

## 🔄 **DEPLOYMENT WORKFLOW:**

### **1. Git Push = Svi saloni se update-aju:**
```bash
# Developer workflow:
git add .
git commit -m "New feature: online payment"
git push origin main

# Coolify automatski:
# ✅ Rebuilds all 20 salon apps
# ✅ Rolling deployment (zero downtime)
# ✅ Health checks svih salona
# ✅ Email notifikacije if issues
```

### **2. Per-salon customization:**
```bash
# Environment varijable se mijenjaju samo za jedan salon
# Ostali saloni ostaju nepromijenjeni
```

---

## 🎨 **FRONTEND CUSTOMIZATION:**

### **Automatsko učitavanje salon tema:**
```javascript
// Frontend automatski dohvaća salon config
fetch('/api/salon-config')
  .then(response => response.json())
  .then(salon => {
    // Apply salon theme
    document.documentElement.style.setProperty('--primary-color', salon.theme.primaryColor);
    document.documentElement.style.setProperty('--secondary-color', salon.theme.secondaryColor);
    
    // Update content
    document.title = salon.name;
    document.querySelector('.logo').src = salon.theme.logo;
    document.querySelector('.salon-name').textContent = salon.name;
    
    // Load services
    salon.services.forEach(service => {
      // Populate services dynamically
    });
  });
```

---

## ⚡ **DEPLOYMENT KORACI - NOVI SALON:**

### **Step 1: Coolify GUI (2 minute)**
```
1. Coolify Dashboard → "New Application"
2. Name: salon-novi
3. Source: GitHub → frizer_termin2  
4. Domain: salon-novi.yourdomain.com
5. Branch: main
```

### **Step 2: Environment Setup (3 minute)**
```
SALON_ID=novi
DATABASE_URL=postgresql://user:pass@postgres:5432/salon_novi_db  
ADMIN_EMAIL=novi@salon-novi.com
SALON_NAME="Novi Frizerski Salon"
PRIMARY_COLOR=#FF5722
SECONDARY_COLOR=#FFC107
```

### **Step 3: Database Creation (2 minute)**
```sql
CREATE DATABASE salon_novi_db;
CREATE USER salon_novi WITH PASSWORD 'secure_pass';
GRANT ALL PRIVILEGES ON DATABASE salon_novi_db TO salon_novi;
```

### **Step 4: Code Update (3 minute)**
```javascript
// Add to backend/multi-tenant.js
'novi': {
  name: 'Novi Frizerski Salon',
  adminEmail: 'novi@salon-novi.com',
  // ... full config
}
```

### **✅ Total Time: 10 minuta!**

---

## 💰 **TROŠAK PO SALONU:**

```
Server resources: €63.10 ÷ 20 = €3.16/salon
Email quota: €15 ÷ 20 = €0.75/salon  
Monitoring: €7 ÷ 20 = €0.35/salon
Domain: €1 ÷ 20 = €0.05/salon

UKUPNO: €4.31/salon mjesečno troškovi
```

**Profit margin:** €25 - €4.31 = **€20.69 po salonu!** 🚀
