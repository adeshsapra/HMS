import { useState } from 'react'
import { testimonialAPI } from '../services/api'
import { useToast } from '../context/ToastContext'

const MyTestimonials = () => {
    const { showToast } = useToast()
    const [message, setMessage] = useState('')
    const [rating, setRating] = useState(5)
    const [hoveredRating, setHoveredRating] = useState(0)
    const [activeStar, setActiveStar] = useState(0)
    const [role, setRole] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const displayRating = hoveredRating || rating

    const ratingFeedback: Record<number, { emoji: string; label: string }> = {
        0: { emoji: '🤔', label: 'Select a rating' },
        1: { emoji: '😟', label: 'Very Poor' },
        2: { emoji: '😕', label: 'Poor' },
        3: { emoji: '🙂', label: 'Average' },
        4: { emoji: '😊', label: 'Good' },
        5: { emoji: '😍', label: 'Excellent' }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (rating === 0) {
            showToast('Please select a star rating', 'error')
            return
        }
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

    const handleStarClick = (star: number) => {
        const nextRating = rating === star ? 0 : star
        setRating(nextRating)
        setActiveStar(star)
        setTimeout(() => setActiveStar(0), 240)
    }

    const renderStars = () => {
        return (
            <div className="mb-3">
                <div className="testimonial-rating-feedback">
                    <span className="emoji" aria-hidden="true">{ratingFeedback[displayRating].emoji}</span>
                    <span className="label">{ratingFeedback[displayRating].label}</span>
                </div>
                <div className="d-flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        className={`testimonial-star-btn ${star <= displayRating ? 'is-filled' : ''} ${activeStar === star ? 'is-active' : ''}`}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        onClick={() => handleStarClick(star)}
                        aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                    >
                        <i className={`bi ${star <= displayRating ? 'bi-star-fill' : 'bi-star'} fs-3`}></i>
                    </button>
                ))}
                </div>
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
                    border-color: #0070C0;
                    box-shadow: 0 0 0 0.2rem rgba(0, 112, 192, 0.15);
                }
                .testimonial-submit-btn {
                    background-color: #0070C0;
                    border-color: #0070C0;
                    color: #fff;
                }
                .testimonial-submit-btn:hover:not(:disabled),
                .testimonial-submit-btn:focus:not(:disabled) {
                    background-color: #038aa4;
                    border-color: #038aa4;
                    color: #fff;
                }
                .testimonial-rating-feedback {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: color-mix(in srgb, #0070C0, transparent 92%);
                    border: 1px solid color-mix(in srgb, #0070C0, transparent 80%);
                    border-radius: 999px;
                    padding: 0.3rem 0.8rem;
                    margin-bottom: 0.8rem;
                    animation: ratingFade 240ms ease;
                }
                .testimonial-rating-feedback .emoji {
                    font-size: 1.15rem;
                    line-height: 1;
                }
                .testimonial-rating-feedback .label {
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #002D5A;
                }
                .testimonial-star-btn {
                    border: none;
                    background: transparent;
                    padding: 0;
                    line-height: 1;
                    color: #e4e5e9;
                    cursor: pointer;
                    transform: scale(1);
                    transition: transform 180ms ease, color 220ms ease, filter 220ms ease;
                }
                .testimonial-star-btn i {
                    transition: transform 180ms ease;
                }
                .testimonial-star-btn:hover {
                    transform: translateY(-2px) scale(1.04);
                    filter: drop-shadow(0 4px 8px rgba(255, 193, 7, 0.24));
                }
                .testimonial-star-btn.is-filled {
                    color: #ffc107;
                }
                .testimonial-star-btn.is-active i {
                    animation: starPop 240ms ease;
                }
                @keyframes starPop {
                    0% { transform: scale(0.8) rotate(-12deg); }
                    60% { transform: scale(1.2) rotate(6deg); }
                    100% { transform: scale(1) rotate(0deg); }
                }
                @keyframes ratingFade {
                    from { opacity: 0; transform: translateY(4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            <div className="section-header mb-4">
                <h3 className="d-flex align-items-center gap-2">
                    <i className="bi bi-star"></i>
                    Share Your Experience
                </h3>
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
                                    className="btn testimonial-submit-btn px-5 py-2 fw-bold"
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
