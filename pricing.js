(function (global, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    global.MailboxMergePricing = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const USPS_POSTAGE_RATE = 0.247;
  const PRINT_AND_PREP_RATE = 0.094;

  const tierConfig = {
    mini: {
      label: "Mini Block",
      space: "1/8 card",
      agencyFee: 365,
      share: 0.125,
    },
    quarter: {
      label: "Neighborhood Feature",
      space: "1/4 card",
      agencyFee: 495,
      share: 0.25,
    },
    half: {
      label: "Anchor Sponsor",
      space: "1/2 card",
      agencyFee: 745,
      share: 0.5,
    },
    full: {
      label: "Takeover Back",
      space: "Full back",
      agencyFee: 1195,
      share: 1,
    },
  };

  function calculateEstimate(input) {
    const tier = tierConfig[input.tierKey];

    if (!tier) {
      throw new Error("Invalid tier selected.");
    }

    const households = Number(input.households);
    const needsDesign = Boolean(input.needsDesign);
    const designFee = needsDesign ? 85 : 0;
    const agencyFee = tier.agencyFee + designFee;
    const postage = households * USPS_POSTAGE_RATE * tier.share;
    const print = households * PRINT_AND_PREP_RATE * tier.share;
    const total = agencyFee + postage + print;

    return {
      tier,
      households,
      needsDesign,
      agencyFee,
      postage,
      print,
      total,
    };
  }

  return {
    USPS_POSTAGE_RATE,
    PRINT_AND_PREP_RATE,
    tierConfig,
    calculateEstimate,
  };
});
