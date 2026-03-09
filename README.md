# Retrofit 24 — Landing Page B2B (Home Fit+)

Landing page B2B dla Home Fit+ na domenie retrofit24.pl. Magazyn energii dla firm instalacyjnych PV na Podkarpaciu. Strona skierowana do instalatorów i firm fotowoltaicznych — program partnerski, szybki montaż w 2h, wsparcie z dotacjami i zgłoszeniami do sieci.

## Tech Stack

- **Plain HTML/CSS/JS** — no framework, no build step
- **Vercel** — static hosting + serverless function for contact form
- **Resend** — transactional email API for form submissions
- **Custom cookie consent** — own RODO-compliant popup (no external dependencies)

## Project Structure

```
cellx_lp_b2b/
  index.html              # Single-page landing (all sections inline)
  privacy.html            # Polityka prywatności (RODO)
  css/styles.css          # Design system, layout, animations, responsive
  js/cookies.js            # RODO cookie consent (banner, modal, script injection)
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

Custom RODO-compliant cookie consent (`js/cookies.js`) — no external dependencies. Manages Google Ads and Meta Pixel injection based on user consent.

### How it works

- First visit → banner slides up from bottom with 3 options: accept all, reject optional, settings
- Settings modal → toggle switches for analytics (Google Ads) and marketing (Meta Pixel)
- Consent stored in `localStorage` (key: `cookieConsent`), valid for 12 months
- Scripts are injected programmatically only after consent — no tracking scripts in HTML
- Footer link "Ustawienia cookies" reopens the settings modal at any time

### Configuring Google Ads

1. Get your Google Ads Conversion ID from [Google Ads](https://ads.google.com) → Tools → Conversions
2. Open `js/cookies.js` and replace the placeholders (hardcoded, not env vars — these IDs are public):
   ```js
   var GOOGLE_ADS_ID = 'AW-123456789';                    // ← Conversion ID
   var GOOGLE_ADS_CONVERSION_LABEL = 'AbCdEfGhIjKlMnOp';  // ← Conversion Label
   ```
3. Deploy

### Configuring Meta Pixel

1. Get your Pixel ID from [Meta Events Manager](https://business.facebook.com/events_manager)
2. Open `js/cookies.js` and replace the placeholder:
   ```js
   var META_PIXEL_ID = '123456789012345'; // ← Pixel ID
   ```
3. Deploy

### Conversion tracking

After a successful form submission (`js/main.js`):
- **Google Ads**: `gtag('event', 'conversion', { send_to: 'AW-XXX/LABEL' })` — only fires if user consented to analytics cookies
- **Meta Pixel**: `fbq('track', 'Lead')` — only fires if user consented to marketing cookies

### CSP (Content Security Policy)

`vercel.json` already includes the required CSP directives for Google Ads and Meta Pixel:
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
