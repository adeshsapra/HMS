import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import AOS from 'aos'

const NotFound = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true
    })
  }, [])

  return (
    <div className="not-found-wrapper">
      <style>{`
        .not-found-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at top right, rgba(4, 158, 187, 0.05), transparent),
                      radial-gradient(circle at bottom left, rgba(24, 68, 76, 0.05), transparent);
          padding: 40px 20px;
          position: relative;
          overflow: hidden;
        }

        .not-found-content {
          max-width: 600px;
          width: 100%;
          text-align: center;
          position: relative;
          z-index: 2;
        }

        .error-code {
          font-size: clamp(8rem, 20vw, 15rem);
          font-weight: 900;
          line-height: 1;
          margin-bottom: 0;
          background: linear-gradient(135deg, #18444c 0%, #049ebb 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 20px 30px rgba(4, 158, 187, 0.1));
          letter-spacing: -5px;
        }

        .error-title {
          font-size: 2rem;
          font-weight: 800;
          color: #18444c;
          margin-bottom: 15px;
        }

        .error-description {
          font-size: 1.1rem;
          color: #64748b;
          margin-bottom: 40px;
          line-height: 1.6;
        }

        .action-group {
          display: flex;
          gap: 15px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-home {
          padding: 14px 35px;
          background: #049ebb;
          color: white;
          border-radius: 50px;
          font-weight: 700;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 10px 20px rgba(4, 158, 187, 0.2);
          transition: all 0.3s ease;
        }

        .btn-home:hover {
          background: #18444c;
          color: white;
          transform: translateY(-3px);
          box-shadow: 0 15px 30px rgba(24, 68, 76, 0.2);
        }

        .btn-secondary-link {
          padding: 14px 30px;
          background: white;
          color: #18444c;
          border-radius: 50px;
          font-weight: 600;
          text-decoration: none;
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
        }

        .btn-secondary-link:hover {
          background: #f8fafc;
          border-color: #049ebb;
          color: #049ebb;
        }

        .help-links {
          margin-top: 60px;
          padding-top: 40px;
          border-top: 1px dashed #e2e8f0;
        }

        .help-links h6 {
          font-weight: 700;
          color: #18444c;
          margin-bottom: 20px;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .quick-nav {
          display: flex;
          justify-content: center;
          gap: 25px;
          flex-wrap: wrap;
        }

        .quick-nav a {
          color: #64748b;
          text-decoration: none;
          font-size: 0.95rem;
          font-weight: 500;
          transition: color 0.2s;
        }

        .quick-nav a:hover {
          color: #049ebb;
        }

        /* Decorative elements */
        .circle-blur {
          position: absolute;
          width: 400px;
          height: 400px;
          background: rgba(4, 158, 187, 0.05);
          filter: blur(100px);
          border-radius: 50%;
          z-index: 1;
        }

        .circle-1 { top: -100px; right: -100px; }
        .circle-2 { bottom: -100px; left: -100px; }
      `}</style>

      <div className="circle-blur circle-1"></div>
      <div className="circle-blur circle-2"></div>

      <div className="not-found-content" data-aos="zoom-in">
        <div className="error-visual">
          <h1 className="error-code">404</h1>
        </div>
        <h2 className="error-title">Oops! Page Lost in the Hallway</h2>
        <p className="error-description">
          It looks like the page you're searching for has been moved or doesn't exist.
          Don't worry, even the best patients sometimes lose their way!
        </p>

        <div className="action-group">
          <Link to="/" className="btn-home">
            <i className="bi bi-house-door-fill"></i> Back to Homepage
          </Link>
          <Link to="/contact" className="btn-secondary-link">
            Report an Issue
          </Link>
        </div>

        <div className="help-links">
          <h6>Looking for something else?</h6>
          <div className="quick-nav">
            <Link to="/doctors">Find a Doctor</Link>
            <Link to="/services">Services</Link>
            <Link to="/quickappointment">Book Appointment</Link>
            <Link to="/faq">Help Center</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound

