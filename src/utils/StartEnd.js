export default function StartEnd(route) {
    const activeStops = route.stops.filter(stop => stop.active);
    return {
        start: activeStops[0]?.location.city ?? "No starting location",
        end: activeStops[activeStops.length-1]?.location.city ?? "No destination"
    }
}