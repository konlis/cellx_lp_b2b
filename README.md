# Retrofit24 Home Fit+ — Landing Page

Landing page for Retrofit24 Home Fit+, a Polish energy storage add-on that lets homeowners expand existing PV installations with battery storage without replacing the inverter. Targets southern Poland (Rzeszow, Krakow, Katowice, Wroclaw, Tarnow, Nowy Sacz, Kielce).

## Tech Stack

- **Plain HTML/CSS/JS** — no framework, no build step
- **Vercel** — static hosting + serverless function for contact form
- **Resend** — transactional email API for form submissions

## Project Structure

```
retrofit24/
  index.html              # Single-page landing (all sections inline)
  css/styles.css           # Design system, layout, animations, responsive
  js/main.js               # Scroll observers, nav, counters, FAQ accordion, form
  js/lightning.js           # Canvas hero animation (energy lightning bolts)
  api/send.js              # Vercel serverless function — Resend email
  assets/images/           # Product photos, app screenshot
  robots.txt
  sitemap.xml
  vercel.json              # Security headers + cache config
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

**To set up Resend:**
1. Create an account at [resend.com](https://resend.com)
2. Add and verify your sending domain (e.g., `retrofit24.pl`)
3. Generate an API key
4. Add `RESEND_API_KEY` and `RECIPIENT_EMAIL` as Vercel environment variables

**Email format:**
- **From:** `Retrofit24 Home Fit+ <noreply@retrofit24.pl>`
- **Subject:** `Nowe zapytanie Home Fit+ — [Name] z [City]`
- **Reply-To:** submitter's email
- Includes all form fields in a formatted HTML table

## Page Sections

1. Sticky navigation with mobile hamburger
2. Hero with canvas lightning animation + product image
3. Trust strip (stats: cost savings, install time, standby power, efficiency)
4. Context intro (why battery storage)
5. Core benefits (7 cards from client requirements)
6. Comparison table (retrofit vs hybrid inverter — cost, standby, installation)
7. How it works (3 steps)
8. Product showcase (tech specs grid)
9. Mobile app preview
10. Service area (SVG map of southern Poland)
11. FAQ accordion (10 questions)
12. Contact form with validation
13. Footer

## SEO

- `<html lang="pl">`, semantic HTML5, single H1
- JSON-LD structured data: Product, FAQPage, LocalBusiness (7 cities), BreadcrumbList
- Open Graph meta tags
- Semantic `<table>` for comparison data
- Polish alt texts on all images
- `robots.txt` + `sitemap.xml`

## Design

- **Theme:** Dark tech-premium ("energy noir")
- **Colors:** Black (#1d1d1f), green accent (#7ed957), blue highlight (#005cbb)
- **Font:** Montserrat (400/600/800)
- **Animations:** Canvas lightning bolts, scroll reveals, animated counters, floating product image
- **Responsive:** Mobile (375px), tablet (768px), desktop (1440px)
