import { useState } from "react"
import DisplayTime from "../utils/DisplayTime";

export default function StopCard({stop, onEdit, onDelete, onMoveUp, onMoveDown, onMakeFirst, onMakeLast}) {
    const [editing, setEditing] = useState(false);
    const [newAddress, setNewAddress] = useState(stop.location);

    function handleSubmit(e) {
        e.preventDefault();
        const updatedAddress = {
            ...newAddress,
            fullAddress: `${newAddress.postalCode} ${newAddress.city}, ${newAddress.address} ${newAddress.addressOther}`
        }
        setNewAddress(updatedAddress)
        onEdit(stop.id, updatedAddress);
        setEditing(false);
    }

    return (
        <div className="stop-card my-3">
            {
                editing ?
                <form onSubmit={handleSubmit}>
                    <input defaultValue={stop.location.postalCode} placeholder="Postal code" onChange={e => setNewAddress(prev => ({...prev, postalCode: e.target.value}))}/>
                    <input required defaultValue={stop.location.city} placeholder="City" onChange={e => setNewAddress(prev => ({...prev, city: e.target.value}))}/>
                    <input defaultValue={stop.location.address} placeholder="Address" onChange={e => setNewAddress(prev => ({...prev, address: e.target.value}))}/>
                    <input defaultValue={stop.location.addressOther} placeholder="Other" onChange={e => setNewAddress(prev => ({...prev, addressOther: e.target.value}))}/>
                    <button type="submit">Save</button>
                </form>
                :
                <>
                    <div className="d-flex justify-content-between">
                        <div>
                            <b>{stop.location.fullAddress}</b>
                            {stop.location.coordinates ? null : <b className="ms-3 text-warning">Missing coordinates <ion-icon name="warning"></ion-icon></b>}
                        </div>
                        
                        <div className="d-flex">
                            <div className="me-3">
                                <a type="button" id={`menu-${stop.id}`} style={{color: "inherit"}} data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    <ion-icon name="ellipsis-horizontal"></ion-icon>
                                </a>
                                <div className="dropdown-menu box" aria-labelledby={`menu-${stop.id}`}>
                                    <a type="button" onClick={() => onMakeFirst(stop.id)} className="dropdown-item">Make this first</a>
                                    <a type="button" onClick={() => onMakeLast(stop.id)} className="dropdown-item">Make this last</a>
                                </div>
                            </div>
                            <a type="button" data-bs-toggle="collapse" href={`#details-${stop.id}`} role="button" aria-expanded="false" aria-controls={`details-${stop.id}`}>
                                <ion-icon style={{fontSize: 25}} name="information-circle-outline"></ion-icon>
                            </a>
                        </div>
                        
                    </div>
                    <div className="d-flex justify-content-between">
                        <p>{stop.name}</p>
                        <span>{Math.round(stop.routeInfo.distanceFromPrevious)} km - {DisplayTime(stop.routeInfo.durationFromPrevious)}</span>
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
                stop.parcel ? 
                <>
                    <hr/>
                    <p className="box">{stop.parcel}</p> 
                </>
                : 
                null}
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