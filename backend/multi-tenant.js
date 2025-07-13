// Multi-tenant middleware for handling multiple salons
// Add this to your server.js before other middleware

// Multi-tenant middleware for handling multiple salons with separate pages
// Each salon gets its own subdomain and completely customized experience

const SALON_CONFIGS = {
  'marko': {
    name: 'Frizerski salon Marko',
    subtitle: 'Profesionalno muško šišanje',
    adminEmail: 'marko@salon-marko.com',
    phone: '+385 98 123 4567',
    address: 'Ilica 15, 10000 Zagreb',
    workingHours: {
      monday: '09:00-17:00',
      tuesday: '09:00-17:00', 
      wednesday: '09:00-17:00',
      thursday: '09:00-17:00',
      friday: '09:00-18:00',
      saturday: '08:00-15:00',
      sunday: 'Zatvoreno'
    },
    services: [
      { name: 'Šišanje obično', duration: 30, price: 15, description: 'Klasično muško šišanje' },
      { name: 'Šišanje fade', duration: 45, price: 20, description: 'Moderno fade šišanje' },
      { name: 'Brijanje brade', duration: 30, price: 15, description: 'Profesionalno brijanje' },
      { name: 'Styling', duration: 20, price: 10, description: 'Styling i produkt' }
    ],
    theme: {
      primaryColor: '#2C3E50',
      secondaryColor: '#3498DB',
      backgroundColor: '#F8F9FA',
      textColor: '#2C3E50',
      logo: '/logos/salon-marko.png',
      favicon: '/favicons/salon-marko.ico'
    },
    branding: {
      slogan: 'Vaš stil, naša strast!',
      about: 'Frizerski salon Marko pruža profesionalne usluge muškog šišanja već 10 godina.',
      gallery: ['/gallery/marko-1.jpg', '/gallery/marko-2.jpg', '/gallery/marko-3.jpg']
    },
    database: 'salon_marko_db',
    socialMedia: {
      facebook: 'https://facebook.com/salon.marko',
      instagram: 'https://instagram.com/salon_marko',
      google: 'https://business.google.com/salon-marko'
    }
  },
  
  'ana': {
    name: 'Beauty Salon Ana',
    subtitle: 'Ljepota je naš zanat',
    adminEmail: 'ana@beauty-salon-ana.com',
    phone: '+385 98 987 6543',
    address: 'Martićeva 10, 10000 Zagreb',
    workingHours: {
      monday: '08:00-18:00',
      tuesday: '08:00-18:00',
      wednesday: '08:00-18:00', 
      thursday: '08:00-20:00',
      friday: '08:00-20:00',
      saturday: '08:00-16:00',
      sunday: 'Zatvoreno'
    },
    services: [
      { name: 'Šišanje žensko', duration: 45, price: 25, description: 'Profesionalno žensko šišanje' },
      { name: 'Bojanje kose', duration: 90, price: 60, description: 'Bojanje s premium bojama' },
      { name: 'Pranje i fen', duration: 30, price: 18, description: 'Pranje, maska i fen frizura' },
      { name: 'Frizura za evento', duration: 60, price: 40, description: 'Svečana frizura' },
      { name: 'Tretman kose', duration: 45, price: 35, description: 'Regeneracijski tretman' }
    ],
    theme: {
      primaryColor: '#E91E63',
      secondaryColor: '#FF9800', 
      backgroundColor: '#FFF8E1',
      textColor: '#4A4A4A',
      logo: '/logos/salon-ana.png',
      favicon: '/favicons/salon-ana.ico'
    },
    branding: {
      slogan: 'Gdje ljepota postaje stvarnost',
      about: 'Beauty Salon Ana je moderna oaza ljepote u srcu Zagreba. Specijalizirani smo za žensko šišanje i tretmane kose.',
      gallery: ['/gallery/ana-1.jpg', '/gallery/ana-2.jpg', '/gallery/ana-3.jpg', '/gallery/ana-4.jpg']
    },
    database: 'salon_ana_db',
    socialMedia: {
      facebook: 'https://facebook.com/beauty.salon.ana',
      instagram: 'https://instagram.com/beauty_salon_ana',
      google: 'https://business.google.com/beauty-salon-ana'
    }
  },

  'petra': {
    name: 'Unisex Salon Petra', 
    subtitle: 'Za sve generacije',
    adminEmail: 'petra@salon-petra.com',
    phone: '+385 91 555 0123',
    address: 'Vlaška 7, 10000 Zagreb',
    workingHours: {
      monday: '09:00-17:00',
      tuesday: '09:00-17:00',
      wednesday: '09:00-17:00',
      thursday: '09:00-17:00', 
      friday: '09:00-18:00',
      saturday: '08:00-14:00',
      sunday: 'Zatvoreno'
    },
    services: [
      { name: 'Šišanje muško', duration: 30, price: 18, description: 'Muško šišanje svih uzrasta' },
      { name: 'Šišanje žensko', duration: 45, price: 25, description: 'Žensko šišanje i oblikovanje' },
      { name: 'Šišanje djeca', duration: 20, price: 12, description: 'Šišanje djece do 12 godina' },
      { name: 'Pranje + Fen', duration: 25, price: 15, description: 'Pranje kose i fen' },
      { name: 'Brijanje', duration: 25, price: 12, description: 'Klasično brijanje' }
    ],
    theme: {
      primaryColor: '#27AE60',
      secondaryColor: '#2ECC71',
      backgroundColor: '#F0F8F0', 
      textColor: '#2C3E50',
      logo: '/logos/salon-petra.png',
      favicon: '/favicons/salon-petra.ico'
    },
    branding: {
      slogan: 'Kvaliteta za cijelu obitelj',
      about: 'Unisex Salon Petra obiteljski je salon koji već 15 godina pruža kvalitetne usluge za sve uzraste.',
      gallery: ['/gallery/petra-1.jpg', '/gallery/petra-2.jpg', '/gallery/petra-3.jpg']
    },
    database: 'salon_petra_db',
    socialMedia: {
      facebook: 'https://facebook.com/salon.petra.zagreb',
      instagram: 'https://instagram.com/salon_petra_zg',
      google: 'https://business.google.com/salon-petra'
    }
  },

  // Template for new salons
  'default': {
    name: 'Frizerski salon',
    subtitle: 'Profesionalne frizerske usluge',
    adminEmail: 'admin@salon.com',
    phone: '+385 98 000 0000', 
    address: 'Zagreb, Hrvatska',
    workingHours: {
      monday: '09:00-17:00',
      tuesday: '09:00-17:00',
      wednesday: '09:00-17:00',
      thursday: '09:00-17:00',
      friday: '09:00-17:00', 
      saturday: '09:00-15:00',
      sunday: 'Zatvoreno'
    },
    services: [
      { name: 'Šišanje obično', duration: 30, price: 15, description: 'Klasično šišanje' },
      { name: 'Šišanje fade', duration: 45, price: 20, description: 'Moderno fade šišanje' },
      { name: 'Pranje i fen', duration: 20, price: 10, description: 'Pranje kose i fen' }
    ],
    theme: {
      primaryColor: '#2C3E50',
      secondaryColor: '#3498DB',
      backgroundColor: '#FFFFFF',
      textColor: '#2C3E50',
      logo: '/logos/default.png',
      favicon: '/favicons/default.ico'
    },
    branding: {
      slogan: 'Vaš frizerski salon',
      about: 'Profesionalne frizerske usluge.',
      gallery: ['/gallery/default-1.jpg']
    },
    database: 'default_db',
    socialMedia: {
      facebook: '',
      instagram: '',
      google: ''
    }
  }
};

// Middleware to detect tenant (salon) from subdomain
function detectTenant(req, res, next) {
  let tenantId = 'default';
  
  // Extract subdomain from hostname (e.g., salon-marko.yourdomain.com -> marko)
  if (req.hostname && req.hostname !== 'localhost') {
    const parts = req.hostname.split('.');
    if (parts.length > 2) {
      // Handle salon-marko.yourdomain.com format
      const subdomain = parts[0];
      if (subdomain.startsWith('salon-')) {
        tenantId = subdomain.replace('salon-', '');
      } else {
        tenantId = subdomain; // Direct subdomain like marko.yourdomain.com
      }
    }
  }
  
  // Alternatively, detect from path: /salon/marko/...
  const pathMatch = req.path.match(/^\/salon\/([^\/]+)/);
  if (pathMatch && SALON_CONFIGS[pathMatch[1]]) {
    tenantId = pathMatch[1];
  }
  
  // Set salon configuration
  req.salon = SALON_CONFIGS[tenantId] || SALON_CONFIGS.default;
  req.tenantId = tenantId;
  
  // Override email settings for this salon
  process.env.CURRENT_ADMIN_EMAIL = req.salon.adminEmail;
  
  // Add salon-specific data to response locals for templates
  res.locals.salon = req.salon;
  res.locals.tenantId = tenantId;
  
  console.log(`🏪 Tenant detected: ${tenantId} (${req.salon.name}) from ${req.hostname}${req.path}`);
  next();
}

// Database connection per tenant
function getTenantDatabase(tenantId) {
  const config = SALON_CONFIGS[tenantId] || SALON_CONFIGS.default;
  const baseUrl = process.env.DATABASE_URL.split('/').slice(0, -1).join('/');
  return `${baseUrl}/${config.database}`;
}

// Get salon configuration by ID
function getSalonConfig(tenantId) {
  return SALON_CONFIGS[tenantId] || SALON_CONFIGS.default;
}

// Get all salon configurations (for admin purposes)
function getAllSalonConfigs() {
  return SALON_CONFIGS;
}

// API endpoint to get salon configuration (for frontend)
function getSalonConfigAPI(req, res) {
  const config = {
    ...req.salon,
    // Don't send sensitive data to frontend
    adminEmail: undefined,
    database: undefined
  };
  res.json(config);
}

module.exports = {
  SALON_CONFIGS,
  detectTenant,
  getTenantDatabase,
  getSalonConfig,
  getAllSalonConfigs,
  getSalonConfigAPI
};
