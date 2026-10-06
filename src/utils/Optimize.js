import routeInfo from "./RouteInfo";

export default async function optimizeRoute(stops) {
    try {
        const coordinates = stops
        .map(stop => {
            const { lat, lon } = stop.location.coordinates;
            return `${lon},${lat}`;
        })
        .join(";");

        const url =
        `https://router.project-osrm.org/trip/v1/driving/${coordinates}` +
        `?source=first` +
        `&destination=last` +
        `&roundtrip=false` +
        `&overview=full` +
        `&geometries=geojson`;

        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        const optimizedStops = stops
        .map((stop, originalIndex) => ({
            stop,
            waypointIndex: data.waypoints[originalIndex].waypoint_index
        }))
        .sort((a, b) => a.waypointIndex - b.waypointIndex)
        .map(item => item.stop);

        return routeInfo(optimizedStops);

    } catch (error) {
        alert("Error optimizing route: " + error.message);
        return null;
    }
}