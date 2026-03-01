import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { doctorAPI, doctorReviewAPI } from '../services/api';
import PageHero from '../components/PageHero';
import ContentLoader from '../components/ContentLoader';
import AOS from 'aos';
import { useToast } from '../context/ToastContext';

interface Review {
    id: number;
    rating: number;
    review: string;
    title: string;
    patient: {
        name: string;
    };
    reviewed_at: string;
}

interface DoctorProfileData {
    id: number;
    doctor_id: string; // The DOCXXXX ID
    first_name: string;
    last_name: string;
    specialization: string;
    bio: string;
    experience_years: number;
    profile_picture: string;
    qualification: string;
    consultation_fee: number;
    employment_type: string;
    working_hours_start: string;
    working_hours_end: string;
    working_days: string[] | string;
    languages: string[] | string;
    status: string;
    is_available: boolean;
    department: {
        name: string;
        description: string;
    };
    address: string;
    phone: string;
    email: string;
    total_appointments: number;
    completed_appointments: number;
    average_rating: number;
    total_reviews: number;
    approved_reviews: Review[];
    license_number: string;
    gender: string;
    joining_date?: string;
    city?: string;
    state?: string;
}

const DoctorProfile = () => {
    const { id } = useParams<{ id: string }>();
    const { showToast } = useToast();
    const [doctor, setDoctor] = useState<DoctorProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [submittingReview, setSubmittingReview] = useState(false);

    // Review form state
    const [reviewForm, setReviewForm] = useState({
        rating: 5,
        title: '',
        review: ''
    });

    useEffect(() => {
        if (id) {
            fetchDoctorProfile(id);
        }
        AOS.init({ duration: 800, once: true });
    }, [id]);

    const fetchDoctorProfile = async (doctorId: string) => {
        try {
            setLoading(true);
            const response = await doctorAPI.getProfile(doctorId);
            if (response.data.success) {
                setDoctor(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch doctor profile", error);
        } finally {
            setLoading(false);
        }
    };

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!doctor) return;

        try {
            setSubmittingReview(true);
            const response = await doctorReviewAPI.submitReview({
                doctor_id: doctor.id,
                rating: reviewForm.rating,
                title: reviewForm.title,
                review: reviewForm.review
            });

            if (response.data.success) {
                showToast('Review submitted successfully! It will be visible once approved.', 'success');
                setReviewForm({ rating: 5, title: '', review: '' });
                // Optional: Refetch to show message about pending review or just let it be
            }
        } catch (error: any) {
            console.error("Failed to submit review", error);
            const message = error.response?.data?.message || 'Failed to submit review. You may need to be logged in and have a completed appointment.';
            showToast(message, 'error');
        } finally {
            setSubmittingReview(false);
        }
    };

    const getImageUrl = (path: string | null) => {
        if (!path) return `https://ui-avatars.com/api/?name=${doctor?.first_name || 'Doctor'}+${doctor?.last_name || ''}&background=0D8ABC&color=fff&size=512`;
        if (path.startsWith('http')) return path;
        const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000';
        return `${baseUrl}/storage/${path}`;
    };

    const formatList = (list: string[] | string | undefined) => {
        if (!list) return 'N/A';
        if (Array.isArray(list)) return list.join(', ');
        try {
            const parsed = JSON.parse(list);
            return Array.isArray(parsed) ? parsed.join(', ') : list;
        } catch (e) {
            return list;
        }
    };

    return (
        <div className="professional-doctor-profile">
            <style>
                {`
                :root {
                    --hospital-blue: #0d8abc;
                    --hospital-dark: #1a3353;
                    --hospital-light: #f0f9ff;
                    --hospital-accent: #17a2b8;
                    --glass-white: rgba(255, 255, 255, 0.9);
                    --premium-shadow: 0 20px 40px rgba(0,0,0,0.08);
                }

                .professional-doctor-profile {
                    background-color: #f8fafc;
                    padding-bottom: 3rem;
                    min-height: 100vh;
                }

                .profile-content-loading {
                    min-height: 400px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: white;
                    border-radius: 24px;
                    box-shadow: var(--premium-shadow);
                }

                .loader-box { text-align: center; }

                /* Hero Section Overrides - Fixed for responsive */
                .profile-hero-content {
                    margin-bottom: 0;
                }

                .profile-content-container {
                    margin-top: 0;
                    position: relative;
                    z-index: 10;
                    max-width: 1400px;
                    margin-left: auto;
                    margin-right: auto;
                    padding: 0 15px;
                }

                /* Layout Components */
                .profile-main-card {
                    background: white;
                    border-radius: 24px;
                    box-shadow: var(--premium-shadow);
                    overflow: hidden;
                    border: 1px solid rgba(0,0,0,0.05);
                }

                .profile-header-strip {
                    display: flex;
                    padding: 2rem;
                    gap: 2rem;
                    background: linear-gradient(to right, #ffffff, #f8fafc);
                    border-bottom: 1px solid #f1f5f9;
                }

                .doc-image-wrapper {
                    flex-shrink: 0;
                    width: 200px;
                    height: 200px;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(13, 138, 188, 0.15);
                    border: 4px solid white;
                }

                .doc-image-wrapper img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .doc-primary-details {
                    flex-grow: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }

                .doc-name-hero {
                    font-size: 2rem;
                    font-weight: 900;
                    color: var(--hospital-dark);
                    margin-bottom: 0.5rem;
                    letter-spacing: -0.5px;
                    line-height: 1.2;
                }

                .doc-spec-hero {
                    font-size: 1rem;
                    color: var(--hospital-blue);
                    font-weight: 700;
                    margin-bottom: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                .doc-stats-row {
                    display: flex;
                    gap: 1.5rem;
                    margin-top: 0.75rem;
                    flex-wrap: wrap;
                }

                .stat-item-premium {
                    display: flex;
                    flex-direction: column;
                }

                .stat-v-premium {
                    font-size: 1.4rem;
                    font-weight: 800;
                    color: var(--hospital-dark);
                }

                .stat-l-premium {
                    font-size: 0.7rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: #94a3b8;
                    font-weight: 700;
                }

                /* Content Sections */
                .profile-sections-wrapper {
                    padding: 1.5rem;
                }

                .p-section-title {
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: var(--hospital-dark);
                    margin-bottom: 1rem;
                    position: relative;
                    padding-left: 12px;
                }

                .p-section-title::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 3px;
                    bottom: 3px;
                    width: 4px;
                    background: var(--hospital-blue);
                    border-radius: 8px;
                }

                .p-text-content {
                    font-size: 1rem;
                    line-height: 1.7;
                    color: #475569;
                }

                .expertise-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                    gap: 0.75rem;
                }

                .expertise-item {
                    background: #f1f5f9;
                    padding: 10px 14px;
                    border-radius: 10px;
                    font-weight: 600;
                    color: var(--hospital-dark);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.85rem;
                }

                .expertise-item i {
                    color: var(--hospital-blue);
                    font-size: 0.9rem;
                }

                /* Sidebar Design */
                .booking-sidebar-premium {
                    position: sticky;
                    top: 100px;
                    background: white;
                    border-radius: 20px;
                    box-shadow: var(--premium-shadow);
                    padding: 1.5rem;
                    border: 1px solid rgba(0,0,0,0.05);
                }

                .availability-banner {
                    padding: 8px 12px;
                    border-radius: 8px;
                    text-align: center;
                    font-weight: 700;
                    margin-bottom: 1rem;
                    font-size: 0.8rem;
                }

                .available-now { background: #dcfce7; color: #166534; }
                .not-available { background: #fee2e2; color: #991b1b; }

                .booking-fee-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid #f1f5f9;
                }

                .fee-label { font-size: 1rem; font-weight: 600; color: #64748b; }
                .fee-price { font-size: 1.5rem; font-weight: 900; color: var(--hospital-dark); }

                .sidebar-info-group {
                    margin-bottom: 1rem;
                }

                .si-label {
                    font-size: 0.7rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    color: #94a3b8;
                    margin-bottom: 4px;
                    display: block;
                }

                .si-value {
                    font-size: 0.9rem;
                    font-weight: 700;
                    color: var(--hospital-dark);
                }

                /* Fixed Button Size - Responsive */
                .btn-instant-appointment {
                    background: linear-gradient(135deg, #0d8abc 0%, #0c76a1 100%);
                    color: white;
                    border: none;
                    width: 100%;
                    padding: 14px 20px;
                    border-radius: 12px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    box-shadow: 0 6px 15px rgba(13, 138, 188, 0.25);
                    transition: all 0.3s ease;
                    margin-top: 1rem;
                    font-size: 0.9rem;
                }

                .btn-instant-appointment:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 25px rgba(13, 138, 188, 0.35);
                    color: white;
                }

                /* Review Form Styles */
                .review-submission-box {
                    background: #f8fafc;
                    border-radius: 16px;
                    padding: 1.5rem;
                    margin-top: 2rem;
                }

                .rating-selector {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 1rem;
                }

                .star-selector {
                    font-size: 1.3rem;
                    cursor: pointer;
                    color: #cbd5e1;
                    transition: color 0.2s;
                }

                .star-selector.active {
                    color: #fbbf24;
                }

                .form-premium-input {
                    border: 2px solid #e2e8f0;
                    border-radius: 10px;
                    padding: 10px 14px;
                    width: 100%;
                    margin-bottom: 1rem;
                    font-weight: 500;
                    transition: all 0.3s;
                    font-size: 0.95rem;
                }

                .form-premium-input:focus {
                    border-color: var(--hospital-blue);
                    outline: none;
                    box-shadow: 0 0 0 3px rgba(13, 138, 188, 0.1);
                }

                .btn-submit-review-premium {
                    background: var(--hospital-dark);
                    color: white;
                    border: none;
                    padding: 10px 24px;
                    border-radius: 10px;
                    font-weight: 700;
                    transition: all 0.3s;
                    font-size: 0.9rem;
                }

                .btn-submit-review-premium:hover {
                    background: #2d4a77;
                }

                /* Reviews Display */
                .review-card-premium {
                    border-bottom: 1px solid #f1f5f9;
                    padding-bottom: 1.5rem;
                    margin-bottom: 1.5rem;
                }

                .review-card-premium:last-child {
                    border-bottom: none;
                }

                .rc-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 0.75rem;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }

                .rc-author-box {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                }

                .rc-avatar {
                    width: 40px;
                    height: 40px;
                    background: var(--hospital-blue);
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                    font-size: 1rem;
                    flex-shrink: 0;
                }

                .rc-author-name { font-weight: 800; color: var(--hospital-dark); font-size: 0.95rem; }
                .rc-stars { color: #fbbf24; font-size: 0.8rem; }
                .rc-date { font-size: 0.8rem; color: #94a3b8; font-weight: 600; }
                .rc-title { font-weight: 800; font-size: 1rem; color: var(--hospital-dark); margin-bottom: 6px; }
                .rc-body { color: #64748b; line-height: 1.6; font-size: 0.95rem; }

                .profile-loading-screen {
                    min-height: 60vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f8fafc;
                }

                .loader-box { text-align: center; }
                .loader-box p { margin-top: 1rem; font-weight: 700; color: var(--hospital-blue); }

                /* ============================================ */
                /* RESPONSIVE STYLES - MOBILE FIRST APPROACH  */
                /* ============================================ */

                /* Tablet Breakpoint (768px - 1024px) */
                @media (max-width: 1024px) {
                    .profile-content-container {
                        padding: 0 20px;
                    }

                    .profile-header-strip {
                        padding: 1.5rem;
                        gap: 1.5rem;
                    }

                    .doc-image-wrapper {
                        width: 160px;
                        height: 160px;
                    }

                    .doc-name-hero {
                        font-size: 1.75rem;
                    }

                    .doc-spec-hero {
                        font-size: 0.95rem;
                    }

                    .doc-stats-row {
                        gap: 1.25rem;
                    }

                    .stat-v-premium {
                        font-size: 1.2rem;
                    }

                    .booking-sidebar-premium {
                        top: 80px;
                        padding: 1.25rem;
                    }

                    .fee-price {
                        font-size: 1.35rem;
                    }
                }

                /* Mobile Breakpoint (max-width: 767px) */
                @media (max-width: 767px) {
                    .professional-doctor-profile {
                        padding-bottom: 2rem;
                    }

                    .profile-content-container {
                        padding: 0 12px;
                        margin-top: 0;
                    }

                    .profile-header-strip {
                        flex-direction: column;
                        text-align: center;
                        align-items: center;
                        padding: 1.25rem;
                        gap: 1rem;
                    }

                    .doc-image-wrapper {
                        width: 140px;
                        height: 140px;
                        border-radius: 14px;
                        border: 3px solid white;
                    }

                    .doc-primary-details {
                        width: 100%;
                    }

                    .doc-name-hero {
                        font-size: 1.5rem;
                        letter-spacing: 0;
                    }

                    .doc-spec-hero {
                        font-size: 0.85rem;
                        justify-content: center;
                    }

                    .doc-stats-row {
                        justify-content: center;
                        gap: 1rem;
                    }

                    .stat-item-premium {
                        align-items: center;
                    }

                    .stat-v-premium {
                        font-size: 1.1rem;
                    }

                    .stat-l-premium {
                        font-size: 0.6rem;
                    }

                    .profile-sections-wrapper {
                        padding: 1rem;
                    }

                    .p-section-title {
                        font-size: 1.1rem;
                    }

                    .p-text-content {
                        font-size: 0.9rem;
                        line-height: 1.6;
                    }

                    .expertise-grid {
                        grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
                        gap: 0.5rem;
                    }

                    .expertise-item {
                        padding: 8px 10px;
                        font-size: 0.75rem;
                        border-radius: 8px;
                    }

                    /* Sidebar Mobile */
                    .booking-sidebar-premium {
                        position: static;
                        margin-top: 1.5rem;
                        padding: 1rem;
                        border-radius: 16px;
                    }

                    .booking-fee-row {
                        margin-bottom: 1rem;
                        padding-bottom: 0.75rem;
                    }

                    .fee-label {
                        font-size: 0.9rem;
                    }

                    .fee-price {
                        font-size: 1.25rem;
                    }

                    .hospital-details-sidebar {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 0.75rem;
                    }

                    .sidebar-info-group {
                        margin-bottom: 0;
                    }

                    .si-label {
                        font-size: 0.65rem;
                    }

                    .si-value {
                        font-size: 0.8rem;
                    }

                    /* Button Mobile - Properly Sized */
                    .btn-instant-appointment {
                        padding: 12px 18px;
                        font-size: 0.85rem;
                        border-radius: 10px;
                        margin-top: 0.75rem;
                    }

                    .review-submission-box {
                        padding: 1rem;
                        margin-top: 1.5rem;
                        border-radius: 14px;
                    }

                    .rating-selector {
                        gap: 6px;
                    }

                    .star-selector {
                        font-size: 1.2rem;
                    }

                    .form-premium-input {
                        padding: 10px 12px;
                        font-size: 0.9rem;
                        margin-bottom: 0.75rem;
                    }

                    .btn-submit-review-premium {
                        padding: 10px 20px;
                        font-size: 0.85rem;
                        width: 100%;
                    }

                    .review-card-premium {
                        padding-bottom: 1rem;
                        margin-bottom: 1rem;
                    }

                    .rc-avatar {
                        width: 36px;
                        height: 36px;
                        font-size: 0.9rem;
                    }

                    .rc-author-name {
                        font-size: 0.9rem;
                    }

                    .rc-title {
                        font-size: 0.95rem;
                    }

                    .rc-body {
                        font-size: 0.85rem;
                    }

                    .info-grid-premium {
                        grid-template-columns: 1fr 1fr;
                        gap: 0.75rem;
                    }

                    .info-card-modern {
                        padding: 1rem;
                        gap: 0.75rem;
                    }

                    .icm-icon {
                        width: 36px;
                        height: 36px;
                        font-size: 1rem;
                    }

                    .icm-label {
                        font-size: 0.65rem;
                    }

                    .icm-value {
                        font-size: 0.85rem;
                    }
                }

                /* Extra Small Mobile (max-width: 480px) */
                @media (max-width: 480px) {
                    .profile-header-strip {
                        padding: 1rem;
                    }

                    .doc-image-wrapper {
                        width: 120px;
                        height: 120px;
                    }

                    .doc-name-hero {
                        font-size: 1.3rem;
                    }

                    .doc-stats-row {
                        gap: 0.75rem;
                    }

                    .stat-v-premium {
                        font-size: 1rem;
                    }

                    .hospital-details-sidebar {
                        grid-template-columns: 1fr;
                    }

                    .info-grid-premium {
                        grid-template-columns: 1fr;
                    }

                    .btn-instant-appointment {
                        padding: 11px 16px;
                        font-size: 0.8rem;
                    }
                }
                `}
            </style>

            <PageHero
                title={doctor ? `Dr. ${doctor.first_name} ${doctor.last_name}` : "Professional Profile"}
                description=""
                breadcrumbs={[
                    { label: 'Home', path: '/' },
                    { label: 'Doctors', path: '/doctors' },
                    { label: doctor ? `Dr. ${doctor.first_name} ${doctor.last_name}` : 'Loading...' }
                ]}
            />

            <div className="container profile-content-container">
                {loading ? (
                    <ContentLoader message="Fetching Medical Faculty Profile..." />
                ) : !doctor ? (
                    <div className="profile-content-loading" data-aos="fade-in">
                        <div className="loader-box">
                            <i className="bi bi-person-exclamation text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                            <h3>Doctor Profile Not Found</h3>
                            <p className="text-muted">The profile you are looking for might have been moved or removed.</p>
                            <Link to="/doctors" className="btn btn-primary mt-3">Back to Medical Faculty</Link>
                        </div>
                    </div>
                ) : (
                    <div className="row g-4">
                        <div className="col-lg-8" data-aos="fade-up">
                            <div className="profile-main-card">
                                {/* Doctor Header Strip */}
                                <div className="profile-header-strip">
                                    <div className="doc-image-wrapper">
                                        <img
                                            src={getImageUrl(doctor.profile_picture)}
                                            alt={doctor.first_name}
                                            onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${doctor.first_name}+${doctor.last_name}&background=0D8ABC&color=fff&size=512` }}
                                        />
                                    </div>
                                    <div className="doc-primary-details">
                                        <h1 className="doc-name-hero">Dr. {doctor.first_name} {doctor.last_name}</h1>
                                        <div className="doc-spec-hero">
                                            <i className="bi bi-patch-check-fill"></i>
                                            {doctor.specialization} &bull; {doctor.department?.name}
                                        </div>
                                        <div className="doc-stats-row">
                                            <div className="stat-item-premium">
                                                <span className="stat-v-premium">{doctor.experience_years}+</span>
                                                <span className="stat-l-premium">Years Experience</span>
                                            </div>
                                            <div className="stat-item-premium">
                                                <span className="stat-v-premium">{doctor.average_rating || '4.8'}</span>
                                                <span className="stat-l-premium">Rating</span>
                                            </div>
                                            <div className="stat-item-premium">
                                                <span className="stat-v-premium">{doctor.completed_appointments || 0}</span>
                                                <span className="stat-l-premium">Success Stories</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Main Sections */}
                                <div className="profile-sections-wrapper">
                                    <section className="section-container">
                                        <h2 className="p-section-title">Biography</h2>
                                        <p className="p-text-content">
                                            {doctor.bio || `Dr. ${doctor.first_name} ${doctor.last_name} is a distinguished specialist within our hospital's ${doctor.department?.name} department. 
                                        With over ${doctor.experience_years} years of dedicated practice, Dr. ${doctor.last_name} has built a reputation for clinical excellence 
                                        and a patient-centered approach. Their commitment to staying at the forefront of medical advancements ensures that patients receive 
                                        the most effective and modern treatments available.`}
                                        </p>
                                    </section>

                                    <section className="section-container">
                                        <h2 className="p-section-title">Fields of Expertise</h2>
                                        <div className="expertise-grid">
                                            {doctor.specialization.split(',').map((item, idx) => (
                                                <div key={idx} className="expertise-item">
                                                    <i className="bi bi-heart-pulse-fill"></i>
                                                    {item.trim()}
                                                </div>
                                            ))}
                                            <div className="expertise-item">
                                                <i className="bi bi-shield-check"></i>
                                                Patient Care
                                            </div>
                                        </div>
                                    </section>

                                    <section className="section-container">
                                        <h2 className="p-section-title">Clinical Qualifications</h2>
                                        <div className="p-text-content">
                                            <ul className="list-unstyled row">
                                                {doctor.qualification.split(',').map((q, idx) => (
                                                    <li key={idx} className="col-md-6 mb-3 d-flex align-items-center gap-3">
                                                        <div className="icon-circle bg-light-blue text-primary" style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                            <i className="bi bi-mortarboard-fill"></i>
                                                        </div>
                                                        <div>
                                                            <span className="d-block text-muted small fw-bold text-uppercase" style={{ letterSpacing: '0.5px' }}>Qualification</span>
                                                            <strong>{q.trim()}</strong>
                                                        </div>
                                                    </li>
                                                ))}
                                                <li className="col-md-6 mb-3 d-flex align-items-center gap-3">
                                                    <div className="icon-circle bg-light-blue text-primary" style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                        <i className="bi bi-card-checklist"></i>
                                                    </div>
                                                    <div>
                                                        <span className="d-block text-muted small fw-bold text-uppercase" style={{ letterSpacing: '0.5px' }}>Medical License</span>
                                                        <strong>{doctor.license_number}</strong>
                                                    </div>
                                                </li>
                                            </ul>
                                        </div>
                                    </section>

                                    <section className="section-container">
                                        <h2 className="p-section-title">Faculty Information</h2>
                                        <div className="info-grid-premium">
                                            <div className="info-card-modern">
                                                <div className="icm-icon"><i className="bi bi-person-lines-fill"></i></div>
                                                <div className="icm-content">
                                                    <span className="icm-label">Gender</span>
                                                    <span className="icm-value" style={{ textTransform: 'capitalize' }}>{doctor.gender || 'Not Specified'}</span>
                                                </div>
                                            </div>
                                            <div className="info-card-modern">
                                                <div className="icm-icon"><i className="bi bi-calendar2-check"></i></div>
                                                <div className="icm-content">
                                                    <span className="icm-label">Joined Faculty</span>
                                                    <span className="icm-value">{(doctor as any).joining_date ? new Date((doctor as any).joining_date).toLocaleDateString() : 'Active Member'}</span>
                                                </div>
                                            </div>
                                            <div className="info-card-modern">
                                                <div className="icm-icon"><i className="bi bi-geo-alt"></i></div>
                                                <div className="icm-content">
                                                    <span className="icm-label">Practice Location</span>
                                                    <span className="icm-value">{(doctor as any).city ? `${(doctor as any).city}, ${(doctor as any).state || ''}` : 'Hospital Main Wing'}</span>
                                                </div>
                                            </div>
                                            <div className="info-card-modern">
                                                <div className="icm-icon"><i className="bi bi-people"></i></div>
                                                <div className="icm-content">
                                                    <span className="icm-label">Patients</span>
                                                    <span className="icm-value">{doctor.completed_appointments}+ Treated</span>
                                                </div>
                                            </div>
                                        </div>
                                        <style>{`
                                        .info-grid-premium {
                                            display: grid;
                                            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                                            gap: 1.5rem;
                                        }
                                        .info-card-modern {
                                            background: #f8fafc;
                                            padding: 1.5rem;
                                            border-radius: 16px;
                                            display: flex;
                                            align-items: center;
                                            gap: 1.2rem;
                                            transition: all 0.3s ease;
                                            border: 1px solid #f1f5f9;
                                        }
                                        .info-card-modern:hover {
                                            background: white;
                                            box-shadow: 0 10px 20px rgba(0,0,0,0.05);
                                            border-color: var(--hospital-blue);
                                            transform: translateY(-5px);
                                        }
                                        .icm-icon {
                                            font-size: 1.5rem;
                                            color: var(--hospital-blue);
                                            background: white;
                                            width: 50px;
                                            height: 50px;
                                            border-radius: 12px;
                                            display: flex;
                                            align-items: center;
                                            justify-content: center;
                                            box-shadow: 0 4px 10px rgba(0,0,0,0.03);
                                        }
                                        .icm-label {
                                            display: block;
                                            font-size: 0.75rem;
                                            font-weight: 800;
                                            text-transform: uppercase;
                                            color: #94a3b8;
                                            margin-bottom: 2px;
                                        }
                                        .icm-value {
                                            font-weight: 700;
                                            color: var(--hospital-dark);
                                            font-size: 1rem;
                                        }
                                        .bg-light-blue { background-color: #e0f2fe; }
                                    `}</style>
                                    </section>

                                    <section className="section-container">
                                        <h2 className="p-section-title">Patient Voice & Reviews</h2>

                                        <div className="reviews-list">
                                            {doctor.approved_reviews && doctor.approved_reviews.length > 0 ? (
                                                doctor.approved_reviews.map((rev) => (
                                                    <div key={rev.id} className="review-card-premium">
                                                        <div className="rc-header">
                                                            <div className="rc-author-box">
                                                                <div className="rc-avatar">{rev.patient.name.charAt(0)}</div>
                                                                <div>
                                                                    <div className="rc-author-name">{rev.patient.name}</div>
                                                                    <div className="rc-stars">
                                                                        {[...Array(5)].map((_, i) => (
                                                                            <i key={i} className={`bi bi-star${i < rev.rating ? '-fill' : ''}`}></i>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="rc-date">{new Date(rev.reviewed_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                                        </div>
                                                        <h4 className="rc-title">{rev.title}</h4>
                                                        <p className="rc-body">{rev.review}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-5">
                                                    <div className="mb-3" style={{ fontSize: '3rem', color: '#e2e8f0' }}>
                                                        <i className="bi bi-chat-left-dots"></i>
                                                    </div>
                                                    <p className="text-muted">No patient reviews yet. Be the first to share your experience.</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Submit Review Form */}
                                        <div className="review-submission-box">
                                            <h3 className="mb-3" style={{ fontWeight: 800, color: 'var(--hospital-dark)' }}>Write a Review</h3>
                                            <p className="text-muted mb-4">Your feedback helps others make better healthcare decisions.</p>

                                            <form onSubmit={handleReviewSubmit}>
                                                <label className="si-label">Your Rating</label>
                                                <div className="rating-selector">
                                                    {[1, 2, 3, 4, 5].map((s) => (
                                                        <i
                                                            key={s}
                                                            className={`bi bi-star-fill star-selector ${reviewForm.rating >= s ? 'active' : ''}`}
                                                            onClick={() => setReviewForm(prev => ({ ...prev, rating: s }))}
                                                        ></i>
                                                    ))}
                                                </div>

                                                <div className="row">
                                                    <div className="col-md-12">
                                                        <label className="si-label">Review Title</label>
                                                        <input
                                                            type="text"
                                                            className="form-premium-input"
                                                            placeholder="e.g. Excellent consultation"
                                                            value={reviewForm.title}
                                                            onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="col-md-12">
                                                        <label className="si-label">Detailed Feedback</label>
                                                        <textarea
                                                            className="form-premium-input"
                                                            rows={4}
                                                            placeholder="Share details about your visit with Dr. ${doctor.last_name}..."
                                                            value={reviewForm.review}
                                                            onChange={(e) => setReviewForm(prev => ({ ...prev, review: e.target.value }))}
                                                            required
                                                        ></textarea>
                                                    </div>
                                                </div>
                                                <button
                                                    type="submit"
                                                    className="btn-submit-review-premium"
                                                    disabled={submittingReview}
                                                >
                                                    {submittingReview ? 'Submitting...' : 'Post Patient Review'}
                                                </button>
                                            </form>
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="col-lg-4" data-aos="fade-left" data-aos-delay="200">
                            <div className="booking-sidebar-premium">
                                <div className={`availability-banner ${doctor.is_available ? 'available-now' : 'not-available'}`}>
                                    <i className={`bi ${doctor.is_available ? 'bi-circle-fill' : 'bi-dash-circle-fill'} me-2`}></i>
                                    {doctor.is_available ? 'Currently Online & Available' : 'Currently Not Available'}
                                </div>

                                <div className="booking-fee-row">
                                    <span className="fee-label">Consultation</span>
                                    <span className="fee-price">${doctor.consultation_fee}</span>
                                </div>

                                <div className="hospital-details-sidebar">
                                    <div className="sidebar-info-group">
                                        <span className="si-label">Consultation Hours</span>
                                        <span className="si-value">
                                            <i className="bi bi-clock-history me-2 text-primary"></i>
                                            {doctor.working_hours_start} - {doctor.working_hours_end}
                                        </span>
                                    </div>

                                    <div className="sidebar-info-group">
                                        <span className="si-label">Active Working Days</span>
                                        <span className="si-value">
                                            <i className="bi bi-calendar3 me-2 text-primary"></i>
                                            {formatList(doctor.working_days)}
                                        </span>
                                    </div>

                                    <div className="sidebar-info-group">
                                        <span className="si-label">Languages Spoken</span>
                                        <span className="si-value">
                                            <i className="bi bi-translate me-2 text-primary"></i>
                                            {formatList(doctor.languages)}
                                        </span>
                                    </div>

                                    <div className="sidebar-info-group">
                                        <span className="si-label">Faculty ID</span>
                                        <span className="si-value">
                                            <i className="bi bi-person-badge-fill me-2 text-primary"></i>
                                            {doctor.doctor_id}
                                        </span>
                                    </div>

                                    <div className="sidebar-info-group">
                                        <span className="si-label">Employment</span>
                                        <span className="si-value" style={{ textTransform: 'capitalize' }}>
                                            <i className="bi bi-building-check me-2 text-primary"></i>
                                            {doctor.employment_type.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>

                                <Link to={`/doctors/${doctor.id}`} className="btn-instant-appointment text-decoration-none d-block text-center mt-4">
                                    Schedule Appointment
                                </Link>

                                <div className="mt-4 text-center">
                                    <p className="text-muted small mb-0">
                                        <i className="bi bi-shield-fill-check me-1 text-success"></i>
                                        Certified Medical Faculty &bull; HMS Secure
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorProfile;
