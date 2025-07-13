# 🎯 BRZI START CHECKLIST

## ✅ **PRIJE POČETKA - PRIPREMI:**

### 1. **GitHub Account**
- [ ] GitHub račun aktivan
- [ ] SSH ključ generiran i dodan u GitHub

### 2. **Email Setup**  
- [ ] Gmail račun (ili drugi email provider)
- [ ] 2FA uključen na Gmail
- [ ] App Password generiran za Gmail

### 3. **Domena**
- [ ] Domena kupljena (preporučeno: .com ili .hr)
- [ ] DNS pristup (za postavljanje A rekorda)

### 4. **Payment**
- [ ] Kreditna kartica za Hetzner (€10/mjesec)

---

## 🚀 **IMPLEMENTACIJA - 60 MINUTA:**

### **KORAK 1: Hetzner Setup (15 min)**
```bash
1. https://console.hetzner.cloud/ - registracija
2. Kreiranje CX31 servera (Ubuntu 22.04)
3. SSH ključ upload
4. Firewall konfiguracija
5. Zabilježiti IP adresu
```

### **KORAK 2: Coolify Install (10 min)**
```bash
ssh root@YOUR_SERVER_IP
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
# Čekanje instalacije...
# Pristup: http://YOUR_SERVER_IP:8000
```

### **KORAK 3: Coolify Setup (10 min)**
```bash
1. Coolify admin račun
2. GitHub integracija
3. PostgreSQL database kreiranje
4. DNS konfiguracija
```

### **KORAK 4: Prvi Salon Deploy (15 min)**
```bash
1. New Application: salon-marko
2. GitHub repo povezivanje
3. Environment varijable
4. Domain setup
5. Deploy!
```

### **KORAK 5: Test & Verify (10 min)**
```bash
1. Test website: salon-marko.yourdomain.com
2. Test booking form
3. Test admin panel
4. Test email notifications
```

---

## 📞 **TREBATE POMOĆ?**

Ako zapnete na bilo kojem koraku:

1. **Kopirajte grešku** točno kako piše
2. **Screenshot** ako je potrebno
3. **Recite na kojem koraku** ste stali
4. **Pošaljite** - odmah ću pomoći!

---

## 🎯 **REZULTAT:**

Nakon 60 minuta imat ćete:
✅ **Funkcionalni salon** online  
✅ **SSL certifikat** automatski  
✅ **Email notifikacije** rade  
✅ **Admin panel** pristupačan  
✅ **Spremno za business!**

**Krenimo? Koji je prvi korak koji želite napraviti?** 🚀
