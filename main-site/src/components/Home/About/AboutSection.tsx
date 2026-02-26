import { Link } from "react-router-dom";
import SectionHeading from "../SectionHeading";

const AboutSection = () => {
    return (
        <>
            <style>{`
        /* Home About Section Styles */
        .home-about {
          background-color: #ffffff;
        }

        .about-image {
          position: relative;
        }

        .about-image img {
          width: 100%;
          height: auto;
        }

        .experience-badge {
          position: absolute;
          bottom: 20px;
          left: -20px;
          background: linear-gradient(135deg, #049EBB 0%, #037a94 100%);
          color: #ffffff;
          padding: 20px 28px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-shadow: 0 10px 30px rgba(4, 158, 187, 0.35);
        }

        .experience-badge .years {
          font-size: 36px;
          font-weight: 700;
          line-height: 1;
        }

        .experience-badge .text {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 4px;
        }

        .about-content h2 {
          font-size: 32px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 20px;
          line-height: 1.3;
        }

        .about-content .lead {
          font-size: 17px;
          color: #555;
          margin-bottom: 16px;
          line-height: 1.7;
        }

        .about-content > p {
          color: #666;
          line-height: 1.8;
          margin-bottom: 0;
        }

        .about-content .feature-item {
          padding: 20px;
          background: #f8fbfd;
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .about-content .feature-item:hover {
          background: #f0f7fa;
          transform: translateY(-4px);
        }

        .about-content .feature-item .icon {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(4, 158, 187, 0.15) 0%, rgba(4, 158, 187, 0.05) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        .about-content .feature-item .icon i {
          font-size: 22px;
          color: #049EBB;
        }

        .about-content .feature-item h4 {
          font-size: 16px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 8px;
        }

        .about-content .feature-item p {
          font-size: 14px;
          color: #666;
          margin: 0;
          line-height: 1.6;
        }

        .cta-wrapper {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .cta-wrapper .btn {
          padding: 12px 28px;
          font-size: 15px;
          font-weight: 600;
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .cta-wrapper .btn-primary {
          background: linear-gradient(135deg, #049EBB 0%, #037a94 100%);
          color: #ffffff;
          border: none;
          box-shadow: 0 4px 15px rgba(4, 158, 187, 0.3);
        }

        .cta-wrapper .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(4, 158, 187, 0.4);
        }

        .cta-wrapper .btn-outline {
          background: transparent;
          color: #1a1a1a;
          border: 2px solid #e0e0e0;
        }

        .cta-wrapper .btn-outline:hover {
          border-color: #049EBB;
          color: #049EBB;
        }

        .certifications-row {
          border-top: 1px solid #eee;
          padding-top: 40px;
        }

        .certification-title {
          font-size: 18px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 24px;
        }

        .certifications {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 40px;
          flex-wrap: wrap;
        }

        .certification-item {
          opacity: 0.7;
          transition: all 0.3s ease;
        }

        .certification-item:hover {
          opacity: 1;
          transform: scale(1.1);
        }

        .certification-item img {
          height: 50px;
          width: auto;
          object-fit: contain;
          filter: grayscale(100%);
          transition: all 0.3s ease;
        }

        .certification-item:hover img {
          filter: grayscale(0%);
        }

        @media (max-width: 992px) {
          .about-image {
            margin-bottom: 40px;
          }

          .experience-badge {
            left: 20px;
            bottom: 20px;
          }

          .about-content h2 {
            font-size: 28px;
          }
        }

        @media (max-width: 576px) {
          .about-content h2 {
            font-size: 24px;
          }

          .cta-wrapper {
            flex-direction: column;
          }

          .cta-wrapper .btn {
            width: 100%;
            text-align: center;
          }

          .certifications {
            gap: 24px;
          }
        }
      `}</style>

            {/* Home About Section */}
            <section id="home-about" className="home-about section">
                <SectionHeading desc="Necessitatibus eius consequatur ex aliquid fuga eum quidem sint consectetur velit">
                    About <span className="text-gradient">Us</span>
                </SectionHeading>

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
        </>
    );
};

export default AboutSection;
