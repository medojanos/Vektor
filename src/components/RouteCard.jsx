import {Link} from "react-router-dom"

export default function RouteCard({route, onDelete}) {
    return (
        <div className="route-card my-3">
            <h3>{route.startingLocation?.city || "No starting location"} - {route.endLocation?.city || "No destination"}</h3>
            <Link to="/app"><button onClick={() => localStorage.setItem("selected", JSON.stringify(route))} className="button">Open</button></Link>
            <button  onClick={() => onDelete(route.createdAt)} className="button button-warning">Delete</button>
            <span>{route.createdAt}</span>
        </div>
    )
}