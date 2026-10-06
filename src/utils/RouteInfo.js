export default async function routeInfo(stops) {
    try {
        const coordinates = stops
        .map(stop => {
            const { lat, lon } = stop.location.coordinates;
            return `${lon},${lat}`;
        })
        .join(";");

        const url =
        `https://router.project-osrm.org/route/v1/driving/${coordinates}` +
        `?overview=full&geometries=geojson&steps=true`;

        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        const trip = data.routes[0];

        const optimizedStops = stops
        .map((stop, index) => ({
            ...stop,
            routeInfo: {
                distanceFromPrevious: index === 0 ? 0 : trip.legs[index - 1].distance / 1000,
                durationFromPrevious: index === 0 ? 0 : trip.legs[index - 1].duration
            }
        }));

        return {
            stops: optimizedStops,
            distance: trip.distance,
            duration: trip.duration,
            geometry: trip.geometry.coordinates.map(cord => ([cord[1], cord[0]]))
        };

    } catch (error) {
        alert("Error getting route information");
        console.log(error.message)
        return null;
    }
}