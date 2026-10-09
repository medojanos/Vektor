import {Link} from "react-router-dom"

export default function RouteCard({route, onDelete, onExport}) {
    return (
        <div className="route-card mb-3">
            <h4>{route.stops[0]?.location.city || "No starting location"} - {route.stops.filter(stop => stop.active)[route.stops.filter(stop => stop.active).length-1]?.location.city || "No destination"}</h4>
            <hr></hr>
            <div className="d-flex justify-content-between align-items-center">
                <Link to="/app"><button onClick={() => localStorage.setItem("selected", JSON.stringify(route))} className="button">Open</button></Link>
                <button onClick={() => onExport(route.stops)} className="button-secondary">Export</button>
                <button onClick={() => onDelete(route.createdAt)} className="button-warning">Delete</button>
            </div>
        </div>
    )
}