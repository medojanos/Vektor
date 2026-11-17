import {useState, useEffect} from "react"
import { Route, Stop } from "../utils/Objects"
import StopCard from "../components/StopCard"
import {Link, useNavigate} from "react-router-dom"
import importExcel from "../utils/Import.js"
import getCoordinates from "../utils/Coordinates.js"
import displayTime from "../utils/DisplayTime.js"
import optimizeRoute from "../utils/Optimize.js"
import routeInfo from "../utils/RouteInfo.js"
import Map from "../components/Map.jsx"
import {fields} from "../utils/Const.js"
import StartEnd from "../utils/StartEnd.js"
import autoMatchHeaders from "../utils/AutoMatch.js"
import {addRouteAndSelect, getSelectedRoute, persistCurrentRoute} from "../utils/RouteStorage.js"

export default function App() {
    const navigate = useNavigate();
    const [route, setRoute] = useState(new Route());
    const [routeReady, setRouteReady] = useState(false);
    const [newStop, setNewStop] = useState({});
    const [override, setOverride] = useState(false);
    const [loading, setLoading] = useState(false);
    const [header, setHeader] = useState([]);
    const [dataHeader, setDataHeader] = useState({});
    const [file, setFile] = useState();
    const [headerRow, setHeaderRow] = useState(1);
    const [selectedStops, setSelectedStops] = useState([]);

    useEffect(() => {
        async function loadRoute() {
            try {
                setRoute(await getSelectedRoute() || new Route());
            } catch (error) {
                alert("Error loading saved route: " + error.message);
            } finally {
                setRouteReady(true);
            }
        }
        loadRoute();
    }, []);

    useEffect(() => {
        if (!file) return;
        async function refreshHeader() {
            const headers = await importExcel({file: file, headersOnly: true, headerRow: headerRow});
            setHeader(headers);
            const autoDetected = autoMatchHeaders(headers, fields);
            setDataHeader(autoDetected);
        }
        refreshHeader();
    }, [file, headerRow]);

    useEffect(() => {
        if (!routeReady) return;
        persistCurrentRoute(route).catch(error => {
            alert("Error saving route: " + error.message);
        });
    }, [route, routeReady])
    
    async function updateRoute(newRoute) {
        const routeData = await routeInfo(newRoute.stops.filter(stop => stop.active));

        const updatedStops = newRoute.stops.map(originalStop => {
            if (!originalStop.active) {
                return {
                    ...originalStop,
                    routeInfo: {
                        distanceFromPrevious: 0,
                        durationFromPrevious: 0
                    }
                };
            }

            const updatedStop = routeData?.stops.find(
                stop => stop.id === originalStop.id
            );

            return updatedStop ?? originalStop;
        });

        setRoute(prev => ({
            ...prev,
            stops: updatedStops,
            geometry: routeData && routeData?.geometry,
            totalDistance: routeData && routeData?.distance,
            totalDuration: routeData && routeData?.duration
        }));
    }

    async function handleImport() {
        setLoading(true);
        try {
            if (override) {
                const stops = await importExcel({file: file, columnHeader: dataHeader, headerRow: headerRow});
                await updateRoute({...route, stops: stops});
            };
            if (!override) {
                const stops = await importExcel({file: file, columnHeader: dataHeader, headerRow: headerRow, overrideStops: route.stops});
                await updateRoute({...route, stops: [...route.stops, ...stops]});
            };
        } catch (error) {
            alert("Error importing Excel file " + error.message);
        } finally {
            setLoading(false);
        }
    }
    async function updateStop(id, newStop) {
        const newCoordinates = await getCoordinates(`${newStop.location.postalCode} ${newStop.location.city}, ${newStop.location.address}`);

        const newStops = route.stops.map(stop => {
            if (stop.id !== id) {
                return stop;
            }
            return {
                ...newStop,
                location: {
                    ...newStop.location,
                    coordinates: newCoordinates
                },
                active: Boolean(newCoordinates)
            };
        });
        
        await updateRoute({...route, stops: newStops});
    }
    async function moveStop(id, direction) {
        const index = route.stops.findIndex(s => s.id === id);

        if (direction === "up" && index > 0) {
            const newStops = [...route.stops];

            [newStops[index], newStops[index - 1]] =
                [newStops[index - 1], newStops[index]];

            await updateRoute({...route, stops: newStops});
        }

        if (direction === "down" && index < route.stops.length - 1) {
            const newStops = [...route.stops];

            [newStops[index], newStops[index + 1]] =
                [newStops[index + 1], newStops[index]];

            await updateRoute({...route, stops: newStops});
        }
    }

    async function startRouteWithSelected() {
        setLoading(true);

        try {
            const stops = route.stops.filter(stop => selectedStops.includes(stop.id));
            const activeStops = stops.filter(stop => stop.active);
            const routeData = activeStops.length > 1 ? await routeInfo(activeStops) : null;

            const updatedStops = stops.map(originalStop => {
                if (!originalStop.active) {
                    return {
                        ...originalStop,
                        routeInfo: {
                            distanceFromPrevious: 0,
                            durationFromPrevious: 0
                        }
                    };
                }
                const updatedStop = routeData?.stops.find(
                    s => s.id === originalStop.id
                );
                return updatedStop ?? originalStop;
            });

            const newRoute = new Route({
                stops: updatedStops,
                totalDistance: routeData?.distance ?? 0,
                totalDuration: routeData?.duration ?? 0,
                geometry: routeData?.geometry ?? []
            });

            await addRouteAndSelect(newRoute);
            setSelectedStops([]);
            setRoute(newRoute);
            navigate("/app");
        } catch (error) {
            alert("Error creating route: " + error.message);
        } finally {
            setLoading(false);
        }
    }


    return (
        loading || !routeReady ?
            <div className="d-flex justify-content-center align-items-center flex-grow-1">
                <svg width={200} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><circle fill="var(--primary)" stroke="var(--primary)" strokeWidth="15" r="15" cx="40" cy="65"><animate attributeName="cy" calcMode="spline" dur="2" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.4"></animate></circle><circle fill="var(--primary)" stroke="var(--primary)" strokeWidth="15" r="15" cx="100" cy="65"><animate attributeName="cy" calcMode="spline" dur="2" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.2"></animate></circle><circle fill="var(--primary)" stroke="var(--primary)" strokeWidth="15" r="15" cx="160" cy="65"><animate attributeName="cy" calcMode="spline" dur="2" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="0"></animate></circle></svg>
            </div>
        :
        <>
            <header>
                <Link to="/dashboard">Dashboard</Link>
            </header>
            <div className="p-3 d-flex align-items-center">
                <h4>Import stops</h4>
                <button id="add-stop" data-bs-toggle="collapse" data-bs-target="#import" aria-expanded="false" aria-controls="import" className="collapsed button-transparent">
                    <ion-icon style={{fontSize: 22}} name="arrow-down"></ion-icon>
                </button>
            </div>
            <div id="import" className="collapse p-3">
                <div className="d-flex align-items-center">
                    <input style={{width: 280}} id="file-input" type='file' accept=".xlsx, .xls" onChange={async e => {
                        const file = e.target.files[0];
                        if (file) {
                            setFile(file);
                            const headers = await importExcel({file: file, headersOnly: true, headerRow: headerRow});
                            setHeader(headers);
                            const autoDetected = autoMatchHeaders(headers, fields);
                            setDataHeader(autoDetected);
                        }
                    }}/>
                    <button style={{fontSize: 25}} className="button-transparent" type="button" onClick={() => {
                        setHeader([]);
                        setFile();
                        setHeaderRow(1);
                        setDataHeader({});
                        document.getElementById("file-input").value = "";
                    }}>
                        <ion-icon name="close"></ion-icon>
                    </button>
                </div>
                <div className="my-3 d-flex align-items-center justify-content-center justify-content-md-start">
                    <div>
                        <label htmlFor='header-input'>Skip row(s)</label>
                        <input placeholder="0" id='header-input' value={headerRow} style={{width: 40}} type='tel' onChange={e => setHeaderRow(e.target.value)}></input>
                    </div>
                    <div className="ms-3">
                        <label htmlFor="override">Override everything</label>
                        <input id="override" type="checkbox" checked={override} onChange={e => setOverride(e.target.checked)}></input>
                    </div>
                </div>
                <div className='my-2 row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-lg-6 text-center justify-content-center'>
                    {
                    fields.map(field => (
                        <div key={field.key} className='col'>
                        <b>{field.label}</b><br/>
                        <select 
                            className='select'
                            name={field.key}
                            value={dataHeader?.[field.key] !== undefined && dataHeader?.[field.key] !== "" ? dataHeader[field.key] : ""}
                            onChange={e => {
                                const val = e.target.value;
                                setDataHeader(prev => ({
                                    ...prev,
                                    [field.key]: val === "" ? "" : Number(val)
                                }));
                            }}
                        >
                            <option value="">No column</option>
                            {
                            header.map(col => (
                                <option key={col.number} value={col.number}>
                                    {col.header}
                                </option>
                            ))
                            }
                        </select>
                        </div>
                    ))
                    }
                </div>
                <button className="my-2" onClick={() => handleImport()}>Load</button>
            </div>
            <div className="box m-3">
                <h3>{StartEnd(route).start + ' → ' + StartEnd(route).end}</h3>
                <hr/>
                <table className="text-center">
                    <thead>
                        <tr>
                            <th>Total distance</th>
                            <th>Total duration</th>
                            <th>Total stops</th>
                            <th>Inactive stops</th>
                            <th>Bad addresses</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{Math.round(route.totalDistance / 1000)} km</td>
                            <td>{displayTime(route.totalDuration)}</td>
                            <td>{route.stops.length}</td>
                            <td>{route.stops.filter(stop => !stop.active).length}</td>
                            <td>{route.stops.filter(stop => !stop.location.coordinates).length}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className="container-fluid">
                <div className="row justify-content-between my-3">
                    <div className="col-auto order-xl-2">
                        <button 
                            className="d-flex align-items-center justify-content-center"
                            onClick={async () => {
                                const inactiveStops = route.stops.filter(stop => !stop.active);
                                const optimizedRoute = await optimizeRoute(route.stops.filter(stop => stop.active));
                                if (optimizedRoute) await updateRoute({
                                    ...route,
                                    stops: [
                                        ...optimizedRoute.stops,
                                        ...inactiveStops
                                    ],
                                    totalDistance: optimizedRoute.distance,
                                    totalDuration: optimizedRoute.duration,
                                    geometry: optimizedRoute.geometry
                                });
                            }}>
                            <span className="me-2">Optimize</span><ion-icon name="star"></ion-icon>
                        </button>
                    </div>
                    {selectedStops.length > 0 && (
                        <div className="col-12 col-xl-5 order-xl-1">
                            <div className="d-flex align-items-center justify-content-between mt-3 mt-xl-0">
                                <a type="button" onClick={startRouteWithSelected} className="d-flex align-items-center">
                                    <ion-icon style={{fontSize: 22, marginRight: 10}} name="add-circle"></ion-icon>
                                    <span className="me-2">Make new route</span>
                                </a>
                                <button style={{color: "red"}} className="d-flex align-items-center button-transparent" onClick={() => {
                                    const newStops = route.stops.filter(stop => !selectedStops.includes(stop.id));
                                    setSelectedStops([]);
                                    updateRoute({...route, stops: newStops});
                                }}>
                                    <span className="me-2">Delete selected</span>
                                    <ion-icon style={{fontSize: 22, marginRight: 10}} name="trash"></ion-icon>
                                </button>
                            </div>
                            <div className="d-flex align-items-center justify-content-between mt-3">
                                <button className="d-flex align-items-center button-transparent" onClick={() => setSelectedStops(route.stops.map(s => s.id))}>
                                    <span className="me-2">Select all</span>
                                </button>
                                <button className="d-flex align-items-center button-transparent" onClick={() => setSelectedStops([])}>
                                    <span className="me-2">Deselect all</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                <div className="row">
                    <div className="col-12 col-xl-5 overflow-y-scroll" style={{maxHeight: "60vh"}}>
                        <div className="d-flex align-items-center">
                            <span>Add stop manually</span>
                            <button id="add-stop" type="button" data-bs-toggle="collapse" data-bs-target="#stop-form" aria-expanded="false" aria-controls="stop-form" className="collapsed button-transparent">
                                <ion-icon style={{fontSize: 22}} name="arrow-down"></ion-icon>
                            </button>
                        </div>
                        <form id="stop-form" className="collapse mt-2 box" onSubmit={async e => {
                                e.preventDefault();
                                const stop = new Stop(newStop);
                                e.currentTarget.reset();
                                setNewStop({});
                                const newCoordinates = await getCoordinates(stop.location.fullAddress);
                                await updateRoute({
                                    ...route, 
                                    stops: [
                                        {
                                            ...stop,
                                            location: {
                                                ...stop.location, 
                                                coordinates: newCoordinates
                                            },
                                            active: Boolean(newCoordinates)
                                        },
                                        ...route.stops
                                    ]
                                });
                            }}>
                            <span className="text-secondary">Contact:</span><br/>
                            <input placeholder="Name" value={newStop.name || ""} onChange={e => setNewStop(prev => ({...prev, name: e.target.value}))}></input>
                            <input type="email" placeholder="Email" value={newStop.email || ""} onChange={e => setNewStop(prev => ({...prev, email: e.target.value}))}></input>
                            <input type="tel" placeholder="Phone" value={newStop.phone || ""} onChange={e => setNewStop(prev => ({...prev, phone: e.target.value}))}></input>
                            <br/><span className="text-secondary">Price:</span><br/>
                            <input type="number" placeholder="Price" value={newStop.price || ""} onChange={e => setNewStop(prev => ({...prev, price: e.target.value}))}></input>
                            <input type="number" placeholder="Delivery price" value={newStop.deliveryPrice || ""} onChange={e => setNewStop(prev => ({...prev, deliveryPrice: e.target.value}))}></input>
                            <br/><span className="text-secondary">Package:</span><br/>
                            <textarea placeholder="Parcel" value={newStop.parcel || ""} onChange={e => setNewStop(prev => ({...prev, parcel: e.target.value}))}></textarea>
                            <br/><span className="text-secondary">Note:</span><br/>
                            <textarea placeholder="Note" value={newStop.note || ""} onChange={e => setNewStop(prev => ({...prev, note: e.target.value}))}></textarea>
                            <br/><span className="text-secondary">Address:</span><br/>
                            <input type="number" placeholder="Zip code" value={newStop.postalCode || ""} onChange={e => setNewStop(prev => ({...prev, postalCode: e.target.value}))}></input>
                            <input required placeholder="City" value={newStop.city || ""} onChange={e => setNewStop(prev => ({...prev, city: e.target.value}))}></input>
                            <input placeholder="Address" value={newStop.address || ""} onChange={e => setNewStop(prev => ({...prev, address: e.target.value}))}></input>
                            <input placeholder="Other address" value={newStop.addressOther || ""} onChange={e => setNewStop(prev => ({...prev, addressOther: e.target.value}))}></input>
                            <br/>
                            <button type="submit" className="mt-2">Add stop</button>
                            <button type="reset" className="button-warning" onClick={() => setNewStop({})}>Clear</button>
                        </form>
                        {
                            route.stops.map(stop => (
                                <StopCard 
                                    key={stop.id} 
                                    stop={stop} 
                                    selected={selectedStops.includes(stop.id)}
                                    onSelect={id => {
                                        setSelectedStops(prev =>
                                            prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
                                        );
                                    }}
                                    onEdit={updateStop}
                                    onDelete={async id => {
                                        setSelectedStops(prev => prev.filter(sId => sId !== id));
                                        const newStops = route.stops.filter(s => s.id !== id)
                                        await updateRoute({...route, stops: newStops});
                                    }}
                                    onMoveUp={id => moveStop(id, "up")}
                                    onMoveDown={id => moveStop(id, "down")}
                                    onMakeFirst={async id => {
                                        const index = route.stops.findIndex(stop => stop.id === id);
                                        if (index === -1 || index === 0) return;
                                        const newStops = [...route.stops];
                                        const [stop] = newStops.splice(index, 1);
                                        newStops.unshift(stop);
                                        await updateRoute({...route, stops: newStops});
                                    }}
                                    onMakeLast={async id => {
                                        const index = route.stops.findIndex(stop => stop.id === id);
                                        if (index === -1 || index === route.stops.length - 1) return;
                                        const newStops = [...route.stops];
                                        const [stop] = newStops.splice(index, 1);
                                        newStops.push(stop);
                                        await updateRoute({...route, stops: newStops});
                                    }}
                                    onToggle={async id => {
                                        const newStops = route.stops.map(stop => {
                                            if (stop.id !== id) return stop;
                                            const canActivate = Boolean(stop.location?.coordinates);
                                            return { ...stop, active: stop.active ? false : canActivate };
                                        });
                                        await updateRoute({...route, stops: newStops});
                                    }}
                                />
                            ))
                        }
                    </div>
                    <div className="col-12 col-xl-7 mt-5 mt-xl-0">
                        {
                            route.stops.filter(stop => stop.active).length > 1 &&
                            <Map coordinates={route.geometry} stops={route.stops.filter(stop => stop.active)}/>
                        }
                    </div>
                </div>
            </div>
        </>
    )
}