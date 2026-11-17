import {Link, useNavigate} from 'react-router-dom'
import {Route} from "../utils/Objects"
import { useEffect, useState } from 'react';
import RouteCard from '../components/RouteCard';
import exportExcel from '../utils/Export.js';

export default function Dashboard() {
  const [routes, setRoute] = useState(JSON.parse(localStorage.getItem("routes")) || []); 

  const navigate = useNavigate();

  useEffect(() => localStorage.setItem("routes", JSON.stringify(routes)), [routes])

  function startRoute(newRoute) {
    const updatedRoutes = [...routes, newRoute];

    setRoute(updatedRoutes);
    
    localStorage.setItem("selected", JSON.stringify(newRoute));

    navigate("/app");
  }

  return (
    <>
      <header>
        <Link to="/" className="d-flex align-items-center">
          <ion-icon name="arrow-back" style={{fontSize: "2rem", marginRight: 5}}></ion-icon>
          <span>Go back</span>
        </Link>
      </header>
      <div className="d-flex align-items-center flex-column mt-3">
        <h2>My routes</h2>
        <p>Create a new route.</p>
        <button className="mt-3" onClick={() => startRoute(new Route())}>
          Start planning
        </button>
        <div className="mt-4">
          {
            routes.length != 0
            ?
            routes.map(route => (
              <RouteCard key={route.createdAt} route={route} 
                onDelete={createdAt => {
                  setRoute(routes.filter(r => r.createdAt !== createdAt));
                }}
                onExport={stops => exportExcel(stops)}
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
