import { useEffect, useState, useMemo } from 'react'
import AOS from 'aos'
import PageHero from '../components/PageHero'
import ContentLoader from '../components/ContentLoader'
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
      <style>{`
        .faq-page {
          background-color: #f8fafc;
        }

        /* --- Controls --- */
        .controls-wrapper {
          background: white;
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          margin-bottom: 40px;
        }

        .search-container {
          margin-bottom: 25px;
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 20px;
          color: var(--accent-color);
          font-size: 1.2rem;
        }

        .search-input {
          width: 100%;
          padding: 15px 50px 15px 55px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.3s;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--accent-color);
          box-shadow: 0 0 0 4px rgba(0, 112, 192, 0.1);
        }

        .search-clear {
          position: absolute;
          right: 15px;
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 1.5rem;
          cursor: pointer;
        }

        .category-tabs {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .category-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: #f1f5f9;
          border: 1px solid transparent;
          border-radius: 50px;
          color: #64748b;
          font-weight: 600;
          transition: all 0.3s;
          cursor: pointer;
        }

        .category-tab:hover {
          background: #e2e8f0;
          color: var(--heading-color);
        }

        .category-tab.active {
          background: var(--accent-color);
          color: white;
          box-shadow: 0 4px 12px rgba(0, 112, 192, 0.2);
        }

        /* --- FAQ Items --- */
        .faq-results {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .results-header h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--heading-color);
          margin: 0;
        }

        .faq-item {
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          transition: all 0.3s;
        }

        .faq-item:hover {
          border-color: var(--accent-color);
          box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        }

        .faq-header {
          padding: 20px 25px;
          display: flex;
          align-items: center;
          gap: 20px;
          cursor: pointer;
          user-select: none;
        }

        .faq-icon {
          width: 45px;
          height: 45px;
          background: rgba(0, 112, 192, 0.1);
          color: var(--accent-color);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          flex-shrink: 0;
        }

        .faq-header h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--heading-color);
          margin: 0;
          flex-grow: 1;
        }

        .faq-toggle {
          color: #94a3b8;
          transition: transform 0.3s;
        }

        .faq-active .faq-toggle {
          transform: rotate(180deg);
          color: var(--accent-color);
        }

        .faq-content {
          max-height: 0;
          overflow: hidden;
          transition: all 0.3s ease-out;
          padding: 0 25px 0 90px;
        }

        .faq-active .faq-content {
          max-height: 500px;
          padding: 0 25px 25px 90px;
        }

        .faq-content p {
          color: #64748b;
          line-height: 1.7;
          margin: 0;
        }

        /* --- Contact Card --- */
        .faq-contact-card {
          background: white;
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 15px 40px rgba(0,0,0,0.05);
          position: sticky;
          top: 100px;
        }

        .contact-card-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .card-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, var(--heading-color), var(--accent-color));
          color: white;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
          margin: 0 auto 15px;
        }

        .contact-card-header h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .contact-options {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 30px;
        }

        .contact-option {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .contact-option i {
          width: 40px;
          height: 40px;
          background: #f1f5f9;
          color: var(--accent-color);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
        }

        .contact-option div strong {
          display: block;
          font-size: 0.9rem;
          color: var(--heading-color);
        }

        .contact-option div span {
          font-size: 0.85rem;
          color: #64748b;
        }

        /* --- Responsive --- */
        @media (max-width: 991px) {
          .faq-contact-card {
            position: relative;
            top: 0;
            margin-top: 40px;
          }
          .category-tabs {
            justify-content: flex-start;
          }
        }

        @media (max-width: 768px) {
          .controls-wrapper {
            padding: 20px;
          }
          .faq-header {
            padding: 15px;
          }
          .faq-content {
            padding-left: 15px;
          }
          .faq-active .faq-content {
            padding-left: 15px;
            padding-bottom: 20px;
          }
          .faq-icon {
            display: none;
          }
          .results-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 5px;
          }
        }
      `}</style>
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
                  <ContentLoader message="Preparing knowledge base..." height="300px" />
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
                      <span>support@arovis.com</span>
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
