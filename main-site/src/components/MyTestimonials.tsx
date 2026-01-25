import { useState } from 'react'
import { testimonialAPI } from '../services/api'
import { useToast } from '../context/ToastContext'

const MyTestimonials = () => {
    const { showToast } = useToast()
    const [message, setMessage] = useState('')
    const [rating, setRating] = useState(5)
    const [role, setRole] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!message.trim()) {
            showToast('Please enter a message', 'error')
            return
        }

        try {
            setSubmitting(true)
            const response = await testimonialAPI.submit({
                message,
                rating,
                role: role || undefined
            })

            if (response.data.status) {
                showToast(response.data.message, 'success')
                setMessage('')
                setRating(5)
                setRole('')
            }
        } catch (error: any) {
            console.error('Error submitting testimonial:', error)
            showToast(error.response?.data?.message || 'Failed to submit testimonial', 'error')
        } finally {
            setSubmitting(false)
        }
    }

    const renderStars = () => {
        return (
            <div className="d-flex gap-2 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                    <i
                        key={star}
                        className={`bi ${star <= rating ? 'bi-star-fill' : 'bi-star'} fs-3`}
                        style={{ color: star <= rating ? '#ffc107' : '#e4e5e9', cursor: 'pointer' }}
                        onClick={() => setRating(star)}
                    ></i>
                ))}
            </div>
        )
    }

    return (
        <div className="profile-section">
            <style>{`
                .testimonial-form-container {
                    background: #fff;
                    border-radius: 15px;
                    padding: 2rem;
                    box-shadow: 0 5px 20px rgba(0,0,0,0.05);
                    border: 1px solid #f0f0f0;
                }
                .rating-label {
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                    display: block;
                    color: #444;
                }
                .testimonial-form-container .form-control {
                    border-radius: 10px;
                    padding: 0.75rem 1rem;
                    border: 1px solid #e0e0e0;
                }
                .testimonial-form-container .form-control:focus {
                    border-color: #049ebb;
                    box-shadow: 0 0 0 0.2rem rgba(4, 158, 187, 0.15);
                }
            `}</style>

            <div className="section-header mb-4">
                <h3>Share Your Experience</h3>
                <p className="text-muted">We value your feedback. Let us know how we're doing!</p>
            </div>

            <div className="row">
                <div className="col-lg-8">
                    <div className="testimonial-form-container" data-aos="fade-up">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="rating-label">Rate Your Experience</label>
                                {renderStars()}
                            </div>

                            <div className="mb-3">
                                <label htmlFor="role" className="form-label fw-bold">Title/Role (Optional)</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="role"
                                    placeholder="e.g. Cardiology Patient, Regular Visitor"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                />
                                <small className="text-muted">This will be displayed as your subtitle next to your name.</small>
                            </div>

                            <div className="mb-3">
                                <label htmlFor="message" className="form-label fw-bold">Your Review</label>
                                <textarea
                                    className="form-control"
                                    id="message"
                                    rows={5}
                                    placeholder="Write your experience here..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    required
                                ></textarea>
                            </div>

                            <div className="mt-4">
                                <button
                                    type="submit"
                                    className="btn btn-primary px-5 py-2 fw-bold"
                                    disabled={submitting}
                                    style={{ borderRadius: '10px' }}
                                >
                                    {submitting ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-send me-2"></i>
                                            Submit Review
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="col-lg-4 mt-4 mt-lg-0">
                    <div className="alert alert-info border-0 shadow-sm rounded-4 p-4" data-aos="fade-left">
                        <h5 className="fw-bold"><i className="bi bi-info-circle me-2"></i>Why leave a review?</h5>
                        <ul className="mb-0 mt-3 ps-3 text-secondary">
                            <li className="mb-3">Help other patients make informed decisions about their healthcare journey.</li>
                            <li className="mb-3">Provide valuable feedback that helps us improve our medical services and facilities.</li>
                            <li>Your review helps build trust in our community. Note: All reviews undergo a quick approval process before appearing on the site.</li>
                        </ul>
                    </div>

                    <div className="mt-4 p-4 bg-light rounded-4 border border-info border-opacity-25" data-aos="fade-left" data-aos-delay="100">
                        <h6 className="fw-bold mb-3"><i className="bi bi-shield-check me-2 text-info"></i>Privacy Note</h6>
                        <p className="small text-muted mb-0">Your name and profile picture will be displayed alongside your review. We never share your private medical data.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MyTestimonials
