import {Link, useNavigate} from 'react-router-dom'
import {Route} from "../utils/Objects"
import { useEffect, useState } from 'react';
import RouteCard from '../components/RouteCard';
import exportExcel from '../utils/Export.js';
import {addRouteAndSelect, deleteRoute, getRoutes, selectRoute} from '../utils/RouteStorage.js';

export default function Dashboard() {
  const [routes, setRoute] = useState([]);
  const [routesReady, setRoutesReady] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    async function loadRoutes() {
      try {
        setRoute(await getRoutes());
      } catch (error) {
        alert("Error loading saved routes: " + error.message);
      } finally {
        setRoutesReady(true);
      }
    }
    loadRoutes();
  }, []);

  async function startRoute(newRoute) {
    try {
      await addRouteAndSelect(newRoute);
      setRoute(previous => [...previous, newRoute]);
    } catch (error) {
      alert("Error creating route: " + error.message);
      return;
    }
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
        <button className="mt-3" disabled={!routesReady} onClick={() => startRoute(new Route())}>
          Start planning
        </button>
        <div className="mt-4">
          {
            !routesReady
            ?
            <p>Loading routes...</p>
            : routes.length != 0
            ?
            routes.map(route => (
              <RouteCard key={route.createdAt} route={route} 
                onOpen={async () => {
                  try {
                    await selectRoute(route);
                    navigate("/app");
                  } catch (error) {
                    alert("Error opening route: " + error.message);
                  }
                }}
                onDelete={async createdAt => {
                  try {
                    await deleteRoute(createdAt);
                    setRoute(previous => previous.filter(r => r.createdAt !== createdAt));
                  } catch (error) {
                    alert("Error deleting route: " + error.message);
                  }
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
