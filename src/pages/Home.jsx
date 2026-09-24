import LOGO from '/logo.svg'
import {Link} from 'react-router-dom'

export default function Home() {
    return (
        <>
            <header className="text-end">
                <a href="https://github.com/medojanos/Vektor" target="_blank">GitHub</a>
            </header>
            <div className="d-flex align-items-center justify-content-center flex-grow-1 flex-column">
                <img width={300} src={LOGO}></img>
                <Link to="/dashboard"><button className="button mt-5 fw-bold">Open dashboard</button></Link>
            </div>
        </>
    )
}