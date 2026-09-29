import {useState, useEffect} from "react"
import { Route, Stop } from "../utils/Objects"
import StopCard from "../components/StopCard"
import {Link} from "react-router-dom"
import importExcel from "../utils/Import.js"
import getCoordinates from "../utils/Coordinates.js"

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

    return (
        <>
            <header>
                <Link to="/dashboard">Dashboard</Link>
            </header>
            {
                loading ? 
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><circle fill="#00BFFF" stroke="#00BFFF" strokeWidth="15" r="15" cx="40" cy="65"><animate attributeName="cy" calcMode="spline" dur="2" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.4"></animate></circle><circle fill="#00BFFF" stroke="#00BFFF" strokeWidth="15" r="15" cx="100" cy="65"><animate attributeName="cy" calcMode="spline" dur="2" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.2"></animate></circle><circle fill="#00BFFF" stroke="#00BFFF" strokeWidth="15" r="15" cx="160" cy="65"><animate attributeName="cy" calcMode="spline" dur="2" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="0"></animate></circle></svg>
                :
                <div className="p-3">
                    <h3>{route.startingLocation?.city || "No starting location"} - {route.endLocation?.city || "No destination"}</h3>
                    <input className="my-3" type='file' accept=".xlsx, .xls" onChange={async (e) => {
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
                    }}/>
                    <span className="mx-2">Override existing routes</span>
                    <input type="checkbox" checked={override} onChange={e => setOverride(e.target.checked)}></input>
                    <p className="m-0">Add stop manually
                        <a id="add-stop" type="button" data-bs-toggle="collapse" data-bs-target="#stop-form" aria-expanded="false" aria-controls="stop-form" className="collapsed">
                            <ion-icon style={{fontSize: 20}} name="arrow-down"></ion-icon>
                        </a>
                    </p>
                    <div className="container-fluid">
                        <div className="row row-cols-1 row-cols-lg-2">
                            <div className="col-4">
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
                                {
                                    route.stops != null
                                    ?
                                    route.stops.map((stop, index) => (
                                        <StopCard key={index} stop={stop} 
                                        onEdit={async (id, newAddress) => {
                                            const newCoordinates = await getCoordinates(newAddress.fullAddress);
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
                                        }}
                                        onDelete={id => {
                                            setRoute(prev => ({...prev, stops: prev.stops.filter(s => s.id !== id)}));
                                        }}
                                        />
                                    ))
                                    :
                                    <p>Add stops to your route plan.</p>
                                }
                            </div>
                            <div className="col-8">
                                <h3>Map</h3>
                            </div>
                        </div>
                    </div>
                    
                </div>
            }
        </>
    )
}