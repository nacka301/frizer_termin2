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
      defaultDate: new Date(),
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
            const res = await fetch(`/api/admin/appointments?date=${encodeURIComponent(dateStr)}`);
            if (!res.ok) throw new Error('Greška pri dohvaćanju rezervacija');
            const appointments = await res.json();
            if (Array.isArray(appointments) && appointments.length > 0) {
              appointmentsDiv.innerHTML = appointments.map(app => `
                <div class="appointment-card" data-id="${app.id}">
                  <div class="appointment-time">${app.datetime ? app.datetime.split('T')[1] : ''}</div>
                  <div class="appointment-client">${app.ime} ${app.prezime}</div>
                  <div class="appointment-service">${app.service}</div>
                  <div class="appointment-contact">${app.mobitel} | ${app.email}</div>
                  <div class="appointment-price">Cijena: ${app.price}€</div>
                  <button class="delete-btn">Obriši</button>
                  <button class="edit-btn">Uredi</button>
                </div>
              `).join('');

              // Dodaj event listenere za brisanje
              document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', async function(e) {
                  const card = e.target.closest('.appointment-card');
                  const id = card.getAttribute('data-id');
                  if (confirm('Jeste li sigurni da želite obrisati ovu rezervaciju?')) {
                    try {
                      const res = await fetch(`/api/admin/appointments/${id}`, { method: 'DELETE' });
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
