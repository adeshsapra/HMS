import { useEffect } from 'react'
import AOS from 'aos'
import PageHero from '../components/PageHero'

const DepartmentDetails = () => {
  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    })
  }, [])

  return (
    <div className="department-details-page">
      <PageHero
  title="Department Details"
  description="Learn more about our specialized departments and the expert care they provide."
  breadcrumbs={[
    { label: 'Home', path: '/' },
    { label: 'Departments', path: '/departments' },
    { label: 'Department Details' }
  ]}
/>


      <section id="department-details" className="department-details section">
        <div className="container" data-aos="fade-up">
          <div className="row">
            <div className="col-lg-8">
              <div className="department-content">
                <h2>Department Overview</h2>
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

export default DepartmentDetails

