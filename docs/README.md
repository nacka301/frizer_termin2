# 💇‍♂️ Frizerski Salon - Booking System

Enterprise-grade booking system for hair salons with advanced security features.

## 🚀 Features

### Core Functionality
- ✅ **Step-by-step booking process** - Service → Date → Available times → Personal info
- ✅ **Real-time availability** - No overlapping appointments
- ✅ **Admin dashboard** - Manage appointments, view analytics
- ✅ **Croatian localization** - Full Croatian language support

### 🔒 Security Features
- ✅ **Input validation & sanitization**
- ✅ **Rate limiting** (General, Auth, Booking)
- ✅ **Helmet security headers**
- ✅ **CSRF protection**
- ✅ **Security logging & analytics**
- ✅ **Session management with PostgreSQL**

### 📧 Communication
- ✅ **Email notifications** - Booking confirmations
- ✅ **Admin notifications** - New booking alerts
- ✅ **Professional email templates**

### 🏥 Monitoring & Health
- ✅ **Health check endpoint** (`/health`)
- ✅ **Performance monitoring**
- ✅ **Security analytics dashboard**
- ✅ **Automatic log rotation**

### 📱 User Experience
- ✅ **Mobile responsive design**
- ✅ **Loading indicators**
- ✅ **Offline support** (Service Worker)
- ✅ **Cookie consent management**
- ✅ **GDPR compliance** (Privacy Policy, Terms of Service)

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Security:** Helmet, Rate Limiting, CSRF, Input Validation
- **Email:** Nodemailer
- **Frontend:** Vanilla JavaScript, CSS3
- **Monitoring:** Custom health checks, Security logging

## 🚀 Deployment on Render

### 1. Automatic Deployment
This app is configured for automatic deployment on Render using `render.yaml`.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

### 2. Manual Deployment Steps

1. **Fork this repository**
2. **Create new Web Service on Render**
3. **Connect your GitHub repository**
4. **Configure environment variables:**
   ```
   NODE_ENV=production
   DATABASE_URL=<your-postgres-url>
   SESSION_SECRET=<random-secret-key>
   EMAIL_USER=<your-gmail>
   EMAIL_PASS=<your-app-password>
   ADMIN_EMAIL=<admin-email>
   ```
5. **Deploy!**

### 3. Database Setup
Render will automatically create a PostgreSQL database. The app will initialize tables on first run.

## 🔧 Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL database

### Setup
```bash
# Clone repository
git clone <your-repo-url>
cd frizerke_html

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# Start PostgreSQL database

# Run application
npm start
```

### Environment Variables
```env
DATABASE_URL=postgres://username:password@localhost:5432/frizerke_db
SESSION_SECRET=your-super-secret-session-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
ADMIN_EMAIL=admin@salon.hr
NODE_ENV=development
PORT=3000
```

## 📊 API Endpoints

### Public Endpoints
- `GET /` - Home page
- `GET /rezervacija.html` - Booking page
- `GET /health` - Health check
- `POST /api/book` - Create booking
- `GET /api/available-times` - Get available slots

### Admin Endpoints (Authentication Required)
- `POST /api/admin-login` - Admin login
- `GET /api/appointments` - Get all appointments
- `DELETE /api/appointments/:id` - Delete appointment
- `GET /api/security-analytics` - Security analytics

## 🔒 Security Features Details

### Input Validation
- Email format validation
- Croatian phone number validation
- Service type validation
- Date/time validation (business hours, future dates)
- Input sanitization (XSS prevention)

### Rate Limiting
- **General**: 100 requests per 15 minutes
- **Authentication**: 5 attempts per 15 minutes
- **Booking**: 3 bookings per hour

### Security Logging
All security events are logged to `./logs/security-YYYY-MM-DD.log`:
- Login attempts (success/failure)
- Booking attempts
- Rate limit violations
- Security errors

### GDPR Compliance
- Privacy Policy page
- Terms of Service page
- Cookie consent management
- Data retention policies
- User rights explanation

## 🏥 Monitoring

### Health Check
```bash
curl https://your-app.onrender.com/health
```

Response includes:
- Database connectivity
- Memory usage
- CPU usage
- Uptime
- Overall status

### Security Analytics
Admin dashboard provides:
- Failed login attempts
- Suspicious IP addresses
- Rate limiting violations
- Booking statistics

## 📧 Email Configuration

### Gmail Setup
1. Enable 2FA on your Gmail account
2. Generate App Password in Google Account settings
3. Use App Password as `EMAIL_PASS` environment variable

### Custom SMTP
Edit `email.js` to configure other email providers.

## 🎨 Customization

### Styling
- Edit `public/style_simple.css` for design changes
- Responsive design with CSS Grid/Flexbox

### Services & Pricing
- Update service list in `db.js` (validateService function)
- Modify pricing in `public/index.html`

### Business Hours
- Configure in `db.js` (validateDateTime function)
- Currently: Mon-Sat 9:00-17:00

## 📱 Mobile Support

- Fully responsive design
- Touch-friendly interface
- Offline support with Service Worker
- Progressive Web App features

## 🔄 Updates & Maintenance

### Automatic Features
- Log rotation (30 days)
- Health checks (every 5 minutes)
- Session cleanup
- Security monitoring

### Manual Maintenance
- Review security logs monthly
- Update dependencies regularly
- Monitor health check metrics
- Backup database regularly

## 📞 Support

For questions or issues:
- **Technical**: Check `/health` endpoint and logs
- **Security**: Review security analytics
- **Business**: Configure services and pricing as needed

## 📄 License

ISC License - See LICENSE file for details.

---

**Production Ready**: This application includes enterprise-level security features and is ready for commercial use with proper PostgreSQL database configuration.
