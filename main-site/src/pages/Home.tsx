import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import axios from "axios";
import { homeCareAPI } from "../services/api";
import "../billing-toggle.css";

interface HealthPackage {
  id: number;
  title: string;
  subtitle: string;
  price_monthly: number;
  price_yearly: number;
  features_monthly: string[];
  features_yearly: string[];
  featured: boolean;
}

const Home = () => {
  const [healthPackages, setHealthPackages] = useState<HealthPackage[]>([]);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );

  // Home Care State
  const [homeCareServices, setHomeCareServices] = useState<any[]>([]);
  const [homeCareSettings, setHomeCareSettings] = useState<any>({});

  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: "ease-in-out",
      once: true,
      mirror: false,
    });
    fetchPackages();
    fetchHomeCareData();
  }, []);

  const fetchHomeCareData = async () => {
    try {
      const [servicesRes, settingsRes] = await Promise.all([
        homeCareAPI.getServices(),
        homeCareAPI.getSettings(),
      ]);
      if (servicesRes.data.success)
        setHomeCareServices(servicesRes.data.data || []);
      if (settingsRes.data.success)
        setHomeCareSettings(settingsRes.data.data || {});
    } catch (err) {
      console.error("Error fetching home care data:", err);
    }
  };

  const fetchPackages = async () => {
    try {
      const API_URL =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
      const response = await axios.get(`${API_URL}/public/health-packages`);
      if (response.data.success) {
        setHealthPackages(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching health packages:", error);
    }
  };

  return (
    <div className="index-page">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        /* --- Global Button Theme Overrides --- */
        .btn-primary, .btn-primary:active, .btn-primary:focus {
          background-color: #049EBB !important;
          border-color: #049EBB !important;
          color: white !important;
        }
        .btn-primary:hover {
          background-color: #049cbbc4 !important;
          border-color: #049cbbc4 !important;
        }
        .btn-outline, .btn-outline:active, .btn-outline:focus {
          border: 2px solid #049EBB !important;
          color: #049EBB !important;
          background: transparent !important;
        }
        .btn-outline:hover {
          background: #049EBB !important;
          color: white !important;
        }
        .btn-outline-primary {
           color: #049EBB !important;
           border-color: #049EBB !important;
        }
        .btn-outline-primary:hover {
           background-color: #049EBB !important;
           color: white !important;
        }

        /* --- Home Care Button Specific Override --- */
        .home-care-btn, 
        .home-care-btn:hover, 
        .home-care-btn:focus, 
        .home-care-btn:active,
        .home-care-btn:visited {
            background-color: #049EBB !important;
            border-color: #049EBB !important;
            color: #ffffff !important;
            opacity: 1 !important;
            box-shadow: 0 4px 6px -1px rgba(4, 158, 187, 0.25) !important;
            outline: none !important;
        }
        .home-care-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 15px -3px rgba(4, 158, 187, 0.4) !important;
        }

        /* --- Modal Styles --- */
        .home-care-modal-overlay {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(8px);
          z-index: 9999;
          display: flex; align-items: center; justify-content: center;
          padding: 1rem;
          animation: fadeIn 0.3s ease;
        }
        .home-care-modal-content {
          background: #ffffff;
          width: 100%; margin: auto;
          max-width: 650px;
          border-radius: 20px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          padding: 0;
          max-height: 90vh;
          overflow: hidden;
          position: relative;
          display: flex; flex-direction: column;
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* --- Improved Scrollbar --- */
        .home-care-modal-content::-webkit-scrollbar {
          width: 10px;
        }
        .home-care-modal-content::-webkit-scrollbar-track {
          background: transparent;
          margin-top: 24px;
          margin-bottom: 24px;
        }
        .home-care-modal-content::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 20px;
          border: 3px solid transparent;
          background-clip: content-box;
        }
        .home-care-modal-content::-webkit-scrollbar-thumb:hover {
          background-color: #94a3b8;
        }

        /* --- Service Card Styles --- */
        .home-care-card {
            background: #ffffff;
            padding: 1.5rem;
            border-left: 4px solid #049EBB;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            /* border-radius already handled by bootstrap class, but we can enforce if needed */
        }
        
        .home-care-card h4 {
            color: #1e293b; font-weight: 700; margin-bottom: 0.5rem; transition: color 0.3s;
        }
        .home-care-card p {
            color: #64748b; transition: color 0.3s;
        }
        .home-care-card i {
            color: #049EBB; transition: color 0.3s;
        }
        
        .badge-24-7 {
             position: absolute; top: 15px; right: 15px; font-size: 0.7rem;
             background: rgba(4, 158, 187, 0.1);
             color: #049EBB;
             border: 1px solid rgba(4, 158, 187, 0.2);
             transition: all 0.3s;
        }

        /* Hover State */
        .home-care-card:hover {
            background: #049EBB;
            transform: translateY(-5px);
            box-shadow: 0 20px 25px -5px rgba(4, 158, 187, 0.25);
            border-left-color: rgba(255, 255, 255, 0.3);
        }

        .home-care-card:hover h4,
        .home-care-card:hover p,
        .home-care-card:hover i {
            color: #ffffff !important;
        }
        
        .home-care-card:hover .badge-24-7 {
            background: rgba(255, 255, 255, 0.2);
            color: #ffffff;
            border-color: rgba(255, 255, 255, 0.3);
        }

        .modal-header-custom {
          background: #049EBB;
          padding: 20px 30px;
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 0;
          color: white;
        }
        .modal-title-custom {
          font-size: 1.5rem; font-weight: 600; color: white; letter-spacing: -0.5px; margin: 0;
        }
        .btn-close-custom {
          background: transparent; border: none; width: auto; height: auto;
          padding: 0;
          display: flex; align-items: center; justify-content: center; cursor: pointer;
          transition: all 0.2s; color: white; font-size: 1.5rem;
        }
        .btn-close-custom:hover { opacity: 0.8; }
        
        .modal-body-custom {
            padding: 30px;
            overflow-y: auto;
            flex: 1;
        }
        
        .form-group-custom { margin-bottom: 1.5rem; }
        .form-label-custom {
          font-weight: 600; font-size: 0.925rem; color: #334155; margin-bottom: 0.5rem; display: block;
        }
        .form-control-custom {
          width: 100%; padding: 0.875rem 1rem;
          border: 2px solid #e2e8f0; border-radius: 10px;
          font-size: 1rem; color: #0f172a; transition: all 0.2s;
          background: #f8fafc;
        }
        .form-control-custom:focus {
          background: #fff; border-color: #049EBB; outline: none;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }
        
        .services-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem;
          margin-top: 0.5rem;
        }
        @media (max-width: 640px) {
          .services-grid { grid-template-columns: repeat(2, 1fr); }
        }
        .service-card-select {
          border: 2px solid #e2e8f0; border-radius: 16px; padding: 1rem;
          cursor: pointer; transition: all 0.2s; text-align: center;
          background: #fff; position: relative; overflow: hidden;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          min-height: 110px;
        }
        .service-card-select:hover { border-color: #cbd5e1; transform: translateY(-2px); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .service-card-select.active {
          border-color: #049EBB; background: #eff6ff; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
        }
        .service-card-select i { font-size: 1.75rem; color: #94a3b8; margin-bottom: 0.5rem; transition: color 0.2s; }
        .service-card-select.active i { color: #049EBB; }
        .service-card-select h5 { font-size: 0.95rem; font-weight: 600; color: #334155; margin: 0; line-height: 1.3; }
        .service-card-select.active h5 { color: #1e293b; }
        .check-badge {
          position: absolute; top: 10px; right: 10px; width: 20px; height: 20px;
          background: #049EBB; border-radius: 50%; display: flex; align-items: center; justify-content: center;
          color: white; font-size: 0.75rem; transform: scale(0); transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .service-card-select.active .check-badge { transform: scale(1); }

        .btn-submit-custom {
          background-color: #049EBB !important;
          color: white; border: none; padding: 1rem 2rem; border-radius: 10px;
          font-weight: 600; font-size: 1rem; width: 100%; box-shadow: 0 4px 6px -1px rgba(4, 158, 187, 0.25);
          transition: all 0.2s;
        }
        .btn-submit-custom:hover, .btn-submit-custom:active, .btn-submit-custom:focus {
          background-color: #049EBB !important;
          transform: translateY(-1px);
          box-shadow: 0 10px 15px -3px rgba(4, 158, 187, 0.3);
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        `,
        }}
      />
      {/* Hero Section */}
      <section id="hero" className="hero section dark-background">
        <div className="container-fluid p-0">
          <div className="hero-wrapper">
            <div className="hero-image">
              <img
                src="/assets/img/health/showcase-1.webp"
                alt="Advanced Healthcare"
                className="img-fluid"
              />
            </div>

            <div className="hero-content">
              <div className="container">
                <div className="row">
                  <div
                    className="col-lg-7 col-md-10"
                    data-aos="fade-right"
                    data-aos-delay="100"
                  >
                    <div className="content-box">
                      <span
                        className="badge-accent"
                        data-aos="fade-up"
                        data-aos-delay="150"
                      >
                        Leading Healthcare Specialists
                      </span>
                      <h1 data-aos="fade-up" data-aos-delay="200">
                        Advanced Medical Care for Your Family's Health
                      </h1>
                      <p data-aos="fade-up" data-aos-delay="250">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Ut elit tellus, luctus nec ullamcorper mattis, pulvinar
                        dapibus leo.
                      </p>

                      <div
                        className="cta-group"
                        data-aos="fade-up"
                        data-aos-delay="300"
                      >
                        <Link
                          to="/quickappointment"
                          className="btn btn-primary"
                        >
                          Book Appointment
                        </Link>
                        <Link to="/services" className="btn btn-outline">
                          Explore Services
                        </Link>
                      </div>

                      <div
                        className="info-badges"
                        data-aos="fade-up"
                        data-aos-delay="350"
                      >
                        <div className="badge-item">
                          <i className="bi bi-telephone-fill"></i>
                          <div className="badge-content">
                            <span>Emergency Line</span>
                            <strong>+1 (555) 987-6543</strong>
                          </div>
                        </div>
                        <div className="badge-item">
                          <i className="bi bi-clock-fill"></i>
                          <div className="badge-content">
                            <span>Working Hours</span>
                            <strong>Mon-Fri: 8AM-8PM</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="features-wrapper">
                  <div className="row gy-4">
                    <div className="col-lg-4">
                      <div
                        className="feature-item"
                        data-aos="fade-up"
                        data-aos-delay="450"
                      >
                        <div className="feature-icon">
                          <i className="bi bi-heart-pulse-fill"></i>
                        </div>
                        <div className="feature-text">
                          <h3>Cardiology</h3>
                          <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-4">
                      <div
                        className="feature-item"
                        data-aos="fade-up"
                        data-aos-delay="500"
                      >
                        <div className="feature-icon">
                          <i className="bi bi-lungs-fill"></i>
                        </div>
                        <div className="feature-text">
                          <h3>Pulmonology</h3>
                          <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-4">
                      <div
                        className="feature-item"
                        data-aos="fade-up"
                        data-aos-delay="550"
                      >
                        <div className="feature-icon">
                          <i className="bi bi-capsule"></i>
                        </div>
                        <div className="feature-text">
                          <h3>Diagnostics</h3>
                          <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services Section */}
      <section
        id="featured-services"
        className="featured-services section light-background"
      >
        <div className="container section-title" data-aos="fade-up">
          <h2>Featured Services</h2>
          <p>
            Necessitatibus eius consequatur ex aliquid fuga eum quidem sint
            consectetur velit
          </p>
        </div>

        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row gy-4">
            {[
              {
                icon: "fa-heartbeat",
                title: "Cardiology Excellence",
                desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.",
                features: [
                  "Advanced Heart Surgery",
                  "24/7 Emergency Care",
                  "Preventive Screenings",
                ],
              },
              {
                icon: "fa-brain",
                title: "Neurology & Brain Health",
                desc: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse.",
                features: [
                  "Brain Imaging & Diagnostics",
                  "Stroke Treatment Center",
                  "Neurological Rehabilitation",
                ],
              },
              {
                icon: "fa-bone",
                title: "Orthopedic Surgery",
                desc: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error.",
                features: [
                  "Joint Replacement Surgery",
                  "Sports Medicine",
                  "Minimally Invasive Procedures",
                ],
              },
              {
                icon: "fa-ambulance",
                title: "Emergency & Trauma Care",
                desc: "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
                features: [
                  "24/7 Emergency Department",
                  "Level 1 Trauma Center",
                  "Critical Care Units",
                ],
              },
            ].map((service, idx) => (
              <div
                key={idx}
                className="col-lg-6"
                data-aos="fade-up"
                data-aos-delay={200 + idx * 100}
              >
                <div className="service-card">
                  <div className="service-icon">
                    <i className={`fas ${service.icon}`}></i>
                  </div>
                  <div className="service-content">
                    <h3>{service.title}</h3>
                    <p>{service.desc}</p>
                    <ul className="service-features">
                      {service.features.map((feature, fIdx) => (
                        <li key={fIdx}>
                          <i className="fas fa-check-circle"></i>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link to="/services" className="service-btn">
                      Learn More
                      <i className="fas fa-arrow-right"></i>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Find A Doctor Section */}
      <section id="find-a-doctor" className="find-a-doctor section">
        <div className="container section-title" data-aos="fade-up">
          <h2>Find A Doctor</h2>
          <p>
            Necessitatibus eius consequatur ex aliquid fuga eum quidem sint
            consectetur velit
          </p>
        </div>

        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div
            className="row justify-content-center"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            <div className="col-lg-12">
              <div className="search-container">
                <form
                  className="search-form"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <div className="row g-3">
                    <div className="col-md-4">
                      <input
                        type="text"
                        className="form-control"
                        name="doctor_name"
                        placeholder="Doctor name or keyword"
                      />
                    </div>
                    <div className="col-md-4">
                      <select
                        className="form-select"
                        name="specialty"
                        id="specialty-select"
                      >
                        <option value="">Select Specialty</option>
                        <option value="cardiology">Cardiology</option>
                        <option value="neurology">Neurology</option>
                        <option value="orthopedics">Orthopedics</option>
                        <option value="pediatrics">Pediatrics</option>
                        <option value="dermatology">Dermatology</option>
                        <option value="oncology">Oncology</option>
                        <option value="surgery">Surgery</option>
                        <option value="emergency">Emergency Medicine</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <button type="submit" className="btn btn-primary w-100">
                        <i className="bi bi-search me-2"></i>Search Doctor
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="row" data-aos="fade-up" data-aos-delay="400">
            {[
              {
                img: "staff-3.webp",
                name: "Dr. Sarah Mitchell",
                specialty: "Cardiology",
                exp: "15+ years experience",
                rating: 4.9,
                stars: 5,
                badge: "Available",
                badgeClass: "online",
              },
              {
                img: "staff-7.webp",
                name: "Dr. Michael Rodriguez",
                specialty: "Neurology",
                exp: "12+ years experience",
                rating: 4.7,
                stars: 4.5,
                badge: "In Surgery",
                badgeClass: "busy",
              },
              {
                img: "staff-1.webp",
                name: "Dr. Emily Chen",
                specialty: "Pediatrics",
                exp: "8+ years experience",
                rating: 5.0,
                stars: 5,
                badge: "Available",
                badgeClass: "online",
              },
              {
                img: "staff-9.webp",
                name: "Dr. James Thompson",
                specialty: "Orthopedics",
                exp: "20+ years experience",
                rating: 4.8,
                stars: 4.5,
                badge: "Next: Tomorrow 9AM",
                badgeClass: "offline",
              },
              {
                img: "staff-5.webp",
                name: "Dr. Lisa Anderson",
                specialty: "Dermatology",
                exp: "10+ years experience",
                rating: 4.6,
                stars: 4,
                badge: "Available",
                badgeClass: "online",
              },
              {
                img: "staff-12.webp",
                name: "Dr. Robert Kim",
                specialty: "Oncology",
                exp: "18+ years experience",
                rating: 4.9,
                stars: 5,
                badge: "Available",
                badgeClass: "online",
              },
            ].map((doctor, idx) => (
              <div key={idx} className="col-lg-4 col-md-6 mb-4">
                <div className="doctor-card">
                  <div className="doctor-image">
                    <img
                      src={`/assets/img/health/${doctor.img}`}
                      alt={doctor.name}
                      className="img-fluid"
                    />
                    <div className={`availability-badge ${doctor.badgeClass}`}>
                      {doctor.badge}
                    </div>
                  </div>
                  <div className="doctor-info">
                    <h5>{doctor.name}</h5>
                    <p className="specialty">{doctor.specialty}</p>
                    <p className="experience">{doctor.exp}</p>
                    <div className="rating">
                      {[...Array(5)].map((_, i) => (
                        <i
                          key={i}
                          className={`bi bi-star${
                            i < Math.floor(doctor.stars)
                              ? "-fill"
                              : i < doctor.stars
                              ? "-half"
                              : ""
                          }`}
                        ></i>
                      ))}
                      <span className="rating-text">({doctor.rating})</span>
                    </div>
                    <div className="appointment-actions">
                      <a href="#" className="btn btn-outline-primary btn-sm">
                        View Profile
                      </a>
                      <Link
                        to="/quickappointment"
                        className="btn btn-primary btn-sm"
                      >
                        Book Appointment
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call To Action Section */}
      <section id="call-to-action" className="call-to-action section">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <h2 data-aos="fade-up" data-aos-delay="200">
                Your Health is Our Priority
              </h2>
              <p data-aos="fade-up" data-aos-delay="250">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris.
              </p>

              <div
                className="cta-buttons"
                data-aos="fade-up"
                data-aos-delay="300"
              >
                <Link to="/quickappointment" className="btn-primary">
                  Book Appointment
                </Link>
                <Link to="/doctors" className="btn-secondary">
                  Find a Doctor
                </Link>
              </div>
            </div>
          </div>

          <div
            className="row features-row"
            data-aos="fade-up"
            data-aos-delay="400"
          >
            {[
              {
                icon: "bi-heart-pulse",
                title: "24/7 Emergency Care",
                desc: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.",
                link: "Learn More",
              },
              {
                icon: "bi-calendar-check",
                title: "Easy Online Booking",
                desc: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
                link: "Book Now",
              },
              {
                icon: "bi-people",
                title: "Expert Medical Team",
                desc: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim.",
                link: "Meet Our Doctors",
              },
            ].map((feature, idx) => (
              <div key={idx} className="col-lg-4 col-md-6 mb-4">
                <div className="feature-card">
                  <div className="icon-wrapper">
                    <i className={feature.icon}></i>
                  </div>
                  <h5>{feature.title}</h5>
                  <p>{feature.desc}</p>
                  <a href="#" className="feature-link">
                    <span>{feature.link}</span>
                    <i className="bi bi-arrow-right"></i>
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div
            className="emergency-alert"
            data-aos="zoom-in"
            data-aos-delay="500"
          >
            <div className="row align-items-center">
              <div className="col-lg-8">
                <div className="emergency-content">
                  <div className="emergency-icon">
                    <i className="bi bi-telephone-fill"></i>
                  </div>
                  <div className="emergency-text">
                    <h4>Medical Emergency?</h4>
                    <p>
                      Call our 24/7 emergency hotline for immediate assistance
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 text-end">
                <a href="tel:911" className="emergency-btn">
                  <i className="bi bi-telephone-fill"></i>
                  Call (555) 123-4567
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Departments Section */}
      <section
        id="featured-departments"
        className="featured-departments section"
      >
        <div className="container section-title" data-aos="fade-up">
          <h2>Featured Departments</h2>
          <p>
            Necessitatibus eius consequatur ex aliquid fuga eum quidem sint
            consectetur velit
          </p>
        </div>

        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row gy-4">
            {[
              {
                img: "cardiology-3.webp",
                icon: "fa-heartbeat",
                title: "Cardiology",
                desc: "Comprehensive cardiovascular care with advanced diagnostic techniques and treatment options for heart conditions, ensuring optimal cardiac health for all patients.",
              },
              {
                img: "neurology-2.webp",
                icon: "fa-brain",
                title: "Neurology",
                desc: "Expert neurological care specializing in brain and nervous system disorders, providing cutting-edge treatments and compassionate support for neurological conditions.",
              },
              {
                img: "orthopedics-4.webp",
                icon: "fa-bone",
                title: "Orthopedics",
                desc: "Advanced musculoskeletal care focusing on bones, joints, and muscles with innovative surgical and non-surgical treatment approaches for mobility restoration.",
              },
              {
                img: "pediatrics-3.webp",
                icon: "fa-baby",
                title: "Pediatrics",
                desc: "Specialized healthcare for children from infancy through adolescence, offering comprehensive medical care in a child-friendly environment with experienced pediatric specialists.",
              },
              {
                img: "oncology-4.webp",
                icon: "fa-shield-alt",
                title: "Oncology",
                desc: "Comprehensive cancer care with multidisciplinary approach, offering advanced treatment options, clinical trials, and compassionate support throughout the cancer journey.",
              },
              {
                img: "emergency-2.webp",
                icon: "fa-ambulance",
                title: "Emergency Care",
                desc: "Round-the-clock emergency medical services with rapid response capabilities, state-of-the-art equipment, and experienced emergency physicians for critical care.",
              },
            ].map((dept, idx) => (
              <div
                key={idx}
                className="col-lg-4 col-md-6"
                data-aos="fade-up"
                data-aos-delay={100 + idx * 100}
              >
                <div className="department-card">
                  <div className="department-image">
                    <img
                      src={`/assets/img/health/${dept.img}`}
                      alt={`${dept.title} Department`}
                      className="img-fluid"
                    />
                  </div>
                  <div className="department-content">
                    <div className="department-icon">
                      <i className={`fas ${dept.icon}`}></i>
                    </div>
                    <h3>{dept.title}</h3>
                    <p>{dept.desc}</p>
                    <Link to="/department-details" className="btn-learn-more">
                      <span>Learn More</span>
                      <i className="fas fa-arrow-right"></i>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Home About Section */}
      <section id="home-about" className="home-about section">
        <div className="container section-title" data-aos="fade-up">
          <h2>About Us</h2>
          <p>
            Necessitatibus eius consequatur ex aliquid fuga eum quidem sint
            consectetur velit
          </p>
        </div>

        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row gy-5 align-items-center">
            <div
              className="col-lg-6"
              data-aos="fade-right"
              data-aos-delay="200"
            >
              <div className="about-image">
                <img
                  src="/assets/img/health/facilities-1.webp"
                  alt="Modern Healthcare Facility"
                  className="img-fluid rounded-3 mb-4"
                />
                <div className="experience-badge">
                  <span className="years">25+</span>
                  <span className="text">Years of Excellence</span>
                </div>
              </div>
            </div>

            <div className="col-lg-6" data-aos="fade-left" data-aos-delay="300">
              <div className="about-content">
                <h2>Committed to Exceptional Patient Care</h2>
                <p className="lead">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut
                  elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus
                  leo.
                </p>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
                  consequat magna eu accumsan mattis. Duis non augue in tortor
                  facilisis tincidunt ac sit amet sapien. Suspendisse id risus
                  non nisi sodales condimentum.
                </p>

                <div className="row g-4 mt-4">
                  <div
                    className="col-md-6"
                    data-aos="fade-up"
                    data-aos-delay="400"
                  >
                    <div className="feature-item">
                      <div className="icon">
                        <i className="bi bi-heart-pulse"></i>
                      </div>
                      <h4>Compassionate Care</h4>
                      <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      </p>
                    </div>
                  </div>

                  <div
                    className="col-md-6"
                    data-aos="fade-up"
                    data-aos-delay="500"
                  >
                    <div className="feature-item">
                      <div className="icon">
                        <i className="bi bi-star"></i>
                      </div>
                      <h4>Medical Excellence</h4>
                      <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="cta-wrapper mt-4">
                  <Link to="/about" className="btn btn-primary">
                    Learn More About Us
                  </Link>
                  <Link to="/doctors" className="btn btn-outline">
                    Meet Our Team
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div
            className="row mt-5 pt-4 certifications-row"
            data-aos="fade-up"
            data-aos-delay="600"
          >
            <div className="col-12 text-center mb-4">
              <h4 className="certification-title">Our Accreditations</h4>
            </div>
            <div className="col-12">
              <div className="certifications">
                <div
                  className="certification-item"
                  data-aos="zoom-in"
                  data-aos-delay="700"
                >
                  <img
                    src="/assets/img/clients/clients-1.webp"
                    alt="Certification"
                  />
                </div>
                <div
                  className="certification-item"
                  data-aos="zoom-in"
                  data-aos-delay="800"
                >
                  <img
                    src="/assets/img/clients/clients-2.webp"
                    alt="Certification"
                  />
                </div>
                <div
                  className="certification-item"
                  data-aos="zoom-in"
                  data-aos-delay="900"
                >
                  <img
                    src="/assets/img/clients/clients-3.webp"
                    alt="Certification"
                  />
                </div>
                <div
                  className="certification-item"
                  data-aos="zoom-in"
                  data-aos-delay="1000"
                >
                  <img
                    src="/assets/img/clients/clients-4.webp"
                    alt="Certification"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Emergency Info Section */}
      <section id="emergency-info" className="emergency-info section">
        <div className="container section-title" data-aos="fade-up">
          <h2>Emergency Info</h2>
          <p>
            Necessitatibus eius consequatur ex aliquid fuga eum quidem sint
            consectetur velit
          </p>
        </div>

        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row">
            <div className="col-lg-8 col-md-10 mx-auto">
              <div
                className="emergency-alert"
                data-aos="zoom-in"
                data-aos-delay="100"
              >
                <div className="alert-icon">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                </div>
                <div className="alert-content">
                  <h3>Medical Emergency?</h3>
                  <p>
                    If you are experiencing a life-threatening emergency, call
                    911 immediately or go to your nearest emergency room.
                  </p>
                </div>
                <div className="alert-action">
                  <a href="tel:911" className="btn btn-emergency">
                    <i className="bi bi-telephone-fill"></i>
                    Call 911
                  </a>
                </div>
              </div>

              <div
                className="row emergency-contacts"
                data-aos="fade-up"
                data-aos-delay="200"
              >
                {[
                  {
                    icon: "bi-hospital",
                    title: "Emergency Room",
                    phone: "+1 (555) 123-4567",
                    address: "1245 Healthcare Blvd, Medical City, CA 90210",
                    hours: "Open 24/7",
                    urgent: true,
                  },
                  {
                    icon: "bi-clock",
                    title: "Urgent Care",
                    phone: "+1 (555) 987-6543",
                    address: "892 Wellness Ave, Health District, CA 90211",
                    hours: "Mon-Sun: 7:00 AM - 10:00 PM",
                  },
                  {
                    icon: "bi-headset",
                    title: "Nurse Helpline",
                    phone: "+1 (555) 456-7890",
                    desc: "24/7 medical advice and guidance",
                    hours: "Available 24/7",
                  },
                  {
                    icon: "bi-heart-pulse",
                    title: "Poison Control",
                    phone: "1-800-222-1222",
                    desc: "National poison control hotline",
                    hours: "Available 24/7",
                  },
                ].map((contact, idx) => (
                  <div key={idx} className="col-md-6 mb-4">
                    <div
                      className={`contact-card ${
                        contact.urgent ? "urgent" : ""
                      }`}
                    >
                      <div className="card-icon">
                        <i className={contact.icon}></i>
                      </div>
                      <div className="card-content">
                        <h4>{contact.title}</h4>
                        <p className="contact-info">
                          <i className="bi bi-telephone"></i>
                          <span>{contact.phone}</span>
                        </p>
                        {contact.address && (
                          <p className="address">
                            <i className="bi bi-geo-alt"></i>
                            {contact.address}
                          </p>
                        )}
                        {contact.desc && (
                          <p className="description">{contact.desc}</p>
                        )}
                        <p className="hours">{contact.hours}</p>
                      </div>
                      <div className="card-action">
                        <a
                          href={`tel:${contact.phone.replace(/\D/g, "")}`}
                          className="btn btn-contact"
                        >
                          Call Now
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="quick-actions"
                data-aos="fade-up"
                data-aos-delay="300"
              >
                <h4>Quick Actions</h4>
                <div className="row">
                  {[
                    { icon: "bi-geo-alt-fill", text: "Get Directions" },
                    { icon: "bi-calendar-check", text: "Book Appointment" },
                    { icon: "bi-person-badge", text: "Find a Doctor" },
                    { icon: "bi-chat-dots", text: "Live Chat" },
                  ].map((action, idx) => (
                    <div key={idx} className="col-sm-6 col-lg-3">
                      <a href="#" className="action-link">
                        <i className={action.icon}></i>
                        <span>{action.text}</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="emergency-tips"
                data-aos="fade-up"
                data-aos-delay="400"
              >
                <h4>When to Seek Emergency Care</h4>
                <div className="row">
                  <div className="col-md-6">
                    <ul className="emergency-list">
                      <li>
                        <i className="bi bi-check-circle"></i> Chest pain or
                        difficulty breathing
                      </li>
                      <li>
                        <i className="bi bi-check-circle"></i> Severe allergic
                        reactions
                      </li>
                      <li>
                        <i className="bi bi-check-circle"></i> Major trauma or
                        injuries
                      </li>
                      <li>
                        <i className="bi bi-check-circle"></i> Signs of stroke
                        or heart attack
                      </li>
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <ul className="emergency-list">
                      <li>
                        <i className="bi bi-check-circle"></i> Severe burns or
                        bleeding
                      </li>
                      <li>
                        <i className="bi bi-check-circle"></i> Loss of
                        consciousness
                      </li>
                      <li>
                        <i className="bi bi-check-circle"></i> Severe abdominal
                        pain
                      </li>
                      <li>
                        <i className="bi bi-check-circle"></i> High fever with
                        confusion
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- NEW SECTION: Home Care Services --- */}
      <section id="home-care" className="home-care section">
        <div className="container" data-aos="fade-up">
          <div className="row align-items-center gy-5">
            <div
              className="col-lg-6"
              data-aos="fade-right"
              data-aos-delay="100"
            >
              <div className="home-care-content">
                <span className="home-care-badge">
                  {homeCareSettings.home_care_subtitle || "Hospital at Home"}
                </span>
                <h2 className="home-care-title">
                  {homeCareSettings.home_care_title ||
                    "Professional Home Care Services"}
                </h2>
                <p className="home-care-description">
                  {homeCareSettings.home_care_desc ||
                    "We bring world-class medical assistance to your doorstep. Perfect for post-surgery recovery, elderly care, or chronic disease management."}
                </p>

                <div className="row g-4 mb-4">
                  {homeCareServices.length > 0 ? (
                    homeCareServices.map((service, idx) => (
                      <div className="col-md-6" key={idx}>
                        <div className="home-care-card rounded-3 h-100 position-relative">
                          {service.is_24_7 && (
                            <span className="badge-24-7 px-2 py-1 rounded-pill fw-bold d-flex align-items-center">
                              <i className="bi bi-clock-history me-1"></i>24/7
                            </span>
                          )}
                          <i
                            className={`bi ${
                              service.icon || "bi-activity"
                            } fs-3 mb-2 d-block`}
                          ></i>
                          <h4>{service.title}</h4>
                          <p className="m-0 small text-muted">
                            {service.description}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-12">
                      <p>Loading services...</p>
                    </div>
                  )}
                </div>

                <Link
                  to="/home-care"
                  className="btn btn-primary btn-lg rounded-pill home-care-btn px-5 py-3 fw-bold"
                >
                  {homeCareSettings.home_care_cta || "Schedule Home Visit"}
                </Link>
              </div>
            </div>

            <div className="col-lg-6" data-aos="fade-left" data-aos-delay="200">
              <div className="home-care-img-wrapper ps-lg-5">
                <img
                  src={
                    homeCareSettings.home_care_image ||
                    "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=2070&auto=format&fit=crop"
                  }
                  alt="Medical professional"
                  className="img-fluid w-100 object-fit-cover"
                  style={{ borderRadius: "20px", minHeight: "400px" }}
                />
                <div className="floating-badge">
                  <div className="icon-box rounded-circle d-flex align-items-center justify-content-center text-white">
                    <i className="bi bi-clock-history fs-4"></i>
                  </div>
                  <div>
                    <strong className="d-block text-dark">
                      Available 24/7
                    </strong>
                    <span className="text-muted small">For Emergencies</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- REDESIGNED: Health Packages Section --- */}
      <section id="packages" className="packages section">
        <div className="container section-title text-center" data-aos="fade-up">
          <h2>Exclusive Health Packages</h2>
          <p>Preventive care tailored for every stage of life.</p>

          <div className="d-flex justify-content-center mt-4">
            <div className="billing-toggle-wrapper">
              <div
                className={`billing-option ${
                  billingCycle === "monthly" ? "active" : ""
                }`}
                onClick={() => setBillingCycle("monthly")}
              >
                Monthly
              </div>
              <div
                className={`billing-option ${
                  billingCycle === "yearly" ? "active" : ""
                }`}
                onClick={() => setBillingCycle("yearly")}
              >
                Yearly
                {/* <span className="discount-badge">Save 20%</span> */}
              </div>
              <div
                className={`slider-bg ${
                  billingCycle === "yearly" ? "slide-right" : ""
                }`}
              ></div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="row gy-4 align-items-center justify-content-center">
            {healthPackages.map((pkg, idx) => (
              <div
                className="col-lg-4 col-md-6"
                key={pkg.id}
                data-aos="fade-up"
                data-aos-delay={100 * (idx + 1)}
              >
                <div
                  className={`package-card ${pkg.featured ? "featured" : ""}`}
                >
                  {pkg.featured && (
                    <div className="popular-badge">Best Value</div>
                  )}

                  <h3 className="package-title">{pkg.title}</h3>
                  <p className="package-subtitle">{pkg.subtitle}</p>

                  <div className="package-price">
                    <sup>$</sup>
                    {billingCycle === "monthly"
                      ? pkg.price_monthly
                      : pkg.price_yearly || pkg.price_monthly * 10}
                    <span>
                      /{billingCycle === "monthly" ? "month" : "year"}
                    </span>
                  </div>

                  <hr />

                  <ul className="package-features">
                    {(billingCycle === "monthly"
                      ? pkg.features_monthly
                      : pkg.features_yearly
                    )?.map((f, i) => (
                      <li key={i}>
                        <i className="bi bi-check-circle-fill me-2"></i>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to="/book-package"
                    className={`btn-package ${
                      pkg.featured ? "filled" : "outline"
                    }`}
                  >
                    {billingCycle === "monthly"
                      ? "Book Monthly Plan"
                      : "Book Yearly Plan"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- REDESIGNED: Workflow / Process Section --- */}
      <section id="workflow" className="workflow section">
        <div className="container section-title text-center" data-aos="fade-up">
          <h2>Simple Steps to Better Health</h2>
          <p>We have streamlined the process to save your time.</p>
        </div>

        <div className="container">
          <div className="row gy-4">
            {[
              {
                step: "1",
                title: "Find Doctor",
                desc: "Search by name, specialty, or condition.",
                icon: "bi-search-heart",
              },
              {
                step: "2",
                title: "Book Slot",
                desc: "Choose a time that fits your schedule.",
                icon: "bi-calendar-date",
              },
              {
                step: "3",
                title: "Instant Confirm",
                desc: "Receive booking details via SMS/Email.",
                icon: "bi-patch-check",
              },
              {
                step: "4",
                title: "Visit Hospital",
                desc: "Skip the queue and get treated.",
                icon: "bi-hospital",
              },
            ].map((item, idx) => (
              <div
                className="col-lg-3 col-md-6"
                key={idx}
                data-aos="fade-up"
                data-aos-delay={100 * idx}
              >
                <div className="workflow-step">
                  <div className="step-icon">
                    <i className={`bi ${item.icon}`}></i>
                    <div className="step-count">{item.step}</div>
                  </div>
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Unique Testimonials Section */}
      <section
        id="testimonials"
        className="testimonials-section section"
        style={{ padding: "80px 0" }}
      >
        <div className="container" data-aos="fade-up">
          <div className="row g-5">
            {/* LEFT COLUMN: The "Trust Anchor" (Summary) */}
            <div className="col-lg-4" data-aos="fade-right">
              <div className="trust-summary-card">
                <h3 className="mb-4">Why Patients Trust Us</h3>
                <p className="opacity-75 mb-4">
                  Our commitment to excellence is reflected in the smiles of our
                  recovered patients.
                </p>

                <div className="mb-4">
                  <div className="total-rating-display">4.9</div>
                  <div className="star-row mb-2">
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                  </div>
                  <span className="text-white-50">Based on 2,400+ Reviews</span>
                </div>

                <hr style={{ borderColor: "rgba(255,255,255,0.1)" }} />

                <div className="d-flex align-items-center mt-3">
                  <div className="me-3">
                    <h2 className="mb-0 text-white">15k+</h2>
                  </div>
                  <div className="text-white-50 lh-sm">
                    Successful
                    <br />
                    Surgeries
                  </div>
                </div>

                <div className="mt-auto pt-5">
                  <button className="btn btn-light w-100 rounded-pill fw-bold text-dark">
                    Share Your Story
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: The Reviews Grid */}
            <div className="col-lg-8">
              <div className="row">
                <div className="col-12 mb-4">
                  <h2
                    style={{
                      color: "var(--heading-color)",
                      fontWeight: "bold",
                    }}
                  >
                    Patient Stories
                  </h2>
                  <p style={{ color: "var(--default-color)" }}>
                    Real experiences from real people.
                  </p>
                </div>
              </div>

              <div className="row g-4">
                {[
                  {
                    name: "Sarah Jenkins",
                    treatment: "Cardiology",
                    img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=2588&auto=format&fit=crop",
                    text: "Dr. Mitchell saved my life. The level of care I received during my heart surgery was phenomenal. The nurses were angels.",
                    delay: 100,
                  },
                  {
                    name: "Michael Ross",
                    treatment: "Orthopedics",
                    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=2574&auto=format&fit=crop",
                    text: "I was back on my feet in weeks after my knee replacement. The rehabilitation facility here is world-class.",
                    delay: 200,
                  },
                  {
                    name: "Emily & Baby Leo",
                    treatment: "Maternity",
                    img: "https://images.unsplash.com/photo-1554774853-d39f79c2a36a?q=80&w=2574&auto=format&fit=crop",
                    text: "Giving birth here was a dream. The private suites are comfortable and the midwives were so supportive throughout.",
                    delay: 300,
                  },
                  {
                    name: "David Chen",
                    treatment: "Neurology",
                    img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=2574&auto=format&fit=crop",
                    text: "Professional, clean, and efficient. I never had to wait long for my appointments, and the diagnosis was spot on.",
                    delay: 400,
                  },
                ].map((review, idx) => (
                  <div
                    className="col-md-6"
                    key={idx}
                    data-aos="fade-up"
                    data-aos-delay={review.delay}
                  >
                    <div className="review-card-premium h-100">
                      <div className="review-card-qoute">
                        <i className="bi bi-quote"></i>
                      </div>
                      <div className="patient-profile">
                        <div className="patient-img-container">
                          <img
                            src={review.img}
                            alt={review.name}
                            className="patient-img-premium"
                          />
                          <div className="verified-badge">
                            <i className="bi bi-patch-check-fill"></i>
                          </div>
                        </div>
                        <div className="patient-info">
                          <h5>{review.name}</h5>
                          <span className="treatment-tag">
                            {review.treatment}
                          </span>
                        </div>
                      </div>
                      <p className="review-text-premium mt-3">
                        "{review.text}"
                      </p>
                      <div className="review-meta mt-auto pt-3 border-top border-light d-flex justify-content-between align-items-center">
                        <div className="star-row-premium">
                          {[...Array(5)].map((_, i) => (
                            <i key={i} className="bi bi-star-fill"></i>
                          ))}
                        </div>
                        <span className="review-date small text-muted">
                          Verified Patient
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
