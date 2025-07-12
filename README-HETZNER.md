# Hetzner Deployment Guide

Ovaj vodič objašnjava kako pokrenuti Frizerke aplikaciju na Hetzner serveru korišćenjem Docker-a.

## Preduslovi

1. **Hetzner server** sa Ubuntu/Debian
2. **Docker** instaliran
3. **Docker Compose** instaliran
4. **Git** instaliran

## Brza instalacija Docker-a na Ubuntu

```bash
# Ažuriranje paketa
sudo apt update

# Instalacija Docker-a
sudo apt install -y docker.io docker-compose

# Dodavanje korisnika u docker grupu
sudo usermod -aG docker $USER

# Restart sesije ili logout/login
newgrp docker
```

## Deployment koraci

### 1. Kloniraj repository

```bash
git clone https://github.com/nacka301/frizer_termin2.git
cd frizer_termin2
git checkout working-version
```

### 2. Konfiguriraj environment varijable

```bash
# Kopiranje template fajla
cp .env.example .env

# Uređivanje konfiguracije
nano .env
```

**Važne varijable za konfiguraciju:**

```bash
# Generiraj jak session secret
SESSION_SECRET=muy_fuerte_secreto_aqui_cambiar_en_produccion

# Email konfiguracija
EMAIL_USER=your-actual-email@gmail.com
EMAIL_PASS=your-app-specific-password

# Admin email
ADMIN_EMAIL=admin@yourdomain.com
```

### 3. Pokretanje aplikacije

```bash
# Automatski deployment script
chmod +x deploy-hetzner.sh
./deploy-hetzner.sh
```

**Ili ručno:**

```bash
# Build i pokretanje
docker-compose up --build -d

# Provjera statusa
docker-compose ps

# Logovi
docker-compose logs -f
```

## Upravljanje aplikacijom

### Osnovne komande

```bash
# Zaustavljanje
docker-compose down

# Pokretanje
docker-compose up -d

# Restart
docker-compose restart

# Logovi
docker-compose logs -f app

# Status kontejnera
docker-compose ps
```

### Backup baze podataka

```bash
# Kreiranje backup-a
docker-compose exec postgres pg_dump -U frizerke_user frizerke_db > backup.sql

# Vraćanje backup-a
docker-compose exec -T postgres psql -U frizerke_user frizerke_db < backup.sql
```

## Nginx Reverse Proxy (Preporučeno)

Ako želite koristiti domen i HTTPS:

### 1. Instaliraj Nginx

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

### 2. Konfiguriraj Nginx

Kreiraj `/etc/nginx/sites-available/frizerke`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Aktiviraj konfiguraciju

```bash
sudo ln -s /etc/nginx/sites-available/frizerke /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. SSL sertifikat

```bash
sudo certbot --nginx -d your-domain.com
```

## Monitoring

### Zdravlje aplikacije

```bash
# Health check endpoint
curl http://localhost:3000/health

# Container resources
docker stats
```

### Logovi

```bash
# App logovi
docker-compose logs -f app

# Database logovi
docker-compose logs -f postgres

# Svi logovi
docker-compose logs -f
```

## Firewall konfiguracija

```bash
# Osnovne pravila
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# Samo ako direktno pristupate aplikaciji
sudo ufw allow 3000
```

## Troubleshooting

### Česti problemi

1. **Port već zauzet**
   ```bash
   sudo netstat -tulpn | grep :3000
   sudo kill -9 <PID>
   ```

2. **Database connection greške**
   ```bash
   docker-compose logs postgres
   docker-compose restart postgres
   ```

3. **Nedovoljan disk space**
   ```bash
   docker system prune -a
   ```

### Restart sve od početka

```bash
docker-compose down -v
docker system prune -a
./deploy-hetzner.sh
```

## Update aplikacije

```bash
git pull origin working-version
docker-compose down
docker-compose up --build -d
```

## Sigurnost

1. **Promijeni default passworde u .env**
2. **Koristi jak SESSION_SECRET**
3. **Konfiguriraj firewall**
4. **Redovno ažuriraj server**
5. **Backup bazu podataka**

## Podrška

Za probleme i pitanja, kontaktiraj administratora ili otvori issue na GitHub-u.
