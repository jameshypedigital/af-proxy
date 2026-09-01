export default function BridgePage() {
  // This should never actually render because getServerSideProps redirects first.
  return null;
}

export async function getServerSideProps(context) {
  try {
    const {
      lpurl,
      offer,
      club,
      landing_page,
      location_id,
      ...utm
    } = context.query;

    const getValue = (value) => {
      if (Array.isArray(value)) return value[0];
      return value || null;
    };

    const finalLpurl = getValue(lpurl);
    const finalOffer = getValue(offer);
    const finalClub = getValue(club);
    const finalLandingPage = getValue(landing_page);
    const finalLocationId = getValue(location_id);

    // =====================================================
    // GOOGLE ADS MODE
    // lpurl is the authoritative destination
    // =====================================================

    if (finalLpurl) {
      let destinationUrl;

      try {
        destinationUrl = new URL(finalLpurl);

        // Only allow normal web URLs
        if (
          destinationUrl.protocol !== "https:" &&
          destinationUrl.protocol !== "http:"
        ) {
          throw new Error("Invalid lpurl protocol");
        }
      } catch (err) {
        return {
          notFound: true
        };
      }

      // Track the click, but don't prevent the redirect if tracking fails
      try {
        await fetch(
          "https://dashtraq.app.n8n.cloud/webhook/redirect-track",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              lpurl: finalLpurl,
              offer: finalOffer,
              club: finalClub,
              location_id: finalLocationId,
              utm,
              source: "google",
              timestamp: Date.now()
            })
          }
        );
      } catch (trackingError) {
        console.error(
          "Google redirect tracking failed:",
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
    // FACEBOOK / DEFAULT MODE
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

    // Track the click, but don't prevent redirect if tracking fails
    try {
      await fetch(
        "https://dashtraq.app.n8n.cloud/webhook/redirect-track",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            offer: finalOffer,
            club: clubId,
            slug,
            utm,
            source: "facebook-or-other",
            timestamp: Date.now()
          })
        }
      );
    } catch (trackingError) {
      console.error(
        "Facebook/default redirect tracking failed:",
        trackingError
      );
    }

    let finalUrl;

    // BLOG ARTICLES
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

    // DEFAULT LOCAL OFFER
    } else {
      finalUrl =
        `https://www.anytimefitness.com/offer/local/${slug}?club=${clubId}`;
    }

    return {
      redirect: {
        destination: finalUrl,
        permanent: false
      }
    };

  } catch (err) {
    console.error("Bridge error:", err);

    return {
      notFound: true
    };
  }
}
