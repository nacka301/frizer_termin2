const { pool } = require('./db');

// Health check modul
class HealthCheck {
  constructor() {
    this.startTime = Date.now();
    this.checks = [];
  }

  // Provjera stanja baze podataka
  async checkDatabase() {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT 1 as health_check');
      client.release();
      
      return {
        status: 'healthy',
        responseTime: Date.now() - Date.now(),
        details: 'Database connection successful'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: null,
        details: error.message
      };
    }
  }

  // Provjera memorije
  checkMemory() {
    const usage = process.memoryUsage();
    const freeMemory = process.memoryUsage.rss;
    const threshold = 500 * 1024 * 1024; // 500MB threshold
    
    return {
      status: usage.rss < threshold ? 'healthy' : 'warning',
      details: {
        rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
        external: `${Math.round(usage.external / 1024 / 1024)}MB`
      }
    };
  }

  // Provjera CPU usage (aproksimativa)
  async checkCPU() {
    const start = process.cpuUsage();
    await new Promise(resolve => setTimeout(resolve, 100));
    const usage = process.cpuUsage(start);
    
    const userCPU = usage.user / 1000; // microseconds to milliseconds
    const systemCPU = usage.system / 1000;
    const totalCPU = userCPU + systemCPU;
    
    return {
      status: totalCPU < 500 ? 'healthy' : 'warning', // 500ms threshold
      details: {
        user: `${userCPU.toFixed(2)}ms`,
        system: `${systemCPU.toFixed(2)}ms`,
        total: `${totalCPU.toFixed(2)}ms`
      }
    };
  }

  // Provjera uptime
  checkUptime() {
    const uptime = Date.now() - this.startTime;
    const hours = Math.floor(uptime / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    
    return {
      status: 'healthy',
      details: {
        uptime: `${hours}h ${minutes}m`,
        startTime: new Date(this.startTime).toISOString()
      }
    };
  }

  // Provjera disk prostora (ako je dostupno)
  async checkDisk() {
    try {
      const fs = require('fs').promises;
      const stats = await fs.statfs('./');
      const freeSpace = stats.bavail * stats.bsize;
      const totalSpace = stats.blocks * stats.bsize;
      const usedPercent = ((totalSpace - freeSpace) / totalSpace) * 100;
      
      return {
        status: usedPercent < 90 ? 'healthy' : 'warning',
        details: {
          free: `${Math.round(freeSpace / 1024 / 1024 / 1024)}GB`,
          total: `${Math.round(totalSpace / 1024 / 1024 / 1024)}GB`,
          usedPercent: `${usedPercent.toFixed(1)}%`
        }
      };
    } catch (error) {
      return {
        status: 'unknown',
        details: 'Disk space check not available'
      };
    }
  }

  // Kompletna provjera zdravlja
  async performHealthCheck() {
    const startTime = Date.now();
    
    try {
      const [database, memory, cpu, uptime, disk] = await Promise.all([
        this.checkDatabase(),
        Promise.resolve(this.checkMemory()),
        this.checkCPU(),
        Promise.resolve(this.checkUptime()),
        this.checkDisk()
      ]);

      const checks = { database, memory, cpu, uptime, disk };
      const overallStatus = Object.values(checks).every(check => 
        check.status === 'healthy'
      ) ? 'healthy' : 'degraded';

      const responseTime = Date.now() - startTime;

      return {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        checks
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
        checks: {}
      };
    }
  }

  // Zapis health check rezultata
  logHealthCheck(result) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Health Check: ${result.status.toUpperCase()}`);
    
    if (result.status !== 'healthy') {
      console.warn('Health check issues detected:', result);
    }
  }

  // Periodična provjera
  startPeriodicChecks(intervalMinutes = 5) {
    const interval = intervalMinutes * 60 * 1000;
    
    setInterval(async () => {
      const result = await this.performHealthCheck();
      this.logHealthCheck(result);
    }, interval);
    
    console.log(`Health checks started - every ${intervalMinutes} minutes`);
  }
}

// Singleton instance
const healthCheck = new HealthCheck();

module.exports = healthCheck;
