import {Link} from 'react-router-dom'
import {Route} from "../utils/Objects"
import { useEffect, useState } from 'react';
import RouteCard from '../components/RouteCard';
import importExcel from '../utils/Import.js';

export default function Dashboard() {
  const [routes, setRoute] = useState(JSON.parse(localStorage.getItem("routes")) || []); 

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
      <div className="d-flex align-items-center flex-column mt-5">
        <h2>My routes</h2>
        <p>Create a new route or import one.</p>
        <div>
          <button onClick={() => {
            const newRoute = new Route();
            startRoute(newRoute);
          }}>
            Start planning
          </button>
          <input type='file' accept=".xlsx, .xls" onChange={async (e) => {
            const file = e.target.files[0];
            if (file) {
              try {
                const stops = await importExcel(file);
                startRoute(new Route({stops: stops}));
              } catch (error) {
                alert("Error importing Excel file:", error);
              }
            }
          }}/>
        </div>
        <div className="mt-3">
          {
            routes.length != 0
            ?
            routes.map((route, index) => (
              <RouteCard key={index} route={route} 
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
    </>
  )
}
