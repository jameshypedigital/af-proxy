export default function BridgePage() {
  return null;
}

export async function getServerSideProps(context) {
  try {
    const {
      lpurl,
      landing_page,
      location_id,
      offer,
      club,

      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      utm_adgroup,
      utm_adid,

      gclid,

      ...otherParams
    } = context.query;

    const cleanValue = (value) => {
      if (Array.isArray(value)) {
        return value[0] || null;
      }

      if (
        value === undefined ||
        value === null ||
        value === ""
      ) {
        return null;
      }

      return String(value);
    };

    const finalLpurl = cleanValue(lpurl);
    const finalLandingPage = cleanValue(landing_page);
    const finalLocationId = cleanValue(location_id);
    const finalOffer = cleanValue(offer);
    const finalClub = cleanValue(club);

    // =====================================================
    // GOOGLE MODE
    // =====================================================

    if (finalLpurl) {
      let destinationUrl;

      try {
        destinationUrl = new URL(finalLpurl);

        if (
          destinationUrl.protocol !== "https:" &&
          destinationUrl.protocol !== "http:"
        ) {
          throw new Error("Invalid lpurl protocol");
        }
      } catch (err) {
        console.error("Invalid lpurl:", finalLpurl);

        return {
          notFound: true
        };
      }

      const trackingPayload = {
        source: "google",

        landing_page: finalLandingPage,
        location_id: finalLocationId,

        offer: finalOffer,
        club: finalClub,

        lpurl: finalLpurl,

        utm_source: cleanValue(utm_source),
        utm_medium: cleanValue(utm_medium),
        utm_campaign: cleanValue(utm_campaign),
        utm_content: cleanValue(utm_content),
        utm_term: cleanValue(utm_term),
        utm_adgroup: cleanValue(utm_adgroup),
        utm_adid: cleanValue(utm_adid),

        gclid: cleanValue(gclid),

        other_params: otherParams,

        timestamp: Date.now()
      };

      try {
        const response = await fetch(
          "https://dashtraq.app.n8n.cloud/webhook/redirect-track",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(trackingPayload)
          }
        );

        if (!response.ok) {
          console.error(
            "n8n tracking returned status:",
            response.status
          );
        }
      } catch (trackingError) {
        console.error(
          "Google tracking failed:",
          trackingError
        );
      }

      return {
        redirect: {
          destination: finalLpurl,
          permanent: false
        }
      };
    }

    // =====================================================
    // FALLBACK MODE
    // Allows bridge to still work without lpurl
    // =====================================================

    const clubId = finalClub || finalLocationId;

    if (!finalLandingPage || !clubId) {
      return {
        notFound: true
      };
    }

    const slug = finalLandingPage
      .trim()
      .toLowerCase();

    let finalUrl;

    if (slug.startsWith("blog/")) {
      finalUrl =
        `https://www.anytimefitness.com/${slug}`;

    } else if (slug === "online-signup") {
      finalUrl =
        `https://join.anytimefitness.com/${clubId}/plans`;

    } else if (slug === "no-offer") {
      finalUrl =
        `https://www.anytimefitness.com/membership-inquiry?location_id=${clubId}`;

    } else if (slug === "club-home") {
      finalUrl =
        `https://www.anytimefitness.com/locations/commerce-texas-${clubId}`;

    } else {
      finalUrl =
        `https://www.anytimefitness.com/offer/local/${slug}?club=${clubId}`;
    }

    try {
      await fetch(
        "https://dashtraq.app.n8n.cloud/webhook/redirect-track",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            source: "bridge-fallback",

            landing_page: slug,
            location_id: clubId,

            offer: finalOffer,
            club: clubId,

            utm_source: cleanValue(utm_source),
            utm_medium: cleanValue(utm_medium),
            utm_campaign: cleanValue(utm_campaign),
            utm_content: cleanValue(utm_content),
            utm_term: cleanValue(utm_term),
            utm_adgroup: cleanValue(utm_adgroup),
            utm_adid: cleanValue(utm_adid),

            gclid: cleanValue(gclid),

            other_params: otherParams,

            timestamp: Date.now()
          })
        }
      );
    } catch (trackingError) {
      console.error(
        "Fallback bridge tracking failed:",
        trackingError
      );
    }

    return {
      redirect: {
        destination: finalUrl,
        permanent: false
      }
    };

  } catch (err) {
    console.error("Bridge fatal error:", err);

    return {
      notFound: true
    };
  }
}
