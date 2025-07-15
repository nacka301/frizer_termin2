document.addEventListener('DOMContentLoaded', function() {
  // Logout funkcionalnost
  const logoutBtn = document.querySelector('.logout-btn') || document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async function() {
      await fetch('/api/admin-logout', { method: 'POST' });
      window.location.href = '/admin-login';
    });
  }

  // Inicijalizacija Flatpickr kalendara
  if (window.flatpickr) {
    flatpickr('#calendar', {
      dateFormat: 'Y-m-d',
      // defaultDate: new Date(), // makni defaultDate da ne bude ništa odabrano
      inline: true, // prikaz kalendara odmah
      minDate: 'today', // onemogući prošle datume
      disable: [
        function(date) {
          // Onemogući nedjelje (0 = nedjelja)
          return date.getDay() === 0;
        }
      ],
      locale: {
        firstDayOfWeek: 1 // ponedjeljak kao prvi dan
      },
      onChange: async function(selectedDates, dateStr, instance) {
        const selectedDateDiv = document.getElementById('selectedDate');
        if (selectedDateDiv) {
          selectedDateDiv.textContent = 'Odabrani datum: ' + dateStr;
        }
        // Dohvati rezervacije za odabrani datum
        const appointmentsDiv = document.getElementById('appointments');
        if (appointmentsDiv) {
          appointmentsDiv.innerHTML = '<em>Učitavanje rezervacija...</em>';
          try {
            const res = await fetch(`/api/admin/appointments?date=${encodeURIComponent(dateStr)}`, {
              credentials: 'include'
            });
            if (!res.ok) throw new Error('Greška pri dohvaćanju rezervacija');
            const appointments = await res.json();
            if (Array.isArray(appointments) && appointments.length > 0) {
              appointmentsDiv.innerHTML = appointments.map(app => `
                <div class="appointment-card" data-id="${app.id}" style="background:#fff;border-radius:18px;box-shadow:0 2px 12px rgba(0,0,0,0.07);margin:1.5rem 0;padding:2rem 2.5rem;position:relative;display:flex;flex-direction:column;gap:0.7rem;">
                  <div style="display:flex;align-items:center;justify-content:space-between;">
                    <div style="font-size:1.5rem;font-weight:700;color:#2c3e50;">${app.time || (app.datetime ? app.datetime.split('T')[1].slice(0,5) : '')}</div>
                    <button class="delete-btn" style="background:#e74c3c;color:#fff;border:none;padding:0.7rem 1.5rem;border-radius:8px;font-weight:600;font-size:1rem;cursor:pointer;">Obriši</button>
                  </div>
                  <div style="font-size:1.2rem;font-weight:600;color:#34495e;">${app.ime} ${app.prezime}</div>
                  <div style="color:#7f8c8d;font-style:italic;font-size:1.1rem;">${app.service} (${app.duration || 30} min) - ${app.price}€</div>
                  <div style="color:#95a5a6;font-size:1rem;display:flex;align-items:center;gap:1.2rem;">
                    <span>📞 ${app.mobitel}</span>
                    <span>✉️ ${app.email}</span>
                  </div>
                </div>
              `).join('');

              // Dodaj event listenere za brisanje
              document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', async function(e) {
                  const card = e.target.closest('.appointment-card');
                  const id = card.getAttribute('data-id');
                  if (confirm('Jeste li sigurni da želite obrisati ovu rezervaciju?')) {
                    try {
                  const res = await fetch(`/api/admin/appointments/${id}`, { method: 'DELETE', credentials: 'include' });
                      if (!res.ok) throw new Error('Greška pri brisanju');
                      card.remove();
                    } catch (err) {
                      alert('Greška pri brisanju!');
                    }
                  }
                });
              });

              // Dodaj event listenere za uređivanje (otvara alert s podacima, demo)
              document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', function(e) {
                  const card = e.target.closest('.appointment-card');
                  const id = card.getAttribute('data-id');
                  // Ovdje možeš otvoriti modal ili formu za uređivanje
                  alert('Uređivanje rezervacije ID: ' + id + '\n(Ovdje dodaj modal/formu za uređivanje)');
                });
              });
            } else {
              appointmentsDiv.innerHTML = '<div class="no-appointments">Nema rezervacija za ovaj dan.</div>';
            }
          } catch (err) {
            appointmentsDiv.innerHTML = '<span style="color:red">Greška pri dohvaćanju rezervacija!</span>';
          }
        }
      }
    });
  } else {
    console.error('Flatpickr nije učitan!');
  }
});
