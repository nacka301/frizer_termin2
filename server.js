const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcrypt');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const csrf = require('csrf');
const db = require('./db');
const emailService = require('./email');
const securityLogger = require('./security-logger');
const healthCheck = require('./health-check');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize CSRF protection
const csrfProtection = csrf();

// Debug logging
console.log('Starting server...');
console.log('Environment:', process.env.NODE_ENV);

// Start periodic health checks
healthCheck.startPeriodicChecks(5); // Every 5 minutes

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  }
}));

// Rate limiting s logiranjem
// Rate limiting DISABLED za testiranje
// const generalLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minuta
//   max: 100, // maksimalno 100 zahtjeva po IP adresi
//   message: 'Previše zahtjeva s ove IP adrese, pokušajte ponovo za 15 minuta.',
//   standardHeaders: true,
//   legacyHeaders: false,
//   handler: (req, res) => {
//     securityLogger.logRateLimit('general', req.ip, req.get('User-Agent'));
//     res.status(429).json({ error: 'Previše zahtjeva s ove IP adrese, pokušajte ponovo za 15 minuta.' });
//   }
// });

// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minuta
//   max: 5, // maksimalno 5 login pokušaja
//   message: 'Previše neuspješnih pokušaja prijave, pokušajte ponovo za 15 minuta.',
//   standardHeaders: true,
//   legacyHeaders: false,
//   handler: (req, res) => {
//     securityLogger.logRateLimit('auth', req.ip, req.get('User-Agent'));
//     res.status(429).json({ error: 'Previše neuspješnih pokušaja prijave, pokušajte ponovo za 15 minuta.' });
//   }
// });

// const bookingLimiter = rateLimit({
//   windowMs: 60 * 60 * 1000, // 1 sat
//   max: 100, // maksimalno 100 rezervacija po satu
//   message: 'Previše rezervacija u kratkom vremenu, pokušajte ponovo za sat vremena.',
//   standardHeaders: true,
//   legacyHeaders: false,
//   handler: (req, res) => {
//     securityLogger.logRateLimit('booking', req.ip, req.get('User-Agent'));
//     res.status(429).json({ error: 'Previše rezervacija u kratkom vremenu, pokušajte ponovo za sat vremena.' });
//   }
// });

// app.use(generalLimiter); // DISABLED

// Session configuration
const sessionPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

app.use(session({
  store: new pgSession({
    pool: sessionPool,
    tableName: 'session'
  }),
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Disable secure for now to allow HTTP testing
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
  }
}));

// CORS configuration for Render
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://frizerke-html.onrender.com', 'https://your-app-name.onrender.com'] 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// Middleware to check if user is authenticated
function requireAuth(req, res, next) {
  if (!req.session || !req.session.isAdmin) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Endpoint za provjeru dostupnosti
app.get('/api/check-availability', async (req, res) => {
  const { date, time } = req.query;
  try {
    const isAvailable = await db.checkAvailability(date, time);
    res.json({ available: isAvailable });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ error: 'Interna greška servera.' });
  }
});

// Endpoint za rezervaciju termina
app.post('/api/book', async (req, res) => {
  const { ime, prezime, mobitel, email, service, duration, price, datetime } = req.body;
  if (!ime || !prezime || !mobitel || !email || !service || !duration || !price || !datetime) {
    securityLogger.logBooking(false, { reason: 'Missing required fields' }, req.ip, req.get('User-Agent'));
    return res.status(400).json({ error: 'Svi podaci su obavezni.' });
  }
  try {
    const booked = await db.bookAppointment(ime, prezime, mobitel, email, service, duration, price, datetime);
    if (booked) {
      // Log successful booking
      securityLogger.logBooking(true, { ime, prezime, service, datetime }, req.ip, req.get('User-Agent'));
      
      // Send email notifications
      const appointmentDetails = { ime, prezime, service, datetime, price };
      
      // Send confirmation to customer
      emailService.sendBookingConfirmation(email, appointmentDetails)
        .catch(err => console.error('Failed to send customer email:', err));
      
      // Send notification to admin
      emailService.sendAdminNotification({ ...appointmentDetails, mobitel, email })
        .catch(err => console.error('Failed to send admin email:', err));
      
      // Parsiranje datetime-a za lepši prikaz u modalu
      const [datePart, timePart] = datetime.split('T');
      res.json({ 
        success: true, 
        message: 'Termin uspješno rezerviran! Potvrda je poslana na vašu email adresu.', 
        appointment: { 
          ime, 
          prezime, 
          service, 
          date: datePart,
          time: timePart,
          datetime 
        } 
      });
    } else {
      securityLogger.logBooking(false, { reason: 'Slot no longer available' }, req.ip, req.get('User-Agent'));
      res.status(409).json({ error: 'Termin više nije dostupan.' });
    }
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ error: 'Greška pri rezervaciji termina.' });
  }
});

// Endpoint za dohvaćanje dostupnih termina
app.get('/api/available-slots', async (req, res) => {
  const { date, service } = req.query;
  if (!date || !service) {
    return res.status(400).json({ error: 'Datum i usluga su obavezni parametri.' });
  }
  try {
    const availableSlots = await db.getAvailableSlots(date, service);
    res.json(availableSlots);
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({ error: 'Interna greška servera.' });
  }
});

// Endpoint za dohvaćanje dostupnih termina za određeni datum
app.get('/api/available-times', async (req, res) => {
  const { date } = req.query;
  
  if (!date) {
    return res.status(400).json({ error: 'Datum je obavezan.' });
  }
  
  try {
    // Dohvati sva već rezervirana vremena za taj datum
    const bookedTimes = await db.getBookedTimesForDate(date);
    res.json({ bookedTimes });
  } catch (error) {
    console.error('Error fetching available times:', error);
    res.status(500).json({ error: 'Interna greška servera.' });
  }
});

// Admin login endpoint
app.post('/api/admin-login', async (req, res) => {
  console.log('Admin login attempt:', req.body);
  const { username, password } = req.body;

  try {
    // In a real application, you would fetch this from a database
    const adminUsername = 'admin';
    const adminPasswordHash = '$2b$10$aXguERktMujmpIce1UBaVuZCmjVxk5H9rINLu4FGGD.F70oQ4EJU.'; // bcrypt hash for 'password123'

    if (username === adminUsername && await bcrypt.compare(password, adminPasswordHash)) {
      req.session.isAdmin = true;
      req.session.username = username;
      console.log('Admin login successful');
      
      // Log successful login
      securityLogger.logLogin(true, username, req.ip, req.get('User-Agent'));
      
      res.json({ success: true, message: 'Login successful' });
    } else {
      console.log('Admin login failed');
      
      // Log failed login
      securityLogger.logLogin(false, username, req.ip, req.get('User-Agent'));
      
      res.status(401).json({ error: 'Neispravno korisničko ime ili lozinka' });
    }
  } catch (error) {
    console.error('Error during admin login:', error);
    
    // Log error
    securityLogger.logError(error, 'admin-login', req.ip, req.get('User-Agent'));
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin logout endpoint
app.post('/api/admin-logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ error: 'Could not log out' });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

// Check admin session
app.get('/api/admin-session', (req, res) => {
  if (req.session && req.session.isAdmin) {
    res.json({ isAdmin: true, username: req.session.username });
  } else {
    res.json({ isAdmin: false });
  }
});

// Get appointments for a specific date
app.get('/api/admin/appointments', requireAuth, async (req, res) => {
  const { date } = req.query;
  console.log('Fetching appointments for date:', date);
  
  try {
    const appointments = await db.getAppointmentsByDate(date);
    console.log('Found appointments:', appointments);
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete appointment
app.delete('/api/admin/appointments/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  console.log('Deleting appointment with ID:', id);
  
  try {
    const deleted = await db.deleteAppointment(id);
    if (deleted) {
      res.json({ success: true, message: 'Appointment deleted successfully' });
    } else {
      res.status(404).json({ error: 'Appointment not found' });
    }
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Rute za serviranje HTML stranica
app.get('/rezervacija', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'rezervacija.html'));
});

app.get('/admin-login', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-login.html'));
});

app.get('/admin-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin_dashboard.html'));
});

// Root route
// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const healthStatus = await healthCheck.performHealthCheck();
    const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(healthStatus);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Security analytics endpoint (admin only)
app.get('/api/security-analytics', requireAuth, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const analytics = await securityLogger.analyzeSecurityLogs(days);
    res.json(analytics);
  } catch (error) {
    securityLogger.logError(error, 'security-analytics', req.ip, req.get('User-Agent'));
    res.status(500).json({ error: 'Failed to generate security analytics' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Općeniti error handler s logiranjem
app.use((err, req, res, next) => {
  console.error(err.stack);
  securityLogger.logError(err, 'general-error', req.ip, req.get('User-Agent'));
  res.status(500).send('Nešto je pošlo po zlu!');
});

// Pokreni server
app.listen(PORT, () => {
  console.log(`Server je pokrenut na portu ${PORT}`);
});
