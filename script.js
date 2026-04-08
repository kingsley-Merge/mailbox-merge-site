const SALES_EMAIL = "Kingsley@mailboxmerge.com";
const { tierConfig, calculateEstimate } = window.MailboxMergePricing;

const estimatorForm = document.getElementById("estimator-form");
const tierInput = document.getElementById("ad-tier");
const householdsInput = document.getElementById("household-count");
const householdReadout = document.getElementById("household-readout");
const designSupportInput = document.getElementById("design-support");
const cadenceInput = document.getElementById("campaign-cadence");

const estimateTierName = document.getElementById("estimate-tier-name");
const estimateSpace = document.getElementById("estimate-space");
const estimateReach = document.getElementById("estimate-reach");
const estimateFee = document.getElementById("estimate-fee");
const estimatePostage = document.getElementById("estimate-postage");
const estimatePrint = document.getElementById("estimate-print");
const estimateDeposit = document.getElementById("estimate-deposit");
const estimateTotal = document.getElementById("estimate-total");

const formTier = document.getElementById("form-tier");
const paymentTierName = document.getElementById("payment-tier-name");
const paymentTotal = document.getElementById("payment-total");
const paymentDeposit = document.getElementById("payment-deposit");

const campaignForm = document.getElementById("campaign-form");
const campaignNote = document.getElementById("campaign-note");
const mediaUpload = document.getElementById("media-upload");
const uploadPreview = document.getElementById("upload-preview");

const paymentForm = document.getElementById("payment-form");
const paymentNote = document.getElementById("payment-note");
const invoiceType = document.getElementById("invoice-type");
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

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "Unknown size";
  }

  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  const digits = unitIndex === 0 ? 0 : 1;
  return `${size.toFixed(digits)} ${units[unitIndex]}`;
}

function getEstimate() {
  return calculateEstimate({
    tierKey: tierInput.value,
    households: Number(householdsInput.value),
    needsDesign: designSupportInput.value === "yes",
    cadence: cadenceInput.value,
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
  estimateDeposit.textContent = formatCurrency(estimate.deposit);
  estimateTotal.textContent = formatCurrency(estimate.total);
  paymentTierName.textContent = estimate.tier.label;
  paymentTotal.textContent = formatCurrency(estimate.total);
  paymentDeposit.textContent = formatCurrency(estimate.deposit);

  if (formTier) {
    formTier.value = tierInput.value;
  }
}

function createUploadCard(file) {
  const item = document.createElement("article");
  item.className = "upload-item";

  const isImage = file.type.startsWith("image/");

  if (isImage) {
    const thumb = document.createElement("div");
    thumb.className = "upload-thumb";

    const image = document.createElement("img");
    image.alt = file.name;

    const reader = new FileReader();
    reader.onload = (event) => {
      image.src = event.target?.result || "";
    };
    reader.readAsDataURL(file);

    thumb.appendChild(image);
    item.appendChild(thumb);
  } else {
    const fileType = document.createElement("div");
    fileType.className = "upload-filetype";
    fileType.textContent = file.name.split(".").pop()?.toUpperCase() || "FILE";
    item.appendChild(fileType);
  }

  const meta = document.createElement("div");
  meta.className = "upload-meta";

  const title = document.createElement("strong");
  title.textContent = file.name;

  const size = document.createElement("span");
  size.textContent = formatFileSize(file.size);

  meta.append(title, size);
  item.appendChild(meta);

  return item;
}

function renderUploads(files) {
  if (!uploadPreview) {
    return;
  }

  uploadPreview.innerHTML = "";

  if (!files.length) {
    const placeholder = document.createElement("div");
    placeholder.className = "upload-placeholder";
    placeholder.textContent =
      "Add logos, artwork, or PDFs and they will appear here before submission.";
    uploadPreview.appendChild(placeholder);
    return;
  }

  files.forEach((file) => {
    uploadPreview.appendChild(createUploadCard(file));
  });
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
      `Booking deposit: ${formatCurrency(estimate.deposit)}`,
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

if (mediaUpload) {
  mediaUpload.addEventListener("change", () => {
    renderUploads(Array.from(mediaUpload.files || []));
  });
  renderUploads([]);
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
          invoiceType: data.get("invoiceType"),
          tierKey: tierInput.value,
          households: Number(householdsInput.value),
          cadence: cadenceInput.value,
          designSupport: designSupportInput.value,
          estimateTotal: estimate.total,
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

if (invoiceType) {
  invoiceType.addEventListener("change", () => {
    const estimate = getEstimate();
    const amount =
      invoiceType.value === "deposit" ? estimate.deposit : estimate.total;
    paymentNote.textContent = `Current Stripe checkout amount: ${formatCurrency(amount)}.`;
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
    amountPaid: 36900,
    invoiceType: "Booking deposit",
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
