import { useEffect, useState, useMemo } from 'react'
import AOS from 'aos'
import PageHero from '../components/PageHero'
import { faqAPI } from '../services/api'

interface FaqItem {
  id: number;
  question: string;
  answer: string;
  category_id: number;
  category: {
    id: number;
    name: string;
  };
  icon?: string;
}

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [faqs, setFaqs] = useState<FaqItem[]>([])
  const [loading, setLoading] = useState(true)

  const categoryIcons: any = {
    general: 'bi-info-circle',
    appointments: 'bi-calendar-check',
    services: 'bi-gear',
    insurance: 'bi-shield-check',
    billing: 'bi-cash',
    medical: 'bi-heart-pulse',
    facility: 'bi-hospital'
  }

  const faqCategories = useMemo(() => {
    const uniqueCategoryNames = Array.from(new Set(faqs.map(faq => faq.category?.name)))
      .filter(name => name); // Filter out empty/null categories

    return [
      { id: 'all', label: 'All Questions', icon: 'bi-grid' },
      ...uniqueCategoryNames.map(name => ({
        id: name.toLowerCase(),
        label: name,
        icon: categoryIcons[name.toLowerCase()] || 'bi-question-circle'
      }))
    ];
  }, [faqs])

  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    })
    fetchFaqs()
  }, [])

  const fetchFaqs = async () => {
    try {
      const response = await faqAPI.getAll()
      if (response.data.status) {
        setFaqs(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = activeCategory === 'all' || faq.category?.name?.toLowerCase() === activeCategory.toLowerCase()
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
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading questions...</p>
                  </div>
                ) : filteredFaqs.length === 0 ? (
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
                            <i className={`bi ${categoryIcons[faq.category?.name?.toLowerCase()] || 'bi-question-circle'}`}></i>
                          </div>
                          <h3>{faq.question}</h3>
                          <div className="faq-toggle">
                            <i className="bi bi-chevron-down"></i>
                          </div>
                        </div>
                        <div className="faq-content">
                          <p>{faq.answer}</p>
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

