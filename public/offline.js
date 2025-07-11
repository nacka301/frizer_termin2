// Register service worker for offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Check online/offline status
function updateOnlineStatus() {
  const statusIndicator = document.getElementById('online-status');
  
  if (!statusIndicator) {
    // Create status indicator if it doesn't exist
    const indicator = document.createElement('div');
    indicator.id = 'online-status';
    indicator.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      padding: 5px 10px;
      border-radius: 5px;
      font-size: 12px;
      z-index: 1000;
      transition: all 0.3s ease;
    `;
    document.body.appendChild(indicator);
  }
  
  const indicator = document.getElementById('online-status');
  
  if (navigator.onLine) {
    indicator.textContent = '🟢 Online';
    indicator.style.background = '#d4edda';
    indicator.style.color = '#155724';
    indicator.style.display = 'none'; // Hide when online
  } else {
    indicator.textContent = '🔴 Offline';
    indicator.style.background = '#f8d7da';
    indicator.style.color = '#721c24';
    indicator.style.display = 'block'; // Show when offline
  }
}

// Listen for online/offline events
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// Initial check
updateOnlineStatus();
