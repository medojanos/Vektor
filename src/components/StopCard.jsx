export default function StopCard({stop}) {
    return (
        <div className="stop-card my-3">
            <b><a href={`https://maps.google.com/maps?q=${stop.location.fullAddress}`} target="_blank" rel="noopener noreferrer">{stop.location.fullAddress}</a></b>
            <p>{stop.name} <a href={`tel:${stop.phone}`}>{stop.phone}</a> <a href={`mailto:${stop.email}`}>{stop.email}</a></p>
        </div>
    )
}