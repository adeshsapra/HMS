import { useCallback } from "react";
import SectionHeading from "../SectionHeading";
import ContentLoader from "../../ContentLoader";

interface Testimonial {
    id: number;
    name: string;
    role: string;
    message: string;
    image_url: string | null;
    rating: number;
}

interface TestimonialsSectionProps {
    testimonials: Testimonial[];
    loadingTestimonials: boolean;
}

const TestimonialsSection = ({ testimonials, loadingTestimonials }: TestimonialsSectionProps) => {
    const getFullImageUrl = useCallback((path: string | null) => {
        if (!path) return "/assets/img/person/person-m-12.webp";
        if (path.startsWith("http")) return path;
        const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "http://localhost:8000";
        return `${baseUrl}/storage/${path}`;
    }, []);

    return (
        <>
            <style>{`
        /* Testimonials Section Styles */
        .testimonials-section {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          position: relative;
          overflow: hidden;
        }

        .testimonials-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          pointer-events: none;
        }

        .trust-summary-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 32px;
          height: 100%;
          display: flex;
          flex-direction: column;
          color: #ffffff;
        }

        .trust-summary-card h3 {
          font-size: 24px;
          font-weight: 700;
          color: #ffffff;
        }

        .trust-summary-card p {
          font-size: 15px;
          line-height: 1.7;
        }

        .total-rating-display {
          font-size: 56px;
          font-weight: 800;
          color: #ffffff;
          line-height: 1;
        }

        .trust-summary-card .star-row {
          display: flex;
          gap: 4px;
        }

        .trust-summary-card .star-row i {
          color: #ffc107;
          font-size: 18px;
        }

        .trust-summary-card h2 {
          font-size: 36px;
          font-weight: 700;
        }

        .review-card-premium {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 16px;
          padding: 24px;
          position: relative;
          transition: all 0.3s ease;
        }

        .review-card-premium:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }

        .review-card-qoute {
          position: absolute;
          top: 20px;
          right: 24px;
          font-size: 48px;
          color: rgba(4, 158, 187, 0.1);
          line-height: 1;
        }

        .patient-profile {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .patient-img-container {
          position: relative;
        }

        .patient-img-premium {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid #ffffff;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .verified-badge {
          position: absolute;
          bottom: 0;
          right: -2px;
          width: 20px;
          height: 20px;
          background: #049EBB;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #ffffff;
        }

        .verified-badge i {
          font-size: 10px;
          color: #ffffff;
        }

        .patient-info h5 {
          font-size: 16px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 4px;
        }

        .treatment-tag {
          display: inline-block;
          padding: 4px 10px;
          background: rgba(4, 158, 187, 0.1);
          color: #049EBB;
          font-size: 12px;
          font-weight: 500;
          border-radius: 20px;
        }

        .review-text-premium {
          font-size: 15px;
          color: #555;
          line-height: 1.7;
          font-style: italic;
        }

        .review-meta {
          border-color: #eee !important;
        }

        .star-row-premium {
          display: flex;
          gap: 2px;
        }

        .star-row-premium i {
          font-size: 14px;
        }

        .review-date {
          font-size: 13px;
        }

        @media (max-width: 992px) {
          .trust-summary-card {
            margin-bottom: 32px;
          }
        }

        @media (max-width: 576px) {
          .trust-summary-card {
            padding: 24px;
          }

          .total-rating-display {
            font-size: 48px;
          }

          .trust-summary-card h2 {
            font-size: 28px;
          }

          .review-card-premium {
            padding: 20px;
          }
        }
      `}</style>

            {/* Unique Testimonials Section */}
            <section
                id="testimonials"
                className="testimonials-section section"
                style={{ padding: "80px 0" }}
            >
                <SectionHeading desc="Real experiences from real people who have trusted our medical excellence.">
                    Patient <span className="text-gradient">Stories</span>
                </SectionHeading>
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
                            <div className="row g-4">
                                {testimonials.length > 0 ? (
                                    testimonials.map((review, idx) => (
                                        <div
                                            className="col-md-6"
                                            key={review.id}
                                            data-aos="fade-up"
                                            data-aos-delay={100 * (idx + 1)}
                                        >
                                            <div className="review-card-premium h-100">
                                                <div className="review-card-qoute">
                                                    <i className="bi bi-quote"></i>
                                                </div>
                                                <div className="patient-profile">
                                                    <div className="patient-img-container">
                                                        <img
                                                            src={getFullImageUrl(review.image_url)}
                                                            alt={review.name}
                                                            className="patient-img-premium"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = '/assets/img/person/person-m-12.webp';
                                                            }}
                                                        />
                                                        <div className="verified-badge">
                                                            <i className="bi bi-patch-check-fill"></i>
                                                        </div>
                                                    </div>
                                                    <div className="patient-info">
                                                        <h5>{review.name}</h5>
                                                        <span className="treatment-tag">
                                                            {review.role}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="review-text-premium mt-3">
                                                    "{review.message}"
                                                </p>
                                                <div className="review-meta mt-auto pt-3 border-top border-light d-flex justify-content-between align-items-center">
                                                    <div className="star-row-premium">
                                                        {[...Array(5)].map((_, i) => (
                                                            <i key={i} className={`bi ${i < review.rating ? 'bi-star-fill' : 'bi-star'} `} style={{ color: i < review.rating ? '#ffc107' : '#e4e5e9' }}></i>
                                                        ))}
                                                    </div>
                                                    <span className="review-date small text-muted">
                                                        Verified Patient
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : loadingTestimonials ? (
                                    <div className="col-12 py-5">
                                        <ContentLoader message="Echoing Patient Stories..." height="300px" />
                                    </div>
                                ) : (
                                    <div className="col-12 text-center py-5 text-white-50">
                                        <p>No testimonials yet. Be the first to share your story!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default TestimonialsSection;
