const fs = require('fs').promises;
const path = require('path');

// Logger klasa za sigurnosne događaje
class SecurityLogger {
  constructor() {
    this.logDir = path.join(__dirname, 'logs');
    this.ensureLogDirectory();
  }

  async ensureLogDirectory() {
    try {
      await fs.mkdir(this.logDir, { recursive: true });
    } catch (error) {
      console.error('Error creating log directory:', error);
    }
  }

  // Format log entry
  formatLogEntry(level, event, details, ip = 'unknown') {
    const timestamp = new Date().toISOString();
    return JSON.stringify({
      timestamp,
      level,
      event,
      ip,
      details,
      userAgent: details.userAgent || 'unknown'
    }) + '\n';
  }

  // Generic log method
  async log(level, event, details, ip) {
    try {
      const logEntry = this.formatLogEntry(level, event, details, ip);
      const fileName = `security-${new Date().toISOString().split('T')[0]}.log`;
      const filePath = path.join(this.logDir, fileName);
      
      await fs.appendFile(filePath, logEntry);
      
      // Also log to console in development
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[${level.toUpperCase()}] ${event}:`, details);
      }
    } catch (error) {
      console.error('Error writing to security log:', error);
    }
  }

  // Specific logging methods
  async logLogin(success, username, ip, userAgent) {
    await this.log('INFO', 'LOGIN_ATTEMPT', {
      success,
      username,
      userAgent
    }, ip);
  }

  async logBooking(success, details, ip, userAgent) {
    await this.log('INFO', 'BOOKING_ATTEMPT', {
      success,
      ...details,
      userAgent
    }, ip);
  }

  async logRateLimit(endpoint, ip, userAgent) {
    await this.log('WARN', 'RATE_LIMIT_EXCEEDED', {
      endpoint,
      userAgent
    }, ip);
  }

  async logSecurityEvent(event, details, ip, userAgent) {
    await this.log('WARN', event, {
      ...details,
      userAgent
    }, ip);
  }

  async logError(error, context, ip, userAgent) {
    await this.log('ERROR', 'APPLICATION_ERROR', {
      error: error.message,
      stack: error.stack,
      context,
      userAgent
    }, ip);
  }

  // Čišćenje starih logova (stariji od 30 dana)
  async cleanOldLogs() {
    try {
      const files = await fs.readdir(this.logDir);
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

      for (const file of files) {
        if (file.endsWith('.log')) {
          const filePath = path.join(this.logDir, file);
          const stats = await fs.stat(filePath);
          
          if (stats.mtime.getTime() < thirtyDaysAgo) {
            await fs.unlink(filePath);
            console.log(`Deleted old log file: ${file}`);
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning old logs:', error);
    }
  }

  // Analiza sigurnosnih logova
  async analyzeSecurityLogs(days = 7) {
    try {
      const files = await fs.readdir(this.logDir);
      const cutoffDate = Date.now() - (days * 24 * 60 * 60 * 1000);
      
      let totalLoginAttempts = 0;
      let failedLogins = 0;
      let bookingAttempts = 0;
      let rateLimitHits = 0;
      let suspiciousIPs = {};

      for (const file of files) {
        if (!file.endsWith('.log')) continue;
        
        const filePath = path.join(this.logDir, file);
        const stats = await fs.stat(filePath);
        
        if (stats.mtime.getTime() < cutoffDate) continue;

        const content = await fs.readFile(filePath, 'utf8');
        const lines = content.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const entry = JSON.parse(line);
            
            switch (entry.event) {
              case 'LOGIN_ATTEMPT':
                totalLoginAttempts++;
                if (!entry.details.success) {
                  failedLogins++;
                  suspiciousIPs[entry.ip] = (suspiciousIPs[entry.ip] || 0) + 1;
                }
                break;
                
              case 'BOOKING_ATTEMPT':
                bookingAttempts++;
                break;
                
              case 'RATE_LIMIT_EXCEEDED':
                rateLimitHits++;
                suspiciousIPs[entry.ip] = (suspiciousIPs[entry.ip] || 0) + 2;
                break;
            }
          } catch (parseError) {
            // Skip malformed log entries
          }
        }
      }

      return {
        period: `${days} days`,
        totalLoginAttempts,
        failedLogins,
        bookingAttempts,
        rateLimitHits,
        suspiciousIPs: Object.entries(suspiciousIPs)
          .filter(([ip, count]) => count >= 5)
          .sort((a, b) => b[1] - a[1])
      };
    } catch (error) {
      console.error('Error analyzing security logs:', error);
      return null;
    }
  }
}

// Singleton instance
const securityLogger = new SecurityLogger();

// Pokretanje čišćenja logova jednom dnevno
setInterval(() => {
  securityLogger.cleanOldLogs();
}, 24 * 60 * 60 * 1000);

module.exports = securityLogger;
