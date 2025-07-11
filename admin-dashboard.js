document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar');
    const appointmentsDiv = document.getElementById('appointments');
    const selectedDateDiv = document.getElementById('selectedDate');

    // Inicijalizacija kalendara
    flatpickr(calendarEl, {
        inline: true,
        dateFormat: "Y-m-d",
        defaultDate: new Date(),
        onChange: function(selectedDates, dateStr, instance) {
            if (dateStr) {
                fetchAppointments(dateStr);
                selectedDateDiv.innerHTML = `Rezervacije za ${dateStr}`;
            }
        }
    });

    // Učitaj rezervacije za današnji dan po defaultu
    const today = new Date().toISOString().split('T')[0];
    fetchAppointments(today);
    selectedDateDiv.innerHTML = `Rezervacije za ${today}`;

    // Funkcija za dohvaćanje rezervacija s servera
    async function fetchAppointments(date) {
        try {
            appointmentsDiv.innerHTML = 'Učitavanje...';
            
            const response = await fetch(`/api/admin/appointments?date=${date}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            if (response.ok) {
                const appointments = await response.json();
                displayAppointments(appointments);
            } else if (response.status === 401) {
                alert('Vaša sesija je istekla. Molimo prijavite se ponovo.');
                window.location.href = '/admin-login';
            } else {
                throw new Error(`Greška pri dohvaćanju rezervacija: ${response.status}`);
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
            appointmentsDiv.innerHTML = `<p style="color: red;">Greška pri učitavanju rezervacija. Molimo pokušajte ponovo.</p>`;
        }
    }

    // Funkcija za prikaz rezervacija
    function displayAppointments(appointments) {
        if (appointments.length === 0) {
            appointmentsDiv.innerHTML = '<div class="no-appointments">Nema rezervacija za ovaj dan</div>';
            return;
        }

        let html = '';
        appointments.forEach(appointment => {
            html += `
                <div class="appointment-card">
                    <div class="appointment-time">${appointment.time}</div>
                    <div class="appointment-client">${appointment.ime} ${appointment.prezime}</div>
                    <div class="appointment-service">${appointment.service} (${appointment.duration} min) - ${appointment.price}€</div>
                    <div class="appointment-contact">${appointment.mobitel} | ${appointment.email}</div>
                    <button class="delete-btn" onclick="deleteAppointment(${appointment.id})">
                        Obriši
                    </button>
                    <div style="clear: both;"></div>
                </div>
            `;
        });
        appointmentsDiv.innerHTML = html;
    }

    // Globalna funkcija za brisanje rezervacije
    window.deleteAppointment = async function(appointmentId) {
        if (confirm('Jeste li sigurni da želite obrisati ovu rezervaciju?')) {
            try {
                const response = await fetch(`/api/admin/appointments/${appointmentId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include'
                });

                if (response.ok) {
                    // Ponovno učitaj rezervacije za trenutni datum
                    const currentDate = document.querySelector('.flatpickr-day.selected')?.dateObj;
                    if (currentDate) {
                        const dateStr = currentDate.toISOString().split('T')[0];
                        fetchAppointments(dateStr);
                    } else {
                        const today = new Date().toISOString().split('T')[0];
                        fetchAppointments(today);
                    }
                } else if (response.status === 401) {
                    alert('Vaša sesija je istekla. Molimo prijavite se ponovo.');
                    window.location.href = '/admin-login';
                } else {
                    throw new Error(`Greška pri brisanju rezervacije: ${response.status}`);
                }
            } catch (error) {
                console.error('Error deleting appointment:', error);
                alert('Greška pri brisanju rezervacije. Molimo pokušajte ponovo.');
            }
        }
    };
});

// Funkcija za odjavu
function logout() {
    if (confirm('Jeste li sigurni da se želite odjaviti?')) {
        fetch('/api/admin-logout', {
            method: 'POST',
            credentials: 'include'
        }).then(() => {
            window.location.href = '/admin-login';
        }).catch((error) => {
            console.error('Logout error:', error);
            window.location.href = '/admin-login';
        });
    }
}
