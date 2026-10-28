
export default async function handler(req, res) {
  try {
    const { lpurl, offer, club, landing_page, location_id, ...utm } = req.query;

    // ✅ GOOGLE ADS MODE
    // Send Google tracking to the separate Google n8n workflow.
    
if (lpurl) {
  console.log("GOOGLE MODE TRIGGERED", {
    location_id,
    lpurl,
    utm_campaign: utm.utm_campaign
  });

  const webhookResponse = await fetch(
    "https://dashtraq.app.n8n.cloud/webhook/redirect-google",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lpurl,
        offer,
        club,
        location_id,
        utm,
        source: "google",
        timestamp: Date.now()
      })
    }
  );

  const responseText = await webhookResponse.text();

  console.log("GOOGLE WEBHOOK STATUS:", webhookResponse.status);
  console.log("GOOGLE WEBHOOK RESPONSE:", responseText);

  return res.redirect(302, lpurl);
}


    // ✅ FACEBOOK / META MODE
    // Keep the existing Meta webhook and redirect behavior.
    const clubId = club || location_id;

    if (!landing_page || !clubId) {
      return res.status(400).json({
        ok: false,
        error: "Missing required params: landing_page or club"
      });
    }

    const slug = landing_page.trim().toLowerCase();

    await fetch("https://dashtraq.app.n8n.cloud/webhook/redirect-track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        offer,
        club: clubId,
        slug,
        utm,
        source: "facebook-or-other",
        timestamp: Date.now()
      })
    });

    let finalUrl = null;

    // 📰 BLOG ARTICLES — MUST COME FIRST
    if (slug.startsWith("blog/")) {
      finalUrl = `https://www.anytimefitness.com/${slug}`;

    // 🧠 General club pages
    } else if (slug === "online-signup") {
      finalUrl = `https://join.anytimefitness.com/${clubId}/plans`;

    } else if (slug === "no-offer") {
      finalUrl = `https://www.anytimefitness.com/membership-inquiry?location_id=${clubId}`;

    } else if (slug === "club-home") {
      finalUrl = `https://www.anytimefitness.com/locations/${clubId}`;

      } else if (slug === "founders-rate") {
      finalUrl = `https://www.anytimefitness.com/offer/local/founders-rate/?club=${clubId}`;

    // 🎯 DEFAULT LOCAL OFFER — LAST
    } else {
      finalUrl = `https://www.anytimefitness.com/offer/local/${slug}?club=${clubId}`;
    }

    return res.redirect(302, finalUrl);

  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err.message
    });
  }
}
