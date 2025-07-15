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
const db = require('./backend/db');
const emailService = require('./backend/email');
const securityLogger = require('./backend/security-logger');
const healthCheck = require('./backend/health-check');
const { detectTenant, getSalonConfigAPI } = require('./backend/multi-tenant');

const app = express();
const PORT = process.env.PORT || 8000;

// Initialize CSRF protection
const csrfProtection = csrf();

// Debug logging
console.log('Starting server...');
console.log('Environment:', process.env.NODE_ENV);

// Add tenant detection middleware EARLY in the pipeline
app.use(detectTenant);

// Environment validation for production
if (process.env.NODE_ENV === 'production') {
  const requiredEnvVars = ['DATABASE_URL', 'SESSION_SECRET', 'EMAIL_USER', 'EMAIL_PASS'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars.join(', '));
    process.exit(1);
  }
  
  if (process.env.SESSION_SECRET === 'your-secret-key-change-in-production') {
    console.error('❌ Please change SESSION_SECRET from default value in production!');
    process.exit(1);
  }
  
  console.log('✅ All required environment variables are set');
}

// Start periodic health checks
healthCheck.startPeriodicChecks(5); // Every 5 minutes

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: [
        "'self'",
        "https://cdn.jsdelivr.net",
        "https://fonts.googleapis.com",
        "https://fonts.gstatic.com"
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        "https://cdn.jsdelivr.net"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "https://cdn.jsdelivr.net"
      ],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://cdn.jsdelivr.net"
      ],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));



// Session configuration
const sessionPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Trust proxy for correct secure cookies behind reverse proxy (Coolify, etc.)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use(session({
  store: new pgSession({
    pool: sessionPool,
    tableName: 'session'
  }),
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: false,
    sameSite: 'lax'
  }
}));

// CORS configuration for Coolify deployment
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, Postman, etc.)
        if (!origin) return callback(null, true);
        
        // For Coolify, allow the domain from environment variable
        const allowedOrigins = [
          process.env.APP_URL, // Coolify sets this automatically
          process.env.COOLIFY_URL,
          origin // Allow same origin
        ].filter(Boolean);
        
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      }
    : ['http://localhost:8000', 'http://127.0.0.1:8000'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to check if user is authenticated
function requireAuth(req, res, next) {
  if (!req.session || !req.session.isAdmin) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// API endpoint to get salon configuration for frontend
app.get('/api/salon-config', getSalonConfigAPI);

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
  console.log('Booking request received:', req.body); // DEBUG
  const { ime, prezime, mobitel, email, service, duration, price, datetime } = req.body;
  if (!ime || !prezime || !mobitel || !email || !service || !duration || !price || !datetime) {
    console.log('Missing fields detected'); // DEBUG
    securityLogger.logBooking(false, { reason: 'Missing required fields' }, req.ip, req.get('User-Agent'));
    return res.status(400).json({ error: 'Svi podaci su obavezni.' });
  }
  try {
    console.log('DEBUG: Before calling db.bookAppointment...'); // DEBUG
    console.log('DEBUG: Parameters:', { ime, prezime, mobitel, email, service, duration, price, datetime }); // DEBUG
    
    let booked;
    try {
      booked = await db.bookAppointment(ime, prezime, mobitel, email, service, duration, price, datetime);
      console.log('DEBUG: db.bookAppointment completed successfully, result:', booked); // DEBUG
    } catch (dbError) {
      console.error('DEBUG: db.bookAppointment failed with error:', dbError); // DEBUG
      console.error('DEBUG: DB Error message:', dbError.message); // DEBUG
      console.error('DEBUG: DB Error stack:', dbError.stack); // DEBUG
      throw dbError; // Re-throw to be caught by outer catch
    }
    
    if (booked) {
      console.log('DEBUG: Booking successful, sending emails...'); // DEBUG
      // Log successful booking
      securityLogger.logBooking(true, { ime, prezime, service, datetime }, req.ip, req.get('User-Agent'));
      
      // Send email notifications
      const appointmentDetails = { ime, prezime, service, datetime, price };
      
      // Send confirmation to customer
      console.log('DEBUG: Sending customer email to:', email); // DEBUG
      emailService.sendBookingConfirmation(email, appointmentDetails)
        .then(success => console.log('DEBUG: Customer email sent:', success))
        .catch(err => console.error('Failed to send customer email:', err));
      
      // Send notification to admin
      console.log('DEBUG: Sending admin email...'); // DEBUG
      emailService.sendAdminNotification({ ...appointmentDetails, mobitel, email })
        .then(success => console.log('DEBUG: Admin email sent:', success))
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
      console.log('Booking failed - slot not available'); // DEBUG
      securityLogger.logBooking(false, { reason: 'Slot no longer available' }, req.ip, req.get('User-Agent'));
      res.status(409).json({ error: 'Termin više nije dostupan.' });
    }
  } catch (error) {
    console.error('DEBUG: Main catch block triggered'); // DEBUG
    console.error('DEBUG: Error booking appointment:', error); // ENHANCED DEBUG
    console.error('DEBUG: Error message:', error.message); // ENHANCED DEBUG
    console.error('DEBUG: Error stack:', error.stack); // ENHANCED DEBUG
    
    // For debugging, include error details in response (remove in production)
    res.status(500).json({ 
      error: 'Greška pri rezervaciji termina.',
      debug: {
        message: error.message,
        name: error.name,
        code: error.code || 'UNKNOWN'
      }
    });
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

// Debug endpoint za provjeru postojanja rezervacija
app.get('/api/debug/appointments', async (req, res) => {
  try {
    const appointments = await db.getAllAppointments();
    res.json({ 
      count: appointments.length,
      appointments: appointments.slice(-5) // Prikaži zadnjih 5
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Rute za serviranje HTML stranica
app.get('/rezervacija', (req, res) => {
  // res.sendFile(path.join(__dirname, 'frontend', 'rezervacija.html'));
});

app.get('/admin-login', (req, res) => {
  // res.sendFile(path.join(__dirname, 'frontend', 'admin-login.html'));
});

app.get('/admin-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html'));
});

// Root route
// Health check endpoint
// Health check endpoint (osnovni)
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

// Full health check endpoint (testira bazu i backend)
app.get('/api/health-full', async (req, res) => {
  let dbStatus = 'unknown';
  let dbError = null;
  try {
    // Pokušaj dohvatiti 1 termin iz baze
    const appointments = await db.getAllAppointments();
    dbStatus = 'ok';
  } catch (error) {
    dbStatus = 'error';
    dbError = error.message;
  }
  res.json({
    app: 'ok',
    db: dbStatus,
    dbError,
    timestamp: new Date().toISOString()
  });
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

// Debug endpoint za testiranje phone validacije
app.post('/api/debug/phone', async (req, res) => {
  const { phone } = req.body;
  console.log('DEBUG PHONE TEST - Input:', phone);
  
  try {
    const db = require('./db');
    
    // Test sanitizePhone
    const sanitized = phone ? phone.trim().replace(/[<>"\\\/]/g, '').substring(0, 20) : '';
    console.log('DEBUG PHONE TEST - Sanitized:', sanitized);
    
    // Test regex patterns
    const internationalRegex = /^\+[1-9]\d{6,16}$/;
    const localRegex = /^0[1-9]\d{7,8}$/;
    const cleanPhone = sanitized.replace(/[\s\-()\.]/g, '');
    
    console.log('DEBUG PHONE TEST - Cleaned:', cleanPhone);
    console.log('DEBUG PHONE TEST - International match:', internationalRegex.test(cleanPhone));
    console.log('DEBUG PHONE TEST - Local match:', localRegex.test(cleanPhone));
    
    res.json({
      input: phone,
      sanitized: sanitized,
      cleaned: cleanPhone,
      internationalMatch: internationalRegex.test(cleanPhone),
      localMatch: localRegex.test(cleanPhone),
      isValid: internationalRegex.test(cleanPhone) || localRegex.test(cleanPhone)
    });
  } catch (error) {
    console.error('DEBUG PHONE TEST - Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Debug endpoint za testiranje bookAppointment parametara
app.post('/api/debug/booking', async (req, res) => {
  const { ime, prezime, mobitel, email, service, duration, price, datetime } = req.body;
  
  console.log('DEBUG BOOKING TEST - All params:', { ime, prezime, mobitel, email, service, duration, price, datetime });
  
  try {
    // Test svaki korak validacije
    const db = require('./db');
    
    // Test sanitization
    const sanitizedIme = ime ? ime.trim().replace(/[<>"\\/]/g, '').substring(0, 100) : '';
    const sanitizedPrezime = prezime ? prezime.trim().replace(/[<>"\\/]/g, '').substring(0, 100) : '';
    const sanitizedMobitel = mobitel ? mobitel.trim().replace(/[<>"\\\/]/g, '').substring(0, 20) : '';
    const sanitizedService = service ? service.trim().replace(/[<>"\\/]/g, '').substring(0, 100) : '';
    
    console.log('DEBUG BOOKING TEST - After sanitization:', { sanitizedIme, sanitizedPrezime, sanitizedMobitel, sanitizedService });
    
    // Test individual validations
    const validations = {
      imeValid: sanitizedIme && sanitizedIme.length >= 2,
      prezimeValid: sanitizedPrezime && sanitizedPrezime.length >= 2,
      emailValid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 100,
      serviceValid: ['Šišanje obično', 'Šišanje fade', 'Pranje i fen', 'Brijanje brade', 'Styling'].includes(sanitizedService),
      durationValid: !isNaN(duration) && duration >= 10 && duration <= 120,
      priceValid: !isNaN(price) && price >= 5 && price <= 100
    };
    
    // Test phone validation
    const cleanPhone = sanitizedMobitel.replace(/[\s\-()\.]/g, '');
    const internationalRegex = /^\+[1-9]\d{6,16}$/;
    const localRegex = /^0[1-9]\d{7,8}$/;
    validations.phoneValid = internationalRegex.test(cleanPhone) || localRegex.test(cleanPhone);
    
    // Test datetime validation
    const moment = require('moment');
    const parsed = moment(datetime);
    validations.datetimeValid = parsed.isValid() && parsed.isAfter(moment()) && 
      parsed.hour() >= 9 && parsed.hour() < 17 && parsed.day() !== 0;
    
    console.log('DEBUG BOOKING TEST - Validations:', validations);
    
    res.json({
      params: { ime, prezime, mobitel, email, service, duration, price, datetime },
      sanitized: { sanitizedIme, sanitizedPrezime, sanitizedMobitel, sanitizedService },
      validations: validations,
      allValid: Object.values(validations).every(v => v === true)
    });
    
  } catch (error) {
    console.error('DEBUG BOOKING TEST - Error:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

// Pokreni server
app.listen(PORT, () => {
  console.log(`Server je pokrenut na portu ${PORT}`);
});
