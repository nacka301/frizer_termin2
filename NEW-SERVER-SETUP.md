# 🚀 NOVI HETZNER SERVER - QUICK SETUP

## 🖥️ **KREIRANJE NOVOG SERVERA (5 MINUTA)**

### **Razlog:** Trenutni server ima firewall probleme

### **1. Hetzner Dashboard:**
```
https://console.hetzner.cloud/
```

### **2. Create New Server:**
```
Location: Nuremberg
Image: Ubuntu 22.04 LTS
Type: CX31 (8GB RAM, 2 vCPU)
Name: coolify-production

SSH Keys: ✅ ODABERITE VAŠ SSH KEY!
Firewall: ✅ CREATE NEW FIREWALL
```

### **3. Firewall Rules (VAŽNO!):**
```
✅ SSH (22) - 0.0.0.0/0
✅ HTTP (80) - 0.0.0.0/0  
✅ HTTPS (443) - 0.0.0.0/0
✅ Custom (8000) - 0.0.0.0/0
✅ Custom (3000) - 0.0.0.0/0
```

### **4. Nakon kreiranja:**
```bash
# Odmah testirati SSH (bez password-a)
ssh root@NEW_SERVER_IP

# Instalirati Coolify
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

---

## 💰 **TROŠKOVI:**
```
Novi server: €9.48/mjesec
Stari server: OBRISATI (0€)
```

---

## 🎯 **PREPORUČUJEM:**

**Kreirajte novi server sa pravilnim firewall-om!**

Ovo je brže nego debugging postojećeg servera, i imaćete čist start.

**Da li želite da kreiram novi server?** 🚀
