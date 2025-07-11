const nodemailer = require('nodemailer');

// Email konfiguracija
const transporter = nodemailer.createTransport({
  service: 'gmail', // ili drugi email provider
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// Pošalji potvrdu rezervacije korisniku
async function sendBookingConfirmation(customerEmail, appointmentDetails) {
  try {
    const { ime, prezime, service, datetime, price } = appointmentDetails;
    const [date, time] = datetime.split('T');
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'frizerski.salon@gmail.com',
      to: customerEmail,
      subject: 'Potvrda rezervacije - Frizerski salon',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Potvrda rezervacije</h2>
          <p>Poštovani/a ${ime} ${prezime},</p>
          <p>Vaša rezervacija je uspješno potvrđena!</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #495057;">Detalji rezervacije:</h3>
            <p><strong>Usluga:</strong> ${service}</p>
            <p><strong>Datum:</strong> ${date}</p>
            <p><strong>Vrijeme:</strong> ${time}</p>
            <p><strong>Cijena:</strong> ${price}€</p>
          </div>
          
          <div style="background-color: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #6c757d;">Važne napomene:</h4>
            <ul style="color: #6c757d;">
              <li>Molimo dođite 5 minuta prije termina</li>
              <li>Za otkazivanje pozovite na +385 99 123 4567</li>
              <li>Otkazivanje je moguće najkasnije 2 sata prije termina</li>
            </ul>
          </div>
          
          <p>Hvala vam što ste odabrali naš salon!</p>
          <p style="color: #6c757d; font-size: 12px;">
            Ova poruka je automatski generirana. Molimo ne odgovarajte na ovu email adresu.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Booking confirmation email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
    return false;
  }
}

// Pošalji notifikaciju admin-u o novoj rezervaciji
async function sendAdminNotification(appointmentDetails) {
  try {
    const { ime, prezime, mobitel, email, service, datetime, price } = appointmentDetails;
    const [date, time] = datetime.split('T');
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'frizerski.salon@gmail.com',
      to: process.env.ADMIN_EMAIL || 'admin@salon.com',
      subject: 'Nova rezervacija - Frizerski salon',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc3545;">Nova rezervacija</h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #495057;">Detalji klijenta:</h3>
            <p><strong>Ime:</strong> ${ime} ${prezime}</p>
            <p><strong>Telefon:</strong> ${mobitel}</p>
            <p><strong>Email:</strong> ${email}</p>
          </div>
          
          <div style="background-color: #e9ecef; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #495057;">Detalji rezervacije:</h3>
            <p><strong>Usluga:</strong> ${service}</p>
            <p><strong>Datum:</strong> ${date}</p>
            <p><strong>Vrijeme:</strong> ${time}</p>
            <p><strong>Cijena:</strong> ${price}€</p>
          </div>
          
          <p style="color: #6c757d; font-size: 12px;">
            Rezervacija je automatski dodana u sustav.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Admin notification email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending admin notification email:', error);
    return false;
  }
}

module.exports = {
  sendBookingConfirmation,
  sendAdminNotification
};
