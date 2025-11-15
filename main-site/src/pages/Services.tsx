import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import AOS from 'aos'
import PageTitle from '../components/PageTitle'

const Services = () => {
  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    })
  }, [])

  const services = [
    { icon: 'fa-heartbeat', title: 'Cardiology Services', desc: 'Comprehensive heart and cardiovascular care with state-of-the-art diagnostic and treatment facilities.' },
    { icon: 'fa-brain', title: 'Neurology Services', desc: 'Expert care for brain and nervous system disorders with advanced imaging and treatment options.' },
    { icon: 'fa-bone', title: 'Orthopedic Services', desc: 'Complete musculoskeletal care including joint replacement, sports medicine, and rehabilitation.' },
    { icon: 'fa-baby', title: 'Pediatric Services', desc: 'Specialized healthcare for children from birth through adolescence in a child-friendly environment.' },
    { icon: 'fa-shield-alt', title: 'Oncology Services', desc: 'Comprehensive cancer care with multidisciplinary approach and cutting-edge treatment options.' },
    { icon: 'fa-ambulance', title: 'Emergency Services', desc: '24/7 emergency medical care with rapid response and critical care capabilities.' },
    { icon: 'fa-stethoscope', title: 'General Medicine', desc: 'Primary healthcare services for all ages with preventive care and health maintenance.' },
    { icon: 'fa-x-ray', title: 'Diagnostic Imaging', desc: 'Advanced imaging services including MRI, CT scan, ultrasound, and X-ray facilities.' }
  ]

  return (
    <div className="services-page">
      <PageTitle
        title="Services"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo."
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Category' },
          { label: 'Services' }
        ]}
      />

      <section id="services" className="services section">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row gy-4">
            {services.map((service, idx) => (
              <div key={idx} className="col-lg-6" data-aos="fade-up" data-aos-delay={100 + idx * 100}>
                <div className="service-card">
                  <div className="service-icon">
                    <i className={`fas ${service.icon}`}></i>
                  </div>
                  <div className="service-content">
                    <h3>{service.title}</h3>
                    <p>{service.desc}</p>
                    <Link to="/service-details" className="service-btn">
                      Learn More
                      <i className="fas fa-arrow-right"></i>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Services

