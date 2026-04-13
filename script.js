const SALES_EMAIL = "Kingsley@mailboxmerge.com";
const { tierConfig, calculateEstimate } = window.MailboxMergePricing;

const estimatorForm = document.getElementById("estimator-form");
const tierInput = document.getElementById("ad-tier");
const householdsInput = document.getElementById("household-count");
const householdReadout = document.getElementById("household-readout");
const designSupportInput = document.getElementById("design-support");

const estimateTierName = document.getElementById("estimate-tier-name");
const estimateSpace = document.getElementById("estimate-space");
const estimateReach = document.getElementById("estimate-reach");
const estimateFee = document.getElementById("estimate-fee");
const estimatePostage = document.getElementById("estimate-postage");
const estimatePrint = document.getElementById("estimate-print");
const estimatePayment = document.getElementById("estimate-payment");
const estimateTotal = document.getElementById("estimate-total");

const formTier = document.getElementById("form-tier");
const paymentTierName = document.getElementById("payment-tier-name");
const paymentTotal = document.getElementById("payment-total");

const campaignForm = document.getElementById("campaign-form");
const campaignNote = document.getElementById("campaign-note");
const mediaUpload = document.getElementById("media-upload");

const paymentForm = document.getElementById("payment-form");
const paymentNote = document.getElementById("payment-note");
const paymentSubmit = document.getElementById("payment-submit");
const successModal = document.getElementById("success-modal");
const successClose = document.getElementById("success-close");
const successCopy = document.getElementById("success-copy");
const successBusiness = document.getElementById("success-business");
const successTier = document.getElementById("success-tier");
const successHouseholds = document.getElementById("success-households");
const successAmount = document.getElementById("success-amount");
const successInvoiceType = document.getElementById("success-invoice-type");
const successEmail = document.getElementById("success-email");

const revealNodes = document.querySelectorAll(".reveal");

const navigationEntry = performance.getEntriesByType("navigation")[0];
const isReload =
  navigationEntry?.type === "reload" ||
  (performance.navigation && performance.navigation.type === 1);

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

if (isReload) {
  if (window.location.hash) {
    history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  }

  window.addEventListener(
    "load",
    () => {
      window.scrollTo(0, 0);
    },
    { once: true }
  );
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCount(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatCurrencyFromCents(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format((value || 0) / 100);
}

function getEstimate() {
  return calculateEstimate({
    tierKey: tierInput.value,
    households: Number(householdsInput.value),
    needsDesign: designSupportInput.value === "yes",
  });
}

function syncEstimate() {
  if (!tierInput) {
    return;
  }

  const estimate = getEstimate();

  householdReadout.textContent = `${formatCount(estimate.households)} households`;
  estimateTierName.textContent = estimate.tier.label;
  estimateSpace.textContent = estimate.tier.space;
  estimateReach.textContent = `${formatCount(estimate.households)} homes`;
  estimateFee.textContent = formatCurrency(estimate.agencyFee);
  estimatePostage.textContent = formatCurrency(estimate.postage);
  estimatePrint.textContent = formatCurrency(estimate.print);
  estimatePayment.textContent = formatCurrency(estimate.total);
  estimateTotal.textContent = formatCurrency(estimate.total);
  paymentTierName.textContent = estimate.tier.label;
  paymentTotal.textContent = formatCurrency(estimate.total);

  if (formTier) {
    formTier.value = tierInput.value;
  }
}

function buildCampaignMailto(data, estimate) {
  const subject = encodeURIComponent(
    `New postcard ad inquiry from ${data.get("business") || data.get("name")}`
  );
  const body = encodeURIComponent(
    [
      "New postcard campaign inquiry",
      "",
      `Contact: ${data.get("name")}`,
      `Business: ${data.get("business")}`,
      `Email: ${data.get("email")}`,
      `Phone: ${data.get("phone") || "Not provided"}`,
      `Tier: ${tierConfig[data.get("selectedTier")]?.label || estimate.tier.label}`,
      `Target area: ${data.get("targetArea") || "Not provided"}`,
      `Estimated total: ${formatCurrency(estimate.total)}`,
      `Payment required: ${formatCurrency(estimate.total)}`,
      `Artwork uploaded locally: ${(mediaUpload?.files?.length || 0) > 0 ? "Yes" : "No"}`,
      "",
      "Campaign details:",
      `${data.get("message")}`,
    ].join("\n")
  );

  return `mailto:${SALES_EMAIL}?subject=${subject}&body=${body}`;
}

if (estimatorForm) {
  estimatorForm.addEventListener("input", syncEstimate);
  syncEstimate();
}

if (formTier && tierInput) {
  formTier.addEventListener("change", () => {
    tierInput.value = formTier.value;
    syncEstimate();
  });
}

if (campaignForm && campaignNote) {
  campaignForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(campaignForm);
    const estimate = getEstimate();

    campaignNote.textContent =
      "Opening an email draft with the inquiry details and current campaign estimate.";
    window.location.href = buildCampaignMailto(data, estimate);
  });
}

if (paymentForm && paymentNote) {
  paymentForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = new FormData(paymentForm);
    const estimate = getEstimate();
    const submitButtonLabel = paymentSubmit?.textContent;

    if (paymentSubmit) {
      paymentSubmit.disabled = true;
      paymentSubmit.textContent = "Opening Stripe Checkout...";
    }

    paymentNote.textContent = "Preparing secure Stripe checkout...";

    try {
      const response = await fetch("/.netlify/functions/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payerName: data.get("payerName"),
          payerEmail: data.get("payerEmail"),
          payerBusiness: data.get("payerBusiness"),
          paymentNotes: data.get("paymentNotes"),
          tierKey: tierInput.value,
          households: Number(householdsInput.value),
          designSupport: designSupportInput.value,
        }),
      });

      const payload = await response.json();

      if (!response.ok || !payload.url) {
        throw new Error(payload.error || "Unable to open Stripe Checkout.");
      }

      window.location.href = payload.url;
    } catch (error) {
      paymentNote.textContent =
        error.message || "Stripe checkout could not be started. Please try again.";

      if (paymentSubmit) {
        paymentSubmit.disabled = false;
        paymentSubmit.textContent = submitButtonLabel || "Continue to Secure Payment";
      }
    }
  });
}

const paymentStatus = new URLSearchParams(window.location.search).get("payment");
const sessionId = new URLSearchParams(window.location.search).get("session_id");
const previewSuccess = new URLSearchParams(window.location.search).get("preview_success");

function closeSuccessModal() {
  if (!successModal) {
    return;
  }

  successModal.classList.remove("is-open");
  successModal.setAttribute("aria-hidden", "true");
}

function openSuccessModal() {
  if (!successModal) {
    return;
  }

  successModal.classList.add("is-open");
  successModal.setAttribute("aria-hidden", "false");
}

if (paymentStatus === "success" && paymentNote) {
  paymentNote.textContent =
    "Payment completed successfully. Stripe redirected you back to the site.";
} else if (paymentStatus === "cancelled" && paymentNote) {
  paymentNote.textContent =
    "Stripe checkout was cancelled. You can update the details and try again.";
}

if (successClose) {
  successClose.addEventListener("click", closeSuccessModal);
}

if (successModal) {
  successModal.addEventListener("click", (event) => {
    if (event.target === successModal) {
      closeSuccessModal();
    }
  });
}

function populateSuccessModal(payload) {
  successCopy.textContent =
    payload.paymentStatus === "paid"
      ? "Your payment was confirmed. A receipt should be on the way to your email."
      : "Your checkout was completed and the order details are below.";
  successBusiness.textContent = payload.businessName;
  successTier.textContent = payload.tierLabel;
  successHouseholds.textContent = `${formatCount(Number(payload.households))} households`;
  successAmount.textContent =
    typeof payload.amountPaid === "number"
      ? formatCurrencyFromCents(payload.amountPaid)
      : payload.amountPaid;
  successInvoiceType.textContent = payload.invoiceType;
  successEmail.textContent = payload.customerEmail;
  openSuccessModal();
}

if (previewSuccess === "1" && successModal) {
  populateSuccessModal({
    paymentStatus: "paid",
    businessName: "Corner Cafe",
    tierLabel: "Neighborhood Feature",
    households: 5000,
    amountPaid: 92125,
    invoiceType: "Campaign payment",
    customerEmail: "Kingsley@mailboxmerge.com",
  });
}

if (paymentStatus === "success" && sessionId && successModal) {
  successCopy.textContent = "Loading your payment details...";
  openSuccessModal();

  fetch(`/.netlify/functions/get-checkout-session?session_id=${encodeURIComponent(sessionId)}`)
    .then(async (response) => {
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to load order details.");
      }

      populateSuccessModal(payload);
    })
    .catch((error) => {
      successCopy.textContent =
        error.message || "Your payment went through, but the order details could not be loaded.";
    });

  const cleanUrl = new URL(window.location.href);
  cleanUrl.searchParams.delete("payment");
  cleanUrl.searchParams.delete("session_id");
  window.history.replaceState({}, "", cleanUrl.toString());
}

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  revealNodes.forEach((node) => observer.observe(node));
} else {
  revealNodes.forEach((node) => node.classList.add("is-visible"));
}
