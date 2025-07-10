document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar');
    const appointmentsDiv = document.getElementById('appointments');

    flatpickr(calendarEl, {
        inline: true,
        onChange: function(selectedDates, dateStr, instance) {
            fetchAppointments(dateStr);
        }
    });

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
});