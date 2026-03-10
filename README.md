# Retrofit 24 — Landing Page B2B (Home Fit+)

Landing page B2B dla Home Fit+ na domenie retrofit24.pl. Magazyn energii dla firm instalacyjnych PV na Podkarpaciu. Strona skierowana do instalatorów i firm fotowoltaicznych — program partnerski, szybki montaż w 2h, wsparcie z dotacjami i zgłoszeniami do sieci.

## Tech Stack

- **Plain HTML/CSS/JS** — no framework, no build step
- **Vercel** — static hosting + serverless function for contact form
- **Resend** — transactional email API for form submissions
- **Google Tag Manager (GTM)** — centralized tag management (GA4, Google Ads, Meta Pixel, Leadinfo)
- **Google Consent Mode v2** — consent signal handling for all GTM tags
- **Custom cookie consent** — own RODO-compliant popup (no external dependencies)

## Project Structure

```
cellx_lp_b2b/
  index.html              # Single-page landing (all sections inline)
  privacy.html            # Polityka prywatności (RODO)
  css/styles.css          # Design system, layout, animations, responsive
  js/cookies.js            # RODO cookie consent (banner, modal, Consent Mode v2 updates)
  js/main.js              # Scroll observers, nav, counters, FAQ accordion, form
  js/lightning.js          # Canvas hero animation (energy lightning bolts)
  api/send.js             # Vercel serverless function — Resend email
  assets/images/          # Product photos, app screenshot
  robots.txt
  sitemap.xml
  vercel.json             # Security headers + cache config
```

## Local Development

No build required. Open `index.html` directly in a browser:

```bash
# Or use any local server:
npx serve .
# → http://localhost:3000
```

The contact form requires the Vercel serverless function to send emails (won't work locally without a proxy).

## Deployment (Vercel)

1. Push to a Git repository (GitHub/GitLab/Bitbucket)
2. Import the repository in [Vercel](https://vercel.com)
3. No build settings needed — Vercel serves static files automatically and detects `api/send.js` as a serverless function
4. Add environment variables in Vercel dashboard → Settings → Environment Variables:

| Variable | Description |
|---|---|
| `RESEND_API_KEY` | Your Resend API key ([resend.com](https://resend.com)) |
| `RECIPIENT_EMAIL` | Email address to receive form submissions |

5. Deploy

## Contact Form Setup

The form POSTs to `/api/send`, which is a Vercel serverless function that forwards submissions via the Resend API.

**Form fields (B2B):**
- Imię (required)
- Nazwa firmy (required)
- NIP
- Telefon (required)
- Email (required)
- Miasto / Region
- Liczba instalacji miesięcznie
- Wiadomość
- Zgoda RODO (required)

**To set up Resend:**
1. Create an account at [resend.com](https://resend.com)
2. Add and verify your sending domain (e.g., `retrofit24.pl`)
3. Generate an API key
4. Add `RESEND_API_KEY` and `RECIPIENT_EMAIL` as Vercel environment variables

**Email format:**
- **From:** `Home Fit+ <noreply@retrofit24.pl>`
- **Subject:** `Nowe zapytanie partnerskie Home Fit+ — [Name] z [City]`
- **Reply-To:** submitter's email
- Includes all form fields in a formatted HTML table

## Cookie Consent & Tracking Setup

Custom RODO-compliant cookie consent (`js/cookies.js`) — no external dependencies. Uses Google Tag Manager (GTM) with Consent Mode v2 for all tracking tags.

### How it works

- **Consent Mode v2 defaults** are set in `<head>` before GTM loads — all consent categories start as `denied`
- **GTM loads on every page** (`index.html`, `privacy.html`) — manages all tags (GA4, Google Ads, Meta Pixel, Leadinfo) centrally
- First visit → banner slides up from bottom with 3 options: accept all, reject optional, settings
- Settings modal → toggle switches for analytics (Google Ads, GA4, Leadinfo) and marketing (Meta Pixel)
- Consent stored in `localStorage` (key: `cookieConsent`), valid for 12 months
- On consent change → `gtag('consent', 'update', ...)` fires with granted/denied signals — GTM tags respond automatically
- No tracking scripts are injected by JS — GTM handles all script loading based on consent signals
- Footer link "Ustawienia cookies" reopens the settings modal at any time

### Configuring GTM

All tracking tags (GA4, Google Ads, Meta Pixel, Leadinfo) are managed inside GTM — not hardcoded in JS. To configure:

1. Create a GTM container at [tagmanager.google.com](https://tagmanager.google.com)
2. Replace the placeholder GTM ID in three places:
   - `index.html` — GTM snippet in `<head>` and `<noscript>` in `<body>`
   - `privacy.html` — same GTM snippet and `<noscript>`
   - `js/cookies.js` — `CookieConsentConfig.gtmId` (line 9)
   ```js
   window.CookieConsentConfig = { gtmId: 'GTM-XXXXXXX' }; // ← your GTM container ID
   ```
3. Configure tags inside GTM (see step-by-step below)
4. Publish the GTM container and deploy

### Adding tags in GTM (step-by-step)

#### A. Google Analytics 4 (GA4)

1. W GTM: **Tags** → **New** → **Tag Configuration** → **Google Analytics: GA4 Configuration**
2. Wpisz swój **Measurement ID** (`G-XXXXXXX`) — znajdziesz go w [analytics.google.com](https://analytics.google.com) → Admin → Data Streams → twój stream
3. **Triggering** → **All Pages**
4. **Consent Settings** (ikona tarczy w tagu):
   - Kliknij **Require additional consent for tag to fire**
   - Dodaj: `analytics_storage`
5. Zapisz tag jako np. "GA4 — Configuration"

#### B. Google Ads Conversion

1. W GTM: **Tags** → **New** → **Tag Configuration** → **Google Ads Conversion Tracking**
2. Wpisz:
   - **Conversion ID**: `AW-XXXXXXXXX` (z Google Ads → Tools → Conversions → twoja konwersja → Tag setup)
   - **Conversion Label**: `AbCdEfGhIjKlMnOp` (z tego samego miejsca)
3. **Triggering** → **New Trigger**:
   - Typ: **Custom Event**
   - Event name: `form_submission`
   - Zapisz trigger jako "Form Submission"
4. **Consent Settings**:
   - **Require additional consent**: `ad_storage`
5. Zapisz tag jako np. "Google Ads — Form Conversion"

#### C. Meta Pixel

1. W GTM: **Tags** → **New** → **Tag Configuration** → **Custom HTML**
2. Wklej kod:
   ```html
   <script>
   !function(f,b,e,v,n,t,s)
   {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
   n.callMethod.apply(n,arguments):n.queue.push(arguments)};
   if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
   n.queue=[];t=b.createElement(e);t.async=!0;
   t.src=v;s=b.getElementsByTagName(e)[0];
   s.parentNode.insertBefore(t,s)}(window, document,'script',
   'https://connect.facebook.net/en_US/fbevents.js');
   fbq('init', 'XXXXXXXXXXXXXXXXX');
   fbq('track', 'PageView');
   </script>
   ```
   Zamień `XXXXXXXXXXXXXXXXX` na swój Pixel ID (z [Meta Events Manager](https://business.facebook.com/events_manager) → Data Sources → twój Pixel)
3. **Triggering** → **All Pages**
4. **Consent Settings**:
   - **Require additional consent**: `ad_personalization`
5. Zapisz tag jako np. "Meta Pixel — PageView"

**Meta Pixel — Lead event (po wysłaniu formularza):**

1. **Tags** → **New** → **Custom HTML**:
   ```html
   <script>
   fbq('track', 'Lead');
   </script>
   ```
2. **Triggering** → wybierz trigger "Form Submission" (ten sam co przy Google Ads, event: `form_submission`)
3. **Consent Settings**: `ad_personalization`
4. Zapisz jako "Meta Pixel — Lead"

#### D. Leadinfo

1. W GTM: **Tags** → **New** → **Custom HTML**
2. Wklej skrypt trackingowy z panelu [Leadinfo](https://app.leadinfo.com) → Settings → Tracking Script (będzie wyglądał mniej więcej tak):
   ```html
   <script>
   (function(l,e,a,d,i,n,f,o){/* ... skrypt Leadinfo ... */})(window,document,'https://cdn.leadinfo.net/ping.js','XXXXXX');
   </script>
   ```
3. **Triggering** → **All Pages**
4. **Consent Settings**:
   - **Require additional consent**: `analytics_storage`
5. Zapisz jako "Leadinfo — Tracking"

### Consent Mode — jak to działa w GTM

Strona ustawia Consent Mode v2 defaults w `<head>` (wszystko `denied`). Gdy użytkownik wyrazi zgodę, `js/cookies.js` wysyła:

```js
gtag('consent', 'update', {
  'analytics_storage': 'granted',   // ← toggle "Analityczne"
  'ad_storage': 'granted',          // ← toggle "Analityczne"
  'ad_user_data': 'granted',        // ← toggle "Analityczne"
  'ad_personalization': 'granted'   // ← toggle "Marketingowe"
});
```

GTM automatycznie reaguje na te sygnały — tagi z ustawionym `Require additional consent` odpalą się dopiero po `granted`. Nie musisz tworzyć własnych triggerów na consent — GTM robi to sam.

| Toggle w bannerze | Consent signals → granted | Tagi które się odpalą |
|---|---|---|
| Analityczne ✅ | `analytics_storage`, `ad_storage`, `ad_user_data` | GA4, Google Ads, Leadinfo |
| Marketingowe ✅ | `ad_personalization` | Meta Pixel |
| Oba ❌ | (wszystko `denied`) | Żaden tag nie odpala |

### Conversion tracking

Po wysłaniu formularza (`js/main.js`) strona pushuje event do dataLayer:
```js
window.dataLayer.push({
  'event': 'form_submission',
  'form_type': 'contact'
});
```
Tagi Google Ads Conversion i Meta Pixel Lead (skonfigurowane powyżej) triggerują się na ten event — ale tylko jeśli użytkownik wyraził odpowiednią zgodę.

### CSP (Content Security Policy)

`vercel.json` includes CSP directives for GTM and its managed tags:
- `script-src`: `googletagmanager.com`, `connect.facebook.net`
- `img-src`: `facebook.com`
- `connect-src`: `google-analytics.com`, `facebook.com`

## Page Sections

1. Sticky navigation with mobile hamburger
2. Hero with canvas lightning animation + product image
3. Trust strip (stats: 4x instalacji, 2h montaż, 4W standby, >86% sprawność)
4. Context intro (dlaczego Home Fit+ w ofercie — 3 karty B2B)
5. Core benefits (9 kart z perspektywy instalatora)
6. Comparison table (Home Fit+ vs hybrid inverter — koszty, standby, montaż, wsparcie)
7. Jak wygląda współpraca (3 kroki)
8. Product showcase (tech specs grid + kompatybilność z CellX)
9. Mobile app preview (narzędzie sprzedażowe)
10. Mapa partnerska (SVG — województwo podkarpackie: Rzeszów, Przemyśl, Krosno, Stalowa Wola, Mielec, Tarnobrzeg)
11. FAQ accordion (13 pytań B2B)
12. Contact form B2B with validation
13. Footer
14. Polityka prywatności (osobna strona)

## SEO

- `<html lang="pl">`, semantic HTML5, single H1
- JSON-LD structured data: Product, FAQPage, LocalBusiness (6 miast podkarpackich), BreadcrumbList
- Open Graph meta tags
- Semantic `<table>` for comparison data
- Polish alt texts on all images
- `robots.txt` + `sitemap.xml`
- Fokus SEO: Podkarpacie, województwo podkarpackie, Rzeszów, Przemyśl, Krosno, Stalowa Wola, Mielec, Tarnobrzeg

## Design

- **Theme:** Dark tech-premium ("energy noir")
- **Colors:** Black (#1d1d1f), green accent (#7ed957), blue highlight (#005cbb)
- **Font:** Montserrat (400/600/800)
- **Animations:** Canvas lightning bolts, scroll reveals, animated counters, floating product image
- **Responsive:** Mobile (375px), tablet (768px), desktop (1440px)
