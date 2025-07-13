# 🏗️ ARHITEKTURA ZA 20 FRIZERSKIH SALONA

## 📊 **PREPORUČENA HETZNER SETUP:**

### 🖥️ **Serveri:**
```
┌─────────────────────┬──────────────┬──────────────┬─────────────┐
│ Server              │ Tip          │ Specifikacije│ Cijena/mj   │
├─────────────────────┼──────────────┼──────────────┼─────────────┤
│ Load Balancer       │ CX21         │ 4GB/2vCPU    │ €5.83       │
│ App Server 1        │ CX31         │ 8GB/2vCPU    │ €9.48       │
│ App Server 2        │ CX31         │ 8GB/2vCPU    │ €9.48       │
│ Database Server     │ CX31         │ 8GB/2vCPU    │ €9.48       │
│ Backup Server       │ CX21         │ 4GB/2vCPU    │ €5.83       │
└─────────────────────┴──────────────┴──────────────┴─────────────┘

💰 UKUPNO: €40.10/mjesec (€481/godina)
```

### 🌐 **Coolify Multi-tenant setup:**
- **1 Coolify instanca** upravlja svim salonima
- **Svaki salon = subdomena** (salon1.vasadomena.com)
- **Shared PostgreSQL** s odvojenim bazama
- **Shared Redis** za session storage
- **Automatski SSL** za sve subdomene

---

## 🔧 **IMPLEMENTACIJA:**

### 1. **Multi-tenant kod (vaša aplikacija):**
```javascript
// Environment varijable za svaki salon
const SALON_CONFIG = {
  'salon1': {
    name: 'Frizerski salon Marko',
    email: 'marko@salon.com',
    database: 'salon1_db'
  },
  'salon2': {
    name: 'Beauty salon Ana',
    email: 'ana@salon.com', 
    database: 'salon2_db'
  }
  // ... 20 salona
};

// Middleware za tenant detection
app.use((req, res, next) => {
  const subdomain = req.hostname.split('.')[0];
  req.salon = SALON_CONFIG[subdomain] || SALON_CONFIG.default;
  next();
});
```

### 2. **Coolify aplikacije:**
- **20x aplikacija instanci** (jedna po salonu)
- **1x PostgreSQL** cluster s 20 baza
- **1x Redis** za session sharing
- **1x Nginx** load balancer

---

## 📈 **SKALIRANJE PO POTREBI:**

### 🟢 **Do 50 salona:** Isti setup
### 🟡 **50-100 salona:** +1 App Server (€9.48/mj)
### 🔴 **100+ salona:** Dedicated database cluster

---

## 💎 **DODATNI TROŠKOVI:**

### 🌐 **Domena:**
- **.com domena:** €12/godina
- **Wildcard SSL:** Besplatno (Let's Encrypt)

### 📧 **Email servisi:**
- **Mailgun:** $35/mjesec (50,000 emailova)
- **SendGrid:** $15/mjesec (40,000 emailova)

### 📊 **Monitoring (opciono):**
- **Grafana Cloud:** Besplatno do 10k metrics
- **UptimeRobot:** €7/mjesec za sve salone

---

## 🎯 **FINALNI TROŠAK:**

```
┌─────────────────────┬──────────────┬──────────────┐
│ Komponenta          │ Mjesečno     │ Godišnje     │
├─────────────────────┼──────────────┼──────────────┤
│ Hetzner serveri     │ €40.10       │ €481         │
│ Domena              │ €1.00        │ €12          │
│ Email servis        │ €15.00       │ €180         │
│ Monitoring          │ €7.00        │ €84          │
├─────────────────────┼──────────────┼──────────────┤
│ 🎯 UKUPNO          │ €63.10       │ €757         │
└─────────────────────┴──────────────┴──────────────┘

💡 To je samo €2.36/mjesec po salonu!
```

---

## 📊 **USPOREDBA S KONKURENCIJOM:**

### 🔴 **Booksy (konkurent):**
- **€29/mjesec po salonu** × 20 = **€580/mjesec**
- **Godišnje: €6,960**

### 🔴 **Square Appointments:**
- **$50/mjesec po salonu** × 20 = **$1,000/mjesec**
- **Godišnje: ~€11,400**

### 🟢 **Vaša solucija:**
- **€63.10/mjesec ukupno** 
- **Godišnje: €757**

**💰 UŠTEDA: €6,203 - €10,643 godišnje!**
