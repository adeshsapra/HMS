import { useEffect } from 'react'
import AOS from 'aos'
import PageHero from '../components/PageHero'

const ServiceDetails = () => {
  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    })
  }, [])

  return (
    <div className="service-details-page">
      <PageHero
        title="Service Details"
        description="Detailed insights into our medical services, treatments, and procedures."
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Services', path: '/services' },
          { label: 'Service Details' }
        ]}
      />


      <section id="service-details" className="service-details section">
        <div className="container" data-aos="fade-up">
          <div className="row">
            <div className="col-lg-8">
              <div className="service-content">
                <h2>Service Overview</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ServiceDetails

