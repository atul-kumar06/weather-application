export async function getGeoCoordinates(location) {
  const query = location;
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=en&format=json`;

    const response = await fetch(url);

    // Catch HTTP-level issues (4xx, 5xx)
    if (!response.ok) {
      throw new Error(
        `Server returned ${response.status}: Failed to fetch location.`,
      );
    }

    const data = await response.json();
    // console.log("Geocoding API response:", data); // Debugging log

    // Catch empty search results
    if (!data.results || data.results.length === 0) {
      throw new Error(`No locations found matching "${query}".`);
    }

    const { country, name, longitude, latitude } = data.results[0];
    return { country, name, longitude, latitude };
  } catch (error) {
    console.log(error.stack);
    throw error;
  }
}
