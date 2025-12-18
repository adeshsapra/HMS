import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import './HomeCare.css';
import { homeCareServices, homeCareProfessionals } from '../../data/homeCareData';

const BookingWizard = () => {
    const [searchParams] = useSearchParams();
    const initialServiceId = searchParams.get('service');

    const [step, setStep] = useState(1);
    const [bookingData, setBookingData] = useState({
        serviceId: initialServiceId ? parseInt(initialServiceId) : null,
        professionalId: '',
        date: '',
        time: '',
        patientName: '',
        phone: '',
        emergencyPhone: '',
        address: '',
        notes: '',
        age: '',
        gender: '',
        relation: 'self', // self, parent, spouse, child, other
        urgency: 'routine' // routine, urgent
    });

    const [loading, setLoading] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('card');

    // Unified Schedule State
    const [viewDate, setViewDate] = useState(new Date());
    const [selectedHour, setSelectedHour] = useState('09');
    const [selectedMinute, setSelectedMinute] = useState('00');
    const [selectedPeriod, setSelectedPeriod] = useState('AM');

    // Auto-update time string in bookingData
    useEffect(() => {
        setBookingData(prev => ({
            ...prev,
            time: `${selectedHour}:${selectedMinute} ${selectedPeriod}`
        }));
    }, [selectedHour, selectedMinute, selectedPeriod]);

    const hoursList = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
    const minutesList = ['00', '15', '30', '45'];

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handleDateSelect = (day: number) => {
        const selected = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        const dateStr = `${selected.getFullYear()}-${String(selected.getMonth() + 1).padStart(2, '0')}-${String(selected.getDate()).padStart(2, '0')}`;
        setBookingData({ ...bookingData, date: dateStr });
    };

    const isDateSelected = (day: number) => {
        if (!bookingData.date) return false;
        const d = new Date(bookingData.date);
        return d.getFullYear() === viewDate.getFullYear() &&
            d.getMonth() === viewDate.getMonth() &&
            d.getDate() === day;
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleNext = () => {
        if (step < 6) {
            setStep(step + 1);
            window.scrollTo(0, 0);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
            window.scrollTo(0, 0);
        }
    };

    const handleConfirmBooking = () => {
        setStep(6);
        window.scrollTo(0, 0);
    };

    const handlePaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate Payment Processing
        setTimeout(() => {
            setLoading(false);
            setConfirmed(true);
            window.scrollTo(0, 0);
        }, 2000);
    };

    const selectedService = homeCareServices.find(s => s.id === bookingData.serviceId);
    const selectedProfessional = homeCareProfessionals.find(p => p.id === parseInt(bookingData.professionalId));

    if (confirmed) {
        const bookingRef = `HC-${Math.floor(100000 + Math.random() * 900000)}`;
        return (
            <div className="home-care-container container py-5">
                <div className="booking-container p-0 border-0 shadow-lg overflow-hidden animate-fade-in bg-white rounded-4">
                    {/* Clean Professional Header */}
                    <div className="bg-primary p-5 text-white text-center position-relative"
                        style={{ background: 'linear-gradient(135deg, var(--accent-color) 0%, #03829a 100%)' }}>
                        <div className="mb-4">
                            <div className="d-inline-flex align-items-center justify-content-center bg-white text-primary rounded-circle shadow" style={{ width: '70px', height: '70px', fontSize: '2rem' }}>
                                <i className="bi bi-check-lg"></i>
                            </div>
                        </div>
                        <h2 className="mb-2 fw-bold text-white">Booking Confirmed</h2>
                        <p className="opacity-90 lead mb-4">Your medical request is now active in our clinical queue.</p>
                        <div className="px-4 py-2 bg-white rounded-pill d-inline-block shadow-sm">
                            <span className="small text-uppercase tracking-wider fw-bold text-primary opacity-75">Ref No:</span> <span className="fw-bold ms-1 text-primary">{bookingRef}</span>
                        </div>
                    </div>

                    <div className="p-5 bg-white rounded-bottom-4">
                        <div className="text-center mb-5">
                            <h4 className="fw-bold text-dark mb-3">Next Step: Verification</h4>
                            <p className="text-muted mx-auto" style={{ maxWidth: '600px' }}>
                                Hello <strong>{bookingData.patientName}</strong>, our senior medical coordinator will contact you at <strong>{bookingData.phone}</strong> shortly to confirm the clinical protocol & therapist dispatch.
                            </p>
                        </div>

                        <div className="card border-0 bg-light rounded-4 overflow-hidden mb-5 receipt-card">
                            <div className="card-header bg-white py-3 border-bottom border-light d-flex justify-content-between align-items-center">
                                <h5 className="mb-0 fw-bold"><i className="bi bi-file-earmark-medical me-2 text-primary"></i>Booking Verification Detail</h5>
                                <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2">Paid Successfully</span>
                            </div>
                            <div className="card-body p-4">
                                <div className="row g-4 text-start">
                                    <div className="col-md-6 border-end">
                                        <label className="text-muted small text-uppercase fw-bold mb-2 d-block">Requested Specialist Care</label>
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="hc-card-icon m-0 bg-primary text-white" style={{ width: 45, height: 45, fontSize: '1.4rem' }}>
                                                <i className={`bi ${selectedService?.icon}`}></i>
                                            </div>
                                            <div>
                                                <h6 className="mb-1 fw-bold">{selectedService?.title}</h6>
                                                <span className="text-primary font-monospace fw-bold">{selectedService?.price}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6 ps-md-4">
                                        <label className="text-muted small text-uppercase fw-bold mb-2 d-block">Scheduled Arrival</label>
                                        <div className="d-flex flex-column gap-1">
                                            <p className="mb-0 fw-bold"><i className="bi bi-calendar-event me-2 text-primary"></i>{new Date(bookingData.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                            <p className="mb-0 fw-bold"><i className="bi bi-clock-history me-2 text-primary"></i>{bookingData.time} (Fixed Slot)</p>
                                        </div>
                                    </div>
                                    <div className="col-md-6 border-end border-top pt-4">
                                        <label className="text-muted small text-uppercase fw-bold mb-2 d-block">Patient Identifying Info</label>
                                        <h6 className="fw-bold mb-1">{bookingData.patientName} ({bookingData.age}Y, {bookingData.gender})</h6>
                                        <p className="small text-muted mb-0"><i className="bi bi-person-badge me-2"></i> Relation: {bookingData.relation}</p>
                                    </div>
                                    <div className="col-md-6 ps-md-4 border-top pt-4">
                                        <label className="text-muted small text-uppercase fw-bold mb-2 d-block">Delivery Address</label>
                                        <p className="mb-0 small fw-semibold"><i className="bi bi-geo-alt-fill me-2 text-danger"></i>{bookingData.address}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="d-flex flex-column flex-md-row gap-3 justify-content-center print-hide">
                            <button className="btn btn-outline-primary rounded-pill px-4 py-3 fw-bold d-flex align-items-center justify-content-center gap-2" onClick={() => window.print()}>
                                <i className="bi bi-download"></i> Download Booking Receipt
                            </button>
                            <Link to="/home-care" className="btn btn-primary rounded-pill px-5 py-3 fw-bold d-flex align-items-center justify-content-center">
                                Back to Home Care
                            </Link>
                        </div>
                        <p className="text-center mt-4 small text-muted opacity-50">A copy of this receipt has been sent to your registered email and phone.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="home-care-container container py-5">
            <div className="booking-container">
                <div className="booking-header">
                    <h2 className="m-0 fs-3">Book a Home Visit</h2>
                    <p className="m-0 opacity-75">Follow the steps to schedule your care.</p>
                </div>

                {/* Steps Indicator */}
                <div className="booking-steps" style={{ '--progress-width': `${((step - 1) / 5) * 100}` } as React.CSSProperties}>
                    {[
                        { id: 1, label: 'Service', icon: 'bi-heart-pulse-fill' },
                        { id: 2, label: 'Expert', icon: 'bi-person-plus-fill' },
                        { id: 3, label: 'Schedule', icon: 'bi-calendar3-event-fill' },
                        { id: 4, label: 'Patient', icon: 'bi-person-lines-fill' },
                        { id: 5, label: 'Review', icon: 'bi-file-earmark-text-fill' },
                        { id: 6, label: 'Payment', icon: 'bi-credit-card-fill' }
                    ].map((s) => (
                        <div
                            key={s.id}
                            className={`step-item ${step === s.id ? 'active' : ''} ${step > s.id ? 'completed' : ''}`}
                        >
                            <div className="step-indicator">
                                {step > s.id ? <i className="bi bi-check-lg"></i> : <i className={`bi ${s.icon}`}></i>}
                            </div>
                            <div className="step-label">{s.label}</div>
                        </div>
                    ))}
                </div>

                {step < 6 ? (
                    <>
                        <form className="booking-body animate-fade-in" onSubmit={(e) => e.preventDefault()}>
                            {/* Step 1: Select Service */}
                            {step === 1 && (
                                <div className="animate-fade-in">
                                    <h4 className="mb-4 text-dark fw-bold">Select a Service</h4>
                                    <div className="row g-3">
                                        {homeCareServices.map(service => (
                                            <div key={service.id} className="col-md-6">
                                                <div
                                                    className={`p-3 border rounded-3 cursor-pointer h-100 transition-all ${bookingData.serviceId === service.id ? 'border-primary bg-light shadow-sm' : 'hover:bg-slate-50'}`}
                                                    onClick={() => setBookingData({ ...bookingData, serviceId: service.id })}
                                                    style={{ cursor: 'pointer', borderColor: bookingData.serviceId === service.id ? 'var(--accent-color)' : '#dee2e6' }}
                                                >
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div className="bg-white p-2 rounded text-primary fs-4 border">
                                                            <i className={`bi ${service.icon}`}></i>
                                                        </div>
                                                        <div>
                                                            <h6 className="fw-bold mb-1">{service.title}</h6>
                                                            <small className="text-muted">{service.price}</small>
                                                        </div>
                                                        {bookingData.serviceId === service.id && <i className="bi bi-check-circle-fill ms-auto text-primary fs-5"></i>}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Select Professional */}
                            {step === 2 && (
                                <div className="animate-fade-in">
                                    <h4 className="mb-4 text-dark fw-bold">Choose a Professional (Optional)</h4>
                                    <div className="row g-3">
                                        <div className="col-12">
                                            <div
                                                className={`p-3 border rounded-3 cursor-pointer mb-3 ${bookingData.professionalId === '' ? 'border-primary bg-light' : ''}`}
                                                onClick={() => setBookingData({ ...bookingData, professionalId: '' })}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                                                        <i className="bi bi-person-fill"></i>
                                                    </div>
                                                    <div>
                                                        <h6 className="fw-bold mb-0">Any Available Professional</h6>
                                                        <small className="text-muted">Fastest allocation based on your time.</small>
                                                    </div>
                                                    {bookingData.professionalId === '' && <i className="bi bi-check-circle-fill ms-auto text-primary fs-5"></i>}
                                                </div>
                                            </div>
                                        </div>

                                        {homeCareProfessionals.map(prof => (
                                            <div key={prof.id} className="col-md-6">
                                                <div
                                                    className={`p-3 border rounded-3 cursor-pointer h-100 ${bookingData.professionalId === prof.id.toString() ? 'border-primary bg-light' : ''}`}
                                                    onClick={() => setBookingData({ ...bookingData, professionalId: prof.id.toString() })}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <div className="d-flex align-items-center gap-3">
                                                        <img src={prof.image} alt={prof.name} className="rounded-circle object-fit-cover" style={{ width: 50, height: 50 }} />
                                                        <div>
                                                            <h6 className="fw-bold mb-0">{prof.name}</h6>
                                                            <small className="text-primary d-block">{prof.role}</small>
                                                            <small className="text-muted" style={{ fontSize: '0.75rem' }}><i className="bi bi-star-fill text-warning me-1"></i>{prof.rating}</small>
                                                        </div>
                                                        {bookingData.professionalId === prof.id.toString() && <i className="bi bi-check-circle-fill ms-auto text-primary fs-5"></i>}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Precise Schedule */}
                            {step === 3 && (
                                <div className="animate-fade-in">
                                    <h4 className="mb-4 text-dark fw-bold d-flex align-items-center">
                                        <i className="bi bi-calendar-check me-2 text-primary"></i>Pick Date & Time
                                    </h4>

                                    <div className="unified-scheduler-box p-4 rounded-4 border bg-white mb-4 shadow-sm overflow-hidden position-relative animate-fade-in">
                                        <div className="row g-0">
                                            {/* Date Side */}
                                            <div className="col-lg-6 border-end pe-lg-4 pb-4 pb-lg-0">
                                                <label className="booking-label fw-bold mb-4 d-flex justify-content-between align-items-center">
                                                    <span>1. Select Date</span>
                                                    {bookingData.date && <span className="badge bg-primary rounded-pill px-3">Date Set</span>}
                                                </label>

                                                <div className="modern-calendar">
                                                    <div className="calendar-header mb-3">
                                                        <button type="button" className="calendar-nav-btn" onClick={handlePrevMonth}>
                                                            <i className="bi bi-chevron-left"></i>
                                                        </button>
                                                        <span className="current-month">
                                                            {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                                        </span>
                                                        <button type="button" className="calendar-nav-btn" onClick={handleNextMonth}>
                                                            <i className="bi bi-chevron-right"></i>
                                                        </button>
                                                    </div>

                                                    <div className="calendar-grid">
                                                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                                                            <div key={d} className="calendar-weekday">{d}</div>
                                                        ))}
                                                        {Array.from({ length: getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth()) }).map((_, i) => (
                                                            <div key={`empty-${i}`} className="calendar-day empty"></div>
                                                        ))}
                                                        {Array.from({ length: getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth()) }).map((_, i) => {
                                                            const day = i + 1;
                                                            const dateObj = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
                                                            const today = new Date();
                                                            today.setHours(0, 0, 0, 0);
                                                            const isPast = dateObj < today;
                                                            const isSelected = isDateSelected(day);
                                                            const isToday = dateObj.getTime() === today.getTime();

                                                            return (
                                                                <div
                                                                    key={day}
                                                                    className={`calendar-day ${isPast ? 'disabled' : ''} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                                                                    onClick={() => !isPast && handleDateSelect(day)}
                                                                >
                                                                    {day}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                                <div className="mt-4 p-3 bg-light rounded-3 text-center border">
                                                    <span className="text-muted small d-block mb-1">Appointment Date</span>
                                                    <h5 className="mb-0 fw-bold">{bookingData.date ? new Date(bookingData.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : "-- / -- / ----"}</h5>
                                                </div>
                                            </div>

                                            {/* Time Side (Professional 24/7 Picker) */}
                                            <div className="col-lg-6 ps-lg-4 pt-4 pt-lg-0">
                                                <label className="booking-label fw-bold mb-4">2. Arrival Time (24/7)</label>

                                                <div className="v2-time-picker-control">
                                                    <div className="time-preview-display py-3 text-center mb-4 rounded-4 border bg-white shadow-sm">
                                                        <h2 className="display-4 fw-bold text-primary mb-0" style={{ letterSpacing: '2px' }}>
                                                            {selectedHour}:{selectedMinute} <small className="fs-3 fw-light">{selectedPeriod}</small>
                                                        </h2>
                                                        <span className="text-muted small text-uppercase fw-bold">Precise Allocation</span>
                                                    </div>

                                                    <div className="selector-group mb-4">
                                                        <span className="selector-label mb-2 d-block small text-muted text-uppercase fw-bold">Select Hour</span>
                                                        <div className="selector-grid-hours">
                                                            {hoursList.map(h => (
                                                                <button
                                                                    key={h}
                                                                    type="button"
                                                                    className={`selector-chip ${selectedHour === h ? 'active' : ''}`}
                                                                    onClick={() => setSelectedHour(h)}
                                                                >
                                                                    {h}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="row g-3">
                                                        <div className="col-sm-7">
                                                            <div className="selector-group">
                                                                <span className="selector-label mb-2 d-block small text-muted text-uppercase fw-bold">Minute</span>
                                                                <div className="selector-grid-minutes">
                                                                    {minutesList.map(m => (
                                                                        <button
                                                                            key={m}
                                                                            type="button"
                                                                            className={`selector-chip ${selectedMinute === m ? 'active' : ''}`}
                                                                            onClick={() => setSelectedMinute(m)}
                                                                        >
                                                                            {m}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-sm-5">
                                                            <div className="selector-group">
                                                                <span className="selector-label mb-2 d-block small text-muted text-uppercase fw-bold">Period</span>
                                                                <div className="period-toggle-v2">
                                                                    <button
                                                                        type="button"
                                                                        className={`period-btn-v2 ${selectedPeriod === 'AM' ? 'active' : ''}`}
                                                                        onClick={() => setSelectedPeriod('AM')}
                                                                    >
                                                                        AM
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        className={`period-btn-v2 ${selectedPeriod === 'PM' ? 'active' : ''}`}
                                                                        onClick={() => setSelectedPeriod('PM')}
                                                                    >
                                                                        PM
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Patient Information */}
                            {step === 4 && (
                                <div className="animate-fade-in">
                                    <h4 className="mb-4 text-dark fw-bold d-flex align-items-center">
                                        <i className="bi bi-person-lines-fill me-2 text-primary"></i>Patient Information
                                    </h4>

                                    <div className="patient-details-box p-4 rounded-4 border bg-white mb-4 shadow-sm animate-fade-in">
                                        <div className="row g-3">
                                            <div className="col-md-8">
                                                <label className="booking-label">Patient's Full Name</label>
                                                <input
                                                    type="text"
                                                    className="booking-input"
                                                    placeholder="Enter patient name"
                                                    required
                                                    value={bookingData.patientName}
                                                    onChange={(e) => setBookingData({ ...bookingData, patientName: e.target.value })}
                                                />
                                            </div>
                                            <div className="col-md-4">
                                                <label className="booking-label">Relation</label>
                                                <select
                                                    className="booking-input"
                                                    value={bookingData.relation}
                                                    onChange={(e) => setBookingData({ ...bookingData, relation: e.target.value })}
                                                >
                                                    <option value="self">Self</option>
                                                    <option value="parent">Parent</option>
                                                    <option value="spouse">Spouse</option>
                                                    <option value="child">Child</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>
                                            <div className="col-md-4">
                                                <label className="booking-label">Age</label>
                                                <input
                                                    type="number"
                                                    className="booking-input"
                                                    placeholder="Years"
                                                    value={bookingData.age}
                                                    onChange={(e) => setBookingData({ ...bookingData, age: e.target.value })}
                                                />
                                            </div>
                                            <div className="col-md-4">
                                                <label className="booking-label">Gender</label>
                                                <select
                                                    className="booking-input"
                                                    value={bookingData.gender}
                                                    onChange={(e) => setBookingData({ ...bookingData, gender: e.target.value })}
                                                >
                                                    <option value="">Select</option>
                                                    <option value="male">Male</option>
                                                    <option value="female">Female</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="booking-label">Contact Number</label>
                                                <input
                                                    type="tel"
                                                    className="booking-input"
                                                    placeholder="Patient's phone"
                                                    required
                                                    value={bookingData.phone}
                                                    onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="booking-label">Emergency Contact (Optional)</label>
                                                <input
                                                    type="tel"
                                                    className="booking-input"
                                                    placeholder="Secondary/Guardian phone"
                                                    value={bookingData.emergencyPhone}
                                                    onChange={(e) => setBookingData({ ...bookingData, emergencyPhone: e.target.value })}
                                                />
                                            </div>
                                            <div className="col-12">
                                                <label className="booking-label">Complete Home Address</label>
                                                <textarea
                                                    className="booking-input"
                                                    rows={3}
                                                    placeholder="Street, Apartment No, Landmark, Zip Code..."
                                                    required
                                                    value={bookingData.address}
                                                    onChange={(e) => setBookingData({ ...bookingData, address: e.target.value })}
                                                ></textarea>
                                            </div>
                                            <div className="col-12">
                                                <label className="booking-label">Additional Instructions (Optional)</label>
                                                <textarea
                                                    className="booking-input"
                                                    rows={2}
                                                    placeholder="Any specific symptoms or access notes..."
                                                    value={bookingData.notes}
                                                    onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                                                ></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 5: Final Review */}
                            {step === 5 && (
                                <div className="animate-fade-in">
                                    <h4 className="mb-4 text-dark fw-bold d-flex align-items-center">
                                        <i className="bi bi-shield-check me-2 text-primary"></i>Review & Confirm
                                    </h4>

                                    <div className="review-summary-container">
                                        <div className="row g-4">
                                            {/* Service Card */}
                                            <div className="col-md-6">
                                                <div className="review-card-item h-100">
                                                    <div className="review-card-header">
                                                        <i className="bi bi-heart-pulse"></i>
                                                        <span>Selected Care</span>
                                                    </div>
                                                    <div className="review-card-body">
                                                        <h5 className="fw-bold mb-1">{selectedService?.title}</h5>
                                                        <p className="text-primary fw-bold mb-0">{selectedService?.price}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Appointment Card */}
                                            <div className="col-md-6">
                                                <div className="review-card-item h-100">
                                                    <div className="review-card-header">
                                                        <i className="bi bi-clock"></i>
                                                        <span>Schedule</span>
                                                    </div>
                                                    <div className="review-card-body">
                                                        <h5 className="fw-bold mb-1">
                                                            {new Date(bookingData.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                        </h5>
                                                        <p className="text-muted mb-0">{bookingData.time} (Precise Arrival)</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Professional Card */}
                                            <div className="col-md-6">
                                                <div className="review-card-item h-100">
                                                    <div className="review-card-header">
                                                        <i className="bi bi-person-badge"></i>
                                                        <span>Care Expert</span>
                                                    </div>
                                                    <div className="review-card-body d-flex align-items-center gap-3">
                                                        {selectedProfessional ? (
                                                            <>
                                                                <img src={selectedProfessional.image} alt={selectedProfessional.name} className="review-prof-img" />
                                                                <div>
                                                                    <h6 className="fw-bold mb-0">{selectedProfessional.name}</h6>
                                                                    <small className="text-muted">{selectedProfessional.role}</small>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div>
                                                                <h6 className="fw-bold mb-0">Any Professional</h6>
                                                                <small className="text-muted">Best available expert</small>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Patient Card */}
                                            <div className="col-md-6">
                                                <div className="review-card-item h-100">
                                                    <div className="review-card-header">
                                                        <i className="bi bi-person"></i>
                                                        <span>Patient Profile</span>
                                                    </div>
                                                    <div className="review-card-body">
                                                        <h6 className="fw-bold mb-1">{bookingData.patientName} [{bookingData.relation}]</h6>
                                                        <div className="d-flex gap-2 flex-wrap mt-2">
                                                            <span className="badge bg-light text-dark border">{bookingData.age} Years</span>
                                                            <span className="badge bg-light text-dark border text-capitalize">{bookingData.gender}</span>
                                                        </div>
                                                        <p className="small text-muted mt-2 mb-0">
                                                            <i className="bi bi-telephone me-1"></i> {bookingData.phone}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Address Card */}
                                            <div className="col-12">
                                                <div className="review-card-item">
                                                    <div className="review-card-header">
                                                        <i className="bi bi-geo-alt"></i>
                                                        <span>Visit Location</span>
                                                    </div>
                                                    <div className="review-card-body">
                                                        <p className="mb-0 fw-semibold">{bookingData.address}</p>
                                                        {bookingData.notes && (
                                                            <div className="mt-2 pt-2 border-top small font-italic text-muted">
                                                                <i className="bi bi-sticky me-1"></i> Note: {bookingData.notes}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </form>

                        <div className="booking-footer">
                            <button
                                type="button"
                                className="btn btn-outline-secondary rounded-pill px-4"
                                onClick={handleBack}
                                disabled={step === 1 || loading}
                                style={{ visibility: step === 1 ? 'hidden' : 'visible' }}
                            >
                                Back
                            </button>

                            {step < 5 ? (
                                <button
                                    type="button"
                                    className="btn btn-primary rounded-pill px-4"
                                    onClick={handleNext}
                                    disabled={
                                        (step === 1 && !bookingData.serviceId) ||
                                        (step === 3 && (!bookingData.date || !bookingData.time)) ||
                                        (step === 4 && (!bookingData.patientName || !bookingData.address || !bookingData.age || !bookingData.gender || !bookingData.phone))
                                    }
                                >
                                    Next Step
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="btn btn-primary rounded-pill px-4"
                                    onClick={handleConfirmBooking}
                                    disabled={loading}
                                >
                                    Proceed to Payment
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="booking-body animate-fade-in p-0 border-0 bg-transparent">
                        <div className="row g-4 align-items-stretch">
                            {/* Left Side: Summary & Trust */}
                            <div className="col-lg-5">
                                <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden bg-white">
                                    <div className="card-header bg-light py-4 border-bottom">
                                        <h5 className="mb-0 fw-bold text-dark d-flex align-items-center">
                                            <i className="bi bi-shield-check me-2 text-primary"></i> Bill Details
                                        </h5>
                                    </div>
                                    <div className="card-body p-4">
                                        <h6 className="fw-bold mb-4 text-secondary d-flex align-items-center text-uppercase small letter-spacing-1">
                                            <i className="bi bi-receipt me-2"></i> Payment Information
                                        </h6>
                                        <div className="payment-receipt-ui mb-4 p-4 rounded-4 bg-light bg-opacity-50 border">
                                            <div className="list-group list-group-flush bg-transparent">
                                                <div className="list-group-item bg-transparent border-0 d-flex justify-content-between p-0 mb-3">
                                                    <span className="text-muted fw-bold small text-uppercase">Care Consultation</span>
                                                    <span className="fw-bold">{selectedService?.price}</span>
                                                </div>
                                                <div className="list-group-item bg-transparent border-0 d-flex justify-content-between p-0 mb-3">
                                                    <span className="text-muted fw-bold small text-uppercase">Clinical Prep</span>
                                                    <span className="text-success fw-semibold small">Included</span>
                                                </div>
                                                <div className="list-group-item bg-transparent border-0 d-flex justify-content-between p-0 mb-3">
                                                    <span className="text-muted fw-bold small text-uppercase">Travel & PPE</span>
                                                    <span className="text-success fw-semibold small">Free</span>
                                                </div>
                                            </div>

                                            <div className="pt-4 border-top mt-2">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <h6 className="mb-0 fw-bold text-dark">Total Amount</h6>
                                                        <small className="text-muted" style={{ fontSize: '0.7rem' }}>Inclusive of all duties & taxes</small>
                                                    </div>
                                                    <div className="text-end">
                                                        <div className="d-flex align-items-baseline gap-1 justify-content-end">
                                                            <span className="h1 mb-0 fw-bold text-primary">{selectedService?.price.split(' / ')[0]}</span>
                                                            <span className="text-muted h6 mb-0 fw-normal">/ {selectedService?.price.split(' / ')[1]}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="trust-signals mt-5 pt-3 border-top">
                                            <div className="d-flex align-items-center gap-3 mb-3 p-3 rounded-4 bg-light bg-opacity-50">
                                                <div className="bg-white rounded-circle p-2 shadow-sm text-success">
                                                    <i className="bi bi-shield-fill-check fs-5"></i>
                                                </div>
                                                <div className="lh-sm">
                                                    <p className="mb-0 fw-bold small">Secure Encryption</p>
                                                    <small className="text-muted opacity-75">All data is 256-bit AES encrypted</small>
                                                </div>
                                            </div>
                                            <div className="d-flex align-items-center gap-3 p-3 rounded-4 bg-light bg-opacity-50">
                                                <div className="bg-white rounded-circle p-2 shadow-sm text-primary">
                                                    <i className="bi bi-patch-check-fill fs-5"></i>
                                                </div>
                                                <div className="lh-sm">
                                                    <p className="mb-0 fw-bold small">Verified Provider</p>
                                                    <small className="text-muted opacity-75">MediTrust Certified Health Partner</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Payment Form */}
                            <div className="col-lg-7">
                                <div className="card border-0 shadow-sm rounded-4 h-100 bg-white p-4">
                                    <div className="d-flex justify-content-between align-items-center mb-4 pb-2">
                                        <h5 className="fw-bold mb-0">Select Payment Method</h5>
                                        <div className="px-3 py-1 bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 rounded-pill small fw-bold">
                                            <i className="bi bi-hourglass-split me-1"></i> 09:59
                                        </div>
                                    </div>

                                    <div className="row g-3 mb-4">
                                        <div className="col-sm-6">
                                            <div
                                                className={`payment-method-chip p-3 rounded-4 border text-center cursor-pointer transition-all ${paymentMethod === 'card' ? 'active shadow-lg' : 'bg-white hover:bg-light'}`}
                                                onClick={() => setPaymentMethod('card')}
                                                style={{
                                                    background: paymentMethod === 'card' ? 'var(--accent-color)' : 'white',
                                                    borderColor: paymentMethod === 'card' ? 'var(--accent-color)' : '#eee',
                                                    color: paymentMethod === 'card' ? 'white' : 'inherit'
                                                }}
                                            >
                                                <i className={`bi bi-credit-card-2-back fs-2 mb-2 d-block ${paymentMethod === 'card' ? 'text-white' : 'text-primary'}`}></i>
                                                <span className={`fw-bold small d-block ${paymentMethod === 'card' ? 'text-white' : 'text-dark'}`}>Debit/Credit Card</span>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div
                                                className={`payment-method-chip p-3 rounded-4 border text-center cursor-pointer transition-all ${paymentMethod === 'upi' ? 'active shadow-lg' : 'bg-white hover:bg-light'}`}
                                                onClick={() => setPaymentMethod('upi')}
                                                style={{
                                                    background: paymentMethod === 'upi' ? 'var(--accent-color)' : 'white',
                                                    borderColor: paymentMethod === 'upi' ? 'var(--accent-color)' : '#eee',
                                                    color: paymentMethod === 'upi' ? 'white' : 'inherit'
                                                }}
                                            >
                                                <i className={`bi bi-qr-code fs-2 mb-2 d-block ${paymentMethod === 'upi' ? 'text-white' : 'text-primary'}`}></i>
                                                <span className={`fw-bold small d-block ${paymentMethod === 'upi' ? 'text-white' : 'text-dark'}`}>Instant UPI QR</span>
                                            </div>
                                        </div>
                                    </div>

                                    <form onSubmit={handlePaymentSubmit} className="payment-interaction-area p-4 rounded-4 bg-light bg-opacity-25 border border-dashed flex-grow-1 d-flex flex-column justify-content-center" style={{ minHeight: '320px' }}>
                                        {paymentMethod === 'card' ? (
                                            <div className="row g-3 animate-fade-in p-2">
                                                <div className="col-12">
                                                    <label className="booking-label small fw-bold text-muted mb-2">Cardholder Name</label>
                                                    <input type="text" className="booking-input" placeholder="Name as on card" required />
                                                </div>
                                                <div className="col-12">
                                                    <label className="booking-label small fw-bold text-muted mb-2">Card Number</label>
                                                    <div className="position-relative">
                                                        <input type="text" className="booking-input pe-5" placeholder="0000 0000 0000 0000" required />
                                                        <i className="bi bi-credit-card position-absolute top-50 end-0 translate-middle-y me-3 text-muted"></i>
                                                    </div>
                                                </div>
                                                <div className="col-6">
                                                    <label className="booking-label small fw-bold text-muted mb-2">Expiry Date</label>
                                                    <input type="text" className="booking-input" placeholder="MM/YY" required />
                                                </div>
                                                <div className="col-6">
                                                    <label className="booking-label small fw-bold text-muted mb-2">CVV</label>
                                                    <input type="password" className="booking-input" placeholder="***" required />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center animate-fade-in py-3">
                                                <div className="qr-luminous-container p-3 bg-white d-inline-block rounded-4 shadow-lg border border-primary border-opacity-10 mb-4 scale-up">
                                                    <img
                                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=adeshsapra@okicici&pn=HMS%20Medical%20Services&cu=INR&am=${selectedService?.price.replace(/[^0-9.]/g, '')}`}
                                                        alt="Official UPI QR"
                                                        style={{ width: 160 }}
                                                        className="img-fluid"
                                                    />
                                                </div>
                                                <h6 className="fw-bold mb-2">Scan to Pay via UPI</h6>
                                                <p className="small text-muted mb-0 mx-auto" style={{ maxWidth: '280px' }}>
                                                    Use GPay, PhonePe, or PayTM. Verification is instant & encrypted.
                                                </p>
                                            </div>
                                        )}

                                        <div className="mt-auto pt-4 d-flex gap-3 align-items-center">
                                            <button
                                                type="button"
                                                className="btn btn-link text-decoration-none text-muted fw-bold px-0 me-auto"
                                                onClick={handleBack}
                                                disabled={loading}
                                            >
                                                <i className="bi bi-arrow-left me-1"></i> Back
                                            </button>
                                            <button
                                                type="submit"
                                                className="btn btn-primary rounded-pill px-5 py-3 fw-bold shadow-lg d-flex align-items-center gap-2"
                                                disabled={loading}
                                                style={{ minWidth: '240px' }}
                                            >
                                                {loading ? <span className="spinner-border spinner-border-sm"></span> : <><i className="bi bi-shield-lock-fill"></i> Complete Payment</>}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )}


            </div>
        </div>
    );
};

export default BookingWizard;
