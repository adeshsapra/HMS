import { useState, useEffect } from 'react'
import { patientProfileAPI } from '../services/api'
import { useToast } from '../context/ToastContext'

interface Appointment {
    id: number
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

interface AppointmentPagination {
    current_page: number
    last_page: number
    total: number
    per_page: number
}

const MyAppointments = () => {
    const { showToast } = useToast()

    // State management
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [appointmentsLoading, setAppointmentsLoading] = useState(false)
    const [appointmentsPagination, setAppointmentsPagination] = useState<AppointmentPagination>({
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 10
    })
    const [appointmentFilters, setAppointmentFilters] = useState<AppointmentFilters>({
        status: '',
        start_date: '',
        end_date: ''
    })

    // Modal states
    const [viewModalOpen, setViewModalOpen] = useState(false)
    const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
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
                setAppointmentsPagination({
                    current_page: paginator.current_page,
                    last_page: paginator.last_page,
                    total: paginator.total,
                    per_page: paginator.per_page
                })
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
        switch (status?.toLowerCase()) {
            case 'pending':
                return 'status-badge pending'
            case 'confirmed':
                return 'status-badge confirmed'
            case 'completed':
                return 'status-badge completed'
            case 'cancelled':
                return 'status-badge cancelled'
            default:
                return 'status-badge pending'
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
        <div className="my-appointments-container">
            <style>{`
                :root {
                    --background-color: #ffffff;
                    --default-color: #2c3031;
                    --heading-color: #18444c;
                    --accent-color: #049ebb;
                    --surface-color: #ffffff;
                    --contrast-color: #ffffff;
                }

                .my-appointments-container {
                    width: 100%;
                    font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                }

                /* --- Main Card Section --- */
                .appointments-section {
                    background: var(--surface-color);
                    border-radius: 20px;
                    padding: 2.5rem;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
                    min-height: 600px;
                    border: 1px solid rgba(0,0,0,0.02);
                }

                .appointments-section .section-header {
                    margin-bottom: 2.5rem;
                    padding-bottom: 1.5rem;
                    border-bottom: 1px solid color-mix(in srgb, var(--default-color), transparent 92%);
                }

                .appointments-section .section-header h3 {
                    font-size: 1.85rem;
                    color: var(--heading-color);
                    margin-bottom: 0.5rem;
                    font-weight: 700;
                    letter-spacing: -0.5px;
                }

                .appointments-section .section-header p {
                    color: color-mix(in srgb, var(--default-color), transparent 30%);
                    font-weight: 500;
                }

                /* --- Filters & Buttons --- */
                .appointment-filters {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .appointment-filters .form-control {
                    min-width: 160px;
                    border-radius: 8px;
                    border: 1px solid #e0e0e0;
                    padding: 0.4rem 0.8rem;
                }
                
                .appointment-filters .form-control:focus {
                    border-color: var(--accent-color);
                    box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent-color), transparent 90%);
                }

                .btn-refresh {
                    color: var(--accent-color);
                    border-color: var(--accent-color);
                    border-radius: 8px;
                    padding: 0.4rem 1rem;
                    transition: all 0.3s;
                }

                .btn-refresh:hover {
                    background-color: var(--accent-color);
                    color: #fff;
                }

                /* --- Appointment Cards --- */
                .appointments-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                }

                .appointment-card {
                    background: var(--surface-color);
                    border: 1px solid color-mix(in srgb, var(--default-color), transparent 92%);
                    border-radius: 16px;
                    padding: 1.75rem;
                    transition: all 0.3s ease;
                    position: relative;
                }

                .appointment-card:hover {
                    border-color: color-mix(in srgb, var(--accent-color), transparent 70%);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
                    transform: translateY(-3px);
                }

                .appointment-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1.25rem;
                }

                .appointment-doctor {
                    color: var(--heading-color);
                    font-size: 1.15rem;
                    font-weight: 700;
                    margin-bottom: 0.25rem;
                }

                .appointment-specialty {
                    font-size: 0.9rem;
                    color: color-mix(in srgb, var(--default-color), transparent 40%);
                    font-weight: 500;
                }

                /* --- Status Badges --- */
                .status-badge {
                    padding: 0.5rem 1rem;
                    border-radius: 30px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    display: inline-flex;
                    align-items: center;
                }

                .status-badge.pending { background: #fff8e1; color: #f57f17; }
                .status-badge.confirmed { background: #e8f5e9; color: #2e7d32; }
                .status-badge.completed { background: #e0f7fa; color: #006064; }
                .status-badge.cancelled { background: #ffebee; color: #c62828; }

                /* --- Details Grid --- */
                .appointment-details {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 1rem;
                    margin-bottom: 1.25rem;
                    padding-bottom: 1.25rem;
                    border-bottom: 1px dashed color-mix(in srgb, var(--default-color), transparent 85%);
                }

                .detail-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    color: var(--default-color);
                    font-size: 0.95rem;
                }

                .detail-icon-box {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    background: color-mix(in srgb, var(--accent-color), transparent 92%);
                    color: var(--accent-color);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .appointment-reason {
                    background: color-mix(in srgb, var(--heading-color), transparent 96%);
                    border-radius: 10px;
                    padding: 1rem;
                    margin-bottom: 1rem;
                    font-size: 0.9rem;
                    color: var(--default-color);
                }

                /* --- Action Button --- */
                .btn-action-trigger {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    border: 1px solid #eee;
                    background: white;
                    color: var(--default-color);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }

                .btn-action-trigger:hover {
                    background: var(--heading-color);
                    color: white;
                    border-color: var(--heading-color);
                }

                /* --- Pagination --- */
                .page-link {
                    color: var(--heading-color);
                    border: none;
                    margin: 0 4px;
                    border-radius: 8px;
                    font-weight: 500;
                }
                
                .page-item.active .page-link {
                    background-color: var(--accent-color);
                    color: white;
                    box-shadow: 0 4px 10px color-mix(in srgb, var(--accent-color), transparent 50%);
                }

                /* --- PROFESSIONAL MODAL DESIGN --- */
                
                /* 1. Backdrop */
                .custom-modal-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: color-mix(in srgb, var(--heading-color), transparent 40%);
                    backdrop-filter: blur(8px); /* Glassmorphism blur */
                    z-index: 1050;
                    display: flex;
                    align-items: center; /* Center Vertically */
                    justify-content: center; /* Center Horizontally */
                    opacity: 0;
                    animation: fadeIn 0.3s forwards;
                }

                /* 2. Modal Content Container */
                .custom-modal-content {
                    background: var(--surface-color);
                    width: 90%;
                    max-width: 600px;
                    border-radius: 24px; /* Soft rounded corners */
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    overflow: hidden;
                    opacity: 0;
                    transform: scale(0.95) translateY(20px);
                    animation: scaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; /* Professional spring/ease */
                }

                .custom-modal-content.large {
                    max-width: 800px;
                }

                /* 3. Header */
                .custom-modal-header {
                    padding: 1.5rem 2rem;
                    background: var(--surface-color);
                    border-bottom: 1px solid rgba(0,0,0,0.05);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .custom-modal-title {
                    font-size: 1.4rem;
                    font-weight: 700;
                    color: var(--heading-color);
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                
                .custom-modal-title i {
                    color: var(--accent-color);
                }

                .btn-close-custom {
                    background: transparent;
                    border: none;
                    font-size: 1.5rem;
                    color: #999;
                    cursor: pointer;
                    transition: color 0.2s;
                    line-height: 1;
                }
                
                .btn-close-custom:hover {
                    color: var(--heading-color);
                }

                /* 4. Body */
                .custom-modal-body {
                    padding: 2rem;
                    overflow-y: auto;
                    max-height: 70vh;
                }

                /* 5. Footer */
                .custom-modal-footer {
                    padding: 1.5rem 2rem;
                    background: color-mix(in srgb, var(--surface-color), #f9f9f9 50%);
                    border-top: 1px solid rgba(0,0,0,0.05);
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                }

                /* Form Styles inside Modal */
                .modal-form-label {
                    font-size: 0.8rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: color-mix(in srgb, var(--heading-color), transparent 40%);
                    margin-bottom: 0.5rem;
                    display: block;
                }

                .modal-form-value {
                    font-size: 14px;
                    color: var(--heading-color);
                    font-weight: 500;
                }

                .modal-input {
                    display: block;
                    width: 100%;
                    padding: 0.75rem 1rem;
                    font-size: 1rem;
                    color: var(--default-color);
                    background-color: #fff;
                    border: 1px solid #e0e0e0;
                    border-radius: 12px;
                    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
                }

                .modal-input:focus {
                    border-color: var(--accent-color);
                    outline: 0;
                    box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent-color), transparent 90%);
                }

                /* Button Styles */
                .btn-modal-secondary {
                    background: transparent;
                    border: 1px solid #ddd;
                    color: var(--default-color);
                    padding: 0.6rem 1.25rem;
                    border-radius: 10px;
                    font-weight: 600;
                    transition: all 0.2s;
                }
                
                .btn-modal-secondary:hover {
                    background: #f5f5f5;
                }

                .btn-modal-primary {
                    background: var(--accent-color);
                    border: 1px solid var(--accent-color);
                    color: white;
                    padding: 0.6rem 1.5rem;
                    border-radius: 10px;
                    font-weight: 600;
                    box-shadow: 0 4px 12px color-mix(in srgb, var(--accent-color), transparent 60%);
                    transition: all 0.2s;
                }

                .btn-modal-primary:hover {
                    background: color-mix(in srgb, var(--accent-color), black 10%);
                    transform: translateY(-1px);
                }
                
                .btn-modal-danger {
                    background: #ef4444;
                    border: none;
                    color: white;
                    padding: 0.6rem 1.5rem;
                    border-radius: 10px;
                    font-weight: 600;
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
                }

                .btn-modal-danger:hover {
                    background: #dc2626;
                }

                /* Animations */
                @keyframes fadeIn {
                    to { opacity: 1; }
                }

                @keyframes scaleUp {
                    to { 
                        opacity: 1; 
                        transform: scale(1) translateY(0);
                    }
                }

                /* --- RESCHEDULE TIME PICKER STYLES --- */
                .reschedule-time-picker-wrapper {
                    background: #f8fbfc;
                    border: 1px solid #e0e0e0;
                    border-radius: 12px;
                    padding: 15px;
                    margin-bottom: 20px;
                }

                .reschedule-time-display {
                    text-align: center;
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: var(--accent-color);
                    margin-bottom: 15px;
                    letter-spacing: 1px;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 10px;
                }

                .reschedule-time-selector {
                    display: flex;
                    gap: 15px;
                    justify-content: space-between;
                }

                .reschedule-time-column {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .reschedule-time-label {
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    color: #888;
                    font-weight: 700;
                    text-align: center;
                    margin-bottom: 5px;
                }

                .reschedule-time-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 6px;
                }
                
                .reschedule-time-grid.minutes {
                    grid-template-columns: repeat(2, 1fr);
                }
                
                .reschedule-time-grid.period {
                    grid-template-columns: 1fr;
                }

                .reschedule-time-btn {
                    background: white;
                    border: 1px solid #eee;
                    border-radius: 6px;
                    padding: 6px 0;
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: var(--default-color);
                    cursor: pointer;
                    transition: all 0.2s;
                    text-align: center;
                }

                .reschedule-time-btn:hover {
                    border-color: var(--accent-color);
                    color: var(--accent-color);
                }

                .reschedule-time-btn.active {
                    background: var(--accent-color);
                    color: white;
                    border-color: var(--accent-color);
                    box-shadow: 0 4px 10px rgba(4, 158, 187, 0.3);
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .appointments-section { padding: 1.5rem; }
                    .appointment-header { flex-direction: column; gap: 0.5rem; }
                    .custom-modal-content { width: 95%; margin: 1rem; max-height: 90vh; }
                    .reschedule-time-selector { flex-direction: column; gap: 10px; }
                    .reschedule-time-grid { grid-template-columns: repeat(4, 1fr); }
                }
            `}</style>

            <div className="appointments-section">
                <div className="section-header">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <div>
                            <h3>My Appointments</h3>
                            <p className="mb-0">View and manage your appointment history</p>
                        </div>
                        <div className="appointment-filters">
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
                                className="btn btn-outline-primary btn-refresh"
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
                        <div className="spinner-border text-primary" role="status" style={{ color: 'var(--accent-color)' }}>
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3 text-muted">Loading your appointments...</p>
                    </div>
                ) : appointments.length === 0 ? (
                    <div className="no-appointments text-center py-5">
                        <div style={{ fontSize: '3rem', color: '#e0e0e0' }} className="mb-3">
                            <i className="bi bi-calendar-x"></i>
                        </div>
                        <h4 style={{ color: 'var(--heading-color)' }}>No Appointments Found</h4>
                        <p className="text-muted">You don't have any appointments matching your criteria.</p>
                    </div>
                ) : (
                    <div className="appointments-list">
                        {appointments.map((appointment) => (
                            <div key={appointment.id} className="appointment-card">
                                <div className="appointment-header">
                                    <div className="appointment-info">
                                        <h5 className="appointment-doctor">
                                            {appointment.doctor_name}
                                        </h5>
                                        <p className="appointment-specialty">
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

                                <div className="appointment-details">
                                    <div className="detail-item">
                                        <div className="detail-icon-box">
                                            <i className="bi bi-calendar-event"></i>
                                        </div>
                                        <span>{formatAppointmentDate(appointment.appointment_date)}</span>
                                    </div>
                                    <div className="detail-item">
                                        <div className="detail-icon-box">
                                            <i className="bi bi-clock"></i>
                                        </div>
                                        <span>{appointment.appointment_time}</span>
                                    </div>
                                    <div className="detail-item">
                                        <div className="detail-icon-box">
                                            <i className="bi bi-building"></i>
                                        </div>
                                        <span>{appointment.department_name}</span>
                                    </div>
                                </div>

                                <div className="d-flex justify-content-between align-items-center">
                                    <div style={{ flex: 1 }}>
                                        {appointment.reason && (
                                            <div className="appointment-reason mb-0 d-inline-block">
                                                <i className="bi bi-chat-left-text me-2 text-primary"></i>
                                                {appointment.reason.length > 50 ? appointment.reason.substring(0, 50) + '...' : appointment.reason}
                                            </div>
                                        )}
                                    </div>

                                    <div className="dropdown">
                                        <button
                                            className="btn-action-trigger dropdown-toggle no-arrow"
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
                <div className="custom-modal-backdrop" onClick={() => setViewModalOpen(false)}>
                    <div className="custom-modal-content large" onClick={e => e.stopPropagation()}>
                        <div className="custom-modal-header">
                            <h5 className="custom-modal-title">
                                <i className="bi bi-file-medical"></i>
                                Appointment Details
                            </h5>
                            <button type="button" className="btn-close-custom" onClick={() => setViewModalOpen(false)}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        <div className="custom-modal-body">
                            <div className="row g-4">
                                <div className="col-md-6 border-end">
                                    <div className="mb-4">
                                        <label className="modal-form-label">Doctor</label>
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px', color: 'var(--accent-color)', fontSize: '1.5rem' }}>
                                                <i className="bi bi-person-fill"></i>
                                            </div>
                                            <div>
                                                <div className="modal-form-value">{selectedAppointment.doctor_name}</div>
                                                <small className="text-muted">{selectedAppointment.doctor_specialization}</small>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <label className="modal-form-label">Department</label>
                                        <div className="modal-form-value">{selectedAppointment.department_name}</div>
                                    </div>
                                    <div>
                                        <label className="modal-form-label">Status</label>
                                        <span className={getStatusBadgeClass(selectedAppointment.status)}>
                                            {selectedAppointment.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="col-md-6 ps-md-4">
                                    <div className="mb-4">
                                        <label className="modal-form-label">Date & Time</label>
                                        <div className="modal-form-value">
                                            <i className="bi bi-calendar3 me-2 text-muted"></i>
                                            {formatAppointmentDate(selectedAppointment.appointment_date)}
                                        </div>
                                        <div className="modal-form-value mt-1">
                                            <i className="bi bi-clock me-2 text-muted"></i>
                                            {selectedAppointment.appointment_time}
                                        </div>
                                    </div>
                                    <div className="mb-0">
                                        <label className="modal-form-label">Reason for Visit</label>
                                        <p className="p-3 bg-light rounded-3 mb-0 text-secondary">
                                            {selectedAppointment.reason || "No reason provided."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="custom-modal-footer">
                            <button className="btn-modal-secondary" onClick={() => setViewModalOpen(false)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reschedule Modal */}
            {rescheduleModalOpen && selectedAppointment && (
                <div className="custom-modal-backdrop" onClick={() => setRescheduleModalOpen(false)}>
                    <div className="custom-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="custom-modal-header">
                            <h5 className="custom-modal-title">
                                <i className="bi bi-calendar-range"></i>
                                Reschedule
                            </h5>
                            <button type="button" className="btn-close-custom" onClick={() => setRescheduleModalOpen(false)}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        <form onSubmit={handleRescheduleSubmit}>
                            <div className="custom-modal-body">
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
                                        <label className="modal-form-label">New Date</label>
                                        <input
                                            name="appointment_date"
                                            type="date"
                                            className="modal-input"
                                            min={new Date().toISOString().split('T')[0]}
                                            defaultValue={selectedAppointment.appointment_date}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="modal-form-label">New Time</label>
                                    <div className="reschedule-time-picker-wrapper">
                                        <div className="reschedule-time-display">
                                            {rescheduleSelectedHour} : {rescheduleSelectedMinute} {rescheduleSelectedPeriod}
                                        </div>
                                        <div className="text-center mb-2">
                                            <small className="text-muted">
                                                <i className="bi bi-info-circle me-1"></i>
                                                Current time: {selectedAppointment.appointment_time}
                                            </small>
                                        </div>

                                        <div className="reschedule-time-selector">
                                            {/* Hours Column */}
                                            <div className="reschedule-time-column">
                                                <span className="reschedule-time-label">Hour</span>
                                                <div className="reschedule-time-grid">
                                                    {hoursList.map((h) => (
                                                        <div
                                                            key={h}
                                                            className={`reschedule-time-btn ${rescheduleSelectedHour === h ? 'active' : ''}`}
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
                                            <div className="reschedule-time-column">
                                                <span className="reschedule-time-label">Minute</span>
                                                <div className="reschedule-time-grid minutes">
                                                    {minutesList.map((m) => (
                                                        <div
                                                            key={m}
                                                            className={`reschedule-time-btn ${rescheduleSelectedMinute === m ? 'active' : ''}`}
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
                                            <div className="reschedule-time-column">
                                                <span className="reschedule-time-label">Period</span>
                                                <div className="reschedule-time-grid period">
                                                    {['AM', 'PM'].map((p) => (
                                                        <div
                                                            key={p}
                                                            className={`reschedule-time-btn ${rescheduleSelectedPeriod === p ? 'active' : ''}`}
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
                                    <label className="modal-form-label">Reason (Optional)</label>
                                    <textarea
                                        name="reason"
                                        className="modal-input"
                                        rows={3}
                                        placeholder="Why are you rescheduling?"
                                    ></textarea>
                                </div>
                            </div>
                            <div className="custom-modal-footer">
                                <button type="button" className="btn-modal-secondary" onClick={() => setRescheduleModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-modal-primary">
                                    Confirm Reschedule
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete/Cancel Modal */}
            {deleteModalOpen && selectedAppointment && (
                <div className="custom-modal-backdrop" onClick={() => setDeleteModalOpen(false)}>
                    <div className="custom-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
                        <div className="custom-modal-header border-0 pb-0">
                            <button type="button" className="btn-close-custom ms-auto" onClick={() => setDeleteModalOpen(false)}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        <div className="custom-modal-body text-center pt-0">
                            <div className="mb-3 text-danger" style={{ fontSize: '3rem' }}>
                                <i className="bi bi-exclamation-circle"></i>
                            </div>
                            <h4 className="mb-3" style={{ color: 'var(--heading-color)', fontWeight: 700 }}>Cancel Appointment?</h4>
                            <p className="text-muted mb-4">
                                Are you sure you want to cancel your appointment with <strong>{selectedAppointment.doctor_name}</strong> on <strong>{formatAppointmentDate(selectedAppointment.appointment_date)}</strong>?
                                <br /><br />
                                This action cannot be undone.
                            </p>
                        </div>
                        <div className="custom-modal-footer justify-content-center border-0 pt-0 pb-4">
                            <button
                                type="button"
                                className="btn-modal-secondary px-4"
                                onClick={() => setDeleteModalOpen(false)}
                            >
                                No, Keep It
                            </button>
                            <button
                                type="button"
                                className="btn-modal-danger px-4"
                                onClick={() => handleCancelAppointment(selectedAppointment.id)}
                            >
                                Yes, Cancel It
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MyAppointments