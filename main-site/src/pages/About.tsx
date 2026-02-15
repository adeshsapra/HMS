import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import AOS from 'aos'
import { motion } from 'framer-motion'
import PageHero from '../components/PageHero'
import './about.css'

const About = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    })
  }, [])

  const values = [
    {
      title: "Patient-Centric Care",
      description: "Everything we do revolves around the well-being and comfort of our patients, ensuring they receive the highest standard of personalized medical attention.",
      icon: "bi-heart-pulse-fill"
    },
    {
      title: "Medical Excellence",
      description: "Our team of world-class specialists is committed to continuous learning and implementing the latest breakthroughs in medical science.",
      icon: "bi-award-fill"
    },
    {
      title: "Ethical Integrity",
      description: "We maintain the highest standards of transparency and ethics in healthcare, building lasting trust with the communities we serve.",
      icon: "bi-shield-check"
    }
  ]

  const stats = [
    { value: "25+", label: "Years of Trust", icon: "bi-calendar-check" },
    { value: "150+", label: "Expert Doctors", icon: "bi-person-badge" },
    { value: "50k+", label: "Happy Patients", icon: "bi-emoji-smile" },
    { value: "24/7", label: "Emergency Care", icon: "bi-clock-history" }
  ]

  return (
    <div className="about-page">
      <PageHero
        title="Our Story & Vision"
        description="Pioneering the future of healthcare with a perfect blend of advanced technology and human compassion."
        bgImage="https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=1920&auto=format&fit=crop"
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'About Us' }
        ]}
      />

      {/* --- Section 1: The Core Story --- */}
      <section className="about-section">
        <div className="container">
          <div className="row align-items-center gy-5">
            <div className="col-lg-6" data-aos="fade-right">
              <div className="experience-image-grid">
                <motion.div
                  className="experience-badge shadow-lg"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <span className="number">25</span>
                  <span className="text">Years of<br />Excellence</span>
                </motion.div>
                <img
                  src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop"
                  alt="Modern Hospital"
                  className="img-main shadow"
                />
                <img
                  src="https://images.unsplash.com/photo-1551601651-2a8555f1a136?q=80&w=600&auto=format&fit=crop"
                  alt="Surgery Team"
                  className="img-secondary"
                />
              </div>
            </div>
            <div className="col-lg-6 px-lg-5" data-aos="fade-left">
              <span className="section-subtitle">Since 1998</span>
              <h2 className="section-title">Redefining Healthcare Through <span className="text-gradient">Innovation & Care</span></h2>
              <p className="lead mb-4 fw-medium text-dark">
                We started with a simple belief: that quality healthcare should be accessible, empathetic, and technologically superior.
              </p>
              <p className="text-muted mb-4" style={{ lineHeight: '1.8' }}>
                Over the past two decades, we have evolved from a small clinic into a multi-specialty healthcare institution, equipped with the most advanced diagnostic and surgical technologies available in modern medicine. Our commitment remains the same: putting patients first.
              </p>
              <div className="row g-4 mt-2">
                <div className="col-sm-6">
                  <div className="d-flex align-items-center mb-3">
                    <div className="me-3 p-2 rounded-circle" style={{ backgroundColor: 'var(--about-accent-light)' }}>
                      <i className="bi bi-check2-circle text-primary"></i>
                    </div>
                    <span className="fw-bold text-secondary">ISO 9001 Certified</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <div className="me-3 p-2 rounded-circle" style={{ backgroundColor: 'var(--about-accent-light)' }}>
                      <i className="bi bi-check2-circle text-primary"></i>
                    </div>
                    <span className="fw-bold text-secondary">Robotic Surgery Units</span>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="d-flex align-items-center mb-3">
                    <div className="me-3 p-2 rounded-circle" style={{ backgroundColor: 'var(--about-accent-light)' }}>
                      <i className="bi bi-check2-circle text-primary"></i>
                    </div>
                    <span className="fw-bold text-secondary">Global Referral Hub</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <div className="me-3 p-2 rounded-circle" style={{ backgroundColor: 'var(--about-accent-light)' }}>
                      <i className="bi bi-check2-circle text-primary"></i>
                    </div>
                    <span className="fw-bold text-secondary">Digital Health Records</span>
                  </div>
                </div>
              </div>
              <div className="mt-5">
                <Link to="/services" className="btn btn-primary btn-lg rounded-pill px-5 py-3 shadow-sm hover-lift fw-bold">
                  Explore Our Services <i className="bi bi-arrow-right ms-2"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Section 2: Premium Stats --- */}
      <section className="about-section bg-surface">
        <div className="container">
          <div className="row g-4 justify-content-center">
            {stats.map((stat, index) => (
              <div key={index} className="col-md-6 col-lg-3" data-aos="zoom-in" data-aos-delay={index * 100}>
                <div className="premium-stat-card text-center">
                  <div className="stat-icon mx-auto shadow-sm">
                    <i className={`bi ${stat.icon}`}></i>
                  </div>
                  <div className="stat-info">
                    <h3 className="stat-value">{stat.value}</h3>
                    <p className="stat-title mb-0">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Section 3: Our Core Values --- */}
      <section className="about-section">
        <div className="container">
          <div className="text-center mb-5" data-aos="fade-up">
            <span className="section-subtitle ps-0">Our Philosophy</span>
            <h2 className="section-title">The Values That <span className="text-gradient">Drive Us</span></h2>
            <p className="mx-auto text-muted" style={{ maxWidth: '600px' }}>
              Our values are the heartbeat of our organization, guiding every decision and every interaction with our patients.
            </p>
          </div>
          <div className="row g-4">
            {values.map((v, index) => (
              <div key={index} className="col-lg-4" data-aos="fade-up" data-aos-delay={index * 150}>
                <div className="value-card shadow-sm border-0">
                  <div className="value-icon-circle shadow-sm">
                    <i className={`bi ${v.icon}`}></i>
                  </div>
                  <h4 className="fw-bold mb-3">{v.title}</h4>
                  <p className="text-muted mb-0" style={{ lineHeight: '1.7' }}>{v.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Section 4: Our Heritage --- */}
      <section className="about-section bg-surface">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-5 mb-5 mb-lg-0" data-aos="fade-right">
              <span className="section-subtitle ps-0">Milestones</span>
              <h2 className="section-title">A Journey of <span className="text-gradient">Heritage & Trust</span></h2>
              <p className="text-muted mb-4">
                Since our inception, we have consistently pushed the boundaries of medical care, achieving numerous firsts in the region.
              </p>

              <div className="journey-timeline mt-4">
                {[
                  { year: '1998', title: 'The Foundation', desc: 'Started with a 50-bed multi-specialty unit with a focus on core care.' },
                  { year: '2005', title: 'Specialization Wing', desc: 'Launched dedicated Cardiac and Oncology centers with top specialists.' },
                  { year: '2015', title: 'Tech Revolution', desc: 'Integrated AI-driven diagnostics and pioneered robotic surgery.' },
                  { year: '2024', title: 'Modern HMS Integration', desc: 'Became the region\'s first fully paperless digital healthcare provider.' }
                ].map((item, idx) => (
                  <div className="journey-item d-flex gap-4" key={idx}>
                    <div className="journey-dot shadow-sm">{idx + 1}</div>
                    <div className="journey-content">
                      <h5 className="fw-bold text-primary mb-1">{item.year} - {item.title}</h5>
                      <p className="text-muted small mb-0">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-lg-7" data-aos="fade-left">
              <div className="ps-lg-5">
                <div className="card border-0 shadow-lg rounded-5 overflow-hidden">
                  <div className="bg-image-wrapper position-relative" style={{ height: '350px' }}>
                    <img
                      src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1920&auto=format&fit=crop"
                      alt="Legacy"
                      className="img-fluid w-100 h-100 object-fit-cover"
                    />
                    <div className="position-absolute bottom-0 start-0 p-4 w-100 text-white" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
                      <p className="mb-0 fw-light">MediTrust Research & Development Center</p>
                    </div>
                  </div>
                  <div className="p-5 bg-white">
                    <blockquote className="blockquote mb-0">
                      <svg width="45" height="45" viewBox="0 0 24 24" fill="var(--about-primary)" opacity="0.1" className="mb-3">
                        <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C20.1216 16 21.017 16.8954 21.017 18V21C21.017 22.1046 20.1216 23 19.017 23H16.017C14.9124 23 14.017 22.1046 14.017 21ZM14.017 21L14.017 21ZM14.017 11V8C14.017 6.89543 14.9124 6 16.017 6H19.017C20.1216 6 21.017 6.89543 21.017 8V11C21.017 12.1046 20.1216 13 19.017 13H16.017C14.9124 13 14.017 12.1046 14.017 11ZM2.983 21L2.983 18C2.983 16.8954 3.87843 16 4.983 16H7.983C9.08757 16 9.983 16.8954 9.983 18V21C9.983 22.1046 9.08757 23 7.983 23H4.983C3.87843 23 2.983 22.1046 2.983 21ZM2.983 11V8C2.983 6.89543 3.87843 6 4.983 6H7.983C9.08757 6 9.983 6.89543 9.983 8V11C9.983 12.1046 9.08757 13 7.983 13H4.983C3.87843 13 2.983 12.1046 2.983 11Z" />
                      </svg>
                      <p className="fs-5 text-secondary pe-lg-4" style={{ lineHeight: '1.8', fontStyle: 'italic', color: '#4a5568' }}>
                        "Medicine is not just about treating symptoms; it's about healing lives and restoring hope to families. This is the legacy we build every single day through empathy and excellence."
                      </p>
                      <footer className="blockquote-footer mt-4 text-primary fw-bold">
                        Dr. Alan Richardson, <cite title="Source Title" className="text-muted fw-normal">Founder & Chief Surgeon</cite>
                      </footer>
                    </blockquote>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Section 5: Certificates --- */}
      <section className="about-section py-5">
        <div className="container">
          <div className="text-center mb-5" data-aos="fade-up">
            <h3 className="fw-bold text-secondary">Trusted by Global Institutions</h3>
            <div className="mx-auto" style={{ width: '60px', height: '3px', background: 'var(--about-primary)', marginTop: '10px', borderRadius: '5px' }}></div>
          </div>
          <div className="row justify-content-center align-items-center g-5">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <div key={num} className="col-6 col-md-4 col-lg-2" data-aos="zoom-in" data-aos-delay={num * 50}>
                <div className="text-center p-3 grayscale-hover">
                  <img
                    src={`/assets/img/clients/clients-${num}.webp`}
                    alt="Certification"
                    className="cert-logo img-fluid mx-auto"
                    style={{ maxHeight: '50px' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}

export default About