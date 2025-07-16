// Dinamičko prikazivanje usluga iz backend varijabli
document.addEventListener('DOMContentLoaded', function() {
  const grid = document.getElementById('service-grid');
  if (!grid) return;
  fetch('/api/salon-config')
    .then(res => res.json())
    .then(data => {
      if (!data.services || !Array.isArray(data.services)) return;
      grid.innerHTML = '';
      data.services.forEach(service => {
        const item = document.createElement('div');
        item.className = 'service-item';
        item.innerHTML = `
          <h3>${service.name}</h3>
          <p>⏱️ ${service.duration} minuta</p>
          <p class="price">💰 ${service.price.toFixed(2)} €</p>
          <a href="/rezervacija.html?service=${encodeURIComponent(service.name)}&duration=${service.duration}&price=${service.price}" class="book-btn">
            Rezerviraj
          </a>
        `;
        grid.appendChild(item);
      });
    });
});
// Osnovne validation funkcije
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function isValidPhoneNumber(phone) {
    const re = /^[0-9]{9,10}$/;
    return re.test(phone);
}

// Export za korištenje u drugim skriptama
window.validationHelpers = {
    isValidEmail,
    isValidPhoneNumber
};
