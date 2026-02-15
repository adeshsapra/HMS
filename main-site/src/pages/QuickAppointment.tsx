import { useEffect, useState, useMemo } from 'react'
import AOS from 'aos'
import { useToast } from '../context/ToastContext'
import PageHero from '../components/PageHero'
import { departmentAPI, doctorAPI, appointmentAPI, serviceAPI } from '../services/api'

interface ServiceItem {
  id: number;
  name: string;
  price: number;
  duration?: number | null;
  description?: string | null;
}

const QuickAppointment = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department_id: '',
    doctor_id: '',
    service_id: '',
    date: '',
    time: '09:00 AM', // Default time
    message: ''
  })

  // Time Selection State
  const [selectedHour, setSelectedHour] = useState('09');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedPeriod, setSelectedPeriod] = useState('AM');

  const [departments, setDepartments] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [services, setServices] = useState<ServiceItem[]>([])
  const [loading, setLoading] = useState(false)
  const [isFetching, setIsFetching] = useState({ depts: false, docs: false, services: false })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const toast = useToast()

  const hoursList = useMemo(() => Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0')), []);
  const minutesList = ['00', '15', '30', '45'];
  const periods = ['AM', 'PM'];

  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    })
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    try {
      setIsFetching(prev => ({ ...prev, depts: true }))
      const response = await departmentAPI.getAll(1, 100)
      if (response.data?.data) {
        setDepartments(response.data.data)
      }
    } catch (err) {
      console.error("Failed to fetch departments", err)
      toast.error("Could not load departments. Please refresh.")
    } finally {
      setIsFetching(prev => ({ ...prev, depts: false }))
    }
  }

  useEffect(() => {
    if (formData.department_id) {
      fetchDoctors(formData.department_id)
    } else {
      setDoctors([])
      setFormData(prev => ({ ...prev, doctor_id: '', service_id: '' }))
      setServices([])
    }
  }, [formData.department_id])

  const departmentIdForDoctor = formData.doctor_id
    ? (doctors.find((d: any) => String(d.id) === String(formData.doctor_id))?.department_id ?? formData.department_id)
    : null

  useEffect(() => {
    if (!departmentIdForDoctor) {
      setServices([])
      setFormData(prev => ({ ...prev, service_id: '' }))
      return
    }
    let cancelled = false
    setFormData(prev => ({ ...prev, service_id: '' }))
    setIsFetching(prev => ({ ...prev, services: true }))
    serviceAPI.getByDepartment(departmentIdForDoctor)
      .then((res) => {
        if (cancelled) return
        const data = res.data?.data ?? res.data
        setServices(Array.isArray(data) ? data : [])
      })
      .catch(() => { if (!cancelled) setServices([]) })
      .finally(() => { if (!cancelled) setIsFetching(prev => ({ ...prev, services: false })) })
    return () => { cancelled = true }
  }, [departmentIdForDoctor])

  const fetchDoctors = async (deptId: string) => {
    try {
      setIsFetching(prev => ({ ...prev, docs: true }))
      const response = await doctorAPI.getByDepartment(deptId)
      if (response.data) {
        // Ensure we handle both types of common API responses
        const docsList = response.data.data || response.data
        setDoctors(Array.isArray(docsList) ? docsList : [])
      }
    } catch (err) {
      console.error("Failed to fetch doctors", err)
    } finally {
      setIsFetching(prev => ({ ...prev, docs: false }))
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Full name is required'
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address'
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!formData.department_id) newErrors.department_id = 'Please select a department'
    if (!formData.doctor_id) newErrors.doctor_id = 'Please select a doctor'
    if (services.length > 0 && !formData.service_id) newErrors.service_id = 'Please select a service'
    if (!formData.date) newErrors.date = 'Date is required'

    const selectedDate = new Date(formData.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (formData.date && selectedDate < today) {
      newErrors.date = 'Appointment cannot be in the past'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const updateTime = (h: string, m: string, p: string) => {
    const newTime = `${h}:${m} ${p}`;
    setFormData(prev => ({ ...prev, time: newTime }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      toast.error("Please fill all required fields correctly.")
      return
    }

    setLoading(true)
    try {
      const userStr = localStorage.getItem('user')
      const user = userStr ? JSON.parse(userStr) : null

      const payload: Record<string, unknown> = {
        patient_name: formData.name,
        patient_email: formData.email,
        patient_phone: formData.phone,
        doctor_id: formData.doctor_id,
        appointment_date: formData.date,
        appointment_time: formData.time,
        reason: formData.message || "Quick Appointment Request",
        status: 'pending'
      }
      if (user?.id) payload.user_id = user.id
      if (formData.service_id) payload.service_id = formData.service_id

      const response = await appointmentAPI.create(payload)
      if (response.data) {
        toast.success('Your appointment has been requested successfully!')
        setFormData({
          name: '', email: '', phone: '', department_id: '',
          doctor_id: '', service_id: '', date: '', time: '09:00 AM', message: ''
        })
        setSelectedHour('09')
        setSelectedMinute('00')
        setSelectedPeriod('AM')
        setErrors({})
      }
    } catch (err: any) {
      console.error("Booking Error:", err)
      const msg = err.response?.data?.message || "Failed to book appointment. Please try again."
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => {
      const next = { ...prev, [name]: value }
      if (name === 'doctor_id') next.service_id = ''
      return next
    })
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  return (
    <div className="quickappointment-page">
      <style>
        {`
                .qa-time-picker-wrapper {
                    background: #fdfdfd;
                    border: 1px solid #eee;
                    border-radius: 20px;
                    padding: 25px;
                    margin-bottom: 25px;
                    transition: all 0.3s ease;
                }
                .qa-time-picker-wrapper.has-error {
                    border-color: #dc3545;
                }
                .qa-time-display {
                    text-align: center;
                    font-size: 1.8rem;
                    font-weight: 800;
                    color: #049ebb;
                    margin-bottom: 20px;
                    background: #fff;
                    padding: 10px;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
                }
                .qa-time-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 8px;
                }
                .qa-time-btn {
                    padding: 8px 0;
                    border-radius: 8px;
                    border: 1px solid #f0f0f0;
                    background: #fff;
                    font-weight: 600;
                    font-size: 0.85rem;
                    transition: all 0.2s;
                    color: #444;
                }
                .qa-time-btn:hover {
                    border-color: #049ebb;
                    background: #f0fbfc;
                }
                .qa-time-btn.active {
                    background: #049ebb;
                    color: #fff;
                    border-color: #049ebb;
                }
                .form-control.is-invalid, .form-select.is-invalid {
                    border-color: #dc3545 !important;
                    background-image: none !important;
                }
                .invalid-feedback {
                    font-size: 0.75rem;
                    font-weight: 600;
                    margin-top: 4px;
                }
                .qa-label {
                    font-weight: 700;
                    font-size: 0.8rem;
                    color: #555;
                    text-transform: uppercase;
                    margin-bottom: 8px;
                    display: block;
                }

                /* Process Steps Styling */
                .process-steps {
                    background: #fdfdfd;
                }
                .process-indicator {
                    position: relative;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .process-icon {
                    width: 70px;
                    height: 70px;
                    background: #fff;
                    border: 2px solid #eef2f3;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.8rem;
                    color: #049ebb;
                    z-index: 2;
                    box-shadow: 0 10px 20px rgba(0,0,0,0.05);
                    transition: all 0.3s ease;
                }
                .process-item:hover .process-icon {
                    background: #049ebb;
                    color: #fff;
                    border-color: #049ebb;
                    transform: translateY(-5px);
                    box-shadow: 0 15px 30px rgba(4, 158, 187, 0.2);
                }
                .process-number {
                    position: absolute;
                    top: -10px;
                    right: calc(50% - 40px);
                    width: 28px;
                    height: 28px;
                    background: #049ebb;
                    color: #fff;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                    font-size: 0.85rem;
                    z-index: 3;
                    border: 3px solid #fff;
                }
                .process-line {
                    position: absolute;
                    top: 50%;
                    left: calc(50% + 35px);
                    width: calc(100% - 70px);
                    height: 2px;
                    background: #eef2f3;
                    z-index: 1;
                }
                .process-item h5 {
                    color: #18444c;
                    font-size: 1.1rem;
                }
                @media (max-width: 991px) {
                    .process-line {
                        display: none;
                    }
                }
                `}
      </style>
      <PageHero
        title="Quick Appointment"
        description="Book your medical appointment quickly and receive timely expert care."
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Quick Appointment' }
        ]}
      />

      <section id="quickappointmnet" className="quickappointmnet section py-5">
        <div className="container" data-aos="fade-up">
          <div className="row gy-5">
            <div className="col-lg-5">
              <div className="quickappointment-info pe-lg-5">
                <h3 className="fw-bold mb-4" style={{ color: '#18444c' }}>Seamless Online Booking</h3>
                <p className="mb-5 text-muted leading-relaxed">Experience hassle-free healthcare scheduling. Fill out the form, select your specialist, and get confirmed instantly.</p>

                <div className="info-items">
                  {[
                    { icon: 'bi-calendar-check', title: 'Smart Scheduling', desc: 'Real-time availability for all hospital departments.' },
                    { icon: 'bi-stopwatch', title: 'Fast Track', desc: 'Skip the queue with our prioritized online booking system.' },
                    { icon: 'bi-shield-check', title: 'Trusted Care', desc: 'Direct connection with board-certified medical experts.' }
                  ].map((item, idx) => (
                    <div key={idx} className="info-item d-flex align-items-start mb-4">
                      <div className="icon-wrapper me-3 bg-light rounded-circle p-3 shadow-sm">
                        <i className={`bi ${item.icon}`} style={{ color: '#049ebb', fontSize: '1.2rem' }}></i>
                      </div>
                      <div>
                        <h6 className="fw-bold mb-1">{item.title}</h6>
                        <p className="mb-0 small text-muted">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="emergency-contact bg-light p-4 rounded-4 mt-5 border-start border-4 border-info">
                  <h6 className="mb-2 fw-bold"><i className="bi bi-telephone-fill me-2 text-info"></i>Need Immediate Help?</h6>
                  <p className="mb-0 small">Our 24/7 Hotline is available at <strong>+1 (555) 911-4567</strong></p>
                </div>
              </div>
            </div>

            <div className="col-lg-7">
              <div className="quickappointment-form-wrapper shadow-lg p-4 p-md-5 rounded-4 bg-white">
                <form onSubmit={handleSubmit} className="quickappointment-form">
                  <div className="row gy-4">
                    <div className="col-md-6 text-start">
                      <input
                        type="text"
                        name="name"
                        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                        placeholder="Full Name (John Doe)"
                        value={formData.name}
                        onChange={handleChange}
                      />
                      {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                    </div>

                    <div className="col-md-6 text-start">
                      <input
                        type="email"
                        name="email"
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        placeholder="Email Address (john@example.com)"
                        value={formData.email}
                        onChange={handleChange}
                      />
                      {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                    </div>

                    <div className="col-md-6 text-start">
                      <input
                        type="tel"
                        name="phone"
                        className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                        placeholder="Phone Number (+1 234 567 890)"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                      {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                    </div>

                    <div className="col-md-6 text-start">
                      <input
                        type="date"
                        name="date"
                        className={`form-control ${errors.date ? 'is-invalid' : ''}`}
                        value={formData.date}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                      />
                      {errors.date && <div className="invalid-feedback">{errors.date}</div>}
                    </div>

                    <div className="col-md-6 text-start">
                      <select
                        name="department_id"
                        className={`form-select ${errors.department_id ? 'is-invalid' : ''}`}
                        value={formData.department_id}
                        onChange={handleChange}
                        disabled={isFetching.depts}
                      >
                        <option value="">{isFetching.depts ? 'Loading Departments...' : 'Select Department'}</option>
                        {departments.map(dept => (
                          <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                      </select>
                      {errors.department_id && <div className="invalid-feedback">{errors.department_id}</div>}
                    </div>

                    <div className="col-md-6 text-start">
                      <select
                        name="doctor_id"
                        className={`form-select ${errors.doctor_id ? 'is-invalid' : ''}`}
                        value={formData.doctor_id}
                        onChange={handleChange}
                        disabled={!formData.department_id || isFetching.docs}
                      >
                        <option value="">
                          {!formData.department_id ? 'Select department first' : isFetching.docs ? 'Loading Experts...' : 'Select Doctor'}
                        </option>
                        {doctors.map(doc => (
                          <option key={doc.id} value={doc.id}>
                            Dr. {doc.first_name} {doc.last_name} ({doc.specialization})
                          </option>
                        ))}
                      </select>
                      {errors.doctor_id && <div className="invalid-feedback">{errors.doctor_id}</div>}
                    </div>

                    {formData.doctor_id && (
                      <div className="col-12 text-start">
                        <label className="qa-label">Service</label>
                        <select
                          name="service_id"
                          className={`form-select ${errors.service_id ? 'is-invalid' : ''}`}
                          value={formData.service_id}
                          onChange={handleChange}
                          disabled={isFetching.services}
                        >
                          <option value="">
                            {isFetching.services ? 'Loading services...' : services.length === 0 ? 'No services for this department' : 'Select Service'}
                          </option>
                          {services.map(svc => (
                            <option key={svc.id} value={svc.id}>
                              {svc.name} — ${Number(svc.price).toFixed(2)}
                              {svc.duration != null && svc.duration > 0 ? ` (${svc.duration} min)` : ''}
                            </option>
                          ))}
                        </select>
                        {errors.service_id && <div className="invalid-feedback">{errors.service_id}</div>}
                        {services.length > 0 && formData.service_id && (() => {
                          const svc = services.find(s => String(s.id) === formData.service_id)
                          return svc?.description ? <p className="small text-muted mt-1 mb-0">{svc.description}</p> : null
                        })()}
                      </div>
                    )}

                    <div className="col-12 text-start">
                      <div className="qa-time-picker-wrapper">
                        <div className="qa-time-display">
                          {selectedHour}:{selectedMinute} {selectedPeriod}
                        </div>

                        <div className="row g-4">
                          <div className="col-md-6">
                            <span className="small fw-bold text-muted d-block mb-2">Hour</span>
                            <div className="qa-time-grid">
                              {hoursList.map(h => (
                                <button
                                  key={h}
                                  type="button"
                                  className={`qa-time-btn ${selectedHour === h ? 'active' : ''}`}
                                  onClick={() => { setSelectedHour(h); updateTime(h, selectedMinute, selectedPeriod); }}
                                >
                                  {h}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="col-md-4">
                            <span className="small fw-bold text-muted d-block mb-2">Minute</span>
                            <div className="qa-time-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                              {minutesList.map(m => (
                                <button
                                  key={m}
                                  type="button"
                                  className={`qa-time-btn ${selectedMinute === m ? 'active' : ''}`}
                                  onClick={() => { setSelectedMinute(m); updateTime(selectedHour, m, selectedPeriod); }}
                                >
                                  {m}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="col-md-2">
                            <span className="small fw-bold text-muted d-block mb-2">Period</span>
                            <div className="d-flex flex-column gap-2">
                              {periods.map(p => (
                                <button
                                  key={p}
                                  type="button"
                                  className={`qa-time-btn ${selectedPeriod === p ? 'active' : ''} w-100`}
                                  onClick={() => { setSelectedPeriod(p); updateTime(selectedHour, selectedMinute, p); }}
                                >
                                  {p}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-12 text-start">
                      <textarea
                        className="form-control"
                        name="message"
                        rows={4}
                        placeholder="Briefly describe your health concern..."
                        value={formData.message}
                        onChange={handleChange}
                      ></textarea>
                    </div>

                    <div className="col-12">
                      <button
                        type="submit"
                        className="btn btn-quickappointment w-100 py-3 fw-bold shadow-sm"
                        disabled={loading}
                        style={{ background: '#049ebb', border: 'none', color: '#fff' }}
                      >
                        {loading ? (
                          <><span className="spinner-border spinner-border-sm me-2"></span>Processing...</>
                        ) : (
                          <><i className="bi bi-calendar-check me-2"></i>Finalize Appointment</>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="process-steps py-5">
        <div className="container" data-aos="fade-up">
          <div className="section-header text-center mb-5">
            <h2 className="fw-bold" style={{ color: '#18444c' }}>How It Works</h2>
            <p className="text-muted">Simple steps to get your health back on track</p>
          </div>
          <div className="process-wrapper">
            <div className="row gy-4">
              {[
                { num: 1, icon: 'bi-person-fill', title: 'Provide Details', desc: 'Securely share your contact and medical preferences.' },
                { num: 2, icon: 'bi-calendar-event', title: 'Schedule Slot', desc: 'Pick a date and convenient time that works for you.' },
                { num: 3, icon: 'bi-check-circle', title: 'Get Confirmed', desc: 'Receive instant notification from our team.' },
                { num: 4, icon: 'bi-heart-pulse', title: 'Expert Care', desc: 'Meet your specialist and start your journey to health.' }
              ].map((item, idx) => (
                <div key={item.num} className="col-lg-3 col-md-6">
                  <div className="process-item text-center">
                    <div className="process-indicator mb-4">
                      <div className="process-number">{item.num}</div>
                      <div className="process-icon">
                        <i className={`bi ${item.icon}`}></i>
                      </div>
                      {idx < 3 && <div className="process-line d-none d-lg-block"></div>}
                    </div>
                    <h5 className="fw-bold mb-3">{item.title}</h5>
                    <p className="text-muted px-3" style={{ fontSize: '0.9rem' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuickAppointment

