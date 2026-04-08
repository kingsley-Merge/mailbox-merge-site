# Mailbox Merge Media

Static marketing site for a postcard ad agency that sells shared ad space on a
single mailer and supports inquiries, media upload previews, pricing tiers, and
Stripe Checkout payments.

## Files

- `index.html`: page content, tier cards, estimator, USPS stats, inquiry form, and payment section
- `styles.css`: full visual design, layout, responsive behavior, and reveal animations
- `pricing.js`: shared pricing logic used by the browser and the Stripe function
- `script.js`: pricing calculator, upload preview cards, inquiry email generation, and Stripe checkout redirect
- `netlify/functions/create-checkout-session.js`: serverless Stripe Checkout session creator

## Before you launch

- Replace `Mailbox Merge Media` with your real brand name in `index.html`
- Replace the inquiry inbox in `script.js` if you want a different destination:
  - `Kingsley@mailboxmerge.com`
- Review the sample agency fees and production assumptions in `script.js`
- Update any copy that should match your real service area, print partners, and offer details

## Stripe setup

1. Create a Stripe account and open the Developers area
2. Copy your Stripe secret key
3. In Netlify, add an environment variable named `STRIPE_SECRET_KEY`
4. Deploy the site so Netlify picks up the function and the key

The payment form sends customers to Stripe Checkout through the Netlify
function at `/.netlify/functions/create-checkout-session`.

For local or team reference, `.env.example` shows the required variable name:

- `STRIPE_SECRET_KEY`

## USPS references used in the site

- `USPS Every Door Direct Mail`
- `USPS Postal Facts: Every Door Direct Mail`
- `USPS Delivers ROI Calculator`
- `USPS Delivers Direct Mail Report`
- `USPS Delivers Informed Delivery Calculator`

The page currently uses:

- USPS EDDM Retail postage estimate: `$0.247` per piece
- Demo print and prep estimate: `$0.094` per piece

## Preview locally

- Open `index.html` directly in a browser, or
- Run `python3 -m http.server 8000` in this folder and visit `http://localhost:8000`

## Netlify deploy notes

- Netlify should publish the site root `.`
- Netlify Functions should use `netlify/functions`
- Install dependencies before deploy or let Netlify install from `package.json`

## Notes

- The upload area previews files locally in the browser; it does not store them on a server
- Inquiry actions still open an email draft
- Payment actions now use Stripe Checkout through a Netlify Function
