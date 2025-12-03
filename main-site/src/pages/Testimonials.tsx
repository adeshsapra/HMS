import { useEffect, useState } from 'react'
import AOS from 'aos'
import PageHero from '../components/PageHero'

interface Testimonial {
  id: number;
  name: string;
  role: string;
  image: string;
  message: string;
  rating: number;
  date: string;
}

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    })

    // Simulate API call or load testimonials data
    const loadTestimonials = () => {
      const mockTestimonials: Testimonial[] = [
        {
          id: 1,
          name: "Sarah Johnson",
          role: "Cardiology Patient",
          image: "/assets/img/person/person-f-5.webp",
          message: "The care I received was exceptional. Dr. Smith and his team were incredibly attentive and professional. The facilities are state-of-the-art and the staff made me feel comfortable throughout my treatment.",
          rating: 5,
          date: "2024-01-15"
        },
        {
          id: 2,
          name: "Michael Chen",
          role: "Orthopedic Patient",
          image: "/assets/img/person/person-m-3.webp",
          message: "After my knee surgery, the rehabilitation program was outstanding. The physical therapists were knowledgeable and supportive. I'm back to my active lifestyle thanks to their expertise.",
          rating: 5,
          date: "2024-02-08"
        },
        {
          id: 3,
          name: "Emily Rodriguez",
          role: "Pediatric Patient's Mother",
          image: "/assets/img/person/person-f-8.webp",
          message: "Bringing my daughter here for her check-ups has been a wonderful experience. The pediatric team is amazing with children, and they take the time to explain everything clearly.",
          rating: 5,
          date: "2024-01-28"
        },
        {
          id: 4,
          name: "David Thompson",
          role: "Emergency Patient",
          image: "/assets/img/person/person-m-7.webp",
          message: "During a medical emergency, the ER team acted swiftly and professionally. Their quick response and compassionate care made a stressful situation much more manageable.",
          rating: 5,
          date: "2024-02-12"
        },
        {
          id: 5,
          name: "Lisa Park",
          role: "Dermatology Patient",
          image: "/assets/img/person/person-f-9.webp",
          message: "The dermatology department provided excellent treatment for my skin condition. The doctor was thorough in her examination and the results exceeded my expectations.",
          rating: 5,
          date: "2024-01-20"
        },
        {
          id: 6,
          name: "Robert Wilson",
          role: "Neurology Patient",
          image: "/assets/img/person/person-m-9.webp",
          message: "The neurology team diagnosed my condition accurately and provided a comprehensive treatment plan. Their expertise and ongoing support have been invaluable.",
          rating: 5,
          date: "2024-02-05"
        }
      ];

      setTestimonials(mockTestimonials);
      setLoading(false);
    };

    // Simulate loading delay
    const timer = setTimeout(loadTestimonials, 500);
    return () => clearTimeout(timer);
  }, []);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <i
        key={index}
        className={`bi ${index < rating ? 'bi-star-fill' : 'bi-star'}`}
        style={{ color: index < rating ? '#ffc107' : '#e4e5e9' }}
      ></i>
    ));
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = '/assets/img/person/person-m-12.webp'; // Fallback image
  };

  return (
    <div className="testimonials-page">
      <PageHero
        title="Testimonials"
        description="Hear genuine experiences and feedback from our patients."
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Testimonials' }
        ]}
      />

      <section id="testimonials" className="testimonials section">
        {loading ? (
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-12 text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading testimonials...</span>
                </div>
                <p className="mt-3">Loading patient testimonials...</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="container" data-aos="fade-up">
            <div className="section-title text-center">
              <h2>What Our Patients Say</h2>
              <p>Real experiences from our valued patients who trust us with their healthcare needs</p>
            </div>

            <div className="row g-4">
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  className="col-lg-4 col-md-6"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  <div className="testimonial-item h-100">
                    <div className="d-flex align-items-center mb-3">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="rounded-circle me-3"
                        style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                        onError={handleImageError}
                      />
                      <div>
                        <h5 className="mb-1">{testimonial.name}</h5>
                        <small className="text-muted">{testimonial.role}</small>
                      </div>
                    </div>

                    <div className="mb-3">
                      {renderStars(testimonial.rating)}
                    </div>

                    <p className="mb-3">"{testimonial.message}"</p>

                    <small className="text-muted">
                      <i className="bi bi-calendar-event me-1"></i>
                      {new Date(testimonial.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </small>
                  </div>
                </div>
              ))}
            </div>

            {/* Call to Action */}
            <div className="row mt-5">
              <div className="col-12 text-center">
                <div className="bg-light rounded p-4" data-aos="fade-up">
                  <h4 className="mb-3">Ready to Experience Exceptional Care?</h4>
                  <p className="mb-4">Join thousands of satisfied patients who trust us with their healthcare journey.</p>
                  <a href="/appointment" className="btn btn-primary btn-lg">
                    <i className="bi bi-calendar-check me-2"></i>
                    Book Your Appointment
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

export default Testimonials
