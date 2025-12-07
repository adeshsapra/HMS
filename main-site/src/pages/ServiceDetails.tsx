import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import AOS from 'aos'
import PageHero from '../components/PageHero'
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

const ServiceDetails = () => {
  const { id } = useParams<{ id: string }>()
  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [relatedServices, setRelatedServices] = useState<Service[]>([])

  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    })
    if (id) {
      fetchServiceDetails()
    }
  }, [id])

  const fetchServiceDetails = async () => {
    try {
      setLoading(true)
      const response = await serviceAPI.getById(Number(id))
      if (response.data.success && response.data.data) {
        setService(response.data.data)
        // Fetch related services
        fetchRelatedServices(response.data.data.category)
      }
    } catch (error) {
      console.error('Failed to fetch service details:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedServices = async (category?: string) => {
    try {
      const response = await serviceAPI.getAll()
      if (response.data.success && response.data.data) {
        const filtered = response.data.data
          .filter((s: Service) => s.id !== Number(id) && (!category || s.category === category))
          .slice(0, 3)
        setRelatedServices(filtered)
      }
    } catch (error) {
      console.error('Failed to fetch related services:', error)
    }
  }

  if (loading) {
    return (
      <div className="service-details-page">
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
        <PageHero
          title="Service Details"
          description="Loading service information..."
          breadcrumbs={[
            { label: 'Home', path: '/' },
            { label: 'Services', path: '/services' },
            { label: 'Details' }
          ]}
        />
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="text-muted">Loading service details...</p>
        </div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="service-details-page">
        <PageHero
          title="Service Not Found"
          description="The requested service could not be found."
          breadcrumbs={[
            { label: 'Home', path: '/' },
            { label: 'Services', path: '/services' },
            { label: 'Not Found' }
          ]}
        />
        <div className="container text-center py-5">
          <h3>Service not found</h3>
          <Link to="/services" className="btn btn-primary mt-3">Back to Services</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="service-details-page">
      <style>{`
        .section-bg {
          background-color: #f9fbfb;
        }

        .service-header-card {
          background: linear-gradient(135deg, var(--heading-color), var(--accent-color));
          border-radius: 15px;
          padding: 40px;
          color: white;
          margin-bottom: 30px;
          box-shadow: 0 10px 30px rgba(4, 158, 187, 0.3);
        }

        .service-icon-large {
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          margin-bottom: 20px;
          backdrop-filter: blur(10px);
        }

        .service-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 10px;
        }

        .service-meta-header {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          margin-top: 20px;
        }

        .meta-badge {
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50px;
          font-weight: 600;
          backdrop-filter: blur(10px);
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .details-card {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 0 20px rgba(0,0,0,0.05);
          margin-bottom: 30px;
        }

        .details-card h4 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--heading-color);
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid rgba(4, 158, 187, 0.1);
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .info-item {
          padding: 15px;
          background: #f8f9fa;
          border-radius: 10px;
          border-left: 4px solid var(--accent-color);
        }

        .info-label {
          font-size: 0.85rem;
          color: #666;
          margin-bottom: 5px;
          font-weight: 600;
        }

        .info-value {
          font-size: 1.1rem;
          color: var(--heading-color);
          font-weight: 700;
        }

        .cta-box {
          background: linear-gradient(135deg, #28a745, #20c997);
          border-radius: 12px;
          padding: 30px;
          color: white;
          text-align: center;
          margin-top: 30px;
        }

        .cta-box h4 {
          color: white;
          margin-bottom: 15px;
        }

        .btn-book {
          background: white;
          color: #28a745;
          padding: 12px 35px;
          border-radius: 50px;
          font-weight: 700;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          transition: all 0.3s;
          border: none;
        }

        .btn-book:hover {
          transform: scale(1.05);
          box-shadow: 0 5px 20px rgba(255,255,255,0.3);
          color: #28a745;
        }

        .related-service-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 0 15px rgba(0,0,0,0.05);
          transition: all 0.3s;
          height: 100%;
          border: 1px solid #f0f0f0;
        }

        .related-service-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(4, 158, 187, 0.15);
          border-color: var(--accent-color);
        }

        .related-icon {
          width: 50px;
          height: 50px;
          background: var(--accent-color);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.5rem;
          margin-bottom: 15px;
        }

        .related-service-card h5 {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--heading-color);
          margin-bottom: 10px;
        }

        .related-price {
          color: #28a745;
          font-weight: 700;
          font-size: 1.2rem;
        }
      `}</style>

      <PageHero
        title={service.name}
        description={`Detailed information about ${service.name}`}
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Services', path: '/services' },
          { label: service.name }
        ]}
      />

      <section className="service-details section section-bg">
        <div className="container" data-aos="fade-up">
          <div className="row">

            {/* Main Content */}
            <div className="col-lg-8">
              {/* Header Card */}
              <div className="service-header-card" data-aos="fade-up">
                <div className="service-icon-large">
                  <i className={`fas ${service.icon || 'fa-stethoscope'}`}></i>
                </div>
                <h1 className="service-title">{service.name}</h1>
                <div className="service-meta-header">
                  {service.category && (
                    <span className="meta-badge">
                      <i className="bi bi-tag-fill"></i>
                      {service.category}
                    </span>
                  )}
                  <span className="meta-badge">
                    <i className="bi bi-currency-dollar"></i>
                    ${typeof service.price === 'number' ? service.price.toFixed(2) : parseFloat(service.price).toFixed(2)}
                  </span>
                  {service.duration && (
                    <span className="meta-badge">
                      <i className="bi bi-clock"></i>
                      {service.duration} minutes
                    </span>
                  )}
                  {service.department && (
                    <span className="meta-badge">
                      <i className="bi bi-building"></i>
                      {service.department.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="details-card" data-aos="fade-up" data-aos-delay="100">
                <h4><i className="bi bi-info-circle me-2"></i>About This Service</h4>
                <p style={{ fontSize: '1.05rem', lineHeight: '1.8', color: '#666' }}>
                  {service.description}
                </p>
              </div>

              {/* Service Details */}
              <div className="details-card" data-aos="fade-up" data-aos-delay="200">
                <h4><i className="bi bi-list-check me-2"></i>Service Information</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <div className="info-label">Service Name</div>
                    <div className="info-value">{service.name}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Price</div>
                    <div className="info-value">${typeof service.price === 'number' ? service.price.toFixed(2) : parseFloat(service.price).toFixed(2)}</div>
                  </div>
                  {service.duration && (
                    <div className="info-item">
                      <div className="info-label">Duration</div>
                      <div className="info-value">{service.duration} min</div>
                    </div>
                  )}
                  {service.category && (
                    <div className="info-item">
                      <div className="info-label">Category</div>
                      <div className="info-value">{service.category}</div>
                    </div>
                  )}
                  {service.department && (
                    <div className="info-item">
                      <div className="info-label">Department</div>
                      <div className="info-value">{service.department.name}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="col-lg-4">
              {/* CTA Box */}
              <div className="cta-box" data-aos="fade-up">
                <i className="bi bi-calendar-check display-4 mb-3"></i>
                <h4>Book This Service</h4>
                <p className="mb-4">Schedule an appointment with our expert team today.</p>
                <Link to="/appointment" className="btn-book">
                  <i className="bi bi-calendar-plus"></i>
                  Book Appointment
                </Link>
              </div>

              {/* Related Services */}
              {relatedServices.length > 0 && (
                <div className="details-card mt-4" data-aos="fade-up" data-aos-delay="100">
                  <h4><i className="bi bi-grid me-2"></i>Related Services</h4>
                  <div className="d-flex flex-column gap-3">
                    {relatedServices.map((related) => (
                      <Link
                        key={related.id}
                        to={`/service-details/${related.id}`}
                        className="text-decoration-none"
                      >
                        <div className="related-service-card">
                          <div className="related-icon">
                            <i className={`fas ${related.icon || 'fa-stethoscope'}`}></i>
                          </div>
                          <h5>{related.name}</h5>
                          <p className="text-muted small mb-2">{related.description.substring(0, 80)}...</p>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="related-price">${typeof related.price === 'number' ? related.price.toFixed(2) : parseFloat(related.price).toFixed(2)}</span>
                            <span className="text-primary small fw-bold">
                              View Details <i className="bi bi-arrow-right"></i>
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}

export default ServiceDetails
