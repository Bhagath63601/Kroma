import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { street, city, state, zip } = await req.json();

    if (!city || !state || !zip) {
      return NextResponse.json(
        { success: false, error: 'City, State, and Zip code are required for verification' },
        { status: 400 }
      );
    }

    const userAgent = 'KromaAddressVerifier/1.0 (contact@kroma.com)';

    // Step 1: Attempt exact address search
    // We search for: street, city, state zip, India
    const fullQuery = `${street ? street + ', ' : ''}${city}, ${state} ${zip}, India`;
    const fullSearchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      fullQuery
    )}&addressdetails=1&limit=1`;

    let response = await fetch(fullSearchUrl, {
      headers: { 'User-Agent': userAgent },
    });

    if (!response.ok) {
      throw new Error(`Nominatim API returned HTTP ${response.status}`);
    }

    let data = await response.json();

    // If exact search succeeded and returned a match
    if (data && data.length > 0) {
      const match = data[0];
      return NextResponse.json({
        success: true,
        status: 'exact',
        lat: match.lat,
        lon: match.lon,
        displayName: match.display_name,
        addressDetails: match.address,
      });
    }

    // Step 2: Fallback to Pincode & City/State search (Area level verification)
    const areaQuery = `${city}, ${state} ${zip}, India`;
    const areaSearchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      areaQuery
    )}&addressdetails=1&limit=1`;

    response = await fetch(areaSearchUrl, {
      headers: { 'User-Agent': userAgent },
    });

    if (response.ok) {
      data = await response.json();
      if (data && data.length > 0) {
        const match = data[0];
        return NextResponse.json({
          success: true,
          status: 'partial',
          lat: match.lat,
          lon: match.lon,
          displayName: match.display_name,
          addressDetails: match.address,
        });
      }
    }

    // Step 3: Deep fallback to Pincode only search
    const zipQuery = `${zip}, India`;
    const zipSearchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      zipQuery
    )}&addressdetails=1&limit=1`;

    response = await fetch(zipSearchUrl, {
      headers: { 'User-Agent': userAgent },
    });

    if (response.ok) {
      data = await response.json();
      if (data && data.length > 0) {
        const match = data[0];
        return NextResponse.json({
          success: true,
          status: 'partial',
          lat: match.lat,
          lon: match.lon,
          displayName: match.display_name,
          addressDetails: match.address,
        });
      }
    }

    // If all fail
    return NextResponse.json({
      success: true,
      status: 'unverified',
    });
  } catch (error: any) {
    console.error('Address verification error:', error);
    // Return unverified instead of crashing the checkout if the Nominatim service is down
    return NextResponse.json({
      success: true,
      status: 'unverified',
      error: error.message || 'Geocoding service unavailable',
    });
  }
}
