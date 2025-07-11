// Loading indicator utilities
class LoadingIndicator {
  constructor() {
    this.createLoadingOverlay();
  }

  createLoadingOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.innerHTML = `
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p class="loading-text">Učitava...</p>
      </div>
    `;
    
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    `;

    document.body.appendChild(overlay);
  }

  show(text = 'Učitava...') {
    const overlay = document.getElementById('loading-overlay');
    const loadingText = overlay.querySelector('.loading-text');
    if (loadingText) loadingText.textContent = text;
    overlay.style.display = 'flex';
  }

  hide() {
    const overlay = document.getElementById('loading-overlay');
    overlay.style.display = 'none';
  }

  // Show loading for button
  showButtonLoading(button, originalText = 'Pošalji') {
    button.disabled = true;
    button.innerHTML = `
      <span class="button-spinner"></span>
      Šalje...
    `;
  }

  hideButtonLoading(button, originalText = 'Pošalji') {
    button.disabled = false;
    button.innerHTML = originalText;
  }
}

// Global loading instance
const loading = new LoadingIndicator();

// CSS for spinners
const spinnerStyles = document.createElement('style');
spinnerStyles.textContent = `
  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .button-spinner {
    display: inline-block;
    width: 12px;
    height: 12px;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-right: 5px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .loading-spinner {
    text-align: center;
    color: white;
  }

  .loading-text {
    margin-top: 1rem;
    font-size: 1.1rem;
  }
`;
document.head.appendChild(spinnerStyles);
