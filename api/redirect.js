export default async function handler(req, res) {
  try {
    const { lpurl, offer, club, landing_page, location_id, ...utm } = req.query;

    // ✅ Google Ads mode – if lpurl is present, use it directly
    if (lpurl) {
      await fetch("https://dashtraq.app.n8n.cloud/webhook/redirect-track", {
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
      });

      return res.redirect(302, lpurl);
    }

    // ✅ Facebook/default mode
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

    // 🧠 Add support for the general club location page
    if (slug === "online-signup") {
      finalUrl = `https://join.anytimefitness.com/${clubId}/plans`;
    } else if (slug === "no-offer") {
      finalUrl = `https://www.anytimefitness.com/membership-inquiry?location_id=${clubId}`;
    } else if (slug === "club-home") {
      finalUrl = `https://www.anytimefitness.com/locations/commerce-texas-${clubId}`;
    } else {
      finalUrl = `https://www.anytimefitness.com/offer/local/${slug}?club=${clubId}`;
    }

    return res.redirect(302, finalUrl);

  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}

