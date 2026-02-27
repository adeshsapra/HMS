import { Link } from "react-router-dom";
import SectionHeading from "../SectionHeading";

const FeaturedServicesSection = () => {
    return (
        <>
            <style>{`
        /* Featured Services Section Styles */
        .featured-services {
          background-color: #f8fbfd;
        }

        .service-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 32px;
          height: 100%;
          transition: all 0.3s ease;
          border: 1px solid rgba(0, 0, 0, 0.05);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
        }

        .service-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 40px rgba(4, 158, 187, 0.12);
          border-color: rgba(4, 158, 187, 0.2);
        }

        .service-icon {
          width: 70px;
          height: 70px;
          border-radius: 16px;
          background: linear-gradient(135deg, rgba(4, 158, 187, 0.1) 0%, rgba(4, 158, 187, 0.05) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          transition: all 0.3s ease;
        }

        .service-card:hover .service-icon {
          background: linear-gradient(135deg, #049EBB 0%, #037a94 100%);
        }

        .service-icon i {
          font-size: 28px;
          color: #049EBB;
          transition: all 0.3s ease;
        }

        .service-card:hover .service-icon i {
          color: #ffffff;
        }

        .service-content h3 {
          font-size: 22px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 12px;
        }

        .service-content > p {
          font-size: 15px;
          color: #666;
          line-height: 1.7;
          margin-bottom: 20px;
        }

        .service-features {
          list-style: none;
          padding: 0;
          margin: 0 0 24px 0;
        }

        .service-features li {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: #555;
          margin-bottom: 10px;
        }

        .service-features li i {
          color: #049EBB;
          font-size: 16px;
        }

        .service-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #049EBB;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .service-btn:hover {
          gap: 12px;
          color: #037a94;
        }

        .service-btn i {
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .service-btn:hover i {
          transform: translateX(4px);
        }

        @media (max-width: 768px) {
          .service-card {
            padding: 24px;
          }

          .service-content h3 {
            font-size: 20px;
          }
        }
      `}</style>

            {/* Featured Services Section */}
            <section
                id="featured-services"
                className="featured-services section light-background"
            >
                <SectionHeading desc="Necessitatibus eius consequatur ex aliquid fuga eum quidem sint consectetur velit">
                    Featured <span className="text-gradient">Services</span>
                </SectionHeading>

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
                                desc: "Nemo enim ipsam voluptatem quia voluptas sit aspernatur fugit, sed quia consequuntur aut odit aut magni dolores eos qui ratione voluptatem sequi nesciunt.",
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
                                        <i className={`fas ${service.icon} `}></i>
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
        </>
    );
};

export default FeaturedServicesSection;
