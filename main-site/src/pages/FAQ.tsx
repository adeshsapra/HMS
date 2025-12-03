import { useEffect, useState } from 'react'
import AOS from 'aos'
import PageHero from '../components/PageHero'

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    })
  }, [])

  const faqCategories = [
    { id: 'all', label: 'All Questions', icon: 'bi-grid' },
    { id: 'general', label: 'General', icon: 'bi-info-circle' },
    { id: 'appointments', label: 'Appointments', icon: 'bi-calendar-check' },
    { id: 'services', label: 'Services', icon: 'bi-gear' },
    { id: 'insurance', label: 'Insurance', icon: 'bi-shield-check' }
  ]

  const faqs = [
    {
      id: 1,
      category: 'general',
      icon: 'bi-clock',
      q: 'What are your operating hours?',
      a: 'We are open Monday through Saturday from 9AM to 7PM. Emergency services are available 24/7. Our dedicated emergency team ensures round-the-clock care for critical situations.'
    },
    {
      id: 2,
      category: 'insurance',
      icon: 'bi-shield-check',
      q: 'Do you accept insurance?',
      a: 'Yes, we accept most major insurance plans including Blue Cross, Aetna, Cigna, and UnitedHealthcare. Please contact our billing department to verify your specific insurance coverage and any associated costs.'
    },
    {
      id: 3,
      category: 'appointments',
      icon: 'bi-calendar-event',
      q: 'How do I book an appointment?',
      a: 'You can book an appointment through multiple convenient channels: online via our patient portal, by calling our appointment line at (555) 123-4567, or by visiting us in person. Same-day appointments are available for urgent care needs.'
    },
    {
      id: 4,
      category: 'appointments',
      icon: 'bi-clipboard-check',
      q: 'What should I bring to my appointment?',
      a: 'Please bring a valid photo ID, your insurance card, a complete list of current medications with dosages, any relevant medical records, and previous test results. Arrive 15 minutes early to complete necessary paperwork.'
    },
    {
      id: 5,
      category: 'services',
      icon: 'bi-camera-video',
      q: 'Do you offer telemedicine consultations?',
      a: 'Yes, we offer comprehensive telemedicine consultations for follow-up visits, prescription renewals, and certain types of consultations. Our secure video platform ensures HIPAA-compliant virtual care from the comfort of your home.'
    },
    {
      id: 6,
      category: 'general',
      icon: 'bi-geo-alt',
      q: 'Where are you located?',
      a: 'Our main facility is located at 123 Medical Center Drive, Healthcare City, HC 12345. We also have satellite clinics in downtown and suburban locations for your convenience.'
    },
    {
      id: 7,
      category: 'services',
      icon: 'bi-heart-pulse',
      q: 'What specialties do you offer?',
      a: 'We offer comprehensive healthcare services including cardiology, oncology, neurology, orthopedics, pediatrics, emergency medicine, and primary care. Our multidisciplinary team provides integrated care for all your health needs.'
    },
    {
      id: 8,
      category: 'insurance',
      icon: 'bi-cash',
      q: 'What are your payment options?',
      a: 'We accept all major credit cards, debit cards, and HSA/FSA cards. For uninsured patients, we offer flexible payment plans and financial assistance programs. Contact our billing office for detailed information about costs and payment arrangements.'
    }
  ]

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.a.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="faq-page">
      <PageHero
  title="Frequently Asked Questions"
  description="Quick answers to common queries about our hospital and services."
  breadcrumbs={[
    { label: 'Home', path: '/' },
    { label: 'FAQ' }
  ]}
/>


      {/* Search and Filter Section */}
      <section className="faq-controls section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="controls-wrapper" data-aos="fade-up">
                {/* Search Bar */}
                <div className="search-container">
                  <div className="search-input-wrapper">
                    <i className="bi bi-search search-icon"></i>
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Search for questions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <button
                        className="search-clear"
                        onClick={() => setSearchTerm('')}
                      >
                        <i className="bi bi-x"></i>
                      </button>
                    )}
                  </div>
                </div>

                {/* Category Tabs */}
                <div className="category-tabs">
                  {faqCategories.map(category => (
                    <button
                      key={category.id}
                      className={`category-tab ${activeCategory === category.id ? 'active' : ''}`}
                      onClick={() => setActiveCategory(category.id)}
                    >
                      <i className={`bi ${category.icon}`}></i>
                      <span>{category.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="faq section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="faq-results" data-aos="fade-up">
                {filteredFaqs.length === 0 ? (
                  <div className="no-results">
                    <i className="bi bi-search"></i>
                    <h3>No questions found</h3>
                    <p>Try adjusting your search terms or browse all categories.</p>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setSearchTerm('')
                        setActiveCategory('all')
                      }}
                    >
                      View All Questions
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="results-header">
                      <h3>
                        {activeCategory === 'all' ? 'All Questions' :
                         faqCategories.find(cat => cat.id === activeCategory)?.label}
                        {searchTerm && ` - "${searchTerm}"`}
                      </h3>
                      <span className="results-count">
                        {filteredFaqs.length} question{filteredFaqs.length !== 1 ? 's' : ''} found
                      </span>
                    </div>
                    {filteredFaqs.map((faq, idx) => (
                      <div
                        key={faq.id}
                        className={`faq-item ${activeIndex === idx ? 'faq-active' : ''}`}
                      >
                        <div
                          className="faq-header"
                          onClick={() => setActiveIndex(activeIndex === idx ? null : idx)}
                          data-aos="fade-up"
                          data-aos-delay={idx * 50}
                        >
                          <div className="faq-icon">
                            <i className={`bi ${faq.icon}`}></i>
                          </div>
                          <h3>{faq.q}</h3>
                          <div className="faq-toggle">
                            <i className="bi bi-chevron-down"></i>
                          </div>
                        </div>
                        <div className="faq-content">
                          <p>{faq.a}</p>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Contact Card */}
            <div className="col-lg-4">
              <div className="faq-contact-card" data-aos="fade-up" data-aos-delay="300">
                <div className="contact-card-header">
                  <div className="card-icon">
                    <i className="bi bi-headset"></i>
                  </div>
                  <h3>Still Need Help?</h3>
                  <p>Our support team is here to assist you with any questions.</p>
                </div>
                <div className="contact-options">
                  <div className="contact-option">
                    <i className="bi bi-telephone"></i>
                    <div>
                      <strong>Call Us</strong>
                      <span>(555) 123-4567</span>
                    </div>
                  </div>
                  <div className="contact-option">
                    <i className="bi bi-envelope"></i>
                    <div>
                      <strong>Email Support</strong>
                      <span>support@meditrust.com</span>
                    </div>
                  </div>
                  <div className="contact-option">
                    <i className="bi bi-chat-dots"></i>
                    <div>
                      <strong>Live Chat</strong>
                      <span>Available 24/7</span>
                    </div>
                  </div>
                </div>
                <div className="contact-cta">
                  <button className="btn btn-primary w-100">
                    <i className="bi bi-chat-dots"></i>
                    Start Live Chat
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default FAQ

