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