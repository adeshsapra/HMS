import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AOS from 'aos'
import PageHero from '../components/PageHero'
import Pagination from '../components/Pagination'
import { serviceAPI } from '../services/api'

interface Service {
  id: number
  name: string
  description: string
  price: string | number  // Backend may return as string
  category?: string
  icon?: string
  duration?: string | number  // Backend may return as string
  department?: {
    id: number
    name: string
  }
}

const Services = () => {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [from, setFrom] = useState(0)
  const [to, setTo] = useState(0)
  const perPage = 8

  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    })
    fetchServices()
  }, [currentPage])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const response = await serviceAPI.getAll(currentPage, perPage)
      if (response.data.success && response.data.data) {
        // Check if response is paginated
        if (response.data.meta) {
          setServices(response.data.data)
          setTotalPages(response.data.meta.last_page || 1)
          setTotalRecords(response.data.meta.total || 0)
          setFrom(response.data.meta.from || 0)
          setTo(response.data.meta.to || 0)
        } else {
          // Fallback for non-paginated response
          setServices(response.data.data)
          setTotalRecords(response.data.data.length)
          setTotalPages(1)
        }
      }
    } catch (error) {
      console.error('Failed to fetch services:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(services.map(s => s.category).filter(Boolean))) as string[]]

  // Filter services (Note: With pagination, filtering should ideally be done server-side)
  const filteredServices = services.filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="services-page">
      <style>{`
        /* --- General Layout --- */
        .section-bg {
          background-color: #f9fbfb;
        }
        
        /* --- Sidebar Styles --- */
        .sidebar-wrapper {
          position: sticky;
          top: 100px;
          background: var(--surface-color);
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 5px 25px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(0,0,0,0.03);
        }

        .sidebar-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--heading-color);
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid rgba(4, 158, 187, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .search-box {
          position: relative;
          margin-bottom: 30px;
        }

        .search-box input {
          width: 100%;
          padding: 12px 15px 12px 45px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          font-size: 0.95rem;
          transition: all 0.3s;
        }

        .search-box input:focus {
          border-color: var(--accent-color);
          box-shadow: 0 0 0 4px rgba(4, 158, 187, 0.1);
          outline: none;
        }

        .search-box i {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #999;
        }

        .category-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .category-item {
          margin-bottom: 10px;
        }

        .category-btn {
          width: 100%;
          text-align: left;
          background: none;
          border: 1px solid transparent;
          padding: 10px 15px;
          border-radius: 6px;
          color: var(--default-color);
          font-weight: 500;
          transition: all 0.3s ease;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .category-btn:hover {
          background-color: rgba(4, 158, 187, 0.05);
          color: var(--accent-color);
          padding-left: 20px;
        }

        .category-btn.active {
          background-color: var(--accent-color);
          color: #fff;
          box-shadow: 0 4px 10px rgba(4, 158, 187, 0.3);
        }

        /* --- Service Card Styles --- */
        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }
        
        .results-count {
          color: #666;
          font-size: 0.9rem;
        }

        .service-card {
          background: var(--surface-color);
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 0 20px rgba(0,0,0,0.04);
          transition: all 0.4s ease;
          height: 100%;
          border: 1px solid #f0f0f0;
          position: relative;
          overflow: hidden;
        }

        .service-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(90deg, var(--accent-color), var(--heading-color));
          transform: scaleX(0);
          transition: transform 0.4s ease;
        }

        .service-card:hover::before {
          transform: scaleX(1);
        }

        .service-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 15px 30px rgba(4, 158, 187, 0.15);
          border-color: var(--accent-color);
        }

        .service-icon {
          width: 70px;
          height: 70px;
          background: linear-gradient(135deg, var(--accent-color), var(--heading-color));
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          font-size: 2rem;
          margin-bottom: 20px;
          box-shadow: 0 5px 20px rgba(4, 158, 187, 0.3);
          transition: all 0.3s;
        }

        .service-card:hover .service-icon {
          transform: scale(1.1) rotate(5deg);
        }

        .service-content h3 {
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--heading-color);
          margin-bottom: 10px;
        }

        .service-meta {
          display: flex;
          gap: 15px;
          margin-bottom: 15px;
          flex-wrap: wrap;
        }

        .service-badge {
          padding: 4px 12px;
          border-radius: 50px;
          font-size: 0.75rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        .badge-category {
          background: rgba(4, 158, 187, 0.1);
          color: var(--accent-color);
        }

        .badge-price {
          background: rgba(40, 167, 69, 0.1);
          color: #28a745;
        }

        .badge-duration {
          background: rgba(255, 193, 7, 0.1);
          color: #ffc107;
        }

        .badge-department {
          background: rgba(108, 117, 125, 0.1);
          color: #6c757d;
        }

        .service-content p {
          color: #666;
          font-size: 0.95rem;
          line-height: 1.7;
          margin-bottom: 20px;
        }

        .service-btn {
          display: inline-flex;
          align-items: center;
          color: var(--heading-color);
          font-weight: 600;
          text-decoration: none;
          transition: 0.3s;
        }

        .service-btn i {
          margin-left: 6px;
          transition: 0.3s;
        }

        .service-btn:hover {
          color: var(--accent-color);
        }

        .service-btn:hover i {
          margin-left: 10px;
        }

        /* --- Loading & Empty States --- */
        .loading-spinner {
          text-align: center;
          padding: 60px;
        }

        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid var(--accent-color);
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .no-results {
          text-align: center;
          padding: 50px;
          background: #fff;
          border-radius: 12px;
          border: 1px dashed #ddd;
        }
      `}</style>

      <PageHero
        title="Services"
        description="Discover a wide range of advanced medical services designed for complete patient care."
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Services' }
        ]}
      />

      <section id="services" className="services section section-bg">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row">

            {/* --- Left Sidebar Filter --- */}
            <div className="col-lg-3 mb-5 mb-lg-0">
              <div className="sidebar-wrapper">
                <div className="sidebar-title">
                  Filter Services
                  <i className="bi bi-sliders2"></i>
                </div>

                {/* Search */}
                <div className="search-box">
                  <i className="bi bi-search"></i>
                  <input
                    type="text"
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Categories */}
                <div className="sidebar-title" style={{ fontSize: '1rem', marginTop: '10px' }}>
                  Categories
                </div>
                <ul className="category-list">
                  {categories.map((cat, idx) => (
                    <li key={idx} className="category-item">
                      <button
                        className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(cat)}
                      >
                        {cat}
                        {selectedCategory === cat && <i className="bi bi-check-lg"></i>}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* --- Right Content Grid --- */}
            <div className="col-lg-9">
              <div className="results-header">
                <h4 className="m-0 fw-bold text-dark">
                  {selectedCategory === 'All' ? 'All Services' : `${selectedCategory} Services`}
                </h4>
                <span className="results-count">
                  Showing {filteredServices.length} result{filteredServices.length !== 1 ? 's' : ''}
                </span>
              </div>

              {loading ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <p className="text-muted">Loading services...</p>
                </div>
              ) : filteredServices.length > 0 ? (
                <>
                  <div className="row gy-4">
                    {filteredServices.map((service, idx) => (
                      <div key={service.id} className="col-lg-6" data-aos="fade-up" data-aos-delay={100 + idx * 50}>
                        <div className="service-card">
                          <div className="service-icon">
                            <i className={`bi ${service.icon || 'bi-heart-pulse'}`}></i>
                          </div>

                          <div className="service-content">
                            <h3>{service.name}</h3>

                            <div className="service-meta">
                              {service.category && (
                                <span className="service-badge badge-category">
                                  <i className="bi bi-tag-fill"></i>
                                  {service.category}
                                </span>
                              )}
                              <span className="service-badge badge-price">
                                <i className="bi bi-currency-dollar"></i>
                                ${typeof service.price === 'number' ? service.price.toFixed(2) : parseFloat(service.price).toFixed(2)}
                              </span>
                              {service.duration && (
                                <span className="service-badge badge-duration">
                                  <i className="bi bi-clock"></i>
                                  {service.duration} min
                                </span>
                              )}
                              {service.department && (
                                <span className="service-badge badge-department">
                                  <i className="bi bi-building"></i>
                                  {service.department.name}
                                </span>
                              )}
                            </div>

                            <p>{service.description}</p>

                            <Link to={`/service-details/${service.id}`} className="service-btn">
                              Learn More
                              <i className="bi bi-arrow-right"></i>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination Component */}
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalRecords={totalRecords}
                    perPage={perPage}
                    onPageChange={handlePageChange}
                    from={from}
                    to={to}
                  />
                </>
              ) : (
                <div className="no-results">
                  <i className="bi bi-search display-4 text-muted mb-3"></i>
                  <h4>No services found</h4>
                  <p className="text-muted">Try adjusting your search or category filter.</p>
                  <button
                    className="btn btn-outline-dark mt-2"
                    onClick={() => { setSearchTerm(''); setSelectedCategory('All'); setCurrentPage(1); }}
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}

export default Services
