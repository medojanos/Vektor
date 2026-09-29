export default async function getCoordinates(address) {
  const apiUrl = "https://nominatim.openstreetmap.org/search?q=" + encodeURIComponent(address) + "&format=json&limit=1";
  const response = await fetch(apiUrl);
  if (!response.ok) return null;
  const data = await response.json();
  return data.length > 0 ? { lat: data[0].lat, lon: data[0].lon } : null;
}