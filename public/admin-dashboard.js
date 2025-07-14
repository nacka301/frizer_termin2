document.addEventListener('DOMContentLoaded', function() {
  const logoutBtn = document.getElementById('logout-btn');
  logoutBtn.addEventListener('click', async function() {
    await fetch('/api/admin-logout', { method: 'POST' });
    window.location.href = '/admin-login';
  });
});
