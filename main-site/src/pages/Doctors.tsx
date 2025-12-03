import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import AOS from 'aos'
import PageHero from '../components/PageHero'

const Doctors = () => {
  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    })
  }, [])

  const doctors = [
    { img: 'staff-3.webp', name: 'Dr. Jennifer Martinez', specialty: 'Chief of Cardiology', bio: 'Mauris blandit aliquet elit eget tincidunt nibh pulvinar a. Curabitur arcu erat accumsan id imperdiet et porttitor at.', exp: '15+ Years Experience' },
    { img: 'staff-7.webp', name: 'Dr. Michael Chen', specialty: 'Orthopedic Surgeon', bio: 'Vestibulum ac diam sit amet quam vehicula elementum sed sit amet dui. Nulla quis lorem ut libero malesuada feugiat.', exp: '12+ Years Experience' },
    { img: 'staff-11.webp', name: 'Dr. Sarah Williams', specialty: 'Pediatrician', bio: 'Pellentesque in ipsum id orci porta dapibus. Vivamus magna justo, lacinia eget consectetur sed, convallis at tellus.', exp: '10+ Years Experience' },
    { img: 'staff-1.webp', name: 'Dr. David Thompson', specialty: 'Neurologist', bio: 'Curabitur non nulla sit amet nisl tempus convallis quis ac lectus. Curabitur arcu erat, accumsan id imperdiet et.', exp: '18+ Years Experience' },
    { img: 'staff-5.webp', name: 'Dr. Lisa Anderson', specialty: 'Dermatologist', bio: 'Donec rutrum congue leo eget malesuada. Vivamus suscipit tortor eget felis porttitor volutpat.', exp: '9+ Years Experience' },
    { img: 'staff-9.webp', name: 'Dr. Robert Kim', specialty: 'Oncologist', bio: 'Nulla porttitor accumsan tincidunt. Quisque velit nisi, pretium ut lacinia in, elementum id enim.', exp: '14+ Years Experience' },
    { img: 'staff-12.webp', name: 'Dr. Emily Johnson', specialty: 'Cardiologist', bio: 'Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae.', exp: '11+ Years Experience' },
    { img: 'staff-14.webp', name: 'Dr. James Wilson', specialty: 'General Surgeon', bio: 'Cras ultricies ligula sed magna dictum porta. Curabitur aliquet quam id dui posuere blandit.', exp: '16+ Years Experience' }
  ]

  return (
    <div className="doctors-page">
  <PageHero
  title="Doctors"
  description="Meet our team of skilled and compassionate medical specialists dedicated to your health."
  breadcrumbs={[
    { label: 'Home', path: '/' },
    { label: 'Doctors' }
  ]}
/>

      <section id="doctors" className="doctors section">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row gy-4">
            {doctors.map((doctor, idx) => (
              <div key={idx} className="col-xl-3 col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay={100 + idx * 100}>
                <div className="doctor-card">
                  <div className="doctor-image">
                    <img src={`/assets/img/health/${doctor.img}`} alt={doctor.name} className="img-fluid" />
                    <div className="doctor-overlay">
                      <div className="doctor-social">
                        <a href="#" className="social-link"><i className="bi bi-linkedin"></i></a>
                        <a href="#" className="social-link"><i className="bi bi-twitter"></i></a>
                        <a href="#" className="social-link"><i className="bi bi-envelope"></i></a>
                      </div>
                    </div>
                  </div>
                  <div className="doctor-content">
                    <h4 className="doctor-name">{doctor.name}</h4>
                    <span className="doctor-specialty">{doctor.specialty}</span>
                    <p className="doctor-bio">{doctor.bio}</p>
                    <div className="doctor-experience">
                      <span className="experience-badge">{doctor.exp}</span>
                    </div>
                    <Link to="/appointment" className="btn-appointment">Book Appointment</Link>
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

export default Doctors

