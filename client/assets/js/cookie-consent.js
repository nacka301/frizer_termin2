// Cookie consent management
class CookieConsent {
  constructor() {
    this.consentKey = 'frizerke_cookie_consent';
    this.init();
  }

  init() {
    // Check if consent already given
    if (!this.hasConsent()) {
      this.showConsentBanner();
    }
  }

  hasConsent() {
    return localStorage.getItem(this.consentKey) === 'accepted';
  }

  acceptConsent() {
    localStorage.setItem(this.consentKey, 'accepted');
    this.hideConsentBanner();
  }

  showConsentBanner() {
    // Create consent banner if it doesn't exist
    if (document.getElementById('cookie-consent-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'cookie-consent-banner';
    banner.innerHTML = `
      <div class="cookie-consent-content">
        <div class="cookie-consent-text">
          <h4>🍪 Kolačići (Cookies)</h4>
          <p>Koristimo kolačiće za poboljšanje vašeg iskustva na našoj stranici. Klikom na "Prihvaćam" pristajete na korištenje kolačića.</p>
          <a href="privacy-policy.html" target="_blank">Saznajte više</a>
        </div>
        <div class="cookie-consent-actions">
          <button id="accept-cookies" class="btn-primary">Prihvaćam</button>
          <button id="decline-cookies" class="btn-secondary">Odbijam</button>
        </div>
      </div>
    `;

    // Add styles
    banner.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(0, 0, 0, 0.95);
      color: white;
      z-index: 10000;
      padding: 1rem;
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.3);
    `;

    document.body.appendChild(banner);

    // Add event listeners
    document.getElementById('accept-cookies').addEventListener('click', () => {
      this.acceptConsent();
    });

    document.getElementById('decline-cookies').addEventListener('click', () => {
      this.hideConsentBanner();
      // You might want to disable certain features here
    });
  }

  hideConsentBanner() {
    const banner = document.getElementById('cookie-consent-banner');
    if (banner) {
      banner.remove();
    }
  }
}

// Initialize cookie consent when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new CookieConsent();
});
