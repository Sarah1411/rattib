# Rattib — رتّب

**Sell it, donate it, or recycle it. Never just dump it.**

A second-hand marketplace built for Saudi Arabia, designed to fix the fragmented,
hard-to-filter classifieds experience of existing platforms while adding a trust
layer that's largely missing from item resale and donation today.

## The problem

- General classifieds platforms (Haraj, OpenSooq, Facebook Marketplace) dump every
  category into one undifferentiated feed, with weak filtering and no
  category-specific structure.
- Item donation has no feedback loop — give something away and you rarely find out
  what happened to it, unlike cash donations, which come with a clear receipt.
- There's little to no trust infrastructure between strangers transacting: no
  ratings, no protected in-app communication, no defense against being pushed
  off-platform into an unprotected conversation.

## What Rattib does

- **Structured browse & filter** — real faceted filtering by category, condition,
  location, price, brand, and keyword search, instead of one long undifferentiated feed.
- **AI photo analysis** — upload one photo of an item and Claude's vision model reads
  it, returning item name, material, condition, and flags for visible defects or
  safety hazards.
- **Buyer/seller ratings** — a double-blind rating flow (neither side sees the
  other's rating until both submit) builds toward Trusted Buyer / Trusted Seller status.
- **In-app chat with safety filtering** — buyers and sellers message inside the app
  without exchanging phone numbers up front; messages that try to share contact
  info, redirect off-platform, or contain harassment are automatically held back.
- **Donation confirmation loop** — charity partners confirm receipt in-app, generating
  a shareable "impact card" (e.g. *"your blender helped a family in Dammam"*) instead
  of leaving donors wondering what happened.
- **Saved-search alerts** — save a filter combination and get notified when a new
  matching listing appears.
- **Recycling triage** *(planned)* — items too worn to sell or donate get routed
  toward established recycling partners, in line with Saudi Vision 2030
  waste-diversion goals.

## Tech stack

- Vanilla HTML/CSS/JS — single-page site, client-side view switching, no build step
- Vercel serverless function (`api/analyze-photo.js`) calling the Anthropic API
  (Claude, vision) for real AI photo analysis
- Google Fonts: Cairo (display), IBM Plex Sans (body), IBM Plex Mono (data/prices)

## What's real vs. mocked in this build

Being upfront about scope, since this was built at hackathon speed:

**Real:** filtering and sorting logic, keyword search, the double-blind rating
reveal mechanic, the chat safety-filter logic, AI photo analysis (once deployed
with an API key).

**Mocked for demo purposes:** payment/checkout, the charity side of the donation
confirmation (simulated with a button), saved-search notifications (confirms the
save, doesn't send a real notification), user accounts/authentication, and
persistence across page reloads.

## Getting started

### Run it as-is, no setup required
Open `index.html` directly in a browser. Every feature works except live AI photo
analysis, which gracefully falls back to a demo response if no backend is deployed.

### Enable live AI photo analysis
1. Get an API key at [console.anthropic.com](https://console.anthropic.com)
2. Deploy this repo to [Vercel](https://vercel.com) (Import Project → this repo)
3. In the Vercel project's **Settings → Environment Variables**, add:
   ```
   ANTHROPIC_API_KEY=your_key_here
   ```
4. Deploy. The `/api/analyze-photo` endpoint will now call Claude's vision model live.

### Run it locally
```bash
npm install -g vercel
vercel dev
```
Then open the localhost URL Vercel prints, with your API key set in a local `.env` file.

## Project structure
```
index.html            the site — Home / Browse / Item / Donate views
api/analyze-photo.js  serverless function calling Claude's vision API
.env.example           template for the required environment variable
.gitignore             excludes .env and local build artifacts
```

## Roadmap

- Real payment facilitation + escrow via a SAMA-licensed PSP (HyperPay, Moyasar,
  or PayTabs), supporting Mada, Apple Pay, STC Pay, and Tabby/Tamara BNPL
- ID/phone verification feeding into the trust score system
- Formal charity partnerships with structured confirmation workflows
- Recycling triage partnerships with established players (e.g. SIRC)
- A verified/inspection tier for high-value categories (electronics, jewelry, watches)
- Full Arabic/RTL support (English-only for now)
- Native iOS/Android apps
- Real-time saved-search push notifications
- Response-time/reliability badges, and a dispute flow tied to ratings
- Regulatory groundwork: Ministry of Commerce registration, PDPL compliance,
  ZATCA e-invoicing

## Demo

- Live demo: https://rattib-project1.vercel.app/
- Video walkthrough: *add your demo video link here*

## Built with

Designed and prototyped with [Claude](https://claude.ai) (Anthropic).

## License

*Add your preferred license here — MIT is a common permissive choice for hackathon projects.*
