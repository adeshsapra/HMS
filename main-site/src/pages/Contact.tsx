import { useEffect, useState } from 'react'
import AOS from 'aos'
import PageHero from '../components/PageHero'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSent(false)

    setTimeout(() => {
      setLoading(false)
      setSent(true)
      setFormData({ name: '', email: '', subject: '', message: '' })
    }, 1500)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="contact-page">
      <PageHero
        title="Contact"
        description="Reach out to our support team for assistance, inquiries, or appointment guidance."
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Contact' }
        ]}
      />


      <section id="contact" className="contact section">
        <div className="container">
          <div className="contact-wrapper">
            <div className="contact-info-panel">
              <div className="contact-info-header">
                <h3>Contact Information</h3>
                <p>Dignissimos deleniti accusamus rerum voluptate. Dignissimos rerum sit maiores reiciendis voluptate inventore ut.</p>
              </div>

              <div className="contact-info-cards">
                {[
                  { icon: 'bi-pin-map-fill', title: 'Our Location', text: '4952 Hilltop Dr, Anytown, CA 90210' },
                  { icon: 'bi-envelope-open', title: 'Email Us', text: 'info@example.com' },
                  { icon: 'bi-telephone-fill', title: 'Call Us', text: '+1 (555) 123-4567' },
                  { icon: 'bi-clock-history', title: 'Working Hours', text: 'Monday-Saturday: 9AM - 7PM' }
                ].map((info, idx) => (
                  <div key={idx} className="info-card">
                    <div className="icon-container">
                      <i className={`bi ${info.icon}`}></i>
                    </div>
                    <div className="card-content">
                      <h4>{info.title}</h4>
                      <p>{info.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="social-links-panel">
                <h5>Follow Us</h5>
                <div className="social-icons">
                  <a href="#"><i className="bi bi-facebook"></i></a>
                  <a href="#"><i className="bi bi-twitter-x"></i></a>
                  <a href="#"><i className="bi bi-instagram"></i></a>
                  <a href="#"><i className="bi bi-linkedin"></i></a>
                  <a href="#"><i className="bi bi-youtube"></i></a>
                </div>
              </div>
            </div>

            <div className="contact-form-panel">
              <div className="map-container">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d48389.78314118045!2d-74.006138!3d40.710059!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a22a3bda30d%3A0xb89d1fe6bc499443!2sDowntown%20Conference%20Center!5e0!3m2!1sen!2sus!4v1676961268712!5m2!1sen!2sus"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>

              <div className="form-container">
                <h3>Send Us a Message</h3>
                <p>Lorem ipsum dolor sit amet consectetur adipiscing elit mauris hendrerit faucibus imperdiet nec eget felis.</p>

                <form onSubmit={handleSubmit} className="php-email-form">
                  <div className="form-floating mb-3">
                    <input
                      type="text"
                      className="form-control"
                      id="nameInput"
                      name="name"
                      placeholder="Full Name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                    />
                    <label htmlFor="nameInput">Full Name</label>
                  </div>

                  <div className="form-floating mb-3">
                    <input
                      type="email"
                      className="form-control"
                      id="emailInput"
                      name="email"
                      placeholder="Email Address"
                      required
                      value={formData.email}
                      onChange={handleChange}
                    />
                    <label htmlFor="emailInput">Email Address</label>
                  </div>

                  <div className="form-floating mb-3">
                    <input
                      type="text"
                      className="form-control"
                      id="subjectInput"
                      name="subject"
                      placeholder="Subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                    />
                    <label htmlFor="subjectInput">Subject</label>
                  </div>

                  <div className="form-floating mb-3">
                    <textarea
                      className="form-control"
                      id="messageInput"
                      name="message"
                      rows={5}
                      placeholder="Your Message"
                      style={{ height: '150px' }}
                      required
                      value={formData.message}
                      onChange={handleChange}
                    ></textarea>
                    <label htmlFor="messageInput">Your Message</label>
                  </div>

                  <div className="my-3">
                    {loading && <div className="loading">Loading</div>}
                    {error && <div className="error-message">{error}</div>}
                    {sent && <div className="sent-message">Your message has been sent. Thank you!</div>}
                  </div>

                  <div className="d-grid">
                    <button type="submit" className="btn-submit" disabled={loading}>
                      Send Message <i className="bi bi-send-fill ms-2"></i>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact

