import StartEnd from "../utils/StartEnd"

export default function RouteCard({route, onOpen, onDelete, onExport}) {
    return (
        <div className="route-card mb-3">
            <h4>{StartEnd(route).start + ' - ' + StartEnd(route).end}</h4>
            <hr></hr>
            <div className="d-flex justify-content-between align-items-center">
                <button onClick={onOpen} className="button">Open</button>
                <button onClick={() => onExport(route.stops)} className="button-secondary">Export</button>
                <button onClick={() => onDelete(route.createdAt)} className="button-warning">Delete</button>
            </div>
        </div>
    )
}