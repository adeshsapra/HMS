import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import SectionHeading from "../SectionHeading";
import { serviceAPI } from "../../../services/api";

interface ServiceFeature {
  id: number;
  name: string;
  description: string;
  icon: string;
  features: string[];
}

const FeaturedServicesSection = () => {
  const [services, setServices] = useState<ServiceFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeaturedServices();
  }, []);

  const fetchFeaturedServices = async () => {
    try {
      setLoading(true);
      const response = await serviceAPI.getFeatured();
      let servicesData = [];

      if (response.data && response.data.data) {
        servicesData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        servicesData = response.data;
      }

      const parsedServices = servicesData.map((service: any) => ({
        ...service,
        features:
          typeof service.features === "string"
            ? JSON.parse(service.features)
            : service.features || [],
      }));

      setServices(parsedServices);
    } catch (err) {
      console.error("Failed to fetch featured services:", err);
      setError("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  // --- ANIMATION VARIANTS (Kept exactly as requested) ---
  const cardVariants: Variants = {
    offscreen: (index: number) => ({
      opacity: 0,
      x: index % 2 === 0 ? -100 : 100,
      y: 50,
    }),
    onscreen: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        type: "spring",
        bounce: 0.3,
        duration: 1.0,
      },
    },
  };

  return (
    <>
      <style>{`
        /* --- SECTION SETTINGS --- */
        .featured-services {
          background-color: #f8fbfd;
          padding: 100px 0;
          overflow-x: hidden;
        }

        /* --- CARD CONTAINER --- */
        .pro-card {
          background: #ffffff;
          border-radius: 24px;
          padding: 40px;
          height: 100%;
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 1;
          border: 1px solid rgba(0, 0, 0, 0.05);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
          transition: all 0.4s ease;
        }

        .pro-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(4, 158, 187, 0.15);
          border-color: rgba(4, 158, 187, 0.2);
        }

        /* --- ICON & TITLE --- */
        .card-header-area {
          margin-bottom: 25px;
        }

        .icon-box {
          width: 70px;
          height: 70px;
          border-radius: 18px;
          background: rgba(4, 158, 187, 0.06);
          color: #049EBB;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          margin-bottom: 20px;
          transition: all 0.4s ease;
        }

        .pro-card:hover .icon-box {
          background: linear-gradient(135deg, #049EBB, #027a94);
          color: #ffffff;
          border-radius: 50%;
          transform: rotate(360deg);
        }

        .service-title {
          font-size: 24px;
          font-weight: 800;
          color: #2c3e50;
          margin-bottom: 0;
        }

        /* --- CONTENT BODY --- */
        .card-body-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .service-desc {
          font-size: 15px;
          color: #64748b;
          line-height: 1.7;
          margin: 0;
        }

        /* --- COMPACT FEATURE PILLS --- */
        .feature-list {
          display: flex;
          flex-wrap: wrap; /* Allows them to sit next to each other */
          gap: 10px;
          padding: 0;
          margin: 0;
          list-style: none;
        }

        .feature-pill {
          display: inline-flex;
          align-items: center;
          padding: 8px 16px; /* Compact padding */
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 50px;
          transition: all 0.4s ease;
          width: fit-content; /* Only take necessary width */
        }

        /* The Circle Wrapper for the Icon */
        .pill-icon-wrapper {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(4, 158, 187, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 10px;
          transition: all 0.4s ease;
        }

        .pill-icon {
          font-size: 10px;
          color: #049EBB;
          transition: all 0.4s ease;
        }

        .pill-text {
          font-size: 13px;
          font-weight: 600;
          color: #555;
          white-space: nowrap; /* Prevents breaking inside the pill */
          transition: all 0.4s ease;
        }

        /* --- HOVER EFFECTS (INVERSE LOGIC) --- */
        
        /* When hovering the card, the Pill fills with Blue Gradient */
        .pro-card:hover .feature-pill {
          background: linear-gradient(90deg, #049EBB, #037a94);
          border-color: transparent;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(4, 158, 187, 0.2);
        }

        /* The Text turns White */
        .pro-card:hover .pill-text {
          color: #ffffff;
        }

        /* The Icon Circle turns White */
        .pro-card:hover .pill-icon-wrapper {
          background: #ffffff;
        }

        /* The Icon itself turns Blue */
        .pro-card:hover .pill-icon {
          color: #049EBB;
        }

        /* --- FOOTER BUTTON --- */
        .card-footer-area {
          margin-top: 35px;
          padding-top: 20px;
          border-top: 1px solid #f1f5f9;
        }

        .details-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 700;
          font-size: 15px;
          color: #049EBB;
          text-decoration: none;
          transition: gap 0.3s ease;
        }

        .details-btn:hover {
          gap: 15px;
          color: #025f73;
        }

        .btn-icon-circle {
          width: 32px;
          height: 32px;
          background: rgba(4, 158, 187, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .details-btn:hover .btn-icon-circle {
          background: #049EBB;
          color: #fff;
        }

        /* --- LOADER --- */
        .loader-wrap {
          display: flex;
          justify-content: center;
          padding: 60px;
        }
        .spin-loader {
          width: 45px;
          height: 45px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #049EBB;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>

      <section id="featured-services" className="featured-services">
        <SectionHeading desc="Discover our specialized healthcare departments.">
          Featured <span className="text-gradient">Services</span>
        </SectionHeading>

        <div className="container">
          {loading ? (
            <div className="loader-wrap">
              <div className="spin-loader"></div>
            </div>
          ) : error ? (
            <div className="text-center py-5">
              <h4 className="text-danger">{error}</h4>
            </div>
          ) : services.length > 0 ? (
            <div className="row gy-4">
              {services.map((service, idx) => (
                <div key={service.id} className="col-lg-6">
                  <motion.div
                    custom={idx}
                    variants={cardVariants}
                    initial="offscreen"
                    whileInView="onscreen"
                    viewport={{ once: false, amount: 0.2 }}
                    style={{ height: '100%' }}
                  >
                    <div className="pro-card">

                      {/* 1. Header Area */}
                      <div className="card-header-area">
                        <div className="icon-box">
                          <i className={`fas ${service.icon || "fa-stethoscope"}`}></i>
                        </div>
                        <h3 className="service-title">{service.name}</h3>
                      </div>

                      {/* 2. Content Area (Desc + Features) */}
                      <div className="card-body-area">
                        <p className="service-desc">
                          {service.description.length > 130
                            ? service.description.substring(0, 130) + "..."
                            : service.description}
                        </p>

                        {/* COMPACT Feature Pills */}
                        {service.features && service.features.length > 0 && (
                          <ul className="feature-list">
                            {service.features.slice(0, 4).map((feature, fIdx) => (
                              <li key={fIdx} className="feature-pill">
                                {/* Round Icon Wrapper */}
                                <div className="pill-icon-wrapper">
                                  <i className="fas fa-check pill-icon"></i>
                                </div>
                                <span className="pill-text">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* 3. Footer Area */}
                      <div className="card-footer-area">
                        <Link to={`/service-details/${service.id}`} className="details-btn">
                          <span>Learn More</span>
                          <div className="btn-icon-circle">
                            <i className="fas fa-arrow-right"></i>
                          </div>
                        </Link>
                      </div>

                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <p className="text-muted">No featured services found.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default FeaturedServicesSection;