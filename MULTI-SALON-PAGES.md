# 🏪 SVAKI SALON = SVOJA STRANICA

## 🌐 **KAKO ĆE TO FUNKCIONIRATI:**

### 📍 **URL struktura:**
```
salon-marko.yourdomain.com     → Salon Marko
salon-ana.yourdomain.com       → Beauty Salon Ana  
salon-petra.yourdomain.com     → Frizerka Petra
salon-zagreb1.yourdomain.com   → Zagreb Centar
salon-split.yourdomain.com     → Split Marina
... (do 20+ salona)
```

### 🎨 **Svaki salon ima:**
- ✅ **Vlastiti logo** i boje
- ✅ **Vlastite usluge** i cijene
- ✅ **Vlastiti admin panel**
- ✅ **Vlastitu bazu** rezervacija
- ✅ **Vlastiti email** za notifikacije
- ✅ **Vlastito radno vrijeme**
- ✅ **Vlastitu adresu** i kontakt

---

## 🔧 **TEHNIČKA IMPLEMENTACIJA:**

### 1. **Tenant Detection po URL-u:**
```javascript
// Middleware automatski detektira salon iz URL-a
salon-marko.yourdomain.com → SALON_ID = "marko"
salon-ana.yourdomain.com   → SALON_ID = "ana"

// Učitava konfiguraciju za taj salon
const salonConfig = SALON_CONFIGS[salonId];
```

### 2. **Odvojene baze po salonu:**
```javascript
// Svaki salon ima svoju bazu
marko     → database: salon_marko_db
ana       → database: salon_ana_db  
petra     → database: salon_petra_db
```

### 3. **Personalizirani frontend:**
```javascript
// Dinamički učitava salon specifične podatke
{
  salonName: "Frizerski salon Marko",
  logo: "/logos/salon-marko.png",
  primaryColor: "#2C3E50", 
  services: [
    { name: "Šišanje", price: 15, duration: 30 },
    { name: "Fade", price: 20, duration: 45 }
  ],
  workingHours: "09:00-17:00",
  adminEmail: "marko@salon-marko.com"
}
```

---

## 🎨 **PRIMJER RAZLIČITIH SALONA:**

### 🔵 **Salon Marko (Muški frizerski salon):**
```
URL: salon-marko.yourdomain.com
Boje: Plava/Siva (#2C3E50)
Usluge: 
- Šišanje obično (15€, 30min)
- Fade (20€, 45min)  
- Brijanje brade (15€, 30min)
Admin: marko@salon-marko.com
```

### 🌸 **Beauty Salon Ana (Ženski salon):**
```
URL: salon-ana.yourdomain.com  
Boje: Roza/Zlatna (#E91E63)
Usluge:
- Šišanje (25€, 45min)
- Bojanje (60€, 90min)
- Frizura za evento (40€, 60min)
Admin: ana@salon-ana.com
```

### 💚 **Unisex Salon Petra:**
```
URL: salon-petra.yourdomain.com
Boje: Zelena/Bijela (#27AE60)
Usluge:
- Šišanje M (18€, 30min)
- Šišanje Ž (25€, 45min)
- Pranje+Fen (12€, 20min)
Admin: petra@salon-petra.com
```

---

## 🏗️ **COOLIFY DEPLOYMENT STRUKTURA:**

### 📱 **20 Coolify aplikacija:**
```
┌─────────────────────────────────────────┐
│  Coolify Dashboard                      │
├─────────────────────────────────────────┤
│  ✅ salon-marko     (Running)           │
│  ✅ salon-ana       (Running)           │  
│  ✅ salon-petra     (Running)           │
│  ✅ salon-zagreb1   (Running)           │
│  ✅ salon-split     (Running)           │
│  ✅ salon-osijek    (Running)           │
│  ... (14 more salons)                   │
├─────────────────────────────────────────┤
│  🗄️ PostgreSQL Cluster (20 databases)  │
│  📧 Shared Email Service               │
│  🔍 Shared Monitoring                  │
└─────────────────────────────────────────┘
```

---

## 🚀 **DODAVANJE NOVOG SALONA = 10 MINUTA:**

### Step 1: **Coolify GUI**
```
1. New Application → "salon-novi"
2. Connect GitHub repo
3. Set subdomain: salon-novi.yourdomain.com
4. Environment variables:
   - SALON_ID=novi
   - ADMIN_EMAIL=novi@salon.com
   - SALON_NAME="Novi Frizerski Salon"
5. Deploy!
```

### Step 2: **Dodaj konfiguraciju**
```javascript
// Dodaj u SALON_CONFIGS
'novi': {
  name: 'Novi Frizerski Salon',
  adminEmail: 'novi@salon.com',
  services: [...],
  theme: { primaryColor: '#FF5722' },
  database: 'salon_novi_db'
}
```

### ✅ **GOTOVO!** Novi salon je online!

---

## 💰 **PRICING MODEL PO SALONU:**

### 💵 **Što naplaćujete salonu:**
```
Setup fee: €200 (one-time)
- Kreiranje stranice
- Konfiguracija boje/loga  
- Import postojećih rezervacija
- Training za osoblje

Monthly fee: €25/mjesec
- Hosting i održavanje
- SSL certifikat
- Email notifikacije
- 24/7 support
- Backup podataka
```

### 📊 **Vaša kalkulacija:**
```
20 salona × €25/mjesec = €500/mjesec prihod
- €63/mjesec troškovi hostinga
= €437/mjesec PROFIT

Setup fees: 20 × €200 = €4,000 (one-time)
```

---

## 🎯 **KONKURENTSKA PREDNOST:**

### 🔴 **Booksy/Square:**
- ❌ Generic stranica za sve
- ❌ €29-50/mjesec PO SALONU
- ❌ Nema full customization

### 🟢 **Vaša solucija:**  
- ✅ Potpuno personalizirana stranica
- ✅ €25/mjesec (jeftiniji)
- ✅ Vlastiti branding
- ✅ Vlastiti admin panel
- ✅ Vlastite funkcionalnosti

---

## 🎉 **BOTTOM LINE:**

**Svaki salon = Vlastita stranica = Veći value = Viša cijena!** 🚀
