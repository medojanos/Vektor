import {Link} from "react-router-dom"

export default function RouteCard({route, onDelete, onExport}) {
    return (
        <div className="route-card mb-3">
            <h3>{route.startingLocation?.city || "No starting location"} - {route.endLocation?.city || "No destination"}</h3>
            <Link to="/app"><button onClick={() => localStorage.setItem("selected", JSON.stringify(route))} className="button">Open</button></Link>
            <button onClick={() => onExport(route.createdAt)}>Export</button>
            <button  onClick={() => onDelete(route.createdAt)} className="button button-warning">Delete</button>
        </div>
    )
}