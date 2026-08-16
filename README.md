# Miqyas

A zakat calculator covering four madhahib: Hanafi, Maliki, Shafi'i, and Hanbali- kept strictly
separate. Pick one school on the homepage; every question and result in that session draws only
from that school's rules.

**Live structure:** `index.html` (madhhab selector) → `calculator.html` (income/asset entry,
branches by locked-in madhhab) → results, with a link out to `masarif.html` (Niagara-first giving
directory).

## Status

Working prototype. Plain HTML/CSS/JS, no build step, no framework, deployable as-is on GitHub
Pages.

- [x] Madhhab selector, session-locked
- [x] Calculator: assets, gold/silver, income mix, debts, receivables
- [x] Per-madhhab calculation logic (Hanafi, Maliki, Shafi'i, Hanbali)
- [x] Results breakdown with flags for review
- [x] Methodology, Masarif, About, Privacy, Cookies pages
- [ ] Update `GOLD_PRICE_PER_GRAM_CAD` and `SILVER_PRICE_PER_GRAM_CAD` in `js/main.js`
      with that day's actual CAD spot price, never wire these to a live price API
- [ ] Replace Masarif placeholder organizations with verified Niagara listings
- [ ] Get the Methodology page's four rule sets checked against real sourcing before launch
- [ ] Fill in `about.html` with real name/contact

## Structure

```
miqyas/
  index.html         Madhhab selector (home)
  calculator.html     Step-by-step calculator
  methodology.html    All four rule sets, sourced
  masarif.html         Giving directory + region intake form
  about.html           Who built this
  privacy.html         Privacy policy
  cookies.html          Cookie policy
  css/style.css        Design tokens + all styles
  js/main.js            Nav, selector, calculator logic
```

## Design notes

Palette and type are defined as CSS custom properties at the top of `css/style.css` — ink,
parchment, verdigris, brass, rust. No gradients, no emoji-as-icon (all icons are inline SVG), and
motion is limited to simple transitions that respect `prefers-reduced-motion`.

## Running locally

No build tooling required. Open `index.html` directly, or serve the folder:

```bash
python3 -m http.server 8000
```

## Deploying

Push to a GitHub repo and enable GitHub Pages on the `main` branch, root folder. No CI step
needed for this stage.
