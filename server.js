const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcrypt');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Debug logging
console.log('Starting server...');
console.log('Environment:', process.env.NODE_ENV);

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
    return res.status(400).json({ error: 'Svi podaci su obavezni.' });
  }
  try {
    const booked = await db.bookAppointment(ime, prezime, mobitel, email, service, duration, price, datetime);
    if (booked) {
      res.json({ success: true, message: 'Termin uspješno rezerviran!', appointment: { ime, prezime, service, datetime } });
    } else {
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

// Admin login endpoint
app.post('/api/admin-login', async (req, res) => {
  console.log('Admin login attempt:', req.body);
  const { username, password } = req.body;

  try {
    // In a real application, you would fetch this from a database
    const adminUsername = 'admin';
    const adminPasswordHash = '$2b$10$Z3geB0GyQdNF2k6pU.3PDO./rTustA8q2KFo/vo9dAWPXN5eijjXOe'; // bcrypt hash for 'password123'

    if (username === adminUsername && await bcrypt.compare(password, adminPasswordHash)) {
      req.session.isAdmin = true;
      req.session.username = username;
      console.log('Admin login successful');
      res.json({ success: true, message: 'Login successful' });
    } else {
      console.log('Admin login failed');
      res.status(401).json({ error: 'Neispravno korisničko ime ili lozinka' });
    }
  } catch (error) {
    console.error('Error during admin login:', error);
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
  res.sendFile(path.join(__dirname, 'admin-dashboard.html'));
});

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Općeniti error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Nešto je pošlo po zlu!');
});

// Pokreni server
app.listen(PORT, () => {
  console.log(`Server je pokrenut na portu ${PORT}`);
});
