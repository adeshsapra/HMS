import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import AOS from 'aos'
import PageTitle from '../components/PageTitle'

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
      <PageTitle
        title="About"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo."
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Category' },
          { label: 'About' }
        ]}
      />

      <section id="about" className="about section">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row gy-4">
            <div className="col-lg-6">
              <div className="content">
                <h2>Committed to Excellence in Healthcare</h2>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
                <p>
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum sed ut perspiciatis.
                </p>

                <div className="stats-container" data-aos="fade-up" data-aos-delay="200">
                  <div className="row gy-4">
                    <div className="col-sm-6 col-lg-12 col-xl-6">
                      <div className="stat-item">
                        <div className="stat-number">
                          <span data-purecounter-start="0" data-purecounter-end="25" data-purecounter-duration="1" className="purecounter">25</span>+
                        </div>
                        <div className="stat-label">Years of Experience</div>
                      </div>
                    </div>
                    <div className="col-sm-6 col-lg-12 col-xl-6">
                      <div className="stat-item">
                        <div className="stat-number">
                          <span data-purecounter-start="0" data-purecounter-end="50000" data-purecounter-duration="2" className="purecounter">50000</span>+
                        </div>
                        <div className="stat-label">Patients Treated</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="cta-buttons" data-aos="fade-up" data-aos-delay="300">
                  <Link to="/doctors" className="btn-primary">Meet Our Doctors</Link>
                  <Link to="/services" className="btn-secondary">View Our Services</Link>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="image-section" data-aos="fade-left" data-aos-delay="200">
                <div className="main-image">
                  <img src="/assets/img/health/consultation-3.webp" alt="Healthcare consultation" className="img-fluid" />
                </div>
                <div className="image-grid">
                  <div className="grid-item">
                    <img src="/assets/img/health/facilities-2.webp" alt="Medical facility" className="img-fluid" />
                  </div>
                  <div className="grid-item">
                    <img src="/assets/img/health/staff-5.webp" alt="Medical staff" className="img-fluid" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="certifications-section" data-aos="fade-up" data-aos-delay="400">
            <div className="row">
              <div className="col-lg-12">
                <div className="section-header">
                  <h3>Accreditations &amp; Certifications</h3>
                  <p>We are proud to be accredited by leading healthcare organizations</p>
                </div>
                <div className="certifications-grid">
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <div key={num} className="certification-item">
                      <img src={`/assets/img/clients/clients-${num}.webp`} alt="Certification" className="img-fluid" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About

