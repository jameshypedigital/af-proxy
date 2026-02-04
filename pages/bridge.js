import { useEffect, useState } from 'react';
import Head from 'next/head';

export default function BridgePage() {
  const [destinationUrl, setDestinationUrl] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const locationId = params.get("location_id");
    const slug = (params.get("landing_page") || "").toLowerCase().trim();

    if (!slug || !locationId) return;

    let url = "https://www.anytimefitness.com";

    if (slug === "online-signup") {
      url = `https://join.anytimefitness.com/${locationId}/plans`;
    } else if (slug === "no-offer") {
      url = `https://www.anytimefitness.com/membership-inquiry?location_id=${locationId}`;
    } else if (slug === "club-home") {
      url = `https://www.anytimefitness.com/locations/commerce-texas-${locationId}`;
    } else {
      url = `https://www.anytimefitness.com/offer/local/${slug}?club=${locationId}`;
    }

    setDestinationUrl(url);
  }, []);

  const handleClick = () => {
    if (destinationUrl) {
      window.location.href = destinationUrl;
    }
  };

  return (
    <>
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div style={{
        height: '100vh',
        backgroundColor: '#440099',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        fontFamily: 'Helvetica, sans-serif',
        fontSize: '2rem',
        textAlign: 'center',
        padding: '0 20px'
      }}>
        <p>
          👟Ready for REAL Results? 💪 {" "}
          <span
            onClick={handleClick}
            style={{
              textDecoration: 'underline',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Click HERE to Claim your Offer
          </span>
        </p>
      </div>
    </>
  );
}
