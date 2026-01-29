import React, { useState } from 'react';
import { doctorReviewAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

interface DoctorReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointment: {
        id: number;
        doctor_id: number;
        doctor_name: string;
    };
    onSuccess: () => void;
}

const DoctorReviewModal: React.FC<DoctorReviewModalProps> = ({ isOpen, onClose, appointment, onSuccess }) => {
    const { showToast } = useToast();
    const [rating, setRating] = useState(5);
    const [hover, setHover] = useState(0);
    const [title, setTitle] = useState('');
    const [review, setReview] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            showToast('Please select a rating', 'error');
            return;
        }

        try {
            setLoading(true);
            const response = await doctorReviewAPI.submitReview({
                doctor_id: appointment.doctor_id,
                appointment_id: appointment.id,
                rating,
                title,
                review
            });

            if (response.data.success) {
                showToast('Review submitted successfully!', 'success');
                onSuccess();
                onClose();
            }
        } catch (error: any) {
            console.error("Failed to submit review", error);
            const message = error.response?.data?.message || 'Failed to submit review';
            showToast(message, 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="review-modal-backdrop" onClick={onClose}>
            <style>
                {`
                .review-modal-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(5px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2000;
                    animation: fadeIn 0.3s ease;
                }

                .review-modal-content {
                    background: white;
                    width: 90%;
                    max-width: 500px;
                    border-radius: 24px;
                    padding: 2.5rem;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
                    position: relative;
                    animation: slideUp 0.4s ease;
                }

                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

                .review-modal-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .review-modal-header h3 {
                    color: #18444c;
                    font-weight: 800;
                    margin-bottom: 0.5rem;
                }

                .star-rating-container {
                    display: flex;
                    justify-content: center;
                    gap: 10px;
                    margin-bottom: 2rem;
                }

                .star-btn {
                    background: none;
                    border: none;
                    font-size: 2.5rem;
                    cursor: pointer;
                    transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                .star-btn:hover { transform: scale(1.2); }
                .star-btn.active { color: #fbbf24; }
                .star-btn.inactive { color: #e2e8f0; }

                .form-group-custom { margin-bottom: 1.5rem; }
                .form-group-custom label {
                    display: block;
                    font-weight: 700;
                    color: #64748b;
                    font-size: 0.85rem;
                    text-transform: uppercase;
                    margin-bottom: 8px;
                }

                .form-control-custom {
                    width: 100%;
                    padding: 12px 18px;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                    font-family: inherit;
                    transition: all 0.3s ease;
                }

                .form-control-custom:focus {
                    border-color: #0d8abc;
                    box-shadow: 0 0 0 4px rgba(13, 138, 188, 0.1);
                    outline: none;
                }

                .btn-submit-review {
                    background: linear-gradient(135deg, #0d8abc 0%, #17a2b8 100%);
                    color: white;
                    border: none;
                    padding: 15px;
                    border-radius: 12px;
                    font-weight: 700;
                    width: 100%;
                    margin-top: 1rem;
                    box-shadow: 0 10px 20px rgba(13, 138, 188, 0.2);
                    transition: all 0.3s ease;
                }

                .btn-submit-review:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 15px 25px rgba(13, 138, 188, 0.3);
                }

                .btn-submit-review:disabled {
                    background: #cbd5e1;
                    box-shadow: none;
                    cursor: not-allowed;
                }

                .close-modal-btn {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    color: #94a3b8;
                    cursor: pointer;
                }
                `}
            </style>

            <div className="review-modal-content" onClick={e => e.stopPropagation()}>
                <button className="close-modal-btn" onClick={onClose}><i className="bi bi-x-lg"></i></button>

                <div className="review-modal-header">
                    <h3>Rate Your Visit</h3>
                    <p className="text-muted">How was your experience with <strong>{appointment.doctor_name}</strong>?</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="star-rating-container">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className={`star-btn ${star <= (hover || rating) ? 'active' : 'inactive'}`}
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(0)}
                                onClick={() => setRating(star)}
                            >
                                <i className={`bi bi-star${star <= (hover || rating) ? '-fill' : ''}`}></i>
                            </button>
                        ))}
                    </div>

                    <div className="form-group-custom">
                        <label>Review Title (Optional)</label>
                        <input
                            type="text"
                            className="form-control-custom"
                            placeholder="Example: Great experience, very helpful"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="form-group-custom">
                        <label>Your Feedback</label>
                        <textarea
                            className="form-control-custom"
                            rows={4}
                            placeholder="Describe your experience with the doctor..."
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                        ></textarea>
                    </div>

                    <button type="submit" className="btn-submit-review" disabled={loading}>
                        {loading ? (
                            <><span className="spinner-border spinner-border-sm me-2"></span> Submitting...</>
                        ) : 'Submit Review'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DoctorReviewModal;
