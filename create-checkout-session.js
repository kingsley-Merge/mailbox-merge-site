const Stripe = require("stripe");
const {
  tierConfig,
  calculateEstimate,
} = require("../../pricing.js");

const VALID_HOUSEHOLD_COUNTS = new Set([1000, 2500, 5000, 7500, 10000]);

function json(statusCode, payload) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  };
}

function getOrigin(event) {
  const originHeader = event.headers.origin || event.headers.Origin;

  if (originHeader) {
    return originHeader;
  }

  if (process.env.URL) {
    return process.env.URL;
  }

  if (process.env.DEPLOY_PRIME_URL) {
    return process.env.DEPLOY_PRIME_URL;
  }

  return "https://mailboxmerge.com";
}

exports.handler = async function handler(event) {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed." });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return json(500, {
      error: "Missing STRIPE_SECRET_KEY environment variable.",
    });
  }

  let payload;

  try {
    payload = JSON.parse(event.body || "{}");
  } catch (error) {
    return json(400, { error: "Invalid JSON request body." });
  }

  const {
    payerName,
    payerEmail,
    payerBusiness,
    paymentNotes,
    tierKey,
    households,
    designSupport,
  } = payload;

  if (!payerName || !payerEmail || !payerBusiness) {
    return json(400, { error: "Missing or invalid payment details." });
  }

  const householdCount = Number(households);

  if (
    !Number.isFinite(householdCount) ||
    !VALID_HOUSEHOLD_COUNTS.has(householdCount)
  ) {
    return json(400, {
      error: "Household count must be 1,000, 2,500, 5,000, 7,500, or 10,000.",
    });
  }

  let estimate;

  try {
    estimate = calculateEstimate({
      tierKey,
      households: householdCount,
      needsDesign: designSupport === "yes",
    });
  } catch (error) {
    return json(400, { error: error.message });
  }

  const amount = estimate.total;
  const amountInCents = Math.round(amount * 100);
  const origin = getOrigin(event);
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: payerEmail,
      billing_address_collection: "auto",
      success_url: `${origin}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?payment=cancelled`,
      metadata: {
        billing_contact: payerName,
        business_name: payerBusiness,
        invoice_type: "full",
        tier_key: tierKey,
        tier_label: estimate.tier.label,
        households: String(estimate.households),
        design_support: designSupport === "yes" ? "yes" : "no",
        payment_notes: paymentNotes || "",
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: amountInCents,
            product_data: {
              name: `${estimate.tier.label} campaign payment`,
              description: [
                `${payerBusiness}`,
                `${estimate.tier.space}`,
                `${estimate.households.toLocaleString()} households`,
                designSupport === "yes" ? "Includes design support" : "Artwork supplied by client",
              ].join(" • "),
            },
          },
        },
      ],
    });

    return json(200, { url: session.url });
  } catch (error) {
    return json(500, {
      error: error.message || "Unable to create Stripe Checkout session.",
    });
  }
};
