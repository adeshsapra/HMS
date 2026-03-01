import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { appointmentAPI, serviceAPI } from '../services/api';

interface ServiceItem {
  id: number;
  name: string;
  price: number;
  duration?: number | null;
  description?: string | null;
}

interface Doctor {
  id: number;
  working_hours_start: string;
  working_hours_end: string;
  department?: { id?: number; name: string };
}

interface CalendarComponentProps {
  doctor: Doctor;
  onDateSelect?: (date: Date) => void;
}

const CalendarComponent = ({ doctor, onDateSelect }: CalendarComponentProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Time Selection State
  const [selectedHour, setSelectedHour] = useState<string>('09');
  const [selectedMinute, setSelectedMinute] = useState<string>('00');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('AM');

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | ''>('');
  const [servicesLoading, setServicesLoading] = useState(false);

  const [form, setForm] = useState({
    patient_name: '',
    patient_email: '',
    patient_phone: '',
    reason: '',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!showModal || !doctor.department?.id) {
      setServices([]);
      setSelectedServiceId('');
      return;
    }
    let cancelled = false;
    setServicesLoading(true);
    serviceAPI.getByDepartment(doctor.department.id)
      .then((res) => {
        if (cancelled) return;
        const data = res.data?.data ?? res.data;
        setServices(Array.isArray(data) ? data : []);
        setSelectedServiceId('');
      })
      .catch(() => {
        if (!cancelled) setServices([]);
      })
      .finally(() => {
        if (!cancelled) setServicesLoading(false);
      });
    return () => { cancelled = true; };
  }, [showModal, doctor.department?.id]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.patient_name.trim()) newErrors.patient_name = 'Patient name is required';
    if (!form.patient_phone.trim()) newErrors.patient_phone = 'Phone number is required';
    if (!form.patient_email.trim()) {
      newErrors.patient_email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.patient_email)) {
      newErrors.patient_email = 'Invalid email address';
    }
    if (!form.reason.trim()) newErrors.reason = 'Reason for visit is required';
    if (services.length > 0 && !selectedServiceId) {
      newErrors.service_id = 'Please select a service';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };



  const handleBookAppointment = async () => {
    if (!selectedDate) return;
    if (!validateForm()) {
      toast.error('Please fix the errors in the form.');
      return;
    }
    setLoading(true);

    try {
      // Format date YYYY-MM-DD manually to avoid timezone issues
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const timeStr = `${selectedHour}:${selectedMinute} ${selectedPeriod}`;

      // Get user from localStorage
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;

      const payload: Record<string, unknown> = {
        doctor_id: doctor.id,
        user_id: user?.id || null,
        patient_name: form.patient_name,
        patient_email: form.patient_email,
        patient_phone: form.patient_phone,
        appointment_date: dateStr,
        appointment_time: timeStr,
        reason: `${form.reason}${form.notes ? '\nNotes: ' + form.notes : ''}`
      };
      if (selectedServiceId) payload.service_id = selectedServiceId;

      const response = await appointmentAPI.create(payload);
      if (response.status === 201 || (response.data && response.data.status)) {
        toast.success('Appointment booked successfully!');
        setShowModal(false);
        setSelectedServiceId('');
        setForm({
          patient_name: '',
          patient_email: '',
          patient_phone: '',
          reason: '',
          notes: ''
        });
        setErrors({});
      }
    } catch (error: any) {
      console.error('Booking failed', error);
      const errorMessage = error.response?.data?.message || 'Failed to book appointment. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (clickedDate >= today) {
      setSelectedDate(clickedDate);
      setSelectedServiceId('');
      setShowModal(true);
      setErrors({});
      if (onDateSelect) {
        onDateSelect(clickedDate);
      }
    }
  };

  const selectedService = services.find((s) => s.id === selectedServiceId);
  const canSubmit = services.length === 0 || selectedServiceId !== '';

  // Helper to generate hours (01-12)
  const hoursList = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));

  // Helper for minutes (15 min intervals for cleaner appointments)
  const minutesList = ['00', '15', '30', '45'];

  return (
    <>
      <style>
        {`
        :root {
          --background-color: #ffffff;
          --default-color: #2c3031;
          --heading-color: #18444c;
          --accent-color: #049ebb;
          --surface-color: #ffffff;
          --contrast-color: #ffffff;
          --soft-shadow: 0 10px 40px rgba(4, 158, 187, 0.08);
          --glass-bg: rgba(255, 255, 255, 0.95);
          --border-color: rgba(4, 158, 187, 0.15);
        }

        .appointment-calendar-section {
          position: relative;
          max-width: 100%;
          overflow-x: hidden;
        }

        .appointment-calendar-container {
          background: var(--surface-color);
          border-radius: 24px;
          box-shadow: var(--soft-shadow);
          padding: 40px;
          position: relative;
          max-width: 100%;
          overflow-x: hidden;
          box-sizing: border-box;
        }

        .appointment-calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .appointment-month-display {
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--heading-color);
        }

        .appointment-nav-btn {
          background: white;
          border: 1px solid #eee;
          width: 45px;
          height: 45px;
          min-width: 45px;
          min-height: 45px;
          border-radius: 50%;
          color: var(--heading-color);
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }

        .appointment-nav-btn:hover {
          background: var(--accent-color);
          color: white;
          border-color: var(--accent-color);
        }

        .appointment-calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
          gap: 15px;
          max-width: 100%;
          min-width: 0;
        }

        .appointment-weekday-header {
          text-align: center;
          font-weight: 600;
          color: #999;
          text-transform: uppercase;
          font-size: 0.85rem;
          padding-bottom: 10px;
          min-width: 0;
        }

        .appointment-date-box {
           width: 100%;
           max-width: 90px;
           aspect-ratio: 1;
           border-radius: 16px;
           background: #f9f9f9;
           display: flex;
           align-items: center;
           justify-content: center;
           font-weight: 600;
           color: var(--heading-color);
           cursor: pointer;
           position: relative;
           transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
           border: 1px solid transparent;
           min-width: 0;
           box-sizing: border-box;
         }

        .appointment-date-box:not(.appointment-disabled):hover {
          background: var(--accent-color);
          color: white;
          transform: scale(1.05);
          box-shadow: 0 10px 20px rgba(4, 158, 187, 0.3);
        }

        .appointment-date-box.appointment-disabled {
          background: #f0f0f0;
          color: #ccc;
          cursor: not-allowed;
        }

        .appointment-date-box.appointment-today {
          border: 2px solid var(--accent-color);
          color: var(--accent-color);
          background: white;
        }

        .appointment-date-box.appointment-today:hover {
          background: var(--accent-color);
          color: white;
        }

        .appointment-plus-icon {
          position: absolute;
          top: 8px;
          right: 8px;
          font-size: 12px;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .appointment-date-box:hover .appointment-plus-icon {
          opacity: 1;
        }

        /* --- Modal Styling --- */
        .appointment-custom-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(24, 68, 76, 0.6);
          backdrop-filter: blur(5px);
          z-index: 1050;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }

        .appointment-custom-modal-overlay.appointment-show {
          opacity: 1;
          pointer-events: auto;
        }

        .appointment-custom-modal {
          background: white;
          width: 90%;
          max-width: 650px; /* Slightly wider for time picker */
          border-radius: 20px;
          padding: 0;
          box-shadow: 0 25px 50px rgba(0,0,0,0.2);
          transform: translateY(20px);
          transition: transform 0.3s ease;
          overflow: hidden;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
        }

        .appointment-custom-modal-overlay.appointment-show .appointment-custom-modal {
          transform: translateY(0);
        }

        .appointment-modal-header-custom {
          background: var(--accent-color);
          padding: 20px 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: white;
        }

        .appointment-modal-header-custom h5 {
            margin: 0;
            font-weight: 600;
        }

        .appointment-modal-body-custom {
          padding: 30px;
          overflow-y: auto;
          flex: 1;
        }

        .appointment-form-control {
          border-radius: 10px;
          padding: 12px 15px;
          border: 1px solid #e0e0e0;
          width: 100%;
        }

        .appointment-form-control:focus {
            box-shadow: 0 0 0 3px rgba(4, 158, 187, 0.2);
            border-color: var(--accent-color);
            outline: none;
        }

        /* --- NEW TIME PICKER STYLES --- */
        .appointment-time-picker-wrapper {
            background: #f8fbfc;
            border: 1px solid #e0e0e0;
            border-radius: 12px;
            padding: 15px;
            margin-bottom: 20px;
        }

        .appointment-time-display {
            text-align: center;
            font-size: 1.5rem;
            font-weight: 800;
            color: var(--accent-color);
            margin-bottom: 15px;
            letter-spacing: 1px;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
        }

        .appointment-time-selector {
            display: flex;
            gap: 15px;
            justify-content: space-between;
        }

        .appointment-time-column {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .appointment-time-label {
            font-size: 0.75rem;
            text-transform: uppercase;
            color: #888;
            font-weight: 700;
            text-align: center;
            margin-bottom: 5px;
        }

        .appointment-time-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 6px;
        }
        
        .appointment-time-grid.minutes {
            grid-template-columns: repeat(2, 1fr);
        }
        
        .appointment-time-grid.period {
            grid-template-columns: 1fr;
        }

        .appointment-time-btn {
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

        .appointment-time-btn:hover {
            border-color: var(--accent-color);
            color: var(--accent-color);
        }

        .appointment-time-btn.active {
            background: var(--accent-color);
            color: white;
            border-color: var(--accent-color);
            box-shadow: 0 4px 10px rgba(4, 158, 187, 0.3);
        }

        .appointment-btn-confirm {
          background: var(--accent-color);
          color: white;
          width: 100%;
          padding: 14px;
          border-radius: 10px;
          font-weight: 600;
          border: none;
          transition: 0.3s;
          margin-top: 10px;
        }

        .appointment-btn-confirm:hover {
          background: #037f96;
        }

        .appointment-input-wrapper {
          position: relative;
          margin-bottom: 20px;
        }

        .appointment-form-control.error {
          border-color: #dc3545 !important;
          padding-right: 40px;
        }

        .appointment-form-control.error:focus {
          box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.2);
        }

        .appointment-error-icon {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #dc3545;
          font-size: 1.1rem;
        }

        .appointment-error-message {
          color: #dc3545;
          font-size: 0.75rem;
          font-weight: 600;
          margin-top: -15px;
          margin-bottom: 15px;
          padding-left: 5px;
        }

        .appointment-btn-close-custom {
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
        }

        .appointment-service-list {
            margin-bottom: 20px;
        }
        .appointment-service-card {
            border: 1px solid #e0e0e0;
            border-radius: 12px;
            padding: 14px 16px;
            margin-bottom: 10px;
            cursor: pointer;
            transition: all 0.2s;
            background: #fafafa;
        }
        .appointment-service-card:hover {
            border-color: var(--accent-color);
            background: #f0fbfc;
        }
        .appointment-service-card.appointment-service-selected {
            border-color: var(--accent-color);
            background: rgba(4, 158, 187, 0.08);
            box-shadow: 0 0 0 2px rgba(4, 158, 187, 0.2);
        }
        .appointment-service-name { font-weight: 700; color: var(--heading-color); font-size: 1rem; }
        .appointment-service-meta { font-size: 0.85rem; color: #666; margin-top: 4px; }
        .appointment-service-desc { font-size: 0.8rem; color: #888; margin-top: 6px; line-height: 1.4; }
        .appointment-summary-line {
            background: #f0fbfc;
            border: 1px solid rgba(4, 158, 187, 0.2);
            border-radius: 10px;
            padding: 12px 16px;
            margin-bottom: 16px;
            font-size: 0.95rem;
        }
        .appointment-summary-line strong { color: var(--accent-color); }

        @media (max-width: 991px) {
          .appointment-calendar-container {
            padding: 28px 24px;
          }
          .appointment-calendar-header {
            margin-bottom: 20px;
          }
          .appointment-month-display {
            font-size: 1.5rem;
          }
          .appointment-nav-btn {
            width: 40px;
            height: 40px;
            min-width: 40px;
            min-height: 40px;
          }
          .appointment-calendar-grid {
            gap: 10px;
          }
          .appointment-weekday-header {
            font-size: 0.75rem;
            padding-bottom: 6px;
          }
          .appointment-date-box {
            font-size: 0.9rem;
            border-radius: 12px;
            max-width: none;
          }
        }

        @media (max-width: 768px) {
          .appointment-calendar-container {
            padding: 20px 16px;
          }
          .appointment-month-display {
            font-size: 1.35rem;
          }
          .appointment-nav-btn {
            width: 36px;
            height: 36px;
            min-width: 36px;
            min-height: 36px;
            font-size: 0.9rem;
          }
          .appointment-calendar-grid {
            gap: 6px;
          }
          .appointment-weekday-header {
            font-size: 0.65rem;
            padding-bottom: 4px;
          }
          .appointment-date-box {
            font-size: 0.85rem;
            border-radius: 10px;
          }
          .appointment-plus-icon {
            font-size: 10px;
            top: 4px;
            right: 4px;
          }
        }

        @media (max-width: 576px) {
          .appointment-calendar-container {
            padding: 16px 12px;
          }
          .appointment-calendar-header {
            margin-bottom: 16px;
          }
          .appointment-month-display {
            font-size: 1.2rem;
          }
          .appointment-nav-btn {
            width: 32px;
            height: 32px;
            min-width: 32px;
            min-height: 32px;
            font-size: 0.85rem;
          }
          .appointment-calendar-grid {
            gap: 4px;
          }
          .appointment-weekday-header {
            font-size: 0.6rem;
            padding-bottom: 2px;
          }
          .appointment-date-box {
            font-size: 0.8rem;
            border-radius: 8px;
          }
        }

        @media (max-width: 380px) {
          .appointment-calendar-container {
            padding: 12px 8px;
          }
          .appointment-month-display {
            font-size: 1rem;
          }
          .appointment-calendar-grid {
            gap: 3px;
          }
          .appointment-weekday-header {
            font-size: 0.55rem;
          }
          .appointment-date-box {
            font-size: 0.75rem;
          }
        }
        `}
      </style>

      {/* Appointment Calendar Section */}
      <div className="appointment-calendar-section" data-aos="fade-up">
        <div className="row justify-content-center">
          <div className="col-12">
            <div className="appointment-calendar-container">
              <div className="appointment-calendar-header">
                <button className="appointment-nav-btn" onClick={handlePrevMonth}>
                  <i className="bi bi-chevron-left"></i>
                </button>
                <div className="appointment-month-display">
                  {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </div>
                <button className="appointment-nav-btn" onClick={handleNextMonth}>
                  <i className="bi bi-chevron-right"></i>
                </button>
              </div>

              <div className="appointment-calendar-grid">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="appointment-weekday-header">{day}</div>
                ))}

                {/* Empty slots for previous month */}
                {Array.from({ length: getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth()) }).map((_, i) => (
                  <div key={`empty-${i}`}></div>
                ))}

                {/* Days */}
                {Array.from({ length: getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth()) }).map((_, i) => {
                  const day = i + 1;
                  const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                  const today = new Date();
                  const isToday = dateObj.toDateString() === today.toDateString();
                  const isPast = dateObj.setHours(0, 0, 0, 0) < today.setHours(0, 0, 0, 0);

                  return (
                    <div
                      key={day}
                      className={`appointment-date-box ${isPast ? 'appointment-disabled' : ''} ${isToday ? 'appointment-today' : ''}`}
                      onClick={() => !isPast && handleDateClick(day)}
                    >
                      {day}
                      {!isPast && <i className="bi bi-plus-lg appointment-plus-icon"></i>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Modal Form */}
      <div className={`appointment-custom-modal-overlay ${showModal ? 'appointment-show' : ''}`}>
        <div className="appointment-custom-modal">
          <div className="appointment-modal-header-custom">
            <h5>Book Appointment - {selectedDate?.toLocaleDateString()}</h5>
            <button className="appointment-btn-close-custom" onClick={() => setShowModal(false)}>&times;</button>
          </div>
          <div className="appointment-modal-body-custom">
            <form>
              <div className="row">
                <div className="col-md-6">
                  <label className="form-label text-muted small fw-bold">Patient Name</label>
                  <div className="appointment-input-wrapper">
                    <input
                      type="text"
                      name="patient_name"
                      value={form.patient_name}
                      onChange={handleInputChange}
                      className={`appointment-form-control ${errors.patient_name ? 'error' : ''}`}
                      placeholder="John Doe"
                    />
                    {errors.patient_name && <i className="bi bi-exclamation-circle-fill appointment-error-icon"></i>}
                  </div>
                  {errors.patient_name && <div className="appointment-error-message">{errors.patient_name}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted small fw-bold">Phone Number</label>
                  <div className="appointment-input-wrapper">
                    <input
                      type="tel"
                      name="patient_phone"
                      value={form.patient_phone}
                      onChange={handleInputChange}
                      className={`appointment-form-control ${errors.patient_phone ? 'error' : ''}`}
                      placeholder="+1 234 567 890"
                    />
                    {errors.patient_phone && <i className="bi bi-exclamation-circle-fill appointment-error-icon"></i>}
                  </div>
                  {errors.patient_phone && <div className="appointment-error-message">{errors.patient_phone}</div>}
                </div>
              </div>

              <label className="form-label text-muted small fw-bold">Email Address</label>
              <div className="appointment-input-wrapper">
                <input
                  type="email"
                  name="patient_email"
                  value={form.patient_email}
                  onChange={handleInputChange}
                  className={`appointment-form-control ${errors.patient_email ? 'error' : ''}`}
                  placeholder="john@example.com"
                />
                {errors.patient_email && <i className="bi bi-exclamation-circle-fill appointment-error-icon"></i>}
              </div>
              {errors.patient_email && <div className="appointment-error-message">{errors.patient_email}</div>}

              {/* NEW PROFESSIONAL TIME SELECTOR */}
              <label className="form-label text-muted small fw-bold">Select Appointment Time</label>
              <div className="appointment-time-picker-wrapper">
                <div className="appointment-time-display">
                  {selectedHour} : {selectedMinute} {selectedPeriod}
                </div>

                <div className="appointment-time-selector">
                  {/* Hours Column */}
                  <div className="appointment-time-column">
                    <span className="appointment-time-label">Hour</span>
                    <div className="appointment-time-grid">
                      {hoursList.map((h) => (
                        <div
                          key={h}
                          className={`appointment-time-btn ${selectedHour === h ? 'active' : ''}`}
                          onClick={() => setSelectedHour(h)}
                        >
                          {h}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Minutes Column */}
                  <div className="appointment-time-column">
                    <span className="appointment-time-label">Minute</span>
                    <div className="appointment-time-grid minutes">
                      {minutesList.map((m) => (
                        <div
                          key={m}
                          className={`appointment-time-btn ${selectedMinute === m ? 'active' : ''}`}
                          onClick={() => setSelectedMinute(m)}
                        >
                          {m}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AM/PM Column */}
                  <div className="appointment-time-column">
                    <span className="appointment-time-label">Period</span>
                    <div className="appointment-time-grid period">
                      {['AM', 'PM'].map((p) => (
                        <div
                          key={p}
                          className={`appointment-time-btn ${selectedPeriod === p ? 'active' : ''}`}
                          onClick={() => setSelectedPeriod(p)}
                        >
                          {p}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {doctor.department?.id && (
                <>
                  <label className="form-label text-muted small fw-bold">Select Service</label>
                  <div className="appointment-service-list">
                    {servicesLoading ? (
                      <p className="text-muted small">Loading services...</p>
                    ) : services.length === 0 ? (
                      <p className="text-muted small">No services available for this department.</p>
                    ) : (
                      services.map((svc) => (
                        <div
                          key={svc.id}
                          className={`appointment-service-card ${selectedServiceId === svc.id ? 'appointment-service-selected' : ''}`}
                          onClick={() => { setSelectedServiceId(svc.id); setErrors((e) => ({ ...e, service_id: '' })); }}
                        >
                          <div className="appointment-service-name">{svc.name}</div>
                          <div className="appointment-service-meta">
                            ${Number(svc.price).toFixed(2)}
                            {svc.duration != null && svc.duration > 0 && ` · ${svc.duration} min`}
                          </div>
                          {svc.description && <div className="appointment-service-desc">{svc.description}</div>}
                        </div>
                      ))
                    )}
                  </div>
                  {errors.service_id && <div className="appointment-error-message">{errors.service_id}</div>}
                </>
              )}

              <label className="form-label text-muted small fw-bold">Reason for Visit</label>
              <div className="appointment-input-wrapper">
                <input
                  type="text"
                  name="reason"
                  value={form.reason}
                  onChange={handleInputChange}
                  className={`appointment-form-control ${errors.reason ? 'error' : ''}`}
                  placeholder="Checkup, Consultation..."
                />
                {errors.reason && <i className="bi bi-exclamation-circle-fill appointment-error-icon"></i>}
              </div>
              {errors.reason && <div className="appointment-error-message">{errors.reason}</div>}

              <label className="form-label text-muted small fw-bold">Additional Notes</label>
              <div className="appointment-input-wrapper">
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleInputChange}
                  className="appointment-form-control"
                  rows={2}
                  placeholder="Any specific symptoms..."
                ></textarea>
              </div>

              {selectedService && (
                <div className="appointment-summary-line">
                  <strong>Summary:</strong> {selectedService.name} — ${Number(selectedService.price).toFixed(2)}
                  {selectedService.duration != null && selectedService.duration > 0 && ` (${selectedService.duration} min)`}
                </div>
              )}

              <button
                type="button"
                onClick={handleBookAppointment}
                disabled={loading || (services.length > 0 && !canSubmit)}
                className="appointment-btn-confirm"
              >
                {loading ? 'Booking...' : 'Confirm Booking'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CalendarComponent;