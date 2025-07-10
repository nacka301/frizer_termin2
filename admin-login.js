document.getElementById('admin-login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/admin-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            window.location.href = '/admin-dashboard.html';
        } else {
            alert('Neispravno korisničko ime ili lozinka');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Došlo je do greške prilikom prijave');
    }
});
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('admin-login-form');

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/admin-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                window.location.href = '/admin-dashboard.html';
            } else {
                alert('Neispravno korisničko ime ili lozinka');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Došlo je do greške prilikom prijave');
        }
    });
});

    function initializeCalendar() {
        flatpickr("#calendar", {
            inline: true,
            onChange: function(selectedDates, dateStr, instance) {
                fetchAppointments(dateStr);
            }
        });
    }

    function fetchAppointments(date) {
        // Ovdje biste normalno poslali zahtjev na server za dohvaćanje termina
        // Za demonstraciju, koristimo fiksne podatke
        const mockAppointments = [
            { time: '09:00', name: 'Ana Anić', service: 'Šišanje' },
            { time: '11:30', name: 'Ivo Ivić', service: 'Bojanje' },
            { time: '14:00', name: 'Maja Majić', service: 'Frizura' }
        ];

        displayAppointments(mockAppointments);
    }

    function displayAppointments(appointments) {
        appointmentsDiv.innerHTML = '<h3>Termini za odabrani dan:</h3>';
        appointments.forEach(app => {
            appointmentsDiv.innerHTML += `
                <p>${app.time} - ${app.name} (${app.service})</p>
            `;
        });
    }
;