import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./HomeCare.css";
import { homeCareAPI } from "../../services/api";

interface HomeCareService {
  id: number;
  title: string;
  description?: string;
  short_description?: string;
  long_description?: string;
  icon?: string;
  image?: string;
  is_24_7?: boolean;
  category?: string;
  is_active?: boolean;
  sort_order?: number;
  price?: string;
  benefits?: string[];
  rating?: number;
  reviews_count?: number;
}

interface HomeCareSettings {
  home_care_title?: string;
  home_care_subtitle?: string;
  home_care_desc?: string;
  home_care_cta?: string;
  home_care_image?: string;
  hero_title?: string;
  hero_subtitle?: string;
  hero_image?: string;
  features_title?: string;
  features_subtitle?: string;
  features_enabled?: string;
  professionals_title?: string;
  professionals_subtitle?: string;
  professionals_enabled?: string;
  cta_title?: string;
  cta_description?: string;
  cta_phone?: string;
  cta_enabled?: string;
  professionals_limit?: string;
}

const HomeCareLanding = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedService, setSelectedService] =
    useState<HomeCareService | null>(null);
  const [services, setServices] = useState<HomeCareService[]>([]);
  const [settings, setSettings] = useState<HomeCareSettings>({});
  const [doctors, setDoctors] = useState<any[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // First fetch services and settings
      const [servicesRes, settingsRes] = await Promise.all([
        homeCareAPI.getServices(),
        homeCareAPI.getSettings(),
      ]);

      if (servicesRes.data.success) {
        setServices(servicesRes.data.data || []);
      }

      let doctorsLimit = 4;
      if (settingsRes.data.success) {
        const loadedSettings = settingsRes.data.data || {};
        setSettings(loadedSettings);
        doctorsLimit = parseInt(loadedSettings.professionals_limit || "4", 10);
      }

      // Fetch assigned professionals from home care API
      try {
        const professionalsRes = await homeCareAPI.getProfessionals();
        if (professionalsRes.data.success) {
          // Use assigned professionals, limited by settings
          const assignedProfessionals = (
            professionalsRes.data.data || []
          ).slice(0, doctorsLimit);
          setDoctors(assignedProfessionals);
        }
      } catch (doctorErr) {
        console.error("Error fetching professionals:", doctorErr);
        // Don't fail the whole page if professionals fail to load
        setDoctors([]);
      }
    } catch (err: any) {
      console.error("Error fetching home care data:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load home care services. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        className="home-care-container d-flex justify-content-center align-items-center"
        style={{ minHeight: "80vh" }}
      >
        <div
          className="spinner-border text-primary"
          role="status"
          style={{ width: "3rem", height: "3rem" }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="home-care-container d-flex justify-content-center align-items-center"
        style={{ minHeight: "80vh" }}
      >
        <div className="text-center p-5">
          <i className="bi bi-exclamation-triangle display-1 text-warning mb-3 d-block"></i>
          <h4>Unable to Load Services</h4>
          <p className="text-muted mb-4">{error}</p>
          <button onClick={fetchData} className="btn btn-primary">
            <i className="bi bi-arrow-clockwise me-2"></i>Try Again
          </button>
        </div>
      </div>
    );
  }

  const heroImage =
    settings.hero_image ||
    settings.home_care_image ||
    "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=2070";
  const heroTitle =
    settings.hero_title ||
    settings.home_care_title ||
    "Healthcare at Your Doorstep";
  const heroSubtitle =
    settings.hero_subtitle ||
    settings.home_care_subtitle ||
    "Professional medical care in the comfort and safety of your own home.";

  return (
    <div className="home-care-container">
      {/* Hero Section */}
      <section
        className="hc-hero"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="container">
          <div className="hc-hero-content animate-fade-in">
            <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-2 mb-3 fw-bold border border-primary">
              NEW FEATURE
            </span>
            <h1>{heroTitle}</h1>
            <p>{heroSubtitle}</p>
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
            <h6 className="text-primary fw-bold text-uppercase tracking-wider mb-2">
              Capabilities
            </h6>
            <h2>{settings.features_title || "Our Home Care Services"}</h2>
            <p>
              {settings.features_subtitle ||
                settings.home_care_desc ||
                "Comprehensive healthcare solutions delivered to your doorstep by certified professionals."}
            </p>
          </div>

          {services.length > 0 ? (
            <div className="hc-card-grid">
              {services.map((service, index) => (
                <div
                  key={service.id}
                  className="hc-service-card"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  <div className="position-relative overflow-hidden">
                    <img
                      src={
                        service.image ||
                        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=2070"
                      }
                      alt={service.title}
                      className="hc-card-image"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=2070";
                      }}
                    />
                    {service.rating != null && (
                      <div className="position-absolute top-0 end-0 m-3">
                        <span className="badge bg-white text-primary rounded-pill shadow-sm py-2 px-3 fw-bold">
                          <i className="bi bi-star-fill text-warning me-1"></i>{" "}
                          {(() => {
                            const rating =
                              typeof service.rating === "number"
                                ? service.rating
                                : parseFloat(String(service.rating || "0"));
                            return isNaN(rating) ? "0.0" : rating.toFixed(1);
                          })()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="hc-card-body">
                    <div className="hc-card-icon">
                      <i className={`bi ${service.icon || "bi-activity"}`}></i>
                    </div>
                    <h3 className="hc-card-title">{service.title}</h3>
                    <p className="hc-card-text">
                      {service.short_description || service.description || ""}
                    </p>

                    {service.benefits && service.benefits.length > 0 && (
                      <div className="d-flex flex-wrap gap-2 mb-4">
                        {service.benefits.slice(0, 3).map((benefit, i) => (
                          <span
                            key={i}
                            className="badge bg-light text-dark fw-normal border"
                          >
                            {benefit}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="hc-card-footer mt-auto">
                      <div>
                        <span className="d-block text-muted small">
                          Starting from
                        </span>
                        <span className="hc-price">
                          {service.price || "Contact for pricing"}
                        </span>
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
              <p className="text-muted">
                We currently don't have any home care services listed. Please
                check back later.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Detail Modal */}
      {selectedService && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 overflow-hidden shadow-lg animate-fade-in mx-3">
              <div className="row g-0">
                <div className="col-md-5 d-none d-md-block">
                  <img
                    src={
                      selectedService.image ||
                      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=2070"
                    }
                    className="h-100 w-100 object-fit-cover"
                    alt={selectedService.title}
                    style={{ minHeight: "400px" }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=2070";
                    }}
                  />
                </div>
                <div className="col-md-7">
                  <div className="modal-header border-0 pb-0">
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setSelectedService(null)}
                    ></button>
                  </div>
                  <div className="modal-body p-4 pt-0">
                    <div className="hc-card-icon mb-3">
                      <i
                        className={`bi ${
                          selectedService.icon || "bi-activity"
                        }`}
                      ></i>
                    </div>
                    <h2 className="fw-bold mb-2">{selectedService.title}</h2>
                    <p className="text-muted mb-4">
                      {selectedService.long_description ||
                        selectedService.description ||
                        ""}
                    </p>

                    {selectedService.benefits &&
                      selectedService.benefits.length > 0 && (
                        <>
                          <h6 className="fw-bold mb-3">Key Benefits:</h6>
                          <div className="row g-2 mb-4">
                            {selectedService.benefits.map(
                              (benefit: string, i: number) => (
                                <div key={i} className="col-6">
                                  <div className="d-flex align-items-center gap-2">
                                    <i className="bi bi-patch-check-fill text-success"></i>
                                    <span className="small">{benefit}</span>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </>
                      )}

                    <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded-3">
                      <div>
                        <span className="small text-muted d-block">
                          Consultation Fee
                        </span>
                        <span className="h4 fw-bold text-primary mb-0">
                          {selectedService.price || "Contact for pricing"}
                        </span>
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
      {settings.features_enabled !== "false" && (
        <section className="hc-features">
          <div className="container">
            <div className="hc-section-title" data-aos="fade-up">
              <h2>
                {settings.features_title || "Why Choose Meditrust Home Care?"}
              </h2>
              <p>
                {settings.features_subtitle ||
                  "We bring hospital-grade care to your safe haven."}
              </p>
            </div>

            <div className="row g-4">
              <div className="col-md-4" data-aos="fade-up" data-aos-delay="100">
                <div className="hc-feature-box">
                  <i className="bi bi-shield-check hc-feature-icon"></i>
                  <h4>Verified Professionals</h4>
                  <p>
                    All our doctors and nurses are background-checked,
                    certified, and highly experienced.
                  </p>
                </div>
              </div>
              <div className="col-md-4" data-aos="fade-up" data-aos-delay="200">
                <div className="hc-feature-box">
                  <i className="bi bi-clock-history hc-feature-icon"></i>
                  <h4>24/7 Availability</h4>
                  <p>
                    Round-the-clock support for emergencies and scheduled visits
                    whenever you need them.
                  </p>
                </div>
              </div>
              <div className="col-md-4" data-aos="fade-up" data-aos-delay="300">
                <div className="hc-feature-box">
                  <i className="bi bi-heart-pulse hc-feature-icon"></i>
                  <h4>Personalized Care</h4>
                  <p>
                    Tailored care plans designed specifically for your unique
                    health requirements.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Meet Professionals - Linked to doctors database */}
      {settings.professionals_enabled !== "false" && (
        <section className="py-5 mb-5">
          <div className="container">
            <div className="hc-section-title" data-aos="fade-up">
              <h2>
                {settings.professionals_title || "Meet Our Top Professionals"}
              </h2>
              <p>
                {settings.professionals_subtitle ||
                  "Dedicated experts ready to visit you at home."}
              </p>
            </div>

            {doctors.length > 0 ? (
              <div className="row g-4 justify-content-center">
                {doctors.map((doctor, index) => {
                  const getImageUrl = (path: string | null) => {
                    if (!path)
                      return (
                        "https://ui-avatars.com/api/?name=" +
                        encodeURIComponent(
                          `${doctor.first_name} ${doctor.last_name}`
                        ) +
                        "&background=0D8ABC&color=fff&size=256"
                      );
                    if (path.startsWith("http")) return path;
                    const API_URL =
                      import.meta.env.VITE_API_BASE_URL ||
                      "http://localhost:8000/api";
                    return API_URL.replace("/api", "") + "/storage/" + path;
                  };

                  const getAvailability = () => {
                    // Use home care specific availability if provided
                    if (doctor.home_care_availability) {
                      return doctor.home_care_availability;
                    }
                    // Fallback to working days
                    if (
                      doctor.working_days &&
                      Array.isArray(doctor.working_days) &&
                      doctor.working_days.length > 0
                    ) {
                      return doctor.working_days.join(", ");
                    }
                    if (
                      doctor.working_hours_start &&
                      doctor.working_hours_end
                    ) {
                      return "Available";
                    }
                    return "Contact for availability";
                  };

                  const getRating = () => {
                    // Use home care rating if provided, otherwise calculate default
                    if (doctor.rating != null) {
                      return typeof doctor.rating === "number"
                        ? doctor.rating.toFixed(1)
                        : parseFloat(String(doctor.rating || "0")).toFixed(1);
                    }
                    // Calculate based on experience
                    const defaultRating =
                      4.5 + (doctor.experience_years || 0) * 0.05;
                    return Math.min(5.0, defaultRating).toFixed(1);
                  };

                  return (
                    <div
                      key={doctor.id}
                      className="col-md-4 col-lg-3"
                      data-aos="zoom-in"
                      data-aos-delay={index * 100}
                    >
                      <div className="card border-0 shadow-sm h-100 rounded-4 overflow-hidden hc-prof-card">
                        <div className="position-relative">
                          <img
                            src={getImageUrl(doctor.profile_picture)}
                            className="card-img-top"
                            alt={`${doctor.first_name} ${doctor.last_name}`}
                            style={{ height: "280px", objectFit: "cover" }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://ui-avatars.com/api/?name=" +
                                encodeURIComponent(
                                  `${doctor.first_name} ${doctor.last_name}`
                                ) +
                                "&background=0D8ABC&color=fff&size=256";
                            }}
                          />
                          <div className="position-absolute bottom-0 start-0 w-100 p-3 bg-gradient-dark text-white">
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="badge bg-success small">
                                <i className="bi bi-star-fill me-1"></i>
                                {getRating()}
                              </span>
                              <span className="small">
                                {doctor.experience_years || 0}{" "}
                                {doctor.experience_years === 1
                                  ? "Year"
                                  : "Years"}{" "}
                                Exp.
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="card-body text-center p-4">
                          <h5 className="card-title fw-bold text-dark mb-1">
                            Dr. {doctor.first_name} {doctor.last_name}
                          </h5>
                          <p className="card-text text-primary small fw-semibold mb-3">
                            {doctor.specialization || "General Physician"}
                          </p>
                          <div className="d-flex justify-content-center gap-2 mb-3">
                            <span className="small text-muted">
                              <i className="bi bi-clock me-1"></i>{" "}
                              {getAvailability()}
                            </span>
                          </div>
                          <Link
                            to={`/home-care/booking?doctor=${doctor.id}`}
                            className="btn btn-outline-primary btn-sm rounded-pill px-4 w-100 fw-bold"
                          >
                            Book Appointment
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-person-x display-1 text-muted mb-3 d-block"></i>
                <p className="text-muted">
                  No professionals available at the moment. Please check back
                  later.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA Box */}
      {settings.cta_enabled !== "false" && (
        <section className="container mb-5" data-aos="fade-up">
          <div className="bg-primary rounded-4 p-5 text-white text-center position-relative overflow-hidden">
            <div className="position-relative z-1">
              <h2 className="display-6 fw-bold mb-3">
                {settings.cta_title || "Not sure what you need?"}
              </h2>
              <p className="lead mb-4">
                {settings.cta_description ||
                  "Talk to our care coordinators to get a free assessment of your home care needs."}
              </p>
              {settings.cta_phone && (
                <a
                  href={`tel:${settings.cta_phone}`}
                  className="btn btn-light rounded-pill px-5 py-3 fw-bold text-primary"
                >
                  <i className="bi bi-telephone-fill me-2"></i> Call Us Now:{" "}
                  {settings.cta_phone}
                </a>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomeCareLanding;
