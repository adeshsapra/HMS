import { useEffect, useState } from 'react'
import AOS from 'aos'
import PageHero from '../components/PageHero'
import { contactAPI } from '../services/api'
import { useToast } from '../context/ToastContext'

const Contact = () => {
  const { success: toastSuccess, error: toastError } = useToast()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    phone: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    })
  }, [])

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required'
    if (!formData.message.trim()) newErrors.message = 'Message is required'
    if (formData.phone && !/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number is invalid'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      toastError('Please fix the errors in the form.')
      return
    }

    setLoading(true)
    try {
      await contactAPI.submitEnquiry(formData)
      toastSuccess('Your message has been sent. Thank you!')
      setFormData({ name: '', email: '', subject: '', message: '', phone: '' })
      setErrors({})
    } catch (err: any) {
      if (err.response?.status === 422 && err.response?.data?.errors) {
        const serverErrors = err.response.data.errors
        const mappedErrors: Record<string, string> = {}
        Object.keys(serverErrors).forEach(key => {
          mappedErrors[key] = Array.isArray(serverErrors[key]) ? serverErrors[key][0] : serverErrors[key]
        })
        setErrors(mappedErrors)
        toastError('Please check the highlighted fields.')
      } else {
        const msg = err.response?.data?.message || 'Something went wrong. Please try again later.'
        toastError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  return (
    <div className="contact-page">
      <style>{`
        .contact-page .form-control {
          border-radius: 12px;
          border: 1px solid color-mix(in srgb, var(--accent-color), transparent 85%);
          padding: 1.2rem 1rem;
          height: auto;
          transition: all 0.3s ease;
          background: #fff;
        }

        .contact-page .form-control:focus {
          border-color: var(--accent-color);
          box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent-color), transparent 90%);
        }

        .contact-page .form-control.is-invalid {
          border-color: #ef4444 !important;
          background-image: none; /* Hide default bootstrap icon */
        }

        .contact-page .form-control.is-invalid:focus {
          box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1) !important;
        }

        .contact-page .invalid-feedback {
          color: #ef4444;
          font-size: 0.85rem;
          margin-top: 0.5rem;
          font-weight: 500;
          display: block; /* Ensure it shows up */
        }

        .contact-page .btn-submit {
          background: var(--accent-color);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-weight: 600;
          font-size: 1.1rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 15px color-mix(in srgb, var(--accent-color), transparent 70%);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .contact-page .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px color-mix(in srgb, var(--accent-color), transparent 60%);
          filter: brightness(1.05);
        }

        .contact-page .btn-submit:active:not(:disabled) {
          transform: translateY(0);
        }

        .contact-page .btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* Floating label support with custom fields */
        .contact-page .form-floating > .form-control:focus ~ label,
        .contact-page .form-floating > .form-control:not(:placeholder-shown) ~ label {
          color: var(--accent-color);
          opacity: 0.8;
        }
      `}</style>
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
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="form-floating mb-3">
                        <input
                          type="text"
                          className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                          id="nameInput"
                          name="name"
                          placeholder="Full Name"
                          value={formData.name}
                          onChange={handleChange}
                        />
                        <label htmlFor="nameInput">Full Name</label>
                        {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-floating mb-3">
                        <input
                          type="email"
                          className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                          id="emailInput"
                          name="email"
                          placeholder="Email Address"
                          value={formData.email}
                          onChange={handleChange}
                        />
                        <label htmlFor="emailInput">Email Address</label>
                        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                      </div>
                    </div>
                  </div>

                  <div className="form-floating mb-3">
                    <input
                      type="tel"
                      className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                      id="phoneInput"
                      name="phone"
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                    <label htmlFor="phoneInput">Phone Number (Optional)</label>
                    {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                  </div>

                  <div className="form-floating mb-3">
                    <input
                      type="text"
                      className={`form-control ${errors.subject ? 'is-invalid' : ''}`}
                      id="subjectInput"
                      name="subject"
                      placeholder="Subject"
                      value={formData.subject}
                      onChange={handleChange}
                    />
                    <label htmlFor="subjectInput">Subject</label>
                    {errors.subject && <div className="invalid-feedback">{errors.subject}</div>}
                  </div>

                  <div className="form-floating mb-3">
                    <textarea
                      className={`form-control ${errors.message ? 'is-invalid' : ''}`}
                      id="messageInput"
                      name="message"
                      rows={5}
                      placeholder="Your Message"
                      style={{ height: '150px' }}
                      value={formData.message}
                      onChange={handleChange}
                    ></textarea>
                    <label htmlFor="messageInput">Your Message</label>
                    {errors.message && <div className="invalid-feedback">{errors.message}</div>}
                  </div>

                  <div className="d-grid mt-4">
                    <button type="submit" className="btn-submit" disabled={loading}>
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message <i className="bi bi-send-fill ms-2"></i>
                        </>
                      )}
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

