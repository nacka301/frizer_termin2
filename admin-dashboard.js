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
                selectedDateDiv.innerHTML = `<strong>Rezervacije za ${formatDateDisplay(dateStr)}</strong>`;
            }
        }
    });

    // Učitaj rezervacije za današnji dan po defaultu
    const today = new Date().toISOString().split('T')[0];
    fetchAppointments(today);
    selectedDateDiv.innerHTML = `<strong>Rezervacije za ${formatDateDisplay(today)}</strong>`;

    // Funkcija za formatiranje datuma za prikaz
    function formatDateDisplay(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('hr-HR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }

    // Funkcija za dohvaćanje rezervacija s servera
    async function fetchAppointments(date) {
        try {
            appointmentsDiv.innerHTML = '<div class="loading"></div><div class="loading-text">Učitavanje rezervacija...</div>';
            
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
                const errorData = await response.json().catch(() => ({}));
                console.error('Server response:', response.status, errorData);
                throw new Error(`Greška pri dohvaćanju rezervacija: ${response.status}`);
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
            appointmentsDiv.innerHTML = `<p style="color: red;">Greška pri učitavanju rezervacija: ${error.message}<br>Molimo pokušajte ponovo.</p>`;
        }
    }

    // Funkcija za prikaz rezervacija
    function displayAppointments(appointments) {
        if (appointments.length === 0) {
            appointmentsDiv.innerHTML = '<div class="no-appointments"><i class="fas fa-calendar-times"></i><br>Nema rezervacija za ovaj dan</div>';
            return;
        }

        let html = '';
        appointments.forEach(appointment => {
            html += `
                <div class="appointment-card">
                    <div class="appointment-time">
                        <i class="fas fa-clock"></i> ${appointment.time}
                    </div>
                    <div class="appointment-client">
                        <i class="fas fa-user"></i> ${appointment.ime} ${appointment.prezime}
                    </div>
                    <div class="appointment-service">
                        <i class="fas fa-cut"></i> ${appointment.service} (${appointment.duration} min) - ${appointment.price}€
                    </div>
                    <div class="appointment-contact">
                        <i class="fas fa-phone"></i> ${appointment.mobitel} | <i class="fas fa-envelope"></i> ${appointment.email}
                    </div>
                    <button class="delete-btn" onclick="deleteAppointment(${appointment.id})">
                        <i class="fas fa-trash"></i> Obriši
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
                // Find and disable the delete button
                const deleteBtn = event.target.closest('button');
                const originalText = deleteBtn.innerHTML;
                deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Brišem...';
                deleteBtn.disabled = true;

                const response = await fetch(`/api/admin/appointments/${appointmentId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include'
                });

                if (response.ok) {
                    // Show success message briefly
                    deleteBtn.innerHTML = '<i class="fas fa-check"></i> Obrisano';
                    deleteBtn.style.background = 'linear-gradient(45deg, #27ae60, #2ecc71)';
                    
                    setTimeout(() => {
                        // Ponovno učitaj rezervacije za trenutni datum
                        const currentDate = document.querySelector('.flatpickr-day.selected')?.dateObj;
                        if (currentDate) {
                            const dateStr = currentDate.toISOString().split('T')[0];
                            fetchAppointments(dateStr);
                        } else {
                            // Fallback - reload today's appointments
                            const today = new Date().toISOString().split('T')[0];
                            fetchAppointments(today);
                        }
                    }, 1000);
                } else if (response.status === 401) {
                    alert('Vaša sesija je istekla. Molimo prijavite se ponovo.');
                    window.location.href = '/admin-login';
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    console.error('Delete response:', response.status, errorData);
                    throw new Error(`Greška pri brisanju rezervacije: ${response.status}`);
                }
            } catch (error) {
                console.error('Error deleting appointment:', error);
                const deleteBtn = event.target.closest('button');
                deleteBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Greška';
                deleteBtn.style.background = 'linear-gradient(45deg, #e74c3c, #c0392b)';
                
                setTimeout(() => {
                    deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Obriši';
                    deleteBtn.style.background = '';
                    deleteBtn.disabled = false;
                }, 2000);
            }
        }
    };
});

// Funkcija za odjavu
function logout() {
    if (confirm('Jeste li sigurni da se želite odjaviti?')) {
        const logoutBtn = document.querySelector('.logout-btn');
        const originalText = logoutBtn.innerHTML;
        logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Odjavljivanje...';
        logoutBtn.disabled = true;

        fetch('/api/admin-logout', {
            method: 'POST',
            credentials: 'include'
        }).then(() => {
            logoutBtn.innerHTML = '<i class="fas fa-check"></i> Odjavljeno';
            setTimeout(() => {
                window.location.href = '/admin-login';
            }, 1000);
        }).catch((error) => {
            console.error('Logout error:', error);
            logoutBtn.innerHTML = originalText;
            logoutBtn.disabled = false;
            alert('Greška pri odjavi. Molimo pokušajte ponovo.');
        });
    }
}
