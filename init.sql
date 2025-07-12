-- Initialize database tables for frizerke application

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    ime VARCHAR(100) NOT NULL,
    prezime VARCHAR(100) NOT NULL,
    mobitel VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    service VARCHAR(100) NOT NULL,
    duration INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    datetime TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for datetime queries
CREATE INDEX IF NOT EXISTS idx_appointments_datetime ON appointments(datetime);

-- Create index for email queries
CREATE INDEX IF NOT EXISTS idx_appointments_email ON appointments(email);

-- Create security_logs table for logging
CREATE TABLE IF NOT EXISTS security_logs (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    event_type VARCHAR(50) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    details JSONB,
    success BOOLEAN
);

-- Create index for security logs timestamp
CREATE INDEX IF NOT EXISTS idx_security_logs_timestamp ON security_logs(timestamp);

-- Create index for security logs event type
CREATE INDEX IF NOT EXISTS idx_security_logs_event_type ON security_logs(event_type);

-- Insert some sample data (optional)
-- INSERT INTO appointments (ime, prezime, mobitel, email, service, duration, price, datetime)
-- VALUES ('Marko', 'Petrović', '+385981234567', 'marko@example.com', 'Šišanje obično', 30, 15.00, '2025-07-15 10:00:00');

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO frizerke_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO frizerke_user;
