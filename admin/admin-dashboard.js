document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: '/api/appointments',
        eventClick: function(info) {
            alert('Rezervacija: ' + info.event.title);
        }
    });
    calendar.render();
});