import {useState, useEffect} from "react"
import { Route, Stop } from "../utils/Objects"
import StopCard from "../components/StopCard"
import {Link} from "react-router-dom"
import importExcel from "../utils/Import.js"
import getCoordinates from "../utils/Coordinates.js"
import displayTime from "../utils/DisplayTime.js"

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

    async function handleImport(e) {
        const file = e.target.files[0];
        if (file) {
            setLoading(true);
            try {
                if (override) {
                    const stops = await importExcel(file);
                    setRoute(new Route({stops: stops}));
                };
                if (!override) {
                    const stops = await importExcel(file, route.stops);
                    setRoute({...route, stops: [...route.stops, ...stops]});
                };
            } catch (error) {
                alert("Error importing Excel file:", error);
            } finally {
                setLoading(false)
            }
            
        }
    }
    async function updateStopCoordinates(id, newAddress) {
        const newCoordinates = await getCoordinates(newAddress.postalCode, newAddress.city, newAddress.address);
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
        }))
    }
    function moveStopUp(id) {
        setRoute(prev => {
            const index = prev.stops.findIndex(s => s.id === id);
            if (index > 0) {
                const newStops = [...prev.stops];
                [newStops[index], newStops[index - 1]] = [newStops[index - 1], newStops[index]];
                return {...prev, stops: newStops};
            }
            return prev;
        });
    }
    function moveStopDown(id) {
        setRoute(prev => {
            const index = prev.stops.findIndex(s => s.id === id);
            if (index < prev.stops.length - 1) {
                const newStops = [...prev.stops];
                [newStops[index], newStops[index + 1]] = [newStops[index + 1], newStops[index]];
                return {...prev, stops: newStops};
            }
            return prev;
        });
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
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{route.totalDistance} km</td>
                                    <td>{displayTime(route.totalDuration)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <button className="d-flex align-items-center my-4 ms-auto">
                        <span className="me-2">Optimize</span><ion-icon name="star"></ion-icon>
                    </button>
                    <div className="d-flex align-items-center">
                        <span>Add stop manually</span>
                        <a id="add-stop" type="button" data-bs-toggle="collapse" data-bs-target="#stop-form" aria-expanded="false" aria-controls="stop-form" className="collapsed">
                            <ion-icon style={{fontSize: 22}} name="arrow-down"></ion-icon>
                        </a>
                    </div>
                    <form id="stop-form" className="collapse mt-2" onSubmit={e => {
                            e.preventDefault();
                            const stop = new Stop(newStop);
                            setRoute({...route, stops: [...route.stops, stop]});
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
                        <input type="number" placeholder="Zip code" onChange={e => setNewStop(prev => ({...prev, zipCode: e.target.value}))}></input>
                        <input required placeholder="City" onChange={e => setNewStop(prev => ({...prev, city: e.target.value}))}></input>
                        <input placeholder="Address" onChange={e => setNewStop(prev => ({...prev, address: e.target.value}))}></input>
                        <input placeholder="Other address" onChange={e => setNewStop(prev => ({...prev, addressOther: e.target.value}))}></input>
                        <br/>
                        <button type="submit" className="mt-2">Add stop</button>
                        <button type="reset" className="button-warning" onClick={() => setNewStop({})}>Clear</button>
                    </form>
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-12 col-xl-5">
                                
                                {
                                    route.stops.map((stop, index) => (
                                        <StopCard 
                                            key={index} 
                                            stop={stop} 
                                            onEdit={updateStopCoordinates}
                                            onDelete={id => {
                                                setRoute(prev => ({...prev, stops: prev.stops.filter(s => s.id !== id)}));
                                            }}
                                            onMoveUp={moveStopUp}
                                            onMoveDown={moveStopDown}
                                        />
                                    ))
                                }
                            </div>
                            <div className="col-12 col-xl-7">
                                {/* Map */}
                            </div>
                        </div>
                    </div>
                </div>
            }
        </>
    )
}