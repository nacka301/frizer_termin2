const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./db');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

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
app.post('/api/admin-login', (req, res) => {
  const { username, password } = req.body;
  // Ovdje biste trebali implementirati pravu autentifikaciju
  // Ovo je samo primjer i nije sigurno za produkciju
  if (username === 'admin' && password === 'password') {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false });
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

// Općeniti error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Nešto je pošlo po zlu!');
});

// Pokreni server
app.listen(PORT, () => {
  console.log(`Server je pokrenut na portu ${PORT}`);
});