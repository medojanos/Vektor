import {useState, useEffect} from "react"
import { Route, Stop } from "../utils/Objects"
import StopCard from "../components/StopCard"
import {Link} from "react-router-dom"
import importExcel from "../utils/Import.js"
import getCoordinates from "../utils/Coordinates.js"
import displayTime from "../utils/DisplayTime.js"
import optimizeRoute from "../utils/Optimize.js"
import routeInfo from "../utils/RouteInfo.js"
import Map from "../components/Map.jsx"

export default function App() {
    const [route, setRoute] = useState(JSON.parse(localStorage.getItem("selected")) || new Route());
    const [newStop, setNewStop] = useState({});
    const [override, setOverride] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let routes = JSON.parse(localStorage.getItem("routes"));
        routes.map((oldRoute, index) => {
            if (oldRoute.createdAt == route.createdAt) routes[index] = route;
        })  
        localStorage.setItem("routes", JSON.stringify(routes));
        localStorage.setItem("selected", JSON.stringify(route));
    }, [route])

    
    function updateRoute(newRoute) {
        setRoute(prev => ({
            ...prev,
            geometry: newRoute.geometry,
            stops: newRoute.stops,
            totalDistance: newRoute.distance,
            totalDuration: newRoute.duration
        }));
    }

    async function handleImport(e) {
        const file = e.target.files[0];
        if (file) {
            setLoading(true);
            try {
                if (override) {
                    const stops = await importExcel(file);
                    setRoute(new Route({...route, stops: stops}));
                    updateRoute(await routeInfo(stops));
                };
                if (!override) {
                    const stops = await importExcel(file, route.stops);
                    const newRoute = {...route, stops: [...route.stops, ...stops]}
                    setRoute(newRoute);
                    updateRoute(await routeInfo(newRoute.stops));
                };
            } catch (error) {
                alert("Error importing Excel file:", error);
            } finally {
                setLoading(false);
            }
        }
    }
    async function updateStopCoordinates(id, newAddress) {
        const newCoordinates = await getCoordinates(`${newAddress.postalCode} ${newAddress.city}, ${newAddress.address}`);
        setRoute(prev => ({
            ...prev, 
            stops: prev.stops.map(stop => {
                if (stop.id == id) {
                    return {...stop, location: 
                        {
                            postalCode: newAddress.postalCode || "",
                            city: newAddress.city || "",
                            address: newAddress.address || "",
                            addressOther: newAddress.addressOther || "",
                            fullAddress: newAddress.fullAddress,

                            coordinates: newCoordinates
                        } 
                    }
                }
                return stop;
            })
        }));
        updateRoute(await routeInfo(route.stops));
    }
    async function moveStop(id, direction) {
        const index = route.stops.findIndex(s => s.id === id);

        if (direction === "up" && index > 0) {
            const newStops = [...route.stops];

            [newStops[index], newStops[index - 1]] =
                [newStops[index - 1], newStops[index]];

            const newRoute = await routeInfo(newStops);

            updateRoute(newRoute);
        }

        if (direction === "down" && index < route.stops.length - 1) {
            const newStops = [...route.stops];

            [newStops[index], newStops[index + 1]] =
                [newStops[index + 1], newStops[index]];

            const newRoute = await routeInfo(newStops);

            updateRoute(newRoute);
        }
    }

    return (
        <>
            <header>
                <Link to="/dashboard">Dashboard</Link>
            </header>
            {
                loading ? 
                <div className="d-flex justify-content-center align-items-center flex-grow-1">
                    <svg width={200} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><circle fill="#00BFFF" stroke="#00BFFF" strokeWidth="15" r="15" cx="40" cy="65"><animate attributeName="cy" calcMode="spline" dur="2" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.4"></animate></circle><circle fill="#00BFFF" stroke="#00BFFF" strokeWidth="15" r="15" cx="100" cy="65"><animate attributeName="cy" calcMode="spline" dur="2" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.2"></animate></circle><circle fill="#00BFFF" stroke="#00BFFF" strokeWidth="15" r="15" cx="160" cy="65"><animate attributeName="cy" calcMode="spline" dur="2" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="0"></animate></circle></svg>
                </div>
                :
                <div className="p-3">
                    <h4>
                        Import stops
                        <a id="add-stop" type="button" data-bs-toggle="collapse" data-bs-target="#import" aria-expanded="false" aria-controls="import" className="collapsed">
                            <ion-icon style={{fontSize: 22}} name="arrow-down"></ion-icon>
                        </a>
                    </h4>
                    <div id="import" className="collapse">
                        <label htmlFor="override">Override existing stops</label>
                        <input id="override" type="checkbox" checked={override} onChange={e => setOverride(e.target.checked)}></input>
                        <input type='file' accept=".xlsx, .xls" onChange={handleImport}/><br/>
                    </div>
                    <div className="box mt-3">
                        <h3>{route.stops[0]?.location.city || "No starting location"} ➔ {route.stops[route.stops.length-1]?.location.city || "No destination"}</h3>
                        <hr/>
                        <table>
                            <thead>
                                <tr>
                                    <th>Total distance</th>
                                    <th>Total duration</th>
                                    <th>Total stops</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{Math.round(route.totalDistance / 1000)} km</td>
                                    <td>{displayTime(route.totalDuration)}</td>
                                    <td>{route.stops.length}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <button onClick={async () => {
                        const optimizedRoute = await optimizeRoute(route.stops);
                        if (optimizedRoute) updateRoute(optimizedRoute);
                    }} className="d-flex align-items-center my-4 ms-auto">
                        <span className="me-2">Optimize</span><ion-icon name="star"></ion-icon>
                    </button>
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-12 col-xl-5">
                                <div className="d-flex align-items-center">
                                    <span>Add stop manually</span>
                                    <a id="add-stop" type="button" data-bs-toggle="collapse" data-bs-target="#stop-form" aria-expanded="false" aria-controls="stop-form" className="collapsed">
                                        <ion-icon style={{fontSize: 22}} name="arrow-down"></ion-icon>
                                    </a>
                                </div>
                                <form id="stop-form" className="collapse mt-2" onSubmit={async e => {
                                        e.preventDefault();
                                        const stop = new Stop(newStop);
                                        const stopWithCoordinates = {...stop, location: {...stop.location, coordinates: await getCoordinates(stop.location.fullAddress)}};
                                        const newRoute = {...route, stops: [...route.stops, stopWithCoordinates]};
                                        setRoute(newRoute);
                                        updateRoute(await routeInfo(newRoute.stops));
                                    }}>
                                    <span>Contact</span><br/>
                                    <input placeholder="Name" onChange={e => setNewStop(prev => ({...prev, name: e.target.value}))}></input>
                                    <input type="email" placeholder="Email" onChange={e => setNewStop(prev => ({...prev, email: e.target.value}))}></input>
                                    <input type="tel" placeholder="Phone" onChange={e => setNewStop(prev => ({...prev, phone: e.target.value}))}></input>
                                    <br/><span>Price</span><br/>
                                    <input type="number" placeholder="Price" onChange={e => setNewStop(prev => ({...prev, price: e.target.value}))}></input>
                                    <input type="number" placeholder="Delivery price" onChange={e => setNewStop(prev => ({...prev, deliveryPrice: e.target.value}))}></input>
                                    <br/><span>Package</span><br/>
                                    <input placeholder="Parcel" onChange={e => setNewStop(prev => ({...prev, parcel: e.target.value}))}></input>
                                    <input placeholder="Note" onChange={e => setNewStop(prev => ({...prev, note: e.target.value}))}></input>
                                    <br/><span>Address</span><br/>
                                    <input type="number" placeholder="Zip code" onChange={e => setNewStop(prev => ({...prev, postalCode: e.target.value}))}></input>
                                    <input required placeholder="City" onChange={e => setNewStop(prev => ({...prev, city: e.target.value}))}></input>
                                    <input placeholder="Address" onChange={e => setNewStop(prev => ({...prev, address: e.target.value}))}></input>
                                    <input placeholder="Other address" onChange={e => setNewStop(prev => ({...prev, addressOther: e.target.value}))}></input>
                                    <br/>
                                    <button type="submit" className="mt-2">Add stop</button>
                                    <button type="reset" className="button-warning" onClick={() => setNewStop({})}>Clear</button>
                                </form>
                                {
                                    route.stops.map((stop, index) => (
                                        <StopCard 
                                            key={index} 
                                            stop={stop} 
                                            onEdit={updateStopCoordinates}
                                            onDelete={async id => {
                                                const newStops = route.stops.filter(s => s.id !== id)
                                                setRoute(prev => ({...prev, stops: newStops}));
                                                updateRoute(await routeInfo(newStops))
                                            }}
                                            onMoveUp={id => moveStop(id, "up")}
                                            onMoveDown={id => moveStop(id, "down")}
                                            onMakeFirst={async id => {
                                                const index = route.stops.findIndex(stop => stop.id === id);
                                                if (index === -1 || index === 0) return;
                                                const newStops = [...route.stops];
                                                const [stop] = newStops.splice(index, 1);
                                                newStops.unshift(stop);
                                                updateRoute(await routeInfo(newStops));
                                            }}

                                            onMakeLast={async id => {
                                                const index = route.stops.findIndex(stop => stop.id === id);
                                                if (index === -1 || index === route.stops.length - 1) return;
                                                const newStops = [...route.stops];
                                                const [stop] = newStops.splice(index, 1);
                                                newStops.push(stop);
                                                updateRoute(await routeInfo(newStops));
                                            }}
                                        />
                                    ))
                                }
                            </div>
                            <div className="col-12 col-xl-7">
                                <Map coordinates={route.geometry}/>
                            </div>
                        </div>
                    </div>
                    <button id="scrolldown" onClick={() => window.scrollBy({ top: document.documentElement.scrollHeight, behavior: "smooth" })}>
                        <ion-icon name="arrow-down-outline"></ion-icon>
                    </button>
                </div>
            }
        </>
    )
}