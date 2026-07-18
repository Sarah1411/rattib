# Rattib (رتّب) — project handoff

## What this is
A second-hand marketplace for Saudi Arabia that sorts items into sell / donate / recycle,
with structured filtering (category, condition, location, price, keyword search), an
AI photo-analysis tool, a double-blind buyer/seller rating system, in-app chat with
basic safety filtering, and a donation confirmation + shareable "impact card" loop.
English-only for now; Arabic/RTL is a planned future addition, not built yet.

## Design system (already decided — keep consistent with this if extending the UI)
- Colors: Limestone `#EAE5D8` (bg), Basalt `#24211C` (text), Petrol `#1C5C53` (trust/primary),
  Clay `#A8502E` (buy/sell CTA accent), Saffron `#D89A2E` (donation/impact accent only),
  standard alert red for hazard flags.
- Type: Cairo (display/headings), IBM Plex Sans (body), IBM Plex Mono (prices/data).
- Signature UI element: the small rounded "condition tag" (`.rtag` class) — used for
  AI-read item attributes, defect/hazard flags, and reused as the donation impact card.
- Loaded via Google Fonts `@import` in the `<style>` block — needs internet to render as designed.

## File structure
```
index.html            single-file site: Home / Browse / Item / Donate views,
                       toggled client-side via showView() — no page reloads/routing
api/analyze-photo.js  Vercel serverless function — calls Claude's vision API
.env.example          template only — real key goes in Vercel env vars, never in the repo
.gitignore            excludes .env, node_modules, .vercel
```

## What's built and working (client-side only, no backend needed)
- Home: hero with a real file-upload "try it" box, 3-pillar explainer, trust section.
- Browse: working filters (category, condition, location checkboxes, price slider,
  keyword search box) over 14 seeded sample items, sort dropdown, "Notify me" saved-search
  demo (confirms with a sentence built from current filters — no real notification sent).
- Item (listing) view: AI-read condition tags, seller trust badge, double-blind star
  rating flow (both sides submit before either sees the other's rating), in-app chat with
  a demo safety filter (blocks messages containing phone numbers, off-platform redirects
  like "WhatsApp me", or basic harassment language), and a "Report" link.
- Donate view: donation-to-charity confirmation flow ("simulate charity confirms receipt"
  button) revealing a shareable impact card styled in the Saffron accent.

## What's NOT working yet — this is the actual next step
`api/analyze-photo.js` is written but not deployed. The frontend already calls
`/api/analyze-photo` when someone uploads a photo and clicks "Analyze photo" — if that
call fails (no backend deployed yet), it gracefully falls back to a canned demo response
and shows "Demo mode" instead of crashing. So the site always looks complete even before
deployment; getting the real call working is what's left, not a blocker to demoing.

## To make the AI photo analysis actually live
1. Get an Anthropic API key from console.anthropic.com (pay-as-you-go billing).
2. Push this project to a new GitHub repo (index.html at root, api/ folder as-is).
3. Import that repo into a new Vercel project (vercel.com, sign in with GitHub).
4. In the Vercel project's Settings > Environment Variables, add:
   ANTHROPIC_API_KEY = <the real key>
   (never put the real key in any file in the repo — .env.example is a template only)
5. Deploy. Vercel serves index.html as static and api/analyze-photo.js as a serverless
   function automatically, both from the same URL.
6. Test on the live URL: upload a real photo, click "Analyze photo" — the note under the
   tags should switch from "Demo mode" to "Live AI analysis, read from your photo."

## Longer-term roadmap (not needed for the hackathon, for context only)
Real payment/escrow via a SAMA-licensed PSP (HyperPay/Moyasar/PayTabs), ID verification,
formal charity partnerships, recycling triage partnerships (e.g. SIRC), a StockX-style
verification tier for high-value items, full Arabic/RTL support, native mobile apps,
and the regulatory groundwork (Ministry of Commerce registration, PDPL compliance).
