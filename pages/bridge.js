export default async function handler(req, res) {
  try {
    const {
      lpurl,
      offer,
      club,
      landing_page,
      location_id,
      ...utm
    } = req.query;

    // ===================================================
    // GOOGLE MODE
    //
    // This also supports Google if you ever use
    // /api/redirect instead of /bridge.
    // ===================================================
    if (lpurl) {

      try {
        const destination = new URL(lpurl);

        if (
          destination.protocol !== "https:" &&
          destination.protocol !== "http:"
        ) {
          return res.status(400).json({
            ok: false,
            error: "Invalid lpurl"
          });
        }
      } catch (err) {
        return res.status(400).json({
          ok: false,
          error: "Invalid lpurl"
        });
      }

      // Tracking should never prevent redirect
      try {
        await fetch(
          "https://dashtraq.app.n8n.cloud/webhook/redirect-track",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              landing_page,
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
      } catch (trackingError) {
        console.error(
          "Google tracking failed:",
          trackingError
        );
      }

      return res.redirect(302, lpurl);
    }

    // ===================================================
    // META / FACEBOOK / DEFAULT MODE
    // ===================================================

    const clubId = club || location_id;

    if (!landing_page || !clubId) {
      return res.status(400).json({
        ok: false,
        error:
          "Missing required params: landing_page or club"
      });
    }

    const slug = landing_page
      .trim()
      .toLowerCase();

    // ---------------------------------------------------
    // SEND CLICK TO N8N
    // ---------------------------------------------------
    try {
      await fetch(
        "https://dashtraq.app.n8n.cloud/webhook/redirect-track",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            offer,
            club: clubId,
            location_id: clubId,
            landing_page: slug,
            slug,
            utm,
            source: "facebook-or-other",
            timestamp: Date.now()
          })
        }
      );
    } catch (trackingError) {
      console.error(
        "Meta/default tracking failed:",
        trackingError
      );
    }

    // ---------------------------------------------------
    // BUILD META DESTINATION
    // ---------------------------------------------------

    let finalUrl = null;

    // BLOG
    if (slug.startsWith("blog/")) {

      finalUrl =
        `https://www.anytimefitness.com/${slug}`;

    // ONLINE SIGNUP
    } else if (slug === "online-signup") {

      finalUrl =
        `https://join.anytimefitness.com/${clubId}/plans`;

    // NO OFFER
    } else if (slug === "no-offer") {

      finalUrl =
        `https://www.anytimefitness.com/membership-inquiry?location_id=${clubId}`;

    // CLUB HOME
    } else if (slug === "club-home") {

      finalUrl =
        `https://www.anytimefitness.com/locations/commerce-texas-${clubId}`;

    // LOCAL OFFER
    } else {

      finalUrl =
        `https://www.anytimefitness.com/offer/local/${slug}?club=${clubId}`;
    }

    return res.redirect(302, finalUrl);

  } catch (err) {

    console.error("Redirect error:", err);

    return res.status(500).json({
      ok: false,
      error: err.message
    });
  }
}
