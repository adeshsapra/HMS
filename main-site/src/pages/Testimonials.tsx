import { useEffect, useState } from 'react'
import AOS from 'aos'
import PageHero from '../components/PageHero'
import { testimonialAPI } from '../services/api'

interface Testimonial {
  id: number;
  name: string;
  role: string;
  image_url: string;
  message: string;
  rating: number;
  created_at: string;
}

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 9; // Show 9 per page on public site

  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    })
  }, []);

  useEffect(() => {
    fetchTestimonials(currentPage);
    // Scroll to top when page changes
    window.scrollTo({ top: 300, behavior: 'smooth' });
  }, [currentPage]);

  const fetchTestimonials = async (page = 1) => {
    try {
      setLoading(true);
      const response = await testimonialAPI.getAll({ page, per_page: perPage });
      if (response.data.status) {
        setTestimonials(response.data.data);
        if (response.data.meta) {
          setTotalPages(response.data.meta.last_page);
          setTotal(response.data.meta.total);
        }
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <i
        key={index}
        className={`bi ${index < rating ? 'bi-star-fill' : 'bi-star'}`}
        style={{ color: index < rating ? '#ffc107' : '#e4e5e9' }}
      ></i>
    ));
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = '/assets/img/person/person-m-12.webp'; // Fallback image
  };

  const getFullImageUrl = (path: string | null) => {
    if (!path) return '/assets/img/person/person-m-12.webp';
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000';
    return `${baseUrl}/storage/${path}`;
  };

  return (
    <div className="testimonials-page">
      <PageHero
        title="Testimonials"
        description="Hear genuine experiences and feedback from our patients."
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Testimonials' }
        ]}
      />

      <section id="testimonials" className="testimonials section">
        {loading ? (
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-12 text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading testimonials...</span>
                </div>
                <p className="mt-3">Loading patient testimonials...</p>
              </div>
            </div>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="container" data-aos="fade-up">
            <div className="section-title text-center">
              <h2>What Our Patients Say</h2>
              <p>Be the first to share your experience with us!</p>
            </div>
            <div className="text-center py-5">
              <i className="bi bi-chat-heart" style={{ fontSize: '4rem', color: '#eee' }}></i>
              <p className="mt-3 text-muted">No testimonials available yet.</p>
            </div>
          </div>
        ) : (
          <div className="container" data-aos="fade-up">
            <div className="section-title text-center">
              <h2>What Our Patients Say</h2>
              <p>Real experiences from our valued patients ({total}) who trust us with their healthcare needs</p>
            </div>

            <div className="row g-4 mb-5">
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  className="col-lg-4 col-md-6"
                  data-aos="fade-up"
                  data-aos-delay={(index % 3) * 100}
                >
                  <div className="testimonial-item h-100 shadow-sm border-0">
                    <div className="d-flex align-items-center mb-3">
                      <img
                        src={getFullImageUrl(testimonial.image_url)}
                        alt={testimonial.name}
                        className="rounded-circle me-3"
                        style={{ width: '60px', height: '60px', objectFit: 'cover', border: '3px solid #f8f9fa' }}
                        onError={handleImageError}
                      />
                      <div>
                        <h5 className="mb-1 fw-bold">{testimonial.name}</h5>
                        <small className="text-primary">{testimonial.role}</small>
                      </div>
                    </div>

                    <div className="mb-3">
                      {renderStars(testimonial.rating)}
                    </div>

                    <p className="mb-3 text-secondary italic">"{testimonial.message}"</p>

                    <div className="mt-auto pt-3 border-top">
                      <small className="text-muted">
                        <i className="bi bi-calendar-event me-1"></i>
                        {new Date(testimonial.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </small>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="row">
                <div className="col-12 d-flex justify-content-center">
                  <nav aria-label="Testimonials pagination">
                    <ul className="pagination pagination-lg">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          aria-label="Previous"
                        >
                          <span aria-hidden="true">&laquo;</span>
                        </button>
                      </li>
                      {[...Array(totalPages)].map((_, i) => (
                        <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                            {i + 1}
                          </button>
                        </li>
                      ))}
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          aria-label="Next"
                        >
                          <span aria-hidden="true">&raquo;</span>
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Call to Action */}
        <div className="container mt-5 pt-4">
          <div className="row">
            <div className="col-12 text-center">
              <div className="bg-light rounded-4 p-5 shadow-sm border border-white" data-aos="fade-up">
                <h3 className="mb-3 fw-bold">Shared Your Experience?</h3>
                <p className="mb-4 text-muted fs-5">Your feedback helps us grow and serve you better. Patients can submit their reviews from their profile dashboard.</p>
                <div className="d-flex justify-content-center gap-3 flex-wrap">
                  <a href="/profile?tab=testimonials" className="btn btn-primary btn-lg px-5 rounded-pill shadow-sm">
                    <i className="bi bi-star-fill me-2"></i>
                    Leave a Review
                  </a>
                  <a href="/quickappointment" className="btn btn-outline-primary btn-lg px-5 rounded-pill shadow-sm">
                    <i className="bi bi-calendar-check me-2"></i>
                    Book Appointment
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Testimonials
