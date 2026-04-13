# Mailbox Merge

Separate client-facing Mailbox Merge website built from the earlier project as a
new multi-page version for launch.

## Pages

- `index.html`: main sales page with estimator, inquiry form, Stripe-ready payment flow, and order confirmation popup
- `mockups.html`: polished fictional postcard examples
- `faq.html`: customer-facing answers for pricing, timing, artwork, and service area
- `policies.html`: payment, refund, artwork, and timing policies

## Core files

- `styles.css`: shared layout and page styling across all pages
- `pricing.js`: quote logic used by the estimator and Stripe function
- `script.js`: inquiry flow, upload preview, estimator syncing, Stripe checkout redirect, and payment success popup
- `netlify/functions/create-checkout-session.js`: creates Stripe Checkout sessions
- `netlify/functions/get-checkout-session.js`: loads order details for the thank-you popup

## Launch reminders

- Keep `STRIPE_SECRET_KEY` in Netlify environment variables only
- Upload the updated HTML, CSS, JS, and `netlify/functions` files to GitHub before deploy
- Test inquiry draft flow, Stripe test payment, and thank-you popup on the deployed site
- Current contact details on the site:
  - `Kingsley@mailboxmerge.com`
  - `(619) 991-3555`
  - `San Luis Obispo, CA`

## Policy assumptions used in this version

- Deposits become non-refundable once design or route planning begins
- Full payment is required before print
- No refunds after print approval
- Ads should be submitted within one week when possible
- Print is generally prepared within two weeks, but timing remains estimated
- Custom ad creation is `$85` with revisions until print approval

## Current household options

- `1,000`
- `2,500`
- `5,000`
- `7,500`
- `10,000`
