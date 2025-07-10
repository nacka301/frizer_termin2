document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = '/admin-login.html';
        return;
    }

    const welcomeMessage = document.getElementById('welcome-message');
    const logoutBtn = document.getElementById('logout-btn');
    const datePicker = document.getElementById('date-picker');
    const reservationsBody = document.getElementById('reservations-body');
    const addServiceForm = document.getElementById('add-service-form');
    const servicesBody = document.getElementById('services-body');

    // Inicijalizacija Flatpickr za odabir datuma
    flatpickr(datePicker, {
        dateFormat: "Y-m-d",
        onChange: function(selectedDates) {
            loadReservations(selectedDates[0]);
        }
    });

    // Učitaj rezervacije za današnji datum pri učitavanju stranice
    loadReservations(new Date());

    // Učitaj usluge
    loadServices();

    // Dohvati podatke o prijavljenom administratoru
    fetch('/api/admin-dashboard', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Nije autoriziran');
        }
        return response.json();
    })
    .then(data => {
        welcomeMessage.textContent = `Dobrodošli, ${data.username}!`;
    })
    .catch(error => {
        console.error('Error:', error);
        window.location.href = '/admin-login.html';
    });

    // Funkcija za učitavanje rezervacija
    function loadReservations(date) {
        fetch(`/api/reservations?date=${date.toISOString().split('T')[0]}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(reservations => {
            reservationsBody.innerHTML = '';
            reservations.forEach(reservation => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${reservation.date}</td>
                    <td>${reservation.time}</td>
                    <td>${reservation.name}</td>
                    <td>${reservation.service}</td>
                    <td>
                        <button onclick="editReservation(${reservation.id})">Uredi</button>
                        <button onclick="deleteReservation(${reservation.id})">Obriši</button>
                    </td>
                `;
                reservationsBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error:', error));
    }

    // Funkcija za učitavanje usluga
    function loadServices() {
        fetch('/api/services', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(services => {
            servicesBody.innerHTML = '';
            services.forEach(service => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${service.name}</td>
                    <td>${service.duration} min</td>
                    <td>${service.price} kn</td>
                    <td>
                        <button onclick="editService(${service.id})">Uredi</button>
                        <button onclick="deleteService(${service.id})">Obriši</button>
                    </td>
                `;
                servicesBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error:', error));
    }

    // Dodavanje nove usluge
    addServiceForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('service-name').value;
        const duration = document.getElementById('service-duration').value;
        const price = document.getElementById('service-price').value;

        fetch('/api/services', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, duration, price })
        })
        .then(response => response.json())
        .then(() => {
            loadServices();
            addServiceForm.reset();
        })
        .catch(error => console.error('Error:', error));
    });

    // Odjava
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin-login.html';
    });

    const editReservationModal = document.getElementById('editReservationModal');
    const editServiceModal = document.getElementById('editServiceModal');
    const closeButtons = document.getElementsByClassName('close');

    // Zatvaranje modalnih dijaloga
    for (let i = 0; i < closeButtons.length; i++) {
        closeButtons[i].onclick = function() {
            editReservationModal.style.display = "none";
            editServiceModal.style.display = "none";
        }
    }

    window.onclick = function(event) {
        if (event.target == editReservationModal) {
            editReservationModal.style.display = "none";
        }
        if (event.target == editServiceModal) {
            editServiceModal.style.display = "none";
        }
    }

    // Funkcije za uređivanje i brisanje rezervacija i usluga
    window.editReservation = function(id) {
        // Dohvati postojeće podatke o rezervaciji
        fetch(`/api/reservations/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(reservation => {
            document.getElementById('editReservationId').value = id;
            document.getElementById('editReservationDate').value = reservation.date;
            document.getElementById('editReservationTime').value = reservation.time;
            document.getElementById('editReservationName').value = reservation.name;
            document.getElementById('editReservationService').value = reservation.service;
            editReservationModal.style.display = "block";
        })
        .catch(error => console.error('Error:', error));
    }

    document.getElementById('editReservationForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const id = document.getElementById('editReservationId').value;
        const date = document.getElementById('editReservationDate').value;
        const time = document.getElementById('editReservationTime').value;
        const name = document.getElementById('editReservationName').value;
        const service = document.getElementById('editReservationService').value;

        fetch(`/api/reservations/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ date, time, name, service })
        })
        .then(response => response.json())
        .then(() => {
            loadReservations(new Date(date));
            editReservationModal.style.display = "none";
        })
        .catch(error => console.error('Error:', error));
    });

    window.editService = function(id) {
        // Dohvati postojeće podatke o usluzi
        fetch(`/api/services/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(service => {
            document.getElementById('editServiceId').value = id;
            document.getElementById('editServiceName').value = service.name;
            document.getElementById('editServiceDuration').value = service.duration;
            document.getElementById('editServicePrice').value = service.price;
            editServiceModal.style.display = "block";
        })
        .catch(error => console.error('Error:', error));
    }

    document.getElementById('editServiceForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const id = document.getElementById('editServiceId').value;
        const name = document.getElementById('editServiceName').value;
        const duration = document.getElementById('editServiceDuration').value;
        const price = document.getElementById('editServicePrice').value;

        fetch(`/api/services/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, duration, price })
        })
        .then(response => response.json())
        .then(() => {
            loadServices();
            editServiceModal.style.display = "none";
        })
        .catch(error => console.error('Error:', error));
    });

    window.deleteReservation = function(id) {
        if (confirm("Jeste li sigurni da želite obrisati ovu rezervaciju?")) {
            fetch(`/api/reservations/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => response.json())
            .then(() => {
                loadReservations(new Date(datePicker.value));
            })
            .catch(error => console.error('Error:', error));
        }
    }

    window.deleteService = function(id) {
        if (confirm("Jeste li sigurni da želite obrisati ovu uslugu?")) {
            fetch(`/api/services/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => response.json())
            .then(() => {
                loadServices();
            })
            .catch(error => console.error('Error:', error));
        }
    }
});
