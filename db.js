const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        ime VARCHAR(50) NOT NULL,
        prezime VARCHAR(50) NOT NULL,
        mobitel VARCHAR(15) NOT NULL,
        email VARCHAR(100) NOT NULL,
        service VARCHAR(100) NOT NULL,
        duration SMALLINT NOT NULL,
        price NUMERIC(6,2) NOT NULL,
        datetime TIMESTAMP NOT NULL
      )
    `);
    console.log('Database initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Pozivamo funkciju odmah da inicijaliziramo bazu
initializeDatabase();

async function checkAvailability(date, time) {
  console.log('Checking availability for:', date, time);
  try {
    const result = await pool.query('SELECT COUNT(*) as count FROM appointments WHERE datetime = $1', [`${date} ${time}`]);
    console.log('Result:', result.rows[0]);
    return parseInt(result.rows[0].count) === 0;
  } catch (error) {
    console.error('Error checking availability:', error);
    return false;
  }
}

// U db.js
async function bookAppointment(ime, prezime, mobitel, email, service, duration, price, datetime) {
  console.log('Booking appointment with:', { ime, prezime, mobitel, email, service, duration, price, datetime });
  try {
    const result = await pool.query(
      'INSERT INTO appointments (ime, prezime, mobitel, email, service, duration, price, datetime) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [ime, prezime, mobitel, email, service, parseInt(duration), parseFloat(price), datetime]
    );
    console.log('Insertion result:', result.rows[0]);
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error booking appointment:', error);
    return false;
  }
}

async function getAllAppointments() {
  try {
    const result = await pool.query('SELECT * FROM appointments ORDER BY datetime');
    console.log('All appointments:', result.rows);
    return result.rows;
  } catch (error) {
    console.error('Error getting all appointments:', error);
    return [];
  }
}

async function dohvatiSveRezervacije() {
  try {
    const result = await pool.query('SELECT * FROM appointments ORDER BY datetime');
    return result.rows;
  } catch (error) {
    console.error('Error dohvatiSveRezervacije:', error);
    return [];
  }
}

module.exports = {
  initializeDatabase,
  checkAvailability,
  bookAppointment,
  getAllAppointments,
  dohvatiSveRezervacije
};