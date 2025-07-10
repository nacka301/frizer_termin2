// Modal funkcije
function showSuccessModal(appointment) {
  const modal = document.getElementById('successModal');
  const modalDetails = document.getElementById('modalDetails');
  
  // Formatiraj datum i vrijeme
  const dateTime = new Date(appointment.datetime);
  const formattedDate = dateTime.toLocaleDateString('hr-HR');
  const formattedTime = dateTime.toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' });
  
  modalDetails.innerHTML = `
    <p><strong>Ime:</strong> ${appointment.ime} ${appointment.prezime}</p>
    <p><strong>Usluga:</strong> ${appointment.service}</p>
    <p><strong>Datum:</strong> ${formattedDate}</p>
    <p><strong>Vrijeme:</strong> ${formattedTime}</p>
  `;
  
  modal.style.display = 'block';
}

function closeModal() {
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
        const response = await fetch(`/api/check-availability?date=${date}&time=${time}`);
        const data = await response.json();
        if (data.available) {
          availabilityStatus.innerText = 'Termin je dostupan!';
          availabilityStatus.style.color = 'green';
        } else {
          availabilityStatus.innerText = 'Termin nije dostupan. Molimo odaberite drugi.';
          availabilityStatus.style.color = 'red';
        }
      } catch (err) {
        console.error(err);
        availabilityStatus.innerText = 'Greška pri provjeri dostupnosti.';
        availabilityStatus.style.color = 'red';
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

    if (!date || !time || !ime || !prezime || !mobitel || !email) {
      feedback.innerText = 'Molimo popunite sva polja.';
      return;
    }

    if (!isValidEmail(email)) {
      feedback.innerText = 'Molimo unesite ispravnu email adresu.';
      return;
    }

    if (!isValidPhoneNumber(mobitel)) {
      feedback.innerText = 'Molimo unesite ispravan broj mobitela (9 ili 10 znamenki).';
      return;
    }

    try {
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
      } else {
        feedback.innerText = data.error || 'Greška pri rezervaciji.';
        feedback.style.color = 'red';
      }
    } catch (err) {
      console.error(err);
      feedback.innerText = 'Greška pri povezivanju sa serverom.';
      feedback.style.color = 'red';
    }
  });
});
