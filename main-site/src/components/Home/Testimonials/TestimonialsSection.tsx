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

const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
    testimonials,
    loadingTestimonials,
}) => {
    const getFullImageUrl = (path: string | null) => {
        if (!path) return "/assets/img/person/person-m-12.webp";
        if (path.startsWith("http")) return path;
        const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "http://localhost:8000";
        return `${baseUrl}/storage/${path}`;
    };

    return (
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
    );
};

export default TestimonialsSection;
