import { useState } from "react"

export default function StopCard({stop, onEdit, onDelete}) {
    const [editing, setEditing] = useState(false);
    const [newAddress, setNewAddress] = useState(stop.location);

    return (
        <div className="stop-card my-3">
            {
                editing ?
                <>
                    <input defaultValue={stop.location.postalCode} placeholder="Postal code" onChange={e => setNewAddress(prev => ({...prev, postalCode: e.target.value}))}/>
                    <input defaultValue={stop.location.city} placeholder="City" onChange={e => setNewAddress(prev => ({...prev, city: e.target.value}))}/>
                    <input defaultValue={stop.location.address} placeholder="Address" onChange={e => setNewAddress(prev => ({...prev, address: e.target.value}))}/>
                    <input defaultValue={stop.location.addressOther} placeholder="Other" onChange={e => setNewAddress(prev => ({...prev, addressOther: e.target.value}))}/>
                    <button onClick={() => {
                        const updatedAddress = {
                            ...newAddress,
                            fullAddress: `${newAddress.postalCode} ${newAddress.city}, ${newAddress.address} ${newAddress.addressOther}`
                        }
                        setNewAddress(updatedAddress)
                        onEdit(stop.id, updatedAddress);
                        setEditing(false);
                    }}>Save</button>
                </>
                :
                <a href={`https://maps.google.com/maps?q=${stop.location.fullAddress}`} target="_blank" rel="noopener noreferrer">{stop.location.fullAddress}</a>
            }
            {stop.location.coordinates ? null : <ion-icon name="warning"></ion-icon>}
            <button onClick={() => setEditing(!editing)}><ion-icon name="pencil"></ion-icon></button>
            <button className="button-warning" onClick={() => onDelete(stop.id)}><ion-icon name="trash"></ion-icon></button>
            <p>{stop.name} <a href={`tel:${stop.phone}`}>{stop.phone}</a> <a href={`mailto:${stop.email}`}>{stop.email}</a></p>
        </div>
    )
}