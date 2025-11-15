import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="not-found-page">
      <section id="404" className="error-404 section">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 text-center">
              <h1>404</h1>
              <h2>Page Not Found</h2>
              <p>The page you are looking for does not exist.</p>
              <Link to="/" className="btn btn-primary">Go Back Home</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default NotFound

