const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'appointments.db'));

console.log('Connected to the appointments database.');

// Dodajte ovo:
console.log('Table structure:');
const tableInfo = db.prepare("PRAGMA table_info(appointments)").all();
console.log(JSON.stringify(tableInfo, null, 2));
console.log('-------------------------');

try {
    const appointments = db.prepare('SELECT * FROM appointments').all();
    
    if (appointments.length === 0) {
        console.log('Nema rezervacija u bazi podataka.');
    } else {
        console.log('Sve rezervacije:');
        appointments.forEach(appointment => {
            console.log(JSON.stringify(appointment, null, 2));
            console.log('-------------------------');
        });
    }
} catch (error) {
    console.error('Greška pri dohvaćanju rezervacija:', error.message);
}

db.close();
console.log('Closed the database connection.');