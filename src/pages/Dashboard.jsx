import {Link} from 'react-router-dom'
import {Route} from "../utils/Objects"
import { useEffect, useState } from 'react';
import RouteCard from '../components/RouteCard';
import importExcel from '../utils/Import.js';
import routeInfo from '../utils/RouteInfo.js';
import {fields} from "../utils/Const.js";
import exportExcel from '../utils/Export.js';

export default function Dashboard() {
  const [routes, setRoute] = useState(JSON.parse(localStorage.getItem("routes")) || []); 
  const [loading, setLoading] = useState(false);
  const [header, setHeader] = useState([]);
  const [dataHeader, setDataHeader] = useState({});
  const [file, setFile] = useState();
  const [headerRow, setHeaderRow] = useState(1);

  useEffect(() => localStorage.setItem("routes", JSON.stringify(routes)), [routes])

  useEffect(() => {
    if (!file) return;
    async function refreshHeader() {
      setHeader(await importExcel({file: file, headersOnly: true, headerRow: headerRow}))
    }
    refreshHeader()
  }, [file, headerRow])

  function startRoute(newRoute) {
    const updatedRoutes = [...routes, newRoute];

    setRoute(updatedRoutes);
    localStorage.setItem("routes", JSON.stringify(updatedRoutes));
    localStorage.setItem("selected", JSON.stringify(newRoute));

    window.location = "/app";
  }

  async function loadRoute(file, header, headerRow) {
    setLoading(true);
    try {
      const stops = await importExcel({file: file, columnHeader: header, headerRow: headerRow});
      const route = await routeInfo(stops.filter(stop => stop.active));
      startRoute(new Route({
        stops: route ? route.stops : stops,
        totalDistance: route && route.distance, 
        totalDuration: route && route.duration, 
        geometry: route && route.geometry,                                                                                                                                                                                                                                                                                                                                                                                                 
        dataHeader: dataHeader
      }));
    } catch (error) {
      alert("Error importing Excel file");
      console.log(error.message);
    } finally {
      setLoading(false)
    }
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
        <div className="d-flex align-items-center flex-column mt-3">
          <h2>My routes</h2>
          <p>Create a new route or import one.</p>
          <div className='container mt-3'>
            <div className='row justify-content-center gy-3'>
              <div className='col-12 col-md-auto d-flex flex-column'>
                <div className='d-flex align-items-center mb-2'>
                  <input id='file-input' type='file' accept=".xlsx, .xls" onChange={async e => {
                    const file = e.target.files[0];
                      if (file) {
                        setFile(file);
                      }
                  }}/>
                  <a type='button' onClick={() => {
                    setDataHeader({});
                    setHeader([]);
                    setFile();
                    setHeaderRow(1);
                    document.getElementById("file-input").value = "";
                  }}><ion-icon name="close"></ion-icon></a>
                </div>
                <div className='mt-auto d-flex justify-content-between'>
                  <div>
                    <label htmlFor='header-input'>Skip row(s)</label>
                    <input placeholder='0' id='header-input' defaultValue={headerRow} style={{width: 40}} type='tel' onChange={e => setHeaderRow(e.target.value)}></input>
                  </div>
                  <button 
                    onClick={() => {
                      file ?
                      loadRoute(file, dataHeader, headerRow)
                      :
                      startRoute(new Route())
                    }}>
                      Start planning
                  </button>
                </div>
              </div>
              {file && <div className='col-12 col-md'>
                <div className='row justify-content-center'>
                  {
                    fields.map(field => (
                      <div key={field.key} className='col-auto'>
                        <b>{field.label}</b><br/>
                        <select 
                          className='select'
                          name={field.key}
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
              </div> }
            </div>
          </div>
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
      }
    </>
  )
}
