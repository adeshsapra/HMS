import { useEffect } from "react";
import { Link } from "react-router-dom";
import AOS from "aos";

const Home = () => {
  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: "ease-in-out",
      once: true,
      mirror: false,
    });
  }, []);

  return (
    <div className="index-page">
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
                        <Link to="/appointment" className="btn btn-primary">
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
                          className={`bi bi-star${i < Math.floor(doctor.stars)
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
                        to="/appointment"
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
                <Link to="/appointment" className="btn-primary">
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
                      className={`contact-card ${contact.urgent ? "urgent" : ""
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

            <div className="col-lg-6" data-aos="fade-right" data-aos-delay="100">
              <div className="home-care-content">
                <span className="home-care-badge">
                  Hospital at Home
                </span>
                <h2 className="home-care-title">
                  Professional Home Care Services
                </h2>
                <p className="home-care-description">
                  We bring world-class medical assistance to your doorstep. Perfect for post-surgery recovery,
                  elderly care, or chronic disease management.
                </p>

                <div className="row g-4 mb-4">
                  {[
                    { title: "Nursing Care", desc: "Injections, wound dressing, and vitals monitoring.", icon: "bi-activity" },
                    { title: "Physiotherapy", desc: "Rehab sessions at the comfort of your home.", icon: "bi-person-arms-up" },
                    { title: "Medical Equipment", desc: "Oxygen, beds, and wheelchair rentals.", icon: "bi-tools" },
                    { title: "Lab at Home", desc: "Sample collection and instant reports.", icon: "bi-eyedropper" },
                  ].map((service, idx) => (
                    <div className="col-md-6" key={idx}>
                      <div className="home-care-card rounded-3 h-100">
                        <i className={`bi ${service.icon} fs-3 mb-2 d-block`}></i>
                        <h4>{service.title}</h4>
                        <p className="m-0 small text-muted">{service.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Link to="/home-care" className="btn btn-primary btn-lg rounded-pill home-care-btn">
                  Schedule Home Visit
                </Link>
              </div>
            </div>

            <div className="col-lg-6" data-aos="fade-left" data-aos-delay="200">
              <div className="home-care-img-wrapper ps-lg-5">
                <img
                  src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=2070&auto=format&fit=crop"
                  alt="Medical professional visiting patient at home"
                  className="img-fluid w-100 object-fit-cover"
                  style={{ borderRadius: '20px', minHeight: '400px' }}
                />
                <div className="floating-badge">
                  <div className="icon-box rounded-circle d-flex align-items-center justify-content-center text-white">
                    <i className="bi bi-clock-history fs-4"></i>
                  </div>
                  <div>
                    <strong className="d-block text-dark">Available 24/7</strong>
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
        </div>

        <div className="container">
          <div className="row gy-4 align-items-center justify-content-center">
            {[
              {
                title: "Basic Checkup",
                price: "99",
                subtitle: "For Individuals",
                features: ["Complete Blood Count (CBC)", "Blood Sugar Fasting", "Urine Routine Analysis", "General Physician Consult"],
                featured: false,
                delay: "100"
              },
              {
                title: "Comprehensive",
                price: "199",
                subtitle: "Most Recommended",
                features: ["All Basic Features", "Liver & Kidney Function", "Thyroid Profile", "ECG & Chest X-Ray", "Dental Screening"],
                featured: true,
                delay: "200"
              },
              {
                title: "Senior Citizen",
                price: "299",
                subtitle: "Advanced Care",
                features: ["Full Body Analysis", "Cardiac Risk Markers", "Vitamin D & B12 Levels", "Cancer Screening Markers", "Home Sample Collection"],
                featured: false,
                delay: "300"
              },
            ].map((pkg, idx) => (
              <div className="col-lg-4 col-md-6" key={idx} data-aos="fade-up" data-aos-delay={pkg.delay}>
                <div className={`package-card ${pkg.featured ? 'featured' : ''}`}>
                  {pkg.featured && <div className="popular-badge">Best Value</div>}

                  <h3 className="package-title">{pkg.title}</h3>
                  <p className="package-subtitle">{pkg.subtitle}</p>

                  <div className="package-price">
                    <sup>$</sup>{pkg.price}<span>/session</span>
                  </div>

                  <hr />

                  <ul className="package-features">
                    {pkg.features.map((f, i) => (
                      <li key={i}>
                        <i className="bi bi-check-circle-fill me-2"></i>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link to="/book-package" className={`btn-package ${pkg.featured ? 'filled' : 'outline'}`}>
                    Book Now
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
              { step: "1", title: "Find Doctor", desc: "Search by name, specialty, or condition.", icon: "bi-search-heart" },
              { step: "2", title: "Book Slot", desc: "Choose a time that fits your schedule.", icon: "bi-calendar-date" },
              { step: "3", title: "Instant Confirm", desc: "Receive booking details via SMS/Email.", icon: "bi-patch-check" },
              { step: "4", title: "Visit Hospital", desc: "Skip the queue and get treated.", icon: "bi-hospital" },
            ].map((item, idx) => (
              <div className="col-lg-3 col-md-6" key={idx} data-aos="fade-up" data-aos-delay={100 * idx}>
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
      <section id="testimonials" className="testimonials-section section" style={{ padding: '80px 0' }}>
        <div className="container" data-aos="fade-up">

          <div className="row g-5">

            {/* LEFT COLUMN: The "Trust Anchor" (Summary) */}
            <div className="col-lg-4" data-aos="fade-right">
              <div className="trust-summary-card">
                <h3 className="mb-4">Why Patients Trust Us</h3>
                <p className="opacity-75 mb-4">
                  Our commitment to excellence is reflected in the smiles of our recovered patients.
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

                <hr style={{ borderColor: 'rgba(255,255,255,0.1)' }} />

                <div className="d-flex align-items-center mt-3">
                  <div className="me-3">
                    <h2 className="mb-0 text-white">15k+</h2>
                  </div>
                  <div className="text-white-50 lh-sm">
                    Successful<br />Surgeries
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
                  <h2 style={{ color: 'var(--heading-color)', fontWeight: 'bold' }}>Patient Stories</h2>
                  <p style={{ color: 'var(--default-color)' }}>Real experiences from real people.</p>
                </div>
              </div>

              <div className="row g-4">
                {[
                  {
                    name: "Sarah Jenkins",
                    treatment: "Cardiology",
                    img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=2588&auto=format&fit=crop",
                    text: "Dr. Mitchell saved my life. The level of care I received during my heart surgery was phenomenal. The nurses were angels.",
                    delay: 100
                  },
                  {
                    name: "Michael Ross",
                    treatment: "Orthopedics",
                    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=2574&auto=format&fit=crop",
                    text: "I was back on my feet in weeks after my knee replacement. The rehabilitation facility here is world-class.",
                    delay: 200
                  },
                  {
                    name: "Emily & Baby Leo",
                    treatment: "Maternity",
                    img: "https://images.unsplash.com/photo-1554774853-d39f79c2a36a?q=80&w=2574&auto=format&fit=crop",
                    text: "Giving birth here was a dream. The private suites are comfortable and the midwives were so supportive throughout.",
                    delay: 300
                  },
                  {
                    name: "David Chen",
                    treatment: "Neurology",
                    img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=2574&auto=format&fit=crop",
                    text: "Professional, clean, and efficient. I never had to wait long for my appointments, and the diagnosis was spot on.",
                    delay: 400
                  }
                ].map((review, idx) => (
                  <div className="col-md-6" key={idx} data-aos="fade-up" data-aos-delay={review.delay}>
                    <div className="review-card h-100">
                      <div className="patient-profile">
                        <img src={review.img} alt={review.name} className="patient-img" />
                        <div className="patient-info">
                          <h5>{review.name}</h5>
                          <span className="treatment-badge">{review.treatment}</span>
                        </div>
                      </div>
                      <div className="star-row mb-3" style={{ fontSize: '0.8rem' }}>
                        {[...Array(5)].map((_, i) => (
                          <i key={i} className="bi bi-star-fill text-warning"></i>
                        ))}
                      </div>
                      <p className="review-text">
                        <i className="bi bi-quote quote-mark-small"></i>
                        {review.text}
                      </p>
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
