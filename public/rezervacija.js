// Globalne varijable
let selectedDate = null;
let selectedTime = null;
let selectedService = null;
let serviceDuration = null;
let servicePrice = null;

// Funkcija za refresh termina i povratak na korak 2
function refreshAndGoBack() {
  // Resetiraj odabrani termin
  selectedTime = null;
  
  // Ukloni selekciju s termina
  document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
  
  // Osvježi dostupne termine
  if (selectedDate) {
    loadAvailableTimes(selectedDate);
  }
  
  // Vrati na korak 2
  showStep(2);
  
  // Obriši poruku greške
  const feedback = document.getElementById('reservation-feedback');
  if (feedback) {
    feedback.innerHTML = '';
  }
}

// Modal funkcije
function showSuccessModal(appointment) {
  const modal = document.getElementById('successModal');
  const modalDetails = document.getElementById('modalDetails');
  
  modalDetails.innerHTML = `
    <p><strong>Ime:</strong> ${appointment.ime} ${appointment.prezime}</p>
    <p><strong>Usluga:</strong> ${appointment.service}</p>
    <p><strong>Datum:</strong> ${appointment.date}</p>
    <p><strong>Vrijeme:</strong> ${appointment.time}</p>
  `;
  
  modal.style.display = 'block';
}

function closeModal() {
  const modal = document.getElementById('successModal');
  modal.style.display = 'none';
  // Direktno preusmjeravanje na početnu stranicu
  window.location.href = '/';
}

// Zatvori modal klikom izvan njega
window.onclick = function(event) {
  const modal = document.getElementById('successModal');
  if (event.target == modal) {
    closeModal();
  }
}

// Close modal button handler
document.getElementById('closeModalBtn').addEventListener('click', closeModal);

// Validation funkcije
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function isValidPhoneNumber(phone) {
  // Ukloni razmake i crtice
  const cleanPhone = phone.replace(/[\s\-]/g, '');
  // Hrvatski brojevi telefona: +385, 0xx ili 09x format
  const re = /^(\+385|0)[0-9]{8,9}$/;
  return re.test(cleanPhone);
}

// Step navigation functions
function showStep(stepNumber) {
  // Hide all steps
  document.getElementById('step1').style.display = 'none';
  document.getElementById('step2').style.display = 'none';
  document.getElementById('step3').style.display = 'none';
  
  // Update step indicators
  document.querySelectorAll('.step').forEach(step => {
    step.classList.remove('active', 'completed');
  });
  
  // Show current step and update indicators
  document.getElementById(`step${stepNumber}`).style.display = 'block';
  document.getElementById(`step-indicator-${stepNumber}`).classList.add('active');
  
  // Mark previous steps as completed
  for (let i = 1; i < stepNumber; i++) {
    document.getElementById(`step-indicator-${i}`).classList.add('completed');
  }
}

// Generate available time slots with proper overlap checking
function generateTimeSlots(date, duration, bookedTimes = []) {
  const slots = [];
  const startHour = 9;
  const endHour = 18;
  const slotDuration = parseInt(duration);
  
  // Check if it's Saturday (different hours)
  const dayOfWeek = new Date(date).getDay();
  const actualEndHour = dayOfWeek === 6 ? 14 : endHour; // Saturday ends at 14:00
  
  // Check if it's Sunday (closed)
  if (dayOfWeek === 0) {
    return [];
  }
  
  // Convert booked times to time ranges with durations
  const bookedRanges = bookedTimes.map(bookedTime => {
    const [hour, minute] = bookedTime.time.split(':').map(Number);
    const startMinutes = hour * 60 + minute;
    const endMinutes = startMinutes + bookedTime.duration;
    return { start: startMinutes, end: endMinutes };
  });
  
  // Debug logging
  console.log('Booked ranges for date', date, ':', bookedRanges);
  console.log('New service duration:', slotDuration, 'minutes');
  
  for (let hour = startHour; hour < actualEndHour; hour++) {
    for (let minute = 0; minute < 60; minute += slotDuration) {
      const totalMinutes = hour * 60 + minute;
      
      // Check if this slot would go beyond working hours
      if (totalMinutes + slotDuration > actualEndHour * 60) break;
      
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      // Check for overlaps with existing bookings
      const newSlotStart = totalMinutes;
      const newSlotEnd = totalMinutes + slotDuration;
      
      const hasOverlap = bookedRanges.some(range => {
        const overlap = (newSlotStart < range.end && newSlotEnd > range.start);
        if (overlap) {
          console.log(`Overlap detected: ${timeString} (${newSlotStart}-${newSlotEnd}) overlaps with existing booking (${range.start}-${range.end})`);
        }
        return overlap;
      });
      
      slots.push({
        time: timeString,
        available: !hasOverlap
      });
    }
  }
  
  return slots;
}

// Fetch available times from server
async function fetchAvailableTimes(date) {
  try {
    const response = await fetch(`/api/available-times?date=${date}`);
    const data = await response.json();
    return data.bookedTimes || [];
  } catch (error) {
    console.error('Error fetching available times:', error);
    return [];
  }
}

// Load available times and display them
async function loadAvailableTimes(date) {
  const container = document.getElementById('available-times');
  container.innerHTML = '<div class="time-slot">Učitavam dostupne termine...</div>';
  
  try {
    const bookedTimes = await fetchAvailableTimes(date);
    const slots = generateTimeSlots(date, parseInt(serviceDuration), bookedTimes);
    console.log('Generated slots for date:', date, 'duration:', parseInt(serviceDuration), 'slots count:', slots.length);
    
    if (slots.length === 0) {
      container.innerHTML = '<p>Salon je zatvoren ovog dana.</p>';
      return;
    }
    
    container.innerHTML = '';
    
    slots.forEach(slot => {
      const slotElement = document.createElement('div');
      slotElement.className = `time-slot ${!slot.available ? 'unavailable' : ''}`;
      slotElement.textContent = slot.time;
      
      if (slot.available) {
        slotElement.addEventListener('click', () => {
          // Remove selection from other slots
          document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
          
          // Select this slot
          slotElement.classList.add('selected');
          selectedTime = slot.time;
          
          // Enable next step after a short delay
          setTimeout(() => {
            document.getElementById('final-service').textContent = selectedService;
            document.getElementById('final-date').textContent = new Date(selectedDate).toLocaleDateString('hr-HR');
            document.getElementById('final-time').textContent = selectedTime;
            showStep(3);
          }, 500);
        });
      }
      
      container.appendChild(slotElement);
    });
    
    if (slots.every(slot => !slot.available)) {
      const noSlotsMsg = document.createElement('p');
      noSlotsMsg.textContent = 'Nema dostupnih termina za ovaj dan.';
      container.appendChild(noSlotsMsg);
    }
    
  } catch (error) {
    container.innerHTML = '<p style="color: red;">Greška pri učitavanju termina.</p>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Dohvati parametre iz URL-a
  const urlParams = new URLSearchParams(window.location.search);
  selectedService = urlParams.get('service');
  serviceDuration = parseInt(urlParams.get('duration'));
  servicePrice = parseFloat(urlParams.get('price'));

  console.log('URL params:', { selectedService, serviceDuration, servicePrice });

  // Provjeri da li su svi parametri prisutni i valjani
  if (!selectedService || isNaN(serviceDuration) || isNaN(servicePrice)) {
    console.error('Invalid URL parameters!', { selectedService, serviceDuration, servicePrice });
    document.getElementById('selected-service').innerHTML = 
      '<strong style="color: red;">Greška: Neispravni podaci o usluzi. Molimo vratite se i odaberite uslugu.</strong>';
    return;
  }

  // Prikaži odabranu uslugu
  if (selectedService) {
    document.getElementById('selected-service').innerHTML = 
      `<strong>Odabrana usluga:</strong> ${selectedService} (${serviceDuration} min) - ${servicePrice}€`;
  }

  // Inicijalizacija Flatpickr za datum - lokalizacija na hrvatski
  flatpickr('#date', {
    minDate: "today",
    maxDate: new Date().fp_incr(30),
    dateFormat: "Y-m-d",
    locale: {
      firstDayOfWeek: 1, // Ponedjeljak je prvi dan u tjednu
      weekdays: {
        shorthand: ['Ned', 'Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub'],
        longhand: ['Nedjelja', 'Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota']
      },
      months: {
        shorthand: ['Sij', 'Velj', 'Ožu', 'Tra', 'Svi', 'Lip', 'Srp', 'Kol', 'Ruj', 'Lis', 'Stu', 'Pro'],
        longhand: ['Siječanj', 'Veljača', 'Ožujak', 'Travanj', 'Svibanj', 'Lipanj', 'Srpanj', 'Kolovoz', 'Rujan', 'Listopad', 'Studeni', 'Prosinac']
      }
    },
    onChange: function(selectedDates, dateStr) {
      if (dateStr) {
        selectedDate = dateStr;
        document.getElementById('selected-date-display').textContent = 
          new Date(dateStr).toLocaleDateString('hr-HR', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          });
        
        // Load available times and show step 2
        loadAvailableTimes(dateStr);
        showStep(2);
      }
    }
  });

  // Back button handlers
  document.getElementById('back-to-date').addEventListener('click', () => {
    showStep(1);
  });

  document.getElementById('back-to-time').addEventListener('click', () => {
    showStep(2);
  });

  // Form submission
  document.getElementById('reservation-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const ime = document.getElementById('ime').value;
    const prezime = document.getElementById('prezime').value;
    const mobitel = document.getElementById('mobitel').value;
    const email = document.getElementById('email').value;
    const feedback = document.getElementById('feedback');
    const submitBtn = document.getElementById('confirm-booking');

    console.log('Form validation started');
    console.log('Form data:', { ime, prezime, mobitel, email });
    console.log('Selected service data:', { selectedService, serviceDuration, servicePrice });
    console.log('Selected date/time:', { selectedDate, selectedTime });

    // Validation
    if (!ime || !prezime || !mobitel || !email) {
      console.log('Validation failed: Missing fields');
      feedback.innerHTML = 'Molimo popunite sva polja.';
      feedback.style.color = '#e74c3c';
      return;
    }

    if (!isValidEmail(email)) {
      console.log('Validation failed: Invalid email:', email);
      feedback.innerHTML = 'Molimo unesite ispravnu email adresu.';
      feedback.style.color = '#e74c3c';
      return;
    }

    if (!isValidPhoneNumber(mobitel)) {
      console.log('Validation failed: Invalid phone:', mobitel);
      feedback.innerHTML = 'Molimo unesite ispravan broj mobitela (9 ili 10 znamenki).';
      feedback.style.color = '#e74c3c';
      return;
    }

    console.log('All frontend validations passed');

    try {
      // Show loading
      loading.show('Rezerviram termin...');
      loading.showButtonLoading(submitBtn, 'Rezerviraj');
      
      feedback.innerHTML = 'Rezerviram...';
      feedback.style.color = '#666';

      console.log('Sending booking request with data:', {
        ime,
        prezime,
        mobitel,
        email,
        service: selectedService,
        duration: parseInt(serviceDuration),
        price: parseFloat(servicePrice),
        datetime: `${selectedDate}T${selectedTime}`
      });

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
          service: selectedService,
          duration: parseInt(serviceDuration),
          price: parseFloat(servicePrice),
          datetime: `${selectedDate}T${selectedTime}`
        })
      });

      console.log('Response status:', response.status);
      console.log('Response data:', data);

      // Hide loading
      loading.hide();
      loading.hideButtonLoading(submitBtn, 'Rezerviraj');

      if (response.ok) {
        console.log('Booking successful!');
        showSuccessModal(data.appointment);
      } else {
        console.log('Booking failed with status:', response.status, 'data:', data);
        // Provjeri je li problem s dostupnošću termina
        if (response.status === 409 && data.error && data.error.includes('više nije dostupan')) {
          // Termin je u međuvremenu rezerviran
          feedback.innerHTML = data.error + ' <span class="error-link" onclick="refreshAndGoBack()">Odaberite novi termin</span>';
          feedback.style.color = '#e74c3c';
        } else {
          feedback.innerHTML = data.error || 'Greška pri rezervaciji.';
          feedback.style.color = '#e74c3c';
        }
      }
    } catch (err) {
      console.error('Booking request failed:', err);
      loading.hide();
      loading.hideButtonLoading(submitBtn, 'Rezerviraj');
      feedback.innerHTML = 'Greška pri povezivanju sa serverom.';
      feedback.style.color = '#e74c3c';
    } finally {
      if (feedback.innerHTML === 'Rezerviram...') {
        feedback.innerHTML = '';
      }
    }
  });
});
