import {useState, useEffect} from "react"
import { Route, Stop } from "../utils/Objects"
import StopCard from "../components/StopCard"
import {Link} from "react-router-dom"

export default function App() {
    const [route, setRoute] = useState(JSON.parse(localStorage.getItem("selected")) || new Route)
    const [newStop, setNewStop] = useState({})

    useEffect(() => {
        let routes = JSON.parse(localStorage.getItem("routes"));
        routes.map((oldRoute, index) => {
            if (oldRoute.createdAt == route.createdAt) routes[index] = route;
        })  
        localStorage.setItem("routes", JSON.stringify(routes));
    }, [route])

    return (
        <>
            <header>
                <Link to="/dashboard">Dashboard</Link>
            </header>
            <div className="p-3">
                <h2>{route.startingLocation?.city || "No starting location"} - {route.endLocation?.city || "No destination"}</h2>
                <h4>Add stop manually
                    <a id="add-stop" type="button" data-bs-toggle="collapse" data-bs-target="#stop-form" aria-expanded="false" aria-controls="stop-form">
                        <ion-icon name="arrow-up"></ion-icon>
                    </a>
                </h4>
                <form id="stop-form" className="collapse" onSubmit={e => {
                    e.preventDefault();
                    const stop = new Stop();
                    stop.location = new Location(newStop.zipCode, newStop.city, newStop.address, newStop.addressOther);
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
                    <input placeholder="City" onChange={e => setNewStop(prev => ({...prev, city: e.target.value}))}></input>
                    <input placeholder="Address" onChange={e => setNewStop(prev => ({...prev, address: e.target.value}))}></input>
                    <input placeholder="Other address" onChange={e => setNewStop(prev => ({...prev, addressOther: e.target.value}))}></input>
                    <button type="submit" className="button">Add stop</button>
                    <button type="reset" className="button button-warning">Clear</button>
                </form>
                {
                    route.stops != null
                    ?
                    route.stops.map((stop, index) => (
                        <StopCard key={index} stop={stop} />
                    ))
                    :
                    <p>Add stops to your route plan.</p>
                }
            </div>
        </>
    )
}