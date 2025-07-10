// Modal funkcije
function showSuccessModal(appointment) {
  console.log('Showing success modal for:', appointment);
  const modal = document.getElementById('successModal');
  const modalDetails = document.getElementById('modalDetails');
  
  // Koristi date i time koje server šalje direktno
  const formattedDate = appointment.date || 'Nepoznat datum';
  const formattedTime = appointment.time || 'Nepoznato vreme';
  
  modalDetails.innerHTML = `
    <p><strong>Ime:</strong> ${appointment.ime} ${appointment.prezime}</p>
    <p><strong>Usluga:</strong> ${appointment.service}</p>
    <p><strong>Datum:</strong> ${formattedDate}</p>
    <p><strong>Vrijeme:</strong> ${formattedTime}</p>
  `;
  
  modal.style.display = 'block';
}

function closeModal() {
  console.log('Closing modal');
  const modal = document.getElementById('successModal');
  modal.style.display = 'none';
  // Preusmjeri na početnu stranicu
  setTimeout(() => {
    window.location.href = '/';
  }, 300);
}

// Zatvori modal klikom izvan njega
window.onclick = function(event) {
  const modal = document.getElementById('successModal');
  if (event.target == modal) {
    closeModal();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('reservation-form');
  const dateInput = document.getElementById('date');
  const timeInput = document.getElementById('time');
  const feedback = document.getElementById('feedback');
  const availabilityStatus = document.getElementById('availability-status');
  const selectedServiceElement = document.getElementById('selected-service');

  // Dohvati parametre iz URL-a
  const urlParams = new URLSearchParams(window.location.search);
  const service = urlParams.get('service');
  const duration = urlParams.get('duration');
  const price = urlParams.get('price');

  // Prikaži odabranu uslugu
  selectedServiceElement.textContent = `Odabrana usluga: ${service} (${duration}, ${price})`;

  // Inicijalizacija Flatpickr za datum i vrijeme
  flatpickr(dateInput, {
    minDate: "today",
    maxDate: new Date().fp_incr(30), // Dozvoli rezervacije do 30 dana unaprijed
    dateFormat: "d.m.Y", // Format datuma
    altInput: true,
    altFormat: "d.m.Y",
    placeholder: "Datum"
  });

  flatpickr(timeInput, {
    enableTime: true,
    noCalendar: true,
    dateFormat: "H:i",
    minTime: "09:00",
    maxTime: "18:00",
    altInput: true,
    altFormat: "H:i",
    placeholder: "Vrijeme"
  });

  // Provjeri dostupnost kada se odabere datum i vrijeme
  [dateInput, timeInput].forEach(input => {
    input.addEventListener('change', checkAvailability);
  });

  async function checkAvailability() {
    const date = dateInput.value;
    const time = timeInput.value;
    if (date && time) {
      try {
        // Show loading state
        availabilityStatus.innerHTML = '<div class="loading"></div>';
        
        const response = await fetch(`/api/check-availability?date=${date}&time=${time}`);
        const data = await response.json();
        if (data.available) {
          availabilityStatus.innerHTML = '<i class="fas fa-check-circle"></i> Termin je dostupan!';
          availabilityStatus.style.color = '#27ae60';
        } else {
          availabilityStatus.innerHTML = '<i class="fas fa-times-circle"></i> Termin nije dostupan. Molimo odaberite drugi.';
          availabilityStatus.style.color = '#e74c3c';
        }
      } catch (err) {
        console.error(err);
        availabilityStatus.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Greška pri provjeri dostupnosti.';
        availabilityStatus.style.color = '#e74c3c';
      }
    }
  }

  function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function isValidPhoneNumber(phone) {
    const re = /^[0-9]{9,10}$/;  // Pretpostavljamo hrvatski format broja mobitela
    return re.test(phone);
  }

  // Potvrdi i pošalji termin
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const date = dateInput.value;
    const time = timeInput.value;
    const ime = document.getElementById('ime').value;
    const prezime = document.getElementById('prezime').value;
    const mobitel = document.getElementById('mobitel').value;
    const email = document.getElementById('email').value;
    const submitBtn = document.getElementById('confirm-booking');

    if (!date || !time || !ime || !prezime || !mobitel || !email) {
      feedback.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Molimo popunite sva polja.';
      feedback.style.color = '#e74c3c';
      return;
    }

    if (!isValidEmail(email)) {
      feedback.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Molimo unesite ispravnu email adresu.';
      feedback.style.color = '#e74c3c';
      return;
    }

    if (!isValidPhoneNumber(mobitel)) {
      feedback.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Molimo unesite ispravan broj mobitela (9 ili 10 znamenki).';
      feedback.style.color = '#e74c3c';
      return;
    }

    try {
      // Show loading state
      const originalButtonText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Rezerviram...';
      submitBtn.disabled = true;
      feedback.innerHTML = '';

      const response = await fetch('/api/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ime,
          prezime,
          mobitel,
          email,
          service,
          duration,
          price,
          datetime: `${date}T${time}`
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Pokaži modal sa potvrdom
        showSuccessModal(data.appointment);
        form.reset();
        availabilityStatus.innerHTML = '';
      } else {
        feedback.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${data.error || 'Greška pri rezervaciji.'}`;
        feedback.style.color = '#e74c3c';
      }
    } catch (err) {
      console.error(err);
      feedback.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Greška pri povezivanju sa serverom.';
      feedback.style.color = '#e74c3c';
    } finally {
      // Restore button state
      submitBtn.innerHTML = originalButtonText;
      submitBtn.disabled = false;
    }
  });
});
