import { useEffect, useState } from 'react'
import AOS from 'aos'
import PageTitle from '../components/PageTitle'

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    })
  }, [])

  const faqs = [
    { q: 'What are your operating hours?', a: 'We are open Monday through Saturday from 9AM to 7PM. Emergency services are available 24/7.' },
    { q: 'Do you accept insurance?', a: 'Yes, we accept most major insurance plans. Please contact us to verify your specific insurance coverage.' },
    { q: 'How do I book an appointment?', a: 'You can book an appointment online through our website, call our appointment line, or visit us in person.' },
    { q: 'What should I bring to my appointment?', a: 'Please bring a valid ID, insurance card, list of current medications, and any relevant medical records.' },
    { q: 'Do you offer telemedicine consultations?', a: 'Yes, we offer telemedicine consultations for certain types of appointments. Please check with our staff when booking.' }
  ]

  return (
    <div className="faq-page">
      <PageTitle
        title="Frequently Asked Questions"
        description="Find answers to common questions about our services."
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'FAQ' }
        ]}
      />

      <section id="faq" className="faq section">
        <div className="container" data-aos="fade-up">
          <div className="row">
            <div className="col-lg-8 mx-auto">
              {faqs.map((faq, idx) => (
                <div key={idx} className={`faq-item ${activeIndex === idx ? 'faq-active' : ''}`}>
                  <h3 onClick={() => setActiveIndex(activeIndex === idx ? null : idx)}>
                    {faq.q}
                    <i className="bi bi-chevron-down"></i>
                  </h3>
                  {activeIndex === idx && <p>{faq.a}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default FAQ

