(function() {
  'use strict';

  // ---- Configuration ----
  var STORAGE_KEY = 'cookieConsent';
  var CONSENT_VERSION = 2;
  var CONSENT_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000; // 12 months

  window.CookieConsentConfig = { gtmId: 'GTM-XXXXXXX' };

  // ---- Consent Storage ----
  function getConsent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function saveConsent(analytics, marketing) {
    var consent = {
      necessary: true,
      analytics: !!analytics,
      marketing: !!marketing,
      timestamp: Date.now(),
      version: CONSENT_VERSION
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    return consent;
  }

  function hasValidConsent() {
    var consent = getConsent();
    if (!consent) return false;
    if (consent.version !== CONSENT_VERSION) return false;
    if (Date.now() - consent.timestamp > CONSENT_MAX_AGE_MS) return false;
    return true;
  }

  // ---- Consent Mode v2 Update ----
  function applyConsent(consent) {
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }

    gtag('consent', 'update', {
      'analytics_storage': consent.analytics ? 'granted' : 'denied',
      'ad_storage': consent.analytics ? 'granted' : 'denied',
      'ad_user_data': consent.analytics ? 'granted' : 'denied',
      'ad_personalization': consent.marketing ? 'granted' : 'denied'
    });
  }

  // ---- UI: Banner ----
  var bannerEl = null;
  var modalOverlay = null;

  function createBanner() {
    var el = document.createElement('div');
    el.className = 'cookie-banner';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Zgoda na pliki cookies');
    el.innerHTML =
      '<div class="container">' +
        '<div class="cookie-banner__content">' +
          '<div class="cookie-banner__text">' +
            'Używamy plików cookies, aby mierzyć skuteczność reklam i śledzić konwersje (Google Ads) oraz prowadzić remarketing (Meta Pixel). ' +
            'Cookies niezbędne są zawsze aktywne. <a href="/privacy.html">Polityka prywatności</a>' +
          '</div>' +
          '<div class="cookie-banner__buttons">' +
            '<button class="btn btn-primary btn-small" id="cookieAcceptAll">Akceptuj wszystkie</button>' +
            '<button class="btn btn-outline btn-small" id="cookieReject">Odrzuć opcjonalne</button>' +
            '<button class="btn btn-outline btn-small" id="cookieOpenSettings">Ustawienia</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(el);
    bannerEl = el;

    document.getElementById('cookieAcceptAll').addEventListener('click', onAcceptAll);
    document.getElementById('cookieReject').addEventListener('click', onRejectOptional);
    document.getElementById('cookieOpenSettings').addEventListener('click', function() {
      hideBanner();
      showModal();
    });
  }

  function showBanner() {
    if (!bannerEl) createBanner();
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        bannerEl.classList.add('visible');
      });
    });
  }

  function hideBanner() {
    if (bannerEl) bannerEl.classList.remove('visible');
  }

  // ---- UI: Modal ----
  function createModal() {
    var consent = getConsent() || { analytics: false, marketing: false };
    var overlay = document.createElement('div');
    overlay.className = 'cookie-modal-overlay';
    overlay.innerHTML =
      '<div class="cookie-modal">' +
        '<h3>Ustawienia cookies</h3>' +
        '<p class="cookie-modal__desc">Wybierz, które kategorie cookies chcesz włączyć. Cookies niezbędne są zawsze aktywne.</p>' +

        '<div class="cookie-modal__category">' +
          '<div class="cookie-modal__cat-info">' +
            '<h4>Niezbędne</h4>' +
            '<p>Zapamiętanie Twoich preferencji cookies.</p>' +
          '</div>' +
          '<span class="cookie-modal__badge">Zawsze aktywne</span>' +
        '</div>' +

        '<div class="cookie-modal__category">' +
          '<div class="cookie-modal__cat-info">' +
            '<h4>Analityczne</h4>' +
            '<p>Google Ads — śledzenie konwersji reklamowych i mierzenie skuteczności kampanii.</p>' +
          '</div>' +
          '<label class="toggle-switch">' +
            '<input type="checkbox" id="toggleAnalytics"' + (consent.analytics ? ' checked' : '') + '>' +
            '<span class="toggle-switch__slider"></span>' +
          '</label>' +
        '</div>' +

        '<div class="cookie-modal__category">' +
          '<div class="cookie-modal__cat-info">' +
            '<h4>Marketingowe</h4>' +
            '<p>Meta Pixel — remarketing na Facebooku i Instagramie.</p>' +
          '</div>' +
          '<label class="toggle-switch">' +
            '<input type="checkbox" id="toggleMarketing"' + (consent.marketing ? ' checked' : '') + '>' +
            '<span class="toggle-switch__slider"></span>' +
          '</label>' +
        '</div>' +

        '<button class="btn btn-primary cookie-modal__save" id="cookieSaveSettings">Zapisz ustawienia</button>' +
      '</div>';

    document.body.appendChild(overlay);
    modalOverlay = overlay;

    document.getElementById('cookieSaveSettings').addEventListener('click', onSaveSettings);
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) hideModal();
    });
  }

  function showModal() {
    if (modalOverlay) {
      modalOverlay.remove();
      modalOverlay = null;
    }
    createModal();
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        modalOverlay.classList.add('visible');
      });
    });
  }

  function hideModal() {
    if (modalOverlay) {
      modalOverlay.classList.remove('visible');
      setTimeout(function() {
        if (modalOverlay) {
          modalOverlay.remove();
          modalOverlay = null;
        }
      }, 300);
    }
  }

  // ---- Handlers ----
  function onAcceptAll() {
    var consent = saveConsent(true, true);
    hideBanner();
    applyConsent(consent);
  }

  function onRejectOptional() {
    saveConsent(false, false);
    hideBanner();
  }

  function onSaveSettings() {
    var analytics = document.getElementById('toggleAnalytics').checked;
    var marketing = document.getElementById('toggleMarketing').checked;
    var consent = saveConsent(analytics, marketing);
    hideModal();
    hideBanner();
    applyConsent(consent);
  }

  // ---- Init ----
  function init() {
    if (hasValidConsent()) {
      applyConsent(getConsent());
    } else {
      showBanner();
    }

    // Footer link to reopen settings
    var footerLink = document.getElementById('openCookieSettings');
    if (footerLink) {
      footerLink.addEventListener('click', function(e) {
        e.preventDefault();
        showModal();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
