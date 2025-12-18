import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HomeCare.css';
import { homeCareServices, heroSlides, homeCareProfessionals } from '../../data/homeCareData';

const HomeCareLanding = () => {
    const [loading, setLoading] = useState(true);
    const [selectedService, setSelectedService] = useState<any>(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        // Simulate initial loading for premium feel
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="home-care-container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="home-care-container">
            {/* Hero Section */}
            <section className="hc-hero" style={{ backgroundImage: `url(${heroSlides[0].image})` }}>
                <div className="container">
                    <div className="hc-hero-content animate-fade-in">
                        <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-2 mb-3 fw-bold border border-primary">NEW FEATURE</span>
                        <h1>{heroSlides[0].title}</h1>
                        <p>{heroSlides[0].subtitle}</p>
                        <div className="d-flex gap-3 flex-wrap">
                            <Link to="/home-care/booking" className="hc-btn hc-btn-primary">
                                <i className="bi bi-calendar-check"></i> Book a Visit
                            </Link>
                            <a href="#services" className="hc-btn hc-btn-outline">
                                Explore Services
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section id="services" className="py-5">
                <div className="container">
                    <div className="hc-section-title" data-aos="fade-up">
                        <h6 className="text-primary fw-bold text-uppercase tracking-wider mb-2">Capabilities</h6>
                        <h2>Our Home Care Services</h2>
                        <p>Comprehensive healthcare solutions delivered to your doorstep by certified professionals.</p>
                    </div>

                    {homeCareServices.length > 0 ? (
                        <div className="hc-card-grid">
                            {homeCareServices.map((service, index) => (
                                <div key={service.id} className="hc-service-card" data-aos="fade-up" data-aos-delay={index * 100}>
                                    <div className="position-relative overflow-hidden">
                                        <img src={service.image} alt={service.title} className="hc-card-image" />
                                        <div className="position-absolute top-0 end-0 m-3">
                                            <span className="badge bg-white text-primary rounded-pill shadow-sm py-2 px-3 fw-bold">
                                                <i className="bi bi-star-fill text-warning me-1"></i> {service.rating}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="hc-card-body">
                                        <div className="hc-card-icon">
                                            <i className={`bi ${service.icon}`}></i>
                                        </div>
                                        <h3 className="hc-card-title">{service.title}</h3>
                                        <p className="hc-card-text">{service.shortDesc}</p>

                                        <div className="d-flex flex-wrap gap-2 mb-4">
                                            {service.benefits.slice(0, 3).map((benefit, i) => (
                                                <span key={i} className="badge bg-light text-dark fw-normal border">
                                                    {benefit}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="hc-card-footer mt-auto">
                                            <div>
                                                <span className="d-block text-muted small">Starting from</span>
                                                <span className="hc-price">{service.price}</span>
                                            </div>
                                            <button
                                                onClick={() => setSelectedService(service)}
                                                className="btn btn-link text-primary p-0 fw-bold text-decoration-none"
                                            >
                                                Details <i className="bi bi-arrow-right"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-5 border rounded-4 bg-light">
                            <i className="bi bi-search display-1 text-muted mb-3 d-block"></i>
                            <h4>No Services Found</h4>
                            <p className="text-muted">We currently don't have any home care services listed. Please check back later.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Detail Modal */}
            {selectedService && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content border-0 rounded-4 overflow-hidden shadow-lg animate-fade-in mx-3">
                            <div className="row g-0">
                                <div className="col-md-5 d-none d-md-block">
                                    <img src={selectedService.image} className="h-100 w-100 object-fit-cover" alt={selectedService.title} style={{ minHeight: '400px' }} />
                                </div>
                                <div className="col-md-7">
                                    <div className="modal-header border-0 pb-0">
                                        <button type="button" className="btn-close" onClick={() => setSelectedService(null)}></button>
                                    </div>
                                    <div className="modal-body p-4 pt-0">
                                        <div className="hc-card-icon mb-3">
                                            <i className={`bi ${selectedService.icon}`}></i>
                                        </div>
                                        <h2 className="fw-bold mb-2">{selectedService.title}</h2>
                                        <p className="text-muted mb-4">{selectedService.longDesc}</p>

                                        <h6 className="fw-bold mb-3">Key Benefits:</h6>
                                        <div className="row g-2 mb-4">
                                            {selectedService.benefits.map((benefit: string, i: number) => (
                                                <div key={i} className="col-6">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <i className="bi bi-patch-check-fill text-success"></i>
                                                        <span className="small">{benefit}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded-3">
                                            <div>
                                                <span className="small text-muted d-block">Consultation Fee</span>
                                                <span className="h4 fw-bold text-primary mb-0">{selectedService.price}</span>
                                            </div>
                                            <Link
                                                to={`/home-care/booking?service=${selectedService.id}`}
                                                className="btn btn-primary rounded-pill px-4"
                                                onClick={() => setSelectedService(null)}
                                            >
                                                Book Now
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Why Choose Us */}
            <section className="hc-features">
                <div className="container">
                    <div className="hc-section-title" data-aos="fade-up">
                        <h2>Why Choose Meditrust Home Care?</h2>
                        <p>We bring hospital-grade care to your safe haven.</p>
                    </div>

                    <div className="row g-4">
                        <div className="col-md-4" data-aos="fade-up" data-aos-delay="100">
                            <div className="hc-feature-box">
                                <i className="bi bi-shield-check hc-feature-icon"></i>
                                <h4>Verified Professionals</h4>
                                <p>All our doctors and nurses are background-checked, certified, and highly experienced.</p>
                            </div>
                        </div>
                        <div className="col-md-4" data-aos="fade-up" data-aos-delay="200">
                            <div className="hc-feature-box">
                                <i className="bi bi-clock-history hc-feature-icon"></i>
                                <h4>24/7 Availability</h4>
                                <p>Round-the-clock support for emergencies and scheduled visits whenever you need them.</p>
                            </div>
                        </div>
                        <div className="col-md-4" data-aos="fade-up" data-aos-delay="300">
                            <div className="hc-feature-box">
                                <i className="bi bi-heart-pulse hc-feature-icon"></i>
                                <h4>Personalized Care</h4>
                                <p>Tailored care plans designed specifically for your unique health requirements.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Meet Professionals */}
            <section className="py-5 mb-5">
                <div className="container">
                    <div className="hc-section-title" data-aos="fade-up">
                        <h2>Meet Our Top Professionals</h2>
                        <p>Dedicated experts ready to visit you at home.</p>
                    </div>

                    <div className="row g-4 justify-content-center">
                        {homeCareProfessionals.map((prof, index) => (
                            <div key={prof.id} className="col-md-4 col-lg-3" data-aos="zoom-in" data-aos-delay={index * 100}>
                                <div className="card border-0 shadow-sm h-100 rounded-4 overflow-hidden hc-prof-card">
                                    <div className="position-relative">
                                        <img src={prof.image} className="card-img-top" alt={prof.name} style={{ height: '280px', objectFit: 'cover' }} />
                                        <div className="position-absolute bottom-0 start-0 w-100 p-3 bg-gradient-dark text-white">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span className="badge bg-success small"><i className="bi bi-star-fill me-1"></i>{prof.rating}</span>
                                                <span className="small">{prof.experience} Exp.</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card-body text-center p-4">
                                        <h5 className="card-title fw-bold text-dark mb-1">{prof.name}</h5>
                                        <p className="card-text text-primary small fw-semibold mb-3">{prof.role}</p>
                                        <div className="d-flex justify-content-center gap-2 mb-3">
                                            <span className="small text-muted"><i className="bi bi-clock me-1"></i> {prof.availability.split(',')[0]}</span>
                                        </div>
                                        <Link to="/home-care/booking" className="btn btn-outline-primary btn-sm rounded-pill px-4 w-100 fw-bold">
                                            Book Appointment
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Box */}
            <section className="container mb-5" data-aos="fade-up">
                <div className="bg-primary rounded-4 p-5 text-white text-center position-relative overflow-hidden">
                    <div className="position-relative z-1">
                        <h2 className="display-6 fw-bold mb-3">Not sure what you need?</h2>
                        <p className="lead mb-4">Talk to our care coordinators to get a free assessment of your home care needs.</p>
                        <button className="btn btn-light rounded-pill px-5 py-3 fw-bold text-primary">
                            <i className="bi bi-telephone-fill me-2"></i> Call Us Now: +1 234 567 890
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomeCareLanding;
