const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'appointments.db'));

function initializeDatabase() {
  db.exec(`
    DROP TABLE IF EXISTS appointments;
    CREATE TABLE appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ime TEXT,
      prezime TEXT,
      mobitel TEXT,
      email TEXT,
      service TEXT,
      duration TEXT,
      price TEXT,
      datetime TEXT
    )
  `);
  console.log('Database initialized');
}

// Pozivamo funkciju odmah da inicijaliziramo bazu
initializeDatabase();

function checkAvailability(date, time) {
  console.log('Checking availability for:', date, time);
  const stmt = db.prepare('SELECT COUNT(*) as count FROM appointments WHERE datetime = ?');
  const result = stmt.get(`${date}T${time}`);
  console.log('Result:', result);
  return result.count === 0;
}

// U db.js
function bookAppointment(ime, prezime, mobitel, email, service, duration, price, datetime) {
  console.log('Booking appointment with:', { ime, prezime, mobitel, email, service, duration, price, datetime });
  try {
    const stmt = db.prepare('INSERT INTO appointments (ime, prezime, mobitel, email, service, duration, price, datetime) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    const info = stmt.run(ime, prezime, mobitel, email, service, duration, price, datetime);
    console.log('Insertion result:', info);
    if (info.changes > 0) {
      console.log('Appointment successfully booked');
      return true;
    } else {
      console.log('No changes made to the database');
      return false;
    }
  } catch (error) {
    console.error('Error booking appointment:', error);
    return false;
  }
}

function getAllAppointments() {
  const stmt = db.prepare('SELECT * FROM appointments');
  const results = stmt.all();
  console.log('All appointments:', results);
  return results;
}

function dohvatiSveRezervacije() {
  const stmt = db.prepare('SELECT * FROM appointments');
  return stmt.all();
}

module.exports = {
  initializeDatabase,
  checkAvailability,
  bookAppointment,
  getAllAppointments,
  dohvatiSveRezervacije
};