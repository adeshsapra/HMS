import { Link } from "react-router-dom";
import SectionHeading from "../SectionHeading";

const CallToActionSection = () => {
  return (
    <>
      <style>{`
        /* Call To Action Section Styles */
        .call-to-action {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #f8fbfd 0%, #f0f7fa 100%);
        }

        .call-to-action::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -20%;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(4, 158, 187, 0.08) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .call-to-action::after {
          content: '';
          position: absolute;
          bottom: -30%;
          left: -10%;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(4, 158, 187, 0.05) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .cta-buttons {
          display: flex;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-top: 32px;
        }

        .cta-buttons .btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 14px 32px;
          font-size: 15px;
          font-weight: 600;
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.3s ease;
          background: linear-gradient(135deg, #049EBB 0%, #037a94 100%);
          color: #ffffff;
          border: none;
          box-shadow: 0 4px 15px rgba(4, 158, 187, 0.3);
        }

        .cta-buttons .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(4, 158, 187, 0.4);
          background: linear-gradient(135deg, #05b0d4 0%, #049EBB 100%);
        }

        .cta-buttons .btn-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 14px 32px;
          font-size: 15px;
          font-weight: 600;
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.3s ease;
          background: transparent;
          color: #1a1a1a;
          border: 2px solid #e0e0e0;
        }

        .cta-buttons .btn-secondary:hover {
          border-color: #049EBB;
          color: #049EBB;
          transform: translateY(-2px);
        }

        .features-row {
          margin-top: 48px;
        }

        .feature-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 28px;
          height: 100%;
          transition: all 0.3s ease;
          border: 1px solid rgba(0, 0, 0, 0.05);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
        }

        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 40px rgba(4, 158, 187, 0.12);
          border-color: rgba(4, 158, 187, 0.2);
        }

        .feature-card .icon-wrapper {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(4, 158, 187, 0.1) 0%, rgba(4, 158, 187, 0.05) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          transition: all 0.3s ease;
        }

        .feature-card:hover .icon-wrapper {
          background: linear-gradient(135deg, #049EBB 0%, #037a94 100%);
        }

        .feature-card .icon-wrapper i {
          font-size: 24px;
          color: #049EBB;
          transition: all 0.3s ease;
        }

        .feature-card:hover .icon-wrapper i {
          color: #ffffff;
        }

        .feature-card h5 {
          font-size: 18px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 12px;
        }

        .feature-card p {
          font-size: 14px;
          color: #666;
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .feature-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #049EBB;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .feature-link:hover {
          gap: 12px;
          color: #037a94;
        }

        .feature-link i {
          font-size: 12px;
          transition: all 0.3s ease;
        }

        .feature-link:hover i {
          transform: translateX(4px);
        }

        .emergency-alert {
          margin-top: 48px;
          background: linear-gradient(135deg, #049EBB 0%, #037a94 100%);
          border-radius: 16px;
          padding: 24px 32px;
          box-shadow: 0 8px 30px rgba(4, 158, 187, 0.3);
        }

        .emergency-content {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .emergency-icon {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .emergency-icon i {
          font-size: 24px;
          color: #ffffff;
        }

        .emergency-text h4 {
          font-size: 18px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 4px;
        }

        .emergency-text p {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.9);
          margin: 0;
        }

        .emergency-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 28px;
          background: #ffffff;
          color: #049EBB;
          font-size: 15px;
          font-weight: 600;
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .emergency-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        .emergency-btn i {
          font-size: 16px;
        }

        @media (max-width: 768px) {
          .cta-buttons {
            flex-direction: column;
            align-items: center;
          }

          .cta-buttons .btn-primary,
          .cta-buttons .btn-secondary {
            width: 100%;
            max-width: 280px;
          }

          .emergency-alert .row {
            text-align: center;
          }

          .emergency-content {
            justify-content: center;
            margin-bottom: 16px;
          }

          .emergency-alert .col-lg-4 {
            text-align: center !important;
          }

          .emergency-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      {/* Call To Action Section */}
      <section id="call-to-action" className="call-to-action section">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <SectionHeading desc="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.">
                Your Health is <span className="text-gradient">Our Priority</span>
              </SectionHeading>

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
    </>
  );
};

export default CallToActionSection;
