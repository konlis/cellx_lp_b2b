# PV Magazyn — Landing Page B2B (Home Fit+)

Landing page B2B dla Home Fit+ na domenie pv-magazyn.pl. Magazyn energii dla firm instalacyjnych PV na Podkarpaciu. Strona skierowana do instalatorów i firm fotowoltaicznych — program partnerski, szybki montaż w 2h, wsparcie z dotacjami i zgłoszeniami do sieci.

## Tech Stack

- **Plain HTML/CSS/JS** — no framework, no build step
- **Vercel** — static hosting + serverless function for contact form
- **Resend** — transactional email API for form submissions
- **CookieYes** — cookie consent banner (GDPR)

## Project Structure

```
cellx_lp_b2b/
  index.html              # Single-page landing (all sections inline)
  privacy.html            # Polityka prywatności (RODO)
  css/styles.css          # Design system, layout, animations, responsive
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
2. Add and verify your sending domain (e.g., `pv-magazyn.pl`)
3. Generate an API key
4. Add `RESEND_API_KEY` and `RECIPIENT_EMAIL` as Vercel environment variables

**Email format:**
- **From:** `Home Fit+ <noreply@pv-magazyn.pl>`
- **Subject:** `Nowe zapytanie partnerskie Home Fit+ — [Name] z [City]`
- **Reply-To:** submitter's email
- Includes all form fields in a formatted HTML table

## CookieYes Setup

Cookie consent banner via [CookieYes](https://www.cookieyes.com). Script tag in `<head>` of `index.html` and `privacy.html`.

Replace `TWOJ_KLUCZ` in both files with your CookieYes client key:
```html
<script id="cookieyes" src="https://cdn-cookieyes.com/client_data/TWOJ_KLUCZ/script.js"></script>
```

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
