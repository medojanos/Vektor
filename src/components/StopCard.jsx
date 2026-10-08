import { useState } from "react"
import DisplayTime from "../utils/DisplayTime";

export default function StopCard({stop, onEdit, onDelete, onMoveUp, onMoveDown, onMakeFirst, onMakeLast, onToggle}) {
    const [editing, setEditing] = useState(false);
    const [newStop, setNewStop] = useState(stop);

    function handleSubmit(e) {
        e.preventDefault();
        onEdit(stop.id, {
            ...newStop, 
            location: {
                ...newStop.location, 
                fullAddress: `${newStop.location.postalCode} ${newStop.location.city}, ${newStop.location.address} ${newStop.location.addressOther}`
            }
        });
        setEditing(false);
    }

    return (
        <div className="stop-card my-3">
            {
                editing ?
                <form onSubmit={handleSubmit}>
                    <input
                        defaultValue={stop.location.postalCode}
                        placeholder="Postal code"
                        onChange={e =>
                            setNewStop(prev => ({
                                ...prev,
                                location: {
                                    ...prev.location,
                                    postalCode: e.target.value
                                }
                            }))
                        }/>
                    <input
                        required
                        defaultValue={stop.location.city}
                        placeholder="City"
                        onChange={e =>
                            setNewStop(prev => ({
                                ...prev,
                                location: {
                                    ...prev.location,
                                    city: e.target.value
                                }
                            }))
                        }/>
                    <input
                        defaultValue={stop.location.address}
                        placeholder="Address"
                        onChange={e =>
                            setNewStop(prev => ({
                                ...prev,
                                location: {
                                    ...prev.location,
                                    address: e.target.value
                                }
                            }))
                        }/>
                    <input
                        defaultValue={stop.location.addressOther}
                        placeholder="Other"
                        onChange={e =>
                            setNewStop(prev => ({
                                ...prev,
                                location: {
                                    ...prev.location,
                                    addressOther: e.target.value
                                }
                            }))
                        }/>
                    <button type="submit">Save</button>
                </form>
                :
                <>
                    <div className="d-flex justify-content-between">
                        <div>
                            <b>{stop.location.fullAddress}</b>
                            {!stop.active && <b className="text-secondary">Inactive</b>}
                            {!stop.location.coordinates && <b className="ms-1 text-warning">Missing coordinates</b>}
                        </div>
                        
                        <div className="d-flex">
                            <div className="me-3">
                                <a type="button" id={`menu-${stop.id}`} style={{color: "inherit"}} data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    <ion-icon name="ellipsis-horizontal"></ion-icon>
                                </a>
                                <div className="dropdown-menu box" aria-labelledby={`menu-${stop.id}`}>
                                    <a type="button" onClick={() => onMakeFirst(stop.id)} className="dropdown-item">Make this first</a>
                                    <a type="button" onClick={() => onMakeLast(stop.id)} className="dropdown-item">Make this last</a>
                                    {
                                        stop.active ?
                                        <a type="button" onClick={() => onToggle(stop.id)} className="dropdown-item">Deactivate</a>
                                        :
                                        <a type="button" onClick={() => onToggle(stop.id)} className="dropdown-item">Activate</a>
                                    }
                                </div>
                            </div>
                            <a type="button" data-bs-toggle="collapse" href={`#details-${stop.id}`} role="button" aria-expanded="false" aria-controls={`details-${stop.id}`}>
                                <ion-icon style={{fontSize: 25}} name="information-circle-outline"></ion-icon>
                            </a>
                        </div>
                        
                    </div>
                    <div className="d-flex justify-content-between">
                        <p>{stop.name}</p>
                        <span>
                            {Math.round(stop.routeInfo.distanceFromPrevious)} km - {DisplayTime(stop.routeInfo.durationFromPrevious)}
                        </span>
                    </div>
                    <div id={`details-${stop.id}`} className="collapse">
                        <hr/>
                        <p>Order Number: {stop.id}</p>
                        <p>Email: <a href={`mailto:${stop.email}`}>{stop.email}</a></p>
                        <p>Phone: {stop.phone}</p>
                        <p>Price: {stop.price} Ft</p>
                        <p>Delivery Price: {stop.deliveryPrice} Ft</p>
                    </div>
                </>
            }
            {
                stop.parcel &&
                <>
                    <hr/>
                    {
                        editing ?
                        <textarea 
                            className="box" 
                            style={{color: "white", width: "100%"}} 
                            defaultValue={stop.parcel}
                            onChange={e => setNewStop(prev => ({...prev, parcel: e.target.value}))}
                        />
                        :
                        <p className="box">{stop.parcel}</p> 
                    }
                </>
            }
            {
                stop.note ?
                <>
                    <hr/>
                    <p>{stop.note}</p>
                    <hr/>
                </>
                :
                <hr/>
            }
            <div className="d-flex mt-2 justify-content-between">
                <div>
                    <button onClick={() => setEditing(!editing)}><ion-icon name="pencil"></ion-icon></button>
                    <button className="button-warning" onClick={() => onDelete(stop.id)}><ion-icon name="trash"></ion-icon></button>
                </div>
                <div>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.location.fullAddress)}`}
                        target="_blank"
                        rel="noopener noreferrer">
                        <button>
                            <ion-icon name="navigate"></ion-icon>
                        </button>
                    </a>
                    
                    <a href={`tel:${stop.phone}`}>
                        <button>
                            <ion-icon name="call"></ion-icon>
                        </button>
                    </a>
                </div>
                <div>
                    <a type="button" onClick={() => onMoveUp(stop.id)}><ion-icon className="chevron" name="chevron-up-outline"></ion-icon></a>
                    <a type="button" onClick={() => onMoveDown(stop.id)}><ion-icon className="chevron" name="chevron-down-outline"></ion-icon></a>
                </div>
            </div>
        </div>
    )
}