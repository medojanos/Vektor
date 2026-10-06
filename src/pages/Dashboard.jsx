import {Link} from 'react-router-dom'
import {Route} from "../utils/Objects"
import { useEffect, useState } from 'react';
import RouteCard from '../components/RouteCard';
import importExcel from '../utils/Import.js';
import routeInfo from '../utils/RouteInfo.js';

export default function Dashboard() {
  const [routes, setRoute] = useState(JSON.parse(localStorage.getItem("routes")) || []); 
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem("routes", JSON.stringify(routes));
  }, [routes])

  function startRoute(newRoute) {
    setRoute([...routes, newRoute]);
    localStorage.setItem("selected", JSON.stringify(newRoute));
    window.location = "/app";
  }

  return (
    <>
      <header>
        <Link to="/" className="d-flex align-items-center">
          <ion-icon name="arrow-back" style={{fontSize: "2rem", marginRight: 5}}></ion-icon>
          <span>Go back</span>
        </Link>
      </header>
      {
        loading ?
        <div className="d-flex justify-content-center align-items-center flex-grow-1">
          <svg width={200} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><circle fill="#00BFFF" stroke="#00BFFF" strokeWidth="15" r="15" cx="40" cy="65"><animate attributeName="cy" calcMode="spline" dur="2" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.4"></animate></circle><circle fill="#00BFFF" stroke="#00BFFF" strokeWidth="15" r="15" cx="100" cy="65"><animate attributeName="cy" calcMode="spline" dur="2" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.2"></animate></circle><circle fill="#00BFFF" stroke="#00BFFF" strokeWidth="15" r="15" cx="160" cy="65"><animate attributeName="cy" calcMode="spline" dur="2" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="0"></animate></circle></svg>
        </div>
        :
        <div className="d-flex align-items-center flex-column mt-5">
          <h2>My routes</h2>
          <p>Create a new route or import one.</p>
          <div className='text-center mt-2'>
            <button 
            onClick={() => {
              startRoute(new Route());
            }}>
              Start planning
            </button>
            <input type='file' accept=".xlsx, .xls" onChange={async (e) => {
              const file = e.target.files[0];
              if (file) {
                setLoading(true);
                try {
                  const stops = await importExcel(file);
                  const route = await routeInfo(stops.filter(stop => stop.active));
                  startRoute(new Route({
                    stops: route.stops,
                    totalDistance: route.distance, 
                    totalDuration: route.duration, 
                    geometry: route.geometry
                  }));
                } catch (error) {
                  alert("Error importing Excel file: " + error.message);
                } finally {
                  setLoading(false)
                }
              }
            }}/>
          </div>
          <div className="mt-3">
            {
              routes.length != 0
              ?
              routes.map(route => (
                <RouteCard key={route.createdAt} route={route} 
                  onDelete={createdAt => {
                    setRoute(routes.filter(r => r.createdAt !== createdAt));
                  }}
                  onExport={createdAt => {
                    // Export
                  }}
                />
              ))
              :
              <p>You don't have any routes yet.</p>
            }
          </div>
        </div>
      }
    </>
  )
}
