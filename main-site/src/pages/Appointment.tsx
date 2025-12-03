import { useEffect, useState } from 'react'
import AOS from 'aos'
import PageHero from '../components/PageHero'

const Appointment = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    date: '',
    doctor: '',
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

    // Simulate form submission
    setTimeout(() => {
      setLoading(false)
      setSent(true)
      setFormData({
        name: '',
        email: '',
        phone: '',
        department: '',
        date: '',
        doctor: '',
        message: ''
      })
    }, 1500)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="appointment-page">
      <PageHero
        title="Appointment"
        description="Book your medical appointment quickly and receive timely expert care."
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Category' },
          { label: 'Appointment' }
        ]}
      />


      <section id="appointmnet" className="appointmnet section">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row gy-4">
            <div className="col-lg-6">
              <div className="appointment-info">
                <h3>Quick &amp; Easy Online Booking</h3>
                <p className="mb-4">Book your appointment in just a few simple steps. Our healthcare professionals are ready to provide you with the best medical care tailored to your needs.</p>

                <div className="info-items">
                  <div className="info-item d-flex align-items-center mb-3" data-aos="fade-up" data-aos-delay="200">
                    <div className="icon-wrapper me-3">
                      <i className="bi bi-calendar-check"></i>
                    </div>
                    <div>
                      <h5>Flexible Scheduling</h5>
                      <p className="mb-0">Choose from available time slots that fit your busy schedule</p>
                    </div>
                  </div>

                  <div className="info-item d-flex align-items-center mb-3" data-aos="fade-up" data-aos-delay="250">
                    <div className="icon-wrapper me-3">
                      <i className="bi bi-stopwatch"></i>
                    </div>
                    <div>
                      <h5>Quick Response</h5>
                      <p className="mb-0">Get confirmation within 15 minutes of submitting your request</p>
                    </div>
                  </div>

                  <div className="info-item d-flex align-items-center mb-3" data-aos="fade-up" data-aos-delay="300">
                    <div className="icon-wrapper me-3">
                      <i className="bi bi-shield-check"></i>
                    </div>
                    <div>
                      <h5>Expert Medical Care</h5>
                      <p className="mb-0">Board-certified doctors and specialists at your service</p>
                    </div>
                  </div>
                </div>

                <div className="emergency-contact mt-4" data-aos="fade-up" data-aos-delay="350">
                  <div className="emergency-card p-3">
                    <h6 className="mb-2"><i className="bi bi-telephone-fill me-2"></i>Emergency Hotline</h6>
                    <p className="mb-0">Call <strong>+1 (555) 911-4567</strong> for urgent medical assistance</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="appointment-form-wrapper" data-aos="fade-up" data-aos-delay="200">
                <form onSubmit={handleSubmit} className="appointment-form php-email-form">
                  <div className="row gy-3">
                    <div className="col-md-6">
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        placeholder="Your Full Name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        placeholder="Your Email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <input
                        type="tel"
                        name="phone"
                        className="form-control"
                        placeholder="Your Phone Number"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <select
                        name="department"
                        className="form-select"
                        required
                        value={formData.department}
                        onChange={handleChange}
                      >
                        <option value="">Select Department</option>
                        <option value="cardiology">Cardiology</option>
                        <option value="neurology">Neurology</option>
                        <option value="orthopedics">Orthopedics</option>
                        <option value="pediatrics">Pediatrics</option>
                        <option value="dermatology">Dermatology</option>
                        <option value="general">General Medicine</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <input
                        type="date"
                        name="date"
                        className="form-control"
                        required
                        value={formData.date}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <select
                        name="doctor"
                        className="form-select"
                        required
                        value={formData.doctor}
                        onChange={handleChange}
                      >
                        <option value="">Select Doctor</option>
                        <option value="dr-johnson">Dr. Sarah Johnson</option>
                        <option value="dr-martinez">Dr. Michael Martinez</option>
                        <option value="dr-chen">Dr. Lisa Chen</option>
                        <option value="dr-patel">Dr. Raj Patel</option>
                        <option value="dr-williams">Dr. Emily Williams</option>
                        <option value="dr-thompson">Dr. David Thompson</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <textarea
                        className="form-control"
                        name="message"
                        rows={5}
                        placeholder="Please describe your symptoms or reason for visit (optional)"
                        value={formData.message}
                        onChange={handleChange}
                      ></textarea>
                    </div>

                    <div className="col-12">
                      {loading && <div className="loading">Loading</div>}
                      {error && <div className="error-message">{error}</div>}
                      {sent && <div className="sent-message">Your appointment request has been sent successfully. We will contact you shortly!</div>}

                      <button type="submit" className="btn btn-appointment w-100" disabled={loading}>
                        <i className="bi bi-calendar-plus me-2"></i>Book Appointment
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="process-steps mt-5" data-aos="fade-up" data-aos-delay="300">
            <div className="row text-center gy-4">
              {[
                { num: 1, icon: 'bi-person-fill', title: 'Fill Details', desc: 'Provide your personal information and select your preferred department' },
                { num: 2, icon: 'bi-calendar-event', title: 'Choose Date', desc: 'Select your preferred date and time slot from available options' },
                { num: 3, icon: 'bi-check-circle', title: 'Confirmation', desc: 'Receive instant confirmation and appointment details via email or SMS' },
                { num: 4, icon: 'bi-heart-pulse', title: 'Get Treatment', desc: 'Visit our clinic at your scheduled time and receive quality healthcare' }
              ].map((step) => (
                <div key={step.num} className="col-lg-3 col-md-6">
                  <div className="step-item">
                    <div className="step-number">{step.num}</div>
                    <div className="step-icon">
                      <i className={step.icon}></i>
                    </div>
                    <h5>{step.title}</h5>
                    <p>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Appointment

