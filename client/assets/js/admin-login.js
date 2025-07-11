document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('admin-login-form');

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Onemogući dugme tokom slanja zahtjeva
        const submitButton = loginForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Prijavljivanje...';

        try {
            const response = await fetch('/api/admin-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                alert('Uspješno ste se prijavili!');
                window.location.href = '/admin-dashboard';
            } else {
                alert(data.message || 'Neispravno korisničko ime ili lozinka');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Došlo je do greške prilikom prijave. Molimo pokušajte ponovo.');
        } finally {
            // Omogući dugme ponovo
            submitButton.disabled = false;
            submitButton.textContent = 'Login';
        }
    });
});