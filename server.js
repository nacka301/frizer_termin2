const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// Povezivanje s bazom podataka
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the SQLite database.');
});

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

// Endpoint za dohvaćanje svih rezervacija
app.get('/api/appointments', async (req, res) => {
  try {
    const appointments = await db.getAllAppointments();
    const events = appointments.map(appointment => ({
      title: `${appointment.ime} ${appointment.prezime} - ${appointment.service}`,
      start: appointment.datetime
    }));
    res.json(events);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin login endpoint
app.post('/api/admin-login', async (req, res) => {
  const { username, password } = req.body;

  if (username === admin.username && await bcrypt.compare(password, admin.password)) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Neispravno korisničko ime ili lozinka' });
  }
});

// Middleware za provjeru JWT tokena
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Zaštićena ruta za admin dashboard
app.get('/api/admin-dashboard', authenticateToken, (req, res) => {
  res.json({ message: 'Dobrodošli na admin nadzornu ploču!' });
});

// Ruta za dohvaćanje rezervacija
app.get('/api/reservations', authenticateToken, (req, res) => {
  const date = req.query.date;
  db.all(`SELECT * FROM reservations WHERE date = ?`, [date], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Ruta za dohvaćanje usluga
app.get('/api/services', authenticateToken, (req, res) => {
  db.all(`SELECT * FROM services`, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Ruta za dodavanje nove usluge
app.post('/api/services', authenticateToken, (req, res) => {
  const { name, duration, price } = req.body;
  db.run(`INSERT INTO services (name, duration, price) VALUES (?, ?, ?)`, [name, duration, price], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID });
  });
});

// Ruta za uređivanje rezervacije
app.put('/api/reservations/:id', authenticateToken, (req, res) => {
  const { date, time, name, service } = req.body;
  db.run(`UPDATE reservations SET date = ?, time = ?, name = ?, service = ? WHERE id = ?`, 
    [date, time, name, service, req.params.id], 
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ changes: this.changes });
    }
  );
});

// Ruta za brisanje rezervacije
app.delete('/api/reservations/:id', authenticateToken, (req, res) => {
  db.run(`DELETE FROM reservations WHERE id = ?`, req.params.id, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ changes: this.changes });
  });
});

// Ruta za uređivanje usluge
app.put('/api/services/:id', authenticateToken, (req, res) => {
  const { name, duration, price } = req.body;
  db.run(`UPDATE services SET name = ?, duration = ?, price = ? WHERE id = ?`, 
    [name, duration, price, req.params.id], 
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ changes: this.changes });
    }
  );
});

// Ruta za brisanje usluge
app.delete('/api/services/:id', authenticateToken, (req, res) => {
  db.run(`DELETE FROM services WHERE id = ?`, req.params.id, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ changes: this.changes });
  });
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

// Općeniti error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Nešto je pošlo po zlu!');
});

// Simulirani podaci administratora (u stvarnosti, ovo bi bilo u bazi podataka)
const admin = {
  username: 'admin',
  password: '$2b$10$X4kv7j5ZcG2bYOvhXkoOyeLdNrA9vVVgSSadlQAq1MjQ4CN5XuQOy' // bcrypt hash za 'password123'
};

const JWT_SECRET = 'vaš_tajni_ključ'; // U produkciji, ovo bi trebalo biti u env varijabli

// Pokreni server
app.listen(PORT, () => {
  console.log(`Server je pokrenut na portu ${PORT}`);
});
