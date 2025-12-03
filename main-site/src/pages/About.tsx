import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import AOS from 'aos'
// Note: Ensure the path is correct based on where you saved the component
import PageHero from '../components/PageHero' 

const About = () => {
  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    })
  }, [])

  return (
    <div className="about-page">
      <PageHero
        title="About Us"
        description="Dedicated to providing world-class healthcare with compassion and excellence."
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'About' }
        ]}
      />

      <section id="about" className="about section">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row gy-4">
            <div className="col-lg-6">
              <div className="content">
                <span className="sub-heading" style={{color: '#1b55e2', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px'}}>Who We Are</span>
                <h2 style={{marginTop: '10px', marginBottom: '20px'}}>Committed to Excellence in Healthcare</h2>
                <p>
                  We are a leading healthcare provider focused on ensuring that every patient receives personalized care. Our hospital management system ensures seamless operations, allowing our doctors to focus on what matters most—saving lives.
                </p>
                <p className="mb-4">
                  From advanced diagnostic centers to specialized surgical units, we combine technology with human expertise to deliver the best medical outcomes.
                </p>

                <div className="stats-container" data-aos="fade-up" data-aos-delay="200">
                  <div className="row gy-4">
                    <div className="col-sm-6 col-lg-12 col-xl-6">
                      <div className="stat-item p-3 border rounded shadow-sm">
                        <div className="stat-number text-primary fw-bold h3">
                          <span className="purecounter">25</span>+
                        </div>
                        <div className="stat-label text-muted">Years of Experience</div>
                      </div>
                    </div>
                    <div className="col-sm-6 col-lg-12 col-xl-6">
                      <div className="stat-item p-3 border rounded shadow-sm">
                        <div className="stat-number text-primary fw-bold h3">
                          <span className="purecounter">50k</span>+
                        </div>
                        <div className="stat-label text-muted">Patients Treated</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="cta-buttons mt-4" data-aos="fade-up" data-aos-delay="300">
                  <Link to="/doctors" className="btn btn-primary me-3 px-4 py-2">Meet Our Doctors</Link>
                  <Link to="/services" className="btn btn-outline-primary px-4 py-2">View Services</Link>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="image-section position-relative" data-aos="fade-left" data-aos-delay="200">
                {/* Ensure these paths exist in your project */}
                <div className="main-image">
                  <img src="/assets/img/health/consultation-3.webp" alt="Healthcare consultation" className="img-fluid rounded-3 shadow" />
                </div>
                {/* 
                   Optional: styling for the grid items if needed. 
                   Standard Bootstrap 'img-fluid' works, but you might want margins 
                */}
                <div className="image-grid row mt-3">
                  <div className="col-6">
                    <img src="/assets/img/health/facilities-2.webp" alt="Medical facility" className="img-fluid rounded-3 shadow-sm" />
                  </div>
                  <div className="col-6">
                    <img src="/assets/img/health/staff-5.webp" alt="Medical staff" className="img-fluid rounded-3 shadow-sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="certifications-section mt-5 pt-5" data-aos="fade-up" data-aos-delay="400">
            <div className="text-center mb-4">
              <h3>Accreditations &amp; Certifications</h3>
              <p className="text-muted">We are proud to be accredited by leading healthcare organizations</p>
            </div>
            
            <div className="row justify-content-center align-items-center g-4">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <div key={num} className="col-4 col-md-2 text-center">
                  <img 
                    src={`/assets/img/clients/clients-${num}.webp`} 
                    alt="Certification" 
                    className="img-fluid opacity-75 hover-opacity-100" 
                    style={{maxHeight: '60px', transition: '0.3s'}}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About