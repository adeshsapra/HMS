import AOS from 'aos'
import PageTitle from '../components/PageTitle'
import { useEffect } from 'react'

const Terms = () => {
  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    })
  }, [])

  return (
    <div className="terms-page">
      <PageTitle
        title="Terms of Service"
        description="Please read our terms and conditions."
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Terms' }
        ]}
      />

      <section id="terms" className="terms section">
        <div className="container" data-aos="fade-up">
          <div className="row">
            <div className="col-lg-8 mx-auto">
              <div className="content">
                <h2>Terms of Service</h2>
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

export default Terms

