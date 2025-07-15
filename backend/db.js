const { Pool } = require('pg');
const fs = require('fs');
const moment = require('moment');

// Funkcije za sanitizaciju i validaciju input podataka
function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/[<>"\\/]/g, '').substring(0, 100);
}

function sanitizePhone(phone) {
  if (typeof phone !== 'string') return '';
  // Za telefone dopusti +, brojevi, razmaci, crtice, zagrade
  return phone.trim().replace(/[<>"\\\/]/g, '').substring(0, 20);
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 100;
}

function validatePhone(phone) {
  console.log('DEBUG: Validating phone:', phone, 'type:', typeof phone);
  
  if (!phone || typeof phone !== 'string') {
    console.log('DEBUG: Phone is empty or not string');
    return false;
  }
  
  // Ukloni sve što nije broj ili +
  const cleanPhone = phone.replace(/[\s\-()\.]/g, '');
  console.log('DEBUG: Cleaned phone:', cleanPhone);
  console.log('DEBUG: Cleaned phone length:', cleanPhone.length);
  console.log('DEBUG: First char after +:', cleanPhone.charAt(1));
  console.log('DEBUG: Digits after +:', cleanPhone.substring(1));
  console.log('DEBUG: Digits count after +:', cleanPhone.substring(1).length);
  
  // E.164 međunarodni format: + i 7-15 znamenki (povećano na 16 za sigurnost)
  const internationalRegex = /^\+[1-9]\d{6,16}$/;
  
  // Hrvatski lokalni format: 0 i 8-9 znamenki
  const localRegex = /^0[1-9]\d{7,8}$/;
  
  const intlMatch = internationalRegex.test(cleanPhone);
  const localMatch = localRegex.test(cleanPhone);
  
  console.log('DEBUG: International regex test:', intlMatch);
  console.log('DEBUG: Local regex test:', localMatch);
  console.log('DEBUG: Testing specific patterns:');
  console.log('DEBUG: Starts with +?', cleanPhone.startsWith('+'));
  console.log('DEBUG: Has only digits after +?', /^\+\d+$/.test(cleanPhone));
  
  const isValid = intlMatch || localMatch;
  console.log('DEBUG: Phone validation result:', isValid);
  
  return isValid;
}

function validateService(service) {
  const allowedServices = [
    'Šišanje obično', 
    'Šišanje fade', 
    'Šišanje žensko',
    'Šišanje žensko farbanje',
    'Pranje i fen', 
    'Brijanje brade', 
    'Styling'
  ];
  return allowedServices.includes(service);
}

function validateDateTime(datetime) {
  const parsed = moment(datetime);
  if (!parsed.isValid()) return false;
  
  // Provjeri da li je datum u budućnosti
  const now = moment();
  if (parsed.isBefore(now)) return false;
  
  // Provjeri da li je u radnom vremenu (9-17h)
  const hour = parsed.hour();
  if (hour < 9 || hour >= 17) return false;
  
  // Provjeri da li je radni dan (pon-sub)
  const dayOfWeek = parsed.day();
  if (dayOfWeek === 0) return false; // nedjelja
  
  return true;
}

// Konfiguracija pool-a za povezivanje s bazom podataka
console.log('DEBUG: Initializing database pool...');
console.log('DEBUG: DATABASE_URL provided:', !!process.env.DATABASE_URL);
if (process.env.DATABASE_URL) {
  console.log('DEBUG: DATABASE_URL starts with:', process.env.DATABASE_URL.substring(0, 20) + '...');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

console.log('DEBUG: Database pool created');

// Dodajemo error handling za pool
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Funkcija za inicijalizaciju baze podataka
async function initializeDatabase() {
  // Skip database initialization in development if no DATABASE_URL
  if (!process.env.DATABASE_URL && process.env.NODE_ENV !== 'production') {
    console.log('Development mode: Skipping database initialization');
    return;
  }
  
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
    // Podržava i Y-m-d i DD.MM.YYYY format
    let formattedDatetime;
    if (date.includes('-') && date.length === 10) {
      // Y-m-d format (2024-01-15)
      formattedDatetime = moment(`${date} ${time}`, "YYYY-MM-DD HH:mm").format("YYYY-MM-DD HH:mm:ss");
    } else {
      // DD.MM.YYYY format (15.01.2024)
      formattedDatetime = moment(`${date} ${time}`, "DD.MM.YYYY HH:mm").format("YYYY-MM-DD HH:mm:ss");
    }
    const result = await pool.query('SELECT COUNT(*) as count FROM appointments WHERE datetime = $1', [formattedDatetime]);
    return parseInt(result.rows[0].count) === 0;
  } catch (error) {
    console.error('Error checking availability:', error);
    throw error;
  }
}

// Funkcija za rezervaciju termina - s input validation
async function bookAppointment(ime, prezime, mobitel, email, service, duration, price, datetime) {
  console.log('DEBUG: bookAppointment called with:', { ime, prezime, mobitel, email, service, duration, price, datetime });
  
  // Input validation
  const sanitizedIme = sanitizeString(ime);
  const sanitizedPrezime = sanitizeString(prezime);
  const sanitizedMobitel = sanitizePhone(mobitel);  // Koristimo sanitizePhone
  const sanitizedService = sanitizeString(service);

  console.log('DEBUG: After sanitization:', { sanitizedIme, sanitizedPrezime, sanitizedMobitel, sanitizedService });

  // Validation checks
  if (!sanitizedIme || sanitizedIme.length < 2) {
    console.log('DEBUG: Ime validation failed');
    throw new Error('Ime mora imati najmanje 2 znakova');
  }
  if (!sanitizedPrezime || sanitizedPrezime.length < 2) {
    console.log('DEBUG: Prezime validation failed');
    throw new Error('Prezime mora imati najmanje 2 znakova');
  }
  if (!validateEmail(email)) {
    console.log('DEBUG: Email validation failed');
    throw new Error('Neispravna email adresa');
  }
  if (!validatePhone(sanitizedMobitel)) {
    console.log('DEBUG: Phone validation failed');
    throw new Error('Neispravan broj telefona');
  }
  if (!validateService(sanitizedService)) {
    console.log('DEBUG: Service validation failed');
    throw new Error('Neispravna usluga');
  }
  if (!validateDateTime(datetime)) {
    console.log('DEBUG: DateTime validation failed for:', datetime);
    throw new Error('Neispravan datum i vrijeme');
  }
  if (isNaN(duration) || duration < 10 || duration > 120) {
    console.log('DEBUG: Duration validation failed:', duration);
    throw new Error('Neispravno trajanje usluge');
  }
  if (isNaN(price) || price < 5 || price > 100) {
    console.log('DEBUG: Price validation failed:', price);
    throw new Error('Neispravna cijena');
  }
  
  console.log('DEBUG: All validations passed');
  console.log('DEBUG: About to connect to database pool...');
  console.log('DEBUG: Database URL exists:', !!process.env.DATABASE_URL);
  console.log('DEBUG: Database URL (first 50 chars):', process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 50) + '...' : 'NOT SET');
  console.log('DEBUG: Pool object:', pool ? 'exists' : 'null');
  console.log('DEBUG: Pool totalCount:', pool?.totalCount);
  console.log('DEBUG: Pool idleCount:', pool?.idleCount);
  console.log('DEBUG: Pool waitingCount:', pool?.waitingCount);

  let client;
  try {
    console.log('DEBUG: Calling pool.connect()...');
    client = await pool.connect();
    console.log('DEBUG: Database client connected successfully');
    console.log('DEBUG: Client database name:', client.database);
  } catch (connectError) {
    console.error('DEBUG: Database connection failed:', connectError.message);
    console.error('DEBUG: Connection error code:', connectError.code);
    console.error('DEBUG: Connection error stack:', connectError.stack);
    console.error('DEBUG: Full connection error object:', JSON.stringify(connectError, null, 2));
    throw new Error(`Database connection failed: ${connectError.message}`);
  }
  try {
    await client.query('BEGIN');
    console.log('DEBUG: Transaction started');
    
    const [date, time] = datetime.split('T');
    console.log('DEBUG: Split datetime:', { date, time });
    
    const isAvailable = await checkAvailability(date, time);
    console.log('DEBUG: Availability check result:', isAvailable);
    
    if (!isAvailable) {
      await client.query('ROLLBACK');
      console.log('DEBUG: Slot not available, rolled back');
      return false;
    }
    
    // Podržava i Y-m-d i DD.MM.YYYY format
    let formattedDatetime;
    if (date.includes('-') && date.length === 10) {
      // Y-m-d format (2024-01-15)
      console.log('DEBUG: Using YYYY-MM-DD format');
      formattedDatetime = moment(datetime, "YYYY-MM-DDTHH:mm").format("YYYY-MM-DD HH:mm:ss");
    } else {
      // DD.MM.YYYY format (15.01.2024)
      console.log('DEBUG: Using DD.MM.YYYY format');
      formattedDatetime = moment(datetime, "DD.MM.YYYYTHH:mm").format("YYYY-MM-DD HH:mm:ss");
    }
    console.log('DEBUG: Formatted datetime:', formattedDatetime);
    
    console.log('DEBUG: About to insert appointment with params:', [sanitizedIme, sanitizedPrezime, sanitizedMobitel, email.toLowerCase(), sanitizedService, parseInt(duration), parseFloat(price), formattedDatetime]);
    
    const result = await client.query(
      'INSERT INTO appointments (ime, prezime, mobitel, email, service, duration, price, datetime) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [sanitizedIme, sanitizedPrezime, sanitizedMobitel, email.toLowerCase(), sanitizedService, parseInt(duration), parseFloat(price), formattedDatetime]
    );
    console.log('DEBUG: Insert successful, result:', result.rows[0]);
    
    await client.query('COMMIT');
    console.log('DEBUG: Transaction committed');
    console.log('Appointment booked:', { id: result.rows[0].id, datetime: formattedDatetime });
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error booking appointment:', error.message);
    throw error;
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

// Funkcija za dohvaćanje rezerviranih vremena za određeni datum
async function getBookedTimesForDate(date) {
  const client = await pool.connect();
  try {
    const query = `
      SELECT EXTRACT(HOUR FROM datetime) as hour, 
             EXTRACT(MINUTE FROM datetime) as minute,
             duration
      FROM appointments 
      WHERE DATE(datetime) = $1
      ORDER BY datetime
    `;
    
    const result = await client.query(query, [date]);
    
    // Formatiranje vremena u HH:MM format s trajanjem
    const bookedTimes = result.rows.map(row => {
      const hour = String(row.hour).padStart(2, '0');
      const minute = String(row.minute).padStart(2, '0');
      return {
        time: `${hour}:${minute}`,
        duration: parseInt(row.duration)
      };
    });
    
    return bookedTimes;
  } catch (error) {
    console.error('Error getting booked times for date:', error);
    throw error;
  } finally {
    client.release();
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
  getAvailableSlots,
  getBookedTimesForDate
};

// Inicijalizacija baze podataka pri pokretanju
initializeDatabase();