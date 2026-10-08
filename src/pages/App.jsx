import {useState, useEffect, act} from "react"
import { Route, Stop } from "../utils/Objects"
import StopCard from "../components/StopCard"
import {Link} from "react-router-dom"
import importExcel from "../utils/Import.js"
import getCoordinates from "../utils/Coordinates.js"
import displayTime from "../utils/DisplayTime.js"
import optimizeRoute from "../utils/Optimize.js"
import routeInfo from "../utils/RouteInfo.js"
import Map from "../components/Map.jsx"
import {fields} from "../utils/Const.js";

export default function App() {
    const [route, setRoute] = useState(JSON.parse(localStorage.getItem("selected")) || new Route());
    const [newStop, setNewStop] = useState({});
    const [override, setOverride] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showScrollDown, setShowScrollDown] = useState(false);
    const [header, setHeader] = useState([]);
    const [dataHeader, setDataHeader] = useState({});
    const [file, setFile] = useState();
    const [headerRow, setHeaderRow] = useState(0);

    useEffect(() => {
        const checkScroll = () => {
            const scrollHeight = document.documentElement.scrollHeight;
            const viewportHeight = window.innerHeight;
            const scrollPosition = window.scrollY;

            const hasScroll = scrollHeight > viewportHeight;
            const atBottom =
                viewportHeight + scrollPosition >= scrollHeight - 10;

            setShowScrollDown(hasScroll && !atBottom);
        };

        checkScroll();

        window.addEventListener("scroll", checkScroll);

        return () => {
            window.removeEventListener("scroll", checkScroll);
        };
    }, []);

    useEffect(() => {
        let routes = JSON.parse(localStorage.getItem("routes"));
        routes.map((oldRoute, index) => {
            if (oldRoute.createdAt == route.createdAt) routes[index] = route;
        })  
        localStorage.setItem("routes", JSON.stringify(routes));
        localStorage.setItem("selected", JSON.stringify(route));
    }, [route])

    
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

            const updatedStop = routeData.stops.find(
                stop => stop.id === originalStop.id
            );

            return updatedStop ?? originalStop;
        });

        setRoute(prev => ({
            ...prev,
            stops: updatedStops,
            geometry: routeData.geometry,
            totalDistance: routeData.distance,
            totalDuration: routeData.duration
        }));
    }

    async function handleImport() {
        setLoading(true);
        try {
            if (override) {
                const stops = await importExcel({file: file, columnHeader: dataHeader});
                await updateRoute({...route, stops: stops});
            };
            if (!override) {
                const stops = await importExcel({file: file, columnHeader: dataHeader, overrideStops: route.stops});
                await updateRoute({...route, stops: [...route.stops, ...stops]});
            };
        } catch (error) {
            alert("Error importing Excel file");
            console.log(error.message)
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
                        <div className='my-3 row text-center justify-content-center'>
                            {
                            fields.map(field => (
                                <div key={field.key} className='col-auto'>
                                <b>{field.label}</b><br/>
                                <select 
                                    className='select'
                                    name={field.key}
                                    value={dataHeader?.[field.key] || ""}
                                    onChange={e => setDataHeader({...dataHeader, [field.key]: e.target.value})}
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
                        <div>
                            <label htmlFor='header-input'>Skip row(s)</label>
                            <input className="mb-3" id='header-input' defaultValue={headerRow} style={{width: 40}} type='tel' onChange={e => setHeaderRow(e.target.value)}></input>
                            <br/>
                            <label htmlFor="override">Override existing stops</label>
                            <input className="mb-3" id="override" type="checkbox" checked={override} onChange={e => setOverride(e.target.checked)}></input>
                            <br/>
                            <input style={{width: 280}} className="my-2" id="file-input" type='file' accept=".xlsx, .xls" onChange={async e => {
                                const file = e.target.files[0];
                                if (file) {
                                    setFile(file);
                                    setHeader(await importExcel({file: file, headersOnly: true }));
                                    setDataHeader({});
                                }
                            }}/>
                            <a style={{fontSize: 25}} type="button" onClick={() => {
                                setHeader([]);
                                setFile();
                                document.getElementById("file-input").value = "";
                            }}>
                                <ion-icon name="close"></ion-icon>
                            </a>
                            <br/>
                            <button className="my-2" onClick={() => handleImport()}>Load</button>
                        </div>
                    </div>
                    <div className="box mt-3">
                        <h3>{route.stops[0]?.location.city || "No starting location"} ➔ {route.stops[route.stops.length-1]?.location.city || "No destination"}</h3>
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
                    <button onClick={async () => {
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
                                        document.getElementById("stop-form").reset();
                                        const stop = new Stop(newStop);
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
                                    route.stops.map(stop => (
                                        <StopCard 
                                            key={stop.id} 
                                            stop={stop} 
                                            onEdit={updateStop}
                                            onDelete={async id => {
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
                                                const newStops = route.stops.map(stop =>
                                                    stop.id === id
                                                        ? { ...stop, active: !stop.active }
                                                        : stop
                                                );
                                                await updateRoute({...route, stops: newStops});
                                            }}
                                        />
                                    ))
                                }
                            </div>
                            <div className="col-12 col-xl-7">
                                <Map coordinates={route.geometry} stops={route.stops.filter(stop => stop.active)}/>
                            </div>
                        </div>
                    </div>
                    {showScrollDown ?
                        <button className="scroll" onClick={() => window.scrollTo({top: document.documentElement.scrollHeight, behavior: "smooth"})}>
                            <ion-icon name="arrow-down-outline"></ion-icon>
                        </button>
                        :
                        <button className="scroll" onClick={() => window.scrollTo({top: 0, behavior: "smooth"})}>
                            <ion-icon name="arrow-up-outline"></ion-icon>
                        </button>
                    }
                    
                </div>
            }
        </>
    )
}