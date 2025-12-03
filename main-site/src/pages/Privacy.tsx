import AOS from 'aos'
import { useEffect } from 'react'
import PageHero from '../components/PageHero'

const Privacy = () => {
  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    })
  }, [])

  return (
    <div className="privacy-page">
      <PageHero
        title="Privacy Policy"
        description="Understand how we collect, protect, and use your personal information."
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Privacy' }
        ]}
      />


      <section id="privacy" className="privacy section">
        <div className="container" data-aos="fade-up">
          <div className="row">
            <div className="col-lg-8 mx-auto">
              <div className="content">
                <h2>Privacy Policy</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Privacy

