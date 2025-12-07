import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AOS from 'aos'
import PageHero from '../components/PageHero'
import { departmentAPI, serviceAPI } from '../services/api'

interface Department {
  id: number
  name: string
  description: string
  head_of_department?: string
  icon?: string
  image?: string
  category?: string
  subtitle?: string
  features?: string[]
  technologies?: string[]
}

interface Service {
  id: number
  name: string
  description: string
  price: string | number
  category?: string
  icon?: string
}

const DepartmentDetails = () => {
  const { id } = useParams<{ id: string }>()
  const [department, setDepartment] = useState<Department | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    })
    window.scrollTo(0, 0)
    if (id) {
      fetchDepartmentDetails()
      fetchDepartmentServices()
    }
  }, [id])

  const fetchDepartmentDetails = async () => {
    try {
      setLoading(true)
      const response = await departmentAPI.getById(Number(id))
      if (response.data.success && response.data.data) {
        const deptData = response.data.data

        // Ensure features and technologies are arrays if they come as strings
        if (typeof deptData.features === 'string') {
          try {
            deptData.features = JSON.parse(deptData.features)
          } catch (e) {
            deptData.features = []
          }
        }

        if (typeof deptData.technologies === 'string') {
          try {
            deptData.technologies = JSON.parse(deptData.technologies)
          } catch (e) {
            deptData.technologies = []
          }
        }

        setDepartment(deptData)
      }
    } catch (error) {
      console.error('Failed to fetch department details:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartmentServices = async () => {
    try {
      const response = await serviceAPI.getAll()
      if (response.data.success && response.data.data) {
        const filtered = response.data.data.filter((s: any) => s.department_id === Number(id))
        setServices(filtered)
      }
    } catch (error) {
      console.error('Failed to fetch department services:', error)
    }
  }

  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    const rootUrl = baseUrl.replace(/\/api\/?$/, '');
    return `${rootUrl}/${path.replace(/^\//, '')}`;
  }

  if (loading) {
    return (
      <div className="department-details-page">
        <style>{`
          .loading-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 60vh;
            flex-direction: column;
          }
          .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid var(--accent-color);
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="text-muted">Loading department details...</p>
        </div>
      </div>
    )
  }

  if (!department) {
    return (
      <div className="department-details-page">
        <PageHero
          title="Department Not Found"
          description="The requested department could not be found."
          breadcrumbs={[
            { label: 'Home', path: '/' },
            { label: 'Departments', path: '/departments' },
            { label: 'Not Found' }
          ]}
        />
        <div className="container text-center py-5">
          <h3>Department not found</h3>
          <Link to="/departments" className="btn btn-theme mt-3">Back to Departments</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="department-details-page">
      <style>{`
        .dept-tabs-nav {
          display: flex;
          gap: 15px;
          margin-bottom: 30px;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }

        .dept-tab-btn {
          background: none;
          border: none;
          padding: 10px 20px;
          font-weight: 600;
          color: #666;
          border-radius: 50px;
          transition: all 0.3s ease;
          font-size: 0.95rem;
        }

        .dept-tab-btn:hover {
          color: var(--accent-color);
          background: rgba(4, 158, 187, 0.05);
        }

        .dept-tab-btn.active {
          background: var(--accent-color);
          color: #fff;
          box-shadow: 0 4px 10px rgba(4, 158, 187, 0.3);
        }

        .content-box {
          background: #fff;
          border-radius: 0 0 12px 12px;
          animation: fadeIn 0.5s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .feature-list li {
          margin-bottom: 12px;
          display: flex;
          align-items: start;
          color: #555;
        }

        .feature-list i {
          color: var(--accent-color);
          margin-right: 10px;
          font-size: 1.1rem;
          margin-top: 2px;
        }

        .dept-sidebar {
          background: #fff;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 0 25px rgba(0,0,0,0.05);
          border: 1px solid #f0f0f0;
          position: sticky;
          top: 100px;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 25px;
          padding-bottom: 20px;
          border-bottom: 1px solid #eee;
        }

        .sidebar-icon {
          width: 50px;
          height: 50px;
          background: rgba(4, 158, 187, 0.1);
          color: var(--accent-color);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .info-row {
          margin-bottom: 20px;
        }
        
        .info-row label {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #999;
          font-weight: 600;
          display: block;
          margin-bottom: 5px;
        }

        .info-row p {
          color: var(--heading-color);
          font-weight: 500;
          margin: 0;
          font-size: 1rem;
        }

        .specialist-card {
          background: #fff;
          border: 1px solid #eee;
          border-radius: 10px;
          padding: 15px;
          display: flex;
          align-items: center;
          gap: 20px;
          transition: all 0.3s ease;
          margin-bottom: 20px;
        }

        .specialist-card:hover {
          border-color: var(--accent-color);
          box-shadow: 0 5px 15px rgba(0,0,0,0.05);
          transform: translateX(5px);
        }
        
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
        }

        .specialist-img {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-color), var(--heading-color));
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 2rem;
        }

        .specialist-info h5 {
          margin: 0 0 5px 0;
          color: var(--heading-color);
          font-weight: 700;
        }

        .specialist-role {
          font-size: 0.85rem;
          color: var(--accent-color);
          margin-bottom: 5px;
          display: block;
        }

        .specialist-actions {
          margin-left: auto;
        }

        .service-price-badge {
          background: linear-gradient(135deg, #28a745, #20c997);
          color: white;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
        }
        
        .btn-theme {
          background: var(--accent-color);
          color: #fff;
          border: none;
          padding: 8px 20px;
          border-radius: 50px;
          transition: all 0.3s ease;
          font-weight: 500;
          display: inline-block;
          text-decoration: none;
        }
        .btn-theme:hover {
          background: var(--heading-color);
          color: #fff;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .btn-theme-outline {
          background: transparent;
          color: var(--accent-color);
          border: 2px solid var(--accent-color);
          padding: 6px 18px;
          border-radius: 50px;
          transition: all 0.3s ease;
          font-weight: 600;
          display: inline-block;
          text-decoration: none;
        }
        .btn-theme-outline:hover {
          background: var(--accent-color);
          color: #fff;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(4, 158, 187, 0.2);
        }
      `}</style>

      <PageHero
        title={department.name}
        description={department.subtitle || `Specialized ${department.name} Care`}
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Departments', path: '/departments' },
          { label: department.name }
        ]}
      />

      <section className="department-details section">
        <div className="container" data-aos="fade-up">
          <div className="row">

            <div className="col-lg-8">

              {/* Main Image - Only show if exists */}
              {department.image && (
                <div className="mb-4 rounded-4 overflow-hidden position-relative" style={{ height: '350px' }}>
                  <img
                    src={getImageUrl(department.image)}
                    alt={department.name}
                    className="w-100 h-100 object-fit-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className="position-absolute bottom-0 start-0 w-100 p-4" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}>
                    <h3 className="text-white m-0">{department.name} Excellence</h3>
                  </div>
                </div>
              )}

              {/* Navigation Tabs */}
              <div className="dept-tabs-nav">
                <button
                  className={`dept-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  Overview
                </button>
                <button
                  className={`dept-tab-btn ${activeTab === 'services' ? 'active' : ''}`}
                  onClick={() => setActiveTab('services')}
                >
                  Services ({services.length})
                </button>
                {department.technologies && department.technologies.length > 0 && (
                  <button
                    className={`dept-tab-btn ${activeTab === 'technology' ? 'active' : ''}`}
                    onClick={() => setActiveTab('technology')}
                  >
                    Technology
                  </button>
                )}
              </div>

              {/* Tab Content */}
              <div className="content-box mb-5">
                {activeTab === 'overview' && (
                  <div>
                    <h3 className="mb-3 fw-bold text-dark">About the Department</h3>

                    {/* Subtitle - Matches the grey lead text in your screenshot */}
                    {department.subtitle && (
                      <p className="lead text-muted mb-4" style={{ fontSize: '1.3rem', fontWeight: 300 }}>
                        {department.subtitle}
                      </p>
                    )}

                    {/* Description - Matches the body text */}
                    <p className="text-secondary mb-4" style={{ fontSize: '1.05rem', lineHeight: '1.8' }}>
                      {department.description}
                    </p>

                    {/* Only show features if they exist in database */}
                    {department.features && Array.isArray(department.features) && department.features.length > 0 && (
                      <div className="mt-4">
                        <h5 className="fw-bold mb-3">Key Features</h5>
                        <div className="row">
                          {department.features.map((feature, idx) => (
                            <div key={idx} className="col-md-6">
                              <ul className="feature-list list-unstyled">
                                <li><i className="bi bi-check-circle-fill"></i> {feature}</li>
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'services' && (
                  <div>
                    <h3 className="mb-4 fw-bold text-dark">Our Services</h3>
                    <p className="text-muted mb-4">We offer a wide array of specialized treatments designed to meet individual patient needs.</p>

                    {services.length > 0 ? (
                      <div className="row g-4">
                        {services.map((service) => (
                          <div key={service.id} className="col-12">
                            <div className="specialist-card h-100 border-0 shadow-sm p-4 hover-lift">
                              <div className="specialist-img" style={{ width: '70px', height: '70px', fontSize: '1.8rem', flexShrink: 0 }}>
                                <i className={`${service.icon || 'bi bi-heart-pulse'}`}></i>
                              </div>

                              <div className="specialist-info flex-grow-1 d-flex gap-4 align-items-start">
                                {/* Left Content: Title, Desc, Button */}
                                <div className="flex-grow-1">
                                  <h4 className="mb-2 fw-bold text-dark">{service.name}</h4>
                                  <p className="text-muted mb-4" style={{ lineHeight: '1.6', fontSize: '0.95rem' }}>
                                    {service.description.length > 120 ? service.description.substring(0, 120) + '...' : service.description}
                                  </p>
                                  <Link to={`/service-details/${service.id}`} className="btn-theme-outline text-decoration-none d-inline-flex align-items-center">
                                    View Details <i className="bi bi-arrow-right ms-2"></i>
                                  </Link>
                                </div>

                                {/* Right Content: Badge & Price */}
                                <div className="text-end flex-shrink-0">
                                  <span className="badge bg-light text-secondary border rounded-pill px-3 py-1 fw-normal mb-3 d-inline-block">
                                    {service.category || 'Medical Service'}
                                  </span>
                                  <h3 className="fw-bold mb-0" style={{ color: 'var(--accent-color)' }}>
                                    ${typeof service.price === 'number' ? service.price.toFixed(2) : parseFloat(service.price as string).toFixed(2)}
                                  </h3>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-5 bg-light rounded-4">
                        <i className="bi bi-inbox display-1 text-muted opacity-25 mb-3"></i>
                        <p className="text-muted lead">No services listed for this department yet.</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'technology' && (
                  <div>
                    <h3 className="mb-3 fw-bold text-dark">Advanced Technology</h3>

                    {/* Only show technologies if they exist in database */}
                    {department.technologies && Array.isArray(department.technologies) && department.technologies.length > 0 && (
                      <>
                        <p className="mb-3">Our department is equipped with the latest medical technology.</p>
                        <ul className="feature-list list-unstyled mt-3">
                          {department.technologies.map((tech, idx) => (
                            <li key={idx}><i className="bi bi-cpu"></i> {tech}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Related Services Preview - Only show if services exist and not on services tab */}
              {services.length > 0 && activeTab !== 'services' && (
                <div className="mt-5 pt-3 border-top">
                  <div className="d-flex justify-content-between align-items-end mb-4">
                    <h3 className="fw-bold text-dark m-0">Available Services</h3>
                    <button
                      className="btn btn-link text-decoration-none small fw-bold p-0"
                      style={{ color: 'var(--accent-color)' }}
                      onClick={() => setActiveTab('services')}
                    >
                      View All Services <i className="bi bi-arrow-right"></i>
                    </button>
                  </div>

                  {services.slice(0, 3).map(service => (
                    <div key={service.id} className="specialist-card" data-aos="fade-up">
                      <div className="specialist-img">
                        <i className={`${service.icon || 'fas fa-stethoscope'}`}></i>
                      </div>
                      <div className="specialist-info">
                        <h5>{service.name}</h5>
                        <span className="specialist-role">{service.category || 'Medical Service'}</span>
                        <p className="small text-muted mb-0 d-none d-md-block">{service.description.substring(0, 80)}...</p>
                      </div>
                      <div className="specialist-actions d-none d-sm-block">
                        <Link
                          to={`/service-details/${service.id}`}
                          className="btn-theme-outline btn-sm text-decoration-none"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>

            {/* Sidebar - Only show fields that have data */}
            <div className="col-lg-4">
              <div className="dept-sidebar">
                <div className="sidebar-header">
                  <div className="sidebar-icon">
                    <i className={`bi ${department.icon || 'bi-hospital'}`}></i>
                  </div>
                  <div>
                    <h5 className="m-0 fw-bold text-dark">{department.name}</h5>
                    <small className="text-muted">Department Info</small>
                  </div>
                </div>

                {department.head_of_department && (
                  <div className="info-row">
                    <label><i className="bi bi-person me-2"></i>Head of Department</label>
                    <p>{department.head_of_department}</p>
                  </div>
                )}

                {department.category && (
                  <div className="info-row">
                    <label><i className="bi bi-tag me-2"></i>Category</label>
                    <p>{department.category}</p>
                  </div>
                )}

                {services.length > 0 && (
                  <div className="info-row">
                    <label><i className="bi bi-grid me-2"></i>Total Services</label>
                    <p>{services.length} Services Available</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}

export default DepartmentDetails