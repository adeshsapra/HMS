import { useEffect } from 'react'
import AOS from 'aos'
import PageHero from '../components/PageHero'

const Testimonials = () => {
  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    })
  }, [])

  return (
    <div className="testimonials-page">
      <PageHero
        title="Testimonials"
        description="Hear genuine experiences and feedback from our patients."
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Testimonials' }
        ]}
      />


      <section id="testimonials" className="testimonials section">
        <div className="container" data-aos="fade-up">
          <div className="row">
            <div className="col-12">
              <p>Testimonials content will be displayed here.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Testimonials

