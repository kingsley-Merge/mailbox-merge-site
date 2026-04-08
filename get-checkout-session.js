const Stripe = require("stripe");

function json(statusCode, payload) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  };
}

exports.handler = async function handler(event) {
  if (event.httpMethod !== "GET") {
    return json(405, { error: "Method not allowed." });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return json(500, { error: "Missing STRIPE_SECRET_KEY environment variable." });
  }

  const sessionId = event.queryStringParameters?.session_id;

  if (!sessionId) {
    return json(400, { error: "Missing session_id." });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return json(200, {
      businessName: session.metadata?.business_name || "Mailbox Merge Client",
      tierLabel: session.metadata?.tier_label || "Campaign",
      households: session.metadata?.households || "Not provided",
      invoiceType:
        session.metadata?.invoice_type === "deposit"
          ? "Booking deposit"
          : "Full campaign balance",
      customerEmail: session.customer_details?.email || session.customer_email || "Not provided",
      amountPaid: session.amount_total || 0,
      paymentStatus: session.payment_status || "unknown",
    });
  } catch (error) {
    return json(500, {
      error: error.message || "Unable to retrieve checkout session.",
    });
  }
};
