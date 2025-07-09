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
  try {
    const result = await pool.query('SELECT COUNT(*) as count FROM appointments WHERE datetime = $1', [`${date}T${time}`]);
    return parseInt(result.rows[0].count) === 0;
  } catch (error) {
    console.error('Error checking availability:', error);
    throw error;
  }
}

// U db.js
async function bookAppointment(ime, prezime, mobitel, email, service, duration, price, datetime) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const isAvailable = await checkAvailability(datetime.split('T')[0], datetime.split('T')[1]);
    if (!isAvailable) {
      await client.query('ROLLBACK');
      return false;
    }
    const result = await client.query(
      'INSERT INTO appointments (ime, prezime, mobitel, email, service, duration, price, datetime) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [ime, prezime, mobitel, email, service, parseInt(duration), parseFloat(price), datetime]
    );
    await client.query('COMMIT');
    console.log('Appointment booked:', result.rows[0]);
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error booking appointment:', error);
    return false;
  } finally {
    client.release();
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



module.exports = {
  initializeDatabase,
  checkAvailability,
  bookAppointment,
  getAllAppointments,
  getAvailableSlots
};
async function getAvailableSlots(date, service) {
  try {
    const workingHours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
    const result = await pool.query(
      'SELECT TIME(datetime) as time FROM appointments WHERE DATE(datetime) = $1 AND service = $2',
      [date, service]
    );
    const reservedSlots = result.rows.map(row => row.time);
    return workingHours.filter(slot => !reservedSlots.includes(slot));
  } catch (error) {
    console.error('Error getting available slots:', error);
    throw error;
  }
}