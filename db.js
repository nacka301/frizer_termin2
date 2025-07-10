const { Pool } = require('pg');
const moment = require('moment');

// Konfiguracija pool-a za povezivanje s bazom podataka
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Dodajemo error handling za pool
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Funkcija za inicijalizaciju baze podataka
async function initializeDatabase() {
  const client = await pool.connect();
  try {
    await client.query('SET datestyle = \'ISO, DMY\'');
    
    // Create appointments table
    await client.query(`
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
    
    // Create session table for express-session
    await client.query(`
      CREATE TABLE IF NOT EXISTS session (
        sid VARCHAR NOT NULL COLLATE "default" PRIMARY KEY,
        sess JSON NOT NULL,
        expire TIMESTAMP(6) NOT NULL
      )
      WITH (OIDS=FALSE)
    `);
    
    console.log('Database initialized with appointments and session tables');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    client.release();
  }
}

// Funkcija za provjeru dostupnosti termina
async function checkAvailability(date, time) {
  try {
    const formattedDatetime = moment(`${date} ${time}`, "DD.MM.YYYY HH:mm").format("YYYY-MM-DD HH:mm:ss");
    const result = await pool.query('SELECT COUNT(*) as count FROM appointments WHERE datetime = $1', [formattedDatetime]);
    return parseInt(result.rows[0].count) === 0;
  } catch (error) {
    console.error('Error checking availability:', error);
    throw error;
  }
}

// Funkcija za rezervaciju termina
async function bookAppointment(ime, prezime, mobitel, email, service, duration, price, datetime) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const [date, time] = datetime.split('T');
    const isAvailable = await checkAvailability(date, time);
    if (!isAvailable) {
      await client.query('ROLLBACK');
      return false;
    }
    const formattedDatetime = moment(datetime, "DD.MM.YYYYTHH:mm").format("YYYY-MM-DD HH:mm:ss");
    const result = await client.query(
      'INSERT INTO appointments (ime, prezime, mobitel, email, service, duration, price, datetime) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [ime, prezime, mobitel, email, service, parseInt(duration), parseFloat(price), formattedDatetime]
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

// Funkcija za dohvaćanje svih termina
async function getAllAppointments() {
    try {
        const result = await pool.query('SELECT *, TO_CHAR(datetime, \'YYYY-MM-DD"T"HH24:MI:SS\') as formatted_datetime FROM appointments ORDER BY datetime');
        return result.rows.map(row => ({
            ...row,
            datetime: row.formatted_datetime
        }));
    } catch (error) {
        console.error('Error getting all appointments:', error);
        return [];
    }
}

// Funkcija za dohvaćanje dostupnih termina
async function getAvailableSlots(date, service) {
  try {
    const workingHours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
    const formattedDate = moment(date, "DD.MM.YYYY").format("YYYY-MM-DD");
    const result = await pool.query(
      'SELECT TO_CHAR(datetime, \'HH24:MI\') as time FROM appointments WHERE DATE(datetime) = $1 AND service = $2',
      [formattedDate, service]
    );
    const reservedSlots = result.rows.map(row => row.time);
    return workingHours.filter(slot => !reservedSlots.includes(slot));
  } catch (error) {
    console.error('Error getting available slots:', error);
    throw error;
  }
}

// Funkcija za dohvaćanje termina za određeni datum
async function getAppointmentsByDate(date) {
  try {
    const formattedDate = moment(date, "YYYY-MM-DD").format("YYYY-MM-DD");
    const result = await pool.query(
      'SELECT *, TO_CHAR(datetime, \'HH24:MI\') as time FROM appointments WHERE DATE(datetime) = $1 ORDER BY datetime',
      [formattedDate]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting appointments by date:', error);
    throw error;
  }
}

// Funkcija za brisanje termina
async function deleteAppointment(id) {
  try {
    const result = await pool.query('DELETE FROM appointments WHERE id = $1 RETURNING *', [id]);
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error deleting appointment:', error);
    throw error;
  }
}

// Izvoz funkcija za korištenje u drugim dijelovima aplikacije
module.exports = {
  pool,
  initializeDatabase,
  checkAvailability,
  bookAppointment,
  getAllAppointments,
  getAppointmentsByDate,
  deleteAppointment,
  getAvailableSlots
};

// Inicijalizacija baze podataka pri pokretanju
initializeDatabase();