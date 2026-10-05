import { useState } from "react"

export default function StopCard({stop, onEdit, onDelete, onMoveUp, onMoveDown}) {
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
                        <a type="button" data-bs-toggle="collapse" href="#details" role="button" aria-expanded="false" aria-controls="details">
                            <ion-icon style={{fontSize: 25}} name="information-circle-outline"></ion-icon>
                        </a>
                    </div>
                    <div id="details" className="collapse">
                        <hr/>
                        <p>Order number: {stop.id}</p>
                        <p>Email: {stop.email}</p>
                        <p>Phone: {stop.phone}</p>
                    </div>
                </>
            }
            <p>{stop.name}</p>
            <hr/>
            {stop.parcel ? <p className="box">{stop.parcel}</p> : null}
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