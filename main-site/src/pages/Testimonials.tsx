import { useEffect } from 'react'
import AOS from 'aos'
import PageTitle from '../components/PageTitle'

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
      <PageTitle
        title="Testimonials"
        description="What our patients say about us."
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

