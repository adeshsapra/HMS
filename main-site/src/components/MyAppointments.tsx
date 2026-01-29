import { useState, useEffect } from 'react'
import { patientProfileAPI } from '../services/api'
import { useToast } from '../context/ToastContext'
import DoctorReviewModal from './DoctorReviewModal'

interface Appointment {
    id: number
    doctor_id: number
    doctor_name: string
    doctor_specialization: string
    department_name: string
    appointment_date: string
    appointment_time: string
    reason?: string
    status: string
    patient_name: string
    patient_email: string
    patient_phone: string
    created_at: string
    updated_at: string
}

interface AppointmentFilters {
    status: string
    start_date: string
    end_date: string
}


interface MyAppointmentsProps {
    onNavigateToTestimonials?: () => void
}

const MyAppointments = ({ onNavigateToTestimonials }: MyAppointmentsProps) => {
    const { showToast } = useToast()

    // State management
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [appointmentsLoading, setAppointmentsLoading] = useState(false)
    const [appointmentFilters, setAppointmentFilters] = useState<AppointmentFilters>({
        status: '',
        start_date: '',
        end_date: ''
    })

    // Modal states
    const [viewModalOpen, setViewModalOpen] = useState(false)
    const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [reviewModalOpen, setReviewModalOpen] = useState(false)
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

    // Time Selection State for Reschedule
    const [rescheduleSelectedHour, setRescheduleSelectedHour] = useState<string>('09')
    const [rescheduleSelectedMinute, setRescheduleSelectedMinute] = useState<string>('00')
    const [rescheduleSelectedPeriod, setRescheduleSelectedPeriod] = useState<string>('AM')

    // Time picker data
    const hoursList = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'))
    const minutesList = ['00', '15', '30', '45']

    // Helper function to format appointment date
    const formatAppointmentDate = (dateString: string) => {
        try {
            const date = new Date(dateString)
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            })
        } catch (error) {
            return dateString
        }
    }

    // Fetch appointments
    const fetchAppointments = async () => {
        try {
            setAppointmentsLoading(true)
            const response = await patientProfileAPI.getMyAppointments({
                ...appointmentFilters,
                per_page: 10
            })

            if (response.data.status) {
                const paginator = response.data.data
                setAppointments(paginator.data)
            }
        } catch (error) {
            console.error('Error fetching appointments:', error)
            showToast('Failed to load appointments', 'error')
        } finally {
            setAppointmentsLoading(false)
        }
    }

    // Get status badge class
    const getStatusBadgeClass = (status: string) => {
        const baseClass = 'profile-appointment-status-badge'
        switch (status?.toLowerCase()) {
            case 'pending':
                return `${baseClass} pending`
            case 'confirmed':
                return `${baseClass} confirmed`
            case 'completed':
                return `${baseClass} completed`
            case 'cancelled':
                return `${baseClass} cancelled`
            default:
                return `${baseClass} pending`
        }
    }

    // Get status icon
    const getStatusIcon = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 'bi-clock'
            case 'confirmed':
                return 'bi-check-circle'
            case 'completed':
                return 'bi-check-circle-fill'
            case 'cancelled':
                return 'bi-x-circle'
            default:
                return 'bi-clock'
        }
    }

    // Handle appointment actions
    const handleViewAppointment = (appointment: Appointment) => {
        setSelectedAppointment(appointment)
        setViewModalOpen(true)
    }

    const handleRescheduleAppointment = (appointment: Appointment) => {
        setSelectedAppointment(appointment)

        // Parse current appointment time and pre-populate time picker
        const currentTime = appointment.appointment_time
        const timeMatch = currentTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)

        if (timeMatch) {
            let [, hours, minutes, period] = timeMatch
            let hourNum = parseInt(hours)

            // Convert to 12-hour format for display
            if (period.toUpperCase() === 'AM' && hourNum === 12) {
                hourNum = 12
            } else if (period.toUpperCase() === 'PM' && hourNum !== 12) {
                hourNum = hourNum + 12
            }

            // Convert back to 12-hour format for picker
            if (hourNum === 0) {
                setRescheduleSelectedHour('12')
                setRescheduleSelectedPeriod('AM')
            } else if (hourNum <= 12) {
                setRescheduleSelectedHour(hourNum.toString().padStart(2, '0'))
                setRescheduleSelectedPeriod('AM')
            } else {
                setRescheduleSelectedHour((hourNum - 12).toString().padStart(2, '0'))
                setRescheduleSelectedPeriod('PM')
            }

            setRescheduleSelectedMinute(minutes)
        } else {
            setRescheduleSelectedHour('09')
            setRescheduleSelectedMinute('00')
            setRescheduleSelectedPeriod('AM')
        }

        setRescheduleModalOpen(true)
    }

    const handleDeleteModalOpen = (appointment: Appointment) => {
        setSelectedAppointment(appointment)
        setDeleteModalOpen(true)
    }

    const handleOpenReviewModal = (appointment: Appointment) => {
        setSelectedAppointment(appointment)
        setReviewModalOpen(true)
    }

    const handleCancelAppointment = async (appointmentId: number) => {
        try {
            const response = await patientProfileAPI.cancelAppointment(appointmentId)
            if (response.data.status) {
                showToast('Appointment cancelled successfully', 'success')
                setDeleteModalOpen(false) // Close modal
                fetchAppointments()
            }
        } catch (error) {
            console.error('Error cancelling appointment:', error)
            showToast('Failed to cancel appointment', 'error')
        }
    }

    const handleRescheduleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!selectedAppointment) return

        const formData = new FormData(e.currentTarget)
        const appointmentDate = formData.get('appointment_date') as string
        const reason = formData.get('reason') as string

        const appointmentTime = `${rescheduleSelectedHour}:${rescheduleSelectedMinute} ${rescheduleSelectedPeriod}`

        const selectedDateTime = new Date(`${appointmentDate}T${rescheduleSelectedHour}:${rescheduleSelectedMinute}:00`)

        if (rescheduleSelectedPeriod === 'PM' && rescheduleSelectedHour !== '12') {
            selectedDateTime.setHours(selectedDateTime.getHours() + 12)
        } else if (rescheduleSelectedPeriod === 'AM' && rescheduleSelectedHour === '12') {
            selectedDateTime.setHours(0)
        }

        const now = new Date()

        if (selectedDateTime <= now) {
            showToast('Please select a future date and time', 'error')
            return
        }

        try {
            const response = await patientProfileAPI.rescheduleAppointment(selectedAppointment.id, {
                appointment_date: appointmentDate,
                appointment_time: appointmentTime,
                reason: reason || undefined
            })

            if (response.data.status) {
                showToast('Appointment rescheduled successfully', 'success')
                setRescheduleModalOpen(false)
                // Reset time picker state
                setRescheduleSelectedHour('09')
                setRescheduleSelectedMinute('00')
                setRescheduleSelectedPeriod('AM')
                fetchAppointments()
            }
        } catch (error) {
            console.error('Error rescheduling appointment:', error)
            showToast('Failed to reschedule appointment', 'error')
        }
    }

    // Initial load
    useEffect(() => {
        fetchAppointments()
    }, [])

    return (
        <div className="profile-appointment-container">
            <style>{`
                .profile-appointment-container {
                    --pa-bg-color: #ffffff;
                    --pa-default-color: #2c3031;
                    --pa-heading-color: #18444c;
                    --pa-accent-color: #049ebb;
                    --pa-surface-color: #ffffff;
                    --pa-contrast-color: #ffffff;
                    
                    width: 100%;
                    font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                }

                /* --- Main Card Section --- */
                .profile-appointment-section {
                    background: var(--pa-surface-color);
                    border-radius: 20px;
                    padding: 2.5rem;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
                    min-height: 600px;
                    border: 1px solid rgba(0,0,0,0.02);
                }

                .profile-appointment-section-header {
                    margin-bottom: 2.5rem;
                    padding-bottom: 1.5rem;
                    border-bottom: 1px solid color-mix(in srgb, var(--pa-default-color), transparent 92%);
                }

                .profile-appointment-section-header h3 {
                    font-size: 1.85rem;
                    color: var(--pa-heading-color);
                    margin-bottom: 0.5rem;
                    font-weight: 700;
                    letter-spacing: -0.5px;
                }

                .profile-appointment-section-header p {
                    color: color-mix(in srgb, var(--pa-default-color), transparent 30%);
                    font-weight: 500;
                }

                /* --- Filters & Buttons --- */
                .profile-appointment-filters {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .profile-appointment-filters .form-control {
                    min-width: 160px;
                    border-radius: 8px;
                    border: 1px solid #e0e0e0;
                    padding: 0.4rem 0.8rem;
                }
                
                .profile-appointment-filters .form-control:focus {
                    border-color: var(--pa-accent-color);
                    box-shadow: 0 0 0 4px color-mix(in srgb, var(--pa-accent-color), transparent 90%);
                }

                .profile-appointment-btn-refresh {
                    color: var(--pa-accent-color);
                    border-color: var(--pa-accent-color);
                    border-radius: 8px;
                    padding: 0.4rem 1rem;
                    transition: all 0.3s;
                }

                .profile-appointment-btn-refresh:hover {
                    background-color: var(--pa-accent-color);
                    color: #fff;
                }

                /* --- Appointment Cards --- */
                .profile-appointment-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                }

                .profile-appointment-card {
                    background: var(--pa-surface-color);
                    border: 1px solid color-mix(in srgb, var(--pa-default-color), transparent 92%);
                    border-radius: 16px;
                    padding: 1.75rem;
                    transition: all 0.3s ease;
                    position: relative;
                }

                .profile-appointment-card:hover {
                    border-color: color-mix(in srgb, var(--pa-accent-color), transparent 70%);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
                    transform: translateY(-3px);
                }

                .profile-appointment-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1.25rem;
                }

                .profile-appointment-doctor {
                    color: var(--pa-heading-color);
                    font-size: 1.15rem;
                    font-weight: 700;
                    margin-bottom: 0.25rem;
                }

                .profile-appointment-specialty {
                    font-size: 0.9rem;
                    color: color-mix(in srgb, var(--pa-default-color), transparent 40%);
                    font-weight: 500;
                }

                /* --- Status Badges --- */
                .profile-appointment-status-badge {
                    padding: 0.5rem 1rem;
                    border-radius: 30px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    display: inline-flex;
                    align-items: center;
                }

                .profile-appointment-status-badge.pending { background: #fff8e1; color: #f57f17; }
                .profile-appointment-status-badge.confirmed { background: #e8f5e9; color: #2e7d32; }
                .profile-appointment-status-badge.completed { background: #e0f7fa; color: #006064; }
                .profile-appointment-status-badge.cancelled { background: #ffebee; color: #c62828; }

                /* --- Details Grid --- */
                .profile-appointment-details {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 1rem;
                    margin-bottom: 1.25rem;
                    padding-bottom: 1.25rem;
                    border-bottom: 1px dashed color-mix(in srgb, var(--pa-default-color), transparent 85%);
                }

                .profile-appointment-detail-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    color: var(--pa-default-color);
                    font-size: 0.95rem;
                }

                .profile-appointment-icon-box {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    background: color-mix(in srgb, var(--pa-accent-color), transparent 92%);
                    color: var(--pa-accent-color);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .profile-appointment-reason {
                    background: color-mix(in srgb, var(--pa-heading-color), transparent 96%);
                    border-radius: 10px;
                    padding: 1rem;
                    margin-bottom: 1rem;
                    font-size: 0.9rem;
                    color: var(--pa-default-color);
                }

                /* --- Action Button --- */
                .profile-appointment-action-trigger {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    border: 1px solid #eee;
                    background: white;
                    color: var(--pa-default-color);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }

                .profile-appointment-action-trigger:hover {
                    background: var(--pa-heading-color);
                    color: white;
                    border-color: var(--pa-heading-color);
                }

                /* --- Pagination (Scoped) --- */
                .profile-appointment-page-link {
                    color: var(--pa-heading-color);
                    border: none;
                    margin: 0 4px;
                    border-radius: 8px;
                    font-weight: 500;
                    padding: 0.5rem 0.75rem;
                    text-decoration: none;
                }
                
                .profile-appointment-page-item.active .profile-appointment-page-link {
                    background-color: var(--pa-accent-color);
                    color: white;
                    box-shadow: 0 4px 10px color-mix(in srgb, var(--pa-accent-color), transparent 50%);
                }

                /* --- PROFESSIONAL MODAL DESIGN --- */
                
                /* 1. Backdrop */
                .profile-appointment-modal-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: color-mix(in srgb, var(--pa-heading-color), transparent 40%);
                    backdrop-filter: blur(8px);
                    z-index: 1050;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    animation: paFadeIn 0.3s forwards;
                }

                /* 2. Modal Content Container */
                .profile-appointment-modal-content {
                    background: var(--pa-surface-color);
                    width: 90%;
                    max-width: 600px;
                    border-radius: 24px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    overflow: hidden;
                    opacity: 0;
                    transform: scale(0.95) translateY(20px);
                    animation: paScaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }

                .profile-appointment-modal-content.large {
                    max-width: 800px;
                }

                /* 3. Header */
                .profile-appointment-modal-header {
                    padding: 1.5rem 2rem;
                    background: var(--pa-surface-color);
                    border-bottom: 1px solid rgba(0,0,0,0.05);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .profile-appointment-modal-title {
                    font-size: 1.4rem;
                    font-weight: 700;
                    color: var(--pa-heading-color);
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                
                .profile-appointment-modal-title i {
                    color: var(--pa-accent-color);
                }

                .profile-appointment-btn-close {
                    background: transparent;
                    border: none;
                    font-size: 1.5rem;
                    color: #999;
                    cursor: pointer;
                    transition: color 0.2s;
                    line-height: 1;
                }
                
                .profile-appointment-btn-close:hover {
                    color: var(--pa-heading-color);
                }

                /* 4. Body */
                .profile-appointment-modal-body {
                    padding: 2rem;
                    overflow-y: auto;
                    max-height: 70vh;
                }

                /* 5. Footer */
                .profile-appointment-modal-footer {
                    padding: 1.5rem 2rem;
                    background: color-mix(in srgb, var(--pa-surface-color), #f9f9f9 50%);
                    border-top: 1px solid rgba(0,0,0,0.05);
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                }

                /* Form Styles inside Modal */
                .profile-appointment-modal-label {
                    font-size: 0.8rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: color-mix(in srgb, var(--pa-heading-color), transparent 40%);
                    margin-bottom: 0.5rem;
                    display: block;
                }

                .profile-appointment-modal-value {
                    font-size: 14px;
                    color: var(--pa-heading-color);
                    font-weight: 500;
                }

                .profile-appointment-modal-input {
                    display: block;
                    width: 100%;
                    padding: 0.75rem 1rem;
                    font-size: 1rem;
                    color: var(--pa-default-color);
                    background-color: #fff;
                    border: 1px solid #e0e0e0;
                    border-radius: 12px;
                    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
                }

                .profile-appointment-modal-input:focus {
                    border-color: var(--pa-accent-color);
                    outline: 0;
                    box-shadow: 0 0 0 4px color-mix(in srgb, var(--pa-accent-color), transparent 90%);
                }

                /* Button Styles */
                .profile-appointment-btn-secondary {
                    background: transparent;
                    border: 1px solid #ddd;
                    color: var(--pa-default-color);
                    padding: 0.6rem 1.25rem;
                    border-radius: 10px;
                    font-weight: 600;
                    transition: all 0.2s;
                }
                
                .profile-appointment-btn-secondary:hover {
                    background: #f5f5f5;
                }

                .profile-appointment-btn-primary {
                    background: var(--pa-accent-color);
                    border: 1px solid var(--pa-accent-color);
                    color: white;
                    padding: 0.6rem 1.5rem;
                    border-radius: 10px;
                    font-weight: 600;
                    box-shadow: 0 4px 12px color-mix(in srgb, var(--pa-accent-color), transparent 60%);
                    transition: all 0.2s;
                }

                .profile-appointment-btn-primary:hover {
                    background: color-mix(in srgb, var(--pa-accent-color), black 10%);
                    transform: translateY(-1px);
                }
                
                .profile-appointment-btn-danger {
                    background: #ef4444;
                    border: none;
                    color: white;
                    padding: 0.6rem 1.5rem;
                    border-radius: 10px;
                    font-weight: 600;
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
                }

                .profile-appointment-btn-danger:hover {
                    background: #dc2626;
                }

                /* Animations */
                @keyframes paFadeIn {
                    to { opacity: 1; }
                }

                @keyframes paScaleUp {
                    to { 
                        opacity: 1; 
                        transform: scale(1) translateY(0);
                    }
                }

                /* --- RESCHEDULE TIME PICKER STYLES --- */
                .profile-appointment-reschedule-wrapper {
                    background: #f8fbfc;
                    border: 1px solid #e0e0e0;
                    border-radius: 12px;
                    padding: 15px;
                    margin-bottom: 20px;
                }

                .profile-appointment-reschedule-display {
                    text-align: center;
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: var(--pa-accent-color);
                    margin-bottom: 15px;
                    letter-spacing: 1px;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 10px;
                }

                .profile-appointment-reschedule-selector {
                    display: flex;
                    gap: 15px;
                    justify-content: space-between;
                }

                .profile-appointment-reschedule-column {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .profile-appointment-reschedule-label {
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    color: #888;
                    font-weight: 700;
                    text-align: center;
                    margin-bottom: 5px;
                }

                .profile-appointment-reschedule-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 6px;
                }
                
                .profile-appointment-reschedule-grid.minutes {
                    grid-template-columns: repeat(2, 1fr);
                }
                
                .profile-appointment-reschedule-grid.period {
                    grid-template-columns: 1fr;
                }

                .profile-appointment-reschedule-btn {
                    background: white;
                    border: 1px solid #eee;
                    border-radius: 6px;
                    padding: 6px 0;
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: var(--pa-default-color);
                    cursor: pointer;
                    transition: all 0.2s;
                    text-align: center;
                }

                .profile-appointment-reschedule-btn:hover {
                    border-color: var(--pa-accent-color);
                    color: var(--pa-accent-color);
                }

                .profile-appointment-reschedule-btn.active {
                    background: var(--pa-accent-color);
                    color: white;
                    border-color: var(--pa-accent-color);
                    box-shadow: 0 4px 10px rgba(4, 158, 187, 0.3);
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .profile-appointment-section { padding: 1.5rem; }
                    .profile-appointment-card-header { flex-direction: column; gap: 0.5rem; }
                    .profile-appointment-modal-content { width: 95%; margin: 1rem; max-height: 90vh; }
                    .profile-appointment-reschedule-selector { flex-direction: column; gap: 10px; }
                    .profile-appointment-reschedule-grid { grid-template-columns: repeat(4, 1fr); }
                }
            `}</style>

            <div className="profile-appointment-section">
                <div className="profile-appointment-section-header">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <div>
                            <h3>My Appointments</h3>
                            <p className="mb-0">View and manage your appointment history</p>
                        </div>
                        <div className="profile-appointment-filters">
                            <select
                                className="form-control"
                                value={appointmentFilters.status}
                                onChange={(e) => setAppointmentFilters(prev => ({ ...prev, status: e.target.value }))}
                            >
                                <option value="">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <button
                                className="btn btn-outline-primary profile-appointment-btn-refresh"
                                onClick={() => fetchAppointments()}
                            >
                                <i className="bi bi-arrow-clockwise me-1"></i>
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>

                {appointmentsLoading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status" style={{ color: 'var(--pa-accent-color)' }}>
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3 text-muted">Loading your appointments...</p>
                    </div>
                ) : appointments.length === 0 ? (
                    <div className="no-appointments text-center py-5">
                        <div style={{ fontSize: '3rem', color: '#e0e0e0' }} className="mb-3">
                            <i className="bi bi-calendar-x"></i>
                        </div>
                        <h4 style={{ color: 'var(--pa-heading-color)' }}>No Appointments Found</h4>
                        <p className="text-muted">You don't have any appointments matching your criteria.</p>
                    </div>
                ) : (
                    <div className="profile-appointment-list">
                        {appointments.map((appointment) => (
                            <div key={appointment.id} className="profile-appointment-card">
                                <div className="profile-appointment-card-header">
                                    <div className="appointment-info">
                                        <h5 className="profile-appointment-doctor">
                                            {appointment.doctor_name}
                                        </h5>
                                        <p className="profile-appointment-specialty">
                                            {appointment.doctor_specialization}
                                        </p>
                                    </div>
                                    <div className="appointment-status">
                                        <span className={getStatusBadgeClass(appointment.status)}>
                                            <i className={`bi ${getStatusIcon(appointment.status)} me-1`}></i>
                                            {appointment.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="profile-appointment-details">
                                    <div className="profile-appointment-detail-item">
                                        <div className="profile-appointment-icon-box">
                                            <i className="bi bi-calendar-event"></i>
                                        </div>
                                        <span>{formatAppointmentDate(appointment.appointment_date)}</span>
                                    </div>
                                    <div className="profile-appointment-detail-item">
                                        <div className="profile-appointment-icon-box">
                                            <i className="bi bi-clock"></i>
                                        </div>
                                        <span>{appointment.appointment_time}</span>
                                    </div>
                                    <div className="profile-appointment-detail-item">
                                        <div className="profile-appointment-icon-box">
                                            <i className="bi bi-building"></i>
                                        </div>
                                        <span>{appointment.department_name}</span>
                                    </div>
                                </div>

                                <div className="d-flex justify-content-between align-items-center">
                                    <div style={{ flex: 1 }}>
                                        {appointment.reason && (
                                            <div className="profile-appointment-reason mb-0 d-inline-block">
                                                <i className="bi bi-chat-left-text me-2 text-primary"></i>
                                                {appointment.reason.length > 50 ? appointment.reason.substring(0, 50) + '...' : appointment.reason}
                                            </div>
                                        )}
                                    </div>

                                    <div className="dropdown">
                                        <button
                                            className="profile-appointment-action-trigger dropdown-toggle no-arrow"
                                            type="button"
                                            data-bs-toggle="dropdown"
                                        >
                                            <i className="bi bi-three-dots-vertical"></i>
                                        </button>
                                        <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0" style={{ borderRadius: '12px', padding: '0.5rem' }}>
                                            <li>
                                                <button
                                                    className="dropdown-item py-2 rounded"
                                                    onClick={() => handleViewAppointment(appointment)}
                                                >
                                                    <i className="bi bi-eye me-2 text-primary"></i>
                                                    View Details
                                                </button>
                                            </li>
                                            {['pending', 'confirmed'].includes(appointment.status.toLowerCase()) && (
                                                <li>
                                                    <button
                                                        className="dropdown-item py-2 rounded"
                                                        onClick={() => handleRescheduleAppointment(appointment)}
                                                    >
                                                        <i className="bi bi-calendar2 me-2 text-warning"></i>
                                                        Reschedule
                                                    </button>
                                                </li>
                                            )}
                                            {appointment.status.toLowerCase() === 'pending' && (
                                                <li>
                                                    <button
                                                        className="dropdown-item py-2 rounded text-danger"
                                                        onClick={() => handleDeleteModalOpen(appointment)}
                                                    >
                                                        <i className="bi bi-x-circle me-2"></i>
                                                        Cancel
                                                    </button>
                                                </li>
                                            )}
                                            {appointment.status.toLowerCase() === 'completed' && (
                                                <li>
                                                    <button
                                                        className="dropdown-item py-2 rounded text-success"
                                                        onClick={() => handleOpenReviewModal(appointment)}
                                                    >
                                                        <i className="bi bi-star me-2"></i>
                                                        Rate Doctor
                                                    </button>
                                                </li>
                                            )}
                                            {appointment.status.toLowerCase() === 'completed' && onNavigateToTestimonials && (
                                                <li>
                                                    <button
                                                        className="dropdown-item py-2 rounded text-info"
                                                        onClick={onNavigateToTestimonials}
                                                    >
                                                        <i className="bi bi-chat-dots me-2"></i>
                                                        Rate Site Experience
                                                    </button>
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* --- CUSTOM MODALS --- */}

            {/* View Modal */}
            {viewModalOpen && selectedAppointment && (
                <div className="profile-appointment-modal-backdrop" onClick={() => setViewModalOpen(false)}>
                    <div className="profile-appointment-modal-content large" onClick={e => e.stopPropagation()}>
                        <div className="profile-appointment-modal-header">
                            <h5 className="profile-appointment-modal-title">
                                <i className="bi bi-file-medical"></i>
                                Appointment Details
                            </h5>
                            <button type="button" className="profile-appointment-btn-close" onClick={() => setViewModalOpen(false)}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        <div className="profile-appointment-modal-body">
                            <div className="row g-4">
                                <div className="col-md-6 border-end">
                                    <div className="mb-4">
                                        <label className="profile-appointment-modal-label">Doctor</label>
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px', color: 'var(--pa-accent-color)', fontSize: '1.5rem' }}>
                                                <i className="bi bi-person-fill"></i>
                                            </div>
                                            <div>
                                                <div className="profile-appointment-modal-value">{selectedAppointment.doctor_name}</div>
                                                <small className="text-muted">{selectedAppointment.doctor_specialization}</small>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <label className="profile-appointment-modal-label">Department</label>
                                        <div className="profile-appointment-modal-value">{selectedAppointment.department_name}</div>
                                    </div>
                                    <div>
                                        <label className="profile-appointment-modal-label">Status</label>
                                        <span className={getStatusBadgeClass(selectedAppointment.status)}>
                                            {selectedAppointment.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="col-md-6 ps-md-4">
                                    <div className="mb-4">
                                        <label className="profile-appointment-modal-label">Date & Time</label>
                                        <div className="profile-appointment-modal-value">
                                            <i className="bi bi-calendar3 me-2 text-muted"></i>
                                            {formatAppointmentDate(selectedAppointment.appointment_date)}
                                        </div>
                                        <div className="profile-appointment-modal-value mt-1">
                                            <i className="bi bi-clock me-2 text-muted"></i>
                                            {selectedAppointment.appointment_time}
                                        </div>
                                    </div>
                                    <div className="mb-0">
                                        <label className="profile-appointment-modal-label">Reason for Visit</label>
                                        <p className="p-3 bg-light rounded-3 mb-0 text-secondary">
                                            {selectedAppointment.reason || "No reason provided."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="profile-appointment-modal-footer">
                            <button className="profile-appointment-btn-secondary" onClick={() => setViewModalOpen(false)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reschedule Modal */}
            {rescheduleModalOpen && selectedAppointment && (
                <div className="profile-appointment-modal-backdrop" onClick={() => setRescheduleModalOpen(false)}>
                    <div className="profile-appointment-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="profile-appointment-modal-header">
                            <h5 className="profile-appointment-modal-title">
                                <i className="bi bi-calendar-range"></i>
                                Reschedule
                            </h5>
                            <button type="button" className="profile-appointment-btn-close" onClick={() => setRescheduleModalOpen(false)}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        <form onSubmit={handleRescheduleSubmit}>
                            <div className="profile-appointment-modal-body">
                                <div className="mb-4 p-3 rounded bg-light border">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <small className="text-uppercase fw-bold text-muted">Current Appointment</small>
                                        <span className="badge bg-secondary">
                                            {formatAppointmentDate(selectedAppointment.appointment_date)} at {selectedAppointment.appointment_time}
                                        </span>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-12 mb-3">
                                        <label className="profile-appointment-modal-label">New Date</label>
                                        <input
                                            name="appointment_date"
                                            type="date"
                                            className="profile-appointment-modal-input"
                                            min={new Date().toISOString().split('T')[0]}
                                            defaultValue={selectedAppointment.appointment_date}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="profile-appointment-modal-label">New Time</label>
                                    <div className="profile-appointment-reschedule-wrapper">
                                        <div className="profile-appointment-reschedule-display">
                                            {rescheduleSelectedHour} : {rescheduleSelectedMinute} {rescheduleSelectedPeriod}
                                        </div>
                                        <div className="text-center mb-2">
                                            <small className="text-muted">
                                                <i className="bi bi-info-circle me-1"></i>
                                                Current time: {selectedAppointment.appointment_time}
                                            </small>
                                        </div>

                                        <div className="profile-appointment-reschedule-selector">
                                            {/* Hours Column */}
                                            <div className="profile-appointment-reschedule-column">
                                                <span className="profile-appointment-reschedule-label">Hour</span>
                                                <div className="profile-appointment-reschedule-grid">
                                                    {hoursList.map((h) => (
                                                        <div
                                                            key={h}
                                                            className={`profile-appointment-reschedule-btn ${rescheduleSelectedHour === h ? 'active' : ''}`}
                                                            onClick={() => setRescheduleSelectedHour(h)}
                                                            role="button"
                                                            tabIndex={0}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' || e.key === ' ') {
                                                                    setRescheduleSelectedHour(h)
                                                                }
                                                            }}
                                                        >
                                                            {h}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Minutes Column */}
                                            <div className="profile-appointment-reschedule-column">
                                                <span className="profile-appointment-reschedule-label">Minute</span>
                                                <div className="profile-appointment-reschedule-grid minutes">
                                                    {minutesList.map((m) => (
                                                        <div
                                                            key={m}
                                                            className={`profile-appointment-reschedule-btn ${rescheduleSelectedMinute === m ? 'active' : ''}`}
                                                            onClick={() => setRescheduleSelectedMinute(m)}
                                                            role="button"
                                                            tabIndex={0}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' || e.key === ' ') {
                                                                    setRescheduleSelectedMinute(m)
                                                                }
                                                            }}
                                                        >
                                                            {m}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* AM/PM Column */}
                                            <div className="profile-appointment-reschedule-column">
                                                <span className="profile-appointment-reschedule-label">Period</span>
                                                <div className="profile-appointment-reschedule-grid period">
                                                    {['AM', 'PM'].map((p) => (
                                                        <div
                                                            key={p}
                                                            className={`profile-appointment-reschedule-btn ${rescheduleSelectedPeriod === p ? 'active' : ''}`}
                                                            onClick={() => setRescheduleSelectedPeriod(p)}
                                                            role="button"
                                                            tabIndex={0}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' || e.key === ' ') {
                                                                    setRescheduleSelectedPeriod(p)
                                                                }
                                                            }}
                                                        >
                                                            {p}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="profile-appointment-modal-label">Reason (Optional)</label>
                                    <textarea
                                        name="reason"
                                        className="profile-appointment-modal-input"
                                        rows={3}
                                        placeholder="Why are you rescheduling?"
                                    ></textarea>
                                </div>
                            </div>
                            <div className="profile-appointment-modal-footer">
                                <button type="button" className="profile-appointment-btn-secondary" onClick={() => setRescheduleModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="profile-appointment-btn-primary">
                                    Confirm Reschedule
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete/Cancel Modal */}
            {deleteModalOpen && selectedAppointment && (
                <div className="profile-appointment-modal-backdrop" onClick={() => setDeleteModalOpen(false)}>
                    <div className="profile-appointment-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
                        <div className="profile-appointment-modal-header border-0 pb-0">
                            <button type="button" className="profile-appointment-btn-close ms-auto" onClick={() => setDeleteModalOpen(false)}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        <div className="profile-appointment-modal-body text-center pt-0">
                            <div className="mb-3 text-danger" style={{ fontSize: '3rem' }}>
                                <i className="bi bi-exclamation-circle"></i>
                            </div>
                            <h4 className="mb-3" style={{ color: 'var(--pa-heading-color)', fontWeight: 700 }}>Cancel Appointment?</h4>
                            <p className="text-muted mb-4">
                                Are you sure you want to cancel your appointment with <strong>{selectedAppointment.doctor_name}</strong> on <strong>{formatAppointmentDate(selectedAppointment.appointment_date)}</strong>?
                                <br /><br />
                                This action cannot be undone.
                            </p>
                        </div>
                        <div className="profile-appointment-modal-footer justify-content-center border-0 pt-0 pb-4">
                            <button
                                type="button"
                                className="profile-appointment-btn-secondary px-4"
                                onClick={() => setDeleteModalOpen(false)}
                            >
                                No, Keep It
                            </button>
                            <button
                                type="button"
                                className="profile-appointment-btn-danger px-4"
                                onClick={() => handleCancelAppointment(selectedAppointment.id)}
                            >
                                Yes, Cancel It
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Review Modal */}
            {reviewModalOpen && selectedAppointment && (
                <DoctorReviewModal
                    isOpen={reviewModalOpen}
                    onClose={() => setReviewModalOpen(false)}
                    appointment={{
                        id: selectedAppointment.id,
                        doctor_id: selectedAppointment.doctor_id,
                        doctor_name: selectedAppointment.doctor_name
                    }}
                    onSuccess={() => fetchAppointments()}
                />
            )}
        </div>
    )
}

export default MyAppointments