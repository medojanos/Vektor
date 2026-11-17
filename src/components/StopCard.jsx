import { useState, memo } from "react"
import DisplayTime from "../utils/DisplayTime";

function StopCard({stop, onEdit, onDelete, onMoveUp, onMoveDown, onMakeFirst, onMakeLast, onToggle, selected, onSelect}) {
    const [editing, setEditing] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [newStop, setNewStop] = useState(stop);

    function handleSubmit(e) {
        if (e) e.preventDefault();
        onEdit(stop.id, {
            ...newStop, 
            location: {
                ...newStop.location, 
                fullAddress: `${newStop.location?.postalCode || ""} ${newStop.location?.city || ""} ${newStop.location?.address || ""} ${newStop.location?.addressOther || ""}`.trim()
            }
        });
        setEditing(false);
    }

    return (
        <div className="stop-card my-3">
            <form onSubmit={handleSubmit}>
                <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1 me-2">
                            {
                                editing ?
                                <div className="d-flex flex-wrap align-items-center">
                                <input
                                    style={{maxWidth: 100}}
                                    defaultValue={stop.location?.postalCode}
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
                                    style={{maxWidth: 140}}
                                    defaultValue={stop.location?.city}
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
                                    defaultValue={stop.location?.address}
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
                                    defaultValue={stop.location?.addressOther}
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
                            </div>
                            :
                            <div>
                                <b>{stop.location.fullAddress}</b>
                                {!stop.active && <b className="text-secondary ms-1">Inactive</b>}
                                {!stop.location.coordinates && <b className="ms-1 text-warning">Missing coordinates</b>}
                            </div>
                        }
                    </div>
                    <div className="d-flex align-items-center">
                        <input 
                            type="checkbox"
                            checked={selected || false}
                            onChange={() => onSelect && onSelect(stop.id)}
                        />
                        <div className="mx-3">
                            <button type="button" className="button-transparent" id={`menu-${stop.id}`} style={{color: "inherit"}} data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <ion-icon name="ellipsis-horizontal"></ion-icon>
                            </button>
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
                        <button type="button" className="button-transparent" onClick={() => setExpanded(prev => !prev)}>
                            <ion-icon style={{fontSize: 25}} name="information-circle-outline"></ion-icon>
                        </button>
                    </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mt-2">
                    {
                        editing ?
                        <input
                            defaultValue={stop.name}
                            placeholder="Name"
                            onChange={e => setNewStop(prev => ({...prev, name: e.target.value}))}
                        />
                        :
                        <p>{stop.name}</p>
                    }
                    <span>
                        {Math.round(stop.routeInfo.distanceFromPrevious)} km - {DisplayTime(stop.routeInfo.durationFromPrevious)}
                    </span>
                </div>

                <div id={`details-${stop.id}`} className={`collapse ${expanded || editing ? "show" : ""}`}>
                    <hr/>
                    <p>Order Number: {stop.id}</p>
                    {
                        editing ?
                        <div className="my-1">
                            <span className="me-2 text-secondary">Email:</span>
                            <input
                                type="email"
                                defaultValue={stop.email}
                                placeholder="Email"
                                onChange={e => setNewStop(prev => ({...prev, email: e.target.value}))}
                            />
                        </div>
                        :
                        <p>Email: <a href={`mailto:${stop.email}`}>{stop.email}</a></p>
                    }
                    {
                        editing ?
                        <div className="my-1">
                            <span className="me-2 text-secondary">Phone:</span>
                            <input
                                type="tel"
                                defaultValue={stop.phone}
                                placeholder="Phone"
                                onChange={e => setNewStop(prev => ({...prev, phone: e.target.value}))}
                            />
                        </div>
                        :
                        <p>Phone: {stop.phone}</p>
                    }
                    {
                        editing ?
                        <div className="d-flex align-items-center my-1">
                            <span className="me-2 text-secondary">Price:</span>
                            <input
                                type="number"
                                style={{maxWidth: 140}}
                                defaultValue={stop.price}
                                placeholder="Price"
                                onChange={e => setNewStop(prev => ({...prev, price: e.target.value}))}
                            />
                            <span className="ms-1">Ft</span>
                        </div>
                        :
                        <p>Price: {stop.price} Ft</p>
                    }
                    {
                        editing ?
                        <div className="d-flex align-items-center my-1">
                            <span className="me-2 text-secondary">Delivery Price:</span>
                            <input
                                type="number"
                                style={{maxWidth: 140}}
                                defaultValue={stop.deliveryPrice}
                                placeholder="Delivery Price"
                                onChange={e => setNewStop(prev => ({...prev, deliveryPrice: e.target.value}))}
                            />
                            <span className="ms-1">Ft</span>
                        </div>
                        :
                        <p>Delivery Price: {stop.deliveryPrice} Ft</p>
                    }
                </div>

                {
                    (stop.parcel || editing) &&
                    <>
                        <hr/>
                        {
                            editing ?
                            <div>
                                <span className="text-secondary">Parcel:</span>
                                <textarea 
                                    className="box" 
                                    style={{width: "100%"}} 
                                    defaultValue={stop.parcel}
                                    placeholder="Parcel"
                                    onChange={e => setNewStop(prev => ({...prev, parcel: e.target.value}))}
                                />
                            </div>
                            :
                            <p className="box">{stop.parcel}</p> 
                        }
                    </>
                }
                {
                    (stop.note || editing) &&
                    <>
                        <hr/>
                        {
                            editing ?
                            <div>
                                <span className="text-secondary">Note:</span>
                                <textarea 
                                    className="box" 
                                    style={{width: "100%"}} 
                                    defaultValue={stop.note}
                                    placeholder="Note"
                                    onChange={e => setNewStop(prev => ({...prev, note: e.target.value}))}
                                />
                            </div>
                            :
                            <p>{stop.note}</p>
                        }
                    </>
                }
            </form>

            <div className="d-flex mt-2 justify-content-between align-items-center">
                <div>
                    <button type="button" className={editing ? "button" : "button-secondary"} onClick={() => {
                        if (editing) {
                            handleSubmit();
                        } else {
                            setNewStop(stop);
                            setEditing(true);
                        }
                    }}>
                        <ion-icon name={editing ? "checkmark" : "pencil"}></ion-icon>
                    </button>
                    {
                        editing &&
                        <button type="button" className="button-secondary" onClick={() => {
                            setNewStop(stop);
                            setEditing(false);
                        }}>
                            Cancel
                        </button>
                    }
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

export default memo(StopCard);
