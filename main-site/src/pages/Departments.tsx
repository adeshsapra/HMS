import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import AOS from 'aos'
import PageHero from '../components/PageHero'

const Departments = () => {
  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    })
  }, [])

  const departments = [
    { img: 'cardiology-2.webp', icon: 'bi-heart-pulse', title: 'Cardiology', subtitle: 'Heart & Vascular Care', stat: '500+', statLabel: 'Procedures', desc: 'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna.', highlights: ['Advanced Cardiac Surgery', 'Interventional Cardiology', 'Heart Rhythm Management'] },
    { img: 'dermatology-3.webp', icon: 'bi-shield-plus', title: 'Dermatology', subtitle: 'Skin Health Experts', stat: '1200+', statLabel: 'Treatments', desc: 'Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure.', highlights: ['Cosmetic Dermatology', 'Skin Cancer Treatment', 'Laser Therapy'] },
    { img: 'neurology-4.webp', icon: 'bi-brain', title: 'Neurology', subtitle: 'Brain & Nervous System', stat: '800+', statLabel: 'Cases', desc: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.', highlights: ['Stroke Treatment', 'Epilepsy Management', 'Neurological Rehabilitation'] },
    { img: 'orthopedics-4.webp', icon: 'bi-bone', title: 'Orthopedics', subtitle: 'Musculoskeletal Care', stat: '1500+', statLabel: 'Surgeries', desc: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.', highlights: ['Joint Replacement', 'Sports Medicine', 'Spine Surgery'] },
    { img: 'pediatrics-2.webp', icon: 'bi-heart', title: 'Pediatrics', subtitle: 'Child Healthcare', stat: '2000+', statLabel: 'Patients', desc: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', highlights: ['Child Development', 'Vaccination Programs', 'Pediatric Surgery'] },
    { img: 'oncology-4.webp', icon: 'bi-shield-check', title: 'Oncology', subtitle: 'Cancer Care', stat: '600+', statLabel: 'Treatments', desc: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores.', highlights: ['Chemotherapy', 'Radiation Therapy', 'Surgical Oncology'] }
  ]

  return (
    <div className="departments-page">
      <PageHero
        title="Departments"
        description="Explore our specialized medical departments dedicated to expert and focused care."
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Departments' }
        ]}
      />


      <section id="departments" className="departments section">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row gy-4">
            {departments.map((dept, idx) => (
              <div key={idx} className="col-lg-4" data-aos="zoom-in" data-aos-delay={200 + idx * 150}>
                <div className="department-card">
                  <div className="department-header">
                    <div className="department-icon">
                      <i className={`bi ${dept.icon}`}></i>
                    </div>
                    <h3>{dept.title}</h3>
                    <p className="department-subtitle">{dept.subtitle}</p>
                  </div>
                  <div className="department-image-wrapper">
                    <img src={`/assets/img/health/${dept.img}`} alt={dept.title} className="img-fluid" loading="lazy" />
                    <div className="department-stats">
                      <div className="stat-item">
                        <span className="stat-number">{dept.stat}</span>
                        <span className="stat-label">{dept.statLabel}</span>
                      </div>
                    </div>
                  </div>
                  <div className="department-content">
                    <p>{dept.desc}</p>
                    <ul className="department-highlights">
                      {dept.highlights.map((highlight, hIdx) => (
                        <li key={hIdx}><i className="bi bi-check2"></i> {highlight}</li>
                      ))}
                    </ul>
                    <Link to="/department-details" className="department-link">Learn More</Link>
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

export default Departments

