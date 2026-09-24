import {Link} from 'react-router-dom'

export default function Dashboard() {
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

          }} 
          className="button" style={{marginRight: 10}}>Create new route</button>
          <button className="button">Import route</button>
        </div>
        <div className="mt-5">
          {
            
          }
        </div>
      </div>
    </>
  )
}
