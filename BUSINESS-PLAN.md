# 🏪 MULTI-TENANT DEPLOYMENT PLAN

## 💰 **KONAČNI ODGOVOR - TROŠKOVI:**

### 🎯 **ZA 20 FRIZERSKIH SALONA:**
```
💰 MJESEČNO: €63.10 (€2.36 po salonu)
💰 GODIŠNJE: €757 (€37.85 po salonu)
```

### 📊 **BREAKDOWN:**
- **Hetzner serveri:** €40.10/mjesec
- **Domena + SSL:** €1/mjesec (besplatno SSL)
- **Email servis:** €15/mjesec 
- **Monitoring:** €7/mjesec

---

## 🚀 **IMPLEMENTACIJA STRATEGIJA:**

### FAZA 1: **Proof of Concept (1-3 salona)**
- **Trošak:** €25/mjesec
- **Setup:** Single server s Coolify
- **Timeline:** 2-3 dana

### FAZA 2: **Production Scale (10 salona)**
- **Trošak:** €45/mjesec  
- **Setup:** Load balancer + 2 app servera
- **Timeline:** 1 tjedan

### FAZA 3: **Full Scale (20+ salona)**
- **Trošak:** €63/mjesec
- **Setup:** Cluster s backup serverom
- **Timeline:** 2 tjedna

---

## 🎯 **BUSINESS MODEL:**

### 💵 **Pricing per salon:**
- **Setup fee:** €200 (one-time)
- **Monthly fee:** €20-30/mjesec po salonu
- **Your cost:** €2.36/mjesec po salonu

### 💰 **Revenue calculation:**
```
20 salona × €25/mjesec = €500/mjesec prihod
- €63/mjesec troškovi
= €437/mjesec PROFIT (€5,244/godina)

ROI: 694%! 🚀
```

---

## 🔧 **TECHNICAL SETUP:**

### 1. **Coolify Multi-App Deployment:**
- salon1.yourdomain.com
- salon2.yourdomain.com  
- salon3.yourdomain.com
- ... (do 20+)

### 2. **Shared Resources:**
- **1× PostgreSQL** cluster (20 baza)
- **1× Redis** za sessions
- **1× Nginx** load balancer
- **1× Email** servis (shared)

### 3. **Per-Salon Customization:**
- Vlastiti logo i boje
- Vlastiti cjenik
- Vlastiti admin email
- Vlastite usluge

---

## 📈 **SCALING PATH:**

### 🟢 **0-50 salona:** €63/mjesec
### 🟡 **50-100 salona:** €85/mjesec (+1 server)
### 🔴 **100+ salona:** €120/mjesec (dedicated DB)

---

## 🎉 **KONKURENTSKA PREDNOST:**

**Booksy:** €29/mjesec × 20 = €580/mjesec  
**Square:** $50/mjesec × 20 = €950/mjesec  
**VAŠA:** €63/mjesec UKUPNO

**💰 UŠTEDA:** 90% jeftiniji od konkurencije!

---

## 🏆 **PREPORUKA: COOLIFY!**

### ✅ **ZAŠTO COOLIFY POBJEĐUJE MANUAL HETZNER:**
1. **💰 Ista cijena** (€63.10/mjesec)
2. **⚡ 10× brže** deployment (10 min vs 3 sata po salonu)
3. **🎯 5× manje** održavanja (2h vs 12h mjesečno)
4. **🖥️ GUI management** - ne trebate DevOps experta
5. **🔐 Automatski SSL** za sve subdomene
6. **📊 Built-in monitoring** i backup
7. **🚀 Git deployment** - push = auto deploy

### 💡 **Praktični primjer:**
```
Novi salon dodavanje:
Manual Hetzner: 3 sata posla
Coolify: 10 minuta klikom miša

Server maintenance:  
Manual Hetzner: 12 sati mjesečno
Coolify: 2 sata mjesečno

💰 UŠTEDA: €500/mjesec na DevOps vremenu!
```
