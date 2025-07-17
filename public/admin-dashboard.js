document.addEventListener('DOMContentLoaded', function() {
  // Logout funkcionalnost
  const logoutBtn = document.querySelector('.logout-btn') || document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async function() {
      await fetch('/api/admin-logout', { method: 'POST', credentials: 'include' });
      window.location.href = '/admin-login.html';
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
                  <div style="display:flex;align-items:center;justify-content:space-between;gap:1rem;">
                    <div style="font-size:1.5rem;font-weight:700;color:#2c3e50;">${app.time || (app.datetime ? app.datetime.split('T')[1].slice(0,5) : '')}</div>
      <div class="appointment-actions" style="display:flex;flex-direction:row;gap:0.7rem;align-items:center;margin-top:0;">
        <button class="edit-btn" style="background:#3498db;color:#fff;border:none;padding:0.7rem 1.5rem;border-radius:8px;font-weight:600;font-size:1rem;cursor:pointer;min-width:110px;display:inline-block;">Promijeni</button>
        <button class="delete-btn" style="background:#e74c3c;color:#fff;border:none;padding:0.7rem 1.5rem;border-radius:8px;font-weight:600;font-size:1rem;cursor:pointer;min-width:110px;display:inline-block;">Obriši</button>
      </div>
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

              // Dodaj event listenere za uređivanje (preusmjeri na početnu za odabir drugog termina)
              document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', async function(e) {
                  const card = e.target.closest('.appointment-card');
                  const id = card.getAttribute('data-id');
                  try {
                    const res = await fetch(`/api/admin/appointments/${id}`, { method: 'DELETE', credentials: 'include' });
                    if (!res.ok) throw new Error('Greška pri brisanju');
                    card.remove();
                  } catch (err) {
                    alert('Greška pri brisanju!');
                  }
                  window.location.href = '/index.html';
                });
              });
// Modal za uređivanje rezervacije
function showEditModal(data) {
  // Ako modal već postoji, ukloni ga
  const oldModal = document.getElementById('edit-modal');
  if (oldModal) oldModal.remove();

  const modal = document.createElement('div');
  modal.id = 'edit-modal';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100vw';
  modal.style.height = '100vh';
  modal.style.background = 'rgba(44,62,80,0.7)';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.zIndex = '9999';

  modal.innerHTML = `
    <div style="background:#fff;padding:2.5rem 2.5rem 2rem 2.5rem;border-radius:18px;min-width:340px;max-width:95vw;box-shadow:0 2px 24px rgba(0,0,0,0.18);display:flex;flex-direction:column;gap:1.2rem;align-items:center;">
      <h2 style="color:#2c3e50;font-size:1.5rem;margin-bottom:1rem;">Uredi rezervaciju</h2>
      <input id="edit-imeprezime" type="text" value="${data.imePrezime}" style="width:100%;padding:0.7rem;font-size:1.1rem;border-radius:8px;border:1px solid #ccc;" />
      <input id="edit-service" type="text" value="${data.service}" style="width:100%;padding:0.7rem;font-size:1.1rem;border-radius:8px;border:1px solid #ccc;" />
      <input id="edit-kontakt" type="text" value="${data.kontakt}" style="width:100%;padding:0.7rem;font-size:1.1rem;border-radius:8px;border:1px solid #ccc;" />
      <div style="display:flex;gap:1.2rem;margin-top:1.2rem;">
        <button id="save-edit-btn" style="background:#3498db;color:#fff;border:none;padding:0.7rem 1.5rem;border-radius:8px;font-weight:600;font-size:1rem;cursor:pointer;">Spremi promjene</button>
        <button id="close-edit-btn" style="background:#e74c3c;color:#fff;border:none;padding:0.7rem 1.5rem;border-radius:8px;font-weight:600;font-size:1rem;cursor:pointer;">Odustani</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById('close-edit-btn').onclick = () => modal.remove();
  document.getElementById('save-edit-btn').onclick = async () => {
    // Ovdje šalji PATCH/PUT zahtjev na backend (implementacija ovisi o API-u)
    // Demo: samo zatvori modal i alert
    modal.remove();
    alert('Promjene spremljene (demo)!');
    // Ovdje možeš refrešati podatke ili ažurirati UI
  };
}
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
