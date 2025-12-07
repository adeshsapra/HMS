import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AOS from 'aos'
import PageHero from '../components/PageHero'
import { departmentAPI } from '../services/api'

interface Department {
  id: number
  name: string
  description: string
  head_of_department?: string
  icon?: string
  image?: string
  category?: string
  subtitle?: string
}

const Departments = () => {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    })
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    try {
      setLoading(true)
      const response = await departmentAPI.getAll()
      if (response.data.success && response.data.data) {
        setDepartments(response.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch departments:', error)
    } finally {
      setLoading(false)
    }
  }

  const getImageUrl = (path: string) => {
    if (!path) return 'https://via.placeholder.com/400x220?text=Department';
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    const rootUrl = baseUrl.replace(/\/api\/?$/, '');
    return `${rootUrl}/${path.replace(/^\//, '')}`;
  }

  // Get unique categories from departments
  const categories = ['All', ...Array.from(new Set(departments.map(d => d.category).filter(Boolean))) as string[]]

  // Filter Logic
  const filteredDepartments = departments.filter((dept) => {
    const matchesSearch = dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dept.subtitle && dept.subtitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      dept.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || dept.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="departments-page">
      {/* Internal CSS for this specific page */}
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

        .help-widget {
          margin-top: 40px;
          background: linear-gradient(135deg, var(--heading-color), var(--accent-color));
          padding: 25px;
          border-radius: 10px;
          color: white;
          text-align: center;
        }
        
        .help-widget i {
          font-size: 2rem;
          margin-bottom: 10px;
          display: block;
        }

        /* --- Main Content / Card Styles --- */
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

        .department-card {
          background: var(--surface-color);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 0 20px rgba(0,0,0,0.04);
          transition: all 0.4s ease;
          height: 100%;
          border: 1px solid #f0f0f0;
          position: relative;
        }

        .department-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 15px 30px rgba(4, 158, 187, 0.15);
          border-color: var(--accent-color);
        }

        .department-image-wrapper {
          position: relative;
          height: 220px;
          overflow: hidden;
          background: linear-gradient(135deg, var(--heading-color), var(--accent-color));
        }

        .department-image-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
        }

        .department-card:hover .department-image-wrapper img {
          transform: scale(1.1);
        }

        .category-tag {
          position: absolute;
          top: 15px;
          left: 15px;
          background: rgba(255, 255, 255, 0.95);
          color: var(--heading-color);
          padding: 4px 12px;
          border-radius: 50px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          z-index: 2;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .department-content {
          padding: 25px;
        }

        .icon-box {
          width: 50px;
          height: 50px;
          background: var(--accent-color);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          font-size: 1.5rem;
          margin-top: -50px;
          position: relative;
          z-index: 3;
          box-shadow: 0 5px 15px rgba(4, 158, 187, 0.3);
          margin-bottom: 15px;
        }

        .dept-title {
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--heading-color);
          margin-bottom: 5px;
        }

        .dept-subtitle {
          color: var(--accent-color);
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 15px;
          display: block;
        }

        .dept-desc {
          color: #666;
          font-size: 0.95rem;
          line-height: 1.6;
          margin-bottom: 20px;
        }

        .dept-stats {
          background: #f8f9fa;
          padding: 10px 15px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }

        .stat-val {
          font-weight: 700;
          color: var(--heading-color);
        }
        
        .stat-lbl {
          font-size: 0.85rem;
          color: #777;
        }

        .dept-link {
          display: inline-flex;
          align-items: center;
          color: var(--heading-color);
          font-weight: 600;
          text-decoration: none;
          transition: 0.3s;
        }

        .dept-link i {
          margin-left: 6px;
          transition: 0.3s;
        }

        .dept-link:hover {
          color: var(--accent-color);
        }

        .dept-link:hover i {
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
        title="Departments"
        description="Explore our specialized medical departments dedicated to expert and focused care."
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Departments' }
        ]}
      />

      <section id="departments" className="departments section section-bg">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row">

            {/* --- Left Sidebar Filter --- */}
            <div className="col-lg-3 mb-5 mb-lg-0">
              <div className="sidebar-wrapper">
                <div className="sidebar-title">
                  Filter Departments
                  <i className="bi bi-sliders2"></i>
                </div>

                {/* Search */}
                <div className="search-box">
                  <i className="bi bi-search"></i>
                  <input
                    type="text"
                    placeholder="Search departments..."
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

                {/* Help Widget */}
                <div className="help-widget">
                  <i className="bi bi-headset"></i>
                  <h5>Need Assistance?</h5>
                  <p className="small mb-3">Not sure which department you need? Call us.</p>
                  <a href="tel:+1234567890" className="btn btn-light btn-sm w-100 fw-bold text-dark">
                    +1 234 567 890
                  </a>
                </div>
              </div>
            </div>

            {/* --- Right Content Grid --- */}
            <div className="col-lg-9">
              <div className="results-header">
                <h4 className="m-0 fw-bold text-dark">
                  {selectedCategory === 'All' ? 'All Departments' : `${selectedCategory} Departments`}
                </h4>
                <span className="results-count">
                  Showing {filteredDepartments.length} result{filteredDepartments.length !== 1 ? 's' : ''}
                </span>
              </div>

              {loading ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <p className="text-muted">Loading departments...</p>
                </div>
              ) : filteredDepartments.length > 0 ? (
                <div className="row gy-4">
                  {filteredDepartments.map((dept) => (
                    <div key={dept.id} className="col-md-6" data-aos="fade-up" data-aos-delay="100">
                      <div className="department-card">
                        <div className="department-image-wrapper">
                          {dept.category && <span className="category-tag">{dept.category}</span>}
                          <img
                            src={getImageUrl(dept.image || '')}
                            alt={dept.name}
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x220?text=Department'
                            }}
                          />
                        </div>

                        <div className="department-content">
                          <div className="icon-box">
                            <i className={`bi ${dept.icon || 'bi-hospital'}`}></i>
                          </div>

                          <h3 className="dept-title">{dept.name}</h3>
                          {dept.subtitle && <span className="dept-subtitle">{dept.subtitle}</span>}

                          {dept.head_of_department && (
                            <div className="dept-stats">
                              <i className="bi bi-person-badge text-warning"></i>
                              <div>
                                <span className="stat-lbl">Head: </span>
                                <span className="stat-val">{dept.head_of_department}</span>
                              </div>
                            </div>
                          )}

                          <p className="dept-desc">{dept.description}</p>

                          <Link to={`/department-details/${dept.id}`} className="dept-link">
                            Details <i className="bi bi-arrow-right"></i>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-results">
                  <i className="bi bi-search display-4 text-muted mb-3"></i>
                  <h4>No departments found</h4>
                  <p className="text-muted">Try adjusting your search or category filter.</p>
                  <button
                    className="btn btn-outline-dark mt-2"
                    onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
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

export default Departments