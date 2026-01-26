// pages/bridge.js
import { useEffect } from 'react';

export default function BridgePage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const locationId = params.get("location_id");
    const slug = (params.get("landing_page") || "").toLowerCase().trim();

    if (!slug || !locationId) {
      return;
    }

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

    setTimeout(() => {
      window.location.href = url;
    }, 1000);
  }, []);

  return (
    <div style={{
      height: '100vh',
      backgroundColor: '#440099',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      fontFamily: 'Helvetica, sans-serif',
      fontSize: '2.0rem',
      textAlign: 'center',
      padding: '0 20px'
    }}>
      <p>👟 💪Flexing our muscles.... Hang tight!</p>
    </div>
  );
}


