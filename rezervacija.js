document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('reservation-form');
  const calendar = document.getElementById('calendar');
  const timeSlots = document.getElementById('time-slots');
  const feedback = document.getElementById('feedback');
  const selectedServiceElement = document.getElementById('selected-service');

  // Dohvati parametre iz URL-a
  const urlParams = new URLSearchParams(window.location.search);
  const service = urlParams.get('service');
  const duration = urlParams.get('duration');
  const price = urlParams.get('price');

  // Prikaži odabranu uslugu
  selectedServiceElement.textContent = `Odabrana usluga: ${service} (${duration}, ${price})`;

  let selectedDate = null;
  let selectedTime = null;

  // Inicijalizacija Flatpickr za kalendar
  const fp = flatpickr(calendar, {
    inline: true,
    minDate: "today",
    maxDate: new Date().fp_incr(30), // Dozvoli rezervacije do 30 dana unaprijed
    dateFormat: "Y-m-d",
    onChange: function(selectedDates, dateStr, instance) {
      selectedDate = dateStr;
      fetchAvailableTimeSlots(dateStr);
    }
  });

  async function fetchAvailableTimeSlots(date) {
    try {
      const response = await fetch(`/api/available-slots?date=${date}&service=${service}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const slots = await response.json();
      displayTimeSlots(slots);
    } catch (err) {
      console.error('Error fetching available slots:', err);
      timeSlots.innerHTML = '<p>Greška pri dohvaćanju termina: ' + err.message + '</p>';
    }
  }

  function displayTimeSlots(slots) {
    timeSlots.innerHTML = '';
    slots.forEach(slot => {
      const button = document.createElement('button');
      button.textContent = slot;
      button.classList.add('time-slot');
      button.addEventListener('click', () => selectTimeSlot(slot));
      timeSlots.appendChild(button);
    });
  }

  function selectTimeSlot(slot) {
    const buttons = timeSlots.querySelectorAll('.time-slot');
    buttons.forEach(btn => btn.classList.remove('selected'));
    event.target.classList.add('selected');
    selectedTime = slot;
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
    const ime = document.getElementById('ime').value;
    const prezime = document.getElementById('prezime').value;
    const mobitel = document.getElementById('mobitel').value;
    const email = document.getElementById('email').value;

    if (!selectedDate || !selectedTime || !ime || !prezime || !mobitel || !email) {
      feedback.innerText = 'Molimo popunite sva polja i odaberite datum i vrijeme.';
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
          datetime: `${selectedDate}T${selectedTime}`
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      feedback.innerText = 'Termin uspješno rezerviran!';
      feedback.style.color = 'green';
      form.reset();
      selectedDate = null;
      selectedTime = null;
      fp.clear();
      timeSlots.innerHTML = '';
    } catch (err) {
      console.error('Error booking appointment:', err);
      feedback.innerText = 'Greška pri rezervaciji: ' + err.message;
      feedback.style.color = 'red';
    }
  });
});