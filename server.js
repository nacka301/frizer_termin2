const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./db');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint za provjeru dostupnosti
app.get('/api/check-availability', (req, res) => {
  const { date, time } = req.query;
  const isAvailable = db.checkAvailability(date, time);
  res.json({ available: isAvailable });
});
app.get('/api/appointments', (req, res) => {
  try {
    const appointments = db.getAllAppointments();
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Rezervacija termina
app.post('/api/rezervacija', async (req, res) => {
  const { ime, datum, usluga } = req.body;
  try {
    await db.rezervirajTermin(ime, datum, usluga);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Endpoint za rezervaciju termina
app.post('/api/book', (req, res) => {
  const { ime, prezime, mobitel, email, service, duration, price, datetime } = req.body;
  try {
    const booked = db.bookAppointment(ime, prezime, mobitel, email, service, duration, price, datetime);
    if (booked) {
      res.json({ success: true, message: 'Termin uspješno rezerviran!' });
    } else {
      res.status(400).json({ error: 'Nije moguće rezervirati termin.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Greška pri rezervaciji termina.' });
  }
});

// Endpoint za dohvaćanje svih rezervacija
app.get('/api/appointments', (req, res) => {
  try {
    const appointments = db.getAllAppointments();
    res.json(appointments);
  } catch (error) {
    console.error('Greška pri dohvaćanju rezervacija:', error);
    res.status(500).json({ error: 'Interna greška servera.' });
  }
});

// Nova ruta za vraćanje svih rezervacija
app.get('/api/rezervacije', (req, res) => {
  db.dohvatiSveRezervacije()
    .then((rezervacije) => {
      res.json(rezervacije);
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

// Serve rezervacija.html for /rezervacija route
app.get('/rezervacija', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'rezervacija.html'));
});

// Pokreni server
app.listen(PORT, () => {
console.log(`Server je pokrenut na http://localhost:${PORT}`);
});
// Općeniti error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Nešto je pošlo po zlu!');
});