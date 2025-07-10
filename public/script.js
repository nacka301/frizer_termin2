document.addEventListener('DOMContentLoaded', () => {
  const bookButtons = document.querySelectorAll('.book-btn');
  const modal = document.getElementById('booking-modal');
  const closeModalBtn = document.getElementById('close-modal');
  const confirmBtn = document.getElementById('confirm-booking');
  const dateInput = document.getElementById('date');
  const timeInput = document.getElementById('time');
  const feedback = document.getElementById('feedback');
  const availabilityStatus = document.getElementById('availability-status');
  const imeInput = document.getElementById('ime');
  const prezimeInput = document.getElementById('prezime');
  const scrollTopBtn = document.getElementById('scrollTop');

  let selectedService = null;

  // Inicijalizacija Flatpickr za datum i vrijeme
  flatpickr(dateInput, {
    minDate: "today",
    maxDate: new Date().fp_incr(30) // Dozvoli rezervacije do 30 dana unaprijed
  });

  flatpickr(timeInput, {
    enableTime: true,
    noCalendar: true,
    dateFormat: "H:i",
    minTime: "09:00",
    maxTime: "18:00",
  });

  // Otvori modal kad klikneš "Rezerviraj"
  bookButtons.forEach(button => {
    button.addEventListener('click', () => {
      selectedService = {
        service: button.dataset.service,
        duration: button.dataset.duration,
        price: button.dataset.price
      };

      modal.style.display = 'flex';  // Promijenili smo 'block' u 'flex'
      feedback.innerText = '';
      dateInput.value = '';
      timeInput.value = '';
      availabilityStatus.innerText = '';
      imeInput.value = '';
      prezimeInput.value = '';
    });
  });
  // Zatvori modal
  closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
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
        const response = await fetch(`http://localhost:3000/api/check-availability?date=${date}&time=${time}`);
        const data = await response.json();
        if (data.available) {
          availabilityStatus.innerText = 'Termin je dostupan!';
          availabilityStatus.style.color = 'green';
          confirmBtn.disabled = false;
        } else {
          availabilityStatus.innerText = 'Termin nije dostupan. Molimo odaberite drugi.';
          availabilityStatus.style.color = 'red';
          confirmBtn.disabled = true;
        }
      } catch (err) {
        console.error(err);
        availabilityStatus.innerText = 'Greška pri provjeri dostupnosti.';
        availabilityStatus.style.color = 'red';
      }
    }
  }

  // Potvrdi i pošalji termin
  confirmBtn.addEventListener('click', async () => {
    const date = dateInput.value;
    const time = timeInput.value;
    const ime = imeInput.value;
    const prezime = prezimeInput.value;

    if (!date || !time || !ime || !prezime) {
      feedback.innerText = 'Molimo popunite sva polja.';
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ime,
          prezime,
          ...selectedService,
          datetime: `${date}T${time}`
        })
      });

      const data = await response.json();

      if (response.ok) {
        feedback.innerText = 'Termin uspješno rezerviran!';
        feedback.style.color = 'green';
        setTimeout(() => {
          modal.style.display = 'none';
        }, 2000);
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

  // Scroll to top functionality
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // Enhanced loading states
  function showLoading(element) {
    element.innerHTML = '<div class="loading"></div><div class="loading-text">Učitavanje...</div>';
  }

  function hideLoading(element, content) {
    element.innerHTML = content;
  }

  // Add smooth scrolling to navigation links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Add entrance animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
      }
    });
  }, observerOptions);

  // Observe elements for animation
  document.querySelectorAll('.service-item, .feature, .footer-section').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    observer.observe(el);
  });
});
