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
      onChange: function(selectedDates, dateStr, instance) {
        const selectedDateDiv = document.getElementById('selectedDate');
        if (selectedDateDiv) {
          selectedDateDiv.textContent = 'Odabrani datum: ' + dateStr;
        }
        // Ovdje možeš dodati AJAX za dohvat rezervacija za taj datum
      }
    });
  } else {
    console.error('Flatpickr nije učitan!');
  }
});
