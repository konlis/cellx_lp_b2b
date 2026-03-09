(function() {
  'use strict';

  // ---- Configuration ----
  var STORAGE_KEY = 'cookieConsent';
  var CONSENT_VERSION = 1;
  var CONSENT_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000; // 12 months
  var GOOGLE_ADS_ID = 'AW-XXXXXXXXXX'; // Replace with real ID
  var GOOGLE_ADS_CONVERSION_LABEL = 'XXXXXXXXXXXXXXXXXXX'; // Replace with real label
  var META_PIXEL_ID = 'XXXXXXXXXXXXXXX'; // Replace with real ID

  var googleAdsInjected = false;
  var metaPixelInjected = false;

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

  // ---- Script Injection ----
  function injectGoogleAds() {
    if (googleAdsInjected) return;
    googleAdsInjected = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GOOGLE_ADS_ID;
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GOOGLE_ADS_ID);
  }

  function injectMetaPixel() {
    if (metaPixelInjected) return;
    metaPixelInjected = true;
    !function(f,b,e,v,n,t,s) {
      if(f.fbq) return;
      n = f.fbq = function() { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if(!f._fbq) f._fbq = n;
      n.push = n; n.loaded = !0; n.version = '2.0';
      n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', META_PIXEL_ID);
    window.fbq('track', 'PageView');
  }

  function applyConsent(consent) {
    if (consent.analytics) injectGoogleAds();
    if (consent.marketing) injectMetaPixel();
  }

  // Expose conversion label for form tracking in main.js
  window.CookieConsentConfig = {
    adsConversionLabel: GOOGLE_ADS_ID + '/' + GOOGLE_ADS_CONVERSION_LABEL
  };

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
